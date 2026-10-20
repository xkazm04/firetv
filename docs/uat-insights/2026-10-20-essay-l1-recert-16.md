# L1 recertify, round 16, of the Essay Master run 2026-10-09-essay-l1 (2026-10-20)

A code-only L1 re-walk of the 7 pairs of `uat/runs/2026-10-09-essay-l1` that still had an open row, on 76a8cbc1 (`76a8cbc11f16f352db799f4becfea820cd9594b2`, the local main tip), after the two commits that landed since 0e6a63c6 and touch desk/ or tools/ (771adf26, the recert-15 commit, changed neither): 44aa0519 (the phone half of L1-daniel-15-EM3-2) and 76a8cbc1 (L1-daniel-15-EM2-2). No model call of any kind (no claude CLI, no API, no judge model; `engine.text` was stubbed in the scripts that reach it), no vision, no browser, no device; desk/data and everything under desk/ and tools/ untouched. Scratch scripts ran under the OS temp directory, outside the repo (`rc16/phone.cjs`, `verdicts.cjs`, `remap.cjs`, `gen.cjs`, `summary.cjs`, loaded through `tools/ts-load.cjs`). The stamps went through `uat/driver/recertify.cjs` `writeBack()` into every run that holds an open row of the gap (the parent `findings.json` and `recert-1` to `recert-15`), and OPEN.md through `uat/driver/ledger.cjs` `writeStatus()`.

## Counts: Essay before and after

| | Blocker | Major | Minor | Polish | Total |
| --- | --- | --- | --- | --- | --- |
| Open before (recert-15) | 0 | 5 | 4 | 1 | **10** |
| Fixed | 0 | 1 | 1 | 0 | **2** |
| Recur (severity now) | 0 | 4 | 3 | 1 | **8** |
| New | 0 | 0 | 0 | 0 | **0** |
| Open now | 0 | 4 | 3 | 1 | **8** |

OPEN.md Essay 10 -> 8; total open 242 -> 240 (Math 6 -> 6: no Math round was run, see the Math paragraph; Linga 226 -> 226). The Linga section of OPEN.md is byte for byte unchanged: sha256 of the text from "# Linga" up to "# Essay Master" is `2a273aabbf8fcc3ba868809183e2b1257fd14fc1a85779ba4324112cffc46a15` before and `2a273aabbf8fcc3ba868809183e2b1257fd14fc1a85779ba4324112cffc46a15` after (equal). Two pairs, daniel-15 EM2 and EM3, now hold no open row (L1-pass; not resolved-verified, that is L2).

## Reconcile

`git merge-base --is-ancestor` for 0e6a63c6, 44aa0519 and 76a8cbc1 against main: each true; the worktree's HEAD and `main` are both 76a8cbc1. Commits since 771adf26 that touch desk/ or tools/: 44aa0519 (desk/src/app/phone/page.tsx, tools/phone-panel-test.cjs) and 76a8cbc1 (desk/src/lib/rules/essay.ts, tools/essay-rules-test.cjs). No other desk file moved: desk/src/app/api/analyse/route.ts, desk/src/essay/EssayTV.tsx and desk/src/lib/desk/essay.ts are byte-identical to 0e6a63c6.

## Rows now fixed

### L1-daniel-15-EM3-2 (major, rank 9): fixed by 0e6a63c6 + 44aa0519

Every half holds. The phone reads `titleOf` on the raw text before `paragraphsOf` drops the title line (file load page.tsx:323, paste :330, both into `loadParagraphs` :308 and the heading state :123) and posts it as `task`: the piece call is page.tsx:340, the paragraph call :367. Executed with the two call expressions read out of page.tsx and run with the real `paragraphsOf` and `titleOf` (`rc16/phone.cjs`):

```
titled paste, two paragraphs ("Why sleep matters", blank line, two paragraphs)
  paragraphsOf -> the two paragraphs, no title | heading (titleOf of the paste) -> "Why sleep matters"
  piece read body    : {"kind":"piece","text":"Many students are tired in the morning. Schools start too early.\n\nSleep helps memory. Tired pupils forget more.","task":"Why sleep matters","type":"structure","keep":true,"source":"paste","format":"essay"}   has task key: true
  paragraph read body: {"kind":"essay","text":"Many students are tired in the morning. Schools start too early.","task":"Why sleep matters","type":"structure"}   has task key: true
untitled paste, two paragraphs
  piece read body    : {"kind":"piece","text":"<the two paragraphs>","type":"structure","keep":true,"source":"paste","format":"essay"}   has task key: false
  paragraph read body: {"kind":"essay","text":"<paragraph 1>","type":"structure"}   has task key: false
titled single paragraph typed in the box (no piece loaded)
  paragraph read body: {"kind":"essay","text":"Many students are tired in the morning. Schools start too early.","task":"Why sleep matters","type":"structure"}   has task key: true
```

