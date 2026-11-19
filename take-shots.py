#!/usr/bin/env python3
"""Take the entry's screenshots with the headless shell and save them
as JPEGs inside screenshots/, within the gate's limits (each <=256 KiB,
long side <=1280, short side >=480). Reads shots.json next to this file.
Run from the entry directory while `node serve.ts` is up on :8080."""
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SHELL = Path.home() / "workspace/make-fun/.browser/chrome-headless-shell-linux64/chrome-headless-shell"
SHOTS = json.loads((HERE / "shots.json").read_text())
OUT = HERE / "screenshots"
OUT.mkdir(exist_ok=True)

from PIL import Image  # noqa: E402


def take(shot):
    name = shot["name"]
    url = f"http://localhost:8080/{shot['query']}"
    png = Path(f"/tmp/viceheat-{name}.png")
    subprocess.run(
        [str(SHELL), "--headless", "--disable-gpu", "--no-sandbox",
         f"--screenshot={png}", f"--window-size={shot['w']},{shot['h']}",
         "--virtual-time-budget=20000", url],
        check=True, capture_output=True, text=True, timeout=120,
    )
    img = Image.open(png).convert("RGB")
    # The shot fills the window; crop any letterbox bars the shell left.
    img.thumbnail((1280, 1280), Image.LANCZOS)
    dest = OUT / name
    quality = 85
    while True:
        img.save(dest, "JPEG", quality=quality, optimize=True)
        if dest.stat().st_size <= 250 * 1024 or quality <= 55:
            break
        quality -= 5
    print(f"{name}: {img.size[0]}x{img.size[1]} {dest.stat().st_size} bytes q{quality}")
    png.unlink(missing_ok=True)


for shot in SHOTS:
    take(shot)
print("done")
