# Math course paths

**Read from the code on 2026-09-29** (branch `perfect/2026-09-29-calculus` at `02da1c2`; the tests table also
covers `a7ef54e`). A learner in Math Buddy is
on one Math course, a **path**: the school path (linear equations, with school-year bands) or Calculus 1 (a
university first course, with no school year). This page says what a path is, why Calculus is one, how a Calculus
item is decided in code, how the answer is withheld, and what it takes to add another path. Every number on it was
measured from the code or a test run named beside it. To recheck a line, open the file it cites.

The Calculus 1 course itself (its source, its 22 topics, the reader baseline and the live run) is
[CALCULUS-1-SYLLABUS.md](CALCULUS-1-SYLLABUS.md). The screens are [DESIGN-MATH-BUDDY.md](DESIGN-MATH-BUDDY.md) and
[STUDY-DESK-SCREENS.md](STUDY-DESK-SCREENS.md).

| What | Where |
|---|---|
| The paths, and every lookup by path | `desk/src/lib/library/paths.ts` |
| The Calculus 1 spine (topics and their practice shapes, no examples) | `desk/src/lib/library/calculus1.spine.ts` |
| The Calculus 1 example corpus (a test fixture) | `desk/src/lib/library/calculus1.ts` |
| The school spine | `desk/src/lib/library/syllabus.ts` (`SYLLABUS`, `expectedIndex`) |
| The expression engine | `desk/src/lib/rules/calc-expr.ts` |
| The shapes, the checker, the leak check, the slips, the page reader | `desk/src/lib/rules/calc.ts` |
| The settle rule and the slip lists per topic | `desk/src/lib/rules/maths.ts` (`settleSpec`, `slipsFor`) |
| The pipelines | `desk/src/lib/desk/{items,mark,explain,hint,memory}.ts`, `desk/src/app/api/hint/route.ts` |
| The profile and the item as the store keeps them | `desk/src/lib/session/store.ts` (`Profile.mathPath`, `PracticeItem.spec`, `shown`) |
| The TV | `desk/src/tv/{profileRows,keys,mathsRows,rulerRows}.ts`, `desk/src/maths/MathsTV.tsx` |

## 1. What a path is

`MathPath` is `"school" | "calc1"`. `PATHS` holds one `PathInfo` per path: an id, a name, a one-sentence blurb,
`school` (true when its topics carry a school year) and its topics, in order. Each `PathTopic` has an id, a name, a
strand, a blurb, its prerequisites (earlier topics of the same path) and, on the school path only, a lesson id and a
`year` per school system.

| path | name | topics | `school` | built from |
|---|---|---|---|---|
| `school` | Linear equations | 3 | true | `SYLLABUS`, unchanged, with its US/UK/CZ/DE years |
| `calc1` | Calculus 1 | 22 in six strands | false | `CALC1_SPINE`; no topic has a year |

Topic ids are unique across both paths (`tools/maths-paths-test.cjs` test 1: 25 ids, none in two paths), so
`topicIn(id)` finds a topic without knowing the path, and `pathOfTopic(id)` names the path it is on.

**Where a learner's path lives.** `Profile.mathPath` in `store.ts`, optional. `pathOf(profile)` reads it: only the
string `"calc1"` is Calculus, and anything else, including nothing, is the school path, which is the default.
`pathChecked` drops any other value when `session.json` loads and when a `profile.draft` arrives, so a junk path
never reaches a screen (`tools/maths-course-test.cjs` test 1). `learnerPath(session)` is the path of the learner at
the desk, or the school path when no one is seated.

**How the D-pad chooses it.** The profile screen has a **Maths course** row (`profileRows`, `COURSES = ["school",
"calc1"]`) while Maths is among the draft's interests. Its two cells are the paths' names, Linear equations and
Calculus 1. Select posts `profile.draft {mathPath}`, and Save keeps it. Menu on a learner copies `mathPath` into the
draft with the other fields. Turning Maths off hides the row but leaves the draft's `mathPath` as it was.

**What "first-class" means here.** No screen or pipeline reads a global topic list for Calculus. Each one asks
`paths.ts` for the learner's path or for the topic's own path:

