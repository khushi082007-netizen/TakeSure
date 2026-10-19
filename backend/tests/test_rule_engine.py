import pytest


def evaluate(client, drug_ids, herb_ids, unrecognised=None, language="en"):
    r = client.post("/api/check/evaluate", json={"drug_ids": drug_ids, "herb_ids": herb_ids, "unrecognised": unrecognised or [], "language": language})
    assert r.status_code == 200, r.text
    return r.json()


def test_amber_ashwagandha_levothyroxine(client, resolve):
    d, _ = resolve("drug", "Thyronorm")
    h, _ = resolve("herb", "Ashwagandha")
    res = evaluate(client, d, h)
    assert res["verdict"] == "AMBER"
    codes = [m["code"] for m in res["interactions"]]
    assert codes == ["INT-ASHWA-THYROID"]
    assert res["interactions"][0]["evidence_grade"] == "B"
    assert res["interactions"][0]["sources"]
    assert res["kb_version"] == "1.0.0"


def test_red_guggul_warfarin_via_high_risk_escalation(client, resolve):
    d, _ = resolve("drug", "Warfarin")
    h, _ = resolve("herb", "Guggul")
    res = evaluate(client, d, h)
    assert res["verdict"] == "RED"
    assert "R5" in res["interactions"][0]["rule_applied"]


def test_red_major_severity(client, resolve):
    d, _ = resolve("drug", "Lasix")
    h, _ = resolve("herb", "Mulethi")
    res = evaluate(client, d, h)
    assert res["verdict"] == "RED"
    assert "R4" in res["interactions"][0]["rule_applied"]


def test_green_timing_only_triphala(client, resolve):
    d, _ = resolve("drug", "Metformin")
    h, _ = resolve("herb", "Triphala")
    res = evaluate(client, d, h)
    assert res["verdict"] == "GREEN"
    assert res["interactions"][0]["timing_gap_hours"] == 3
    assert res["explanation"]["timing_gap"] and "3" in res["explanation"]["timing_gap"]


def test_timing_rows_skip_injectable_drugs(client, resolve):
    d, _ = resolve("drug", "Lantus")
    h, _ = resolve("herb", "Isabgol")
    res = evaluate(client, d, h)
    assert all(m["interaction_type"] != "timing" for m in res["interactions"])


def test_green_no_record(client, resolve):
    d, _ = resolve("drug", "Amoxicillin")
    h, _ = resolve("herb", "Arjuna")
    res = evaluate(client, d, h)
    assert res["verdict"] == "GREEN" and res["interactions"] == []
    assert "not proof of safety" in res["verdict_reason"]


def test_grey_unknown_never_green(client, resolve):
    d, _ = resolve("drug", "Metformin")
    res = evaluate(client, d, [], unrecognised=["Zandu Kesari Jivan"])
    assert res["verdict"] == "GREY"
    assert res["explanation"]["origin"] == "kb_fallback"


def test_grey_when_only_unknown_alongside_green_pairs(client, resolve):
    d, _ = resolve("drug", "Amoxicillin")
    h, _ = resolve("herb", "Arjuna")
    res = evaluate(client, d, h, unrecognised=["Unknown Rasayan"])
    assert res["verdict"] == "GREY"


def test_multiple_interactions_keep_lower_severity_rows(client, resolve):
    d, _ = resolve("drug", "Levothyroxine", "Metformin")
    h, _ = resolve("herb", "Ashwagandha", "Karela", "Triphala")
    res = evaluate(client, d, h)
    assert res["verdict"] == "AMBER"
    verdicts = {m["verdict"] for m in res["interactions"]}
    assert "GREEN" in verdicts and "AMBER" in verdicts  # lower-severity findings are not hidden
    assert len(res["pairs"]) == 6


def test_drug_specific_row_overrides_class_row(client, resolve):
    d, _ = resolve("drug", "Propranolol")
    h, _ = resolve("herb", "Guggul")
    res = evaluate(client, d, h)
    assert [m["code"] for m in res["interactions"]] == ["INT-GUGGUL-PROPRANOLOL"]
    assert res["interactions"][0]["matched_by"] == "drug"


def test_bhasma_contamination_not_escalated(client, resolve):
    d, _ = resolve("drug", "Warfarin")
    h, _ = resolve("herb", "Swarna bhasma")
    res = evaluate(client, d, h)
    assert res["verdict"] == "AMBER"


def test_evaluate_rejects_empty(client):
    r = client.post("/api/check/evaluate", json={"drug_ids": [], "herb_ids": []})
    assert r.status_code == 422 and r.json()["error"]["code"] == "VALIDATION_FAILED"


def test_evaluate_unknown_id(client):
    r = client.post("/api/check/evaluate", json={"drug_ids": [99999], "herb_ids": [1]})
    assert r.status_code == 404 and r.json()["error"]["code"] == "NOT_FOUND"


def test_query_is_logged_anonymously(client, resolve, db):
    from app.models.ops import QueryLog

    d, _ = resolve("drug", "Warfarin")
    h, _ = resolve("herb", "Guggul")
    res = evaluate(client, d, h)
    row = db.get(QueryLog, res["query_id"])
    assert row.verdict == "RED" and row.kb_version == "1.0.0" and row.drug_ids == d


def test_explanation_never_contains_directive_language(client, resolve):
    d, _ = resolve("drug", "Warfarin", "Metformin", "Lasix")
    h, _ = resolve("herb", "Guggul", "Karela", "Mulethi", "Giloy")
    res = evaluate(client, d, h, language="hi")
    blob = res["explanation"]["summary_en"] + " ".join(res["explanation"]["doctor_questions"])
    for bad in ("stop taking", "discontinue", "do not take"):
        assert bad not in blob.lower()
    assert len(res["explanation"]["doctor_questions"]) == 3
    assert res["explanation"]["summary_hi"]
