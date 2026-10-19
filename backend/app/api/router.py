from fastapi import APIRouter

from app.api.routes import adr, analytics, check, curation, demo, explain, health, interactions, report

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(check.router)
api_router.include_router(interactions.router)
api_router.include_router(explain.router)
api_router.include_router(adr.router)
api_router.include_router(report.router)
api_router.include_router(demo.router)
api_router.include_router(analytics.router)
api_router.include_router(curation.router)