- the Topics stops (`topicStops`), the ruler and Tonight's strip, the topic states and Tonight's count;
- where `topic.open` and "Teach me something" put the focus (`topicsFocus`, from `nextOn`);
- the practice route's gate (`topicIn`) and practice generation (`pathOfTopic`);
- the history label on a marked set, the evening note and the explanation's topic (`topicIn`);
- the hint's stance and the lesson pick (`learnerPath` in `api/hint/route.ts`).

One list is left behind: `TOPIC_STOPS` in `keys.ts` is still `SYLLABUS`, "kept for the existing tests". The Topics
handler walks `topicStops(s)`.

## 2. Why Calculus is a path, and what the school path keeps

`SYLLABUS` is a school-year spine: three linear-equation topics, each with the year it is met in the US, UK, Czech
and German systems. `expectedIndex(system, age)` counts the topics a learner of that age is normally past, and the
ruler's SCHOOL tick and gap line stand there. Appended to that list, Calculus would count a 16-year-old as 22
topics behind on a university course, and the Topics stop list would run to 25. So Calculus got its own list, and
the desk asks for a list by path: `expectedOn(path, system, age)` is `expectedIndex` on the school path and `null`
on a course, so a Calculus learner's ruler draws no year word, no SCHOOL tick and no gap line.

The school path keeps everything it had. `SYLLABUS` is unchanged (`tools/maths-paths-test.cjs` test 2: same ids,
order, names, prerequisites and years). The school path also keeps:

- its free-text practice, checked by substitution (`verify.ts`);
- marking by substitution, with the pen located in the working (`locate`);
- its slip table, its hint stance and its lesson picks.

A school learner's Tonight and Topics markup was byte-identical before and after the ruler change (72 renders, as
commit `84e5f76` records them).

## 3. The spec model

A Calculus practice item is a **spec**: one of nine shapes and its parameters, never free text with a stated
answer. `question(spec)` prints the question from it, in plain text and TeX. `checkAnswer(spec, answer)` judges an
answer by recomputing the truth with the expression engine every time, and nothing stores the truth.
`wellFormed(spec)` refuses a spec whose truth the desk cannot find, or whose truth makes a poor question.

The engine (`calc-expr.ts`) reads one expression in x: function names, e and pi, implicit products, Unicode powers
and roots, and a trailing `+C`, which it reports and never evaluates. It never throws. It gives:

- `derivativeAt`: a five-point stencil over halving steps, null at a corner;
- `integrate`: adaptive Simpson to 1e-9, null when improper;
- `limitAt` / `limitInf`: h from 1e-2 to 1e-8 with Richardson extrapolation, giving a value, an infinity, or "does
  not exist";
- `rootsIn` and `extremumIn`: a 400-sample scan, then refinement;
- `sameFunction`: agreement at ten fixed irrational samples.

Every tolerance is relative to max(1, |truth|). Exact and rounded are `TOLERANCE[shape].exact` and `.rounded`, used
for an answer written exactly and one written as a decimal. `FUNCTION_TOL` is 1e-6, with this reason in the code:
"the numeric derivative is good to 1e-7 relative, so 10x margin".

