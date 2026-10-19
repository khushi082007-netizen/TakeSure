// TakeSure — CodeSlayer 2.0 2K26 Round-1 deck, rebuilt on the official template (6 slides, title bars unchanged).
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10 x 5.625 in == template 720 x 405 pt
pres.author = "TakeSure team";
pres.title = "TakeSure — CodeSlayer 2K26";

// ---- template look -------------------------------------------------------------------
const BLACK = "000000", BLUE = "1155CC", RED = "8B0000", INK = "222222", MUTED = "555555";
const TINT = "F7F7F9", TINT_RED = "FBEDEC", TINT_BLUE = "EEF3FC", TINT_GREEN = "EAF5EE", TINT_AMBER = "FFF4DF";
const GREEN = "1E7F4F", AMBER = "B86E00", GREY = "6B7280";
const SERIF = "Times New Roman", SANS = "Arial";
const TEAM = "[Team Name]";

function tb(slide, text, o) { slide.addText(text, Object.assign({ isTextBox: true, fontFace: SANS, color: INK, margin: 0, valign: "top" }, o)); }
function box(slide, x, y, w, h, fill) { slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: fill || "FFFFFF" }, line: { color: BLACK, width: 0.75 } }); }
function rbox(slide, x, y, w, h, fill, line) { slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.06, fill: { color: fill }, line: { color: line || fill, width: 0.75 } }); }
function header(slide, title) {
  // Title bar exactly as the template: centered serif uppercase title, both logos top-right, team oval top-left.
  tb(slide, title, { x: 1.9, y: 0.12, w: 5.9, h: 0.78, fontFace: SERIF, fontSize: title.length > 34 ? 19 : 22, bold: true, color: BLACK, align: "center", valign: "middle" });
  slide.addImage({ path: "assets/codeslayer.png", x: 7.9, y: 0.0, w: 0.98, h: 0.97 });
  slide.addImage({ path: "assets/devsphere.png", x: 8.86, y: 0.06, w: 0.9, h: 0.89 });
  slide.addShape(pres.shapes.OVAL, { x: 0.1, y: 0.82, w: 1.95, h: 0.8, fill: { color: "FFFFFF" }, line: { color: BLACK, width: 0.75 } });
  tb(slide, TEAM, { x: 0.1, y: 0.82, w: 1.95, h: 0.8, fontSize: 13, align: "center", valign: "middle", color: BLACK });
}
function h2(slide, text, x, y, w, color) { tb(slide, text, { x, y, w, h: 0.3, fontSize: 14, bold: true, color: color || BLUE }); }
function bullets(slide, items, x, y, w, h, size) {
  const runs = [];
  items.forEach((it, i) => {
    const last = i === items.length - 1;
    const common = { paraSpaceAfter: 3 };
    if (typeof it === "string") {
      runs.push({ text: it, options: Object.assign({ bullet: true, breakLine: !last }, common) });
    } else if (Array.isArray(it)) {
      runs.push({ text: it[0], options: Object.assign({ bullet: true, bold: true, color: BLACK }, common) });
      runs.push({ text: it[1], options: Object.assign({ breakLine: !last }, common) });
    } else {
      runs.push({ text: it.text, options: Object.assign({ bullet: true, breakLine: !last }, common, it.options || {}) });
    }
  });
  slide.addText(runs, { isTextBox: true, x, y, w, h, fontFace: SANS, fontSize: size || 10, color: INK, margin: 0, valign: "top" });
}
function stat(slide, x, y, w, big, small, color) {
  rbox(slide, x, y, w, 0.78, TINT, "E3E3E8");
  tb(slide, big, { x, y: y + 0.04, w, h: 0.4, fontSize: 22, bold: true, color: color || RED, align: "center", valign: "middle" });
  tb(slide, small, { x: x + 0.05, y: y + 0.42, w: w - 0.1, h: 0.34, fontSize: 7.5, color: MUTED, align: "center", valign: "top" });
}
function pill(slide, x, y, w, text, fill, color) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.24, rectRadius: 0.12, fill: { color: fill }, line: { color: fill } });
  tb(slide, text, { x, y, w, h: 0.24, fontSize: 8, bold: true, color: color || "FFFFFF", align: "center", valign: "middle" });
}
function arrow(slide, x, y, w) { slide.addShape(pres.shapes.RIGHT_ARROW, { x, y, w, h: 0.22, fill: { color: "9AA3AF" }, line: { color: "9AA3AF" } }); }
function node(slide, x, y, w, h, title, sub, fill, line) {
  rbox(slide, x, y, w, h, fill, line);
  tb(slide, title, { x: x + 0.05, y: y + 0.04, w: w - 0.1, h: 0.26, fontSize: 9, bold: true, color: INK, align: "center", valign: "middle" });
  if (sub) tb(slide, sub, { x: x + 0.05, y: y + 0.3, w: w - 0.1, h: h - 0.34, fontSize: 7.5, color: MUTED, align: "center", valign: "top" });
}

