"""ADR report creation. We store the structured report (if consented) and export a PDF.
We do NOT submit to any government system: no official API exists, so the user is pointed to the official portal."""
from __future__ import annotations

import secrets
from datetime import datetime, timezone
from typing import Any, Dict

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.errors import NotFound
from app.models.ops import ADRReport
from app.schemas.adr import ADRCreate

NOTE = (
    "Your report has been generated as a PDF in the Ministry of Ayush suspected-ADR field format. TakeSure does not file it for you: "
    "please submit it through the Ayush Suraksha portal or your nearest Pharmacovigilance Centre, or hand it to your doctor/pharmacist."
)


def _reference() -> str:
    return "ADR-" + datetime.now(timezone.utc).strftime("%Y%m%d") + "-" + secrets.token_hex(3).upper()


def create_report(db: Session, payload: ADRCreate) -> ADRReport:
    report = ADRReport(
        reference=_reference(), product=payload.product, product_manufacturer=payload.product_manufacturer, product_batch=payload.product_batch,
        drugs=payload.drugs, reaction=payload.reaction, onset_date=payload.onset_date, outcome=payload.outcome, seriousness=payload.seriousness,
        patient_age_group=payload.patient_age_group, patient_sex=payload.patient_sex, reporter_type=payload.reporter_type, state=payload.state,
    )
    report.status = "exported_for_official_submission"
    if payload.consent_to_store:
        db.add(report)
        db.flush()
    else:
        report.id = 0  # not persisted; PDF-only
        report.ts = datetime.now(timezone.utc)
    return report


def report_to_dict(r: ADRReport) -> Dict[str, Any]:
    return {
        "reference": r.reference, "ts": (r.ts or datetime.now(timezone.utc)).strftime("%Y-%m-%d %H:%M UTC"), "product": r.product, "product_manufacturer": r.product_manufacturer,
        "product_batch": r.product_batch, "drugs": r.drugs, "reaction": r.reaction, "onset_date": r.onset_date, "outcome": r.outcome, "seriousness": r.seriousness,
        "patient_age_group": r.patient_age_group, "patient_sex": r.patient_sex, "reporter_type": r.reporter_type, "state": r.state,
    }


def get_report(db: Session, reference: str) -> ADRReport:
    r = db.query(ADRReport).filter(ADRReport.reference == reference).first()
    if not r:
        raise NotFound("ADR report not found.", {"reference": reference})
    return r


def official_portal_url() -> str:
    return get_settings().ayush_suraksha_url
