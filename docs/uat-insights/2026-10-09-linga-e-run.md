# UAT drain — 2026-10-09-linga-e-run

The first browser run of `tools/linga-ui-test.cjs` (E1–E9, M4 goal 1). It used an isolated desk (empty `DESK_DATA_DIR` outside every repo, `next dev --webpack`, port 3217) and the claude CLI with `conversation.provider` `claude-cli/haiku`, with no voice configured. The learner was a scripted one, Mia (A2 picked by hand, *The missing moon rover*). **L2 evidence on the claude CLI**, but with one scripted learner and **the builder's reading**: no Character, no judge, and no finding ids. The owner's reading is owed. Evidence was committed at 41295e42, and the SUMMARY records no product commit. Drained 2026-10-09 from `SUMMARY.md`, `transcript.md`, `timings.json` and the screenshots it cites (`shots/tv-coach.png`, `tv-replay.png`, `tv-recap-postrun.png`, `phone-after-finish-postrun.png`). There is no `results.json`, because the harness stopped before writing it. Gaps were checked against main dfb12cc1. Paths are relative to `desk/src/` unless they start with `tools/`, `uat/` or `docs/`.

**Covered elsewhere, not restated:** `docs/LINGA-COMPETITIVE-SCOPE.md` §3, *Run of 2026-10-09* (4633b0c9), already reads this run. It holds the step verdicts, the E8 medians, blockers B1–B5 and what stays owed. This drain adds only what that section does not hold: the product readings and the accounting.

16 items: 2 attempts' harness defects, the steps that were not a clean pass, the caveats, what is still owed, and one transcript reading that entered §2. **No new build.** One new decline (LG-26). One item joins a council-owned entry (LG-16). One reading opens a concept question that runs 2 and 3 read the other way (LG-27, new).

## 1. Confirmed-and-fixed

**Harness fixes this run produced, each shown working by a later run:**