| shape | JSON parameters | printed (plain) | truth recomputed by | tolerance and reason | topics (count) |
|---|---|---|---|---|---|
| `evaluate` | `f`, `at` | `Find f(3) for f(x) = x^2 + 1.` | `f.at(at)` | 1e-6 exact and rounded: "the item asks for the value" | calc1-functions, calc1-trig, calc1-exp-log (3) |
| `derivative` | `f` | `Differentiate f(x) = 3x^2 + 2x.` | `derivativeAt` at the ten samples; the answer must be the same function | `FUNCTION_TOL` 1e-6; a `+C` is wrong | calc1-derivative, calc1-rules, calc1-trig-derivatives, calc1-chain, calc1-log-derivative (5) |
| `derivative-at` | `f`, `at` | `Find f'(2) for f(x) = x^3.` | `derivativeAt(f, at)` | 1e-6 exact and rounded | calc1-derivative, calc1-log-derivative, calc1-related-rates (3) |
| `antiderivative` | `f` | `Find int 2x dx.` | the answer's own numeric derivative must be the integrand at the samples | `FUNCTION_TOL` 1e-6; right needs the `+C`, and without it the answer is wrong with slip `lost-constant` | calc1-antiderivatives, calc1-substitution (2) |
| `definite-integral` | `f`, `a`, `b` (`zero: true` only for a symmetry item) | `Evaluate int_0^3 2x dx.` | `integrate(f, a, b)` | 1e-6 exact, 5e-3 rounded: "a learner who rounds to three figures lands within 5e-3" | calc1-definite-integral, calc1-area-so-far, calc1-ftc, calc1-substitution, calc1-area-average (5) |
| `limit` | `f`, `at` (a number, `"inf"` or `"-inf"`), `side` (`"+"`, `"-"`, or none) | `Find lim_(x->0) sin(3x)/x.` | `limitAt` / `limitInf`; "does not exist" is refused as a question | 1e-6 exact, 5e-3 rounded; an infinite limit is answered `inf`, `infinity` or `∞` with its sign | calc1-limit-idea, calc1-limit-laws, calc1-continuity, calc1-shape (4) |
| `critical-point` | `f`, `on: [lo, hi]` | `Find the critical point of f(x) = x^2 - 4x + 1 on [0, 5].` | the roots of a five-point slope inside the open interval; there must be exactly one | 1e-6 exact and rounded | calc1-extrema (1) |
| `extremum` | `f`, `on: [lo, hi]`, `kind` (`max` or `min`) | `Find the maximum value of f(x) = x^3 - 3x on [-2, 0].` | `extremumIn`; the value there, which must lie strictly inside | 1e-6 exact and rounded | calc1-extrema, calc1-optimisation (2) |
| `newton-step` | `f`, `x0`, `steps` (1 to 6) | `Use Newton's method on x^2 - 2 = 0 with x_1 = 1 to find x_3.` | the Newton iterates from `x_1 = x0` | 5e-3 exact and rounded: "an iterate is usually worked on a calculator and written rounded" | calc1-newton (1) |

The topic column was generated from `CALC1_SPINE` by a one-off script (not committed). The printed forms are what
`question()` prints for those specs. Two specs deserve a note:

- The Newton row's spec, from Stewart's own example, is **refused** by `wellFormed`: x_3 = 17/12 is within 5e-3 of
  x_4. Measured for `x^2 - 2` from `x_1 = 1`, only `steps: 1` is well formed, and steps 2 to 6 are refused.
- The practice prompt (`SHAPE_LINES` in `items.ts`) asks for 1 to 3 Newton steps, while `wellFormed` accepts 1 to 6.

`question()` prints a degenerate spec but not a malformed one. A spec missing a field, with an interval that is not
two numbers in order, or with an answer key gets `null`, never a throw (`printable`, commit `02da1c2`).

A spec is refused when:

- the function has no x, carries a `+C`, or does not read;
- a parameter is not finite, or an interval is reversed;
- a side is given for a limit at infinity;
- it has an `answer`, `truth`, `solution` or `value` key;
- its truth is degenerate: a derivative that is identically zero, a limit that does not exist, a zero integral
  without `zero: true`, a critical point that is not unique, an extremum at an end, or a Newton iterate the
  tolerance cannot tell from its neighbour.

## 4. The code decides

`checkAnswer` has three outcomes. **Right** and **wrong** come only from the recomputed truth. **Unsure** comes
when:

- the spec cannot be worked out;
- the answer is empty, unreadable, or not finite;
- a number was asked for and the answer depends on x;
- fewer than three samples compare;
- on an exact shape, a decimal lies within `ROUNDED_CLOSE` (5e-3) of the truth. That is a correct rounding, so the
  desk asks for the exact form rather than mark it wrong.

Its `why` is always one of the desk's fixed sentences, and none carries a value. Sample verdicts, measured with the
one-off script:

| answer | verdict |
|---|---|
| `10` for `f(3)` of `x^2 + 1` | right |
| `-10` for the same | wrong, slip `sign` |
| `0.333` for `f(1)` of `x/3` | unsure |
| `0.333` for the integral of `x^2` from 0 to 1 | right (the rounded tolerance) |
| `x^2` for the antiderivative of `2x` | wrong, slip `lost-constant` |
| `6x + 2 + C` for a derivative | wrong ("A derivative has no arbitrary constant in it.") |

