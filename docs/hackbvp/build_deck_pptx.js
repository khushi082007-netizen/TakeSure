// TakeSure — Hack@BVP 8.0 deck. Same content as the CodeSlayer submission, new template.
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10 x 5.625 in
pres.author = "Team Bug Hunters"; pres.title = "TakeSure — Hack@BVP 8.0";

const NV = "14213D", SAF = "F4A300", INK = "1B1B1B", MUT = "5D6166", LIGHT = "F4F6FA", LINE = "C9D0DD", BODY = "333333", WHITE = "FFFFFF";
const SANS = "Calibri", SERIF = "Cambria";
const HERO = "C:/Temp/bvp/pptx/img/hero.png", FLOW = "C:/Temp/final-ppt/flowchart_big_text.png";
let slideNo = 0;

function tb(s, text, o) { s.addText(text, Object.assign({ isTextBox: true, fontFace: SANS, color: BODY, margin: 0, valign: "top" }, o)); }
function rect(s, x, y, w, h, fill, line) { s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: fill }, line: line ? { color: line, width: 0.75 } : { color: fill, width: 0 } }); }
function rr(s, x, y, w, h, fill, line, r) { s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: r || 0.06, fill: { color: fill }, line: { color: line || fill, width: 0.75 } }); }
function badge(s, x, y, n, d, fill, col) { d = d || 0.26; s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill || NV }, line: { color: fill || NV } }); tb(s, String(n), { x, y, w: d, h: d, fontSize: d * 36, bold: true, color: col || SAF, align: "center", valign: "middle" }); }
function panel(s, x, y, w, h, title) { rr(s, x, y, w, h, WHITE, LINE, 0.05); rect(s, x, y, w, 0.26, NV); tb(s, title, { x: x + 0.1, y, w: w - 0.2, h: 0.26, fontSize: 8.5, bold: true, color: WHITE, valign: "middle", charSpacing: 1 }); }
function runs(s, items, x, y, w, h, fs, opts) { // items: [[bold, text], ...] each as a paragraph
  const r = [];
  items.forEach(([b, t], i) => { if (b) r.push({ text: b, options: Object.assign({ bold: true, color: NV }, (opts && opts.first) || {}) }); r.push({ text: t, options: { color: BODY, breakLine: i < items.length - 1 } }); });
  s.addText(r, Object.assign({ isTextBox: true, x, y, w, h, fontFace: SANS, fontSize: fs, margin: 0, valign: "top", paraSpaceAfter: 3 }, (opts && opts.box) || {}));
}
function bullets(s, items, x, y, w, h, fs, color) {
  const r = [];
  items.forEach(([b, t], i) => { if (b) r.push({ text: b, options: { bold: true, color: NV, bullet: { indent: 9 } } }); r.push({ text: t, options: { color: color || BODY, breakLine: i < items.length - 1, bullet: b ? undefined : { indent: 9 } } }); });
  s.addText(r, { isTextBox: true, x, y, w, h, fontFace: SANS, fontSize: fs, margin: 0, valign: "top", paraSpaceAfter: 2 });
}
function newSlide(title, sub) {
  const s = pres.addSlide(); slideNo++;
  s.background = { color: "F7F8FB" };
  rect(s, 0, 0, 10, 0.62, NV); rect(s, 0, 0.62, 10, 0.04, SAF);
  rr(s, 0.25, 0.14, 1.35, 0.34, SAF, SAF, 0.17); tb(s, "Bug Hunters", { x: 0.25, y: 0.14, w: 1.35, h: 0.34, fontSize: 10.5, bold: true, color: NV, align: "center", valign: "middle" });
  tb(s, title, { x: 1.75, y: 0.07, w: 6.2, h: 0.5, fontFace: SERIF, fontSize: 18, bold: true, color: WHITE, valign: "middle" });
  tb(s, "HACK@BVP 8.0\nBVCOE · New Delhi", { x: 8.0, y: 0.1, w: 1.75, h: 0.44, fontSize: 8.5, bold: true, color: SAF, align: "right", valign: "middle", lineSpacingMultiple: 1.05 });
  rect(s, 0, 5.4, 10, 0.225, NV);
  tb(s, "TakeSure · Confidence before taking something · Team Bug Hunters · HACK@BVP 8.0", { x: 0.25, y: 5.4, w: 7, h: 0.225, fontSize: 7, color: "C9D1E0", valign: "middle" });
  tb(s, "Decision support · not diagnosis   " + slideNo, { x: 7.0, y: 5.4, w: 2.75, h: 0.225, fontSize: 7, color: "C9D1E0", align: "right", valign: "middle" });
  return s;
}

