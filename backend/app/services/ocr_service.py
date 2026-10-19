"""Document reading (OCR).

Two engines, both optional, both reported by name in every API response so the UI never pretends:

* **Tesseract** (local, offline). Detected automatically on Windows/Linux/macOS, or set TESSERACT_CMD.
  Images are pre-processed with Pillow (grayscale, upscale, autocontrast) which helps a lot on phone photos.
  Hindi (Devanagari) is read when `hin.traineddata` is available in the tessdata folder.
* **Groq vision** (cloud). A multimodal Llama model transcribes the photo. Used only to *read text*; it never
  sees the knowledge base and never decides anything. Enabled automatically when a Groq key is configured.

Engine order is decided by OCR_ENGINE (auto | tesseract | groq_vision | none). When the first engine fails the
next one is tried and the response carries a warning saying so.
"""
from __future__ import annotations

import base64
import logging
import os
import shutil
import threading
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutTimeout
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional, Protocol

import httpx

from app.core.config import get_settings
from app.core.errors import NoTextDetected, OCRFailed, OCRUnavailable

log = logging.getLogger("takesure.ocr")

_WINDOWS_TESSERACT_PATHS = [
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    os.path.expandvars(r"%LOCALAPPDATA%\Programs\Tesseract-OCR\tesseract.exe"),
    os.path.expandvars(r"%LOCALAPPDATA%\Tesseract-OCR\tesseract.exe"),
]


@dataclass
class OCRResult:
    engine: str
    text: str
    warnings: List[str] = field(default_factory=list)


class OCREngine(Protocol):
    name: str

    def available(self) -> bool: ...

    def extract(self, path: Path) -> OCRResult: ...


# ---------------------------------------------------------------------------------------------- Tesseract

def find_tesseract() -> Optional[str]:
    s = get_settings()
    if s.tesseract_cmd and os.path.exists(s.tesseract_cmd):
        return s.tesseract_cmd
    found = shutil.which("tesseract")
    if found:
        return found
    for p in _WINDOWS_TESSERACT_PATHS:
        if os.path.exists(p):
            return p
    return None


def find_tessdata() -> Optional[str]:
    """Prefer the project-local tessdata folder (where we add Hindi), then the Tesseract install folder."""
    s = get_settings()
    if s.tessdata_dir and os.path.isdir(s.tessdata_dir):
        return s.tessdata_dir
    local = Path(__file__).resolve().parents[2] / "tessdata"
    if (local / "eng.traineddata").exists():
        return str(local)
    cmd = find_tesseract()
    if cmd:
        cand = Path(cmd).parent / "tessdata"
        if cand.is_dir():
            return str(cand)
    env = os.environ.get("TESSDATA_PREFIX")
    if env and os.path.isdir(env):
        return env
    return None


def tesseract_languages() -> str:
    """Only request languages whose traineddata exists; Tesseract errors out otherwise."""
    s = get_settings()
    wanted = [l for l in s.tesseract_langs.replace(",", "+").split("+") if l]
    data = find_tessdata()
    if not data:
        return "eng"
    have = [l for l in wanted if (Path(data) / f"{l}.traineddata").exists()]
    return "+".join(have) if have else "eng"


