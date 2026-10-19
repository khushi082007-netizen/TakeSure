"""Centralised configuration. Every tunable lives here; nothing is hard-coded in services."""
import os
import tempfile
from functools import lru_cache
from typing import List, Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _default_upload_dir() -> str:
    return os.path.join(tempfile.gettempdir(), "takesure_uploads")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # --- App ---
    app_name: str = "TakeSure API"
    app_env: Literal["development", "test", "production"] = "development"
    api_prefix: str = "/api"
    kb_version: str = "1.0.0"
    log_level: str = "INFO"

    # --- Database ---
    # PostgreSQL in deployment (Supabase works out of the box). SQLite is the zero-setup local default.
    database_url: str = "sqlite:///./takesure_dev.db"

    # --- CORS ---
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    # --- Uploads ---
    max_upload_mb: int = 8
    allowed_upload_mime: str = "image/jpeg,image/png,image/webp,application/pdf"
    upload_tmp_dir: str = _default_upload_dir()
    upload_ttl_seconds: int = 900  # uploaded files are deleted after this

    # --- OCR / document reading ---
    # auto        -> Groq vision when a Groq key is configured, otherwise local Tesseract
    # tesseract   -> local Tesseract only (offline)
    # groq_vision -> Groq multimodal model (needs GROQ_API_KEY / LLM_API_KEY); falls back to Tesseract
    # none        -> photo reading disabled; manual entry only
    ocr_engine: Literal["auto", "tesseract", "groq_vision", "none"] = "auto"
    tesseract_cmd: str = ""          # full path to tesseract.exe; auto-detected when empty
    tessdata_dir: str = ""           # folder with *.traineddata; auto-detected when empty
    tesseract_langs: str = "eng+hin"  # 'hin' is used only if hin.traineddata is present
    ocr_vision_model: str = "meta-llama/llama-4-scout-17b-16e-instruct"
    ocr_timeout_seconds: int = 90

    # --- Fuzzy matching thresholds (from roadmap §4.1) ---
    match_accept_threshold: int = 85
    match_confirm_threshold: int = 70

    # --- LLM (explainer only) ---
    # Set GROQ_API_KEY and everything switches on (provider -> openai_compatible, Groq base URL).
    llm_provider: Literal["none", "anthropic", "gemini", "openai_compatible"] = "none"
    llm_api_key: str = ""
    groq_api_key: str = ""
    llm_model: str = ""
    llm_base_url: str = ""  # for openai_compatible providers (Groq, Together, etc.)
    llm_timeout_seconds: int = 25

    # --- TinyFish (evidence curation only; never on the verdict path) ---
    # Set TINYFISH_API_KEY and the curation tools switch on: Fetch API verifies citations, Search API finds
    # product pages, the Web Agent drafts knowledge-base rows from monographs. Every draft needs human approval.
    tinyfish_api_key: str = ""
    tinyfish_agent_base_url: str = "https://agent.tinyfish.ai"
    tinyfish_fetch_url: str = "https://api.fetch.tinyfish.ai"
    tinyfish_search_url: str = "https://api.search.tinyfish.ai"
    tinyfish_timeout_seconds: int = 120
    tinyfish_agent_max_steps: int = 40  # informational only; agent_config is a TinyFish beta feature and is not sent
    tinyfish_agent_max_wait_seconds: int = 600
    tinyfish_agent_poll_seconds: int = 5
    tinyfish_search_pace_seconds: float = 1.2
    tinyfish_verify_threshold: float = 0.6  # share of distinctive title tokens that must appear on the fetched page

    # --- Rate limiting (simple in-memory sliding window) ---
    rate_limit_per_minute: int = 60

    # --- Official reporting destination (link only; no fake submission) ---
    ayush_suraksha_url: str = "https://ayushsuraksha.com"

    # ------------------------------------------------------------------ derived
    @property
    def cors_origin_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def allowed_mime_list(self) -> List[str]:
        return [m.strip() for m in self.allowed_upload_mime.split(",") if m.strip()]

    @property
    def effective_llm_provider(self) -> str:
        """A Groq key alone is enough to switch the explainer on."""
        if self.llm_provider == "none" and self.groq_api_key:
            return "openai_compatible"
        return self.llm_provider

    @property
    def effective_llm_key(self) -> str:
        return self.llm_api_key or self.groq_api_key

    @property
    def effective_llm_base_url(self) -> str:
        return (self.llm_base_url or "https://api.groq.com/openai/v1").rstrip("/")

    @property
    def groq_key(self) -> str:
        """Key usable for Groq vision OCR: explicit Groq key, or an openai_compatible key pointed at Groq."""
        if self.groq_api_key:
            return self.groq_api_key
        if self.llm_provider == "openai_compatible" and "groq.com" in self.effective_llm_base_url and self.llm_api_key:
            return self.llm_api_key
        return ""

    @field_validator("match_accept_threshold", "match_confirm_threshold")
    @classmethod
    def _bounds(cls, v: int) -> int:
        if not 0 <= v <= 100:
            raise ValueError("thresholds must be between 0 and 100")
        return v


@lru_cache
def get_settings() -> Settings:
    return Settings()
