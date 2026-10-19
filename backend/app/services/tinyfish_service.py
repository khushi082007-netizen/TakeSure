"""TinyFish integration: the research assistant behind the knowledge base.

Three offline curation jobs, none of which can touch a verdict:

  verify_sources   Fetch API   opens every citation (DOI / PubMed / URL), compares the page with the stored
                               source title and flips `verification_status` to "verified" when it matches.
                               Mismatches become drafts for a reviewer.
  discover         Web Agent   reads a monograph page (MSKCC About Herbs by default) and extracts candidate
                               herb-drug interaction rows as JSON. Stored as *drafts*; a reviewer approves them.
  map_product      Search+Fetch+Agent  finds an Indian product page and extracts its ingredient list so the
                               product -> herbs bridge table can grow. Also a draft.

Everything is plain HTTP via httpx so tests can inject a transport and stay offline.
"""
from __future__ import annotations

import json
import logging
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Sequence

import httpx
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.errors import AppError, NotFound
from app.models.kb import Drug, Herb, InteractionSource, Product
from app.models.ops import CurationDraft

log = logging.getLogger("takesure.tinyfish")

_STOP = {"with", "from", "that", "this", "their", "study", "trial", "effect", "effects", "among", "between", "during", "patients", "clinical", "controlled", "placebo", "randomized", "randomised", "double", "blind", "volume", "selected", "edition", "about", "herbs", "information", "research"}


class TinyFishUnavailable(AppError):
    status_code = 503
    code = "TINYFISH_UNAVAILABLE"
    retryable = True


class TinyFishFailed(AppError):
    status_code = 502
    code = "TINYFISH_FAILED"
    retryable = True


# ---------------------------------------------------------------- HTTP client
_transport: Optional[httpx.BaseTransport] = None


def set_transport(t: Optional[httpx.BaseTransport]) -> None:
    """Tests inject an httpx.MockTransport here so no real network call is ever made."""
    global _transport
    _transport = t


def configured() -> bool:
    return bool(get_settings().tinyfish_api_key)


def require_configured() -> None:
    if not get_settings().tinyfish_api_key and _transport is None:
        raise TinyFishUnavailable("TinyFish is not configured. Set TINYFISH_API_KEY in backend/.env to enable evidence curation.")


def _client() -> httpx.Client:
    s = get_settings()
    require_configured()
    return httpx.Client(headers={"X-API-Key": s.tinyfish_api_key or "test", "Content-Type": "application/json"}, timeout=s.tinyfish_timeout_seconds, transport=_transport)


def fetch(urls: Sequence[str], fmt: str = "markdown") -> Dict[str, Any]:
    """Fetch API: clean page text for up to 10 URLs. Free within the daily allowance."""
    s = get_settings()
    with _client() as c:
        r = c.post(s.tinyfish_fetch_url, json={"urls": list(urls)[:10], "format": fmt, "purpose": "TakeSure knowledge-base citation verification"})
    if r.status_code >= 400:
        raise TinyFishFailed(f"TinyFish Fetch returned {r.status_code}", {"body": r.text[:500]})
    return r.json()


def search(query: str, domain_type: str = "web") -> List[Dict[str, Any]]:
    """Search API: ranked results for a query. Paced and retried: bursts of queries hit a 429 rate limit."""
    import time
    s = get_settings()
    time.sleep(s.tinyfish_search_pace_seconds)
    with _client() as c:
        for attempt in range(4):
            r = c.get(s.tinyfish_search_url, params={"query": query, "domain_type": domain_type})
            if r.status_code == 429:
                time.sleep(3 * (attempt + 1))
                continue
            break
    if r.status_code >= 400:
        raise TinyFishFailed(f"TinyFish Search returned {r.status_code}", {"body": r.text[:500]})
    return list(r.json().get("results") or [])