**Why unsure is never a guess.** An unsure verdict settles nothing: `settleSpec` returns null. The item stays
"not sure" with the desk's line `ASK(n)`, and no attempt reaches the learner's record (`mark.ts` `markCalc`,
`explain.ts` `explainItem`). The learner is asked how they got there, and what they say is checked by the same
rule. A wrong mark in front of a learner costs more than a question.

**The closed slip vocabulary.** `CALC_SLIPS` holds 13 ids. Each has a name, a line the desk says and a place to
look, none of them with a value, and the shapes it applies to. `slipsFor(shape)` is the list for one shape, and
`rules/maths` `slipsFor(topicId)` joins the lists over a calc1 topic's shapes. A slip survives only on a wrong item
and only from its topic's list (`settled`). On a wrong item, `checkAnswer`'s own slip (`sign`, `lost-constant`)
wins, and otherwise the model's pick is used.

**What a model may do, and what it may not.**

| model job | what it may do | what it may not do |
|---|---|---|
| practice | pick specs: a shape from the topic's list, the parameters, a difficulty | write a question in words, or state a result (no answer field in the schema or the prompt) |
| mark | read a page: the final answer as written, the working line by line, a slip id or "unclear" | give a verdict or a solution: neither is in the schema, and one volunteered is never read |
| explain | transcribe the answer the learner says, reply in one or two sentences, pick a slip | decide the verdict |
| hint | write the hint and what to try next | state the answer: both fields are leak-checked |

`tools/calc-marking-test.cjs` pins the marking rule:

- Test 2: the vision stub returns a verdict and a solution on every item, and the marks still come from
  `checkAnswer`. The solution reaches no view and no record.
- Test 3: an unreadable answer stays unsure when the stub says "verdict: right".
- Test 5: the same holds for a stated verdict in an explanation.

## 5. Withholding the answer on Calculus

**The spec carries no answer.** `read()` refuses an `answer`, `truth`, `solution` or `value` key. `items.ts`
`toSpec` also refuses `result`, and it copies only the shape's own parameters (`PARAMS`). The question is printed
from the spec, so the only numbers on it are the spec's parameters. A spec whose printed question states its own
result is dropped, for example "differentiate e^x" (`leaksCalc(spec, question)` in `makeCalcItems`).

**What `shown()` keeps.** Every practice item passes through `shown()` on its way into the session, which every
screen reads. `specShown` keeps a known `shape` and the printed parameters `f`, `at`, `a`, `b`, `side`, `on`,
`kind`, `x0`, `steps` (plain strings or finite numbers). It strips every other key: an answer, a truth, and `zero`.
`zero` is a result, since it says the integral vanishes, and stripping it costs nothing: practice never makes a
`zero` spec. `toSpec` never sets it, the prompt asks for bounds where the integral is not zero, and a zero integral
without it fails `wellFormed` and is dropped. Only `specFromQuestion` makes `zero: true`, for a hint, and that spec
never enters the store.

**`leaksCalc(spec, line)`.** It reads a line as it would be said: number words to ninety-nine, "minus", "and a
half". It sets aside the question's own notation: the function, unless the function is itself the answer; the
point, the bounds, the interval; `x_1 = x0`; "x approaches a". Then it reads the line in windows of up to six
tokens, taking the longest window the engine can read at each place. The line leaks if:

- on a number shape, a window's value is within 5e-3 of the truth, or a negative number's size is the truth;
- on a function shape, a window is one `checkAnswer` would call right, or an antiderivative written without its
  `+C`;
- on an infinite limit, the line names infinity at all.

That is stricter than `checkAnswer` on purpose, in four ways:

- 5e-3 on every shape, not 1e-6, so `0.333` for 1/3 leaks, though `checkAnswer` calls it unsure;
- the negated truth leaks ("minus sixteen" gives the size away), though it would be marked wrong;
- an antiderivative with no `+C` leaks, though it would be marked wrong;
- any word for infinity leaks.

