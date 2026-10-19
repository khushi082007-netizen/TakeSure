def test_health(client):
    j = client.get("/api/health").json()
    assert j["status"] == "ok" and j["interactions_active"] >= 40


def test_kb_stats_and_seed_integrity(client):
    s = client.get("/api/kb/stats").json()
    assert 40 <= s["interactions"] <= 60 and s["herbs"] >= 15 and s["drugs"] >= 25
    assert s["sources_verified"] == 0  # nothing claims to be verified until a human checks it


def test_every_interaction_has_source_and_grade(client):
    items = client.get("/api/interactions?limit=200").json()["items"]
    for it in items:
        d = client.get(f"/api/interactions/{it['code']}").json()
        assert d["sources"], it["code"]
        assert d["evidence_grade"] in "ABC" and d["mechanism"] and d["management"]
        for s in d["sources"]:
            assert s["verification_status"] in ("verified", "needs_verification")


def test_kb_search_by_brand_and_hindi(client):
    assert client.get("/api/interactions?q=Thyronorm").json()["total"] >= 1
    assert client.get("/api/interactions?q=मुलेठी").json()["total"] >= 1
    assert client.get("/api/interactions?severity=major").json()["total"] >= 1
    assert client.get("/api/interactions?grade=Z").status_code == 422


def test_unknown_interaction_404(client):
    r = client.get("/api/interactions/NOPE")
    assert r.status_code == 404 and r.json()["error"]["code"] == "NOT_FOUND"


def test_demo_scenarios_produce_expected_verdicts(client):
    for sc in client.get("/api/demo/scenarios").json():
        s = client.get(f"/api/demo/scenarios/{sc['id']}").json()
        payload = {"drug_ids": [c["canonical_id"] for c in s["resolved"] if c["kind"] == "drug"], "herb_ids": [c["canonical_id"] for c in s["resolved"] if c["kind"] == "herb"], "unrecognised": s["unrecognised"], "source": "demo"}
        res = client.post("/api/check/evaluate", json=payload).json()
        assert res["verdict"] == sc["expected_verdict"], sc["id"]


def test_error_envelope_shape(client):
    body = client.get("/api/interactions/NOPE").json()
    assert set(body["error"]) == {"code", "message", "detail", "retryable"}


def test_security_headers(client):
    r = client.get("/api/health")
    assert r.headers["x-content-type-options"] == "nosniff" and r.headers["x-frame-options"] == "DENY" and "x-request-id" in r.headers
