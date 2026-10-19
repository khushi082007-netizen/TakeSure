// TakeSure — Hack@BVP 8.0 abstract, Draft 1 (navy & saffron) as an editable single-slide A4 portrait PPTX.
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.defineLayout({ name: "A4P", width: 8.27, height: 11.69 });
pres.layout = "A4P";
pres.author = "Team Bug Hunters"; pres.title = "TakeSure — Hack@BVP 8.0 Abstract";

const NV = "14213D", SAF = "F4A300", INK = "1B1B1B", MUT = "5D6166", LIGHT = "F4F6FA", LINE = "C9D0DD", BODY = "333333";
const SANS = "Calibri", SERIF = "Cambria";
const L = 0.47, W = 7.33, COLW = 3.55, RX = 4.25;
const s = pres.addSlide();
s.background = { color: "FFFFFF" };

function tb(text, o) { s.addText(text, Object.assign({ isTextBox: true, fontFace: SANS, color: BODY, margin: 0, valign: "top" }, o)); }
function rect(x, y, w, h, fill, line, o) { s.addShape(pres.shapes.RECTANGLE, Object.assign({ x, y, w, h, fill: { color: fill }, line: line ? { color: line, width: 0.75 } : { color: fill, width: 0 } }, o || {})); }
function rrect(x, y, w, h, fill, line, r) { s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: r || 0.06, fill: { color: fill }, line: { color: line || fill, width: 0.75 } }); }
function h2(n, text, y, x, w) {
  x = x || L; w = w || W;
  s.addShape(pres.shapes.OVAL, { x, y: y + 0.02, w: 0.2, h: 0.2, fill: { color: SAF }, line: { color: SAF } });
  tb(String(n), { x, y: y + 0.02, w: 0.2, h: 0.2, fontSize: 8.5, bold: true, color: NV, align: "center", valign: "middle" });
  tb(text, { x: x + 0.27, y, w: 3.2, h: 0.24, fontFace: SERIF, fontSize: 11, bold: true, color: NV, valign: "middle" });
  const tw = text.length * 0.082 + 0.12;
  s.addShape(pres.shapes.LINE, { x: x + 0.27 + tw, y: y + 0.13, w: Math.max(0.2, w - 0.27 - tw), h: 0, line: { color: "D3D9E4", width: 0.75 } });
}
function bullets(items, x, y, w, h, fs) {
  const runs = [];
  items.forEach(([b, t], i) => {
    runs.push({ text: b + " ", options: { bold: true, color: NV, bullet: { indent: 10 }, paraSpaceAfter: 2 } });
    runs.push({ text: t, options: { color: BODY, breakLine: i < items.length - 1 } });
  });
  s.addText(runs, { isTextBox: true, x, y, w, h, fontFace: SANS, fontSize: fs || 8, margin: 0, valign: "top", lineSpacingMultiple: 1.02 });
}

// ------------------------------------------------------------ header band
rect(0, 0, 8.27, 1.55, NV);
s.addText([{ text: "TakeSure — ", options: { color: "FFFFFF" } }, { text: "Confidence before taking something", options: { color: SAF } }],
  { isTextBox: true, x: L, y: 0.16, w: 5.1, h: 0.75, fontFace: SERIF, fontSize: 20, bold: true, margin: 0, valign: "top", lineSpacingMultiple: 0.95 });
tb("Scan both. Check the pair. Ask the right questions.", { x: L, y: 0.9, w: 5, h: 0.22, fontSize: 10, italic: true, color: SAF });
tb("An Ayurveda × Allopathy herb–drug interaction checker for Indian patients, doctors and the Ministry of Ayush", { x: L, y: 1.12, w: 4.9, h: 0.38, fontSize: 8.5, color: "D5DBE8" });
s.addImage({ path: "img/hero.png", x: 6.05, y: 0.17, w: 1.72, h: 0.5 });
s.addText([{ text: "HACK@BVP 8.0 · Abstract Round", options: { color: "C9D1E0", fontSize: 8, breakLine: true } },
  { text: "Team Bug Hunters", options: { color: "FFFFFF", fontSize: 10, bold: true, breakLine: true } },
  { text: "Dhriti Garg · Shiwani Goyal · Khushi Gupta", options: { color: "C9D1E0", fontSize: 8 } }],
  { isTextBox: true, x: 5.0, y: 0.74, w: 2.8, h: 0.7, fontFace: SANS, margin: 0, align: "right", valign: "top" });