**A photographed page.** `specFromQuestion(text)` reads a printed task back into a spec in code. It knows 17
phrasings, each a pattern anchored to the whole text, and returns null for:

- a phrasing it does not know;
- a function that is not one expression in x: another letter, a second part, an `=`;
- a spec `wellFormed` refuses;
- text over 300 characters.

It reads plain text only. It has no TeX reader, and none of the corpus's 64 TeX forms reads
([CALCULUS-1-SYLLABUS.md](CALCULUS-1-SYLLABUS.md) has the count). `hint.ts` runs it on every maths page item,
whatever the learner's path, and when it reads, both hint fields also pass `leaksCalc`.

**The fixed sentences.** A hint that leaks is asked again once, and a second leak is replaced by
`CALC_WITHHELD[shape]`. That is one sentence per shape, written in code, with no digit and no number word, since
`leaksCalc` reads "one" as 1. Without a spec, the school `withheldLine` is used. An explanation reply that leaks is
replaced by the item's own line: its settled `said`, else its `said`, else `ASK(n)`.

**The one known edge.** The desk's own lines carry the item number: `RIGHT(n)` is "Number n is right." and `ASK(n)`
is "I got something different for number n...". When an item's answer equals its own number, that line holds a
number equal to the answer. Measured: for `f(2)` of `x + 1` (truth 3) as item 3, `leaksCalc` calls both
`RIGHT(3)` and `ASK(3)` a leak. The line is the item's label, not a statement of the answer, and nothing checks it,
because it is the fallback. No test pins this case.

## 6. The pipeline, stage by stage

| stage | file | the model does | code does | on failure |
|---|---|---|---|---|
| practice | `items.ts` `makeCalcItems` (the route: `api/practice`) | gives at most n + 3 specs: a shape enum from the topic's list, typed parameters, difficulty 1-5; a second round asks for what is missing, naming what is kept | keeps a spec only when it is on the list, `wellFormed`, printable, not leaking its result in its question, and not a duplicate; orders by difficulty, then the length of `f`; takes the first 6; the item is `{ n, question, spec }` | no kept spec in two rounds: the job fails with "The desk could not write this set.", 502, and the set on the desk stays (`tools/calc-practice-test.cjs` test 6). A route topic on neither path: 400 before any job |
| mark | `mark.ts` `markCalc` (for any set whose items carry a `spec`) | reads the photo: `studentAnswer`, `studentWorking`, `slip` | `settleSpec`, which is `checkAnswer`, decides each item; unsure is `ASK(n)` and no attempt; one history line with the path's topic name and `rightLine`; no pen position (`slipAt`) | the job fails with "The desk could not mark the set."; the Practice card adds "Snap the sheet again and the desk tries again." (`markLine`). A set that is no longer the one on the desk records nothing |
| explain | `explain.ts` `explainCalc`, `explainItem` | transcribes the answer the learner says, replies, picks a slip; the stance is a first-year student on Calculus 1 | settles an unsure item by `checkAnswer`; replaces a leaking or empty reply with the item's line; on an item already wrong, a slip from the list renames it | the job fails with "The desk could not follow that." on the Walk (`explainLine`) |
| hint | `hint.ts`, `api/hint/route.ts` | writes the hint and what to try next; on the calc1 path the stance is Calculus I | `leaks()` on every maths hint, and `leaksCalc` when `specFromQuestion` reads the item; one re-ask; then the fixed sentence with an empty next | the job fails with "The desk could not come up with a hint just now."; the Page says "No hint that time. Select to try again." |
| memory | `memory.ts` (`api/memory`) | writes one to three third-person sentences from the set's questions, verdicts, slip lines and working | names the topic with `topicIn`, strips list marks, keeps three lines at most | the job fails with "The desk could not write tonight down." The lines are not leak-checked, as on the school path; the prompt asks for no numbers |
| lesson pick | `api/hint/route.ts` | nothing on calc1 | on a maths page on the calc1 path, the lesson job ends as "no lesson" without asking the picker, which would offer a school algebra video | not applicable: the hint screen says "No lesson in tonight's library covers this one." |

