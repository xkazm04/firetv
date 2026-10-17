# helena-46 × EM1 · What my paragraph does (recert-3)

- Character: helena-46
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 00f5db95
- Recertifies: 2026-10-09-essay-l1/recert-2 at 90e032f2
- **Verdict now: L1-conditional.** 0 fixed, 7 recur; 7 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-helena-46-EM1-1 The kind of writing never reaches the reading, and the Language lens falls back… (major) | recurs → L1-helena-46-EM1-1 | desk/src/lib/library/lessons.data.ts:41 — language -> para / desk/src/lib/library/lessons.data.ts:51 — Paragraph move and pattern / desk/src/lib/rules/essay.ts:666-671 — taught falls back to the playbook / desk/src/essay/EssayTV.tsx:427 — 'The move · playbook · Paragraph' / desk/src/app/api/analyse/route.ts:15-17 — essay body has no format / recert-3 @00f5db95: cited lines re-found at 00f5db95; essay.ts changed since 90e032f2 (f3b8e4b1, b6f0acb7, 2d3526b3) but not at the cited lines | none |
| L1-helena-46-EM1-2 Adult readings are still prompted for 'a 15-year-old' student; mode never reach… (minor) | recurs → L1-helena-46-EM1-2 | desk/src/lib/rules/voice.ts:70 — essay: a 15-year-old / desk/src/lib/rules/voice.ts:81-85 — voiceOf by age only / desk/src/lib/desk/essay.ts:86 — 'writing tutor for ${voice.who}' / desk/src/lib/desk/essay.ts:90 — 'a student can act on' / desk/src/app/api/analyse/route.ts:50 — learnerAge only / recert-3 @00f5db95: cited lines re-found at 00f5db95; voice.ts changed since 90e032f2 (00f5db95) but not at the cited lines | none |
| L1-helena-46-EM1-3 Adult mode's lens home, plan, playbook and x-ray speak only to school paragraphs (minor) | recurs → L1-helena-46-EM1-3 | desk/src/essay/EssayTV.tsx:151 — 'one paragraph on the phone' / desk/src/essay/EssayTV.tsx:328 — same caption / desk/src/essay/EssayTV.tsx:541 — 'Many students arrive at school exhausted' / desk/src/lib/library/lessons.data.ts:51 — Paragraph playbook entry / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |
| L1-helena-46-EM1-4 Four reading fields are computed and never shown (provider, stats.links, stats.… (minor) | recurs → L1-helena-46-EM1-4 | desk/src/lib/desk/essay.ts:143 — provider on every reading / desk/src/essay/EssayTV.tsx:476 — the figures drawn / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |
| L1-helena-46-EM1-5 The phone refuses a .docx that the PC page accepts (polish) | recurs → L1-helena-46-EM1-5 | desk/src/lib/rules/essay.ts:190 — .txt/.md only / desk/src/app/phone/page.tsx:709 — file label / desk/src/app/drop/page.tsx:48-50 — .docx read / recert-3 @00f5db95: cited lines re-found at 00f5db95; essay.ts changed since 90e032f2 (f3b8e4b1, b6f0acb7, 2d3526b3) but not at the cited lines | none |
| L1-helena-46-EM1-6 A language the desk does not read is refused only when it is clearly Czech; sho… (polish) | recurs → L1-helena-46-EM1-6 | desk/src/lib/rules/essay.ts:171-176 — floors / desk/src/app/api/analyse/route.ts:107, :146 — refusal before any run / recert-3 @00f5db95: cited lines re-found at 00f5db95; essay.ts changed since 90e032f2 (f3b8e4b1, b6f0acb7, 2d3526b3) but not at the cited lines | none |
| L1-helena-46-EM1-7 Open a one-paragraph kept email, change it, 'Analyse on the TV': no new version… (major) | recurs → L1-helena-46-EM1-7 | desk/src/app/phone/page.tsx:297 — the promise / desk/src/app/phone/page.tsx:307 — kind essay, no pieceId / desk/src/app/phone/page.tsx:722 — one-paragraph button is analyseParagraph / desk/src/app/api/analyse/route.ts:145-155 — essay path keeps nothing / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |

## New findings

None.

## Notes

- Evidence check at 00f5db95: every cited line was re-mapped through `git diff -U0 90e032f2 00f5db95` (a cite inside a changed hunk is re-read by hand); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
