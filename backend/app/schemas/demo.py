from typing import List, Optional

from pydantic import BaseModel

from app.schemas.check import Candidate


class DemoScenario(BaseModel):
    id: str
    title: str
    description: str
    expected_verdict: str
    drugs: List[str]
    herbs: List[str]
    unknown_terms: List[str] = []


class DemoScenarioResolved(DemoScenario):
    resolved: List[Candidate]
    unrecognised: List[str]
