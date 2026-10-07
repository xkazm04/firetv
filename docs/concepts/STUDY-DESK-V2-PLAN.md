# Study Desk v2: the plan (three apps, Family and Adult)

Written 2026-10-07 from the owner's scope sessions ([decisions](STUDY-DESK-V2-OWNER-DECISIONS-2026-10-07.md), sessions 1
and 2). Paths are under `desk/src/` unless they start with `tools/`, `docs/` or `desk/`. This plan supersedes the adult
plan's ordering ([ADULT-MODE-IMPLEMENTATION-PLAN.md](ADULT-MODE-IMPLEMENTATION-PLAN.md)). That file's slice cards stay the
spec for the slices named here by their old ids (A1, A2, C1, D2...), except where a row below says otherwise.

## a. How to use this file

1. Read the decisions doc, then the status table (section c), then the last session log entry (section j).
2. Work by **batch**: a batch is a set of slices that ship as one draft PR, which the owner reviews and merges.
3. Inside a batch, take the slices in table order. Build each one by its card (section d), commit it on its own, and
   keep the gate green at every commit.
4. End a batch by updating the status rows, appending a log entry, and opening the draft PR.
5. Stop and ask the owner when section f says so. Never build past a kill criterion (section g).

## b. The briefs (one per app and mode)

**Essay Master, Family.** For 11-15-year-olds who want their writing to improve at any level. The four lenses stay the
scope (V3). v2 reads a **whole piece**, not one paragraph (E1). The learner sends a full essay; the TV shows a piece map
with the lenses across paragraphs; the forensic page stays one sentence at a time. Collectible: a specimen in the
Specimen world for each lens mastered (S1). Success: a learner sends a whole essay and leaves knowing which paragraph
needs which move, with nothing rewritten for them.

**Essay Master, Adult: the Twin.** For adults who want an AI that writes like them. The product is a **portable profile**
(E2), exported as a **Twin Card 1.0** (`docs/standards/twin-card/1.0/`). MVP channels are **email and chat** (S4). The
twin is **earned** (E3): it is born after three pieces worked through the Workroom, on a PC page with the TV as the stage
(E4). It writes in-app only as proof (E5): Sittings and "Spot yourself". Adult reward: the twin's growth and its export,
never points (X2). Success: the exported card makes another tool write a message the user would send as their own.

**Linga, Family.** For 11-13 first, aiming at a globally respected standard: **Cambridge A2 Key and B1 Preliminary for
Schools** (V2, L1), **Speaking first** (L2), as a **practice mode only** with no simulated examiner (S3). The free scenes
stay the core. Every Speaking-paper task type gets practice that maps onto the 8 skills. Claims stay honest: "mapped to
the published specification", never "certified" (X5). Collectible: a door or object in the Open Door world when a skill
goes independent. Success: a learner can say which Key/PET speaking tasks they can already do.

**Linga, Adult: The Company.** Wild but non-explicit (L3): absurd, comedic, high-stakes, rude characters,
flirting/nightlife at 18+. Learning through **Cut & Take Two** (L4). The never-list holds at every age. Success: an
adult plays a scene they pitched, gets three notes quoted from their own lines, and wants a second take.

**Math Buddy, Family.** For 11-13 learning ahead of school: "Teach me something" **actually teaches** (M1), with a worked
lesson before practice. For 14-16: **GCSE Foundation, Pearson Edexcel 1MA1** (M2, S2), including recovery from a failed
paper. Collectible: a lamp-lit object in the Lamplight world per topic secured, plus a mark for the extra mile
(step-up). Success: a learner meets a topic for the first time on the desk, is taught it, practises it, and secures it.

**Math Buddy, Adult.** Not Field Work: the owner's direction overrides it (V4). Late high school and early university:
**Calculus 1 to 2** (M3), with **function graphs, multi-step worked problems with checked working, and proper
typesetting** (M4). The CX stays the desk's: hints not answers, code decides every mark. Success: an adult works a
multi-part calculus problem with a graph on the TV and every working line checked.

## c. Status table (sessions update this)