rect(0, 1.55, 8.27, 0.2, SAF);
tb("DOMAIN: Health & Well-Being (AI4Impact secondary) · SDG 3 · SDG 9 · SDG 10", { x: L, y: 1.55, w: W, h: 0.2, fontSize: 8, bold: true, color: NV, valign: "middle" });

// ------------------------------------------------------------ story
tb("One patient's story — the gap today, and what TakeSure would do about it", { x: L, y: 1.86, w: 5.6, h: 0.22, fontFace: SERIF, fontSize: 10.5, bold: true, color: NV, valign: "middle" });
s.addShape(pres.shapes.LINE, { x: 5.95, y: 1.97, w: 1.85, h: 0, line: { color: "D3D9E4", width: 0.75 } });
const caps = [["Mother", "takes Thyronorm for thyroid and starts ashwagandha for stress."],
  ["Nobody asks, nobody tells.", "Her doctor never hears of it; the label says nothing."],
  ["She photographs both.", "TakeSure reads the names, confirms them and checks the pair."],
  ["AMBER.", "A cited source, timing advice, three questions. One tap sends the PDF to her doctor."]];
caps.forEach(([b, t], i) => {
  const x = L + i * 1.86, y = 2.12, w = 1.75, h = 1.18;
  rrect(x, y, w, h, LIGHT, LINE, 0.05);
  rect(x + 0.02, y, w - 0.04, 0.04, SAF);
  s.addImage({ path: `img/panel${i + 1}.png`, x: x + 0.05, y: y + 0.08, w: 1.65, h: 0.64 });
  s.addText([{ text: b + " ", options: { bold: true, color: NV } }, { text: t, options: { color: BODY } }],
    { isTextBox: true, x: x + 0.07, y: y + 0.74, w: w - 0.14, h: 0.42, fontFace: SANS, fontSize: 7.4, margin: 0, valign: "top" });
});

// ------------------------------------------------------------ problem & solution
h2(1, "The problem", 3.42, L, COLW);
bullets([["Two medical systems, zero cross-checking.", "A thyroid patient on Thyronorm adds ashwagandha; a transplant patient on tacrolimus drinks giloy kadha; a cardiac patient on warfarin takes guggul."],
  ["Each pair can cause harm:", "ashwagandha can raise thyroid hormone, giloy can oppose immunosuppression, guggul can increase bleeding."],
  ["Nobody asks, nobody tells.", "The doctor rarely asks about herbs, the patient rarely mentions them, the chemist has no tool, the label says nothing."],
  ["Existing tools do not cover it.", "Medscape, Drugs.com and 1mg check only allopathic × allopathic pairs; Western herb databases are English-only, paid and do not know Indian brands like Himalaya Ashvagandha or Dabur Giloy Ghanvati."]],
  L, 3.7, COLW, 1.62, 7.9);
const stats = [["37%", "of hospital patients use allopathic and herbal medicines together", NV], ["65%", "of herbal users do not know the dose, side effects or interactions", SAF],
  ["19%", "of Indian patients ever disclose herbal use to their doctor", NV], ["1,473", "ASU&H adverse-event reports received nationally since 2018", SAF]];
