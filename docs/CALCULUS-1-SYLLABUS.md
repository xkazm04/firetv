# Calculus 1 baseline

Can Math Buddy set a university Calculus I course on the TV without breaking the screen, and what can the desk
check of it in code? This page answers that for today's reader (`desk/src/maths/typeset.ts`, after the wave-1
Calculus notation work: arrows, limits under lim, root indices, stacked scripts, sums, Greek, function
fractions, the 28 px script floor). The data is `desk/src/lib/library/calculus1.ts`. The offline answer is
`tools/maths-calculus-test.cjs` (in `npm test`), and the live answer is `tools/maths-calculus-live.cjs`, which the
Director runs.

## Source

- Syllabus: Columbia University, Department of Mathematics, Calculus I sample syllabus (28 sessions) -
  <https://www.math.columbia.edu/programs-math/undergraduate-program/calculus-classes/calculus-i/calculus-1-sample-syllabus>
- Textbook: James Stewart, *Calculus: Early Transcendentals*, 9th edition.

The session order and section numbers are cited, never quoted. The topic names, the blurbs and all 108 examples
are our own words and our own mathematics. No example is a real learner's work.

## The topics

| sessions | Stewart 9e | id | topic |
|---|---|---|---|
| 1 | 1.1, 1.2, 1.3 | `calc1-functions` | Functions, and new functions from old |
| 2 | (none listed) | `calc1-trig` | Trigonometric functions |
| 3 | 1.4, 1.5 | `calc1-exp-log` | Exponentials, inverse functions and logarithms |
| 4 | 2.1, 2.2 | `calc1-limit-idea` | The tangent problem and the idea of a limit |
| 5 | 2.3 | `calc1-limit-laws` | Limit laws and the squeeze theorem |
| 6 | 2.5, 2.6 | `calc1-continuity` | Continuity and asymptotes |
| 7 | 2.7, 2.8 | `calc1-derivative` | The derivative as a limit and as a function |
| 8, 9 | - | (review, midterm 1) | - |
| 10 | 3.1, 3.2 | `calc1-rules` | Derivatives of polynomials, and the product and quotient rules |
| 11 | 3.3 | `calc1-trig-derivatives` | Derivatives of trigonometric functions |
| 12 | 3.4, 3.5 | `calc1-chain` | The chain rule and implicit differentiation |
| 13 | 3.6, 3.7, 3.8 | `calc1-log-derivative` | The derivative of the logarithm, and rates in the world |
| 14 | 3.9, 3.10 | `calc1-related-rates` | Related rates and linear approximation |
| 15 | 4.1, 4.2 | `calc1-extrema` | Maxima, minima and the mean value theorem |
| 16, 17 | 4.3, 4.4, 4.5 | `calc1-shape` | The second derivative, L'Hospital's rule and curve sketching |
| 18 | 4.7 | `calc1-optimisation` | Optimisation |
| 19 | 4.8 | `calc1-newton` | Newton's method |
| 20 | 4.9 | `calc1-antiderivatives` | Antiderivatives |
| 21, 22 | - | (review, midterm 2) | - |
| 23 | 5.1 | `calc1-definite-integral` | The definite integral |
| 24 | 5.2 | `calc1-area-so-far` | The area-so-far function |
| 25 | 5.3, 5.4 | `calc1-ftc` | The fundamental theorem and net change |
| 26 | 5.5 | `calc1-substitution` | The substitution rule |
| 27 | 6.1, 6.5 | `calc1-area-average` | Areas between curves and average values |
| 28 | - | (review) | - |

