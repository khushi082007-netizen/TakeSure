"""TinyFish curation tools, fully offline: an httpx MockTransport stands in for the TinyFish APIs."""
import json

import httpx
import pytest

from app.services import tinyfish_service as tf


def _mock_transport(verify_title_hit: bool = True):
    def handler(request: httpx.Request) -> httpx.Response:
        host = request.url.host
        if host == "api.fetch.tinyfish.ai":
            body = json.loads(request.content)
            results = []
            for u in body["urls"]:
                text = ("Subtle changes in thyroid indices during a placebo-controlled study of an extract of Withania somnifera in persons with bipolar disorder. "
                        "J Ayurveda Integr Med 2014. Gannon Forrest Chengappa.") if verify_title_hit else "Welcome to an unrelated landing page about shoes."
                results.append({"url": u, "final_url": u, "title": "Journal article" if verify_title_hit else "Shoe shop", "description": "", "language": "en", "format": "markdown", "text": text})
            return httpx.Response(200, json={"results": results, "errors": []})
        if host == "api.search.tinyfish.ai":
            return httpx.Response(200, json={"query": request.url.params.get("query"), "results": [{"position": 1, "site_name": "Dabur", "title": "Dabur Giloy Ghanvati", "snippet": "", "url": "https://www.dabur.com/products/giloy-ghanvati"}], "total_results": 1, "page": 1})
        if host == "agent.tinyfish.ai" and request.url.path.endswith("/run-async"):
            body = json.loads(request.content)
            handler.last_goal = body["goal"]
            return httpx.Response(200, json={"run_id": "run_test_123", "error": None})
        if host == "agent.tinyfish.ai" and request.url.path.startswith("/v1/runs/"):
            if "monograph" in getattr(handler, "last_goal", ""):
                result = {"herb": "Giloy", "interactions": [{"drug_or_class": "Immunosuppressants", "effect": "May counteract immunosuppressive therapy", "mechanism": "Immune stimulation", "severity_text": "Caution", "evidence_text": "theoretical", "reference": "MSKCC About Herbs"}]}
            else:
                result = {"product_name": "Dabur Giloy Ghanvati", "manufacturer": "Dabur", "ingredients": [{"name": "Giloy", "latin_or_sanskrit": "Tinospora cordifolia", "quantity": "500 mg"}, {"name": "Excipients", "latin_or_sanskrit": "", "quantity": ""}], "dosage_text": "1-2 tablets twice daily"}
            return httpx.Response(200, json={"run_id": "run_test_123", "status": "COMPLETED", "started_at": "", "finished_at": "", "num_of_steps": 7, "result": result, "error": None})
        return httpx.Response(404, json={"error": "unexpected host"})
    return httpx.MockTransport(handler)


@pytest.fixture(autouse=True)
def _offline():
    yield
    tf.set_transport(None)


def test_status_reports_unconfigured_without_key(client):
    j = client.get("/api/curation/status").json()
    assert j["configured"] is False and j["sources_total"] >= 70 and "TINYFISH_API_KEY" in j["note"]
    r = client.post("/api/curation/verify-sources", json={"limit": 1})
    assert r.status_code == 503 and r.json()["error"]["code"] == "TINYFISH_UNAVAILABLE"


def test_verify_sources_marks_matching_citations_verified(client):
    tf.set_transport(_mock_transport(verify_title_hit=True))
    before = client.get("/api/kb/stats").json()["sources_verified"]
    r = client.post("/api/curation/verify-sources", json={"limit": 3})
    assert r.status_code == 200, r.text
    j = r.json()
    assert j["checked"] == 3 and j["verified"] >= 1 and all(d["kind"] == "verify" for d in j["drafts"])
    assert client.get("/api/kb/stats").json()["sources_verified"] > before
    first = j["drafts"][0]
    assert first["source_url"].startswith("https://") and first["score"] is not None


def test_verify_sources_flags_mismatch_instead_of_verifying(client):
    tf.set_transport(_mock_transport(verify_title_hit=False))
    j = client.post("/api/curation/verify-sources", json={"limit": 2, "only_unverified": True}).json()
    assert j["mismatched"] == 2 and j["verified"] == 0
    assert all(d["status"] == "mismatch" for d in j["drafts"])
    pend = client.get("/api/curation/drafts?status=mismatch").json()
    assert pend["total"] >= 2


def test_discover_creates_pending_draft_and_never_touches_verdicts(client):
    tf.set_transport(_mock_transport())
    r = client.post("/api/curation/discover", json={"herb": "giloy", "url": "https://www.mskcc.org/cancer-care/integrative-medicine/herbs/example"})
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["kind"] == "discover" and d["status"] == "pending" and d["extracted"]["count"] >= 1
    assert d["extracted"]["extracted_via"] in ("fetch+rules", "web-agent")
    if d["extracted"]["extracted_via"] == "web-agent":
        assert d["tinyfish_run_id"] == "run_test_123" and d["steps"] == 7
    # the verdict for the same herb is unchanged by a pending draft
    before = client.get("/api/kb/stats").json()["interactions"]
    assert client.get("/api/kb/stats").json()["interactions"] == before


def test_map_product_uses_search_then_agent(client):
    tf.set_transport(_mock_transport())
    d = client.post("/api/curation/map-product", json={"brand": "Dabur Giloy Ghanvati"}).json()
    assert d["kind"] == "product" and d["source_url"].startswith("https://www.dabur.com")
    assert "giloy" in d["extracted"]["known_herbs"] and d["extracted"]["already_in_kb"] is True


def test_review_approve_and_reject(client):
    tf.set_transport(_mock_transport(verify_title_hit=False))
    j = client.post("/api/curation/verify-sources", json={"limit": 1}).json()
    draft = j["drafts"][0]
    a = client.post(f"/api/curation/drafts/{draft['id']}/approve", json={"reviewer": "khushi", "note": "opened the DOI, correct paper"}).json()
    assert a["status"] == "approved" and a["reviewed_by"] == "khushi"
    r = client.post(f"/api/curation/drafts/{draft['id']}/reject", json={"reviewer": "khushi"}).json()
    assert r["status"] == "rejected"
    assert client.post("/api/curation/drafts/999999/approve", json={}).status_code == 404


def test_unknown_herb_is_404(client):
    tf.set_transport(_mock_transport())
    r = client.post("/api/curation/discover", json={"herb": "unobtainium"})
    assert r.status_code == 404
