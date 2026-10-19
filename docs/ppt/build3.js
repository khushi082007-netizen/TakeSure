// Slide 3 — OUR UNIQUE SOLUTION — corrected: template title bar, team oval, readable full-height workflow, fixed Novelty bullets.
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";

const INK = "1F1A17", BODY = "2A2420", MUTED = "5E5852", BLUE = "1155CC", DRED = "8B2A2A", LINE = "333333";
const PINK = "FBE9E7", PINK_L = "8B2A2A", GREYB = "F4F4F5", GREY_L = "444444";
const SERIF = "Times New Roman", SANS = "Arial";

function tb(s, text, o) { s.addText(text, Object.assign({ isTextBox: true, fontFace: SANS, color: BODY, margin: 0, valign: "middle" }, o)); }
function rr(s, x, y, w, h, fill, line, lw) { s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.05, fill: { color: fill }, line: { color: line, width: lw || 1 } }); }
function down(s, x, y, h) { s.addShape(pres.shapes.LINE, { x, y, w: 0, h, line: { color: LINE, width: 1.25, endArrowType: "triangle" } }); }

const s = pres.addSlide();
s.background = { color: "FFFFFF" };

// ---- title bar exactly as the template ----
s.addShape(pres.shapes.OVAL, { x: 0.12, y: 0.16, w: 1.85, h: 0.52, fill: { color: "FFFFFF" }, line: { color: "000000", width: 0.75 } });
tb(s, "Bug Hunters", { x: 0.12, y: 0.16, w: 1.85, h: 0.52, fontSize: 12, color: "000000", align: "center" });
tb(s, "OUR UNIQUE SOLUTION", { x: 1.9, y: 0.12, w: 5.9, h: 0.78, fontFace: SERIF, fontSize: 22, bold: true, color: "000000", align: "center" });
s.addImage({ path: "assets/devsphere_alpha.png", x: 8.12, y: 0.06, w: 0.62, h: 0.62 });
tb(s, "DevSphereIndia", { x: 7.9, y: 0.66, w: 1.05, h: 0.16, fontSize: 6, bold: true, color: "000000", align: "center" });
s.addImage({ path: "assets/codeslayer_alpha.png", x: 8.95, y: 0.02, w: 0.82, h: 0.82 });

// ---- left: key features ----
tb(s, "Key Features", { x: 0.4, y: 0.98, w: 3.5, h: 0.32, fontSize: 15, bold: true, color: BLUE });
const feats = [
  ["Scan", "Photograph the prescription and the Ayurvedic product label (or type the names). OCR reads them; every name is shown for confirmation before anything is checked."],
  ["Match", "Indian brand → generic (Thyronorm → levothyroxine), product → herbs (Chyawanprash → amla, ashwagandha…) via a curated bridge dictionary + fuzzy matching."],
  ["Decide", "Deterministic rule engine over a cited knowledge base → GREEN / AMBER / RED / NOT IN DATABASE, with timing gaps (e.g. keep 2–3 h between Triphala and oral medicines)."],
  ["Explain", "AI rewrites only the matched evidence into simple Hindi/English + 3 questions to ask the doctor. It cannot add, remove or re-grade an interaction."],
  ["Report", "One-page PDF with sources for the doctor; one-tap suspected-ADR report in the Ministry of Ayush format for the Ayush Suraksha portal."],
];
let fy = 1.36;
feats.forEach(([t, d], i) => {
  s.addShape(pres.shapes.OVAL, { x: 0.42, y: fy + 0.03, w: 0.3, h: 0.3, fill: { color: DRED }, line: { color: DRED } });
  tb(s, String(i + 1), { x: 0.42, y: fy + 0.03, w: 0.3, h: 0.3, fontSize: 10, bold: true, color: "FFFFFF", align: "center" });
  s.addText([{ text: t + " — ", options: { bold: true, color: INK } }, { text: d, options: { color: BODY } }], { isTextBox: true, x: 0.82, y: fy, w: 4.05, h: 0.56, fontFace: SANS, fontSize: 8.8, margin: 0, valign: "top" });
  fy += 0.58;
});

// ---- left: novelty (two proper bullets) ----
tb(s, "Novelty", { x: 0.4, y: 4.3, w: 3.0, h: 0.3, fontSize: 15, bold: true, color: DRED });
s.addText([
  { text: "“Verdict from published data; AI only explains.” ", options: { bullet: true, bold: true, color: INK } },
  { text: "The risk level never comes from a language model — it comes from a versioned, cited knowledge-base row. Turn the AI off and the verdict is identical.", options: { color: BODY, breakLine: true } },
  { text: "The missing bridge table: ", options: { bullet: true, bold: true, color: INK } },
  { text: "Indian brand names × Ayurvedic herb synonyms (Sanskrit/Hindi/Latin) × graded published evidence — open, auditable, co-curated with Ayurveda colleges.", options: { color: BODY } },
], { isTextBox: true, x: 0.42, y: 4.6, w: 4.45, h: 0.9, fontFace: SANS, fontSize: 8.4, margin: 0, valign: "top", paraSpaceAfter: 4 });

