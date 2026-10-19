#!/usr/bin/env bash
# Local dev: seed (idempotent) then start the API with reload.
set -euo pipefail
cd "$(dirname "$0")/.."
python scripts/seed.py
exec uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
