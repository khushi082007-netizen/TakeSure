"""Security helpers: upload validation, safe temp storage, rate limiting."""
import hashlib
import os
import secrets
import threading
import time
from collections import defaultdict, deque
from pathlib import Path
from typing import Deque, Dict, Optional, Tuple

from fastapi import Request

from app.core.config import get_settings
from app.core.errors import FileTooLarge, RateLimited, UnsupportedFile

# Magic-byte signatures: we never trust the client-declared content type alone.
_SIGNATURES: Tuple[Tuple[bytes, str], ...] = (
    (b"\xff\xd8\xff", "image/jpeg"),
    (b"\x89PNG\r\n\x1a\n", "image/png"),
    (b"RIFF", "image/webp"),
    (b"%PDF-", "application/pdf"),
)
_EXT = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "application/pdf": ".pdf"}


def sniff_mime(data: bytes) -> str:
    for sig, mime in _SIGNATURES:
        if data.startswith(sig):
            if mime == "image/webp" and data[8:12] != b"WEBP":
                continue
            return mime
    return "application/octet-stream"


def validate_upload(data: bytes, declared_mime: str) -> str:
    s = get_settings()
    if len(data) > s.max_upload_mb * 1024 * 1024:
        raise FileTooLarge(f"File exceeds the {s.max_upload_mb} MB limit.", {"max_mb": s.max_upload_mb})
    if len(data) == 0:
        raise UnsupportedFile("The uploaded file is empty.")
    actual = sniff_mime(data)
    if actual not in s.allowed_mime_list:
        raise UnsupportedFile(
            "Only JPEG, PNG, WEBP images or PDF documents are accepted.",
            {"declared": declared_mime, "detected": actual, "allowed": s.allowed_mime_list},
        )
    return actual


def save_temp_upload(data: bytes, mime: str) -> Tuple[str, Path]:
    """Writes to a private temp dir with a random id. Files are purged after UPLOAD_TTL_SECONDS."""
    s = get_settings()
    root = Path(s.upload_tmp_dir)
    root.mkdir(parents=True, exist_ok=True)
    try:
        os.chmod(root, 0o700)
    except OSError:
        pass
    upload_id = secrets.token_urlsafe(16)
    path = root / f"{upload_id}{_EXT.get(mime, '.bin')}"
    with open(path, "wb") as fh:
        fh.write(data)
    try:
        os.chmod(path, 0o600)
    except OSError:
        pass
    return upload_id, path


def find_temp_upload(upload_id: str) -> Optional[Path]:
    if not upload_id or any(c in upload_id for c in "/\\") or ".." in upload_id:
        return None
    root = Path(get_settings().upload_tmp_dir)
    for ext in _EXT.values():
        p = root / f"{upload_id}{ext}"
        if p.exists():
            return p
    return None


def delete_temp_upload(path: Path) -> None:
    try:
        path.unlink(missing_ok=True)
    except OSError:
        pass


def purge_expired_uploads() -> int:
    s = get_settings()
    root = Path(s.upload_tmp_dir)
    if not root.exists():
        return 0
    cutoff = time.time() - s.upload_ttl_seconds
    n = 0
    for p in root.iterdir():
        try:
            if p.is_file() and p.stat().st_mtime < cutoff:
                p.unlink()
                n += 1
        except OSError:
            continue
    return n


def anonymise_ip(ip: str) -> str:
    return hashlib.sha256(ip.encode()).hexdigest()[:16]


class RateLimiter:
    """Sliding-window limiter keyed by hashed client IP. Single-instance; swap for Redis when scaling out."""

    def __init__(self) -> None:
        self._hits: Dict[str, Deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def check(self, request: Request) -> None:
        s = get_settings()
        if s.app_env == "test":
            return
        client = request.client.host if request.client else "unknown"
        key = anonymise_ip(client)
        now = time.time()
        with self._lock:
            q = self._hits[key]
            while q and q[0] < now - 60:
                q.popleft()
            if len(q) >= s.rate_limit_per_minute:
                raise RateLimited("Too many requests. Please wait a minute and try again.", {"limit_per_minute": s.rate_limit_per_minute})
            q.append(now)


rate_limiter = RateLimiter()


def rate_limited(request: Request) -> None:
    rate_limiter.check(request)
