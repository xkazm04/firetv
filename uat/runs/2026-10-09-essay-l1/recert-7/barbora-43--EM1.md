# barbora-43 × EM1 ·  (recert-7)

- Character: barbora-43
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 5096c0ce
- Recertifies: 2026-10-09-essay-l1/recert-6 at 46db00cc
- **Verdict now: L1-conditional.** 2 recur; 2 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-barbora-43-EM1-1 The x-ray shows a hand-in-ready model paragraph on the topic of the phone's ow… (major) | recurs → L1-barbora-43-EM1-1 | cited lines re-found at 5096c0ce; phone/page.tsx changed since 46db00cc (01327bbe, 9a4b8d43) but not at the cited lines; essay/EssayTV.tsx changed since 46db00cc (70b7d68d, 6009739d) and the cite moved with it (same line content); no commit since 46db00cc touched session/store.ts | none |
| L1-barbora-43-EM1-2 ES-READ grounding: the reading still never sees her earlier readings or notes,… (major) | recurs → L1-barbora-43-EM1-2 | cited lines re-found at 5096c0ce; desk/essay.ts changed since 46db00cc (6009739d) and the cite moved with it (same line content); the phone/page.tsx cite (:291 -> :293) sits in a changed hunk (9a4b8d43: the piece call now spreads an optional title) and was re-read by hand: it still posts text, type, keep, pieceId, source and the format, and no task; the paragraph call (:320) posts none either, and taskOf (analyse/route.ts:53) reads a body.task that no client sends | none |

## New findings

None.

## Notes

- Evidence check at 5096c0ce: every cited line was re-mapped through `git diff -U0 46db00cc 5096c0ce` per file (a cite inside a changed hunk is re-read by hand; shifted cites were compared line for line with the old content); commits that changed a file a row cites are named in the row. Rows a commit claims to close were executed in scratch repros outside the repo and pinned by the repo's own narrowed suites. Model-dependent behaviour stays with L2.
