from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class ADRCreate(BaseModel):
    """Mirrors the fields of the Ministry of Ayush suspected-ADR reporting form (reporter, patient, product, reaction, outcome)."""
    product: str = Field(min_length=2, max_length=256)
    product_manufacturer: Optional[str] = Field(default=None, max_length=128)
    product_batch: Optional[str] = Field(default=None, max_length=64)
    drugs: List[str] = Field(default_factory=list, max_length=20)
    reaction: str = Field(min_length=5, max_length=2000)
    onset_date: Optional[str] = Field(default=None, max_length=32)
    outcome: Literal["recovered", "recovering", "not_recovered", "recovered_with_sequelae", "fatal", "unknown"]
    seriousness: Optional[Literal["not_serious", "hospitalisation", "life_threatening", "disability", "other_medically_important"]] = None
    patient_age_group: Optional[Literal["child", "adult", "elderly"]] = None
    patient_sex: Optional[Literal["female", "male", "other", "undisclosed"]] = None
    reporter_type: Literal["patient", "caregiver", "pharmacist", "doctor_mbbs", "doctor_bams", "other"]
    state: Optional[str] = Field(default=None, max_length=64)
    consent_to_store: bool = True


class ADRResponse(BaseModel):
    id: int
    reference: str
    status: str
    official_portal_url: str
    note: str


class FeedbackCreate(BaseModel):
    issue_type: Literal["wrong_severity", "wrong_source", "missing_interaction", "ocr_error", "translation", "other"]
    description: str = Field(min_length=5, max_length=2000)
    interaction_code: Optional[str] = Field(default=None, max_length=64)
    page: Optional[str] = Field(default=None, max_length=64)


class FeedbackResponse(BaseModel):
    id: int
    status: str
