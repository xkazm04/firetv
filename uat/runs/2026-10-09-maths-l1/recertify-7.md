# Recertify, round 7 — L1 run 2026-10-09-maths-l1

Rerun: `2026-10-09-maths-l1/recert-7`, **level L1 only (code re-walk on main ffa91a49, 2026-10-19)**; no model, no vision, no browser, desk/data untouched, nothing under desk/, tools/ or phone/ changed. Every row open in `recert-6/findings.json` (11 rows) was answered `fixed` or `recurs` with current file:line evidence at ffa91a49; the rows the new commits claim to close were executed against their tests and, for the language check, a fresh probe. Nothing here is `resolved-verified`: that needs live L2 evidence.

The stamps were written by `uat/driver/recertify.cjs` `writeBack()` into every run that holds an open row of the gap (the parent `findings.json` and `recert-1` to `recert-6`): a fixed row carries `resolution: fixed`, `recertify_status: not-seen`, `recertify_run: 2026-10-09-maths-l1/recert-7` and `recertify_evidence` with the fixing commit; a recurring row stays open with `recurrence` + 1 and `recurred_as`. Its restatement is in `recert-7/findings.json` (`recurs: 2026-10-09-maths-l1/recert-6/<id>`). Rerun ids are positional, so they are written `2026-10-09-maths-l1/recert-7/<id>`.

Head of this round: **ffa91a4938aa490c91a8c709d097d55f72a3b2f7** (ffa91a49), the local main tip. The previous round (recert-6) read 6b1897912bab71ae7197ad4064f40fff5db2e1e9 (6b189791).

## Counts

| | Rows | By severity |
| --- | --- | --- |
| Open before | 11 | 0 blocker, 0 major, 10 minor, 1 polish |
| Fixed (L1) | 3 | 0 blocker, 0 major, 3 minor, 0 polish |
| Recurs | 8 | 0 blocker, 0 major, 7 minor, 1 polish |
| New | 0 | 0 blocker, 0 major, 0 minor, 0 polish |
| Open after | 8 | 0 blocker, 0 major, 7 minor, 1 polish |