class TesseractEngine:
    name = "tesseract"

    def available(self) -> bool:
        return find_tesseract() is not None

    def extract(self, path: Path) -> OCRResult:
        if path.suffix.lower() == ".pdf":
            raise OCRFailed("Tesseract reads images only. Please upload a photo (JPG/PNG/WebP) instead of a PDF.", {"engine": self.name})
        try:
            import pytesseract
            from PIL import Image, ImageOps
        except ImportError as exc:  # pragma: no cover
            raise OCRUnavailable("Tesseract bindings are not installed on the server.", {"engine": self.name}) from exc
        cmd = find_tesseract()
        if not cmd:
            raise OCRUnavailable("Tesseract is not installed on this server.", {"engine": self.name})
        pytesseract.pytesseract.tesseract_cmd = cmd
        try:
            img = Image.open(path)
            img = ImageOps.exif_transpose(img).convert("L")
            w, h = img.size
            if max(w, h) < 1600:  # phone thumbnails / small crops read much better when upscaled
                scale = 1600 / max(w, h)
                img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
            img = ImageOps.autocontrast(img, cutoff=1)
        except Exception as exc:
            raise OCRFailed("The image could not be opened. Try saving it again as JPG or PNG.", {"engine": self.name, "reason": str(exc)[:200]}) from exc
        config = "--psm 6"
        data = find_tessdata()
        if data:
            # Passed via the environment: quoting a Windows path inside the config string breaks pytesseract's parser.
            os.environ["TESSDATA_PREFIX"] = data
        langs = tesseract_languages()
        try:
            text = pytesseract.image_to_string(img, lang=langs, config=config)
        except pytesseract.TesseractError as exc:
            raise OCRFailed("Tesseract could not process the image.", {"engine": self.name, "reason": str(exc)[:300]}) from exc
        warnings: List[str] = []
        if "hin" not in langs:
            warnings.append("Hindi text was not read (hin.traineddata not installed); English labels are fine.")
        return OCRResult(engine=f"{self.name}/{langs}", text=text, warnings=warnings)


# ---------------------------------------------------------------------------------------------- Groq vision

_VISION_PROMPT = (
    "You are an OCR engine. Transcribe ALL printed and handwritten text visible in this image exactly as written, "
    "one line per visual line, preserving brand names, generic names, strengths (mg/mcg) and ingredient lists. "
    "Include Hindi/Devanagari text as-is. Do not translate, summarise, interpret or add anything. Output plain text only."
)
_MIME = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"}


_models_cache: dict = {"ts": 0.0, "ids": None}


def groq_model_ids() -> Optional[set]:
    """Models this Groq account can use (cached 10 min). None when the list cannot be fetched."""
    import time

    s = get_settings()
    if not s.groq_key:
        return None
    if _models_cache["ids"] is not None and time.time() - _models_cache["ts"] < 600:
        return _models_cache["ids"]
    try:
        r = httpx.get(f"{s.effective_llm_base_url}/models", headers={"Authorization": f"Bearer {s.groq_key}"}, timeout=8)
        r.raise_for_status()
        ids = {m["id"] for m in r.json().get("data", [])}
    except Exception as exc:  # network down / bad key -> treat as unavailable, Tesseract takes over
        log.warning("could not list Groq models: %s", str(exc)[:120])
        ids = set()
    _models_cache.update(ts=time.time(), ids=ids)
    return ids


class GroqVisionEngine:
    name = "groq-vision"

    def available(self) -> bool:
        s = get_settings()
        if not s.groq_key:
            return False
        ids = groq_model_ids()
        return bool(ids) and s.ocr_vision_model in ids

    def extract(self, path: Path) -> OCRResult:
        s = get_settings()
        if path.suffix.lower() == ".pdf":
            raise OCRFailed("The vision reader accepts images only. Please upload a photo (JPG/PNG/WebP) instead of a PDF.", {"engine": self.name})
        key = s.groq_key
        if not key:
            raise OCRUnavailable("No Groq key configured for vision OCR.", {"engine": self.name})
        mime = _MIME.get(path.suffix.lower(), "image/jpeg")
        b64 = base64.b64encode(path.read_bytes()).decode("ascii")
        body = {
            "model": s.ocr_vision_model,
            "temperature": 0,
            "max_completion_tokens": 1500,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": _VISION_PROMPT},
                        {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64}"}},
                    ],
                }
            ],
        }
        try:
            r = httpx.post(f"{s.effective_llm_base_url}/chat/completions", headers={"Authorization": f"Bearer {key}"}, json=body, timeout=s.ocr_timeout_seconds)
            r.raise_for_status()
            text = r.json()["choices"][0]["message"]["content"]
        except httpx.HTTPStatusError as exc:
            raise OCRFailed("The vision reader rejected the request.", {"engine": self.name, "status": exc.response.status_code, "reason": exc.response.text[:200]}) from exc
        except (httpx.HTTPError, KeyError, ValueError) as exc:
            raise OCRFailed("The vision reader could not be reached.", {"engine": self.name, "reason": str(exc)[:200]}) from exc
        return OCRResult(engine=f"{self.name}/{s.ocr_vision_model}", text=str(text or ""), warnings=[])


