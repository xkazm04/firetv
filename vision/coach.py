"""
The retrieval prototype: a paused frame, a circled player, a question — answered from expert
commentary rather than from the model's own reading of the tactics.

The design is a direct consequence of what was measured:

  Finding 7  the model cannot name the tactic in a frame, and a vocabulary makes it worse, not
             better - it picks confidently from the menu. So it is NEVER asked to.
  Finding 4  a drawn circle reliably steers its attention. So the circle does the grounding.
  Finding 3  it describes single frames accurately. So it is asked ONLY to describe.
  Section 3c the library holds explanations a human already wrote. So those carry the analysis.

Three steps, and the split matters: the model SEES (step 1), the index FINDS (step 2), and the
model WRITES (step 3) using only what the index found. No step asks it to know basketball.

    python vision/coach.py --frame F.jpg --ask "what should the defence do here?"
    python vision/coach.py --frame F.jpg --at 0.62,0.58 --ask "what is this player doing?"

`--show-retrieval` prints the passages, which is how you tell a grounded answer from a fluent one.
"""
import argparse
import json
import os
import sys

from probe import ask, b64
from ask_frame import circle
import retrieve

for _s in (sys.stdout, sys.stderr):
    if hasattr(_s, "reconfigure"):
        _s.reconfigure(encoding="utf-8", errors="replace")

# Below this cosine similarity the library does not cover the question, and saying so is the
# honest answer. Measured spread: a well-covered concept lands 0.87-0.90, a vague on-topic
# question 0.73-0.75, and "how do I cook risotto" still managed 0.643 - embeddings of jargon are
# never that far apart, so the floor has to sit above it. The model's own refusal is the second
# layer, and it caught the risotto question even when this one let it through.
FLOOR = 0.68

OBSERVE_SCHEMA = {
    "type": "object",
    "properties": {
        "sport": {"type": "string"},
        "situation": {"type": "string"},
        "marked_player": {"type": "string"},
        "nearby_players": {"type": "string"},
        "scoreboard": {"type": "string"},
    },
    "required": ["sport", "situation", "marked_player", "nearby_players", "scoreboard"],
}


def observe(frame, marked):
    """Step 1 — what is literally visible. Deliberately no tactical vocabulary in the prompt."""
    prompt = (
        "Describe what is literally visible in this sports frame. Do NOT name any play type, "
        "tactic or strategy - only what you can see.\n"
        "  situation: where the ball is, which players are near it, what the shape on court looks like\n"
        "  marked_player: " + (
            "the player inside the yellow circle - kit colour, shirt number, body position, what "
            "they appear to be doing. If nothing is inside the circle, say so."
            if marked else "say 'none marked'") + "\n"
        "  nearby_players: the players closest to the marked player or to the ball, by kit and number\n"
        "  scoreboard: any score, clock or period visible, verbatim. Say 'none' if absent."
    )
    out, dt = ask([b64(frame)], prompt, OBSERVE_SCHEMA)
    try:
        return json.loads(out), dt
    except json.JSONDecodeError:
        return {"situation": out[:400], "marked_player": "", "nearby_players": "", "scoreboard": ""}, dt


