# kristyna-17 × EM1 ·  (recert-7)

- Character: kristyna-17
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 5096c0ce
- Recertifies: 2026-10-09-essay-l1/recert-6 at 46db00cc
- **Verdict now: L1-conditional.** 6 recur; 6 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-kristyna-17-EM1-1 A Czech paragraph that passes the language check is still ruled on English wor… (major) | recurs → L1-kristyna-17-EM1-1 | cited lines re-found at 5096c0ce; api/analyse/route.ts changed since 46db00cc (6009739d, 9a4b8d43) and the cite moved with it (same line content); rules/essay.ts changed since 46db00cc (70b7d68d) but not at the cited lines | none |
| L1-kristyna-17-EM1-2 ES-READ: kind and mode now reach the reading, a task has no sender and no hist… (major) | recurs → L1-kristyna-17-EM1-2 | cited lines re-found at 5096c0ce; desk/essay.ts changed since 46db00cc (6009739d) and the cite moved with it (same line content); the phone/page.tsx cite (:291 -> :293) sits in a changed hunk (9a4b8d43: the piece call now spreads an optional title) and was re-read by hand: it still posts text, type, keep, pieceId, source and the format, and no task; the paragraph call (:320) posts none either, and taskOf (analyse/route.ts:53) reads a body.task that no client sends; no commit since 46db00cc touched rules/voice.ts | none |
| L1-kristyna-17-EM1-3 A Czech paragraph that passes the language check gets notes in whatever langua… (minor) | recurs → L1-kristyna-17-EM1-3 | cited lines re-found at 5096c0ce; desk/essay.ts changed since 46db00cc (6009739d) and the cite moved with it (same line content); rules/essay.ts changed since 46db00cc (70b7d68d) but not at the cited lines | none |
| L1-kristyna-17-EM1-4 stats.links and stats.words are computed for every reading and shown nowhere (minor) | recurs → L1-kristyna-17-EM1-4 | cited lines re-found at 5096c0ce; essay/EssayTV.tsx changed since 46db00cc (70b7d68d, 6009739d) and the cite moved with it (same line content); rules/essay.ts changed since 46db00cc (70b7d68d) but not at the cited lines | none |
| L1-kristyna-17-EM1-5 The language check lets some Czech through: a paragraph whose shared function … (major) | recurs → L1-kristyna-17-EM1-5 | cited lines re-found at 5096c0ce; api/analyse/route.ts changed since 46db00cc (6009739d, 9a4b8d43) and the cite moved with it (same line content); rules/essay.ts changed since 46db00cc (70b7d68d) but not at the cited lines | none |
| L1-kristyna-17-EM1-6 Nothing says before the first send that Essay Master reads English; on the pla… (minor) | recurs → L1-kristyna-17-EM1-6 | cited lines re-found at 5096c0ce; api/analyse/route.ts changed since 46db00cc (6009739d, 9a4b8d43) and the cite moved with it (same line content); phone/page.tsx changed since 46db00cc (01327bbe, 9a4b8d43) and the cite moved with it (same line content); rules/essay.ts changed since 46db00cc (70b7d68d) and the cite moved with it (same line content); tv/keys.ts changed since 46db00cc (95abd6a9, 6009739d, eabdd019) and the cite moved with it (same line content); no commit since 46db00cc touched tv/profileRows.ts | none |

## New findings

None.

## Notes

- Evidence check at 5096c0ce: every cited line was re-mapped through `git diff -U0 46db00cc 5096c0ce` per file (a cite inside a changed hunk is re-read by hand; shifted cites were compared line for line with the old content); commits that changed a file a row cites are named in the row. Rows a commit claims to close were executed in scratch repros outside the repo and pinned by the repo's own narrowed suites. Model-dependent behaviour stays with L2.
