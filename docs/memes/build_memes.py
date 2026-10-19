# -*- coding: utf-8 -*-
"""Five original TakeSure memes (1200 x 1200) rendered from HTML."""
import os
OUT = r"C:\Temp\bvp\meme\out"; os.makedirs(OUT, exist_ok=True)
SUREJI = "file:///C:/Temp/bvp/mascot/out/1_sureji_transparent.png"
LOGO = "file:///C:/Temp/bvp/logo/out/B_mark_transparent.png"

CSS = """
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1200px;height:1200px;overflow:hidden;background:#fff}
body{font-family:"Segoe UI",Calibri,Arial,sans-serif;color:#14213d;position:relative}
.imp{font-family:Impact,"Arial Black",sans-serif;text-transform:uppercase;color:#fff;-webkit-text-stroke:3px #000;paint-order:stroke fill;letter-spacing:1px;line-height:1.05}
.foot{position:absolute;left:0;right:0;bottom:0;height:86px;background:#0b2a22;color:#cfe2d8;display:flex;align-items:center;justify-content:space-between;padding:0 36px;font-size:22px}
.foot b{color:#fff}
.foot img{width:54px;height:54px;vertical-align:middle;margin-right:12px}
.foot .l{display:flex;align-items:center}
.cap{font-family:Impact,"Arial Black",sans-serif;text-transform:uppercase;letter-spacing:1px}
"""
def page(body, extra=""):
    return '<!doctype html><html><head><meta charset="utf-8"><style>%s%s</style></head><body>%s</body></html>' % (CSS, extra, body)
FOOT = f'<div class="foot"><div class="l"><img src="{LOGO}"><b>TakeSure</b>&nbsp;· Pehle check karo, phir lo.</div><div>Team Bug Hunters · HACK@BVP 8.0</div></div>'

# simple people
def person(x, y, shirt, face="smile", scale=1.0, extra=""):
    mouth = {"smile": '<path d="M-14 22 q14 12 28 0" stroke="#14213d" stroke-width="4" fill="none" stroke-linecap="round"/>',
             "flat": '<path d="M-14 24 h28" stroke="#14213d" stroke-width="4" stroke-linecap="round"/>',
             "worried": '<path d="M-14 28 q14 -12 28 0" stroke="#14213d" stroke-width="4" fill="none" stroke-linecap="round"/>',
             "shock": '<ellipse cx="0" cy="26" rx="10" ry="14" fill="#14213d"/>'}[face]
    return f'''<g transform="translate({x} {y}) scale({scale})"><path d="M-70 200 c0 -70 30 -110 70 -110 s70 40 70 110 z" fill="{shirt}"/><circle cx="0" cy="0" r="52" fill="#f3c9a3"/><path d="M-52 -10 q52 -70 104 0 q-52 -30 -104 0z" fill="#2b1d0e"/><circle cx="-18" cy="2" r="6" fill="#14213d"/><circle cx="18" cy="2" r="6" fill="#14213d"/>{mouth}{extra}</g>'''
def bottle(x, y, col, label, scale=1.0):
    return f'''<g transform="translate({x} {y}) scale({scale})"><rect x="14" y="-14" width="32" height="18" rx="4" fill="#5a3a1a"/><rect x="0" y="0" width="60" height="110" rx="12" fill="{col}"/><rect x="8" y="30" width="44" height="50" rx="5" fill="#fff6e8"/><text x="30" y="60" text-anchor="middle" font-family="Segoe UI,Arial" font-size="11" font-weight="700" fill="#0f5a43">{label}</text></g>'''
def strip(x, y, rot=0):
    return f'''<g transform="translate({x} {y}) rotate({rot})"><rect width="120" height="60" rx="8" fill="#e9eef5" stroke="#9aa7b8" stroke-width="3"/><g fill="#fff" stroke="#b7c2d1" stroke-width="2"><circle cx="24" cy="20" r="10"/><circle cx="60" cy="20" r="10"/><circle cx="96" cy="20" r="10"/><circle cx="24" cy="42" r="10"/><circle cx="60" cy="42" r="10"/><circle cx="96" cy="42" r="10"/></g><g fill="#f4a300"><circle cx="24" cy="20" r="6"/><circle cx="60" cy="20" r="6"/><circle cx="96" cy="20" r="6"/><circle cx="24" cy="42" r="6"/></g></g>'''

