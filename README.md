# TakeSure

**Confidence before taking something** — Ayurvedic herb × prescription-medicine interaction checker.
*Verdict from published data; AI only explains.*

> **Kritical Hacks 2026 (AssetMerkle IGDTUW) · AI/ML track · Team Bug Hunters** — Dhriti Garg, Shiwani Goyal, Khushi Gupta
> · **Live prototype: https://take-sure.vercel.app** · API health: https://takesure-api.onrender.com/api/health · Demo video: _link added at submission_ · Social post: _link added at submission_
> · TinyFish is used for evidence curation (citation verification, monograph extraction, product mapping) — see [TinyFish evidence curation](#tinyfish-evidence-curation-offline-from-the-verdict-path).

Built by **Team Bug Hunters**. Evidence curation is assisted by **TinyFish** (citation verification, monograph extraction, product mapping) and is kept entirely off the verdict path.

Patients routinely take Ashwagandha, Giloy, Guggul or Chyawanprash alongside thyroid, diabetes, blood-thinning
or transplant medicines — and rarely tell their doctor. TakeSure reads a prescription and a product label,
matches them against a curated, cited knowledge base, applies deterministic rules to produce a
**GREEN / AMBER / RED / NOT-IN-DATABASE** verdict, and uses an (optional, sandboxed) language model only to
explain that verdict in plain Hindi or English — plus three questions to ask the doctor, a PDF for the clinic,
a Ministry-of-Ayush-format suspected-ADR report, and an anonymised pharmacovigilance dashboard.

```
Scan (Tesseract / vision OCR) → Match (RapidFuzz + user confirmation) → Decide (rule engine over the KB) → Explain (AI translates only) → Report (PDF / ADR / dashboard)
```

## TinyFish evidence curation (offline from the verdict path)

TinyFish is the research assistant behind the knowledge base. It never runs at check time and never decides a verdict.

| Job | TinyFish API | What it does | Where it lands |
|---|---|---|---|
| Verify citations | Fetch (page → Crossref) + Search | Stage 1 fetches the resolved page; stage 2 fetches the Crossref record for DOIs that publishers bot-block; stage 3 searches the title for sources without a locator. ≥ 60 % of distinctive title terms matched (≥ 80 % for search hits) → `verification_status = verified`, otherwise a *mismatch* draft with the best candidate | `curation_drafts` (kind `verify`) |
| Discover rows | Fetch + rules, Web Agent fallback | Fetches the monograph (MSKCC About Herbs by default), extracts every clinical bullet that names a drug, drug class or interaction verb from our drug dictionary; if the static page yields nothing, a Web Agent run with a JSON `output_schema` takes over | `curation_drafts` (kind `discover`, status `pending`) |
| Map a product | Search + Web Agent | Finds the product page, extracts the ingredient list, matches it to known herbs | `curation_drafts` (kind `product`, status `pending`) |

Every draft keeps its source URL, TinyFish run id and step count, and waits for a reviewer (`/api/curation/drafts/{id}/approve` or `/reject`).
The dashboard's **Evidence curation** panel exposes all three jobs and the draft queue.

Set `TINYFISH_API_KEY` in `backend/.env` (key from https://agent.tinyfish.ai/api-keys). Without it the checker works unchanged and the panel shows *not configured*.
Routes: `GET /api/curation/status`, `POST /api/curation/verify-sources`, `POST /api/curation/discover`, `POST /api/curation/map-product`, `GET /api/curation/drafts`.
Tests (`tests/test_tinyfish_curation.py`) use an `httpx.MockTransport`, so the suite stays offline.

First live run (19 Oct 2026): 55 of 78 citations verified automatically (page, Crossref or search); the 23 remaining include three broken MSKCC links and bot-blocked publisher pages, listed as mismatch drafts for a reviewer. Discover found 7 candidate interactions for ashwagandha and 4 for turmeric in seconds; the Dabur Giloy Ghanvati page was mapped to its herb in one Agent run.

## Quick start (Windows)

Requirements: Python 3.12+, Node 20+. Tesseract is installed automatically by `setup.ps1` (via winget).

```powershell
.\setup.ps1        # one time: venv + pip, npm install, seed knowledge base + demo activity, Tesseract + Hindi OCR data
.\start-dev.ps1    # opens two windows (backend :8000, frontend :3000) and your browser
.\start-silent.ps1 # same, but with NO visible windows (logs in .\logs\); stop with .\stop-servers.ps1
```

Manual equivalent:

```powershell
# backend
cd backend
python -m venv .venv ; .\.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python scripts\seed.py                 # creates tables, validates & loads KB v1.0.0
python scripts\seed_demo_activity.py   # optional: demo queries/ADRs so the dashboard isn't empty
uvicorn app.main:app --reload --port 8000     # http://localhost:8000/docs

# frontend (new terminal)
cd frontend
npm install
echo NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api > .env.local
npm run dev                                   # http://localhost:3000
```

### macOS / Linux

Same steps with `python3 -m venv .venv && source .venv/bin/activate`, `cp .env.example .env` and `python scripts/seed.py`. For photo reading install Tesseract with the Hindi pack: `brew install tesseract tesseract-lang` (macOS) or `sudo apt install tesseract-ocr tesseract-ocr-hin` (Debian/Ubuntu); it is picked up from `PATH`. Typing the names works without Tesseract.

### Docker (any OS)

```bash
docker compose up --build      # PostgreSQL + API (Tesseract eng+hin included) on :8000 + site on :3000
```

Keys are optional: without `GROQ_API_KEY` the explainer uses the deterministic knowledge-base text, and without `TINYFISH_API_KEY` the curation panel shows "not configured". Verdicts never depend on either key.

### If the site says "cannot reach the server"

The web app is running but the API is not. Open a second terminal in `backend/` and run `.
un_backend.ps1` — it reuses a
healthy backend on 8000 (or 8001 when 8000 is busy), and the frontend launcher (`frontend
un_frontend.ps1`) points the site
at whichever is live. Keep both PowerShell windows open while you test; closing them stops the servers.

## Enabling the AI explainer and vision OCR (Groq)

Paste one key into `backend/.env` and restart the backend:

```
GROQ_API_KEY=gsk_...
LLM_MODEL=openai/gpt-oss-120b              # explainer model (default; any chat model your Groq account lists)
OCR_VISION_MODEL=meta-llama/llama-4-scout-17b-16e-instruct   # photo reader, used only if your account lists a vision model
```

With the key present, `OCR_ENGINE=auto` reads photos with the Groq vision model first (if your Groq account offers one) and falls back to local
Tesseract; the explainer rewrites the matched knowledge-base rows in Hindi/English. **The verdict is identical
with the key present or absent** — the model never decides anything (see `docs/ai-safety.md`).

Other providers: set `LLM_PROVIDER=anthropic | gemini | openai_compatible` with `LLM_API_KEY` / `LLM_BASE_URL`.

## Photo reading (OCR)

| `OCR_ENGINE` | Behaviour |
|---|---|
| `auto` (default) | Groq vision if a Groq key exists, otherwise Tesseract |
| `tesseract` | Local only, offline. English + Hindi (`backend/tessdata/hin.traineddata`) |
| `groq_vision` | Groq vision first, Tesseract fallback |
| `none` | Photo upload disabled; manual entry only |

Tesseract is auto-detected at `C:\Program Files\Tesseract-OCR\tesseract.exe` or on `PATH` (`TESSERACT_CMD` overrides).
Uploads are deleted the moment text is extracted. The engine used is reported in every API response and shown on the
review page.

## Repository layout

```
TakeSure/
├── frontend/          Next.js 16 · React 19 · TypeScript · Tailwind 4 · Framer Motion
│   ├── app/           / check review results knowledge-base[/code] how-it-works adr about demo dashboard
│   ├── components/    home/* (hero, pipeline, …) · dashboard/* · flows · ui primitives · motion primitives
│   ├── lib/           api client · i18n (EN/HI UI) · errors · verdict helpers · session · hooks
│   └── types/api.ts   mirrors backend schemas
├── backend/           FastAPI · Pydantic v2 · SQLAlchemy · RapidFuzz · ReportLab · pytesseract
│   ├── app/api/routes check · interactions · explain · adr · report · demo · analytics · curation (TinyFish) · health
│   ├── app/services   ocr · extraction · matching · interaction (rule engine) · llm · tinyfish (curation) · pdf · adr · kb · analytics
│   ├── app/db         models · seed_data (KB v1.0.0) · seed loader/validator
│   ├── scripts/       seed.py · seed_demo_activity.py · verify_sources.py
│   ├── tessdata/      Tesseract language data (filled by setup.ps1; not committed)
│   └── tests/         pytest (58 tests, incl. 7 TinyFish tests with a mocked transport)
├── database/          migrations/001_init.sql (PostgreSQL) · seed/*.json (exported KB)
├── docs/              architecture.md · ai-safety.md · methodology.md · hackbvp/ kritical/ (decks, pitch scripts) · logo/ mascot/ poster/ memes/
├── setup.ps1 · start-dev.ps1 · start-dev.bat
└── docker-compose.yml
```

## Pages

| Route | What it does |
|---|---|
| `/` | Landing: problem, pipeline (auto-cycling stages), capabilities, before/after, KB stats, dashboard preview, architecture, demo scenarios |
| `/check` | Step 1 — upload prescription + product photos, or type names |
| `/review` | Step 2 — confirm every name that was read; add/remove; see raw OCR text and engine |
| `/results` | Step 3 — verdict card, decision trace, Hindi/English explanation, 3 doctor questions, matched rows with sources, pair table, PDF |
| `/knowledge-base` | Search/filter all interaction rows; `/knowledge-base/INT-…` shows one row with citations |
| `/adr` | Suspected adverse-reaction form → PDF in Ministry of Ayush field format |
| `/dashboard` | Anonymised pharmacovigilance analytics: verdict trend, top pairs, herbs, medicines, states, ADR reports, user feedback, **Evidence curation (TinyFish)** with the draft queue |
| `/how-it-works`, `/about`, `/demo` | Methodology, rules, evidence grades, limitations, demo scenarios |

The **EN / हिं** toggle in the header switches the interface language; results and knowledge-base rows are bilingual on the server.

## API

All routes are under `/api`; errors use `{"error": {"code", "message", "detail", "retryable"}}`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | status, KB version, OCR chain, LLM provider |
| POST | `/check/upload` | multipart image/PDF → `upload_id` (temp, auto-deleted) |
| POST | `/check/extract` | OCR → candidates with scores/status |
| POST | `/check/resolve` | typed names → candidates (manual entry / edits) |
| POST | `/check/evaluate` | confirmed ids → verdict, pairs, matched rows, explanation |
| POST | `/explain` | re-run the explainer for a result in `en`/`hi` (verdict untouched) |
| GET | `/interactions`, `/interactions/{code}` | KB explorer |
| GET | `/kb/herbs`, `/kb/drugs`, `/kb/stats` | reference lists and counts |
| GET | `/analytics/summary?days=30` | anonymised dashboard aggregates |
| GET/POST | `/curation/status`, `/curation/verify-sources`, `/curation/discover`, `/curation/map-product`, `/curation/drafts[/{id}/approve|reject]` | TinyFish evidence curation (offline from verdicts) |
| GET | `/demo/scenarios[/{id}]` | demo inputs resolved through the real matcher |
| POST | `/report/pdf` | safety summary PDF |
| POST | `/adr`, `/adr/pdf` | store (with consent) / download suspected-ADR report |
| POST | `/feedback` | "report incorrect information" |

Interactive docs: http://localhost:8000/docs

## Tests

```powershell
cd backend ; $env:APP_ENV="test" ; .\.venv\Scripts\python.exe -m pytest -q     # 58 tests, all offline
cd frontend ; npm run typecheck ; npm run lint ; npm test
```

## Safety, privacy and honesty notes

- **Not medical advice.** Every result, PDF and page carries a disclaimer; the app never tells a user to start, stop or change a medicine.
- **Unknown is never Green.** Unrecognised names produce NOT IN DATABASE.
- **Citations are shown with their verification status.** All v1.0.0 sources are marked *needs verification* until a team member re-opens each DOI/URL (`python scripts/verify_sources.py`). No citation is invented.
- **No fake government submission.** The ADR flow produces a PDF in the Ministry's field format and links to the official Ayush Suraksha portal.
- **Uploads are deleted after extraction**; logs store entity ids and verdicts only; API keys never reach the browser.
- **Dashboard demo data** is tagged `source="demo"`; remove it with `python scripts/seed_demo_activity.py --clear`.

## Deployment

Live: **https://take-sure.vercel.app** (Vercel) → API **https://takesure-api.onrender.com** (Render Docker with Tesseract + PostgreSQL). Free tiers: the API sleeps after 15 idle minutes and wakes in about 50 s, so open the health URL once before a demo. Step-by-step guide: `docs/kritical/DEPLOY_GUIDE.md`.

- **Frontend:** Vercel → set `NEXT_PUBLIC_API_BASE_URL` to the backend URL.
- **Backend:** Render / Railway / Fly.io / VM with Tesseract installed (or a Groq key for vision OCR). Set `CORS_ORIGINS`, `DATABASE_URL` (Postgres/Supabase: `pip install "psycopg[binary]"`), `GROQ_API_KEY`.
- **Database:** apply `database/migrations/001_init.sql`, run `scripts/seed.py`.

## License

MIT for the code. Knowledge-base text summarises the cited public sources; verify them before clinical use.
