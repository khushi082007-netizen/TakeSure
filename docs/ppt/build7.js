// References + comparison slide — honest scoring (TakeSure not a perfect 5), consistent team name, template title bar.
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";

const INK = "1F1A17", BODY = "2A2420", MUTED = "5E5852", LINKC = "1155CC", DRED = "8B1A1A", NAVY = "1F3B73", GREEN = "2E7D32", ORANGE = "C77B16";
const GOLD = "E0A800", STAR_OFF = "C9CDD3";
const SERIF = "Times New Roman", SANS = "Arial", SYM = "Segoe UI Symbol";
function tb(s, text, o) { s.addText(text, Object.assign({ isTextBox: true, fontFace: SANS, color: BODY, margin: 0, valign: "middle" }, o)); }
function rect(s, x, y, w, h, fill, line) { s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: fill }, line: line ? { color: line, width: 0.75 } : { color: fill, width: 0 } }); }
function rr(s, x, y, w, h, fill, line) { s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.05, fill: { color: fill }, line: { color: line || fill, width: 0.75 } }); }
function stars(n, big) {
  const full = Math.round(n), empty = 5 - full;
  const size = big ? 11 : 9;
  return [
    { text: "★".repeat(full), options: { color: GOLD, fontFace: SYM, fontSize: size } },
    { text: "☆".repeat(empty), options: { color: STAR_OFF, fontFace: SYM, fontSize: size } },
  ];
}

const s = pres.addSlide();
s.background = { color: "FFFFFF" };

// ---- title bar (template) ----
s.addShape(pres.shapes.OVAL, { x: 0.12, y: 0.16, w: 1.85, h: 0.52, fill: { color: "FFFFFF" }, line: { color: "000000", width: 0.75 } });
tb(s, "Bug Hunters", { x: 0.12, y: 0.16, w: 1.85, h: 0.52, fontSize: 12, color: "000000", align: "center" });
tb(s, "REFERENCES", { x: 1.9, y: 0.12, w: 5.9, h: 0.72, fontFace: SERIF, fontSize: 22, bold: true, color: "000000", align: "center" });
s.addImage({ path: "assets/devsphere_alpha.png", x: 8.12, y: 0.06, w: 0.62, h: 0.62 });
tb(s, "DevSphereIndia", { x: 7.9, y: 0.66, w: 1.05, h: 0.16, fontSize: 6, bold: true, color: "000000", align: "center" });
s.addImage({ path: "assets/codeslayer_alpha.png", x: 8.95, y: 0.02, w: 0.82, h: 0.82 });

