"""
The architecture the probe results argue for: the model looks at ONE frame at a time and reports
what it sees; TIME is reasoned about in code.

probe.py measured why. Asked to narrate five frames, the model produced a fluent account of a duel
that never happened and missed the pass that did. Asked what is in a single frame, it named all 12
shirt numbers correctly in all 5 frames, placed them within ~5 px, and identified the ball carrier
every time. So the model is a good eye and an unreliable narrator, and the split follows: per-frame
perception from the VLM, continuity and events from arithmetic that cannot hallucinate.

    python vision/sequence.py --seq artifacts/vision/seq1

Everything here runs on this machine. No TV, no cloud, no AWS.
"""
import argparse
import json
import math
import os

from probe import ask, b64, loads, ROSTER_SCHEMA, BALL_SCHEMA

PITCH_W, PITCH_H = 1280, 720
# Below this, a player is standing still and any apparent motion is extraction noise. The probe
# measured that noise at ~5 px, so this is a few times that.
MOVE_PX = 22


def extract(frame_path):
    """One frame in, one structured observation out. The only place the model is consulted."""
    img = b64(frame_path)
    roster, t1 = ask([img],
                     "List every football player visible. For each: team colour (red or blue), "
                     "the number printed on the shirt, and the position as x and y fractions of "
                     "the image (x=0 left edge, x=1 right edge, y=0 top, y=1 bottom). "
                     "The small white circle is the ball, not a player.",
                     ROSTER_SCHEMA)
    ball, t2 = ask([img],
                   "A small white circle on the pitch is the ball. Which player is closest to it, "
                   "and therefore in possession? Give their team colour and shirt number.",
                   BALL_SCHEMA)
    r = loads(roster) or {"players": []}
    b = loads(ball) or {}
    players = {}
    for p in r["players"]:
        if not isinstance(p.get("number"), int):
            continue
        players[(p.get("team"), p["number"])] = (p.get("x", 0) * PITCH_W, p.get("y", 0) * PITCH_H)
    return {
        "players": players,
        "carrier": (b.get("team"), b.get("number")) if b.get("team") in ("red", "blue") else None,
        "seconds": t1 + t2,
    }


def main(seq):
    truth = json.load(open(os.path.join(seq, "truth.json"), encoding="utf-8"))
    frames = [os.path.join(seq, f["file"]) for f in truth["frames"]]

    print(f"extracting {len(frames)} frames, one at a time\n")
    obs = []
    for i, path in enumerate(frames):
        o = extract(path)
        obs.append(o)
        who = f"{o['carrier'][0]} {o['carrier'][1]}" if o["carrier"] else "nobody"
        print(f"  frame {i}  {o['seconds']:4.1f}s   {len(o['players'])} players   ball: {who}")

    # ---- everything below is arithmetic; the model gets no say ------------------
    print("\nderived events (computed, not asked):")
    events = []

    for i in range(1, len(obs)):
        prev, cur = obs[i - 1], obs[i]

        # Possession. A change between two players of the same team is a pass; between teams,
        # a turnover. This distinction is a rule, so it is right every time.
        if prev["carrier"] and cur["carrier"] and prev["carrier"] != cur["carrier"]:
            same_team = prev["carrier"][0] == cur["carrier"][0]
            kind = "PASS" if same_team else "TURNOVER"
            events.append(
                f"{kind}: {prev['carrier'][0]} {prev['carrier'][1]} -> "
                f"{cur['carrier'][0]} {cur['carrier'][1]}  (between frame {i-1} and {i})"
            )

        # Who actually ran, and where to. Identity comes from the shirt number, so a player is
        # tracked across frames without any tracking algorithm at all.
        movers = []
        for key, (x, y) in cur["players"].items():
            if key not in prev["players"]:
                continue
            px, py = prev["players"][key]
            dist = math.hypot(x - px, y - py)
            if dist >= MOVE_PX:
                direction = "right" if x > px else "left"
                movers.append((dist, f"{key[0]} {key[1]} moved {direction} {dist:.0f}px"))
        for _, text in sorted(movers, reverse=True)[:3]:
            events.append(f"  {text}  (frame {i-1}->{i})")

    for e in events:
        print("  " + e)

    # Counting is done by measuring the list, never by asking for a number: probe.py scored the
    # direct question 1/5 and the enumeration 60/60.
    counts = {}
    for team, _ in obs[0]["players"]:
        counts[team] = counts.get(team, 0) + 1
    print(f"\ncounts from the roster: {counts}  (truth: "
          f"red {truth['counts']['red']}, blue {truth['counts']['blue']})")
    print(f"ground truth event:     {truth['event']}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--seq", default="artifacts/vision/seq1")
    main(ap.parse_args().seq)
