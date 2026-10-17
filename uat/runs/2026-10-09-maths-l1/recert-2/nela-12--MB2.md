# nela-12 × MB2 · Fractions practice set (recert-2)

- Character: nela-12 (12, cz, elementary), with Mum beside her.
- Journey: MB2 · Fractions practice set
- Cert level: L1 re-walk, code only, no model
- Head 90e032f2
- Recertifies: 2026-10-09-maths-l1 at d4f5042a (recert-1)
- **Verdict now: L1-conditional.** Both minors are unchanged: the tier-2 denominator range is still unsigned, and unsimplified sums are still ticked while the lesson says "then simplify".

## Reachable surface (now)

- Generator: `desk/src/lib/rules/school.ts:2798` (gen), `:3040` (frac-add-sub generator), `:3633` (cz localisation).
- Question tail: `school.ts:1588`. Lesson: `desk/src/lib/library/worked.ts:15`.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-nela-12-MB2-1 tier-2 common bottoms up to 132 | recurs (minor) | `school.ts:2798` gen unchanged; `git log d4f5042a..HEAD -- school.ts` shows only d88fb34c (readers, not the generator). The range still awaits a teacher's sign-off. | null |
| L1-nela-12-MB2-2 unsimplified sums ticked, lesson says "then simplify" | recurs (minor) | `worked.ts:15` still "Add or take away the tops, then simplify"; `school.ts:1588` adds the "simplest form" tail only when form is simplest; marking unchanged. Pending owner ruling. | null |

## New findings

None.

## Notes

- Evidence check only (file/line and git log); the earlier denominators repro is not re-run as the generator is untouched.
- L2: a Czech maths teacher judging 3 drawn tier-2 sets; owner ruling on unsimplified results for cz.