# ---------------------------------------------------------------- M1: "Koi aur dawa?"
m1 = page(f"""
<div style="position:absolute;inset:0;background:#fbf6ec"></div>
<div style="position:absolute;left:0;top:0;width:1200px;height:70px;background:#14213d;color:#fff;display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:700;letter-spacing:1px">EVERY OPD IN INDIA, EVERY DAY</div>
<svg viewBox="0 0 1200 1030" style="position:absolute;top:70px;left:0;width:1200px;height:1030px">
 <rect x="30" y="30" width="555" height="600" rx="18" fill="#fff" stroke="#e6dfd0" stroke-width="3"/>
 <rect x="615" y="30" width="555" height="600" rx="18" fill="#fff" stroke="#e6dfd0" stroke-width="3"/>
 <!-- panel 1: doctor asks -->
 {person(170, 270, "#fff", "smile", 1.3, '<rect x="-40" y="110" width="80" height="60" fill="#fff"/><path d="M-20 110 l20 40 l20 -40" stroke="#9aa7b8" stroke-width="3" fill="none"/><circle cx="26" cy="150" r="10" fill="#14213d"/><path d="M-30 100 q-10 50 56 50" stroke="#14213d" stroke-width="4" fill="none"/>')}
 <g transform="translate(290 70)"><rect width="270" height="110" rx="16" fill="#eef3fb" stroke="#1155cc" stroke-width="3"/><path d="M40 110 l-20 30 l40 -30" fill="#eef3fb" stroke="#1155cc" stroke-width="3"/><text x="135" y="48" text-anchor="middle" font-size="26" font-weight="700" fill="#14213d">Koi aur dawa</text><text x="135" y="84" text-anchor="middle" font-size="26" font-weight="700" fill="#14213d">le rahe ho?</text></g>
 {person(450, 330, "#b94a48", "smile", 1.3)}
 <g transform="translate(300 440)"><rect width="150" height="80" rx="14" fill="#fff" stroke="#14213d" stroke-width="3"/><path d="M110 80 l20 24 l-40 -24" fill="#fff" stroke="#14213d" stroke-width="3"/><text x="75" y="50" text-anchor="middle" font-size="28" font-weight="700" fill="#14213d">Nahi ji.</text></g>
 <!-- panel 2: the bag -->
 {person(760, 330, "#b94a48", "flat", 1.3)}
 <g transform="translate(900 360) scale(1.15)"><path d="M0 60 l20 -60 h180 l20 60 v150 h-220 z" fill="#c9a86a"/><path d="M60 0 q50 -70 100 0" stroke="#8a5a2b" stroke-width="10" fill="none"/>
 {bottle(10, 40, "#b8742a", "Ashvagandha", .9)}{bottle(70, 40, "#2f8f5b", "Giloy", .9)}{bottle(130, 40, "#8a5a2b", "Guggul", .9)}{bottle(40, 100, "#c0271f", "Chyawanprash", .9)}{bottle(110, 100, "#e08f00", "Haldi", .9)}
 </g>
 <g transform="translate(640 60)"><rect width="300" height="110" rx="16" fill="#fff4dc" stroke="#e08f00" stroke-width="3"/><text x="150" y="44" text-anchor="middle" font-size="24" font-weight="700" fill="#5a3a00">*5 Ayurvedic bottles</text><text x="150" y="80" text-anchor="middle" font-size="24" font-weight="700" fill="#5a3a00">in the same bag*</text></g>
 <image href="{SUREJI}" x="640" y="430" width="190" height="190"/>
 <g transform="translate(660 390)"><rect width="130" height="48" rx="10" fill="#14213d"/><text x="65" y="32" text-anchor="middle" font-size="22" font-weight="700" fill="#fff">Bhai…?</text></g>
 <text x="600" y="730" text-anchor="middle" class="cap" font-family="Impact,Arial Black" font-size="64" fill="#14213d">ONLY 19% TELL THEIR DOCTOR.</text>
 <text x="600" y="815" text-anchor="middle" class="cap" font-family="Impact,Arial Black" font-size="64" fill="#0f5a43">THE OTHER 81% HAVE A BAG.</text>
 <text x="600" y="900" text-anchor="middle" font-size="30" fill="#3e4450">TakeSure checks the bag against the prescription. In 60 seconds. With the source.</text>
</svg>
{FOOT}""")

