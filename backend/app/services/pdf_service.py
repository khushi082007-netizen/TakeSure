"""PDF generation with ReportLab: the share-with-doctor safety summary and the ADR report.

Hindi text is embedded only when a Devanagari-capable TTF is configured (PDF_DEVANAGARI_FONT); ReportLab does not
do complex-script shaping, so the English summary is always the primary content of the PDF.
"""
from __future__ import annotations

import io
import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import KeepTogether, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.core.config import get_settings
from app.core.errors import PDFGenerationFailed
from app.schemas.check import EvaluateResponse

VERDICT_COLORS = {"GREEN": colors.HexColor("#2E7D4F"), "AMBER": colors.HexColor("#C77B16"), "RED": colors.HexColor("#B3362D"), "GREY": colors.HexColor("#6B7280")}
VERDICT_LABEL = {"GREEN": "GREEN - No known interaction", "AMBER": "AMBER - Caution, discuss with your doctor", "RED": "RED - Important: talk to your doctor before taking together", "GREY": "GREY - Not in database, could not verify"}

_hindi_font: Optional[str] = None


def _devanagari_font() -> Optional[str]:
    global _hindi_font
    if _hindi_font is not None:
        return _hindi_font or None
    path = os.environ.get("PDF_DEVANAGARI_FONT", "")
    if path and os.path.exists(path):
        try:
            pdfmetrics.registerFont(TTFont("Devanagari", path))
            _hindi_font = "Devanagari"
            return _hindi_font
        except Exception:
            pass
    _hindi_font = ""
    return None


def _styles():
    ss = getSampleStyleSheet()
    body = ParagraphStyle("body", parent=ss["BodyText"], fontName="Helvetica", fontSize=10, leading=14)
    small = ParagraphStyle("small", parent=body, fontSize=8.5, leading=11, textColor=colors.HexColor("#444444"))
    h1 = ParagraphStyle("h1", parent=ss["Title"], fontName="Helvetica-Bold", fontSize=18, leading=22, alignment=TA_LEFT, spaceAfter=4)
    h2 = ParagraphStyle("h2", parent=ss["Heading2"], fontName="Helvetica-Bold", fontSize=12, leading=15, spaceBefore=10, spaceAfter=4, textColor=colors.HexColor("#1F3D2E"))
    return body, small, h1, h2


def _esc(t: Any) -> str:
    return str(t).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(colors.HexColor("#555555"))
    canvas.drawString(18 * mm, 10 * mm, f"TakeSure - decision support, not diagnosis. Generated {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}. Page {doc.page}")
    canvas.restoreState()


def build_safety_summary(result: EvaluateResponse) -> bytes:
    try:
        body, small, h1, h2 = _styles()
        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm, topMargin=16 * mm, bottomMargin=18 * mm, title="TakeSure safety summary")
        story: List[Any] = []
        story.append(Paragraph("TakeSure safety summary", h1))
        story.append(Paragraph(f"Knowledge base v{_esc(result.kb_version)} · Query #{result.query_id} · Verdict from published data; AI only explains.", small))
        story.append(Spacer(1, 6))
        vc = VERDICT_COLORS[result.verdict]
        banner = Table([[Paragraph(f"<font color='white'><b>{_esc(VERDICT_LABEL[result.verdict])}</b></font>", body)]], colWidths=[174 * mm])
        banner.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), vc), ("LEFTPADDING", (0, 0), (-1, -1), 8), ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7)]))
        story.append(banner)
        story.append(Paragraph(_esc(result.verdict_reason), body))

        story.append(Paragraph("What was checked", h2))
        rows = [["Allopathic medicines", ", ".join(f"{d.name} ({d.detail})" for d in result.drugs) or "-"], ["Ayurvedic herbs / products", ", ".join(f"{h.name} ({h.detail})" for h in result.herbs) or "-"]]
        if result.unrecognised:
            rows.append(["Not in database", ", ".join(result.unrecognised)])
        t = Table([[Paragraph(f"<b>{_esc(a)}</b>", body), Paragraph(_esc(b), body)] for a, b in rows], colWidths=[48 * mm, 126 * mm])
        t.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LINEBELOW", (0, 0), (-1, -1), 0.3, colors.HexColor("#DDDDDD"))]))
        story.append(t)

        story.append(Paragraph("Plain-language summary", h2))
        story.append(Paragraph(_esc(result.explanation.summary_en), body))
        font = _devanagari_font()
        if font:
            story.append(Spacer(1, 3))
            story.append(Paragraph(_esc(result.explanation.summary_hi), ParagraphStyle("hi", parent=body, fontName=font)))
        if result.explanation.timing_gap:
            story.append(Paragraph(f"<b>Timing:</b> {_esc(result.explanation.timing_gap)}", body))
        origin = "AI explanation (grounded on matched records only)" if result.explanation.origin == "llm" else "Explanation generated directly from the knowledge base record"
        story.append(Paragraph(_esc(origin), small))

        if result.interactions:
            story.append(Paragraph("Matched evidence", h2))
            for m in result.interactions:
                block = [
                    Paragraph(f"<b>{_esc(m.herb.name)} × {_esc(m.drug.name)}</b> — {m.verdict} · severity {m.severity} · evidence grade {m.evidence_grade} · record {m.code}", body),
                    Paragraph(f"<b>Mechanism:</b> {_esc(m.mechanism)}", body),
                    Paragraph(f"<b>Effect:</b> {_esc(m.effect)}", body),
                    Paragraph(f"<b>What doctors usually do:</b> {_esc(m.management)}", body),
                ]
                if m.timing_gap_hours:
                    block.append(Paragraph(f"<b>Timing gap:</b> {m.timing_gap_hours:g} hours", body))
                if m.population_flags:
                    block.append(Paragraph(f"<b>Extra caution for:</b> {_esc(', '.join(m.population_flags))}", body))
                for s in m.sources:
                    ref = " · ".join(x for x in [f"DOI {s.doi}" if s.doi else "", f"PMID {s.pmid}" if s.pmid else "", s.url or ""] if x)
                    block.append(Paragraph(f"Source: {_esc(s.title)}{(' (' + str(s.year) + ')') if s.year else ''}. {_esc(ref)} [{_esc(s.verification_status.replace('_', ' '))}]", small))
                block.append(Paragraph(f"Rule applied: {_esc(m.rule_applied)}", small))
                block.append(Spacer(1, 6))
                story.append(KeepTogether(block))

        story.append(Paragraph("Questions to ask your doctor", h2))
        for i, q in enumerate(result.explanation.doctor_questions, 1):
            story.append(Paragraph(f"{i}. {_esc(q)}", body))

        story.append(Paragraph("Important", h2))
        story.append(Paragraph(_esc(result.disclaimer), body))
        doc.build(story, onFirstPage=_footer, onLaterPages=_footer)
        return buf.getvalue()
    except Exception as exc:  # pragma: no cover
        raise PDFGenerationFailed("The PDF could not be generated. Please retry.", {"reason": str(exc)[:200]}) from exc


