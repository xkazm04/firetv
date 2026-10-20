# Recertify, round 10 — L1 run 2026-10-09-maths-l1

Rerun: `2026-10-09-maths-l1/recert-10`, **level L1 only (code re-walk on main 67e0a3a6, 2026-10-20)**; no model, no vision, no browser, desk/data untouched, nothing under desk/ or tools/ changed by this round. Every row open in `recert-9/findings.json` (6 rows) was answered `fixed` or `recurs` with current file:line evidence at 67e0a3a6. Nothing here is `resolved-verified`: that needs live L2 evidence.

The stamps were written by `uat/driver/recertify.cjs` `writeBack()` into every run that holds an open row of the gap (the parent `findings.json` and `recert-1` to `recert-9`): a fixed row carries `resolution: fixed`, `recertify_status: not-seen`, `recertify_run: 2026-10-09-maths-l1/recert-10` and `recertify_evidence` with the fixing commit; a recurring row stays open with `recurrence` + 1 and `recurred_as`. Its restatement is in `recert-10/findings.json` (`recurs: 2026-10-09-maths-l1/recert-9/<id>`). OPEN.md was rewritten by `uat/driver/ledger.cjs` `writeStatus()` only.

Head of this round: **67e0a3a669a1a9e2412397a70c61774638f4ec0c** (67e0a3a6), the local main tip. The previous round (recert-9) read c2dacc69705874d892b7444918eaf3a8e3df3269 (c2dacc69). Commits since: the Essay commits up to 67e0a3a6, the Essay recert-13 commit, and 5358ddeb (L1-radka-41-MB5-2), which is the one Math commit; checked an ancestor of main with git merge-base --is-ancestor. Every file the other five Math rows cite is unchanged (git diff c2dacc69 67e0a3a6 is empty on them).

## Counts

| | Rows | By severity |
| --- | --- | --- |
| Open before | 6 | 0 blocker, 0 major, 5 minor, 1 polish |
| Fixed (L1) | 0 | 0 blocker, 0 major, 0 minor, 0 polish |
| Recurs | 6 | 0 blocker, 0 major, 5 minor, 1 polish |
| New | 0 | 0 blocker, 0 major, 0 minor, 0 polish |
| Open after | 6 | 0 blocker, 0 major, 5 minor, 1 polish |

Every fixed row names its commit (0 of 0).

## Pair verdicts now

| Pair | At previous round | Now | Walk |
| --- | --- | --- | --- |
| matyas-19 MB1 | L1-conditional | L1-conditional | [matyas-19--MB1.md](recert-10/matyas-19--MB1.md) |
| matyas-19 MB3 | L1-conditional | L1-conditional | [matyas-19--MB3.md](recert-10/matyas-19--MB3.md) |
| nela-12 MB2 | L1-conditional | L1-conditional | [nela-12--MB2.md](recert-10/nela-12--MB2.md) |
| radka-41 MB5 | L1-conditional | L1-conditional | [radka-41--MB5.md](recert-10/radka-41--MB5.md) |
| vojtech-18 MB4 | L1-conditional | L1-conditional | [vojtech-18--MB4.md](recert-10/vojtech-18--MB4.md) |

## Fixed (L1: the fix has landed in code; not resolved-verified)

None.

## Narrowed or corrected (still open)

| Row | Commit | What is still missing |
| --- | --- | --- |
| `L1-matyas-19-MB3-5` | fa24f5d1 (narrowed) | Re-walked at 67e0a3a6; what the previous walk (at c2dacc69) found still holds: desk/src/lib/rules/calc.ts:380 question() still returns tex for every Calculus spec and desk/src/lib/desk/items.ts:575 kept.push({ spec, question: q.plain, tier }) stores plain only; neither stored nor dropped. Waits on an owner ruling: accept "documented" as closing, or the drop plus frozen-fixture rewrite. git diff c2dacc69 67e0a3a6 is empty on every file this row cites. None of the commits since c2dacc69 (the Essay commits, 5358ddeb) changes what this row cites except as named. |
| `L1-radka-41-MB5-2` | 5358ddeb (narrowed) | Narrowed by 25b8fdf4 and 5358ddeb: learnerRecaps now reads an away learner's tonight history lines and English talks off their slot (store.ts slotOf/tonightOf, recapRows.ts:123-124), so the pure function gives each away case a block. But the phone never receives `away`: pairing.ts view() strips it from every phone and TV response ("No caller is sent the Math Buddy work of learners not at the desk"), so the phone Recap's learnerRecaps(s, now) (phone/page.tsx:881) sees only the seated learner. |
| `L1-vojtech-18-MB4-3` | e9c5ee8f (narrowed) | Re-walked at 67e0a3a6; what the previous walk (at c2dacc69) found still holds: narrowed by e9c5ee8f, unchanged since: the statements A26-A28 exist (desk/src/lib/library/gcse.ts:85-87, flagged foundation false, touches []) with Czech wording (desk/src/lib/library/gcse-cz.ts:61-63). They map to no unit because no school unit teaches them, so a question that tests them lands in "Not on the desk yet" with the harder-statement flag. Waits on an owner ruling (accept "Not on the desk yet" for A26-A28) or on new units. git diff c2dacc69 67e0a3a6 is empty on every file this row cites. None of the commits since c2dacc69 (the Essay commits, 5358ddeb) changes what this row cites except as named. |

