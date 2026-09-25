"""
PoC C — "watch the bit that explains this": from a homework problem, find the segment of a lesson
that teaches it.

Lessons are Khan Academy transcripts (CC BY-NC-SA) in artifacts/vision/desk/lessons/, cut into
40-second windows — the unit the TV would jump to. Retrieval is plain term weighting with no model
in the loop, plus a second run where the model first names the concept and that name is added to
the query. The lessons doc (§10) is the caution here: expansion must not launder a guess into a
sourced claim, so the expanded term is shown next to the hit, never hidden inside it.

Includes two queries whose concept is NOT in the library (percentages, triangle angles). The right
answer there is a low score and "no segment", and that is scored too.

    python vision/poc_retrieval.py

Re-measured on the product, not this copy: `npm run bench` in desk/ sends QUERIES through desk's own
pickLesson() and scores it against ACCEPT (tools/lab-bench.cjs).
"""
import glob
import math
import os
import re
from collections import Counter

from vlm import ask, loads
from vtt import stamped, windows, wpm

LESSONS = os.path.join("artifacts", "vision", "desk", "lessons")

# Lesson titles, as published. They are the most concept-dense text a lesson has — "Solving a
# quadratic equation by factoring" says the word the transcript never does, because in the video
# Sal just says "factor". Run 1 missed that problem for exactly this reason.
TITLES = {
    "bAerID24QJ0": "Algebra: Linear equations 1 | Linear equations | Algebra I",
    "jWpiMu5LNdg": "How to solve one-step equations | Linear equations | Algebra I",
    "qsL_5Y8uWPU": "Number of solutions to linear equations | Linear equations | Algebra I",
    "2ZzuZvz33X0": "Solving a quadratic equation by factoring | Algebra II",
    "u1SAo2GiX8A": "Example 2: Factoring quadratics by grouping | Algebra I",
    "D3a8NnpQ2vU": "Factoring quadratics as (x+a)(x+b) | Mathematics II | High School Math",
    "uzyd_mIJaoc": "The substitution method | Systems of equations | 8th grade",
    "V7H1oUHXPkg": "Solving linear systems by substitution | Algebra Basics",
}
TITLE_WEIGHT = 2.5  # per concept token found in the title — a title match is strong evidence

QUERIES = [
    ("Solve for x: 3x - 7 = 11", "linear equations"),
    ("Solve for x: 2x^2 - 5x - 3 = 0", "quadratic by factoring"),
    ("Factor completely: x^2 + 7x + 12", "factoring quadratics"),
    ("Solve the system: 2x + y = 7 and x - y = 2", "systems / substitution"),
    ("Solve: x/4 + 3 = 8", "one-step / two-step equations"),
    ("Solve for x: 5(x - 2) = 3x + 8", "linear equations, both sides"),
    ("Does 2x + 3 = 2x + 5 have a solution?", "number of solutions"),
    ("What is 15% of 240?", "NOT IN LIBRARY — expect no hit"),
    ("The angles of a triangle are x, 2x and 3x. Find x.", "NOT IN LIBRARY — expect no hit"),
]

# The lessons that teach each query's method, read off the `expect` labels above against TITLES; [] is
# "none" — the right answer for the two problems the library does not cover. A pick outside the list is
# wrong. JSON-literal on purpose: tools/lab-corpus.cjs reads QUERIES and ACCEPT out of this file as text, so
# `npm run bench` in desk/ scores the product's pickLesson() against the same ground truth, without Python.
ACCEPT = {
    "Solve for x: 3x - 7 = 11": ["bAerID24QJ0"],
    "Solve for x: 2x^2 - 5x - 3 = 0": ["2ZzuZvz33X0", "u1SAo2GiX8A"],
    "Factor completely: x^2 + 7x + 12": ["D3a8NnpQ2vU", "u1SAo2GiX8A"],
    "Solve the system: 2x + y = 7 and x - y = 2": ["uzyd_mIJaoc", "V7H1oUHXPkg"],
    "Solve: x/4 + 3 = 8": ["jWpiMu5LNdg", "bAerID24QJ0"],
    "Solve for x: 5(x - 2) = 3x + 8": ["bAerID24QJ0"],
    "Does 2x + 3 = 2x + 5 have a solution?": ["qsL_5Y8uWPU"],
    "What is 15% of 240?": [],
    "The angles of a triangle are x, 2x and 3x. Find x.": []
}

STOP = set("the a an and or of to in is it this that we you i so if then be are was for on with as "
           "at by have has do does can just like get got going go what which our your let me us "
           "now here there right okay ok um uh well thing things one two want know see say".split())


def tokens(s):
    s = s.lower().replace("^", " ").replace("²", " squared ")
    return [w for w in re.findall(r"[a-z]+", s) if w not in STOP and len(w) > 1]


