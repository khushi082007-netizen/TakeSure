import os
import tempfile
from pathlib import Path

import pytest

_tmp = tempfile.mkdtemp(prefix="takesure-test-")
os.environ["APP_ENV"] = "test"
os.environ["DATABASE_URL"] = f"sqlite:///{_tmp}/test.db"
os.environ["UPLOAD_TMP_DIR"] = f"{_tmp}/uploads"
os.environ["LLM_PROVIDER"] = "none"
os.environ["GROQ_API_KEY"] = ""  # never call the real API from tests, even if .env has a key
os.environ["LLM_API_KEY"] = ""
os.environ["OCR_ENGINE"] = "tesseract"
os.environ["TINYFISH_API_KEY"] = ""  # curation tests inject a mock transport instead

from app.core.config import get_settings  # noqa: E402

get_settings.cache_clear()
from app.db.seed import run  # noqa: E402
from app.db.session import get_sessionmaker, reset_engine  # noqa: E402

reset_engine()
run()


@pytest.fixture(scope="session")
def client():
    from fastapi.testclient import TestClient
    from app.main import app

    with TestClient(app) as c:
        yield c


@pytest.fixture
def db():
    s = get_sessionmaker()()
    try:
        yield s
        s.rollback()
    finally:
        s.close()


def ids(client, kind, *names):
    r = client.post("/api/check/resolve", json={"entities": [{"kind": kind, "text": n} for n in names]})
    assert r.status_code == 200, r.text
    return [c["canonical_id"] for c in r.json()["resolved"] if c["kind"] == kind], r.json()["unrecognised"]


@pytest.fixture
def resolve(client):
    return lambda kind, *names: ids(client, kind, *names)


@pytest.fixture
def sample_png() -> bytes:
    from io import BytesIO
    from PIL import Image, ImageDraw, ImageFont

    img = Image.new("RGB", (900, 400), "white")
    d = ImageDraw.Draw(img)
    try:
        f = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 40)
    except OSError:
        f = ImageFont.load_default()
    d.text((40, 40), "Rx\nTab. Thyronorm 50 mcg 1-0-0\nTab. Glycomet 500 mg 1-0-1", fill="black", font=f)
    buf = BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()
