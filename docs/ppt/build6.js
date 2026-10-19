// Slide 6 (USP & Business Model) rebuilt in the restyled deck's look, with a Roadmap + Impact band instead of references.
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";

const BG = "FFFFFF", CARD = "EFE9DE", CARD_LINE = "D9D1C3", DRED = "8B2A2A", INK = "1F1A17", BODY = "2A2420", MUTED = "6B625A";
const GREEN = "4E6B3A", BROWN = "A0522D", ORANGE = "B5651D", DARK = "1E1E1E";
const T_GREEN = "E3E9DC", T_BROWN = "F0DFC6", T_ORANGE = "EFD9C0", T_DARK = "E8E1D6";
const SERIF = "Cambria", SANS = "Calibri";

function tb(s, text, o) { s.addText(text, Object.assign({ isTextBox: true, fontFace: SANS, color: BODY, margin: 0, valign: "middle" }, o)); }
function rect(s, x, y, w, h, fill, line) { s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: fill }, line: line ? { color: line, width: 0.75 } : { color: fill, width: 0 } }); }

const s = pres.addSlide();
s.background = { color: BG };

// ---- title bar (template: oval, serif title, logos) ----
s.addShape(pres.shapes.OVAL, { x: 0.32, y: 0.22, w: 1.6, h: 0.5, fill: { color: "FFFFFF" }, line: { color: "4A5A7A", width: 0.75 } });
tb(s, "Your Team Name", { x: 0.32, y: 0.22, w: 1.6, h: 0.5, fontSize: 10.5, color: INK, align: "center" });
tb(s, "USP (UNIQUE SELLING PROPOSITION)\n& BUSINESS MODEL", { x: 2.3, y: 0.1, w: 5.4, h: 0.78, fontFace: SERIF, fontSize: 19, bold: true, color: INK, align: "center" });
s.addImage({ path: "assets/devsphere_alpha.png", x: 8.5, y: 0.14, w: 0.5, h: 0.5 });
tb(s, "DevSphereIndia", { x: 8.3, y: 0.62, w: 0.9, h: 0.16, fontSize: 5.5, bold: true, color: INK, align: "center" });
s.addImage({ path: "assets/codeslayer_alpha.png", x: 9.0, y: 0.1, w: 0.62, h: 0.62 });

// ---- section header bars ----
const Lx = 0.33, Lw = 4.62, Rx = 5.08, Rw = 4.6;
rect(s, Lx, 0.9, Lw, 0.27, DRED);
tb(s, "USP (UNIQUE SELLING PROPOSITION)", { x: Lx + 0.12, y: 0.9, w: Lw - 0.2, h: 0.27, fontSize: 9, bold: true, color: "FFFFFF", charSpacing: 2 });
rect(s, Rx, 0.9, Rw, 0.27, DRED);
tb(s, "BUSINESS MODEL", { x: Rx + 0.12, y: 0.9, w: Rw - 0.2, h: 0.27, fontSize: 9, bold: true, color: "FFFFFF", charSpacing: 2 });

// ---- USP cards ----
const usp = [
  ["India's first safety layer between the two medical systems people already mix", " — nothing public today checks an Ayurvedic product against an allopathic prescription."],
  ["Verdict from published data; AI only explains", " — auditable rules over cited rows; the opposite of a “ChatGPT wrapper”."],
  ["Built for India:", " Indian brand names, Sanskrit/Hindi synonyms, Hindi explanations, Ministry of Ayush ADR format, Ayush Suraksha portal link."],
  ["Honest by design:", " evidence grades, timing gaps instead of alarms, “not in database” instead of guesses."],
];
let y = 1.23;
const rowH = 0.7, gap = 0.06;
usp.forEach(([b, r], i) => {
  rect(s, Lx, y, Lw, rowH, CARD, CARD_LINE);
  s.addShape(pres.shapes.OVAL, { x: Lx + 0.14, y: y + rowH / 2 - 0.14, w: 0.28, h: 0.28, fill: { color: DRED }, line: { color: DRED } });
  tb(s, String(i + 1), { x: Lx + 0.14, y: y + rowH / 2 - 0.14, w: 0.28, h: 0.28, fontSize: 9, bold: true, color: "FFFFFF", align: "center" });
  s.addText([{ text: b, options: { bold: true, color: INK } }, { text: r, options: { color: BODY } }], { isTextBox: true, x: Lx + 0.55, y: y + 0.04, w: Lw - 0.68, h: rowH - 0.08, fontFace: SANS, fontSize: 9, margin: 0, valign: "middle" });
  y += rowH + gap;
});

