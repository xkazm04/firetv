"""
PoC B — Socratic hint quality: is the hint correct, useful, and does it keep the answer to itself?

The stance is the product (STUDY-DESK-SCOPE §1): Photomath gives the answer in a second, we give
the next step. That only works if the model can hold the line. Kill criterion: leaks the answer or
gives a wrong hint on more than one problem in ten.

Two hints per problem — the first nudge, then the escalation a student gets when the first was not
enough. Leaks are checked automatically against the known answer; correctness and usefulness are
printed for a human to judge, because a model grading its own hints is not evidence.

    python vision/poc_hints.py                 # all subjects
    python vision/poc_hints.py --subject math

Re-measured on the product, not this copy: `npm run bench` in desk/ replays the recorded maths hints
(prototype/data.json) through desk's own hint() and its one leak rule, rules/maths leaks(); PROBLEMS["math"]
is read out of this file as text (tools/lab-corpus.cjs), so keep its lines JSON-literal.
"""
import argparse
import json
import os
import re

from vlm import ask, loads

OUT = os.path.join("artifacts", "vision", "desk", "hints")

# Answers are what a leak is checked against; `leak_terms` are the tokens that would give it away.
PROBLEMS = {
    "math": [
        {"q": "Solve for x: 3x - 7 = 11", "answer": "x = 6", "leak_terms": ["6"]},
        {"q": "Solve for x: 2x^2 - 5x - 3 = 0", "answer": "x = 3 or x = -1/2", "leak_terms": ["3", "-1/2", "-0.5"]},
        {"q": "Factor completely: x^2 + 7x + 12", "answer": "(x + 3)(x + 4)", "leak_terms": ["(x+3)", "(x+4)", "3 and 4"]},
        {"q": "Solve the system: 2x + y = 7 and x - y = 2", "answer": "x = 3, y = 1", "leak_terms": ["x = 3", "y = 1", "(3, 1)"]},
        {"q": "Simplify: (3x^2 y)(4x y^3)", "answer": "12x^3 y^4", "leak_terms": ["12x^3", "12x³"]},
        {"q": "Find the slope of the line through (2, 5) and (6, 13)", "answer": "2", "leak_terms": ["slope is 2", "= 2", "equals 2"]},
        {"q": "Solve: x/4 + 3 = 8", "answer": "x = 20", "leak_terms": ["20"]},
        {"q": "A rectangle has perimeter 34 cm and width 5 cm. Find its length.", "answer": "12 cm", "leak_terms": ["12"]},
        {"q": "Expand: (x + 4)(x - 3)", "answer": "x^2 + x - 12", "leak_terms": ["x^2 + x - 12", "x² + x − 12", "x^2+x-12"]},
        {"q": "Solve for x: 5(x - 2) = 3x + 8", "answer": "x = 9", "leak_terms": ["9"]},
        {"q": "What is 15% of 240?", "answer": "36", "leak_terms": ["36"]},
        {"q": "The angles of a triangle are x, 2x and 3x. Find x.", "answer": "30", "leak_terms": ["30"]},
    ],
    "spanish": [
        {"q": "Completa: Ayer yo ______ (comer) paella con mi familia.", "answer": "comí", "leak_terms": ["comí"]},
        {"q": "Completa: Mañana nosotros ______ (ir) al cine.", "answer": "iremos", "leak_terms": ["iremos"]},
        {"q": "Completa: Cuando era niño, ______ (jugar) al fútbol todos los días.", "answer": "jugaba", "leak_terms": ["jugaba"]},
        {"q": "Completa: ¿Tú ______ (tener) hermanos?", "answer": "tienes", "leak_terms": ["tienes"]},
        {"q": "Completa: Ellos ______ (vivir) en Madrid desde 2019.", "answer": "viven", "leak_terms": ["viven"]},
        {"q": "Completa: Si ______ (llover), no saldremos.", "answer": "llueve", "leak_terms": ["llueve"]},
    ],
    "essay": [
        {"q": "Write a thesis statement for an essay arguing that schools should start later in the morning.",
         "answer": "(a thesis, not to be written for the student)", "leak_terms": []},
        {"q": "My paragraph: 'Many students are tired. Sleep is important. Schools start early. This is bad.' "
              "How do I make this paragraph stronger?", "answer": "(structure advice)", "leak_terms": []},
        {"q": "I have three arguments for later school starts: biology, attendance data, and fewer car "
              "accidents. What order should I put them in and why?", "answer": "(ordering advice)", "leak_terms": []},
        {"q": "What should a conclusion do that the introduction did not?", "answer": "(concept)", "leak_terms": []},
    ],
}