def build_adr_report(adr: Dict[str, Any]) -> bytes:
    """Suspected-ADR report laid out in the field order of the Ministry of Ayush pharmacovigilance reporting form."""
    try:
        body, small, h1, h2 = _styles()
        s = get_settings()
        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm, topMargin=16 * mm, bottomMargin=18 * mm, title="Suspected ADR report (ASU&H drugs)")
        story: List[Any] = []
        story.append(Paragraph("Suspected adverse drug reaction report — ASU&amp;H drugs", h1))
        story.append(Paragraph(f"Prepared with TakeSure · Reference {_esc(adr['reference'])} · {_esc(adr['ts'])}. For submission by the reporter through the Ministry of Ayush pharmacovigilance network / Ayush Suraksha portal ({_esc(s.ayush_suraksha_url)}). TakeSure does not submit this report on your behalf.", small))

        def section(title: str, rows: List[List[str]]):
            story.append(Paragraph(title, h2))
            t = Table([[Paragraph(f"<b>{_esc(a)}</b>", body), Paragraph(_esc(b if b not in (None, "") else "-"), body)] for a, b in rows], colWidths=[60 * mm, 114 * mm])
            t.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#CCCCCC")), ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#F2F6F3"))]))
            story.append(t)

        section("A. Patient information (no identifiers collected)", [["Age group", adr.get("patient_age_group")], ["Sex", adr.get("patient_sex")], ["State / UT", adr.get("state")]])
        section("B. Suspected ASU&H product", [["Product name", adr["product"]], ["Manufacturer", adr.get("product_manufacturer")], ["Batch / lot", adr.get("product_batch")]])
        section("C. Concomitant allopathic medicines", [["Medicines", ", ".join(adr.get("drugs") or []) or "-"]])
        section("D. Adverse reaction", [["Description", adr["reaction"]], ["Date of onset", adr.get("onset_date")], ["Seriousness", adr.get("seriousness")], ["Outcome", adr.get("outcome")]])
        section("E. Reporter", [["Reporter type", adr["reporter_type"]], ["Reported via", "TakeSure (self-generated form, exported as PDF)"]])
        story.append(Spacer(1, 10))
        story.append(Paragraph("This form mirrors the field structure of the Ministry of Ayush suspected-ADR reporting form so it can be transcribed or attached when reporting to a Peripheral Pharmacovigilance Centre or on the Ayush Suraksha portal. Report filing is done by the reporter; this document is an aid.", small))
        doc.build(story, onFirstPage=_footer, onLaterPages=_footer)
        return buf.getvalue()
    except Exception as exc:  # pragma: no cover
        raise PDFGenerationFailed("The ADR PDF could not be generated. Please retry.", {"reason": str(exc)[:200]}) from exc
