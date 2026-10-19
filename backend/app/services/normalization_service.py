"""Normalisation: canonical ids -> entities, generic -> drug class, product -> herbs.

Brand->generic and product->herb mappings live in the database (drug_brands, product_herbs) and are
applied during matching; this module resolves confirmed ids to typed entities for the rule engine.
"""
from typing import List, Sequence, Tuple

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import NotFound
from app.models.kb import Drug, Herb
from app.schemas.check import EntityOut


def load_entities(db: Session, drug_ids: Sequence[int], herb_ids: Sequence[int]) -> Tuple[List[Drug], List[Herb]]:
    drugs = list(db.scalars(select(Drug).where(Drug.id.in_(list(drug_ids)))).all()) if drug_ids else []
    herbs = list(db.scalars(select(Herb).where(Herb.id.in_(list(herb_ids)))).all()) if herb_ids else []
    missing_d = set(drug_ids) - {d.id for d in drugs}
    missing_h = set(herb_ids) - {h.id for h in herbs}
    if missing_d or missing_h:
        raise NotFound("Some selected items no longer exist in the knowledge base.", {"drug_ids": sorted(missing_d), "herb_ids": sorted(missing_h)})
    return sorted(drugs, key=lambda d: d.generic), sorted(herbs, key=lambda h: h.english_name)


def drug_out(d: Drug) -> EntityOut:
    return EntityOut(id=d.id, name=d.generic, detail=d.drug_class)


def herb_out(h: Herb) -> EntityOut:
    return EntityOut(id=h.id, name=h.english_name, detail=h.latin_name)
