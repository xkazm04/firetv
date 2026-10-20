# L1 recertify, round 18, of the Essay Master run 2026-10-09-essay-l1 (2026-10-20)

A code-only L1 re-walk of the 5 pairs of `uat/runs/2026-10-09-essay-l1` that still had an open row, on 8a739027 (the local main tip), after the three commits that landed since 37d8e8e6: 5b71182b (the held-out short Czech and English corpus, pinned before any rule change), 23ce1e87 (the refusal arm of L1-kristyna-17-EM1-1) and 8a739027 (the sender half of L1-kristyna-17-EM1-2 and L1-barbora-43-EM1-2). `git merge-base --is-ancestor` against main: all three true; the held-out file was committed before the rule. No model call of any kind (`engine.text` was stubbed in the scratch script that reaches it), no vision, no browser, no device; desk/data and everything under desk/ and tools/ untouched. Scratch scripts ran under the OS temp directory, outside the repo (`rc18/exec18.cjs`, `remap.cjs`, `math.cjs`, `gen18.cjs`, `docs18.cjs`, loaded through `tools/ts-load.cjs`). The stamps went through `uat/driver/recertify.cjs` `writeBack()` into every run that holds an open row of the gap (the parent `findings.json` and `recert-1` to `recert-17`), and OPEN.md through `uat/driver/ledger.cjs` `writeStatus()`.

## Counts: Essay before and after

| | Blocker | Major | Minor | Polish | Total |
| --- | --- | --- | --- | --- | --- |
| Open before (recert-17) | 0 | 4 | 2 | 1 | **7** |
| Fixed | 0 | 2 | 0 | 0 | **2** |
| Recur (severity now; 2 of them narrowed) | 0 | 2 | 2 | 1 | **5** |
| New | 0 | 0 | 0 | 0 | **0** |
| Open now | 0 | 2 | 2 | 1 | **5** |

OPEN.md Essay 7 -> 5; total open 239 -> 237 (Math 6 -> 6, no Math round was run; Linga 226 -> 226). The Linga section of OPEN.md is byte for byte unchanged: sha256 of the text from "# Linga" up to "# Essay Master" is `2a273aabbf8fcc3ba868809183e2b1257fd14fc1a85779ba4324112cffc46a15` before and after (equal).

## The refusal arm: 84.9% held out is narrowed, not met

On the held-out file (53 short plain-letter Czech lines, 42 short English lines) the language check refuses **45 of 53 Czech (84.9%)** and **0 of 42 English**. The row's acceptance asks that "the reading is refused for a non-English text"; 8 short Czech lines still reach the model and are ruled on English lists, so the arm is **narrowed from 4 of 6 short lines at 37d8e8e6, not met**. The 8: "Sneh uz roztal.", "Pozdravuj sestru.", "Autobus ujel.", "Telefon mi dosel.", "Ucitel nas pochvalil.", "Dej mi vedet.", "Pojd s nami ven.", "Pomuzes mi s ukolem?". Every other corpus is clean: recert-12/heldout.json Czech 48/48, English 0/32, German 5/5, Polish 3/3; recert-11/heldout.json Czech 72/72, English 0/34; the Kamarad line is refused. The tuning set is 56/56 Czech and 0/44 English; it is what the rule was tuned on and is not evidence.

23ce1e87 refuses by a word list (about 180 everyday words added to CZECH_WORDS, plus a short-paragraph arm that needs one plain-letter Czech word of 3+ letters and no English function word; CZECH_NAME_LIKE guards collisions such as Tim). Eleven short English lines with names (Tim, Pan, Jan, Mas, Nas, Ted, Dan, Kim, Anna, Mama, Pavel) were run: none is refused, so no new row. Each leak is an everyday word the list does not hold, so the remaining gap is a lexicon or language-arm question; it is not closed by tuning on this held-out set, whose header forbids that.

**L1-kristyna-17-EM1-1 is not fixed.** The L arm (the English-only CONNECTORS, EVIDENCE, LINK, CONTRAST, wordIn and noTurn lists) is unchanged and stays with the operator. **L1-helena-46-EM1-4** quotes both figures: 6/6 on the six cs-short-plain-letter lines of recert-12/heldout.json (a tuned figure; some of those lines are in the tuning set) and 45/53 on the held-out file; its expected text does not hold on held-out evidence, so it stays open, narrowed.

## Rows now fixed (code clause): L1-barbora-43-EM1-2 and L1-kristyna-17-EM1-2, by 8a739027

The sender was executed as a pure function, outside the repo, with the real code loaded through `tools/ts-load.cjs` and `engine.text` stubbed to capture the request:

- (a) the phone's assignment expression (page.tsx:125) gives the first open essay task's name and undefined for none; the piece call (:342) and paragraph call (:369) carry `assignment` exactly when a task is open, and the title line keeps its own role as `task`.
- (b) route.ts `assignmentOf` (:59) bounds the name like the task; the real `analyseEssay` and `analysePiece` put an `The open assignment: "…"` row and an `Earlier readings under this lens` row ("2 of 6; 3 of 7 sentences faulty": the newest two of this lens, counts only) into the request when present and neither when not; an instruction written inside the assignment appears only inside the quoted row, never in the system; the learner's sentences never ride along.
- (c) the new code writes nothing: `withEarlier` reads through `recallLearner`; `analysePiece` with `noSave: true` made 0 file writes; `analyseEssay`'s pre-existing `record()` writes the same with or without an assignment.

