"""
PoC B′ — Spanish hints where the TENSE comes from a rule table and the model only explains it.

poc_hints.py let the model choose the tense and it chose wrong on 2 of 6 second hints — present
perfect for "desde 2019", present for "mañana". Those are decisions, and they are the kind code
can make: a time marker names a tense the way a shirt number names a player. So here the tense,
person and ending are resolved deterministically from the sentence, handed to the model as a rule
card, and the model's job shrinks to explaining the rule it was given without writing the form.

It cannot teach a wrong tense, because it does not pick one. Whether it can still teach — hint
quality — is what this run judges. Same six problems, same leak check, same two-hint escalation
with the fix from the maths run (hint 2 sees hint 1 and must go one step further).

    python vision/poc_hints_es.py
"""
import json
import os
import re

from poc_hints import PROBLEMS, leaks
from vlm import ask, loads

OUT = os.path.join("artifacts", "vision", "desk", "hints")

# ---- the rule table: what a beginner's course actually says --------------------------------
TENSES = {
    "preterite": {
        "name": "pretérito indefinido (simple past)",
        "when": "a completed action at a stated past time — markers like ayer, anoche, la semana pasada, el año pasado, en 2010",
        "how": "drop the infinitive ending and add: -ar → é, aste, ó, amos, asteis, aron · -er/-ir → í, iste, ió, imos, isteis, ieron",
    },
    "future": {
        "name": "futuro simple",
        "when": "an action that will happen — markers like mañana, el próximo…, pasado mañana, la semana que viene",
        "how": "keep the WHOLE infinitive and add: é, ás, á, emos, éis, án. Most verbs are regular here, including ir. Irregular stems: tener→tendr-, poner→pondr-, salir→saldr-, hacer→har-, decir→dir-, poder→podr-, saber→sabr-, querer→querr-, venir→vendr-",
    },
    "imperfect": {
        "name": "pretérito imperfecto",
        "when": "a habitual or ongoing past action, or background — markers like cuando era niño, todos los días, siempre, de niño, mientras",
        "how": "drop the ending and add: -ar → aba, abas, aba, ábamos, abais, aban · -er/-ir → ía, ías, ía, íamos, íais, ían. Only three irregulars: ser (era…), ir (iba…), ver (veía…). Stem changes do NOT apply in this tense",
    },
    "present": {
        "name": "presente de indicativo",
        "when": "a current fact or habit; ALSO for an action that started in the past and continues now with 'desde' (Spanish uses the present where English uses 'have been …ing'); ALSO in the 'si' clause of a real condition whose main clause is future",
        "how": "drop the ending and add: -ar → o, as, a, amos, áis, an · -er → o, es, e, emos, éis, en · -ir → o, es, e, imos, ís, en. Watch stem changes in the boot forms (tener→tien-, querer→quier-, poder→pued-, jugar→jueg-)",
    },
}

MARKERS = [
    (r"\b(ayer|anoche|la semana pasada|el a[ñn]o pasado|hace \w+ (d[ií]as|a[ñn]os|semanas)|en \d{4}\b(?! desde))", "preterite"),
    (r"\b(ma[ñn]ana|pasado ma[ñn]ana|el pr[oó]ximo|la pr[oó]xima|que viene)\b", "future"),
    (r"\b(cuando era|de ni[ñn]o|de ni[ñn]a|todos los d[ií]as|siempre|mientras|antes)\b", "imperfect"),
    (r"\bdesde\b", "present"),
    (r"^\s*si\b|\bsi ______", "present"),
]

PERSONS = [
    (r"\byo\b", "yo (1st singular)"), (r"\bt[uú]\b", "tú (2nd singular)"),
    (r"\bnosotr[oa]s\b", "nosotros (1st plural)"), (r"\bvosotr[oa]s\b", "vosotros (2nd plural)"),
    (r"\b(ellos|ellas|ustedes)\b", "ellos (3rd plural)"),
    (r"\b([eé]l|ella|usted)\b", "él/ella (3rd singular)"),
]
IMPERSONAL = {"llover", "nevar", "haber"}


def resolve(sentence):
    """Sentence → rule card. Deterministic; every field is traceable to a marker in the text."""
    s = sentence.lower()
    verb = re.search(r"\((\w+)\)", s).group(1)
    tense = "present"
    reason = "no time marker: a current fact or habit"
    for pat, t in MARKERS:
        m = re.search(pat, s)
        if m:
            tense, reason = t, f"the marker «{m.group(0).strip()}»"
            break
    person = "él/ella (3rd singular)" if verb in IMPERSONAL else "yo (1st singular)"
    if verb in IMPERSONAL:
        preason = f"{verb} is a weather/impersonal verb, always 3rd person singular"
    else:
        preason = "no pronoun is written, so the subject is understood — read it from the context"
        for pat, p in PERSONS:
            if re.search(pat, s):
                person, preason = p, f"the subject «{p.split(' ')[0]}»"
                break
    cls = verb[-2:]
    # The one fact the chart row does not carry: whether this verb is irregular in this tense.
    # Stated as a warning, never as the form.
    STEM_CHANGERS = {"tener", "querer", "poder", "jugar", "llover", "pensar", "volver", "dormir", "pedir"}
    note = ""
    if tense == "present" and verb in STEM_CHANGERS:
        note = f"Warning: {verb} changes its stem in the present tense (a 'boot' verb) — the student must apply the stem change before the ending."
    if tense == "future" and verb in ("tener", "poner", "salir", "hacer", "decir", "poder", "saber", "querer", "venir"):
        note = f"Warning: {verb} has an irregular future stem."
    if tense == "imperfect" and verb in ("ser", "ir", "ver"):
        note = f"Warning: {verb} is one of the three irregular imperfect verbs."
    return {"verb": verb, "class": f"-{cls} verb", "tense": tense, "tense_reason": reason,
            "person": person, "person_reason": preason, "note": note,
            **{k: v for k, v in TENSES[tense].items() if k != "how"}}


