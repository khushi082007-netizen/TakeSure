"""Typed application errors -> predictable JSON error envelope.

Every error response has the shape:
  {"error": {"code": "OCR_FAILED", "message": "...", "detail": {...}, "retryable": true}}
The frontend keys its UI states on `code`.
"""
import logging
from typing import Any, Dict, Optional

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


class AppError(Exception):
    status_code = 400
    code = "BAD_REQUEST"
    retryable = False

    def __init__(self, message: str, detail: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.detail = detail or {}


class ValidationFailed(AppError):
    status_code = 422
    code = "VALIDATION_FAILED"


class UnsupportedFile(AppError):
    status_code = 415
    code = "UNSUPPORTED_FILE"


class FileTooLarge(AppError):
    status_code = 413
    code = "FILE_TOO_LARGE"


class UploadNotFound(AppError):
    status_code = 404
    code = "UPLOAD_NOT_FOUND"


class OCRUnavailable(AppError):
    status_code = 503
    code = "OCR_UNAVAILABLE"
    retryable = True


class OCRFailed(AppError):
    status_code = 502
    code = "OCR_FAILED"
    retryable = True


class NoTextDetected(AppError):
    status_code = 422
    code = "NO_TEXT_DETECTED"


class NotFound(AppError):
    status_code = 404
    code = "NOT_FOUND"


class RateLimited(AppError):
    status_code = 429
    code = "RATE_LIMITED"
    retryable = True


class PDFGenerationFailed(AppError):
    status_code = 500
    code = "PDF_GENERATION_FAILED"
    retryable = True


class DatabaseUnavailable(AppError):
    status_code = 503
    code = "DATABASE_UNAVAILABLE"
    retryable = True


def _envelope(code: str, message: str, detail: Any = None, retryable: bool = False) -> Dict[str, Any]:
    return {"error": {"code": code, "message": message, "detail": detail or {}, "retryable": retryable}}


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def _app_error(_: Request, exc: AppError):
        return JSONResponse(status_code=exc.status_code, content=_envelope(exc.code, exc.message, exc.detail, exc.retryable))

    @app.exception_handler(RequestValidationError)
    async def _validation(_: Request, exc: RequestValidationError):
        return JSONResponse(status_code=422, content=_envelope("VALIDATION_FAILED", "Request did not match the expected schema.", {"errors": exc.errors()}))

    @app.exception_handler(StarletteHTTPException)
    async def _http(_: Request, exc: StarletteHTTPException):
        return JSONResponse(status_code=exc.status_code, content=_envelope("HTTP_ERROR", str(exc.detail)))

    @app.exception_handler(Exception)
    async def _unhandled(_: Request, exc: Exception):  # pragma: no cover
        logging.getLogger("takesure").exception("unhandled error")
        return JSONResponse(status_code=500, content=_envelope("INTERNAL_ERROR", "An unexpected error occurred on the server. Please retry.", retryable=True))
