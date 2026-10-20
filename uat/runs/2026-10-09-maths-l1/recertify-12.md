# Recertify, round 12 — L1 run 2026-10-09-maths-l1

Rerun: `2026-10-09-maths-l1/recert-12`, **level L1 only (code re-walk, builder pass 47b27a1c, branch autopilot/accepted-idea-delivery-47b27a1c cut from main f315e1b9, 2026-10-20)**; no model, no vision, no browser, desk/data untouched. Every row open in `recert-11/findings.json` (5 rows) was reconciled and answered `fixed` or `recurs`. Nothing here is `resolved-verified`: that needs live L2 evidence. Stamps by `uat/driver/recertify.cjs` `writeBack()` into every run holding an open row of the gap; OPEN.md rewritten by `uat/driver/ledger.cjs` `writeStatus()` only.

## Counts

| | Rows |
| --- | --- |
| Open before | 5 |
| Fixed (L1) | 1 (L1-nela-12-MB2-1, b6581a9e) |
| Recurs | 4 |
| New | 0 |
| Open after | 4 |

## Fixed

| Row | Commit | Evidence |
| --- | --- | --- |
| `L1-nela-12-MB2-1` | b6581a9e | school.ts PAIRS tier 2 keeps bottoms 2..10 and a common bottom of at most 24; tools/school-rules-test.cjs asserts it over seeds 1..200; tools/paper-aim-test.cjs PLAIN_FP and SLIPS_FP regenerated. |

## Still open

| Row | Reason | Needs |
| --- | --- | --- |
| `L1-matyas-19-MB3-5` | dropping tex also moves the byte-frozen tools/calc1-frozen.json and calc2.ts's typed `{ plain, tex }`, outside this pass's paths | calc.ts, calc2.ts, tools/calc1-frozen-gen.cjs + calc1-frozen.json, calc2-seam-test.cjs, calc2-approx-test.cjs, calc2-sequence-test.cjs, calc-rules-test.cjs, maths-calculus-test.cjs, maths-calculus-live.cjs; or the owner accepting "documented" |
| `L1-nela-12-MB2-2` | the simplest-form marking rule waits on the owner's choice of rule | school.ts check() or the generators and the five frozen suites |
| `L1-matyas-19-MB1-1` | phone/keys paths held by the stick pass; vision path | desk/src/app/phone/page.tsx, desk/src/tv/keys.ts |
| `L1-radka-41-MB5-2` | operator ruling (b); code owed at the phone Recap, held by the stick pass | desk/src/app/phone/page.tsx |

Walks: `recert-12/<character>--<journey>.md`. Details: docs/uat-insights/2026-10-20-maths-l1-recert-12.md.
