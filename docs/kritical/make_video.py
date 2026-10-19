# -*- coding: utf-8 -*-
"""Assemble the TakeSure demo video (1280x720, H.264) from real screenshots with captions and a slow pan.
Each scene: (image path, headline, caption, seconds). Crossfades between scenes. No audio (a narration script is
provided separately); captions carry the message so the video stands alone."""
import os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import imageio.v2 as imageio

W, H, FPS = 1280, 720, 24
OUT = r"C:\Temp\bvp\video\TakeSure_Demo_KriticalHacks2026.mp4"
SHOTS = r"C:\Temp\bvp\deck\shots"
VID = r"C:\Temp\bvp\video"
F_H = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 34)
F_C = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 24)
F_S = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 18)
F_T = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 64)
F_T2 = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 30)

def card(bg, title, lines, sub=None):
    """Full-frame title card."""
    im = Image.new("RGB", (W, H), bg); d = ImageDraw.Draw(im)
    y = 200
    d.text((80, y), title, font=F_T, fill="#ffffff"); y += 95
    for ln in lines:
        d.text((82, y), ln, font=F_T2, fill="#d7e7df"); y += 46
    if sub: d.text((82, H - 90), sub, font=F_S, fill="#9fb3ad")
    return im

def fit(img_path, zoom=1.0, focus=(0.5, 0.0)):
    """Fit a screenshot into the frame area (above the caption bar), with optional zoom/focus."""
    im = Image.open(img_path).convert("RGB")
    area_w, area_h = W, H - 110
    scale = max(area_w / im.width, area_h / im.height) * zoom
    im = im.resize((int(im.width * scale), int(im.height * scale)), Image.LANCZOS)
    x = int((im.width - area_w) * focus[0]); y = int((im.height - area_h) * focus[1])
    return im.crop((x, y, x + area_w, y + area_h))

def scene_frames(img_path, head, cap, secs0, zoom_from=1.0, zoom_to=1.06, focus=(0.5, 0.0), step=None):
    secs = secs0 * 1.45
    n = int(secs * FPS); frames = []
    for i in range(n):
        t = i / max(1, n - 1); z = zoom_from + (zoom_to - zoom_from) * t
        shot = fit(img_path, z, focus)
        im = Image.new("RGB", (W, H), "#07150f"); im.paste(shot, (0, 0))
        d = ImageDraw.Draw(im)
        d.rectangle([0, H - 110, W, H], fill="#0b2a22")
        d.rectangle([0, H - 110, W, H - 106], fill="#3dd598")
        d.text((40, H - 96), head, font=F_H, fill="#ffffff")
        d.text((40, H - 50), cap, font=F_C, fill="#c9d9d2")
        if step: d.text((W - 40 - d.textlength(step, font=F_S), H - 40), step, font=F_S, fill="#9fb3ad")
        frames.append(np.asarray(im))
    return frames

def card_frames(im, secs):
    return [np.asarray(im)] * int(secs * 1.45 * FPS)

def crossfade(a, b, n=10):
    out = []
    for i in range(1, n + 1):
        t = i / (n + 1)
        out.append((a.astype(np.float32) * (1 - t) + b.astype(np.float32) * t).astype(np.uint8))
    return out

