"""
Asks the local vision model the four questions every sports feature is built out of, and scores
the answers against ground truth instead of reading them approvingly.

    python vision/probe.py --seq artifacts/vision/seq1

The four primitives, in the order they get harder:

    count    how many players, per team          — the cheapest thing that can be wrong
    roster   who is where, by shirt number       — identity + localisation
    ball     who has the ball                    — one salient object among many
    burst    what changed across 5 frames        — the only one that needs time

Nothing here needs a network, a TV, or a cloud account: the model runs on this machine's GPU.
"""
import argparse
import base64
import json
import os
import time
import urllib.request

HOST = os.environ.get("OLLAMA_HOST", "http://127.0.0.1:11434").rstrip("/")
MODEL = os.environ.get("OLLAMA_VISION_MODEL", "qwen3.8:27b")


def ask(images, prompt, schema=None, timeout=600):
    body = {
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt, "images": images}],
        "stream": False,
        "think": False,
        "options": {"temperature": 0, "num_ctx": 16384},
    }
    if schema:
        body["format"] = schema
    started = time.time()
    req = urllib.request.Request(f"{HOST}/api/chat", data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json"})
    res = json.load(urllib.request.urlopen(req, timeout=timeout))
    return res["message"]["content"], time.time() - started


def b64(path):
    with open(path, "rb") as fh:
        return base64.b64encode(fh.read()).decode()


def loads(text):
    """Structured output should already be JSON; say so plainly when it is not."""
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None


COUNT_SCHEMA = {
    "type": "object",
    "properties": {
        "red_players": {"type": "integer"},
        "blue_players": {"type": "integer"},
    },
    "required": ["red_players", "blue_players"],
}

ROSTER_SCHEMA = {
    "type": "object",
    "properties": {
        "players": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "team": {"type": "string", "enum": ["red", "blue"]},
                    "number": {"type": "integer"},
                    "x": {"type": "number"},
                    "y": {"type": "number"},
                },
                "required": ["team", "number", "x", "y"],
            },
        }
    },
    "required": ["players"],
}

BALL_SCHEMA = {
    "type": "object",
    "properties": {
        "team": {"type": "string", "enum": ["red", "blue", "none"]},
        "number": {"type": "integer"},
        "confidence": {"type": "string", "enum": ["high", "medium", "low"]},
    },
    "required": ["team", "number", "confidence"],
}


def main(seq):
    truth = json.load(open(os.path.join(seq, "truth.json"), encoding="utf-8"))
    frames = [os.path.join(seq, f["file"]) for f in truth["frames"]]
    imgs = [b64(p) for p in frames]
    results = {}

    print(f"model {MODEL}  ·  {len(frames)} frames\n")

    # ---- 1. COUNT ----------------------------------------------------------
    print("COUNT  — how many players per team")
    ok = 0
    for i, img in enumerate(imgs):
        out, dt = ask([img],
                      "Count the football players on the pitch. Red-shirted and blue-shirted "
                      "separately. The small white circle is the ball, not a player.",
                      COUNT_SCHEMA)
        got = loads(out) or {}
        r, b = got.get("red_players"), got.get("blue_players")
        want_r, want_b = truth["counts"]["red"], truth["counts"]["blue"]
        hit = (r == want_r and b == want_b)
        ok += hit
        print(f"  frame {i}  {dt:5.1f}s   red {r} (want {want_r})   blue {b} (want {want_b})   "
              f"{'OK' if hit else 'WRONG'}")
    results["count"] = f"{ok}/{len(imgs)}"

    # ---- 2. ROSTER ---------------------------------------------------------
    print("\nROSTER — every player, by shirt number and position")
    roster_scores = []
    for i, img in enumerate(imgs):
        out, dt = ask([img],
                      "List every football player visible. For each: team colour (red or blue), "
                      "the number printed on the shirt, and the position as x and y fractions of "
                      "the image (x=0 left edge, x=1 right edge, y=0 top, y=1 bottom). "
                      "The small white circle is the ball, not a player.",
                      ROSTER_SCHEMA)
        got = loads(out) or {"players": []}
        seen = {(p.get("team"), p.get("number")) for p in got["players"]}
        want = {(p["team"], p["number"]) for p in truth["frames"][i]["players"]}
        # A shirt number is only useful if it is attached to the right team.
        correct = seen & want
        # Position error, in pixels, for the ones it identified correctly.
        errs = []
        by_id = {(p["team"], p["number"]): p for p in truth["frames"][i]["players"]}
        for p in got["players"]:
            key = (p.get("team"), p.get("number"))
            if key in by_id and isinstance(p.get("x"), (int, float)):
                t = by_id[key]
                dx = p["x"] * 1280 - t["x"]
                dy = p["y"] * 720 - t["y"]
                errs.append((dx * dx + dy * dy) ** 0.5)
        mean_err = sum(errs) / len(errs) if errs else float("nan")
        roster_scores.append((len(correct), len(want), len(seen), mean_err))
        print(f"  frame {i}  {dt:5.1f}s   identified {len(correct)}/{len(want)} correctly, "
              f"reported {len(seen)}   mean position error {mean_err:6.1f}px")
    tot_c = sum(s[0] for s in roster_scores)
    tot_w = sum(s[1] for s in roster_scores)
    results["roster"] = f"{tot_c}/{tot_w} shirt numbers correct"

    # ---- 3. BALL -----------------------------------------------------------
    print("\nBALL   — who is in possession")
    ok = 0
    for i, img in enumerate(imgs):
        out, dt = ask([img],
                      "A small white circle on the pitch is the ball. Which player is closest to "
                      "it, and therefore in possession? Give their team colour and shirt number.",
                      BALL_SCHEMA)
        got = loads(out) or {}
        want = truth["frames"][i]["ball_carrier"]
        hit = got.get("team") == want["team"] and got.get("number") == want["number"]
        ok += hit
        print(f"  frame {i}  {dt:5.1f}s   said {got.get('team')} {got.get('number')} "
              f"({got.get('confidence')})   want {want['team']} {want['number']}   "
              f"{'OK' if hit else 'WRONG'}")
    results["ball"] = f"{ok}/{len(imgs)}"

    # ---- 4. BURST ----------------------------------------------------------
    print("\nBURST  — all 5 frames at once, one second apart")
    out, dt = ask(imgs,
                  "These are 5 frames of a football match, one second apart, in order. "
                  "Describe what happened: which players moved, in which direction, and whether "
                  "possession of the ball changed hands. Be specific about shirt numbers. "
                  "Answer in under 120 words.")
    print(f"  {dt:5.1f}s\n")
    print("  " + out.strip().replace("\n", "\n  ")[:1200])
    print(f"\n  ground truth: {truth['event']}")
    results["burst"] = "see above"

    print("\n" + "=" * 70)
    for k, v in results.items():
        print(f"  {k:8} {v}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--seq", default="artifacts/vision/seq1")
    main(ap.parse_args().seq)
