# -*- coding: utf-8 -*-
"""Derive the Kritical Hacks deck from the CodeSlayer deck: same content and colours, template removed, new slides added."""
import re, shutil
shutil.copy(r"C:\Temp\bvp\deck\build_deck.js", r"C:\Temp\bvp\kritical\build_cs.js")
p = r"C:\Temp\bvp\kritical\build_cs.js"
s = open(p, encoding="utf-8").read()

def rep(a, b, cnt=1):
    global s
    assert a in s, a[:70]
    s = s.replace(a, b, cnt)

rep('const NV = "14213D", SAF = "F4A300", INK = "1B1B1B", MUT = "5D6166", LIGHT = "F4F6FA", LINE = "C9D0DD", BODY = "333333", WHITE = "FFFFFF";',
    'const NV = "8B2A2A", SAF = "FFFFFF", INK = "1B1B1B", MUT = "5D6166", LIGHT = "F6F3F3", LINE = "D9CFCF", BODY = "333333", WHITE = "FFFFFF", BLUE = "1155CC", TF = "6D28D9";')
rep('const SANS = "Calibri", SERIF = "Cambria";', 'const SANS = "Arial", SERIF = "Times New Roman";')
rep('const HERO = "C:/Temp/bvp/pptx/img/hero.png", FLOW = "C:/Temp/final-ppt/flowchart_big_text.png";',
    'const HERO = "C:/Temp/bvp/logo/out/B_mark_transparent.png", FLOW = "C:/Temp/final-ppt/flowchart_big_text.png", SHOT_CUR = "C:/Temp/bvp/kritical/curation_panel.png";')
rep('pres.title = "TakeSure — Hack@BVP 8.0";', 'pres.title = "TakeSure — Kritical Hacks 2026";')

NEWSLIDE = r'''function newSlide(title, sub) {
  const s = pres.addSlide(); slideNo++;
  s.background = { color: "FFFFFF" };
  s.addShape(pres.shapes.OVAL, { x: 0.12, y: 0.14, w: 1.85, h: 0.52, fill: { color: WHITE }, line: { color: "000000", width: 0.75 } });
  tb(s, "Bug Hunters", { x: 0.12, y: 0.14, w: 1.85, h: 0.52, fontFace: SERIF, fontSize: 13, bold: true, color: "000000", align: "center", valign: "middle" });
  tb(s, title, { x: 2.05, y: 0.1, w: 6.3, h: 0.6, fontFace: SERIF, fontSize: 20, bold: true, color: "000000", align: "center", valign: "middle", underline: { style: "sng" } });
  tb(s, "KRITICAL HACKS 2026\nIGDTUW · AI/ML Track", { x: 8.35, y: 0.14, w: 1.5, h: 0.52, fontSize: 7.5, bold: true, color: NV, align: "right", valign: "middle", lineSpacingMultiple: 1.05 });
  s.addShape(pres.shapes.LINE, { x: 0.25, y: 0.74, w: 9.5, h: 0, line: { color: NV, width: 1.25 } });
  tb(s, "TakeSure · Confidence before taking something · Team Bug Hunters · Kritical Hacks 2026 · " + (sub || "Decision support, not diagnosis"), { x: 0.25, y: 5.38, w: 8.3, h: 0.22, fontSize: 7, color: MUT, valign: "middle" });
  tb(s, String(slideNo), { x: 8.75, y: 5.38, w: 1.0, h: 0.22, fontSize: 7, color: MUT, align: "right", valign: "middle" });
  return s;
}

'''
start = s.index("function newSlide(title, sub) {"); end = s.index("// =============================================================== 1. Title")
s = s[:start] + NEWSLIDE + s[end:]

