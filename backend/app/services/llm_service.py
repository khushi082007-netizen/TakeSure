"""Grounded explainer. The LLM is a translator, never a decision-maker.

Input  : ONLY the matched KB rows (already-decided verdict, mechanism, effect, management, timing, grade) + language.
Output : strict JSON validated with Pydantic. Anything invalid, unsafe or unavailable -> deterministic KB fallback.
The LLM never sees the uploaded image, raw OCR text, or the internet, and cannot change the verdict.
Providers are selected by LLM_PROVIDER (anthropic | gemini | openai_compatible | none).
"""
from __future__ import annotations

import json
import logging
import re
from typing import Any, Dict, List, Optional, Sequence

import httpx
from pydantic import BaseModel, Field, ValidationError, field_validator

from app.core.config import get_settings
from app.schemas.check import EntityOut, Explanation, MatchedInteraction

log = logging.getLogger("takesure.llm")

# Phrases that would turn an explanation into medical direction. Output containing any of these is rejected.
FORBIDDEN_PATTERNS = [
    r"\bstop (taking|your|the)\b", r"\bdiscontinue\b", r"\bdo not take\b", r"\bstart taking\b", r"\bincrease (the|your) dose\b",
    r"\breduce (the|your) dose\b", r"\b\d+\s*(mg|mcg|ml)\b", r"बंद कर", r"बन्द कर", r"लेना बंद", r"खुराक बढ़ा", r"खुराक घटा",
]


class LLMExplanation(BaseModel):
    summary_en: str = Field(min_length=20, max_length=700)
    summary_hi: str = Field(min_length=10, max_length=900)
    timing_gap: Optional[str] = Field(default=None, max_length=160)
    doctor_questions: List[str] = Field(min_length=3, max_length=3)

    @field_validator("doctor_questions")
    @classmethod
    def _q(cls, v: List[str]) -> List[str]:
        cleaned = [q.strip() for q in v if q and q.strip()]
        if len(cleaned) != 3:
            raise ValueError("exactly three doctor questions required")
        if any(len(q) > 240 for q in cleaned):
            raise ValueError("question too long")
        return cleaned


SYSTEM_PROMPT = (
    "You are a translator for TakeSure, an Indian herb-drug interaction checker. You receive FACTS that have already "
    "been decided by a curated, sourced knowledge base. Your only job is to restate those facts in simple language for a "
    "patient. Rules: (1) Use ONLY the facts provided; add nothing. (2) Never tell the patient to start, stop, or change any "
    "medicine or dose; the patient decides with their doctor. (3) Do not mention numbers that are not in the facts. "
    "(4) Write summary_en in plain English (max 3 sentences) and summary_hi in simple Hindi (Devanagari). (5) Write exactly "
    "three doctor_questions the patient can ask, grounded in the facts. (6) If facts say timing_gap_hours, set timing_gap "
    "to a plain sentence, otherwise null. (7) Reply with ONLY a JSON object with keys summary_en, summary_hi, timing_gap, "
    "doctor_questions. No markdown, no preamble."
)


def build_facts(verdict: str, interactions: Sequence[MatchedInteraction], drugs: Sequence[EntityOut], herbs: Sequence[EntityOut]) -> Dict[str, Any]:
    """The complete and only payload the LLM sees."""
    return {
        "verdict": verdict,
        "herbs": [h.name for h in herbs],
        "drugs": [d.name for d in drugs],
        "matched_records": [
            {
                "herb": m.herb.name, "drug": m.drug.name, "verdict": m.verdict, "severity": m.severity,
                "evidence_grade": m.evidence_grade, "mechanism": m.mechanism, "effect": m.effect, "management": m.management,
                "timing_gap_hours": m.timing_gap_hours, "population_flags": m.population_flags,
            }
            for m in interactions
        ],
    }


# ---------------------------------------------------------------- providers (plain HTTPS, no SDK lock-in)

