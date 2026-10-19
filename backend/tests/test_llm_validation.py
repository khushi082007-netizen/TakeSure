import json

import pytest

from app.services import llm_service
from app.services.llm_service import kb_fallback, parse_and_validate


GOOD = {"summary_en": "Ashwagandha may raise thyroid hormone levels when taken with levothyroxine.", "summary_hi": "अश्वगंधा थायरॉइड हार्मोन बढ़ा सकती है।", "timing_gap": None, "doctor_questions": ["Q1?", "Q2?", "Q3?"]}


def test_valid_json_passes():
    out = parse_and_validate(json.dumps(GOOD))
    assert out.summary_en.startswith("Ashwagandha")


def test_markdown_fences_are_tolerated():
    parse_and_validate("```json\n" + json.dumps(GOOD) + "\n```")


def test_non_json_rejected():
    with pytest.raises(ValueError):
        parse_and_validate("Sure! Here is the explanation: ...")


def test_wrong_question_count_rejected():
    bad = dict(GOOD, doctor_questions=["only one"])
    with pytest.raises(ValueError):
        parse_and_validate(json.dumps(bad))


def test_directive_language_rejected():
    bad = dict(GOOD, summary_en="You should stop taking levothyroxine immediately and take ashwagandha instead.")
    with pytest.raises(ValueError):
        parse_and_validate(json.dumps(bad))


def test_dose_numbers_rejected():
    bad = dict(GOOD, summary_en="Increase to 75 mcg of levothyroxine to compensate for the ashwagandha effect.")
    with pytest.raises(ValueError):
        parse_and_validate(json.dumps(bad))


def test_fallback_used_when_provider_fails(monkeypatch):
    from app.core.config import get_settings
    from app.schemas.check import EntityOut, MatchedInteraction, SourceOut

    s = get_settings()
    monkeypatch.setattr(s, "llm_provider", "anthropic")
    monkeypatch.setattr(s, "llm_api_key", "test-key")
    monkeypatch.setitem(llm_service._PROVIDERS, "anthropic", lambda facts, lang: "not json at all")
    m = MatchedInteraction(code="X", herb=EntityOut(id=1, name="Guggul"), drug=EntityOut(id=2, name="Warfarin", detail="anticoagulant"), matched_by="drug_class", severity="moderate", verdict="RED", interaction_type="pharmacodynamic", mechanism="m", effect="Bleeding risk.", management="Check INR.", evidence_grade="C", population_flags=[], rule_applied="R5", sources=[SourceOut(title="t", source_type="database", verification_status="needs_verification")])
    out = llm_service.explain("RED", [m], [m.drug], [m.herb], [], "en")
    assert out.origin == "kb_fallback" and "temporarily unavailable" in out.notice
    assert len(out.doctor_questions) == 3


def test_llm_facts_contain_only_kb_fields():
    from app.schemas.check import EntityOut, MatchedInteraction, SourceOut

    m = MatchedInteraction(code="X", herb=EntityOut(id=1, name="Guggul"), drug=EntityOut(id=2, name="Warfarin"), matched_by="drug_class", severity="moderate", verdict="RED", interaction_type="pharmacodynamic", mechanism="m", effect="e", management="g", evidence_grade="C", population_flags=[], rule_applied="R5", sources=[SourceOut(title="t", source_type="database", verification_status="needs_verification")])
    facts = llm_service.build_facts("RED", [m], [m.drug], [m.herb])
    assert set(facts) == {"verdict", "herbs", "drugs", "matched_records"}
    assert "raw_text" not in json.dumps(facts) and "image" not in json.dumps(facts)
