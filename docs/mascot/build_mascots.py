# -*- coding: utf-8 -*-
"""Four TakeSure mascot concepts as original flat-vector characters."""
import os
OUT = r"C:\Temp\bvp\mascot\out"; os.makedirs(OUT, exist_ok=True)
EM, EM2, MINT, SAF, SAF2, INK, WHITE, SKIN, BROWN, BROWN2, GREY, RED = "#0f5a43", "#167a5b", "#3dd598", "#f4a300", "#ffc14d", "#14213d", "#ffffff", "#f3c9a3", "#8a5a2b", "#b07a3e", "#c9cfd6", "#d9332b"

def eyes(x1, x2, y, r=11, pupil=5, shine=True):
    s = ""
    for x in (x1, x2):
        s += '<circle cx="%g" cy="%g" r="%g" fill="%s"/><circle cx="%g" cy="%g" r="%g" fill="%s"/>' % (x, y, r, WHITE, x + 1.5, y + 1.5, pupil, INK)
        if shine: s += '<circle cx="%g" cy="%g" r="%g" fill="%s"/>' % (x - 2, y - 2.5, 2, WHITE)
    return s
def smile(cx, cy, w, d=10, col=INK, sw=4):
    return '<path d="M%g %g Q%g %g %g %g" stroke="%s" stroke-width="%g" fill="none" stroke-linecap="round"/>' % (cx - w / 2, cy, cx, cy + d, cx + w / 2, cy, col, sw)
def cheeks(x1, x2, y): return '<circle cx="%g" cy="%g" r="7" fill="#ff8c8c" opacity=".55"/><circle cx="%g" cy="%g" r="7" fill="#ff8c8c" opacity=".55"/>' % (x1, y, x2, y)
def glasses(x1, x2, y, r=17, col=INK):
    return ('<circle cx="%g" cy="%g" r="%g" fill="none" stroke="%s" stroke-width="4"/><circle cx="%g" cy="%g" r="%g" fill="none" stroke="%s" stroke-width="4"/><path d="M%g %g h%g" stroke="%s" stroke-width="4"/>'
            % (x1, y, r, col, x2, y, r, col, x1 + r, y, x2 - x1 - 2 * r, col))

# ------------------------------------------------------------ 1. Sure-ji — the capsule elder
def sureji():
    g = ""
    # shadow
    g += '<ellipse cx="200" cy="372" rx="90" ry="12" fill="%s" opacity=".12"/>' % INK
    # body capsule: top saffron, bottom emerald leaf
    g += '<path d="M120 150 a80 80 0 0 1 160 0 v60 h-160 z" fill="%s"/>' % SAF
    g += '<path d="M120 210 h160 v60 a80 80 0 0 1 -160 0 z" fill="%s"/>' % EM
    g += '<rect x="120" y="206" width="160" height="8" fill="%s"/>' % WHITE
    g += '<path d="M140 150 a60 60 0 0 1 40 -60" stroke="%s" stroke-width="10" fill="none" stroke-linecap="round" opacity=".5"/>' % WHITE
    # leaf veins on lower half
    g += '<path d="M200 222 V320 M200 250 l-28 22 M200 250 l28 22 M200 282 l-22 18 M200 282 l22 18" stroke="%s" stroke-width="6" stroke-linecap="round" fill="none"/>' % MINT
    # face
    g += eyes(172, 228, 150, 13, 6) + glasses(172, 228, 150, 21, INK) + cheeks(152, 248, 170)
    g += '<path d="M168 178 q16 10 32 0 q16 10 32 0" stroke="%s" stroke-width="7" fill="none" stroke-linecap="round"/>' % INK  # moustache
    g += smile(200, 190, 36, 10, INK, 4)
    # eyebrows (kind)
    g += '<path d="M156 126 q16 -8 32 0 M212 126 q16 -8 32 0" stroke="%s" stroke-width="5" fill="none" stroke-linecap="round"/>' % INK
    # arms: left holds clipboard
    g += '<path d="M122 240 q-40 10 -42 60" stroke="%s" stroke-width="18" fill="none" stroke-linecap="round"/>' % EM
    g += '<rect x="40" y="275" width="70" height="90" rx="8" fill="%s" stroke="%s" stroke-width="4" transform="rotate(-8 75 320)"/>' % (WHITE, INK)
    g += '<rect x="58" y="268" width="34" height="14" rx="4" fill="%s" transform="rotate(-8 75 320)"/>' % SAF
    g += '<path d="M52 310 l10 10 l22 -24" stroke="%s" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round" transform="rotate(-8 75 320)"/>' % EM
    g += '<path d="M52 340 h40 M52 352 h30" stroke="%s" stroke-width="4" stroke-linecap="round" transform="rotate(-8 75 320)"/>' % GREY
    # right arm raised with index finger ("pehle check!")
    g += '<path d="M278 240 q50 -10 60 -60" stroke="%s" stroke-width="18" fill="none" stroke-linecap="round"/>' % EM
    g += '<circle cx="340" cy="176" r="16" fill="%s"/><path d="M344 164 v-28" stroke="%s" stroke-width="12" stroke-linecap="round"/>' % (EM, EM)
    # feet
    g += '<ellipse cx="168" cy="356" rx="26" ry="12" fill="%s"/><ellipse cx="232" cy="356" rx="26" ry="12" fill="%s"/>' % (INK, INK)
    return g

