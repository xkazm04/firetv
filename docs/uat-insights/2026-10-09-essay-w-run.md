# UAT drain — 2026-10-09-essay-w-run

One writing episode in the browser with the real model: `tools/essay-ui-test.cjs`, W1–W8 plus a reread after a server restart (M5 goal 3). It used an isolated desk (a fresh `DESK_DATA_DIR` outside every repo, `next dev --webpack`, port 3241, every `CLAUDE_*` variable unset) and the claude CLI with the essay calls on `claude-cli/sonnet`. The learner was Sam (15, high-school), on the Evidence lens, with a fixed five-sentence paragraph and one rewrite of sentence 4. **One harness run, `passed: true`.** **L2 evidence on the claude CLI**, with **the builder's reading**: no Character, no judge, and no finding ids. The owner's reading is owed. Evidence was committed at a12d4b74, and the harness was committed first as f8661061. Drained 2026-10-09 from `SUMMARY.md`, `transcript.md`, `timings.json`, `results.json`, `results-reread.json` and the screenshots (`tv-coached.png`, `tv-rewrite-offered.png`, `tv-rewrite-judged.png`, `tv-recap.png`, `phone-recap.png`, `tv-after-reload.png`, `tv-reread-lens-home.png`). Gaps were checked against main dfb12cc1. Paths are relative to `desk/src/` unless they start with `tools/`, `uat/` or `docs/`.

**Covered elsewhere, not restated:** `docs/DESIGN-ESSAY-MASTER.md`, *Run of 2026-10-09: one writing episode end to end* (66f0d7ff, with the follow-up 080ecac8), holds the step table, the timings, what is owed and the two open readings of sentences 3 and 4.

13 items. **Two builds, both owned by the end-of-session-memory-recap council rework (EM-B1, EM-B2).** One decline (EM-B3). One item closed on main (3d00e23c). The rest is covered by the design doc's run section.

## 1. Confirmed-and-fixed

**Nothing in this run went finding → fix → `resolved-verified`.** It is a first run, and it has no `findings.json` (§3).

**Closed on main since the run:** sentence 3's note began *"Strong:"* on a neutral verdict. 3d00e23c strips a leading verdict label from every model note (`cleanNote`, `lib/rules/essay.ts:245`, applied at `:310`), so the verdict is code's alone. It is tested in `tools/essay-rules-test.cjs`, with a kill test reported in `DESIGN-ESSAY-MASTER.md`. **Ceiling:** a verdict word anywhere else in a note stays. Sentence 4's *strong* verdict, whose note says the size of the change is missing, is a different question and waits for the owner's reading (follow-up (b) there).

**What the run proved works** (`results.json`):
- One reading, then a rewrite judged again. Sentence 4 went from faulty to strong, and every other verdict was kept identical (`everyOtherVerdictKept: true`).
- The episode is on disk: one `writing` history entry and `writing.evidence`, with `seen 1` (W7).
- A restarted desk serves the episode (the reread).
- No note, move, pattern or summary contains a whole learner sentence (`textsThatContainAWholeLearnerSentence: []`).

## 2. Design opportunities

The end-of-session-memory-recap council rework owns its *lite* must-address. This run's stored artifacts decide two of its three items: one confirmed, one half-confirmed. Both are entered as builds under the rework's owner line, not as fresh ideas.

| Rank | EM | Opportunity | Evidence | Recommendation |
|---|---|---|---|---|
| 1 | **EM-B1** | **The recap counts a sentence the student rewrote to strong as still to fix** | W5 → W6, W7 | build · owner: end-of-session-memory-recap council rework |
| 2 | **EM-B2** | **An Essay evening writes no memory: End session asks for none** | W6 | build · owner: end-of-session-memory-recap council rework |
| 3 | **EM-B3** | **A rewrite re-judges only its own sentence: sentence 5 stays faulty after sentence 4 supplies the evidence it asked for** | W5, builder's reading | decline-with-reason |

### EM-B1 · The recap counts a sentence the student rewrote to strong as still to fix — build (council rework)
- **Serves must-address (1), verbatim:** *"value: The Essay recap counts a sentence the student fixed as still to fix (Barbora C2 fails; observed)"*. **This run confirms it.**
- **Count from `results.json`:**
  - Before the rewrite: **2 faulty** of 5, sentences 4 and 5 (`W4.reading.verdicts`, lines 49-91).
  - After it: **1 faulty**. Sentence 4 is now `strong` (`W5.sentence4.after`, lines 109-121), and the other four are unchanged (`everyOtherVerdictKept: true`, line 123).
  - The recap that follows still says *"Essay Master - one reading (Evidence): 2 of 5 sentences to fix"* (`W6.phoneRecap`, line 128). The history on disk says `"2 of 5 sentences to fix"` (`W7.history`, line 136). The TV recap draws two backward arrows (`tv-recap.png`).
  - The same desk's lens home, drawn from the session's reading after the reread, marks only sentence 5 (`tv-reread-lens-home.png`, *Last paragraph*). Two surfaces of one desk disagree about the same paragraph.
