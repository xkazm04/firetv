# Study Desk — feasibility PoC results

**Date:** 2026-09-07 · follows [STUDY-DESK-SCOPE.md](STUDY-DESK-SCOPE.md) §4. All runs local:
`qwen3.8:27b` on the RTX 4090 via Ollama, no cloud, no TV. Scripts in `vision/poc_*.py`; logs and
pages under `artifacts/vision/desk/` (gitignored).

**Kill criteria, as set before running:** A fails if equations are mangled on more than a few
problems per page. B fails if the model leaks the answer or gives a wrong hint on more than one in
ten. C fails if hand judgement says the segment is off-topic more often than on.

| PoC | Verdict | One line |
|---|---|---|
| **A. Worksheet OCR** | **pass** (synthetic ceiling; real photos pending) | 10/10 equations, 8/8 sentences, 182/182 essay words — at *every* degradation level; circle selects the right item 16/16 |
| **B. Socratic hints — maths, essay** | **pass** | maths 24/24 correct, 0 leaks; essay sound; escalation is the weak part |
| **B. Socratic hints — Spanish, model picks the tense** | **fail** | 2 of 6 problems get a *wrong* second hint, both tense-logic errors a beginner would copy |
| **B′. Spanish, rule table decides, model explains** | **pass** (2nd iteration) | 6/6 right tense, 0 leaks, 0 wrong statements — once the card stops carrying the ending |
| **C. Problem → lesson segment** | **pass, with a design lesson** | plain text 4/9 → topic-expanded 7/9 → choose-from-syllabus **8/9** |

---

## A. Worksheet OCR

Pages rendered from known text — a maths sheet with typeset superscripts, a Spanish fill-in
exercise, a four-paragraph essay — then degraded three ways to imitate a phone photo: perspective
pull of up to 6% a side, up to 2.5° tilt, a lamp-side brightness gradient, Gaussian blur, sensor
noise, JPEG at quality 68. "Mild" is half of each; "harsh" is all of it.

| page | clean | mild | harsh |
|---|---|---|---|
| maths — items found | 10/10 | 10/10 | 10/10 |
| maths — **equations character-exact** | **10/10** | **10/10** | **10/10** |
| Spanish — sentences intact | 8/8 | 8/8 | 8/8 |
| essay — similarity to the printed text | 1.000 | 1.000 | 1.000 |
| **circle selects the right item** (maths + Spanish) | — | **8/8** | **8/8** |

Equation scoring is strict: every digit, variable, operator and exponent, in order, after
normalising `²` to `^2`. Superscripts survived every level.

**Latency**, per page, measured with an idle GPU: **~25 s**, and the same for a 10-item maths
sheet and a 182-word essay — the cost is the output tokens, not the picture. (Figures logged
during the runs were higher because three PoCs shared the GPU.) Fine once per page in a session;
wrong for anything interactive. The product needs a visible *reading…* state, and this is the
concrete reason to put the read on Bedrock rather than a local model.

**A harness bug worth recording.** The first circle run scored 0/4 on the harsh maths page, with
the model saying "nothing is inside the circle" three times. It was right: the ring was drawn at
the page's pre-warp coordinates and landed in blank space between items. A user circles what they
*see*, so the ring must be placed in photo space; pushed through the same warp, the score is 16/16.
The model refusing to invent an item under an empty ring is the behaviour we want, and it would
have read as a failure.

**The honest caveat.** These pages are rendered, not photographed. Real phone photos of real
worksheets are still the test that matters; `poc_ocr.py --photos` reads them when they arrive.

## B. Socratic hint quality

Two hints per problem — a first nudge, then the escalation for a student still stuck. Leaks are
checked automatically against the known answer; correctness and usefulness were judged by reading
all of them.

### Maths — 12 problems, 24 hints

| | result |
|---|---|
| mathematically correct | **24/24** |
| final answer leaked (automatic + by reading) | **0/12** |
| wrong or misleading hint | **0** |
| escalation actually escalates | **9/12** |

The stance holds. Examples of what "holds" looks like — the rectangle problem (answer 12 cm) gets
*"write down 34 = 2(5) + 2L, then subtract 10 from both sides"*; the triangle problem (answer 30)
gets *"x + 2x + 3x = 180 and simplify the left side"*. Method complete, answer withheld.

Three things to fix in the product prompt, none of them kill-criterion material:

1. **Weak escalation.** In 3 of 12 problems hint 2 restates hint 1 ("add 7 to both sides" twice).
   The second prompt needs the first hint *and* a demand to go one step further than it.
2. **Syllabus-blind method choice.** For `2x² − 5x − 3 = 0` it reaches for the discriminant and
   the quadratic formula; the sheet is a factoring unit and the expression factors cleanly. The
   hint is correct and off-syllabus. Once *Syllabus & next practice* exists, the current topic
   goes into the prompt.
3. **LaTeX in the output** (`$b^2 - 4ac$`, `\frac{…}`). Either render it on the TV or forbid it;
   spoken via TTS it is noise.

**Latency:** **~1.7 s per hint** with an idle GPU. Hinting is text-only and short; it is not the
slow step. (The 10–46 s logged during the run was contention with the OCR jobs.)

### Spanish — 6 problems, 12 hints: **fail**

Zero leaks, and every *first* hint was right: it read the time marker, named the tense, pointed at
the person. Then the escalation went wrong on a third of the problems, and wrong in the worst way:

| problem | correct form | what hint 2 said |
|---|---|---|
| *Mañana nosotros ___ (ir) al cine* | **iremos** (future, regular) | "'ir' is irregular in the **present** tense… what is the stem change for nosotros?" — wrong tense, and *ir* is regular in the future |
| *Ellos ___ (vivir) en Madrid desde 2019* | **viven** (Spanish uses the present with *desde*) | "you need the **present perfect**… conjugate the auxiliary *haber*" — the classic English-speaker's error, taught as the rule |

Both are tense-selection errors a beginner makes, delivered with a tutor's confidence. A student
who followed them would write *vamos* and *han vivido* and be marked wrong. That is 2/6 above the
one-in-ten line, and the failure is in exactly the place the feature is for. (One hint also
switched into Spanish despite the instruction to explain in English — minor next to the above.)

**What this says.** The local model's Spanish grammar is not reliable enough to tutor from *when
it chooses the tense*. Decision taken: take that choice away from it.

### Spanish, rule-table design (`poc_hints_es.py`) — two iterations: **pass**

A time marker names a tense the way a shirt number names a player, so the tense, person and reasons
are resolved in code from the sentence and handed to the model as a rule card. The model's job
shrinks to explaining the rule it was given. Same six problems, same leak check.

| | iteration 1 — card includes the endings | iteration 2 — card points at the chart row, never the ending |
|---|---|---|
| resolver (code) chose the right tense + person | 6/6 | 6/6 |
| hint teaches the right tense | **6/6** (both earlier failures fixed) | **6/6** |
| second hint assembles the answer | **6/6** ✗ — "combine the stem *com* with *í*", "*jug + aba*", one arrow reading "→ jogaba" | **0/6** |
| wrong form stated | 1 (*lluv-* + *e*, stem change missed) | 0 |
| latency per hint | ~2–3 s | ~3–5 s |

Iteration 1 reproduced, in grammar, the lesson the sports work already recorded: **give the model
the pieces of the answer and it hands them over.** With the endings on the card and an instruction
to "go one step further", the second hint went straight to *stem + ending* every time — and the
automatic leak check missed all six, because the finished word never appears. The checker now
also flags a quoted ending that completes the answer.

Iteration 2 withholds the ending and keeps the irregularity warning. Every second hint now sends
the student to *"the yo row of your pretérito indefinido chart for -er verbs"* and, where it
matters, *"adjust the vowel in the stem before adding the -er ending"* (llover) — which is the
pedagogy anyway: the chart is theirs to read.

**The design rule that generalises:** the rule card is what the model is *allowed to know*. It
carries the decision and the reasons; it never carries the thing the student is supposed to
produce.

### Essay — 4 prompts, 8 hints: pass

All sound, none write the student's sentence for them. The thesis prompt gets *"pick your strongest
reason and connect it to a specific benefit using a 'because' clause"*; the weak-paragraph prompt
gets *"combine your first two sentences to show cause and effect, and replace the vague last
sentence with a specific consequence"*. The ordering advice ("open with the most concrete") is one
defensible school among several, which is fine for a hint and would matter for a syllabus.

## C. Problem → lesson segment

Eight Khan Academy lessons (CC BY-NC-SA) on linear equations, factoring quadratics and systems by
substitution, cut into 69 windows of ~40 s. Nine problems: seven covered by the library, two
deliberately not (percentages, triangle angles), where the right answer is "no segment".