// ---- right: the workflow, redrawn at full height ----
const X = 5.25, W = 4.45, cx = X + W / 2;
let y = 0.95;
const gapA = 0.09; // arrow gap between nodes
function node(x, w, h, title, sub, fill, line, tcol, scol, bold) {
  rr(s, x, y, w, h, fill, line, 1);
  if (sub) {
    tb(s, title, { x: x + 0.06, y: y + 0.02, w: w - 0.12, h: h * 0.52, fontSize: 8.5, bold: true, color: tcol || INK, align: "center" });
    tb(s, sub, { x: x + 0.06, y: y + h * 0.5, w: w - 0.12, h: h * 0.48, fontSize: 6.5, color: scol || MUTED, align: "center", valign: "top" });
  } else {
    tb(s, title, { x: x + 0.06, y, w: w - 0.12, h, fontSize: 8.5, bold: !!bold, color: tcol || INK, align: "center" });
  }
}
// 1. inputs (two boxes)
{
  const h = 0.42, gw = (W - 0.16) / 2;
  node(X, gw, h, "Prescription Photo", "Allopathic medicines", PINK, PINK_L);
  node(X + gw + 0.16, gw, h, "Ayurvedic Product Photo", "Label / brand", PINK, PINK_L);
  // merge lines into OCR
  s.addShape(pres.shapes.LINE, { x: X + gw / 2, y: y + h, w: 0, h: 0.06, line: { color: LINE, width: 1.25 } });
  s.addShape(pres.shapes.LINE, { x: X + gw + 0.16 + gw / 2, y: y + h, w: 0, h: 0.06, line: { color: LINE, width: 1.25 } });
  s.addShape(pres.shapes.LINE, { x: X + gw / 2, y: y + h + 0.06, w: gw + 0.16, h: 0, line: { color: LINE, width: 1.25 } });
  down(s, cx, y + h + 0.06, gapA - 0.06);
  y += h + gapA;
}
const mid = [
  ["OCR", "Extract text from both images; files deleted after reading", GREYB, GREY_L, 0.36],
  ["Medicine / Herb Normalisation", "Identify medicines & herbs; brand → generic / standard name; user confirms", GREYB, GREY_L, 0.4],
  ["Verified Knowledge Base", "Curated herb–drug interaction table with sources & evidence grade A/B/C", GREYB, GREY_L, 0.4],
];
for (const [t, d, f, l, h] of mid) { node(X, W, h, t, d, f, l); down(s, cx, y + h, gapA); y += h + gapA; }
// rule-based check (dark red)
{
  const h = 0.44;
  rr(s, X, y, W, h, DRED, DRED, 1);
  tb(s, "RULE-BASED CHECK", { x: X, y: y + 0.02, w: W, h: 0.22, fontSize: 9.5, bold: true, color: "FFFFFF", align: "center" });
  tb(s, "Determine safety level — AI does not decide", { x: X, y: y + 0.23, w: W, h: 0.18, fontSize: 7, color: "F6D5D3", align: "center", valign: "top" });
  // fan-out line to the four verdicts
  s.addShape(pres.shapes.LINE, { x: cx, y: y + h, w: 0, h: 0.05, line: { color: LINE, width: 1.25 } });
  const vw = (W - 0.3) / 4;
  s.addShape(pres.shapes.LINE, { x: X + vw / 2, y: y + h + 0.05, w: W - vw, h: 0, line: { color: LINE, width: 1.25 } });
  for (let i = 0; i < 4; i++) down(s, X + vw / 2 + i * (vw + 0.1), y + h + 0.05, gapA - 0.05);
  y += h + gapA;
}
// verdicts
{
  const h = 0.44, vw = (W - 0.3) / 4;
  const V = [["GREEN", "Safe", "E8F5E9", "1E7F4F"], ["AMBER", "Use with caution", "FFF4D6", "B86E00"], ["RED", "High risk", "FDE8E8", "B00020"], ["NOT VERIFIED", "Insufficient data", "EEF0F4", "4B5563"]];
  V.forEach(([t, d, f, c], i) => {
    const x = X + i * (vw + 0.1);
    rr(s, x, y, vw, h, f, c, 1.25);
    tb(s, t, { x: x - 0.02, y: y + 0.03, w: vw + 0.04, h: 0.22, fontSize: 7.6, bold: true, color: c, align: "center" });
    tb(s, d, { x, y: y + 0.25, w: vw, h: 0.2, fontSize: 6.6, color: MUTED, align: "center", valign: "top" });
  });
  // merge back
  for (let i = 0; i < 4; i++) s.addShape(pres.shapes.LINE, { x: X + vw / 2 + i * (vw + 0.1), y: y + h, w: 0, h: 0.05, line: { color: LINE, width: 1.25 } });
  s.addShape(pres.shapes.LINE, { x: X + vw / 2, y: y + h + 0.05, w: W - vw, h: 0, line: { color: LINE, width: 1.25 } });
  down(s, cx, y + h + 0.05, gapA - 0.05);
  y += h + gapA;
}
const tail = [
  ["AI Explanation", "Simple, clear, patient-friendly language — Hindi / English; translates, never decides", GREYB, GREY_L, 0.38],
  ["Doctor Questions + Sources", "3 questions to ask your doctor  |  evidence grade  |  source / DOI", GREYB, GREY_L, 0.38],
];
for (const [t, d, f, l, h] of tail) { node(X, W, h, t, d, f, l); down(s, cx, y + h, gapA); y += h + gapA; }
// outputs (two boxes) — the last arrow above fans to both
{
  const h = 0.42, gw = (W - 0.16) / 2;
  node(X, gw, h, "Share with Doctor", "Download / share PDF summary", GREYB, GREY_L);
  node(X + gw + 0.16, gw, h, "ADR Reporting", "Pre-filled Ayush pharmacovigilance form → export", PINK, PINK_L);
  y += h;
}
tb(s, "Decision support only · never diagnosis · always ask your doctor", { x: X, y: y + 0.02, w: W, h: 0.14, fontSize: 6.3, italic: true, color: MUTED, align: "center" });

s.addNotes("Five features: Scan, Match, Decide, Explain, Report. Novelty: verdict from data, AI only explains; the bridge table nobody has built. The workflow on the right is a design diagram of the proposed system.");
pres.writeFile({ fileName: "TakeSure_Slide3_UniqueSolution.pptx" }).then((f) => console.log("written", f));