# ------------------------------------------------------------ 2. Dadi Tulsi — the grandmother leaf
def dadi():
    g = '<ellipse cx="200" cy="372" rx="100" ry="12" fill="%s" opacity=".12"/>' % INK
    # big leaf body
    g += '<path d="M200 48 C300 90 330 200 270 300 C250 335 225 352 200 362 C175 352 150 335 130 300 C70 200 100 90 200 48 Z" fill="%s"/>' % EM2
    g += '<path d="M200 70 V340 M200 150 l-48 40 M200 150 l48 40 M200 210 l-42 36 M200 210 l42 36 M200 270 l-30 26 M200 270 l30 26" stroke="%s" stroke-width="6" stroke-linecap="round" fill="none" opacity=".9"/>' % MINT
    # hair bun + sprout
    g += '<circle cx="200" cy="60" r="34" fill="%s"/><circle cx="200" cy="60" r="22" fill="#b9bfc7"/>' % GREY
    g += '<path d="M200 30 q10 -22 26 -18 q-6 14 -26 18 M200 30 q-10 -22 -26 -18 q6 14 26 18" fill="%s"/>' % MINT
    # face (on the leaf)
    g += '<ellipse cx="200" cy="160" rx="70" ry="62" fill="%s"/>' % SKIN
    g += '<circle cx="200" cy="118" r="7" fill="%s"/>' % RED  # bindi
    g += eyes(174, 226, 152, 12, 5) + glasses(174, 226, 152, 20, "#5b3a1a") + cheeks(150, 250, 176)
    g += '<path d="M154 156 q-18 24 -8 56 M246 156 q18 24 8 56" stroke="#5b3a1a" stroke-width="3" fill="none" opacity=".7"/>'  # spectacle chain
    g += smile(200, 190, 40, 12, "#7a3b2e", 4)
    g += '<path d="M158 128 q16 -10 34 -2 M208 126 q18 -8 34 2" stroke="#5b3a1a" stroke-width="4" fill="none" stroke-linecap="round"/>'
    # shawl (saffron pallu)
    g += '<path d="M120 268 C150 250 250 250 280 268 L270 300 C240 285 160 285 130 300 Z" fill="%s"/>' % SAF
    g += '<path d="M128 290 l6 12 M144 286 l6 12 M160 284 l6 12 M176 283 l6 12 M192 283 l6 12 M208 283 l6 12 M224 284 l6 12 M240 286 l6 12 M256 290 l6 12" stroke="%s" stroke-width="3" stroke-linecap="round"/>' % SAF2
    # arms + magnifying glass
    g += '<path d="M135 240 q-45 10 -50 60" stroke="%s" stroke-width="16" fill="none" stroke-linecap="round"/>' % EM2
    g += '<path d="M265 240 q45 0 60 -40" stroke="%s" stroke-width="16" fill="none" stroke-linecap="round"/>' % EM2
    g += '<circle cx="340" cy="150" r="34" fill="#dff3ff" stroke="%s" stroke-width="8" opacity=".95"/><path d="M316 176 l-30 32" stroke="%s" stroke-width="14" stroke-linecap="round"/>' % (BROWN, BROWN)
    g += '<path d="M330 140 l8 8 l16 -18" stroke="%s" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' % EM
    g += '<circle cx="85" cy="302" r="14" fill="%s"/>' % SKIN
    g += '<circle cx="86" cy="302" r="18" fill="none" stroke="%s" stroke-width="4"/>' % SAF  # bangle
    return g

