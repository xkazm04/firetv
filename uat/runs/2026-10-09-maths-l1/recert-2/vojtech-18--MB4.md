# vojtech-18 × MB4 · From a paper to the desk (recert-2)

- Character: vojtech-18 (18, high school, cz, School maths path)
- Journey: MB4 · From a paper to the desk
- Cert level: L1 re-walk, code only, no model
- Head: 90e032f2
- Recertifies: 2026-10-09-maths-l1 at d4f5042a
- **Verdict now: L1-conditional**. His maturita paper no longer lands on 5.-8. ročník units, but the statement picker, the missing statement on a row and Back from an off-desk row are unchanged.

## Reachable surface (now)

- Recovery: `desk/src/lib/rules/recovery.ts:171-188` (Reader drops a partly linked past-year unit), `readerOf`; `desk/src/tv/paperRows.ts:30-35`; practice aim `desk/src/app/api/practice/route.ts:45`.
- Picker `desk/src/app/phone/PaperPanel.tsx:21-36`; TV list `desk/src/maths/MathsTV.tsx:713-735`; keys `desk/src/tv/keys.ts:534-545`.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-vojtech-18-MB4-1 | fixed | Executed paperView, seated cz/18: [G17 0/4, G20 1/3, A2 3/3] -> no topics, two off-desk rows; [N1 0/3] -> off-desk row; a UK 12-year-old still gets Area | 37425037, 4b82f0a3 |
| L1-vojtech-18-MB4-2 | recurs (major, unchanged) | ~100 English GCSE statements, '(a harder statement)', no Czech (`PaperPanel.tsx:36`, `gcse.ts:78,128`, `MathsTV.tsx:735`) | none |
| L1-vojtech-18-MB4-3 | recurs (minor, unchanged) | `paperRows.ts:40` topic rows carry no codes | none |
| L1-vojtech-18-MB4-4 | recurs (minor, unchanged) | `keys.ts:537-538,545` ix -1 -> focus 0 | none |

## New findings

None.

## Notes

- Probe: scratch `p4.cjs` (store + paperView on three papers, cz/18 and UK/12). A paper with a whole-link A17 loss shows 'Start with One-step equations' for him, as WHOLE intends. The TV caption on an all-off-desk paper reads 'None of these has a topic on the desk yet.'
- L2: enter the 25-row maturita paper and read the TV rows.
