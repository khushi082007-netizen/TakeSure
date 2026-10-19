// TakeSure â€” Kritical Hacks 2026 (IGDTUW) Round-1 deck. Nine required sections, AI/ML track, TinyFish integration.
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Team Bug Hunters"; pres.title = "TakeSure â€” Kritical Hacks 2026";

const NV = "14213D", SAF = "F4A300", INK = "1B1B1B", MUT = "5D6166", LIGHT = "F4F6FA", LINE = "C9D0DD", BODY = "333333", WHITE = "FFFFFF", MINT = "3DD598", EM = "0F5A43", TF = "6D28D9";
const SANS = "Calibri", SERIF = "Cambria";
const HERO = "C:/Temp/bvp/logo/out/B_mark_transparent.png", SUREJI = "C:/Temp/bvp/mascot/out/1_sureji_transparent.png", FLOW = "C:/Temp/final-ppt/flowchart_big_text.png";
const SHOT_RESULT = "C:/Temp/bvp/deck/shots/04_result_amber.png", SHOT_CUR = "C:/Temp/bvp/kritical/curation_panel.png";
let n = 0;

function tb(s, text, o) { s.addText(text, Object.assign({ isTextBox: true, fontFace: SANS, color: BODY, margin: 0, valign: "top" }, o)); }
function rect(s, x, y, w, h, fill, line) { s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: fill }, line: line ? { color: line, width: 0.75 } : { color: fill, width: 0 } }); }
function rr(s, x, y, w, h, fill, line, r) { s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: r || 0.06, fill: { color: fill }, line: { color: line || fill, width: 0.75 } }); }
function badge(s, x, y, t, d, fill, col) { d = d || 0.26; s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill || NV }, line: { color: fill || NV } }); tb(s, String(t), { x, y, w: d, h: d, fontSize: d * 34, bold: true, color: col || SAF, align: "center", valign: "middle" }); }
function panel(s, x, y, w, h, title, fill) { rr(s, x, y, w, h, WHITE, LINE, 0.05); rect(s, x, y, w, 0.26, fill || NV); tb(s, title, { x: x + 0.1, y, w: w - 0.2, h: 0.26, fontSize: 8.5, bold: true, color: WHITE, valign: "middle", charSpacing: 1 }); }
function bullets(s, items, x, y, w, h, fs) {
  const r = [];
  items.forEach(([b, t], i) => { if (b) r.push({ text: b, options: { bold: true, color: NV, bullet: { indent: 9 } } }); r.push({ text: t, options: { color: BODY, breakLine: i < items.length - 1, bullet: b ? undefined : { indent: 9 } } }); });
  s.addText(r, { isTextBox: true, x, y, w, h, fontFace: SANS, fontSize: fs, margin: 0, valign: "top", paraSpaceAfter: 3 });
}
function slide(title, sub) {
  const s = pres.addSlide(); n++;
  s.background = { color: "F7F8FB" };
  rect(s, 0, 0, 10, 0.62, NV); rect(s, 0, 0.62, 10, 0.04, SAF);
  rr(s, 0.25, 0.14, 1.35, 0.34, SAF, SAF, 0.17); tb(s, "Bug Hunters", { x: 0.25, y: 0.14, w: 1.35, h: 0.34, fontSize: 10.5, bold: true, color: NV, align: "center", valign: "middle" });
  tb(s, title, { x: 1.75, y: 0.07, w: 6.1, h: 0.5, fontFace: SERIF, fontSize: 18, bold: true, color: WHITE, valign: "middle" });
  tb(s, "KRITICAL HACKS 2026\nIGDTUW Â· AI/ML Track", { x: 7.9, y: 0.1, w: 1.85, h: 0.44, fontSize: 8.5, bold: true, color: SAF, align: "right", valign: "middle", lineSpacingMultiple: 1.05 });
  rect(s, 0, 5.4, 10, 0.225, NV);
  tb(s, "TakeSure Â· Confidence before taking something Â· Team Bug Hunters Â· Kritical Hacks 2026", { x: 0.25, y: 5.4, w: 7, h: 0.225, fontSize: 7, color: "C9D1E0", valign: "middle" });
  tb(s, (sub || "Decision support Â· not diagnosis") + "   " + n, { x: 6.5, y: 5.4, w: 3.25, h: 0.225, fontSize: 7, color: "C9D1E0", align: "right", valign: "middle" });
  return s;
}

