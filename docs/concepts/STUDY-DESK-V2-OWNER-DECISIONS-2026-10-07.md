# Study Desk v2: owner decisions of 2026-10-07 (scope Q&A, session 1)

The first v2 scope session for the three apps (Essay Master, Linga, Math Buddy) in both modes. The format was "the host
proposes paths, the owner picks". This doc records the picks and the host's reading of what they change. The owner
wins. Where a pick reverses an earlier decision, the earlier one is named.

Inputs: the current-state analysis of `desk/` (2026-10-07), `docs/FAMILY-PHASE-1-PLAN.md` (D1-D6),
`docs/concepts/ADULT-MODE-TAKE-TWO.md`, `docs/concepts/ADULT-MODE-IMPLEMENTATION-PLAN.md` (O1-O8).

## 1. Vision tensions resolved (owner words, condensed)

| # | Question | Owner answer | Supersedes |
|---|---|---|---|
| V1 | Rewards vs "no points, no streaks" | **Reverse D3.** Rewards are in. | Family D3 |
| V2 | Linga: syllabus per level? | **Cambridge alignment is the goal to chase**, for a globally respected standard. | - |
| V3 | Essay: "types of writing" vs lenses | **By types, the owner meant lenses.** Keep the current design scope. | - |
| V4 | Math adult: Field Work design vs the owner's view | **The owner's direction overrides Field Work.** Keep a similar CX, with UX and topics tailored to late high school and early university. | Take Two section 4 (Field Work) as the adult math direction |
| V5 | Who first | **Adult = 18+.** **Family starts first, with ages 11-13**, because of syllabus coverage. | Answers O1 (adult floor) with 18+ |

## 2. Picks

### Cross-cutting
| # | Topic | Pick | Host reading |
|---|---|---|---|
| X1 | Family rewards | **Mastery collection** | Collectibles are earned only by code-decided mastery (topic secured, lens mastered, Linga skill independent), plus a visible "extra mile" mark for step-ups/stretch. No reward for raw volume. Reuses the existing latches (`secure`, `stretch`, Linga achievements). |
| X2 | Adult rewards | **Progress, no game** | Adults see growth (style bands, skill map, calculus coverage, exam readiness). No points or badges. In Essay, the twin's birth and its export are the reward. |
| X3 | Market | **International, English UI** | CZ remains the test market. Every new string, curriculum and exam target is international-first. The `system: cz` school years stay, as one of four. |
| X4 | Build order | **Adult foundation in parallel** | Family v2 of all three apps, plus the shared adult foundations, at the same time: the mode gate (A5), the per-learner text store (A6), the PC drop page (A7) and the Linga audience keyword gate (A1 safety half). The keyword gate is a present-day Family safety fix and goes first. |
| X5 | Content validation | **Simulated only** | Extend the persona UAT (`uat/`) to Math and Essay, with LLM judges. Accepted limit: no human examiner or teacher sign-off. Cambridge/GCSE alignment is claimed as "mapped to the published specification", never as "certified" or "endorsed". |

### Essay Master
| # | Topic | Pick | Host reading |
|---|---|---|---|
| E1 | Family v2 depth | **Whole-piece reading** | Read a full essay (intro, body, conclusion) with the four lenses across paragraphs. Prerequisite: the reading core must keep paragraph breaks (`essay.ts:25`, `:117`; Family plan row 16; adult slice D1 is the same core). |
| E2 | What the twin is for | **Portable profile** | The product is a profile the user exports and uses with other tools. The export format is **Twin Card 1.0** (section 3). |
| E3 | How the twin is born | **Earned** (current design) | The twin is born after 3 pieces worked through the Workroom. Every rule is backed by the learner's own held rewrite (the honesty lock). |
| E4 | Writing surface | **PC + TV stage** | Write or upload on a PC drop page (.txt/.docx). The TV is the stage for review, Sittings and drafts. The phone is for quick picks. This is slice A7. |
| E5 | Twin writes prose (O5) | **Yes, as proof** | The twin drafts in-app only to test the profile (Spot yourself, Sittings). It is not a ghostwriter. **O5 is answered.** |

