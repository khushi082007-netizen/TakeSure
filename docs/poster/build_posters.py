# -*- coding: utf-8 -*-
"""Three TakeSure poster variants (1200 x 1800 px, 2:3) rendered from HTML."""
import os
OUT = r"C:\Temp\bvp\poster\out"; os.makedirs(OUT, exist_ok=True)
LOGO_A = "file:///C:/Temp/bvp/logo/out/A_mark_transparent.png"
LOGO_B = "file:///C:/Temp/bvp/logo/out/B_mark_transparent.png"
SUREJI = "file:///C:/Temp/bvp/mascot/out/1_sureji_transparent.png"
SHIKARI = "file:///C:/Temp/bvp/mascot/out/5_shikari_transparent.png"
PANEL = "file:///C:/Temp/bvp/pptx/img/panel%d.png"

CSS = """
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1200px;height:1800px;overflow:hidden;background:#07150f}
body{font-family:"Segoe UI",Calibri,Arial,sans-serif;color:#e9f3ee;position:relative}
.bg{position:absolute;inset:0;background:
 radial-gradient(900px 600px at 15% 8%,rgba(61,213,152,.22),transparent 60%),
 radial-gradient(800px 700px at 90% 30%,rgba(244,163,0,.16),transparent 60%),
 radial-gradient(700px 500px at 50% 100%,rgba(61,213,152,.12),transparent 60%),
 #07150f}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:60px 60px}
.wrap{position:relative;padding:64px 70px}
.brand{display:flex;align-items:center;gap:18px}
.brand img{width:92px;height:92px}
.brand .n{font-family:Bahnschrift,"Segoe UI",Arial,sans-serif;font-weight:700;font-size:54px;letter-spacing:-1px;color:#fff}
.brand .n span{color:#3dd598}
.brand .t{font-size:16px;letter-spacing:5px;color:#9fb3ad;margin-top:-4px}
.tag{display:inline-block;border:1.5px solid rgba(61,213,152,.6);color:#3dd598;border-radius:30px;padding:8px 18px;font-size:19px;font-weight:600;margin:40px 0 0;letter-spacing:.5px}
h1{font-family:Cambria,Georgia,serif;font-weight:700;color:#fff;line-height:1.02;letter-spacing:-1.5px;margin-top:22px}
h1 em{font-style:normal;color:#3dd598}
h1 b{color:#f4a300}
.lead{font-size:26px;line-height:1.4;color:#c9d9d2;margin-top:24px;max-width:720px}
.steps{display:flex;gap:16px;margin-top:38px}
.step{flex:1;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:18px 18px 16px}
.step .k{font-family:Bahnschrift,"Segoe UI",Arial,sans-serif;font-size:15px;letter-spacing:3px;color:#f4a300}
.step .h{font-size:27px;font-weight:700;color:#fff;margin:6px 0 4px}
.step p{font-size:17px;line-height:1.35;color:#b9cbc3}
.card{background:#0e2a21;border:1px solid rgba(255,255,255,.12);border-radius:22px;padding:24px 26px;box-shadow:0 30px 60px rgba(0,0,0,.45)}
.card .top{display:flex;align-items:center;gap:14px}
.badge{background:#f4a300;color:#14213d;font-weight:800;border-radius:12px;padding:6px 14px;font-size:22px;letter-spacing:1px}
.card .ti{font-size:26px;font-weight:700;color:#fff}
.card .su{font-size:16px;color:#f4c766}
.card .row{display:flex;gap:12px;margin:16px 0 12px}
.card .cell{flex:1;background:rgba(255,255,255,.05);border-radius:12px;padding:10px 12px}
.card .cell small{display:block;font-size:12px;letter-spacing:2px;color:#8fa79e}
.card .cell b{font-size:18px;color:#fff}
.card p{font-size:17px;line-height:1.4;color:#d4e3dc}
.card .src{font-size:13px;color:#8fa79e;border-top:1px dashed rgba(255,255,255,.15);padding-top:10px;margin-top:12px}
.card .q{font-size:15px;color:#3dd598;margin-top:10px}
.chips{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
.chip{border-radius:10px;padding:6px 12px;font-weight:800;font-size:15px}
.cg{background:#143f2f;color:#3dd598}.ca{background:#4a3306;color:#ffc14d}.cr{background:#4a1716;color:#ff8a80}.cn{background:#263241;color:#aab8c8}
.stats{display:flex;gap:16px;margin-top:34px}
.stat{flex:1;border-left:4px solid #f4a300;padding:4px 0 4px 16px}
.stat b{display:block;font-family:Bahnschrift,"Segoe UI",Arial,sans-serif;font-size:50px;color:#fff;line-height:1}
.stat span{font-size:16px;color:#b9cbc3;line-height:1.3;display:block;margin-top:6px}
.foot{position:absolute;left:70px;right:70px;bottom:52px;border-top:1px solid rgba(255,255,255,.15);padding-top:18px;display:flex;justify-content:space-between;align-items:center;font-size:17px;color:#9fb3ad}
.foot b{color:#fff}
.rule{display:inline-flex;align-items:center;gap:10px;background:rgba(61,213,152,.12);border:1px solid rgba(61,213,152,.4);border-radius:14px;padding:12px 18px;font-size:21px;font-weight:700;color:#fff;margin-top:30px}
.rule i{font-style:normal;color:#3dd598}
"""