def main(a):
    frame = circle(a.frame, tuple(float(x) for x in a.at.split(",")), a.radius) if a.at else a.frame
    if a.at:
        print(f"circled at {a.at}\n")

    # ---- 1. see ------------------------------------------------------------
    obs, dt = observe(frame, bool(a.at))
    print(f"OBSERVED ({dt:.1f}s)")
    for k in ("situation", "marked_player", "nearby_players", "scoreboard"):
        if obs.get(k) and obs[k].lower() not in ("none", "none marked"):
            print(f"  {k:16} {obs[k][:200]}")

    # ---- 2. find -----------------------------------------------------------
    # TWO queries, merged, and the reason is a bug this replaced. Blending the question with the
    # scene description into one embedding buried the answer: asked why a big man hangs back near
    # the rim - which is drop coverage, the second best-attested concept in the library - a
    # combined query returned "slip to the basket" and "hide the big", because a frame of players
    # standing still dominated the vector. The question and the situation are asking different
    # things, so they get a search each and the results are merged by score.
    # Third query: let the model write the answer it THINKS is right, and search with that. The
    # viewer says "the big man hangs back near the rim"; a coach says "drop coverage"; the
    # embedding model does not bridge the two, and scored the correct concept (0.65) BELOW several
    # rambling near-misses (0.75). Expanding the question first put drop coverage top at 0.90,
    # from three independent channels.
    #
    # This does not reintroduce the Finding 7 problem. The model is guessing a WORD, not reading
    # the picture, and the guess is never shown to the viewer - it only steers the search. If it
    # guesses wrong, the passages it finds score low and the floor below catches it, so a bad
    # guess costs a retrieval, not a false answer.
    # ...but ONLY for questions about the game, never about this frame. Expanding "what is
    # happening in this play?" made the model invent a pick and roll, retrieval then confirmed the
    # invention at 0.905, and the citations made it look grounded - on a frame that is actually a
    # free throw. Expansion answers the hypothetical it just wrote, so pointing it at a specific
    # frame launders a guess into a sourced claim, which is worse than no answer.
    kind, _ = ask([], f'A viewer watching {a.sport} asks: "{a.ask}"\n'
                      "Is this a question about the GAME in general - a rule, a tactic, what "
                      "something is called, why teams do it - or a question about THIS SPECIFIC "
                      "MOMENT on screen?\nAnswer with one word: general or specific.", timeout=300)
    conceptual = "general" in kind.strip().lower()[:20]
    print(f"\nQUESTION   {'general — expanding' if conceptual else 'specific to this frame — NOT expanding'}")

    hypothetical = ""
    if conceptual:
        hypothetical, _ = ask([], f'A {a.sport} viewer asks: "{a.ask}"\n'
                                  "Write the 2-sentence answer a coach would give, using standard "
                                  f"{a.sport} terminology and naming the technical term for it. "
                                  "Do not hedge.", timeout=300)
        print(f"EXPANDED   {hypothetical.strip()[:150]}…")

    passages = retrieve.load()
    merged = {}
    queries = [(1.0, a.ask), (0.9, f"{obs.get('situation','')} {obs.get('marked_player','')}")]
    if hypothetical:
        queries.insert(1, (1.0, hypothetical))
    for weight, text in queries:
        if not text.strip():
            continue
        for score, p in retrieve.query(text, passages, k=a.k * 2, sport=a.sport):
            key = (p["clip"], p["t"], p["text"][:40])
            if score * weight > merged.get(key, (0, None))[0]:
                merged[key] = (score * weight, p)
    hits = sorted(merged.values(), key=lambda s: -s[0])[: a.k]
    top = hits[0][0] if hits else 0.0
    print(f"\nRETRIEVED  top similarity {top:.3f}")
    for score, p in hits:
        print(f"  {score:.3f}  {p['uploader']} [{p['t']//60:02d}:{p['t']%60:02d}]  {p['text'][:90]}…")
        if a.show_retrieval:
            print(f"         {p['text']}")

    if top < FLOOR:
        print(f"\nANSWER\n  The library does not cover this (best match {top:.2f}, floor {FLOOR}). "
              f"Rather than improvise, say so and add a clip that does.")
        return

    # ---- 3. write ----------------------------------------------------------
    sources = "\n\n".join(
        f"[{i+1}] {p['uploader']} ({p['title'][:50]}) at {p['t']//60:02d}:{p['t']%60:02d}:\n{p['text']}"
        for i, (_, p) in enumerate(hits))
    prompt = (
        f"A viewer has paused a {obs.get('sport','sports')} broadcast and asked:\n"
        f"  \"{a.ask}\"\n\n"
        f"What is visible on the paused frame:\n"
        f"  situation: {obs.get('situation','')}\n"
        f"  the player they circled: {obs.get('marked_player','')}\n"
        f"  nearby: {obs.get('nearby_players','')}\n\n"
        f"Expert commentary from coaching breakdowns, which is the ONLY source of tactical "
        f"knowledge you may use:\n{sources}\n\n"
        "Answer the viewer in under 90 words, conversationally, as if speaking to them in their "
        "living room. Rules:\n"
        "- Every tactical claim must come from the commentary above. Cite it as [1], [2] etc.\n"
        "- You may describe what is on the frame from the observations, without a citation.\n"
        "- Do NOT name the specific play being run: you cannot reliably tell that from a frame.\n"
        "- If the commentary does not actually answer the question, say plainly that you do not "
        "know, and say what it does cover instead. That is a good answer, not a failure."
    )
    out, dt = ask([], prompt, timeout=600)
    print(f"\nANSWER ({dt:.1f}s)\n  " + out.strip().replace("\n", "\n  "))


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--frame", required=True)
    ap.add_argument("--ask", required=True)
    ap.add_argument("--at", help="circle centre as x,y fractions")
    ap.add_argument("--radius", type=float, default=0.05)
    ap.add_argument("--sport", default="basketball")
    ap.add_argument("-k", type=int, default=5)
    ap.add_argument("--show-retrieval", action="store_true")
    main(ap.parse_args())
