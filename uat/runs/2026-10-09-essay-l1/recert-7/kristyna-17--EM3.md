# kristyna-17 × EM3 ·  (recert-7)

- Character: kristyna-17
- Journey: EM3
- Cert level: L1 re-walk, code only, no model
- Head 5096c0ce
- Recertifies: 2026-10-09-essay-l1/recert-6 at 46db00cc
- **Verdict now: L1-conditional.** 2 fixed, 2 recur; 2 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-kristyna-17-EM3-1 The forensic page never names the paragraph; 'Start with paragraph p, sentence… (major) | fixed | 70b7d68d: the forensic page names the paragraph and where to start. The crumb reads "Paragraph p of P · Sentence n of N" for a piece (forensicPlace rules/essay.ts:563, EssayTV.tsx:423) and the line under it is "Start with paragraph p, sentence n: the earliest to fix." (forensicLead :572, EssayTV.tsx:424), so the answer to "which paragraph first" is on the page she is moved to and says what "start" means; the lens home and the landing keep summaryLine (:541, "Start with paragraph p, sentence n"). Executed at 5096c0ce (scratch repro.cjs, engine stubbed): a 3-paragraph piece ruled faulty at sentences 3 and 4 -> crumb "Paragraph 2 of 3 · Sentence 3 of 4", lead "Start with paragraph 2, sentence 3: the earliest to fix."; a single paragraph -> "Sentence 2 of 2" and "Start with sentence 2: the earliest to fix.". Pinned by tools/essay-rules-test.cjs ('EM3-1'). (70b7d68d) | 70b7d68d |
| L1-kristyna-17-EM3-2 A plain title line becomes paragraph 1 of the piece, costs a model call, and c… (minor) | recurs → L1-kristyna-17-EM3-1 | cited lines re-found at 5096c0ce; desk/essay.ts changed since 46db00cc (6009739d) and the cite moved with it (same line content); rules/essay.ts changed since 46db00cc (70b7d68d) but not at the cited lines | none |
| L1-kristyna-17-EM3-3 While the first paragraph of a first piece is read, the TV says 'The desk is r… (minor) | fixed | 70b7d68d: the waiting caption reads the running job, not the previous reading. EssayTV.tsx:146 asks readingAPiece(a?.piece, job.start) (rules/essay.ts:558: a piece on the desk still being read, or a start line beginning "reading your piece"), and the route's piece run starts with "reading your piece, N paragraphs — <lens> lens…" (analyse/route.ts:79), so the first paragraph of a first piece, with no piece on screen yet, says "The desk is reading your piece, a paragraph at a time. Each one lands here." (captions.ts READING_PIECE). Executed at 5096c0ce (scratch repro.cjs): readingAPiece(undefined, "reading your piece, 3 paragraphs — structure lens…") -> true; with "reading your paragraph — structure lens…" -> false; with no start -> false. Pinned by tools/essay-rules-test.cjs ('EM3-3'). (70b7d68d) | 70b7d68d |
| L1-kristyna-17-EM3-4 GET /api/texts returns noticed and notice that no screen reads (minor) | recurs → L1-kristyna-17-EM3-2 | cited lines re-found at 5096c0ce; no commit since 46db00cc touched the cited files | none |

## New findings

None.

## Notes

- Evidence check at 5096c0ce: every cited line was re-mapped through `git diff -U0 46db00cc 5096c0ce` per file (a cite inside a changed hunk is re-read by hand; shifted cites were compared line for line with the old content); commits that changed a file a row cites are named in the row. Rows a commit claims to close were executed in scratch repros outside the repo and pinned by the repo's own narrowed suites. Model-dependent behaviour stays with L2.
