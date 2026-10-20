from typing import Any, Dict, Literal, Optional

from pydantic import BaseModel, Field

Verdict = Literal["GREEN", "AMBER", "RED", "GREY"]
Severity = Literal["minor", "moderate", "major"]
EvidenceGrade = Literal["A", "B", "C"]
Language = Literal["en", "hi"]
EntityKind = Literal["drug", "herb"]


class ErrorBody(BaseModel):
    code: str
    message: str
    detail: Dict[str, Any] = Field(default_factory=dict)
    retryable: bool = False


class ErrorResponse(BaseModel):
    error: ErrorBody


class HealthResponse(BaseModel):
    status: Literal["ok", "degraded"]
    app_env: str
    kb_version: str
    database: Literal["ok", "unavailable"]
    ocr_engine: str
    ocr_available: bool = False
    ocr_detail: Dict[str, Any] = Field(default_factory=dict)
    llm_provider: str
    llm_model: Optional[str] = None
    interactions_active: Optional[int] = None
    tinyfish_configured: bool = False
    db_dialect: Optional[str] = None
    seed_status: Optional[str] = None
    seed_error: Optional[str] = None