// ============================================================ 1. Title
{
  const s = pres.addSlide(); n++;
  s.background = { color: NV }; rect(s, 0, 0, 10, 0.08, SAF);
  s.addImage({ path: HERO, x: 8.2, y: 0.4, w: 1.3, h: 1.3 });
  rr(s, 0.5, 0.5, 1.5, 0.38, SAF, SAF, 0.19); tb(s, "Bug Hunters", { x: 0.5, y: 0.5, w: 1.5, h: 0.38, fontSize: 12, bold: true, color: NV, align: "center", valign: "middle" });
  tb(s, "Kritical Hacks 2026 Â· IGDTUW Delhi Â· AI/ML Track (Open Innovation) Â· Student category", { x: 2.15, y: 0.5, w: 5.9, h: 0.38, fontSize: 9.5, color: "C9D1E0", valign: "middle" });
  s.addText([{ text: "TakeSure", options: { color: WHITE } }, { text: " â€” Confidence before taking something", options: { color: SAF } }], { isTextBox: true, x: 0.5, y: 1.15, w: 7.6, h: 0.75, fontFace: SERIF, fontSize: 30, bold: true, margin: 0, valign: "middle" });
  const L = [["Project", "Ayurveda Ã— Allopathy herbâ€“drug interaction checker: photo of prescription + photo of product â†’ sourced, plain-language safety verdict in Hindi/English + Ministry of Ayush ADR report."],
    ["Team", "Dhriti Garg (backend, rule engine, medical research) Â· Shiwani Goyal (frontend, Hindi/English UI, pitch) Â· Khushi Gupta (knowledge base, evidence grading, OCR, PDF/ADR)"],
    ["AI / ML", "Deep-learning OCR (Tesseract) reads the photos Â· NLP matching resolves Indian brand names Â· an LLM explains the evidence under strict guardrails Â· TinyFish web agents research and verify the knowledge base. Rules decide."],
    ["TinyFish", "Fetch API verifies every citation Â· Web Agent drafts interaction rows from MSKCC / LiverTox monographs Â· Search + Agent map Indian products to their herbs. Functional today; every draft is human-approved."],
    ["Status", "Working prototype: 25 API routes, 49 cited interactions, 78 sources, 58 automated tests. Offline-capable."]];
  let y = 2.05;
  L.forEach(([k, v]) => { const h = 0.56; tb(s, k, { x: 0.5, y, w: 1.3, h, fontSize: 11, bold: true, color: SAF }); tb(s, v, { x: 1.85, y, w: 7.65, h, fontSize: 9.6, color: "E3E8F2", lineSpacingMultiple: 1.08 }); y += h + 0.06; });
  rect(s, 0, 5.2, 10, 0.405, "0E172C");
  tb(s, "Aligned with the Ministry of Ayush Pharmacovigilance Programme for ASU&H drugs Â· decision support, never diagnosis", { x: 0.5, y: 5.2, w: 9, h: 0.405, fontSize: 8.5, italic: true, color: "9DB4E0", valign: "middle" });
}

// ============================================================ 2. Problem statement
{
  const s = slide("1 Â· PROBLEM STATEMENT");
  panel(s, 0.25, 0.85, 6.1, 2.95, "THE GAP NOBODY CHECKS");
  const P = [["India runs two medical systems side by side â€” and nobody checks the combination. ", "A thyroid patient on Thyronorm adds ashwagandha for stress; a transplant patient on tacrolimus drinks giloy kadha; a cardiac patient on warfarin takes guggul. Ashwagandha can raise thyroid hormone, giloy can oppose immunosuppression, guggul can increase bleeding."],
    ["The doctor rarely asks, the patient rarely tells, the chemist has no tool, ", "and the product label says nothing about allopathic medicines."],
    ["Existing checkers (Medscape, Drugs.com, 1mg) know only allopathic Ã— allopathic pairs; ", "Western herb databases are English-only, paid, and do not know Himalaya Ashvagandha or Dabur Giloy Ghanvati."]];
  let y = 1.2;
  P.forEach(([b, t], i) => { const h = [0.92, 0.4, 0.62][i]; badge(s, 0.4, y + 0.02, i + 1); s.addText([{ text: b, options: { bold: true, color: NV } }, { text: t, options: { color: BODY } }], { isTextBox: true, x: 0.78, y, w: 5.45, h, fontFace: SANS, fontSize: 8.6, margin: 0, valign: "top" }); y += h + 0.04; });
  const ST = [["37%", "of hospital patients use allopathic + herbal medicines together"], ["65%", "of herbal users lack knowledge of dose, side effects, interactions"], ["19%", "of Indian patients disclose herbal use to their doctor"], ["1,473", "ASU&H adverse-event reports nationally since 2018"]];
  ST.forEach(([v, d], i) => { const x = 0.4 + i * 1.48; rr(s, x, 3.15, 1.4, 0.58, LIGHT, LINE, 0.05); tb(s, v, { x: x + 0.07, y: 3.17, w: 0.62, h: 0.54, fontSize: 13, bold: true, color: i % 2 ? "B86E00" : NV, valign: "middle" }); tb(s, d, { x: x + 0.66, y: 3.19, w: 0.72, h: 0.52, fontSize: 6.3, color: MUT, valign: "middle" }); });
  panel(s, 6.55, 0.85, 3.2, 2.95, "WHY IT IS STILL UNSOLVED");
  bullets(s, [["No dataset exists. ", "There is no public table of Indian herb Ã— allopathic-drug interactions; evidence is scattered across MSKCC, LiverTox, WHO monographs and journals."], ["No bridge table. ", "Nothing maps Thyronorm â†’ levothyroxine and Chyawanprash â†’ amla + ashwagandha in one place."], ["Reports do not flow. ", "Ayush Suraksha exists, but the patient never learns a reaction should be reported."]], 6.7, 1.2, 2.9, 2.5, 8.2);
  panel(s, 0.25, 3.95, 9.5, 1.3, "IMPACT OF THE GAP");
  tb(s, "Patients on thyroid, diabetes, BP/heart, blood-thinner, transplant or epilepsy medicines and their families Â· doctors who never hear about the co-use Â· chemists who sell both systems' products with no cross-check Â· the Ministry's pharmacovigilance network that never receives the reports. Sources for every statistic are on the references slide.", { x: 0.4, y: 4.3, w: 9.2, h: 0.85, fontSize: 9, color: BODY });
}

