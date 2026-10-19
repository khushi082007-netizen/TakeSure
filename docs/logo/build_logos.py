# -*- coding: utf-8 -*-
"""TakeSure logo concepts -> SVG files + HTML render pages (transparent / dark / light, mark-only and lockup)."""
import os
OUT = r"C:\Temp\bvp\logo\out"; os.makedirs(OUT, exist_ok=True)

EM, EM2, MINT, SAF, SAF2, INK, WHITE = "#0f5a43", "#167a5b", "#3dd598", "#f4a300", "#ffc14d", "#14213d", "#ffffff"

def leaf(x0, y0, x1, y1, w, fill, rib=None, rib_w=6):
    """Leaf from (x0,y0) base to (x1,y1) tip; w = max half-width. Returns svg string."""
    import math
    dx, dy = x1 - x0, y1 - y0; L = math.hypot(dx, dy); ux, uy = dx / L, dy / L; px, py = -uy, ux
    # control points at 45% along, offset by w
    cx, cy = x0 + ux * L * 0.45, y0 + uy * L * 0.45
    a1 = (cx + px * w, cy + py * w); a2 = (cx - px * w, cy - py * w)
    d = "M%.1f %.1f Q%.1f %.1f %.1f %.1f Q%.1f %.1f %.1f %.1f Z" % (x0, y0, a1[0], a1[1], x1, y1, a2[0], a2[1], x0, y0)
    s = '<path d="%s" fill="%s"/>' % (d, fill)
    if rib:
        s += '<path d="M%.1f %.1f L%.1f %.1f" stroke="%s" stroke-width="%d" stroke-linecap="round" fill="none"/>' % (x0 + ux * L * 0.08, y0 + uy * L * 0.08, x0 + ux * L * 0.9, y0 + uy * L * 0.9, rib, rib_w)
        for t in (0.3, 0.5, 0.7):
            bx, by = x0 + ux * L * t, y0 + uy * L * t; ln = w * (1 - abs(t - 0.45)) * 0.9
            s += '<path d="M%.1f %.1f L%.1f %.1f M%.1f %.1f L%.1f %.1f" stroke="%s" stroke-width="%d" stroke-linecap="round" opacity=".8"/>' % (
                bx, by, bx + (ux * 0.5 + px) * ln * 0.75, by + (uy * 0.5 + py) * ln * 0.75, bx, by, bx + (ux * 0.5 - px) * ln * 0.75, by + (uy * 0.5 - py) * ln * 0.75, rib, max(3, rib_w - 2))
    return s

def check(cx, cy, r, bg, fg, sw=None):
    sw = sw or r * 0.22
    return ('<circle cx="%g" cy="%g" r="%g" fill="%s"/>'
            '<path d="M%g %g L%g %g L%g %g" stroke="%s" stroke-width="%g" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'
            % (cx, cy, r, bg, cx - r * 0.42, cy + r * 0.02, cx - r * 0.1, cy + r * 0.34, cx + r * 0.46, cy - r * 0.3, fg, sw))

# ------------------------------------------------------------------ Concept A: The verified pair (capsule half + leaf half)
def mark_A():
    g = '<g transform="rotate(-28 200 200)">'
    g += '<path d="M78 200 a52 52 0 0 1 52 -52 h70 v104 h-70 a52 52 0 0 1 -52 -52 z" fill="%s"/>' % SAF
    g += '<rect x="130" y="148" width="20" height="104" fill="%s" opacity=".35"/>' % WHITE  # highlight band
    g += '<rect x="196" y="148" width="8" height="104" fill="%s"/>' % WHITE  # divider
    g += '<path d="M204 148 C280 148 322 172 340 200 C322 228 280 252 204 252 Z" fill="%s"/>' % EM
    g += '<path d="M212 200 L328 200" stroke="%s" stroke-width="7" stroke-linecap="round"/>' % MINT
    for x, ln in ((238, 26), (266, 22), (294, 14)):
        g += '<path d="M%d 200 l%d -%d M%d 200 l%d %d" stroke="%s" stroke-width="5" stroke-linecap="round"/>' % (x, ln * 0.8, ln, x, ln * 0.8, ln, MINT)
    g += '</g>'
    g += check(300, 300, 46, WHITE, EM, 12)
    g += '<circle cx="300" cy="300" r="46" fill="none" stroke="%s" stroke-width="8"/>' % EM
    return g

# ------------------------------------------------------------------ Concept B: Shield of two systems (capsule + leaf form a tick)
def mark_B():
    g = '<path d="M200 30 L336 78 V188 C336 282 272 344 200 372 C128 344 64 282 64 188 V78 Z" fill="%s"/>' % EM
    g += '<path d="M200 56 L312 96 V188 C312 268 258 320 200 346 C142 320 88 268 88 188 V96 Z" fill="none" stroke="%s" stroke-width="6" opacity=".35"/>' % MINT
    # short arm: capsule
    g += '<path d="M118 206 L176 264" stroke="%s" stroke-width="46" stroke-linecap="round"/>' % SAF
    g += '<path d="M126 214 L150 238" stroke="%s" stroke-width="12" stroke-linecap="round" opacity=".45"/>' % WHITE
    # long arm: leaf
    g += leaf(176, 268, 302, 116, 40, MINT, rib=EM, rib_w=7)
    return g

