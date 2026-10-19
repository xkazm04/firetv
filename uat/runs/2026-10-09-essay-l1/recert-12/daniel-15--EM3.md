# daniel-15 × EM3 · (recert-12)

- Character: daniel-15
- Journey: EM3
- Cert level: L1 re-walk, code only, no model
- Head ee7d6ac7
- Recertifies: 2026-10-09-essay-l1/recert-11 at ffa91a49
- **Verdict now: L1-conditional.** 0 fixed, 5 recur; 5 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-daniel-15-EM3-1 The paste box and the shelf are hidden whenever the TV is on the forensic page,… (major) | recurs → L1-daniel-15-EM3-1 | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: the paste box and shelf still render only when !onSentence && !onPlan (desk/src/app/phone/page.tsx:836); onSentence is set while the TV is on forensic with a reading (:262); Select on Essay Master still reopens forensic when ownReading (desk/src/tv/keys.ts:360 openWaiting). panelFor (desk/src/app/phone/panelFor.ts) now follows the ask id, but the Essay panel it picks is the same paste screen whose body is the rewrite panel on forensic. Cites re-mapped through git diff -U0 ffa91a49 ee7d6ac7 per file; keys.ts:308 -> 360, :300 -> 352. None of the 43 commits since ffa91a49 changes what this row cites except as named. | none |
| L1-daniel-15-EM3-2 A title line is read as its own paragraph or fuses into sentence 1; the task ne… (major) | recurs → L1-daniel-15-EM3-2 | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: paragraphsOf (desk/src/lib/rules/essay.ts:86, :103) still reads a title line as its own paragraph or fuses it into sentence 1; the phone sends no task (desk/src/app/phone/page.tsx:316), the TV shows no title (EssayTV.tsx), and a question line followed by a paragraph stays a paragraph by design. Cites re-mapped through git diff -U0 ffa91a49 ee7d6ac7 per file; phone/page.tsx:293 -> 316. None of the 43 commits since ffa91a49 changes what this row cites except as named. | none |
| L1-daniel-15-EM3-3 Nothing says grammar and spelling are not checked; 'Well done' lands on sentenc… (minor) | recurs → L1-daniel-15-EM3-3 | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: the strong note still reads "Well done" (desk/src/essay/EssayTV.tsx:426) and no caption says grammar and spelling are not checked; the faulty-note tables ADULT_CHECKS (desk/src/lib/rules/essay.ts:459) and YOUNG_CHECKS (:472) do not mention grammar or spelling. Cites re-mapped through git diff -U0 ffa91a49 ee7d6ac7 per file; EssayTV.tsx:419-420 -> 425-426, essay.ts:456 -> 459. None of the 43 commits since ffa91a49 changes what this row cites except as named. | none |
| L1-daniel-15-EM3-4 Present-and-correct-but-unwired: provider, stats.words, stats.links; /api/texts… (minor) | recurs → L1-daniel-15-EM3-4 | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: narrowed by a3db5db2: the /api/texts half is closed (desk/src/app/phone/EssayShelf.tsx:18, :22, :42 read noticed and notice and draw the notice line until accepted; tools/essay-piece-test.cjs 50/0), and stats.words and stats.links are drawn (desk/src/essay/EssayTV.tsx:484 figs). Still missing: `provider` is computed in desk/src/lib/desk/essay.ts (:124, :135, :169, :194, :239, :294) and returned to the client, and a search of desk/src/essay, desk/src/app/phone and desk/src/tv finds no reader. The acceptance (draw every computed field, or stop computing it) is not met for that one field. Cites re-mapped through git diff -U0 ffa91a49 ee7d6ac7 per file; EssayTV.tsx:477 -> 483. None of the 43 commits since ffa91a49 changes what this row cites except as named. | a3db5db2 |
| L1-daniel-15-EM3-5 No verdict lands until the last paragraph is read (C3 second clause fails by de… (major) | recurs → L1-daniel-15-EM3-5 | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: decideVerdicts still runs only after the last paragraph is read (desk/src/lib/desk/essay.ts:204 para === of - 1, :236), the wait line is pieceReadingLine "Reading paragraph k of N." (desk/src/lib/rules/essay.ts:637), and EssayTV.tsx:421-422 still shows "Being read / The desk has not read this paragraph yet." No provisional verdict is drawn. Cites re-mapped through git diff -U0 ffa91a49 ee7d6ac7 per file; EssayTV.tsx:415-416 -> 421-422, essay.ts:607 -> 637. None of the 43 commits since ffa91a49 changes what this row cites except as named. | none |

## New findings

None.

## Notes

- Evidence check at ee7d6ac7: every cited line was re-mapped through `git diff -U0 ffa91a49 ee7d6ac7` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
