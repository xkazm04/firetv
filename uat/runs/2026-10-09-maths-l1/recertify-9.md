# Recertify, round 9 — L1 run 2026-10-09-maths-l1

Rerun: `2026-10-09-maths-l1/recert-9`, **level L1 only (code re-walk on main c2dacc69, 2026-10-20)**; no model, no vision, no browser, no Fire TV, desk/data untouched, nothing under desk/ or tools/ changed by this round. Every row open in `recert-8/findings.json` (6 rows) was answered `fixed` or `recurs` with current file:line evidence at c2dacc69; the row a new commit claims to close (L1-radka-41-MB5-2, 25b8fdf4) was executed against the code in a scratch script outside the repo. Nothing here is `resolved-verified`: that needs live L2 evidence.

The stamps were written by `uat/driver/recertify.cjs` `writeBack()` into every run that holds an open row of the gap (`recert-1` to `recert-8`; the parent `findings.json` holds none of them open): a recurring row stays open with `recurrence` + 1, `recurred_as`, `recertify_run: 2026-10-09-maths-l1/recert-9`, `recertify_status: recurs` and `recertify_evidence`. Its restatement is in `recert-9/findings.json` (`recurs: 2026-10-09-maths-l1/recert-8/<id>`, carrying the same three `recertify_*` fields). Rerun ids are positional, so they are written `2026-10-09-maths-l1/recert-9/<id>`. OPEN.md was rewritten by `uat/driver/ledger.cjs` `writeStatus()` only.

Head of this round: **c2dacc69705874d892b7444918eaf3a8e3df3269** (c2dacc69), the local main tip. The previous round (recert-8) read ee7d6ac770ff1f6f4a10e03c5410aba688a423d7 (ee7d6ac7). 9 commits landed between ee7d6ac7 and main; every one was checked an ancestor of main.

## Reconcile: every commit the round was asked to stamp

| Commit | Row | Ancestor of main | Change present at c2dacc69 |
| --- | --- | --- | --- |
| 25b8fdf4 | MB5-2 radka | yes | learnerRecaps desk/src/tv/recapRows.ts:114-130, one block per entry desk/src/app/phone/page.tsx:873-881, fallback :882-884; tools/tv-recap-test.cjs:96-110 (60/0). **Narrows the row, does not close it** (below). |

None missing.

## The other commits since ee7d6ac7

| Commit | What | Ancestor of main | Touches a Math cite |
| --- | --- | --- | --- |
| f2bb1dd2 | uat: recert-12 (Essay) and recert-8 (Math) | yes | no (uat/ only) |
| 5aa1a604 | Essay table, piece wait line, x-ray paragraph | yes | no |
| eb97cef2 | Essay dictation listens in English (phone/page.tsx:409, :415, :827, :835; recogniserLang.ts) | yes | no (one-for-one line edits, no shift) |
| ca0c905c | shelf reachable under the rewrite and plan panels (phone/page.tsx:273-274 added) | yes | shifts phone/page.tsx cites after :272 by +2 |
| 6374a2e6, 012df48f | .docx hyphen and table rows | yes | no |
| 16ee1e98, c2dacc69 | /drop wording | yes | no |

No Math file other than desk/src/app/phone/page.tsx and desk/src/tv/recapRows.ts changed: `git diff --quiet ee7d6ac7 c2dacc69` holds for api/mark/route.ts, tv/keys.ts, rules/calc.ts, desk/items.ts, rules/school.ts, library/worked.ts, library/gcse.ts, library/gcse-cz.ts, library/paths.ts, session/store.ts and tv/screens.tsx.

## Counts

| | Rows | By severity |
| --- | --- | --- |
| Open before | 6 | 0 blocker, 0 major, 5 minor, 1 polish |
| Fixed (L1) | 0 | 0 blocker, 0 major, 0 minor, 0 polish |
| Recurs | 6 | 0 blocker, 0 major, 5 minor, 1 polish |
| New | 0 | 0 blocker, 0 major, 0 minor, 0 polish |
| Open after | 6 | 0 blocker, 0 major, 5 minor, 1 polish |

