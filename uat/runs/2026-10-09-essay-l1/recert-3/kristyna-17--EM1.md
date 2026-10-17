# kristyna-17 × EM1 · What does my paragraph do? (recert-3)

- Character: kristyna-17
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 00f5db95
- Recertifies: 2026-10-09-essay-l1/recert-2 at 90e032f2
- **Verdict now: L1-conditional.** 0 fixed, 7 recur; 7 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-kristyna-17-EM1-1 A Czech paragraph that passes the language check is still ruled on English word… (major) | recurs → L1-kristyna-17-EM1-1 | 2d3526b3 added "that is why" to LINK (:15), still an English word list; the Czech paragraph is still ruled on English lists (EVIDENCE/CONNECTORS/LINK :13-15, CONTRAST, wordIn) — desk/src/lib/rules/essay.ts:13-15 — English EVIDENCE/CONNECTORS/LINK / desk/src/lib/rules/essay.ts:291 — CONTRAST English set | none |
| L1-kristyna-17-EM1-2 ES-READ 3/8: no task, kind, mode, history or memory reach the reading (major) | recurs → L1-kristyna-17-EM1-2 | desk/src/lib/desk/essay.ts:86-104 — system and prompt rows / desk/src/lib/rules/voice.ts:70 — "a 15-year-old" / recert-3 @00f5db95: cited lines re-found at 00f5db95; voice.ts changed since 90e032f2 (00f5db95) but not at the cited lines | none |
| L1-kristyna-17-EM1-3 A Czech paragraph that passes the language check gets notes in whatever languag… (minor) | recurs → L1-kristyna-17-EM1-3 | desk/src/lib/desk/essay.ts:86-96 — no language line / desk/src/lib/rules/essay.ts:341 — English CHECKS line / desk/src/lib/rules/essay.ts:171-177 — the check that lets some Czech through / recert-3 @00f5db95: cited lines re-found at 00f5db95; essay.ts changed since 90e032f2 (f3b8e4b1, b6f0acb7, 2d3526b3) but not at the cited lines | none |
| L1-kristyna-17-EM1-4 The reading prompt calls a 17-year-old 'a 15-year-old' (minor) | recurs → L1-kristyna-17-EM1-4 | desk/src/lib/rules/voice.ts:70 — "a 15-year-old" / desk/src/lib/rules/voice.ts:34-38 — teen band for 14+ / recert-3 @00f5db95: cited lines re-found at 00f5db95; voice.ts changed since 90e032f2 (00f5db95) but not at the cited lines | none |
| L1-kristyna-17-EM1-5 stats.links and stats.words are computed for every reading and shown nowhere (minor) | recurs → L1-kristyna-17-EM1-5 | desk/src/lib/rules/essay.ts:207 — links computed / desk/src/essay/EssayTV.tsx:476 — figs without links / recert-3 @00f5db95: cited lines re-found at 00f5db95; essay.ts changed since 90e032f2 (f3b8e4b1, b6f0acb7, 2d3526b3) but not at the cited lines | none |
| L1-kristyna-17-EM1-6 The language check lets some Czech through: a paragraph whose shared function w… (major) | recurs → L1-kristyna-17-EM1-6 | desk/src/lib/rules/essay.ts:149-153 — ENGLISH_WORDS vs CZECH_WORDS / desk/src/lib/rules/essay.ts:166-177 — floors and rule / desk/src/app/api/analyse/route.ts:146 — pass goes to the model / recert-3 @00f5db95: cited lines re-found at 00f5db95; essay.ts changed since 90e032f2 (f3b8e4b1, b6f0acb7, 2d3526b3) but not at the cited lines | none |
| L1-kristyna-17-EM1-7 Nothing says before the first send that Essay Master reads English; on the plan… (minor) | recurs → L1-kristyna-17-EM1-7 | desk/src/app/phone/page.tsx:705-708 — Essay tab copy, no language / desk/src/tv/profileRows.ts:20 — blurb / desk/src/tv/keys.ts:445 — plan read posted as essay / desk/src/app/api/analyse/route.ts:146 — refusal only at read time / desk/src/lib/rules/essay.ts:723 — planFit / recert-3 @00f5db95: cited lines re-found at 00f5db95; essay.ts changed since 90e032f2 (f3b8e4b1, b6f0acb7, 2d3526b3) but not at the cited lines | none |

## New findings

None.

## Notes

- Evidence check at 00f5db95: every cited line was re-mapped through `git diff -U0 90e032f2 00f5db95` (a cite inside a changed hunk is re-read by hand); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
