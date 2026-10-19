// =============================================================== X. Role of AI/ML
{
  const s = newSlide("ROLE OF AI / ML");
  tb(s, "AI everywhere it is safe. Rules in the one place it is dangerous.", { x: 0.3, y: 0.82, w: 9.4, h: 0.3, fontFace: SANS, fontSize: 13, bold: true, color: BLUE });
  const A = [["Computer vision", "OCR", "Tesseract 5.4 (pre-trained LSTM) reads prescription and label photos after Pillow pre-processing (grayscale, upscale, autocontrast); English + Hindi models. Roadmap: fine-tune on Indian labels and handwriting.", NV],
    ["NLP", "Name matching", "Entity extraction from messy prescription text; RapidFuzz token matching over a bridge dictionary of Indian brands, generics and Sanskrit/Hindi/Latin synonyms. ≥85 accept, 70–85 ask the user, <70 unrecognised.", NV],
    ["LLM", "Explainer", "Groq-hosted open-weight model (gpt-oss-120b), temperature 0, receives only the matched rows, must return a strict JSON schema; directive language rejected in English and Hindi; knowledge-base fallback. Output: plain-language summary + 3 doctor questions.", NV],
    ["Agentic AI", "TinyFish research assistant", "Web agents fetch citations, read monographs and product pages, and draft knowledge-base rows with sources attached. Human-reviewed. This is how the dataset scales.", TF],
    ["Rules", "Verdict engine", "Deterministic rules R1–R5 over cited rows: severity + evidence grade + drug class → GREEN / AMBER / RED / NOT IN DB. Reproducible, auditable, works with every model switched off.", "000000"]];
  A.forEach(([k, t, d, c], i) => { const y = 1.18 + i * 0.78; rr(s, 0.3, y, 9.4, 0.7, WHITE, LINE, 0.05); rr(s, 0.4, y + 0.1, 1.25, 0.5, c, c, 0.05); tb(s, k, { x: 0.4, y: y + 0.1, w: 1.25, h: 0.5, fontSize: 9, bold: true, color: WHITE, align: "center", valign: "middle" }); tb(s, t, { x: 1.8, y: y + 0.06, w: 2.0, h: 0.58, fontSize: 10, bold: true, color: INK, valign: "middle" }); tb(s, d, { x: 3.85, y: y + 0.05, w: 5.75, h: 0.6, fontSize: 8, color: BODY, valign: "middle" }); });
  tb(s, "Why no trained classifier for the verdict: no labelled dataset exists (≈1,473 national reports in 7 years), a classifier cannot explain itself to a doctor or regulator, and medical decision support must be reproducible. Future ML once data exists: OCR fine-tuning on Indian labels, a named-entity model for prescriptions, and a model that ranks under-reported pairs for curation priority.", { x: 0.3, y: 5.1, w: 9.4, h: 0.26, fontSize: 6.8, italic: true, color: MUT });
  s.addNotes("Five AI layers; rules decide the verdict; why no trained classifier.");
}