// ---- left: research & references ----
const LX = 0.3, LW = 3.15;
rect(s, LX, 1.0, LW, 4.45, "FFFFFF", "C9C9C9");
rect(s, LX + 0.12, 1.08, 2.2, 0.27, DRED);
tb(s, "RESEARCH & REFERENCES", { x: LX + 0.2, y: 1.08, w: 2.1, h: 0.27, fontSize: 8.5, bold: true, color: "FFFFFF" });
const refs = [
  ["Sharma 2018: ashwagandha & thyroid trial", "RCT, 50 patients, 600 mg/day, 8 weeks", "pubmed.ncbi.nlm.nih.gov/28829155", "https://pubmed.ncbi.nlm.nih.gov/28829155/"],
  ["Gohil & Patel 2007: herb–drug case reports", "133 cases, only 6% well documented (Indian J Pharmacol)", "doi.org/10.4103/0253-7613.33432", "https://doi.org/10.4103/0253-7613.33432"],
  ["Ghosh et al. 2009: herb–drug interaction", "Fallout of poor doctor–patient communication (JCDR)", "jcdr.net/articles/PDF/576/501.pdf", "https://www.jcdr.net/articles/PDF/576/501.pdf"],
  ["Interactions between substances in Ayurveda", "Food–drug & Ayurveda–modern drug review, 2013", "doi.org/10.1515/dmdi-2013-0014", "https://doi.org/10.1515/dmdi-2013-0014"],
  ["NSSO Survey on Ayush 2022-23 (MoSPI press note)", "Ayurveda is the most used Ayush system", "mospi.gov.in/…/PressNote_Ayush_13062024N.pdf", "https://www.mospi.gov.in/sites/default/files/press_release/PressNote_Ayush_13062024N.pdf"],
  ["Ayush Suraksha portal (Ministry of Ayush)", "Suspected ADR reporting for ASU&H drugs", "suraksha.ayush.gov.in", "https://suraksha.ayush.gov.in/"],
  ["ASU&H pharmacovigilance (ITRA, Jamnagar)", "PPvC / IPvC reporting network", "itra.ac.in/pharmacovigilance", "https://itra.ac.in/pharmacovigilance"],
  ["Open-source tools we build on", "OCR (Tesseract) and name matching (RapidFuzz)", "github.com/tesseract-ocr · github.com/rapidfuzz", "https://github.com/tesseract-ocr/tesseract"],
];
let ry = 1.42;
refs.forEach(([t, d, l, url], i) => {
  rr(s, LX + 0.1, ry, LW - 0.2, 0.46, "F6F6F7", "DDDDDD");
  s.addShape(pres.shapes.OVAL, { x: LX + 0.17, y: ry + 0.12, w: 0.22, h: 0.22, fill: { color: DRED }, line: { color: DRED } });
  tb(s, String(i + 1), { x: LX + 0.17, y: ry + 0.12, w: 0.22, h: 0.22, fontSize: 7.5, bold: true, color: "FFFFFF", align: "center" });
  tb(s, t, { x: LX + 0.46, y: ry + 0.03, w: LW - 0.6, h: 0.15, fontSize: 7.3, bold: true, color: INK, valign: "top" });
  tb(s, d, { x: LX + 0.46, y: ry + 0.17, w: LW - 0.6, h: 0.14, fontSize: 6.5, color: MUTED, valign: "top" });
  s.addText([{ text: l, options: { hyperlink: { url, tooltip: url }, color: LINKC, underline: { style: "sng" } } }], { isTextBox: true, x: LX + 0.46, y: ry + 0.3, w: LW - 0.6, h: 0.14, fontFace: SANS, fontSize: 6.3, margin: 0, valign: "top" });
  ry += 0.5;
});

// ---- right: comparison grid ----
const RX = 3.62, cols = [0.98, 1.18, 1.18, 1.3, 1.4]; // feature, medscape, mskcc, takesure, why
const cx = [RX]; for (let i = 0; i < cols.length - 1; i++) cx.push(cx[i] + cols[i]);
tb(s, "COMPARISON WITH EXISTING TOOLS", { x: RX, y: 1.0, w: 6.0, h: 0.2, fontSize: 8, bold: true, color: DRED, charSpacing: 1.5 });
let gy = 1.24;
const hh = 0.42;
const heads = ["FEATURE", "MEDSCAPE · DRUGS.COM · 1MG", "MSKCC · NATURAL MEDICINES", "TAKESURE (OUR APP)", "WHY TAKESURE?"];
const headFill = [NAVY, NAVY, NAVY, GREEN, ORANGE];
heads.forEach((h, i) => { rect(s, cx[i], gy, cols[i], hh, headFill[i], "FFFFFF"); tb(s, h, { x: cx[i] + 0.04, y: gy, w: cols[i] - 0.08, h: hh, fontSize: 7, bold: true, color: "FFFFFF", align: "center" }); });
gy += hh;

