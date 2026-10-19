# TakeSure — Architecture

TakeSure is a web application that checks whether an Ayurvedic herb or branded product is known to interact
with a patient's prescription medicines. Its design principle is a hard separation between **deciding**
(deterministic rules over a cited knowledge base) and **explaining** (an optional LLM that may only rewrite
matched rows for a patient).

```
┌─────────────────────────────┐        HTTPS/JSON        ┌──────────────────────────────────────────────┐
│  Frontend  (Next.js 16)     │ ───────────────────────► │  Backend  (FastAPI, Python 3.12)             │
│  /check  /review  /results  │ ◄─────────────────────── │  /api/*                                      │
│  /knowledge-base  /adr ...  │                          │                                              │
│  sessionStorage only        │                          │  core/      config · errors · security       │
└─────────────────────────────┘                          │  api/routes check · interactions · explain   │
                                                         │             adr · report · demo · health     │
                                                         │  services/  ocr → extraction → matching      │
                                                         │             interaction (rule engine)        │
                                                         │             llm (grounded explainer)         │
                                                         │             pdf · adr · kb · demo            │
                                                         │  models/    SQLAlchemy (KB + ops tables)     │
                                                         └───────┬──────────────┬──────────────┬────────┘
                                                                 │              │              │
                                                     ┌───────────▼──┐   ┌───────▼───────┐  ┌───▼──────────┐
                                                     │ PostgreSQL / │   │ Tesseract/Groq│  │ LLM provider │
                                                     │ Supabase     │   │ local, CPU    │  │ (optional)   │
                                                     │ (SQLite dev) │   │ + RapidOCR    │  │ none/Claude/ │
                                                     └──────────────┘   └───────────────┘  │ Gemini/Llama │
                                                                                            └──────────────┘
```

## Request flow: Scan → Match → Explain → Report

```
 photo/PDF ──► POST /check/upload ──► temp file (random id, MIME sniffed, ≤8 MB)
                                          │
                     POST /check/extract  ▼
                     OCR (Tesseract or Groq vision) → raw text → tokenizer (strip "Tab.", "50 mcg", "1-0-0")
                                          │
                                          ▼
                     RapidFuzz over DB dictionary (brands, generics, synonyms, products)
                        ≥85 accepted · 70–85 needs_confirmation · <70 unrecognised
                                          │  (file deleted here)
            user reviews / edits / adds   ▼   POST /check/resolve for manual text
                                          │
                     POST /check/evaluate ▼
                     for each herb × drug pair: lookup rows by drug, else by class, else "*"
                     rule engine R1–R5 → per-row verdict → overall = max(RED>AMBER>GREEN)
                     unrecognised present & no risk row → GREY (never GREEN)
                                          │
                                          ▼
                     llm_service.explain(matched rows only) → strict JSON → Pydantic validation
                        on any failure → deterministic KB text (origin = kb_fallback)
                                          │
                                          ▼
                     EvaluateResponse (verdict, pairs, interactions, explanation, disclaimer, kb_version)
                                          │
                     POST /report/pdf  ◄───┘  ReportLab safety summary
                     POST /adr/pdf            ReportLab suspected-ADR report (Ministry field order)
```

## Components

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind 4 | Client components talk to the API through `lib/api.ts`, which normalises every failure to a typed `ApiClientError`. State for the 3-step flow lives in `sessionStorage`; nothing else is stored in the browser. |
| API | FastAPI + Pydantic v2 | Uniform error envelope `{"error": {code, message, detail, retryable}}`; CORS allow-list; security headers; hashed-IP sliding-window rate limit; JSON request logging with request ids. |
| OCR | Tesseract (local) + Groq vision (optional) | `ocr_service.TesseractEngine` runs the installed Tesseract binary (auto-detected; `eng+hin` when `backend/tessdata/hin.traineddata` exists) after Pillow pre-processing. `GroqVisionEngine` sends the image to a multimodal Llama model when a Groq key is configured. `OCR_ENGINE=auto|tesseract|groq_vision|none` picks the chain; the engine used is reported in every response and the next engine is tried on failure. Timeout enforced via a worker thread. |
| Matching | RapidFuzz `WRatio` | Dictionary built from the DB and cached (TTL). Exact match first; fuzzy with length-ratio guard and short-term protection; thresholds configurable. |
| Rule engine | Pure Python | `interaction_service.py`; see `docs/methodology.md` for the rule table. No model involvement. Writes an anonymised `queries_log` row. |
| Explainer | httpx to Anthropic / Gemini / OpenAI-compatible | Translator-only system prompt; facts limited to KB fields; output must be strict JSON with exactly 3 doctor questions; forbidden-pattern filter (dosing, "stop taking", Hindi equivalents). |
| PDF | ReportLab | Safety summary and ADR report; Devanagari font configurable. |
| Database | PostgreSQL / Supabase (SQLite for dev & tests) | Schema in `database/migrations/001_init.sql`; models in `backend/app/models`; seed in `backend/app/db/seed_data.py` with a validator that rejects unsourced rows. |

## Data model (knowledge base)

```
herbs ──< herb_synonyms            drugs ──< drug_brands
  │                                  │
  │                                  │
  └──< interactions >── drug_id ─────┘      (or drug_class, incl. "*" wildcard; exactly one of the two)
            │
            └──< interaction_sources   (title, type, doi, pmid, url, year, verification_status)

products ──< product_herbs >── herbs      (branded product → constituent herbs)

queries_log (anonymised)   adr_reports (consent-gated)   feedback
```

## Security & privacy controls

- Uploads: MIME sniffed from magic bytes (not the client header), size-capped, stored under a random id in a
  temp dir, **deleted after text extraction**; a TTL sweeper removes stragglers on startup/shutdown.
- No API keys in the frontend; the LLM key lives only in backend environment variables.
- `queries_log` stores entity ids and verdicts only. ADR reports contain no name/contact fields and are stored
  only if `consent_to_store` is true.
- Rate limiting per hashed client IP; strict CORS origins; `X-Content-Type-Options`, `Referrer-Policy`,
  `X-Frame-Options` headers.

## Deployment shape

- **Frontend** → Vercel (or any Node host). Set `NEXT_PUBLIC_API_BASE_URL`.
- **Backend** → Render / Railway / Fly / a VM with Python 3.12 and the Tesseract binary installed
  (`apt-get install tesseract-ocr tesseract-ocr-hin`), or a `GROQ_API_KEY` for cloud vision OCR. Light footprint
  (no ML models bundled).
- **Database** → Supabase/PostgreSQL via `DATABASE_URL`. Apply `001_init.sql`, run `scripts/seed.py`.
- `docker-compose.yml` at the repo root starts all three locally.