# ---------------------------------------------------------------- M2: galaxy brain (our own brains)
def brain(level):
    glow = ["#9aa7b8", "#f4a300", "#3dd598", "#ffffff"][level]
    rays = "".join(f'<path d="M0 0 L{int(80*__import__("math").cos(a*0.5236))} {int(80*__import__("math").sin(a*0.5236))}" stroke="{glow}" stroke-width="4" opacity=".7"/>' for a in range(12)) if level >= 2 else ""
    return f'''<svg viewBox="-100 -100 200 200" width="200" height="200"><g>{rays}</g><circle r="{62 if level==3 else 0}" fill="{glow}" opacity=".25"/><path d="M-50 -10 c-10 -40 30 -60 50 -40 c20 -20 60 0 50 40 c15 10 10 40 -10 45 c-5 20 -35 25 -45 10 c-10 15 -40 10 -45 -10 c-20 -5 -25 -35 0 -45z" fill="#f7b6c9" stroke="#d9748f" stroke-width="4"/><path d="M0 -45 v85 M-30 -20 c15 5 20 20 10 35 M30 -20 c-15 5 -20 20 -10 35" stroke="#d9748f" stroke-width="4" fill="none" stroke-linecap="round"/></svg>'''
rows = [("Taking the tablet the doctor gave you.", 0), ("Adding dadi's ashwagandha for stress.", 1), ("Taking both together because “natural hai, kuch nahi hota”.", 2), ("Checking the pair on TakeSure before swallowing anything.", 3)]
BGS = ["#1a1f26", "#2a2410", "#0f3a2c", "#0f5a43"]; COLS = ["#c9cfd6", "#ffc14d", "#9fe6c7", "#fff"]
m2_rows = ""
for i, (t, l) in enumerate(rows):
    extra = '' if i < 3 else '<img src="%s" style="position:absolute;right:30px;bottom:95px;width:190px">' % SUREJI
    m2_rows += ('<div style="position:absolute;left:0;top:%dpx;width:1200px;height:278px;display:flex;align-items:center;border-bottom:3px solid #14213d;background:%s">'
                '<div style="width:300px;display:flex;justify-content:center">%s</div>'
                '<div style="flex:1;padding-right:240px;font-size:%dpx;font-weight:700;line-height:1.15;color:%s">%s</div>%s</div>'
                % (i * 278, BGS[i], brain(l), 40 if i < 3 else 44, COLS[i], t, extra))
m2 = page('<div style="position:absolute;inset:0;background:#0b1f1a"></div>' + m2_rows + FOOT)