// ---- business model rows ----
const bm = [
  ["B2C", GREEN, T_GREEN, "Free for citizens", " — Web/PWA checker in Hindi & English; grows the knowledge base and the ADR signal."],
  ["B2B", BROWN, T_BROWN, "API & counter tool", " — Per-query / subscription API for pharmacy chains, hospital HIS, telemedicine apps; QR on the chemist's bill."],
  ["B2G / CSR", ORANGE, T_ORANGE, "Programmes & grants", " — Co-use analytics and structured ICSRs for the Ministry of Ayush pharmacovigilance network; CSR funding from Ayurvedic brands that want a trust layer."],
  ["PLATFORM", DARK, T_DARK, "Ayush Grid / ABDM integration", " — verdict attached to the ABHA health record; open KB co-curated with Ayurveda colleges."],
];
y = 1.23;
bm.forEach(([tag, c, tint, b, r]) => {
  rect(s, Rx, y, 0.95, rowH, c);
  tb(s, tag, { x: Rx, y, w: 0.95, h: rowH, fontSize: 8.5, bold: true, color: "FFFFFF", align: "center", charSpacing: 1.5 });
  rect(s, Rx + 0.95, y, Rw - 0.95, rowH, tint, CARD_LINE);
  s.addText([{ text: b, options: { bold: true, color: INK } }, { text: r, options: { color: BODY } }], { isTextBox: true, x: Rx + 1.08, y: y + 0.04, w: Rw - 1.2, h: rowH - 0.08, fontFace: SANS, fontSize: 8.6, margin: 0, valign: "middle" });
  y += rowH + gap;
});

// ---- bottom band: Roadmap (left) + Impact (right) ----
const By = 4.33, Bh = 1.1;
rect(s, Lx, By, 5.55, Bh, CARD, CARD_LINE);
tb(s, "WHO BENEFITS · ONE KNOWLEDGE BASE, FOUR USERS", { x: Lx + 0.12, y: By + 0.05, w: 5.3, h: 0.2, fontSize: 7.5, bold: true, color: DRED, charSpacing: 1.5 });
const who = [
  ["PATIENTS & FAMILIES", DRED, "60-second verdict in Hindi or English, timing gaps, and three questions to carry to the clinic"],
  ["DOCTORS & VAIDYAS", BROWN, "Patients finally disclose what they take; a one-page summary with sources bridges both vocabularies"],
  ["PHARMACISTS & CHEMISTS", ORANGE, "Counter-side cross-check for the only shop that sells both systems' products; QR on the bill"],
  ["MINISTRY OF AYUSH / NPvCC", GREEN, "Structured ICSRs in the official format, anonymised co-use analytics by state, early signal detection"],
];
let wx = Lx + 0.12;
const ww = 1.3;
who.forEach(([t, c, d]) => {
  rect(s, wx, By + 0.3, ww, 0.26, c);
  tb(s, t, { x: wx + 0.03, y: By + 0.3, w: ww - 0.06, h: 0.26, fontSize: 6.3, bold: true, color: "FFFFFF", align: "center", charSpacing: 0.5 });
  rect(s, wx, By + 0.56, ww, 0.47, "FFFFFF", CARD_LINE);
  tb(s, d, { x: wx + 0.05, y: By + 0.58, w: ww - 0.1, h: 0.43, fontSize: 6.4, color: BODY, align: "center", valign: "top" });
  wx += ww + 0.037;
});

rect(s, 5.93, By, 3.75, Bh, CARD, CARD_LINE);
const Ix = 5.93;
tb(s, "IMPACT · WHY IT MATTERS", { x: Ix + 0.12, y: By + 0.05, w: 3.5, h: 0.2, fontSize: 7.5, bold: true, color: DRED, charSpacing: 1.5 });
const impact = [
  ["1,473", "ASU&H adverse-event reports nationally since 2018 — TakeSure turns every reaction into a structured ICSR"],
  ["75%", "of herbal users with a side effect never told their doctor — TakeSure hands them the questions to ask"],
  ["0", "public tools today check an Ayurvedic product against an allopathic prescription — TakeSure is the first"],
];
let ix = Ix + 0.1;
impact.forEach(([n, d]) => {
  tb(s, n, { x: ix, y: By + 0.27, w: 1.15, h: 0.34, fontFace: SERIF, fontSize: 17, bold: true, color: DRED, align: "center" });
  tb(s, d, { x: ix, y: By + 0.6, w: 1.15, h: 0.48, fontSize: 6.3, color: BODY, align: "center", valign: "top" });
  ix += 1.2;
});

s.addNotes("USP: first Ayurveda × allopathy safety layer; verdict from data, AI only explains; built for India; honest by design. Business model: free B2C, B2B API, B2G/CSR programmes, ABDM platform. Roadmap from hackathon MVP to Ministry integration; three impact numbers.");
pres.writeFile({ fileName: "TakeSure_Slide6_USP_BusinessModel.pptx" }).then((f) => console.log("written", f));