// ============================================================ 3. Proposed solution
{
  const s = slide("2 Â· PROPOSED SOLUTION");
  tb(s, "Five things TakeSure does", { x: 0.3, y: 0.8, w: 4, h: 0.3, fontFace: SERIF, fontSize: 13, bold: true, color: NV });
  const F = [["Scan â€” ", "Photograph the prescription and the Ayurvedic product label (or type the names). OCR reads them; every name is shown for confirmation before anything is checked."],
    ["Match â€” ", "Indian brand â†’ generic (Thyronorm â†’ levothyroxine), product â†’ herbs (Chyawanprash â†’ amla, ashwagandhaâ€¦) via a curated bridge dictionary + fuzzy matching."],
    ["Decide â€” ", "Deterministic rule engine over a cited knowledge base â†’ GREEN / AMBER / RED / NOT IN DATABASE, with timing gaps (e.g. 2â€“3 h between Triphala and oral medicines)."],
    ["Explain â€” ", "AI rewrites only the matched evidence into simple Hindi/English + 3 questions to ask the doctor. It cannot add, remove or re-grade an interaction."],
    ["Report â€” ", "One-page PDF with sources for the doctor; one-tap suspected-ADR report in the Ministry of Ayush format for the Ayush Suraksha portal."]];
  let y = 1.15;
  F.forEach(([b, t], i) => { badge(s, 0.32, y + 0.02, i + 1); s.addText([{ text: b, options: { bold: true, color: NV } }, { text: t, options: { color: BODY } }], { isTextBox: true, x: 0.68, y, w: 5.35, h: 0.52, fontFace: SANS, fontSize: 8.6, margin: 0, valign: "top" }); y += 0.56; });
  rr(s, 0.32, 4.0, 5.7, 0.5, LIGHT, LIGHT, 0.05); rect(s, 0.32, 4.0, 0.05, 0.5, SAF);
  tb(s, "Our rule: the verdict comes from published data; AI only explains it. Switch the AI off and the verdict is identical.", { x: 0.45, y: 4.0, w: 5.5, h: 0.5, fontSize: 9, bold: true, italic: true, color: NV, valign: "middle" });
  tb(s, "Novelty: the missing bridge table â€” Indian brand names Ã— Ayurvedic herb synonyms (Sanskrit/Hindi/Latin) Ã— graded published evidence â€” open, auditable, grown with TinyFish agents and approved by reviewers.", { x: 0.32, y: 4.6, w: 5.7, h: 0.6, fontSize: 8.4, color: BODY });
  rr(s, 6.25, 0.78, 3.5, 4.52, WHITE, LINE, 0.05);
  s.addImage({ path: FLOW, x: 6.95, y: 0.82, w: 2.7, h: 4.41 });
  tb(s, "Project workflow", { x: 6.3, y: 0.82, w: 0.65, h: 0.2, fontSize: 6.5, bold: true, color: MUT });
}

