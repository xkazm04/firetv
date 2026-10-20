# daniel-15 × EM3 · (recert-16)

- Character: daniel-15
- Journey: EM3
- Cert level: L1 re-walk, code only, no model
- Head 76a8cbc1
- Recertifies: 2026-10-09-essay-l1/recert-15 at 0e6a63c6
- **Verdict now: L1-pass (no row open).** 1 fixed, 0 recur; 0 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-daniel-15-EM3-2 A title line is read as its own paragraph or fuses into sentence 1; the task never reaches the … (major) | fixed | 0e6a63c6 + 44aa0519 (both ancestors of main) close the row; every half holds at 76a8cbc1. Phone: titleOf is read on the raw text before paragraphsOf drops the title line (desk/src/app/phone/page.tsx:323 file load and :330 paste both pass titleOf(...) to loadParagraphs :308, which keeps it in the heading state :123) and is posted as task: the piece call (:340) carries ...(heading ? { task: heading } : {}) and the paragraph call (:367) carries ...(titleOf(essay) ?? heading ? { task: titleOf(essay) ?? heading } : {}). Executed in a scratch script outside the repo (the two call expressions read out of page.tsx:340 and :367 and run with the real paragraphsOf and titleOf, loaded through tools/ts-load.cjs, no model): a pasted piece "Why sleep matters", two paragraphs -> piece body {"kind":"piece","text":"<the two paragraphs>","task":"Why sleep matters","type":"structure","keep":true,"source":"paste","format":"essay"} and paragraph body {"kind":"essay","text":"<paragraph 1>","task":"Why sleep matters","type":"structure"}; the same paste without a title line -> both bodies carry no task key; a titled single paragraph typed straight into the box -> the paragraph body carries the task. Route: taskFor (desk/src/app/api/analyse/route.ts:56) takes body.task first (taskOf :54) and titleOf(body.text) otherwise, used on the piece path (:190) and the paragraph path (:203); run through the real analyseEssay with the engine stubbed, a body with task "Why sleep matters" puts the line The task the writing answers: "Why sleep matters" into the reading request and a body with no task puts none. The forensic page draws the title (EssayTV.tsx:355 forensicTitle, :438, rules/essay.ts:135). tools/phone-panel-test.cjs 117/0, tools/essay-rules-test.cjs 170/0, tools/essay-piece-test.cjs 52/0 at 76a8cbc1. The rendered phone and TV are L2. Not covered by the row: a piece opened from the shelf (page.tsx:357 openKept passes no title) sends no task, because a kept piece is stored without its title line. | 0e6a63c6 + 44aa0519 |

## New findings

None.

## Notes

- Evidence check at 76a8cbc1: every cited line was re-mapped through `git diff -U0 0e6a63c6 76a8cbc1` per file and compared with the old line (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Model-dependent behaviour stays with L2.
