import io


def test_upload_rejects_wrong_type(client):
    r = client.post("/api/check/upload", files={"file": ("x.txt", b"hello world", "text/plain")})
    assert r.status_code == 415 and r.json()["error"]["code"] == "UNSUPPORTED_FILE"


def test_upload_rejects_spoofed_mime(client):
    r = client.post("/api/check/upload", files={"file": ("x.png", b"<script>alert(1)</script>", "image/png")})
    assert r.status_code == 415


def test_upload_rejects_oversize(client, monkeypatch):
    from app.core.config import get_settings
    monkeypatch.setattr(get_settings(), "max_upload_mb", 0)
    r = client.post("/api/check/upload", files={"file": ("x.png", b"\x89PNG\r\n\x1a\n" + b"0" * 10, "image/png")})
    assert r.status_code == 413


def test_upload_then_extract_or_clean_failure(client, sample_png):
    r = client.post("/api/check/upload", files={"file": ("rx.png", sample_png, "image/png")})
    assert r.status_code == 201
    uid = r.json()["upload_id"]
    r2 = client.post("/api/check/extract", json={"prescription_upload_id": uid})
    # Depending on whether Tesseract is installed in the test environment, this is either a successful
    # extraction or a typed, retryable OCR error that tells the UI to offer manual entry. Both are correct behaviour.
    if r2.status_code == 200:
        names = {c["canonical_name"] for c in r2.json()["drugs"]}
        assert {"Levothyroxine", "Metformin"} <= names
        assert r2.json()["documents"][0]["engine"]
    else:
        body = r2.json()["error"]
        assert r2.status_code in (502, 503) and body["code"] in ("OCR_FAILED", "OCR_UNAVAILABLE") and body["retryable"]
    # The uploaded file is deleted after processing either way (privacy).
    from app.core.security import find_temp_upload
    assert find_temp_upload(uid) is None


def test_extract_expired_upload(client):
    r = client.post("/api/check/extract", json={"prescription_upload_id": "doesnotexist"})
    assert r.status_code == 404 and r.json()["error"]["code"] == "UPLOAD_NOT_FOUND"


def test_safety_pdf(client, resolve):
    d, _ = resolve("drug", "Warfarin")
    h, _ = resolve("herb", "Guggul")
    res = client.post("/api/check/evaluate", json={"drug_ids": d, "herb_ids": h}).json()
    pdf = client.post("/api/report/pdf", json=res)
    assert pdf.status_code == 200 and pdf.headers["content-type"] == "application/pdf"
    assert pdf.content.startswith(b"%PDF") and len(pdf.content) > 2000


def test_adr_create_and_pdf(client, db):
    payload = {"product": "Dabur Giloy Ghanvati", "drugs": ["Tacrolimus"], "reaction": "Yellow eyes, dark urine", "outcome": "recovering", "reporter_type": "caregiver", "onset_date": "2026-09-10", "seriousness": "hospitalisation"}
    r = client.post("/api/adr", json=payload)
    assert r.status_code == 201
    body = r.json()
    assert body["reference"].startswith("ADR-") and body["official_portal_url"].startswith("https://")
    assert "does not file it for you" in body["note"]
    pdf = client.post("/api/adr/pdf", json=payload)
    assert pdf.status_code == 200 and pdf.content.startswith(b"%PDF") and pdf.headers["x-adr-reference"].startswith("ADR-")


def test_adr_validation(client):
    r = client.post("/api/adr", json={"product": "X", "reaction": "short", "outcome": "nope", "reporter_type": "patient"})
    assert r.status_code == 422 and r.json()["error"]["code"] == "VALIDATION_FAILED"


def test_adr_without_consent_not_stored(client, db):
    from app.models.ops import ADRReport
    before = db.query(ADRReport).count()
    r = client.post("/api/adr", json={"product": "Himalaya Guduchi", "drugs": [], "reaction": "Mild rash on arms", "outcome": "recovered", "reporter_type": "patient", "consent_to_store": False})
    assert r.status_code == 201 and r.json()["id"] == 0
    db.expire_all()
    assert db.query(ADRReport).count() == before


def test_feedback(client):
    r = client.post("/api/feedback", json={"issue_type": "wrong_severity", "description": "Guggul with warfarin should be amber per Stockley", "interaction_code": "INT-GUGGUL-ANTICOAG"})
    assert r.status_code == 201 and r.json()["status"] == "open"
