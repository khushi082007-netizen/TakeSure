# -*- coding: utf-8 -*-
"""Six one-page TakeSure abstracts, v2: bullet problem/solution, flowchart + table in each, no green palettes."""
import os
OUT = r"C:\Temp\bvp\drafts2"
os.makedirs(OUT, exist_ok=True)

TITLE = "TakeSure"; TAG = "Confidence before taking something"
SUB = "An Ayurveda × Allopathy herb–drug interaction checker for Indian patients, doctors and the Ministry of Ayush"
EVENT = "HACK@BVP 8.0 · Abstract Round"
DOMAIN = "Health &amp; Well-Being (AI4Impact secondary) · SDG 3 · SDG 9 · SDG 10"
PROBLEM_B = [
 "<b>Two medical systems, zero cross-checking.</b> A thyroid patient on Thyronorm adds ashwagandha; a transplant patient on tacrolimus drinks giloy kadha; a cardiac patient on warfarin takes guggul.",
 "<b>Each pair can cause harm:</b> ashwagandha can raise thyroid hormone, giloy can oppose immunosuppression, guggul can increase bleeding.",
 "<b>Nobody asks, nobody tells.</b> The doctor rarely asks about herbs, the patient rarely mentions them, the chemist has no tool, the label says nothing.",
 "<b>Existing tools do not cover it.</b> Medscape, Drugs.com and 1mg check only allopathic × allopathic pairs; Western herb databases are English-only, paid and do not know Indian brands like Himalaya Ashvagandha or Dabur Giloy Ghanvati.",
]
STATS = [("37%", "of hospital patients use allopathic and herbal medicines together"),
         ("65%", "of herbal users do not know the dose, side effects or interactions"),
         ("19%", "of Indian patients ever disclose herbal use to their doctor"),
         ("1,473", "ASU&amp;H adverse-event reports received nationally since 2018")]
SOLUTION_B = [
 "<b>Scan both.</b> The patient photographs the allopathic prescription and the Ayurvedic product label (or types the names); every name is confirmed before checking.",
 "<b>Match Indian names.</b> Brand → generic (Thyronorm → levothyroxine) and product → herbs (Chyawanprash → amla, ashwagandha…) with Sanskrit / Hindi / Latin synonyms.",
 "<b>Decide from data.</b> A rule engine checks every herb–drug pair against a curated, cited knowledge base: GREEN / AMBER / RED / NOT IN DATABASE, with timing advice.",
 "<b>Explain simply.</b> AI rewrites only the matched evidence into plain Hindi or English, with sources and three questions to ask the doctor.",
 "<b>Report in one tap.</b> A one-page PDF for the doctor and a pre-filled suspected-ADR report in the Ministry of Ayush format for the Ayush Suraksha portal.",
]
RULE = "The verdict comes from published data; AI only explains it."
STEPS = [("Scan", "OCR (Tesseract eng+hin) reads both photos; names shown back for confirmation; images deleted after reading"),
         ("Match", "Bridge dictionary + fuzzy matching; brand → generic, product → herbs; Sanskrit/Hindi/Latin synonyms"),
         ("Decide", "Deterministic rule engine over a versioned knowledge base; every row has a source (DOI/PMID), severity and evidence grade A/B/C"),
         ("Explain", "LLM rewrites only the matched rows into simple Hindi/English with schema-locked output; it cannot add, remove or re-grade an interaction"),
         ("Report", "Doctor PDF with citations; one-tap ADR form for the Ayush pharmacovigilance network; co-use analytics dashboard")]
VERDICT = "Worst row wins; an unknown pair is never shown as green; grade-C evidence caps at AMBER; the answer is identical with the AI switched off."
TECH = ("Next.js + TypeScript PWA (Hindi/English UI) · FastAPI + Pydantic REST API · PostgreSQL in production, SQLite offline · Tesseract OCR · "
        "RapidFuzz matching (≥85 accept, 70–85 ask the user) · Groq LLM, JSON-schema output, temperature 0 · ReportLab PDFs. No model training; runs fully offline on a laptop.")
KB = ("40–60 high-frequency herb × drug pairs (15 common herbs × 12 drug classes) curated from PubMed, NIH LiverTox, MSKCC About Herbs, WHO monographs and the "
      "Ayurvedic Pharmacopoeia of India, graded on the Stockley's model. Decision support only: “ask your doctor”, never diagnosis or dosing.")
IMPACT = [("Patients &amp; caregivers", "A sourced answer before the first dose, in their own language, instead of silence or a guess. Free for citizens."),
          ("Doctors, vaidyas &amp; chemists", "Finally learn what patients actually take; a QR on the chemist's bill or an API inside hospital and telemedicine systems makes the check routine."),
          ("Ministry of Ayush", "Structured, reproducible ADR reports and real co-use data from the catchment of its 99 peripheral pharmacovigilance centres."),
          ("Novelty", "Nothing public today checks an Ayurvedic product against an allopathic prescription. TakeSure builds the missing bridge table: Indian brands × Ayurvedic herb synonyms × graded evidence, open and auditable. Honest by design: grades, timing gaps instead of alarms, “not in database” instead of guesses.")]
FOOT = "Aligned with the Ministry of Ayush Pharmacovigilance Programme for ASU&amp;H drugs · decision support only, never diagnosis"
TEAM_HTML = "{{EVENT}}<br><b>Team Bug Hunters</b><br>Dhriti Garg · Shiwani Goyal · Khushi Gupta"