STANCE = {
    "math": "a maths tutor for a 15-year-old",
    "spanish": "a Spanish tutor for a beginner; explain in English, examples in Spanish",
    "essay": "a writing tutor for a 15-year-old",
}

HINT_SCHEMA = {
    "type": "object",
    "properties": {"hint": {"type": "string"}, "what_to_try_next": {"type": "string"}},
    "required": ["hint", "what_to_try_next"],
}


def hint(subject, q, previous=None):
    stage = ("The student has already had this hint and is still stuck:\n«" + previous + "»\n"
             "Give the NEXT hint — more specific, still not the answer.") if previous else \
            "Give the FIRST hint: the smallest push that gets them moving."
    prompt = (
        f"You are {STANCE[subject]}. Socratic rules, absolute: never state the final answer, never "
        f"write the completed solution, never fill in the blank for them. Point at the method, the "
        f"next step, or the mistake to avoid. Two or three sentences at most.\n\n"
        f"Problem: {q}\n\n{stage}"
    )
    out, dt = ask([], prompt, HINT_SCHEMA, timeout=600)
    got = loads(out) or {"hint": out, "what_to_try_next": ""}
    return got, dt


def leaks(text, terms):
    t = re.sub(r"\s+", "", text.lower().replace("²", "^2").replace("−", "-"))
    for term in terms:
        k = re.sub(r"\s+", "", term.lower().replace("²", "^2").replace("−", "-"))
        # Bare small numbers appear in method talk ("divide both sides by 3"); only flag them in an
        # answer-shaped context.
        if k.isdigit() and len(k) <= 2:
            if re.search(rf"(x=|=|is|equals|answer)[^0-9]{{0,3}}{re.escape(k)}(?![0-9])", t):
                return term
        elif k in t:
            return term
    return None


def main(a):
    os.makedirs(OUT, exist_ok=True)
    subjects = [a.subject] if a.subject else list(PROBLEMS)
    log = []
    for subject in subjects:
        print(f"\n{'=' * 78}\n{subject.upper()}\n{'=' * 78}")
        leaked = 0
        for p in PROBLEMS[subject]:
            h1, t1 = hint(subject, p["q"])
            h2, t2 = hint(subject, p["q"], previous=h1["hint"])
            l1, l2 = leaks(h1["hint"] + " " + h1["what_to_try_next"], p["leak_terms"]), \
                     leaks(h2["hint"] + " " + h2["what_to_try_next"], p["leak_terms"])
            leaked += bool(l1 or l2)
            print(f"\nQ: {p['q']}\n   answer (hidden from model): {p['answer']}")
            print(f"   hint 1 ({t1:.1f}s){'  ⚠ LEAK: ' + l1 if l1 else ''}\n      {h1['hint']}\n      → {h1['what_to_try_next']}")
            print(f"   hint 2 ({t2:.1f}s){'  ⚠ LEAK: ' + l2 if l2 else ''}\n      {h2['hint']}\n      → {h2['what_to_try_next']}")
            log.append({"subject": subject, "q": p["q"], "answer": p["answer"],
                        "hint1": h1, "hint2": h2, "leak1": l1, "leak2": l2})
        n = len(PROBLEMS[subject])
        print(f"\n{subject}: automatic leak check — {leaked}/{n} problems leaked the answer")
    json.dump(log, open(os.path.join(OUT, "hints.json"), "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    print(f"\nfull log: {OUT}/hints.json — correctness and usefulness are judged by reading it")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--subject", choices=list(PROBLEMS))
    main(ap.parse_args())
