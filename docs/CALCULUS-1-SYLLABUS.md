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

## Why a separate spine, and what promoting it would take

`SYLLABUS` (`desk/src/lib/library/syllabus.ts`) is the school-year spine: three linear-equation topics with
US/UK/CZ/DE year bands. Several things read it as the whole path. `expectedIndex` counts topics a learner of a given
age is already past. `TOPIC_STOPS` is the D-pad's stop list on the Topics screen. `COUNT` and the Tonight title say
"n of 3 topics secure". `topic.open` focuses on a `SYLLABUS` index, and `settleOwners` and `continueCard` name a
set by it. If Calculus were appended to it, a 16-year-old would count as behind on a university course, and the
ruler would run to 25 stops. `CALCULUS_1` is therefore a fixture only, and nothing reads it but the tests.

Promoting it would take four things:

1. A notion of a course (a learner's path) that `expectedIndex`, the ruler and the Tonight count read, instead of
   one global list.
2. Practice generation and marking that can serve Calculus (see "What the desk can check" below).
3. Lesson picks for its topics.
4. Declared fixes for the degrades below.

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

**The pen (found by `maths-calculus-live.cjs --dry`).** `markLine` leaks raw TeX when the pen's span cuts through a
TeX construct. Take the working line `y' = \frac{\frac{1}{x}\cdot x - \ln x \cdot 1}{x^2}` marked at `- \ln`:
the pre and post parts no longer parse as TeX, fall back to plain text, and put `\frac{`, `\cdot` and `}{` on the
TV. The same happens to the limit line in c14-w1. This affects the Sheet and the Walk whenever a slip is located
inside a TeX working line. It belongs to `typeset.ts` and is outside this baseline's write set.

**Captions are prose.** The TV passes a caption through `prose()` into the card and never through `parseMath`. The
suite still runs the reader's checks on captions, and additionally checks the longest word against the card.

## What the desk can check in code

Only 2 of the 108 examples can be checked in code: `c13-q2` (`3x^2 - 12 = 0` at 2) and `c15-q2`
(`20 - 2x = 0` at 10). These are the bare equations in x that a working reaches. `verify.ts` reads one
equation of arithmetic in x. It cannot read:

- a limit, a derivative, an integral or a sum;
- a function name or any other letter (`c`, `h`, `t`, `u`, `y`);
- ≈;
- a question worded as a sentence.

It cannot confirm an approximation either: Newton's 17/12 does not satisfy x² - 2 = 0. So practice generation
(whose stated answers are verified by substitution) and marking (whose verdicts rest on it) cannot serve Calculus
today. That is the L direction `calculus-check-layer`: a checker per answer shape, such as a value at a point, an
antiderivative up to a constant, a limit value and a definite integral, before any Calculus set is written or
marked.

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

It writes `artifacts/math-calculus/<topic>-<screen>.png`, `report.json` and `report.md`. The Topics screen still
shows the school spine, because Calculus is not on it (see above).

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