That makes 22 topics. Sessions 8, 9, 21, 22 and 28 are `nonTopicSessions`. The prerequisites form a DAG in this
order, and every topic has at least four examples. Each example is a `question` (with its final value), a `working`
(the lines as the reader transcribes them), a `caption` (the desk's sentence, which never contains the value) or a
`page` (a printed line as a snapped sheet reads). Each one is written as the plain text our prompts ask the models
for, and most also as TeX.

## A path, not an appendix

Calculus 1 is a Math course a learner can be on: the `calc1` path, beside the school path. The design is written
once in [MATH-COURSE-PATHS.md](MATH-COURSE-PATHS.md); this section only says where the course lives.

`SYLLABUS` (`desk/src/lib/library/syllabus.ts`) stays the school-year spine: three linear-equation topics with
US/UK/CZ/DE year bands, read by `expectedIndex`. Appended to it, Calculus would count a 16-year-old as behind on a
university course, and the Topics stops would run to 25. So the 22 topics have their own spine,
`CALC1_SPINE` (`desk/src/lib/library/calculus1.spine.ts`): ids, names, strands, blurbs, prerequisites and the
practice shapes each topic may use. `paths.ts` builds both paths, and every screen and pipeline asks it for the
learner's path (`Profile.mathPath`, chosen on the profile's Maths course row). A course path has no school year,
so its ruler has no year word and no SCHOOL tick. This file, `calculus1.ts`, takes its spine fields from
`CALC1_SPINE` and adds the example corpus, which is still a fixture for the tests and this page, not wired into a
screen.

The four things promotion needed, as they stand on 2026-09-29:

1. **A course the ruler, the Tonight count and `expectedIndex` read.** Done: `paths.ts` (`learnerPath`, `topicsOf`,
   `expectedOn`, which is null on a course).