# ------------------------------------------------------------------ Concept C: The verdict ring (green/amber/red) around the pair
def mark_C():
    import math
    def arc(a0, a1, color, r=160, cx=200, cy=200, sw=30):
        x0, y0 = cx + r * math.cos(math.radians(a0)), cy + r * math.sin(math.radians(a0))
        x1, y1 = cx + r * math.cos(math.radians(a1)), cy + r * math.sin(math.radians(a1))
        large = 1 if (a1 - a0) % 360 > 180 else 0
        return '<path d="M%.1f %.1f A%d %d 0 %d 1 %.1f %.1f" stroke="%s" stroke-width="%d" fill="none" stroke-linecap="round"/>' % (x0, y0, r, r, large, x1, y1, color, sw)
    g = arc(-60, 150, "#2fa872") + arc(158, 232, "#f4a300") + arc(240, 292, "#d9332b")
    inner = '<g transform="translate(200 200) scale(.56) translate(-200 -200)">' + mark_A().replace(check(300, 300, 46, WHITE, EM, 12), "").replace('<circle cx="300" cy="300" r="46" fill="none" stroke="%s" stroke-width="8"/>' % EM, "") + '</g>'
    return g + inner + check(200, 318, 36, WHITE, EM, 10) + '<circle cx="200" cy="318" r="36" fill="none" stroke="%s" stroke-width="7"/>' % EM

# ------------------------------------------------------------------ Concept D: Seed / drop split in two systems with a cut-out tick (app-icon style)
def mark_D():
    g = '<path d="M200 36 C200 36 76 150 76 240 A124 124 0 0 0 324 240 C324 150 200 36 200 36 Z" fill="%s"/>' % EM
    g += '<path d="M200 36 C200 36 76 150 76 240 A124 124 0 0 0 200 364 Z" fill="%s"/>' % SAF
    g += '<path d="M200 36 V364" stroke="%s" stroke-width="10" stroke-linecap="round" opacity=".9"/>' % WHITE
    g += '<path d="M138 248 L184 294 L268 196" stroke="%s" stroke-width="30" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' % WHITE
    return g

MARKS = {"A": ("The verified pair", mark_A), "B": ("Shield of two systems", mark_B), "C": ("The verdict ring", mark_C), "D": ("One seed, two systems", mark_D)}

def svg(inner, w=400, h=400, vb="0 0 400 400"):
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="%s" width="%d" height="%d">%s</svg>' % (vb, w, h, inner)

def lockup(inner, dark):
    ink = WHITE if dark else INK; sub = "#9fb3ad" if dark else "#5d6166"
    g = '<g transform="translate(40 60) scale(.95)">' + inner + '</g>'
    g += ('<text x="470" y="236" font-family="Bahnschrift, Segoe UI, Arial, sans-serif" font-weight="700" font-size="150" fill="%s" letter-spacing="-3">Take<tspan fill="%s">Sure</tspan></text>' % (ink, MINT if dark else EM))
    g += ('<text x="474" y="300" font-family="Segoe UI, Arial, sans-serif" font-size="34" fill="%s" letter-spacing="4.5">CONFIDENCE BEFORE TAKING SOMETHING</text>' % sub)
    return svg(g, 1400, 440, "0 0 1400 440")

def page(svg_markup, bg):
    return ('<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:%s;width:100%%;height:100%%;overflow:hidden}'
            'svg{display:block;width:100%%;height:100%%}</style></head><body>%s</body></html>' % (bg, svg_markup))

for key, (title, fn) in MARKS.items():
    inner = fn()
    open(os.path.join(OUT, f"takesure_{key}_mark.svg"), "w", encoding="utf-8").write(svg(inner))
    open(os.path.join(OUT, f"takesure_{key}_lockup_dark.svg"), "w", encoding="utf-8").write(lockup(inner, True))
    open(os.path.join(OUT, f"takesure_{key}_lockup_light.svg"), "w", encoding="utf-8").write(lockup(inner, False))
    # render pages
    open(os.path.join(OUT, f"page_{key}_mark_transparent.html"), "w", encoding="utf-8").write(page(svg(inner), "transparent"))
    open(os.path.join(OUT, f"page_{key}_mark_dark.html"), "w", encoding="utf-8").write(page(svg(inner), "#0b1f1a"))
    open(os.path.join(OUT, f"page_{key}_lockup_dark.html"), "w", encoding="utf-8").write(page(lockup(inner, True), "#0b1f1a"))
    open(os.path.join(OUT, f"page_{key}_lockup_light.html"), "w", encoding="utf-8").write(page(lockup(inner, False), "#ffffff"))
    tile = svg('<rect x="0" y="0" width="400" height="400" rx="88" fill="%s"/><g transform="translate(200 200) scale(.78) translate(-200 -200)">%s</g>' % ("#0b2a22", inner))
    open(os.path.join(OUT, f"page_{key}_appicon.html"), "w", encoding="utf-8").write(page(tile, "transparent"))
    print("built", key, title)