// ======================================================================================
// SLIDE 1 — TITLE (template cover: banner, CODESLAYER 2K26, team oval, four fields)
// ======================================================================================
{
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  s.addImage({ path: "assets/banner.png", x: 0, y: 0, w: 10.0, h: 2.08 });
  s.addImage({ path: "assets/codeslayer.png", x: 7.82, y: 0.08, w: 0.98, h: 0.97 });
  s.addImage({ path: "assets/devsphere.png", x: 8.86, y: 0.17, w: 0.92, h: 0.91 });
  s.addShape(pres.shapes.OVAL, { x: 0.12, y: 0.96, w: 1.96, h: 0.8, fill: { color: "FFFFFF" }, line: { color: BLACK, width: 0.75 } });
  tb(s, TEAM, { x: 0.12, y: 0.96, w: 1.96, h: 0.8, fontSize: 13, align: "center", valign: "middle", color: BLACK });

  const L = 0.6, LW = 1.75, V = 2.45, VW = 7.3;
  tb(s, "Project Title :", { x: L, y: 2.42, w: LW, h: 0.3, fontSize: 15, bold: true, color: BLACK });
  s.addText([
    { text: "TakeSure", options: { bold: true, color: RED } },
    { text: " — Confidence before taking something.", options: { bold: true, color: BLACK } },
    { text: " Ayurveda × Allopathy herb–drug interaction checker: photo of prescription + photo of product → sourced, plain-language safety verdict + Ministry of Ayush ADR report.", options: { color: INK } },
  ], { isTextBox: true, x: V, y: 2.4, w: VW, h: 0.62, fontFace: SANS, fontSize: 11.5, margin: 0, valign: "top" });

  tb(s, "Team Name :", { x: L, y: 3.12, w: LW, h: 0.3, fontSize: 15, bold: true, color: BLACK });
  tb(s, "[Team Name]", { x: V, y: 3.14, w: VW, h: 0.3, fontSize: 13, color: INK });

  tb(s, "Team Members", { x: L, y: 3.52, w: LW, h: 0.3, fontSize: 15, bold: true, color: BLACK });
  tb(s, "(Names + Roles Briefly):", { x: L, y: 3.82, w: 1.8, h: 0.3, fontSize: 10, italic: true, color: BLACK });
  s.addText([
    { text: "[Member 1]", options: { bold: true } }, { text: " — Team lead · backend, rule engine & pitch", options: { breakLine: true } },
    { text: "[Member 2]", options: { bold: true } }, { text: " — Frontend · web app, Hindi/English UI, result card", options: { breakLine: true } },
    { text: "[Member 3]", options: { bold: true } }, { text: " — Medical research · knowledge base & evidence grading", options: { breakLine: true } },
    { text: "[Member 4]", options: { bold: true } }, { text: " — OCR, PDF/ADR export & demo video", options: {} },
  ], { isTextBox: true, x: V, y: 3.52, w: VW, h: 0.8, fontFace: SANS, fontSize: 10, color: INK, margin: 0, valign: "top", paraSpaceAfter: 2 });

  tb(s, "Tracks Chosen:", { x: L, y: 4.52, w: LW, h: 0.3, fontSize: 15, bold: true, color: BLACK });
  s.addText([
    { text: "Healthcare", options: { bold: true, color: RED } }, { text: "  ·  ", options: { color: "AAAAAA" } },
    { text: "AI/ML", options: { bold: true, color: RED } }, { text: "  ·  ", options: { color: "AAAAAA" } },
    { text: "Open Innovation", options: { bold: true, color: RED } },
  ], { isTextBox: true, x: V, y: 4.54, w: VW, h: 0.3, fontFace: SANS, fontSize: 13, margin: 0, valign: "top" });

  tb(s, "Project explanation video (Google Drive): [paste link here — set to “Anyone with the link can view”]", { x: L, y: 4.98, w: 8.9, h: 0.3, fontSize: 10, italic: true, color: MUTED });
  tb(s, "Aligned with the Ministry of Ayush Pharmacovigilance Programme for ASU&H drugs · decision support, never diagnosis", { x: L, y: 5.26, w: 8.9, h: 0.28, fontSize: 9, color: MUTED });
  s.addNotes("Title slide. Fill team name, members with roles, and the Google Drive link. Tracks: Healthcare (primary), AI/ML, Open Innovation.");
}

