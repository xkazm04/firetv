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
   a move a sentence misses is hatched, with the caret waiting at it. Ink is a claim of done, so pressing
   Rewrite on my phone does not ink it: the move inks only when the rewrite, re-judged alone, holds
   (`rules/essay` `rewriteState` is `holds`). A rewrite still faulty stays hatched, and the caption says why.
   Who decides "holds" is code: the model only observes each sentence (the job it does, the side it takes, the
   support it gives, a word it leans on), and `decideVerdicts` in `rules/essay` turns those observations, checked
   against the text, into strong, faulty or neutral. That one function rules the first reading, a piece's paragraphs
   and a rewrite alike, so ink, the Secure seal and the learner record follow a rule, never a model's mood.
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
- **Rail** — the paragraph as arrows, the current sentence at full strength (`essay-rail`). A rewritten
  sentence keeps its old arrow as a faint ghost just under the new one (`essay-ghost`): a reversed ghost
  under a forward arrow is the turn, drawn. A text of several paragraphs keeps them: a gap opens before each
  new paragraph and the label counts them ("3 paragraphs"; `data-para` on each row, `data-paragraphs` on the rail).
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
- Rewrite on my phone hands the phone the sentence on screen, the learner's own words, to edit and send
  (POST /api/analyse kind `rewrite`). The desk re-judges that one sentence in its paragraph, through the
  same lens, against the move the page taught; every other verdict is kept. The page stays on the
  sentence, and a rewrite is not another paragraph read: no writing episode, no lens attempt.
- The paragraph comes in as text, never as a photo of handwriting: a `.txt` or `.md` file the learner sends, or a message typed,
  pasted or dictated on the phone. A text with several paragraphs is split on blank lines and read one paragraph at a time; the phone
  steps through them with Next (`paragraphsOf`, `rules/essay`). The reading core keeps paragraphs (2026-10-07, adult plan D1):
  `splitSentences` splits each paragraph on its own, numbers run on through the piece, every sentence of a longer text carries
  `para`, a rewrite rebuilds with the breaks, and the prompt names each paragraph. One paragraph in reads exactly as it always
  did (no `para`).
- **A whole piece** (2026-10-07, v2 E1 and P3). With more than one paragraph on the phone, the Essay tab offers "Read the
  whole piece on the TV" (POST /api/analyse kind `piece`) beside "This paragraph only". The desk reads one call per
  paragraph, each with the whole piece as context, so the Structure lens sees the thesis while it judges a body
  paragraph. The first paragraph back opens `forensic`; later ones grow the reading where the learner is
  (`essay.progress`) and never move the screen. The specimen card says "Last piece · reading 2 of 4", draws a wider gap
  between paragraphs, and outlines a paragraph still being read; on the rail it is dimmed. A failed paragraph is listed
  and the rest still land. The record holds one reading per piece. Limits (`pieceProblem`): 30 paragraphs, 100 KB, and
  each paragraph within the paragraph cap.
- **The shelf** (P3) is the phone's, never the TV's. "Keep it on my shelf" (on by default) stores the piece with its
  versions (`/api/texts`, `lib/session/texts.ts`). A one-time notice, before the first kept piece, says where the text
  goes; "Read without keeping" skips it. The shelf lists titles and counts; Open loads the latest version, and the next
  read of it is a new version. Delete one, or "Delete everything I kept" (a second press confirms), which also forgets
  the notice.
- A strong sentence shows its job in the giant type and "Nothing to fix"; a neutral one is quiet.
- A faulty sentence without its own fix takes its lens's playbook lesson as the move - never an empty slot.

## Plan slots

From the lens home with nothing read, OK on *Start from the pattern* opens the Paragraph's plan: one row per
slot of the pattern (your claim, the evidence, the link back), read from the pattern's [brackets] in
`rules/essay.ts planSlots`, never listed by hand. A row is a hatched plate until the learner has written its
sentence on the phone, and is inked with their own words once they have (ink means done, hatch means still to
write). The frame words ("For example,", "This shows") are never on a plate and never in the text that is read.