# ---------------------------------------------------------------- M3: relationship status
m3 = page(f"""
<div style="position:absolute;inset:0;background:linear-gradient(160deg,#fff4dc,#fbf6ec)"></div>
<div style="position:absolute;left:100px;top:90px;width:1000px;background:#fff;border-radius:26px;box-shadow:0 30px 60px rgba(20,33,61,.18);padding:40px 50px">
 <div style="font-size:22px;letter-spacing:4px;color:#6b6f78">RELATIONSHIP STATUS</div>
 <div style="display:flex;align-items:center;justify-content:space-between;margin-top:26px">
  <div style="text-align:center;width:300px"><svg viewBox="0 0 200 200" width="220" height="220"><circle cx="100" cy="100" r="96" fill="#fff6e8" stroke="#e6dfd0" stroke-width="4"/><g transform="translate(40 60)"><rect x="14" y="-14" width="32" height="18" rx="4" fill="#5a3a1a"/><rect x="0" y="0" width="60" height="110" rx="12" fill="#b8742a"/><rect x="8" y="30" width="44" height="50" rx="5" fill="#fff6e8"/><text x="30" y="60" text-anchor="middle" font-family="Segoe UI,Arial" font-size="9" font-weight="700" fill="#0f5a43">Ashvagandha</text></g><path d="M120 70 c10 -20 30 -28 50 -24 c-4 20 -16 32 -50 24z" fill="#3dd598"/></svg><div style="font-size:30px;font-weight:700;margin-top:6px">Ashwagandha</div><div style="font-size:18px;color:#6b6f78">Dadi's pick · “for stress”</div></div>
  <div style="font-size:120px;color:#c0271f;line-height:1">❤</div>
  <div style="text-align:center;width:300px"><svg viewBox="0 0 200 200" width="220" height="220"><circle cx="100" cy="100" r="96" fill="#eef3fb" stroke="#e6dfd0" stroke-width="4"/><g transform="translate(40 70) rotate(-10)">{strip(0,0).replace('<g transform="translate(0 0) rotate(0)">','<g>')}</g></svg><div style="font-size:30px;font-weight:700;margin-top:6px">Levothyroxine</div><div style="font-size:18px;color:#6b6f78">Doctor's pick · “Thyronorm, daily”</div></div>
 </div>
 <div style="margin-top:34px;background:#fff1d6;border:3px solid #e08f00;border-radius:18px;padding:22px 30px;display:flex;align-items:center;gap:24px"><span style="background:#e08f00;color:#fff;font-weight:800;font-size:30px;padding:8px 20px;border-radius:12px">AMBER</span><span style="font-size:40px;font-weight:800;color:#5a3a00">It's complicated.</span></div>
 <div style="margin-top:22px;font-size:26px;line-height:1.45;color:#3e4450">Ashwagandha can push thyroid hormone up. Together, the dose may need a rethink. Not a breakup, not a wedding: <b>a conversation with the doctor</b> (TSH recheck in 6–8 weeks). Evidence grade B · Sharma 2018.</div>
</div>
<img src="{SUREJI}" style="position:absolute;right:40px;bottom:100px;width:230px">
<div style="position:absolute;left:100px;bottom:120px;font-size:34px;font-weight:800;color:#14213d">Before you make it official, <span style="color:#0f5a43">check the pair.</span></div>
{FOOT}""")

# ---------------------------------------------------------------- M4: red flag / green flag
def flag(col):
    return f'<svg viewBox="0 0 40 48" width="44" height="52"><path d="M6 4 v42" stroke="#14213d" stroke-width="4"/><path d="M8 6 h26 l-8 10 l8 10 h-26 z" fill="{col}"/></svg>'
red = ["“Natural hai, kuch nahi hota.”", "Googling the herb at 2 AM and trusting the first forum post.", "Hiding the Ayurvedic bottles from the doctor “to avoid lecture”.", "Starting giloy kadha on top of transplant medicines for immunity."]
green = ["Tells the doctor everything they take, herb included.", "Checks the pair on TakeSure before the first dose.", "Keeps a 2–3 hour gap when the verdict says so.", "Reports a reaction in the Ministry of Ayush format, not on WhatsApp."]
m4 = page(f"""
<div style="position:absolute;inset:0;background:#fbf6ec"></div>
<div style="position:absolute;top:50px;left:0;width:1200px;text-align:center;font-family:Impact,'Arial Black';font-size:72px;color:#14213d;text-transform:uppercase;letter-spacing:1px">Medicine-cabinet flags</div>
<div style="position:absolute;top:150px;left:60px;width:530px;background:#fde8e8;border:4px solid #c0271f;border-radius:24px;padding:26px 28px;height:680px">
 <div style="font-size:40px;font-weight:800;color:#c0271f;margin-bottom:14px">🚩 RED FLAGS</div>
 {"".join(f'<div style="display:flex;gap:14px;align-items:flex-start;margin:24px 0;font-size:31px;line-height:1.3;color:#5a1a16">{flag("#c0271f")}<div>{t}</div></div>' for t in red)}
</div>
<div style="position:absolute;top:150px;left:610px;width:530px;background:#e6f4ea;border:4px solid #1e7f4f;border-radius:24px;padding:26px 28px;height:680px">
 <div style="font-size:40px;font-weight:800;color:#1e7f4f;margin-bottom:14px">✅ GREEN FLAGS</div>
 {"".join(f'<div style="display:flex;gap:14px;align-items:flex-start;margin:24px 0;font-size:31px;line-height:1.3;color:#0f3a2c">{flag("#1e7f4f")}<div>{t}</div></div>' for t in green)}
 </div>
<img src="{SUREJI}" style="position:absolute;right:60px;bottom:100px;width:210px">
<div style="position:absolute;left:60px;bottom:120px;width:800px;font-family:Impact,'Arial Black';font-size:54px;color:#14213d;text-transform:uppercase">Be the green flag. Check the pair.</div>
{FOOT}""")

