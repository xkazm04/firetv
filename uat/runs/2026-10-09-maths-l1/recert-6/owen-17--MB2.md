# owen-17 × MB2 · (recert-6)

- Character: owen-17
- Journey: MB2
- Cert level: L1 re-walk, code only, no model
- Head 6b189791
- Recertifies: 2026-10-09-maths-l1/recert-5 at c4893c88
- **Verdict now: L1-pass (no row open).** 2 fixed, 0 recur; 0 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-owen-17-MB2-1 The three linear-equation units have no worked lesson: 'See how first' is offer… (minor) | fixed | 6b189791 added linear-one-step, linear-two-step and linear-both-sides to WORKED_METHODS (desk/src/lib/library/worked.ts:38-43) and code-built examples (rules/school.ts linearWorked, :3646-3677; desk/src/lib/desk/worked.ts:29-31 routes the linear units to it). Executed (/tmp/rc/scratch/cov.cjs): topicsOf('school') has 17 units and hasWorked is true for all 17 (none without a lesson), so keys.ts:541 (prepare Select -> prepareAsk -1 = 'See how first') and keys.ts:500/554 open on the lesson for an equations row. linearWorked returns 3 examples for 300 seeds per unit, and every answer substituted back makes the equation true (0 bad). worked-rules-test, tv-keys-test, maths-tv-test pass. Cosmetic only: both-sides can print '1x'. | 6b189791 |
| L1-owen-17-MB2-2 The Topics ruler still labels a 17-year-old's units 'Year 5' to 'Year 9' (the P… (minor) | fixed | 56c9eede computes past = !!pastPathEnd(s) in Ruler (desk/src/maths/MathsTV.tsx:299) and draws the year only when t.year && !past (MathsTV.tsx:338), the same test Prepare uses (MathsTV.tsx:651, :690). tools/maths-tv-test.cjs:1245-1247 pins it (17-year-old: no class mb-ty; 12-year-old keeps Year n / Grade n); suite 77 pass 0 fail. | 56c9eede |

## New findings

None.

## Notes

- Evidence check at 6b189791: every cited line was re-mapped through `git diff -U0 c4893c88 6b189791` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