// =============================================================== Y. TinyFish integration
{
  const s = newSlide("TINYFISH INTEGRATION", "Functional in the prototype");
  rr(s, 0.25, 0.82, 9.5, 0.5, "EDE9FE", "C4B5FD", 0.05);
  s.addText([{ text: "TinyFish is TakeSure's research assistant. ", options: { bold: true, color: TF } }, { text: "It opens the references, reads monographs and product pages, and drafts knowledge-base rows with the source attached. Reviewers approve every row. The verdict path never touches the live web — that is a safety rule, not a limitation.", options: { color: BODY } }], { isTextBox: true, x: 0.4, y: 0.85, w: 9.2, h: 0.44, fontFace: SANS, fontSize: 8.4, margin: 0, valign: "middle" });
  const J = [["Fetch API", "Verify citations", "Three stages: Fetch the resolved page; Fetch the Crossref record for bot-blocked DOIs; Search the title for sources without a locator. ≥60% of distinctive title terms matched → verified; otherwise a “mismatch” draft with the best candidate.", "Live run 19 Oct: 55 of 78 citations verified automatically; 23 listed for review (3 broken links found). Free tier."],
    ["Fetch + Web Agent", "Discover interaction rows", "Fetch the MSKCC About Herbs page (free, 2 s) and extract every clinical bullet naming a drug, class or interaction verb from our drug dictionary; if the static page yields nothing, POST /v1/automation/run-async with a JSON output_schema and poll the run.", "Live: 7 candidates for ashwagandha, 4 for turmeric in seconds (Fetch + rules); Web Agent fallback for guggul."],
    ["Search + Agent", "Map Indian products", "GET api.search.tinyfish.ai for the product page, then an Agent run extracts the ingredient list with Latin/Sanskrit names; matched to known herbs.", "Live: Dabur Giloy Ghanvati mapped to giloy (1 g/tablet) in one Agent run (28 steps)."]];
  J.forEach(([api, t, d, w], i) => { const y = 1.42 + i * 0.86; rr(s, 0.25, y, 5.3, 0.78, WHITE, LINE, 0.05); rr(s, 0.35, y + 0.08, 1.1, 0.26, TF, TF, 0.05); tb(s, api, { x: 0.35, y: y + 0.08, w: 1.1, h: 0.26, fontSize: 7.5, bold: true, color: WHITE, align: "center", valign: "middle" }); tb(s, t, { x: 1.55, y: y + 0.06, w: 3.9, h: 0.3, fontSize: 9.5, bold: true, color: INK, valign: "middle" }); tb(s, d, { x: 0.35, y: y + 0.36, w: 5.1, h: 0.42, fontSize: 6.6, color: BODY }); rr(s, 5.65, y, 1.75, 0.78, "EDE9FE", "C4B5FD", 0.05); tb(s, w, { x: 5.72, y: y + 0.05, w: 1.62, h: 0.7, fontSize: 6.5, color: BODY, valign: "middle" }); });
  rr(s, 7.5, 1.42, 2.25, 2.5, WHITE, LINE, 0.05);
  s.addImage({ path: SHOT_CUR, x: 7.56, y: 1.62, w: 2.13, h: 1.73 });
  tb(s, "Evidence-curation panel on the dashboard", { x: 7.56, y: 1.45, w: 2.13, h: 0.16, fontSize: 6.3, bold: true, color: TF });
  tb(s, "Live: 55/78 sources verified, 5 pending drafts, queue with approve / reject.", { x: 7.56, y: 3.38, w: 2.13, h: 0.5, fontSize: 6.3, color: BODY });
  rr(s, 0.25, 4.08, 9.5, 1.22, LIGHT, LINE, 0.05); rect(s, 0.25, 4.08, 9.5, 0.24, TF);
  tb(s, "IMPLEMENTATION STATUS · DEMONSTRABLE", { x: 0.35, y: 4.08, w: 9, h: 0.24, fontSize: 8, bold: true, color: WHITE, valign: "middle", charSpacing: 1 });
  bullets(s, [["Backend: ", "app/services/tinyfish_service.py (Fetch, Search, Agent clients) · curation_drafts table · 7 routes under /api/curation · 7 offline tests with a mocked TinyFish transport (58 tests total)."], ["Frontend: ", "“Evidence curation” panel on the dashboard with Verify / Discover / Map actions and an approve-reject draft queue; health endpoint reports tinyfish_configured."], ["Guardrail: ", "TINYFISH_API_KEY lives only on the server; drafts never change a verdict until a reviewer approves. Live demo: Verify next 10 → the sources-verified counter rises."]], 0.4, 4.37, 9.2, 0.9, 7.4);
  s.addNotes("Three TinyFish jobs, where each lands, implementation status.");
}

// =============================================================== Z. Future scope
{
  const s = newSlide("FUTURE SCOPE");
  panel(s, 0.25, 0.85, 4.65, 4.4, "ROADMAP");
  bullets(s, [["Knowledge base: ", "200+ pairs; second-reviewer rule on every citation; faculty review with an Ayurveda college or pharmacology department before public release."], ["ML once data exists: ", "OCR fine-tuned on Indian labels and handwriting; a named-entity model for prescriptions; ranking of under-reported pairs for curation priority."], ["TinyFish: ", "scheduled monthly re-verification of every citation; agent monitoring of LiverTox and Ayush Suraksha for new signals; product-catalogue sweeps of Himalaya, Dabur, Patanjali, Baidyanath."], ["Integration: ", "Ayush Grid / ABDM so the verdict and ADR sit on the ABHA record; pharmacy-chain API; chemist QR pilot in one city."], ["Out of scope by design: ", "diagnosis, dosing, herb–herb interactions, any trained model deciding a verdict."]], 0.4, 1.18, 4.4, 4.0, 8.4);
  panel(s, 5.1, 0.85, 4.65, 4.4, "24-HOUR BUILD PLAN · 31 OCT – 1 NOV");
  const P = [["0–3 h", "Set up at venue; load KB; core loop photo → OCR → confirm → verdict green."], ["3–9 h", "TinyFish verifier over all 78 citations; reviewer pass on mismatches."], ["9–15 h", "Agent discovery for 16 herbs → draft rows → review → 100+ rows."], ["15–19 h", "Product mapping for top 30 Indian products; Hindi in every PDF."], ["19–22 h", "Public deploy (Vercel + Render + Supabase); chemist QR flow."], ["22–24 h", "Freeze, run tests, rehearse the demo on the deployed link."]];
  P.forEach(([t, d], i) => { const y = 1.2 + i * 0.66; const c = (i >= 1 && i <= 3) ? TF : NV; rr(s, 5.25, y, 4.35, 0.58, LIGHT, LINE, 0.05); rr(s, 5.32, y + 0.12, 0.8, 0.34, c, c, 0.05); tb(s, t, { x: 5.32, y: y + 0.12, w: 0.8, h: 0.34, fontSize: 8.5, bold: true, color: WHITE, align: "center", valign: "middle" }); tb(s, d, { x: 6.22, y: y + 0.06, w: 3.3, h: 0.48, fontSize: 7.8, color: BODY, valign: "middle" }); });
  s.addNotes("Roadmap and the 24-hour plan.");
}

