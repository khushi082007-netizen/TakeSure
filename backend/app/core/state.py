"""Tiny process-wide status holder (startup diagnostics surfaced in /api/health)."""
from typing import Optional

SEED_STATUS: str = "not-run"
SEED_ERROR: Optional[str] = None