TITLE = r'''// =============================================================== 1. Title
{
  const s = pres.addSlide(); slideNo++;
  s.background = { color: "FFFFFF" };
  s.addShape(pres.shapes.OVAL, { x: 0.12, y: 0.14, w: 1.85, h: 0.52, fill: { color: WHITE }, line: { color: "000000", width: 0.75 } });
  tb(s, "Bug Hunters", { x: 0.12, y: 0.14, w: 1.85, h: 0.52, fontFace: SERIF, fontSize: 13, bold: true, color: "000000", align: "center", valign: "middle" });
  tb(s, "KRITICAL HACKS 2026", { x: 2.05, y: 0.1, w: 6.3, h: 0.6, fontFace: SERIF, fontSize: 24, bold: true, color: "000000", align: "center", valign: "middle" });
  s.addImage({ path: HERO, x: 8.6, y: 0.08, w: 0.95, h: 0.95 });
  tb(s, "IGDTUW Delhi · AI/ML Track (Open Innovation) · Student category", { x: 2.05, y: 0.62, w: 6.3, h: 0.3, fontSize: 9.5, color: NV, align: "center", valign: "middle" });
  s.addShape(pres.shapes.LINE, { x: 0.25, y: 1.05, w: 9.5, h: 0, line: { color: NV, width: 1.25 } });
  const L = [["Project Title :", [{ text: "TakeSure — Confidence before taking something. ", options: { bold: true, color: NV } }, { text: "Ayurveda × Allopathy herb–drug interaction checker: photo of prescription + photo of product → sourced, plain-language safety verdict + Ministry of Ayush ADR report.", options: { color: BODY } }]],
    ["Team Name :", [{ text: "Bug Hunters", options: { bold: true, italic: true, color: INK, fontSize: 13 } }]],
    ["Team Members :", [{ text: "Dhriti Garg", options: { bold: true, color: INK } }, { text: " — Team lead · backend, rule engine, medical research", options: { color: BODY, breakLine: true } }, { text: "Shiwani Goyal", options: { bold: true, color: INK } }, { text: " — Frontend · web app, Hindi/English UI, result card, demo video & pitch", options: { color: BODY, breakLine: true } }, { text: "Khushi Gupta", options: { bold: true, color: INK } }, { text: " — Knowledge base & evidence grading, OCR, PDF/ADR export, TinyFish curation", options: { color: BODY } }]],
    ["Track Chosen :", [{ text: "AI/ML Track — Open Innovation · Healthcare", options: { bold: true, color: NV } }]],
    ["TinyFish :", [{ text: "Mandatory integration implemented — ", options: { bold: true, color: TF } }, { text: "Fetch API verifies every citation · Web Agent drafts interaction rows from monographs · Search + Agent map Indian products to herbs. Human-reviewed, off the verdict path.", options: { color: BODY } }]],
    ["Status :", [{ text: "Working prototype: 25 API routes · 49 cited interactions · 78 sources · 58 automated tests · offline-capable.", options: { color: BODY } }]],
    ["Live link :", [{ text: "https://take-sure.vercel.app", options: { hyperlink: { url: "https://take-sure.vercel.app" }, color: "1155CC", underline: { style: "sng" }, bold: true } }, { text: "   ·   GitHub: ", options: { color: BODY } }, { text: "github.com/khushi082007-netizen/takesure", options: { hyperlink: { url: "https://github.com/khushi082007-netizen/takesure" }, color: "1155CC", underline: { style: "sng" } } }]]];
  let y = 1.2;
  L.forEach(([k, runs], i) => {
    const h = [0.56, 0.3, 0.72, 0.3, 0.56, 0.3, 0.3][i];
    tb(s, k, { x: 0.4, y, w: 1.9, h, fontFace: SANS, fontSize: 13, bold: true, color: "000000", valign: "top" });
    s.addText(runs, { isTextBox: true, x: 2.35, y, w: 7.3, h, fontFace: SANS, fontSize: 10.5, margin: 0, valign: "top", lineSpacingMultiple: 1.08 });
    y += h + 0.08;
  });
  tb(s, "Aligned with the Ministry of Ayush Pharmacovigilance Programme for ASU&H drugs · decision support, never diagnosis", { x: 0.4, y: 5.1, w: 9.2, h: 0.3, fontSize: 8.5, italic: true, color: MUT });
}

'''
start = s.index("// =============================================================== 1. Title"); end = s.index("// =============================================================== 2. Problem")
s = s[:start] + TITLE + s[end:]

