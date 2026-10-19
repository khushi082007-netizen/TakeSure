# AI safety design — "Verdict from published data; AI only explains."

## The boundary

| Decides | Explains |
|---|---|
| Which herbs and medicines were recognised (RapidFuzz + user confirmation) | — |
| Which knowledge-base rows apply (SQL lookup) | — |
| Severity, evidence grade, timing gap, population flags (stored in the KB with sources) | — |
| Per-row and overall verdict (rules R1–R5) | — |
| — | Plain-language Hindi/English summary of the matched rows |
| — | Three questions for the doctor |

The language model never sees the raw prescription or label photos, never sees the OCR text, and never chooses
or ranks interactions. It receives a compact JSON of the already-decided facts (`llm_service.build_facts`) and
a system prompt that defines it as a translator.

## Why an LLM at all

Patients and caregivers in India read Hindi and other languages more comfortably than pharmacology prose. A
translator that rewrites "CYP3A4 induction reduces tacrolimus exposure" as "this herb can make the transplant
medicine weaker" is valuable — as long as it cannot invent or remove a risk.

## Controls

1. **Facts-only input.** Only fields from matched KB rows are sent; unmatched herbs/medicines are listed as
   "not in knowledge base" so the model cannot speculate about them.
2. **Strict JSON contract.** `{summary_hi, summary_en, timing_gap, doctor_questions[3]}`; parsed and validated
   with Pydantic. Markdown fences are stripped, anything else fails.
3. **Exactly three doctor questions.** More or fewer → reject.
4. **Forbidden-content filter.** Regexes catch directive language in English and Hindi: "stop taking",
   "discontinue", "do not take", "increase/reduce the dose", any `N mg/mcg/ml`, "बंद कर", "खुराक बढ़ा/घटा" → reject.
5. **Deterministic fallback.** On any failure (provider down, timeout, invalid JSON, filter hit) the response
   uses the KB's own `patient_summary_en/hi` and templated text, `explanation.origin = "kb_fallback"`, with a
   notice shown to the user. The verdict is byte-for-byte identical either way.
6. **Provider-agnostic.** `LLM_PROVIDER=none|anthropic|gemini|openai_compatible`. The default is `none`, so the
   system is fully functional with no AI vendor configured.
7. **Transparency.** The result page shows "Explained by: AI explainer / deterministic knowledge-base text" and
   a "Why this verdict?" panel listing the rule fired for every row (`rule_applied`).
8. **Validation under test.** `tests/test_llm_validation.py` covers valid output, wrong question count,
   dosing/stop-taking leakage, malformed JSON and fallback behaviour.

## What the model is told (summary of the system prompt)

- You are a translator for a patient safety tool; you do not have medical judgement.
- Use only the facts provided; do not add interactions, mechanisms, doses or timing.
- Never tell the user to start, stop or change any medicine; direct them to their doctor.
- Output strict JSON only, in the schema given.

## Residual risks and mitigations

| Risk | Mitigation |
|---|---|
| Model paraphrases a moderate risk as trivial | Verdict pill, severity and evidence grade are rendered from the KB, not from the summary; the summary is clearly secondary on the page. |
| Hindi translation nuance | KB rows carry human-written `patient_summary_hi` for key interactions; users can report translation problems via the feedback form. |
| Prompt injection via OCR text | OCR text is never sent to the model. |
| Over-trust in a Green result | Green copy says "no known interaction in knowledge base vX"; unknown items force GREY; limitations are stated on About, How-it-works and in the PDF disclaimer. |
