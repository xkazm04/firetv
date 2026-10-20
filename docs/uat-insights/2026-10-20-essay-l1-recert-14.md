# L1 recertify, round 14, of the Essay Master run 2026-10-09-essay-l1 (2026-10-20)

A code-only L1 re-walk of the 7 pairs of `uat/runs/2026-10-09-essay-l1` that still had an open row, on 67e0a3a6 (`67e0a3a669a1a9e2412397a70c61774638f4ec0c`, local main), after the three commits that landed since 0eaf5a97: 5358ddeb (the Math row L1-radka-41-MB5-2, read in the Math note), e0820f31 (L1-helena-46-EM1-1) and 67e0a3a6 (L1-daniel-15-EM3-1). No model call of any kind (no claude CLI, no API, no judge model), no vision, no browser, no device; desk/data and everything under desk/ and tools/ untouched. Scratch scripts ran outside the repo (`/tmp/rc14/ex.cjs`, `ex2.cjs`, `ex3.cjs`, loaded through `tools/ts-load.cjs`). The stamps went through `uat/driver/recertify.cjs` `writeBack()` into every run that holds an open row of the gap, and OPEN.md through `uat/driver/ledger.cjs` `writeStatus()`.

## Counts: Essay before and after

| | Blocker | Major | Minor | Polish | Total |
| --- | --- | --- | --- | --- | --- |
| Open before (recert-13) | 0 | 6 | 5 | 1 | **12** |
| Fixed | 0 | 1 | 0 | 0 | **1** |
| Recur (severity now) | 0 | 5 | 5 | 1 | **11** |
| New | 0 | 0 | 0 | 0 | **0** |
| Open now | 0 | 5 | 5 | 1 | **11** |

OPEN.md Essay 12 -> 11; total open 244 -> 243 (the Math section is 6 -> 6, see its note). The Linga section of OPEN.md is byte for byte unchanged (sha256 2a273aabbf8fcc3ba868809183e2b1257fd14fc1a85779ba4324112cffc46a15 before and after, taken from "# Linga" up to "# Essay Master").

## Reconcile: the commits the rows name

All three commits are ancestors of main (`git merge-base --is-ancestor`): 5358ddeb, e0820f31, 67e0a3a6. `git diff -U0 0eaf5a97 67e0a3a6` touches desk/src/app/phone/page.tsx (11 lines inserted at :276: the old :319 and :346 are now :330 and :357), desk/src/essay/EssayTV.tsx, desk/src/lib/rules/essay.ts (from :917 only), desk/src/lib/session/store.ts and desk/src/tv/recapRows.ts, plus three test files. Every cite of the other rows was re-mapped through it.

| Commit | Row | Result |
| --- | --- | --- |
| 67e0a3a6 (with ca0c905c) | L1-daniel-15-EM3-1 | **fixed**: pasteField() and pasteSend() are shared by the rewrite panel (page.tsx:841), the plan panel (:847) and the paragraph panel (:859, :866), each with shelf(); the shelf's Open fills the box (`essay = paras[pix]`, :107) |
| e0820f31 | L1-helena-46-EM1-1 | **narrowed again**: the Argument promise, the wait and failure lines, the plan screen's captions and the Paragraph playbook title now say message for an adult; the plan screen's heading "Your paragraph, one sentence at a time" (EssayTV.tsx:235) and the lens home's label "First paragraph" (:194) still say paragraph |
| 5358ddeb | L1-radka-41-MB5-2 (Math) | narrowed again, see the Math note: the pure function is right, the phone is never sent `away` |

## Rows now fixed

| Row | Sev. | Fixed by | What the code does now |
| --- | --- | --- | --- |
| `L1-daniel-15-EM3-1` The paste box and the shelf are hidden whenever the TV is on the forensic page | major | **67e0a3a6** with ca0c905c | The rewrite and plan panels carry the paste box, its Dictate and "Analyse on the TV" / "This paragraph only", and the shelf; under them the shelf's Open now lands in a box on screen. tools/phone-panel-test.cjs 115/0 pins one textarea, one send and the three-panel sharing. Source-read, not screenshot-verified (L2). Not covered: a multi-paragraph piece opened under the rewrite or plan panel has no "Read the whole piece on the TV" button (it stays on the paragraph panel, :865); the TV's Back returns the phone there. |

## Narrowed, still open

| Row | Commit | What is still missing |
| --- | --- | --- |
| `L1-helena-46-EM1-1` | e0820f31 | Executed with an adult profile (renderToStaticMarkup of the real EssayType, EssayPlan, Playbook, Xray): the Argument promise, the wait and failure captions, the plan screen's wait, failure and read captions and the playbook/x-ray title all read message. Two strings still read paragraph in Adult mode: the plan screen's heading "Your paragraph, one sentence at a time" (desk/src/essay/EssayTV.tsx:235) and the lens home's empty-state label "First paragraph" (:194). tools/essay-rules-test.cjs 167/0 pins the captions, not those two. |

## Language check