# ------------------------------------------------------------ 3. Chiku the Mongoose — the herb detective
def chiku():
    g = '<ellipse cx="200" cy="372" rx="110" ry="12" fill="%s" opacity=".12"/>' % INK
    # tail
    g += '<path d="M268 300 C340 310 360 250 330 220 C318 208 300 220 310 236 C322 254 300 282 262 272" fill="%s"/>' % BROWN
    g += '<path d="M300 236 q8 -10 -4 -16 M322 260 q10 -8 2 -18" stroke="%s" stroke-width="6" fill="none" stroke-linecap="round"/>' % BROWN2
    # body
    g += '<ellipse cx="200" cy="270" rx="78" ry="90" fill="%s"/>' % BROWN
    # lab coat
    g += '<path d="M150 215 L200 300 L250 215 L262 340 L138 340 Z" fill="%s"/>' % WHITE
    g += '<path d="M200 300 L186 215 M200 300 L214 215" stroke="%s" stroke-width="3"/>' % GREY
    g += '<circle cx="200" cy="318" r="4" fill="%s"/><circle cx="200" cy="334" r="4" fill="%s"/>' % (INK, INK)
    g += '<rect x="214" y="236" width="26" height="30" rx="3" fill="%s"/><rect x="220" y="230" width="14" height="10" rx="2" fill="%s"/>' % (MINT, EM)  # pocket with capsule
    g += '<rect x="220" y="244" width="14" height="6" rx="3" fill="%s"/>' % SAF
    # head
    g += '<ellipse cx="200" cy="150" rx="72" ry="62" fill="%s"/>' % BROWN
    g += '<ellipse cx="200" cy="172" rx="48" ry="34" fill="#e9c9a0"/>'  # muzzle
    g += '<ellipse cx="140" cy="108" rx="16" ry="20" fill="%s"/><ellipse cx="260" cy="108" rx="16" ry="20" fill="%s"/>' % (BROWN, BROWN)
    g += '<ellipse cx="140" cy="110" rx="8" ry="12" fill="#e9c9a0"/><ellipse cx="260" cy="110" rx="8" ry="12" fill="#e9c9a0"/>'
    # mask stripe (detective look)
    g += '<path d="M138 142 q62 -30 124 0 q-62 20 -124 0 z" fill="%s" opacity=".9"/>' % BROWN2
    g += eyes(174, 226, 142, 13, 6) + '<ellipse cx="200" cy="166" rx="9" ry="6" fill="%s"/>' % INK + smile(200, 180, 30, 8, INK, 4)
    g += '<path d="M148 176 h-26 M148 184 h-24 M252 176 h26 M252 184 h24" stroke="%s" stroke-width="2.5" stroke-linecap="round"/>' % INK  # whiskers
    # leaf behind ear
    g += '<path d="M262 92 C290 70 320 70 334 86 C318 104 290 108 262 92 Z" fill="%s"/><path d="M268 92 L328 88" stroke="%s" stroke-width="3"/>' % (MINT, EM)
    # arms: one holds magnifier over a capsule, other a leaf
    g += '<path d="M132 250 q-40 20 -40 60" stroke="%s" stroke-width="16" fill="none" stroke-linecap="round"/>' % BROWN
    g += '<circle cx="90" cy="320" r="30" fill="#dff3ff" stroke="%s" stroke-width="7"/><path d="M70 342 l-22 22" stroke="%s" stroke-width="12" stroke-linecap="round"/>' % (INK, INK)
    g += '<rect x="76" y="312" width="30" height="14" rx="7" fill="%s" transform="rotate(-30 91 319)"/><path d="M91 310 l0 18" stroke="%s" stroke-width="2" transform="rotate(-30 91 319)"/>' % (SAF, WHITE)
    g += '<path d="M268 250 q40 20 40 60" stroke="%s" stroke-width="16" fill="none" stroke-linecap="round"/>' % BROWN
    # feet
    g += '<ellipse cx="172" cy="356" rx="24" ry="11" fill="%s"/><ellipse cx="228" cy="356" rx="24" ry="11" fill="%s"/>' % (BROWN2, BROWN2)
    return g

