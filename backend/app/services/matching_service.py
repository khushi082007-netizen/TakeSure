"""Dictionary + RapidFuzz matching of extracted phrases to canonical herbs and drugs.

Thresholds come from Settings (roadmap §4.1): >=85 accept, 70-85 ask the user, <70 not recognised.
The dictionary is built from the database (herb synonyms, drug generics, Indian brand names,
branded Ayurvedic products) and cached in memory; it is invalidated whenever the KB is reseeded.
"""
from __future__ import annotations

import threading
import time
from dataclasses import dataclass
from typing import Dict, List, Optional, Sequence, Tuple

from rapidfuzz import fuzz, process
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.config import get_settings
from app.models.kb import Drug, Herb, Product
from app.schemas.check import Candidate
from app.services.extraction_service import candidate_phrases, clean_line, tokenize

MIN_FUZZY_LEN = 5
SHORT_TERM_LEN = 6  # never fuzzy-match very short tokens (too many false positives)
_DICT_TTL = 300


@dataclass(frozen=True)
class DictEntry:
    kind: str  # 'drug' | 'herb'
    canonical_id: int
    canonical_name: str
    display_name: str
    via: str  # exact | synonym | brand | product


class Dictionary:
    def __init__(self, entries: Dict[str, List[DictEntry]]):
        self.entries = entries  # lower-cased term -> list of entries (a product may map to several herbs)
        self.keys: List[str] = list(entries.keys())


_cache: Tuple[float, Optional[Dictionary]] = (0.0, None)
_lock = threading.Lock()


def invalidate_dictionary() -> None:
    global _cache
    with _lock:
        _cache = (0.0, None)


def _add(d: Dict[str, List[DictEntry]], term: Optional[str], entry: DictEntry) -> None:
    if not term:
        return
    key = term.strip().lower()
    if len(key) < 2:
        return
    d.setdefault(key, [])
    if entry not in d[key]:
        d[key].append(entry)


def build_dictionary(db: Session) -> Dictionary:
    d: Dict[str, List[DictEntry]] = {}
    for h in db.scalars(select(Herb).options(selectinload(Herb.synonyms))).all():
        base = DictEntry("herb", h.id, h.english_name, h.english_name, "exact")
        for term in (h.english_name, h.latin_name, h.slug):
            _add(d, term, base)
        for term in (h.sanskrit_name, h.hindi_name):
            _add(d, term, DictEntry("herb", h.id, h.english_name, h.english_name, "synonym"))
        for syn in h.synonyms:
            _add(d, syn.term, DictEntry("herb", h.id, h.english_name, h.english_name, "synonym"))
    for drug in db.scalars(select(Drug).options(selectinload(Drug.brands))).all():
        base = DictEntry("drug", drug.id, drug.generic, drug.generic, "exact")
        _add(d, drug.generic, base)
        _add(d, drug.slug, base)
        for b in drug.brands:
            _add(d, b.brand, DictEntry("drug", drug.id, drug.generic, f"{b.brand} ({drug.generic})", "brand"))
    for p in db.scalars(select(Product).options(selectinload(Product.herbs))).all():
        for ph in p.herbs:
            herb = db.get(Herb, ph.herb_id)
            if herb:
                _add(d, p.brand, DictEntry("herb", herb.id, herb.english_name, f"{p.brand} → {herb.english_name}", "product"))
    return Dictionary(d)


def get_dictionary(db: Session) -> Dictionary:
    global _cache
    with _lock:
        ts, cached = _cache
        if cached is not None and time.time() - ts < _DICT_TTL:
            return cached
    built = build_dictionary(db)
    with _lock:
        _cache = (time.time(), built)
    return built


def _status(score: float) -> Optional[str]:
    s = get_settings()
    if score >= s.match_accept_threshold:
        return "accepted"
    if score >= s.match_confirm_threshold:
        return "needs_confirmation"
    return None