// ============================================================ 4. Target users
{
  const s = slide("3 Â· TARGET USERS & USE CASES");
  const U = [["B2C", "Patients & caregivers", "Adults 30â€“70 on long-term medicines who also take Ayurvedic products; family members managing an elder's medicines; Hindi or English, phone-first.", "â€œMummy ki thyroid tablet ke saath ashwagandha safe hai?â€ â€” answer in 60 seconds with the source."],
    ["B2B", "Clinicians & pharmacies", "MBBS/MD doctors, BAMS vaidyas, hospital pharmacies, retail chemists, telemedicine and hospital-HIS platforms (API).", "QR on the chemist's bill; counter-side cross-check at the only shop that sells both systems' products."],
    ["B2G", "Regulators", "Ministry of Ayush / NPvCC at AIIA and the 99 Peripheral Pharmacovigilance Centres.", "Structured ICSRs in the official format and anonymised co-use analytics by state."]];
  U.forEach(([k, t, d, u], i) => { const x = 0.25 + i * 3.2; rr(s, x, 0.85, 3.05, 2.55, WHITE, LINE, 0.05); rr(s, x + 0.12, 0.97, 0.6, 0.28, SAF, SAF, 0.05); tb(s, k, { x: x + 0.12, y: 0.97, w: 0.6, h: 0.28, fontSize: 9, bold: true, color: NV, align: "center", valign: "middle" }); tb(s, t, { x: x + 0.8, y: 0.97, w: 2.2, h: 0.28, fontSize: 10.5, bold: true, color: NV, valign: "middle" }); tb(s, d, { x: x + 0.12, y: 1.35, w: 2.8, h: 1.0, fontSize: 8.6, color: BODY }); rr(s, x + 0.12, 2.4, 2.8, 0.88, LIGHT, LIGHT, 0.05); tb(s, u, { x: x + 0.2, y: 2.45, w: 2.65, h: 0.8, fontSize: 8.2, italic: true, color: NV, valign: "middle" }); });
  panel(s, 0.25, 3.6, 9.5, 1.65, "THREE USE CASES WE DEMONSTRATE");
  const C = [["AMBER", "Ashwagandha + Levothyroxine", "Caution Â· grade B Â· recheck TSH in 6â€“8 weeks Â· Sharma 2018, Gannon 2014", "B86E00"], ["RED", "Guggul + Warfarin", "High risk Â· bleeding Â· anticoagulant class escalation (rule R5) Â· MSKCC, Stockley's", "B00020"], ["NOT IN DB", "Dolo 650 + Tulsi", "No reviewed row â†’ we say so, never guess GREEN Â· pair logged for TinyFish-assisted curation", "4B5563"]];
  C.forEach(([v, p, d, c], i) => { const x = 0.4 + i * 3.15; rr(s, x, 3.95, 3.0, 1.18, LIGHT, LINE, 0.05); rr(s, x + 0.1, 4.05, 0.95, 0.28, c, c, 0.04); tb(s, v, { x: x + 0.1, y: 4.05, w: 0.95, h: 0.28, fontSize: 8.5, bold: true, color: WHITE, align: "center", valign: "middle" }); tb(s, p, { x: x + 1.12, y: 4.05, w: 1.85, h: 0.28, fontSize: 9, bold: true, color: NV, valign: "middle" }); tb(s, d, { x: x + 0.1, y: 4.4, w: 2.8, h: 0.7, fontSize: 7.8, color: BODY }); });
}

// ============================================================ 5. Role of AI/ML
{
  const s = slide("4 Â· ROLE OF AI / ML");
  tb(s, "AI everywhere it is safe. Rules in the one place it is dangerous.", { x: 0.3, y: 0.78, w: 9.4, h: 0.3, fontFace: SERIF, fontSize: 13, bold: true, color: NV });
  const A = [["Computer vision", "OCR", "Tesseract 5.4 (pre-trained LSTM) reads prescription and label photos after Pillow pre-processing (grayscale, upscale, autocontrast); English + Hindi models. Roadmap: fine-tune on Indian labels and handwriting.", EM],
    ["NLP", "Name matching", "Entity extraction from messy prescription text; RapidFuzz token matching over a bridge dictionary of Indian brands, generics and Sanskrit/Hindi/Latin synonyms. â‰¥85 accept, 70â€“85 ask the user, <70 unrecognised.", EM],
    ["LLM", "Explainer", "Groq-hosted open-weight model (gpt-oss-120b), temperature 0, receives only the matched rows, must return a strict JSON schema, directive language rejected in English and Hindi, knowledge-base fallback. Output: plain-language summary + 3 doctor questions.", EM],
    ["Agentic AI", "TinyFish research assistant", "Web agents fetch citations, read monographs and product pages, and draft knowledge-base rows with sources attached. Human-reviewed. This is how the dataset scales.", TF],
    ["Rules", "Verdict engine", "Deterministic rules R1â€“R5 over cited rows: severity + evidence grade + drug class â†’ GREEN / AMBER / RED / NOT IN DB. Reproducible, auditable, works with every model switched off.", NV]];
  A.forEach(([k, t, d, c], i) => { const y = 1.15 + i * 0.8; rr(s, 0.3, y, 9.4, 0.72, WHITE, LINE, 0.05); rr(s, 0.4, y + 0.1, 1.25, 0.5, c, c, 0.05); tb(s, k, { x: 0.4, y: y + 0.1, w: 1.25, h: 0.5, fontSize: 9, bold: true, color: WHITE, align: "center", valign: "middle" }); tb(s, t, { x: 1.8, y: y + 0.06, w: 2.0, h: 0.6, fontSize: 10, bold: true, color: NV, valign: "middle" }); tb(s, d, { x: 3.85, y: y + 0.06, w: 5.75, h: 0.62, fontSize: 8.2, color: BODY, valign: "middle" }); });
  tb(s, "Why no trained classifier for the verdict: no labelled dataset exists (â‰ˆ1,473 national reports in 7 years), a classifier cannot explain itself to a doctor or regulator, and medical decision support must be reproducible. Future ML once data exists: OCR fine-tuning on Indian labels, a named-entity model for prescriptions, and a model that ranks under-reported pairs for curation priority.", { x: 0.3, y: 5.17, w: 9.4, h: 0.22, fontSize: 6.9, italic: true, color: MUT });
}