def _call_anthropic(facts: Dict[str, Any], language: str) -> str:
    s = get_settings()
    body = {
        "model": s.llm_model or "claude-haiku-4-5",
        "max_tokens": 900,
        "temperature": 0,
        "system": SYSTEM_PROMPT,
        "messages": [{"role": "user", "content": f"Preferred language: {language}\nFACTS:\n{json.dumps(facts, ensure_ascii=False)}"}],
    }
    r = httpx.post("https://api.anthropic.com/v1/messages", headers={"x-api-key": s.effective_llm_key, "anthropic-version": "2023-06-01", "content-type": "application/json"}, json=body, timeout=s.llm_timeout_seconds)
    r.raise_for_status()
    data = r.json()
    return "".join(b.get("text", "") for b in data.get("content", []) if b.get("type") == "text")


def _call_gemini(facts: Dict[str, Any], language: str) -> str:
    s = get_settings()
    model = s.llm_model or "gemini-2.0-flash"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={s.effective_llm_key}"
    body = {
        "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": [{"role": "user", "parts": [{"text": f"Preferred language: {language}\nFACTS:\n{json.dumps(facts, ensure_ascii=False)}"}]}],
        "generationConfig": {"temperature": 0, "responseMimeType": "application/json", "maxOutputTokens": 900},
    }
    r = httpx.post(url, json=body, timeout=s.llm_timeout_seconds)
    r.raise_for_status()
    data = r.json()
    return "".join(p.get("text", "") for p in data["candidates"][0]["content"]["parts"])