def html(body, extra=""):
    return '<!doctype html><html><head><meta charset="utf-8"><style>%s%s</style></head><body><div class="bg"></div><div class="grid"></div>%s</body></html>' % (CSS, extra, body)

card = """<div class="card">
<div class="top"><span class="badge">! AMBER</span><div><div class="ti">Ashwagandha + Levothyroxine</div><div class="su">Caution — discuss with your doctor · evidence grade B</div></div></div>
<div class="row"><div class="cell"><small>MEDICINE</small><b>Thyronorm 50</b></div><div class="cell"><small>AYURVEDIC PRODUCT</small><b>Himalaya Ashvagandha</b></div></div>
<p>Ashwagandha may raise thyroid hormone levels; the levothyroxine dose may need review. Do not stop either on your own.</p>
<div class="q">1. Should my TSH be rechecked in 6–8 weeks? &nbsp;2. Is there a safer option for stress? &nbsp;3. Should I keep a gap between the two?</div>
<div class="src">Source: Sharma AK et al., J Altern Complement Med 2018 · PMID 28829155 · Knowledge base v1.0.0 · verdict unchanged with AI off</div>
<div class="chips"><span class="chip cg">✓ GREEN</span><span class="chip ca">! AMBER</span><span class="chip cr">!! RED</span><span class="chip cn">? NOT IN DATABASE</span></div>
</div>"""

steps = """<div class="steps">
<div class="step"><div class="k">01 · SCAN</div><div class="h">Photograph both</div><p>The prescription and the Ayurvedic box. Or just type the names. Every name is confirmed first.</p></div>
<div class="step"><div class="k">02 · CHECK</div><div class="h">Rules, not guesses</div><p>Every herb–drug pair is checked against a cited knowledge base graded A / B / C.</p></div>
<div class="step"><div class="k">03 · KNOW</div><div class="h">Hindi or English</div><p>A clear verdict, three questions for your doctor, a PDF, and a Ministry of Ayush reaction report.</p></div>
</div>"""

stats = """<div class="stats">
<div class="stat"><b>37%</b><span>of hospital patients take allopathic and herbal medicines together</span></div>
<div class="stat"><b>19%</b><span>ever tell their doctor about the herbs they take</span></div>
<div class="stat"><b>0</b><span>public tools check an Ayurvedic product against a prescription. Until now.</span></div>
</div>"""

foot = """<div class="foot"><div><b>TakeSure</b> · Team Bug Hunters · HACK@BVP 8.0</div><div>Decision support, never diagnosis · Verdict from published data; AI only explains</div></div>"""

