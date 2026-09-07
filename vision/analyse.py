"""
Closes the loop: frames in, a named tactical concept out, judged against the knowledge base.

Finding 5 said a single frame cannot see a tactical action and the model correctly declines to
guess. This asks whether two changes fix that:

  1. several frames rather than one, because a screen is an event over time
  2. the vocabulary from vision/patterns.py in the prompt, so the model is choosing from concepts
     with written visual cues rather than recalling basketball from pre-training

`--blind` drops the vocabulary and asks the same question, which is the only way to know whether
the knowledge base earned its place.

    python vision/analyse.py --dir artifacts/vision/nba_play
    python vision/analyse.py --dir artifacts/vision/nba_play --blind
"""
import argparse
import glob
import json
import os
import re
import sys

from probe import ask, b64
from patterns import norm

for _s in (sys.stdout, sys.stderr):
    if hasattr(_s, "reconfigure"):
        _s.reconfigure(encoding="utf-8", errors="replace")

KB = os.path.join("artifacts", "vision", "library", "knowledge.json")


def vocabulary(sport="basketball", min_channels=2):
    """The concepts more than one channel uses, with the most detailed visual cue written for each."""
    store = json.load(open(KB, encoding="utf-8"))
    agg = {}
    for rec in store.values():
        if rec["sport"] != sport:
            continue
        for c in rec["concepts"]:
            k = norm(c["name"])
            e = agg.setdefault(k, {"uploaders": set(), "rows": []})
            e["uploaders"].add(rec["uploader"])
            e["rows"].append(c)
    out = []
    for name, e in agg.items():
        if len(e["uploaders"]) < min_channels:
            continue
        best = max(e["rows"], key=lambda r: len(r.get("visual_cues", "")))
        out.append({"name": name, "channels": len(e["uploaders"]),
                    "definition": best["definition"], "visual_cues": best["visual_cues"]})
    return sorted(out, key=lambda c: -c["channels"])


def main(a):
    frames = sorted(glob.glob(os.path.join(a.dir, "*.jpg")),
                    key=lambda p: int(re.search(r"(\d+)", os.path.basename(p)).group(1)))[: a.max]
    if not frames:
        raise SystemExit(f"no frames in {a.dir}")
    imgs = [b64(f) for f in frames]
    print(f"{len(frames)} frames: {', '.join(os.path.basename(f) for f in frames)}\n")

    vocab = [] if a.blind else vocabulary(a.sport, a.min_channels)
    schema = {
        "type": "object",
        "properties": {
            "concept": {"type": "string"},
            "confident": {"type": "boolean"},
            "evidence": {"type": "string"},
            "which_players": {"type": "string"},
        },
        "required": ["concept", "confident", "evidence", "which_players"],
    }

    if vocab:
        catalogue = "\n".join(
            f"- {c['name']}: {c['definition']} LOOKS LIKE: {c['visual_cues']}" for c in vocab)
        print(f"vocabulary: {len(vocab)} concepts from the library "
              f"({', '.join(c['name'] for c in vocab[:6])}…)\n")
        prompt = (
            f"These are {len(frames)} frames from a basketball game, a few seconds apart, in order.\n\n"
            f"Here is a vocabulary of tactical concepts, each with what it looks like on screen:\n"
            f"{catalogue}\n\n"
            "Which ONE of these concepts is happening across these frames? Use the visual cues to "
            "decide. Identify the players involved by kit colour and shirt number - do NOT use "
            "player names, you cannot know them.\n"
            "If none of the listed concepts is clearly visible, answer concept='none' and "
            "confident=false. Guessing is worse than saying you cannot tell."
        )
    else:
        print("BLIND — no vocabulary supplied\n")
        prompt = (
            f"These are {len(frames)} frames from a basketball game, a few seconds apart, in order.\n"
            "Name the ONE tactical concept or play type happening across these frames, using "
            "standard basketball terminology. Identify the players involved by kit colour and "
            "shirt number - do NOT use player names, you cannot know them.\n"
            "If you cannot tell, answer concept='none' and confident=false. Guessing is worse "
            "than saying you cannot tell."
        )

    out, dt = ask(imgs, prompt, schema, timeout=900)
    try:
        got = json.loads(out)
    except json.JSONDecodeError:
        print(out[:600]); return
    print(f"  {dt:.1f}s")
    print(f"  concept    {got['concept']}   (confident: {got['confident']})")
    print(f"  players    {got['which_players']}")
    print(f"  evidence   {got['evidence']}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", required=True)
    ap.add_argument("--sport", default="basketball")
    ap.add_argument("--max", type=int, default=5)
    ap.add_argument("--blind", action="store_true")
    # 2+ is the domain's shared vocabulary; 1 includes every term any channel used,
    # which is the only way a specific play like "split action" is on the menu at all.
    ap.add_argument("--min-channels", type=int, default=2, dest="min_channels")
    main(ap.parse_args())