// ============================================================ 6. Technical approach
{
  const s = slide("5 Â· PROPOSED TECHNICAL APPROACH");
  panel(s, 0.25, 0.8, 3.2, 4.48, "TECH STACK");
  const T = [["FE", "Frontend", "Next.js 16 (React 19) + TypeScript, Tailwind 4, Framer Motion Â· PWA Â· Hindi/English UI"], ["BE", "Backend", "FastAPI (Python), Pydantic v2, SQLAlchemy Â· 25 REST routes with typed errors Â· 58 tests"], ["DB", "Database", "SQLite offline/demo Â· PostgreSQL (Supabase) in production Â· 12 tables incl. curation_drafts"], ["OCR", "OCR", "Tesseract eng+hin on the server; vision model optional"], ["FZ", "Matching", "RapidFuzz token-set; â‰¥85 / 70â€“85 / <70 thresholds"], ["AI", "Explainer", "Groq gpt-oss-120b Â· JSON schema Â· guardrails Â· fallback"], ["TF", "TinyFish", "Fetch Â· Search Â· Web Agent â†’ curation drafts, human-approved"]];
  T.forEach(([k, t, d], i) => { const y = 1.13 + i * 0.585; rr(s, 0.35, y, 3.0, 0.54, LIGHT, LINE, 0.05); rr(s, 0.42, y + 0.12, 0.36, 0.3, k === "TF" ? TF : NV, k === "TF" ? TF : NV, 0.05); tb(s, k, { x: 0.42, y: y + 0.12, w: 0.36, h: 0.3, fontSize: 7, bold: true, color: k === "TF" ? WHITE : SAF, align: "center", valign: "middle" }); tb(s, t, { x: 0.86, y: y + 0.03, w: 2.4, h: 0.18, fontSize: 8, bold: true, color: NV }); tb(s, d, { x: 0.86, y: y + 0.2, w: 2.44, h: 0.34, fontSize: 6.4, color: BODY }); });
  panel(s, 3.6, 0.8, 6.15, 4.48, "ARCHITECTURE Â· TWO LOOPS");
  tb(s, "CHECK LOOP (patient, online or offline)", { x: 3.72, y: 1.12, w: 6, h: 0.2, fontSize: 7.5, bold: true, color: NV, charSpacing: 1 });
  const A = [["1", "Inputs", "photos or typed names"], ["2", "OCR", "Tesseract Â· file deleted"], ["3", "Matcher", "brandâ†’generic Â· user confirms"], ["4", "Rule engine", "R1â€“R5 â†’ verdict", true], ["5", "Explainer", "LLM Â· matched rows only"], ["6", "Outputs", "card Â· PDF Â· ADR Â· log"]];
  A.forEach(([k, t, d, dark], i) => { const x = 3.72 + i * 1.0; rr(s, x, 1.35, 0.92, 0.78, dark ? NV : LIGHT, dark ? NV : LINE, 0.05); badge(s, x + 0.06, 1.41, k, 0.2, dark ? SAF : NV, dark ? NV : SAF); tb(s, t, { x: x + 0.3, y: 1.38, w: 0.6, h: 0.26, fontSize: 7, bold: true, color: dark ? WHITE : NV, valign: "middle" }); tb(s, d, { x: x + 0.06, y: 1.68, w: 0.82, h: 0.42, fontSize: 5.8, color: dark ? "DCE2F0" : BODY }); });
  tb(s, "CURATION LOOP (team, offline from verdicts) Â· TinyFish", { x: 3.72, y: 2.3, w: 6, h: 0.2, fontSize: 7.5, bold: true, color: TF, charSpacing: 1 });
  const B = [["a", "Citations", "DOI / PubMed / URL in KB", LIGHT], ["b", "Fetch API", "page text + title", "EDE9FE"], ["c", "Verify", "title-match â‰¥ 60% â†’ verified; else draft", "EDE9FE"], ["d", "Web Agent", "monograph â†’ candidate rows (JSON)", "EDE9FE"], ["e", "Search+Agent", "product page â†’ ingredients", "EDE9FE"], ["f", "Reviewer", "approve / reject â†’ re-seed KB", LIGHT]];
  B.forEach(([k, t, d, f], i) => { const x = 3.72 + i * 1.0; rr(s, x, 2.53, 0.92, 0.78, f, f === LIGHT ? LINE : "C4B5FD", 0.05); badge(s, x + 0.06, 2.59, k, 0.2, TF, WHITE); tb(s, t, { x: x + 0.3, y: 2.56, w: 0.6, h: 0.26, fontSize: 7, bold: true, color: NV, valign: "middle" }); tb(s, d, { x: x + 0.06, y: 2.86, w: 0.82, h: 0.42, fontSize: 5.8, color: BODY }); });
  tb(s, "GUARDRAILS", { x: 3.72, y: 3.45, w: 2, h: 0.2, fontSize: 7.5, bold: true, color: NV, charSpacing: 1 });
  const G = [["Verdict path", "Worst row wins (RED > AMBER > GREEN); unknown is GREY, never GREEN; grade-C evidence caps at AMBER; identical with AI off."], ["AI guardrail", "LLM receives matched rows only; strict JSON schema; â€œstop / start / dose / mgâ€ rejected in English and Hindi; KB text fallback."], ["Curation guardrail", "TinyFish output lands as a draft with its source URL and run id; nothing changes the knowledge base until a reviewer approves it."]];
  G.forEach(([t, d], i) => { const x = 3.72 + i * 2.0; rr(s, x, 3.68, 1.9, 1.5, LIGHT, LINE, 0.05); tb(s, t, { x: x + 0.08, y: 3.72, w: 1.75, h: 0.26, fontSize: 7.8, bold: true, color: i === 2 ? TF : NV, valign: "middle" }); tb(s, d, { x: x + 0.08, y: 4.0, w: 1.75, h: 1.15, fontSize: 6.5, color: BODY }); });
}

