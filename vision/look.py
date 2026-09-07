"""
Runs the probe's prompts against footage with NO ground truth, and prints what comes back.

probe.py scores against a synthetic scene the generator knows the answer to. This is the other
half: real frames, where the answer has to be judged by a human looking at the picture. Keep both.
The synthetic run says what the model can do when nothing is in the way; this says what survives a
crowd, a flare, motion blur and a player twelve pixels tall.

    python vision/look.py --dir artifacts/vision/soccer_cc
    python vision/look.py --dir artifacts/vision/soccer_cc --crop 0.45,0.95   # the player band only
"""
import argparse
import glob
import json
import os
import subprocess
import tempfile

from probe import ask, b64, loads

# Deliberately NOT the probe's schema. That one constrains team to red|blue, which is right for a
# generated scene and wrong for football: the first real clip was red vs WHITE, and the enum forced
# every white shirt to be reported as red. A schema that cannot express the answer produces a
# confident wrong one, and it reads exactly like a model error.
REAL_ROSTER_SCHEMA = {
    "type": "object",
    "properties": {
        "players": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "kit": {"type": "string"},
                    "number": {"type": "integer"},
                    "x": {"type": "number"},
                    "y": {"type": "number"},
                },
                "required": ["kit", "number", "x", "y"],
            },
        }
    },
    "required": ["players"],
}

SCENE_SCHEMA = {
    "type": "object",
    "properties": {
        "sport": {"type": "string"},
        "camera": {"type": "string", "enum": ["wide", "medium", "close-up", "aerial", "other"]},
        "phase": {"type": "string"},
        "teams": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "kit_colour": {"type": "string"},
                    "players_visible": {"type": "integer"},
                },
                "required": ["kit_colour", "players_visible"],
            },
        },
        "notable": {"type": "string"},
    },
    "required": ["sport", "camera", "phase", "teams", "notable"],
}


def crop(path, band):
    """Keep a horizontal band of the frame. A broadcast wide shot spends most of its pixels on
    crowd and sky; cutting to the strip the players occupy raises their pixel height, which is the
    single variable everything else depends on."""
    lo, hi = band
    out = os.path.join(tempfile.gettempdir(), "crop_" + os.path.basename(path))
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", path,
         "-vf", f"crop=iw:ih*{hi - lo:.4f}:0:ih*{lo:.4f},scale=1280:-2", "-q:v", "3", out],
        check=True,
    )
    return out


def main(a):
    band = tuple(float(x) for x in a.crop.split(",")) if a.crop else None
    frames = sorted(glob.glob(os.path.join(a.dir, "frame_*.jpg")))[: a.max]
    if not frames:
        raise SystemExit(f"no frames in {a.dir}")
    if band:
        frames = [crop(f, band) for f in frames]
        print(f"cropped to vertical band {band[0]:.2f}-{band[1]:.2f} of each frame")
    print(f"{len(frames)} frames from {a.dir}\n")

    # ---- what is this, at all -------------------------------------------------
    print("SCENE — what the model thinks it is looking at")
    out, dt = ask([b64(frames[0])],
                  "This is a frame from a sports broadcast. Identify the sport, the camera "
                  "framing, what phase of play is happening, each team by kit colour with how "
                  "many of their players you can see, and anything notable in the scene.",
                  SCENE_SCHEMA)
    scene = loads(out)
    print(f"  {dt:.1f}s   {json.dumps(scene, indent=2) if scene else out[:600]}")

    # ---- can it enumerate players here ---------------------------------------
    print("\nROSTER — enumerate players (the technique that scored 60/60 on synthetic)")
    for i, f in enumerate(frames):
        out, dt = ask([b64(f)],
                      "List every football player you can see on the pitch. For each: the kit "
                      "colour, the shirt number if it is legible (use 0 if you cannot read it), "
                      "and position as x and y fractions of the image. Do not list spectators.",
                      REAL_ROSTER_SCHEMA)
        got = loads(out) or {"players": []}
        ps = got["players"]
        legible = sum(1 for p in ps if p.get("number", 0) not in (0, None))
        kits = {}
        for p in ps:
            kits[str(p.get("kit"))] = kits.get(str(p.get("kit")), 0) + 1
        print(f"  frame {i}  {dt:5.1f}s   {len(ps)} players   numbers legible: {legible}   {kits}")

    # ---- free description of the sequence ------------------------------------
    print("\nSEQUENCE — all frames at once")
    out, dt = ask([b64(f) for f in frames],
                  f"These are {len(frames)} frames from a football match, one second apart, in "
                  "order. What is happening? Answer in under 80 words.")
    print(f"  {dt:.1f}s\n  " + out.strip().replace("\n", "\n  ")[:900])


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", required=True)
    ap.add_argument("--crop", help="vertical band to keep, e.g. 0.45,0.95")
    ap.add_argument("--max", type=int, default=5)
    main(ap.parse_args())