| Defect | Fix | Shown working in | Ceiling |
|---|---|---|---|
| Attempt 1: the nav to landing was overwritten by the phone's join (`desk/src/lib/session/store.ts:507-508`), so the TV sat on "Mia's phone is on the desk" | 4ecd22c7: the harness waits for `joined` before the nav | attempt 2 seated and paired (E1) | none on the product: a TV not yet joined shows the join confirmation by design (`store.ts:505-508`); only the harness's order changed |
| E4: no moment fired. The scripted spoken line (*"Could you tell me which bridge you mean, please?"*) fit no step and held no slip | 78709e24: a line that fits the rover's step 1 and carries an A2 slip | runs 2 and 3: a `fix` moment on the learner's exact words | a scripted slip proves the path, not the moment rate on a real child's errors |
| E7: the harness waited for `.linga-track`, which the recap no longer renders | d0764a23: waits on `session.screen === 'linga-recap'` | runs 2 and 3: E7 pass | — |
| After E7 never ran (My map, print, mobile width, the Maths and Essay entrances, the page-errors check), and no `results.json` was written | d0764a23, 77206a03 (the phone's own context), 56e47cf3 (entrance checks poll the session) | run 3: every check passed, `passed: true`, `errors: []` | the entrance poll does not prove run 2's failure was the race (`2026-10-09-linga-run-3.md`) |

**Product behaviour this run confirmed** (`LINGA-COMPETITIVE-SCOPE.md` §3 holds the verdicts):
- The coach's "You said" is the reply exactly. The server refuses anything else (`lib/english/conversation.ts:343`).
- The replay arrives under "Try it again".
- E9's adults-only start answered 403.
- The recap drew "You said / One way to try it" and "1 spoken · 1 written replies" (`shots/tv-recap-postrun.png`).

**Ceiling:** the whole flow ran in 47.2 s of model time across five calls, and nothing was heard (B4).

## 2. Design opportunities

| Rank | LG | Opportunity | Evidence here | Recommendation |
|---|---|---|---|---|
| 1 | LG-16 | A turn's learning evidence is decided by provenance, not substance (the typed reply left no evidence row) | E4 | build · owner: linga-conversation-turn council rework |
| 2 | **LG-27** | **The rover partner names the question it wants next** (new) | E4, turn 2 | concept-doc |
| 3 | **LG-26** | **Coaching praised a premise the scene never held** (new) | E5 | decline-with-reason |

### LG-16 · the typed reply left no evidence row (council-owned)
- **Evidence:** the desk kept the picked phrase (`choice`, `repair`) and the spoken line (`speech`, `repair`). The typed *"Where is the rover?"* left nothing (`transcript.md`, *Evidence kept by the desk*). Runs 2 and 3 found the same for both replies. Run 3's R3 traced the validator (`LINGA-COMPETITIVE-SCOPE.md` §3, *Run 3*).
- **What this run adds, read against the stored transcript and the code:** **the only reply that earned a row was the only reply that is a repair.** The rover scene's skill is `repair` (`lib/english/curriculum.ts:27`). With no review due, the allowed skills are `repair` alone (`conversation.ts:331`). The credit line tells the model that repair "means asking to repeat, clarify or confirm meaning" (`conversation.ts:324`). *"Could you tell me which bridge you mean, please?"* asks to clarify. *"Where is the rover?"* asks for information. So the absence fits **correct behaviour**: nothing the learner did was repair. That is a hypothesis; the raw model output is not kept. It turns R3's question around. The validator may be fine, and the design question is that **a child who does the rover's mission well, by asking for clues, earns no evidence**, because the mission (*"Find the rover by asking for clues"*) and the scene's skill (repair) are not the same act. That goes to the council rework as an input, and its owner line stays.
- **Guardrail:** the evidence rules that refuse a copy, a thanks or a single word (`lib/english/credit.ts:35-46`) are release gates (`docs/LINGA-CONVERSATION-DESIGN.md`). A fix must not credit a non-repair question as repair.

### LG-27 · The rover partner names the question it wants next — concept-doc (new)
- **Evidence:** turn 2, *"Good question! The rover is lost, but I saw it once. Can you ask me where I saw it last?"* The mission step on screen at the same moment reads *"NOW · Find out where Pip saw it"* (`shots/tv-replay.png`). The builder read the line as the partner doing its job: *"It acknowledges the question, gives the one fact it has and hands the next question back, as the scene's goal asks."* Runs 2 and 3 show the same move at turn 2 (*"Can you ask me where I saw it last?"*, *"Can you ask me where I saw it?"*) and read it the other way: the step is given away. Their drains append those origins.
- **Why a concept-doc:** opposing readings of one move are a segmentation question, never an average. At A2, a nine-to-eleven-year-old may need the question modelled. A learner who only repeats the partner's suggestion has practised less than one who finds the question. The step check credits words the learner said (`conversation.ts:323`), and a quote that copies four or more consecutive words of a shown line is stored as supported (`docs/LINGA-CONVERSATION-DESIGN.md`, the credit rules). The questions are in `docs/LINGA-CONVERSATION-DESIGN.md`, *Open questions (10-09 drain)*.
- **Ceiling:** three scripted runs of one scene at A2. The owner's reading of the transcripts is owed.

### LG-26 · Coaching praised a premise the scene never held — decline-with-reason (new)
- **Evidence:** the coaching note said *"Clear repair move: you asked Pip to explain the word bridge"* (`shots/tv-recap-postrun.png`). Pip never said "bridge". The harness's fixed sentence did. Builder's reading: *"The model took the learner's words at face value. The suggested phrase itself is good."* Pip's own lines then apologised for a bridge twice (`transcript.md` rows 4 and 5, `shots/tv-replay.png`).
- **Why decline:** the premise came from the harness, as a sentence no learner in the scene had a reason to say, and 78709e24 replaced it. In runs 2 and 3, *"the premise holds"* (both transcripts). What the coach praised, a clarification request, *was* a repair. Taking a learner's question at face value is not an error a coach can reliably catch. **Returns with** a Character's or a real learner's off-scene reply that the coach praises as fact.
- **Ceiling:** the coach sees the transcript (`conversation.ts:90`), and nothing checks a note's claims against it. Only its `before` is checked (`conversation.ts:343`).

**Strengths, as constraints** (from the step verdicts):
- The coach's "You said" is the learner's exact words, and the server refuses anything else (`conversation.ts:343`).
- The partner corrected the harness's odd line plainly (*"Oops, I did not say a bridge!"*) and stayed in the scene.
- The adults-only scene is refused for a child with a 403.

LG-16's rework and LG-27 must keep all three.

### Accounting: every item of 2026-10-09-linga-e-run (16)

| # | Item (source) | Disposition |
|---|---|---|
| 1 | Attempt 1: the join overwrote the nav; no model call (SUMMARY, *Attempts*) | closed-on-main 4ecd22c7 (harness) |
| 2 | E1: the Desk display toggle was not used, so it ran on the 1920×1150 default stage (SUMMARY, *Steps*) | declined: a harness deviation, not a product gap (§3) |
| 3 | E3: the footer never read "Partner speaking" (headless, no voice) | covered-elsewhere: LINGA-COMPETITIVE-SCOPE.md §3 B4 (run 3 read it, 1817 ms) |
| 4 | E4: no moment fired, so the phone's moments list stayed empty at E7 | closed-on-main 78709e24 (harness line; runs 2 and 3 fired one) |
| 5 | E4: the typed reply left no evidence row (transcript) | LG-16 (council rework; origin appended) |
| 6 | E4 turn 2: Pip hands back the next question (transcript, builder's reading) | LG-27, new (concept-doc) |
| 7 | E5: the coaching praised the "bridge" Pip never said (transcript) | LG-26, declined |
| 8 | E6: the replay apologised a second time instead of asking something new (transcript) | covered-elsewhere: LINGA-COMPETITIVE-SCOPE.md §3 *Run 3*, R4 |
| 9 | E7: the harness's `.linga-track` wait timed out on a recap that rendered | closed-on-main d0764a23 (harness) |
| 10 | E8: about 2× slower than predicted (median 9.96 s, max 11.58 s) | covered-elsewhere: LINGA-COMPETITIVE-SCOPE.md §3 *Run 3*, R2 |
| 11 | E8: line to voice null throughout; `/api/speak` 503 ×7; heard audio owed | covered-elsewhere: LINGA-COMPETITIVE-SCOPE.md §3 B4 and *Still owed* |
| 12 | After E7 not reached, and no `results.json` | closed-on-main 56e47cf3 (with d0764a23, 77206a03; run 3 passed all) |
| 13 | A second, untraced `POST /api/english 403` after the harness stopped | declined: the builder's own debug pages were open, and runs 2 and 3 each logged exactly one 403 (§3) |
| 14 | Still owed: a real phone's microphone over Wi-Fi | covered-elsewhere: LINGA-COMPETITIVE-SCOPE.md §3 B5 and *Still owed* (MH-1) |
| 15 | Still owed: the owner's reading of the transcript | covered-elsewhere: LINGA-COMPETITIVE-SCOPE.md §3 *Still owed* |
| 16 | Still owed: one more harness run after the recap selector fix | closed-on-main d0764a23 (runs 2 and 3) |

**Total: 16 items** = 3 to an LG entry (LG-16, LG-26, LG-27) + 5 closed-on-main + 6 covered-elsewhere + 2 declined (harness and log items, no product claim, so no backlog entry).

## 3. Methodology lessons

- **Schema miss: no `findings.json`.** The ledger counts only runs that have one (`uat/driver/ledger.cjs:9`, `:34`), so this run's product readings never reach `OPEN.md` or a recertify. Its step verdicts live in prose and in `LINGA-COMPETITIVE-SCOPE.md`. **Proposal (overlay, not applied):** a browser run writes a `findings.json` row per non-pass step and per builder's reading that claims a product gap, with `cert_level: "L2"`. It also writes a `run.json` with the product commit, which this SUMMARY lacks.
- **A harness defect looks like a product failure until it is read.** Both attempts stopped on the harness: a join race and a stale selector. Both were caught by reading the code against the screen before anything was filed. One defect was also a **coverage gap**: a scripted line that fit no step meant no moment could fire, so E4 "passed" without trying the moment path. A scripted learner line must fit the scene's step and carry the error under test (78709e24 did this).
- **The harness wrote its results only at the end.** One failure lost every after-E7 check. Run 3 met the same structure only because it passed. **Proposal (tools, not applied):** write `results.json` after every step, as `timings.json` already is.
- **The builder's reading is a reader, not a judge.** It caught the false premise and the second apology, which no assertion could. It is one person's reading of one scripted learner, so it enters the backlog as a lead (`hypothesis`, or decline when the harness made it), never as fact. The owner's reading stays owed.
- **The run deviated from its own spec in E1** (the default stage, not the Desk display). It did not change any verdict here. A run spec should name the stage it ran on.