Each row is stamped by its own code clause. The ES-READ grounding score and how far the model obeys stay **L2** and were not measured (precedent: recertify-3 stamped L1-barbora-43-EM1-1 and L1-eliska-12-EM1-3 fixed on their L1 part). For kristyna EM1-2 the "recurring faults" reach the prompt as counts of faulty sentences, not as which fault. Observed, not a row: only the first open essay task is sent.

## Rows still open (5)

Each was re-walked at 8a739027 and recurs; `recurrence` + 1 and `recurred_as` are stamped in every run that holds the gap. L1-eliska-12-EM1-4, L1-eliska-12-EM2-1 and L1-kristyna-17-EM1-3 changed in nothing but line numbers (rules/essay.ts +10, desk/essay.ts +16 after the new code).

Cite re-mapping: git diff -U0 37d8e8e6 8a739027 per file, 101 cited line numbers re-mapped and compared byte for byte with the old line: 0 differ; 5 fall inside a hunk (route.ts old :190 and :203, page.tsx old :340 and :367, rules/essay.ts old :268) and were re-read by hand.

## Math: why recert-11 was not run

The 8a739027 hunks in desk/src/app/phone/page.tsx are at :124-125 (the assignment expression), :342 (the piece call) and :369 (the paragraph call); every other line moves by +2. The Math rows cite :401-441 and :757-886; none is in a hunk, and the 51 cited lines compare byte for byte equal at +2 (:441 -> :443, :460 -> :462, :881 -> :883). So Math recert-11 was not run and OPEN.md's Math section (6 open) is as recert-10 left it.

## Suites run as read-only evidence at 8a739027

tools/essay-rules-test.cjs 171/0, tools/essay-piece-test.cjs 54/0, tools/phone-panel-test.cjs 120/0, tools/voice-rules-test.cjs 8/0, tools/uat-recertify-test.cjs 21/0, tools/uat-ledger-test.cjs 18/0 (tests pass/fail). `cd desk && npm run test:rules`: totals 89 green, 0 red; tests 2331, pass 2331, fail 0 (run once, from the worktree through the junctioned node_modules). Run from the repo, nothing installed.

## Open rows, ranked by severity times rank

Score = severity weight (major 3, minor 2, polish 1) x the row's rank. Effort: XS a string or one line, S one file and a test, M a few files or a rule change with fixtures, L new content or a model-dependent change that only L2 can confirm. Deadline 2026-10-23.

| # | Row | Score | Effort | Who closes it | What closes it |
| --- | --- | --- | --- | --- | --- |
| 1 | `L1-kristyna-17-EM1-1` (major, rank 9) | 27 | M-L | refusal arm: **BUILDER-ALONE** (a further lexicon or shape round on a FRESH held-out set, pinned before the change); language-aware verdict rules, the L arm: **OPERATOR** (the ruling: does the desk read Czech texts at all, or refuse them), then L2 | Refusal arm: close the 8 leak shapes by a fresh round, never by tuning on tools/essay-heldout-czech-short.json. L arm: the English-only lists (rules/essay.ts:14, :16, :425, :438, :475, :488). |
| 2 | `L1-eliska-12-EM1-4` (major, rank 9) | 27 | M-L | **BUILDER-ALONE** for the schema change; only L2 shows it holds | Require supports / backs for evidence-job and checkable sentences (lib/desk/essay.ts:33-35, :48), or refuse a reading that names none; Evidence marks nothing when links are omitted (rules/essay.ts:613-616). |
| 3 | `L1-kristyna-17-EM1-3` (minor, rank 6) | 12 | S | **OPERATOR** (the ruling: which language the notes use for a Czech text), then a builder | One language line in the reading prompt (lib/desk/essay.ts:113-136; CHECKS lines rules/essay.ts:472, :485); whether the model obeys is L2. |
| 4 | `L1-eliska-12-EM2-1` (minor, rank 6) | 12 | M | **OPERATOR**: declined under R6 (docs/BACKLOG.md kept-verdict entry; it returns with a learner's or the owner's reading that the kept note misleads, or a lens that judges links). EM2-1 stays declined | A kept faulty verdict the rule would now clear carries a "read the paragraph again" line (lib/desk/essay.ts:271, :304-308). |
| 5 | `L1-helena-46-EM1-4` (polish, rank 2) | 2 | M | **BUILDER-ALONE** for a further lexicon round on a fresh held-out set (45/53 held out); **OPERATOR** only if the lax under-6-words arm is to be accepted as is | Close the remaining short plain-letter Czech leaks without refusing short English (0/42 now). |

**BUILDER-ALONE, in the order to take them:** a fresh held-out short-Czech set and a second refusal round for `L1-kristyna-17-EM1-1` and `L1-helena-46-EM1-4` (the same work; yes, a further short-Czech lexicon round on a fresh held-out set is builder-alone: it needs a new corpus pinned before the change, no ruling), then the supports/backs schema change of `L1-eliska-12-EM1-4` (L2 to confirm). **OPERATOR:** the L arm of `L1-kristyna-17-EM1-1` and `L1-kristyna-17-EM1-3` (language of the notes); `L1-eliska-12-EM2-1` stays declined under R6. **L2:** the ES-READ grounding score and how far the model obeys the assignment row (both EM1-2 rows), `L1-eliska-12-EM1-4`, and the reading side of `L1-kristyna-17-EM1-1`. Waiting on a teacher or the vision path: none.