OPEN.md Math 6 -> 6 (the rows now carry `recert-9` ids and recurrence + 1; the section line reads "6 open in 5 pairs across 10 runs", was 9 runs); total open 256 -> 256. The Linga and Essay sections of OPEN.md are byte for byte unchanged: Linga sha256 2a273aabbf8fcc3ba868809183e2b1257fd14fc1a85779ba4324112cffc46a15 before and after, Essay Master sha256 cca666e75d431fe5ff0e1571bf704785a92ec68b22acea9d00c05b36f1795cb8 before and after (a section is its `# <Module>` line up to the next module's `# ` line). The Math section's sha256 went 9f25eea90cc0c0f66ce63af952eeea9793a733aeecd7766c86d0b059a2f91250 -> 0e396192fa7298749482cc08187353f983bb96057609634355d48ae28864edb9. Before this round, `statusOf(ledger())` reproduced OPEN.md byte for byte, so the rewrite carries no drift from elsewhere. Every fixed row names its commit (0 of 0).

## Pair verdicts now

| Pair | At recert-8 | Now | Walk |
| --- | --- | --- | --- |
| matyas-19 MB1 | L1-conditional | L1-conditional | [matyas-19--MB1.md](recert-9/matyas-19--MB1.md) |
| matyas-19 MB3 | L1-conditional | L1-conditional | [matyas-19--MB3.md](recert-9/matyas-19--MB3.md) |
| nela-12 MB2 | L1-conditional | L1-conditional | [nela-12--MB2.md](recert-9/nela-12--MB2.md) |
| radka-41 MB5 | L1-conditional | L1-conditional | [radka-41--MB5.md](recert-9/radka-41--MB5.md) |
| vojtech-18 MB4 | L1-conditional | L1-conditional | [vojtech-18--MB4.md](recert-9/vojtech-18--MB4.md) |

## Fixed (L1: the fix has landed in code; not resolved-verified)

None. The row this round was cut to stamp, `L1-radka-41-MB5-2`, is narrowed, not fixed: see the next table.

## Narrowed (still open)

| Row | Commit | What is still missing |
| --- | --- | --- |
| `L1-radka-41-MB5-2` | 25b8fdf4 | learnerRecaps (desk/src/tv/recapRows.ts:114-130) gives one entry per profile whose tiles have work tonight and the phone Recap draws one block each (phone/page.tsx:873-881). But an away learner is read off their MathsSlot with `history: []` and no English sessions (recapRows.ts:121-123), and the maths tile is empty unless there is a tonight history line or a hint (recapRows.ts:93). Executed (scratch /tmp/rc13/recaps.cjs, outside the repo; Ada seated with a set tonight): Ben away with 2 hints -> blocks [ada, ben]; Ben away with a set marked at 18:00 and no hint -> [ada]; Ben away with a logged problem and no hint -> [ada]. So a child who did a set without a hint, a page, a reading or a talk and then gave the desk to a sibling has no block: "every learner with work tonight" holds only when the away learner's work shows as a hint. The commit's test (tools/tv-recap-test.cjs:96-110) gives every away learner hints. What closes it: the away learner's tonight history lines (and English talks) reach learnerRecaps, from the session or a phone-side read of each learner's history. |
| `L1-vojtech-18-MB4-3` | e9c5ee8f | Unchanged since recert-8: A26-A28 exist (desk/src/lib/library/gcse.ts:85-87, gcse-cz.ts:61-63) and map to no unit; needs an owner ruling or new units. |

## Still open (nothing touched what they cite, or a commit narrowed only a part)

| Finding | Sev. | Title | Evidence at the new head |
| --- | --- | --- | --- |
| `2026-10-09-maths-l1/recert-9/L1-matyas-19-MB1-1` | minor · rank 6 | His own weekly MA1 sheet can be hinted but never marked; only the desk's own six-question… | sendWorking (desk/src/app/phone/page.tsx:424) still posts only {image,w,h} to /api/mark (:429), the typed call (:448) posts answers; route.ts:64 "Start a practice set first."; no client sends a page id to the body.page arm (route.ts:12-14). Waits on the vision path. phone/page.tsx:422 -> 424 (ca0c905c's +2 at :273). |
| `2026-10-09-maths-l1/recert-9/L1-matyas-19-MB3-5` | polish · rank 1 | question(spec).tex is computed for every Calculus spec and read by no screen | calc.ts:380 still returns tex, items.ts:575 stores plain only; both files unchanged. **Waits on an owner ruling.** |
| `2026-10-09-maths-l1/recert-9/L1-nela-12-MB2-1` | minor · rank 6 | Add and subtract fractions, tier 2, uses elevenths with common bottoms up to 132; 6. ročn… | school.ts:2798 and :3040 unchanged (median 36, max 132); no teacher sign-off in code or uat/. **Waits on a teacher.** |
| `2026-10-09-maths-l1/recert-9/L1-nela-12-MB2-2` | minor · rank 6 | Unsimplified sums are ticked right, while the worked lesson teaches "then simplify" | worked.ts:15 "then simplify", school.ts:1588 tail only when s.form === "simplest"; both unchanged. **Waits on an owner ruling.** |
| `2026-10-09-maths-l1/recert-9/L1-radka-41-MB5-2` | minor · rank 6 | The recap and the week cover only the child seated now | Narrowed by 25b8fdf4 (above). |
| `2026-10-09-maths-l1/recert-9/L1-vojtech-18-MB4-3` | minor · rank 6 | The only inequality statement is the linear A22; a quadratic or logarithmic inequality, o… | Narrowed by e9c5ee8f, unchanged. **Waits on an owner ruling** (accept "Not on the desk yet" for A26-A28) or new units. |