// ======================================================================================
// SLIDE 2 — PROBLEM STATEMENT & TARGET AUDIENCE
// ======================================================================================
{
  const s = pres.addSlide(); s.background = { color: "FFFFFF" };
  header(s, "PROBLEM STATEMENT &\nTARGET AUDIENCE");
  // left box
  box(s, 0.35, 1.75, 6.15, 3.65);
  h2(s, "Problem We're Solving", 0.5, 1.82, 5.9);
  bullets(s, [
    ["India runs two medical systems side by side — and nobody checks the combination. ", "A thyroid patient on Thyronorm adds ashwagandha for stress; a transplant patient on tacrolimus drinks giloy kadha; a cardiac patient on warfarin takes guggul for cholesterol. Ashwagandha can raise thyroid hormone, giloy can oppose immunosuppression, guggul can increase bleeding."],
    "The allopathic doctor rarely asks, the patient rarely tells, the chemist has no tool, and the product label says nothing about allopathic medicines.",
    "Existing checkers (Medscape, Drugs.com, 1mg) only know allopathic × allopathic pairs; Western herb databases are English-only, paid and do not know Indian brands like Himalaya Ashvagandha or Dabur Giloy Ghanvati.",
  ], 0.5, 2.15, 5.85, 1.75, 9.5);
  // stats
  stat(s, 0.5, 3.9, 1.4, "37%", "of hospital patients used allopathic + herbal medicines together");
  stat(s, 1.97, 3.9, 1.4, "65%", "of herbal users lacked knowledge of dose, side effects, interactions");
  stat(s, 3.44, 3.9, 1.4, "19%", "of Indian patients disclose herbal use to their doctor");
  stat(s, 4.91, 3.9, 1.45, "1,473", "ASU&H adverse-event reports nationally since 2018", BLUE);
  tb(s, "Impacted: patients on thyroid, diabetes, BP/heart, blood-thinner, transplant or epilepsy medicines and their families; doctors who never hear about the co-use; the Ministry's pharmacovigilance network that never receives the reports.", { x: 0.5, y: 4.8, w: 5.85, h: 0.52, fontSize: 8.3, color: MUTED });
  // right box
  box(s, 6.7, 1.75, 2.95, 3.65);
  h2(s, "Target Users", 6.85, 1.82, 2.7);
  const groups = [
    ["B2C · Patients & caregivers", "Adults 30–70 on long-term medicines who also take Ayurvedic products; family members managing an elder's medicines; Hindi or English, phone-first."],
    ["B2B · Clinicians & pharmacies", "MBBS/MD doctors, BAMS vaidyas, hospital pharmacies, retail chemists, telemedicine and hospital-HIS platforms (API)."],
    ["B2G · Regulators", "Ministry of Ayush / NPvCC at AIIA and the 99 Peripheral Pharmacovigilance Centres: structured ICSRs and co-use analytics."],
  ];
  let gy = 2.2;
  for (const [t, d] of groups) {
    rbox(s, 6.85, gy, 2.65, 0.98, TINT, "E3E3E8");
    tb(s, t, { x: 6.95, y: gy + 0.05, w: 2.5, h: 0.24, fontSize: 9.5, bold: true, color: RED });
    tb(s, d, { x: 6.95, y: gy + 0.3, w: 2.48, h: 0.66, fontSize: 8, color: INK });
    gy += 1.06;
  }
  s.addNotes("Problem: two systems, zero cross-checks. Three numbers: 37% co-use, 65% lack interaction knowledge, 19% disclose. Target users: B2C patients/caregivers, B2B clinicians and pharmacies, B2G Ministry of Ayush.");
}