// =============================================================== 1. Title
{
  const s = pres.addSlide(); slideNo++;
  s.background = { color: NV };
  rect(s, 0, 0, 10, 0.08, SAF);
  s.addImage({ path: HERO, x: 7.3, y: 0.45, w: 2.3, h: 0.67 });
  rr(s, 0.5, 0.5, 1.5, 0.38, SAF, SAF, 0.19); tb(s, "Bug Hunters", { x: 0.5, y: 0.5, w: 1.5, h: 0.38, fontSize: 12, bold: true, color: NV, align: "center", valign: "middle" });
  tb(s, "HACK@BVP 8.0 · Bharati Vidyapeeth's College of Engineering, New Delhi · Round 1", { x: 2.15, y: 0.5, w: 5.1, h: 0.38, fontSize: 9.5, color: "C9D1E0", valign: "middle" });
  s.addText([{ text: "TakeSure", options: { color: WHITE } }, { text: " — Confidence before taking something", options: { color: SAF } }], { isTextBox: true, x: 0.5, y: 1.15, w: 9, h: 0.75, fontFace: SERIF, fontSize: 30, bold: true, margin: 0, valign: "middle" });
  const L = [["Project Title", "TakeSure — Confidence before taking something. Ayurveda × Allopathy herb–drug interaction checker: photo of prescription + photo of product → sourced, plain-language safety verdict + Ministry of Ayush ADR report."],
    ["Team Name", "Bug Hunters"],
    ["Team Members", "Dhriti Garg — Team lead · backend, rule engine, medical research\nShiwani Goyal — Frontend · web app, Hindi/English UI, result card, demo video & pitch\nKhushi Gupta — Knowledge base & evidence grading, OCR, PDF/ADR export"],
    ["Track Chosen", "Health & Well-Being (AI4Impact secondary) · SDG 3 · SDG 9 · SDG 10"],
    ["Explanation video", "https://drive.google.com/file/d/13c1pPE8lp9RVvS2NlUYUJiIB65z5fgvx/view"]];
  let y = 2.05;
  L.forEach(([k, v], i) => {
    const h = [0.62, 0.3, 0.72, 0.3, 0.3][i];
    tb(s, k + " :", { x: 0.5, y, w: 1.7, h, fontSize: 11.5, bold: true, color: SAF, valign: "top" });
    if (k === "Explanation video") s.addText([{ text: v, options: { hyperlink: { url: v }, color: "9DB4E0", underline: { style: "sng" } } }], { isTextBox: true, x: 2.25, y, w: 7.25, h, fontFace: SANS, fontSize: 10, margin: 0, valign: "top" });
    else tb(s, v, { x: 2.25, y, w: 7.25, h, fontSize: k === "Team Name" ? 12 : 10.5, bold: k === "Team Name", italic: k === "Team Name", color: k === "Team Name" ? WHITE : "E3E8F2", valign: "top", lineSpacingMultiple: 1.08 });
    y += h + 0.1;
  });
  rect(s, 0, 5.2, 10, 0.405, "0E172C");
  tb(s, "Aligned with the Ministry of Ayush Pharmacovigilance Programme for ASU&H drugs · decision support, never diagnosis", { x: 0.5, y: 5.2, w: 9, h: 0.405, fontSize: 8.5, italic: true, color: "9DB4E0", valign: "middle" });
}