## Regressed

None. No pair's code verdict dropped and no fixed row came back; the rows fixed at earlier rounds were not re-walked (the rules suites cover them in the merge gate, `cd desk && npm run test:rules`). Suites run at c2dacc69 for this round: tools/tv-recap-test.cjs 60/0, tools/phone-panel-test.cjs 114/0, tools/maths-tv-test.cjs 86/0, tools/tv-keys-test.cjs 80/0, tools/week-digest-test.cjs 32/0, tools/gcse-rules-test.cjs 6/0, tools/school-stretch-test.cjs 13/0, tools/paper-draft-test.cjs 4/0.

## New findings for the next drain

None filed. The gap 25b8fdf4 leaves is the open row's own remainder, so it is restated on `L1-radka-41-MB5-2` rather than filed new. Two notes for whoever cuts the next delivery on it: the row's title also names the week, and the Week (phone/page.tsx:886) and the TV recap (tv/screens.tsx:331) are still seated-only, but the acceptance asks for the phone Recap only; and the case to add to tools/tv-recap-test.cjs is an away learner with a set marked tonight and no hint, which is red at c2dacc69. The recert-8 note on the Paper draft not being cleared by Send still stands (PaperPanel.tsx unchanged since ee7d6ac7).

## Method

Every row open in recert-8 (6) was re-walked at c2dacc69. A cite is a line of recert-8's evidence re-mapped through `git diff -U0 ee7d6ac7 c2dacc69` per file by a scratch script (/tmp/rc13/cites.cjs, outside the repo); a cite inside a replaced hunk (the phone Recap block, 25b8fdf4) was re-read by hand against its replacement. Every commit named was checked an ancestor of main with `git merge-base --is-ancestor`. The row the new commit claims to close was executed: /tmp/rc13/recaps.cjs loads desk/src/tv/recapRows.ts through tools/ts-load.cjs and calls learnerRecaps on five sessions (seated with a set and an away learner with hints / with a marked set and no hint / with a logged problem and no hint; seated alone; nobody seated and an away learner with hints). OPEN.md's sections were hashed before and after by /tmp/rc13/sections.cjs. Suites at c2dacc69: as under Regressed.

## Confounded - do not read as a regression

| Confound | Covers | Run pair |
| --- | --- | --- |
| Walker and instrument are the same kind as recert-8 (an L1 code walk by the builder session); the product moved in one Math commit (25b8fdf4) and seven Essay or phone commits that shift phone/page.tsx lines only. 0 rows fixed: 25b8fdf4 narrows L1-radka-41-MB5-2, and the other five rows wait on an owner ruling (MB2-2, MB3-5, MB4-3), a teacher (MB2-1) or the vision path (MB1-1). | all rows | 2026-10-09-maths-l1/recert-8 -> 2026-10-09-maths-l1/recert-9 |