stats.forEach(([v, d, c], i) => {
  const x = L + (i % 2) * 1.82, y = 5.36 + Math.floor(i / 2) * 0.4;
  rrect(x, y, 1.73, 0.36, LIGHT, LIGHT, 0.05);
  tb(v, { x: x + 0.06, y, w: 0.62, h: 0.36, fontSize: 13, bold: true, color: c, valign: "middle" });
  tb(d, { x: x + 0.68, y: y + 0.02, w: 1.02, h: 0.33, fontSize: 6.8, color: MUT, valign: "middle" });
});
h2(2, "Proposed solution", 3.42, RX, COLW);
bullets([["Scan both.", "The patient photographs the allopathic prescription and the Ayurvedic product label (or types the names); every name is confirmed before checking."],
  ["Match Indian names.", "Brand → generic (Thyronorm → levothyroxine) and product → herbs (Chyawanprash → amla, ashwagandha…) with Sanskrit / Hindi / Latin synonyms."],
  ["Decide from data.", "A rule engine checks every herb–drug pair against a curated, cited knowledge base: GREEN / AMBER / RED / NOT IN DATABASE, with timing advice."],
  ["Explain simply.", "AI rewrites only the matched evidence into plain Hindi or English, with sources and three questions to ask the doctor."],
  ["Report in one tap.", "A one-page PDF for the doctor and a pre-filled suspected-ADR report in the Ministry of Ayush format for the Ayush Suraksha portal."]],
  RX, 3.7, COLW, 1.95, 7.9);
rect(RX, 5.72, COLW, 0.4, LIGHT);
rect(RX, 5.72, 0.05, 0.4, SAF);
tb("Our rule: The verdict comes from published data; AI only explains it.", { x: RX + 0.13, y: 5.72, w: COLW - 0.2, h: 0.4, fontSize: 8.6, bold: true, italic: true, color: NV, valign: "middle" });

// ------------------------------------------------------------ approach flowchart
h2(3, "Approach — project workflow", 6.1);
const FY = 6.4, FH = 1.0;
let fx = L;
function fbox(w, title, sub, fill, line, tcol, scol, h, y) {
  rrect(fx, y || FY, w, h || FH, fill, line, 0.05);
  s.addText([{ text: title, options: { bold: true, color: tcol || NV, fontSize: 7.4, breakLine: true } }, { text: sub, options: { color: scol || BODY, fontSize: 6.8 } }],
    { isTextBox: true, x: fx + 0.03, y: (y || FY) + 0.03, w: w - 0.06, h: (h || FH) - 0.06, fontFace: SANS, margin: 0, align: "center", valign: "middle" });
  fx += w;
}
function farrow() { tb("›", { x: fx, y: FY, w: 0.12, h: FH, fontSize: 12, bold: true, color: NV, align: "center", valign: "middle" }); fx += 0.12; }
// inputs
rrect(fx, FY, 0.82, 0.47, "FFF4DC", "E8C27A", 0.05); s.addText([{ text: "Prescription photo", options: { bold: true, color: NV, fontSize: 7.2, breakLine: true } }, { text: "allopathic medicines", options: { fontSize: 6.5, color: BODY } }], { isTextBox: true, x: fx + 0.02, y: FY + 0.02, w: 0.78, h: 0.43, fontFace: SANS, margin: 0, align: "center", valign: "middle" });
rrect(fx, FY + 0.53, 0.82, 0.47, "FFF4DC", "E8C27A", 0.05); s.addText([{ text: "Product photo", options: { bold: true, color: NV, fontSize: 7.2, breakLine: true } }, { text: "Ayurvedic label / brand", options: { fontSize: 6.5, color: BODY } }], { isTextBox: true, x: fx + 0.02, y: FY + 0.55, w: 0.78, h: 0.43, fontFace: SANS, margin: 0, align: "center", valign: "middle" });
fx += 0.82; farrow();
fbox(0.8, "1 · OCR", "read both images; user confirms names", LIGHT, LINE); farrow();
fbox(0.8, "2 · Match", "brand → generic; product → herbs; synonyms", LIGHT, LINE); farrow();
fbox(0.86, "3 · Knowledge base", "cited herb–drug table; grade A/B/C", LIGHT, LINE); farrow();
fbox(0.86, "Rule engine", "decides severity; AI does not", NV, NV, "FFFFFF", "DCE2F0"); farrow();
// verdicts
[["GREEN", "E6F4EA", "1E7F4F"], ["AMBER", "FFF1D6", "B86E00"], ["RED", "FDE8E8", "B00020"], ["NOT IN DB", "EEF0F4", "4B5563"]].forEach(([t, f, c], i) => {
  rrect(fx, FY + i * 0.255, 0.8, 0.22, f, f, 0.03); tb(t, { x: fx, y: FY + i * 0.255, w: 0.8, h: 0.22, fontSize: 6.8, bold: true, color: c, align: "center", valign: "middle" });
});
fx += 0.8; farrow();
fbox(0.86, "4 · AI explains", "simple Hindi/English + 3 doctor questions", LIGHT, LINE); farrow();
rrect(fx, FY, 0.82, 0.47, "FFF4DC", "E8C27A", 0.05); s.addText([{ text: "Doctor PDF", options: { bold: true, color: NV, fontSize: 7.2, breakLine: true } }, { text: "verdict + sources", options: { fontSize: 6.5, color: BODY } }], { isTextBox: true, x: fx + 0.02, y: FY + 0.02, w: 0.78, h: 0.43, fontFace: SANS, margin: 0, align: "center", valign: "middle" });
rrect(fx, FY + 0.53, 0.82, 0.47, "FFF4DC", "E8C27A", 0.05); s.addText([{ text: "ADR report", options: { bold: true, color: NV, fontSize: 7.2, breakLine: true } }, { text: "Ministry of Ayush format", options: { fontSize: 6.5, color: BODY } }], { isTextBox: true, x: fx + 0.02, y: FY + 0.55, w: 0.78, h: 0.43, fontFace: SANS, margin: 0, align: "center", valign: "middle" });
s.addText([{ text: "Verdict rules: ", options: { bold: true } }, { text: "Worst row wins; an unknown pair is never shown as green; grade-C evidence caps at AMBER; the answer is identical with the AI switched off." }],
  { isTextBox: true, x: L, y: 7.46, w: W, h: 0.18, fontFace: SANS, fontSize: 6.9, color: BODY, margin: 0, valign: "top" });