# ---------------------------------------------------------------- M5: 11 years in the same drawer
m5 = page(f"""
<div style="position:absolute;inset:0;background:#2b1d0e"></div>
<svg viewBox="0 0 1200 1114" style="position:absolute;top:0;left:0;width:1200px;height:1114px">
 <rect x="0" y="0" width="1200" height="1114" fill="#3b2a16"/>
 <rect x="80" y="300" width="1040" height="520" rx="18" fill="#6b4a25" stroke="#2b1d0e" stroke-width="10"/>
 <rect x="110" y="330" width="980" height="460" rx="10" fill="#8a6230"/>
 <rect x="540" y="280" width="120" height="30" rx="10" fill="#c9a86a"/>
 <text x="600" y="150" text-anchor="middle" font-family="Impact,Arial Black" font-size="66" fill="#fff" style="text-transform:uppercase">CHEMIST'S DRAWER, OLD DELHI. YEAR 11.</text>
 <g transform="translate(200 540) scale(1.6)">{strip(0, 0, -6)}<text x="60" y="95" font-size="18" text-anchor="middle" font-weight="700" fill="#fff">Thyronorm</text></g>
 <g transform="translate(800 500)">{bottle(0, 0, "#b8742a", "Ashvagandha", 1.9)}<text x="57" y="250" text-anchor="middle" font-size="26" font-weight="700" fill="#fff">Ashwagandha</text></g>
 <g transform="translate(300 360)"><rect width="330" height="100" rx="16" fill="#fff"/><path d="M60 100 l-20 30 l40 -30" fill="#fff"/><text x="165" y="42" text-anchor="middle" font-size="26" font-weight="700" fill="#14213d">Hi. I'm Thyronorm.</text><text x="165" y="78" text-anchor="middle" font-size="26" font-weight="700" fill="#14213d">Have we met?</text></g>
 <g transform="translate(640 360)"><rect width="330" height="100" rx="16" fill="#fff"/><path d="M270 100 l20 30 l-40 -30" fill="#fff"/><text x="165" y="42" text-anchor="middle" font-size="26" font-weight="700" fill="#14213d">Ashwagandha. No…</text><text x="165" y="78" text-anchor="middle" font-size="26" font-weight="700" fill="#14213d">but we share a patient.</text></g>
 <text x="600" y="900" text-anchor="middle" font-family="Impact,Arial Black" font-size="58" fill="#ffc14d" style="text-transform:uppercase">SAME DRAWER. SAME PATIENT. NEVER INTRODUCED.</text>
 <text x="600" y="975" text-anchor="middle" font-size="34" fill="#fff">TakeSure introduces them. With a source. Before the first dose.</text>
</svg>
<img src="{SUREJI}" style="position:absolute;right:30px;top:130px;width:200px">
{FOOT}""")


