from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.errors import NotFound
from app.db.session import get_db
from app.schemas.demo import DemoScenario, DemoScenarioResolved
from app.services.demo_service import scenarios
from app.services.matching_service import get_dictionary, resolve_manual

router = APIRouter(prefix="/demo", tags=["demo"])


@router.get("/scenarios", response_model=List[DemoScenario])
def list_scenarios():
    return scenarios()


@router.get("/scenarios/{scenario_id}", response_model=DemoScenarioResolved)
def get_scenario(scenario_id: str, db: Session = Depends(get_db)):
    """Resolves the scenario's names through the real matcher so Demo Mode exercises the same pipeline as a live check."""
    sc = next((s for s in scenarios() if s.id == scenario_id), None)
    if not sc:
        raise NotFound("Demo scenario not found.", {"id": scenario_id})
    dictionary = get_dictionary(db)
    entries = [("drug", d) for d in sc.drugs] + [("herb", h) for h in sc.herbs] + [("herb", u) for u in sc.unknown_terms]
    resolved, unrecognised = resolve_manual(entries, dictionary)
    return DemoScenarioResolved(**sc.model_dump(), resolved=resolved, unrecognised=unrecognised)
