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
`desk/src/maths/typeset.ts` and set by `desk/src/maths/MathText.tsx`; the pen is placed by
`desk/src/maths/working.ts`. The faces come from `desk/src/maths/fonts.ts`.

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
   answer line of a right item (the substitution checked the value), and the lines before a slip the data
   places. An unsure item gets no tick and no mark, just a dashed ring and "not sure".
5. **One lamp, one thing in its light.** The item in hand sits under the lamp (the paper pans to it); the rest of
   the set is dimmed or folded. Exactly one element looks focused: the amber door, the amber pill, the lifted
   sheet, the ringed topic on the ruler, or the item on the paper with its OK chip.
6. **A verdict is a picture; sentences live in one slot.** Ticks, rings, the tally, the ruler and the pen marks
   carry the verdict. The one caption slot (the line under the hero, or the taped card beside the paper) holds
   the desk's sentence.
7. **Amber is light, orange is the pen.** Amber `#FFC56B` / `#FFB13D` is the lamp and the focus; pen orange
   `#D9741A` is the desk's marking on paper; sky `#8FB8FF` is the margin rule and the SCHOOL tick. Nothing else
   is coloured.
8. **Ten-foot law.** 1920 × 1080 stage, 5% safe zone (96 / 54 px), nothing under 28 px except 20–22 px uppercase
   labels that never carry a meaning alone. Working maths at 72 px, printed maths at 46–56 px; a fraction's parts
   are 70–78% of the line, never superscript-sized. D-pad only. Under `prefers-reduced-motion` the lamp stops
   breathing and every pen stroke is already drawn.

## Tokens

```css
--mb-night: #0B1030;  --mb-night-2: #060818;        /* ground: #0C1233 → #060818, warm glow at the foot */
--mb-amber: #FFC56B;  --mb-amber-2: #FFB13D;  --mb-amber-lo: #FFD891;   /* the lamp, the focus */
--mb-cream: #F5EEDF;  --mb-cream-hi: #FFF6E6;       /* text on the night */
--mb-paper: #F5EEDF;  --mb-paper-hi: #FFF8EA;  --mb-paper-lo: #E4D8C0; /* the sheet, 48 px squares */
--mb-ink: #27304A;    /* the hand */       --mb-print: #1D2440;  /* the print */
--mb-blue: #3A4A7A;   /* the learner's own words */  --mb-navy: #1A1D38;  /* text on amber */
--mb-sky: #8FB8FF;    /* margin rule, SCHOOL */      --mb-pen: #D9741A;  --mb-pen-d: #A9530E;  /* the desk's pen */
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
| topic name on the big ruler | Fraunces 560 | 44 | same |
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
`\text{}`, `\quad` ...). TeX it cannot read is read again as plain text; plain text keeps any character it does not
know. It never throws and never drops a character (`tools/maths-type-test.cjs`).

**Fractions.** `a/b` stacks only where it is clearly a fraction: no space around the slash, an operand each side,
no word in either. The numerator is everything glued to the slash on its left (`7π`, `dy`, `2(x+1)`, `(a+b)` with
its grouping brackets dropped); the denominator is one number, a run of letters (`dx`) or one bracket. `3 / 4`,
`and/or` keep their slash. Numerator and denominator are 78% of the line (70% for `½` and `\tfrac`), with
.14em side padding and a drawn bar (.08em, tilted 1.4° in the hand) centred on the minus sign's height.

**Spacing.** Binary operators .26em each side in the hand (.22em in print), relations .28em, a unary minus
.1em, a function name .2em before its argument; two spaces in the source are a wide gap (1em), as a student leaves
between two results. Superscripts are 60% at +.64em (+1em on a bracket), subscripts 60% at −.34em. A continued line
that starts with "=" hangs its "=" under the "=" above.

**Rows.** Every row takes whole squares: a plain line two (96 px), a line with a fraction or an integral three.
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

**Where the pen goes** (`working.ts`), most specific first: the marker's `slipAt` (a line, a span of it and a
kind - an optional `PracticeItem` field the store keeps only on a wrong item; nothing fills it yet); else the slip's
rulebook `points` when it names a line ("the second line", "the last line") - that line is marked and the lines
before it ticked; `answer-not-checked` opens a gap after the last line; else the answer line, which the verdict is
about, is marked and nothing else is claimed.

## Components

- **Mark** - an orange rounded square (radial `#FFEBC4 → #FFC56B → #E8891F`) holding an equals sign whose lower
  bar steps forward, then "Math *Buddy*". `data-role="maths-mark"`.