// =============================================================== R. Revenue model
{
  const s = newSlide("REVENUE MODEL", "Prices are launch assumptions, to be validated in the pilot");
  panel(s, 0.25, 0.82, 5.3, 2.75, "PRICE ECONOMICS");
  const hdr = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: NV }, fontSize: 7.2, valign: "middle" } });
  const c = (t, o) => ({ text: t, options: Object.assign({ fontSize: 6.9, color: BODY, valign: "middle" }, o || {}) });
  s.addTable([
    [hdr("Segment"), hdr("Offer"), hdr("Price (launch)"), hdr("Why this price")],
    [c("B2C · patients & caregivers", { bold: true, color: NV }), c("Web / PWA checker, Hindi + English"), c("Free", { bold: true }), c("Adoption and the ADR signal are the asset; a paywall would re-create the gap we are closing")],
    [c("B2B · chemists (per outlet)", { bold: true, color: NV }), c("Counter cross-check + QR on the bill"), c("₹499 / month", { bold: true }), c("Below one day's margin on a mid-size counter; comparable to billing-software add-ons (₹300–800/month)")],
    [c("B2B · telemedicine / HIS (API)", { bold: true, color: NV }), c("Per-query verdict API"), c("₹2 per check, ₹25,000 / year floor", { bold: true }), c("Pure marginal cost is near zero (rules + SQL); ₹2 sits under the ₹5–15 lab/health-ID API norms")],
    [c("B2B · hospital licence", { bold: true, color: NV }), c("On-prem / private cloud, Hindi PDFs, ADR export"), c("₹1.5 lakh / year", { bold: true }), c("One pharmacist-hour per day saved covers it; priced like a single clinical-reference subscription")],
    [c("B2G / CSR", { bold: true, color: NV }), c("Co-use analytics, structured ICSRs, college co-curation"), c("Programme grants ₹10–25 lakh", { bold: true }), c("In line with Ministry of Ayush pharmacovigilance programme funding and brand CSR budgets")],
  ], { x: 0.35, y: 1.15, w: 5.1, colW: [1.2, 1.25, 1.05, 1.6], rowH: [0.26, 0.38, 0.38, 0.38, 0.38, 0.38], fontFace: SANS, border: { type: "solid", color: LINE, pt: 0.5 }, margin: 0.03 });
  panel(s, 5.7, 0.82, 4.05, 2.75, "MARKET RESEARCH");
  bullets(s, [["Demand: ", "37% of hospital patients already combine both systems; only 19% tell their doctor (references slide)."], ["Counters: ", "India has ≈ 8.5 lakh retail chemists (AIOCD); 1% adoption = 8,500 outlets × ₹499 × 12 = ₹5.1 crore ARR."], ["Telemedicine: ", "eSanjeevani alone crossed 30 crore consultations; at 1% of consults checked × ₹2 = ₹6 crore / year."], ["Ayush sector: ", "Ministry of Ayush values the Ayush market at US$ 24 billion (2020, RIS); no product offers a herb × drug safety layer."], ["Cost side: ", "verdicts cost ≈ ₹0 (rules + SQLite/Postgres); AI rewording ≈ ₹0.02 per check (Groq); TinyFish curation is a fixed monthly cost (Search/Fetch free, Agent ≈ $0.016 per step)."]], 5.8, 1.12, 3.85, 2.4, 7.3);
  panel(s, 0.25, 3.7, 9.5, 1.55, "THREE-YEAR PATH · CONSERVATIVE");
  const Y = [["Year 1 · pilot", "1 city · 50 chemists · 1 telemedicine partner", "₹3–5 lakh revenue · CSR grant ₹10 lakh", "Prove counter adoption and ADR flow"], ["Year 2 · scale", "3 states · 2,000 chemists · 3 HIS integrations", "₹1.2–1.5 crore ARR", "Knowledge base 300+ rows reviewed by a college"], ["Year 3 · platform", "ABDM / Ayush Grid integration · pharmacy chains", "₹5+ crore ARR", "Verdict on the ABHA record; national co-use analytics"]];
  Y.forEach(([t, w, r, g], i) => { const x = 0.4 + i * 3.15; rr(s, x, 4.02, 3.0, 1.15, LIGHT, LINE, 0.05); tb(s, t, { x: x + 0.1, y: 4.06, w: 2.8, h: 0.22, fontSize: 8.5, bold: true, color: NV }); tb(s, w, { x: x + 0.1, y: 4.3, w: 2.8, h: 0.26, fontSize: 7, color: BODY }); tb(s, r, { x: x + 0.1, y: 4.58, w: 2.8, h: 0.24, fontSize: 7.4, bold: true, color: INK }); tb(s, g, { x: x + 0.1, y: 4.84, w: 2.8, h: 0.3, fontSize: 6.8, italic: true, color: MUT }); });
  s.addNotes("Prices with justification; market sizing from public figures; three-year conservative path.");
}