const rows = [
  { f: "Ayurveda × allopathy check", a: ["✗ Allopathic × allopathic pairs only", 1], b: ["~ Single-herb monographs only", 2], t: ["✓ Prescription × Ayurvedic product, every herb–drug pair checked", 5], w: "★ Only tool that checks the two systems people already mix." },
  { f: "Indian brands & Hindi", a: ["~ Partly covered", 3], b: ["✗ Western herbs, English only", 1], t: ["✓ Indian brands + Sanskrit / Hindi synonyms, Hindi UI", 5], w: "★ Matches Himalaya, Dabur and the names patients actually use." },
  { f: "Sources on every verdict", a: ["✓ Sources shown", 4], b: ["✓ Sources shown", 4], t: ["✓ Sources + grade A/B/C with DOI/PMID; marked “needs verification” until re-checked", 4], w: "★ Weak evidence is shown as weak, never hidden — and we say so when a citation is not yet re-verified." },
  { f: "ADR report to Ministry", a: ["✗ No reporting", 1], b: ["✗ No reporting", 1], t: ["✓ One-tap report in Ministry of Ayush format", 5], w: "★ Feeds the Ayush pharmacovigilance network." },
];
const rh = 0.74;
const cellText = (x, y, w, h, txt, n, fill) => {
  rect(s, x, y, w, h, fill, "E3E3E3");
  tb(s, txt, { x: x + 0.06, y: y + 0.04, w: w - 0.12, h: h - 0.3, fontSize: 6.8, color: BODY, valign: "top" });
  s.addText(stars(n).concat([{ text: `  ${n} / 5`, options: { color: MUTED, fontFace: SANS, fontSize: 7 } }]), { isTextBox: true, x: x + 0.06, y: y + h - 0.24, w: w - 0.12, h: 0.2, margin: 0, valign: "middle" });
};
rows.forEach((r, i) => {
  const zebra = i % 2 ? "FAFAFA" : "FFFFFF";
  rect(s, cx[0], gy, cols[0], rh, zebra, "E3E3E3");
  tb(s, r.f, { x: cx[0] + 0.06, y: gy, w: cols[0] - 0.12, h: rh, fontSize: 8, bold: true, color: INK });
  cellText(cx[1], gy, cols[1], rh, r.a[0], r.a[1], zebra);
  cellText(cx[2], gy, cols[2], rh, r.b[0], r.b[1], zebra);
  cellText(cx[3], gy, cols[3], rh, r.t[0], r.t[1], "E8F3EA");
  rect(s, cx[4], gy, cols[4], rh, "FFF4DF", "E3E3E3");
  tb(s, r.w, { x: cx[4] + 0.06, y: gy, w: cols[4] - 0.12, h: rh, fontSize: 6.8, bold: true, color: "7A4B00" });
  gy += rh;
});

// overall row — averages of the four rows
const avg = (arr) => Math.round((arr.reduce((p, c) => p + c, 0) / arr.length) * 10) / 10;
const oA = avg(rows.map((r) => r.a[1])), oB = avg(rows.map((r) => r.b[1])), oT = avg(rows.map((r) => r.t[1]));
const oh = 0.5;
rect(s, cx[0], gy, cols[0], oh, NAVY); tb(s, "OVERALL RATING", { x: cx[0] + 0.06, y: gy, w: cols[0] - 0.12, h: oh, fontSize: 7.5, bold: true, color: "FFFFFF" });
const overallCell = (i, label, n, fill) => {
  rect(s, cx[i], gy, cols[i], oh, fill);
  s.addText([{ text: `${label}  ${n.toFixed(1)} / 5`, options: { bold: true, color: "FFFFFF", fontFace: SANS, fontSize: 8, breakLine: true } }].concat(stars(n, true)), { isTextBox: true, x: cx[i] + 0.06, y: gy + 0.02, w: cols[i] - 0.12, h: oh - 0.04, margin: 0, align: "center", valign: "middle" });
};
overallCell(1, "Medscape", oA, NAVY); overallCell(2, "MSKCC", oB, NAVY); overallCell(3, "TakeSure", oT, GREEN);
rect(s, cx[4], gy, cols[4], oh, ORANGE);
tb(s, `TakeSure scores ${(oT - Math.max(oA, oB)).toFixed(1)} points higher than the best alternative.`, { x: cx[4] + 0.06, y: gy, w: cols[4] - 0.12, h: oh, fontSize: 7, bold: true, color: "FFFFFF" });
gy += oh;
tb(s, "Ratings out of 5 are the team's assessment on the four features compared (sourced = 4, +1 with evidence grade · partly = 3 · single herb = 2 · none = 1). TakeSure takes 4/5 on Sources deliberately: every citation stays marked “needs verification” until a second reviewer re-opens the DOI/PMID.", { x: RX, y: gy + 0.05, w: 6.04, h: 0.3, fontSize: 6, italic: true, color: MUTED, valign: "top" });

s.addNotes("References and an honest comparison. TakeSure rates 4/5 on sources on purpose: citations are flagged 'needs verification' until re-checked. Judges trust a team that leaves itself one gap.");
pres.writeFile({ fileName: "TakeSure_Slide_References_Comparison.pptx" }).then((f) => console.log("written", f));