// =============================================================== 2. Problem & target audience
{
  const s = newSlide("PROBLEM STATEMENT & TARGET AUDIENCE");
  panel(s, 0.25, 0.85, 6.1, 3.0, "PROBLEM WE'RE SOLVING");
  const P = [["India runs two medical systems side by side — and nobody checks the combination. ", "A thyroid patient on Thyronorm adds ashwagandha for stress; a transplant patient on tacrolimus drinks giloy kadha; a cardiac patient on warfarin takes guggul for cholesterol. Ashwagandha can raise thyroid hormone, giloy can oppose immunosuppression, guggul can increase bleeding."],
    ["The allopathic doctor rarely asks, the patient rarely tells, the chemist has no tool, ", "and the product label says nothing about allopathic medicines."],
    ["Existing checkers (Medscape, Drugs.com, 1mg) only know allopathic × allopathic pairs; ", "Western herb databases are English-only, paid and do not know Indian brands like Himalaya Ashvagandha or Dabur Giloy Ghanvati."]];
  let y = 1.2;
  P.forEach(([b, t], i) => { const h = [0.9, 0.42, 0.62][i]; badge(s, 0.4, y + 0.02, i + 1); s.addText([{ text: b, options: { bold: true, color: NV } }, { text: t, options: { color: BODY } }], { isTextBox: true, x: 0.78, y, w: 5.45, h, fontFace: SANS, fontSize: 8.6, margin: 0, valign: "top" }); y += h + 0.04; });
  const ST = [["37%", "of hospital patients used allopathic + herbal medicines together"], ["65%", "of herbal users lacked knowledge of dose, side effects, interactions"], ["19%", "of Indian patients disclose herbal use to their doctor"], ["1,473", "ASU&H adverse-event reports nationally since 2018"]];
  ST.forEach(([v, d], i) => { const x = 0.4 + i * 1.48; rr(s, x, 3.2, 1.4, 0.58, LIGHT, LINE, 0.05); tb(s, v, { x: x + 0.07, y: 3.22, w: 0.62, h: 0.54, fontSize: 13, bold: true, color: i % 2 ? "B86E00" : NV, valign: "middle" }); tb(s, d, { x: x + 0.66, y: 3.24, w: 0.72, h: 0.52, fontSize: 6.3, color: MUT, valign: "middle" }); });
  tb(s, "Impacted: patients on thyroid, diabetes, BP/heart, blood-thinner, transplant or epilepsy medicines and their families; doctors who never hear about the co-use; the Ministry's pharmacovigilance network that never receives the reports.", { x: 0.4, y: 3.95, w: 5.95, h: 0.5, fontSize: 7.6, italic: true, color: MUT });
  panel(s, 6.55, 0.85, 3.2, 4.4, "TARGET USERS");
  const U = [["B2C", "Patients & caregivers", "Adults 30–70 on long-term medicines who also take Ayurvedic products; family members managing an elder's medicines; Hindi or English, phone-first."],
    ["B2B", "Clinicians & pharmacies", "MBBS/MD doctors, BAMS vaidyas, hospital pharmacies, retail chemists, telemedicine and hospital-HIS platforms (API)."],
    ["B2G", "Regulators", "Ministry of Ayush / NPvCC at AIIA and the 99 Peripheral Pharmacovigilance Centres: structured ICSRs and co-use analytics."]];
  U.forEach(([k, t, d], i) => { const y = 1.25 + i * 1.3; rr(s, 6.7, y, 2.9, 1.18, LIGHT, LINE, 0.05); rr(s, 6.8, y + 0.1, 0.55, 0.26, SAF, SAF, 0.05); tb(s, k, { x: 6.8, y: y + 0.1, w: 0.55, h: 0.26, fontSize: 8.5, bold: true, color: NV, align: "center", valign: "middle" }); tb(s, t, { x: 7.42, y: y + 0.1, w: 2.1, h: 0.26, fontSize: 9.5, bold: true, color: NV, valign: "middle" }); tb(s, d, { x: 6.8, y: y + 0.42, w: 2.7, h: 0.72, fontSize: 7.6, color: BODY }); });
  s.addNotes("Problem: two systems, nobody checks; three examples; nobody asks or tells; existing tools miss Indian products. Four statistics. Three user groups: patients, clinicians/pharmacies, regulators.");
}

// =============================================================== 3. Unique solution
{
  const s = newSlide("TAKESURE — OUR UNIQUE SOLUTION");
  tb(s, "Key Features", { x: 0.3, y: 0.8, w: 3, h: 0.3, fontFace: SERIF, fontSize: 13, bold: true, color: NV });
  const F = [["Scan — ", "Photograph the prescription and the Ayurvedic product label (or type names). OCR reads them; every name is shown for confirmation before anything is checked."],
    ["Match — ", "Indian brand → generic (Thyronorm → levothyroxine), product → herbs (Chyawanprash → amla, ashwagandha…) via a curated bridge dictionary + fuzzy matching."],
    ["Decide — ", "Deterministic rule engine over a cited knowledge base → GREEN / AMBER / RED / NOT IN DATABASE, with timing gaps (e.g. keep 2–3 h between Triphala and oral medicines)."],
    ["Explain — ", "AI rewrites only the matched evidence into simple Hindi/English + 3 questions to ask the doctor. It cannot add, remove or re-grade an interaction."],
    ["Report — ", "One-page PDF with sources for the doctor; one-tap suspected-ADR report in the Ministry of Ayush format for the Ayush Suraksha portal."]];
  let y = 1.15;
  F.forEach(([b, t], i) => { badge(s, 0.32, y + 0.02, i + 1); s.addText([{ text: b, options: { bold: true, color: NV } }, { text: t, options: { color: BODY } }], { isTextBox: true, x: 0.68, y, w: 5.35, h: 0.52, fontFace: SANS, fontSize: 8.6, margin: 0, valign: "top" }); y += 0.56; });
  tb(s, "Novelty", { x: 0.3, y: 3.98, w: 3, h: 0.3, fontFace: SERIF, fontSize: 13, bold: true, color: NV });
  s.addText([{ text: "“Verdict from published data; AI only explains.” ", options: { bold: true, color: NV, bullet: { indent: 10 } } }, { text: "The risk level never comes from a language model — it comes from a versioned, cited knowledge-base row. Turn the AI off and the verdict is identical.", options: { color: BODY, breakLine: true } },
    { text: "The missing bridge table: ", options: { bold: true, color: NV, bullet: { indent: 10 } } }, { text: "Indian brand names × Ayurvedic herb synonyms (Sanskrit/Hindi/Latin) × graded published evidence — open, auditable, co-curated with Ayurveda colleges.", options: { color: BODY } }],
    { isTextBox: true, x: 0.32, y: 4.28, w: 5.7, h: 1.05, fontFace: SANS, fontSize: 8.4, margin: 0, valign: "top", paraSpaceAfter: 3 });
  rr(s, 6.25, 0.78, 3.5, 4.52, WHITE, LINE, 0.05);
  s.addImage({ path: FLOW, x: 6.95, y: 0.82, w: 2.7, h: 4.41 });
  tb(s, "Project workflow", { x: 6.3, y: 0.82, w: 0.65, h: 0.2, fontSize: 6.5, bold: true, color: MUT });
  s.addNotes("Five features: Scan, Match, Decide, Explain, Report. Novelty: verdict from data, AI only explains; the bridge table nobody has built. Right: the project workflow.");
}

