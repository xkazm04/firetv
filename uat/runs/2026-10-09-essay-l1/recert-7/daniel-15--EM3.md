# daniel-15 × EM3 ·  (recert-7)

- Character: daniel-15
- Journey: EM3
- Cert level: L1 re-walk, code only, no model
- Head 5096c0ce
- Recertifies: 2026-10-09-essay-l1/recert-6 at 46db00cc
- **Verdict now: L1-conditional.** 1 fixed, 5 recur; 5 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-daniel-15-EM3-1 The forensic page he is moved to shows neither 'paragraph k of n' nor the summ… (major) | fixed | 70b7d68d: the forensic page says where the reader is in the piece. forensicPlace (rules/essay.ts:563) gives the crumb "Paragraph p of P · Sentence n of N" for a piece and "Sentence n of N" for one paragraph (EssayTV.tsx:342 passes it, :423 prints it), and forensicLead (rules/essay.ts:572) puts a line under the crumb (EssayTV.tsx:424, data-role essay-lead): "Reading paragraph k of n." while the piece is read (pieceReadingLine :527), then "Start with paragraph p, sentence n: the earliest to fix." once it is ruled, and nothing when nothing is faulty. The first wait says "piece" (readingAPiece :558, used at EssayTV.tsx:146 on the running job's start line). Executed at 5096c0ce (scratch repro.cjs, outside the repo, engine stubbed): forensicPlace on sentence 3 of a 3-paragraph piece -> "Paragraph 2 of 3 · Sentence 3 of 4", for one paragraph "Sentence 2 of 2"; forensicLead ruled -> "Start with paragraph 2, sentence 3: the earliest to fix.", while read (1 of 3) -> "Reading paragraph 2 of 3.", nothing faulty -> "". Pinned by tools/essay-rules-test.cjs ('EM3-1', 'EM3-3'; 149 of 149 green). Edge left as the suggested acceptance allows: the landing still cuts the summary to its first sentence (landingRows.ts:149), and "start" means the earliest faulty sentence in reading order, which the lead says. (70b7d68d) | 70b7d68d |
| L1-daniel-15-EM3-2 The paste box and the shelf are hidden whenever the TV is on the forensic page… (major) | recurs → L1-daniel-15-EM3-1 | cited lines re-found at 5096c0ce; phone/page.tsx changed since 46db00cc (01327bbe, 9a4b8d43) and the cite moved with it (same line content); tv/keys.ts changed since 46db00cc (95abd6a9, 6009739d, eabdd019) but not at the cited lines | none |
| L1-daniel-15-EM3-3 A title line is read as its own paragraph or fuses into sentence 1; the task n… (major) | recurs → L1-daniel-15-EM3-2 | cited lines re-found at 5096c0ce; desk/essay.ts changed since 46db00cc (6009739d) and the cite moved with it (same line content); rules/essay.ts changed since 46db00cc (70b7d68d) but not at the cited lines | none |
| L1-daniel-15-EM3-4 Nothing says grammar and spelling are not checked; 'Well done' lands on senten… (minor) | recurs → L1-daniel-15-EM3-3 | cited lines re-found at 5096c0ce; essay/EssayTV.tsx changed since 46db00cc (70b7d68d, 6009739d) but not at the cited lines; rules/essay.ts changed since 46db00cc (70b7d68d) but not at the cited lines | none |
| L1-daniel-15-EM3-5 Present-and-correct-but-unwired: provider, stats.words, stats.links; /api/text… (minor) | recurs → L1-daniel-15-EM3-4 | cited lines re-found at 5096c0ce; essay/EssayTV.tsx changed since 46db00cc (70b7d68d, 6009739d) and the cite moved with it (same line content); rules/essay.ts changed since 46db00cc (70b7d68d) but not at the cited lines; no commit since 46db00cc touched api/texts/route.ts | none |
| L1-daniel-15-EM3-6 No verdict lands until the last paragraph is read (C3 second clause fails by d… (major) | recurs → L1-daniel-15-EM3-5 | cited lines re-found at 5096c0ce; essay/EssayTV.tsx changed since 46db00cc (70b7d68d, 6009739d) but not at the cited lines; desk/essay.ts changed since 46db00cc (6009739d) and the cite moved with it (same line content); rules/essay.ts changed since 46db00cc (70b7d68d) but not at the cited lines | none |

## New findings

None.

## Notes

- Evidence check at 5096c0ce: every cited line was re-mapped through `git diff -U0 46db00cc 5096c0ce` per file (a cite inside a changed hunk is re-read by hand; shifted cites were compared line for line with the old content); commits that changed a file a row cites are named in the row. Rows a commit claims to close were executed in scratch repros outside the repo and pinned by the repo's own narrowed suites. Model-dependent behaviour stays with L2.