// ============================================================ 7. TinyFish integration (the required slide)
{
  const s = slide("6 Â· PROPOSED TINYFISH INTEGRATION", "Functional in the prototype");
  rr(s, 0.25, 0.8, 9.5, 0.55, "EDE9FE", "C4B5FD", 0.05);
  s.addText([{ text: "TinyFish is TakeSure's research assistant. ", options: { bold: true, color: TF } }, { text: "It opens the references, reads monographs and product pages, and drafts knowledge-base rows with the source attached. Reviewers approve every row. The verdict path never touches the live web â€” that is a safety rule, not a limitation.", options: { color: BODY } }], { isTextBox: true, x: 0.4, y: 0.84, w: 9.2, h: 0.48, fontFace: SANS, fontSize: 8.8, margin: 0, valign: "middle" });
  const J = [["Fetch API", "Verify citations", "Three stages: Fetch the resolved DOI / PubMed / monograph page; for bot-blocked publishers Fetch the Crossref record; for sources without a locator, Search the title. â‰¥60% of distinctive title terms matched â†’ verification_status = verified; otherwise a â€œmismatchâ€ draft with the best candidate.", "Live run 19 Oct: 55 of 78 citations verified automatically; 23 listed for review (3 broken links found). Free tier."],
    ["Web Agent", "Discover interaction rows", "Fetch the MSKCC About Herbs page (free, 2 s) and extract every clinical bullet naming a drug, class or interaction verb from our drug dictionary; if the static page yields nothing, POST /v1/automation/run-async with a JSON output_schema and poll the run.", "Live: 7 candidates for ashwagandha and 4 for turmeric in seconds (Fetch + rules); Web Agent fallback used for guggul."],
    ["Search + Agent", "Map Indian products", "GET api.search.tinyfish.ai for the product page, then an Agent run extracts the ingredient list with Latin/Sanskrit names; we match them to known herbs.", "Live: Dabur Giloy Ghanvati mapped to giloy (1 g/tablet) in one Agent run (28 steps)."]];
  J.forEach(([api, t, d, w], i) => { const y = 1.5 + i * 1.02; rr(s, 0.25, y, 6.2, 0.94, WHITE, LINE, 0.05); rr(s, 0.35, y + 0.1, 1.15, 0.3, TF, TF, 0.05); tb(s, api, { x: 0.35, y: y + 0.1, w: 1.15, h: 0.3, fontSize: 8, bold: true, color: WHITE, align: "center", valign: "middle" }); tb(s, t, { x: 1.6, y: y + 0.08, w: 4.7, h: 0.3, fontSize: 10, bold: true, color: NV, valign: "middle" }); tb(s, d, { x: 0.35, y: y + 0.42, w: 6.0, h: 0.5, fontSize: 7.2, color: BODY }); rr(s, 6.6, y, 3.15, 0.94, LIGHT, LINE, 0.05); tb(s, "Why it matters", { x: 6.7, y: y + 0.06, w: 3, h: 0.2, fontSize: 7, bold: true, color: TF }); tb(s, w, { x: 6.7, y: y + 0.28, w: 2.95, h: 0.62, fontSize: 7.6, color: BODY }); });
  panel(s, 0.25, 4.62, 9.5, 0.68, "IMPLEMENTATION STATUS Â· DEMONSTRABLE", TF);
  tb(s, "Backend: app/services/tinyfish_service.py (Fetch, Search, Agent clients), curation_drafts table, 7 API routes under /api/curation, 7 offline tests with a mocked TinyFish transport. Frontend: â€œEvidence curationâ€ panel on the dashboard with Verify / Discover / Map actions and an approve-reject draft queue. Config: TINYFISH_API_KEY only on the server. Live demo: verify 10 citations â†’ sources-verified counter rises.", { x: 0.4, y: 4.9, w: 9.2, h: 0.4, fontSize: 7.4, color: BODY });
}

