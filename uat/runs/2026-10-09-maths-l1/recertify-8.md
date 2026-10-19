# Recertify, round 8 — L1 run 2026-10-09-maths-l1

Rerun: `2026-10-09-maths-l1/recert-8`, **level L1 only (code re-walk on main ee7d6ac7, 2026-10-20)**; no model, no vision, no browser, desk/data untouched, nothing under desk/, tools/ or phone/ changed by this round. Every row open in `recert-7/findings.json` (8 rows) was answered `fixed` or `recurs` with current file:line evidence at ee7d6ac7; the rows the new commits claim to close were executed against their tests. Nothing here is `resolved-verified`: that needs live L2 evidence.

The stamps were written by `uat/driver/recertify.cjs` `writeBack()` into every run that holds an open row of the gap (the parent `findings.json` and `recert-1` to `recert-7`): a fixed row carries `resolution: fixed`, `recertify_status: not-seen`, `recertify_run: 2026-10-09-maths-l1/recert-8` and `recertify_evidence` with the fixing commit; a recurring row stays open with `recurrence` + 1 and `recurred_as`. Its restatement is in `recert-8/findings.json` (`recurs: 2026-10-09-maths-l1/recert-7/<id>`). Rerun ids are positional, so they are written `2026-10-09-maths-l1/recert-8/<id>`. OPEN.md was rewritten by `uat/driver/ledger.cjs` `writeStatus()` only.

Head of this round: **ee7d6ac770ff1f6f4a10e03c5410aba688a423d7** (ee7d6ac7), the local main tip. The previous round (recert-7) read ffa91a4938aa490c91a8c709d097d55f72a3b2f7 (ffa91a49). 43 commits landed between f788a5dd and main; every one was checked an ancestor of main.

## Reconcile: every commit the round was asked to stamp

| Commit | Row | Ancestor of main | Change present at ee7d6ac7 |
| --- | --- | --- | --- |
| da6f9f07 | MB4-1 vojtech | yes | `said` desk/src/tv/paperRows.ts:15, :49, drawn desk/src/maths/MathsTV.tsx:757 (stamped fixed at recert-7) |
| 3240d025 | MB5-1 radka (TV half) | yes | likelyIx desk/src/tv/profileRows.ts:117, used desk/src/tv/keys.ts:445 (stamped fixed at recert-7) |
| e9c5ee8f | MB4-3 | yes | A26-A28 desk/src/lib/library/gcse.ts:85-87, gcse-cz.ts:61-63; still unmapped to a unit, row stays open |
| 7f74afb3 | MB5-1 nela | yes | Profile.year store.ts:49, School year row profileRows.ts:99-103, learnerYear stretch.ts:75-79; tools/school-stretch-test.cjs 13/0 |
| d5857318 | MB4-1 owen | yes | keepDraft desk/src/app/phone/page.tsx:477-492, desk/src/lib/rules/paperDraft.ts; tools/paper-draft-test.cjs 4/0 (with d164089b, also an ancestor) |

None missing.

## The TV-led work and the lite r3 reworks

| Work | Commits | Ancestor of main |
| --- | --- | --- |
| TL-1 | ba1899bb | yes |
| TL-2 | d585d9fe | yes |
| TL-3 | f9e9593f | yes |
| TL-4 | afa4a488 | yes |
| TL-5 | 1ce95935 | yes |
| TL-6 | a9ef8747 | yes |
| TL-7 | 562811ec | yes |
| TL-8 | d2b8812e | yes |
| TL-9 | 955f0f58 | yes |
| TL-10 | b09c86fb | yes |
| TL-11 | 618819b7, cb0acb71, 7ea64626 | yes |
| TL-12 | 8060bedb, b65d7d77 | yes |
| TL-13 | 1ce6815f | yes |
| lite r3 reworks (tv-phone-pairing) | 17caa213, 8060bedb, plus 3f7ecb09, 51c5a406, 1601ce3b, 67908789, bcb165e3, 2cfcc0b5, 2ba0e400, cb477f93 | yes |