rep('tb(s, String(n), { x, y, w: d, h: d, fontSize: d * 36, bold: true, color: col || SAF, align: "center", valign: "middle" }); }',
    'tb(s, String(n), { x, y, w: d, h: d, fontSize: d * 36, bold: true, color: col || WHITE, align: "center", valign: "middle" }); }')
rep('tb(s, "Key Features", { x: 0.3, y: 0.8, w: 3, h: 0.3, fontFace: SERIF, fontSize: 13, bold: true, color: NV });', 'tb(s, "Key Features", { x: 0.3, y: 0.8, w: 3, h: 0.3, fontFace: SANS, fontSize: 14, bold: true, color: BLUE });')
rep('tb(s, "Novelty", { x: 0.3, y: 3.98, w: 3, h: 0.3, fontFace: SERIF, fontSize: 13, bold: true, color: NV });', 'tb(s, "Novelty", { x: 0.3, y: 3.98, w: 3, h: 0.3, fontFace: SANS, fontSize: 14, bold: true, color: BLUE });')
rep('["PDF", "PDF & hosting", "ReportLab for doctor summary + ADR form · Vercel (web) + Render/Railway (API)"]];',
    '["PDF", "PDF & hosting", "ReportLab for doctor summary + ADR form · Vercel (web) + Render/Railway (API)"],\n    ["TF", "TinyFish curation", "Fetch verifies citations · Web Agent drafts rows from monographs · Search+Agent map products → human-approved drafts"]];')
rep('T.forEach(([k, t, d], i) => { const y = 1.13 + i * 0.585; rr(s, 0.35, y, 3.0, 0.54, LIGHT, LINE, 0.05); rr(s, 0.42, y + 0.12, 0.36, 0.3, NV, NV, 0.05); tb(s, k, { x: 0.42, y: y + 0.12, w: 0.36, h: 0.3, fontSize: 7, bold: true, color: SAF, align: "center", valign: "middle" }); tb(s, t, { x: 0.86, y: y + 0.03, w: 2.4, h: 0.18, fontSize: 8, bold: true, color: NV }); tb(s, d, { x: 0.86, y: y + 0.2, w: 2.44, h: 0.34, fontSize: 6.4, color: BODY, lineSpacingMultiple: 1.0 }); });',
    'T.forEach(([k, t, d], i) => { const y = 1.13 + i * 0.515; const c = k === "TF" ? TF : NV; rr(s, 0.35, y, 3.0, 0.48, LIGHT, LINE, 0.05); rr(s, 0.42, y + 0.1, 0.36, 0.28, c, c, 0.05); tb(s, k, { x: 0.42, y: y + 0.1, w: 0.36, h: 0.28, fontSize: 7, bold: true, color: WHITE, align: "center", valign: "middle" }); tb(s, t, { x: 0.86, y: y + 0.02, w: 2.4, h: 0.17, fontSize: 7.8, bold: true, color: c }); tb(s, d, { x: 0.86, y: y + 0.18, w: 2.44, h: 0.3, fontSize: 6.1, color: BODY, lineSpacingMultiple: 1.0 }); });')
rep('''    ["Privacy", "Uploads are deleted after extraction; the log stores ids and verdicts only — the basis of the anonymised dashboard for the Ministry of Ayush."]];
  FL.forEach(([t, d], i) => { const x = 3.72 + i * 2.0; rr(s, x, 3.45, 1.9, 1.72, LIGHT, LINE, 0.05); badge(s, x + 0.07, 3.52, i + 1, 0.22); tb(s, t, { x: x + 0.34, y: 3.5, w: 1.5, h: 0.26, fontSize: 7.8, bold: true, color: NV, valign: "middle" }); tb(s, d, { x: x + 0.08, y: 3.8, w: 1.75, h: 1.34, fontSize: 6.5, color: BODY }); });''',
    '''    ["Privacy", "Uploads are deleted after extraction; the log stores ids and verdicts only — the basis of the anonymised dashboard for the Ministry of Ayush."],
    ["Curation loop (TinyFish)", "Offline from verdicts: Fetch verifies citations, the Web Agent drafts rows from monographs, Search+Agent map products. Every draft keeps its source URL and run id and waits for a reviewer."]];
  FL.forEach(([t, d], i) => { const x = 3.72 + i * 1.5; const c = i === 3 ? TF : NV; rr(s, x, 3.45, 1.42, 1.72, i === 3 ? "EDE9FE" : LIGHT, i === 3 ? "C4B5FD" : LINE, 0.05); badge(s, x + 0.07, 3.52, i + 1, 0.22, c); tb(s, t, { x: x + 0.32, y: 3.5, w: 1.05, h: 0.26, fontSize: 7.2, bold: true, color: c, valign: "middle" }); tb(s, d, { x: x + 0.08, y: 3.8, w: 1.28, h: 1.34, fontSize: 6.1, color: BODY }); });''')