- A fit check (`planFit`) is a comment in the caption, never ink and never a refusal: the slot inks because it is written.
- A sentence is refused only for the reasons a rewrite is (blank, two sentences, a leftover bracket, over the cap, not a sentence on its own).
- The TV never asks for typing; Select on a slot says to say it on the phone. No model is called until *Read it*, and *Read it* with a slot empty only moves the caret to the first empty slot.
- Phase 1 had deferred this (FAMILY-PHASE-1-PLAN.md, *Essay plan slots*); it is built on the Paragraph pattern alone.

## What Specimen is not

Not a broadcast (no band, no ticker, no red), not a dashboard (no percentages, no marks out of ten),
not a ghostwriter (no rewritten sentence, no example to copy), not a rainbow (one accent), and never
motion that a sentence needs in order to be understood.

## The collection (v2 R1, 2026-10-07)

A specimen cabinet under the paragraph card on the lens home: four drawers, one per lens, in two rows. A lens latched
Secure pins its specimen (Specimen's arrow, in citron, on a citron-framed drawer); an open drawer is a dashed outline. It
appears once the first specimen is pinned. It is never counted, only Family mode shows it, and nothing earns a specimen
but the lens's own latch (`lib/rules/collect.ts`). `data-role="essay-collection"`; `essay/EssayCabinet.tsx`.

## The twin: the style meter and the simulated probe (v2 T1, 2026-10-07)

`lib/rules/style.ts` measures how a person writes from their own messages. Every measure is an integer, as Twin Card 1.0
requires: sentence and message lengths, openers, and rates of connectors, contractions, questions, exclamations, emoji,
hedges, greetings, sign-offs, thanks, formal words, slang and lists. `twinDims` maps the measures onto the card's eight
`twin-card.style/1` dimensions and keeps its coherence rules. The cut points are a first guess, to be tuned. `styleDistance`,
`withinBands` and `copyRun` serve the probe and the twin's later validators.

`tools/twin-probe.cjs` is the kill test for T2-T5, simulated by owner decision V2-O1:
1. It invents eight synthetic writers (terse, formal, bubbly, hedger, storyteller, lister, dry, warm-direct) and has each
   write about 20 messages.
2. Three messages per writer are held out.
3. For each held-out message, the twin (the eight dimensions in the card's level words, plus five exemplars) and the
   plain model draft a message on the same subject.
4. The drafts are scored by code distance and by a blind judge model. A twin draft that lifts eight words from the
   corpus loses the trial.
5. A writer passes with 2 of 3 trials won on both scores; the probe passes at 6 of 8 writers.

Run it on the owner's PC (`node ../tools/twin-probe.cjs` from `desk/`); `--stub` is the gate's dry run. A pass is
recorded as simulated. The synthetic writers are the model's own writing, so it shows the profile steers style, not that
a twin sounds like a real person.

## The Workroom, the PC page and the Twin Card (v2 T2, P4, T5-lite, 2026-10-07)

**The PC page** (`/drop`, `app/drop/page.tsx`) is where an adult's writing comes in (E4: writing happens on a PC, the
TV is the stage). It joins like a phone, keeps a message, an email or an essay by paste or by a .txt, .md or .docx file
(`lib/rules/docx.ts` reads only `word/document.xml`, capped against a zip bomb), lists the shelf, and shows the twin:
per channel, how many pieces, born or not, the eight level words, and the exemplars, each with an include box (the
review step Twin Card asks producers for). It is read at a desk, so the ten-foot rules do not apply; it is plain.

**The Workroom** (`essay/Workroom.tsx`, screen `workroom`) is Essay Master's home in Adult mode. Left: the pieces, one
row each, in Specimen's language: the title in the serif, a format tag, version and paragraph counts, and the last
version's change as pips (citron changed, a plus added, a minus removed, bone kept; `lib/rules/diff.ts` counts by LCS).
Right: the twin panel, per channel "Born" in citron or "N more to keep", and the level words once born. One action, The
lenses, leads to the family lens home. The TV never shows a sentence of the text: the session carries only what
`lib/twin/workroom.ts` builds (titles, counts, marks, level words), and `workroom.set` is the desk's own event.

**The twin is earned** (E3): a channel is born at three pieces of its kind (messages → chat, emails → email, anything
else → generic). **The Twin Card** (`lib/twin/card.ts`, `/api/twin/card`) is pulled forward from T5 as a slice: Adult
mode only, phone or PC only, once born. Identity is the name; voice holds the born channels with their measured dims,
up to five exemplars (the latest version, cut at a word near 500 characters), and quality rules as data, with the
spec's per-person allowances (dashes allowed when the person's own exemplars use them; a filler opener they use is not
banned). Integrity is SHA-256 over each part's RFC 8785 form. The card id is stable across exports (`lib/twin/state.ts`,
beside the pieces, so "Delete everything I kept" removes it too). The card validates against the vendored schema
(`tools/twin-rules-test.cjs`).