| retrieval | correct | what went wrong |
|---|---|---|
| **plain** — the problem text as the query | **4/9** | a homework problem contains almost no concept words: "Solve for x: 3x − 7 = 11" reduces to *solve*, and four different problems returned the *same* window |
| **expanded** — model names the topic, added to the query | **7/9** | "Quadratic Equations" never appears in a transcript where the teacher says *factor*; the triangle question false-matched a systems lesson on the word *sum* |
| **gated** — expansion, plus title tokens score and a hit must contain a concept term | **7/9** | fixed the quadratic via its title; the system-of-equations query drifted to "Linear equations 1"; the triangle question still passed the gate on *sum* |
| **syllabus pick** — model chooses a lesson from the eight titles, or *none*; best window inside it | **8/9** | every covered problem to the right lesson, including the two the earlier runs missed, and the *most specific* lesson each time (one-step equations for `x/4 + 3 = 8`, not the general one); said *none* for percentages; picked "Linear equations 1" for the triangle question |

**The finding that generalises:** the problem statement is the wrong query. It is written in the
language of *doing*, the lesson in the language of *teaching*, and they share almost no words.
Something has to name the concept in between, and the best way to do that with a curated library
is to let the model **choose from the syllabus** rather than name a topic freely: 8/9 against 7/9,
and the choices were the most specific lesson available every time.

The two out-of-library problems are the honesty test, and the menu half-passed it: *none* for the
percentage question, but a lesson picked for the triangle one. That pick is defensible — the
problem does reduce to a linear equation — and it is still the pattern the lessons doc §7 warns
about: given a menu, the model reaches for the nearest item. In the product, "no lesson covers
this" needs to stay a first-class answer, and the syllabus needs concept tags authored to be
matched so the choice is made on those rather than on the model's reading of a title.

---

## What this means for product modelling

- **Maths and essay are feasible end to end** on what could be tested locally: read the page,
  point at a problem, hint without leaking, jump to the lesson. OCR on real photos is the one
  open check.
- **Spanish is feasible only under the rule-table design**, and that design is now the spec: the
  tense is decided in code from the sentence, the card the model sees carries the decision and the
  reasons and never the ending, and the card itself becomes a visible object on the TV that the
  student keeps.
- **The local model is a viable development stand-in and the wrong production engine.** A 25 s
  page read is acceptable for building flows, not for a product; hints at 1.7 s are fine either
  way. Bedrock for the read is a measured need; for the hint it is a quality question (Spanish),
  not a speed one.
- **Three prompt rules carry forward:** the escalation prompt must see the previous hint and be
  told to go further; the current syllabus topic goes into every hint; no LaTeX in anything that
  will be spoken.
- **Lessons need concept tags** authored for matching; retrieval should choose from the syllabus,
  and "no lesson covers this" must remain a first-class answer.

---

## Re-measuring on the product — `npm run bench`

Every figure above was taken on the Python copies in `vision/`. `npm run bench` in `desk/` runs the same corpus
through the product's own `readPage`, `hint` and `pickLesson` and prints each baseline above beside this run,
with a pass/fail per kill criterion. It exits 1 on a fail. The corpus is `prototype/data.json` (the phone's
sample pages, byte-identical to `desk/public/samples`, and the 24 recorded maths hint stages) plus the tables
read as text from `vision/poc_hints.py` and `vision/poc_retrieval.py` (`QUERIES`, and `ACCEPT`, the lessons that
teach each query). No Python runs.

- **Replay** (the default, and what `npm test` runs through `tools/lab-bench-test.cjs`): recorded answers
  at the provider seam, with no model and no network. The read replays the page's truth, so replay checks the
  harness, not a model. The hints replay the recorded stages (0/12 leaked by `rules/maths` `leaks()`, LaTeX
  in 3), and the picks replay run 3 above (8/9).
- **Live** (`npm run bench -- --live`, operator only): the registered engines. `DESK_TEXT_ENGINE=codex`
  switches the text side, so two runs compare engines. It adds one figure the lab never had: **tap selects**.
  The phone picks the item whose *model-reported* centre is nearest the tap (`lib/desk/select.ts`). The bench
  taps each item's true centre and counts how often that rule picks the right item. The ring scored 16/16. The
  nearest centre has not been measured live yet.