rep('    ["Open-source tools we build on", "OCR (Tesseract) and name matching (RapidFuzz)", "github.com/tesseract-ocr · github.com/rapidfuzz", "https://github.com/tesseract-ocr/tesseract"]];',
    '    ["Open-source tools we build on", "OCR (Tesseract) and name matching (RapidFuzz)", "github.com/tesseract-ocr · github.com/rapidfuzz", "https://github.com/tesseract-ocr/tesseract"],\n    ["TinyFish documentation", "Fetch, Search and Web Agent APIs used for evidence curation", "docs.tinyfish.ai", "https://docs.tinyfish.ai/"]];')
rep('refs.forEach(([t, d, l, url], i) => { const y = 1.13 + i * 0.51; rr(s, 0.33, y, 3.3, 0.47, LIGHT, LINE, 0.04);', 'refs.forEach(([t, d, l, url], i) => { const y = 1.13 + i * 0.455; rr(s, 0.33, y, 3.3, 0.42, LIGHT, LINE, 0.04);')
rep('tb(s, d, { x: 0.68, y: y + 0.17, w: 2.92, h: 0.14, fontSize: 6, color: MUT }); s.addText([{ text: l, options: { hyperlink: { url, tooltip: url }, color: "1155CC", underline: { style: "sng" } } }], { isTextBox: true, x: 0.68, y: y + 0.31, w: 2.92, h: 0.14, fontFace: SANS, fontSize: 6, margin: 0, valign: "top" }); });',
    'tb(s, d, { x: 0.68, y: y + 0.15, w: 2.92, h: 0.13, fontSize: 5.8, color: MUT }); s.addText([{ text: l, options: { hyperlink: { url, tooltip: url }, color: "1155CC", underline: { style: "sng" } } }], { isTextBox: true, x: 0.68, y: y + 0.28, w: 2.92, h: 0.13, fontFace: SANS, fontSize: 5.8, margin: 0, valign: "top" }); });')

NEW = open(r"C:\Temp\bvp\kritical\new_slides.js", encoding="utf-8").read()
marks = re.split(r"(?=// =============================================================== )", s)
head = marks[0]
blocks = {b.split("\n", 1)[0].split("=============================================================== ")[1].strip(): b for b in marks[1:]}
nb = {b.split("\n", 1)[0].split("=============================================================== ")[1].strip(): b for b in re.split(r"(?=// =============================================================== )", NEW)[1:]}
order = ["1. Title", "2. Problem & target audience", "3. Unique solution", "X. Role of AI/ML", "4. Tech stack + architecture", "Y. TinyFish integration", "5. Feasibility & showstoppers", "6. USP & business model", "R. Revenue model", "Z. Future scope", "7. References + comparison"]
allb = {**blocks, **nb}
missing = [k for k in order if k not in allb]
assert not missing, (missing, list(allb.keys()))
tail = allb["7. References + comparison"]
ws = tail.index("pres.writeFile(")
footer = tail[ws:].replace("TakeSure_BugHunters_HackBVP8.pptx", "TakeSure_BugHunters_KriticalHacks2026.pptx")
allb["7. References + comparison"] = tail[:ws]
open(p, "w", encoding="utf-8").write(head + "".join(allb[k] for k in order) + footer)
print("built script with", len(order), "slides")