OPEN.md Math 11 -> 8; total open 270 -> 264 once both modules are recorded (the other module's note holds its own half). The Linga section of OPEN.md is byte for byte unchanged (checked with git diff against the file before the rewrite). Every fixed row names its commit (3 of 3).

## Pair verdicts now

| Pair | At recert-6 | Now | Walk |
| --- | --- | --- | --- |
| matyas-19 MB1 | L1-conditional | L1-conditional | [matyas-19--MB1.md](recert-7/matyas-19--MB1.md) |
| matyas-19 MB3 | L1-conditional | L1-conditional | [matyas-19--MB3.md](recert-7/matyas-19--MB3.md) |
| nela-12 MB2 | L1-conditional | L1-conditional | [nela-12--MB2.md](recert-7/nela-12--MB2.md) |
| nela-12 MB5 | L1-conditional | L1-conditional | [nela-12--MB5.md](recert-7/nela-12--MB5.md) |
| owen-17 MB4 | L1-conditional | L1-conditional | [owen-17--MB4.md](recert-7/owen-17--MB4.md) |
| radka-41 MB4 | L1-conditional | L1-pass (no row open) | [radka-41--MB4.md](recert-7/radka-41--MB4.md) |
| radka-41 MB5 | L1-conditional | L1-conditional | [radka-41--MB5.md](recert-7/radka-41--MB5.md) |
| vojtech-18 MB4 | L1-conditional | L1-conditional | [vojtech-18--MB4.md](recert-7/vojtech-18--MB4.md) |

## Fixed (L1: the fix has landed in code; not resolved-verified)

| Row | Sev. | Fixed by | What the code does now |
| --- | --- | --- | --- |
| `L1-radka-41-MB4-1` A cz parent picks Czech statements, but the TV and the Prepare line echo the English stat… | minor | **56f903ae** | 56f903ae (ancestor of HEAD) routes every statement the row named through canOf(code, system): paperView's off rows take can: canOf(o.code, system) with o.can as the fallback (desk/src/tv/paperRows.ts:50) with the seated learner's system from systemOf; the flag is beyondFlag(sys) (paperRows.ts:20, ' · těžší tvrzení' for cz, MathsTV.tsx:737); aimLine(p, system) (desk/src/tv/mathsRows.ts:375-376, called MathsTV.tsx:800) and aimBlock(aim, system) (desk/src/lib/desk/items.ts:100, call sites :210-211) print canOf. tools/maths-tv-test.cjs 'paper 10' renders th… |
| `L1-radka-41-MB5-1` Setting up a child takes 24 remote presses past 'Calculus 2' and 'Back' (the silent UK de… | minor | **3240d025** | 3240d025 (ancestor of HEAD) is the second arm of the acceptance ('the TV rows start on the likely value'): in the profile handler a pick now moves the lamp to the next row's current or likely cell (desk/src/tv/keys.ts:375-380 pick(), likelyIx desk/src/tv/profileRows.ts:92-104: the middle of the age range, Family, the system's default, the first course), and the 'Maths course' row is not offered to an elementary child unless the draft already holds a course (profileRows.ts:87). tools/tv-keys-test.cjs 'profile setup (L1-radka-41-MB5-1, TV half)' walks a 1… |
| `L1-vojtech-18-MB4-1` The TV never shows which statement led a question to a topic (topics[].codes unwired) | minor | **da6f9f07** | da6f9f07 (ancestor of HEAD) gave PaperTopic a `said` list (desk/src/tv/paperRows.ts:15, :49: canOf(code, system) per code, the learner's language) and the topic row draws ' · led by ' + t.said.join('; ') instead of the codes (desk/src/maths/MathsTV.tsx:753). tools/maths-tv-test.cjs 'paper 9' renders a pct-of-amount row and asserts the statement words, not 'led by N12', for uk and for a cz learner (Czech words differ); maths-tv 78/0. The row's acceptance (each topic row names the statement's can text it came through) is met. |

## Narrowed (still open)

| Row | Commit | What is still missing |
| --- | --- | --- |
| `L1-vojtech-18-MB4-3` | e9c5ee8f | they are mapped to no unit, because no school unit teaches them (touches is [] on purpose; the only domain pages are Calculus 1's): a question that tests them lands in 'Not on the desk yet' with a 'harder statement' flag, not on a lesson. The acceptance asks for the units that teach them. |

## Still open (nothing touched what they cite, or a commit narrowed only a part)

| Finding | Sev. | Title | Evidence at the new head |
| --- | --- | --- | --- |
| `2026-10-09-maths-l1/recert-7/L1-matyas-19-MB1-1` | minor · rank 6 | His own weekly MA1 sheet can be hinted but never marked; only the desk's own six-question… | Re-walked at ffa91a49; what the previous walk found (at 6b189791) still holds: Cited lines re-found at 6b189791 and unchanged in substance: phone/page.tsx:401-406 sendWorking still posts only {image,w,h} to /api/mark (the other /api/mark call, :425, posts typed answers); api/mark/route.ts:62 still answers 'Start a practice set first.' with no practice, so h… |
| `2026-10-09-maths-l1/recert-7/L1-matyas-19-MB3-5` | polish · rank 1 | question(spec).tex is computed for every Calculus spec and read by no screen | Re-walked at ffa91a49; what the previous walk found (at 6b189791) still holds: narrowed by fa24f5d1; still missing: The tex field is still computed and read by no screen: items.ts does not store tex for the typesetter, nor is the field (and the calc.ts:380-396 tex strings, with the frozen fixtures) dropped; only a comment was added. Needs an owner ruling to… |
| `2026-10-09-maths-l1/recert-7/L1-nela-12-MB2-1` | minor · rank 6 | Add and subtract fractions, tier 2, uses elevenths with common bottoms up to 132; 6. ročn… | Re-walked at ffa91a49; what the previous walk found (at 6b189791) still holds: Cited lines re-found at 6b189791 unchanged: school.ts:2798 gen(seed,tier) and school.ts:3040 'frac-add-sub': genMixedAddSub(seed) still draw tier-2 common bottoms beyond a 6. rocnik hand range; no teacher sign-off exists in code (school.ts diff since c4893c88 only appends linearW… |
| `2026-10-09-maths-l1/recert-7/L1-nela-12-MB2-2` | minor · rank 6 | Unsimplified sums are ticked right, while the worked lesson teaches "then simplify" | Re-walked at ffa91a49; what the previous walk found (at 6b189791) still holds: Cited lines re-found at 6b189791: library/worked.ts:15 still teaches 'Add or take away the tops, then simplify' while school.ts:1588 adds the simplest-form tail only when s.form === 'simplest', so an unsimplified sum is still ticked. 6b189791 only adds new linear-equation entries… |
| `2026-10-09-maths-l1/recert-7/L1-nela-12-MB5-1` | minor · rank 3 | A 12-year-old in 6. ročník is taken for 7. ročník (schoolYear ignores the cut-off) | Re-walked at ffa91a49; what the previous walk found (at 6b189791) still holds: Cited lines re-found at 6b189791, files untouched since c4893c88: syllabus.ts:302-304 schoolYear(system,age) is still age - SYSTEM_START[system] + 1 with no cut-off, and stretch.ts:74-78 learnerYear calls it; there is still no school-year pick on the profile, so a 12-year-old in… |
| `2026-10-09-maths-l1/recert-7/L1-owen-17-MB4-1` | minor · rank 6 | 31 typed paper rows live only in React state: a phone reload or tab discard loses them | Re-walked at ffa91a49; what the previous walk found (at 6b189791) still holds: Judged on main's code only. desk/src/app/phone/page.tsx:71 is still useState<DraftRow[]>(() => [blankRow()]); nothing in page.tsx writes the rows to localStorage/sessionStorage (:200 localStorage only removes desk.pin); :562 hands rows/setRows to PaperPanel as plain React state.… |
| `2026-10-09-maths-l1/recert-7/L1-radka-41-MB5-2` | minor · rank 6 | The recap and the week cover only the child seated now | Re-walked at ffa91a49; what the previous walk found (at 6b189791) still holds: Cited lines re-found at 6b189791: recapRows.ts:77-78 recapRows(session, now) wraps the seated session's log in tonightsLog; the phone Recap block (page.tsx:757-768) is one block titled with s.learner's name, tiles from recapRows(s, now). No other learner's evening is listed. None… |
| `2026-10-09-maths-l1/recert-7/L1-vojtech-18-MB4-3` | minor · rank 6 | The only inequality statement is the linear A22; a quadratic or logarithmic inequality, o… | e9c5ee8f added the three statements (gcse.ts:85-87, flagged foundation false, touches []) and their Czech wording (gcse-cz.ts:61-63); tools/gcse-rules-test.cjs pins them (6 pass 0 fail). Executed: STATEMENTS.filter(s => ['A26','A27','A28'].includes(s.code)).every(s => !s.touches.length) is true, so recovery() sends a lost mark on one of them to notOnDesk. T… |

## Regressed

None. A regression would be a pair whose code verdict dropped, or a row that was fixed and came back; the rows fixed at earlier rounds were not re-walked. The rules suites run in the merge gate (`cd desk && npm run test:rules`).

## New findings for the next drain

None filed. The phone picker's English '(a harder statement)' tag (desk/src/app/phone/PaperPanel.tsx:37) is residue of L1-radka-41-MB4-1 outside the acceptance's list, noted in the insight doc, not filed.

## Method

Every row open in recert-6 (11) was re-walked at ffa91a49. A cite is a line of recert-6's evidence re-mapped through `git diff -U0 6b189791 ffa91a49` per file; every commit named was checked an ancestor of HEAD. The four rows the new commits claim to close were executed against the tests that pin them (tools/maths-tv-test.cjs 78/0, tools/paper-aim-test.cjs 17/0, tools/tv-keys-test.cjs 59/0, tools/gcse-rules-test.cjs 6/0, run at ffa91a49, no model). A split row was scored on its own text: L1-vojtech-18-MB4-3 is narrowed, not fixed (the statements exist, no unit teaches them). Commits since 6b189791: 56f903ae (items.ts, MathsTV.tsx, mathsRows.ts, paperRows.ts), da6f9f07 (MathsTV.tsx, paperRows.ts), 3240d025 (keys.ts, profileRows.ts), e9c5ee8f (gcse.ts, gcse-cz.ts), and the three Essay commits that touch no Math file.

## Confounded - do not read as a regression

| Confound | Covers | Run pair |
| --- | --- | --- |
| Walker and instrument are the same kind as recert-6 (an L1 code walk by the builder session); the product moved in four Math commits (56f903ae, da6f9f07, 3240d025, e9c5ee8f), which is why three rows are fixed and one narrowed. Two rows are closed on one arm of a split acceptance (L1-radka-41-MB5-1 on the TV arm; L1-radka-41-MB4-1 on the three sites its acceptance lists, with the phone picker's '(a harder statement)' tag left in English). | all rows | 2026-10-09-maths-l1/recert-6 -> 2026-10-09-maths-l1/recert-7 |
