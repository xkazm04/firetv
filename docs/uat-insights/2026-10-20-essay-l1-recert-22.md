# L1 recertify, round 22, of the Essay Master run 2026-10-09-essay-l1 (2026-10-20)

A code-only L1 re-walk of the 5 rows of `uat/runs/2026-10-09-essay-l1` that were open in recert-21. It ran on 820a115d, after the three commits that delivered list (a) of recert-21: befc9a06 (the blind r5 set, committed alone first), d97ec7b9 (the round-5 letter-run profile, the EM1-9 row) and 820a115d (the r5 BLIND pin, the EM1-4 row). No model call, no browser, no device, no push. Round doc: `uat/runs/2026-10-09-essay-l1/recertify-22.md`. Nothing is `resolved-verified`.

## Counts: Essay before and after

**Essay 5 -> 3**: 2 of the 5 fixed (`L1-helena-46-EM1-9`, `L1-helena-46-EM1-4`), 3 recur (1 narrowed), 0 new. Total open 233 -> 231. Math and Linga were not run, and their OPEN.md section hashes are equal before and after: Linga `2a273aab...6a15`, Math `342da3e9...dd54`. Stamps were written by `recertify.cjs` `writeBack()` into 22 runs (23 rows fixed, 66 recurs); OPEN.md by `ledger.cjs` `writeStatus()`. Nothing was edited by hand.

| | Before (recert-21) | After (recert-22) |
| --- | --- | --- |
| Essay open | 5 (1 major, 3 minor, 1 polish) | 3 (1 major, 2 minor) |
| helena-46 EM1 | L1-conditional, 2 open | L1-pass on code, 0 open (L2 owed) |
| kristyna-17 EM1 | L1-conditional, 2 open | L1-conditional, 2 open (EM1-1 narrowed) |
| eliska-12 EM2 | L1-conditional, 1 open | L1-conditional, 1 open (declined under R6) |

## What changed: a signal that is not a word list

recert-21 stopped word-list tuning, so round 5 adds no word and no shape to any list. Instead, `desk/src/lib/rules/essayLang.ts` is a pure-TypeScript character 1-4-gram Czech/English profile: smoothed log odds per letter run, 3380 runs, no dependency. It is trained by `trainProfile()` on the tuning set, the held-out short sets up to r4 and essay-heldout-r3.json, and never on r5. A test rebuilds the embedded table from those files, so it cannot be hand-tuned.

`paragraphIsEnglish` reads it on paragraphs of up to 12 words, in two ways:

- **Lifting a refusal.** A refusal that rests on Czech alone is lifted when the line leans English (margin 0.15).
- **Adding a refusal.** A line of 3+ words with no English function word is refused when it leans Czech (margin 0.2).

Both margins come from leave-one-set-out cross-validation over the five short sets. They sit mid-plateau, where the cross-validation made 0 errors over 288 Czech and 220 English lines.

## The refusal table, every set

| Set | Czech refused | English refused | Label |
| --- | --- | --- | --- |
| tools/essay-heldout-czech-short-r5.json | **60 / 60** (57 / 60 on the 6e50d7c3 rule) | **0 / 45** (1 / 45 before) | **BLIND**: committed alone in befc9a06 before the rule, measured once after it |
| tools/essay-heldout-czech-short-r4.json | 59 / 59 (55 / 59 before) | **0 / 45** (1 / 45 before: english[15], sha256 `aab59657...`) | **TUNED** from round 5 (in the profile's training) |
| tools/essay-heldout-czech-short-r3.json | 60 / 60 (60 / 60) | 0 / 45 | TUNED |
| tools/essay-heldout-czech-short-r2.json | 60 / 60 (60 / 60) | 0 / 44 | TUNED |
| tools/essay-heldout-czech-short.json | 53 / 53 (53 / 53) | 0 / 42 | TUNED |
| tools/essay-tuning-czech-short.json | 56 / 56 (56 / 56) | 0 / 44 | TUNED |
| tools/essay-heldout-r3.json | czPlain 30/30, czShort 10/10, de 10/10, it 4/4, nl 4/4, pl 4/4 (unchanged) | 0 / 30 | TUNED |

r5 whole-file sha256 `f0264e7fd0b50f51a669fae8f0124754134199d2e1d6778860579df1d44c60ed`, inner `b44e9ce80a16f0e108d8553ebc9fd223f41800751b09e53ef2a6463162e6dd91`, recomputed equal. No held-out line is printed in the repo: counts, indices and sha256 only. The pin at `tools/essay-rules-test.cjs:2326` is now a failing assertion of 0 (it was `en.length<=1`). On r5 the round-4 word-list rule alone leaks 3 of 60 (5.0%), the same rate as every earlier fresh set, and refuses 1 English line. The profile takes both to zero.

- **L1-helena-46-EM1-9: fixed.** r4 english[15] is English, and 0 English lines are refused on every set.
- **L1-helena-46-EM1-4: fixed.** Zero blind Czech leaks on r5 and 0 English refused: the closure bar recert-21 set. recert-21's operator item (b) 2, whether to accept the 4-of-59 residual, is moot.
- **L1-kristyna-17-EM1-1: recurs, narrowed.** The refusal arm is met on the blind set. The L arm (rule on Czech word lists, or say the desk does not rule Czech) is the operator's and is unchanged (rules/essay.ts:15, :17, :457, :470, :522, :535).
- **L1-kristyna-17-EM1-3** and **L1-eliska-12-EM2-1** recur unchanged (desk/src/lib/desk/essay.ts is byte-identical; EM2-1 stays declined under R6).

## Caveats

- **The same session wrote the test set and the fix.** r5 was written by the builder session that then built the profile. It was written and committed before that session opened the rule, any earlier short-Czech set or any recert text quoting a line, but it is not a fresh author's set. A set from a fresh author, measured once on 820a115d, would be the stronger proof.
- **The live model behaviour is still L2.**
- **tools/essay-ui-test.cjs does not parse, on this branch and on main.** It has a literal newline in a regex at :26. It is a live-server suite outside rulesSuites and outside this round's paths: recorded here, not fixed.

## Suites

At 820a115d, `cd desk && npm run test:rules` is 90 green, 0 red, 2367/2367. That includes essay-rules 180/0, essay-piece 54/0, essay-seat 8/0, uat-recertify 21/0 and uat-ledger 18/0. Typecheck and lint are not configured: skipped, not passed.

## What remains open (Essay)

| # | Row | Owner | Next step |
| --- | --- | --- | --- |
| 1 | `L1-kristyna-17-EM1-1` L arm (major) | operator | Rule on Czech word lists, or refuse Czech and say so |
| 2 | `L1-kristyna-17-EM1-3` (minor) | operator | Name the note language for a Czech text; a builder then adds the one language line (desk/src/lib/desk/essay.ts:113-136) |
| 3 | `L1-eliska-12-EM2-1` (minor) | declined under R6 | None until its return condition is met |
| 4 | `L1-eliska-12-EM1-4` L2 (fixed on code) | operator | Live P2 x5 per lens through the claude CLI |
| 5 | EM1-4 / EM1-9 L2 (fixed on code) | operator | Live check that a refused short line never reaches the model and a short English line always does |