- **Root cause, verified in the code:** the history line is written once, when the paragraph is read (`record()`, `lib/desk/essay.ts:93-101`, called at `:110`). A rewrite writes nothing, by design: *"Nothing is written to the learner record: the paragraph was read once, and a rewrite is not another reading"* (`essay.ts:156`). The recap parses that line (`tv/recapRows.ts:35`, `:63-65`), and the phone's recap draws the same tiles (`app/phone/page.tsx:615-623`).
- **Cost/value:** the rework's call. The run shows that the counted figure must follow the reading's last state, not its first. The record must stay one reading: a rewrite is not a second episode (`essay.ts:156`), and `writing.evidence` `seen` must not double.
- **Guardrail:** the history `detail` is counts only, never a sentence (`essay.ts:100`, the digest keeps "the lens and the two counts, never a sentence").
- **Ceiling:** a recap that counts the last state still says nothing about *which* sentence improved. The caption "two to look at together" would become "one".

### EM-B2 · An Essay evening writes no memory: End session asks for none — build (council rework)
- **Serves must-address (2), verbatim:** *"value: The memory half never fires for a Linga or Essay evening, and the phone then says 'Nothing written down tonight.'"* **This run confirms the first half for an Essay evening and cannot decide the second.**
- **What the stored artifacts show:** End session took 1,896 ms and made **no model call**. The SUMMARY's *Model calls* table reads *"End session (/api/memory; no model call, nothing marked and no hints) · 1896 · none"*, and `/api/memory` answered with no 4xx or 5xx (SUMMARY, *Server log lines*). The route returns early for an evening with no practice item and no hint (`app/api/memory/route.ts:28`), and an Essay evening has neither. Even when the route does run, the memory prompt is built from Maths practice items alone (`lib/desk/memory.ts:24`, `:30-35`), so an essay reading has no input there.
- **What they cannot show:** the harness pressed End session on the phone's *Tonight* tab and then switched to *Recap* before its screenshot (`tools/essay-ui-test.cjs:153-158`). The *"What the desk noticed"* block, which prints *"Nothing written down tonight."* for an empty list (`app/phone/page.tsx:612-613`), was never captured. The code says it would show. The run does not.
- **Must-address (3)** (*"craft: The phone's End session holds the evening open on a model call; the TV path does not"*): **cannot decide.** No model call ran, because `route.ts:28` returned first, so nothing held the evening open. The 1.9 s is the phone's `/api/memory` round trip plus `session.end` (`page.tsx:353-358`), and the harness's poll for the recap.
- **Ceiling:** an essay memory line would rest on a lens and two counts. What a student struggled with sits in the notes, which the record does not keep (EM-B1's guardrail).

### EM-B3 · A rewrite re-judges only its own sentence — decline-with-reason
- **Evidence:** the builder's reading. *"Sentence 5 stays faulty by design (the other verdicts are kept), even though the rewrite of sentence 4 adds the learning evidence it asked for."* Sentence 5's note asks for *"grades, test scores or attendance"*. The rewritten sentence 4 now says *"students' grades in their first class of the day went up"*.
- **Why decline:** each verdict is about its own sentence. Sentence 5 (*"That is why a later start would help students learn"*) still asserts on its own, and its move (*"Add a learning measurement"*) still applies to it. Keeping the other verdicts identical is W5's own acceptance (`everyOtherVerdictKept`) and the rewrite contract (`essay.ts:156`). Re-reading the paragraph is *Analyse* again, at about 27 s. **Returns with** a learner's or the owner's reading that the kept note misleads, or with a lens that judges links between sentences.
- **Ceiling:** the TV still shows sentence 5's note asking for grades that the paragraph now has, one sentence earlier.

**Strengths, as constraints:**
- No coaching text restated a learner sentence. EM-B1 and EM-B2 must keep the record to counts and the memory to plain sentences about the learner, never the learner's own text.
- The rewrite's verdict is code's (`decideVerdicts`) and the note is the model's. 3d00e23c keeps them apart, and nothing here may let a note carry a verdict again.
- The other verdicts were kept identical across a rewrite. EM-B1 must not re-judge them to update a count.

### Accounting: every item of 2026-10-09-essay-w-run (13)

| # | Item (source) | Disposition |
|---|---|---|
| 1 | W2: Enter to `essaytype` took 744 ms, past the 560 ms zoom (`exceededZoom: true`) | declined: no gap. It is the zoom, then the step's post, then a 100 ms poll; Linga run 3 measured 605–647 ms by polling (§3) |
| 2 | W4 caveat: the ghostwriting check is a substring test and cannot see a paraphrase | covered-elsewhere: DESIGN-ESSAY-MASTER.md *Run of 2026-10-09*, *Owed* (the owner's reading) |
| 3 | Sentence 3's note starts "Strong:" while its verdict is neutral (transcript) | closed-on-main 3d00e23c (`cleanNote`) |
| 4 | Why sentence 3 was neutral is not traced (transcript) | covered-elsewhere: DESIGN-ESSAY-MASTER.md *Run of 2026-10-09*, follow-up (c) |
| 5 | W5: sentence 4 is strong while its note says the size of the change is missing (transcript) | covered-elsewhere: DESIGN-ESSAY-MASTER.md *Run of 2026-10-09*, follow-up (b) (the owner's call) |
| 6 | W5: sentence 5 stays faulty after sentence 4 adds what it asked for (transcript) | EM-B3, declined |
| 7 | W6: the recap reads "2 of 5 sentences to fix" after sentence 4 was fixed | EM-B1 (council rework; must-address (1) confirmed) |
| 8 | W6: End session made no memory call; the *Model calls* table | EM-B2 (council rework; must-address (2): first half confirmed, second undecidable; (3) undecidable) |
| 9 | Reread caveat: `session.json` survived the restart, so the reread did not start from an empty session | covered-elsewhere: DESIGN-ESSAY-MASTER.md *Run of 2026-10-09*, *Owed* (W7's direct read is the disk proof) |
| 10 | Still owed: a real phone | covered-elsewhere: DESIGN-ESSAY-MASTER.md *Run of 2026-10-09*, *Owed* |
| 11 | Still owed: heard audio (`/api/speak` 503, no voice configured) | covered-elsewhere: DESIGN-ESSAY-MASTER.md *Run of 2026-10-09*, *Owed* |
| 12 | Still owed: the owner's reading of `transcript.md` | covered-elsewhere: DESIGN-ESSAY-MASTER.md *Run of 2026-10-09*, *Owed* |
| 13 | W2's bearing on Linga run 2's Maths entrance: a rerun that polls the screen is owed | closed-on-main 56e47cf3 (Linga run 3, db508ca3: both entrances reached with no click) |

**Total: 13 items** = 3 to an EM entry (EM-B1, EM-B2, EM-B3) + 2 closed-on-main + 7 covered-elsewhere + 1 declined (a timing within its design, no product claim, so no backlog entry).

## 3. Methodology lessons

- **Schema miss: no `findings.json`.** The ledger counts only runs that have one (`uat/driver/ledger.cjs:9`, `:34`), and it is a Linga ledger besides (`linga-text.cjs`). This run's one confirmed product gap (EM-B1) lives in `results.json` arithmetic and a council's must-address, and no Essay ledger can ask a recertify about it. Neither the SUMMARY nor any file records the product commit the run ran on. **Proposal (overlay, not applied):** an Essay L2 run writes `findings.json` and `run.json` in the LT schema (`cert_level: "L2"`), so a module-agnostic ledger can fold Essay rows.
- **The harness recorded the numbers that decide a council item, but did not compare them.** W5 records the faulty count before and after, and W6 records the recap's count. The drain had to subtract by hand. **Proposal (tools, not applied):** W6 asserts, or at least records, `faulty after the rewrite` beside the recap's `N of M`. A run then shows EM-B1 closing or still open without a reader.
- **One panel was never captured, so one must-address stays open.** The harness switched tabs before its screenshot. **Proposal (tools, not applied):** capture the *Tonight* tab after End session, before switching to *Recap*. This is the cheapest way to decide must-address (2)'s second half.
- **A restart that keeps `session.json` is not a cold start.** The builder said so plainly and left the proof with W7's direct read. A true cold reread would move `session.json` aside first. Whether it should is a harness choice, recorded in `DESIGN-ESSAY-MASTER.md`.
- **The builder's reading separated model wording from code verdicts.** That is how sentence 3's label was found and fixed the same day (3d00e23c). A code verdict next to a model note is a pairing worth reading on every Essay run.
