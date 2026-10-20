# Recertify, round 11 — L1 run 2026-10-09-maths-l1

Rerun: `2026-10-09-maths-l1/recert-11`, **level L1 only (code re-walk, builder pass 3cefdd38, branch autopilot/accepted-idea-delivery-3cefdd38 cut from main ed23c4ac, 2026-10-20)**; no model, no vision, no browser, desk/data untouched, nothing under desk/ or tools/ changed by this round. Every row open in `recert-10/findings.json` (6 rows) was reconciled against main and answered `fixed` or `recurs`. Nothing here is `resolved-verified`: that needs live L2 evidence. Stamps by `uat/driver/recertify.cjs` `writeBack()` into every run holding an open row of the gap; OPEN.md rewritten by `uat/driver/ledger.cjs` `writeStatus()` only.

## Counts

| | Rows |
| --- | --- |
| Open before | 6 |
| Fixed (L1) | 1 (L1-vojtech-18-MB4-3, e9c5ee8f) |
| Recurs | 5 |
| New | 0 |
| Open after | 5 |

## Fixed

| Row | Commit | Evidence |
| --- | --- | --- |
| `L1-vojtech-18-MB4-3` | e9c5ee8f | gcse.ts:85-87 A26-A28 beside A22 (:78), Czech wording gcse-cz.ts:61-63, pinned by tools/gcse-rules-test.cjs:21 and :27. Closed on the statement-and-test acceptance of the 2026-10-20 brief; no school unit teaches A26-A28 (still "Not on the desk yet"). |

## Still open, each with its reason and file

| Row | Reason | Needs |
| --- | --- | --- |
| `L1-nela-12-MB2-1` | the tier-2 bound (bottoms 2..10, common bottom at most 24) moves every frozen tier-2 draw; tests outside this pass's paths | school.ts PAIRS; tools/paper-aim-test.cjs, school-stretch-test.cjs, maths-aim-test.cjs, maths-like-test.cjs |
| `L1-nela-12-MB2-2` | the rule flips tests frozen on purpose ("22/24" right for 3/4 + 1/6); owner's choice of rule | school.ts check(); tools/school-rules-test.cjs, maths-like-test.cjs, school-stretch-test.cjs, maths-aim-test.cjs |
| `L1-matyas-19-MB3-5` | no screen reads tex, but calc tests read it as the TeX printer's check | calc.ts question(); tools/calc-rules-test.cjs, calc2-sequence-test.cjs, maths-calculus-test.cjs, maths-calculus-live.cjs |
| `L1-matyas-19-MB1-1` | client half is in held paths and needs the vision path | desk/src/app/phone/page.tsx, desk/src/tv/keys.ts |
| `L1-radka-41-MB5-2` | operator ruling (b) 2026-10-20: acceptance amended in findings.json (`suggested_acceptance`); code owed at the phone Recap | desk/src/app/phone/page.tsx (about :881), desk/src/tv/ if it names where the others show |

Walks: `recert-11/<character>--<journey>.md`. Details and the prepared-but-reverted school.ts changes: docs/uat-insights/2026-10-20-maths-l1-recert-11.md.