// ------------------------------------------------------------ comparison table (left) + stack & KB table (right)
const TY = 7.72;
const hdr = (t) => ({ text: t, options: { bold: true, color: "FFFFFF", fill: { color: NV }, fontSize: 7, valign: "middle" } });
const cell = (t, c, extra) => ({ text: t, options: Object.assign({ fontSize: 6.9, color: c || BODY, valign: "middle" }, extra || {}) });
const ts = (t) => cell(t, NV, { bold: true, fill: { color: "FFF4DC" } });
s.addTable([
  [hdr("Feature"), hdr("Medscape · Drugs.com · 1mg"), hdr("MSKCC · Natural Medicines"), hdr("TakeSure")],
  [cell("Ayurveda × allopathy pair check"), cell("✗", "B00020", { bold: true }), cell("~ single herbs", "B86E00", { bold: true }), ts("✓ every pair")],
  [cell("Indian brands & Hindi"), cell("~", "B86E00", { bold: true }), cell("✗", "B00020", { bold: true }), ts("✓ brands + synonyms")],
  [cell("Source on every verdict"), cell("✓", "1E7F4F", { bold: true }), cell("✓", "1E7F4F", { bold: true }), ts("✓ + evidence grade")],
  [cell("ADR report to Ministry of Ayush"), cell("✗", "B00020", { bold: true }), cell("✗", "B00020", { bold: true }), ts("✓ one tap")],
], { x: L, y: TY, w: COLW, colW: [1.3, 0.8, 0.8, 0.65], rowH: [0.28, 0.25, 0.25, 0.25, 0.25], fontFace: SANS, border: { type: "solid", color: LINE, pt: 0.5 }, margin: 0.03 });
tb("Our assessment from each tool's public documentation.", { x: L, y: TY + 1.62, w: COLW, h: 0.16, fontSize: 6.6, color: MUT });

