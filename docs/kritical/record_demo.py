# -*- coding: utf-8 -*-
"""Record a human-looking walkthrough of the live TakeSure site: real browser, visible cursor, typing, clicks, scrolling.
Output: a .webm from Playwright's recorder, converted to MP4 by make_mp4()."""
import asyncio, glob, os, shutil, subprocess, time
from playwright.async_api import async_playwright

BASE = "http://localhost:3000"
OUT_DIR = r"C:\Temp\bvp\video\rec"
W, H = 1280, 800

CURSOR_JS = """
(() => {
  if (window.__cur) return;
  const c = document.createElement('div'); window.__cur = c;
  c.style.cssText = 'position:fixed;left:0;top:0;width:22px;height:22px;z-index:2147483647;pointer-events:none;transform:translate(-3px,-2px);';
  c.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 2 L4 19 L8.5 15 L11.5 21.5 L14.5 20 L11.5 13.8 L17.5 13.8 Z" fill="#fff" stroke="#000" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  const r = document.createElement('div'); window.__rip = r;
  r.style.cssText = 'position:fixed;width:36px;height:36px;border-radius:50%;border:3px solid #3dd598;z-index:2147483646;pointer-events:none;opacity:0;transform:translate(-50%,-50%) scale(.4);transition:opacity .35s, transform .35s;';
  const add = () => { document.body.appendChild(c); document.body.appendChild(r); };
  if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
  window.addEventListener('mousemove', e => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; }, true);
  window.addEventListener('mousedown', e => { r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px'; r.style.opacity = '1'; r.style.transform = 'translate(-50%,-50%) scale(1)'; setTimeout(() => { r.style.opacity = '0'; r.style.transform = 'translate(-50%,-50%) scale(.4)'; }, 350); }, true);
})();
"""

async def glide(page, x, y, steps=28):
    await page.mouse.move(x, y, steps=steps)

