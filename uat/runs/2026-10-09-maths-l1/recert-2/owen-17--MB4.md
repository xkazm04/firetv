# owen-17 × MB4 · Turn a mock paper into a plan (recert-2)

- Character: owen-17 (17, FE college, Foundation resit; UK, Family mode)
- Journey: MB4 Turn a mock paper into a plan
- Cert level: L1 re-walk, code only, no model
- Head 90e032f2
- Recertifies: 2026-10-09-maths-l1 at 12592a71 (recert-1 at d4f5042a)
- **Verdict now: L1-conditional.** The fan-out onto decimals and fractions rows is closed for a learner past those units' year: a partly linked statement goes to not-on-the-desk. Draft paper rows still live only in phone state.

## Reachable surface (now)

- Paper list: `paperView(s)` builds a Reader from the seated profile (`desk/src/tv/paperRows.ts:31`) and calls `recovery(items, at)` (`:32`); `readerOf` is at `desk/src/lib/rules/recovery.ts:172`, the past-unit filter at `:181-196`.
- Practice aim: `desk/src/app/api/practice/route.ts:45` passes `readerOf(s)` to `aimOf`.
- Phone entry: `desk/src/app/phone/page.tsx:68,543`.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-owen-17-MB4-1 one broad statement spreads a loss over 3 topics (major) | fixed | Executed `recovery()` on the recert-1 mock (N2 0/3 and 1/4, A17 0/3), UK age 17: without a Reader 6 rows incl. frac-add-sub, frac-mul-div, dec-arith at 2 each; with the Reader the rows are the 3 equation rows plus N2 in not-on-the-desk, no decimals row (`recovery.ts:181-196`, `gcse.ts` WHOLE). Residual: A17 is a whole link to all three equation units, so one equations question still gives 3 rows of 1 (by design); and a fractions loss now sits in not-on-the-desk rather than on a fractions row | 37425037, 4b82f0a3 |
| L1-owen-17-MB4-2 31 typed paper rows live only in React state (minor) | recurs (minor) | `phone/page.tsx:68` `useState<DraftRow[]>(() => [blankRow()])`; `:192` localStorage only removes desk.pin; `:543` PaperPanel gets that state | - |

## New findings

None.

## Notes

- Scratch `recert2/scratch/owen-17/m.cjs` via `tools/ts-load.cjs`, no model. It assumes Owen's profile keeps age 17 and system uk (readerOf returns undefined otherwise, and then the old fan-out holds).
- L2: a resit lecturer orders the same mock by hand; compare the top 5. Whether fractions losses landing in not-on-the-desk reads as a useful plan to Owen is L2's.