def match_phrase(phrase: str, dictionary: Dictionary, kind: Optional[str] = None) -> List[Candidate]:
    """Match one phrase. Exact first (score 100), then RapidFuzz over dictionary keys."""
    key = phrase.strip().lower()
    if not key:
        return []
    out: List[Candidate] = []
    if key in dictionary.entries:
        for e in dictionary.entries[key]:
            if kind and e.kind != kind:
                continue
            out.append(Candidate(kind=e.kind, raw_text=phrase, canonical_id=e.canonical_id, canonical_name=e.canonical_name, display_name=e.display_name, matched_term=key, score=100.0, status="accepted", via=e.via))
        if out:
            return out
    if len(key) < MIN_FUZZY_LEN:
        return []
    hits = process.extract(key, dictionary.keys, scorer=fuzz.WRatio, limit=3, score_cutoff=get_settings().match_confirm_threshold)
    for term, score, _ in hits:
        if len(term) < MIN_FUZZY_LEN:
            continue
        # WRatio rewards partial matches; require the shorter string to be at least 60% the length of the longer one.
        if min(len(term), len(key)) / max(len(term), len(key)) < 0.6:
            continue
        status = _status(score)
        if status is None:
            continue
        # Very short dictionary terms (e.g. 6-letter brand names) produce noisy near-misses ("Tonic" ~ "Tonact").
        # For those we only accept confident matches instead of asking the user to confirm noise.
        if len(term) <= SHORT_TERM_LEN and status != "accepted":
            continue
        for e in dictionary.entries[term]:
            if kind and e.kind != kind:
                continue
            out.append(Candidate(kind=e.kind, raw_text=phrase, canonical_id=e.canonical_id, canonical_name=e.canonical_name, display_name=e.display_name, matched_term=term, score=float(round(score, 1)), status=status, via="fuzzy"))
        if out:
            break  # best hit only
    return out


def _dedupe(cands: Sequence[Candidate]) -> List[Candidate]:
    best: Dict[Tuple[str, int], Candidate] = {}
    for c in cands:
        k = (c.kind, c.canonical_id)
        if k not in best or c.score > best[k].score:
            best[k] = c
    return sorted(best.values(), key=lambda c: (-c.score, c.canonical_name))


def match_text(text: str, dictionary: Dictionary) -> Tuple[List[Candidate], List[str]]:
    """Match a whole OCR document line by line. Returns (deduped candidates, unrecognised short lines)."""
    cands: List[Candidate] = []
    unrecognised: List[str] = []
    for line in text.splitlines():
        token_lines = tokenize(line)
        if not token_lines:
            continue
        toks = token_lines[0]
        line_hits = [c for phrase in candidate_phrases(line) for c in match_phrase(phrase, dictionary)]
        if line_hits:
            cands.extend(line_hits)
        elif 1 <= len(toks) <= 3:
            cleaned = " ".join(toks)
            if len(cleaned) >= MIN_FUZZY_LEN and any(ch.isalpha() for ch in cleaned) and cleaned not in unrecognised:
                unrecognised.append(cleaned)
    return _dedupe(cands), unrecognised[:10]


def resolve_manual(entries: Sequence[Tuple[str, str]], dictionary: Dictionary) -> Tuple[List[Candidate], List[str]]:
    """Resolve (kind, text) pairs typed by the user. Everything that does not clear the confirm threshold is unrecognised."""
    resolved: List[Candidate] = []
    unrecognised: List[str] = []
    for kind, text in entries:
        hits = match_phrase(text, dictionary, kind=kind)
        if not hits:
            # try after cleaning noise like 'Tab.' / '50 mcg'
            cleaned = clean_line(text)
            if cleaned and cleaned.lower() != text.strip().lower():
                hits = match_phrase(cleaned, dictionary, kind=kind)
        if hits:
            resolved.extend(hits)
        else:
            unrecognised.append(text.strip())
    return _dedupe(resolved), unrecognised