async def click_text(page, selector_text, role="button", settle=1.2, exact=False):
    loc = page.get_by_role(role, name=selector_text, exact=exact).first
    await loc.scroll_into_view_if_needed()
    box = await loc.bounding_box()
    await glide(page, box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
    await page.wait_for_timeout(350)
    await loc.click()
    await page.wait_for_timeout(int(settle * 1000))

async def scroll_slow(page, total, step=120, pause=0.09):
    moved = 0
    while moved < total:
        await page.mouse.wheel(0, step)
        moved += step
        await page.wait_for_timeout(int(pause * 1000))

async def type_slow(page, locator, text):
    await locator.click()
    await page.wait_for_timeout(300)
    for ch in text:
        await locator.type(ch, delay=0)
        await page.wait_for_timeout(55 + (25 if ch in " -" else 0))

SCENES = []
T0 = None
def mark(name):
    SCENES.append((round(time.time() - T0, 1), name)); print(f"  {SCENES[-1][0]:6.1f}s  {name}")

async def main():
    global T0
    shutil.rmtree(OUT_DIR, ignore_errors=True); os.makedirs(OUT_DIR, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": W, "height": H}, record_video_dir=OUT_DIR, record_video_size={"width": W, "height": H}, device_scale_factor=1, locale="en-IN")
        await ctx.add_init_script(CURSOR_JS)
        page = await ctx.new_page()
        _wait = page.wait_for_timeout
        async def slow_wait(ms): await _wait(int(ms * 1.5))
        page.wait_for_timeout = slow_wait
        T0 = time.time()

        # 1. Home
        await page.goto(BASE + "/", wait_until="networkidle"); mark("Home page")
        await page.mouse.move(640, 420)
        await page.wait_for_timeout(2800)
        await scroll_slow(page, 700, 110, 0.08)
        await page.wait_for_timeout(1200)
        await scroll_slow(page, 600, 110, 0.08)
        await page.wait_for_timeout(1000)
        await page.evaluate("window.scrollTo({top:0, behavior:'smooth'})")
        await page.wait_for_timeout(1300)

        # 2. Check safety -> type the names
        await click_text(page, "Check safety", role="link", settle=2.0); mark("Safety checker: type the names")
        await page.wait_for_timeout(800)
        await scroll_slow(page, 260, 130, 0.08)
        await click_text(page, "Type the names", role="tab", settle=1.0)
        tas = page.locator("textarea")
        await glide(page, 220, 560)
        await type_slow(page, tas.nth(0), "Thyronorm 50")
        await page.wait_for_timeout(500)
        await glide(page, 620, 560)
        await type_slow(page, tas.nth(1), "Ashwagandha")
        await page.wait_for_timeout(900)
        await click_text(page, "Match names and continue", settle=2.4)

        # 3. Review
        mark("Review names")
        await page.wait_for_timeout(1200)
        await scroll_slow(page, 360, 120, 0.1)
        await page.wait_for_timeout(1400)
        await click_text(page, "Confirm and check safety", settle=1.0); mark("Result: AMBER verdict")

        # 4. Result (wait for the verdict card + explanation)
        try:
            await page.get_by_text("Why this verdict?").first.wait_for(timeout=20000)
        except Exception:
            pass
        await page.wait_for_timeout(2600)
        await page.mouse.move(700, 300, steps=20)
        await scroll_slow(page, 520, 110, 0.1)
        await page.wait_for_timeout(2200)
        await scroll_slow(page, 560, 110, 0.1)
        await page.wait_for_timeout(1500)
        # expand evidence & sources if present
        try:
            ev = page.get_by_text("Evidence & sources").first
            await ev.scroll_into_view_if_needed()
            box = await ev.bounding_box()
            if box:
                await glide(page, box["x"] + 20, box["y"] + box["height"] / 2)
                await page.wait_for_timeout(300)
                await ev.click()
                await page.wait_for_timeout(2200)
        except Exception:
            pass
        await page.evaluate("window.scrollTo({top:0, behavior:'smooth'})")
        await page.wait_for_timeout(1300)
        # Hindi toggle
        try:
            await click_text(page, "हिन्दी", settle=2.6); mark("Hindi toggle")
            await scroll_slow(page, 420, 120, 0.1)
            await page.wait_for_timeout(2200)
        except Exception:
            pass

        # 5. Dashboard -> Evidence curation (TinyFish)
        await page.goto(BASE + "/dashboard", wait_until="networkidle"); mark("Dashboard")
        await page.mouse.move(640, 400)
        await page.wait_for_timeout(2600)
        await scroll_slow(page, 900, 130, 0.07)
        await page.wait_for_timeout(600)
        head = page.get_by_text("Evidence curation · TinyFish research assistant").first
        await head.scroll_into_view_if_needed(); mark("Evidence curation (TinyFish)")
        await page.evaluate("window.scrollBy(0, -110)")
        await page.wait_for_timeout(2600)
        await page.mouse.move(400, 420, steps=20)
        await page.wait_for_timeout(1400)
        # draft queue: show mismatch, open one Details
        try:
            await click_text(page, "mismatch", settle=1.6); mark("Draft queue: mismatch + details")
            det = page.get_by_role("button", name="Details").first
            await det.scroll_into_view_if_needed()
            box = await det.bounding_box()
            await glide(page, box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
            await page.wait_for_timeout(300)
            await det.click()
            await page.wait_for_timeout(2600)
            await scroll_slow(page, 240, 120, 0.1)
            await page.wait_for_timeout(1400)
            await click_text(page, "pending", settle=2.2)
        except Exception:
            pass
        await page.wait_for_timeout(800)

        # 6. Knowledge base, ADR
        await page.goto(BASE + "/knowledge-base", wait_until="networkidle"); mark("Knowledge base")
        await page.mouse.move(640, 420)
        await page.wait_for_timeout(2200)
        await scroll_slow(page, 520, 120, 0.09)
        await page.wait_for_timeout(1600)
        await page.goto(BASE + "/adr", wait_until="networkidle"); mark("ADR report form")
        await page.mouse.move(600, 450)
        await page.wait_for_timeout(2000)
        await scroll_slow(page, 420, 120, 0.09)
        await page.wait_for_timeout(1600)

        # 7. back home to close
        await page.goto(BASE + "/", wait_until="networkidle"); mark("Close on home")
        await page.mouse.move(640, 300)
        await page.wait_for_timeout(2600)
        await ctx.close()
        await browser.close()
    import json; json.dump(SCENES, open("C:/Temp/bvp/video/scenes.json", "w"))
    vids = glob.glob(os.path.join(OUT_DIR, "*.webm"))
    print("recorded", vids)
    return vids[0] if vids else None

def make_mp4(webm, out):
    import imageio_ffmpeg
    ff = imageio_ffmpeg.get_ffmpeg_exe()
    subprocess.run([ff, "-y", "-i", webm, "-c:v", "libx264", "-preset", "medium", "-crf", "21", "-pix_fmt", "yuv420p", "-r", "30", "-movflags", "+faststart", out], check=True, capture_output=True)
    print("mp4", out, round(os.path.getsize(out) / 1e6, 1), "MB")

if __name__ == "__main__":
    t0 = time.time()
    webm = asyncio.run(main())
    print("session took", round(time.time() - t0), "s")
    if webm:
        make_mp4(webm, r"C:\Temp\bvp\video\TakeSure_Demo_ScreenRecording.mp4")
