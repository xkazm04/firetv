# matyas-19 × MB3 · (recert-6)

- Character: matyas-19
- Journey: MB3
- Cert level: L1 re-walk, code only, no model
- Head 6b189791
- Recertifies: 2026-10-09-maths-l1/recert-5 at c4893c88
- **Verdict now: L1-conditional.** 4 fixed, 1 recur; 1 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-matyas-19-MB3-1 Calculus 2: by-parts working (and the other technique topics) is read as nothin… (minor) | fixed | The acceptance's stated fallback ('the TV says plainly that working on Calculus 2 techniques is not line-checked') is met. working.ts:72-79 defines NOT_LINE_CHECKED = 'Working on these topics is not checked line by line, only the answer.' and lineCheckNote(topic,it), which returns it for a wrong item with working lines when the topic id is in CALC2_SPINE (e9ba938e moved the test from the path literal to the spine record). MathsTV.tsx:864/876 renders it in the SlipSide card (data-role maths-unchecked), and both the sheet (:941) and the walk (:982) pass topic={p.topic}. Executed (/tmp/rc/scratch/c.cjs): calc2-parts with by-parts working returns the line; calc1-limits returns null. The real line check (chain.ts:387 tagLines) still reads Calculus 1 forms only, so the pen still does not land on by-parts working; the row is closed on the acceptance's 'failing that' branch, not on a built check. | 52270a6a |
| L1-matyas-19-MB3-2 Word-problem parts with an irrational answer accept only the exact form or abou… (minor) | fixed | Row accepts 'the line asks for the exact value'. calc-word.ts:101 now reads 'Give the exact rate in centimetres per second.' (sphere-rates part a, key q/(4 r0^2 pi), irrational) and :127 'Give the exact value in metres.' (rectangle diagonal, k*sqrt(2)); the other parts have rational keys (sphere part b 2q/r0 at :102; rectangle area at :126; cubic max/min :176-177) so need no wording. derivative-at/extremum are still on the 1e-6 tolerance (calc.ts:67-69) and decimalCall still only serves limit and definite-integral (calc.ts:420-424), but that is the alternative arm; the commit chose the wording arm to keep the frozen fixtures. Pinned in tools/calc-word-test.cjs (MB3-2 row: 1.1495 for 65/(18pi) is unsure, 65/(18pi) right). | fcccfa63 |
| L1-matyas-19-MB3-3 Typesetting: an infinity as a bound is split ('^inf' becomes ^i + 'nf') or left… (polish) | fixed | Executed at 6b189791 (/tmp/rc/scratch/a.cjs, flatten(parseMath(s))): 'int_1^inf x dx' -> '∫_(1)^(∞) x dx'; '∫_1^∞ x dx' -> '∫_(1)^(∞) x dx'; 'sum_(n=1)^infinity 1/n' -> '∑_(n=1)^(∞) (1)/(n)'; 'x^inf' -> 'x^(∞)'. Code: typeset.ts:318 takes a letter run equal to inf/infinity after ^ or _ as one {t:'sym',v:'∞'} atom, and the char branch just below now takes a literal ∞ as a sym. Matches the acceptance (four lines pinned in tools/maths-type-test.cjs MB3-3 row). | 28dceeff |
| L1-matyas-19-MB3-4 Two Calculus 2 topic blurbs are over 25 words (approximate integration 30, sequ… (minor) | fixed | calculus2.spine.ts blurbs were cut to 25 words or fewer: approximate integration (:78) and sequences (:85); a whitespace count of every CALC2_SPINE blurb at 6b189791 gives 21-24 words (executed, /tmp/rc/scratch/b.cjs). The suggested acceptance (a length pin that also counts the Calculus spines) is met by the row added to tools/calc2-path-test.cjs in the same commit. | 2e129e80 |
| L1-matyas-19-MB3-5 question(spec).tex is computed for every Calculus spec and read by no screen (polish) | recurs → L1-matyas-19-MB3-5 | fa24f5d1 only adds a doc comment (calc.ts:360-362: 'tex has no screen reader: items.ts keeps plain only. It is the TeX form the rule suites hold to the typesetter...'). question() at calc.ts:363 still returns {plain,tex} and builds tex for every shape (:380-396), and items.ts:426 (also :575,:613) still stores q.plain only. The row's acceptance is 'either the item stores tex for the typesetter, or the field and its code are dropped'; neither happened, the dead field is now documented and its only readers are test suites. Still missing: The tex field is still computed and read by no screen: items.ts does not store tex for the typesetter, nor is the field (and the calc.ts:380-396 tex strings, with the frozen fixtures) dropped; only a comment was added. Needs an owner ruling to accept 'documented' as closing, or the drop plus frozen-fixture rewrite. | fa24f5d1 (narrows) |

## New findings

None.

## Notes

- Evidence check at 6b189791: every cited line was re-mapped through `git diff -U0 c4893c88 6b189791` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
