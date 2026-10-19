# eliska-12 × EM1 ·  (recert-7)

- Character: eliska-12
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 5096c0ce
- Recertifies: 2026-10-09-essay-l1/recert-6 at 46db00cc
- **Verdict now: L1-conditional.** 6 recur; 6 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-eliska-12-EM1-1 Every faulty note is a code line not in the young voice: 'asserts', 'checkable… (major) | recurs → L1-eliska-12-EM1-1 | cited lines re-found at 5096c0ce; rules/essay.ts changed since 46db00cc (70b7d68d) and the cite moved with it (same line content) | none |
| L1-eliska-12-EM1-2 The forensic crumb, 'Its job' and the table show the regex first-pass role, wh… (minor) | recurs → L1-eliska-12-EM1-2 | cited lines re-found at 5096c0ce; rules/essay.ts changed since 46db00cc (70b7d68d) but not at the cited lines; the EssayTV.tsx cite (:423) sits in a changed hunk (70b7d68d: the crumb now prints "· {place} · {sn.role}") and was re-read by hand: the regex first-pass role is still printed in the crumb, and the "Its job" line (:433) and the table (:492) are as they were | none |
| L1-eliska-12-EM1-3 stats.links (PEEL's L) and stats.words are computed for every reading and show… (polish) | recurs → L1-eliska-12-EM1-3 | cited lines re-found at 5096c0ce; essay/EssayTV.tsx changed since 46db00cc (70b7d68d, 6009739d) and the cite moved with it (same line content); rules/essay.ts changed since 46db00cc (70b7d68d) but not at the cited lines | none |
| L1-eliska-12-EM1-4 The planted-claim fix depends on the model naming links (supports / backs): wh… (major) | recurs → L1-eliska-12-EM1-4 | cited lines re-found at 5096c0ce; desk/essay.ts changed since 46db00cc (6009739d) but not at the cited lines; rules/essay.ts changed since 46db00cc (70b7d68d) but not at the cited lines | none |
| L1-eliska-12-EM1-5 PEEL's Explain is still marked faulty when it has no connector or linker opene… (minor) | recurs → L1-eliska-12-EM1-5 | cited lines re-found at 5096c0ce; rules/essay.ts changed since 46db00cc (70b7d68d) but not at the cited lines | none |
| L1-eliska-12-EM1-6 cleanFix's content check is a closed list of verbs: a frame with any other ver… (minor) | recurs → L1-eliska-12-EM1-6 | cited lines re-found at 5096c0ce; rules/essay.ts changed since 46db00cc (70b7d68d) but not at the cited lines | none |

## New findings

None.

## Notes

- Evidence check at 5096c0ce: every cited line was re-mapped through `git diff -U0 46db00cc 5096c0ce` per file (a cite inside a changed hunk is re-read by hand; shifted cites were compared line for line with the old content); commits that changed a file a row cites are named in the row. Rows a commit claims to close were executed in scratch repros outside the repo and pinned by the repo's own narrowed suites. Model-dependent behaviour stays with L2.