| # | Id | Slice | Batch | Depends on | Status | Commit | Date |
|---|---|---|---|---|---|---|---|
| 1 | G1 | Linga audience keyword gate (adult A1, safety half) | 1 | - | done | af47204 | 2026-10-07 |
| 2 | E0 | Essay: the reading core keeps paragraphs (adult D1) | 1 | - | done | 307d2ec | 2026-10-07 |
| 3 | P1 | Platform: the mode switch and the 18+ gate (adult A5) | 1 | - | done | b160c50 | 2026-10-07 |
| 4 | P2 | Platform: the text store and /api/texts (adult A6, store half) | 1 | - | done | e9271eb | 2026-10-07 |
| 5 | P3 | Platform: phone shelf, TV piece map, the engine notice, the curtain (adult A6, UI half) | 2 | P2 | done (the curtain: the shelf is phone-only, the TV never lists kept texts) | f8d64f1 | 2026-10-07 |
| 6 | E1 | Essay Family: a whole piece, sent at once, read paragraph by paragraph | 2 | E0, P3 | done | f8d64f1 | 2026-10-07 |
| 7 | R1 | Rewards: the collectible engine (pure) and one collectible per app | 2 | - | done | e162e4d | 2026-10-07 |
| 8 | L1 | Linga: the Cambridge A2 Key / B1 PET for Schools map (data and coverage) | 2 | - | done (unverified table; claim off) | ce795b1 | 2026-10-07 |
| 9 | M1 | Math: teach a new topic, worked lessons for the 12 school units | 3 | - | not started | | |
| 10 | M4a | Math: function graphs on the TV (pure SVG plotter) | 3 | - | not started | | |
| 11 | M4b | Math: typesetting coverage: the custom typesetter extended for `cases` and small matrices (KaTeX deferred, [concept](KATEX-TYPESETTING.md)) | 3 | - | not started | | |
| 12 | T1 | Twin: the style meter and the **simulated** twin probe on email/chat (adult A4; V2-O1) | 3 | - | not started | | |
| 13 | L2 | Linga: Speaking practice mode, Key/PET task shapes | 4 | L1 | not started | | |
| 14 | M2a | Math: GCSE Foundation 1MA1 map and coverage | 4 | - | not started | | |
| 15 | T2 | Twin: the Workroom for messages and emails, versions and diff (adult D2, D3) | 4 | P3, T1 pass | not started | | |
| 16 | P4 | Platform: PC drop page and .docx text (adult A7) | 4 | P2 | not started | | |
| 17 | L3 | Linga Adult: pitch a scene, Cut and three notes (adult A1 rest, A2) | 5 | G1, P1 | not started | | |
| 18 | M4c | Math: multi-step problems, the chain checker (adult B1) and checked working lines | 5 | - | not started | | |
| 19 | T3 | Twin: habit detectors (adult D5) | 5 | E0 | not started | | |
| 20 | M2b | Math: the first GCSE Foundation units beyond the school path (generators, code-checked) | 5 | M2a | not started | | |
| 21 | L4 | Linga Adult: Take Two (adult C1) | 6 | L3 | not started | | |
| 22 | T4 | Twin: born, the Sitting, Spot yourself (adult D6, D7, D8) | 6 | T2, T3, T1 pass | not started | | |
| 23 | T5 | Twin: the Twin Card 1.0 export (adult E5, retargeted) | 6 | T4 | not started | | |
| 24 | M3a | Math: Calculus 1 completed (word problems, multi-part) | 6 | M4a, M4c | not started | | |
| 25 | M5 | Math: recovery from a failed GCSE paper | 7 | M2b | not started | | |
| 26 | L5 | Linga Adult: genres and twist decks; 18+ romance and nightlife (adult C3, C4) | 7 | L4 | not started | | |
| 27 | M3b | Math: the Calculus 2 spine | 7 | M3a | not started | | |
| 28 | L6 | Linga: Listening practice | 8 | L2 | not started | | |

**Retired by V4:** adult A3, B2-B7 (Field Work jobs, Beyond, the mock paper as a job). B1 (the chain checker) lives
on as M4c. E1/E2 (the step line, Talk it through) stay in the backlog as experiments. **Answered:** O1 = 18+ (V5),
O3 = loosen for confirmed 18+ (L3), O5 = yes, as proof (E5).

## d. The slice cards (batches 2-3; later batches get their cards when their batch starts)

Every slice: the gate is `cd desk && npm test`, green at its commit. A new suite is appended at the end of `test:rules`.
No live model call in a gate (stub at the provider seam). Never touch `desk/data/`. A screen change updates
`docs/STUDY-DESK-SCREENS.md` and the app's `docs/DESIGN-*.md` in the same commit.

**P3. Phone shelf, TV piece map, the engine notice, the curtain** (M)
- Goal: the learner keeps a piece from the phone's Essay tab, sees their shelf, and deletes one piece or all. The TV
  shows the piece map (title, paragraph count), never the text, unless "show on TV" is chosen for this piece. Before the
  first send, a one-time notice says where the text goes (the text engine: Claude through the CLI on this computer).
- Tests: phone-panel rows (the notice shows once per learner); the piece map shows no text by default.

**E1. A whole piece, sent at once** (M)
- Goal: the phone's Essay tab sends the whole text (a file or a paste) as one piece. The desk reads it paragraph by
  paragraph (one call each, per V2-O5), and the TV's piece map fills in as paragraphs come back. Forensic walks the
  piece across paragraphs. The paragraph cap moves to a per-paragraph check; a piece is capped by the text store.
