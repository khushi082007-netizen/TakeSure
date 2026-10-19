# -*- coding: utf-8 -*-
"""Generate six visually different one-page TakeSure abstracts (HTML) for Hack@BVP 8.0."""
import os, math
OUT = r"C:\Temp\bvp\drafts"
os.makedirs(OUT, exist_ok=True)

# ---------------------------------------------------------------- content
TITLE = "TakeSure"
TAG = "Confidence before taking something"
SUB = "An Ayurveda × Allopathy herb–drug interaction checker for Indian patients, doctors and the Ministry of Ayush"
TEAM = "Team Bug Hunters · Dhriti Garg · Shiwani Goyal · Khushi Gupta"
EVENT = "HACK@BVP 8.0 · Abstract Round"
DOMAIN = "Health &amp; Well-Being (AI4Impact secondary) · SDG 3 · SDG 9 · SDG 10"

PROBLEM = ("India runs two medical systems side by side and nobody checks the combination. A thyroid patient on Thyronorm adds "
           "ashwagandha for stress; a transplant patient on tacrolimus drinks giloy kadha; a cardiac patient on warfarin takes guggul for "
           "cholesterol. Ashwagandha can raise thyroid hormone, giloy can oppose immunosuppression and guggul can increase bleeding, yet "
           "the doctor rarely asks, the patient rarely tells, the chemist has no tool and the label says nothing about allopathic medicines. "
           "Existing checkers (Medscape, Drugs.com, 1mg) know only allopathic × allopathic pairs; Western herb databases are English-only, "
           "paid and do not recognise Indian brands such as Himalaya Ashvagandha or Dabur Giloy Ghanvati.")
PROBLEM_SHORT = ("Two medical systems, no safety check between them. A thyroid patient on Thyronorm adds ashwagandha; a transplant patient "
                 "on tacrolimus drinks giloy kadha; a cardiac patient on warfarin takes guggul. Each pair can cause harm, yet the doctor "
                 "rarely asks, the patient rarely tells, the chemist has no tool and the label says nothing. Medscape, Drugs.com and 1mg "
                 "check only allopathic pairs; Western herb databases are English-only, paid and do not know Indian brands.")
STATS = [("37%", "of hospital patients use allopathic and herbal medicines together"),
         ("65%", "of herbal users do not know the dose, side effects or interactions"),
         ("19%", "of Indian patients ever disclose herbal use to their doctor"),
         ("1,473", "ASU&amp;H adverse-event reports received nationally since 2018")]
SOLUTION = ("TakeSure is a phone-first safety layer between the two systems. The patient photographs the allopathic prescription and the "
            "Ayurvedic product label (or types the names). TakeSure reads them, confirms every name with the user, maps Indian brands to "
            "generics and products to their herbs, checks every herb–drug pair against a curated, cited knowledge base, and returns a "
            "plain-language verdict in Hindi or English with sources, timing advice and three questions to ask the doctor. One tap produces "
            "a one-page PDF for the doctor and a pre-filled suspected-ADR report in the Ministry of Ayush format for the Ayush Suraksha portal.")
RULE = "The verdict comes from published data; AI only explains it."
STEPS = [("Scan", "OCR (Tesseract eng+hin) reads both photos; every name is shown back for confirmation; images deleted after reading"),
         ("Match", "Bridge dictionary + fuzzy matching: Thyronorm → levothyroxine; Chyawanprash → amla, ashwagandha…; Sanskrit/Hindi/Latin synonyms"),
         ("Decide", "Deterministic rule engine over a versioned knowledge base; every row carries a source (DOI/PMID), severity and evidence grade A/B/C"),
         ("Explain", "LLM rewrites only the matched rows into simple Hindi/English with schema-locked output; it cannot add, remove or re-grade an interaction"),
         ("Report", "Doctor PDF with citations; one-tap ADR form for the Ayush pharmacovigilance network; co-use analytics dashboard")]
VERDICT = ("Worst row wins; an unknown pair is never shown as green; grade-C evidence caps at AMBER; the answer is identical with the AI switched off.")
TECH = ("Next.js + TypeScript PWA (Hindi/English UI) · FastAPI + Pydantic + SQLAlchemy REST API · PostgreSQL in production, SQLite offline · "
        "Tesseract OCR · RapidFuzz matching (≥85 accept, 70–85 ask the user) · Groq LLM with JSON-schema output at temperature 0 · ReportLab PDFs. "
        "No model training: a data + rules product that runs fully offline on a laptop.")
KB = ("40–60 high-frequency herb × drug pairs (15 common herbs × 12 drug classes) curated from PubMed, NIH LiverTox, MSKCC About Herbs, "
      "WHO monographs and the Ayurvedic Pharmacopoeia of India, graded on the Stockley's model. Decision support only: “ask your doctor”, "
      "never diagnosis or dosing; disclaimer on every screen and PDF.")
IMPACT = [("Patients &amp; caregivers", "A sourced answer before the first dose, in their own language, instead of silence or a guess. Free for citizens."),
          ("Doctors, vaidyas &amp; chemists", "Finally learn what patients actually take; a QR on the chemist's bill or an API inside hospital and telemedicine systems makes the check routine."),
          ("Ministry of Ayush", "Structured, reproducible ADR reports and real co-use data from the catchment of its 99 peripheral pharmacovigilance centres."),
          ("Novelty", "Nothing public today checks an Ayurvedic product against an allopathic prescription. TakeSure builds the missing bridge table: Indian brand names × Ayurvedic herb synonyms × graded evidence, open and auditable. Honest by design: grades, timing gaps instead of alarms, “not in database” instead of guesses.")]
FOOT = "Aligned with the Ministry of Ayush Pharmacovigilance Programme for ASU&amp;H drugs · decision support only, never diagnosis"

# ---------------------------------------------------------------- icons (stroke, currentColor)
def ic(path, vb="0 0 24 24", sw="1.8"):
    return ('<svg viewBox="%s" fill="none" stroke="currentColor" stroke-width="%s" stroke-linecap="round" stroke-linejoin="round">%s</svg>' % (vb, sw, path))