`paragraphIsEnglish` (desk/src/lib/rules/essay.ts:261-268) did not change since ffa91a49: lines 225-275 of the file have the same sha256 at ffa91a49 and at 67e0a3a6, and the diff since touches the file at :282, :320, :345, :556 and from :897 on, none in the check. No fresh held-out probe was written. `recert-12/heldout.json` stays the latest language measure: plain-letter Czech 36 of 36 refused, diacritic Czech 12 of 12, German 5 of 5, Polish 3 of 3, English 0 of 32, short plain-letter Czech 4 of 6.

## Suites run as read-only evidence at 67e0a3a6

tools/tv-recap-test.cjs 62/0, tools/essay-rules-test.cjs 167/0, tools/phone-panel-test.cjs 115/0, tools/essay-piece-test.cjs 51/0, tools/docx-rules-test.cjs 6/0, tools/uat-recertify-test.cjs 21/0, tools/uat-ledger-test.cjs 18/0. All of them loaded in the worktree; nothing was installed.

## Open rows, ranked by how cheaply each could close before 10-23

Effort: XS a string or one line, S one file and a test, M a few files or a rule change with fixtures, L new content or a model-dependent change that only L2 can confirm. Deadline 2026-10-23. "Builder alone" means no ruling, teacher or vision path is needed to land the code.

| # | Row | Effort | Files | Who closes it | What closes it |
| --- | --- | --- | --- | --- | --- |
| 1 | `L1-helena-46-EM1-1` (minor, rank 6) | XS | desk/src/essay/EssayTV.tsx:235, :194, tools/essay-rules-test.cjs | builder alone | Route the plan heading and the empty-state label through adultSay (the helper and the pattern are at :151-158, :219-225); add both strings to the render test. |
| 2 | `L1-kristyna-17-EM1-3` (minor, rank 6) | S | desk/src/lib/desk/essay.ts:102-112 | **owner ruling** (which language the notes use), then a builder | One language line in the reading prompt. |
| 3 | `L1-daniel-15-EM3-2` (major, rank 9) | S-M | desk/src/app/api/analyse/route.ts:188, :201, desk/src/lib/rules/essay.ts:132 (titleOf), desk/src/essay/EssayTV.tsx (forensic header) | builder alone | When the send names no task, pass titleOf(body.text) as the task through taskOf, and draw the title on the forensic page; a render test pins both. The "kept out of the paragraphs" half is in (cae23442). |
| 4 | `L1-eliska-12-EM2-1` (minor, rank 6) | M | desk/src/lib/desk/essay.ts:288-292 | builder alone | A kept faulty verdict the rule would now clear carries a "read the paragraph again" line. |
| 5 | `L1-daniel-15-EM2-2` (minor, rank 4) | M | desk/src/lib/rules/essay.ts:569, :609, desk/src/lib/desk/essay.ts:288 | builder alone | A rewrite of a claim first ruled neutral as a later unsupported claim is not ruled faulty on that ground alone (judge it with its paragraph's context). |
| 6 | `L1-helena-46-EM1-5` (minor, rank 6) | M | desk/src/app/phone/page.tsx:357, :862, desk/src/lib/desk/essay.ts:159-163, desk/src/app/api/analyse/route.ts:19 | builder alone | The phone asks message / email / essay before any read; analyseEssay takes the format. |
| 7 | `L1-helena-46-EM1-4` (polish, rank 2) | M | desk/src/lib/rules/essay.ts:265 | builder alone, with a held-out set | Tighten the under-6-words arm for short plain-letter Czech (2 of 6 pass) without refusing short English; a short-English held-out set comes first. |
| 8 | `L1-kristyna-17-EM1-1` (major, rank 9) | M-L | desk/src/lib/rules/essay.ts:14, :16, :412, :425, :580 | builder for the refusal arm; the language-aware rules are an **owner ruling** | Close the short plain-Czech gap and pin a 50+ held-out Czech corpus in tools/; the other arm is language-aware verdict rules (L). |
| 9 | `L1-kristyna-17-EM1-2` (major, rank 9) | M-L | desk/src/app/phone/page.tsx:330, :357, desk/src/app/api/analyse/route.ts:54, :188, :201, desk/src/lib/desk/essay.ts:102-120 | builder alone for the task half; **L2** to judge the reading | A client sends the task and the learner's recurring faults reach the prompt. Closes together with row 10. |
| 10 | `L1-barbora-43-EM1-2` (major, rank 9) | M-L | same files as row 9 | as row 9 | Same gap (S6 task name, S7 fault counts). |
| 11 | `L1-eliska-12-EM1-4` (major, rank 9) | M-L | desk/src/lib/desk/essay.ts:33-35, desk/src/lib/rules/essay.ts:558-576 | builder, but only **L2** (a model reading) shows it holds | Require supports / backs for evidence-job and checkable sentences, or refuse a reading that names none. |

Waiting on an owner ruling: row 2 (language of the notes), the language-aware arm of row 8. Waiting on a teacher: none. Waiting on the vision path: none. Waiting on L2 to confirm: rows 9, 10, 11. A builder could close alone before 10-23: rows 1, 3, 4, 5, 6, 7 and the refusal arm of row 8; the cheapest cut is rows 1 and 3 (one small file change and one S-M change, closing a minor and a major).