# ------------------------------------------------------------ 4. Tikku — the tick-mark kid
def tikku():
    g = '<ellipse cx="200" cy="372" rx="90" ry="12" fill="%s" opacity=".12"/>' % INK
    # tick body (thick stroke)
    g += '<path d="M110 236 L178 310 L300 150" stroke="%s" stroke-width="64" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' % MINT
    g += '<path d="M110 236 L178 310 L300 150" stroke="%s" stroke-width="44" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' % "#5fe3ad"
    # face on the long arm
    g += eyes(214, 250, 236, 13, 6) + cheeks(200, 268, 256) + smile(234, 262, 34, 12, INK, 4)
    g += '<path d="M200 214 q14 -10 28 -2 M236 212 q14 -8 28 2" stroke="%s" stroke-width="4" fill="none" stroke-linecap="round"/>' % INK
    # cap: saffron cap with a capsule badge
    g += '<g transform="translate(296 154) rotate(37)"><path d="M-46 0 A46 46 0 0 1 46 0 Z" fill="%s"/><path d="M-50 0 H62" stroke="%s" stroke-width="13" stroke-linecap="round"/><rect x="-14" y="-32" width="28" height="12" rx="6" fill="%s"/><rect x="-14" y="-32" width="14" height="12" rx="6" fill="%s"/></g>' % (SAF, SAF2, EM, WHITE)
    # arms (stick) waving + holding a leaf
    g += '<path d="M126 262 q-40 -30 -56 -70" stroke="%s" stroke-width="12" fill="none" stroke-linecap="round"/>' % EM
    g += '<path d="M70 192 C60 160 80 134 110 130 C112 160 96 184 70 192 Z" fill="%s"/><path d="M74 188 L106 136" stroke="%s" stroke-width="3"/>' % (EM2, MINT)
    g += '<path d="M292 194 q50 10 60 50" stroke="%s" stroke-width="12" fill="none" stroke-linecap="round"/>' % EM
    g += '<rect x="330" y="224" width="36" height="16" rx="8" fill="%s" transform="rotate(30 348 232)"/><rect x="330" y="224" width="18" height="16" rx="8" fill="%s" transform="rotate(30 348 232)"/>' % (SAF, WHITE)
    # legs + sneakers
    g += '<path d="M166 318 v30 M196 318 v30" stroke="%s" stroke-width="12" stroke-linecap="round"/>' % EM
    g += '<path d="M146 354 h40 a8 8 0 0 1 0 14 h-40 z M186 354 h40 a8 8 0 0 1 0 14 h-40 z" fill="%s"/>' % SAF
    g += '<path d="M150 356 h30 M190 356 h30" stroke="%s" stroke-width="3"/>' % WHITE
    # speech bubble
    g += '<path d="M20 40 h170 a14 14 0 0 1 14 14 v44 a14 14 0 0 1 -14 14 h-110 l-22 22 v-22 h-38 a14 14 0 0 1 -14 -14 v-44 a14 14 0 0 1 14 -14 z" fill="%s" stroke="%s" stroke-width="3"/>' % (WHITE, INK)
    g += '<text x="112" y="82" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-weight="700" font-size="26" fill="%s">Pehle check!</text>' % INK
    return g