class NullEngine:
    name = "none"

    def available(self) -> bool:
        return False

    def extract(self, path: Path) -> OCRResult:
        raise OCRUnavailable("Photo reading is disabled on this server (OCR_ENGINE=none). Use manual entry.")


# ---------------------------------------------------------------------------------------------- orchestration

_tess = TesseractEngine()
_groq = GroqVisionEngine()
_pool = ThreadPoolExecutor(max_workers=2, thread_name_prefix="ocr")
_lock = threading.Lock()


def engine_chain() -> List[OCREngine]:
    s = get_settings()
    if s.ocr_engine == "none":
        return [NullEngine()]
    if s.ocr_engine == "tesseract":
        return [_tess]
    if s.ocr_engine == "groq_vision":
        return [_groq, _tess]
    # auto
    return [_groq, _tess] if _groq.available() else [_tess]


def describe() -> dict:
    """For /health and the UI: which engines exist on this server."""
    s = get_settings()
    chain = [e.name for e in engine_chain() if e.available()]
    return {
        "mode": s.ocr_engine,
        "chain": chain,
        "available": bool(chain),
        "tesseract_cmd": find_tesseract(),
        "tesseract_langs": tesseract_languages() if _tess.available() else None,
        "groq_vision": _groq.available(),
    }


def reset_engines() -> None:  # kept for tests
    pass


def _run_with_timeout(engine: OCREngine, path: Path) -> OCRResult:
    fut = _pool.submit(engine.extract, path)
    try:
        return fut.result(timeout=get_settings().ocr_timeout_seconds)
    except FutTimeout as exc:
        raise OCRFailed("Document reading timed out. Try a smaller or clearer image.", {"engine": engine.name, "timeout_s": get_settings().ocr_timeout_seconds}) from exc


def extract_text(path: Path) -> OCRResult:
    chain = engine_chain()
    usable = [e for e in chain if e.available()]
    if not usable:
        if isinstance(chain[0], NullEngine):
            chain[0].extract(path)
        raise OCRUnavailable(
            "No document reader is available on this server. Install Tesseract or add a Groq key, or type the names manually.",
            {"engines_tried": [e.name for e in chain]},
        )
    warnings: List[str] = []
    last_exc: Optional[Exception] = None
    for engine in usable:
        try:
            res = _run_with_timeout(engine, path)
        except OCRUnavailable as exc:
            last_exc = exc
            warnings.append(f"{engine.name} unavailable: {exc.message}")
            continue
        except OCRFailed as exc:
            last_exc = exc
            warnings.append(f"{engine.name} failed: {exc.message}")
            log.warning("OCR engine %s failed: %s", engine.name, exc.message)
            continue
        except Exception as exc:  # defensive: never leak a stack trace to the user
            last_exc = exc
            warnings.append(f"{engine.name} error: {str(exc)[:120]}")
            log.warning("OCR engine %s error: %s", engine.name, exc)
            continue
        if not res.text or len(res.text.strip()) < 3:
            warnings.append(f"{engine.name} found no readable text.")
            last_exc = NoTextDetected("No readable text was found in the photo.", {"engine": res.engine})
            continue
        res.warnings = warnings + res.warnings
        return res
    if isinstance(last_exc, NoTextDetected):
        raise NoTextDetected("No readable text was found in the document. Try a sharper, well-lit photo, or enter names manually.", {"warnings": warnings})
    if isinstance(last_exc, OCRFailed):
        raise last_exc
    raise OCRUnavailable("Document reading is not available right now. You can type the medicine and product names manually.", {"warnings": warnings})