// ============================================================ 8. Prototype (screenshots)
{
  const s = slide("7 Â· WORKING PROTOTYPE", "Captured 18â€“19 Oct 2026");
  rr(s, 0.25, 0.8, 4.65, 4.45, WHITE, LINE, 0.05);
  s.addImage({ path: SHOT_RESULT, x: 0.35, y: 1.12, w: 4.45, h: 2.99 });
  tb(s, "Result screen: AMBER for Ashwagandha + Levothyroxine â€” rule shown, AI explanation labelled, 3 doctor questions, sources with grade.", { x: 0.35, y: 0.86, w: 4.45, h: 0.24, fontSize: 7.4, bold: true, color: NV });
  tb(s, "Also live: photo upload + OCR, review-and-confirm screen, Hindi toggle, knowledge-base explorer, ADR form in Ministry format, doctor PDF, anonymised dashboard.", { x: 0.35, y: 4.2, w: 4.45, h: 0.95, fontSize: 7.4, color: BODY });
  rr(s, 5.1, 0.8, 4.65, 4.45, WHITE, LINE, 0.05);
  s.addImage({ path: SHOT_CUR, x: 5.6, y: 1.12, w: 3.65, h: 2.96 });
  tb(s, "Evidence-curation panel (TinyFish): verify citations, draft rows from monographs, map products; draft queue with approve / reject.", { x: 5.2, y: 0.86, w: 4.45, h: 0.24, fontSize: 7.4, bold: true, color: TF });
  tb(s, "Numbers today: 49 interactions Â· 78 sources Â· 16 herbs Â· 34 drugs Â· 28 products Â· 25 API routes Â· 58 automated tests (all offline). Runs on one laptop without internet except the AI wording and curation jobs.", { x: 5.2, y: 4.2, w: 4.45, h: 0.95, fontSize: 7.4, color: BODY });
}

