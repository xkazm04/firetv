# daniel-15 × EM3 · (recert-10)

- Character: daniel-15
- Journey: EM3
- Cert level: L1 re-walk, code only, no model
- Head 6b189791
- Recertifies: 2026-10-09-essay-l1/recert-9 at b7fca776
- **Verdict now: L1-conditional.** 0 fixed, 5 recur; 5 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-daniel-15-EM3-1 The paste box and the shelf are hidden whenever the TV is on the forensic page,… (major) | recurs → L1-daniel-15-EM3-1 | cited lines re-found at 6b189791: the paste box and shelf still render only when !onSentence && !onPlan (page.tsx:724); onSentence is set while forensic has a reading (:239); Select on Essay still reopens forensic when ownReading (keys.ts:300 openWaiting). 32ffdf92 only changed Next sentence. | none |
| L1-daniel-15-EM3-2 A title line is read as its own paragraph or fuses into sentence 1; the task ne… (major) | recurs → L1-daniel-15-EM3-2 | Narrowed by cae23442: readTitle/titleOf (rules/essay.ts:~103-130) keep a short stop-less leading line out of paragraphsOf and splitSentences, so it is no longer read as a paragraph nor fused into sentence 1 (first clause met). Still missing: the title is only dropped, never shown as a title and never passed to the reading prompt as the task; readTitle/titleOf have no caller outside rules/essay.ts, desk/essay.ts builds task only from reader.task (desk/essay.ts:110,119), and a question line is deliberately not a title. Still missing: The title is not shown as a title anywhere, is not passed to the reading prompt as the task, and a question line followed by a paragraph still stays a paragraph (by design). | cae23442 (narrows) |
| L1-daniel-15-EM3-3 Nothing says grammar and spelling are not checked; 'Well done' lands on sentenc… (minor) | recurs → L1-daniel-15-EM3-3 | cited lines re-found at 6b189791: the check lines (rules/essay.ts:444-450, moved +17 from before) name no grammar scope, and EssayTV.tsx:419 still shows 'Well done' with no statement that grammar and spelling are not checked. 176f04f0 only added figures. | none |
| L1-daniel-15-EM3-4 Present-and-correct-but-unwired: provider, stats.words, stats.links; /api/texts… (minor) | recurs → L1-daniel-15-EM3-4 | Narrowed by 176f04f0: stats.words and stats.links are now drawn in the forensic figures row (EssayTV.tsx:477). Still missing: EssayAnalysis.provider (store.ts:291) has no reader on the TV or phone, and /api/texts GET noticed/notice (texts/route.ts:40) is not read by the shelf or phone (the phone reads only the 428 error body, page.tsx:296,326), and the row's acceptance (draw them or stop computing them) is not met for these. Still missing: provider is still drawn nowhere, and /api/texts GET noticed/notice has no reader (the shelf does not say whether the notice is accepted). | 176f04f0 (narrows) |
| L1-daniel-15-EM3-5 No verdict lands until the last paragraph is read (C3 second clause fails by de… (major) | recurs → L1-daniel-15-EM3-5 | cited lines re-found at 6b189791 (rules/essay.ts moved): decideVerdicts still runs only when para === of - 1 (desk/essay.ts:204, :236), the wait line is pieceReadingLine 'Reading paragraph k of N.' (rules/essay.ts:607-610), and EssayTV.tsx:415 still shows 'Being read'. No provisional verdicts and no plain statement that verdicts come when the whole piece is read. | none |

## New findings

None.

## Notes

- Evidence check at 6b189791: every cited line was re-mapped through `git diff -U0 b7fca776 6b189791` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
