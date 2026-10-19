# TakeSure — Demo Day Guide (Hack@BVP 8.0, Round 1 on Discord, 18 Oct 2026)

## 1. What was wrong and what was fixed (plain English)

**Root cause:** nothing was broken in the code. The website and the backend are *programs that must be running* on the laptop. They were started on 13 October, the laptop was restarted on 17 October, and a restart closes every running program. After that, the browser had nobody to talk to on `localhost:3000`, so it showed "This site can't be reached".

**Fix:** start the two programs again. No source file, setting, or data was changed.

**Files added (only convenience, nothing in the project changed):**

| File | Purpose |
|---|---|
| `Desktop\START TAKESURE.bat` | Double-click to start backend + website silently and open the browser |
| `Desktop\STOP TAKESURE.bat` | Double-click to stop them |
| `TakeSure\docs\hackbvp\DEMO_DAY_GUIDE.md` | This guide |

Verified on 17 Oct 2026 at 23:55 IST: both servers up, full user journey working (details in section 5).

## 2. How to start the project (every time, in this order)

**The easy way (recommended):** double-click `START TAKESURE.bat` on the Desktop. Wait about 15 seconds. The browser opens `http://localhost:3000`. If it does not, open the browser yourself and type that address. You can close the black window; the servers keep running in the background.

**The manual way (if you want to see the server output):** open two PowerShell windows.

TERMINAL 1 — BACKEND (FastAPI, Python)
```bash
cd C:\Users\arnit\Desktop\TakeSure\backend
.\run_backend.ps1
```
Success looks like: `Uvicorn running on http://127.0.0.1:8000` and `Application startup complete.`

TERMINAL 2 — FRONTEND (Next.js website)
```bash
cd C:\Users\arnit\Desktop\TakeSure\frontend
.\run_frontend.ps1
```
Success looks like: `Local: http://localhost:3000` and `Ready in …s`.

There is no third terminal. The database is a single file (`backend\takesure_dev.db`, SQLite) that the backend opens by itself. No database service needs starting.

**Addresses**

| What | Address |
|---|---|
| Website (show this) | http://localhost:3000 |
| Backend health check | http://localhost:8000/api/health |
| API documentation | http://localhost:8000/docs |

If port 8000 is ever blocked, the scripts automatically use 8001 and point the website at it. Do not edit `frontend\.env.local` by hand; the scripts write it.

**To stop:** double-click `STOP TAKESURE.bat`, or close the two PowerShell windows if you used the manual way.

**Dependencies:** already installed (Python virtual environment in `backend\.venv`, Node packages in `frontend\node_modules`, Tesseract OCR 5.4 in `C:\Program Files\Tesseract-OCR`). Nothing to install. If a fresh laptop is ever used, run `setup.ps1` in the project folder once.

**Environment variables:** all in `backend\.env` (already filled). The only secret is `GROQ_API_KEY`, used for the AI explanation. Never show that file on screen.

## 3. Internet: what needs it and what does not

| Feature | Needs internet? |
|---|---|
| Website, name matching, verdict, sources, PDF, ADR form, dashboard | No. Fully offline. |
| Photo reading (OCR) | No. Tesseract runs locally. |
| AI explanation in simple Hindi/English | Yes (Groq API). If offline, the app automatically shows the knowledge-base wording instead; the verdict is identical. |

So a hotspot failure during the demo does not break anything visible except the "Explained by: AI explainer (groq)" label becoming the knowledge-base text.

## 4. Demo checklist for tomorrow

