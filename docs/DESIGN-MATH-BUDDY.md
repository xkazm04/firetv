# Lamplight: Math Buddy's design language

**Chosen 2026-09-24** in the math-buddy-landing contest (rounds 2 and 3, entry C, variant 1; the entry's `NOTES.md`
has the reasoning). In the owner's words after round 1: *"Insanely well executed level of creativity, typography
for handwritten math. Nice theme pallette for given topic."* It won round 3 on its review page, where A-level
working (fractions, exponents, integrals, logs, trig) is set in the learner's own hand and the desk's pen marks the
error **inside the line, by kind**. The handwritten maths is what the product bought; everything below exists to
protect it and to let it carry complex maths. Math Buddy is now its own app. Its TV screens use Lamplight; the
landing is [the desk](DESIGN-STUDY-DESK.md), the rest of the shell (pairing, learner, profile, break, recap) stays [On Air](DESIGN-ON-AIR.md), Linga is
[the Open Door](DESIGN-LINGA.md) and Essay Master [Specimen](DESIGN-ESSAY-MASTER.md).

The CSS is `desk/src/design/maths-lamplight.css`, scoped under `.maths-tv`. The screens are
`desk/src/maths/MathsTV.tsx`, routed by `mathsOwns` in `desk/src/tv/keys.ts`. The maths is read by
`desk/src/maths/typeset.ts` and set by `desk/src/maths/MathText.tsx`; the pen is located by
`desk/src/lib/rules/maths.ts` and drawn by `desk/src/maths/working.ts`. The faces come from `desk/src/maths/fonts.ts`.

## The idea in one line

**Homework under a lamp.** A dark room at night, one warm pool of light on the desk, and the learner's own paper
in it: their working in their hand, the question as printed, and the desk's orange pen marking the one place to
look again. Never the answer.

## Principles

1. **The hand is the hero.** The learner's working is set in Caveat at 72 px on 48 px paper squares, with the
   strokes a handwriting face lacks drawn as pen strokes in the same ink: the minus, ∫, π, ≤, ≥ and √. A stacked
   fraction has a drawn bar. It must read from the sofa and look like their page, not like a textbook.
2. **Two voices, never mixed up.** *Hand* (Caveat, ink `#27304A`) is what the learner wrote: working, answers.
   *Print* (Fraunces, italic variables, `#1D2440`) is what the sheet printed: a question, an OCR'd problem.
   Prose from the desk is Manrope, and never pretends to be either.
3. **The pen marks inside the line, by kind.** A flipped sign is ringed, one symbol only. An extra part is
   struck, still readable. A missing part opens a gap with a dashed box and a caret, and the thing itself is never
   written. The pen marks a place only when the data names it; when all the data knows is the line, the line
   gets a wavy underline and a margin arrow. No guessed positions.
4. **Ticks are claims, so they are earned.** A tick follows a line only when the marking vouches for it: the
   answer line of a right item (the substitution checked the value, or on a Calculus item `checkAnswer` did), and
   the lines before a slip the data places. An unsure item gets no tick and no mark, just a dashed ring and "not
   sure".
5. **One lamp, one thing in its light.** The item in hand sits under the lamp (the paper pans to it); the rest of
   the set is dimmed or folded. Exactly one element looks focused: the amber door, the amber pill, the lifted
   sheet, the ringed topic on the ruler, or the item on the paper with its OK chip.
6. **A verdict is a picture; sentences live in one slot.** Ticks, rings, the tally, the ruler and the pen marks
   carry the verdict. The one caption slot (the line under the hero, or the taped card beside the paper) holds
   the desk's sentence.
7. **Amber is light, orange is the pen.** Amber `#FFC56B` / `#FFB13D` is the lamp and the focus; pen orange
   `#D9741A` is the desk's marking on paper; sky `#8FB8FF` is the margin rule, the SCHOOL tick and the step-up's
   second ink line. Nothing else is coloured.
8. **Ten-foot law.** 1920 × 1080 stage, 5% safe zone (96 / 54 px), nothing under 28 px except 20–22 px uppercase
   labels that never carry a meaning alone. Working maths at 72 px, printed maths at 46–56 px; a fraction's parts
   are 70–78% of the line, never superscript-sized. The law reaches inside the line: exponents, subscripts, a
   root's index and a fraction's parts are floored at 28 px (`max(.6em, 28px)`, `max(.78em, 28px)`), so a 40 px
   folded item, an exponent inside a printed fraction and a Tonight row all read; the floor never inflates the
   72 px hand (its exponents stay 43.2 px). `tools/maths-type-test.cjs` reads the stylesheet and fails if it slips. D-pad only. Under `prefers-reduced-motion` the lamp stops
   breathing and every pen stroke is already drawn.

## Tokens

