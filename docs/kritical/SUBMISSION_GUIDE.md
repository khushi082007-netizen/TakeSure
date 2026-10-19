# Kritical Hacks 2026 · Online round submission guide (deadline 20 Oct 2026, 11:59 PM IST)

Scored out of 100: GitHub repo 20 · TinyFish integration 20 · Social post 10 · Technique 10 · Innovation 20 · Impact 10 · Revenue model 10.

## What you submit on Unstop (4 things)

| # | Item | Where it comes from | Status |
|---|---|---|---|
| 1 | Public GitHub repo link | Push `C:\Users\arnit\Desktop\TakeSure` (see step A) | you push |
| 2 | Demo video link (2–3 min) | `TakeSure_Demo_KriticalHacks2026.mp4` on the Desktop → upload to YouTube (unlisted is fine) or Google Drive ("Anyone with the link") | you upload |
| 3 | Public social media post link | LinkedIn or X post (text below) with the video or 2–3 screenshots and the GitHub link | you post |
| 4 | PPT (PDF) | `TakeSure_BugHunters_KriticalHacks2026.pdf` on the Desktop (11 slides incl. TinyFish and Revenue Model) | ready |

Do them in the order A → B → C → D below, because the post needs the repo link and the README needs the video and post links.

## A. Publish the GitHub repo (20 points)

1. Sign in at github.com → **New repository** → name `takesure` → **Public** → do NOT add a README/.gitignore/licence (the project already has them) → Create.
2. Copy the repo URL, e.g. `https://github.com/<username>/takesure.git`.
3. Open PowerShell in `C:\Users\arnit\Desktop\TakeSure` and run (replace the URL):

```powershell
git remote add origin https://github.com/<username>/takesure.git
git branch -M main
git push -u origin main
```

   Windows will open a GitHub sign-in window the first time; sign in and the push completes.
4. Check on github.com that the README renders and that `backend/.env` is **not** in the repo (it is ignored; only `.env.example` is there).
5. Secrets check: the Groq and TinyFish keys live only in `backend/.env` on your laptop. Never paste them into the repo, the README, the post or the video.

## B. Demo video (part of the 20 TinyFish points + repo points)

- Use **`TakeSure_Demo_ScreenRecording.mp4`** (Desktop): a real browser walkthrough of the live prototype (cursor, typing, clicks, scrolling), 2:00 long, no voice. Add your voice in Clipchamp following `TakeSure_Demo_Narration.pdf` (Desktop), export 1080p, and upload that. Or record your own with Win + Alt + R following the same click path (the narration PDF lists it).
- `TakeSure_Demo_KriticalHacks2026.mp4` is an alternative captioned cut built from screenshots; use the screen recording unless you prefer captions.
- Upload to YouTube as **Unlisted** (fastest) or to Google Drive with sharing set to "Anyone with the link can view". Copy the link.

## C. Social media post (10 points)

Post from any team member's LinkedIn (preferred) or X. Attach the demo video (or 3 screenshots: result screen, Hindi result, Evidence-curation panel) and the GitHub link. Make sure the post is **Public**. Copy the post URL.

Suggested text (edit freely):

> Dadi ka nuskha. Doctor ki dawa. Saath mein safe hai?
>
> In India, 37% of hospital patients take Ayurvedic products alongside allopathic medicines, and only 19% ever tell their doctor. No tool checks the pair. Medscape and 1mg stop at allopathic drugs; Western herb databases have never heard of Himalaya or Dabur.
>
> We built TakeSure: photograph your prescription and your Ayurvedic product (or type the names), and get a GREEN / AMBER / RED verdict in Hindi or English, with the published source, three questions for your doctor, a doctor PDF and a Ministry of Ayush reaction report.
>
> The rule we never break: the verdict comes from published data; AI only explains it.
>
> Our knowledge base is grown and verified by TinyFish web agents: the Fetch API re-opened our citations and verified 55 of 78 automatically (and caught 3 dead links), the Web Agent drafts candidate interactions from clinical monographs, and Search + Agent map Indian products to their herbs. Every draft is reviewed by a human before it can touch a verdict.
>
> Stack: Next.js · FastAPI · Tesseract OCR · RapidFuzz · rule engine over a cited knowledge base · Groq LLM under strict guardrails · TinyFish for curation. 58 tests, runs offline.
>
> Code: https://github.com/<username>/takesure
> Demo: <video link>
>
> Team Bug Hunters — Dhriti Garg, Shiwani Goyal, Khushi Gupta
> #HealthTech #Ayurveda #PatientSafety #AI #TinyFish #OpenSource

## D. Put the links in the README, push again, then submit on Unstop

1. Open `README.md`, replace `_link added at submission_` (two places near the top) with the video link and the post link. Save.
2. In PowerShell:

```powershell
git add README.md
git commit -m "Add demo video and social post links"
git push
```

3. On Unstop, open the Kritical Hacks 2026 submission form and paste: GitHub link, video link, post link, and upload the PPT PDF. Submit before 11:59 PM IST.

## Judges' quick answers for the TinyFish criterion

- Where is it in the code? `backend/app/services/tinyfish_service.py`, routes in `backend/app/api/routes/curation.py`, panel in `frontend/components/dashboard/Curation.tsx`, tests in `backend/tests/test_tinyfish_curation.py`.
- Is it functional? Yes: live run on 19 Oct verified 55/78 citations, drafted 7 + 4 + 1 candidate rows, mapped one product. The dashboard shows it; the video shows it.
- Why not on the verdict path? Reproducibility and auditability: a medical verdict must give the same answer every time and trace to a cited row. TinyFish makes the knowledge base bigger and better; it does not decide.
