# L1 recertify, round 17, of the Essay Master run 2026-10-09-essay-l1 (2026-10-20)

A code-only L1 re-walk of the 5 pairs of `uat/runs/2026-10-09-essay-l1` that still had an open row, on 37d8e8e6 (`37d8e8e6d0b4aa698f7a00fa1e8b87039f76fc18`, the local main tip; parents c35a1cad and cb88229b), after the two commits that landed since 76a8cbc1 and touch desk/ or tools/: c35a1cad (the kind of writing is asked before any read, and a paragraph read carries it; L1-helena-46-EM1-5) and 37d8e8e6 (the shelf re-read keeps its title). `git merge-base --is-ancestor` against main: c35a1cad true, 37d8e8e6 true. No model call of any kind (`engine.text` was stubbed in the scratch script that reaches it), no vision, no browser, no device; desk/data and everything under desk/ and tools/ untouched. Scratch scripts ran under the OS temp directory, outside the repo (`rc17/exec.cjs`, `remap.cjs`, `gen17.cjs`, `docs17.cjs`, loaded through `tools/ts-load.cjs`). The stamps went through `uat/driver/recertify.cjs` `writeBack()` into every run that holds an open row of the gap (the parent `findings.json` and `recert-1` to `recert-16`), and OPEN.md through `uat/driver/ledger.cjs` `writeStatus()`.

## Counts: Essay before and after

| | Blocker | Major | Minor | Polish | Total |
| --- | --- | --- | --- | --- | --- |
| Open before (recert-16) | 0 | 4 | 3 | 1 | **8** |
| Fixed | 0 | 0 | 1 | 0 | **1** |
| Recur (severity now) | 0 | 4 | 2 | 1 | **7** |
| New | 0 | 0 | 0 | 0 | **0** |
| Open now | 0 | 4 | 2 | 1 | **7** |

OPEN.md Essay 8 -> 7; total open 240 -> 239 (Math 6 -> 6, no Math round was run; Linga 226 -> 226). The Linga section of OPEN.md is byte for byte unchanged: sha256 of the text from "# Linga" up to "# Essay Master" is `2a273aabbf8fcc3ba868809183e2b1257fd14fc1a85779ba4324112cffc46a15` before and after (equal).

## Row now fixed: L1-helena-46-EM1-5 (minor, rank 6), fixed by c35a1cad

The format path was executed as a pure function, outside the repo, with the real code loaded through `tools/ts-load.cjs` and `engine.text` stubbed to capture the request. All three halves hold:

- (a) the paragraph call expression read out of `desk/src/app/phone/page.tsx:367`, with pieceFormat email and no pieceId, posts `format: "email"`; with no format chosen it posts no format key; with a pieceId open it posts none either.
- (b) `desk/src/app/api/analyse/route.ts:203` passes `hasFormat(body.format) ? body.format : undefined`; the real `analyseEssay` with format email on a single paragraph puts `The kind of writing this is: "email"` and the system sentence "judge the text as that kind of writing" into the reading request, the same line `analysePiece` gives `judge` through `formatOf`; the same read with no format, or an unknown one, carries neither.
- (c) the message / email / essay radios (`data-role="essay-format"`) sit at the head of `pieceRead` (page.tsx:290), gated by `!pieceId` only, before the `paras.length > 1` block and outside Keep; `pieceRead()` is rendered on the paste screen, the rewrite panel and the plan panel.

The scratch output is quoted whole in `uat/runs/2026-10-09-essay-l1/recertify-17.md`. The rendered phone is L2; not screenshot-verified.

## Observed, not a row: the shelf-title neighbour (37d8e8e6)