scenes = []
scenes.append(card_frames(card("#0b1f1a", "TakeSure", ["Confidence before taking something.", "Ayurveda × Allopathy herb–drug interaction checker.", "", "Team Bug Hunters · Kritical Hacks 2026 · AI/ML track"], "Verdict from published data; AI only explains."), 4))
scenes.append(card_frames(card("#14213d", "The problem", ["A thyroid patient on Thyronorm adds ashwagandha for stress.", "Her doctor never asks. The chemist has no tool. The label says nothing.", "Only 19% of Indian patients tell their doctor about the herbs they take.", "", "No public tool checks an Ayurvedic product against a prescription. Until now."]), 7))
scenes.append(scene_frames(os.path.join(SHOTS, "01_home.png"), "TakeSure — the web app", "Phone-first, Hindi + English, no account, photos deleted after reading.", 5, step="1 / 8"))
scenes.append(scene_frames(os.path.join(VID, "s_type.png"), "Step 1 · Scan or type", "Photograph the prescription and the product, or type the names. Here: Thyronorm + Ashwagandha.", 6, step="2 / 8"))
scenes.append(scene_frames(os.path.join(VID, "s_review.png"), "Step 2 · Review every name", "Thyronorm → levothyroxine via the Indian brand dictionary, score 100. Nothing is checked until the user confirms.", 6, step="3 / 8"))
scenes.append(scene_frames(os.path.join(SHOTS, "04_result_amber.png"), "Step 3 · The verdict", "AMBER — rule R3, severity moderate. The colour comes from a cited knowledge-base row, never from AI.", 7, zoom_from=1.0, zoom_to=1.08, step="4 / 8"))
scenes.append(scene_frames(os.path.join(VID, "s_sources.png"), "Evidence on every verdict", "Matched interaction, grade B, mechanism, management and the published sources with DOI / PMID.", 6, step="4 / 8"))
scenes.append(scene_frames(os.path.join(SHOTS, "05_result_hindi.png"), "Same answer in Hindi", "AI only rewrites the matched evidence: plain Hindi, plus three questions for the doctor.", 5, step="5 / 8"))
scenes.append(scene_frames(os.path.join(SHOTS, "06_result_red.png"), "RED when it matters", "Guggul + Warfarin: anticoagulant class escalation (rule R5). Unknown pairs are 'not in database', never green.", 5, step="5 / 8"))
scenes.append(scene_frames(os.path.join(SHOTS, "08_adr.png"), "One-tap reaction report", "Suspected-ADR form in the Ministry of Ayush format, exported as PDF for the Ayush Suraksha portal.", 4, step="6 / 8"))
scenes.append(card_frames(card("#2e1065", "TinyFish integration", ["TinyFish is our research assistant for the knowledge base.", "Fetch API verifies every citation · Search finds product pages", "Web Agent reads monographs and drafts candidate rows.", "", "Every draft is human-reviewed. The verdict path never touches the live web."], "Functional today — the next screens are live results from 19 Oct 2026"), 7))
scenes.append(scene_frames(os.path.join(VID, "s_curation.png"), "Evidence curation panel · TinyFish", "Live run: 55 of 78 citations verified automatically (page, Crossref, search). 23 flagged for a reviewer, 3 dead links caught.", 8, zoom_from=1.0, zoom_to=1.05, step="7 / 8"))
scenes.append(scene_frames(os.path.join(VID, "s_drafts.png"), "Draft queue · approve or reject", "Discover: 7 candidate interactions for ashwagandha, 4 for turmeric, drafted from MSKCC in seconds. Dabur Giloy Ghanvati mapped to its herb by a Web Agent run.", 8, step="7 / 8"))
scenes.append(scene_frames(os.path.join(SHOTS, "09_dashboard.jpg"), "Ministry dashboard", "Anonymised co-use analytics, verdict trends and ADR reports — the signal the pharmacovigilance network lacks today.", 5, step="8 / 8"))
scenes.append(card_frames(card("#0b1f1a", "Why it is different", ["Verdict from published data; AI only explains.", "Indian brands, Sanskrit / Hindi synonyms, Hindi explanations.", "Honest by design: evidence grades, timing gaps, 'not in database'.", "TinyFish-assisted, human-approved knowledge base.", "", "Pehle check karo, phir lo."], "github.com/<your-repo>  ·  Team Bug Hunters: Dhriti Garg · Shiwani Goyal · Khushi Gupta"), 7))

frames = []
for i, sc in enumerate(scenes):
    if frames:
        frames += crossfade(frames[-1], sc[0])
    frames += sc
print("frames", len(frames), "duration", round(len(frames) / FPS, 1), "s")
w = imageio.get_writer(OUT, fps=FPS, codec="libx264", quality=7, macro_block_size=None, ffmpeg_params=["-pix_fmt", "yuv420p"])
for f in frames:
    w.append_data(f)
w.close()
print("written", OUT, round(os.path.getsize(OUT) / 1e6, 1), "MB")
