# Specimen — the Essay Master design language

**Chosen 2026-09-24** in the essay-master-landing contest, round 2 (entry B, variant 3; the entry's
`NOTES.md` has the reasoning). Essay Master is its own app, so its TV screens leave On Air
([DESIGN-ON-AIR.md](DESIGN-ON-AIR.md)); every other module keeps it. Rules, not a mood board.
The CSS is `desk/src/design/essay-specimen.css`; the screens are `desk/src/essay/EssayTV.tsx`.

## The idea in one line

**The type is the diagram.** A type specimen for the words of a lesson: the lens names are the
progress bars, a sentence's missing half is drawn hatched, and the move that fixes it is set so large
it reads from the sofa. Bold type that still carries nested, readable content.

## Principles

1. **One focused thing, drawn as a writing app draws it.** A blinking citron caret before the focused
   word or row; a bone plate with a citron ring on a focused action. Nothing else on screen looks focused.
2. **Ink means done, hatch means still to write.** A lens is inked from the left as far as the learner
   has got, with a citron cursor bar at the ink's edge. A lens never read is a hatched plate. The half of
   a move a sentence misses is hatched, with the caret waiting at it; Rewrite on my phone inks it.
3. **Arrows mean direction.** A paragraph is a column of arrows, one per sentence, as long as the
   sentence. A sentence that argues against the paragraph points back, in citron. Slots carry an arrow for
   the side they stand for.
4. **Each layer has its own size, so nothing competes.** On one sentence page: the sentence at 54,
   the problem at 34 in the one caption slot, the move at 128, the pattern at 44. Nothing between them.
5. **A verdict is a picture; sentences live in the caption slot.** The rail, the underline, the
   reversed arrow and the hatch say what is wrong; the one caption says why, in one sentence.
6. **Teach the move, never write the sentence.** The page shows the move and a pattern with empty
   slots. It never shows a rewritten sentence, not even as an example. The learner writes on the phone.
7. **Citron is the only colour.** One accent on near-black and bone. It marks what needs the eye:
   the fault, the move, the focus, the next step. A screen with citron everywhere has lost its signal.
8. **Motion is the lens at work, and never required.** Structure splits, Argument leans, Evidence
   highlights, Language ripples; ink draws in. Under `prefers-reduced-motion` all of it is a cut.
9. **Amazon's constraints.** 5% safe zone (96 px sides, 54 px top and bottom on the 1920 x 1080 stage).
   Nothing under 28 px except 20-22 px mono labels, which never carry a meaning alone. D-pad only.

## Tokens

```css
--em-bg:       #0B0B0D;               /* near-black ground */
--em-bg-lift:  #17171B;               /* the radial lift behind the content */
--em-bone:     #EEE9E0;               /* text, ink, the focused plate */
--em-mute:     rgba(238,233,224,.62);
--em-faint:    rgba(238,233,224,.26);
--em-hair:     rgba(238,233,224,.12); /* rules, idle borders */
--em-cit:      #DCFF4E;               /* the one accent */
--em-hatch:    repeating-linear-gradient(135deg, rgba(238,233,224,.46) 0 3px, transparent 3px 11px);
--em-disp:     "Bricolage Grotesque" (variable: opsz 12-96, wdth 75-100, wght 200-800), Arial Narrow, system-ui;
--em-mono:     "IBM Plex Mono" 500/600, Consolas, monospace;
```

Both faces come through `next/font/google` (`desk/src/essay/fonts.ts`), self-hosted, and only the
`.essay-tv` root declares their variables. Offline, `next dev` falls back to the system faces.

## Type scale (1080p)

| role | face | size | setting |
|---|---|---|---|
| lens word, playbook word | Bricolage 800 | 188 | UPPER, wdth 75, opsz 96 |
| the move, a role word | Bricolage 800 | 128 (fits down to 72, then wraps) | UPPER, wdth 75 |
| x-ray role word | Bricolage 800 | 128 | UPPER, wdth 75 |
| the sentence | Bricolage 600 | 54 (46 / 40 for long ones) | wdth 86, opsz 60 |
| wordmark | Bricolage 800 + 300 | 54 | wdth 80 |
| pattern words, opener | Bricolage 700 | 44 | wdth 88; opener citron |
| card headline | Bricolage 600 | 44 (60 empty) | wdth 88 |
| caption, problem | Bricolage 500 | 34, line 1.2 | wdth 92 |
| slot | Bricolage 400 | 32 | wdth 90, muted |
| chips, actions, status | Bricolage 600 | 30 | — |
| numbers, role chips, timer | Plex Mono 600 | 28-44 | — |
| label | Plex Mono 600 | 20-22 | UPPER, .12em |

## Components

- **Mark** — a whole E and a citron caret after it; ESSAY in 800, MASTER in 300 (`data-role="essay-mark"`).
- **Chips** — 64 px pills, top right: what Menu does here, the focus timer, the phone, the learner.
  Status, never a stop. The phone chip lights citron while a rewrite is on the phone.
- **Lens word** — the 188 px word: a faint plate, the ink clipped to the estimate, the citron cursor bar
  at its edge (`essay-lens-word`, `essay-lens-meter`); status beside it: Secure / Read + a day / Not read.
- **Specimen card** — the last paragraph as a strip of blocks (faulty ones citron, pointing back) and a
  door to the sentence that needs a look (`essay-specimen-card`).
- **Rail** — the paragraph as arrows, the current sentence at full strength (`essay-rail`).
- **The sentence** — the learner's words, the clause it ends on underlined in citron, a reversed arrow.
- **The move** — line one solid, a citron hook and THEN, line two hatched with the caret (`essay-move`).
- **The pattern** — literal words in 44 px around dashed slots (`essay-pattern`, `essay-slot`).
- **Actions** — four pills along the bottom; the first is primary, citron-bordered (`essay-primary`).
- **Table** — mono figures, rows with a mono number, the sentence, a role chip, a length bar.

## Composition rules

- Brand top left, chips top right, always. Content starts at 148-176 px.
- The home is a stack of four giant words left and one card right, with the caption bottom right.
- The sentence page reads top to bottom: sentence, problem, move, pattern; the rail stays on the left,
  the actions at the bottom. It opens on the first faulty sentence; Up/Down walk the paragraph,
  Left/Right the actions, Menu is the table.
- A strong sentence shows its job in the giant type and "Nothing to fix"; a neutral one is quiet.
- A faulty sentence without its own fix takes its lens's playbook lesson as the move - never an empty slot.

## What Specimen is not

Not a broadcast (no band, no ticker, no red), not a dashboard (no percentages, no marks out of ten),
not a ghostwriter (no rewritten sentence, no example to copy), not a rainbow (one accent), and never
motion that a sentence needs in order to be understood.