# ---------------------------------------------------------------- M6: the real result screen vs the chatbot
SHOT = "file:///C:/Temp/bvp/deck/shots/04_result_amber.png"
m6 = page(f"""
<div style="position:absolute;inset:0;background:#fbf6ec"></div>
<div style="position:absolute;top:40px;left:0;width:1200px;text-align:center;font-family:Impact,'Arial Black';font-size:54px;color:#14213d;text-transform:uppercase;line-height:1.05">“Ashwagandha with my thyroid tablet,<br>safe hai?”</div>
<div style="position:absolute;top:190px;left:60px;width:520px">
 <div style="font-size:30px;font-weight:800;color:#c0271f;margin-bottom:10px">🤖 Random health chatbot</div>
 <div style="background:#fff;border:3px solid #e6dfd0;border-radius:22px;padding:26px;font-size:27px;line-height:1.45;color:#3e4450;height:660px">
  <p>“Great question! Ashwagandha is a <b>natural</b> adaptogen that may support thyroid health. Many people find it beneficial. However, individual results vary. Consider consulting a healthcare provider. Stay healthy! 🌿✨”</p>
  <div style="margin-top:28px;color:#c0271f;font-weight:700">Source: vibes.<br>Verdict: ¯\_(ツ)_/¯<br>Next time you ask: different answer.</div>
 </div>
</div>
<div style="position:absolute;top:190px;left:620px;width:520px">
 <div style="font-size:30px;font-weight:800;color:#0f5a43;margin-bottom:10px">✅ TakeSure (actual prototype)</div>
 <div style="border:3px solid #0f5a43;border-radius:22px;overflow:hidden;height:660px;background:#0b1f1a;box-shadow:0 20px 40px rgba(20,33,61,.2)"><img src="{SHOT}" style="width:150%;display:block;margin-top:-170px;margin-left:-20px"></div>
</div>
<div style="position:absolute;left:60px;bottom:120px;width:1080px;text-align:center;font-family:Impact,'Arial Black';font-size:48px;color:#14213d;text-transform:uppercase">One guesses. One cites <span style="color:#0f5a43">PMID 28829155</span>.</div>
{FOOT}""")

# ---------------------------------------------------------------- M7: "Not in database" — the rarest answer on the internet
m7 = page(f"""
<div style="position:absolute;inset:0;background:#0b1f1a"></div>
<div style="position:absolute;top:50px;left:0;width:1200px;text-align:center;font-family:Impact,'Arial Black';font-size:62px;color:#fff;text-transform:uppercase;line-height:1.1">Things you will never hear<br>a health app say</div>
<div style="position:absolute;top:240px;left:100px;width:1000px">
 {"".join(f'<div style="display:flex;align-items:center;gap:22px;background:rgba(255,255,255,.06);border:2px solid rgba(255,255,255,.12);border-radius:18px;padding:18px 26px;margin-bottom:18px;font-size:32px;color:#c9d9d2"><span style="font-size:40px">❌</span>{t}</div>' for t in ["“I don’t know.”", "“Here is the paper I got that from.”", "“This evidence is weak, so I will only say AMBER.”"])}
</div>
<div style="position:absolute;top:560px;left:100px;width:1000px;background:#263241;border:4px solid #aab8c8;border-radius:22px;padding:28px 32px">
 <div style="display:flex;align-items:center;gap:18px"><span style="background:#4b5563;color:#fff;font-weight:800;font-size:26px;padding:8px 16px;border-radius:10px">? NOT IN DATABASE</span><span style="font-size:30px;font-weight:700;color:#fff">Dolo 650 + Tulsi</span></div>
 <div style="font-size:26px;line-height:1.4;color:#dce3ea;margin-top:16px">We have no reviewed row for this pair. That is not a GREEN. Ask your pharmacist, and we have logged the gap for curation. — <i>actual TakeSure output</i></div>
</div>
<img src="{SUREJI}" style="position:absolute;right:50px;bottom:100px;width:230px">
<div style="position:absolute;left:100px;bottom:130px;width:800px;font-family:Impact,'Arial Black';font-size:50px;color:#3dd598;text-transform:uppercase;line-height:1.1">TakeSure says all three.<br><span style="color:#fff">We never guess green.</span></div>
{FOOT}""")

for name, h in (("meme6_chatbot_vs_prototype", m6), ("meme7_not_in_database", m7), ("meme1_koi_aur_dawa", m1), ("meme2_galaxy_brain", m2), ("meme3_relationship_status", m3), ("meme4_red_green_flags", m4), ("meme5_same_drawer", m5)):
    open(os.path.join(OUT, name + ".html"), "w", encoding="utf-8").write(h); print("wrote", name)
