# Recertify, round 13 — L1 run 2026-10-09-maths-l1

Rerun: `2026-10-09-maths-l1/recert-13`, **level L1 only (code re-walk, builder pass 79f20ae6, branch autopilot/accepted-idea-delivery-79f20ae6 cut from main ee0fd7d7, 2026-10-20)**; no model, no vision, no browser, desk/data untouched. Every row open in `recert-12/findings.json` (4 rows) was reconciled and answered `fixed` or `recurs`. Nothing here is `resolved-verified`: that needs live L2 evidence. The fixed rows are also stamped into `recert-12/findings.json`; OPEN.md Math section only was rewritten.

## Counts

| | Rows |
| --- | --- |
| Open before | 4 |
| Fixed (L1) | 2 (L1-nela-12-MB2-2 90fd4a86, L1-matyas-19-MB3-5 e6ed58a8) |
| Recurs | 2 |
| New | 0 |
| Open after | 2 |

OPEN.md: Math 4 -> 2, total 235 -> 233. Gates: every tools suite named in the brief green; `npm run test:rules` in desk/ 90 green, 0 red, 2362 tests pass. No tsc in the worktree (no desk/node_modules/.bin), so typecheck was not run.

## Reconciliation

Neither row had landed: `git log -S'"simplest"' -- desk/src/lib/rules/school.ts` finds only the older shape work (129ce63e, 4e9207f6, 3a3d202e, 3ce6e2e7), none on gen(); calc.ts question() still printed `{ plain, tex }` at ee0fd7d7.

## Fixed

| Row | Commit | Evidence |
| --- | --- | --- |
| `L1-nela-12-MB2-2` | 90fd4a86 | Owner ruling Variant 2 (reversible): gen() and its fallbacks carry form "simplest"; 6/4 for 3/4 + 3/4 is unsure through the existing tail. New rule assertion in school-rules-test; paper-aim PLAIN_FP/SLIPS_FP regenerated; school-stretch, maths-aim, maths-like type lowest terms; maths-calculus-test 7 fits the longer row down to 34 px (smallest 38). |
| `L1-matyas-19-MB3-5` | e6ed58a8 | question() prints plain only in calc.ts and calc2.ts; calc1-frozen.json regenerated with its 175 rows kept (tex keys leave, nothing else moves); calc2-seam case 1 byte-exact; calc-rules, calc2-approx, calc2-sequence tests updated. |

## Still open

| Row | Reason | Needs |
| --- | --- | --- |
| `L1-matyas-19-MB1-1` | phone/keys paths held by the stick pass (50602ac3); vision path | desk/src/app/phone/page.tsx, desk/src/tv/keys.ts |
| `L1-radka-41-MB5-2` | operator ruling (b); code owed at the phone Recap, held by the stick pass | desk/src/app/phone/page.tsx |

Details: docs/uat-insights/2026-10-20-maths-l1-recert-13.md.