## 7. The TV

- **Profile.** The Maths course row appears after "Interested in" while Maths is on. Its cells are **Linear
  equations** and **Calculus 1**, and the chosen cell is `pathOf(draft)`, so a new learner has Linear equations
  chosen. The one caption under the rows is the focused cell's label and its path's blurb, for example "Calculus 1"
  over "A university first course in calculus, from functions and limits through derivatives to integrals."
- **Topics.** The stops are the learner's path. "Teach me something" opens Topics at the **frontier**: the first
  topic not latched secure whose prerequisites all are (`nextOn`). It opens on the first stop when nothing is
  secure or everything is (`tools/maths-course-test.cjs` test 4: 0, 7 and 22 secure).
- **The panning ruler.** A path pans on Topics when one box per topic would give a slot under `MIN_SPAN` (288 px).
  The school path's slot is 558.7 px; Calculus 1's would be 76.2 px, so it pans. The focused slot is `FOCUS_SPAN`,
  640 px (a 628 px box), and every other slot is 288 px (a 276 px box). The track is 6,740 px, slid by
  clamp(focus centre - 864, 0, 5,012), measured at 0, 2,362 and 5,012 px for focus 0, 10 and 21. The focused name
  is fitted from 44 px down to a 34 px floor, whole, in at most three lines. An edge with more to show has a
  chevron. Strand labels clamp to their strand with an ellipsis.
- **Tonight's strip.** A path of more than `STRIP_AFTER` (8) topics is drawn on Tonight as one bar per strand
  (`stripModel`), never narrower than 96 px. For Calculus 1 the bars are measured at 226, 225, 452, 301, 376 and
  96 px for its 3, 3, 6, 4, 5 and 1 topics. The last two labels clamp to "Applications of…" and "Ap…". The bars have
  no topic names and no year, and the needle is at the frontier. Tonight's title is "Calculus 1, from the first
  step" with nothing secure, then "N of 22 topics secure".
- **Names.** Every screen names a set by its path's name for it (`topicName`, which uses `topicIn`): the crumb and
  the sheet head on Practice, Sheet and Walk, "Six more on ..." on the Sheet, the Tonight card, and the history
  label. A course topic has no year, so no year word is drawn under it, and `expectedOn` is null, so there is no
  SCHOOL tick. Topics' "Most people do X first." names X in running text (`inRunningText` in `tv/mathsRows.ts`):
  "the chain rule and implicit differentiation", but "Newton's method" keeps its capital.
- **A marked Calculus item.** It has no pen position, so a wrong one gets the wavy underline on its answer line and
  the card's "Look at ..." from the slip's `points`. The slip's title is the `CALC_SLIPS` name, for example "The
  constant left off". An answer marked with no working is drawn as the learner wrote it: `workingLines`
  (`rules/maths.ts`) adds `x = ` to a bare value only on an item without a spec, so a limit of 3 shows `3`, never
  `x = 3` (`tools/maths-type-test.cjs` test 12).

## 8. The tests and tools that pin it

All of these run in `npm test` in `desk/` (`test:types`, then `test:rules`), offline. Engines are stubbed at the
provider registry, and data directories are disposable, under the OS temp dir.