class Index:
    def __init__(self, docs):
        self.docs = docs
        self.tf = [Counter(tokens(d["text"])) for d in docs]
        df = Counter()
        for tf in self.tf:
            df.update(tf.keys())
        n = len(docs)
        self.idf = {w: math.log((n + 1) / (c + 0.5)) for w, c in df.items()}
        self.avg = sum(sum(tf.values()) for tf in self.tf) / max(n, 1)

    def search(self, query, k=3, concept=None):
        """
        `concept` gates the result: when given, a window (or its lesson's title) must contain at
        least one concept token, or it does not count. Run 1's false positive — a triangle-angles
        question matching a systems lesson on the word "sum" — is what this refuses. Title tokens
        also add score, because the title is where the concept is actually named.
        """
        q = tokens(query)
        ct = set(tokens(concept)) if concept else set()
        scores = []
        for i, tf in enumerate(self.tf):
            title_t = set(tokens(TITLES.get(self.docs[i]["video"], "")))
            if ct and not (ct & set(tf.keys()) or ct & title_t):
                continue
            L = sum(tf.values())
            s = 0.0
            for w in q:
                if w in tf:  # BM25
                    f = tf[w]
                    s += self.idf.get(w, 0) * f * 2.2 / (f + 1.2 * (0.25 + 0.75 * L / self.avg))
            s += TITLE_WEIGHT * len(ct & title_t)
            scores.append((s, i))
        scores.sort(reverse=True)
        return [(s, self.docs[i]) for s, i in scores[:k] if s > 0]


def load():
    docs = []
    for path in sorted(glob.glob(os.path.join(LESSONS, "*.en.vtt"))):
        vid = os.path.basename(path).split(".")[0]
        cues = stamped(path)
        dur = cues[-1]["t"] if cues else 1
        rate = wpm(cues, dur)
        flag = "  ⚠ de-overlap suspect" if rate > 280 else ""
        print(f"  {vid}  {len(cues):4} cues  {dur:4}s  {rate:3.0f} wpm{flag}")
        for w in windows(cues, 40):
            docs.append({"video": vid, **w})
    return docs


CONCEPT_SCHEMA = {"type": "object", "properties": {"concept": {"type": "string"}}, "required": ["concept"]}


PICK_SCHEMA = {"type": "object", "properties": {"lesson": {"type": "string"}}, "required": ["lesson"]}


def pick_lesson(problem):
    """
    Run 3: choose from the syllabus. With a curated library the honest question is not "name the
    topic" but "which of these lessons teaches what this needs — or none". Lessons doc §7 says a
    menu tends to get something picked whether or not it applies, so the two out-of-library
    problems are the test of whether 'none' survives the menu.
    """
    menu = "\n".join(f"- {vid}: {title}" for vid, title in TITLES.items())
    out, _ = ask([], f"A student is stuck on this problem:\n{problem}\n\nThese lessons are "
                     f"available:\n{menu}\n\nWhich ONE lesson teaches the method this problem "
                     f"needs? Answer with its id. Most problems are NOT covered by a small library "
                     f"like this — if none of these teaches the required method, answer exactly "
                     f"'none'. A wrong lesson wastes the student's time; 'none' does not.",
                 PICK_SCHEMA, timeout=300)
    return (loads(out) or {}).get("lesson", "none").strip()


def concept_of(problem):
    out, _ = ask([], f"In at most five words, name the maths topic a student needs to solve this: "
                     f"{problem}. Topic name only.", CONCEPT_SCHEMA, timeout=300)
    return (loads(out) or {}).get("concept", "")


def main():
    print("lessons:")
    docs = load()
    idx = Index(docs)
    print(f"\n{len(docs)} windows of ~40 s\n")
    NO_HIT = 2.0  # below this, say "no segment" rather than jump somewhere off-topic

    for problem, expect in QUERIES:
        print(f"{'─' * 78}\nQ: {problem}\n   expect: {expect}")
        hits = idx.search(problem)
        top = hits[0][0] if hits else 0
        if top < NO_HIT:
            print(f"   plain   → no confident segment (top score {top:.1f})")
        else:
            for s, d in hits[:2]:
                print(f"   plain   {s:5.1f}  {d['video']} @ {d['t'] // 60:02d}:{d['t'] % 60:02d}  «{d['text'][:110]}…»")

        concept = concept_of(problem)
        tag = f"[+ model named the topic: “{concept}”]"
        hits2 = idx.search(problem + " " + concept)
        top2 = hits2[0][0] if hits2 else 0
        if top2 < NO_HIT:
            print(f"   expand  → no confident segment (top {top2:.1f})  {tag}")
        else:
            s, d = hits2[0]
            print(f"   expand  {s:5.1f}  {d['video']} @ {d['t'] // 60:02d}:{d['t'] % 60:02d}  «{d['text'][:110]}…»  {tag}")
        # Run 2: same expansion, but the concept must actually appear, and titles count.
        hits3 = idx.search(problem + " " + concept, concept=concept)
        top3 = hits3[0][0] if hits3 else 0
        if top3 < NO_HIT:
            print(f"   gated   → no segment teaches this (top {top3:.1f})")
        else:
            s, d = hits3[0]
            print(f"   gated   {s:5.1f}  {d['video']} @ {d['t'] // 60:02d}:{d['t'] % 60:02d}  "
                  f"«{TITLES.get(d['video'], '')[:48]}» — {d['text'][:70]}…")
        # Run 3: pick the lesson from the syllabus, then the best window inside it.
        vid = pick_lesson(problem)
        if vid not in TITLES:
            print(f"   pick    → none of the library's lessons (model said “{vid}”)")
        else:
            inside = [(s, d) for s, d in idx.search(problem + " " + TITLES[vid], k=len(docs)) if d["video"] == vid]
            s, d = inside[0] if inside else (0, {"video": vid, "t": 0, "text": ""})
            print(f"   pick    {s:5.1f}  {vid} @ {d['t'] // 60:02d}:{d['t'] % 60:02d}  «{TITLES[vid][:48]}» — {d['text'][:70]}…")
    print(f"{'─' * 78}\nJudge by hand: does the segment teach the concept the problem needs?")


if __name__ == "__main__":
    main()