// ============================================================ 9. Expected impact + feasibility
{
  const s = slide("8 Â· EXPECTED IMPACT & FEASIBILITY");
  panel(s, 0.25, 0.8, 4.65, 2.3, "EXPECTED IMPACT");
  bullets(s, [["Patients & caregivers: ", "a sourced answer before the first dose, in their language, free. 75% of herbal users with a side effect never told their doctor â€” we hand them the questions."], ["Doctors, vaidyas, chemists: ", "finally learn what patients take; QR on the bill; API inside hospital and telemedicine systems."], ["Ministry of Ayush: ", "structured ICSRs and real co-use data for the 99 peripheral centres' catchment; 1,473 reports since 2018 can multiply."], ["Research: ", "an open, graded, Indian-brand-aware interaction table that colleges can co-curate."]], 0.4, 1.12, 4.4, 1.95, 7.9);
  panel(s, 5.1, 0.8, 4.65, 2.3, "FEASIBILITY");
  bullets(s, [["Already built and tested: ", "end-to-end prototype, 58 tests, verified in the browser."], ["Proven components, no training: ", "Tesseract, RapidFuzz, FastAPI, SQLite/Postgres, Groq, TinyFish SDK/HTTP."], ["Cost: ", "TinyFish Search and Fetch are free; Agent runs â‰ˆ $0.016/step with 500 free steps â€” verifying 78 citations fits the free tier."], ["Team of 3 with clear roles; ", "whole stack runs offline on a laptop, so venue internet is not a risk."]], 5.25, 1.12, 4.4, 1.95, 7.9);
  panel(s, 0.25, 3.25, 9.5, 2.0, "24-HOUR BUILD PLAN (31 OCT â€“ 1 NOV)");
  const P = [["0â€“3 h", "Set up at venue; load KB; core loop photo â†’ OCR â†’ confirm â†’ verdict green"], ["3â€“9 h", "TinyFish verifier over all 78 citations; reviewer pass on mismatches"], ["9â€“15 h", "Agent discovery for 16 herbs â†’ draft rows â†’ review â†’ 100+ rows"], ["15â€“19 h", "Product mapping for top 30 Indian products; Hindi in every PDF"], ["19â€“22 h", "Public deploy (Vercel + Render + Supabase); chemist QR flow"], ["22â€“24 h", "Freeze, run tests, rehearse demo on the deployed link"]];
  P.forEach(([t, d], i) => { const x = 0.4 + i * 1.56; rr(s, x, 3.6, 1.48, 1.5, LIGHT, LINE, 0.05); rr(s, x, 3.6, 1.48, 0.3, i === 1 || i === 2 || i === 3 ? TF : NV, i === 1 || i === 2 || i === 3 ? TF : NV, 0.05); tb(s, t, { x, y: 3.6, w: 1.48, h: 0.3, fontSize: 8.5, bold: true, color: WHITE, align: "center", valign: "middle" }); tb(s, d, { x: x + 0.08, y: 3.96, w: 1.32, h: 1.1, fontSize: 7.2, color: BODY }); });
}

// ============================================================ 10. Future scope + references
{
  const s = slide("9 Â· FUTURE SCOPE & REFERENCES");
  panel(s, 0.25, 0.8, 4.65, 4.45, "FUTURE SCOPE");
  bullets(s, [["Knowledge base: ", "200+ pairs; second-reviewer rule on every citation; faculty review with an Ayurveda college or pharmacology department before public release."], ["ML once data exists: ", "OCR fine-tuned on Indian labels and handwriting; a named-entity model for prescriptions; ranking of under-reported pairs for curation priority."], ["TinyFish: ", "scheduled re-verification of every citation (monthly); agent monitoring of LiverTox and Ayush Suraksha for new signals; product-catalogue sweeps of Himalaya, Dabur, Patanjali, Baidyanath."], ["Integration: ", "Ayush Grid / ABDM so the verdict and ADR sit on the ABHA record; pharmacy-chain API; chemist QR pilot in one city."], ["Out of scope by design: ", "diagnosis, dosing, herbâ€“herb interactions, any trained model deciding a verdict."]], 0.4, 1.12, 4.4, 4.05, 8.2);
  panel(s, 5.1, 0.8, 4.65, 4.45, "REFERENCES");
  const refs = [["Sharma 2018: ashwagandha & thyroid RCT", "https://pubmed.ncbi.nlm.nih.gov/28829155/"], ["Gannon 2014: Withania & thyroid indices", "https://doi.org/10.4103/0975-9476.146566"], ["Gohil & Patel 2007: herbâ€“drug case reports", "https://doi.org/10.4103/0253-7613.33432"], ["Ghosh 2009: herbâ€“drug interaction, JCDR", "https://www.jcdr.net/articles/PDF/576/501.pdf"], ["NSSO Ayush survey 2022-23 (MoSPI)", "https://www.mospi.gov.in/sites/default/files/press_release/PressNote_Ayush_13062024N.pdf"], ["Ayush Suraksha portal", "https://suraksha.ayush.gov.in/"], ["ITRA pharmacovigilance network", "https://itra.ac.in/pharmacovigilance"], ["MSKCC About Herbs Â· NIH LiverTox", "https://www.mskcc.org/cancer-care/integrative-medicine/herbs"], ["TinyFish documentation", "https://docs.tinyfish.ai/"], ["Tesseract Â· RapidFuzz (open source)", "https://github.com/tesseract-ocr/tesseract"]];
  refs.forEach(([t, u], i) => { const y = 1.12 + i * 0.4; badge(s, 5.22, y + 0.06, i + 1, 0.22); tb(s, t, { x: 5.52, y, w: 4.1, h: 0.18, fontSize: 7.6, bold: true, color: NV }); s.addText([{ text: u.replace("https://", "").slice(0, 58), options: { hyperlink: { url: u }, color: "1155CC", underline: { style: "sng" } } }], { isTextBox: true, x: 5.52, y: y + 0.18, w: 4.1, h: 0.16, fontFace: SANS, fontSize: 6.4, margin: 0 }); });
}

pres.writeFile({ fileName: "TakeSure_BugHunters_KriticalHacks2026_navy.pptx" }).then(f => console.log("written", f));