The TV-led work moved the Essay and Math screens the open rows cite (desk/src/tv/keys.ts, desk/src/essay/EssayTV.tsx, desk/src/maths/MathsTV.tsx, desk/src/app/phone/page.tsx, panelFor.ts, phoneBar.ts; the phone page grew by about 300 lines). Every cited screen still exists; each cite was re-found at its new line (the table below and the per-pair files name the moves) and none of the TL commits closes a row except where a row says so: no Math row closes on a TL commit (TL-6 and TL-13 moved the hand-off to the TV but left the MB rows' acceptances unchanged). 

## Counts

| | Rows | By severity |
| --- | --- | --- |
| Open before | 8 | 0 blocker, 0 major, 7 minor, 1 polish |
| Fixed (L1) | 2 | 0 blocker, 0 major, 2 minor, 0 polish |
| Recurs | 6 | 0 blocker, 0 major, 5 minor, 1 polish |
| New | 0 | 0 blocker, 0 major, 0 minor, 0 polish |
| Open after | 6 | 0 blocker, 0 major, 5 minor, 1 polish |

OPEN.md Math 8 -> 6; total open 264 -> 256 once both modules are recorded (the other module's note holds its own half). The Linga section of OPEN.md is byte for byte unchanged (sha256 of the section 2a273aabbf8fcc3ba868809183e2b1257fd14fc1a85779ba4324112cffc46a15 before and after). Every fixed row names its commit (2 of 2).

## Pair verdicts now

| Pair | At recert-7 | Now | Walk |
| --- | --- | --- | --- |
| matyas-19 MB1 | L1-conditional | L1-conditional | [matyas-19--MB1.md](recert-8/matyas-19--MB1.md) |
| matyas-19 MB3 | L1-conditional | L1-conditional | [matyas-19--MB3.md](recert-8/matyas-19--MB3.md) |
| nela-12 MB2 | L1-conditional | L1-conditional | [nela-12--MB2.md](recert-8/nela-12--MB2.md) |
| nela-12 MB5 | L1-conditional | L1-pass (no row open) | [nela-12--MB5.md](recert-8/nela-12--MB5.md) |
| owen-17 MB4 | L1-conditional | L1-pass (no row open) | [owen-17--MB4.md](recert-8/owen-17--MB4.md) |
| radka-41 MB5 | L1-conditional | L1-conditional | [radka-41--MB5.md](recert-8/radka-41--MB5.md) |
| vojtech-18 MB4 | L1-conditional | L1-conditional | [vojtech-18--MB4.md](recert-8/vojtech-18--MB4.md) |

## Fixed (L1: the fix has landed in code; not resolved-verified)

| Row | Sev. | Fixed by | What the code does now |
| --- | --- | --- | --- |
| `L1-nela-12-MB5-1` A 12-year-old in 6. ročník is taken for 7. ročník (schoolYear ignores the cut-off) | minor | **7f74afb3** | 7f74afb3 (ancestor of HEAD) adds the school-year pick the acceptance names: Profile.year (desk/src/lib/session/store.ts:49) is the learner's own year, the store drops it when it does not fit the type and system and clears it when type, system or age change under it (:772-773); the TV profile has a School year row (desk/src/tv/profileRows.ts:99-103, yearOf :22 reads the pick before the age-derived year; the lamp passes the row, keys.ts:442-444, and a pick sets {year}, :451); learnerYear prefers it (desk/src/lib/rules/stretch.ts:75-79, `who.year` before schoolYear), recovery's Reader carries it (desk/src/lib/rules/recovery.ts readerOf, destinations `at.year ?? schoolYear(...)`), and the pract… |
| `L1-owen-17-MB4-1` 31 typed paper rows live only in React state: a phone reload or tab discard loses them | minor | **d5857318** | d5857318 (ancestor of HEAD) keeps the typed Paper rows in the phone's localStorage per seated learner: keepDraft writes them on every edit (desk/src/app/phone/page.tsx:477-485, through editPaperRows which PaperPanel now gets as setRows, :673) and an effect restores the seated learner's own draft on load (:487-492); the key, serialise and parse are pure in desk/src/lib/rules/paperDraft.ts (draftKey, serialiseDraft returns null for all-blank rows, parseDraft returns null for anything but a version-1 draft); every storage call is in try/catch. d164089b (ancestor) takes keepDraft out of the learner-switch reset so the outgoing learner's draft is not overwritten with a blank row. tools/paper-dra… |

## Narrowed (still open)

| Row | Commit | What is still missing |
| --- | --- | --- |
| `L1-vojtech-18-MB4-3` | e9c5ee8f | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: narrowed by e9c5ee8f, unchanged since: the statements A26-A28 exist (desk/src/lib/library/gcse.ts:85-87, flagged foundation false, touches []) with Czech wording (desk/src/lib/library/gcse-cz.ts:61-63), and git log e9c5ee8f..HEAD finds no commit on gcse.ts, gcse-cz.ts, paths.ts or school.ts. They map to no unit because no school unit teaches them (the only domain pages are Calculus 1's), so a question that tests them lands in "Not on the desk yet" with the harder-statement flag. The acceptance asks for the units that teach them. Cites re-mapped through git diff -U0 ffa91a49 ee7d6ac7 per file. None of the 43 commi… |

## Still open (nothing touched what they cite, or a commit narrowed only a part)

| Finding | Sev. | Title | Evidence at the new head |
| --- | --- | --- | --- |
| `2026-10-09-maths-l1/recert-8/L1-matyas-19-MB1-1` | minor · rank 6 | His own weekly MA1 sheet can be hinted but never marked; only the desk's own six-question… | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: sendWorking (desk/src/app/phone/page.tsx:422) still posts only {image,w,h} to /api/mark (:427) and the typed-answers call (:446) posts answers; desk/src/app/api/mark/route.ts:64 still answers "Start a practice set first." with no practice, and the ro… |
| `2026-10-09-maths-l1/recert-8/L1-matyas-19-MB3-5` | polish · rank 1 | question(spec).tex is computed for every Calculus spec and read by no screen | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: desk/src/lib/rules/calc.ts:380 question() still returns tex for every Calculus spec and desk/src/lib/desk/items.ts:575 kept.push({ spec, question: q.plain, tier }) stores plain only; neither stored nor dropped. Needs an owner ruling to accept "docume… |
| `2026-10-09-maths-l1/recert-8/L1-nela-12-MB2-1` | minor · rank 6 | Add and subtract fractions, tier 2, uses elevenths with common bottoms up to 132; 6. ročn… | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: desk/src/lib/rules/school.ts:2798 gen(seed, tier) and :3040 "frac-add-sub": genMixedAddSub(seed) still draw tier-2 common bottoms beyond a 6. rocnik hand range (median 36, max 132); no teacher sign-off exists in code or in uat/. Cites re-mapped throu… |
| `2026-10-09-maths-l1/recert-8/L1-nela-12-MB2-2` | minor · rank 6 | Unsimplified sums are ticked right, while the worked lesson teaches "then simplify" | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: desk/src/lib/library/worked.ts:15 still teaches "Add or take away the tops, then simplify" while desk/src/lib/rules/school.ts:1588 adds the simplest-form tail only when s.form === "simplest", so an unsimplified sum is still ticked right. Needs the ow… |
| `2026-10-09-maths-l1/recert-8/L1-radka-41-MB5-2` | minor · rank 6 | The recap and the week cover only the child seated now | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: the phone Recap (desk/src/app/phone/page.tsx:866-877) is one block titled for the seated learner (`${s.learner.name}, tonight`) with tiles from recapRows(s, now) (desk/src/tv/recapRows.ts:78), which wraps the seated session's log in tonightsLog; no o… |

## Regressed

None. A regression would be a pair whose code verdict dropped, or a row that was fixed and came back; the rows fixed at earlier rounds were not re-walked (the rules suites cover them in the merge gate, `cd desk && npm run test:rules`). Suites run at ee7d6ac7 for this round: tools/essay-rules-test.cjs 161/0, tools/essay-piece-test.cjs 50/0, tools/week-digest-test.cjs 32/0, tools/tv-keys-test.cjs 80/0, tools/phone-panel-test.cjs 112/0, tools/phone-shell-test.cjs 17/0, tools/maths-tv-test.cjs 86/0, tools/gcse-rules-test.cjs 6/0, tools/school-stretch-test.cjs 13/0, tools/paper-draft-test.cjs 4/0.

## New findings for the next drain

None filed. One observation, not filed because it was true before the fix and the acceptance (persist until sent) is met: the Paper draft is not cleared by Send (PaperPanel.tsx:70 posts paper.enter and leaves the rows), so after a send a reload restores the sent rows until they are edited or removed. A one-line `setRows([blankRow()])` after a successful send would close it; it belongs in the next delivery that touches PaperPanel.

## Method

Every row open in recert-7 (8) was re-walked at ee7d6ac7. A cite is a line of recert-7's evidence re-mapped through `git diff -U0 ffa91a49 ee7d6ac7` per file by a scratch script (/tmp/rc12/cites.cjs, outside the repo); a cite inside a replaced hunk or in a rewritten screen was re-read by hand against its replacement, and a row is never closed on the absence of a screen. Every commit named was checked an ancestor of main with `git merge-base --is-ancestor`. The rows the new commits claim to close were executed against the code in scratch scripts (decideVerdicts, cleanFix, essayFileProblem, recapLine, the draft and year paths via their suites) and the suites that pin them. A split row was scored on its own text: `L1-vojtech-18-MB4-3` is unchanged (A26-A28 exist, no unit teaches them). Suites at ee7d6ac7: tools/essay-rules-test.cjs 161/0, tools/essay-piece-test.cjs 50/0, tools/week-digest-test.cjs 32/0, tools/tv-keys-test.cjs 80/0, tools/phone-panel-test.cjs 112/0, tools/phone-shell-test.cjs 17/0, tools/maths-tv-test.cjs 86/0, tools/gcse-rules-test.cjs 6/0, tools/school-stretch-test.cjs 13/0, tools/paper-draft-test.cjs 4/0.

## Confounded - do not read as a regression

| Confound | Covers | Run pair |
| --- | --- | --- |
| Walker and instrument are the same kind as recert-7 (an L1 code walk by the builder session); the product moved in three Math commits (7f74afb3, d5857318, d164089b) and the TV-led work, which is why 2 rows are fixed. L1-owen-17-MB4-1 closes on the persistence arm of its acceptance; the sent-draft clearing is noted, not filed. | all rows | 2026-10-09-maths-l1/recert-7 -> 2026-10-09-maths-l1/recert-8 |
