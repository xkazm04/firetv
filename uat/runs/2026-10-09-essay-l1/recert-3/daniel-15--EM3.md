# daniel-15 × EM3 · The whole essay (recert-3)

- Character: daniel-15
- Journey: EM3
- Cert level: L1 re-walk, code only, no model
- Head 00f5db95
- Recertifies: 2026-10-09-essay-l1/recert-2 at 90e032f2
- **Verdict now: L1-conditional.** 0 fixed, 10 recur; 10 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-daniel-15-EM3-1 The Essay box is pre-filled with a sample paragraph; a paste at the cursor fuse… (major) | recurs (fix in flight) → L1-daniel-15-EM3-1 | Recurs at 00f5db95: FRESH_PARAS is still the initial state of the Essay box (phone/page.tsx:59,82), so a paste at the cursor still fuses into the sample (:269 paragraphsOf(before + pasted + after)). Fix in flight: the parallel run makes the sample a placeholder; it is not on this HEAD, so the row stays open until it lands. | none |
| L1-daniel-15-EM3-2 After a whole-piece read the phone offers 'Next paragraph (2 of 5)', which lead… (major) | recurs → L1-daniel-15-EM3-2 | desk/src/app/phone/page.tsx:697 — Next paragraph / desk/src/app/phone/page.tsx:326 — nextFromRewrite / desk/src/app/phone/page.tsx:722 — This paragraph only / desk/src/lib/session/store.ts:781-782 — essay.set replaces / recert-3 @00f5db95: cited lines re-found at 00f5db95; store.ts changed since 90e032f2 (fd9f5ca5) but not at the cited lines | none |
| L1-daniel-15-EM3-3 Pasting the revised essay makes a second 'Untitled essay', not a version (C6) (major) | recurs → L1-daniel-15-EM3-3 | desk/src/app/phone/page.tsx:271 — setPieceId(undefined) on paste / desk/src/app/api/analyse/route.ts:115 — addPiece unless pieceId / desk/src/lib/session/texts.ts:89-95 — titleOf: only '# heading', else 'Untitled <format> <n>' / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |
| L1-daniel-15-EM3-4 The forensic page he is moved to shows neither 'paragraph k of n' nor the summa… (major) | recurs → L1-daniel-15-EM3-4 | desk/src/essay/EssayTV.tsx:423 — crumb Sentence n of N / desk/src/essay/EssayTV.tsx:279 — reading k of n only on Last piece card / desk/src/essay/EssayTV.tsx:150 — summary only at last stop / desk/src/tv/landingRows.ts:149 — firstSentence(summaryLine) / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |
| L1-daniel-15-EM3-5 The paste box and the shelf are hidden whenever the TV is on the forensic page,… (major) | recurs → L1-daniel-15-EM3-5 | desk/src/app/phone/page.tsx:705 — panel only when !onSentence && !onPlan / desk/src/app/phone/page.tsx:231 — onSentence = forensic page with a reading / desk/src/tv/keys.ts:290 — Select on Essay reopens forensic / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |
| L1-daniel-15-EM3-6 A title line is read as its own paragraph or fuses into sentence 1; the task ne… (major) | recurs → L1-daniel-15-EM3-6 | desk/src/lib/rules/essay.ts:91 — only # headings / desk/src/lib/desk/essay.ts:170-175 — one call per paragraph, title included / recert-3 @00f5db95: cited lines re-found at 00f5db95; essay.ts changed since 90e032f2 (f3b8e4b1, b6f0acb7, 2d3526b3) but not at the cited lines | none |
| L1-daniel-15-EM3-7 Nothing says grammar and spelling are not checked; 'Well done' lands on sentenc… (minor) | recurs → L1-daniel-15-EM3-7 | desk/src/essay/EssayTV.tsx:419 — 'Well done · This sentence does its job.' / desk/src/lib/rules/essay.ts:212-217 — the check lines name no grammar scope / recert-3 @00f5db95: cited lines re-found at 00f5db95; essay.ts changed since 90e032f2 (f3b8e4b1, b6f0acb7, 2d3526b3) but not at the cited lines | none |
| L1-daniel-15-EM3-8 Deleting the open piece leaves the phone pointing at it; the next Read with Kee… (minor) | recurs → L1-daniel-15-EM3-8 | desk/src/app/phone/EssayShelf.tsx:30-34 — remove reloads the list only / desk/src/app/phone/page.tsx:97,280 — pieceId stays and is sent / desk/src/lib/session/texts.ts:123 — 404 / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |
| L1-daniel-15-EM3-9 Present-and-correct-but-unwired: provider, stats.words, stats.links; /api/texts… (minor) | recurs → L1-daniel-15-EM3-9 | desk/src/app/api/texts/route.ts:6-7 — notice fields / desk/src/lib/rules/essay.ts:200-210 — words, links computed / desk/src/essay/EssayTV.tsx:476 — figs omit words and links / recert-3 @00f5db95: cited lines re-found at 00f5db95; essay.ts changed since 90e032f2 (f3b8e4b1, b6f0acb7, 2d3526b3) but not at the cited lines | none |
| L1-daniel-15-EM3-10 No verdict lands until the last paragraph is read (C3 second clause fails by de… (major) | recurs → L1-daniel-15-EM3-10 | desk/src/lib/desk/essay.ts:176 — decideVerdicts only when para === of - 1 / desk/src/lib/rules/essay.ts:501-506 — pieceReadingLine / desk/src/essay/EssayTV.tsx:415 — 'Being read' / recert-3 @00f5db95: cited lines re-found at 00f5db95; essay.ts changed since 90e032f2 (f3b8e4b1, b6f0acb7, 2d3526b3) but not at the cited lines | none |

## New findings

None.

## Notes

- Evidence check at 00f5db95: every cited line was re-mapped through `git diff -U0 90e032f2 00f5db95` (a cite inside a changed hunk is re-read by hand); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
