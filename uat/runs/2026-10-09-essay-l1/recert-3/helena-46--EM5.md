# helena-46 × EM5 · My writing, kept and known (recert-3)

- Character: helena-46
- Journey: EM5
- Cert level: L1 re-walk, code only, no model
- Head 00f5db95
- Recertifies: 2026-10-09-essay-l1/recert-2 at 90e032f2
- **Verdict now: L1-fail.** 0 fixed, 10 recur; 10 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-helena-46-EM5-1 Reading a kept email puts every sentence on the TV and its first words on the l… (major) | recurs → L1-helena-46-EM5-1 | desk/src/essay/EssayTV.tsx:424 — sentence text on the forensic page / desk/src/essay/EssayTV.tsx:257-258, :280 — opening words on the lens home / desk/src/essay/EssayTV.tsx:490 — table row text / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |
| L1-helena-46-EM5-2 Emails can grow the wrong twin: phone-kept pieces are always 'essay', /drop def… (major) | recurs → L1-helena-46-EM5-2 | desk/src/app/api/analyse/route.ts:18, :115 — body.format accepted and passed / desk/src/app/phone/page.tsx:280 — the piece call sends no format / desk/src/app/drop/page.tsx:23 — useState("message") / desk/src/app/phone/EssayShelf.tsx:10, :44 — ShelfCard has format but the shelf shows none / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |
| L1-helena-46-EM5-3 'Never keeps what other people wrote to you' is false: quoted replies and her c… (major) | recurs → L1-helena-46-EM5-3 | desk/src/app/drop/page.tsx:91 — the claim / desk/src/essay/Workroom.tsx:47 — "never what you wrote for someone else" / desk/src/lib/twin/card.ts:48 — exemplars verbatim, cutAt / desk/src/lib/rules/style.ts: no quote or "wrote:" handling (grep: 0 hits) / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |
| L1-helena-46-EM5-4 After the first reading, no remote path leads back to the Workroom (major) | recurs → L1-helena-46-EM5-4 | desk/src/tv/keys.ts:290-292 — forensic first, Workroom only otherwise / desk/src/tv/keys.ts:431-432 — lens home Menu -> playbook, Back -> landing / desk/src/tv/keys.ts:459 — forensic Back -> essaytype / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |
| L1-helena-46-EM5-5 A kept piece can be read only from the phone; the PC page cannot ask for a read… (major) | recurs → L1-helena-46-EM5-5 | desk/src/app/drop/page.tsx:79-102 — keep, shelf, twin; no read / desk/src/tv/keys.ts:453 — Select only at "lenses" / desk/src/app/phone/page.tsx:718 — piece read only if paras.length > 1 / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |
| L1-helena-46-EM5-6 On /drop the notice's 'Read without keeping' reads nothing, and the empty shelf… (minor) | recurs → L1-helena-46-EM5-6 | desk/src/app/drop/page.tsx:86 — TextNotice with no mode / desk/src/app/phone/EssayShelf.tsx:61 — "Read without keeping" / desk/src/app/phone/EssayShelf.tsx:44 — empty shelf text / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |
| L1-helena-46-EM5-7 Leaving a piece out of the exemplars still lets its text shape the dims and cou… (polish) | recurs → L1-helena-46-EM5-7 | desk/src/lib/twin/card.ts:46-48 — born and dims over all pieces, exclusion on exemplars / desk/src/app/drop/page.tsx:96 — the promise / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |
| L1-helena-46-EM5-8 A piece kept from the phone cannot be named, so the Workroom and shelf show its… (major) | recurs → L1-helena-46-EM5-8 | desk/src/app/phone/page.tsx:280 — piece call sends text, type, keep, pieceId, source; no title / desk/src/app/api/analyse/route.ts:115 — addPiece without title / desk/src/lib/session/texts.ts:89-97 — titleOf gives only Untitled <format> <n> / desk/src/app/drop/page.tsx:81 — only the PC page has a title field / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |
| L1-helena-46-EM5-9 The Workroom and the twin portrait are served to Family-mode and under-18 profi… (major) | recurs → L1-helena-46-EM5-9 | desk/src/app/api/twin/route.ts:20-24 — adult computed, not a gate / desk/src/app/api/twin/route.ts:30, :33 — Workroom opened/set for any mode / desk/src/app/api/twin/route.ts:36-37 — adult only echoed in the reply / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |
| L1-helena-46-EM5-10 .docx text: table cells become separate paragraphs and a non-breaking hyphen is… (polish) | recurs → L1-helena-46-EM5-10 | desk/src/lib/rules/docx.ts:59 — only w:tab, w:br, w:t handled; no noBreakHyphen / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |

## New findings

None.

## Notes

- Evidence check at 00f5db95: every cited line was re-mapped through `git diff -U0 90e032f2 00f5db95` (a cite inside a changed hunk is re-read by hand); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
