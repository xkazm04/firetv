# eliska-12 × EM2 · (recert-21)

- Character: eliska-12
- Journey: EM2
- Cert level: L1 re-walk, code only, no model
- Head 6e50d7c3
- Recertifies: 2026-10-09-essay-l1/recert-20 at bf036c94
- **Verdict now: L1-conditional.** 1 found and fixed (new row), 1 recur; 1 row open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-eliska-12-EM2-1 Kept verdicts go stale: after her rewrite adds the evidence, the earlier claim stays 'no … (minor) | recurs → L1-eliska-12-EM2-1 | recert-21 @6e50d7c3: Re-walked at 6e50d7c3 (the local main tip); what the previous walk (at bf036c94) found still holds: reviseSentence (desk/src/lib/desk/essay.ts:271) still decides only sentence n (:304) and copies every other verdict unchanged (:308, reading.verdicts.filter(v => v.n === s.n)); no line marks a kept faulty verdict that the rule would now clear. f4aea028 changed :303 (the observation check of the rewritten sentence, now unanswered) and the import at :10, in place, so no line moves; it makes a rewrite with no link fail the run, which is a different row (L1-eliska-12-EM2-7, fixed). Stays DECLINED under R6. | 6e50d7c3 |

## New findings

| Finding | Severity | Resolution | Title |
| --- | --- | --- | --- |
| L1-eliska-12-EM2-7 | minor · rank 6 | fixed (not-seen, stamped by writeBack) | A rewritten sentence with no supports or backs link is ruled "strong" instead of failing the run like a first reading |

**L1-eliska-12-EM2-7.** On main before f4aea028 (carried as an unfiled code reading by recert-19 and recert-20; executed with the stubbed engine by the test 97141532 against the unfixed code): reviseSentence checked observationOk only, not the link, so a Structure rewrite with no supports and an Evidence rewrite with no backs were both ruled "strong" (97141532 message: "ruled strong on main", both lenses).

Stamp: f4aea028 (ancestor of main) makes reviseSentence use the first pass's unanswered check (desk/src/lib/desk/essay.ts:303; observationOk is no longer imported, :10). The test 97141532 (with 6e50d7c3, which gives two note/prompt stubs backs: 0) re-run at 6e50d7c3: 'rewrite link: a rewrite that leaves out the link its lens needs fails the run, like the first pass; 0 and an integer link rule' is green; a Structure rewrite with no supports and an Evidence rewrite with no backs now throw 'no observation came back for sentence 2' (before: both ruled strong); the controls supports 0, backs 0 and integer links 1 still rule. tools/essay-rules-test.cjs 178/0.

## Notes

- Evidence check at 6e50d7c3: every desk/src/lib/rules/essay.ts line was re-read (git diff -U0 bf036c94 6e50d7c3 shows two in-place edits, :245 and :247, so no line moves); desk/src/lib/desk/essay.ts changed in place at :10 and :303 only; desk/src/app/phone/page.tsx is byte-identical to bf036c94. Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Nothing is resolved-verified: that needs live L2 evidence. Model-dependent behaviour stays with L2. No held-out Czech leak and no held-out English line is printed in this file (counts, an index and a sha256 only).