```css
--mb-night: #0B1030;  --mb-night-2: #060818;        /* ground: #0C1233 → #060818, warm glow at the foot */
--mb-amber: #FFC56B;  --mb-amber-2: #FFB13D;  --mb-amber-lo: #FFD891;   /* the lamp, the focus */
--mb-cream: #F5EEDF;  --mb-cream-hi: #FFF6E6;       /* text on the night */
--mb-paper: #F5EEDF;  --mb-paper-hi: #FFF8EA;  --mb-paper-lo: #E4D8C0; /* the sheet, 48 px squares */
--mb-ink: #27304A;    /* the hand */       --mb-print: #1D2440;  /* the print */
--mb-blue: #3A4A7A;   /* the learner's own words */  --mb-navy: #1A1D38;  /* text on amber */
--mb-sky: #8FB8FF;    /* margin rule, SCHOOL, the step-up line */      --mb-pen: #D9741A;  --mb-pen-d: #A9530E;  /* the desk's pen */
--mb-serif: Fraunces (opsz 9–144, SOFT 0–100, wght, italic), Georgia;
--mb-hand:  Caveat (wght 400–700), Segoe Print, Bradley Hand;
--mb-sans:  Manrope (wght 200–800), Segoe UI, system-ui;
--mb-sq: 48px;  --mb-hs: 72px;  --mb-ps: 46px;
```

All three faces come through `next/font/google`, self-hosted; only the `.maths-tv` root declares their variables.

## Type scale (1080p)

| role | face | size | setting |
|---|---|---|---|
| wordmark | Fraunces 600 + italic 500 amber "Buddy" | 48 | opsz 144, SOFT 100 |
| hero title (continue card) | Fraunces 560, last word italic amber | 76 | opsz 144, SOFT 100, line 1.0 |
| screen title | Fraunces 560 | 68 | same |
| door title | Fraunces 580 | 48 (60 wide) | same |
| slip name, side title | Fraunces 560 | 54 | same |
| topic name on the big ruler | Fraunces 560 | 44 (a panning ruler: the focused name 44 down to 34, the others 34) | same |
| **working (hand)** | Caveat 600 | **72** | on two squares, three with a fraction or ∫ |
| **question (print)** | Fraunces 500, italic variables | **46** (52 practice, 56 hint) | opsz 72, SOFT 30 |
| crumb | Fraunces 500 | 38 | opsz 96, SOFT 80 |
| caption, hint text | Manrope 500–600 | 34 | line 1.24–1.3 |
| action pill | Manrope 700 | 34 | 80 px tall, 56 px icon disc |
| learner's words, the next step | Caveat 600–700 | 44–48 | blue hand / pen-dark hand |
| chips | Manrope 600 | 30 | 64 px tall |
| kicker, label, tab, ruler text | Manrope 800 | 20–22 | uppercase, .16–.2em |

## The handwritten-maths grammar

**Reading.** `typeset.ts` takes the product's plain notation first: `^2`, `^(2x)`, `^{n+1}`, `**2`, Unicode
super/subscripts (`x²`, `e²ˣ`, `log₂`), vulgar fractions (`½`), `sqrt(...)` / `√`, `pi` / `π`, `int` / `∫`,
`log_2`, `ln`, trig with or without a space (`sin x`, `sinx`), `<=` `>=` `!=`, `*` (× between numbers, · otherwise),
`÷`, `×`. Runs of three or more letters (and English two-letter words: *or, of, to, cm* ...) are words; `dx`, `xy`,
`uv` stay maths. TeX is read when a line carries a command (`\frac`, `\int`, `\sqrt`, `\log_2`, `\big(`,
`\text{}`, `\quad` ...). A TeX command the reader does not know keeps its name as a word where it stands and the rest
of the line is still typeset; TeX whose braces do not close is read again as plain text; plain text keeps any
character it does not know. It never throws and never drops a character (`tools/maths-type-test.cjs`).

**Calculus notation.** `x->a`, `\to`, `\rightarrow` are one arrow. A limit (`lim_(x->0)`, `\lim_{x\to 0}`) is set
under lim. A root keeps its index: `\sqrt[3]{x}`, `sqrt[3](x)`, `cbrt(x)`, `∛x` are cube roots, the 3 small at the
sign's top-left. `sum_(i=1)^n`, `\sum`, `\prod`, `∑` are the big signs (1.3em); "sum" in a sentence stays a word.
Greek has one list: every letter the plain reader takes as a variable has a TeX name (`\delta`, `\epsilon`, `\rho`,
`\tau`, `\Sigma`, `\Omega` ...); a typed-out name (`theta`, `delta`) is the letter only beside maths (`sin(theta)`,
`2theta`, `theta = 30`, `cos theta`), and stays English in a sentence. Also `\prime`, `\partial`, `\lvert x \rvert`,
`\abs{x}`, `\left| ... \right|`, and `arcsec` / `arccsc` / `arccot` as functions. `\begin{cases}` is not laid out
as rows: it reads as one line, an open brace, the rows side by side with a wide gap. The faces load only
latin/latin-ext, so Greek, arrows, ∑, ∂ and ′ are set in a system fallback face.