2. **Practice and marking that serve Calculus.** Done, decided in code. A practice item is a spec the desk prints
   and judges itself (`rules/calc.ts`), and marking asks the model only to read the page (see "What the desk can
   check in code" below).
3. **Lesson picks.** Not done. There is no Calculus lesson library, so on the calc1 path the hint's lesson job ends
   as "no lesson" without asking the picker.
4. **Declared fixes for the degrades below.** The width and height degrades are fitted, wrapped or grown on the TV
   (the live run below). The five notation degrades stand as declared.

## What the reader does today

The offline suite runs every example, in plain and in TeX. It checks four things: `parseMath` never throws, no
letter or digit is dropped, no backslash or `frac`/`sqrt` text reaches the nodes, and the line fits where the TV
puts it:

- a question sits in the fixed print row, 52 px;
- a working line sits in the fixed hand row, 72 px, which is two squares tall, or three when `isTall`;
- a page line sits in the wrapping print row, where only its widest unbreakable piece can overflow;
- a caption's longest word sits in the 466 px card.

The fit is an estimate from the stylesheet's own em values, with a quarter-square tolerance for glyph leading. The
live test measures the real boxes.

Across 194 forms (108 plain, 86 TeX), 162 render, 32 degrade and none break. Nothing throws, nothing is dropped,
and no command text reaches the TV. This holds for arrows, one-sided limits, limits at infinity, cube roots,
stacked scripts, evaluation bars, sums, `sin(x)/x`, `ln(x)/x`, Greek, `\lvert`, `\begin{cases}` and an unknown
command. (This baseline observed only the current reader and did not re-run the pre-wave-1 one.) What is still
degraded:

| reason | examples | what happens |
|---|---|---|
| `too-wide` (question) | c01-q1, c06-q1, c07-q1, c12-q1, c13-q1, c14-q2, c15-q1, c16-q1, c17-q1, c18-q1 | A question with words is set on one line in the fixed practice or sheet row (nowrap), and a sentence runs past the paper's 986 px. School items are bare equations, but Calculus items are sentences. |
| `too-wide` (working) | c09-w1, c13-w1 | A working line of 60 or more characters (the three-factor product rule), or a list of four values, runs past the paper at 72 px. |
| `too-wide` (page) | c18-p1 | An 80-digit number is one unbreakable span, even in the wrapping row. |
| `too-tall` | c07-w1, c11-w1, c16-w1 | A nested fraction (`((1/x)(x) - ...)/x^2`, `(9/4 - 2)/3`), or a limit under lim beside a fraction whose numerator carries a power, needs about 158-172 px in the 144 px three-square row. |
| `slash` | c02-p1 | `sin(x)/cos(x)` keeps its slash, because the reader stacks over a number, letters or a bracket, but not over a function. |
| `script-one-letter` | c22-p1 | Plain `f_avg` takes one letter as the subscript: f with subscript a, then v, then g. |
| `unknown-tex` | c01-p2 | `\mathbb{R}` is set as the word "mathbb" and then R. |
| `cases-one-line` | c06-q1 | `\begin{cases}` reads as one line, with no rows (a declared design choice, but still a degrade). |
| `circ-as-degree` | c01-q1 | `f \circ g` draws the composition ring as a degree sign, °. |

**The pen (found by `maths-calculus-live.cjs --dry`, fixed the same day).** `markLine` leaked raw TeX when the pen's
span cut through a TeX construct: for `y' = \frac{\frac{1}{x}\cdot x - \ln x \cdot 1}{x^2}` marked at `- \ln`, the
pre and post parts fell back to plain text and put `\frac{`, `\cdot` and `}{` on the TV (the limit line in c14-w1
did the same). `markLine` now splits a TeX line only on a balanced boundary and otherwise marks the whole line; over
every working line of this corpus, at every start and end (71,423 spans), the spans that set command text went from
30,260 to 0.

**Captions are prose.** The TV passes a caption through `prose()` into the card and never through `parseMath`. The
suite still runs the reader's checks on captions, and additionally checks the longest word against the card.

## What the desk can check in code

**Calculus is decided in code, by shape.** A Calculus item is one of nine shapes: evaluate, derivative,
derivative-at, antiderivative, definite-integral, limit, critical-point, extremum and newton-step. `checkAnswer`
recomputes the truth from the spec with the expression engine (`desk/src/lib/rules/calc-expr.ts`) and gives right,
wrong or unsure. A model never gives the verdict. Every practice item the desk writes on the calc1 path is a spec,
so every one is checkable by construction: a spec the desk cannot work out, or whose truth makes a poor question, is
never kept. The shapes, their tolerances and the withholding rules are in
[MATH-COURSE-PATHS.md](MATH-COURSE-PATHS.md).

**`verify.ts` still reads 2 of the 108.** The third column of the baseline table below is `verify.ts`, the school
path's check: one equation of arithmetic in x. It reads `c13-q2` (`3x^2 - 12 = 0` at 2) and `c15-q2`
(`20 - 2x = 0` at 10), and nothing with a limit, a derivative, an integral, a function name, another letter, ≈ or
a sentence. That column is a ratchet on the old check, not the Calculus checker.

**What a photographed page reads into.** A task on a snapped page is read in code by `specFromQuestion`. When it
reads, the hint's leak check knows the answer. When it does not, the desk claims nothing about the task. Measured by
a one-off script (not committed) that runs `specFromQuestion` on every `question` and `page` example of
`CALCULUS_1`, plain and TeX:

| examples | read into a spec | of which shape |
|---|---|---|
| 31 questions (plain) | 13 | derivative 6 (c07-q1, c08-q1, c09-q1, c10-q2, c11-q1, c11-q2), limit 5 (c04-q1, c05-q1, c05-q2, c05-q3, c14-q1), definite-integral 2 (c20-q1, c21-q1) |
| 33 page lines (plain) | 0 | - |
| 64 TeX forms of the above | 0 | - (the reader takes plain text only) |

Why the other 18 questions do not read:

| reason | examples |
|---|---|
| a word problem: a situation in sentences | c12-q1 (the sphere), c15-q1 (the rectangle) |
| more than one part, or more than one function | c01-q1 (f and g composed), c06-q1 (a piecewise f, find c), c13-q1 (the maximum and the minimum), c17-q1 (f from f' and f(1)), c18-q1 (write the sum, then its limit), c22-q1 (the area between two curves) |
| a task that is not one of the nine shapes | c02-q1 and c03-q1 (solve an equation), c03-q2 (log arithmetic, no x), c14-q2 (inflection points) |
| a letter other than x | c09-q2 (theta), c10-q1 (y, implicit), c19-q1 (t, and g defined by an integral) |
| a bare equation, with no task words | c13-q2, c15-q2 |
| read, then refused by `wellFormed` | c16-q1: Newton's x_3 = 17/12 is within the shape's 5e-3 of x_4, so the desk cannot tell the asked-for iterate from the next |

Of the 33 page lines, 31 are printed statements (a formula, an identity, a result given with its value), so there
is nothing to answer. The other two are tasks outside the shapes: c01-p1 (sketch a graph) and c03-p1 (find an
inverse).

## The live test

```
MATHS_LIVE_ALLOW_WRITES=1 MATHS_LIVE_URL=http://localhost:3217 DESK_DATA_DIR=<the isolated server's data dir> \
  node tools/maths-calculus-live.cjs [--strict] [--topics calc1-limit-idea,calc1-ftc]
node tools/maths-calculus-live.cjs --dry      # no server, no browser: every state built and rendered with MathsTV
```

The live test opens the real TV (`/tv?key=`, 1920 x 1080) and pairs a phone with `?pin=`, at 390 x 844. It seats
the scratch learner `calc-live` through the session endpoint.

For each topic it builds the Tonight, Topics, Practice, Sheet, Walk, Page and Hint states, using the store's own
`reduce` on the desk's events: practice.set, practice.marked, page.reading, page.read, hint.set, nav and walk. It
serves each state to the TV on its session stream. The session route refuses those events from any screen
(`SERVER_ONLY`), so they never reach the server, and no model is called.

It then checks each screen:

- no page error and no console error;
- every `.mx` sits inside its container and its row;
- every `.mx` sits inside the 96/54 px safe zone;
- text is 28 px or larger, except the design's 20-22 px uppercase labels;
- no backslash appears.

It writes `artifacts/math-calculus/<topic>-<screen>.png`, `report.json` and `report.md`. Without `--path`, the
scratch learner is on the school path, so its Topics screen shows the school spine. `--path calc1` seats it on
Calculus 1 (`mathPath: "calc1"`), so every screen is drawn for a Calculus learner. The run then walks the path's
rulers: Topics at every focus from 0 to 21, and Tonight with 0, 7, 15 and 22 topics secure. Those screens are
checked for the focused name shown whole, every name at 34 px or more, strand labels apart, and no gap at either end
of the track. They are saved as `path-calc1-<screen>-<n>.png`.

The script leaves out of the overflow check the Tonight thumbnails (`.mb-srow .qx`, `.mb-box .qx`), which crop the
paper by design (`overflow: hidden`), allows 2 px of slack on a row's height and on the safe zone, and ignores the
one console line its own empty voice stub causes (`ERR_REQUEST_RANGE_NOT_SATISFIABLE` on a `blob:` URL). Every
other error still counts. The slips it places are synthetic (a sign span from the working), so the pen may ring a
place the real `locate` would never name, for example inside `x_(n+1)`.

### What the first live run found (2026-09-29, 22 topics x 7 screens = 154 screens)

| run | violations | what |
|---|---|---|
| first, unfiltered | 56 screens | 39 were this script's own noise (thumbnails, voice stub, 1 px); 17 were real |
| the 17 real | 17 screens | Practice: 12 long printed questions ran past the paper (1028 to 1805 px in 996 px), 5 left the safe zone (right edge up to 1954, bottom to 1100) and bled under the side card; Page: the 80-digit number overflowed a wrapped row; Walk: c16-w1 was 172 px tall in a 152 px row; Sheet and Walk: raw `\frac{`, `\cdot` (the pen in a TeX line) |
| after the wave-3 fixes | 0 screens | `node tools/maths-calculus-live.cjs --strict` exits 0: `154/154 screens reached, 0 with a violation` |

The fixes are three: Practice is fitted to the paper like the Sheet and the Walk (`fitRow` through `usePaper`, 28 px
floor; when six tall questions still do not fit, the paper is drawn on smaller squares, 48 down to 36 px, and
calc1-limit-laws settles at 40 px); a row taller than its squares grows to the next whole square, and a wrapped
row breaks an unbreakable token; and the pen marks the whole line rather than cut a TeX construct.

Read the `too-wide` and `too-tall` rows of the offline degrade table above as an estimate for a one-line row. The
live run is the measurement: for those, the TV fits, wraps or grows the row and nothing overflows, leaves the safe
zone or shows command text. The other degrades (`slash`, `script-one-letter`, `unknown-tex`, `cases-one-line`,
`circ-as-degree`) are about how the maths is set, not how wide it is, so the live run does not measure them and they
stand as declared. The live run draws the corpus. It does not mark it: how far a page's tasks can be checked is in
"What the desk can check in code" above.

**The path run (2026-09-29).** Commit `84e5f76` records the Director's `node tools/maths-calculus-live.cjs --path
calc1 --strict`: 180/180 screens reached with 0 violations, 26/26 of them the path's rulers. The first `--path` run
had 22 of 26 red, because 2 px of glyph ink counted as a clamped name; the fit and the check now allow under half a
line. It was not re-run for this page.

## The baseline table (`node tools/maths-calculus-test.cjs`)

```
Calculus 1 baseline (render plain | render tex | verify.ts check)
s1 calc1-functions
  c01-q1   question degrades:too-wide                  | degrades:circ-as-degree,too-wide   | none
  c01-w1   working  renders                            | renders                            | none
  c01-c1   caption  renders                            | -                                  | none
  c01-p1   page     renders                            | renders                            | none
  c01-p2   page     renders                            | degrades:unknown-tex               | none
s2 calc1-trig
  c02-q1   question renders                            | renders                            | none
  c02-w1   working  renders                            | renders                            | none
  c02-c1   caption  renders                            | -                                  | none
  c02-p1   page     degrades:slash                     | renders                            | none
s3 calc1-exp-log
  c03-q1   question renders                            | renders                            | none
  c03-w1   working  renders                            | renders                            | none
  c03-q2   question renders                            | renders                            | none
  c03-c1   caption  renders                            | -                                  | none
  c03-p1   page     renders                            | renders                            | none
s4 calc1-limit-idea
  c04-q1   question renders                            | renders                            | none
  c04-w1   working  renders                            | renders                            | none
  c04-c1   caption  renders                            | -                                  | none
  c04-p1   page     renders                            | renders                            | none
  c04-p2   page     renders                            | renders                            | none
s5 calc1-limit-laws
  c05-q1   question renders                            | renders                            | none
  c05-w1   working  renders                            | renders                            | none
  c05-q2   question renders                            | renders                            | none
  c05-q3   question renders                            | renders                            | none
  c05-c1   caption  renders                            | -                                  | none
  c05-p1   page     renders                            | renders                            | none
  c05-p2   page     renders                            | renders                            | none
s6 calc1-continuity
  c06-q1   question degrades:too-wide                  | degrades:cases-one-line,too-wide   | none
  c06-w1   working  renders                            | renders                            | none
  c06-c1   caption  renders                            | -                                  | none
  c06-p1   page     renders                            | renders                            | none
  c06-p2   page     renders                            | renders                            | none
  c06-p3   page     renders                            | renders                            | none
s7 calc1-derivative
  c07-q1   question degrades:too-wide                  | degrades:too-wide                  | none
  c07-w1   working  degrades:too-tall                  | degrades:too-tall                  | none
  c07-c1   caption  renders                            | -                                  | none
  c07-p1   page     renders                            | renders                            | none
  c07-p2   page     renders                            | renders                            | none
s10 calc1-rules
  c08-q1   question renders                            | renders                            | none
  c08-w1   working  renders                            | renders                            | none
  c08-c1   caption  renders                            | -                                  | none
  c08-p1   page     renders                            | renders                            | none
s11 calc1-trig-derivatives
  c09-q1   question renders                            | renders                            | none
  c09-w1   working  degrades:too-wide                  | degrades:too-wide                  | none
  c09-q2   question renders                            | renders                            | none
  c09-c1   caption  renders                            | -                                  | none
  c09-p1   page     renders                            | renders                            | none
s12 calc1-chain
  c10-q1   question renders                            | renders                            | none
  c10-w1   working  renders                            | renders                            | none
  c10-q2   question renders                            | renders                            | none
  c10-c1   caption  renders                            | -                                  | none
  c10-p1   page     renders                            | renders                            | none
s13 calc1-log-derivative
  c11-q1   question renders                            | renders                            | none
  c11-w1   working  degrades:too-tall                  | degrades:too-tall                  | none
  c11-q2   question renders                            | renders                            | none
  c11-c1   caption  renders                            | -                                  | none
  c11-p1   page     renders                            | renders                            | none
s14 calc1-related-rates
  c12-q1   question degrades:too-wide                  | renders                            | none
  c12-w1   working  renders                            | renders                            | none
  c12-c1   caption  renders                            | -                                  | none
  c12-p1   page     renders                            | renders                            | none
s15 calc1-extrema
  c13-q1   question degrades:too-wide                  | degrades:too-wide                  | none
  c13-w1   working  degrades:too-wide                  | degrades:too-wide                  | none
  c13-q2   question renders                            | renders                            | code
  c13-c1   caption  renders                            | -                                  | none
  c13-p1   page     renders                            | renders                            | none
s16-17 calc1-shape
  c14-q1   question renders                            | renders                            | none
  c14-w1   working  renders                            | renders                            | none
  c14-q2   question degrades:too-wide                  | degrades:too-wide                  | none
  c14-c1   caption  renders                            | -                                  | none
  c14-p1   page     renders                            | renders                            | none
s18 calc1-optimisation
  c15-q1   question degrades:too-wide                  | degrades:too-wide                  | none
  c15-w1   working  renders                            | renders                            | none
  c15-q2   question renders                            | renders                            | code
  c15-c1   caption  renders                            | -                                  | none
  c15-p1   page     renders                            | renders                            | none
s19 calc1-newton
  c16-q1   question degrades:too-wide                  | degrades:too-wide                  | none
  c16-w1   working  degrades:too-tall                  | degrades:too-tall                  | none
  c16-c1   caption  renders                            | -                                  | none
  c16-p1   page     renders                            | renders                            | none
s20 calc1-antiderivatives
  c17-q1   question degrades:too-wide                  | renders                            | none
  c17-w1   working  renders                            | renders                            | none
  c17-c1   caption  renders                            | -                                  | none
  c17-p1   page     renders                            | renders                            | none
s23 calc1-definite-integral
  c18-q1   question degrades:too-wide                  | renders                            | none
  c18-w1   working  renders                            | renders                            | none
  c18-c1   caption  renders                            | -                                  | none
  c18-p1   page     degrades:too-wide                  | degrades:too-wide                  | none
  c18-p2   page     renders                            | renders                            | none
s24 calc1-area-so-far
  c19-q1   question renders                            | renders                            | none
  c19-w1   working  renders                            | renders                            | none
  c19-c1   caption  renders                            | -                                  | none
  c19-p1   page     renders                            | renders                            | none
  c19-p2   page     renders                            | renders                            | none
s25 calc1-ftc
  c20-q1   question renders                            | renders                            | none
  c20-w1   working  renders                            | renders                            | none
  c20-c1   caption  renders                            | -                                  | none
  c20-p1   page     renders                            | renders                            | none
  c20-p2   page     renders                            | renders                            | none
s26 calc1-substitution
  c21-q1   question renders                            | renders                            | none
  c21-w1   working  renders                            | renders                            | none
  c21-c1   caption  renders                            | -                                  | none
  c21-p1   page     renders                            | renders                            | none
  c21-p2   page     renders                            | renders                            | none
s27 calc1-area-average
  c22-q1   question renders                            | renders                            | none
  c22-w1   working  renders                            | renders                            | none
  c22-c1   caption  renders                            | -                                  | none
  c22-p1   page     degrades:script-one-letter         | renders                            | none
  c22-p2   page     renders                            | renders                            | none
forms: 162 render, 32 degrade, 0 break; examples the desk can check in code: 2 of 108
```

Each status above is declared in `calculus1.ts`, and the suite asserts that the declaration matches what it
observes. When the reader improves or regresses, the suite goes red until the baseline is declared again.