def card(r):
    """
    What the model is allowed to know. Iteration 1 included the endings table, and with the
    endings in hand the model assembled the answer in its second hint six times out of six
    ("combine the stem com with the ending í"), once with a wrong stem. So the card names the
    tense, the person and the reasons, and points at the ROW of the student's own chart — it
    never contains the ending, so no hint can be built out of it.
    """
    return (f"Verb: {r['verb']} ({r['class']})\n"
            f"Tense to use: {r['name']} — because of {r['tense_reason']}\n"
            f"Person: {r['person']} — because of {r['person_reason']}\n"
            f"This tense is used for: {r['when']}\n"
            f"Where the student finds the ending: the {r['person']} row of their {r['name']} chart "
            f"for {r['class']}s. {r.get('note', '')}")


HINT_SCHEMA = {"type": "object", "properties": {"hint": {"type": "string"}, "what_to_try_next": {"type": "string"}},
               "required": ["hint", "what_to_try_next"]}


def hint(q, rule, previous=None):
    stage = ("The student already had this hint and is still stuck:\n«" + previous + "»\n"
             "Give the NEXT hint. It must go ONE STEP FURTHER than the previous one — do not repeat "
             "it — and still stop short of writing the form.") if previous else \
            "Give the FIRST hint: help them notice the clue in the sentence and name the tense."
    prompt = (
        "You are a Spanish tutor for a beginner. Explain in English; Spanish only for the words in "
        "the sentence and for endings.\n\n"
        f"Exercise: {q}\n\n"
        "The grammar that applies has already been worked out for you. Use it and do NOT contradict "
        f"it:\n{card(rule)}\n\n"
        "Rules, absolute: never write the conjugated verb form, never fill in the blank, and never "
        "state the ending itself — not 'í', not '-aba', not 'stem + ending'. The student has a "
        "conjugation chart; your job is to get them to the right row of it and to warn them about "
        f"any irregularity. Two or three sentences.\n\n{stage}"
    )
    out, dt = ask([], prompt, HINT_SCHEMA, timeout=300)
    return loads(out) or {"hint": out, "what_to_try_next": ""}, dt


def main():
    os.makedirs(OUT, exist_ok=True)
    log, leaked = [], 0
    print("RULE TABLE — what the resolver decided for each sentence (this part is code, judge it too)\n")
    rules = []
    for p in PROBLEMS["spanish"]:
        r = resolve(p["q"])
        rules.append(r)
        print(f"  {p['q'][10:58]:48} → {r['tense']:9} {r['person'][:8]:8}  ({r['tense_reason']})   want: {p['answer']}")
    print("\n" + "=" * 78 + "\nHINTS\n" + "=" * 78)
    for p, r in zip(PROBLEMS["spanish"], rules):
        h1, t1 = hint(p["q"], r)
        h2, t2 = hint(p["q"], r, previous=h1["hint"])
        # Iteration 1 taught the leak checker a blind spot: "stem com + ending í" never contains
        # the word comí. So also flag any quoted ending that completes the answer.
        def assembles(text, answer):
            for m in re.findall(r"[«'\"*-]\s*(-?[a-záéíóúñ]{1,5})\s*[»'\"*]", text.lower()):
                e = m.strip("-")
                if len(e) >= 1 and answer.lower().endswith(e) and e != answer.lower():
                    return f"ending «{e}»"
            return None
        l1 = leaks(h1["hint"] + " " + h1["what_to_try_next"], p["leak_terms"]) or assembles(h1["hint"] + " " + h1["what_to_try_next"], p["answer"])
        l2 = leaks(h2["hint"] + " " + h2["what_to_try_next"], p["leak_terms"]) or assembles(h2["hint"] + " " + h2["what_to_try_next"], p["answer"])
        leaked += bool(l1 or l2)
        print(f"\nQ: {p['q']}\n   answer (hidden from model): {p['answer']}")
        print(f"   hint 1 ({t1:.1f}s){'  ⚠ LEAK: ' + l1 if l1 else ''}\n      {h1['hint']}\n      → {h1['what_to_try_next']}")
        print(f"   hint 2 ({t2:.1f}s){'  ⚠ LEAK: ' + l2 if l2 else ''}\n      {h2['hint']}\n      → {h2['what_to_try_next']}")
        log.append({"q": p["q"], "rule": r, "hint1": h1, "hint2": h2, "leak1": l1, "leak2": l2})
    print(f"\nspanish (rule table): automatic leak check — {leaked}/{len(rules)} problems leaked the answer")
    json.dump(log, open(os.path.join(OUT, "hints_es_rules.json"), "w", encoding="utf-8"), indent=1, ensure_ascii=False)


if __name__ == "__main__":
    main()
