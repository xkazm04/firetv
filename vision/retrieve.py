"""
Semantic retrieval over the clip library.

The library holds expert commentary; this makes it findable. Passages are overlapping windows of a
transcript, each keeping the timestamp and the clip it came from, so anything retrieved can be
played back and checked by a human. Provenance is not decoration here — the whole argument for
retrieval over perception is that a human wrote the sentence, so we must be able to say who.

    python vision/retrieve.py build
    python vision/retrieve.py query "how do you defend a pick and roll"

Embeddings come from nomic-embed-text on the local Ollama. Nothing leaves the machine.
"""
import argparse
import json
import math
import os
import sys
import urllib.request

for _s in (sys.stdout, sys.stderr):
    if hasattr(_s, "reconfigure"):
        _s.reconfigure(encoding="utf-8", errors="replace")

HOST = os.environ.get("OLLAMA_HOST", "http://127.0.0.1:11434").rstrip("/")
EMBED_MODEL = os.environ.get("OLLAMA_EMBED_MODEL", "nomic-embed-text")

# Paths are anchored to the repo root, not the working directory: these scripts are run
# from the repo root and from vision/ about equally often.
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.join(REPO, "artifacts", "vision", "library")
INDEX_IN = os.path.join(ROOT, "clips.json")
KB = os.path.join(ROOT, "knowledge.json")
OUT = os.path.join(ROOT, "passages.json")

# ~55 words with half-window overlap. A coach explains one idea in two or three sentences; too
# short loses the reason, too long retrieves a whole tangent along with the answer.
WINDOW = 55
STRIDE = 28


def embed(texts):
    req = urllib.request.Request(
        f"{HOST}/api/embed",
        data=json.dumps({"model": EMBED_MODEL, "input": texts}).encode(),
        headers={"Content-Type": "application/json"},
    )
    return json.load(urllib.request.urlopen(req, timeout=600))["embeddings"]


def _norm(v):
    n = math.sqrt(sum(x * x for x in v)) or 1.0
    return [x / n for x in v]


def build():
    clips = json.load(open(INDEX_IN, encoding="utf-8"))["clips"]
    kb = json.load(open(KB, encoding="utf-8")) if os.path.exists(KB) else {}
    passages = []

    for clip in clips:
        cues = json.load(open(os.path.join(ROOT, clip["id"], "transcript.json"), encoding="utf-8"))
        # Flatten to words that each remember the second they were spoken, so a window can report
        # the timestamp it starts at and the clip can be opened there.
        words = [(c["t"], w) for c in cues for w in c["text"].split()]
        for i in range(0, max(1, len(words) - WINDOW // 2), STRIDE):
            chunk = words[i:i + WINDOW]
            if len(chunk) < 20:
                continue
            passages.append({
                "kind": "transcript",
                "clip": clip["id"], "uploader": clip["uploader"], "sport": clip["sport"],
                "title": clip["title"], "t": chunk[0][0],
                "text": " ".join(w for _, w in chunk),
            })

    # Concept definitions are their own passages: a question like "what is drop coverage" should
    # find the definition, not a passing mention in the middle of a play breakdown.
    for vid, rec in kb.items():
        for c in rec["concepts"]:
            passages.append({
                "kind": "concept", "clip": vid, "uploader": rec["uploader"],
                "sport": rec["sport"], "title": rec["title"], "t": 0,
                "concept": c["name"],
                "text": f"{c['name']}: {c['definition']} Visually: {c['visual_cues']}",
            })

    print(f"embedding {len(passages)} passages…")
    vecs = []
    for i in range(0, len(passages), 64):
        vecs.extend(embed([p["text"] for p in passages[i:i + 64]]))
        print(f"  {min(i + 64, len(passages))}/{len(passages)}")
    for p, v in zip(passages, vecs):
        p["vec"] = _norm(v)

    json.dump(passages, open(OUT, "w", encoding="utf-8"))
    kinds = {}
    for p in passages:
        kinds[p["kind"]] = kinds.get(p["kind"], 0) + 1
    print(f"\nwrote {OUT}: {kinds}")


def load():
    return json.load(open(OUT, encoding="utf-8"))


def query(text, passages=None, k=6, sport=None):
    passages = passages if passages is not None else load()
    q = _norm(embed([text])[0])
    scored = []
    for p in passages:
        if sport and p["sport"] != sport:
            continue
        scored.append((sum(a * b for a, b in zip(q, p["vec"])), p))
    scored.sort(key=lambda s: -s[0])
    return scored[:k]


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("build")
    q = sub.add_parser("query"); q.add_argument("text"); q.add_argument("-k", type=int, default=6)
    q.add_argument("--sport")
    a = ap.parse_args()

    if a.cmd == "build":
        build()
    else:
        for score, p in query(a.text, k=a.k, sport=a.sport):
            where = f"{p['uploader']} [{p['t']//60:02d}:{p['t']%60:02d}]"
            print(f"\n  {score:.3f}  {p['kind']:10} {where}")
            print(f"    {p['text'][:260]}")
