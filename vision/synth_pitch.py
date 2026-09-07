"""
Generates a synthetic football sequence with EXACTLY KNOWN ground truth.

Why synthetic before real footage: every sports feature we might build rests on four primitives —
count the players, locate them, tell them apart, and see what changed between frames. If a model
cannot do those on a clean scene it drew from a spec, it will not do them on a broadcast frame with
motion blur, occlusion and a crowd behind it. This makes failure cheap to find and unambiguous to
read, because the answer is in the JSON next to the picture.

It is deliberately *easier* than reality: flat colours, no occlusion, no camera motion, numbers
rendered face-on. Treat any score here as a CEILING, not a prediction.

    python vision/synth_pitch.py --out artifacts/vision/seq1

Writes frame_0.jpg .. frame_4.jpg (1 s apart) plus truth.json.
"""
import argparse
import json
import math
import os
import random
from PIL import Image, ImageDraw, ImageFont

W, H = 1280, 720
PITCH = (34, 120, 52)
LINE = (245, 245, 245)
TEAMS = {"red": (200, 40, 40), "blue": (40, 80, 205)}
FRAMES = 5


def _font(size):
    for name in ("arialbd.ttf", "arial.ttf", "DejaVuSans-Bold.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def draw_pitch(d):
    d.rectangle([0, 0, W, H], fill=PITCH)
    # Mown stripes: harmless texture, and a cue a real pitch has.
    for i in range(0, W, 160):
        if (i // 160) % 2 == 0:
            d.rectangle([i, 0, i + 160, H], fill=(30, 110, 47))
    d.rectangle([40, 40, W - 40, H - 40], outline=LINE, width=3)
    d.line([(W // 2, 40), (W // 2, H - 40)], fill=LINE, width=3)
    d.ellipse([W // 2 - 90, H // 2 - 90, W // 2 + 90, H // 2 + 90], outline=LINE, width=3)
    for x0, x1 in ((40, 200), (W - 200, W - 40)):
        d.rectangle([x0, H // 2 - 150, x1, H // 2 + 150], outline=LINE, width=3)


def draw_player(d, x, y, team, number, font):
    r = 17
    d.ellipse([x - r, y - r, x + r, y + r], fill=TEAMS[team], outline=(250, 250, 250), width=2)
    label = str(number)
    box = d.textbbox((0, 0), label, font=font)
    d.text((x - (box[2] - box[0]) / 2, y - (box[3] - box[1]) / 2 - 2), label,
           fill=(255, 255, 255), font=font)


def build(seed, outdir):
    rnd = random.Random(seed)
    os.makedirs(outdir, exist_ok=True)
    font = _font(17)

    # Two teams in a plausible shape, not a random scatter: a formation is what a real analyst
    # would be asked about, and a random cloud would make "is the defence flat" meaningless.
    red = [
        {"number": n, "team": "red", "x": x, "y": y}
        for n, (x, y) in zip(
            [1, 4, 5, 6, 8, 10, 11],
            [(90, 360), (250, 200), (250, 360), (250, 520), (460, 260), (470, 430), (620, 330)],
        )
    ]
    blue = [
        {"number": n, "team": "blue", "x": x, "y": y}
        for n, (x, y) in zip(
            [1, 2, 3, 7, 9],
            [(1190, 360), (980, 250), (980, 470), (800, 300), (760, 470)],
        )
    ]
    players = red + blue

    # One deliberate event: red 10 carries the ball right and passes to red 11 between frames 2
    # and 3. Everything else drifts slightly, the way players do when nothing is happening.
    ball_carrier = [10, 10, 10, 11, 11]
    truth = {"frames": [], "event": "red 10 passes to red 11 between frame 2 and frame 3",
             "counts": {"red": len(red), "blue": len(blue), "total": len(players)}}

    for f in range(FRAMES):
        img = Image.new("RGB", (W, H))
        d = ImageDraw.Draw(img)
        draw_pitch(d)

        frame_players = []
        for p in players:
            # Drift, plus a real run for red 10 and red 11.
            dx = rnd.uniform(-9, 9)
            dy = rnd.uniform(-9, 9)
            if p["number"] == 10 and p["team"] == "red":
                dx += 26
            if p["number"] == 11 and p["team"] == "red":
                dx += 14
                dy -= 10
            p["x"] = max(60, min(W - 60, p["x"] + dx))
            p["y"] = max(60, min(H - 60, p["y"] + dy))
            draw_player(d, p["x"], p["y"], p["team"], p["number"], font)
            frame_players.append({"team": p["team"], "number": p["number"],
                                  "x": round(p["x"]), "y": round(p["y"])})

        carrier = next(p for p in players
                       if p["team"] == "red" and p["number"] == ball_carrier[f])
        bx, by = carrier["x"] + 24, carrier["y"] + 16
        d.ellipse([bx - 8, by - 8, bx + 8, by + 8], fill=(255, 255, 255), outline=(20, 20, 20), width=2)

        path = os.path.join(outdir, f"frame_{f}.jpg")
        img.save(path, quality=88)
        truth["frames"].append({
            "frame": f, "t_seconds": f, "file": os.path.basename(path),
            "ball_carrier": {"team": "red", "number": ball_carrier[f]},
            "ball_xy": [round(bx), round(by)],
            "players": frame_players,
        })

    with open(os.path.join(outdir, "truth.json"), "w", encoding="utf-8") as fh:
        json.dump(truth, fh, indent=2)
    print(f"wrote {FRAMES} frames + truth.json to {outdir}")
    print(f"  {truth['counts']['red']} red, {truth['counts']['blue']} blue, "
          f"{truth['counts']['total']} players")
    print(f"  event: {truth['event']}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="artifacts/vision/seq1")
    ap.add_argument("--seed", type=int, default=7)
    build(ap.parse_args().seed, ap.parse_args().out)