# ------------------------------------------------------------ 5. Shikari — the Bug Hunter on duty
def shikari():
    g = '<ellipse cx="200" cy="378" rx="96" ry="12" fill="%s" opacity=".12"/>' % INK
    # body: capsule top saffron, leaf bottom emerald
    g += '<path d="M130 170 a70 70 0 0 1 140 0 v50 h-140 z" fill="%s"/>' % SAF
    g += '<path d="M130 220 h140 v60 a70 70 0 0 1 -140 0 z" fill="%s"/>' % EM
    g += '<rect x="130" y="216" width="140" height="8" fill="%s"/>' % WHITE
    g += '<path d="M200 232 V330 M200 256 l-24 20 M200 256 l24 20 M200 288 l-18 16 M200 288 l18 16" stroke="%s" stroke-width="6" stroke-linecap="round" fill="none"/>' % MINT
    # Bug Hunters badge on chest
    g += '<path d="M246 236 l22 8 v16 c0 12 -9 20 -22 24 c-13 -4 -22 -12 -22 -24 v-16 z" fill="%s" stroke="%s" stroke-width="3"/>' % (WHITE, INK)
    g += '<text x="246" y="264" text-anchor="middle" font-family="Bahnschrift, Segoe UI, Arial, sans-serif" font-weight="700" font-size="15" fill="%s">BH</text>' % INK
    # face
    g += eyes(176, 224, 172, 13, 6) + cheeks(156, 244, 192)
    g += '<circle cx="224" cy="172" r="22" fill="none" stroke="%s" stroke-width="4"/><path d="M244 184 l10 16" stroke="%s" stroke-width="4" stroke-linecap="round"/>' % (INK, INK)  # monocle
    g += '<path d="M160 150 q16 -10 32 -2 M212 146 q16 -8 32 4" stroke="%s" stroke-width="5" fill="none" stroke-linecap="round"/>' % INK
    g += '<path d="M178 200 q22 16 44 0" stroke="%s" stroke-width="4" fill="none" stroke-linecap="round"/>' % INK
    # safari hat
    g += '<ellipse cx="200" cy="116" rx="98" ry="20" fill="#c9a86a"/><path d="M140 112 a60 44 0 0 1 120 0 z" fill="#d9bb7e"/><path d="M142 112 h116" stroke="%s" stroke-width="10"/>' % SAF
    g += '<path d="M150 112 a50 36 0 0 1 100 0" stroke="#b08d4e" stroke-width="3" fill="none"/>'
    # left arm holding net
    g += '<path d="M132 250 q-50 -10 -70 -70" stroke="%s" stroke-width="18" fill="none" stroke-linecap="round"/>' % EM
    g += '<path d="M62 180 L92 66" stroke="#8a5a2b" stroke-width="9" stroke-linecap="round"/>'
    g += '<ellipse cx="114" cy="46" rx="46" ry="30" fill="#e8f7ff" fill-opacity=".55" stroke="%s" stroke-width="5" transform="rotate(-20 114 46)"/>' % INK
    g += '<path d="M80 10 l76 18 M78 24 l78 2 M84 36 l72 -14 M104 -6 l10 54 M124 -8 l0 56 M142 -4 l-14 48" stroke="%s" stroke-width="1.5" opacity=".5" transform="rotate(-20 114 46)"/>' % INK
    # the interaction bug caught in the net (red bug, half pill half leaf pattern)
    g += '<g transform="translate(118 44) rotate(-20)"><ellipse cx="0" cy="0" rx="16" ry="12" fill="%s"/><path d="M-6 -12 v24" stroke="%s" stroke-width="2"/><ellipse cx="7" cy="0" rx="6" ry="4" fill="%s"/><circle cx="-18" cy="-2" r="6" fill="%s"/><path d="M-22 -8 l-6 -8 M-16 -8 l2 -10" stroke="%s" stroke-width="2" stroke-linecap="round"/><circle cx="-20" cy="-3" r="1.6" fill="%s"/><path d="M-4 10 l-6 8 M4 10 l6 8 M-10 6 l-10 4 M10 6 l10 4" stroke="%s" stroke-width="2" stroke-linecap="round"/></g>' % (RED, "#8a1f17", MINT, INK, INK, WHITE, INK)
    # right arm: thumbs up
    g += '<path d="M268 250 q46 0 60 -46" stroke="%s" stroke-width="18" fill="none" stroke-linecap="round"/>' % EM
    g += '<circle cx="330" cy="200" r="15" fill="%s"/><path d="M336 188 q4 -24 -6 -28 q-8 2 -6 26" fill="%s"/>' % (EM, EM)
    # boots
    g += '<path d="M150 346 h44 a10 10 0 0 1 0 20 h-52 z M206 346 h44 a10 10 0 0 1 10 20 h-54 z" fill="#5b3a1a"/>'
    g += '<path d="M150 352 h40 M210 352 h40" stroke="%s" stroke-width="3"/>' % SAF
    return g

