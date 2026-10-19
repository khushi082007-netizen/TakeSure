"""Demo Mode scenarios. These only pre-fill the *input names*; the names still go through the real
matcher, normaliser, rule engine and explainer. Nothing about the result is pre-computed."""
from typing import List

from app.schemas.demo import DemoScenario

SCENARIOS: List[DemoScenario] = [
    DemoScenario(id="ashwagandha-levothyroxine", title="Ashwagandha × Levothyroxine", description="Thyroid patient on Thyronorm starts ashwagandha for stress.", expected_verdict="AMBER", drugs=["Thyronorm"], herbs=["Ashwagandha"]),
    DemoScenario(id="guggul-warfarin", title="Guggul × Warfarin", description="Cardiac patient on a blood thinner takes guggul for cholesterol.", expected_verdict="RED", drugs=["Warfarin"], herbs=["Guggul"]),
    DemoScenario(id="triphala-oral", title="Triphala × Metformin (timing)", description="Bulk laxative taken at the same time as an oral medicine.", expected_verdict="GREEN", drugs=["Metformin"], herbs=["Triphala"]),
    DemoScenario(id="giloy-tacrolimus", title="Giloy × Tacrolimus", description="Transplant patient on an immunosuppressant drinks giloy kadha.", expected_verdict="RED", drugs=["Tacrolimus"], herbs=["Giloy"]),
    DemoScenario(id="multi", title="Multiple medicines, mixed findings", description="Levothyroxine + Metformin with Ashwagandha, Karela and Triphala.", expected_verdict="AMBER", drugs=["Levothyroxine", "Metformin"], herbs=["Ashwagandha", "Karela", "Triphala"]),
    DemoScenario(id="unknown", title="Unknown product", description="A product not yet curated: the verdict must be 'Not in database', never Green.", expected_verdict="GREY", drugs=["Metformin"], herbs=[], unknown_terms=["Zandu Kesari Jivan"]),
]


def scenarios() -> List[DemoScenario]:
    return SCENARIOS