// =============================================================== 4. Tech stack + architecture
{
  const s = newSlide("TECH STACK + ARCHITECTURE");
  panel(s, 0.25, 0.8, 3.2, 4.48, "TECH STACK");
  const T = [["FE", "Frontend", "Next.js (React) + TypeScript, Tailwind CSS, Framer Motion · installable PWA · Hindi/English UI"],
    ["BE", "Backend", "FastAPI (Python), Pydantic v2 validation, SQLAlchemy · REST API with typed errors"],
    ["DB", "Database", "PostgreSQL (Supabase) in production; SQLite for offline/demo · tables: herbs, drugs, products, interactions, sources"],
    ["OCR", "OCR", "Tesseract (eng + hin) on the server; Google Vision / Groq vision model as optional cloud reader"],
    ["FZ", "Matching", "RapidFuzz token-set matching; ≥85 accept, 70–85 ask the user, <70 not recognised"],
    ["AI", "AI explainer", "Groq API (Llama / GPT-OSS) with JSON-schema output, temperature 0, facts-only prompt, fallback text"],
    ["PDF", "PDF & hosting", "ReportLab for doctor summary + ADR form · Vercel (web) + Render/Railway (API)"]];
  T.forEach(([k, t, d], i) => { const y = 1.13 + i * 0.585; rr(s, 0.35, y, 3.0, 0.54, LIGHT, LINE, 0.05); rr(s, 0.42, y + 0.12, 0.36, 0.3, NV, NV, 0.05); tb(s, k, { x: 0.42, y: y + 0.12, w: 0.36, h: 0.3, fontSize: 7, bold: true, color: SAF, align: "center", valign: "middle" }); tb(s, t, { x: 0.86, y: y + 0.03, w: 2.4, h: 0.18, fontSize: 8, bold: true, color: NV }); tb(s, d, { x: 0.86, y: y + 0.2, w: 2.44, h: 0.34, fontSize: 6.4, color: BODY, lineSpacingMultiple: 1.0 }); });
  panel(s, 3.6, 0.8, 6.15, 4.48, "ARCHITECTURE");
  const A = [["1", "Inputs", "Prescription + product label photos, or typed names", LIGHT, NV],
    ["2", "OCR", "Tesseract eng+hin / vision model · file deleted after read", LIGHT, NV],
    ["3", "Matcher", "RapidFuzz · brand→generic · product→herbs · user confirms", LIGHT, NV],
    ["4", "Rule engine (decides)", "Rules R1–R5: severity + grade → GREEN / AMBER / RED / NOT IN DB", NV, WHITE],
    ["5", "Explainer (AI)", "Groq LLM · matched rows only · JSON schema · cannot change verdict", LIGHT, NV],
    ["6", "Outputs", "Result card (Hindi/English) · doctor PDF · ADR report", LIGHT, NV],
    ["7", "Anonymised log", "ids + verdict + state → dashboard for Ministry / NPvCC", LIGHT, NV],
    ["DB", "Knowledge base", "PostgreSQL / SQLite · herb × drug rows: severity, grade A/B/C, timing, DOI/PMID", "FFF4DC", NV]];
  A.forEach(([n, t, d, f, c], i) => { const x = 3.72 + (i % 4) * 1.49, y = 1.13 + Math.floor(i / 4) * 1.0; rr(s, x, y, 1.4, 0.92, f, f === LIGHT ? LINE : f, 0.05); badge(s, x + 0.07, y + 0.07, n, 0.24, f === NV ? SAF : NV, f === NV ? NV : SAF); tb(s, t, { x: x + 0.36, y: y + 0.06, w: 1.0, h: 0.26, fontSize: 7.6, bold: true, color: c, valign: "middle" }); tb(s, d, { x: x + 0.07, y: y + 0.36, w: 1.27, h: 0.54, fontSize: 6.3, color: f === NV ? "DCE2F0" : BODY }); });
  tb(s, "FLOW", { x: 3.72, y: 3.2, w: 2, h: 0.22, fontSize: 8, bold: true, color: NV, charSpacing: 1 });
  const FL = [["Verdict path", "Photos → OCR text → candidate names → user confirms → rule engine looks up every herb × medicine pair → worst row wins (RED > AMBER > GREEN; unknown is never GREEN)."],
    ["AI guardrail", "Only matched rows go to the LLM, which returns {summary_hi, summary_en, timing_gap, doctor_questions[3]}; invalid or directive output is rejected and the knowledge-base text is shown instead."],
    ["Privacy", "Uploads are deleted after extraction; the log stores ids and verdicts only — the basis of the anonymised dashboard for the Ministry of Ayush."]];
  FL.forEach(([t, d], i) => { const x = 3.72 + i * 2.0; rr(s, x, 3.45, 1.9, 1.72, LIGHT, LINE, 0.05); badge(s, x + 0.07, 3.52, i + 1, 0.22); tb(s, t, { x: x + 0.34, y: 3.5, w: 1.5, h: 0.26, fontSize: 7.8, bold: true, color: NV, valign: "middle" }); tb(s, d, { x: x + 0.08, y: 3.8, w: 1.75, h: 1.34, fontSize: 6.5, color: BODY }); });
  s.addNotes("Stack left; eight architecture blocks right; three flow notes: verdict path, AI guardrail, privacy.");
}