| file | what it pins |
|---|---|
| `tools/maths-paths-test.cjs` | 22 + 3 topics with unique ids; `SYLLABUS` unchanged; each path's prerequisites form a DAG; every Calculus topic has one of the nine shapes (the list is repeated in the test, the contract with `calc.ts`); the spine carries no examples or answers; `pathOf`, `topicIn`, `nextOn`, `expectedOn` (null on a course), `learnerPath`; client-safe imports |
| `tools/calc-expr-test.cjs` | the engine's reading rules; formula strings copied from the corpus (at least 80, asserted); at least 40 edge cases; the numerics' stated tolerances; time budgets |
| `tools/calc-rules-test.cjs` | `checkAnswer` on every shape; the named tolerances; `wellFormed` and its reasons; `question()` typesets; `leaksCalc`; the slip vocabulary; a sweep of all 22 topics; no answer field; never throws (3,000 mutations) |
| `tools/calc-hint-test.cjs` | `specFromQuestion` reads back every printed question, plus a table of page phrasings (some must stay null); the fixed sentences; hint re-ask and fallback; the stance by path; no lesson pick on calc1 |
| `tools/calc-practice-test.cjs` | specs in, six checked items out, easy to hard; no truth on any item or view; the schema and prompt ask only for specs; a second round; all-bad rounds fail and keep the old set |
| `tools/calc-marking-test.cjs` | calc1 slip lists; marking by `checkAnswer` on each shape; the model's verdict is never read or used as a fallback; explanation settling and leak replacement; the evening note's topic name |
| `tools/calc-course-test.cjs` | the whole course as one flow through the real routes (practice, mark, explain, hint). For each of the 22 topics: a code-printed set, a page marked by `checkAnswer` while the stub volunteers a false "right", an unsure item settled by explanation, a hint re-asked then withheld, and four evenings latching the topic secure, until Tonight says every topic is secure. After every step the TV, phone and guest views carry no answer, truth or `zero` key. The school path runs beside it, unchanged |
| `tools/maths-course-test.cjs` | `mathPath` kept and junk dropped; `topic.open` focus; Topics walks the path; the frontier; Menu-edit; the Maths course row; set names on the landing and the phone |
| `tools/maths-ruler-test.cjs` | the school ruler's old formulas; the panning ruler; the strip |
| `tools/maths-tv-test.cjs` | topic states by path (a record off the path is ignored), `topicName`, the Tonight title by path; also the captions' prose, the paper's fit and the job lines |
| `tools/maths-calculus-test.cjs` | the reader baseline over the corpus, a ratchet on declared statuses |

**The live probe** is not in `npm test`; the Director runs it against an isolated server:

```
MATHS_LIVE_ALLOW_WRITES=1 MATHS_LIVE_URL=http://localhost:3217 DESK_DATA_DIR=<that server's data dir> \
  node tools/maths-calculus-live.cjs [--strict] [--topics a,b] [--path calc1]
node tools/maths-calculus-live.cjs --dry      # no server, no browser
```

`--path calc1` seats the scratch learner on Calculus 1. It walks Topics at every focus from 0 to 21 and Tonight
with 0, 7, 15 and 22 topics secure. Commit `84e5f76` records the Director's run: `--path calc1 --strict` reached
180/180 screens with 0 violations. That run was not repeated for this page.

**The model-yield probe** measures how many of a live model's specs survive `wellFormed`, per topic. A parallel lot
is adding it under `tools/`, and it had not landed when this page was committed, so this page gives no command for
it. Until it lands, how often the live model writes a spec the desk keeps is unmeasured. The offline suites use
stubbed replies.

## 9. How to add a path

Take Calculus 2 as the example. Today most of the Calculus wiring is keyed to the id `calc1`, so a second course
path is partly data and partly generalising those keys.

1. **The spine.** Add `desk/src/lib/library/<course>.spine.ts` as plain data with no import. Give each topic an
   id unique across every path, a name, a strand, a one-sentence blurb, prerequisites that point only at earlier
   topics, and at least one `CalcShape`.
2. **`paths.ts`.** Add the id to `MathPath` and a `PATHS` entry with its name, blurb and `school: false`.
   `school: true` would make `expectedOn` call `expectedIndex`, which counts `SYLLABUS` topics. A second
   school-year path is a design change.
3. **The profile.** Allow the id in `pathChecked` in `store.ts`, which accepts only `school` and `calc1` and drops
   anything else. Add it to `COURSES` in `profileRows.ts`, which gives the Maths course row a third cell. `pathOf`
   also knows only `calc1`.
4. **Generalise what reads `calc1` by name:**
   - `items.ts` `makeItems` (`pathOfTopic(...) === "calc1"`) and `shapesOf` (reads `CALC1_SPINE`);
   - `rules/maths.ts` `isCalcTopic` and `CALC_AS_SLIPS` (read `CALC1_SPINE`);
   - `hint.ts` `stanceOf`, and the lesson skip in `api/hint/route.ts`;
   - `explain.ts` (names `PATHS.calc1`).

   Marking and explaining branch on `item.spec`, so they need no change.
