"""
Turns the clip library's transcripts into a tactical vocabulary.

The premise, and it is the user's: coaches breaking down film return to the same concepts over and
over. If we can name those concepts, define them, and — the part that matters to us — write down
what each one LOOKS like in a frame, we have a vocabulary the vision side can be pointed at, and a
grounding source that does not depend on the model having absorbed enough basketball during
pre-training.

The output is deliberately not a summary. It is a list of named concepts with:

    definition    what a coach means by it
    visual_cues   what is visible in the picture when it happens  ← the bridge to the pixels
    quote         the commentator's own words, so a claim can be traced back

A concept that appears across several independent channels is one the domain actually uses, rather
than one presenter's habit. That count is the whole point of aggregating.

    python vision/patterns.py extract          # per-clip, cached; re-runs are free
    python vision/patterns.py report           # the vocabulary, ranked by how many clips use it
"""
import argparse
import json
import os
import re
import sys
from collections import defaultdict

from probe import ask

for _s in (sys.stdout, sys.stderr):
    if hasattr(_s, "reconfigure"):
        _s.reconfigure(encoding="utf-8", errors="replace")

# Paths are anchored to the repo root, not the working directory: these scripts are run
# from the repo root and from vision/ about equally often.
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.join(REPO, "artifacts", "vision", "library")
INDEX = os.path.join(ROOT, "clips.json")
OUT = os.path.join(ROOT, "knowledge.json")

# ~1200 words a chunk. Long enough that a concept is explained inside one, short enough that the
# model does not start summarising the video instead of enumerating what is in it.
CHUNK_WORDS = 1200

CONCEPT_SCHEMA = {
    "type": "object",
    "properties": {
        "concepts": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "category": {"type": "string",
                                 "enum": ["offense", "defense", "transition", "spacing", "general"]},
                    "definition": {"type": "string"},
                    "visual_cues": {"type": "string"},
                    "quote": {"type": "string"},
                },
                "required": ["name", "category", "definition", "visual_cues", "quote"],
            },
        }
    },
    "required": ["concepts"],
}

PROMPT = """You are reading a transcript from a {sport} coaching video that breaks down film.

Extract the TACTICAL CONCEPTS the commentator names and explains. A concept is a recognised piece
of {sport} vocabulary - a play type, an action, a coverage, a spacing principle. Examples of the
kind of thing: "pick and roll", "drop coverage", "split action", "back screen", "forecheck".

For each concept give:
  name         the concept, lower case, as a coach would say it
  category     offense, defense, transition, spacing or general
  definition   what it means, one sentence
  visual_cues  what someone would SEE in a single video frame or a few seconds of footage when
               this is happening - positions, movements, who is where relative to whom. Be
               concrete and visual. This is the most important field.
  quote        a short verbatim phrase from the transcript where it is discussed

Only extract concepts actually named or clearly described in this text. Do not add concepts you
know about but that are not here. If the text is filler, chat or an advert, return an empty list.

TRANSCRIPT:
{text}"""


def chunks(words, n=CHUNK_WORDS):
    for i in range(0, len(words), n):
        yield " ".join(words[i:i + n])


def extract():
    idx = json.load(open(INDEX, encoding="utf-8"))
    store = json.load(open(OUT, encoding="utf-8")) if os.path.exists(OUT) else {}

    for clip in idx["clips"]:
        vid = clip["id"]
        if vid in store:
            print(f"  {vid}  cached ({len(store[vid]['concepts'])} concepts)")
            continue
        text = open(os.path.join(ROOT, vid, "transcript.txt"), encoding="utf-8").read()
        words = text.split()
        found = []
        for j, chunk in enumerate(chunks(words)):
            out, dt = ask([], PROMPT.format(sport=clip["sport"], text=chunk),
                          CONCEPT_SCHEMA, timeout=900)
            try:
                got = json.loads(out).get("concepts", [])
            except json.JSONDecodeError:
                got = []
            found.extend(got)
            print(f"  {vid}  chunk {j + 1}  {dt:5.1f}s  +{len(got)}")
        store[vid] = {"uploader": clip["uploader"], "sport": clip["sport"],
                      "title": clip["title"], "concepts": found}
        json.dump(store, open(OUT, "w", encoding="utf-8"), indent=1)
        print(f"  {vid}  DONE {len(found)} concepts")
    print(f"\nknowledge base: {OUT}")


def norm(name):
    """Fold the obvious spelling variants so counting means something."""
    n = name.lower().strip().strip(".")
    n = re.sub(r"[^a-z0-9 &-]", "", n)
    n = re.sub(r"\s+", " ", n)
    aliases = {
        "pick and roll": ["pick & roll", "pick-and-roll", "ball screen", "on-ball screen", "pnr"],
        "pick and pop": ["pick & pop", "pick-and-pop"],
        "drop coverage": ["drop", "dropping"],
        "hedge": ["hard hedge", "show", "hedging"],
        "switch": ["switching", "switch coverage"],
        "off-ball screen": ["off ball screen", "away screen"],
        "back screen": ["backscreen", "back-screen"],
        "split action": ["splits", "post splits", "split cut"],
        "forecheck": ["fore-check", "forechecking"],
    }
    for canon, alts in aliases.items():
        if n == canon or n in alts:
            return canon
    return n


def report():
    store = json.load(open(OUT, encoding="utf-8"))
    by_concept = defaultdict(lambda: {"clips": set(), "uploaders": set(), "rows": [], "sport": set()})
    for vid, rec in store.items():
        for c in rec["concepts"]:
            k = norm(c["name"])
            e = by_concept[k]
            e["clips"].add(vid)
            e["uploaders"].add(rec["uploader"])
            e["sport"].add(rec["sport"])
            e["rows"].append(c)

    ranked = sorted(by_concept.items(),
                    key=lambda kv: (len(kv[1]["uploaders"]), len(kv[1]["rows"])), reverse=True)

    total = sum(len(r["concepts"]) for r in store.values())
    print(f"{len(store)} clips  ·  {total} concept mentions  ·  {len(ranked)} distinct concepts\n")
    print("Ranked by how many INDEPENDENT channels use the term — a concept only one presenter")
    print("uses is that presenter's habit; one several use is the domain's vocabulary.\n")

    for name, e in ranked[:28]:
        if len(e["uploaders"]) < 2:
            continue
        sport = "/".join(sorted(e["sport"]))
        print(f"  {len(e['uploaders'])} channels  {len(e['rows']):2} mentions  [{sport:16}] {name}")

    print("\n--- the shared vocabulary in detail ---")
    for name, e in ranked:
        if len(e["uploaders"]) < 3:
            continue
        best = max(e["rows"], key=lambda r: len(r.get("visual_cues", "")))
        print(f"\n{name.upper()}  ({len(e['uploaders'])} channels, {'/'.join(sorted(e['sport']))})")
        print(f"  is:    {best['definition']}")
        print(f"  looks: {best['visual_cues']}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("extract")
    sub.add_parser("report")
    a = ap.parse_args()
    extract() if a.cmd == "extract" else report()
