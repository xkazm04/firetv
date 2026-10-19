# L1 recertify, round 6, of the Math Buddy run 2026-10-09-maths-l1 (2026-10-19)

A code-only L1 re-walk of the 9 pairs of `uat/runs/2026-10-09-maths-l1` that still had an open row, on 6b189791 (`6b1897912bab71ae7197ad4064f40fff5db2e1e9`, local main), after the commits that landed since c4893c88. No model call, no vision call, no browser; nothing under `desk/`, `tools/`, `phone/` or `desk/data/` changed. Full report: `uat/runs/2026-10-09-maths-l1/recertify-6.md`; data: `recert-6/`.

## Counts: Math before and after

| | Blocker | Major | Minor | Polish | Total |
| --- | --- | --- | --- | --- | --- |
| Open before (recert-5) | 0 | 0 | 16 | 3 | **19** |
| Fixed | 0 | 0 | 6 | 2 | **8** |
| Recur (severity now) | 0 | 0 | 10 | 1 | **11** |
| New | 0 | 0 | 0 | 0 | **0** |
| Open now | 0 | 0 | 10 | 1 | **11** |

OPEN.md Math 19 -> 11; total open 282 -> 270 once both modules are recorded (the other module's note holds its own half). The Linga section of OPEN.md is byte for byte unchanged.

## Rows now fixed, and the commit that fixed each

| Row | Sev. | Fixed by | What the code does now |
| --- | --- | --- | --- |
| `L1-matyas-19-MB1-2` A sequence limit written lim_(n->inf) is not read; lim_(n->infinity) and lim_(n->∞) are | polish | **0416286d** | Executed at 6b189791 (scratch /tmp/rc/scratch/a.cjs): specFromQuestion('Find lim_(n->inf) (3n+1)/(2n-5)') returns {shape:'sequence-limit', f:'(3x+1)/(2x-5)'}, as do n->infinity, n->∞ and n->+inf; 'Find the limit as n approaches ∞ of ...' reads too; n->-inf reads null (a sequence never goes to -infinity). leaksCalc(spec,'The lim… |
| `L1-matyas-19-MB3-1` Calculus 2: by-parts working (and the other technique topics) is read as nothing; the pen… | minor | **52270a6a** | The acceptance's stated fallback ('the TV says plainly that working on Calculus 2 techniques is not line-checked') is met. working.ts:72-79 defines NOT_LINE_CHECKED = 'Working on these topics is not checked line by line, only the answer.' and lineCheckNote(topic,it), which returns it for a wrong item with working lines when the… |
| `L1-matyas-19-MB3-2` Word-problem parts with an irrational answer accept only the exact form or about 6 figure… | minor | **fcccfa63** | Row accepts 'the line asks for the exact value'. calc-word.ts:101 now reads 'Give the exact rate in centimetres per second.' (sphere-rates part a, key q/(4 r0^2 pi), irrational) and :127 'Give the exact value in metres.' (rectangle diagonal, k*sqrt(2)); the other parts have rational keys (sphere part b 2q/r0 at :102; rectangle … |
| `L1-matyas-19-MB3-3` Typesetting: an infinity as a bound is split ('^inf' becomes ^i + 'nf') or left outside t… | polish | **28dceeff** | Executed at 6b189791 (/tmp/rc/scratch/a.cjs, flatten(parseMath(s))): 'int_1^inf x dx' -> '∫_(1)^(∞) x dx'; '∫_1^∞ x dx' -> '∫_(1)^(∞) x dx'; 'sum_(n=1)^infinity 1/n' -> '∑_(n=1)^(∞) (1)/(n)'; 'x^inf' -> 'x^(∞)'. Code: typeset.ts:318 takes a letter run equal to inf/infinity after ^ or _ as one {t:'sym',v:'∞'} atom, and the char … |
| `L1-matyas-19-MB3-4` Two Calculus 2 topic blurbs are over 25 words (approximate integration 30, sequences 33) | minor | **2e129e80** | calculus2.spine.ts blurbs were cut to 25 words or fewer: approximate integration (:78) and sequences (:85); a whitespace count of every CALC2_SPINE blurb at 6b189791 gives 21-24 words (executed, /tmp/rc/scratch/b.cjs). The suggested acceptance (a length pin that also counts the Calculus spines) is met by the row added to tools/… |
| `L1-owen-17-MB2-1` The three linear-equation units have no worked lesson: 'See how first' is offered on 14 o… | minor | **6b189791** | 6b189791 added linear-one-step, linear-two-step and linear-both-sides to WORKED_METHODS (desk/src/lib/library/worked.ts:38-43) and code-built examples (rules/school.ts linearWorked, :3646-3677; desk/src/lib/desk/worked.ts:29-31 routes the linear units to it). Executed (/tmp/rc/scratch/cov.cjs): topicsOf('school') has 17 units a… |
| `L1-owen-17-MB2-2` The Topics ruler still labels a 17-year-old's units 'Year 5' to 'Year 9' (the Prepare fix… | minor | **56c9eede** | 56c9eede computes past = !!pastPathEnd(s) in Ruler (desk/src/maths/MathsTV.tsx:299) and draws the year only when t.year && !past (MathsTV.tsx:338), the same test Prepare uses (MathsTV.tsx:651, :690). tools/maths-tv-test.cjs:1245-1247 pins it (17-year-old: no class mb-ty; 12-year-old keeps Year n / Grade n); suite 77 pass 0 fail. |
| `L1-vojtech-18-MB4-2` Back from an off-desk row of the recovery list lands on Equivalent fractions | minor | **95abd6a9** | 95abd6a9 changed the paper handler: Back/Menu compute last = t ?? topics[topics.length-1] and at = prepareStops(s).findIndex(u => u.id === last.id), then o.nav('prepare', Math.max(0, at)) (desk/src/tv/keys.ts:558-563). On an off-desk row t is undefined (keys.ts:550-551), so Back lands on the list's last topic row's unit, not fo… |

Each fixing commit was checked an ancestor of HEAD (`git merge-base --is-ancestor`). "Fixed" is L1 evidence: the code at 6b189791 meets the row's acceptance; `resolved-verified` still needs live L2.

## Narrowed, still open

| Row | Commit | What is still missing |
| --- | --- | --- |
| `L1-matyas-19-MB3-5` | fa24f5d1 | The tex field is still computed and read by no screen: items.ts does not store tex for the typesetter, nor is the field (and the calc.ts:380-396 tex strings, with the frozen fixtures) dropped; only a comment was added. Needs an owner ruling to accept 'documented' as closing, or the drop plus frozen… |
| `L1-vojtech-18-MB4-1` | 5e79b0f7 | The statement's words (STATEMENTS can / canOf(code, system)) instead of, or beside, the bare code; the code alone means nothing on the TV. |

## Per pair

| Pair | Open before | Fixed | Recur | New | Open now | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| matyas-19 MB1 | 2 | 1 | 1 | 0 | 1 | L1-conditional |
| matyas-19 MB3 | 5 | 4 | 1 | 0 | 1 | L1-conditional |
| nela-12 MB2 | 2 | 0 | 2 | 0 | 2 | L1-conditional |
| nela-12 MB5 | 1 | 0 | 1 | 0 | 1 | L1-conditional |
| owen-17 MB2 | 2 | 2 | 0 | 0 | 0 | L1-pass (no row open) |
| owen-17 MB4 | 1 | 0 | 1 | 0 | 1 | L1-conditional |
| radka-41 MB4 | 1 | 0 | 1 | 0 | 1 | L1-conditional |
| radka-41 MB5 | 2 | 0 | 2 | 0 | 2 | L1-conditional |
| vojtech-18 MB4 | 3 | 1 | 2 | 0 | 2 | L1-conditional |

## Notes

- Two rows are closed on a stated alternative of their own acceptance, so the follow-up is a decision rather than work: L1-matyas-19-MB3-1 is fixed on the "failing that, the TV says working on Calculus 2 techniques is not line-checked" arm (52270a6a, e9ba938e); the line check itself (chain.ts) still reads Calculus 1 forms only. L1-matyas-19-MB3-2 is fixed on the "the line asks for the exact value" arm (fcccfa63); the rounding-tolerance arm was not taken.
- L1-owen-17-MB4-1 (typed paper rows lost on a phone reload) was judged on main's code only: nothing on main persists the rows, so it recurs; the held run's paper-draft files were not consulted.
- L1-matyas-19-MB3-5 was narrowed by a doc comment (fa24f5d1) and needs an owner ruling (store tex for the typesetter, drop the field, or accept "documented"). L1-vojtech-18-MB4-1 shows bare statement codes now; the row asks for the statement's words.
- The remaining open rows (recurs, nothing touched what they cite): matyas-19 MB1-1 (his own MA1 sheet is never marked), nela-12 MB2-1, MB2-2 and MB5-1, owen-17 MB4-1, radka-41 MB4-1, MB5-1 and MB5-2, vojtech-18 MB4-3.