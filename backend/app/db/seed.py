"""Idempotent seeding: validates the seed module, (re)creates tables, loads herbs/drugs/products/interactions,
and exports JSON snapshots to database/seed/ for transparency and external review."""
from __future__ import annotations

import json
import logging
from datetime import date
from pathlib import Path
from typing import Dict

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.db import seed_data as sd
from app.db.base import Base
from app.db.session import get_engine, session_scope
from app.models.kb import Drug, DrugBrand, Herb, HerbSynonym, Interaction, InteractionSource, Product, ProductHerb
from app.services.matching_service import invalidate_dictionary

log = logging.getLogger("takesure.seed")

VALID_CLASSES = {d["drug_class"] for d in sd.DRUGS} | {"*"}
VALID_SEVERITY = {"minor", "moderate", "major"}
VALID_TYPES = {"pharmacodynamic", "pharmacokinetic", "timing", "contamination"}


def validate_seed() -> None:
    herb_slugs = {h["slug"] for h in sd.HERBS}
    drug_slugs = {d["slug"] for d in sd.DRUGS}
    codes = set()
    for row in sd.INTERACTIONS:
        assert row["code"] not in codes, f"duplicate code {row['code']}"
        codes.add(row["code"])
        assert row["herb"] in herb_slugs, f"{row['code']}: unknown herb {row['herb']}"
        assert row["drug"] is None or row["drug"] in drug_slugs, f"{row['code']}: unknown drug {row['drug']}"
        assert row["drug_class"] is None or row["drug_class"] in VALID_CLASSES, f"{row['code']}: unknown class {row['drug_class']}"
        assert row["severity"] in VALID_SEVERITY
        assert row["interaction_type"] in VALID_TYPES
        assert row["evidence_grade"] in {"A", "B", "C"}
        assert row["sources"], f"{row['code']}: every row needs at least one source"
        for s in row["sources"]:
            assert s in sd.SRC, f"{row['code']}: unknown source key {s}"
        if row["interaction_type"] == "timing":
            assert row["timing_gap_hours"], f"{row['code']}: timing rows need timing_gap_hours"
    for p in sd.PRODUCTS:
        for h in p["herbs"]:
            assert h in herb_slugs, f"product {p['brand']}: unknown herb {h}"


def create_schema() -> None:
    Base.metadata.create_all(get_engine())


def _wipe(db: Session) -> None:
    for model in (InteractionSource, Interaction, ProductHerb, Product, DrugBrand, Drug, HerbSynonym, Herb):
        db.execute(delete(model))


def load(db: Session) -> Dict[str, int]:
    _wipe(db)
    herbs: Dict[str, Herb] = {}
    for h in sd.HERBS:
        obj = Herb(slug=h["slug"], english_name=h["english_name"], latin_name=h["latin_name"], sanskrit_name=h.get("sanskrit_name"), hindi_name=h.get("hindi_name"), category=h.get("category"), api_monograph_ref=h.get("api_monograph_ref"))
        for term in h.get("synonyms", []):
            obj.synonyms.append(HerbSynonym(term=term))
        db.add(obj)
        herbs[h["slug"]] = obj
    drugs: Dict[str, Drug] = {}
    for d in sd.DRUGS:
        obj = Drug(slug=d["slug"], generic=d["generic"], drug_class=d["drug_class"], atc_code=d.get("atc_code"), route=d.get("route", "oral"))
        for b in d.get("brands", []):
            obj.brands.append(DrugBrand(brand=b))
        db.add(obj)
        drugs[d["slug"]] = obj
    db.flush()
    for p in sd.PRODUCTS:
        obj = Product(brand=p["brand"], manufacturer=p.get("manufacturer"), label_text=p.get("label_text"), source_url=p.get("source_url"))
        for slug in p["herbs"]:
            obj.herbs.append(ProductHerb(herb_id=herbs[slug].id))
        db.add(obj)
    n_src = 0
    for row in sd.INTERACTIONS:
        obj = Interaction(
            code=row["code"], herb_id=herbs[row["herb"]].id, drug_id=drugs[row["drug"]].id if row["drug"] else None, drug_class=row["drug_class"],
            severity=row["severity"], interaction_type=row["interaction_type"], mechanism=row["mechanism"], effect=row["effect"], management=row["management"],
            timing_gap_hours=row["timing_gap_hours"], evidence_grade=row["evidence_grade"], population_flags=row["population_flags"],
            patient_summary_en=row.get("patient_summary_en"), patient_summary_hi=row.get("patient_summary_hi"),
            reviewer=sd.REVIEWER, reviewed_on=date.fromisoformat(sd.REVIEWED_ON), kb_version=sd.KB_VERSION, is_active=True,
        )
        for key in row["sources"]:
            s = sd.SRC[key]
            obj.sources.append(InteractionSource(title=s["title"], source_type=s["source_type"], doi=s.get("doi"), pmid=s.get("pmid"), url=s.get("url"), year=s.get("year"), verification_status=s.get("verification_status", "needs_verification")))
            n_src += 1
        db.add(obj)
    db.flush()
    invalidate_dictionary()
    return {"herbs": len(herbs), "drugs": len(drugs), "products": len(sd.PRODUCTS), "interactions": len(sd.INTERACTIONS), "sources": n_src}


def export_json(out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "herbs.json").write_text(json.dumps(sd.HERBS, ensure_ascii=False, indent=2), encoding="utf-8")
    (out_dir / "drugs.json").write_text(json.dumps(sd.DRUGS, ensure_ascii=False, indent=2), encoding="utf-8")
    (out_dir / "products.json").write_text(json.dumps(sd.PRODUCTS, ensure_ascii=False, indent=2), encoding="utf-8")
    rows = []
    for r in sd.INTERACTIONS:
        rr = dict(r)
        rr["sources"] = [dict(sd.SRC[k], key=k, verification_status=sd.SRC[k].get("verification_status", "needs_verification")) for k in r["sources"]]
        rr.update(kb_version=sd.KB_VERSION, reviewer=sd.REVIEWER, reviewed_on=sd.REVIEWED_ON)
        rows.append(rr)
    (out_dir / "interactions.json").write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")


def run(export_dir: Path | None = None) -> Dict[str, int]:
    validate_seed()
    create_schema()
    with session_scope() as db:
        counts = load(db)
    if export_dir:
        try:
            export_json(export_dir)
        except OSError as exc:  # read-only or missing mount (containers): the DB is what matters
            log.warning("seed export skipped: %s", exc)
    log.info("seeded %s", counts)
    return counts