// =============================================================== 5. Feasibility & showstoppers
{
  const s = newSlide("FEASIBILITY AND SHOWSTOPPERS");
  const C = [["TECHNICAL", ["Proven, off-the-shelf stack", "OCR: Google Vision / Paddle OCR", "RapidFuzz for name matching", "SQL for KB lookup", "LLM only explains — rules decide risk", "No custom ML training"]],
    ["DATA & EVIDENCE", ["Public / citable sources: Ayurvedic Pharmacopoeia, NIH LiverTox, MSKCC, PubMed, WHO monographs", "Every entry stores evidence, severity & source", "Evidence graded A / B / C"]],
    ["RESOURCES", ["Team: Backend · Mobile/Frontend · Data curation", "Local/offline components + free/low-cost infrastructure", "Swappable LLM provider"]],
    ["MVP SCOPE", ["~40 herb–drug pairs · 2 photo inputs · manual text-entry fallback · risk / safety card · ADR reporting form", "Not in MVP: diagnosis · dosing · herb–herb interactions · custom ML training"]],
    ["REGULATORY / OPERATIONAL SAFETY", ["ADR workflow aligned with Ministry/ICSR fields", "Links to Ayush Suraksha instead of a parallel reporting system", "Photos not retained beyond the session unless the user opts in", "Decision support — not diagnosis or prescription"]]];
  const pos = [[0.25, 0.8, 2.15, 1.55], [2.5, 0.8, 2.15, 1.55], [0.25, 2.45, 2.15, 1.3], [2.5, 2.45, 2.15, 1.3], [0.25, 3.85, 4.4, 1.42]];
  C.forEach(([t, items], i) => { const [x, y, w, h] = pos[i]; rr(s, x, y, w, h, WHITE, LINE, 0.05); rect(s, x, y, w, 0.24, i === 4 ? "7A1F2B" : NV); tb(s, t, { x: x + 0.08, y, w: w - 0.16, h: 0.24, fontSize: 7.5, bold: true, color: WHITE, valign: "middle" }); bullets(s, items.map(it => [null, it]), x + 0.08, y + 0.3, w - 0.16, h - 0.34, 6.6); });
  tb(s, "FEASIBILITY", { x: 0.25, y: 5.28, w: 4.4, h: 0.12, fontSize: 1, color: "F7F8FB" });
  // risk table
  const hdr = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: NV }, fontSize: 7.5, valign: "middle" } });
  const c = (t, o) => ({ text: t, options: Object.assign({ fontSize: 6.4, color: BODY, valign: "top" }, o || {}) });
  const R = [["OCR misread", "Handwritten prescriptions · poor-quality or unusual printed labels", "Extracted names shown for user confirmation · manual text entry always available · fuzzy-matching thresholds separate confident from uncertain matches"],
    ["Unknown herb / drug", "Herb or drug may not be in the KB · coverage gaps", "NEVER guess · neutral “NOT IN DATABASE” result · unknown items logged for future curation · MVP deliberately scoped"],
    ["Weak / conflicting evidence", "Limited clinical evidence · sources may disagree", "A/B/C grade on every result · source / reference visible · conflicting sources kept at lower confidence, not hidden · KB entries reviewed before publication"],
    ["LLM hallucination", "Unsupported medical claims", "LLM receives ONLY matched KB info · never determines severity or verdict · schema-validated output · raw KB text if validation fails · safety decision works with LLM off"],
    ["Medical liability / safety scope", "Users may read it as a prescription or diagnosis tool", "Positioned as DECISION SUPPORT · never says stop / start · no diagnosis or dosing · evidence + sources shown · questions for the doctor · report-incorrect-info mechanism"],
    ["API / connectivity failure", "Internet or external API / provider failure", "Local / offline fallback · SQLite KB · PaddleOCR runs locally · LLM provider swappable · DB lookup independent of LLM · cached outputs for demo continuity"]];
  const rows = [[hdr("RISK / BLOCKER"), hdr("MITIGATION")]];
  R.forEach(([t, d, m], i) => rows.push([{ text: [{ text: t + "\n", options: { bold: true, color: i >= 3 ? "7A1F2B" : NV, fontSize: 6.8 } }, { text: d, options: { color: MUT, fontSize: 6.2 } }], options: { valign: "top", fill: { color: i % 2 ? WHITE : LIGHT } } }, c(m, { fill: { color: i % 2 ? WHITE : LIGHT } })]));
  s.addTable(rows, { x: 4.8, y: 0.8, w: 4.95, colW: [1.75, 3.2], rowH: [0.26, 0.66, 0.66, 0.7, 0.7, 0.7, 0.7], fontFace: SANS, border: { type: "solid", color: LINE, pt: 0.5 }, margin: 0.04 });
  s.addNotes("Five feasibility boxes; six risks with mitigations.");
}

