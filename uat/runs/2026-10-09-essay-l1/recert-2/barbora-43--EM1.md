# barbora-43 × EM1 · What does my paragraph do? (recert-2)

- Character: barbora-43 (Barbora, 43, Eliška's mother; watches Eliška's seated profile, age 12, Family)
- Journey: EM1 What does my paragraph do? (watched from the sofa)
- Cert level: L1 re-walk, code only, no model
- Head 90e032f2
- Recertifies: 2026-10-09-essay-l1 at 782afdfb
- **Verdict now: L1-conditional.** No new commit touches the open rows; the two major ghostwriting gaps (unguarded strong/neutral notes, hand-in-ready x-ray) and the grounding gap remain.

## Reachable surface (now)

- As recert-1. Verdict logic gained thesis/conclusion-against-body and PEEL-explain rules (`desk/src/lib/rules/essay.ts:378-391,416-433`); playbook patterns are one-sentence frames (`desk/src/lib/library/lessons.data.ts:52-55`). Note display unchanged (`desk/src/essay/EssayTV.tsx:410-420`).

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| EM1-1 notes unguarded (major) | **recurs** (major) | `rules/essay.ts:320-323,443-444` cleanNote strips a label only; `EssayTV.tsx:416-420` | - |
| EM1-2 x-ray hand-in-ready paragraph (major) | **recurs** (major) | `EssayTV.tsx:540-544`; `page.tsx:59`; `store.ts:564` | - |
| EM1-3 ES-READ grounding (major) | **recurs** (major) | `desk/essay.ts:86-90,137,157`; `route.ts:128,151` | - |
| EM1-4 Language falls back to Paragraph move (minor) | **recurs** (minor) | `lessons.data.ts:41`; `EssayTV.tsx:310-314`; ae2544b5 reshaped patterns only | - |
| EM1-5 (recert-1 md: EM1-6) sample prefilled and filed (minor) | **recurs** (minor) | `page.tsx:59,82,423`; `desk/essay.ts:123,142` | - |

## New findings

None.

## Notes

- Code-only: diffed 782afdfb..HEAD for rules/essay.ts and lessons.data.ts and re-read the cited lines; no model, no scratch run. Whether the model writes a ghostwriting note is L2's count.
- JSON ids follow findings.json (`EM1-5` is the md's EM1-6 sample row; the md's fixed EM1-5 language check is not open).