openKept (desk/src/app/phone/page.tsx:357) now passes its title to loadParagraphs: EssayShelf onOpen has an optional third argument (title?: string) and hands it j.title. The openKept expression, read out of page.tsx and run with the real paragraphsOf (rc17/exec.cjs): a real title "My Trip to Brno" -> heading "My Trip to Brno" (so both reads post it as task); "Untitled email 1" and "Untitled essay 12" (the desk's own placeholder names) -> null; no title (undefined) -> null; "" -> null. So a version read again from the shelf carries a task when the learner named the piece and none when the desk named it. Recorded as observed, not as a row: it is the neighbour of L1-daniel-15-EM3-2 that recert-16 asked about, and it holds.

## Rows still open (7)

Each was re-walked at 37d8e8e6 and recurs; `recurrence` + 1 and `recurred_as` are stamped in every run that holds the gap. None changed in substance. Two rows (L1-barbora-43-EM1-2, L1-kristyna-17-EM1-2) now also note that c35a1cad makes the kind of writing reach a single-paragraph read; the assignment name (S6) and the fault history (S7) still have no sender.

Cite re-mapping: git diff -U0 76a8cbc1 37d8e8e6 per file: desk/src/app/phone/page.tsx hunks -289,0 +290,1 / -292,1 +292,0 / -357,1 +357,1 / -367,1 +367,1 (the format radios move out of the Keep block to :290; no later line moves); desk/src/app/phone/EssayShelf.tsx (onOpen type and call); desk/src/app/api/analyse/route.ts -19,1 +19,1 and -203,1 +203,1; desk/src/lib/desk/essay.ts -163,1 +163,1 and -167,1 +167,1; no other desk file (lib/rules/essay.ts, EssayTV.tsx, voice.ts are byte-identical). 128 cited line numbers (the cites of recert-16, ranges expanded) were re-mapped and compared byte for byte with the old line: 0 differ; 5 fall inside a hunk (page.tsx old :292 and :367, route.ts :19 and :203, essay.ts :163) and were re-read by hand.

## Language check

`paragraphIsEnglish` (rules/essay.ts:264-271) is unchanged since ffa91a49 and rules/essay.ts is byte-identical at 76a8cbc1 and 37d8e8e6; the 51-line window hashes to `1e12d4e6015ffc2b608a368039538edfa2f905ef7cfeaecb137b84863583b8a1` at all three. No fresh held-out probe was written; `recert-12/heldout.json` stays the latest language measure.

## Math: why recert-11 was not run

The 37d8e8e6 hunks in desk/src/app/phone/page.tsx are at old :289/:292 (the format radios move out of the Keep block; one line added at :290, one removed at :292, so no later line moves), :357 (openKept) and :367 (the paragraph call). The Math rows cite :401-441 and :757-886; no Math-cited line is in a hunk, and the 25 cited lines compare byte for byte equal between cb88229b and 37d8e8e6. So Math recert-11 was not run and OPEN.md's Math section (6 open) is as recert-10 left it.

## Suites run as read-only evidence at 37d8e8e6

tools/phone-panel-test.cjs 119/0, tools/essay-piece-test.cjs 53/0, tools/essay-rules-test.cjs 170/0, tools/uat-recertify-test.cjs 21/0, tools/uat-ledger-test.cjs 18/0.

## Open rows, ranked by severity times rank

Score = severity weight (major 3, minor 2, polish 1) x the row's rank. Effort: XS a string or one line, S one file and a test, M a few files or a rule change with fixtures, L new content or a model-dependent change that only L2 can confirm. Deadline 2026-10-23.

| # | Row | Score | Effort | Who closes it | What closes it |
| --- | --- | --- | --- | --- | --- |
| 1 | `L1-kristyna-17-EM1-1` (major, rank 9) | 27 | M-L | refusal arm: **builder alone** with a held-out set (a 50+ Czech corpus pinned in tools/; short plain-letter Czech is the gap, :268); language-aware verdict rules: **operator ruling**, then **L2** | Close the short plain-Czech gap in `paragraphIsEnglish` (:268); the English-only word lists (:14, :16, :415, :428) are the L arm. |
| 2 | `L1-kristyna-17-EM1-2` (major, rank 9) | 27 | M-L | **builder alone** for the sender half; **L2** to judge the reading | A client sends the assignment name (S6) and the learner's recurring faults (S7) reach the prompt (lib/desk/essay.ts:102-120). The title half is in (44aa0519), and c35a1cad now sends the kind of writing on a single paragraph. Closes together with the next row. |
| 3 | `L1-barbora-43-EM1-2` (major, rank 9) | 27 | M-L | as the row above | Same gap (S6 task name, S7 fault counts). |
| 4 | `L1-eliska-12-EM1-4` (major, rank 9) | 27 | M-L | builder, but only **L2** (a model reading) shows it holds | Require supports / backs for evidence-job and checkable sentences (lib/desk/essay.ts:33-35, :48), or refuse a reading that names none. |
| 5 | `L1-eliska-12-EM2-1` (minor, rank 6) | 12 | M | **not builder-alone: declined under R6** (docs/BACKLOG.md kept-verdict entry; returns with a learner's or the owner's reading that the kept note misleads, or a lens that judges links); EM2-1 stays declined | A kept faulty verdict the rule would now clear carries a "read the paragraph again" line (lib/desk/essay.ts:255, :288-292). Needs the operator's or a learner's reading first. |
| 6 | `L1-kristyna-17-EM1-3` (minor, rank 6) | 12 | S | **operator ruling** (which language the notes use), then a builder | One language line in the reading prompt (lib/desk/essay.ts:102-112; CHECKS lines rules/essay.ts:462, :475); whether the model obeys is L2. |
| 7 | `L1-helena-46-EM1-4` (polish, rank 2) | 2 | M | by design in part: an **operator ruling** to accept the lax under-6-words arm, or a builder with a held-out short-English set | Tighten the under-6-words arm (:268) for short plain-letter Czech (2 of 6 pass) without refusing short English. |

Builder alone, in the order to take them: the refusal arm of `L1-kristyna-17-EM1-1` (needs a held-out set, no ruling), then the sender half of `L1-kristyna-17-EM1-2` and `L1-barbora-43-EM1-2` (S6, the assignment name). Waiting on an operator ruling: `L1-kristyna-17-EM1-3` (language of the notes), `L1-eliska-12-EM2-1` (declined under R6, and a learner's or the owner's reading), the language-aware arm of `L1-kristyna-17-EM1-1`, and the lax arm of `L1-helena-46-EM1-4` if it is to stay. Waiting on L2 to confirm: `L1-eliska-12-EM1-4`, both ES-READ rows and the reading side of `L1-kristyna-17-EM1-1`. Waiting on a teacher or the vision path: none.
