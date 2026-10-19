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
  s.addText([{ text: t + " — ", options: { bold: true, color: INK } }, { text: d, options: { color: BODY } }], { isTextBox: true, x: 0.82, y: fy, w: 5.75, h: 0.56, fontFace: SANS, fontSize: 9.8, margin: 0, valign: "top" });
  fy += 0.58;
});

// ---- left: novelty (two proper bullets) ----
tb(s, "Novelty", { x: 0.4, y: 4.3, w: 3.0, h: 0.3, fontSize: 15, bold: true, color: DRED });
s.addText([
  { text: "“Verdict from published data; AI only explains.” ", options: { bullet: true, bold: true, color: INK } },
  { text: "The risk level never comes from a language model — it comes from a versioned, cited knowledge-base row. Turn the AI off and the verdict is identical.", options: { color: BODY, breakLine: true } },
  { text: "The missing bridge table: ", options: { bullet: true, bold: true, color: INK } },
  { text: "Indian brand names × Ayurvedic herb synonyms (Sanskrit/Hindi/Latin) × graded published evidence — open, auditable, co-curated with Ayurveda colleges.", options: { color: BODY } },
], { isTextBox: true, x: 0.42, y: 4.6, w: 6.1, h: 0.9, fontFace: SANS, fontSize: 9.2, margin: 0, valign: "top", paraSpaceAfter: 4 });

// ---- right: the team's flowchart (redrawn with larger text), full slide height ----
const IH = 4.55, IW = IH * 1040 / 1700;   // keep the image's aspect ratio
s.addImage({ path: "assets/flowchart_big.png", x: 9.65 - IW, y: 0.95, w: IW, h: IH });

s.addNotes("Five features: Scan, Match, Decide, Explain, Report. Novelty: verdict from data, AI only explains; the bridge table nobody has built. The workflow on the right is a design diagram of the proposed system.");
pres.writeFile({ fileName: "TakeSure_Slide3_with_Flowchart.pptx" }).then((f) => console.log("written", f));