// ======================================================================================
// SLIDE 3 — OUR UNIQUE SOLUTION
// ======================================================================================
{
  const s = pres.addSlide(); s.background = { color: "FFFFFF" };
  header(s, "OUR UNIQUE SOLUTION");
  box(s, 0.35, 1.75, 4.95, 3.65);
  h2(s, "Key Features", 0.5, 1.82, 4.7);
  const feats = [
    ["1", "Scan", "Photograph the prescription and the Ayurvedic product label (or type names). OCR reads them; every name is shown for confirmation before anything is checked."],
    ["2", "Match", "Indian brand → generic (Thyronorm → levothyroxine), product → herbs (Chyawanprash → amla, ashwagandha…) via a curated bridge dictionary + fuzzy matching."],
    ["3", "Decide", "Deterministic rule engine over a cited knowledge base → GREEN / AMBER / RED / NOT IN DATABASE, with timing gaps (e.g. keep 2–3 h between Triphala and oral medicines)."],
    ["4", "Explain", "AI rewrites only the matched evidence into simple Hindi/English + 3 questions to ask the doctor. It cannot add, remove or re-grade an interaction."],
    ["5", "Report", "One-page PDF with sources for the doctor; one-tap suspected-ADR report in the Ministry of Ayush format for the Ayush Suraksha portal."],
  ];
  let fy = 2.18;
  for (const [n, t, d] of feats) {
    s.addShape(pres.shapes.OVAL, { x: 0.5, y: fy + 0.02, w: 0.3, h: 0.3, fill: { color: RED }, line: { color: RED } });
    tb(s, n, { x: 0.5, y: fy + 0.02, w: 0.3, h: 0.3, fontSize: 10, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
    s.addText([{ text: t + " — ", options: { bold: true, color: BLACK } }, { text: d, options: { color: INK } }], { isTextBox: true, x: 0.9, y: fy, w: 4.3, h: 0.64, fontFace: SANS, fontSize: 9, margin: 0, valign: "top" });
    fy += 0.64;
  }
  // right box
  box(s, 5.5, 1.75, 4.15, 3.65);
  h2(s, "Why It's Different", 5.65, 1.82, 3.9);
  // comparison scorecard with star ratings
  const GOLD = "D4A017";
  const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);
  const hdr = (t) => ({ text: t, options: { bold: true, fill: { color: TINT }, align: "center", fontSize: 6.8 } });
  const name = (t, fill, color) => ({ text: t, options: Object.assign({ bold: true, fontSize: 7 }, fill ? { fill: { color: fill } } : {}, color ? { color } : {}) });
  const cell = (n, fill) => ({ text: stars(n), options: Object.assign({ align: "center", color: GOLD, fontFace: "Segoe UI Symbol", fontSize: 7.5 }, fill ? { fill: { color: fill } } : {}) });
  const total = (t, fill, color) => ({ text: t, options: Object.assign({ bold: true, align: "center", fontSize: 7.5 }, fill ? { fill: { color: fill } } : {}, color ? { color } : {}) });
  const rows = [
    [hdr(""), hdr("Ayurveda × allopathy"), hdr("Indian brands & Hindi"), hdr("Sources & evidence grade"), hdr("ADR to Ministry"), hdr("Score")],
    [name("Medscape · Drugs.com · 1mg"), cell(1), cell(2), cell(4), cell(0), total("7 / 20", null, MUTED)],
    [name("MSKCC · Natural Medicines"), cell(3), cell(1), cell(5), cell(0), total("9 / 20", null, MUTED)],
    [name("TakeSure", TINT_RED, RED), cell(5, TINT_RED), cell(5, TINT_RED), cell(4, TINT_RED), cell(5, TINT_RED), total("19 / 20", TINT_RED, GREEN)],
  ];
  s.addTable(rows, { x: 5.65, y: 2.15, w: 3.85, colW: [1.05, 0.6, 0.6, 0.6, 0.5, 0.5], fontFace: SANS, fontSize: 7, color: INK, border: { type: "solid", color: "D0D4DA", pt: 0.5 }, margin: 0.03, valign: "middle", rowH: 0.3 });
  tb(s, "★ = our assessment of each tool against the five things an Indian patient needs; sources: product sites & documentation.", { x: 5.65, y: 3.46, w: 3.85, h: 0.14, fontSize: 5.5, italic: true, color: MUTED });
  h2(s, "Novelty", 5.65, 3.62, 3.9, RED);
  bullets(s, [
    ["“Verdict from published data; AI only explains.” ", "The risk level never comes from a language model — it comes from a versioned, cited knowledge-base row. Turn the AI off and the verdict is identical."],
    ["The missing bridge table: ", "Indian brand names × Ayurvedic herb synonyms (Sanskrit/Hindi/Latin) × graded published evidence — open, auditable, co-curated with Ayurveda colleges."],
  ], 5.65, 3.93, 3.85, 1.0, 8);
  // concept mock card
  rbox(s, 5.65, 4.98, 3.85, 0.38, TINT_AMBER, "F0C36B");
  pill(s, 5.72, 5.05, 0.6, "! AMBER", AMBER);
  tb(s, "Ashwagandha + Levothyroxine · Evidence B · recheck TSH in 6–8 weeks · ask your doctor", { x: 6.38, y: 5.03, w: 3.1, h: 0.3, fontSize: 7.5, color: INK, valign: "middle" });
  tb(s, "concept of a result card", { x: 8.55, y: 4.88, w: 1.0, h: 0.14, fontSize: 6, italic: true, color: MUTED, align: "right" });
  s.addNotes("Five features: Scan, Match, Decide, Explain, Report. The novelty: the verdict comes from data, the AI only explains, and the bridge table between Indian brands, herb synonyms and evidence does not exist anywhere else.");
}

// ======================================================================================
// SLIDE 4 — TECH STACK + ARCHITECTURE
// ======================================================================================
{
  const s = pres.addSlide(); s.background = { color: "FFFFFF" };
  header(s, "TECH STACK + ARCHITECTURE");
  box(s, 0.35, 1.75, 2.75, 3.65);
  h2(s, "Tech Stack", 0.5, 1.82, 2.5);
  const stack = [
    ["Frontend", "Next.js (React) + TypeScript, Tailwind CSS, Framer Motion · installable PWA · Hindi/English UI"],
    ["Backend", "FastAPI (Python), Pydantic v2 validation, SQLAlchemy · REST API with typed errors"],
    ["Database", "PostgreSQL (Supabase) in production; SQLite for offline/demo · tables: herbs, drugs, products, interactions, sources"],
    ["OCR", "Tesseract (eng + hin) on the server; Google Vision / Groq vision model as optional cloud reader"],
    ["Matching", "RapidFuzz token-set matching; ≥85 accept, 70–85 ask the user, <70 not recognised"],
    ["AI explainer", "Groq API (Llama / GPT-OSS) with JSON-schema output, temperature 0, facts-only prompt, fallback text"],
    ["PDF & hosting", "ReportLab for doctor summary + ADR form · Vercel (web) + Render/Railway (API)"],
  ];
  let sy = 2.15;
  for (const [t, d] of stack) {
    s.addText([{ text: t + ": ", options: { bold: true, color: RED } }, { text: d, options: { color: INK } }], { isTextBox: true, x: 0.5, y: sy, w: 2.5, h: 0.46, fontFace: SANS, fontSize: 7.8, margin: 0, valign: "top" });
    sy += 0.455;
  }
  // architecture box: the project workflow, left to right (same steps and colours as the team's flowchart)
  box(s, 3.3, 1.75, 6.35, 3.65);
  h2(s, "Architecture — project workflow", 3.45, 1.82, 6.0);
  const PINK = "FBE9E7", PINK_L = "8B0000", GREYB = "F4F4F5", GREY_L = "333333";
  const DOWN = (x, y, h) => s.addShape(pres.shapes.LINE, { x, y, w: 0, h, line: { color: "333333", width: 1.25, endArrowType: "triangle" } });
  const RIGHT = (x, y, w) => s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color: "333333", width: 1.25, endArrowType: "triangle" } });
  const LEFT = (x, y, w) => s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color: "333333", width: 1.25, beginArrowType: "triangle" } });
  const wf = (x, y, w, h, title, sub, fill, line, titleColor, subColor) => {
    rbox(s, x, y, w, h, fill, line);
    tb(s, title, { x: x + 0.05, y: y + 0.04, w: w - 0.1, h: 0.24, fontSize: 8, bold: true, color: titleColor || INK, align: "center", valign: "middle" });
    if (sub) tb(s, sub, { x: x + 0.05, y: y + 0.28, w: w - 0.1, h: h - 0.32, fontSize: 7, color: subColor || MUTED, align: "center", valign: "top" });
  };
  // Row 1: inputs -> OCR -> normalisation -> knowledge base
  const y1 = 2.2, h1 = 0.72;
  wf(3.45, y1, 1.0, h1, "Prescription", "Photo of allopathic medicines", PINK, PINK_L);
  wf(4.5, y1, 1.0, h1, "Product photo", "Ayurvedic label / brand", PINK, PINK_L);
  // both inputs feed OCR
  RIGHT(5.52, y1 + 0.36, 0.2);
  wf(5.75, y1, 1.05, h1, "OCR", "Extract text from images", GREYB, GREY_L);
  RIGHT(6.82, y1 + 0.36, 0.2);
  wf(7.05, y1, 1.15, h1, "Normalisation", "Identify medicines / herbs; brand → generic / standard name", GREYB, GREY_L);
  RIGHT(8.22, y1 + 0.36, 0.2);
  wf(8.45, y1, 1.05, h1, "Knowledge base", "Verified herb–drug table · sources & grade", GREYB, GREY_L);
  // down from knowledge base to rule-based check (row 2, right end)
  DOWN(8.97, y1 + h1, 0.2);
  // Row 2: rule-based check (dark red) -> four verdicts
  const y2 = 3.14, h2r = 0.72;
  wf(7.05, y2, 2.45, h2r, "RULE-BASED CHECK", "Determine safety level — AI does not decide", RED, RED, "FFFFFF", "F6D5D3");
  LEFT(6.82, y2 + 0.36, 0.2);
  const V = [["GREEN", "Safe", "E8F5E9", GREEN], ["AMBER", "Use with caution", "FFF4D6", AMBER], ["RED", "High risk", "FDE8E8", "B00020"], ["NOT VERIFIED", "Insufficient data", "EEF0F4", "4B5563"]];
  let vx = 3.45;
  for (const [t, d, f, c] of V) {
    rbox(s, vx, y2, 0.78, h2r, f, c);
    tb(s, t, { x: vx - 0.02, y: y2 + 0.08, w: 0.82, h: 0.26, fontSize: 7.2, bold: true, color: c, align: "center", valign: "middle" });
    tb(s, d, { x: vx + 0.03, y: y2 + 0.36, w: 0.72, h: 0.3, fontSize: 6.8, color: MUTED, align: "center", valign: "top" });
    vx += 0.84;
  }
  // down from verdicts to AI explanation (row 3, left)
  DOWN(4.68, y2 + h2r, 0.2);
  // Row 3: AI explanation -> doctor questions + sources -> share / ADR
  const y3 = 4.08, h3 = 0.72;
  wf(3.45, y3, 1.5, h3, "AI explanation", "Simple, clear, patient-friendly language (Hindi / English) — translates, never decides", GREYB, GREY_L);
  RIGHT(4.97, y3 + 0.36, 0.2);
  wf(5.2, y3, 1.75, h3, "Doctor questions + sources", "3 questions to ask your doctor · evidence grade · source / DOI", GREYB, GREY_L);
  RIGHT(6.97, y3 + 0.36, 0.2);
  wf(7.2, y3, 1.1, h3, "Share with doctor", "Download or share the PDF summary", GREYB, GREY_L);
  wf(8.4, y3, 1.1, h3, "ADR reporting", "Pre-filled Ayush pharmacovigilance form → export", PINK, PINK_L);
  tb(s, "Decision support only · never diagnosis · always ask your doctor", { x: 3.45, y: 4.9, w: 6.05, h: 0.2, fontSize: 7, italic: true, color: MUTED, align: "center" });
  tb(s, "Verdict path: photos → OCR → names confirmed by the user → knowledge-base lookup → rule engine (worst row wins: RED > AMBER > GREEN; unknown is never GREEN). The AI receives only the matched rows and rewrites them; invalid or directive output falls back to knowledge-base text. Uploads are deleted after extraction.", { x: 3.45, y: 5.07, w: 6.05, h: 0.3, fontSize: 6.2, color: MUTED, align: "center" });
  s.addNotes("Deterministic core, AI at the edges. Walk the top row left to right: inputs, OCR, matcher, rule engine; the knowledge base feeds the rule engine; the explainer only sees matched rows; outputs and the anonymised log.");
}