# ---------------------------------------------------------------- Poster 1: mascot-led, Hinglish hook
p1 = html(f"""
<div class="wrap">
<div class="brand"><img src="{LOGO_A}"><div><div class="n">Take<span>Sure</span></div><div class="t">CONFIDENCE BEFORE TAKING SOMETHING</div></div></div>
<div class="tag">AYURVEDA × ALLOPATHY · INTERACTION CHECKER</div>
<h1 style="font-size:92px">Dadi ka nuskha.<br>Doctor ki dawa.<br><em>Saath mein safe hai?</em></h1>
<div class="lead">Half of India takes both. Nobody checks the pair — not the doctor, not the chemist, not the label. TakeSure does, in 60 seconds, with the published source on screen.</div>
<div style="display:flex;gap:30px;margin-top:40px;align-items:flex-start">
  <div style="flex:1.25">{card}</div>
  <div style="flex:.75;text-align:center"><img src="{SUREJI}" style="width:100%;max-width:360px;filter:drop-shadow(0 30px 40px rgba(0,0,0,.5))"><div style="font-size:18px;color:#9fb3ad;margin-top:-10px">Sure-ji · <i>“Pehle check karo, phir lo.”</i></div></div>
</div>
{steps}
{stats}
</div>{foot}""")

# ---------------------------------------------------------------- Poster 2: story-strip led, English hook
panels = "".join(f'<div style="flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:10px"><img src="{PANEL % i}" style="width:100%;border-radius:10px;display:block"><p style="font-size:15px;line-height:1.3;color:#c9d9d2;margin-top:8px">{c}</p></div>'
                 for i, c in enumerate(["<b style='color:#fff'>Mother</b> takes Thyronorm and starts ashwagandha for stress.", "<b style='color:#fff'>Nobody asks, nobody tells.</b> The label says nothing.", "<b style='color:#fff'>She photographs both.</b> TakeSure reads and confirms the names.", "<b style='color:#fff'>AMBER.</b> A source, timing advice, three questions. PDF to the doctor."], start=1))
p2 = html(f"""
<div class="wrap">
<div class="brand"><img src="{LOGO_B}"><div><div class="n">Take<span>Sure</span></div><div class="t">CONFIDENCE BEFORE TAKING SOMETHING</div></div></div>
<div class="tag">AYURVEDA × ALLOPATHY · INTERACTION CHECKER</div>
<h1 style="font-size:96px">Two medicines.<br>One question.<br><em>Ask before you take.</em></h1>
<div class="lead">Ashwagandha can raise thyroid hormone. Giloy can fight a transplant drug. Guggul can thin blood further. The doctor rarely asks, the patient rarely tells. TakeSure checks the pair against published evidence and answers in Hindi or English.</div>
<div style="display:flex;gap:14px;margin-top:36px">{panels}</div>
{steps}
<div class="rule"><i>●</i> The verdict comes from published data. AI only explains it.</div>
{stats}
</div>{foot}""")

# ---------------------------------------------------------------- Poster 3: bold typographic, bug-hunter hook
p3 = html(f"""
<div class="wrap">
<div class="brand"><img src="{LOGO_A}"><div><div class="n">Take<span>Sure</span></div><div class="t">CONFIDENCE BEFORE TAKING SOMETHING</div></div></div>
<div class="tag">AYURVEDA × ALLOPATHY · INTERACTION CHECKER</div>
<h1 style="font-size:104px">Don't guess<br>the pair.<br><b>Check it.</b></h1>
<div class="lead">India runs two medical systems side by side, and the clash between a herb and a tablet is the bug nobody hunts. TakeSure reads your prescription and your Ayurvedic product, checks every pair against a cited knowledge base, and tells you what to ask your doctor.</div>
<div style="display:flex;gap:30px;margin-top:36px;align-items:center">
  <div style="flex:.7;text-align:center"><img src="{SHIKARI}" style="width:100%;max-width:330px;filter:drop-shadow(0 30px 40px rgba(0,0,0,.5))"><div style="font-size:18px;color:#9fb3ad">Shikari · Bug Hunter on duty</div></div>
  <div style="flex:1.3">{card}</div>
</div>
{steps}
{stats}
</div>{foot}""")

for name, h in (("poster1_hinglish_sureji", p1), ("poster2_story_strip", p2), ("poster3_check_it_shikari", p3)):
    open(os.path.join(OUT, name + ".html"), "w", encoding="utf-8").write(h); print("wrote", name)