**Fractions.** `a/b` stacks only where it is clearly a fraction: no space around the slash, an operand each side,
no word in either. The numerator is everything glued to the slash on its left (`7π`, `dy`, `2(x+1)`, `(a+b)` with
its grouping brackets dropped, a function with its bracketed argument: `sin(x)/x` is sin x over x, never sin of x/x); the denominator is one number, a run of letters (`dx`) or one bracket. `3 / 4`,
`and/or` keep their slash. Numerator and denominator are 78% of the line (70% for `½` and `\tfrac`), never under
28 px, with
.14em side padding and a drawn bar (.08em, tilted 1.4° in the hand) centred on the minus sign's height.

**Spacing.** Binary operators .26em each side in the hand (.22em in print), relations .28em, a unary minus
.1em, a function name .2em before its argument; two spaces in the source are a wide gap (1em), as a student leaves
between two results. Superscripts are 60% at +.64em (+1em on a bracket), subscripts 60% at −.34em, both never under
28 px (a root's index 50%, the same floor); a symbol with
both (`x_n^2`, `int_0^1`, `[F(x)]_a^b`, `sum_(i=1)^n`) stacks them in one column, superscript above, as tall as the
∫ or ∑ beside it. A continued line
that starts with "=" hangs its "=" under the "=" above.

**Rows.** Every row takes whole squares: a plain line two (96 px), a line with a fraction, an integral, a sum or
product sign, a limit under lim or a stacked pair of scripts three. A line taller than that (a fraction over a
subscripted fraction, a wrapped line) takes the next whole number of squares that holds it (`rowSquares` in
`desk/src/tv/mathsRows.ts`, measured in the same pass as the fit), so no line is ever taller than its row.
The question row sits half a square above its working.

**The four marks** (pen `#D9741A`, 5.5 px, drawn left to right, `data-role="maths-error"` with `data-kind`):

| kind | when | drawn as |
|---|---|---|
| `sign` | a sign is wrong | that one symbol ringed, a soft amber wash behind it |
| `extra` | something should not be there | one stroke through the span; the span stays readable at 72% |
| `missing` | something belongs here | a light bracket under the span, then a gap: dashed box, caret under it (`maths-gap`) |
| `line` | only the line is known | a wavy underline under the whole line |

Every marked line also gets a margin arrow, the item number is ringed, lines after the mark fade to 40%, and the
kicker beside the paper draws the same mark next to its word (MISSING, WRONG SIGN, NOT ALLOWED, LOOK AGAIN).

**Where the pen goes** is decided on the server, in `lib/rules/maths.ts`: `rootOf` finds the linear root in code
(two evaluations, a third to prove the line), and `locate` returns the first line of the learner's working that stops
holding at that root, with a ringed sign only when flipping exactly one written sign repairs the line - never on a
line where x stands alone, so the answer's own sign is never ringed. A line in words is skipped, never blamed.
Marking and a wrong settle write it into `slipAt` (a line, a span of it and a kind - kept by the store only on a
wrong item). `working.ts` only draws it, most specific first: `slipAt`, with a tick on each earlier line that reads
as arithmetic (it held at the root); `answer-not-checked` opens a gap after the last line; else the answer line,
which the verdict is about, is marked and nothing else is claimed. The rulebook's prose `points` never places the
pen or earns a tick; the taped card says "Look where the pen is." when the pen was placed from the working. The
line split (`workingLines`) and the slip names are one rule each, in `rules/maths`.

**A Calculus item is located by the chain checker (M4c).** `locate` reads linear lines only, so a Calculus set
([MATH-COURSE-PATHS.md](MATH-COURSE-PATHS.md)) is located by `rules/chain` instead: the item's working lines are read
from its own spec (`tagLines`; line 0 follows the spec's function, a line whose relation the tagger cannot tell, or a
line in words, is null and never blamed) and each line is checked numerically against the line before it. A wrong
item with working gets `slipAt` at the FIRST line the chain rings (`judgeItem`, the existing field, no new one); the
verdict stays `checkAnswer`'s. `working.ts` ticks a Calculus line before the pen only where the chain says it
holds (it computes the same chain; the school and linear lines keep the arithmetic tick); a null line gets neither
tick nor pen. If no line is rung the chain places nothing and the item takes the third step: the
answer line gets the wavy underline, and the card says "Look at ..." with the slip's place in words. The slip's
title is its Calculus name, for example "The constant left off" or "The inside not differentiated". A right one
ticks its answer line. With no working, the shared line split draws the answer alone: on the school path a bare
value is drawn as `x = <answer>`, but an item with a spec asks for no x, so a Calculus answer such as `1/3` or
`3x^2 + 2x` is drawn exactly as the learner wrote it.

**A school fractions item** (Family W5b) is marked by code too (`rules/school.ts` `check`, the answer read by the learner's
school system) and has no pen position either: a wrong one gets the wavy underline on its answer line, the slip's title
from the unit's closed list ("Added the tops and the bottoms", "The top not scaled with the bottom", "Added the tops,
kept one bottom", "Subtracted the wrong way round") only when code detected it, and otherwise the desk asks. An answer
the desk cannot read with one meaning (`0,75` on a UK profile, a rounded decimal) is the dashed ring, "not sure".

**A typed set** (Family W6) is marked by the same code from the strings the learner typed on the phone instead of strings a model read from a photo (`markTyped` in `desk/src/lib/desk/mark.ts`, `POST /api/mark` with `answers`): one string per question, a school or Calculus item by `settleSpec` under the seated learner's system, a linear item by the substitution rule when the desk can solve the equation itself. A blank or unreadable answer is "not sure", never wrong, exactly as a photographed empty answer is. There is no working and no pen position, so a wrong typed item gets the wavy underline on its answer line. No vision call and no model call is made; the history line and the learner record are the ones a photographed sheet writes.

## Components

- **Mark** - an orange rounded square (radial `#FFEBC4 → #FFC56B → #E8891F`) holding an equals sign whose lower
  bar steps forward, then "Math *Buddy*". `data-role="maths-mark"`.
- **Chips** - 64 px pills top right: the learner (initial in a navy disc), the phone (PHONE, or PIN and the code),
  the clock (PAUSED / FOCUS and the time; amber while running). Status, never a stop. `maths-chip`.
- **The sheet on the desk** - Tonight's continue card is the thing itself, tilted in 3D under the lamp: the marked
  set (questions in the hand, ticks and "look again" rings), the six unmarked questions, or the snapped page (its
  OCR'd problems in print with a highlighter reading line). Older sheets peek out underneath with day tabs from the
  real history. A pencil lies on it. The first evening is a blank sheet with a starting line - no invented sum.
- **Doors** - illustrated cards, I have homework (phone over a sheet), Teach me something (a calendar and a pencil)
  and, for a learner on the school path, Get ready for school (a school bag with a sheet in it; Family W8, help in
  school before the lesson); focused is lit amber and lifts. A Calculus learner has the first two only. Three doors keep
  the door type (48 px, 60 px on the first evening's wide row) and shrink the artwork instead: on the first evening they
  stand side by side, art (176 px) over text; beside the continue card the 586 px column cannot hold three side by
  side, so they stack as rows (art 112 px, text beside it, the lit one slides left instead of up). Left/Right walk
  them in stop order either way. Each door's caption is one sentence.
- **Get ready for school** (Family W8, `Prepare`, `desk/src/tv/prepareRows.ts`) - the units as cards (Fraunces 38,
  four lines at most, the year word below in Manrope 30 amber) under strand headings (20 px uppercase labels with a
  rule under them), on a track that pans under the lamp like the Topics ruler, a heading kept on the stage past the
  left fade. The lit card is amber and lifts; its glow stays inside the window. Nothing of the path is drawn here. The
  question is two cells (Fraunces 48 with a 21 px label above: "Your level" / "The usual", "More of the harder ones" /
  "A step up"); while it is open the unit is held (an amber outline, not lit) and the rest of the cards dim, so the lit
  cell is the one thing lit. `maths-prepare`, `maths-choice`.
- **The second ink line** (Family W8, the step-up) - a unit whose step-up record has latched (`SkillRecord.stretch` in
  `desk/src/lib/session/learners.ts`, `stretchSecure` in `desk/src/tv/mathsRows.ts`) gets a second, thinner line
  (6 px, `--mb-sky`, a 1.5 px navy edge so it reads on the boxwood) under its groove on the ruler, 6 px below the ink
  (4 px on the big ruler). On Tonight's strip a strand's second line is as long as its share of such units. On Topics
  the focused unit's kicker draws the same two lines small with the words "A step up". It is a picture that latches:
  never a digit, a count, a percent or the word points (`tools/school-ruler-test.cjs` W8 3); it is drawn exactly as
  the records say, so a unit whose usual record is not secure can carry it (the learner stretched first), and the
  groove, the word under the topic and Tonight's "N of M topics secure" stay about the usual record. Static: it does
  not grow in. `.mb-ink2`, `data-role="maths-stretch"`.
- **How a scratch leaves the ruler** (challenge-2026-10-07 math-buddy-A). A slip is set down when the child makes it and
  rubbed out when they stop, decided in code (`desk/src/lib/rules/slips.ts`, applied in `session/learners.ts`). On a
  school unit each marked attempt carries the slips its item *shows* (`slipShows` in `rules/school.ts`, pinned to the
  desk's own `check`); the third usual right answer on items that show a live slip, counted since it was last made,
  rubs it out of `skills[topic].slips` and its pencil scratch leaves the ruler. Making it again starts the count over
  and puts it back as the newest. A right answer on an item where it cannot show moves nothing, a step-up attempt moves
  neither slips nor counts, and a linear or Calculus topic never rubs a slip out. The ruler draws the **newest** four
  live scratches (`data-slips`). **Six more** on a school unit is drawn in code so at least three of six would show
  the learner's live slips (`makeSchoolItems` with an aim), and its card names the newest one in the desk's slip words
  (`moreLine` in `tv/mathsRows.ts`); with no live slip it claims no aim. A picture, not a number: no count is drawn.
- **The ruler** - the topic path as a boxwood ruler: secure topics inked navy, an in-progress one hatched to its
  estimate, unseen ones a dashed groove, slips as pencil scratches. The learner's name on a lamp-lit needle at the
  frontier (`rulerFrontier` in `desk/src/tv/rulerRows.ts`: on the school path the first topic not secure after the
  last secure one, so a learner who secured one-step equations keeps the needle on two-step equations when a unit is
  placed before them; on a course the first topic not secure); SCHOOL on a sky dashed tick where the school system
  would have them, only when the profile has an age and a school type. The dashed gap line between the needle and
  the tick is **not drawn** until the learner has a Math placement (owner decision D2, Family Phase 1: `schoolMarks`
  in `rulerRows.ts`, `mathPlaced` in `desk/src/tv/mathsRows.ts`, false for everyone in Phase 1); its code stays. On Topics each topic carries a word - Secure, In progress, Not started - and "Secure" comes
  from the same latched record as the inked groove (`topicStates` in `desk/src/tv/mathsRows.ts`), never from a count
  of tonight's right answers, so a hatched groove never says Secure. The ruler is the learner's own path
  (`learnerPath` in `desk/src/lib/library/paths.ts`): the school path draws each topic's school year and the SCHOOL
  tick; a course path (Calculus 1) has no school year, so it draws no year word, no SCHOOL tick and no gap line
  (`expectedOn` is null). The learner picks the path on the profile's Maths course row (the shell's profile
  screen). Every screen names a set by its path's name for it (`topicName`), never a spelled-out id. Teach me
  something opens Topics at the learner's **frontier** (`topicsFocus` in `desk/src/tv/keys.ts`, `frontierOn` in
  `paths.ts`: the needle's rule on the school path, the first topic not latched secure whose prerequisites all are on
  a course), and at the first stop when nothing is secure or nothing is left.
  Where each box, tick, strand label and needle goes is `rulerModel` in `desk/src/tv/rulerRows.ts`; the school path,
  **School maths** (seventeen topics since v2 M2b, fifteen since Family W7 batch 3: the four fractions units, One-step equations, the four
  decimals and percent units - Add, subtract and multiply decimals; Fractions, decimals and percent; A percent of an
  amount; Percent increase and decrease - Ratio and sharing and Unit rates and direct proportion ("Ratio and rates"),
  Area of rectangles, triangles and composite shapes and Mean and range ("Geometry and data"), then the other two
  linear-equation topics, then Pythagoras' theorem and Probability of an event (v2 M2b, a second "Geometry and data" bar):
  seven bars, Equations twice and Geometry and data twice), is drawn on Tonight as the **strip** below, and **pans** on the
  big Topics ruler, since a 112 px slot is under the 288 px minimum: the focused topic takes the 640 px slot and its
  name is whole at 44 px (measured on every stop at 1920 x 1080 and 1280 x 720, `tools/school-units3-live.cjs`). On a
  panning school ruler the SCHOOL tick is drawn only while it is on the stage, its pill turned inward within 90 px of
  the window's edge (`flagOnStage`), so the window never cuts it; opened at the frontier, a learner's tick is in view. A path too long for one box per topic on the big ruler (under 288 px a
  slot: Calculus 1's 22 topics in six strands) **pans under the lamp** like the paper: the track is wider than the
  stage and slides (the paper's .76 s pan) so the focused topic's centre sits under the lamp, clamped so neither end
  ever shows a gap; the focused topic takes a 640 px slot so its whole name is shown in at most three lines, fitted
  from 44 down to 34 px (`fitName`); every other name is 34 px, three lines at most; an edge with more to show fades
  and carries a chevron; strand labels sit at their strand's start and clamp to its width with an ellipsis (the
  focused strand's full name is always in the lede's kicker). On Tonight a path of more than eight topics is drawn
  as a **strip** (`stripModel`): one bar per strand, as wide as its share of the topics and never under 96 px - nor
  under the room its label needs whole in at most two lines of whole words (Family W7 batch 3), inked
  by its share of latched-secure topics, the learner's needle at the frontier (on a course the first topic not secure
  whose prerequisites are; on a school path the needle's rule above); no topic names, no year. On a school path the
  strip carries the SCHOOL tick (`stripFlag`, Family W7 batch 2: D2 keeps the tick on the child's TV), its pill turned
  inward at either end, and no gap line; every strip label is whole ("Ratio and / rates", "Geometry / and data"; the
  one-topic Equations bar, which read "Equati…", is 189 px). `maths-ruler`; the chevrons are `maths-more`.
- **The paper** - cream, 48 px squares, a sky margin rule at 96 px, the sheet title in Fraunces and the learner's
  name in the blue hand; it pans so the item in hand is under the lamp. A line too long for the paper - a long line
  of working, a long printed question - is fitted to it (`fitRow` in `desk/src/tv/mathsRows.ts`): it shrinks in
  2 px steps, never under the 28 px floor, with the pen's gap box and the tick inside the paper and "=" still under
  "="; a line too wide even at 28 px wraps onto whole squares between its typeset parts, and a single token too
  long for a line (an 80-digit number, a long word) breaks where it must - only on a wrapped line. The Practice
  sheet takes the same fit; it has nothing to pan to, so when its six questions run past the safe line it is drawn
  on smaller squares (48 down to 36 px, `paperSquare`) until all of it is on screen. On a snapped Page every problem
  keeps clear of the lit item's OK · Hint badge. `maths-sheet`.
- **Hand and print lines** - `maths-hand`, `maths-print`, fractions `maths-frac`, ticks `maths-tick`.
- **Tally** - the set as six hand-drawn numbers in the top bar: ticked, ringed, dashed when unsure; the current one
  lit.
- **Taped card** - a cream card with a strip of amber tape: the one caption slot beside the paper. On the hint:
  the learner's question from the phone in the blue hand (`maths-said`), HINT with two pips, the hint, and the next
  step in the pen-dark hand. A hint on a Calculus page is written in a first-year Calculus I stance when the learner
  is on the calc1 path. It is checked against the task's own answer whenever the task reads into a Calculus spec.
  When it gives the answer away twice, the card shows the shape's fixed sentence instead, for example "Find the
  derivative as a function first, then put the point in. The value is yours to work out." On the calc1 path there
  is no lesson to show, so the lesson pill says "No lesson for this". On the sheet and walk: THE DESK SAYS / THE
  DESK REPLIED over the desk's line (`maths-said`) and "Look at ..." from the rulebook. `maths-hint`.
- **Slip name** - Fraunces 54 with its last word in amber italic. `maths-slip`.
- **Pills** - 80 px, an icon disc, a word; focused is amber and scales 1.08. The first action is primary.
  `maths-primary`, `maths-secondary`.
- **Titles** - `maths-title` on the screen's one title.

## Screens

| screen | composition |
|---|---|
| Tonight | top bar; the sheet on the desk + kicker, title, detail, OK Open (or the first-evening title and blank sheet); two doors, three on the school path (Get ready for school, W8); the caption; the ruler (a path of more than eight topics: the strand strip, with a step-up line under a bar where units' step-ups have latched) |
| Get ready for school | top bar with the crumb; "What is school *doing?*"; the lit unit's strand and blurb, or the two cells and the lit cell's sentence; the units as cards by strand, each with the learner's year word, panning under the lamp |
| Topics | "Pick a *topic*"; the strand and blurb (or Preparing / Not written); the ruler, larger, each topic on the learner's path a stop, the lamp opening on the frontier (a long path pans under the lamp, chevrons at the edges) |
| Practice | the paper headed with the topic's name on its path, with the six questions in print (on Calculus 1, questions the desk printed itself from its specs: "Differentiate f(x) = ...", "Find lim_(x->0) ..."; on a school unit, six the desk wrote itself with no model call, three at tier 1 then three at tier 2: "Work out 3/4 + 1/6.", "Fill in the missing number: 3/4 = ?/12." with the gap '?' stacked over 12 at the fraction size, "Write 18/24 in its simplest form.", "Find 3/5 of 40 kg.", "Work out 3/4 ÷ 1/2.", the fractions stacked); the side: "Work these on *paper*" and the taped card |
| Sheet | the tally; the marked set on the paper, each item folded to its question and the line the pen is on, the focused one lit with OK Open; the side: kind, slip name, taped card; pills Six more ("Six more on" the topic's name), Put the sheet away |
| Walk | the same paper with one item open: every line of working, ticks, the mark, later lines faded; the side card; Back to the sheet on the last item |
| Page | the snapped sheet as paper, its OCR'd problems in print, the one under the lamp lifted with OK Hint; the side: the problem's number, with its unit when the task reads as a school unit on the learner's path ("Number 3 · Add and subtract fractions"), problem count, read time, the real photo with the band; Menu shows the photo whole |
| Hint | the problem on the paper, lines left for the learner's own working; the taped card with hint 1 then hint 2; pills Still stuck, Show me the lesson (on the calc1 path, "No lesson for this"); on a task that reads as a school unit with a code generator, on the learner's path, the second pill is "Six like this" ("Writing six like it" while the set is written, the hint kept on the card; a failed set puts the job's own sentence on the card): one press writes six on that unit by code, and the set reaches the record and the ruler (math-buddy-B) |
| Lesson | the video in a lamp-lit wooden frame; the side: the part that matters, the concepts, why |
| Units, Calendar | a contents page on the paper; a planner of index cards (done ticked in pen, next taped, later dashed). Both list the learner's path's lessons only; on a path with none (Calculus 1) each shows its title and one caption, "No lessons for Calculus 1 yet. The desk explains a step when you ask.", with nothing to focus |

## What Lamplight is not

Not On Air: no charcoal, no red band, no condensed caps, no ticker, no rail. Not a textbook: the working is the
learner's hand, not typeset solutions. Not a marker's red pen: the pen names a place and a kind, never the right
answer, and never a position the data does not hold. Not a dashboard: no percentages; a set is ticks and rings.

## The collection (v2 R1, 2026-10-07)

Owner decisions V1 (D3 reversed), X1 and S1: rewards are a collection drawn in Lamplight's own world, earned only by
latches the desk already keeps (`lib/rules/collect.ts`). On Tonight, a shelf beside the wordmark holds **a lit lamp for
every topic latched secure**, and **a star over the lamp** when that topic's step-up record is latched too (the extra
mile). The twelve most recent are shown, oldest on the left. Never a number, never for volume, never lost. Adult mode
shows no shelf (X2: progress, not a game). `data-role="maths-collection"`; `maths/MathsCollection.tsx`.

## The worked lesson (v2 M1, 2026-10-07)

"Teach me something" now teaches before it practises. Select on a generated school unit (the twelve with a generator) opens
`worked`, a new screen. **The paper** holds three worked examples: questions from the unit's own generator, and answers in
the desk's pen. Each answer is built from the spec's truth (`rules/school` `workedAnswer`) and shown only when `check`
marks it right for the learner's school system, so it uses a decimal comma in cz/de, money to the cent, and the unit
kept. **The taped card** holds the idea and three method steps (`library/worked.ts`, authored, words only). The idea may be
reworded by the model in the learner's voice (fast, thinking off); its words are kept only with no digit, at most three
sentences and 320 characters, else the authored idea stands. **Try six** writes the usual set; **Back to the topics**
returns. The linear and Calculus topics still go straight to their set. Measured over 19,200 generated items (12 units,
both tiers, four systems, 200 seeds): every one has a worked answer `check` confirms. Route `/api/worked`, job kind
`teach`.

## Calculus graphs (v2 M4a, 2026-10-07)

A Calculus item open on `walk` shows its graph under the card (`maths/plotting.ts`, `maths/Plot.tsx`, `data-role="maths-plot"`),
on paper in Lamplight's hand: the axes in faint ink, the curve in ink, a tangent dashed in the desk's pen at the point a
derivative-at item asks about, the area washed in amber between a definite integral's bounds, a dot at the point an
evaluate or limit item is about. The window per shape comes from `plotFor`. The y range is the 5th-95th percentile,
padded, and it includes y = 0 when that is near. A pole is never bridged. The tangent's slope is `derivativeAt`, the same
numeric derivative the marking uses. A graph shows what the desk computed; it never marks.

## A word problem on the paper (v2 M3a, 2026-10-08)

A Calculus set on related rates, optimisation or maxima and minima may end with a question in parts that code drew
(`lib/rules/calc-word.ts`): a situation in sentences, then (a) and (b). Each part is an ordinary item of the set, with its
own spec, mark and record; the paper only groups them.
- The stem is printed once, above its parts, beside the question's number (`data-stem`). It goes through `prose()` into
  the wrapping row (`mb-row q wrap`, `data-role="maths-stem"`) and is never set in the nowrap question row, where a
  sentence runs past the paper.
- Each part is its own row under the stem. Its number box reads (a), (b) (`data-part`), its line is prose in the wrapping
  row (`data-role="maths-part"`), and it has its own answer line, tick, ring and pen, exactly as a single item has.
- The tally in the top bar names a part with its question's number and letter together (5a), so it fits the mark. The
  card names it as the paper does ("Number 5(b) needs another look"); the stored line keeps its item number.
- A part whose function the stem does not print, as in a story, shows no graph under the card, because the curve would be
  one the learner never saw. The cubic of "the maximum and the minimum" prints its function and keeps its graph.
- A story's working names its function by a capital letter (A for an area). The chain checker reads `A = x(14 - x)` as
  that function, so a right first line is never rung. On the two integral shapes a capital letter is still an
  antiderivative.
- A set with no parts draws exactly as before. Nothing is counted on screen that was not counted before.

## Tables in the typesetter (v2 M4b, 2026-10-07)

The custom typesetter (`maths/typeset.ts`, `MathText.tsx`) now lays out `cases`, `matrix`, `pmatrix`, `bmatrix`,
`vmatrix`, `aligned`, `align` and `array` as rows and columns (`{ t: "table" }`). Before, these were read as one line.
- Cells are typeset like any other text.
- Brackets are drawn as strokes that stretch to the table's height, so they work in both the print and hand voices.
- `cases` has a brace on the left only; `aligned` sets its columns right then left around the `&`.
- An environment the desk does not set as a table reads as it always did, and an unclosed one never throws.
- A table counts as tall (three squares of paper).

KaTeX stays deferred ([concept](concepts/KATEX-TYPESETTING.md)).

## A paper you sat (v2 M5b, 2026-10-08)

The recovery from a failed paper has its own screen (`paper`, `PaperScreen`), on the wide lamp (`data-lamp="wide"`).
Typed entry is the door that ships; the photo path is M5c's.
- Left, the topics where marks were lost, in the order `recovery()` gives them (the base of the biggest loss first) and
  never re-sorted: five rows at a time (`mb-prow`, 104 px, the lit row amber-ruled), a number, the topic's name, "N marks
  lost" in amber, "From 5(b), 7" under it. A topic the desk calls secure keeps its row and wears a "Secure on the desk"
  pill (`data-role="maths-paper-secure"`): the paper decides, the desk only says what it knows.
- Right, two cards. The paper's: the marks scored large, "of 80", and "N of M marks - K marks lost". Under it, only when
  there is something to say, **Not on the desk yet** (`mb-poff`): the statements with no topic, set in their can text, three
  at a time, then "and n more"; a statement past a Foundation paper says so, and questions that named no statement are counted.
- The caption (the screen's one caption slot, 930 px) starts the learner at the first topic. With no paper the screen asks
  for the marks on the phone. The screens say "a paper", "your paper": nothing says the board's name while its claim is off.
- The D-pad: Left/Up and Right/Down walk the topics, Back or Menu return to Get ready for school. The list is opened from the
  phone (the Paper panel sends the paper, or shows the last one); Get ready for school's own keys are unchanged.
- The slip card (`SlipSide`) now says its line through `deskLine`, the one place a part is named as the paper names it;
  the text is the same as before for every item.
- A paper whose rows were fine but could not be written to the learner file says so (v2 M5c, ruling 11): "That paper
  was not saved: ...", never "The desk kept no question from that paper.", which is kept for a paper with no row left.
  Either way nothing is kept and the TV stays where it was.

## The photo path's reader and its probe (v2 M5c, 2026-10-08)

**The photo path is not offered.** Typed entry stays the door until the probe below, run live on the owner's PC, maps at
least 85% of items to the right unit (the M5 kill row, ruling 1). A stubbed or simulated pass never ships it. Nothing
on the phone or the TV changed in M5c: no route, no event, no button reads the reader yet.
- **The reader** (`desk/src/lib/desk/paperRead.ts`, `readPaper`): one vision call per photo, beside `read.ts`. The model
  lists each question or part that has a mark beside it: the label as printed ('5(b)'), the marks the marker wrote, what
  it is out of, and at most 3 statement codes chosen from a list in the prompt (each statement's code with its can
  text), by the question's own words. It is asked to copy numbers and never to add, count, total or compare marks, and
  the prompt names no board. The rows come back raw; `cleanPaper` decides what stands, exactly as for typed rows.
- **The probe** (`tools/paper-probe.cjs`): 20 marked papers generated from a fixed seed. Each is an answer key (real
  statement codes within the caps: parts like 3(a) and 3(b), items naming two statements, at least three items the desk
  has no topic for, one past Foundation) and an A4 SVG of it: the question numbers and stems in print, the allocation
  in brackets at the right, the marker's "2/3" in red beside it with a tick or a cross. The stems are a written pool; no
  stem shares a run of four words with the can text of a code it keys, so a right code is read from the question, not
  copied from the list. Live, each SVG becomes a PNG (sharp), is read, cleaned and scored.
- **The score** (`desk/src/lib/rules/paperScore.ts`, pure): an item is mapped when the read has its label and the read
  codes reach the same desk topics and the same not-on-the-desk statements as the key's, found by `recovery()` itself
  (so R7 for R10 is still the same unit). The figure is mapped items over key items across the 20 papers. Labels read,
  marks read exactly, codes read exactly, rows dropped and extra items are reported beside it and decide nothing; a pass
  with marks read under 85% goes to the owner as a question, because the recovery list weighs topics by lost marks.
- **What a pass would mean:** the papers are clean renders, not phone photos of handwriting, so a live pass is an upper
  bound on a real photo. When it passes, the door (a Snap on the Paper panel feeding the same `paper.enter`) is its own
  slice, with its captures.
