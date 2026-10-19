# eliska-12 × EM2 · (recert-10)

- Character: eliska-12
- Journey: EM2
- Cert level: L1 re-walk, code only, no model
- Head 6b189791
- Recertifies: 2026-10-09-essay-l1/recert-9 at b7fca776
- **Verdict now: L1-conditional.** 1 fixed, 2 recur; 2 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-eliska-12-EM2-1 Kept verdicts go stale: after her rewrite adds the evidence, the earlier claim … (minor) | recurs → L1-eliska-12-EM2-1 | cited lines re-found at 6b189791: reviseSentence (desk/src/lib/desk/essay.ts:292) still copies every other verdict unchanged (reading.verdicts.filter(v => v.n === s.n)) and decides only sentence n (:288); no line marks a kept faulty verdict that the rule would now clear. | none |
| L1-eliska-12-EM2-2 After a rewrite holds, focus goes to 'Next sentence', which steps to n+1, not t… (minor) | recurs → L1-eliska-12-EM2-2 | The Next half is fixed by 32ffdf92: desk/src/tv/keys.ts:191-198 nextFaultyAt walks forward with wrap to the next faulty sentence (n+1 when none), used at :483, and focusAfterRewrite (:186-189) lands focus on Next. The row's second half is not met: Rewrite on my phone (keys.ts:481) still only emits a status event with rewriteStatus (:200); on the TV the only effects are the phone chip lighting (EssayTV.tsx:335,340) and the bench status bar (app/tv/page.tsx:158); the instruction text is not drawn on the forensic page. Still missing: The instruction ('rewrite it in your own words on the phone's Essay tab, then analyse again') is not shown on the TV page itself after pressing Rewrite on my phone; only the phone chip lights and the bench status bar carries the text. | 32ffdf92 (narrows) |
| L1-eliska-12-EM2-3 Refusal 'In the paragraph that would not stay one sentence.' is opaque; a dicta… (minor) | fixed | revise() (desk/src/lib/rules/essay.ts:775-791) tidies dictated text first: capitalises a lower-case first letter (:780) and adds a full stop when none of . ! ? ends it (:781), then checks; the refusal is now 'Sentence N would run into the sentence next to it. Start it with a capital letter and end it with a full stop.' (:790), naming the sentence and the act. Executed at HEAD (scratch /tmp/rc/scratch/r.cjs): mid-paragraph sentence 3 'cleaner air helps pupils concentrate' is accepted as 'Cleaner air helps pupils concentrate.'; a two-sentence dictation gets 'That is 2 sentences. Send sentence 3 as one sentence.' (:784). Callers: desk/src/lib/desk/essay.ts:257, app/api/analyse/route.ts:117. Fixed by 645fdc94 (ancestor of HEAD). | 645fdc94 |

## New findings

None.

## Notes

- Evidence check at 6b189791: every cited line was re-mapped through `git diff -U0 b7fca776 6b189791` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