A derived title is never a message's own text: titles show on the TV, so an untitled message is "Untitled message"
(`texts.ts`; a heading or a heading-like first line still names an essay).

## Run of 2026-10-09: one writing episode end to end

One writing episode run in the browser with the real model (`tools/essay-ui-test.cjs`, outside every gate; evidence in
`uat/runs/2026-10-09-essay-w-run/`). Learner Sam, 15, Evidence lens, the claude CLI (`claude-cli/sonnet`, model `best`).

| Step | Verdict | Time |
|---|---|---|
| W1 Seat and pair | pass | |
| W2 Enter to the lens home | pass | 744 ms, past the 560 ms zoom |
| W3 Paragraph read (5 sentences) | pass | 27.6 s |
| W4 Coached: two faulty (4, 5), each with a move and a slotted pattern | pass | |
| W5 Sentence 4 rewritten on the phone, judged again: faulty to strong, the other four kept | pass | 23.1 s |
| W6 End session to the recap, which names Essay Master: one reading, 2 of 5 sentences to fix | pass | 1.9 s |
| W7 learners.json: one `writing` history entry and `writing.evidence` (seen 1) | pass | |
| W8 No page errors | pass | |
| Reread after a server restart: the lens home shows Evidence read today | pass | |

No coaching text restated a learner sentence (the "not a ghostwriter" rule held in this run). Two things to read in the
transcript: sentence 3's note says "Strong" on a neutral verdict, and the rewritten sentence 4 is strong while its note
says the size of the change is missing.

**Owed:** a real phone, heard audio (the voice call answered 503: no voice configured), and the owner's reading of the
transcript. The reread kept session.json across the restart, so the disk proof is the direct read of learners.json in W7.

**Follow-up.** (a) A note never carries a verdict label: `decideVerdicts` now strips a leading label (strong, faulty,
neutral, weak, good, great, excellent, solid, fine, ok, okay, then `:` or a spaced dash) from the model's note on every
verdict, through `cleanNote` in `rules/essay.ts`; a verdict word anywhere else stays. The test is 'a note never carries a
verdict label: the verdict is code's' in `tools/essay-rules-test.cjs`. Kill test (not committed): with `cleanNote`
returning its input, that test alone went red (79 pass, 1 fail). (b) Sentence 4's strong verdict, whose note names the
missing size of the change, stays for the owner's reading; the verdict rule for checkable evidence is his call and is
unchanged. (c) Why sentence 3 was neutral is not traced. Under the Evidence rule a checkable sentence with a number is
strong, so the model must have reported a support other than checkable; the harness does not keep the raw observation, so
this is inferred, not shown.
