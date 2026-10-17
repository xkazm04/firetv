# kristyna-17 × EM3 · Read my whole piece (recert-3)

- Character: kristyna-17
- Journey: EM3
- Cert level: L1 re-walk, code only, no model
- Head 00f5db95
- Recertifies: 2026-10-09-essay-l1/recert-2 at 90e032f2
- **Verdict now: L1-conditional.** 0 fixed, 5 recur; 5 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-kristyna-17-EM3-1 The forensic page never names the paragraph; 'Start with paragraph p, sentence… (major) | recurs → L1-kristyna-17-EM3-1 | desk/src/essay/EssayTV.tsx:423 — crumb / desk/src/essay/EssayTV.tsx:365 — rail label / desk/src/essay/EssayTV.tsx:150 — only place the full summary shows / desk/src/tv/landingRows.ts:86,149 — firstSentence / desk/src/lib/rules/essay.ts:525 — Start with paragraph p / recert-3 @00f5db95: cited lines re-found at 00f5db95; essay.ts changed since 90e032f2 (f3b8e4b1, b6f0acb7, 2d3526b3) but not at the cited lines | none |
| L1-kristyna-17-EM3-2 After Delete the phone keeps the deleted piece's id: the next keep-and-read fai… (minor) | recurs → L1-kristyna-17-EM3-2 | desk/src/app/phone/EssayShelf.tsx:30-34 — remove / desk/src/app/phone/page.tsx:97,280 — pieceId state and send / desk/src/app/api/analyse/route.ts:115 — addVersion with stale id / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |
| L1-kristyna-17-EM3-3 A plain title line becomes paragraph 1 of the piece, costs a model call, and ca… (minor) | recurs → L1-kristyna-17-EM3-3 | desk/src/lib/rules/essay.ts:83-96 — paragraphsOf / desk/src/lib/desk/essay.ts:169-172 — one call per English paragraph / recert-3 @00f5db95: cited lines re-found at 00f5db95; essay.ts changed since 90e032f2 (f3b8e4b1, b6f0acb7, 2d3526b3) but not at the cited lines | none |
| L1-kristyna-17-EM3-4 While the first paragraph of a first piece is read, the TV says 'The desk is re… (minor) | recurs → L1-kristyna-17-EM3-4 | desk/src/essay/EssayTV.tsx:144-146 — caption tests the previous reading / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |
| L1-kristyna-17-EM3-5 GET /api/texts returns noticed and notice that no screen reads (minor) | recurs → L1-kristyna-17-EM3-5 | desk/src/app/api/texts/route.ts:39 — noticed, notice / desk/src/app/phone/EssayShelf.tsx:19 — pieces only / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |

## New findings

None.

## Notes

- Evidence check at 00f5db95: every cited line was re-mapped through `git diff -U0 90e032f2 00f5db95` (a cite inside a changed hunk is re-read by hand); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