Before the call (10 minutes):
1. Plug in the laptop. Turn off sleep: Settings → System → Power → Screen and sleep → Never (while plugged in).
2. Double-click `START TAKESURE.bat`. Wait for the browser.
3. Open http://localhost:8000/api/health in a second tab. You should see `"status":"ok"` and `"database":"ok"`. Close that tab.
4. Run the demo flow once (step 5 below) so the pages are warm and the AI key is confirmed working.
5. Keep screenshots folder open: `TakeSure\docs\screenshots\` (fallback if anything fails).
6. Close other heavy apps. Keep the browser at 100 % zoom; share the browser window, not the whole screen.

Demo flow (3 minutes):
1. Home page → click **Check safety**.
2. Tab **Type the names** → click **+ Thyronorm** and **+ Ashwagandha** → **Match names and continue**.
3. Review page: point out "Thyronorm → Levothyroxine, via brand, score 100". Click **Confirm and check safety**.
4. Result: AMBER card, "Why this verdict?", AI explanation, three questions, matched interaction with evidence grade B and sources. Click **हिन्दी** to show Hindi.
5. Scroll down: **Download PDF for doctor** and **Report a suspected reaction** (ADR form in Ministry format).
6. Menu → **Dashboard**: the Ministry view (verdict split, top combinations, ADR reports).
7. Optional second example: **+ Warfarin** and **+ Guggul** → RED. Or type `Dolo 650` + `Tulsi` → NOT IN DATABASE, to show it never guesses.

If something goes wrong:
- Site can't be reached → double-click `START TAKESURE.bat` again, wait 15 s, refresh.
- Result page stays blank for more than 10 s → refresh once. If the AI call times out, the page still shows the verdict from the knowledge base.
- Still broken → open `TakeSure\docs\screenshots\` and walk through the screenshots. The story is the same.

Do not: install updates, change `.env`, delete `takesure_dev.db` (it holds the 237 demo queries behind the dashboard), or run `--clear` on the seed script.

## 5. What was tested on 17 Oct (actual results)

| Check | Result |
|---|---|
| Backend starts, `/api/health` | OK: database ok, OCR available (Tesseract eng+hin), Groq model reachable, 49 interactions |
| 18 API routes present (`/docs`) | OK |
| Frontend home, /check, /review, /results, /dashboard, /adr, /knowledge-base, /how-it-works, /about | All HTTP 200, no browser console errors |
| Typed names → resolve | Thyronorm → Levothyroxine (brand, score 100); Ashwagandha exact |
| Evaluate | AMBER, rule R3, interaction INT-ASHWA-THYROID, grade B |
| AI explanation | English + Hindi returned from Groq in about 2.5 s; label "AI explainer (groq)" |
| Database persistence | Query count rose 236 → 237 after the check; dashboard reflects it |
| Doctor PDF (`/api/report/pdf`) | 2-page PDF generated (4.8 KB) |
| Wrong request to the API | Returns a clean 422 validation error, server keeps running |
| Full journey in the browser | Done end to end on the real site, screenshots taken |

Not re-tested today (worked on 13 Oct, code unchanged): photo upload + OCR through the website, ADR PDF export, feedback form. Test the photo upload once before the call if you plan to show it.

## 6. Deployment: local vs public

The site runs on this laptop only. Judges on the Discord call see it through screen share. That is enough for Round 1 (no rule asks for a public link). A public link would need hosting the backend (Render/Railway), the database (Supabase Postgres) and the website (Vercel), plus moving the Groq key to the host's secret settings. That is a 2 to 3 hour job with real risk the night before; do it after Round 1 if the mentors ask for it, not tonight.

## 7. Three-minute mentoring pitch (Shiwani)

1. (0:00) Story: "This is my mother's thyroid tablet and the ashwagandha she takes for stress. Her doctor has never heard of the second one. Nobody checked whether they are safe together."
2. (0:25) Gap: only 19 % of Indian patients tell their doctor about herbal use; Ayurveda pharmacovigilance has received about 1,473 reports in seven years. Medscape and 1mg check only allopathic pairs.
3. (0:50) What we built: scan or type both → names confirmed → rule engine over a cited knowledge base → GREEN / AMBER / RED / NOT IN DATABASE → AI explains in Hindi or English → doctor PDF and Ministry-format ADR report. Show the AMBER result live.
4. (2:00) The rule: the verdict comes from published data; AI only explains. Switch AI off, answer is the same.
5. (2:30) Ask the mentors: which Ayush institute or pharmacology faculty could review our knowledge base, and whether ABDM integration is realistic for Round 2.

## 8. Five-minute judging pitch

1. Problem (0:45): two medical systems, zero cross-checking; three real examples (ashwagandha–thyroid, giloy–tacrolimus, guggul–warfarin); the four statistics.
2. Solution demo (2:15): the live flow above, ending on the Hindi explanation and the dashboard.
3. Why it is different (0:45): comparison table from the abstract; the bridge table of Indian brands × herb synonyms × graded evidence; "not in database" instead of guessing.
4. How it is built (0:45): Next.js PWA, FastAPI, SQLite now / Postgres later, Tesseract OCR, RapidFuzz matching, Groq LLM locked to a JSON schema, ReportLab PDFs; 49 interactions, 78 sources, 16 herbs, 34 drugs; 51 automated tests.
5. Impact and next (0:30): patients, doctors, Ministry of Ayush; next: 200+ pairs reviewed with an Ayurveda college, ABDM/ABHA link, chemist QR.

## 9. Likely questions and short answers

- **Does the AI decide the risk?** No. A deterministic rule engine reads knowledge-base rows. The AI only rewrites the matched row into simple language and cannot add, remove or re-grade anything. With the AI off the verdict is identical.
- **Where does the data come from?** Hand-curated rows from PubMed, NIH LiverTox, MSKCC About Herbs, WHO monographs, Ayurvedic Pharmacopoeia; each row has severity, evidence grade A/B/C and a DOI or PMID. 49 rows today.
- **What if the herb is unknown?** "Not in database". Never green, never a guess. The gap is logged for curation.
- **Is this medical advice?** No. Decision support: "ask your doctor". Never "stop the medicine". Disclaimer on every screen and PDF.
- **How accurate is OCR on Indian labels?** Tesseract with English + Hindi; every name is shown back for confirmation before anything is checked, and manual entry always exists.
- **Privacy?** Photos are deleted after text extraction; only anonymous query, verdict and optional state are stored.
- **How does it help the Ministry?** One-tap suspected-ADR report in the Ayush pharmacovigilance format, and anonymised co-use analytics on the dashboard.
- **Why not a chatbot?** Chatbots hallucinate interactions. Our verdicts are auditable rows with sources.
- **Does it work offline?** Yes, everything except the AI rewording.
- **Business model?** Free for citizens; API for pharmacies, hospitals and telemedicine; programmes with the Ministry and CSR from Ayurvedic brands.
