# barbora-43 × EM1 · What does my paragraph do? (recert-3)

- Character: barbora-43
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 00f5db95
- Recertifies: 2026-10-09-essay-l1/recert-2 at 90e032f2
- **Verdict now: L1-conditional.** 1 fixed, 4 recur; 4 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-barbora-43-EM1-1 Notes on strong and neutral sentences have no code guard against a supplied sen… (major) | **fixed** | f3b8e4b1: every note passes guardNote(suppliesSentence) in decideVerdicts (rules/essay.ts:272-283, :484); a strong or neutral note that holds a 4-word run of any learner sentence, or a complete declarative that names nothing of the writing outside a quoted frame, falls back to the check's line or to none. Executed (scratch e1.cjs): "Write: Walking makes children happier than going by car." (a copy), "Research by the city council shows walking raises pupils test scores." and "Children who walk to school arrive more awake and learn better." (new content) all supply a sentence -> fallback; "Good: you backed the claim with a number.", "This claim is an opinion; a reader cannot check it yet." and a quoted frame ("Try: \"A survey found that [number] of pupils walk.\"") pass. L1 part only: how often the real model supplies a sentence stays L2's count (l2_priority unchanged). Side effect: a note that quotes 4+ of her own words for a good reason is dropped as well. | f3b8e4b1 |
| L1-barbora-43-EM1-2 The x-ray shows a hand-in-ready model paragraph on the topic of the phone's own… (major) | recurs → L1-barbora-43-EM1-1 | desk/src/essay/EssayTV.tsx:540-544 — XRAY three sentences on teenage sleep / desk/src/app/phone/page.tsx:59 — FRESH_PARAS sample on tiredness and early school / desk/src/lib/session/store.ts:565 — seeded task 'Later school starts — first draft' / recert-3 @00f5db95: cited lines re-found at 00f5db95; store.ts changed since 90e032f2 (fd9f5ca5) but not at the cited lines | none |
| L1-barbora-43-EM1-3 ES-READ grounding 3/8: the reading never sees the assignment, her earlier readi… (major) | recurs → L1-barbora-43-EM1-2 | desk/src/lib/desk/essay.ts:86-90 — system prompt without task or history / desk/src/lib/desk/essay.ts:137,157 — signatures take text, type, learner, age / desk/src/app/api/analyse/route.ts:128,151 — the calls / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |
| L1-barbora-43-EM1-4 The Language lens falls back to the Paragraph structure move when the model's f… (minor) | recurs → L1-barbora-43-EM1-3 | desk/src/lib/library/lessons.data.ts:41 — language lesson: "para" / desk/src/essay/EssayTV.tsx:310-314 — teaching() falls back to playFor(type) / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |
| L1-barbora-43-EM1-5 The phone's paragraph box is prefilled with a sample, and reading it files a re… (minor) | recurs (fix in flight) → L1-barbora-43-EM1-4 | Recurs at 00f5db95: the phone paragraph box is still prefilled (phone/page.tsx:59,82) and Analyse on the untouched sample still files a history line, a lens attempt and a digest entry for the seated learner (lib/desk/essay.ts record()). Fix in flight: a placeholder sample; not on this HEAD. | none |

## New findings

None.

## Notes

- Evidence check at 00f5db95: every cited line was re-mapped through `git diff -U0 90e032f2 00f5db95` (a cite inside a changed hunk is re-read by hand); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
