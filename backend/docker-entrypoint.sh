#!/bin/sh
set -e
cd /app
python - <<'PY'
import os, sys
sys.path.insert(0, "/app")
from sqlalchemy import select, func
from app.db.session import get_sessionmaker
from app.db.seed import create_schema
from app.models.kb import Interaction
create_schema()
db = get_sessionmaker()()
try:
    n = db.scalar(select(func.count(Interaction.id))) or 0
finally:
    db.close()
if n == 0:
    print("empty knowledge base -> seeding")
    os.system("python scripts/seed.py")
    if os.environ.get("SEED_DEMO_ACTIVITY", "1") == "1":
        os.system("python scripts/seed_demo_activity.py")
else:
    print(f"knowledge base present ({n} rows) -> skip seed")
PY
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
