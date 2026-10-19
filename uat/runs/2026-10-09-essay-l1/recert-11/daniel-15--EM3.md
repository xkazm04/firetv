# daniel-15 × EM3 · (recert-11)

- Character: daniel-15
- Journey: EM3
- Cert level: L1 re-walk, code only, no model
- Head ffa91a49
- Recertifies: 2026-10-09-essay-l1/recert-10 at 6b189791
- **Verdict now: L1-conditional.** 0 fixed, 5 recur; 5 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-daniel-15-EM3-1 The paste box and the shelf are hidden whenever the TV is on the forensic page, and Essay… (major) | recurs → L1-daniel-15-EM3-1 | Re-walked at ffa91a49; what the previous walk found (at 6b189791) still holds: cited lines re-found at 6b189791: the paste box and shelf still render only when !onSentence && !onPlan (page.tsx:724); onSentence is set while forensic has a reading (:239); Select on Essay still reopens forensic when ownReading (keys.ts:300 openWaiting). 32ffdf92 only changed Next sentence. At ffa91a49 the cited lines of changed files sit at tv/keys.ts:300->308 (hunks re-read: they only add the lines named in the commit messages). None of the seven commits since 6b189791 (b75bd45f curtain on a kept piece, 61a8e2ee young voice, ffa91a49 Czech shape; 56f903ae, da6f9f07, 3240d025, e9c5ee8f are Math) changes what this row cites. | none |
| L1-daniel-15-EM3-2 A title line is read as its own paragraph or fuses into sentence 1; the task never reache… (major) | recurs → L1-daniel-15-EM3-2 | Re-walked at ffa91a49; what the previous walk found (at 6b189791) still holds: narrowed by cae23442; still missing: The title is not shown as a title anywhere, is not passed to the reading prompt as the task, and a question line followed by a paragraph still stays a paragraph (by design). At ffa91a49 the cited lines of changed files sit at lib/rules/essay.ts:103->104, lib/rules/essay.ts:86->87 (hunks re-read: they only add the lines named in the commit messages). None of the seven commits since 6b189791 (b75bd45f curtain on a kept piece, 61a8e2ee young voice, ffa91a49 Czech shape; 56f903ae, da6f9f07, 3240d025, e9c5ee8f are Math) changes what this row cites. | none |
| L1-daniel-15-EM3-3 Nothing says grammar and spelling are not checked; 'Well done' lands on sentences with er… (minor) | recurs → L1-daniel-15-EM3-3 | Unchanged: the strong note still reads 'Well done' (EssayTV.tsx:420) and no line says grammar and spelling are not checked; the faulty-note table is now ADULT_CHECKS/YOUNG_CHECKS (rules/essay.ts:456, :469), neither mentions grammar or spelling. | none |
| L1-daniel-15-EM3-4 Present-and-correct-but-unwired: provider, stats.words, stats.links; /api/texts noticed a… (minor) | recurs → L1-daniel-15-EM3-4 | Re-walked at ffa91a49; what the previous walk found (at 6b189791) still holds: narrowed by 176f04f0; still missing: provider is still drawn nowhere, and /api/texts GET noticed/notice has no reader (the shelf does not say whether the notice is accepted). At ffa91a49 the cited lines of changed files sit at essay/EssayTV.tsx:477->478, lib/rules/essay.ts:280->292 (hunks re-read: they only add the lines named in the commit messages). None of the seven commits since 6b189791 (b75bd45f curtain on a kept piece, 61a8e2ee young voice, ffa91a49 Czech shape; 56f903ae, da6f9f07, 3240d025, e9c5ee8f are Math) changes what this row cites. | none |
| L1-daniel-15-EM3-5 No verdict lands until the last paragraph is read (C3 second clause fails by design) (major) | recurs → L1-daniel-15-EM3-5 | Re-walked at ffa91a49; what the previous walk found (at 6b189791) still holds: cited lines re-found at 6b189791 (rules/essay.ts moved): decideVerdicts still runs only when para === of - 1 (desk/essay.ts:204, :236), the wait line is pieceReadingLine 'Reading paragraph k of N.' (rules/essay.ts:607-610), and EssayTV.tsx:415 still shows 'Being read'. No provisional verdicts and no plain statement that verdicts come when the whole piece is read. At ffa91a49 the cited lines of changed files sit at lib/rules/essay.ts:607->633, essay/EssayTV.tsx:415->416 (hunks re-read: they only add the lines named in the commit messages). None of the seven commits since 6b189791 (b75bd45f curtain on a kept piece, 61a8e2ee young voice, ffa91a49 Czech shape; 56f903ae, da6f9f07, 3240d025, e9c5ee8f are Math) changes what this row cites. | none |

## New findings

None.

## Notes

- Evidence check at ffa91a49: every cited line was re-mapped through `git diff -U0 6b189791 ffa91a49` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
