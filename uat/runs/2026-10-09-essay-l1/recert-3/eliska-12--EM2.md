# eliska-12 × EM2 · Fix it myself (recert-3)

- Character: eliska-12
- Journey: EM2
- Cert level: L1 re-walk, code only, no model
- Head 00f5db95
- Recertifies: 2026-10-09-essay-l1/recert-2 at 90e032f2
- **Verdict now: L1-conditional.** 1 fixed, 3 recur; 3 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-eliska-12-EM2-1 False 'holds': a rewrite that is still only opinion holds when a later sentence… (major) | **fixed** | b6f0acb7 (the brief's L1-eliska-12-EM2-2, recert-1 numbering): rules/essay.ts:453-457, an opinion with no accepted link is neutral only when a checkable sentence THIS call judged leaves it so; a context neighbour that backs nothing makes the rewrite faulty. Executed (scratch m4.cjs): "Phones are bad for school. In 2020 a survey found 60% of teachers agree. They should be banned." rewrite of S1 alone, with contextObservations(evidence, ..., 1, []) = [{n 2, support checkable}] -> S1 faulty "No checkable sentence here backs this opinion."; the same text read whole (S1 and S2 both judged) -> S1 neutral, S2 strong. A rewrite that now holds a number is checkable and strong. | b6f0acb7 |
| L1-eliska-12-EM2-2 Kept verdicts go stale: after her rewrite adds the evidence, the earlier claim… (minor) | recurs → L1-eliska-12-EM2-1 | desk/src/lib/desk/essay.ts:264 — other verdicts copied / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |
| L1-eliska-12-EM2-3 After a rewrite holds, focus goes to 'Next sentence', which steps to n+1, not t… (minor) | recurs → L1-eliska-12-EM2-2 | desk/src/tv/keys.ts:185-188 — focusAfterRewrite / desk/src/tv/keys.ts:468,470 — status only; next = (i+1)%n / recert-3 @00f5db95: cited lines re-found at 00f5db95; no commit since 90e032f2 touched the cited files | none |
| L1-eliska-12-EM2-4 Refusal 'In the paragraph that would not stay one sentence.' is opaque; a dicta… (minor) | recurs → L1-eliska-12-EM2-3 | desk/src/lib/rules/essay.ts:651 — the line / desk/src/app/phone/page.tsx:694 — Dictate replaces the rewrite text / recert-3 @00f5db95: cited lines re-found at 00f5db95; essay.ts changed since 90e032f2 (f3b8e4b1, b6f0acb7, 2d3526b3) but not at the cited lines | none |

## New findings

None.

## Notes

- Evidence check at 00f5db95: every cited line was re-mapped through `git diff -U0 90e032f2 00f5db95` (a cite inside a changed hunk is re-read by hand); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