- Tests: an engine stubbed per paragraph; verdicts anchored across paragraphs; a failed paragraph does not lose the
  others; history records one reading per piece.

**R1. Rewards: collectibles** (M)
- Goal: a pure `lib/rules/collect.ts` derives each learner's collectibles from records that exist: a Math topic
  `secure`, a Math `stretch` secure (the extra mile), an Essay lens Secure, a Linga skill `independent` or `transfer`.
  Each app draws its own (Lamplight object, Open Door object, Specimen). No points, no streak, no count printed (S1, X1).
  Adult mode shows progress only (X2).
- Tests: a collectible appears only when its latch is set; a latch never unset means a collectible never lost; nothing
  is earned by volume.

**L1. The Cambridge map** (M)
- Goal: `lib/english/cambridge.ts` holds the published A2 Key and B1 Preliminary for Schools Speaking descriptors
  (parts, functions, grammar and vocabulary areas) as data, each mapped to Linga skills and scenes. A coverage report
  (a tool) says which descriptors have practice and which do not. The band tables marked "A TEACHER MUST READ" are
  checked against it.
- Tests: every descriptor names a source section; coverage computed by code.
- Honest limit: the descriptors are transcribed from the public specifications and must be checked against them by a
  person before any claim is printed.

**M1. Teach a new topic** (M)
- Goal: "Teach me something" opens a worked lesson for the topic before practice: an explanation and 2-3 worked
  examples generated from the topic's own code generator, each example's answer and steps checked by code
  (`lib/rules/school.ts`). Only the explanation's words come from a model; every number comes from code. Lamplight look.
- Tests: an example whose answer code does not confirm is never shown; the lesson for each of the 12 units renders with
  the engine stubbed.

**M4a. Function graphs** (M)
- Goal: a pure SVG plotter (`maths/plot.ts`) samples a function through `lib/rules/calc-expr.ts` and draws axes, the
  curve, a tangent and a shaded area, in the Lamplight hand. It is used first on Calculus derivative and integral items.
- Tests: sampling avoids discontinuities (no line drawn across a pole); the tangent at x matches the derivative numerically.

**M4b. Typesetting coverage** (M)
- Goal: `cases` as rows and matrices up to 3 x 3 in the custom typesetter (`maths/typeset.ts`), tested in
  `tools/maths-type-test.cjs`. KaTeX is deferred until the checks in [KATEX-TYPESETTING.md](KATEX-TYPESETTING.md) section 4 pass.

**T1. Style meter and the twin probe, email and chat** (M; the kill test for T2-T5)
- Goal: adult A4 retargeted to short messages. `lib/rules/style.ts` measures a writer's messages and maps onto Twin
  Card's 8 `style.dims` (integers 1-5) with the raw measures in `extensions`. `tools/twin-probe.cjs` runs the protocol
  of section g.

## e. Batches

- **Batch 1 (this PR):** G1, E0, P1, P2, the decisions doc, this plan, Twin Card 1.0 vendored.
- **Batch 2:** P3, E1, R1, L1. **Batch 3:** M1, M4a, M4b, T1. **Batch 4:** L2, M2a, T2, P4.
- **Batch 5:** L3, M4c, T3, M2b. **Batch 6:** L4, T4, T5, M3a. **Batch 7:** M5, L5, M3b. **Batch 8:** L6.

## f. Session protocol

- One branch per batch, one draft PR per batch; the owner merges. Commits are scoped (pathspec, never `-a`).
- Validation is stubbed in the cloud. Live engine checks (`/api/smoke?live=1`, a dev-server walk) are the owner's, at
  each batch's review.
- The cloud container runs as root, so `tools/maths-rules-test.cjs` "learners case 3" (a read-only file) cannot fail
  the write there. Run that suite on the owner's PC. Every other suite runs green in the cloud.
- **Stop and ask** when a slice needs an unanswered decision with no default, a kill criterion is hit, a learner's text
  would go anywhere new, or a Family behaviour would change beyond what its slice says.

## g. Kill criteria (approved approach, S5; the numbers are proposals for the owner to edit)