// =============================================================== 6. USP & business model
{
  const s = newSlide("USP (UNIQUE SELLING PROPOSITION) & BUSINESS MODEL");
  panel(s, 0.25, 0.8, 4.7, 2.72, "USP (UNIQUE SELLING PROPOSITION)");
  const U = [["India's first safety layer between the two medical systems people already mix", " — nothing public today checks an Ayurvedic product against an allopathic prescription."],
    ["Verdict from published data; AI only explains", " — auditable rules over cited rows; the opposite of a “ChatGPT wrapper”."],
    ["Built for India:", " Indian brand names, Sanskrit/Hindi synonyms, Hindi explanations, Ministry of Ayush ADR format, Ayush Suraksha portal link."],
    ["Honest by design:", " evidence grades, timing gaps instead of alarms, “not in database” instead of guesses."]];
  U.forEach(([b, t], i) => { const y = 1.14 + i * 0.58; rr(s, 0.35, y, 4.5, 0.52, LIGHT, LINE, 0.05); badge(s, 0.42, y + 0.13, i + 1, 0.26); s.addText([{ text: b, options: { bold: true, color: NV } }, { text: t, options: { color: BODY } }], { isTextBox: true, x: 0.76, y: y + 0.04, w: 4.03, h: 0.46, fontFace: SANS, fontSize: 7.4, margin: 0, valign: "middle" }); });
  panel(s, 5.05, 0.8, 4.7, 2.72, "BUSINESS MODEL");
  const B = [["B2C", "Free for citizens", " — Web/PWA checker in Hindi & English; grows the knowledge base and the ADR signal."],
    ["B2B", "API & counter tool", " — Per-query / subscription API for pharmacy chains, hospital HIS, telemedicine apps; QR on the chemist's bill."],
    ["B2G / CSR", "Programmes & grants", " — Co-use analytics and structured ICSRs for the Ministry of Ayush pharmacovigilance network; CSR funding from Ayurvedic brands that want a trust layer."],
    ["PLATFORM", "Ayush Grid / ABDM integration", " — verdict attached to the ABHA health record; open KB co-curated with Ayurveda colleges."]];
  B.forEach(([k, b, t], i) => { const y = 1.14 + i * 0.58; rr(s, 5.15, y, 4.5, 0.52, LIGHT, LINE, 0.05); rr(s, 5.22, y + 0.12, 0.72, 0.28, NV, NV, 0.04); tb(s, k, { x: 5.22, y: y + 0.12, w: 0.72, h: 0.28, fontSize: 6.8, bold: true, color: SAF, align: "center", valign: "middle" }); s.addText([{ text: b, options: { bold: true, color: NV } }, { text: t, options: { color: BODY } }], { isTextBox: true, x: 6.02, y: y + 0.04, w: 3.55, h: 0.46, fontFace: SANS, fontSize: 7.2, margin: 0, valign: "middle" }); });
  tb(s, "WHO BENEFITS · ONE KNOWLEDGE BASE, FOUR USERS", { x: 0.25, y: 3.62, w: 5.5, h: 0.2, fontSize: 7.5, bold: true, color: NV, charSpacing: 1 });
  const W = [["PATIENTS & FAMILIES", "60-second verdict in Hindi or English, timing gaps, and three questions to carry to the clinic"], ["DOCTORS & VAIDYAS", "Patients finally disclose what they take; a one-page summary with sources bridges both vocabularies"], ["PHARMACISTS & CHEMISTS", "Counter-side cross-check for the only shop that sells both systems' products; QR on the bill"], ["MINISTRY OF AYUSH / NPvCC", "Structured ICSRs in the official format, anonymised co-use analytics by state, early signal detection"]];
  W.forEach(([t, d], i) => { const x = 0.25 + i * 1.42; rr(s, x, 3.85, 1.35, 1.42, WHITE, LINE, 0.05); rect(s, x, 3.85, 1.35, 0.3, i === 3 ? "7A1F2B" : NV); tb(s, t, { x: x + 0.05, y: 3.85, w: 1.25, h: 0.3, fontSize: 6, bold: true, color: WHITE, valign: "middle", align: "center" }); tb(s, d, { x: x + 0.07, y: 4.2, w: 1.21, h: 1.05, fontSize: 6.4, color: BODY, align: "center" }); });
  tb(s, "IMPACT · WHY IT MATTERS", { x: 6.05, y: 3.62, w: 3.7, h: 0.2, fontSize: 7.5, bold: true, color: NV, charSpacing: 1 });
  const IM = [["1,473", "ASU&H adverse-event reports nationally since 2018 — TakeSure turns every reaction into a structured ICSR"], ["75%", "of herbal users with a side effect never told their doctor — TakeSure hands them the questions to ask"], ["0", "public tools today check an Ayurvedic product against an allopathic prescription — TakeSure is the first"]];
  IM.forEach(([v, d], i) => { const x = 6.05 + i * 1.25; rr(s, x, 3.85, 1.18, 1.42, LIGHT, LINE, 0.05); tb(s, v, { x, y: 3.9, w: 1.18, h: 0.42, fontSize: 18, bold: true, color: i === 1 ? "B86E00" : NV, align: "center", valign: "middle" }); tb(s, d, { x: x + 0.06, y: 4.34, w: 1.06, h: 0.9, fontSize: 6.2, color: BODY, align: "center" }); });
  s.addNotes("Four USPs, four revenue lines, four beneficiaries, three impact numbers.");
}

