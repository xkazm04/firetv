# vojtech-18 × MB4 · Where did the marks go? (recert-1)

- Character: vojtech-18 (18, high school, cz, School maths path)
- Journey: MB4 · Where did the marks go?
- Cert level: L1 re-walk, code only, no model
- Head: d4f5042a
- Recertifies: 2026-10-09-maths-l1 at 12592a71
- **Verdict now: L1-fail**. The screen no longer says 'No marks were lost' wrongly, counts off-desk marks and Select now opens a set, but partial statement links (G17, G20, N1) still lead a maturita paper with 5.-7. ročník units.

## Reachable surface (now)

- Phone entry: `desk/src/app/phone/PaperPanel.tsx:27-36` (folding areas, Find by words, '(a harder statement)').
- Mapping: `desk/src/lib/library/gcse.ts:39-136` touches; `desk/src/lib/rules/recovery.ts:187-190` reachOf, `:207` recovery (whole-mark shares).
- TV: `desk/src/tv/paperRows.ts:29-127` (paperView, offCountLine, paperCaption, paperNone), `desk/src/maths/MathsTV.tsx:719-735`.
- Keys: `desk/src/tv/keys.ts:534-545`.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| MB4-1 'No marks were lost' beside lost marks | fixed | `paperRows.ts:108-127`; executed: '6 marks were lost on questions that name no statement. Pick what each one tests on the phone.' | 9875e783 |
| MB4-2 partial links force maturita questions onto 5.-8. ročník units (blocker) | recurs | G17 -> area, G20 -> pythagoras, N1 -> frac-equivalent (`gcse.ts:114, 117, 41`); executed: 'Start with Area of rectangles, triangles and composite shapes.' / 'Start with Equivalent fractions.' A4 no longer touches a topic (`gcse.ts:60`) | null |
| MB4-3 off-desk loss not counted | fixed | `paperRows.ts:60-65` offCountLine, `MathsTV.tsx:719` | 1faea42d |
| MB4-4 no Select; Back to Equivalent fractions | fixed | `keys.ts:539-545` Select opens the unit, Back lands on it (off-desk rows: see new) | b3581eb2 |
| MB4-5 picker is GCSE wording, no maturita statements | recurs | Still GCSE English statements (`gcse.ts:39-136`), now '(a harder statement)' (`PaperPanel.tsx:36`), fold and search (`:27-28`); no log, domain or quadratic-inequality statement | null |
| MB4-6 topics[].codes unwired | recurs | `recovery.ts:63` built; `paperRows.ts:39-40` drops it; no screen reads it | null |

## New findings

- New (recert-1 walk), minor 6: Back or Menu on an off-desk row goes to Get ready for school at focus 0 (Equivalent fractions): `ix` is -1 off the topic rows and `nav('prepare', Math.max(0, ix))` (`keys.ts:537-538, 545`).
- The 2026-10-14 walk raised no new MB4 row for him.

## Notes

- Probe: scratch `p6.cjs` (recovery + paperView + caption on three small papers). No model was called.
- Whole-mark sharing (ee949056) makes the totals add up and marks shared rows; it does not change which unit leads.