I = {
 "scan": ic('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
 "match": ic('<path d="M4 7h11M11 3l4 4-4 4"/><path d="M20 17H9M13 13l-4 4 4 4"/>'),
 "decide": ic('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>'),
 "explain": ic('<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>'),
 "report": ic('<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>'),
 "leaf": ic('<path d="M5 19C5 9 11 5 20 4c-1 9-5 15-15 15z"/><path d="M5 19c3-5 7-8 11-10"/>'),
 "pill": ic('<rect x="2.5" y="8.5" width="19" height="7" rx="3.5" transform="rotate(-35 12 12)"/><path d="M8.6 7.2l6.8 9.6"/>'),
 "patient": ic('<circle cx="12" cy="7" r="3.5"/><path d="M5 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2"/>'),
 "doctor": ic('<path d="M6 3v6a6 6 0 0 0 12 0V3"/><path d="M12 15v3a3 3 0 0 0 6 0v-2"/><circle cx="18" cy="14" r="2"/>'),
 "ministry": ic('<path d="M3 21h18M5 21V9l7-4 7 4v12M10 21v-5h4v5M9 12h2M13 12h2"/>'),
 "star": ic('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'),
 "phone": ic('<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18h2"/>'),
 "check": ic('<path d="M5 12l4.5 4.5L19 7"/>', sw="2.4"),
}
STEP_ICONS = ["scan", "match", "decide", "explain", "report"]
IMPACT_ICONS = ["patient", "doctor", "ministry", "star"]

def hero(c1, c2, ink, size=1.0):
    """pill × leaf → shield with check (inline svg)."""
    return ('<svg viewBox="0 0 240 86" style="width:%spx;height:auto" fill="none" stroke-linecap="round" stroke-linejoin="round">'
            '<g transform="translate(14,43) rotate(-30)"><rect x="-26" y="-11" width="52" height="22" rx="11" fill="%s"/>'
            '<path d="M0 -11v22" stroke="#fff" stroke-width="2"/><rect x="-26" y="-11" width="26" height="22" rx="11" fill="#fff" opacity=".35"/></g>'
            '<text x="58" y="51" font-family="Cambria,Georgia,serif" font-size="26" fill="%s">×</text>'
            '<g transform="translate(78,20)" stroke="%s" stroke-width="2.4"><path d="M4 42C4 18 18 7 44 4c-2 24-12 38-40 38z" fill="%s" fill-opacity=".18"/><path d="M4 42c7-12 17-20 29-26"/></g>'
            '<path d="M134 43h26" stroke="%s" stroke-width="2.6"/><path d="M154 36l8 7-8 7" stroke="%s" stroke-width="2.6"/>'
            '<g transform="translate(176,14)" stroke="%s" stroke-width="2.6"><path d="M26 2l22 8v16c0 14-9.5 24-22 28C13.5 50 4 40 4 26V10z" fill="%s" fill-opacity=".12"/><path d="M16 28l7 7 13-14"/></g>'
            '</svg>') % (240 * size, c1, ink, c2, c2, ink, ink, c1, c1)

def donut(pct, color, track="#e8e4dd", size=46, sw=6):
    r = (size - sw) / 2; c = 2 * math.pi * r
    return ('<svg viewBox="0 0 %d %d" width="%d" height="%d"><circle cx="%g" cy="%g" r="%g" stroke="%s" stroke-width="%d" fill="none"/>'
            '<circle cx="%g" cy="%g" r="%g" stroke="%s" stroke-width="%d" fill="none" stroke-dasharray="%g %g" stroke-linecap="round" transform="rotate(-90 %g %g)"/>'
            '<text x="50%%" y="53%%" text-anchor="middle" dominant-baseline="middle" font-family="Calibri,Arial" font-weight="700" font-size="%d" fill="%s">%d%%</text></svg>'
            % (size, size, size, size, size/2, size/2, r, track, sw, size/2, size/2, r, color, sw, c*pct/100, c, size/2, size/2, int(size*0.3), color, pct))

def fill(tpl, **kw):
    for k, v in kw.items(): tpl = tpl.replace("{{%s}}" % k, str(v))
    return tpl

BASE_CSS = """
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { width: 210mm; height: 297mm; overflow: hidden; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
p { margin: 0; }
svg { display: inline-block; vertical-align: middle; }
"""

def write(name, html):
    p = os.path.join(OUT, name + ".html")
    open(p, "w", encoding="utf-8").write(html); print("wrote", p)

# ================================================================ Draft 1: Emerald brand header
def draft1():
    EM, EM2, SAF, INK, MUT = "#0b3d2e", "#145c45", "#f4a300", "#1b1b1b", "#5d6660"
    stats = "".join('<div class="st"><div class="big" style="color:%s">%s</div><div><span>%s</span></div></div>' % (SAF if i % 2 else "#2f9e6e", v, d)
                    for i, (v, d) in enumerate(STATS))
    steps = "".join('<div class="step"><div class="ico">%s</div><div><b>%d · %s</b>%s</div></div>' % (I[STEP_ICONS[i]], i+1, t, d) for i, (t, d) in enumerate(STEPS))
    impact = "".join('<div class="imp"><div class="ico">%s</div><b>%s</b><p>%s</p></div>' % (I[IMPACT_ICONS[i]], t, d) for i, (t, d) in enumerate(IMPACT))
    css = BASE_CSS + """
body { font-family: Calibri, "Segoe UI", Arial, sans-serif; color: {{INK}}; font-size: 9.3pt; line-height: 1.3; background: #fff; }
.band { background: {{EM}}; color: #fff; padding: 9mm 12mm 7mm; display: flex; justify-content: space-between; align-items: center; }
.band h1 { font-family: Cambria, Georgia, serif; font-size: 22pt; margin: 0; line-height: 1.05; letter-spacing: .3px; }
.band > div:first-child { max-width: 120mm; }
.band h1 span { color: {{SAF}}; }
.band .tag { font-size: 12.5pt; color: {{SAF}}; margin: 3px 0 5px; font-style: italic; }
.band .sub { font-size: 9.5pt; color: #d7e7df; max-width: 118mm; }
.band .right { text-align: right; font-size: 8.6pt; color: #cfe2d8; line-height: 1.35; width: 56mm; flex: none; white-space: nowrap; }
.band .right b { color: #fff; font-size: 10pt; }
.strip { background: {{SAF}}; color: {{EM}}; font-size: 8.4pt; font-weight: 700; padding: 2px 12mm; letter-spacing: .4px; }
.wrap { padding: 5mm 12mm 0; }
.cols { display: flex; gap: 8mm; }
.cols > div { flex: 1; }
h2 { font-family: Cambria, Georgia, serif; font-size: 11.5pt; color: {{EM}}; margin: 5px 0 3px; display: flex; align-items: center; gap: 6px; }
h2::after { content: ""; flex: 1; height: 1px; background: #cfdcd5; }
h2 .n { background: {{SAF}}; color: {{EM}}; border-radius: 50%; width: 17px; height: 17px; font-size: 9pt; display: inline-flex; align-items: center; justify-content: center; }
.just { text-align: justify; }
.stats { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 8px; margin: 5px 0 2px; }
.st { display: flex; align-items: center; gap: 6px; background: #f3f7f5; border-radius: 6px; padding: 3px 6px; }
.st span { font-size: 8pt; color: {{MUT}}; line-height: 1.2; display: block; }
.big { font-size: 16pt; font-weight: 700; width: 52px; text-align: left; line-height: 1; }
.rule { background: #f3f7f5; border-left: 4px solid {{SAF}}; padding: 4px 8px; margin: 5px 0 0; font-style: italic; color: {{EM}}; font-weight: 700; }
.step { display: flex; gap: 7px; margin: 0 0 4px; align-items: flex-start; }
.step .ico { width: 24px; height: 24px; flex: none; border-radius: 6px; background: {{EM}}; color: {{SAF}}; padding: 4px; }
.step b { display: block; color: {{EM}}; }
.step div:last-child { font-size: 8.8pt; line-height: 1.28; }
.verd { font-size: 8.6pt; margin-top: 2px; color: {{MUT}}; }
.v { display: inline-block; padding: 0 5px; border-radius: 3px; font-weight: 700; margin-right: 2px; font-size: 8pt; }
.g { background: #e6f4ea; color: #1e7f4f; } .a { background: #fff1d6; color: #b86e00; } .r { background: #fde8e8; color: #b00020; } .n2 { background: #eef0f4; color: #4b5563; }
.tech { font-size: 8.6pt; color: #333; margin-top: 4px; }
.impacts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 4px; }
.imp { background: #f3f7f5; border-top: 3px solid {{SAF}}; border-radius: 0 0 6px 6px; padding: 4px 7px; font-size: 8.1pt; line-height: 1.27; }
.imp .ico { width: 20px; height: 20px; color: {{EM}}; margin-bottom: 2px; }
.imp b { display: block; color: {{EM}}; font-size: 9pt; margin-bottom: 1px; }
.foot { position: absolute; bottom: 0; left: 0; right: 0; background: {{EM}}; color: #cfe2d8; font-size: 7.8pt; padding: 3px 12mm; display: flex; justify-content: space-between; gap: 10px; }
.foot span:last-child { white-space: nowrap; }
"""
    html = fill("""<!doctype html><html><head><meta charset="utf-8"><title>TakeSure abstract — Draft 1</title><style>{{CSS}}</style></head><body>
<div class="band"><div><h1>{{TITLE}} <span>— {{TAG}}</span></h1><div class="tag">Scan both. Check the pair. Ask the right questions.</div><div class="sub">{{SUB}}</div></div>
<div class="right">{{HERO}}<br>{{EVENT}}<br><b>Team Bug Hunters</b><br>Dhriti Garg · Shiwani Goyal · Khushi Gupta</div></div>
<div class="strip">DOMAIN: {{DOMAIN}}</div>
<div class="wrap">
<div class="cols">
 <div>
  <h2><span class="n">1</span>The problem</h2><p class="just">{{PROBLEM}}</p>
  <div class="stats">{{STATS}}</div>
  <h2><span class="n">2</span>Proposed solution</h2><p class="just">{{SOLUTION}}</p>
  <div class="rule">Our rule: {{RULE}}</div>
 </div>
 <div>
  <h2><span class="n">3</span>Approach</h2>{{STEPS}}
  <div class="verd">Verdicts <span class="v g">GREEN</span><span class="v a">AMBER</span><span class="v r">RED</span><span class="v n2">NOT IN DATABASE</span> — {{VERDICT}}</div>
  <p class="tech"><b>Stack.</b> {{TECH}}</p>
  <p class="tech"><b>Knowledge base.</b> {{KB}}</p>
 </div>
</div>
<h2><span class="n">4</span>Expected impact</h2>
<div class="impacts">{{IMPACT}}</div>
</div>
<div class="foot"><span>{{FOOT}}</span><span>Team Bug Hunters · HACK@BVP 8.0 · BVEST XIII</span></div>
</body></html>""", CSS=fill(css, EM=EM, SAF=SAF, INK=INK, MUT=MUT), TITLE=TITLE, TAG=TAG, SUB=SUB, EVENT=EVENT, DOMAIN=DOMAIN,
        HERO=hero(SAF, "#7fd1a8", "#ffffff", 0.78), PROBLEM=PROBLEM, STATS=stats, SOLUTION=SOLUTION, RULE=RULE, STEPS=steps, VERDICT=VERDICT, TECH=TECH, KB=KB, IMPACT=impact, FOOT=FOOT)
    write("draft1_emerald_brand", html)

# ================================================================ Draft 2: Infographic spine
def draft2():
    SAF, EM, INK, MUT, LINE = "#e8911a", "#0f5a43", "#1f1a17", "#5e5852", "#d9d1c3"
    spine = "".join('<div class="node"><div class="dot">%s</div><div class="txt"><b>%d. %s</b>%s</div></div>' % (I[STEP_ICONS[i]], i+1, t, d) for i, (t, d) in enumerate(STEPS))
    stats = "".join('<div class="st"><b>%s</b><span>%s</span></div>' % (v, d) for v, d in STATS)
    impact = "".join('<div class="imp"><span class="ico">%s</span><div><b>%s</b> %s</div></div>' % (I[IMPACT_ICONS[i]], t, d) for i, (t, d) in enumerate(IMPACT))
    css = BASE_CSS + """
body { font-family: "Segoe UI", Calibri, Arial, sans-serif; color: {{INK}}; font-size: 9.3pt; line-height: 1.32; background: #fffdf9; padding: 9mm 11mm 8mm; position: relative; }
.top { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid {{SAF}}; padding-bottom: 5px; }
h1 { font-family: Cambria, Georgia, serif; font-size: 24pt; margin: 0; color: {{EM}}; line-height: 1.05; }
h1 small { display: block; font-size: 11pt; color: {{SAF}}; font-weight: 400; font-style: italic; margin-top: 2px; }
.sub { font-size: 9pt; color: {{MUT}}; margin-top: 3px; max-width: 120mm; }
.right { text-align: right; font-size: 8.4pt; color: {{MUT}}; line-height: 1.35; }
.right b { color: {{EM}}; font-size: 10pt; }
.dom { font-size: 8.3pt; color: {{MUT}}; margin: 4px 0 6px; }
.dom b { color: {{EM}}; }
.grid { display: grid; grid-template-columns: 1fr 64mm 1fr; gap: 6mm; }
.grid > div:first-child .just { text-align: left; }
h2 { font-size: 10.5pt; text-transform: uppercase; letter-spacing: 1px; color: {{SAF}}; margin: 4px 0 3px; font-weight: 700; }
h2 em { font-style: normal; color: {{EM}}; }
.just { text-align: justify; }
.stats { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin: 6px 0; }
.st { border-left: 3px solid {{SAF}}; padding: 1px 6px; }
.st b { font-size: 16pt; color: {{EM}}; display: block; line-height: 1.05; }
.st span { font-size: 7.9pt; color: {{MUT}}; line-height: 1.2; display: block; }
.spine { position: relative; padding-top: 2px; }
.spine::before { content: ""; position: absolute; left: 16px; top: 14px; bottom: 14px; width: 3px; background: linear-gradient({{SAF}}, {{EM}}); border-radius: 2px; }
.node { display: flex; gap: 10px; margin-bottom: 9px; align-items: flex-start; position: relative; }
.dot { width: 35px; height: 35px; border-radius: 50%; background: #fff; border: 3px solid {{SAF}}; color: {{EM}}; padding: 6px; flex: none; }
.node:nth-child(odd) .dot { border-color: {{EM}}; }
.txt { font-size: 8.4pt; line-height: 1.27; background: #fff; border: 1px solid {{LINE}}; border-radius: 6px; padding: 4px 7px; }
.txt b { display: block; color: {{EM}}; font-size: 9pt; }
.rule { font-family: Cambria, Georgia, serif; font-size: 11.5pt; color: {{EM}}; border-top: 1px solid {{LINE}}; border-bottom: 1px solid {{LINE}}; padding: 5px 0; margin: 6px 0; text-align: center; font-style: italic; }
.verd { font-size: 8.4pt; color: {{MUT}}; margin-top: 4px; }
.v { display: inline-block; padding: 0 5px; border-radius: 3px; font-weight: 700; margin-right: 2px; font-size: 7.8pt; }
.g { background: #e6f4ea; color: #1e7f4f; } .a { background: #fff1d6; color: #b86e00; } .r { background: #fde8e8; color: #b00020; } .n2 { background: #eef0f4; color: #4b5563; }
.small { font-size: 8.4pt; color: #333; margin-top: 4px; }
.imp { display: flex; gap: 6px; margin-bottom: 4px; font-size: 8.6pt; line-height: 1.3; }
.imp .ico { width: 22px; height: 22px; color: {{SAF}}; flex: none; border: 1.5px solid {{SAF}}; border-radius: 50%; padding: 3px; }
.imp b { color: {{EM}}; }
.foot { position: absolute; bottom: 5mm; left: 11mm; right: 11mm; font-size: 7.8pt; color: {{MUT}}; border-top: 1px solid {{LINE}}; padding-top: 3px; display: flex; justify-content: space-between; gap: 10px; }
.foot span:last-child { white-space: nowrap; }
"""
    html = fill("""<!doctype html><html><head><meta charset="utf-8"><title>TakeSure abstract — Draft 2</title><style>{{CSS}}</style></head><body>
<div class="top"><div><h1>{{TITLE}} <small>{{TAG}}</small></h1><div class="sub">{{SUB}}</div></div>
<div class="right">{{HERO}}<br>{{EVENT}}<br><b>Team Bug Hunters</b><br>Dhriti Garg · Shiwani Goyal · Khushi Gupta</div></div>
<div class="dom"><b>Domain:</b> {{DOMAIN}}</div>
<div class="grid">
 <div>
  <h2>01 <em>The problem</em></h2><p class="just">{{PROBLEM}}</p>
  <div class="stats">{{STATS}}</div>
  <h2>02 <em>Proposed solution</em></h2><p class="just">{{SOLUTION}}</p>
 </div>
 <div>
  <h2 style="text-align:center">03 <em>Approach</em></h2>
  <div class="spine">{{SPINE}}</div>
 </div>
 <div>
  <div class="rule">“{{RULE}}”</div>
  <div class="verd"><span class="v g">GREEN</span><span class="v a">AMBER</span><span class="v r">RED</span><span class="v n2">NOT IN DATABASE</span><br>{{VERDICT}}</div>
  <p class="small"><b>Stack.</b> {{TECH}}</p>
  <p class="small"><b>Knowledge base.</b> {{KB}}</p>
  <h2>04 <em>Expected impact</em></h2>{{IMPACT}}
 </div>
</div>
<div class="foot"><span>{{FOOT}}</span><span>Team Bug Hunters · HACK@BVP 8.0</span></div>
</body></html>""", CSS=fill(css, SAF=SAF, EM=EM, INK=INK, MUT=MUT, LINE=LINE), TITLE=TITLE, TAG=TAG, SUB=SUB, EVENT=EVENT, DOMAIN=DOMAIN,
        HERO=hero(SAF, EM, EM, 0.62), PROBLEM=PROBLEM, STATS=stats, SOLUTION=SOLUTION, SPINE=spine, RULE=RULE, VERDICT=VERDICT, TECH=TECH, KB=KB, IMPACT=impact, FOOT=FOOT)
    write("draft2_infographic_spine", html)

# ================================================================ Draft 3: Clinical result card
def draft3():
    BLUE, TEAL, INK, MUT, LINE = "#1155cc", "#0f766e", "#172033", "#5b6472", "#dde3ec"
    mx = 100
    bars = "".join('<div class="bar"><span class="lbl">%s</span><div class="track"><div class="fillb" style="width:%d%%"></div></div><b>%s</b></div>'
                   % (d, int(v.replace('%','')) if '%' in v else 100, v) for v, d in STATS[:3])
    steps = "".join('<div class="step"><div class="ico">%s</div><div><b>%s</b> %s</div></div>' % (I[STEP_ICONS[i]], t, d) for i, (t, d) in enumerate(STEPS))
    impact = "".join('<li><b>%s.</b> %s</li>' % (t, d) for t, d in IMPACT)
    css = BASE_CSS + """
body { font-family: "Segoe UI", Calibri, Arial, sans-serif; color: {{INK}}; font-size: 9.3pt; line-height: 1.33; background: #f5f7fb; padding: 8mm 10mm; position: relative; }
.sheet { background: #fff; border: 1px solid {{LINE}}; border-radius: 10px; padding: 7mm 8mm 6mm; height: 100%; position: relative; }
.top { display: flex; justify-content: space-between; align-items: flex-start; }
h1 { font-size: 23pt; margin: 0; color: {{BLUE}}; letter-spacing: -.3px; line-height: 1; }
h1 span { color: {{TEAL}}; font-weight: 400; font-size: 13pt; display: block; margin-top: 3px; }
.sub { font-size: 9pt; color: {{MUT}}; margin-top: 4px; max-width: 108mm; }
.right { text-align: right; font-size: 8.4pt; color: {{MUT}}; line-height: 1.35; }
.right b { color: {{INK}}; font-size: 10pt; }
.pillrow { margin: 5px 0 7px; }
.chip { display: inline-block; font-size: 7.9pt; background: #eef3fb; color: {{BLUE}}; border-radius: 12px; padding: 1px 8px; margin-right: 4px; font-weight: 600; }
.cols { display: flex; gap: 7mm; }
.main { flex: 1.25; } .side { flex: 1; }
h2 { font-size: 10pt; color: {{BLUE}}; margin: 5px 0 2px; text-transform: uppercase; letter-spacing: .8px; border-bottom: 2px solid #eef3fb; padding-bottom: 1px; }
.just { text-align: justify; }
.bars { margin: 5px 0 2px; }
.bar { display: flex; align-items: center; gap: 6px; margin-bottom: 3px; font-size: 7.9pt; color: {{MUT}}; }
.bar .lbl { width: 46%; line-height: 1.15; }
.track { flex: 1; height: 7px; background: #eef1f6; border-radius: 4px; overflow: hidden; }
.fillb { height: 100%; background: linear-gradient(90deg, {{TEAL}}, {{BLUE}}); border-radius: 4px; }
.bar b { width: 34px; color: {{INK}}; font-size: 9.5pt; text-align: right; }
.bar.n { font-size: 7.9pt; }
.card { border: 1px solid {{LINE}}; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 14px rgba(23,32,51,.08); margin-top: 3px; font-size: 8.4pt; }
.card .hd { background: #fff4d6; color: #8a5300; padding: 6px 9px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #f3dca3; }
.card .hd .badge { background: #b86e00; color: #fff; font-weight: 800; border-radius: 6px; padding: 2px 7px; font-size: 10pt; letter-spacing: .5px; }
.card .hd b { font-size: 9.5pt; }
.card .bd { padding: 6px 9px; color: {{INK}}; }
.card .row { display: flex; justify-content: space-between; font-size: 7.9pt; color: {{MUT}}; margin-bottom: 3px; }
.card .row span b { color: {{INK}}; }
.card ol { margin: 2px 0 3px 14px; padding: 0; } .card li { margin: 0; }
.card .src { font-size: 7.5pt; color: {{MUT}}; border-top: 1px dashed {{LINE}}; padding-top: 3px; margin-top: 3px; }
.card .btns { display: flex; gap: 5px; margin-top: 4px; }
.card .btn { flex: 1; text-align: center; border-radius: 5px; padding: 2px; font-size: 7.6pt; font-weight: 700; color: #fff; background: {{BLUE}}; }
.card .btn.o { background: #fff; color: {{BLUE}}; border: 1px solid {{BLUE}}; }
.cap { font-size: 7.5pt; color: {{MUT}}; text-align: center; margin-top: 2px; font-style: italic; }
.step { display: flex; gap: 6px; margin-bottom: 3px; font-size: 8.5pt; line-height: 1.28; }
.step .ico { width: 20px; height: 20px; flex: none; color: {{TEAL}}; background: #e6f4f2; border-radius: 5px; padding: 3px; }
.step b { color: {{INK}}; }
.rule { background: #eef3fb; border-radius: 6px; padding: 4px 8px; margin: 4px 0; color: {{BLUE}}; font-weight: 700; font-style: italic; font-size: 9pt; }
.small { font-size: 8.3pt; color: #333; margin-top: 3px; }
ul { margin: 2px 0 0 14px; padding: 0; } li { margin-bottom: 2px; font-size: 8.7pt; }
.foot { position: absolute; bottom: 4mm; left: 8mm; right: 8mm; font-size: 7.7pt; color: {{MUT}}; display: flex; justify-content: space-between; gap: 10px; border-top: 1px solid {{LINE}}; padding-top: 3px; }
.foot span:last-child { white-space: nowrap; }
"""
    card = """<div class="card"><div class="hd"><span class="badge">AMBER</span><div><b>Ashwagandha + Levothyroxine</b><br>Use with caution · evidence grade B</div></div>
<div class="bd"><div class="row"><span>Product: <b>Himalaya Ashvagandha</b></span><span>Rx: <b>Thyronorm 50</b></span></div>
Ashwagandha may raise thyroid hormone levels; the dose of levothyroxine may need review. Do not stop either medicine on your own.
<ol><li>Should my TSH be rechecked in 6–8 weeks?</li><li>Is there a safer option for stress?</li><li>Should I keep a gap between the two?</li></ol>
<div class="src">Source: Sharma AK et al., J Altern Complement Med 2018 · PMID 28829155 · KB row v1.3 · AI explanation, verdict unchanged with AI off</div>
<div class="btns"><span class="btn">Share PDF with doctor</span><span class="btn o">Report suspected ADR</span></div></div></div>
<div class="cap">Concept of the result card — the deliverable as the patient would see it</div>"""
    html = fill("""<!doctype html><html><head><meta charset="utf-8"><title>TakeSure abstract — Draft 3</title><style>{{CSS}}</style></head><body><div class="sheet">
<div class="top"><div><h1>{{TITLE}}<span>{{TAG}}</span></h1><div class="sub">{{SUB}}</div></div>
<div class="right">{{EVENT}}<br><b>Team Bug Hunters</b><br>Dhriti Garg · Shiwani Goyal · Khushi Gupta</div></div>
<div class="pillrow"><span class="chip">Health &amp; Well-Being</span><span class="chip">AI4Impact</span><span class="chip">SDG 3 · 9 · 10</span><span class="chip">Web / PWA + API</span><span class="chip">Hindi · English</span></div>
<div class="cols">
 <div class="main">
  <h2>1 · Problem</h2><p class="just">{{PROBLEM}}</p>
  <div class="bars">{{BARS}}<div class="bar"><span class="lbl">ASU&amp;H adverse-event reports nationally since 2018</span><div class="track"><div class="fillb" style="width:100%"></div></div><b>1,473</b></div></div>
  <h2>2 · Proposed solution</h2><p class="just">{{SOLUTION}}</p>
  <div class="rule">Our rule: {{RULE}}</div>
  <h2>3 · Approach</h2>{{STEPS}}
  <p class="small"><b>Verdicts</b> GREEN · AMBER · RED · NOT IN DATABASE — {{VERDICT}}</p>
 </div>
 <div class="side">
  {{CARD}}
  <h2 style="margin-top:7px">Stack &amp; knowledge base</h2>
  <p class="small">{{TECH}}</p>
  <p class="small">{{KB}}</p>
  <h2>4 · Expected impact</h2><ul>{{IMPACT}}</ul>
 </div>
</div>
<div class="foot"><span>{{FOOT}}</span><span>Team Bug Hunters · HACK@BVP 8.0</span></div>
</div></body></html>""", CSS=fill(css, BLUE=BLUE, TEAL=TEAL, INK=INK, MUT=MUT, LINE=LINE), TITLE=TITLE, TAG=TAG, SUB=SUB, EVENT=EVENT,
        PROBLEM=PROBLEM, BARS=bars, SOLUTION=SOLUTION, RULE=RULE, STEPS=steps, VERDICT=VERDICT, CARD=card, TECH=TECH, KB=KB, IMPACT=impact, FOOT=FOOT)
    write("draft3_clinical_card", html)

# ================================================================ Draft 4: Story strip
def draft4():
    RED, CREAM, INK, MUT, LINE, EM = "#8b2a2a", "#fbf6ee", "#1f1a17", "#6b625a", "#e2d6c3", "#1e6b52"
    # four illustrated panels (simple svg scenes)
    p1 = ('<svg viewBox="0 0 120 70"><circle cx="38" cy="22" r="10" fill="#f1c9a8"/><path d="M20 66c0-16 8-24 18-24s18 8 18 24z" fill="#b94a48"/>'
          '<g transform="translate(66,20) rotate(-20)"><rect x="0" y="0" width="34" height="14" rx="3" fill="#fff" stroke="#7a8a9a"/><circle cx="7" cy="7" r="3" fill="#dfe6ee"/><circle cx="17" cy="7" r="3" fill="#dfe6ee"/><circle cx="27" cy="7" r="3" fill="#dfe6ee"/></g>'
          '<rect x="78" y="40" width="20" height="26" rx="4" fill="#2f8f5b"/><rect x="82" y="36" width="12" height="6" rx="2" fill="#1e6b52"/><path d="M83 55c3-6 8-8 12-9-1 5-4 9-12 9z" fill="#c6efd6"/></svg>')
    p2 = ('<svg viewBox="0 0 120 70"><circle cx="30" cy="22" r="10" fill="#f1c9a8"/><path d="M12 66c0-16 8-24 18-24s18 8 18 24z" fill="#fff" stroke="#7a8a9a"/>'
          '<path d="M24 46h12" stroke="#1155cc" stroke-width="2"/><circle cx="90" cy="22" r="10" fill="#f1c9a8"/><path d="M72 66c0-16 8-24 18-24s18 8 18 24z" fill="#b94a48"/>'
          '<text x="60" y="30" text-anchor="middle" font-family="Cambria,Georgia" font-size="26" font-weight="700" fill="#8b2a2a">?</text></svg>')
    p3 = ('<svg viewBox="0 0 120 70"><rect x="42" y="4" width="36" height="62" rx="6" fill="#1f1a17"/><rect x="46" y="9" width="28" height="52" rx="3" fill="#fff"/>'
          '<rect x="50" y="14" width="20" height="14" rx="2" fill="#e8eef6" stroke="#7a8a9a" stroke-width=".8"/><rect x="50" y="31" width="20" height="14" rx="2" fill="#e6f4ea" stroke="#2f8f5b" stroke-width=".8"/>'
          '<path d="M52 20h16M52 23h10" stroke="#7a8a9a" stroke-width="1"/><path d="M52 37h16M52 40h10" stroke="#2f8f5b" stroke-width="1"/>'
          '<path d="M48 50h24" stroke="#e8911a" stroke-width="3" stroke-linecap="round"/><text x="60" y="58" text-anchor="middle" font-family="Calibri" font-size="5" fill="#1f1a17">confirm names</text>'
          '<path d="M10 30h26M28 24l8 6-8 6" fill="none" stroke="#8b2a2a" stroke-width="2"/><path d="M84 30h26M102 24l8 6-8 6" fill="none" stroke="#8b2a2a" stroke-width="2"/></svg>')
    p4 = ('<svg viewBox="0 0 120 70"><rect x="12" y="10" width="96" height="50" rx="6" fill="#fff" stroke="#e2d6c3"/><rect x="12" y="10" width="96" height="14" rx="6" fill="#fff1d6"/>'
          '<rect x="18" y="13" width="26" height="8" rx="2" fill="#b86e00"/><text x="31" y="19.5" text-anchor="middle" font-family="Calibri" font-weight="700" font-size="6" fill="#fff">AMBER</text>'
          '<text x="48" y="20" font-family="Calibri" font-size="5.5" fill="#8a5300">Ashwagandha + Levothyroxine</text>'
          '<path d="M18 31h84M18 36h70M18 41h78" stroke="#c9bfb2" stroke-width="1.5"/><path d="M18 48h40" stroke="#1155cc" stroke-width="2"/><text x="20" y="56" font-family="Calibri" font-size="5" fill="#1155cc">3 questions for the doctor · source PMID</text>'
          '<path d="M90 44l4 4 8-9" fill="none" stroke="#1e7f4f" stroke-width="2.2"/></svg>')
    panels = [(p1, "1. Mother takes Thyronorm and starts ashwagandha for stress."), (p2, "2. Her doctor never asks; she never tells; the label says nothing."),
              (p3, "3. She photographs both. TakeSure reads, confirms and checks the pair."), (p4, "4. AMBER, with a source, timing advice and three questions. PDF to the doctor.")]
    strip = "".join('<div class="panel">%s<p>%s</p></div>' % (s, c) for s, c in panels)
    stats = "".join('<span class="st"><b>%s</b> %s</span>' % (v, d) for v, d in STATS)
    steps = "".join('<li><b>%s.</b> %s</li>' % (t, d) for t, d in STEPS)
    impact = "".join('<div class="imp"><span class="ico">%s</span><div><b>%s.</b> %s</div></div>' % (I[IMPACT_ICONS[i]], t, d) for i, (t, d) in enumerate(IMPACT))
    css = BASE_CSS + """
body { font-family: Calibri, "Segoe UI", Arial, sans-serif; color: {{INK}}; font-size: 10pt; line-height: 1.38; background: {{CREAM}}; padding: 9mm 11mm 7mm; position: relative; }
.top { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 5px; }
h1 { font-family: Cambria, Georgia, serif; font-size: 26pt; margin: 0; color: {{RED}}; line-height: 1; }
h1 small { font-size: 12pt; color: {{INK}}; font-weight: 400; font-style: italic; margin-left: 6px; }
.sub { font-size: 9pt; color: {{MUT}}; margin-top: 3px; }
.right { text-align: right; font-size: 8.4pt; color: {{MUT}}; line-height: 1.35; white-space: nowrap; flex: none; }
.right b { color: {{RED}}; font-size: 10pt; }
.top > div:first-child { max-width: 128mm; }
.strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin: 4px 0 6px; }
.panel { background: #fff; border: 1.5px solid {{INK}}; border-radius: 4px; padding: 4px; box-shadow: 3px 3px 0 {{INK}}; }
.panel svg { width: 100%; height: auto; display: block; }
.panel p { font-size: 8.3pt; line-height: 1.25; margin-top: 3px; color: {{INK}}; border-top: 1px solid {{LINE}}; padding-top: 2px; }
.dom { font-size: 8.2pt; color: {{MUT}}; margin-bottom: 4px; } .dom b { color: {{RED}}; }
.cols { display: flex; gap: 7mm; } .cols > div { flex: 1; }
h2 { font-family: Cambria, Georgia, serif; font-size: 11pt; color: {{RED}}; margin: 5px 0 2px; }
h2 span { display: inline-block; background: {{RED}}; color: #fff; font-size: 8pt; font-family: Calibri; padding: 0 5px; border-radius: 3px; margin-right: 5px; vertical-align: middle; }
.just { text-align: justify; }
.stats { font-size: 8.8pt; color: {{MUT}}; margin: 5px 0; line-height: 1.6; }
.st { display: inline-block; margin-right: 8px; } .st b { color: {{RED}}; font-size: 11pt; }
.rule { font-family: Cambria, Georgia, serif; font-style: italic; color: {{RED}}; font-size: 10.5pt; margin: 4px 0; padding-left: 8px; border-left: 3px solid {{RED}}; }
ol { margin: 2px 0 2px 15px; padding: 0; } ol li { font-size: 9.1pt; margin-bottom: 2px; line-height: 1.32; } ol li b { color: {{EM}}; }
.verd { font-size: 8.3pt; color: {{MUT}}; }
.small { font-size: 8.7pt; color: #333; margin-top: 4px; }
.imp { display: flex; gap: 6px; margin-bottom: 4px; font-size: 9.1pt; line-height: 1.34; }
.imp .ico { width: 20px; height: 20px; color: {{RED}}; flex: none; }
.foot { position: absolute; bottom: 4.5mm; left: 11mm; right: 11mm; font-size: 7.8pt; color: {{MUT}}; display: flex; justify-content: space-between; border-top: 1px solid {{LINE}}; padding-top: 3px; }
"""
    html = fill("""<!doctype html><html><head><meta charset="utf-8"><title>TakeSure abstract — Draft 4</title><style>{{CSS}}</style></head><body>
<div class="top"><div><h1>{{TITLE}}<small>{{TAG}}</small></h1><div class="sub">{{SUB}}</div></div>
<div class="right">{{EVENT}}<br><b>Team Bug Hunters</b><br>Dhriti Garg · Shiwani Goyal · Khushi Gupta</div></div>
<div class="strip">{{STRIP}}</div>
<div class="dom"><b>Domain:</b> {{DOMAIN}}</div>
<div class="cols">
 <div>
  <h2><span>1</span>The problem</h2><p class="just">{{PROBLEM_SHORT}}</p>
  <div class="stats">{{STATS}}</div>
  <h2><span>2</span>Proposed solution</h2><p class="just">{{SOLUTION}}</p>
  <div class="rule">{{RULE}}</div>
 </div>
 <div>
  <h2><span>3</span>Approach</h2><ol>{{STEPS}}</ol>
  <p class="verd"><b>Verdicts</b> GREEN · AMBER · RED · NOT IN DATABASE — {{VERDICT}}</p>
  <p class="small"><b>Stack.</b> {{TECH}} <b>Knowledge base.</b> {{KB}}</p>
  <h2><span>4</span>Expected impact</h2>{{IMPACT}}
 </div>
</div>
<div class="foot"><span>{{FOOT}}</span><span>Team Bug Hunters · HACK@BVP 8.0</span></div>
</body></html>""", CSS=fill(css, RED=RED, CREAM=CREAM, INK=INK, MUT=MUT, LINE=LINE, EM=EM), TITLE=TITLE, TAG=TAG, SUB=SUB, EVENT=EVENT, DOMAIN=DOMAIN,
        STRIP=strip, PROBLEM_SHORT=PROBLEM_SHORT, STATS=stats, SOLUTION=SOLUTION, RULE=RULE, STEPS=steps, VERDICT=VERDICT, TECH=TECH, KB=KB, IMPACT=impact, FOOT=FOOT)
    write("draft4_story_strip", html)

# ================================================================ Draft 5: Bento grid
def draft5():
    EM, SAF, ROSE, SLATE, INK, MUT = "#0d4d3b", "#f2a71b", "#b23a48", "#2d3e50", "#15201b", "#5a6660"
    stats = "".join('<div class="tile stat s%d"><b>%s</b><span>%s</span></div>' % (i, v, d) for i, (v, d) in enumerate(STATS))
    steps = "".join('<div class="stp"><div class="ico">%s</div><b>%s</b><span>%s</span></div>' % (I[STEP_ICONS[i]], t, d) for i, (t, d) in enumerate(STEPS))
    impact = "".join('<div class="tile imp"><div class="ico">%s</div><b>%s</b><p>%s</p></div>' % (I[IMPACT_ICONS[i]], t, d) for i, (t, d) in enumerate(IMPACT))
    css = BASE_CSS + """
body { font-family: "Segoe UI", Calibri, Arial, sans-serif; color: {{INK}}; font-size: 9pt; line-height: 1.32; background: #eef1ee; padding: 7mm 8mm; }
.grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; height: 100%; grid-auto-rows: min-content; }
.tile { background: #fff; border-radius: 10px; padding: 7px 9px; }
.title { grid-column: span 4; background: {{EM}}; color: #fff; display: flex; flex-direction: column; justify-content: center; }
.title h1 { font-family: Cambria, Georgia, serif; font-size: 25pt; margin: 0; line-height: 1; }
.title h1 span { color: {{SAF}}; }
.title .sub { font-size: 9pt; color: #d6e5de; margin-top: 4px; }
.team { grid-column: span 2; background: {{SAF}}; color: {{EM}}; font-size: 8.6pt; line-height: 1.35; display: flex; flex-direction: column; justify-content: center; }
.team b { font-size: 11pt; display: block; }
.team .hero { margin-bottom: 2px; }
.stat { grid-column: span 1; text-align: left; }
.stat b { font-size: 17pt; display: block; line-height: 1; } .stat span { font-size: 7.6pt; color: {{MUT}}; line-height: 1.2; display: block; margin-top: 2px; }
.s0 b { color: {{EM}}; } .s1 b { color: {{SAF}}; } .s2 b { color: {{ROSE}}; } .s3 b { color: {{SLATE}}; }
.rule { grid-column: span 2; background: {{SLATE}}; color: #fff; font-family: Cambria, Georgia, serif; font-style: italic; font-size: 10.5pt; display: flex; align-items: center; }
.problem { grid-column: span 3; } .solution { grid-column: span 3; }
h2 { font-size: 9pt; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 3px; color: {{EM}}; display: flex; align-items: center; gap: 6px; }
h2 i { font-style: normal; background: {{EM}}; color: #fff; border-radius: 4px; padding: 0 5px; font-size: 8pt; }
.solution h2 i { background: {{SAF}}; color: {{EM}}; }
.approach { grid-column: span 6; background: #fff; }
.steps { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
.stp { background: #f4f7f5; border-radius: 8px; padding: 5px 7px; font-size: 7.9pt; line-height: 1.25; color: #333; }
.stp .ico { width: 22px; height: 22px; color: {{SAF}}; background: {{EM}}; border-radius: 6px; padding: 4px; margin-bottom: 3px; }
.stp b { display: block; color: {{EM}}; font-size: 9pt; margin-bottom: 1px; }
.verd { font-size: 7.9pt; color: {{MUT}}; margin-top: 4px; }
.v { display: inline-block; padding: 0 5px; border-radius: 3px; font-weight: 700; margin-right: 2px; font-size: 7.5pt; }
.g { background: #e6f4ea; color: #1e7f4f; } .a { background: #fff1d6; color: #b86e00; } .r { background: #fde8e8; color: #b00020; } .n2 { background: #eef0f4; color: #4b5563; }
.tech { grid-column: span 3; font-size: 8.2pt; color: #333; } .kb { grid-column: span 3; font-size: 8.2pt; color: #333; }
.imp { grid-column: span 3; font-size: 8.3pt; line-height: 1.3; }
.imp .ico { width: 20px; height: 20px; color: {{ROSE}}; float: right; }
.imp b { color: {{EM}}; display: block; font-size: 9pt; margin-bottom: 1px; }
.foot { grid-column: span 6; font-size: 7.6pt; color: {{MUT}}; display: flex; justify-content: space-between; gap: 10px; padding: 0 4px; }
.foot span:last-child { white-space: nowrap; }
.lbl4 { grid-column: span 6; padding: 4px 9px; background: transparent; }
.lbl4 h2 { margin: 0; }
.just { text-align: justify; }
"""
    html = fill("""<!doctype html><html><head><meta charset="utf-8"><title>TakeSure abstract — Draft 5</title><style>{{CSS}}</style></head><body>
<div class="grid">
 <div class="tile title"><h1>{{TITLE}} <span>· {{TAG}}</span></h1><div class="sub">{{SUB}}<br>Domain: {{DOMAIN}}</div></div>
 <div class="tile team"><div class="hero">{{HERO}}</div><b>Team Bug Hunters</b>Dhriti Garg · Shiwani Goyal · Khushi Gupta<br>{{EVENT}}</div>
 {{STATS}}
 <div class="tile rule">“{{RULE}}”</div>
 <div class="tile problem"><h2><i>1</i>The problem</h2><p class="just">{{PROBLEM}}</p></div>
 <div class="tile solution"><h2><i>2</i>Proposed solution</h2><p class="just">{{SOLUTION}}</p></div>
 <div class="tile approach"><h2><i>3</i>Approach</h2><div class="steps">{{STEPS}}</div>
  <div class="verd"><span class="v g">GREEN</span><span class="v a">AMBER</span><span class="v r">RED</span><span class="v n2">NOT IN DATABASE</span> {{VERDICT}}</div></div>
 <div class="tile tech"><h2>Tech stack</h2>{{TECH}}</div>
 <div class="tile kb"><h2>Knowledge base</h2>{{KB}}</div>
 <div class="tile lbl4"><h2><i>4</i>Expected impact</h2></div>
 {{IMPACT}}
 <div class="foot"><span>{{FOOT}}</span><span>Team Bug Hunters · HACK@BVP 8.0</span></div>
</div>
</body></html>""", CSS=fill(css, EM=EM, SAF=SAF, ROSE=ROSE, SLATE=SLATE, INK=INK, MUT=MUT), TITLE=TITLE, TAG=TAG, SUB=SUB, EVENT=EVENT, DOMAIN=DOMAIN,
        HERO=hero(EM, "#0d4d3b", EM, 0.6), STATS=stats, RULE=RULE, PROBLEM=PROBLEM, SOLUTION=SOLUTION, STEPS=steps, VERDICT=VERDICT, TECH=TECH, KB=KB, IMPACT=impact, FOOT=FOOT)
    write("draft5_bento_grid", html)

# ================================================================ Draft 6: Editorial minimal
def draft6():
    INK, RED, MUT, LINE = "#111111", "#9b1c1c", "#666", "#cfcfcf"
    # line pipeline diagram
    xs = [30, 150, 270, 390, 510]
    nodes = "".join('<g transform="translate(%d,0)"><circle cx="0" cy="26" r="20" fill="#fff" stroke="%s" stroke-width="1.6"/><g transform="translate(-10,16) scale(.85)" color="%s">%s</g>'
                    '<text x="0" y="62" text-anchor="middle" font-family="Cambria,Georgia,serif" font-size="11" fill="%s" font-weight="700">%s</text></g>'
                    % (x, INK, RED, I[STEP_ICONS[i]].replace('<svg viewBox="0 0 24 24"', '<svg viewBox="0 0 24 24" width="24" height="24"'), INK, STEPS[i][0]) for i, x in enumerate(xs))
    lines = "".join('<path d="M%d 26h%d" stroke="%s" stroke-width="1.4"/><path d="M%d 21l6 5-6 5" fill="none" stroke="%s" stroke-width="1.4"/>' % (x+22, 74, INK, x+90, INK) for x in xs[:-1])
    diagram = '<svg viewBox="0 0 540 72" style="width:100%%;height:auto">%s%s</svg>' % (lines, nodes)
    stepdesc = "".join('<div><b>%s</b> %s</div>' % (t, d) for t, d in STEPS)
    stats = "".join('<div class="st"><b>%s</b><span>%s</span></div>' % (v, d) for v, d in STATS)
    impact = "".join('<p><b>%s.</b> %s</p>' % (t, d) for t, d in IMPACT)
    css = BASE_CSS + """
body { font-family: Cambria, Georgia, "Times New Roman", serif; color: {{INK}}; font-size: 9.6pt; line-height: 1.38; background: #fff; padding: 12mm 14mm 10mm; position: relative; }
.kicker { font-family: "Segoe UI", Calibri, sans-serif; font-size: 8pt; letter-spacing: 2.5px; text-transform: uppercase; color: {{RED}}; }
h1 { font-size: 34pt; margin: 2px 0 0; line-height: 1; font-weight: 400; letter-spacing: -.5px; }
h1 em { font-style: italic; color: {{RED}}; }
.sub { font-size: 10.5pt; color: #333; margin: 5px 0 0; font-style: italic; }
.meta { font-family: "Segoe UI", Calibri, sans-serif; font-size: 8pt; color: {{MUT}}; display: flex; justify-content: space-between; border-top: 1px solid {{INK}}; border-bottom: 1px solid {{LINE}}; padding: 4px 0; margin: 8px 0 8px; }
.meta b { color: {{INK}}; }
.sec { display: flex; gap: 8mm; margin-bottom: 5px; }
.num { width: 16mm; flex: none; font-family: "Segoe UI", Calibri, sans-serif; font-size: 8pt; letter-spacing: 1.5px; text-transform: uppercase; color: {{RED}}; padding-top: 3px; line-height: 1.3; }
.num b { display: block; font-size: 20pt; font-family: Cambria, Georgia, serif; font-weight: 400; color: {{INK}}; line-height: 1; margin-bottom: 2px; }
.body { flex: 1; }
.just { text-align: justify; }
.dc::first-letter { font-size: 30pt; float: left; line-height: .8; padding: 3px 5px 0 0; color: {{RED}}; }
.stats { display: flex; gap: 10px; margin: 6px 0 2px; }
.st { flex: 1; border-top: 2px solid {{INK}}; padding-top: 3px; }
.st b { font-size: 16pt; display: block; line-height: 1; font-weight: 400; }
.st span { font-family: "Segoe UI", Calibri, sans-serif; font-size: 7.6pt; color: {{MUT}}; line-height: 1.2; display: block; margin-top: 2px; }
.pull { font-size: 13pt; font-style: italic; text-align: center; margin: 6px 0 4px; color: {{INK}}; }
.pull span { border-bottom: 1.5px solid {{RED}}; }
.stepdesc { font-family: "Segoe UI", Calibri, sans-serif; font-size: 8.1pt; display: grid; grid-template-columns: repeat(5, 1fr); gap: 7px; line-height: 1.25; color: #333; margin-top: 2px; }
.stepdesc b { display: none; }
.small { font-family: "Segoe UI", Calibri, sans-serif; font-size: 8.1pt; color: #333; margin-top: 4px; }
.cols2 { display: flex; gap: 7mm; } .cols2 > div { flex: 1; }
.imp p { margin-bottom: 3px; font-size: 9.1pt; }
.foot { position: absolute; bottom: 6mm; left: 14mm; right: 14mm; font-family: "Segoe UI", Calibri, sans-serif; font-size: 7.6pt; color: {{MUT}}; display: flex; justify-content: space-between; gap: 10px; border-top: 1px solid {{LINE}}; padding-top: 3px; }
.foot span:last-child { white-space: nowrap; }
"""
    html = fill("""<!doctype html><html><head><meta charset="utf-8"><title>TakeSure abstract — Draft 6</title><style>{{CSS}}</style></head><body>
<div class="kicker">HACK@BVP 8.0 · Abstract Round · Health &amp; Well-Being</div>
<h1>{{TITLE}} <em>— {{TAG}}</em></h1>
<div class="sub">{{SUB}}</div>
<div class="meta"><span><b>Team Bug Hunters</b> · Dhriti Garg · Shiwani Goyal · Khushi Gupta</span><span>SDG 3 · SDG 9 · SDG 10 · Web / PWA + API · Hindi &amp; English</span></div>
<div class="sec"><div class="num"><b>1</b>Problem</div><div class="body"><p class="just dc">{{PROBLEM}}</p><div class="stats">{{STATS}}</div></div></div>
<div class="sec"><div class="num"><b>2</b>Solution</div><div class="body"><p class="just">{{SOLUTION}}</p><div class="pull"><span>{{RULE}}</span></div></div></div>
<div class="sec"><div class="num"><b>3</b>Approach</div><div class="body">{{DIAGRAM}}<div class="stepdesc">{{STEPDESC}}</div>
 <p class="small"><b>Verdicts</b> GREEN · AMBER · RED · NOT IN DATABASE — {{VERDICT}}</p>
 <div class="cols2"><p class="small"><b>Stack.</b> {{TECH}}</p><p class="small"><b>Knowledge base.</b> {{KB}}</p></div></div></div>
<div class="sec"><div class="num"><b>4</b>Impact</div><div class="body imp">{{IMPACT}}</div></div>
<div class="foot"><span>{{FOOT}}</span><span>Team Bug Hunters · HACK@BVP 8.0 · BVEST XIII</span></div>
</body></html>""", CSS=fill(css, INK=INK, RED=RED, MUT=MUT, LINE=LINE), TITLE=TITLE, TAG=TAG, SUB=SUB, PROBLEM=PROBLEM, STATS=stats, SOLUTION=SOLUTION, RULE=RULE,
        DIAGRAM=diagram, STEPDESC=stepdesc, VERDICT=VERDICT, TECH=TECH, KB=KB, IMPACT=impact, FOOT=FOOT)
    write("draft6_editorial", html)

for f in (draft1, draft2, draft3, draft4, draft5, draft6): f()
