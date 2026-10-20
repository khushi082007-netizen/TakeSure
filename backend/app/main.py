import logging
import os
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.core.errors import register_error_handlers
from app.core.logging import configure_logging
from app.core.security import purge_expired_uploads
from app.db.base import Base
from app.db.session import get_engine
import app.models.kb  # noqa: F401  (register tables)
import app.models.ops  # noqa: F401

log = logging.getLogger("takesure")


@asynccontextmanager
async def lifespan(app: FastAPI):
    s = get_settings()
    configure_logging(s.log_level)
    purge_expired_uploads()
    try:
        Base.metadata.create_all(get_engine())  # idempotent: adds new tables (e.g. curation_drafts) to an existing DB
        _seed_if_empty()
    except Exception as exc:  # pragma: no cover
        import traceback
        from app.core import state
        state.SEED_STATUS = "failed"
        state.SEED_ERROR = "".join(traceback.format_exception(exc))[-3000:]
        log.exception("startup schema/seed step failed")
    log.info("TakeSure API starting", extra={"event": "startup"})
    yield
    log.info("TakeSure API stopping", extra={"event": "shutdown"})


def _seed_if_empty() -> None:
    """Deployments: load the knowledge base on first boot (never wipes an existing one). Errors are logged in full."""
    from sqlalchemy import func, select
    from app.db.session import get_sessionmaker
    from app.models.kb import Interaction
    db = get_sessionmaker()()
    try:
        n = db.scalar(select(func.count(Interaction.id))) or 0
    finally:
        db.close()
    from app.core import state
    if n:
        log.info("knowledge base present (%s rows)", n)
        state.SEED_STATUS = f"present ({n} rows)"
        return
    log.warning("knowledge base empty -> seeding now")
    from app.db.seed import run
    counts = run()
    state.SEED_STATUS = f"seeded {counts}"
    log.info("knowledge base seeded: %s", counts)
    if os.environ.get("SEED_DEMO_ACTIVITY", "1") == "1":
        try:
            import importlib.util, sys
            spec = importlib.util.spec_from_file_location("seed_demo_activity", os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "scripts", "seed_demo_activity.py"))
            mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
            mod.seed()
            log.info("demo activity seeded")
        except Exception:
            log.exception("demo activity seeding failed (non-fatal)")


def create_app() -> FastAPI:
    s = get_settings()
    app = FastAPI(title=s.app_name, version=s.kb_version, lifespan=lifespan, docs_url="/docs" if s.app_env != "production" else None, redoc_url=None)
    app.add_middleware(CORSMiddleware, allow_origins=s.cors_origin_list, allow_origin_regex=r"https://[a-z0-9-]+(\.[a-z0-9-]+)*\.vercel\.app", allow_credentials=False, allow_methods=["GET", "POST", "OPTIONS"], allow_headers=["Content-Type", "Accept"], expose_headers=["Content-Disposition", "X-ADR-Reference"])

    @app.middleware("http")
    async def request_log(request: Request, call_next):
        rid = uuid.uuid4().hex[:12]
        t0 = time.perf_counter()
        response = await call_next(request)
        response.headers["X-Request-ID"] = rid
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "no-referrer"
        log.info("request", extra={"request_id": rid, "path": request.url.path, "status": response.status_code, "duration_ms": round((time.perf_counter() - t0) * 1000, 1)})
        return response

    register_error_handlers(app)
    app.include_router(api_router, prefix=s.api_prefix)
    return app


app = create_app()