Route side: `taskFor` (analyse/route.ts:56, `taskOf` :54) takes `body.task` first and `titleOf(body.text)` otherwise, and is used on the piece path (:190) and the paragraph path (:203). Run through the real `analyseEssay` with `engine.text` stubbed: a body with `task: "Why sleep matters"` gives `taskFor = "Why sleep matters"` and the reading request carries the line `The task the writing answers: "Why sleep matters"`; a body with no task gives `taskFor = undefined` and no such line. The forensic page draws the title (EssayTV.tsx:355 `forensicTitle`, :438; recert-15 rendered it). tools/phone-panel-test.cjs 117/0 pins the two call sites and the paste and file hand-over; tools/essay-rules-test.cjs 170/0. Source-run, not screenshot-verified (L2).

### L1-daniel-15-EM2-2 (minor, rank 4): fixed by 76a8cbc1

`decideVerdicts` (rules/essay.ts:524) now lets a claim that is only context take the one unsupported slot: `claimRuled` (:573-580) is the one test of "ruled neutral", the judged-skip (:582-585) sets `unsupportedSeen` for an earlier context claim that is not ruled neutral, and the claim arm (:619) uses `claimRuled`. Executed with the real rules, the real `reviseSentence` (engine stubbed to answer `{n, job: claim}`) and, beside it, the same rules file at 76a8cbc1^ transpiled from `git show` (`rc16/verdicts.cjs`). Paragraph "Homework is pointless. Teachers give too much. It ruins evenings.", all three sentences job claim, no evidence:

```
first reading (all judged)                      : 1:faulty  2:neutral  3:neutral
decideVerdicts, one sentence rewritten alone, others as context (the call at lib/desk/essay.ts:288 makes):
                          76a8cbc1 (now)   76a8cbc1^ (before)
  rewrite of sentence 1   faulty           faulty            (the first unsupported claim stays faulty)
  rewrite of sentence 2   neutral          faulty            ("Rewrite · not yet" before)
  rewrite of sentence 3   neutral          faulty
claim, claim, claim, context paragraph, rewrite of 3: neutral now, faulty before
reviseSentence (real function), verdicts before 1:faulty 2:neutral 3:neutral:
  rewrite 2 -> 1:faulty 2:neutral 3:neutral   rewrite 3 -> 1:faulty 2:neutral 3:neutral   rewrite 1 -> 1:faulty 2:neutral 3:neutral (1 still faulty)
```

tools/essay-rules-test.cjs 170/0 (the new case included). Rendered TV is L2.

## Rows still open (8)

Each was re-walked at 76a8cbc1 and recurs; `recurrence` + 1 and `recurred_as` are stamped in every run that holds the gap. Two were narrowed by 44aa0519: L1-barbora-43-EM1-2 and L1-kristyna-17-EM1-2 now say that a title the learner typed or pasted reaches the reading as its task from the phone; the assignment name (S6), the last readings' fault counts (S7) and her notes still have no sender. The other six are unchanged in substance, their cites re-mapped.

Cite re-mapping: `git diff -U0 0e6a63c6 76a8cbc1` touches page.tsx (heading state at :123, so every line from :123 moves down 1; loadParagraphs :308, file load :323, paste :328-330, piece call :340, paragraph call :367, reset :487) and rules/essay.ts (claimRuled inserted :573-580, judged-skip :582-585, the old claim arm :607-609 removed, :619; lines to :572 keep their numbers, :575-606 move +11, :610 on move +8). Every cited line of the five desk files the rows cite was compared byte for byte with the old line after the re-map: 0 differ, the three inside a hunk (old page.tsx :327, :339, :366) re-read by hand.

## Language check

`paragraphIsEnglish` (rules/essay.ts:264-271) is unchanged since ffa91a49. The 51-line window hashes to `1e12d4e6015ffc2b608a368039538edfa2f905ef7cfeaecb137b84863583b8a1` at ffa91a49 (lines 225-275), at 0e6a63c6 (228-278) and at 76a8cbc1 (228-278; the new hunks start at :573, below the check, so the numbers did not move). The diff from ffa91a49 touches the file at :134-136, :285, :323, :348, :559, :573-585, :617-619 and from :908 on, none in the check. So no fresh held-out probe was written; `recert-12/heldout.json` stays the latest language measure (plain-letter Czech 36 of 36 refused, diacritic Czech 12 of 12, German 5 of 5, Polish 3 of 3, English 0 of 32, short plain-letter Czech 4 of 6).

## Math: why recert-11 was not run