// ======================================================================================
// SLIDE 5 — FEASIBILITY AND SHOWSTOPPERS
// ======================================================================================
{
  const s = pres.addSlide(); s.background = { color: "FFFFFF" };
  header(s, "FEASIBILITY AND SHOWSTOPPERS");
  box(s, 0.35, 1.75, 9.3, 3.65);
  h2(s, "Feasibility", 0.5, 1.82, 4.3);
  bullets(s, [
    ["All components are proven and off-the-shelf: ", "OCR (Tesseract/Vision), fuzzy matching (RapidFuzz), relational lookup (PostgreSQL), LLM rephrasing (Groq). No model training — the MVP is a data + rules product."],
    ["Resources: ", "4 members with clear roles — backend & rule engine, frontend, medical research/knowledge base, OCR & ADR/PDF; laptops run the full stack locally (SQLite), so no paid cloud is needed on-site."],
    ["Research before the hackathon, code during it: ", "a knowledge base of 40–60 high-frequency herb × drug pairs (15 herbs × 12 drug classes) curated from PubMed, LiverTox, MSKCC, WHO monographs and the Ayurvedic Pharmacopoeia; every row has a source and an A/B/C grade."],
  ], 0.5, 2.15, 4.3, 1.75, 8.5);
  // 36-hour plan mini timeline
  h2(s, "36-hour build plan", 0.5, 3.95, 4.3, RED);
  const plan = [["0–2 h", "Setup, schema, load KB"], ["2–10 h", "Core loop: photo → OCR → confirm → verdict"], ["10–16 h", "Explainer, ADR form, PDFs"], ["20–28 h", "Hindi UI, result card polish, dashboard"], ["28–32 h", "Freeze, test on real boxes, rehearse"]];
  let px = 0.5;
  for (const [t, d] of plan) {
    rbox(s, px, 4.3, 0.84, 0.8, TINT, "E3E3E8");
    tb(s, t, { x: px, y: 4.34, w: 0.84, h: 0.22, fontSize: 8.5, bold: true, color: RED, align: "center" });
    tb(s, d, { x: px + 0.04, y: 4.56, w: 0.76, h: 0.66, fontSize: 7, color: INK, align: "center" });
    px += 0.87;
  }
  // showstoppers table
  h2(s, "Showstoppers → Mitigation", 5.0, 1.82, 4.5);
  const rows = [
    [{ text: "Risk / blocker", options: { bold: true, fill: { color: TINT } } }, { text: "Mitigation", options: { bold: true, fill: { color: TINT } } }],
    ["OCR misreads Indian handwriting or faded labels", "Confirm-names screen before any lookup; manual entry always available; brand dictionary catches partial reads"],
    ["Herb or drug not in our database", "Say “Not in database” — never guess, never show GREEN; log the gap as a curation task"],
    ["LLM hallucinates medical advice", "Model receives only matched rows; JSON-schema output; “stop/start/dose” language rejected; deterministic fallback text; verdict unchanged with AI off"],
    ["Weak evidence for many herbs", "Every row shows grade A/B/C and a DOI/PMID; grade-C evidence caps at AMBER; weak is shown as weak"],
    ["Venue internet or API outage", "Whole stack runs offline on a laptop (SQLite + Tesseract); cached explanations as backup"],
    ["Liability / medical scope", "Decision support only: “ask your doctor”, never “stop the medicine”; no diagnosis, no dosing; disclaimer on every screen and PDF"],
  ];
  s.addTable(rows.map((r) => r.map((c) => (typeof c === "string" ? { text: c } : c))), { x: 5.0, y: 2.15, w: 4.5, colW: [1.55, 2.95], fontFace: SANS, fontSize: 7.3, color: INK, border: { type: "solid", color: "D0D4DA", pt: 0.5 }, margin: 0.04, valign: "middle" });
  s.addNotes("Feasibility: proven parts, no training, roles split, runs offline. Showstoppers: each risk has a concrete mitigation; the AI hallucination row is the one judges ask about.");
}

