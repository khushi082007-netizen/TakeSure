# Deploy TakeSure to a public URL (about 40 minutes, all free tiers)

Three services, all free: **Render** runs the API in Docker (Tesseract included) with a free PostgreSQL; **Vercel** serves the Next.js site. Both deploy straight from the GitHub repo, so push first.

Everything below is prepared in the repo: `backend/Dockerfile` + `docker-entrypoint.sh` (seeds the knowledge base on first boot only), `render.yaml` (Blueprint), `frontend/vercel.json`.

## 0. Push the repo (if not done yet)

```powershell
cd C:\Users\arnit\Desktop\TakeSure
git remote add origin https://github.com/<username>/takesure.git
git branch -M main
git push -u origin main
```

## 1. Backend + database on Render

1. Sign in at https://render.com with GitHub → **New +** → **Blueprint** → select the `takesure` repo → Render reads `render.yaml` and shows `takesure-api` (web service) and `takesure-db` (PostgreSQL). Click **Apply**.
2. Open the `takesure-api` service → **Environment** → add the two secrets (values from `backend/.env` on your laptop; type them, never commit them):
   - `GROQ_API_KEY`
   - `TINYFISH_API_KEY`
3. Wait for the first deploy (5–8 minutes: Docker build installs Tesseract + Hindi data, then the entrypoint seeds 49 interactions and demo activity).
4. Open `https://takesure-api.onrender.com/api/health` → expect `"status":"ok"`, `"database":"ok"`, `"tinyfish_configured":true`. Copy the base URL.

Free-tier note: the service sleeps after 15 minutes idle and takes ~50 s to wake. Before a demo, open the health URL once.

## 2. Frontend on Vercel

1. Sign in at https://vercel.com with GitHub → **Add New** → **Project** → import `takesure`.
2. **Root Directory**: `frontend`. Framework is detected as Next.js.
3. **Environment Variables**: `NEXT_PUBLIC_API_BASE_URL` = `https://takesure-api.onrender.com/api` (your Render URL + `/api`).
4. **Deploy** (2–3 minutes). Copy the site URL, e.g. `https://takesure.vercel.app`.

## 3. Allow the site to call the API (CORS)

Back on Render → `takesure-api` → **Environment** → set `CORS_ORIGINS` to your Vercel URL exactly (no trailing slash), e.g. `https://takesure.vercel.app`. Save; Render redeploys in ~1 minute.

## 4. Verify

- Open the Vercel URL → Check safety → Type the names → Thyronorm + Ashwagandha → AMBER with the Groq explanation.
- Dashboard → Evidence curation → **TinyFish connected** → click **Verify next 10** → the counter moves.
- `https://takesure-api.onrender.com/docs` lists 25 routes.

## 5. Put the link everywhere

README (top block), the social post, the Unstop form if it has a prototype field, and slide 1 of the deck.

## If something fails

| Symptom | Fix |
|---|---|
| Site shows "could not reach the server" | `NEXT_PUBLIC_API_BASE_URL` wrong (must end in `/api`), or CORS_ORIGINS does not match the Vercel URL. Fix and redeploy. |
| API health says `database: unavailable` | The Render DB was still provisioning; redeploy the service. |
| OCR unavailable in health | The Docker build skipped `tesseract-ocr-hin`; check the build log, redeploy. |
| Explainer label says "knowledge base" instead of "AI explainer (groq)" | `GROQ_API_KEY` not set on Render; add it. The verdict is still correct. |
| Render free DB expires after 30 days | Upgrade or re-create; the entrypoint reseeds the knowledge base automatically on an empty DB. Curation approvals are lost unless you export them first. |