5. **The shapes.** If every question fits the nine shapes, the rest is data. A new shape touches every one of
   these:
   - its id in `CalcShape` (`calculus1.spine.ts`), `CalcSpec` and `CALC_SHAPES` (`calc.ts`);
   - in `read()`, its truth and its degenerate cases;
   - a `TOLERANCE` entry with its reason;
   - its printing in `question()`, its judging in `checkAnswer`, its own notation in `ownPieces`;
   - a `CALC_WITHHELD` sentence, and its place in each slip's `shapes`;
   - `PARAMS`, `PARAM_SCHEMA` and `SHAPE_LINES` in `items.ts`;
   - `SPEC_KEYS` in `store.ts` for any new parameter name (or `shown()` strips it);
   - a `specFromQuestion` pattern;
   - the shape list in `tools/maths-paths-test.cjs`.
6. **Slip ids.** New ones go in `CALC_SLIPS` with their shapes, and none may carry a value.
7. **The test tables.** Update the counts in `maths-paths-test.cjs` (22, 3, 25) and the tables in
   `calc-rules-test.cjs` (checks, well-formed specs, the sweep). `calc-hint-test.cjs` follows them. The fixtures in
   `calc-practice-test.cjs` and `calc-marking-test.cjs` need one per shape (marking test 2 asserts it). Update
   `maths-course-test.cjs`, and `maths-calculus-live.cjs` `--path`, which accepts only `calc1`.
8. **The docs.** This page, [DESIGN-MATH-BUDDY.md](DESIGN-MATH-BUDDY.md), and
   [STUDY-DESK-SCREENS.md](STUDY-DESK-SCREENS.md).

**When a new shape is a design change, not data:**

- its answer is not one number, one function, or an antiderivative up to a constant. A set of values, an interval,
  a vector or a matrix, a proof, or a sentence each needs a new kind of truth, a new comparison, a new leak rule and
  a new marking prompt;
- it needs a second variable. The engine reads x only, so a sequence in n, or a series, is not readable;
- it needs a new tolerance rule, or an answer stored anywhere.

Calculus 2's integrals, limits in x and derivatives fit the existing shapes. Its sequences and series do not.
Linear algebra needs a different engine altogether.

## 10. Honest limits

- **Word problems and multi-part questions are not practice items.** A spec is one shape with one answer. Related
  rates, optimisation in words, "the absolute maximum and minimum", and "find c so that f is continuous" have no
  spec, and `specFromQuestion` returns null for them. Of the corpus's 31 printed questions, 13 read into a spec
  ([CALCULUS-1-SYLLABUS.md](CALCULUS-1-SYLLABUS.md) has the table).
- **Only the nine shapes.** Inflection points, inverses, equations to solve, implicit differentiation, Riemann sums
  and area functions in t are not shapes.
- **The reader's quality on real handwriting is unmeasured.** Marking tests stub the vision model. No real photo of
  Calculus working has been read and compared.
- **No Calculus lesson library.** There are no lesson picks and no Calculus lessons. Units and the Calendar list
  the lessons of the learner's path (`lessonsOn` in `tv/keys.ts`; a lesson with no `path` is the school path's), so
  on Calculus 1 they show one line, "No lessons for Calculus 1 yet. The desk explains a step when you ask.", with
  nothing to focus. Math Buddy's module blurb (`MODULE_BLURB` in `tv/profileRows.ts`) speaks for either path; the
  landing's own one-line copy (`BLURB_ONE` in `tv/landingRows.ts`) still says "school maths".
- **Glyphs on a real Fire TV are unverified.** `fonts.ts` loads the latin and latin-ext subsets only, so Greek,
  arrows, ∑, ∂ and ′ fall back to a system face that has not been seen on a Fire TV.
- **Newton items are limited** to steps whose iterates the 5e-3 tolerance can tell apart. For `x^2 - 2` from 1,
  that is one step. The corpus's own Newton question, asking for x_3, is refused.
- **The hint's leak check follows the item, the stance follows the learner.** A school learner photographing a
  Calculus page gets the school stance and a lesson pick. The page's hint still gets `leaksCalc` when the item reads
  as a spec.