### Linga
| # | Topic | Pick | Host reading |
|---|---|---|---|
| L1 | Cambridge track first | **A2 Key for Schools + B1 Preliminary for Schools** | Map the published can-do statements, grammar and vocabulary lists onto the 8 skill families, and add the missing content per band. |
| L2 | Exam papers | **Speaking first, then the others** | Align conversation to the Speaking paper (parts, timing, assessment criteria), then Listening (TV audio). Reading and Writing come later, and Writing may reuse Essay Master. |
| L3 | Adult edge | **Wild but non-explicit** | Absurd, comedic and high-stakes scenes, rude or difficult characters, in-character insults, and flirting/nightlife at 18+. The "never" list holds: explicit sexual content, real people, graphic violence, coercion. **Answers O3 in the direction of loosening `conversation.ts:57` for confirmed 18+ only.** |
| L4 | Adult learning layer | **Cut & Take Two** | As designed: the scene plays freely; at Cut there are up to 3 notes quoted from the learner's lines, then a replay. |

### Math Buddy
| # | Topic | Pick | Host reading |
|---|---|---|---|
| M1 | Family v2 first | **Teach-new-topic lessons** | "Teach me something" must actually teach: a short worked lesson per topic on the TV (generated, with examples checked by code), then practice. Today 12 of 15 school units and all of Calculus have no lesson. |
| M2 | Exam target | **International, GCSE first** (follow-up pick) | Ages 14-16, with past papers and mark schemes. Past failed papers fit the "learn from failed exams" goal. This needs topics beyond the current ~11-13 school path (quadratics, trig, etc.). |
| M3 | Adult topic scope | **Calculus 1 → 2** | Finish Calculus 1 (word problems, multi-part items), then integration techniques, sequences and series. Linear algebra, upper-high-school topics and statistics are not picked for v2. |
| M4 | Adult UI must-haves | **Function graphs; multi-step worked problems; proper typesetting** | Plot curves, tangents and areas; long problems with checked working lines (the numeric chain checker, B1); KaTeX-level coverage (matrices, cases, aligned equations). A video library is not picked. |

## 3. Twin Card 1.0 as the export standard (E2)

The owner supplied the standard (`docs/standards/twin-card/1.0/`: SPEC, RENDERER, schema, examples; published
2026-10-01 by Personas). Host reading of the fit:

**Fits as is**
- `identity`, `voice.quality_rules` and `voice.standing_directions` carry over directly.
- **Formats become channels.** Channel ids are open lowercase words, so `newsletter`, `column` and `story` are valid
  channel ids next to `generic`.