- **Chips** - 64 px pills top right: the learner (initial in a navy disc), the phone (PHONE, or PIN and the code),
  the clock (PAUSED / FOCUS and the time; amber while running). Status, never a stop. `maths-chip`.
- **The sheet on the desk** - Tonight's continue card is the thing itself, tilted in 3D under the lamp: the marked
  set (questions in the hand, ticks and "look again" rings), the six unmarked questions, or the snapped page (its
  OCR'd problems in print with a highlighter reading line). Older sheets peek out underneath with day tabs from the
  real history. A pencil lies on it. The first evening is a blank sheet with a starting line - no invented sum.
- **Doors** - two illustrated cards, I have homework (phone over a sheet) and Teach me something (a calendar and
  a pencil); focused is lit amber and lifts.
- **The ruler** - the topic path as a boxwood ruler: secure topics inked navy, an in-progress one hatched to its
  estimate, unseen ones a dashed groove, slips as pencil scratches. The learner's name on a lamp-lit needle at the
  frontier; SCHOOL on a sky dashed tick where the school system would have them, only when the profile has an age
  and a school type. `maths-ruler`.
- **The paper** - cream, 48 px squares, a sky margin rule at 96 px, the sheet title in Fraunces and the learner's
  name in the blue hand; it pans so the item in hand is under the lamp. `maths-sheet`.
- **Hand and print lines** - `maths-hand`, `maths-print`, fractions `maths-frac`, ticks `maths-tick`.
- **Tally** - the set as six hand-drawn numbers in the top bar: ticked, ringed, dashed when unsure; the current one
  lit.
- **Taped card** - a cream card with a strip of amber tape: the one caption slot beside the paper. On the hint:
  the learner's question from the phone in the blue hand (`maths-said`), HINT with two pips, the hint, and the next
  step in the pen-dark hand. On the sheet and walk: THE DESK SAYS / THE DESK REPLIED over the desk's line
  (`maths-said`) and "Look at ..." from the rulebook. `maths-hint`.
- **Slip name** - Fraunces 54 with its last word in amber italic. `maths-slip`.
- **Pills** - 80 px, an icon disc, a word; focused is amber and scales 1.08. The first action is primary.
  `maths-primary`, `maths-secondary`.
- **Titles** - `maths-title` on the screen's one title.

## Screens

| screen | composition |
|---|---|
| Tonight | top bar; the sheet on the desk + kicker, title, detail, OK Open (or the first-evening title and blank sheet); two doors; the caption; the ruler |
| Topics | "Pick a *topic*"; the strand and blurb (or Preparing / Not written); the ruler, larger, each topic a stop |
| Practice | the paper with the six questions in print; the side: "Work these on *paper*" and the taped card |
| Sheet | the tally; the marked set on the paper, each item folded to its question and the line the pen is on, the focused one lit with OK Open; the side: kind, slip name, taped card; pills Six more, Put the sheet away |
| Walk | the same paper with one item open: every line of working, ticks, the mark, later lines faded; the side card; Back to the sheet on the last item |
| Page | the snapped sheet as paper, its OCR'd problems in print, the one under the lamp lifted with OK Hint; the side: problem count, read time, the real photo with the band; Menu shows the photo whole |
| Hint | the problem on the paper, lines left for the learner's own working; the taped card with hint 1 then hint 2; pills Still stuck, Show me the lesson |
| Lesson | the video in a lamp-lit wooden frame; the side: the part that matters, the concepts, why |
| Units, Calendar | a contents page on the paper; a planner of index cards (done ticked in pen, next taped, later dashed) |

## What Lamplight is not

Not On Air: no charcoal, no red band, no condensed caps, no ticker, no rail. Not a textbook: the working is the
learner's hand, not typeset solutions. Not a marker's red pen: the pen names a place and a kind, never the right
answer, and never a position the data does not hold. Not a dashboard: no percentages; a set is ticks and rings.