MASCOTS = {"5_shikari": ("Shikari", shikari), "1_sureji": ("Sure-ji", sureji), "2_daditulsi": ("Dadi Tulsi", dadi), "3_chiku": ("Chiku the Mongoose", chiku), "4_tikku": ("Tikku", tikku)}

def svg(inner, bg=None):
    bgr = '<rect width="400" height="400" rx="40" fill="%s"/>' % bg if bg else ""
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">%s%s</svg>' % (bgr, inner)
def card(inner, name, tag):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480" width="400" height="480"><rect width="400" height="480" rx="40" fill="#0b2a22"/>'
            '<circle cx="200" cy="200" r="150" fill="#113b31"/>%s'
            '<text x="200" y="430" text-anchor="middle" font-family="Bahnschrift, Segoe UI, Arial, sans-serif" font-weight="700" font-size="34" fill="#ffffff">%s</text>'
            '<text x="200" y="458" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="15" fill="#9fb3ad" letter-spacing="2">%s</text></svg>') % (inner, name, tag)
def page(markup, bg):
    return ('<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:%s;width:100%%;height:100%%;overflow:hidden}svg{display:block;width:100%%;height:100%%}</style></head><body>%s</body></html>' % (bg, markup))

TAGS = {"5_shikari": "BUG HUNTER ON DUTY", "1_sureji": "THE ONE WHO CHECKS FIRST", "2_daditulsi": "WISDOM, NOW WITH SOURCES", "3_chiku": "THE HERB DETECTIVE", "4_tikku": "PEHLE CHECK!"}
for key, (name, fn) in MASCOTS.items():
    inner = fn()
    open(os.path.join(OUT, f"{key}.svg"), "w", encoding="utf-8").write(svg(inner))
    open(os.path.join(OUT, f"page_{key}_transparent.html"), "w", encoding="utf-8").write(page(svg(inner), "transparent"))
    open(os.path.join(OUT, f"page_{key}_card.html"), "w", encoding="utf-8").write(page(card(inner, name, TAGS[key]), "transparent"))
    print("built", name)