// =============================================================== 7. References + comparison
{
  const s = newSlide("RESEARCH & REFERENCES");
  panel(s, 0.25, 0.8, 3.45, 4.48, "RESEARCH & REFERENCES");
  const refs = [["Sharma 2018: ashwagandha & thyroid trial", "RCT, 50 patients, 600 mg/day, 8 weeks", "pubmed.ncbi.nlm.nih.gov/28829155", "https://pubmed.ncbi.nlm.nih.gov/28829155/"],
    ["Gohil & Patel 2007: herb–drug case reports", "133 cases, only 6% well documented (Indian J Pharmacol)", "doi.org/10.4103/0253-7613.33432", "https://doi.org/10.4103/0253-7613.33432"],
    ["Ghosh et al. 2009: herb–drug interaction", "Fallout of poor doctor–patient communication (JCDR)", "jcdr.net/articles/PDF/576/501.pdf", "https://www.jcdr.net/articles/PDF/576/501.pdf"],
    ["Interactions between substances in Ayurveda", "Food–drug & Ayurveda–modern drug review, 2013", "doi.org/10.1515/dmdi-2013-0014", "https://doi.org/10.1515/dmdi-2013-0014"],
    ["NSSO Survey on Ayush 2022-23 (MoSPI press note)", "Ayurveda is the most used Ayush system", "mospi.gov.in/…/PressNote_Ayush_13062024N.pdf", "https://www.mospi.gov.in/sites/default/files/press_release/PressNote_Ayush_13062024N.pdf"],
    ["Ayush Suraksha portal (Ministry of Ayush)", "Suspected ADR reporting for ASU&H drugs", "suraksha.ayush.gov.in", "https://suraksha.ayush.gov.in/"],
    ["ASU&H pharmacovigilance (ITRA, Jamnagar)", "PPvC / IPvC reporting network", "itra.ac.in/pharmacovigilance", "https://itra.ac.in/pharmacovigilance"],
    ["Open-source tools we build on", "OCR (Tesseract) and name matching (RapidFuzz)", "github.com/tesseract-ocr · github.com/rapidfuzz", "https://github.com/tesseract-ocr/tesseract"]];
  refs.forEach(([t, d, l, url], i) => { const y = 1.13 + i * 0.51; rr(s, 0.33, y, 3.3, 0.47, LIGHT, LINE, 0.04); badge(s, 0.38, y + 0.11, i + 1, 0.24); tb(s, t, { x: 0.68, y: y + 0.02, w: 2.92, h: 0.16, fontSize: 6.9, bold: true, color: NV }); tb(s, d, { x: 0.68, y: y + 0.17, w: 2.92, h: 0.14, fontSize: 6, color: MUT }); s.addText([{ text: l, options: { hyperlink: { url, tooltip: url }, color: "1155CC", underline: { style: "sng" } } }], { isTextBox: true, x: 0.68, y: y + 0.31, w: 2.92, h: 0.14, fontFace: SANS, fontSize: 6, margin: 0, valign: "top" }); });
  tb(s, "COMPARISON WITH EXISTING TOOLS", { x: 3.85, y: 0.82, w: 5.9, h: 0.22, fontSize: 8, bold: true, color: "7A1F2B", charSpacing: 1.5 });
  const STAR = "Segoe UI Symbol";
  const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);
  const H = (t, f) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: f || NV }, fontSize: 6.8, valign: "middle", align: "center" } });
  const feat = (t) => ({ text: t, options: { bold: true, color: NV, fontSize: 7.2, valign: "middle", fill: { color: LIGHT } } });
  const cell = (txt, n, fill) => ({ text: [{ text: txt + "\n", options: { fontSize: 6.3, color: BODY } }, { text: stars(n) + "  " + n + " / 5", options: { fontFace: STAR, fontSize: 6.8, color: "B86E00", bold: true } }], options: { valign: "top", fill: { color: fill || WHITE } } });
  const why = (t) => ({ text: "★ " + t, options: { fontSize: 6.3, bold: true, color: "7A1F2B", fill: { color: "FFF4DC" }, valign: "middle" } });
  const rows = [[H("FEATURE"), H("MEDSCAPE · DRUGS.COM · 1MG"), H("MSKCC · NATURAL MEDICINES"), H("TAKESURE (OUR APP)", "1E7F4F"), H("WHY TAKESURE?", "B86E00")],
    [feat("Ayurveda × allopathy check"), cell("✗ Allopathic × allopathic pairs only", 1), cell("~ Single-herb monographs only", 2), cell("✓ Prescription × Ayurvedic product, every herb–drug pair checked", 5, "E6F4EA"), why("Only tool that checks the two systems people already mix.")],
    [feat("Indian brands & Hindi"), cell("~ Partly covered", 3), cell("✗ Western herbs, English only", 1), cell("✓ Indian brands + Sanskrit / Hindi synonyms, Hindi UI", 5, "E6F4EA"), why("Matches Himalaya, Dabur and the names patients actually use.")],
    [feat("Sources on every verdict"), cell("✓ Sources shown", 4), cell("✓ Sources shown", 4), cell("✓ Sources + grade A/B/C with DOI/PMID; marked “needs verification” until re-checked", 4, "E6F4EA"), why("Weak evidence is shown as weak, never hidden — and we say so when a citation is not yet re-verified.")],
    [feat("ADR report to Ministry"), cell("✗ No reporting", 1), cell("✗ No reporting", 1), cell("✓ One-tap report in Ministry of Ayush format", 5, "E6F4EA"), why("Feeds the Ayush pharmacovigilance network.")],
    [{ text: "OVERALL RATING", options: { bold: true, color: WHITE, fill: { color: NV }, fontSize: 7, valign: "middle" } },
      { text: [{ text: "Medscape  2.3 / 5\n", options: { bold: true, color: WHITE, fontSize: 7 } }, { text: stars(2), options: { fontFace: STAR, color: SAF, fontSize: 8 } }], options: { fill: { color: NV }, align: "center", valign: "middle" } },
      { text: [{ text: "MSKCC  2.0 / 5\n", options: { bold: true, color: WHITE, fontSize: 7 } }, { text: stars(2), options: { fontFace: STAR, color: SAF, fontSize: 8 } }], options: { fill: { color: NV }, align: "center", valign: "middle" } },
      { text: [{ text: "TakeSure  4.8 / 5\n", options: { bold: true, color: WHITE, fontSize: 7 } }, { text: stars(5), options: { fontFace: STAR, color: SAF, fontSize: 8 } }], options: { fill: { color: "1E7F4F" }, align: "center", valign: "middle" } },
      { text: "TakeSure scores 2.5 points higher than the best alternative.", options: { bold: true, color: WHITE, fill: { color: "B86E00" }, fontSize: 6.6, valign: "middle" } }]];
  s.addTable(rows, { x: 3.85, y: 1.08, w: 5.9, colW: [0.95, 1.15, 1.15, 1.35, 1.3], rowH: [0.34, 0.66, 0.6, 0.78, 0.5, 0.5], fontFace: SANS, border: { type: "solid", color: LINE, pt: 0.5 }, margin: 0.035 });
  tb(s, "Ratings out of 5 are the team's assessment on the four features compared (sourced = 4, +1 with evidence grade · partly = 3 · single herb = 2 · none = 1). TakeSure takes 4/5 on Sources deliberately: every citation stays marked “needs verification” until a second reviewer re-opens the DOI/PMID.", { x: 3.85, y: 4.62, w: 5.9, h: 0.6, fontSize: 6.2, italic: true, color: MUT });
  s.addNotes("Eight references with live links; honest comparison with existing tools.");
}

pres.writeFile({ fileName: "TakeSure_BugHunters_HackBVP8.pptx" }).then(f => console.log("written", f));