def _call_openai_compatible(facts: Dict[str, Any], language: str) -> str:
    s = get_settings()
    base = s.effective_llm_base_url
    body = {
        "model": s.llm_model or "openai/gpt-oss-120b",
        "temperature": 0,
        "response_format": {"type": "json_object"},
        "messages": [{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": f"Preferred language: {language}\nFACTS:\n{json.dumps(facts, ensure_ascii=False)}"}],
    }
    r = httpx.post(f"{base}/chat/completions", headers={"Authorization": f"Bearer {s.effective_llm_key}"}, json=body, timeout=s.llm_timeout_seconds)
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"]


_PROVIDERS = {"anthropic": _call_anthropic, "gemini": _call_gemini, "openai_compatible": _call_openai_compatible}


# ---------------------------------------------------------------- validation

def parse_and_validate(raw: str) -> LLMExplanation:
    """Strict: JSON must parse, match the schema, and contain no directive language. Raises ValueError otherwise."""
    text = raw.strip()
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.S)
    try:
        payload = json.loads(text)
    except json.JSONDecodeError as exc:
        raise ValueError(f"LLM returned non-JSON: {exc}") from exc
    try:
        parsed = LLMExplanation.model_validate(payload)
    except ValidationError as exc:
        raise ValueError(f"LLM JSON failed schema: {exc.errors()[:3]}") from exc
    blob = " ".join([parsed.summary_en, parsed.summary_hi, parsed.timing_gap or "", *parsed.doctor_questions])
    for pat in FORBIDDEN_PATTERNS:
        if re.search(pat, blob, flags=re.I):
            raise ValueError(f"LLM output contained directive/unsafe content matching {pat!r}")
    return parsed


# ---------------------------------------------------------------- deterministic fallback (always available)

_GRADE_EN = {"A": "strong (human trials or systematic reviews)", "B": "moderate (case reports or small trials)", "C": "limited (mechanism, animal or lab studies only)"}
_GRADE_HI = {"A": "मज़बूत", "B": "मध्यम", "C": "सीमित"}
_VERDICT_HI = {"GREEN": "कोई ज्ञात गंभीर इंटरैक्शन नहीं मिला", "AMBER": "सावधानी ज़रूरी है", "RED": "महत्वपूर्ण चेतावनी", "GREY": "डेटाबेस में नहीं मिला"}


def kb_fallback(verdict: str, interactions: Sequence[MatchedInteraction], drugs: Sequence[EntityOut], herbs: Sequence[EntityOut], unrecognised: Sequence[str], notice: Optional[str]) -> Explanation:
    herb_names = ", ".join(h.name for h in herbs) or "the Ayurvedic product"
    drug_names = ", ".join(d.name for d in drugs) or "the medicine"
    timing = None
    if not interactions:
        if verdict == "GREY":
            en = f"We could not verify this combination. {len(unrecognised)} item(s) were not found in our knowledge base, so no safety verdict can be given. Show the product and prescription to your doctor or pharmacist."
            hi = f"हम इस संयोजन की पुष्टि नहीं कर सके। {len(unrecognised)} नाम हमारे डेटाबेस में नहीं मिले, इसलिए कोई सुरक्षा निर्णय नहीं दिया जा सकता। कृपया उत्पाद और पर्चा अपने डॉक्टर या फार्मासिस्ट को दिखाएँ।"
        else:
            en = f"No interaction between {herb_names} and {drug_names} is recorded in our knowledge base. This is not proof of safety; please tell your doctor everything you take."
            hi = f"{herb_names} और {drug_names} के बीच हमारे डेटाबेस में कोई इंटरैक्शन दर्ज नहीं है। यह सुरक्षा का प्रमाण नहीं है; कृपया अपने डॉक्टर को बताएं कि आप क्या-क्या लेते हैं।"
        questions = [
            f"I take {herb_names} along with {drug_names}. Is that fine for me?",
            "Are there any symptoms I should watch for when taking both?",
            "Should any of my routine tests be repeated because of this combination?",
        ]
        return Explanation(summary_en=en, summary_hi=hi, timing_gap=None, doctor_questions=questions, origin="kb_fallback", llm_provider=None, notice=notice)

    top = interactions[0]
    parts_en = [top.patient_summary_en or f"{top.herb.name} with {top.drug.name}: {top.effect} Evidence for this is {_GRADE_EN[top.evidence_grade]}."]
    if len(interactions) > 1:
        parts_en.append(f"{len(interactions) - 1} other matched record(s) are listed below.")
    parts_en.append(f"What doctors usually do: {top.management}")
    en = " ".join(parts_en)
    hi = top.patient_summary_hi or f"{top.herb.name} और {top.drug.name} साथ लेने पर: {_VERDICT_HI[top.verdict]}। इसके प्रमाण का स्तर {_GRADE_HI[top.evidence_grade]} है। कृपया यह रिपोर्ट अपने डॉक्टर को दिखाएँ और नीचे दिए प्रश्न पूछें।"
    gaps = [m for m in interactions if m.timing_gap_hours]
    if gaps:
        g = gaps[0]
        timing = f"Keep about {g.timing_gap_hours:g} hours between {g.herb.name} and {g.drug.name}."
    questions = [
        f"I take {top.herb.name} with {top.drug.name}. The checker says: {top.effect} Does this apply to me?",
        f"Doctors sometimes do this: {top.management} Is that needed in my case?",
        "What symptoms or test changes should make me contact you?",
    ]
    return Explanation(summary_en=en[:1200], summary_hi=hi[:1500], timing_gap=timing, doctor_questions=[q[:240] for q in questions], origin="kb_fallback", llm_provider=None, notice=notice)


# ---------------------------------------------------------------- entry point

def explain(verdict: str, interactions: Sequence[MatchedInteraction], drugs: Sequence[EntityOut], herbs: Sequence[EntityOut], unrecognised: Sequence[str], language: str) -> Explanation:
    s = get_settings()
    unavailable = "AI explanation is temporarily unavailable. The safety result above is generated from the curated knowledge base."
    provider = s.effective_llm_provider
    if provider == "none" or not s.effective_llm_key:
        return kb_fallback(verdict, interactions, drugs, herbs, unrecognised, notice=None if provider == "none" else unavailable)
    if not interactions:
        # Nothing to translate; the fixed not-found / no-record messages are safer than a generated one.
        return kb_fallback(verdict, interactions, drugs, herbs, unrecognised, notice=None)
    facts = build_facts(verdict, interactions, drugs, herbs)
    try:
        raw = _PROVIDERS[provider](facts, language)
        parsed = parse_and_validate(raw)
    except (httpx.HTTPError, KeyError, ValueError) as exc:
        log.warning("LLM explainer failed, using KB fallback: %s", str(exc)[:300])
        return kb_fallback(verdict, interactions, drugs, herbs, unrecognised, notice=unavailable)
    return Explanation(summary_en=parsed.summary_en, summary_hi=parsed.summary_hi, timing_gap=parsed.timing_gap, doctor_questions=parsed.doctor_questions, origin="llm", llm_provider=("groq" if provider == "openai_compatible" and "groq.com" in s.effective_llm_base_url else provider), notice=None)
