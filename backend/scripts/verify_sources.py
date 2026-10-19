#!/usr/bin/env python3
"""Prints the source-verification checklist (roadmap §11.2). Every row must be opened and confirmed by a human
before its status is changed to 'verified' in app/db/seed_data.py."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.db import seed_data as sd  # noqa: E402

if __name__ == "__main__":
    pending = 0
    for key, s in sd.SRC.items():
        status = s.get("verification_status", "needs_verification")
        used = [r["code"] for r in sd.INTERACTIONS if key in r["sources"]]
        mark = "[ ]" if status != "verified" else "[x]"
        pending += status != "verified"
        print(f"{mark} {key}: {s['title']}")
        print(f"      DOI={s.get('doi') or '-'}  URL={s.get('url') or '-'}  used by {len(used)} row(s)")
    print(f"\n{pending} of {len(sd.SRC)} sources still need human verification.")