s.addText([{ text: "Stack. ", options: { bold: true, color: INK } }, { text: "Next.js + TypeScript PWA (Hindi/English UI) · FastAPI + Pydantic REST API · PostgreSQL in production, SQLite offline · Tesseract OCR · RapidFuzz matching (≥85 accept, 70–85 ask the user) · Groq LLM, JSON-schema output, temperature 0 · ReportLab PDFs. No model training; runs fully offline on a laptop.", options: { breakLine: true } },
  { text: "Knowledge base. ", options: { bold: true, color: INK } }, { text: "40–60 herb × drug pairs curated from PubMed, NIH LiverTox, MSKCC, WHO monographs and the Ayurvedic Pharmacopoeia, graded on the Stockley's model. Decision support only, never diagnosis. Sample rows:" }],
  { isTextBox: true, x: RX, y: TY, w: COLW, h: 0.92, fontFace: SANS, fontSize: 6.9, color: BODY, margin: 0, valign: "top", paraSpaceAfter: 2 });
const sev = (t, c) => cell(t, c, { bold: true });
s.addTable([
  [hdr("Herb × drug"), hdr("Verdict"), hdr("What happens"), hdr("Source")],
  [cell("Ashwagandha × Levothyroxine"), sev("AMBER · grade B", "B86E00"), cell("May raise thyroid hormone"), cell("Sharma 2018, PMID 28829155")],
  [cell("Guggul × Warfarin"), sev("RED · grade B", "B00020"), cell("May increase bleeding risk"), cell("MSKCC About Herbs")],
  [cell("Giloy × Tacrolimus"), sev("RED · grade C", "B00020"), cell("May oppose immuno-suppression"), cell("Nagral 2021, LiverTox")],
], { x: RX, y: TY + 0.96, w: COLW, colW: [1.1, 0.8, 0.9, 0.75], rowH: [0.22, 0.26, 0.26, 0.26], fontFace: SANS, border: { type: "solid", color: LINE, pt: 0.5 }, margin: 0.03 });

// ------------------------------------------------------------ impact
h2(4, "Expected impact", 9.9);
const imps = [["Patients & caregivers", "A sourced answer before the first dose, in their own language, instead of silence or a guess. Free for citizens."],
  ["Doctors, vaidyas & chemists", "Finally learn what patients actually take; a QR on the chemist's bill or an API inside hospital and telemedicine systems makes the check routine."],
  ["Ministry of Ayush", "Structured, reproducible ADR reports and real co-use data from the catchment of its 99 peripheral pharmacovigilance centres."],
  ["Novelty", "Nothing public today checks an Ayurvedic product against an allopathic prescription. TakeSure builds the missing bridge table: Indian brands × Ayurvedic herb synonyms × graded evidence, open and auditable. Honest by design: grades, timing gaps instead of alarms, “not in database” instead of guesses."]];
imps.forEach(([b, t], i) => {
  const x = L + (i % 2) * 3.78, y = 10.2 + Math.floor(i / 2) * 0.52;
  s.addShape(pres.shapes.OVAL, { x, y: y + 0.01, w: 0.2, h: 0.2, fill: { color: NV }, line: { color: NV } });
  tb("✓", { x, y: y + 0.01, w: 0.2, h: 0.2, fontSize: 8, bold: true, color: SAF, align: "center", valign: "middle" });
  s.addText([{ text: b + " ", options: { bold: true, color: NV } }, { text: t, options: { color: BODY } }],
    { isTextBox: true, x: x + 0.27, y, w: 3.28, h: 0.5, fontFace: SANS, fontSize: 7.4, margin: 0, valign: "top" });
});

// ------------------------------------------------------------ footer
rect(0, 11.36, 8.27, 0.33, NV);
tb("Aligned with the Ministry of Ayush Pharmacovigilance Programme for ASU&H drugs · decision support only, never diagnosis", { x: L, y: 11.36, w: 5.4, h: 0.33, fontSize: 7.2, color: "C9D1E0", valign: "middle" });
tb("Team Bug Hunters · HACK@BVP 8.0 · BVEST XIII", { x: 5.3, y: 11.36, w: 2.5, h: 0.33, fontSize: 7.2, color: "C9D1E0", align: "right", valign: "middle" });

s.addNotes("One-page abstract for the Hack@BVP 8.0 Abstract Round. Problem, proposed solution, approach (workflow), expected impact.");
pres.writeFile({ fileName: "TakeSure_Abstract_HackBVP8.pptx" }).then(f => console.log("written", f));
