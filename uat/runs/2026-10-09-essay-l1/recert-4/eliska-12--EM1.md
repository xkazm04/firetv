# eliska-12 × EM1 ·  (recert-4)

- Character: eliska-12
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 67581c54
- Recertifies: 2026-10-09-essay-l1/recert-3 at 00f5db95
- **Verdict now: L1-conditional.** 1 fixed, 5 recur; 6 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-eliska-12-EM1-1 The pattern guard admits a new-content sentence with one slot (looser than the p… (major) | **fixed** (not-seen) | a52b4347 closes the pattern half: the two repros of the recert-3 insight now fail. Executed at 67581c54 (scratch r2.cjs): 'A survey found that [number] of children walk.' -> refused (addsContent: subject 'a survey' before the finite verb 'found'); 'Research by [source] shows that [claim].' -> refused ('research' before 'shows'); a frame made of a neighbour's words ('Schools start early in the [time]') -> refused when the whole paragraph is passed and kept with the faulty sentence alone, which decideVerdicts no longer does (:511). If L2 shows a frame with an open-class verb on screen it is a ghostwriting blocker (see the new row). | a52b4347 |
| L1-eliska-12-EM1-2 Every faulty note is a code line not in the young voice: 'asserts', 'checkable';… (major) | recurs → L1-eliska-12-EM1-1 | cited lines re-found at 67581c54; essay.ts changed since 00f5db95 (a52b4347) and the cite moved with it (same line content) | none |
| L1-eliska-12-EM1-3 The forensic crumb, 'Its job' and the table show the regex first-pass role, whic… (minor) | recurs → L1-eliska-12-EM1-2 | cited lines re-found at 67581c54; essay.ts changed since 00f5db95 (a52b4347) but not at the cited lines | none |
| L1-eliska-12-EM1-4 stats.links (PEEL's L) and stats.words are computed for every reading and shown… (polish) | recurs → L1-eliska-12-EM1-3 | cited lines re-found at 67581c54; essay.ts changed since 00f5db95 (a52b4347) but not at the cited lines | none |
| L1-eliska-12-EM1-5 The planted-claim fix depends on the model naming links (supports / backs): when… (major) | recurs → L1-eliska-12-EM1-4 | cited lines re-found at 67581c54; essay.ts changed since 00f5db95 (a52b4347) and the cite moved with it (same line content) | none |
| L1-eliska-12-EM1-6 PEEL's Explain is still marked faulty when it has no connector or linker opener:… (minor) | recurs → L1-eliska-12-EM1-5 | cited lines re-found at 67581c54; essay.ts changed since 00f5db95 (a52b4347) and the cite moved with it (same line content) | none |

## New findings

- **L1-eliska-12-EM1-6** (minor · rank 6): cleanFix's content check is a closed list of verbs: a frame with any other verb ('Teenagers sleep [how many] hours.') still states content and is kept — a52b4347 refuses a frame whose literal words hold a subject and a finite verb (addsContent), but FINITE is a list (rules/essay.ts:264). Executed at 67581c54 (scratch r3.cjs): 'Teenagers sleep [how many] hours.' and 'Councils ban cars outside schools [where].' are kept as the pattern for a faulty sentence; 'Schools start early in the [time]' (a neighbour's words) is refused. Whether the real model produces such a frame is L2: any one on screen is a ghostwriting blocker.

## Notes

- Evidence check at 67581c54: every cited line was re-mapped through `git diff -U0 00f5db95 67581c54` (a cite inside a changed hunk is re-read by hand; all shifted cites were compared line for line with the old content, 77 of 77 identical); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