## Still open

| Finding | Sev. | Title | Evidence at the new head |
| --- | --- | --- | --- |
| `2026-10-09-maths-l1/recert-10/L1-matyas-19-MB1-1` | minor · rank 6 | His own weekly MA1 sheet can be hinted but never marked; only the desk's own six-question sets are marked | recert-10 @67e0a3a6: Re-walked at 67e0a3a6; what the previous walk (at c2dacc69) found still holds: sendWorking (desk/src/app/phone/page.tsx:441) still posts only {image,w,h} to /api/mark and the typed-answers call (:460) posts answers; these are the only two /api/mark callers in desk/src. desk/src/app/api/mark/route.ts:64 still answers "Start a practice set first." with no practice, and the route's body.page arm (route.ts:12-14, :62) has no client that sends a page id. Waits on the vision path. git diff c2dacc69 67e0a3a6 is empty on every file this row cites (route.ts and tv/keys.ts); phone/page.tsx:424 -> 441, :429 -> 441, :448 -> 460 (the c2dacc69-to-67e0a3a6 hunks, 67e0a3a6's 11 lines at :276 among them). None of the commits since c2dacc69 (the Essay commits, 5358ddeb) changes what this row cites except as named. |
| `2026-10-09-maths-l1/recert-10/L1-matyas-19-MB3-5` | polish · rank 1 | question(spec).tex is computed for every Calculus spec and read by no screen | recert-10 @67e0a3a6: Re-walked at 67e0a3a6; what the previous walk (at c2dacc69) found still holds: desk/src/lib/rules/calc.ts:380 question() still returns tex for every Calculus spec and desk/src/lib/desk/items.ts:575 kept.push({ spec, question: q.plain, tier }) stores plain only; neither stored nor dropped. Waits on an owner ruling: accept "documented" as closing, or the drop plus frozen-fixture rewrite. git diff c2dacc69 67e0a3a6 is empty on every file this row cites. None of the commits since c2dacc69 (the Essay commits, 5358ddeb) changes what this row cites except as named. |
| `2026-10-09-maths-l1/recert-10/L1-nela-12-MB2-1` | minor · rank 6 | Add and subtract fractions, tier 2, uses elevenths with common bottoms up to 132; 6. ročník level needs a teacher's read | recert-10 @67e0a3a6: Re-walked at 67e0a3a6; what the previous walk (at c2dacc69) found still holds: desk/src/lib/rules/school.ts:2798 gen(seed, tier) and :3040 "frac-add-sub": genMixedAddSub(seed) still draw tier-2 common bottoms beyond a 6. rocnik hand range (median 36, max 132); no teacher sign-off exists in code or in uat/. Waits on a teacher: no code closes it. git diff c2dacc69 67e0a3a6 is empty on every file this row cites. None of the commits since c2dacc69 (the Essay commits, 5358ddeb) changes what this row cites except as named. |
| `2026-10-09-maths-l1/recert-10/L1-nela-12-MB2-2` | minor · rank 6 | Unsimplified sums are ticked right, while the worked lesson teaches "then simplify" | recert-10 @67e0a3a6: Re-walked at 67e0a3a6; what the previous walk (at c2dacc69) found still holds: desk/src/lib/library/worked.ts:15 still teaches "Add or take away the tops, then simplify" while desk/src/lib/rules/school.ts:1588 adds the simplest-form tail only when s.form === "simplest", so an unsimplified sum is still ticked right. Waits on an owner ruling (simplest form asked, or the lesson drops "then simplify"). git diff c2dacc69 67e0a3a6 is empty on every file this row cites. None of the commits since c2dacc69 (the Essay commits, 5358ddeb) changes what this row cites except as named. |
| `2026-10-09-maths-l1/recert-10/L1-radka-41-MB5-2` | minor · rank 6 | The recap and the week cover only the child seated now | recert-10 @67e0a3a6: Narrowed again by 5358ddeb (ancestor of main); not closed. The code half the recert-9 note named holds. Read: desk/src/lib/session/store.ts slotOf now ends with ...tonightOf(s) (:499-508: the history lines at or after local midnight and the English talks {at, turns} are kept in the MathsSlot of a learner who leaves, "never put back on the session"), emptyOf counts them so a slot with only a talk is kept (:509), and withSlot drops them on sitting back down (:511); desk/src/tv/recapRows.ts:123-124 reads them back (history: x.history ?? [], sessions from x.talks). Executed at 67e0a3a6 (scratch /tmp/rc14/ex.cjs and ex3.cjs outside the repo, loaded through tools/ts-load.cjs, no model; two profiles, Ema seated with a set tonight): Ben away with a set marked tonight and no hint -> [ema, ben], Ben's maths tile sets [5 of 6]; Ben away with only an English talk of 5 turns -> [ema, ben], talks [5]; Ben away with only yesterday's line and talk -> [ema]; Ben away with an empty slot -> [ema]; the present learner alone -> [ema] with the same tiles as before; the real store: reduce(learner.set jakub) from a session with one line tonight, one yesterday and a 6-turn talk leaves away.ema.history = ["Two-step equations"] and away.ema.talks = [{at, turns: 6}], and sitting back down leaves nothing of it on the session. So each away case yields a block from learnerRecaps. What is missing: the block never reaches the phone. The phone Recap renders learnerRecaps(s, now) (desk/src/app/phone/page.tsx:881) over the session the phone is sent, and every response to a phone or the TV passes through view() (desk/src/lib/session/pairing.ts:276 const { away: _away, week, ...seen } = s; the doc comment at :254 says no caller is sent the away work; session/route.ts:49, :63, :119-142 and session/stream/route.ts:53 all use it). Executed the same session through view(s, role): in-process and role null -> [ema, ben]; role phone -> [ema], no away key; role tv -> [ema]. So on the real phone an away learner still gets no block, and the acceptance (every learner with work tonight, one block each, on the phone Recap) is met only in process. tools/tv-recap-test.cjs 62/0 covers the pure function and the store, not the view. Closing it takes a ruling and a small code change: send the phone only the derived tonight tiles of the away learners (a new view field), or relax the away strip for the Recap alone; pairing.ts's privacy rule is the owner's. |
| `2026-10-09-maths-l1/recert-10/L1-vojtech-18-MB4-3` | minor · rank 6 | The only inequality statement is the linear A22; a quadratic or logarithmic inequality, or a domain, has no statement to pick | recert-10 @67e0a3a6: Re-walked at 67e0a3a6; what the previous walk (at c2dacc69) found still holds: narrowed by e9c5ee8f, unchanged since: the statements A26-A28 exist (desk/src/lib/library/gcse.ts:85-87, flagged foundation false, touches []) with Czech wording (desk/src/lib/library/gcse-cz.ts:61-63). They map to no unit because no school unit teaches them, so a question that tests them lands in "Not on the desk yet" with the harder-statement flag. Waits on an owner ruling (accept "Not on the desk yet" for A26-A28) or on new units. git diff c2dacc69 67e0a3a6 is empty on every file this row cites. None of the commits since c2dacc69 (the Essay commits, 5358ddeb) changes what this row cites except as named. |

## Regressed

None. A regression would be a pair whose code verdict dropped, or a row that was fixed and came back; the rows fixed at earlier rounds were not re-walked (the rules suites cover them in the merge gate, `cd desk && npm run test:rules`).

## New findings for the next drain

None filed. The walk corrected the previous round's account of L1-radka-41-MB5-2: its remainder was not only the away learner's data (5358ddeb supplies it) but the phone never being sent `away` at all (pairing.ts view()).

## Method

Every row open in recert-9 (6) was re-walked at 67e0a3a6; git diff c2dacc69 67e0a3a6 is empty on the files five of them cite, so those were re-found by line and left as they were. The sixth, L1-radka-41-MB5-2, was executed in scratch scripts outside the repo (/tmp/rc14/ex.cjs, ex3.cjs, loaded through tools/ts-load.cjs): learnerRecaps on an away learner with a set marked tonight and no hint, with only an English talk, with only yesterday's work and with an empty slot; a present learner alone; the real store's learner.set; and the same session through pairing.view for in-process, TV and phone. Suites run at 67e0a3a6: tools/tv-recap-test.cjs 62/0, tools/uat-recertify-test.cjs 21/0, tools/uat-ledger-test.cjs 18/0. Every commit named was checked with `git merge-base --is-ancestor <sha> main`.

## Confounded - do not read as a regression

| Confound | Covers | Run pair |
| --- | --- | --- |
| Walker and instrument are the same kind as recert-9 (an L1 code walk by the builder session); the product moved in three commits (5358ddeb, e0820f31, 67e0a3a6). The renders and executions are written by the walker, not held out from it. | all rows | 2026-10-09-maths-l1/recert-9 -> 2026-10-09-maths-l1/recert-10 |