def agent_run(url: str, goal: str, output_schema: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Web Agent: goal-driven browsing that returns structured JSON. Billed per step.

    Uses /run-async + GET /v1/runs/{id} polling: monograph pages take minutes and the blocking /run endpoint
    times out. agent_config (max_steps / mode) is a TinyFish beta feature and is deliberately not sent.
    """
    import time
    s = get_settings()
    body: Dict[str, Any] = {"url": url, "goal": goal, "browser_profile": "lite"}
    if output_schema:
        body["output_schema"] = output_schema
    with _client() as c:
        r = c.post(f"{s.tinyfish_agent_base_url}/v1/automation/run-async", json=body)
        if r.status_code >= 400:
            raise TinyFishFailed(f"TinyFish Agent returned {r.status_code}", {"body": r.text[:500]})
        run_id = r.json().get("run_id")
        if not run_id:
            raise TinyFishFailed("TinyFish Agent did not return a run id", {"body": r.text[:500]})
        deadline = time.monotonic() + s.tinyfish_agent_max_wait_seconds
        data: Dict[str, Any] = {}
        while time.monotonic() < deadline:
            g = c.get(f"{s.tinyfish_agent_base_url}/v1/runs/{run_id}")
            if g.status_code >= 400:
                raise TinyFishFailed(f"TinyFish run lookup returned {g.status_code}", {"body": g.text[:500]})
            data = g.json()
            if data.get("status") in ("COMPLETED", "FAILED", "CANCELLED"):
                break
            time.sleep(s.tinyfish_agent_poll_seconds)
    if data.get("status") != "COMPLETED":
        raise TinyFishFailed("TinyFish Agent run did not complete", {"status": data.get("status"), "error": data.get("error"), "run_id": run_id})
    data.setdefault("run_id", run_id)
    return data


# ---------------------------------------------------------------- helpers
def _tokens(text: str) -> set:
    return {t for t in re.findall(r"[a-z]{5,}", (text or "").lower()) if t not in _STOP}


def _match_score(title: str, page_title: str, page_text: str) -> float:
    want = _tokens(title)
    if not want:
        return 0.0
    have = _tokens(page_title) | _tokens(page_text[:20000])
    return round(len(want & have) / len(want), 3)


def source_url(src: InteractionSource) -> Optional[str]:
    if src.doi:
        return f"https://doi.org/{src.doi}"
    if src.pmid:
        return f"https://pubmed.ncbi.nlm.nih.gov/{src.pmid}/"
    return src.url


def _draft(db: Session, **kw) -> CurationDraft:
    d = CurationDraft(**kw)
    db.add(d)
    db.flush()
    return d


def _result_json(data: Dict[str, Any]) -> Dict[str, Any]:
    res = data.get("result")
    if isinstance(res, str):
        try:
            res = json.loads(res)
        except ValueError:
            res = {"text": res}
    return res or {}


# ---------------------------------------------------------------- job 1: verify citations
# Three stages, each one a TinyFish call, each one recorded as evidence on the draft:
#   1. page      Fetch the resolved URL (doi.org / PubMed / monograph) and compare page title + text with the stored title.
#   2. crossref  For DOI sources that publishers bot-block, Fetch the Crossref metadata record and compare its title.
#   3. search    For sources with no locator (books, old journals), Search the title and accept a near-exact hit.
# A source is "verified" only when one stage reaches the threshold; otherwise a mismatch draft lists what was found.

def _host(u: Optional[str]) -> str:
    try:
        return (httpx.URL(u).host or "").lower().removeprefix("www.") if u else ""
    except Exception:
        return ""


def _page_score(src: InteractionSource, res: Dict[str, Any]) -> float:
    text = res.get("text") if isinstance(res.get("text"), str) else json.dumps(res.get("text") or "")
    score = _match_score(src.title, res.get("title") or "", text)
    # Monograph / database / regulatory pages: landing on the expected host with a matching page title is proof enough
    if src.url and src.source_type in ("database", "monograph", "regulatory"):
        expected, got = _host(src.url), _host(res.get("final_url") or res.get("url"))
        if expected and got and (got == expected or got.endswith("." + expected)) and (_tokens(src.title) & _tokens(res.get("title") or "")):
            score = max(score, 0.75)
    return round(score, 3)


def _crossref_record(text: str) -> Dict[str, Any]:
    try:
        m = json.loads(text).get("message") or {}
    except (ValueError, AttributeError):
        return {}
    cont = m.get("container-title") or []
    issued = (m.get("issued") or {}).get("date-parts") or [[None]]
    return {"title": " ".join(m.get("title") or []), "journal": cont[0] if cont else None, "year": issued[0][0] if issued and issued[0] else None, "doi": m.get("DOI")}


def verify_sources(db: Session, limit: int = 10, only_unverified: bool = True, source_ids: Optional[Sequence[int]] = None) -> Dict[str, Any]:
    require_configured()
    s = get_settings()
    q = select(InteractionSource)
    if source_ids:
        q = q.where(InteractionSource.id.in_(list(source_ids)))
    elif only_unverified:
        q = q.where(InteractionSource.verification_status != "verified")
    rows = list(db.scalars(q.order_by(InteractionSource.id)).all())[:limit]
    out = {"checked": 0, "verified": 0, "mismatched": 0, "failed": 0, "drafts": []}
    pending: Dict[int, Dict[str, Any]] = {r.id: {"score": 0.0, "evidence": {"stages": []}} for r in rows}

    def settle(r: InteractionSource, score: float, via: str, evidence: Dict[str, Any]) -> None:
        pending[r.id]["score"] = max(pending[r.id]["score"], score)
        pending[r.id]["evidence"].update(evidence)
        pending[r.id]["evidence"]["stages"].append({"stage": via, "score": score})
        if score >= s.tinyfish_verify_threshold and r.verification_status != "verified":
            r.verification_status = "verified"
            pending[r.id]["evidence"]["verified_via"] = via

    def unverified() -> List[InteractionSource]:
        return [r for r in rows if r.verification_status != "verified"]

    # ---- stage 1: fetch the resolved page (10 URLs per call)
    stage1 = [r for r in rows if source_url(r)]
    for i in range(0, len(stage1), 10):
        batch = stage1[i:i + 10]
        urls = list(dict.fromkeys(source_url(r) for r in batch))
        try:
            data = fetch(urls)
        except AppError as exc:
            log.warning("fetch batch failed: %s", exc.message)
            for r in batch:
                settle(r, 0.0, "page", {"page_error": exc.message})
            continue
        by_url: Dict[str, Dict[str, Any]] = {}
        for res in data.get("results") or []:
            by_url[res.get("url")] = res
            if res.get("final_url"):
                by_url.setdefault(res["final_url"], res)
        errors = {e.get("url"): e.get("error") for e in (data.get("errors") or [])}
        for r in batch:
            u = source_url(r)
            res = by_url.get(u)
            if not res:
                settle(r, 0.0, "page", {"page_url": u, "page_error": errors.get(u) or "no result returned"})
                continue
            text = res.get("text") if isinstance(res.get("text"), str) else json.dumps(res.get("text") or "")
            settle(r, _page_score(r, res), "page", {"page_url": u, "page_title": res.get("title"), "final_url": res.get("final_url") or u, "excerpt": text[:400], "year_found": bool(r.year and str(r.year) in text)})

    # ---- stage 2: Crossref metadata for DOI sources still unverified (publishers often block bots; Crossref does not)
    stage2 = [r for r in unverified() if r.doi]
    for i in range(0, len(stage2), 10):
        batch = stage2[i:i + 10]
        try:
            data = fetch([f"https://api.crossref.org/works/{r.doi}" for r in batch], fmt="markdown")
        except AppError as exc:
            log.warning("crossref batch failed: %s", exc.message)
            continue
        by_doi: Dict[str, Dict[str, Any]] = {}
        for res in data.get("results") or []:
            rec = _crossref_record(res.get("text") if isinstance(res.get("text"), str) else "")
            if rec.get("doi"):
                by_doi[rec["doi"].lower()] = rec
        for r in batch:
            rec = by_doi.get(r.doi.lower())
            if not rec:
                settle(r, 0.0, "crossref", {"crossref_error": "no record"})
                continue
            score = _match_score(r.title, rec.get("title") or "", "")
            settle(r, score, "crossref", {"crossref_title": rec.get("title"), "crossref_journal": rec.get("journal"), "crossref_year": rec.get("year")})

    # ---- stage 3: Search the title for whatever is still unverified (books, old journals without DOI, blocked pages)
    for r in unverified():
        kind = "research_paper" if r.source_type in ("rct", "review", "case_series") else "web"
        try:
            hits = search(r.title[:200], domain_type=kind)
        except AppError as exc:
            settle(r, 0.0, "search", {"search_error": exc.message})
            continue
        best, best_hit = 0.0, None
        for h in hits[:5]:
            sc = _match_score(r.title, h.get("title") or "", h.get("snippet") or "")
            if sc > best:
                best, best_hit = sc, h
        # Search is the weakest signal: require a near-exact title hit
        settle(r, best if best >= 0.8 else min(best, s.tinyfish_verify_threshold - 0.01), "search", {"search_best_title": (best_hit or {}).get("title"), "search_best_url": (best_hit or {}).get("url"), "search_candidates": [{"title": h.get("title"), "url": h.get("url")} for h in hits[:3]]})

    # ---- record one draft per source
    for r in rows:
        out["checked"] += 1
        ev, score = pending[r.id]["evidence"], pending[r.id]["score"]
        subj = f"source {r.id}: {r.title[:120]}"
        if r.verification_status == "verified":
            out["verified"] += 1
            out["drafts"].append(_draft(db, kind="verify", status="approved", subject=subj, source_url=source_url(r) or ev.get("search_best_url"), source_id=r.id, extracted=ev, score=score, note=f"Verified via {ev.get('verified_via')}: {int(score * 100)}% of distinctive title terms matched.", reviewed_by=f"tinyfish-{ev.get('verified_via')}", reviewed_at=datetime.now(timezone.utc)))
        elif not any(ev.get(k) for k in ("page_title", "crossref_title", "search_best_title")) and score == 0.0:
            out["failed"] += 1
            out["drafts"].append(_draft(db, kind="verify", status="mismatch", subject=subj, source_url=source_url(r), source_id=r.id, extracted=ev, score=score, note="Could not be fetched or found (" + str(ev.get("page_error") or ev.get("crossref_error") or ev.get("search_error")) + "). A reviewer must open the link."))
        else:
            out["mismatched"] += 1
            out["drafts"].append(_draft(db, kind="verify", status="mismatch", subject=subj, source_url=source_url(r) or ev.get("search_best_url"), source_id=r.id, extracted=ev, score=score, note=f"Best match {int(score * 100)}% across page / Crossref / search. A reviewer must open the link."))
    db.commit()
    return out


# ---------------------------------------------------------------- job 2: discover candidate rows from a monograph
DISCOVER_SCHEMA = {
    "type": "object",
    "properties": {
        "herb": {"type": "string"},
        "interactions": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "drug_or_class": {"type": "string"},
                    "effect": {"type": "string"},
                    "mechanism": {"type": "string"},
                    "severity_text": {"type": "string"},
                    "evidence_text": {"type": "string"},
                    "reference": {"type": "string"},
                },
                "required": ["drug_or_class", "effect"],
            },
        },
    },
    "required": ["herb", "interactions"],
}


def _herb(db: Session, name: str) -> Herb:
    key = name.strip().lower()
    h = db.scalar(select(Herb).where(func.lower(Herb.slug) == key)) or db.scalar(select(Herb).where(func.lower(Herb.english_name) == key))
    if not h:
        raise NotFound(f"Herb '{name}' is not in the knowledge base. Add the herb first, then discover its interactions.")
    return h


MSKCC_SLUGS = {"ashwagandha": "ashwagandha", "guggul": "guggul", "turmeric": "turmeric", "licorice": "licorice", "karela": "bitter-melon", "methi": "fenugreek", "arjuna": "arjuna", "triphala": "triphala", "tulsi": "holy-basil"}

# words that mark a sentence as a drug interaction statement (drug classes + verbs); drug generics are added from the DB
_INTERACTION_WORDS = ["anticoagulant", "antiplatelet", "warfarin", "antidiabetic", "hypoglycemic", "hypoglycaemic", "insulin", "thyroid", "levothyroxine", "immunosuppress", "benzodiazepine", "sedative", "anticonvulsant", "antiepileptic", "antihypertensive", "blood pressure", "digoxin", "cyp3a4", "cyp2d6", "cyp2c9", "cyp", "p-glycoprotein", "chemotherap", "statin", "ssri", "antidepressant", "corticosteroid", "diuretic", "iron", "lithium", "tacrolimus", "cyclosporine", "metformin", "aspirin", "clopidogrel", "patients who take", "patients taking", "concurrent", "concomitant", "interact", "potentiat", "additive"]


def monograph_url(h: Herb) -> str:
    """MSKCC About Herbs page for a herb: known slug, else the first mskcc.org hit from the Search API."""
    if h.slug in MSKCC_SLUGS:
        return f"https://www.mskcc.org/cancer-care/integrative-medicine/herbs/{MSKCC_SLUGS[h.slug]}"
    name = h.english_name.split("(")[0].strip()
    for hit in search(f"MSKCC About Herbs {name} {h.latin_name}"):
        if "mskcc.org/cancer-care/integrative-medicine/herbs/" in (hit.get("url") or ""):
            return hit["url"]
    raise NotFound(f"No MSKCC About Herbs page found for {h.english_name}; pass a monograph URL explicitly.")


def _professional_section(text: str) -> str:
    """MSKCC pages carry the clinical content under '## For Healthcare Professionals'."""
    i = text.lower().find("for healthcare professionals")
    return text[i:] if i >= 0 else text


def extract_candidates(text: str, drug_terms: Sequence[str]) -> List[Dict[str, Any]]:
    """Deterministic, explainable extraction: every bullet or sentence in the clinical section that names a drug,
    drug class or interaction verb becomes a candidate row. The reviewer assigns severity and grade."""
    section = _professional_section(text)
    chunks: List[str] = []
    for line in section.splitlines():
        line = line.strip()
        if line.startswith(("* ", "- ", "• ")):
            chunks.append(line[2:].strip())
    if not chunks:  # no bullets: fall back to sentences
        chunks = [c.strip() for c in re.split(r"(?<=[.!?])\s+", section) if len(c.strip()) > 40]
    words = list(_INTERACTION_WORDS) + [d.lower() for d in drug_terms if len(d) > 4]
    out = []
    for c in chunks:
        low = c.lower()
        hits = sorted({w for w in words if w in low})
        if not hits or len(c) < 25:
            continue
        refs = re.findall(r"\((\d{1,3}(?:[,\s-]+\d{1,3})*)\)", c)
        out.append({"drug_or_class": ", ".join(h for h in hits if h not in ("interact", "potentiat", "additive", "concurrent", "concomitant", "patients who take", "patients taking")) or "see text", "effect": re.sub(r"\s*\(\d[\d,\s-]*\)", "", c).strip(), "mechanism": "", "severity_text": "", "evidence_text": "", "reference": "; ".join(refs), "matched_terms": hits})
    return out


def discover(db: Session, herb_name: str, url: Optional[str] = None) -> CurationDraft:
    require_configured()
    h = _herb(db, herb_name)
    page = url or monograph_url(h)
    drug_terms = [d.generic for d in db.scalars(select(Drug)).all()]
    # ---- stage 1: Fetch (free) + rule-based extraction
    data = fetch([page])
    errors = {e.get("url"): e.get("error") for e in (data.get("errors") or [])}
    results = data.get("results") or []
    if not results:
        raise TinyFishFailed(f"Monograph page could not be fetched ({errors.get(page, 'no result')}).", {"url": page})
    text = results[0].get("text") if isinstance(results[0].get("text"), str) else ""
    items = extract_candidates(text, drug_terms)
    via, run_id, steps = "fetch+rules", None, None
    # ---- stage 2: Web Agent fallback when the static page yields nothing (tabs / expanders / dynamic content)
    if not items:
        goal = (
            f"This is a clinical monograph page about the herb {h.english_name} ({h.latin_name}). Click the 'For Healthcare Professionals' tab if present, "
            "then find the herb-drug interactions (a section or bullet list that names drugs or drug classes). For every interaction, return the drug or drug class, "
            "the described effect, the mechanism if stated, the severity wording, the evidence wording and the reference cited. Copy the page's wording; do not invent. Return JSON only."
        )
        agent = agent_run(page, goal, DISCOVER_SCHEMA)
        res = _result_json(agent)
        items = res.get("interactions") or []
        via, run_id, steps = "web-agent", agent.get("run_id"), agent.get("num_of_steps")
    d = _draft(db, kind="discover", status="pending", subject=h.slug, source_url=page, extracted={"herb": h.english_name, "latin": h.latin_name, "page_title": results[0].get("title"), "extracted_via": via, "interactions": items, "count": len(items), "section_excerpt": _professional_section(text)[:1500]}, score=None, note=f"{len(items)} candidate interaction(s) extracted via {via}. Each needs a reviewer to assign severity, grade and a knowledge-base row.", tinyfish_run_id=run_id, steps=steps)
    db.commit()
    return d


# ---------------------------------------------------------------- job 3: map an Indian product to its herbs
PRODUCT_SCHEMA = {
    "type": "object",
    "properties": {
        "product_name": {"type": "string"},
        "manufacturer": {"type": "string"},
        "ingredients": {
            "type": "array",
            "items": {"type": "object", "properties": {"name": {"type": "string"}, "latin_or_sanskrit": {"type": "string"}, "quantity": {"type": "string"}}, "required": ["name"]},
        },
        "dosage_text": {"type": "string"},
    },
    "required": ["product_name", "ingredients"],
}


def map_product(db: Session, brand: str, url: Optional[str] = None) -> CurationDraft:
    require_configured()
    page = url
    if not page:
        hits = search(f"{brand} ingredients composition official")
        if not hits:
            raise TinyFishFailed(f"No web results found for '{brand}'.")
        page = hits[0].get("url")
    goal = (
        f"This page should describe the Ayurvedic product '{brand}'. Find the ingredients / composition list (expand tabs if needed). "
        "Return the product name, the manufacturer, every ingredient with its Latin or Sanskrit name and quantity if shown, and the dosage text. "
        "Copy the page's wording; do not guess. Return JSON only."
    )
    data = agent_run(page, goal, PRODUCT_SCHEMA)
    res = _result_json(data)
    ingredients = res.get("ingredients") or []
    # which ingredients already map to a known herb?
    known = {h.slug: h for h in db.scalars(select(Herb)).all()}
    names = {h.english_name.lower(): slug for slug, h in known.items()} | {h.latin_name.lower(): slug for slug, h in known.items()} | {(h.sanskrit_name or "").lower(): slug for slug, h in known.items()}
    matched = []
    for ing in ingredients:
        txt = f"{ing.get('name', '')} {ing.get('latin_or_sanskrit', '')}".lower()
        slug = next((sl for nm, sl in names.items() if nm and nm in txt), None)
        ing["known_herb"] = slug
        if slug:
            matched.append(slug)
    existing = db.scalar(select(Product).where(func.lower(Product.brand) == brand.lower()))
    d = _draft(db, kind="product", status="pending", subject=brand, source_url=page, extracted={"product": res.get("product_name"), "manufacturer": res.get("manufacturer"), "ingredients": ingredients, "known_herbs": sorted(set(matched)), "dosage_text": res.get("dosage_text"), "already_in_kb": bool(existing)}, score=round(len(set(matched)) / len(ingredients), 3) if ingredients else None, note=f"{len(ingredients)} ingredient(s) read; {len(set(matched))} already known herbs. A reviewer confirms the mapping before the product is added.", tinyfish_run_id=data.get("run_id"), steps=data.get("num_of_steps"))
    db.commit()
    return d


# ---------------------------------------------------------------- review + listing
def review(db: Session, draft_id: int, approve: bool, reviewer: str, note: Optional[str]) -> CurationDraft:
    d = db.get(CurationDraft, draft_id)
    if not d:
        raise NotFound(f"Draft {draft_id} not found.")
    d.status = "approved" if approve else "rejected"
    d.reviewed_by = reviewer
    d.reviewed_at = datetime.now(timezone.utc)
    if note:
        d.note = (d.note or "") + f"\nReviewer: {note}"
    if approve and d.kind == "verify" and d.source_id:
        src = db.get(InteractionSource, d.source_id)
        if src:
            src.verification_status = "verified"
    db.commit()
    return d


def list_drafts(db: Session, status: Optional[str] = None, kind: Optional[str] = None, limit: int = 50) -> Dict[str, Any]:
    q = select(CurationDraft)
    if status:
        q = q.where(CurationDraft.status == status)
    if kind:
        q = q.where(CurationDraft.kind == kind)
    items = list(db.scalars(q.order_by(CurationDraft.ts.desc(), CurationDraft.id.desc()).limit(limit)).all())
    total = db.scalar(select(func.count(CurationDraft.id)).where(*( [CurationDraft.status == status] if status else [] ), *( [CurationDraft.kind == kind] if kind else [] ))) or 0
    return {"total": total, "items": items}


def status(db: Session) -> Dict[str, Any]:
    total = db.scalar(select(func.count(InteractionSource.id))) or 0
    verified = db.scalar(select(func.count(InteractionSource.id)).where(InteractionSource.verification_status == "verified")) or 0
    counts = {k: (db.scalar(select(func.count(CurationDraft.id)).where(CurationDraft.status == k)) or 0) for k in ("pending", "mismatch", "approved")}
    cfg = configured() or _transport is not None
    return {
        "configured": cfg,
        "capabilities": ["fetch", "search", "agent"] if cfg else [],
        "sources_total": total,
        "sources_verified": verified,
        "sources_pending": total - verified,
        "drafts_pending": counts["pending"],
        "drafts_mismatch": counts["mismatch"],
        "drafts_approved": counts["approved"],
        "drafts_total": db.scalar(select(func.count(CurationDraft.id))) or 0,
        "note": "TinyFish verifies citations (Fetch), finds product pages (Search) and drafts rows from monographs (Web Agent). Drafts never change a verdict until a reviewer approves them." if cfg else "Set TINYFISH_API_KEY in backend/.env to enable the curation tools. The checker works without it.",
    }


def draft_out(d: CurationDraft) -> Dict[str, Any]:
    return {"id": d.id, "ts": d.ts.isoformat(timespec="seconds") if d.ts else "", "kind": d.kind, "status": d.status, "subject": d.subject, "source_url": d.source_url, "source_id": d.source_id, "extracted": d.extracted or {}, "score": d.score, "note": d.note, "tinyfish_run_id": d.tinyfish_run_id, "steps": d.steps, "reviewed_by": d.reviewed_by}