def ic(path, sw="1.8"):
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="%s" stroke-linecap="round" stroke-linejoin="round">%s</svg>' % (sw, path)
I = {
 "scan": ic('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
 "match": ic('<path d="M4 7h11M11 3l4 4-4 4"/><path d="M20 17H9M13 13l-4 4 4 4"/>'),
 "decide": ic('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>'),
 "explain": ic('<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>'),
 "report": ic('<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>'),
 "patient": ic('<circle cx="12" cy="7" r="3.5"/><path d="M5 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2"/>'),
 "doctor": ic('<path d="M6 3v6a6 6 0 0 0 12 0V3"/><path d="M12 15v3a3 3 0 0 0 6 0v-2"/><circle cx="18" cy="14" r="2"/>'),
 "ministry": ic('<path d="M3 21h18M5 21V9l7-4 7 4v12M10 21v-5h4v5M9 12h2M13 12h2"/>'),
 "star": ic('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'),
}
STEP_ICONS = ["scan", "match", "decide", "explain", "report"]; IMPACT_ICONS = ["patient", "doctor", "ministry", "star"]

def hero(c1, c2, ink, size=1.0):
    return ('<svg viewBox="0 0 240 86" style="width:%spx;height:auto" fill="none" stroke-linecap="round" stroke-linejoin="round">'
            '<g transform="translate(14,43) rotate(-30)"><rect x="-26" y="-11" width="52" height="22" rx="11" fill="%s"/><path d="M0 -11v22" stroke="#fff" stroke-width="2"/><rect x="-26" y="-11" width="26" height="22" rx="11" fill="#fff" opacity=".35"/></g>'
            '<text x="58" y="51" font-family="Cambria,Georgia,serif" font-size="26" fill="%s">×</text>'
            '<g transform="translate(78,20)" stroke="%s" stroke-width="2.4"><path d="M4 42C4 18 18 7 44 4c-2 24-12 38-40 38z" fill="%s" fill-opacity=".18"/><path d="M4 42c7-12 17-20 29-26"/></g>'
            '<path d="M134 43h26" stroke="%s" stroke-width="2.6"/><path d="M154 36l8 7-8 7" stroke="%s" stroke-width="2.6"/>'
            '<g transform="translate(176,14)" stroke="%s" stroke-width="2.6"><path d="M26 2l22 8v16c0 14-9.5 24-22 28C13.5 50 4 40 4 26V10z" fill="%s" fill-opacity=".12"/><path d="M16 28l7 7 13-14"/></g></svg>') % (240*size, c1, ink, c2, c2, ink, ink, c1, c1)

def fill(tpl, **kw):
    for k, v in kw.items(): tpl = tpl.replace("{{%s}}" % k, str(v))
    return tpl

# ------------------------------------------------ reusable blocks
VCHIPS = '<span class="v g">GREEN</span><span class="v a">AMBER</span><span class="v r">RED</span><span class="v n2">NOT IN DB</span>'
FLOW_CSS = """
.flow { display: flex; align-items: center; gap: 4px; width: 100%; }
.fb { border: 1px solid {{FB}}; background: {{FBG}}; border-radius: 6px; padding: 3px 5px; font-size: 7.6pt; line-height: 1.2; text-align: center; flex: 1; min-width: 0; color: {{FINK}}; }
.fb b { display: block; color: {{FHEAD}}; font-size: 8.2pt; }
.fb.in { background: {{FIN}}; border-color: {{FINB}}; } .fb.out { background: {{FIN}}; border-color: {{FINB}}; }
.fb.rule { background: {{FHEAD}}; color: #fff; border-color: {{FHEAD}}; } .fb.rule b { color: #fff; }
.fstack { display: flex; flex-direction: column; gap: 3px; flex: 1.05; min-width: 0; }
.fstack .fb { flex: none; }
.fa { color: {{FHEAD}}; font-weight: 700; font-size: 12pt; flex: none; line-height: 1; }
.fv { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.fv .v { display: block; text-align: center; margin: 0; font-size: 7pt; padding: 1px 2px; }
.v { display: inline-block; padding: 0 5px; border-radius: 3px; font-weight: 700; margin-right: 2px; font-size: 7.6pt; }
.g { background: #e6f4ea; color: #1e7f4f; } .a { background: #fff1d6; color: #b86e00; } .r { background: #fde8e8; color: #b00020; } .n2 { background: #eef0f4; color: #4b5563; }
.fcap { font-size: 7.4pt; color: {{FINK}}; opacity: .85; margin-top: 3px; }
table.cmp, table.kb { border-collapse: collapse; width: 100%; font-size: 7.6pt; line-height: 1.2; table-layout: fixed; word-wrap: break-word; }
table.cmp th, table.kb th { background: {{FHEAD}}; color: #fff; padding: 3px 5px; text-align: left; font-weight: 700; }
table.cmp td, table.kb td { border-bottom: 1px solid {{FB}}; padding: 2.5px 5px; vertical-align: top; }
table.cmp td.y { color: #1e7f4f; font-weight: 700; } table.cmp td.n { color: #b00020; font-weight: 700; } table.cmp td.p { color: #b86e00; font-weight: 700; }
table.cmp td.ts { background: {{FIN}}; font-weight: 700; color: {{FHEAD}}; }
table.kb td.sev { font-weight: 800; }
.tcap { font-size: 7.3pt; color: {{FINK}}; opacity: .8; margin-top: 2px; }
"""
def flow_h():
    return ('<div class="flow">'
            '<div class="fstack"><div class="fb in"><b>Prescription photo</b>allopathic medicines</div><div class="fb in"><b>Product photo</b>Ayurvedic label / brand</div></div>'
            '<span class="fa">›</span><div class="fb"><b>1 · OCR</b>read both images; user confirms names</div>'
            '<span class="fa">›</span><div class="fb"><b>2 · Match</b>brand → generic; product → herbs; synonyms</div>'
            '<span class="fa">›</span><div class="fb"><b>3 · Knowledge base</b>cited herb–drug table; grade A/B/C</div>'
            '<span class="fa">›</span><div class="fb rule"><b>Rule engine</b>decides severity; AI does not</div>'
            '<span class="fa">›</span><div class="fv"><span class="v g">GREEN</span><span class="v a">AMBER</span><span class="v r">RED</span><span class="v n2">NOT IN DB</span></div>'
            '<span class="fa">›</span><div class="fb"><b>4 · AI explains</b>simple Hindi/English + 3 doctor questions</div>'
            '<span class="fa">›</span><div class="fstack"><div class="fb out"><b>Doctor PDF</b>verdict + sources</div><div class="fb out"><b>ADR report</b>Ministry of Ayush format</div></div>'
            '</div>')
def flow_v(compact=False):
    boxes = [("in", "Inputs", "Prescription photo + Ayurvedic product photo (or typed names)"),
             ("", "1 · OCR", "read both images; every name confirmed by the user"),
             ("", "2 · Match", "brand → generic; product → herbs; Sanskrit/Hindi/Latin synonyms"),
             ("", "3 · Knowledge base", "cited herb–drug rows with severity + evidence grade"),
             ("rule", "Rule engine", "decides GREEN / AMBER / RED / NOT IN DB — AI does not"),
             ("", "4 · AI explains", "plain Hindi/English, sources, 3 questions for the doctor"),
             ("out", "Outputs", "Doctor PDF · ADR report (Ministry format) · analytics")]
    out = '<div class="flowv">'
    for i, (cls, t, d) in enumerate(boxes):
        if i: out += '<div class="fva">▼</div>'
        out += '<div class="fb %s"><b>%s</b>%s</div>' % (cls, t, d)
    return out + '</div>'
FLOWV_CSS = """
.flowv { display: flex; flex-direction: column; gap: 0; }
.flowv .fb { flex: none; }
.fva { text-align: center; color: {{FHEAD}}; font-size: 7pt; line-height: 1.1; }
"""
def cmp_table():
    rows = [("Ayurveda × allopathy pair check", "n", "✗", "p", "~ single herbs", "✓ every pair"),
            ("Indian brands &amp; Hindi", "p", "~", "n", "✗", "✓ brands + synonyms"),
            ("Source on every verdict", "y", "✓", "y", "✓", "✓ + evidence grade"),
            ("ADR report to Ministry of Ayush", "n", "✗", "n", "✗", "✓ one tap")]
    body = "".join('<tr><td>%s</td><td class="%s">%s</td><td class="%s">%s</td><td class="ts">%s</td></tr>' % r for r in rows)
    return ('<table class="cmp"><tr><th>Feature</th><th>Medscape · Drugs.com · 1mg</th><th>MSKCC · Natural Medicines</th><th>TakeSure</th></tr>%s</table>'
            '<div class="tcap">Our assessment from each tool\'s public documentation.</div>') % body
def kb_table(n=4, cap=None, compact=False):
    rows = [("Ashwagandha", "Levothyroxine", "#b86e00", "AMBER", "May raise thyroid hormone", "B", "Sharma 2018, PMID 28829155"),
            ("Guggul", "Warfarin", "#b00020", "RED", "May increase bleeding risk", "B", "MSKCC About Herbs"),
            ("Giloy", "Tacrolimus", "#b00020", "RED", "May oppose immuno-suppression", "C", "Nagral 2021, LiverTox"),
            ("Triphala", "Oral medicines", "#1e7f4f", "GREEN", "Keep a 2–3 h gap", "C", "Ayurvedic Pharmacopoeia")]
    body = "".join('<tr><td>%s</td><td>%s</td><td class="sev" style="color:%s">%s</td><td>%s</td><td>%s</td><td>%s</td></tr>' % r for r in rows[:n])
    cap = cap or 'Sample rows of the curated knowledge base (the table the verdict comes from).'
    if compact:
        body = "".join('<tr><td><b>%s</b> × %s</td><td class="sev" style="color:%s">%s · grade %s</td><td>%s</td><td>%s</td></tr>' % (r[0], r[1], r[2], r[3], r[5], r[4], r[6]) for r in rows[:n])
        return ('<table class="kb"><colgroup><col style="width:30%%"><col style="width:20%%"><col style="width:27%%"><col style="width:23%%"></colgroup><tr><th>Herb × drug</th><th>Verdict</th><th>What happens</th><th>Source</th></tr>%s</table><div class="tcap">' + cap + '</div>') % body
    return ('<table class="kb"><colgroup><col style="width:17%%"><col style="width:17%%"><col style="width:11%%"><col style="width:27%%"><col style="width:8%%"><col style="width:20%%"></colgroup><tr><th>Herb</th><th>Drug</th><th>Verdict</th><th>What happens</th><th>Grade</th><th>Source</th></tr>%s</table>'
            '<div class="tcap">' + cap + '</div>') % body


def story(ac, shirt="#b94a48", card_ac="#1155cc"):
    """Four illustrated story panels; ac = accent colour for arrows/marks."""
    p1 = ('<svg viewBox="0 0 120 70"><circle cx="38" cy="22" r="10" fill="#f1c9a8"/><path d="M20 66c0-16 8-24 18-24s18 8 18 24z" fill="%s"/>'
          '<g transform="translate(66,20) rotate(-20)"><rect x="0" y="0" width="34" height="14" rx="3" fill="#fff" stroke="#7a8a9a"/><circle cx="7" cy="7" r="3" fill="#dfe6ee"/><circle cx="17" cy="7" r="3" fill="#dfe6ee"/><circle cx="27" cy="7" r="3" fill="#dfe6ee"/></g>'
          '<rect x="78" y="40" width="20" height="26" rx="4" fill="#b8742a"/><rect x="82" y="36" width="12" height="6" rx="2" fill="#8a5300"/><path d="M83 55c3-6 8-8 12-9-1 5-4 9-12 9z" fill="#ffe4b8"/></svg>') % shirt
    p2 = ('<svg viewBox="0 0 120 70"><circle cx="30" cy="22" r="10" fill="#f1c9a8"/><path d="M12 66c0-16 8-24 18-24s18 8 18 24z" fill="#fff" stroke="#7a8a9a"/><path d="M24 46h12" stroke="%s" stroke-width="2"/>'
          '<circle cx="90" cy="22" r="10" fill="#f1c9a8"/><path d="M72 66c0-16 8-24 18-24s18 8 18 24z" fill="%s"/><text x="60" y="30" text-anchor="middle" font-family="Cambria,Georgia" font-size="26" font-weight="700" fill="%s">?</text></svg>') % (card_ac, shirt, ac)
    p3 = ('<svg viewBox="0 0 120 70"><rect x="42" y="4" width="36" height="62" rx="6" fill="#1f1a17"/><rect x="46" y="9" width="28" height="52" rx="3" fill="#fff"/>'
          '<rect x="50" y="14" width="20" height="14" rx="2" fill="#e8eef6" stroke="#7a8a9a" stroke-width=".8"/><rect x="50" y="31" width="20" height="14" rx="2" fill="#fff1d6" stroke="#b86e00" stroke-width=".8"/>'
          '<path d="M52 20h16M52 23h10" stroke="#7a8a9a" stroke-width="1"/><path d="M52 37h16M52 40h10" stroke="#b86e00" stroke-width="1"/><path d="M48 50h24" stroke="%s" stroke-width="3" stroke-linecap="round"/>'
          '<text x="60" y="58" text-anchor="middle" font-family="Calibri" font-size="5" fill="#1f1a17">confirm names</text><path d="M10 30h26M28 24l8 6-8 6" fill="none" stroke="%s" stroke-width="2"/><path d="M84 30h26M102 24l8 6-8 6" fill="none" stroke="%s" stroke-width="2"/></svg>') % (ac, ac, ac)
    p4 = ('<svg viewBox="0 0 120 70"><rect x="12" y="10" width="96" height="50" rx="6" fill="#fff" stroke="#d9d4cc"/><rect x="12" y="10" width="96" height="14" rx="6" fill="#fff1d6"/>'
          '<rect x="18" y="13" width="26" height="8" rx="2" fill="#b86e00"/><text x="31" y="19.5" text-anchor="middle" font-family="Calibri" font-weight="700" font-size="6" fill="#fff">AMBER</text>'
          '<text x="48" y="20" font-family="Calibri" font-size="5.5" fill="#8a5300">Ashwagandha + Levothyroxine</text><path d="M18 31h84M18 36h70M18 41h78" stroke="#c9c4bb" stroke-width="1.5"/><path d="M18 48h40" stroke="%s" stroke-width="2"/>'
          '<text x="20" y="56" font-family="Calibri" font-size="5" fill="%s">3 questions for the doctor · source PMID</text><path d="M90 44l4 4 8-9" fill="none" stroke="%s" stroke-width="2.2"/></svg>') % (card_ac, card_ac, ac)
    caps = ["<b>Mother</b> takes Thyronorm for thyroid and starts ashwagandha for stress.",
            "<b>Nobody asks, nobody tells.</b> Her doctor never hears of it; the label says nothing.",
            "<b>She photographs both.</b> TakeSure reads the names, confirms them and checks the pair.",
            "<b>AMBER.</b> A cited source, timing advice, three questions. One tap sends the PDF to her doctor."]
    return "".join('<div class="panel"><span class="pn">%d</span>%s<p>%s</p></div>' % (i + 1, svg, c) for i, (svg, c) in enumerate(zip([p1, p2, p3, p4], caps)))

def ul(items): return "<ul>" + "".join("<li>%s</li>" % i for i in items) + "</ul>"

BASE = """@page { size: A4; margin: 0; } * { box-sizing: border-box; } html, body { margin: 0; padding: 0; }
body { width: 210mm; height: 297mm; overflow: hidden; -webkit-print-color-adjust: exact; print-color-adjust: exact; } p { margin: 0; } svg { display: inline-block; vertical-align: middle; }
ul { margin: 2px 0 2px 13px; padding: 0; } li { margin-bottom: 2px; }
"""
def write(name, html): open(os.path.join(OUT, name + ".html"), "w", encoding="utf-8").write(html); print("wrote", name)

def flowcss(FB, FBG, FINK, FHEAD, FIN, FINB):
    return fill(FLOW_CSS + FLOWV_CSS, FB=FB, FBG=FBG, FINK=FINK, FHEAD=FHEAD, FIN=FIN, FINB=FINB)

# ================================================================ Draft 1: Navy & saffron brand header + story
def draft1():
    NV, SAF, INK, MUT = "#14213d", "#f4a300", "#1b1b1b", "#5d6166"
    stats = "".join('<div class="st"><div class="big" style="color:%s">%s</div><span>%s</span></div>' % (SAF if i % 2 else NV, v, d) for i, (v, d) in enumerate(STATS))
    impact = "".join('<div class="imp"><div class="ico">%s</div><div><b>%s</b> %s</div></div>' % (I[IMPACT_ICONS[i]], t, d) for i, (t, d) in enumerate(IMPACT))
    css = BASE + flowcss("#c9d0dd", "#f4f6fa", "#333", NV, "#fff4dc", "#e8c27a") + """
body { font-family: Calibri, "Segoe UI", Arial, sans-serif; color: {{INK}}; font-size: 8.8pt; line-height: 1.28; background: #fff; }
.band { background: {{NV}}; color: #fff; padding: 6mm 12mm 5mm; display: flex; justify-content: space-between; align-items: center; }
.band > div:first-child { max-width: 122mm; }
.band h1 { font-family: Cambria, Georgia, serif; font-size: 21pt; margin: 0; line-height: 1.05; } .band h1 span { color: {{SAF}}; }
.band .tag { font-size: 11pt; color: {{SAF}}; margin: 2px 0 3px; font-style: italic; }
.band .sub { font-size: 8.8pt; color: #d5dbe8; }
.band .right { text-align: right; font-size: 8.2pt; color: #c9d1e0; line-height: 1.35; width: 56mm; flex: none; white-space: nowrap; } .band .right b { color: #fff; font-size: 10pt; }
.strip { background: {{SAF}}; color: {{NV}}; font-size: 8pt; font-weight: 700; padding: 2px 12mm; letter-spacing: .4px; }
.wrap { padding: 3.5mm 12mm 0; }
.story { display: grid; grid-template-columns: repeat(4, 1fr); gap: 7px; margin: 0 0 3px; }
.panel { position: relative; background: #f4f6fa; border: 1px solid #c9d0dd; border-top: 3px solid {{SAF}}; border-radius: 6px; padding: 5px 6px 4px; }
.panel svg { width: auto; height: 60px; display: block; margin: 0 auto; }
.panel p { font-size: 7.7pt; line-height: 1.22; margin-top: 3px; color: #333; } .panel p b { color: {{NV}}; }
.pn { position: absolute; top: 5px; left: 6px; width: 15px; height: 15px; border-radius: 50%; background: {{NV}}; color: {{SAF}}; font-size: 8pt; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.shead { font-family: Cambria, Georgia, serif; font-size: 10.8pt; color: {{NV}}; margin: 0 0 2px; display: flex; align-items: center; gap: 6px; } .shead::after { content: ""; flex: 1; height: 1px; background: #d3d9e4; }
.kbs { margin-top: 4px; } .kbs table.kb { font-size: 7.1pt; } .kbs table.kb th, .kbs table.kb td { padding: 2px 4px; }
.cols { display: flex; gap: 7mm; } .cols > div { flex: 1; min-width: 0; }
h2 { font-family: Cambria, Georgia, serif; font-size: 10.8pt; color: {{NV}}; margin: 3px 0 2px; display: flex; align-items: center; gap: 6px; }
h2::after { content: ""; flex: 1; height: 1px; background: #d3d9e4; }
h2 .n { background: {{SAF}}; color: {{NV}}; border-radius: 50%; width: 16px; height: 16px; font-size: 8.5pt; display: inline-flex; align-items: center; justify-content: center; font-family: Calibri; }
li { font-size: 8.2pt; line-height: 1.25; margin-bottom: 1.5px; } li b { color: {{NV}}; }
.stats { display: grid; grid-template-columns: 1fr 1fr; gap: 3px 8px; margin: 3px 0 2px; }
.st { display: flex; align-items: center; gap: 6px; background: #f4f6fa; border-radius: 6px; padding: 2px 6px; }
.st span { font-size: 7.5pt; color: {{MUT}}; line-height: 1.2; } .big { font-size: 14pt; font-weight: 700; width: 44px; line-height: 1; }
.rule { background: #f4f6fa; border-left: 4px solid {{SAF}}; padding: 3px 8px; margin: 3px 0 0; font-style: italic; color: {{NV}}; font-weight: 700; font-size: 8.8pt; }
.flow .fb { font-size: 7.3pt; padding: 3px 4px; } .flow .fb b { font-size: 7.9pt; }
.tech { font-size: 7.4pt; color: #333; margin-top: 2px; line-height: 1.22; }
.impacts { display: grid; grid-template-columns: 1fr 1fr; gap: 3px 10px; margin-top: 2px; }
.imp { display: flex; gap: 6px; font-size: 7.9pt; line-height: 1.25; align-items: flex-start; }
.imp .ico { width: 18px; height: 18px; color: {{SAF}}; background: {{NV}}; border-radius: 50%; padding: 3px; flex: none; } .imp b { color: {{NV}}; }
.foot { position: absolute; bottom: 0; left: 0; right: 0; background: {{NV}}; color: #c9d1e0; font-size: 7.6pt; padding: 3px 12mm; display: flex; justify-content: space-between; gap: 10px; } .foot span:last-child { white-space: nowrap; }
"""
    html = fill("""<!doctype html><html><head><meta charset="utf-8"><title>TakeSure abstract — Draft 1</title><style>{{CSS}}</style></head><body>
<div class="band"><div><h1>{{TITLE}} <span>— {{TAG}}</span></h1><div class="tag">Scan both. Check the pair. Ask the right questions.</div><div class="sub">{{SUB}}</div></div>
<div class="right">{{HERO}}<br>""" + TEAM_HTML + """</div></div>
<div class="strip">DOMAIN: {{DOMAIN}}</div>
<div class="wrap">
<div class="shead">One patient's story — the gap today, and what TakeSure would do about it</div>
<div class="story">{{STORY}}</div>
<div class="cols">
 <div><h2><span class="n">1</span>The problem</h2>{{PROBLEM}}<div class="stats">{{STATS}}</div></div>
 <div><h2><span class="n">2</span>Proposed solution</h2>{{SOLUTION}}<div class="rule">Our rule: {{RULE}}</div></div>
</div>
<h2><span class="n">3</span>Approach — project workflow</h2>
{{FLOW}}
<div class="fcap"><b>Verdict rules:</b> {{VERDICT}}</div>
<div class="cols" style="margin-top:3px">
 <div>{{CMP}}</div>
 <div><p class="tech"><b>Stack.</b> {{TECH}}</p><div class="kbs">{{KBT}}</div></div>
</div>
<h2><span class="n">4</span>Expected impact</h2>
<div class="impacts">{{IMPACT}}</div>
</div>
<div class="foot"><span>{{FOOT}}</span><span>Team Bug Hunters · HACK@BVP 8.0 · BVEST XIII</span></div>
</body></html>""", CSS=fill(css, NV=NV, SAF=SAF, INK=INK, MUT=MUT), TITLE=TITLE, TAG=TAG, SUB=SUB, EVENT=EVENT, DOMAIN=DOMAIN, HERO=hero(SAF, "#9db4e0", "#ffffff", 0.7),
        STORY=story(NV, "#b94a48", "#1155cc"), PROBLEM=ul(PROBLEM_B), STATS=stats, SOLUTION=ul(SOLUTION_B), RULE=RULE, FLOW=flow_h(), VERDICT=VERDICT, CMP=cmp_table(),
        KBT=kb_table(3, compact=True, cap="Knowledge base: 40–60 herb × drug pairs curated from PubMed, NIH LiverTox, MSKCC, WHO monographs and the Ayurvedic Pharmacopoeia, graded on the Stockley's model. Decision support only, never diagnosis."), TECH=TECH, IMPACT=impact, FOOT=FOOT)
    write("draft1_navy_brand", html)

# ================================================================ Draft 2: Maroon & gold infographic spine
def draft2():
    MR, GOLD, INK, MUT, LINE = "#7a1f2b", "#c9962b", "#1f1a17", "#5e5852", "#e0d6c8"
    stats = "".join('<div class="st"><b>%s</b><span>%s</span></div>' % (v, d) for v, d in STATS)
    impact = "".join('<div class="imp"><span class="ico">%s</span><div><b>%s</b> %s</div></div>' % (I[IMPACT_ICONS[i]], t, d) for i, (t, d) in enumerate(IMPACT))
    css = BASE + flowcss("#e0d6c8", "#fff", "#333", MR, "#fbf1dc", "#e2c98f") + """
body { font-family: "Segoe UI", Calibri, Arial, sans-serif; color: {{INK}}; font-size: 9pt; line-height: 1.3; background: #fffcf7; padding: 8mm 11mm 8mm; position: relative; }
.top { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid {{GOLD}}; padding-bottom: 5px; }
h1 { font-family: Cambria, Georgia, serif; font-size: 24pt; margin: 0; color: {{MR}}; line-height: 1.05; } h1 small { display: block; font-size: 11pt; color: {{GOLD}}; font-weight: 400; font-style: italic; margin-top: 2px; }
.sub { font-size: 9pt; color: {{MUT}}; margin-top: 3px; max-width: 120mm; }
.right { text-align: right; font-size: 8.4pt; color: {{MUT}}; line-height: 1.35; white-space: nowrap; } .right b { color: {{MR}}; font-size: 10pt; }
.dom { font-size: 8.2pt; color: {{MUT}}; margin: 4px 0 5px; } .dom b { color: {{MR}}; }
.grid { display: grid; grid-template-columns: 56mm 46mm 1fr; gap: 4.5mm; } .grid > div { min-width: 0; }
.flowv .fb { padding: 3px 5px; font-size: 7.4pt; } .flowv .fb b { font-size: 8.2pt; }
h2 { font-size: 10pt; text-transform: uppercase; letter-spacing: 1px; color: {{GOLD}}; margin: 4px 0 2px; font-weight: 700; } h2 em { font-style: normal; color: {{MR}}; }
li { font-size: 8.1pt; line-height: 1.26; } li b { color: {{MR}}; }
.stats { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin: 4px 0; }
.st { border-left: 3px solid {{GOLD}}; padding: 1px 6px; } .st b { font-size: 13pt; color: {{MR}}; display: block; line-height: 1.05; } .st span { font-size: 7.2pt; color: {{MUT}}; line-height: 1.15; display: block; }
.flowv .fb { padding: 4px 6px; font-size: 7.8pt; } .flowv .fb b { font-size: 8.6pt; }
.rule { font-family: Cambria, Georgia, serif; font-size: 10.5pt; color: {{MR}}; border-top: 1px solid {{LINE}}; border-bottom: 1px solid {{LINE}}; padding: 4px 0; margin: 5px 0; text-align: center; font-style: italic; }
.small { font-size: 8.1pt; color: #333; margin-top: 3px; }
.imp { display: flex; gap: 6px; margin-bottom: 3px; font-size: 8.3pt; line-height: 1.28; }
.imp .ico { width: 20px; height: 20px; color: {{GOLD}}; flex: none; border: 1.5px solid {{GOLD}}; border-radius: 50%; padding: 3px; } .imp b { color: {{MR}}; }
.foot { position: absolute; bottom: 5mm; left: 11mm; right: 11mm; font-size: 7.8pt; color: {{MUT}}; border-top: 1px solid {{LINE}}; padding-top: 3px; display: flex; justify-content: space-between; gap: 10px; } .foot span:last-child { white-space: nowrap; }
"""
    html = fill("""<!doctype html><html><head><meta charset="utf-8"><title>TakeSure abstract — Draft 2</title><style>{{CSS}}</style></head><body>
<div class="top"><div><h1>{{TITLE}} <small>{{TAG}}</small></h1><div class="sub">{{SUB}}</div></div><div class="right">{{HERO}}<br>""" + TEAM_HTML + """</div></div>
<div class="dom"><b>Domain:</b> {{DOMAIN}}</div>
<div class="grid">
 <div><h2>01 <em>The problem</em></h2>{{PROBLEM}}<div class="stats">{{STATS}}</div><h2>02 <em>Proposed solution</em></h2>{{SOLUTION}}</div>
 <div><h2 style="text-align:center">03 <em>Approach</em></h2>{{FLOWV}}<div class="fcap">{{VERDICT}}</div></div>
 <div><div class="rule">“{{RULE}}”</div>{{CMP}}<p class="small"><b>Stack.</b> {{TECH}}</p><p class="small"><b>Knowledge base.</b> {{KB}}</p><h2>04 <em>Expected impact</em></h2>{{IMPACT}}</div>
</div>
<div class="foot"><span>{{FOOT}}</span><span>Team Bug Hunters · HACK@BVP 8.0</span></div>
</body></html>""", CSS=fill(css, MR=MR, GOLD=GOLD, INK=INK, MUT=MUT, LINE=LINE), TITLE=TITLE, TAG=TAG, SUB=SUB, EVENT=EVENT, DOMAIN=DOMAIN, HERO=hero(GOLD, MR, MR, 0.6),
        PROBLEM=ul(PROBLEM_B), STATS=stats, SOLUTION=ul(SOLUTION_B), FLOWV=flow_v(), VERDICT=VERDICT, RULE=RULE, CMP=cmp_table(), TECH=TECH, KB=KB, IMPACT=impact, FOOT=FOOT)
    write("draft2_maroon_spine", html)

# ================================================================ Draft 3: Blue & indigo clinical card
def draft3():
    BLUE, IND, INK, MUT, LINE = "#1155cc", "#4338ca", "#172033", "#5b6472", "#dde3ec"
    bars = "".join('<div class="mini"><b>%s</b><span>%s</span></div>' % (v, d) for v, d in STATS)
    impact = "".join('<li><b>%s.</b> %s</li>' % (t, d) for t, d in IMPACT)
    css = BASE + flowcss("#dde3ec", "#f7f9fc", "#333", BLUE, "#eef3fb", "#b9c9e8") + """
body { font-family: "Segoe UI", Calibri, Arial, sans-serif; color: {{INK}}; font-size: 8.6pt; line-height: 1.28; background: #f5f7fb; padding: 6mm 8mm; position: relative; }
.sheet { background: #fff; border: 1px solid {{LINE}}; border-radius: 10px; padding: 5mm 7mm 6mm; height: 100%; position: relative; }
.top { display: flex; justify-content: space-between; align-items: flex-start; }
h1 { font-size: 22pt; margin: 0; color: {{BLUE}}; letter-spacing: -.3px; line-height: 1; } h1 span { color: {{IND}}; font-weight: 400; font-size: 12.5pt; display: block; margin-top: 3px; }
.sub { font-size: 8.8pt; color: {{MUT}}; margin-top: 3px; max-width: 110mm; }
.right { text-align: right; font-size: 8.4pt; color: {{MUT}}; line-height: 1.35; white-space: nowrap; } .right b { color: {{INK}}; font-size: 10pt; }
.chips { margin: 4px 0 5px; } .chip { display: inline-block; font-size: 7.8pt; background: #eef3fb; color: {{BLUE}}; border-radius: 12px; padding: 1px 8px; margin-right: 4px; font-weight: 600; }
.cols { display: flex; gap: 6mm; } .main { flex: 1.2; min-width: 0; } .side { flex: 1; min-width: 0; }
h2 { font-size: 9.2pt; color: {{BLUE}}; margin: 3px 0 2px; text-transform: uppercase; letter-spacing: .8px; border-bottom: 2px solid #eef3fb; padding-bottom: 1px; }
li { font-size: 8.1pt; line-height: 1.26; } li b { color: {{IND}}; }
.bars { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; margin: 4px 0 3px; } .mini { background: #f5f7fb; border-radius: 5px; padding: 3px 5px; } .mini b { font-size: 12pt; color: {{BLUE}}; display: block; line-height: 1; } .mini span { font-size: 6.9pt; color: {{MUT}}; line-height: 1.15; display: block; margin-top: 1px; } .bar { display: flex; align-items: center; gap: 6px; margin-bottom: 2px; font-size: 7.6pt; color: {{MUT}}; } .bar .lbl { width: 50%; line-height: 1.15; }
.track { flex: 1; height: 6px; background: #eef1f6; border-radius: 4px; overflow: hidden; } .fillb { height: 100%; background: linear-gradient(90deg, {{IND}}, {{BLUE}}); border-radius: 4px; } .bar b { width: 34px; color: {{INK}}; font-size: 9pt; text-align: right; }
.card { border: 1px solid {{LINE}}; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 14px rgba(23,32,51,.08); font-size: 7.7pt; }
.card .hd { background: #fff4d6; color: #8a5300; padding: 5px 9px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #f3dca3; }
.card .hd .badge { background: #b86e00; color: #fff; font-weight: 800; border-radius: 6px; padding: 2px 7px; font-size: 9.5pt; } .card .hd b { font-size: 9pt; }
.card .bd { padding: 5px 9px; } .card .row { display: flex; justify-content: space-between; font-size: 7.7pt; color: {{MUT}}; margin-bottom: 2px; } .card .row b { color: {{INK}}; }
.card ol { margin: 2px 0 2px 14px; padding: 0; } .card .src { font-size: 7.3pt; color: {{MUT}}; border-top: 1px dashed {{LINE}}; padding-top: 2px; margin-top: 2px; }
.card .btns { display: flex; gap: 5px; margin-top: 4px; } .card .btn { flex: 1; text-align: center; border-radius: 5px; padding: 2px; font-size: 7.4pt; font-weight: 700; color: #fff; background: {{BLUE}}; } .card .btn.o { background: #fff; color: {{BLUE}}; border: 1px solid {{BLUE}}; }
.cap { font-size: 7.3pt; color: {{MUT}}; text-align: center; margin: 2px 0 4px; font-style: italic; }
.rule { background: #eef3fb; border-radius: 6px; padding: 3px 8px; margin: 4px 0; color: {{BLUE}}; font-weight: 700; font-style: italic; font-size: 8.8pt; }
.small { font-size: 7.7pt; color: #333; margin-top: 3px; }
ul.imp { margin-left: 13px; } ul.imp li { font-size: 8pt; }
.flow .fb { font-size: 7.2pt; padding: 3px 3px; } .flow .fb b { font-size: 7.7pt; }
.foot { position: absolute; bottom: 4mm; left: 8mm; right: 8mm; font-size: 7.7pt; color: {{MUT}}; display: flex; justify-content: space-between; gap: 10px; border-top: 1px solid {{LINE}}; padding-top: 3px; } .foot span:last-child { white-space: nowrap; }
"""
    card = """<div class="card"><div class="hd"><span class="badge">AMBER</span><div><b>Ashwagandha + Levothyroxine</b><br>Use with caution · evidence grade B</div></div>
<div class="bd"><div class="row"><span>Product: <b>Himalaya Ashvagandha</b></span><span>Rx: <b>Thyronorm 50</b></span></div>
Ashwagandha may raise thyroid hormone levels; the levothyroxine dose may need review. Do not stop either medicine on your own.
<ol><li>Should my TSH be rechecked in 6–8 weeks?</li><li>Is there a safer option for stress?</li><li>Should I keep a gap between the two?</li></ol>
<div class="src">Source: Sharma AK et al., J Altern Complement Med 2018 · PMID 28829155 · KB row v1.3 · verdict unchanged with AI off</div>
<div class="btns"><span class="btn">Share PDF with doctor</span><span class="btn o">Report suspected ADR</span></div></div></div>
<div class="cap">Concept of the result card — what the patient would see</div>"""
    html = fill("""<!doctype html><html><head><meta charset="utf-8"><title>TakeSure abstract — Draft 3</title><style>{{CSS}}</style></head><body><div class="sheet">
<div class="top"><div><h1>{{TITLE}}<span>{{TAG}}</span></h1><div class="sub">{{SUB}}</div></div><div class="right">""" + TEAM_HTML + """</div></div>
<div class="chips"><span class="chip">Health &amp; Well-Being</span><span class="chip">AI4Impact</span><span class="chip">SDG 3 · 9 · 10</span><span class="chip">Web / PWA + API</span><span class="chip">Hindi · English</span></div>
<div class="cols">
 <div class="main">
  <h2>1 · Problem</h2>{{PROBLEM}}<div class="bars">{{BARS}}</div>
  <h2>2 · Proposed solution</h2>{{SOLUTION}}<div class="rule">Our rule: {{RULE}}</div>
  <h2>Why it is different</h2>{{CMP}}
 </div>
 <div class="side">{{CARD}}<h2>Stack &amp; knowledge base</h2><p class="small">{{TECH}}</p><p class="small">{{KB}}</p><h2>4 · Expected impact</h2><ul class="imp">{{IMPACT}}</ul></div>
</div>
<h2>3 · Approach — workflow</h2>{{FLOW}}<div class="fcap"><b>Verdict rules:</b> {{VERDICT}}</div>
<div class="foot"><span>{{FOOT}}</span><span>Team Bug Hunters · HACK@BVP 8.0</span></div>
</div></body></html>""", CSS=fill(css, BLUE=BLUE, IND=IND, INK=INK, MUT=MUT, LINE=LINE), TITLE=TITLE, TAG=TAG, SUB=SUB, EVENT=EVENT,
        PROBLEM=ul(PROBLEM_B), BARS=bars, SOLUTION=ul(SOLUTION_B), RULE=RULE, CMP=cmp_table(), CARD=card, TECH=TECH, KB=KB, IMPACT=impact, FLOW=flow_h(), VERDICT=VERDICT, FOOT=FOOT)
    write("draft3_clinical_card", html)

# ================================================================ Draft 4: Story strip (red & cream)
def draft4():
    RED, CREAM, INK, MUT, LINE, NAV = "#8b2a2a", "#fbf6ee", "#1f1a17", "#6b625a", "#e2d6c3", "#1f3a5f"
    p1 = ('<svg viewBox="0 0 120 70"><circle cx="38" cy="22" r="10" fill="#f1c9a8"/><path d="M20 66c0-16 8-24 18-24s18 8 18 24z" fill="#b94a48"/>'
          '<g transform="translate(66,20) rotate(-20)"><rect x="0" y="0" width="34" height="14" rx="3" fill="#fff" stroke="#7a8a9a"/><circle cx="7" cy="7" r="3" fill="#dfe6ee"/><circle cx="17" cy="7" r="3" fill="#dfe6ee"/><circle cx="27" cy="7" r="3" fill="#dfe6ee"/></g>'
          '<rect x="78" y="40" width="20" height="26" rx="4" fill="#b8742a"/><rect x="82" y="36" width="12" height="6" rx="2" fill="#8a5300"/><path d="M83 55c3-6 8-8 12-9-1 5-4 9-12 9z" fill="#ffe4b8"/></svg>')
    p2 = ('<svg viewBox="0 0 120 70"><circle cx="30" cy="22" r="10" fill="#f1c9a8"/><path d="M12 66c0-16 8-24 18-24s18 8 18 24z" fill="#fff" stroke="#7a8a9a"/><path d="M24 46h12" stroke="#1155cc" stroke-width="2"/>'
          '<circle cx="90" cy="22" r="10" fill="#f1c9a8"/><path d="M72 66c0-16 8-24 18-24s18 8 18 24z" fill="#b94a48"/><text x="60" y="30" text-anchor="middle" font-family="Cambria,Georgia" font-size="26" font-weight="700" fill="#8b2a2a">?</text></svg>')
    p3 = ('<svg viewBox="0 0 120 70"><rect x="42" y="4" width="36" height="62" rx="6" fill="#1f1a17"/><rect x="46" y="9" width="28" height="52" rx="3" fill="#fff"/>'
          '<rect x="50" y="14" width="20" height="14" rx="2" fill="#e8eef6" stroke="#7a8a9a" stroke-width=".8"/><rect x="50" y="31" width="20" height="14" rx="2" fill="#fff1d6" stroke="#b86e00" stroke-width=".8"/>'
          '<path d="M52 20h16M52 23h10" stroke="#7a8a9a" stroke-width="1"/><path d="M52 37h16M52 40h10" stroke="#b86e00" stroke-width="1"/><path d="M48 50h24" stroke="#8b2a2a" stroke-width="3" stroke-linecap="round"/>'
          '<text x="60" y="58" text-anchor="middle" font-family="Calibri" font-size="5" fill="#1f1a17">confirm names</text><path d="M10 30h26M28 24l8 6-8 6" fill="none" stroke="#8b2a2a" stroke-width="2"/><path d="M84 30h26M102 24l8 6-8 6" fill="none" stroke="#8b2a2a" stroke-width="2"/></svg>')
    p4 = ('<svg viewBox="0 0 120 70"><rect x="12" y="10" width="96" height="50" rx="6" fill="#fff" stroke="#e2d6c3"/><rect x="12" y="10" width="96" height="14" rx="6" fill="#fff1d6"/>'
          '<rect x="18" y="13" width="26" height="8" rx="2" fill="#b86e00"/><text x="31" y="19.5" text-anchor="middle" font-family="Calibri" font-weight="700" font-size="6" fill="#fff">AMBER</text>'
          '<text x="48" y="20" font-family="Calibri" font-size="5.5" fill="#8a5300">Ashwagandha + Levothyroxine</text><path d="M18 31h84M18 36h70M18 41h78" stroke="#c9bfb2" stroke-width="1.5"/><path d="M18 48h40" stroke="#1155cc" stroke-width="2"/>'
          '<text x="20" y="56" font-family="Calibri" font-size="5" fill="#1155cc">3 questions for the doctor · source PMID</text><path d="M90 44l4 4 8-9" fill="none" stroke="#8b2a2a" stroke-width="2.2"/></svg>')
    panels = [(p1, "1. Mother takes Thyronorm and starts ashwagandha for stress."), (p2, "2. Her doctor never asks; she never tells; the label says nothing."),
              (p3, "3. She photographs both. TakeSure reads, confirms and checks the pair."), (p4, "4. AMBER, with a source, timing advice and three questions. PDF to the doctor.")]
    strip = "".join('<div class="panel">%s<p>%s</p></div>' % (s, c) for s, c in panels)
    stats = "".join('<span class="st"><b>%s</b> %s</span>' % (v, d) for v, d in STATS)
    impact = "".join('<div class="imp"><span class="ico">%s</span><div><b>%s.</b> %s</div></div>' % (I[IMPACT_ICONS[i]], t, d) for i, (t, d) in enumerate(IMPACT))
    css = BASE + flowcss("#d9cbb6", "#fff", "#333", RED, "#f6e7dc", "#d9a79a") + """
body { font-family: Calibri, "Segoe UI", Arial, sans-serif; color: {{INK}}; font-size: 9.2pt; line-height: 1.32; background: {{CREAM}}; padding: 8mm 11mm 7mm; position: relative; }
.top { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 4px; } .top > div:first-child { max-width: 128mm; }
h1 { font-family: Cambria, Georgia, serif; font-size: 25pt; margin: 0; color: {{RED}}; line-height: 1; } h1 small { font-size: 12pt; color: {{INK}}; font-weight: 400; font-style: italic; margin-left: 6px; }
.sub { font-size: 8.8pt; color: {{MUT}}; margin-top: 3px; }
.right { text-align: right; font-size: 8.4pt; color: {{MUT}}; line-height: 1.35; white-space: nowrap; flex: none; } .right b { color: {{RED}}; font-size: 10pt; }
.strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin: 3px 0 5px; }
.panel { background: #fff; border: 1.5px solid {{INK}}; border-radius: 4px; padding: 4px; box-shadow: 3px 3px 0 {{INK}}; } .panel svg { width: 100%; height: auto; display: block; }
.panel p { font-size: 7.8pt; line-height: 1.22; margin-top: 3px; border-top: 1px solid {{LINE}}; padding-top: 2px; }
.dom { font-size: 8.2pt; color: {{MUT}}; margin-bottom: 3px; } .dom b { color: {{RED}}; }
.cols { display: flex; gap: 6mm; } .cols > div { flex: 1; min-width: 0; }
h2 { font-family: Cambria, Georgia, serif; font-size: 10.8pt; color: {{RED}}; margin: 4px 0 2px; }
h2 span { display: inline-block; background: {{RED}}; color: #fff; font-size: 8pt; font-family: Calibri; padding: 0 5px; border-radius: 3px; margin-right: 5px; vertical-align: middle; }
li { font-size: 8.6pt; line-height: 1.28; } li b { color: {{NAV}}; }
.stats { font-size: 8.2pt; color: {{MUT}}; margin: 3px 0; line-height: 1.5; } .st { display: inline-block; margin-right: 8px; } .st b { color: {{RED}}; font-size: 11pt; }
.rule { font-family: Cambria, Georgia, serif; font-style: italic; color: {{RED}}; font-size: 10pt; margin: 3px 0; padding-left: 8px; border-left: 3px solid {{RED}}; }
.small { font-size: 8.1pt; color: #333; margin-top: 3px; }
.imp { display: flex; gap: 6px; margin-bottom: 3px; font-size: 8.4pt; line-height: 1.3; } .imp .ico { width: 20px; height: 20px; color: {{RED}}; flex: none; }
.foot { position: absolute; bottom: 4.5mm; left: 11mm; right: 11mm; font-size: 7.8pt; color: {{MUT}}; display: flex; justify-content: space-between; gap: 10px; border-top: 1px solid {{LINE}}; padding-top: 3px; } .foot span:last-child { white-space: nowrap; }
"""
    html = fill("""<!doctype html><html><head><meta charset="utf-8"><title>TakeSure abstract — Draft 4</title><style>{{CSS}}</style></head><body>
<div class="top"><div><h1>{{TITLE}}<small>{{TAG}}</small></h1><div class="sub">{{SUB}}</div></div><div class="right">""" + TEAM_HTML + """</div></div>
<div class="strip">{{STRIP}}</div>
<div class="dom"><b>Domain:</b> {{DOMAIN}}</div>
<div class="cols">
 <div><h2><span>1</span>The problem</h2>{{PROBLEM}}<div class="stats">{{STATS}}</div></div>
 <div><h2><span>2</span>Proposed solution</h2>{{SOLUTION}}<div class="rule">{{RULE}}</div></div>
</div>
<h2><span>3</span>Approach — project workflow</h2>{{FLOW}}<div class="fcap"><b>Verdict rules:</b> {{VERDICT}}</div>
<div class="cols" style="margin-top:3px">
 <div>{{CMP}}<p class="small"><b>Stack.</b> {{TECH}}</p><p class="small"><b>Knowledge base.</b> {{KB}}</p></div>
 <div><h2 style="margin-top:0"><span>4</span>Expected impact</h2>{{IMPACT}}</div>
</div>
<div class="foot"><span>{{FOOT}}</span><span>Team Bug Hunters · HACK@BVP 8.0</span></div>
</body></html>""", CSS=fill(css, RED=RED, CREAM=CREAM, INK=INK, MUT=MUT, LINE=LINE, NAV=NAV), TITLE=TITLE, TAG=TAG, SUB=SUB, EVENT=EVENT, DOMAIN=DOMAIN,
        STRIP=strip, PROBLEM=ul(PROBLEM_B), STATS=stats, SOLUTION=ul(SOLUTION_B), RULE=RULE, FLOW=flow_h(), VERDICT=VERDICT, CMP=cmp_table(), TECH=TECH, KB=KB, IMPACT=impact, FOOT=FOOT)
    write("draft4_story_strip", html)

# ================================================================ Draft 5: Purple bento grid + story
def draft5():
    PU, SAF, ROSE, SLATE, INK, MUT = "#4c1d95", "#f2a71b", "#b23a48", "#2d3e50", "#1a1626", "#5a5666"
    stats = "".join('<div class="tile stat"><b style="color:%s">%s</b><span>%s</span></div>' % ([PU, SAF, ROSE, SLATE][i], v, d) for i, (v, d) in enumerate(STATS))
    impact = "".join('<div class="imp"><div class="ico">%s</div><b>%s</b><p>%s</p></div>' % (I[IMPACT_ICONS[i]], t, d) for i, (t, d) in enumerate(IMPACT))
    css = BASE + flowcss("#ddd6ee", "#f7f5fc", "#333", PU, "#fff4dc", "#e8c27a") + """
body { font-family: "Segoe UI", Calibri, Arial, sans-serif; color: {{INK}}; font-size: 8.4pt; line-height: 1.27; background: #efedf5; padding: 5.5mm 8mm; }
.grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; grid-auto-rows: min-content; }
.tile { background: #fff; border-radius: 10px; padding: 5px 9px; min-width: 0; }
.title { grid-column: span 4; background: {{PU}}; color: #fff; display: flex; flex-direction: column; justify-content: center; }
.title h1 { font-family: Cambria, Georgia, serif; font-size: 21pt; margin: 0; line-height: 1; } .title h1 span { color: {{SAF}}; }
.title .sub { font-size: 8.4pt; color: #e2dcf3; margin-top: 3px; }
.team { grid-column: span 2; background: {{SAF}}; color: {{PU}}; font-size: 8.2pt; line-height: 1.3; display: flex; flex-direction: column; justify-content: center; } .team b { font-size: 10.5pt; display: block; }
.storyt { grid-column: span 6; padding: 6px 9px 5px; }
.story { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.panel { position: relative; background: #f7f5fc; border: 1px solid #ddd6ee; border-radius: 8px; padding: 4px 6px; }
.panel svg { width: auto; height: 52px; display: block; margin: 0 auto; }
.panel p { font-size: 7.4pt; line-height: 1.2; margin-top: 2px; color: #333; } .panel p b { color: {{PU}}; }
.pn { position: absolute; top: 4px; left: 5px; width: 14px; height: 14px; border-radius: 50%; background: {{PU}}; color: {{SAF}}; font-size: 7.5pt; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.stat b { font-size: 15pt; display: block; line-height: 1; } .stat span { font-size: 7.1pt; color: {{MUT}}; line-height: 1.18; display: block; margin-top: 2px; }
.quote { grid-column: span 2; background: {{SLATE}}; color: #fff; font-family: Cambria, Georgia, serif; font-style: italic; font-size: 9.6pt; display: flex; align-items: center; }
.problem { grid-column: span 3; } .solution { grid-column: span 3; }
h2 { font-size: 8.4pt; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 2px; color: {{PU}}; display: flex; align-items: center; gap: 6px; }
h2 i { font-style: normal; background: {{PU}}; color: #fff; border-radius: 4px; padding: 0 5px; font-size: 7.8pt; } .solution h2 i { background: {{SAF}}; color: {{PU}}; }
li { font-size: 7.7pt; line-height: 1.23; margin-bottom: 1px; } li b { color: {{PU}}; }
.approach { grid-column: span 6; } .flow .fb { font-size: 7.1pt; padding: 3px 4px; } .flow .fb b { font-size: 7.7pt; }
.kbt { grid-column: span 4; } .tech { grid-column: span 2; font-size: 7.4pt; color: #333; line-height: 1.24; }
table.kb { font-size: 7.2pt; } table.kb th, table.kb td { padding: 2px 4px; }
.impt { grid-column: span 6; } .impacts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.imp { font-size: 7.4pt; line-height: 1.22; } .imp .ico { width: 18px; height: 18px; color: {{ROSE}}; margin-bottom: 1px; } .imp b { color: {{PU}}; display: block; font-size: 8.3pt; margin-bottom: 1px; }
.foot { grid-column: span 6; font-size: 7.3pt; color: {{MUT}}; display: flex; justify-content: space-between; gap: 10px; padding: 0 4px; } .foot span:last-child { white-space: nowrap; }
"""
    html = fill("""<!doctype html><html><head><meta charset="utf-8"><title>TakeSure abstract — Draft 5</title><style>{{CSS}}</style></head><body>
<div class="grid">
 <div class="tile title"><h1>{{TITLE}} <span>· {{TAG}}</span></h1><div class="sub">{{SUB}}<br>Domain: {{DOMAIN}}</div></div>
 <div class="tile team"><div>{{HERO}}</div><b>Team Bug Hunters</b>Dhriti Garg · Shiwani Goyal · Khushi Gupta<br>{{EVENT}}</div>
 <div class="tile storyt"><h2>One patient's story — the gap today, and what TakeSure would do</h2><div class="story">{{STORY}}</div></div>
 {{STATS}}
 <div class="tile quote">“{{RULE}}”</div>
 <div class="tile problem"><h2><i>1</i>The problem</h2>{{PROBLEM}}</div>
 <div class="tile solution"><h2><i>2</i>Proposed solution</h2>{{SOLUTION}}</div>
 <div class="tile approach"><h2><i>3</i>Approach — project workflow</h2>{{FLOW}}<div class="fcap"><b>Verdict rules:</b> {{VERDICT}}</div></div>
 <div class="tile kbt"><h2>Knowledge base — sample rows</h2>{{KBT}}</div>
 <div class="tile tech"><h2>Stack &amp; data</h2>{{TECH}}<br><br>{{KB}}</div>
 <div class="tile impt"><h2><i>4</i>Expected impact</h2><div class="impacts">{{IMPACT}}</div></div>
 <div class="foot"><span>{{FOOT}}</span><span>Team Bug Hunters · HACK@BVP 8.0</span></div>
</div></body></html>""", CSS=fill(css, PU=PU, SAF=SAF, ROSE=ROSE, SLATE=SLATE, INK=INK, MUT=MUT), TITLE=TITLE, TAG=TAG, SUB=SUB, EVENT=EVENT, DOMAIN=DOMAIN, HERO=hero(PU, PU, PU, 0.55),
        STORY=story(PU, "#b23a48", "#4338ca"), STATS=stats, RULE=RULE, PROBLEM=ul(PROBLEM_B), SOLUTION=ul(SOLUTION_B), FLOW=flow_h(), VERDICT=VERDICT, KBT=kb_table(), TECH=TECH, KB=KB, IMPACT=impact, FOOT=FOOT)
    write("draft5_purple_bento", html)

# ================================================================ Draft 6: Editorial (black + red)
def draft6():
    INK, RED, MUT, LINE = "#111111", "#9b1c1c", "#666", "#cfcfcf"
    stats = "".join('<div class="st"><b>%s</b><span>%s</span></div>' % (v, d) for v, d in STATS)
    impact = "".join('<p><b>%s.</b> %s</p>' % (t, d) for t, d in IMPACT)
    css = BASE + flowcss("#bbb", "#fff", "#333", INK, "#f3f3f3", "#999") + """
body { font-family: Cambria, Georgia, "Times New Roman", serif; color: {{INK}}; font-size: 9pt; line-height: 1.32; background: #fff; padding: 9mm 13mm 9mm; position: relative; }
.kicker { font-family: "Segoe UI", Calibri, sans-serif; font-size: 8pt; letter-spacing: 2.5px; text-transform: uppercase; color: {{RED}}; }
h1 { font-size: 26pt; margin: 2px 0 0; line-height: 1; font-weight: 400; letter-spacing: -.5px; white-space: nowrap; } h1 em { font-style: italic; color: {{RED}}; }
.sub { font-size: 10pt; color: #333; margin: 4px 0 0; font-style: italic; }
.meta { font-family: "Segoe UI", Calibri, sans-serif; font-size: 8pt; color: {{MUT}}; display: flex; justify-content: space-between; border-top: 1px solid {{INK}}; border-bottom: 1px solid {{LINE}}; padding: 4px 0; margin: 7px 0 6px; } .meta b { color: {{INK}}; }
.sec { display: flex; gap: 6mm; margin-bottom: 3px; }
.num { width: 16mm; flex: none; font-family: "Segoe UI", Calibri, sans-serif; font-size: 8pt; letter-spacing: 1.5px; text-transform: uppercase; color: {{RED}}; padding-top: 3px; line-height: 1.3; }
.num b { display: block; font-size: 20pt; font-family: Cambria, Georgia, serif; font-weight: 400; color: {{INK}}; line-height: 1; margin-bottom: 2px; }
.body { flex: 1; min-width: 0; }
li { font-size: 8.6pt; margin-bottom: 1px; } li b { color: {{RED}}; font-weight: 700; }
.stats { display: flex; gap: 10px; margin: 4px 0 2px; } .st { flex: 1; border-top: 2px solid {{INK}}; padding-top: 2px; } .st b { font-size: 13pt; display: block; line-height: 1; font-weight: 400; }
.st span { font-family: "Segoe UI", Calibri, sans-serif; font-size: 7.5pt; color: {{MUT}}; line-height: 1.2; display: block; margin-top: 2px; }
.pull { font-size: 11pt; font-style: italic; text-align: center; margin: 4px 0 3px; } .pull span { border-bottom: 1.5px solid {{RED}}; }
.flow { font-family: "Segoe UI", Calibri, sans-serif; } .fb { border-radius: 0; } .fb.rule { background: {{RED}}; border-color: {{RED}}; } .fa { color: {{RED}}; }
.fcap, table.cmp, .tcap { font-family: "Segoe UI", Calibri, sans-serif; } table.cmp th { background: {{INK}}; }
.small { font-family: "Segoe UI", Calibri, sans-serif; font-size: 8pt; color: #333; margin-top: 4px; }
.cols2 { display: flex; gap: 6mm; margin-top: 4px; } .cols2 > div { flex: 1; min-width: 0; }
.imp p { margin-bottom: 2px; font-size: 8.4pt; }
.foot { position: absolute; bottom: 6mm; left: 14mm; right: 14mm; font-family: "Segoe UI", Calibri, sans-serif; font-size: 7.6pt; color: {{MUT}}; display: flex; justify-content: space-between; gap: 10px; border-top: 1px solid {{LINE}}; padding-top: 3px; } .foot span:last-child { white-space: nowrap; }
"""
    html = fill("""<!doctype html><html><head><meta charset="utf-8"><title>TakeSure abstract — Draft 6</title><style>{{CSS}}</style></head><body>
<div class="kicker">HACK@BVP 8.0 · Abstract Round · Health &amp; Well-Being</div>
<h1>{{TITLE}} <em>— {{TAG}}</em></h1><div class="sub">{{SUB}}</div>
<div class="meta"><span><b>Team Bug Hunters</b> · Dhriti Garg · Shiwani Goyal · Khushi Gupta</span><span>SDG 3 · SDG 9 · SDG 10 · Web / PWA + API · Hindi &amp; English</span></div>
<div class="sec"><div class="num"><b>1</b>Problem</div><div class="body">{{PROBLEM}}<div class="stats">{{STATS}}</div></div></div>
<div class="sec"><div class="num"><b>2</b>Solution</div><div class="body">{{SOLUTION}}<div class="pull"><span>{{RULE}}</span></div></div></div>
<div class="sec"><div class="num"><b>3</b>Approach</div><div class="body">{{FLOW}}<div class="fcap"><b>Verdict rules:</b> {{VERDICT}}</div>
 <div class="cols2"><div>{{CMP}}</div><div><p class="small"><b>Stack.</b> {{TECH}}</p><p class="small"><b>Knowledge base.</b> {{KB}}</p></div></div></div></div>
<div class="sec"><div class="num"><b>4</b>Impact</div><div class="body imp">{{IMPACT}}</div></div>
<div class="foot"><span>{{FOOT}}</span><span>Team Bug Hunters · HACK@BVP 8.0 · BVEST XIII</span></div>
</body></html>""", CSS=fill(css, INK=INK, RED=RED, MUT=MUT, LINE=LINE), TITLE=TITLE, TAG=TAG, SUB=SUB, PROBLEM=ul(PROBLEM_B), STATS=stats, SOLUTION=ul(SOLUTION_B), RULE=RULE,
        FLOW=flow_h(), VERDICT=VERDICT, CMP=cmp_table(), TECH=TECH, KB=KB, IMPACT=impact, FOOT=FOOT)
    write("draft6_editorial", html)

for f in (draft1, draft2, draft3, draft4, draft5, draft6): f()