44aa0519 changed desk/src/app/phone/page.tsx, which two open Math rows cite (L1-matyas-19-MB1-1: `sendWorking` and the typed-answers call, now :451 and :470 (old 450, 469 at 0e6a63c6); L1-radka-41-MB5-2: the Recap's `learnerRecaps(s, now)`, now :886 (old 885)). The 44aa0519 hunks are at old :9, :122 (one line inserted), :307, :322, :327, :329, :339, :366 and :486, all Essay code (imports, the heading state, loadParagraphs, the file and paste handlers, the two Essay calls, the learner reset). No Math-cited line is inside a hunk; every Math cite was re-mapped by the one-line shift from :123 on and compared with the old line, and all ten (415, 433, 434, 450, 469, 766, 777, 870, 881, 885 at 0e6a63c6) are byte for byte equal. The other desk file this round changed, rules/essay.ts, is cited by no open Math row (they cite rules/school.ts, calc.ts, worked.ts, items.ts, gcse.ts, api/mark/route.ts, session/store.ts, tv/recapRows.ts and tv/keys.ts, none touched since 0e6a63c6: `git diff 0e6a63c6 HEAD` on api/mark, tv/keys.ts, rules/school.ts, session/ and tv/recapRows.ts is empty). So Math recert-11 was not run and OPEN.md's Math section (6 open) is as recert-10 left it.

## Suites run as read-only evidence at 76a8cbc1

tools/essay-rules-test.cjs 170/0, tools/phone-panel-test.cjs 117/0, tools/essay-piece-test.cjs 52/0, tools/uat-recertify-test.cjs 21/0, tools/uat-ledger-test.cjs 18/0. Run from the repo, nothing installed.

## Observed, not filed

A piece opened from the shelf (page.tsx:357 `openKept`) calls `loadParagraphs` with no title, and a kept piece is stored without its title line (`readPiece` posts `paras.join`, :334), so a version read again from the shelf sends no task. The row L1-daniel-15-EM3-2 asks for a pasted, typed or picked-file title to reach the reading, which now holds; the shelf case is a neighbour. Question for the App Master: file it as a new row (S, builder alone, page.tsx:357 plus a pieceTitle-as-task read) or leave it.

## Open rows, ranked by severity times rank

Score = severity weight (major 3, minor 2, polish 1) x the row's rank. Effort: XS a string or one line, S one file and a test, M a few files or a rule change with fixtures, L new content or a model-dependent change that only L2 can confirm. Deadline 2026-10-23.

| # | Row | Score | Effort | Who closes it | What closes it |
| --- | --- | --- | --- | --- | --- |
| 1 | `L1-kristyna-17-EM1-1` (major, rank 9) | 27 | M-L | refusal arm: builder alone with a held-out set; language-aware verdict rules: **operator ruling**, then **L2** | Close the short plain-Czech gap in `paragraphIsEnglish` (:268) and pin a 50+ held-out Czech corpus in tools/; the English-only word lists (:14, :16, :415, :428) are the L arm. |
| 2 | `L1-kristyna-17-EM1-2` (major, rank 9) | 27 | M-L | builder alone for the sender half; **L2** to judge the reading | A client sends the assignment name and the learner's recurring faults reach the prompt (lib/desk/essay.ts:102-120). The title half is in (44aa0519). Closes together with row 3. |
| 3 | `L1-barbora-43-EM1-2` (major, rank 9) | 27 | M-L | as row 2 | Same gap (S6 task name, S7 fault counts). |
| 4 | `L1-eliska-12-EM1-4` (major, rank 9) | 27 | M-L | builder, but only **L2** (a model reading) shows it holds | Require supports / backs for evidence-job and checkable sentences (lib/desk/essay.ts:33-35, :48), or refuse a reading that names none. |
| 5 | `L1-helena-46-EM1-5` (minor, rank 6) | 12 | M | **builder alone** (no ruling) | The phone asks message / email / essay before any read, also for one paragraph, and the body carries `format` on kind essay (phone/page.tsx:367, radios :291 inside pieceRead :289-296, analyse/route.ts:19, lib/desk/essay.ts:159-163), plus a test; the only choice, ask every time or only on a doubt, a builder can settle. |
| 6 | `L1-eliska-12-EM2-1` (minor, rank 6) | 12 | M | **not builder-alone: declined under R6** (docs/BACKLOG.md:433-436, kept-verdict entry; returns with a learner's or the owner's reading that the kept note misleads, or a lens that judges links) | A kept faulty verdict the rule would now clear carries a "read the paragraph again" line (lib/desk/essay.ts:255, :288-292). Needs the operator's or a learner's reading first. |
| 7 | `L1-kristyna-17-EM1-3` (minor, rank 6) | 12 | S | **operator ruling** (which language the notes use), then a builder | One language line in the reading prompt (lib/desk/essay.ts:102-112; CHECKS lines rules/essay.ts:462, :475); whether the model obeys is L2. |
| 8 | `L1-helena-46-EM1-4` (polish, rank 2) | 2 | M | by design in part: an **operator ruling** to accept the lax under-6-words arm, or a builder with a held-out short-English set | Tighten the under-6-words arm (:268) for short plain-letter Czech (2 of 6 pass) without refusing short English. |

Builder alone, in the order to take them: **`L1-helena-46-EM1-5` first** (the evidence supports it: it is a phone and route change in four known places with no ruling, and its radios and the `format` key sit in the same two calls 44aa0519 just edited, so the cites are fresh), then the refusal arm of `L1-kristyna-17-EM1-1` (needs a held-out set, still no ruling), then the sender half of rows 2 and 3 (S6, the assignment name). Waiting on an operator ruling: row 7 (language of the notes), row 6 (R6, and a learner's or the owner's reading), the language-aware arm of row 1, the lax arm of row 8 if it is to stay. Waiting on L2 to confirm: rows 2, 3, 4 and the reading side of 1. Waiting on a teacher or the vision path: none.
