#!/usr/bin/env python3
"""Create tables and load the curated knowledge base. Safe to re-run (replaces KB tables, keeps logs/ADR/feedback).

    cd backend && python scripts/seed.py            # uses DATABASE_URL from .env (SQLite by default)
    DATABASE_URL=postgresql://... python scripts/seed.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.core.logging import configure_logging  # noqa: E402
from app.db.seed import run  # noqa: E402

if __name__ == "__main__":
    configure_logging("INFO")
    counts = run(export_dir=Path(__file__).resolve().parents[2] / "database" / "seed")
    print("Seeded:", counts)