- **Signature passages become `exemplars`** (`source: "sample"`), the learner's own words verbatim.
- **Open habits and the rulebook become `constraints`** (do/don't, max 8 rendered, 160 chars).
- Sittings and "Spot yourself" answers become `training.qa`. Rulebook evidence becomes `training.observations`.
- Spot-yourself results and the number of pieces become `evidence` (integers only, readiness in percent).

**Friction to decide**
- **T1. Long-form vs correspondence.** The spec targets drafted correspondence. The renderer cuts exemplars at
  **500 chars** and keeps 5. Essay voice lives in paragraphs, so signature passages must be picked at 500 chars or
  less. Do we live with that, or propose a 1.1 minor (optional, e.g. a `long_form` channel hint) upstream?
- **T2. The code-measured style sheet** (sentence-length rhythm, paragraph shape, connectors, openers, favoured words)
  has no native field. Proposal: map it onto the 8 `style.dims` (`origin.kind: "learned"`) **and** keep the raw
  measures under `extensions["app.studydesk.essay"]`. The integer-only rule applies: per-mille, not floats.
- **T3. Integrity, signing and sealing.** RFC 8785 + SHA-256 per part is required. Ed25519 signing and AES-GCM sealing
  of `training` are optional. Proposal: hashes in v2; sign and seal later, when the export leaves the device.
- **T4. Third-party data.** Essays name other people more often than chat does. The spec requires a learner review of
  exemplars before export, so the export screen needs a review step.
- **T5. Round trip.** Should the desk also *import* a card (for example from Personas) to seed the twin? That conflicts
  with E3 (earned birth) unless an import only pre-fills and the twin is still born after 3 pieces.

## 4. Open questions carried to session 2

- T1-T5 above.
- Mastery collection (X1): what the collectibles are (per-app objects in each brand's world? one shared shelf on the
  landing?), and whether parents see them.
- GCSE scope: Foundation or Higher tier first, and which exam board's spec to map (AQA, Edexcel, OCR).
- Cambridge Speaking: is a simulated examiner (with timing and parts) the main mode, or a practice layer next to the
  free scenes?
- Remaining adult owner decisions from the plan: O2, O4 and O6-O8.
- Kill criteria to set before building: the twin probe (A4), the Cambridge mapping coverage threshold, and GCSE mark
  reliability from photos.

## 5. What follows (instructions for the next runs)

1. Fix the Linga audience gate (keyword backstop, `lib/english/gate.ts`) first. It is a Family safety bug today.
2. Session 2: answer section 4. Then the host writes a one-page brief per app × mode and a v2 plan in the existing plan
   format (status table, slices, owner-decisions table with defaults, kill criteria, session log).
3. Update `ADULT-MODE-IMPLEMENTATION-PLAN.md`: O1 = 18+, O3 per L3, O5 per E5. Retire or reshape the Field Work slices
   (B2-B7) per V4/M3/M4. Re-target D8 export to Twin Card 1.0.
4. Update `FAMILY-PHASE-1-PLAN.md`'s D3 note to point here.

## 6. Session 2 (same day): build rules and the open questions

**Build rules (owner).** One draft PR per batch, reviewed by the owner after all of the batch is done, then merged by
the owner. No other fleet changes the code meanwhile. Model output is checked with stubbed tests in the cloud session;
live engine checks run on the owner's PC at milestones. The kill-criteria approach is approved: the host proposes the
criteria in the v2 plan, the owner approves or edits them.

| # | Question | Owner answer | Host reading |
|---|---|---|---|
| S1 | What the mastery collectibles are (X1) | **Each app's own world** | A collectible is drawn in that app's design language (Lamplight, Open Door, Specimen), never a shared badge shelf. It is earned by the existing code latches only. |
| S2 | GCSE tier and board (M2) | **Foundation as the MVP; the host recommends the board** | Recommendation: **Pearson Edexcel**. Its GCSE Maths (1MA1) is, to the host's knowledge, the most-entered GCSE maths specification in England. Edexcel's International GCSE (4MA1) shares most content and serves the international market (X3). Map 1MA1 Foundation first; 4MA1 is a later overlay. The owner can override with AQA (8300) at no structural cost: the mapping is a data table. |
| S3 | Cambridge Speaking (L2) | **Practice mode only** | No simulated examiner, timing or exam parts. The free scenes stay the core. A practice mode adds Speaking-paper-shaped tasks (personal questions, a picture to describe, a discussion with a partner), mapped to A2 Key / B1 Preliminary for Schools. |
| S4 | Twin Card's 500-character exemplars (T1) | **Short passages first: train email/chat language before longer posts (MVP)** | The twin's MVP channels are `email` and `chat` (plus `generic`), the Twin Card's own vocabulary. Exemplars at 500 characters or less fit as is, so no change to the standard is needed. Long-form formats (newsletter, column) come after the MVP. The Workroom's first formats are a message and an email, not an essay. |
| S5 | Kill criteria | **Approved approach** | Proposed per risky slice in `STUDY-DESK-V2-PLAN.md` section g. |

T2-T5 keep the defaults proposed in section 3 until the owner says otherwise: the style sheet maps to the 8 dims plus
an `extensions` block; integrity hashes in v2, with signing and sealing later; an exemplar review step before export;
no import in the MVP.

## 7. Answers to the plan's open decisions (same day)

| # | Owner answer | Host reading |
|---|---|---|
| V2-O1 | **No real-writer test for now: push on with best guesses, tests and simulations** | The twin probe (T1) runs **simulated**. The tool builds synthetic writers with distinct, measured styles (from personas), holds out messages, and checks whether the twin's drafts sit closer to each writer's measured style than the plain model's, by code distance and a blind judge model. The kill criterion becomes the simulated one in the plan, section g. A simulated pass is **not** proof that a twin sounds like a real person; it is recorded as such. |
| V2-O2 | **KaTeX goes into docs/concepts, deferred if it cannot be verified** | [KATEX-TYPESETTING.md](KATEX-TYPESETTING.md). It cannot be verified from the cloud session (no Fire TV, no emulator, no glyph to look at), so M4b's default stands: extend the custom typesetter for `cases` and small matrices. |
| V2-O3 | **Yes: the 18+ confirmation once, in the profile, is enough** | `rules/mode.ts` `isAdult` counts the profile's "Adult (18+)" as the confirmation for type "other", so Linga's adult scenes open without its separate box. An age still decides first. The box stays for profiles that set no mode. |

V2-O4 (SVG collectibles), V2-O5 (one call per paragraph) and V2-O6 (Edexcel) keep their defaults.