| Risk | Cheapest test | Result that drops or reshapes |
|---|---|---|
| The twin is a costume (T1) | the **simulated** probe (V2-O1): 8 synthetic writers with distinct measured styles, about 20 messages each, 3 trials; a held-out message and two drafts (twin, plain model) on the same subject and length; scored by the code style distance and a blind judge model | the twin's drafts are not closer to the writer than the plain model's in at least 6 of 8 writers, on both scores: T2-T5 are not built; the Workroom ships alone and the export becomes a "how you write" portrait. A simulated pass is recorded as simulated, never as proof with real people |
| A worked lesson teaches a wrong step (M1) | every example checked by code | any shown example code does not confirm: the lesson is withheld for that topic, never shown "mostly right" |
| The Cambridge claim (L1) | the coverage report | under 90% of A2 Key for Schools Speaking descriptors with at least one practice: no "mapped to Cambridge" wording anywhere |
| Collectibles reward volume (R1) | the invariant test | any collectible reachable without its latch: R1 does not ship |
| Graphs too slow or unreadable at ten feet (M4a) | a 60-plot render on the owner's PC; a capture at 1280 x 720 | over 50 ms a plot, or a curve under the 3 px stroke floor: fewer samples, then a static image |
| GCSE paper reading (M5) | 20 rendered marked papers | under 85% of items mapped to the right unit: typed entry of the paper's results instead of a photo |
| Adult role-play safety (L5) | the red-team (adult plan section g) | any explicit line, any minor reaching an adult scene, or coercion played as success: C4 does not ship |

## h. Owner decisions open

| # | Question | Recommendation | Built if unanswered | Blocks |
|---|---|---|---|---|
| V2-O1 | ~~The twin probe needs real writers~~ **Answered: simulated** (decisions section 7) | | | |
| V2-O2 | ~~KaTeX or the custom typesetter?~~ **Answered: KaTeX deferred to a concept until verified; custom typesetter extended** | | | |
| V2-O3 | ~~Mode Adult as Linga's confirmation?~~ **Answered: yes** (built in batch 2) | | | |
| V2-O4 | Collectible art: SVG drawn in each app's language, or generated images? | SVG (ten-foot crisp, no assets to host) | SVG | R1 |
| V2-O5 | Whole-piece reading: one call per paragraph, or one call per piece? | per paragraph (verdicts stay anchored; a failure loses one paragraph); measure the time | per paragraph | E1 |
| V2-O6 | GCSE board | Pearson Edexcel 1MA1 (S2) | Edexcel | M2a |

## i. Stance check

Unchanged from the adult plan section i, with three changes. Rewards are collectibles (D3 reversed; never points or
printed counts). The adult Math stance is the desk's own CX, not Field Work. The twin's purpose is export (Twin Card),
and in-app drafts are proof only.

## j. Session log

Entry format: `### <date> · <batch> · <slice ids> · <branch> <commit>`, then `Gate:`, `Surprises:`, `Next:`.

### 2026-10-07 · batch 1 · G1 E0 P1 P2 · claude/trusting-franklin-a8g19w
Gate: `tsc --noEmit` clean. Every suite green when run one by one, except `maths-rules-test` "learners case 3", which
fails only as root (a read-only file is still writable for root) and is unchanged by this batch. New suites:
`tools/adult-rules-test.cjs` (11 tests, a 66-row keyword table), `tools/texts-rules-test.cjs` (7).
Surprises: the A5 gate first ran before the age was cleared on a type change, so a drafted Adult survived a switch to a
school type; the new test caught it, and the gate now runs last. `mode-rules-test` rows that pinned "adult is never
honoured" were revised on purpose. The essay-on-a-learner-change leak (adult plan finding 6) was already fixed on
2026-10-05 and is now pinned again in the texts suite.
Next: batch 2 (P3, E1, R1, L1). Owner: V2-O1 to V2-O6 (defaults stand if not answered).

### 2026-10-07 · batch 2 · V2-O3 P3 E1 R1 L1 (+ two layout fixes) · claude/trusting-franklin-a8g19w
Gate: `tsc --noEmit` clean, `next build` succeeds. Every suite is green when run one by one, except `maths-rules-test`
"learners case 3" (root-only, as in batch 1). New suites: `essay-piece-test` (7), `collect-rules-test` (5),
`cambridge-rules-test` (3); `texts-rules-test` gained the notice rows, and `adult-rules-test` gained V2-O3 and the Mode-row
rows.
Captures: for the first time, a dev server with a scratch `DESK_DATA_DIR` and Playwright from `tools/node_modules`, at
1920 x 1080 and 1280 x 720. The essay piece was captured mid-reading, with a stand-in `CLAUDE_BIN` that answers fixed
verdicts and holds paragraph 2 back; no model was called.
Surprises: the profile caption ran into Save/Back on every profile, a problem from before this batch (on-air pins
`.actions` to the bottom); fixed by putting them in the flow. The Mode row now shows only where there is a choice. The
first cabinet layout overflowed four-across, so it is now two rows. Cambridge coverage at skill level reads high (A2 Key
94% at 12) while two real gaps remain for children (narrating the past, feelings). The claim stays off until a person
verifies the table.
Next: batch 3 (M1 lessons, M4a graphs, M4b typesetting, T1 the simulated twin probe). Owner: nothing blocking.