// ======================================================================================
// SLIDE 6 — USP & BUSINESS MODEL (+ compact references, since the deck is capped at 6 slides)
// ======================================================================================
{
  const s = pres.addSlide(); s.background = { color: "FFFFFF" };
  header(s, "USP(UNIQUE SELLING PRICE) &\nBUSINESS MODEL");
  box(s, 0.35, 1.75, 4.55, 2.35);
  h2(s, "USP (UNIQUE SELLING PRICE)", 0.5, 1.82, 4.3);
  bullets(s, [
    ["India's first safety layer between the two medical systems people already mix ", "— nothing public today checks an Ayurvedic product against an allopathic prescription."],
    ["Verdict from published data; AI only explains ", "— auditable rules over cited rows; the opposite of a “ChatGPT wrapper”."],
    ["Built for India: ", "Indian brand names, Sanskrit/Hindi synonyms, Hindi explanations, Ministry of Ayush ADR format, Ayush Suraksha portal link."],
    ["Honest by design: ", "evidence grades, timing gaps instead of alarms, “not in database” instead of guesses."],
  ], 0.5, 2.15, 4.3, 1.9, 8.8);
  box(s, 5.1, 1.75, 4.55, 2.35);
  h2(s, "BUSINESS MODEL", 5.25, 1.82, 4.3);
  const bm = [
    ["Free for citizens (B2C)", "Web/PWA checker in Hindi & English; grows the knowledge base and the ADR signal."],
    ["API & counter tool (B2B)", "Per-query / subscription API for pharmacy chains, hospital HIS, telemedicine apps; QR on the chemist's bill."],
    ["Programmes & grants (B2G / CSR)", "Co-use analytics and structured ICSRs for the Ministry of Ayush pharmacovigilance network; CSR funding from Ayurvedic brands that want a trust layer."],
    ["Platform", "Ayush Grid / ABDM integration — verdict attached to the ABHA health record; open KB co-curated with Ayurveda colleges."],
  ];
  let by = 2.15;
  for (const [t, d] of bm) {
    s.addText([{ text: t + " — ", options: { bold: true, color: RED } }, { text: d, options: { color: INK } }], { isTextBox: true, x: 5.25, y: by, w: 4.3, h: 0.46, fontFace: SANS, fontSize: 8.3, margin: 0, valign: "top" });
    by += 0.47;
  }
  // references strip
  box(s, 0.35, 4.2, 9.3, 1.3, TINT);
  h2(s, "References", 0.5, 4.22, 2.0);
  const refs = [
    "Bhat BB et al. Knowledge & attitude of patients on herbal medicine use, Udupi. Trop J Pharm Res 2019;18(1):117-121.",
    "Indian J Med Res editorial (2015), CAM & herb–drug interaction; ~19% disclosure. PMC4643608.",
    "Ministry of Ayush: Pharmacovigilance Programme for ASU&H drugs (AOGUSY); NPvCC at AIIA; ICSR figures (Lok Sabha reply).",
    "Ayush Suraksha Portal (May 2025, SC order WP(C) 645/2022) — ayushsuraksha.com.",
    "NIH LiverTox (Ashwagandha, Tinospora, Guggul, Turmeric); MSKCC “About Herbs”; WHO Monographs Vols 1–4.",
    "Nagral A et al. J Clin Exp Hepatol 2021;11(6):732-738 · Gannon JM et al. J Ayurveda Integr Med 2014 · Sharma AK et al. JACM 2018.",
    "Stockley's Herbal Medicines Interactions, 2nd ed. (2013) — evidence-grading model; Ayurvedic Pharmacopoeia of India (PCIM&H).",
    "Docs: Tesseract, RapidFuzz, FastAPI, Next.js, PostgreSQL, ReportLab, Groq · comparators: Medscape, Drugs.com, 1mg.",
  ];
  const half = Math.ceil(refs.length / 2);
  bullets(s, refs.slice(0, half), 0.5, 4.5, 4.5, 0.96, 6);
  bullets(s, refs.slice(half), 5.1, 4.5, 4.5, 0.96, 6);
  s.addNotes("USP: first Ayurveda × allopathy checker, verdict from data. Business: free B2C, API for pharmacies/HIS/telemedicine, Ministry programmes and CSR, ABDM integration. References compacted here because the deck is capped at six slides.");
}

pres.writeFile({ fileName: "TakeSure_CodeSlayer2K26.pptx" }).then((f) => console.log("written", f));
