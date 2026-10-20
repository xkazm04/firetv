# L1 recertify, round 10, of the Math Buddy run 2026-10-09-maths-l1 (2026-10-20)

A code-only L1 re-walk of the 5 pairs of `uat/runs/2026-10-09-maths-l1` that still had an open row, on 67e0a3a6 (`67e0a3a669a1a9e2412397a70c61774638f4ec0c`, local main), after 5358ddeb (L1-radka-41-MB5-2, the one Math commit since c2dacc69) and the Essay commits of the same stretch. No model call of any kind, no vision, no browser, no device; desk/data and everything under desk/ and tools/ untouched. Scratch scripts ran outside the repo (`/tmp/rc14/ex.cjs`, `ex3.cjs`, loaded through `tools/ts-load.cjs`). Stamps through `uat/driver/recertify.cjs` `writeBack()`, OPEN.md through `uat/driver/ledger.cjs` `writeStatus()`.

## Counts: Math before and after

| | Blocker | Major | Minor | Polish | Total |
| --- | --- | --- | --- | --- | --- |
| Open before (recert-9) | 0 | 0 | 5 | 1 | **6** |
| Fixed | 0 | 0 | 0 | 0 | **0** |
| Recur (severity now) | 0 | 0 | 5 | 1 | **6** |
| New | 0 | 0 | 0 | 0 | **0** |
| Open now | 0 | 0 | 5 | 1 | **6** |

OPEN.md Math 6 -> 6; total open 244 -> 243 once both modules are recorded (the Essay note holds the one row that closed). The Linga section of OPEN.md is byte for byte unchanged (sha256 2a273aabbf8fcc3ba868809183e2b1257fd14fc1a85779ba4324112cffc46a15 before and after).

## L1-radka-41-MB5-2: the data half landed, the phone half did not

5358ddeb (ancestor of main) keeps tonight's history lines and English talks in the slot of a learner who leaves the desk (desk/src/lib/session/store.ts slotOf/tonightOf :499-508, emptyOf :509, withSlot drops them on sitting back down :511), and learnerRecaps reads them back (desk/src/tv/recapRows.ts:123-124). Executed at 67e0a3a6 (two profiles, Ema seated with a set tonight):

| Case | Blocks |
| --- | --- |
| Ben away, a set marked tonight, no hint | ema, ben (Ben's maths tile: 5 of 6) |
| Ben away, only an English talk of 5 turns | ema, ben (talks: 5) |
| Ben away, only yesterday's line and talk | ema |
| Ben away, an empty slot | ema |
| Present learner alone | ema, tiles as before |
| Real store: learner.set from a session with one line tonight, one yesterday, a 6-turn talk | away.ema.history = the one line, away.ema.talks = the one talk; sitting back down leaves nothing of it on the session |

Each away case yields a block from the pure function, so the half recert-9 named is closed. The row is **not** closed, and stays narrowed: the phone Recap renders `learnerRecaps(s, now)` (desk/src/app/phone/page.tsx:881) over the session the phone is sent, and every response to a phone or the TV passes through `view()` (desk/src/lib/session/pairing.ts:276, `const { away: _away, week, ...seen } = s`; the doc comment at :254: "No caller is sent the Math Buddy work of learners not at the desk"; session/route.ts:49, :63, :119-142 and session/stream/route.ts:53). The same session through `view(s, role)`: in-process and role null -> ema, ben; role phone -> ema only, no `away` key; role tv -> ema. So on the real phone an away learner still has no block. The previous round's note ("the phone page already draws one block per entry, so it should not need page.tsx again") missed this. tools/tv-recap-test.cjs 62/0 pins the function and the store, and no suite runs learnerRecaps over the phone view.

## The other five rows

`git diff c2dacc69 67e0a3a6` is empty on every file they cite except desk/src/app/phone/page.tsx (L1-matyas-19-MB1-1: sendWorking is now :441 and the typed-answers call :460, the same two /api/mark callers and still no page id). All five recur unchanged.

## Open rows, ranked by how cheaply each could close before 10-23

Effort: XS a string or one line, S one file and a test, M a few files or a rule change with fixtures, L new content or a model-dependent change that only L2 can confirm. Deadline 2026-10-23.

| # | Row | Effort | Files | Who closes it | What closes it |
| --- | --- | --- | --- | --- | --- |
| 1 | `L1-nela-12-MB2-2` (minor, rank 6) | XS after a ruling | desk/src/lib/library/worked.ts:15, desk/src/lib/rules/school.ts:1588 | **owner ruling** | The add/subtract questions say "simplest form" (unsure, not wrong, for 6/4), or the lesson drops "then simplify"; one string either way. |
| 2 | `L1-matyas-19-MB3-5` (polish, rank 1) | S after a ruling | desk/src/lib/rules/calc.ts:380-396, desk/src/lib/desk/items.ts:575 | **owner ruling** | Store tex for the typesetter, drop the field and its code (frozen fixtures regenerate), or accept "documented". |
| 3 | `L1-radka-41-MB5-2` (minor, rank 6) | S-M | desk/src/lib/session/pairing.ts:254-277, desk/src/app/phone/page.tsx:881, tools/desk-pairing-test.cjs, tools/tv-recap-test.cjs | **owner ruling** on the privacy rule, then a builder | Send the phone only what the Recap needs of an away learner, derived server-side (the tonight tiles per learner, a new view field), or relax the `away` strip for the Recap alone; a test runs learnerRecaps over view(s, "phone"). The raw away slot (pages, photos) must keep not being sent. |
| 4 | `L1-vojtech-18-MB4-3` (minor, rank 6) | ruling, or L | desk/src/lib/library/gcse.ts:85-87, desk/src/lib/library/paths.ts | **owner ruling** | Accept "Not on the desk yet" for A26-A28, else units that teach a quadratic inequality, a logarithm and a domain (new content). |
| 5 | `L1-nela-12-MB2-1` (minor, rank 6) | human gate | desk/src/lib/rules/school.ts:2798, :3040 | **a teacher** | A teacher signs off the tier-2 denominator range for cz 6. ročník; no code closes it, and it cannot close before 10-23 without a teacher. |
| 6 | `L1-matyas-19-MB1-1` (minor, rank 6) | L | desk/src/app/phone/page.tsx:441, :460, desk/src/app/api/mark/route.ts:12-14, :62-64 | **the vision path** (Math L2) | A client sends a page id so a snapped MA1 sheet can be marked by the code judge. |

Waiting on an owner ruling: rows 1, 2, 3 (privacy rule, then small code), 4. Waiting on a teacher: row 5. Waiting on the vision path: row 6. No open Math row is closable by a builder alone: even row 3 needs the owner to say whether the phone may be sent derived data about learners who are not at the desk.
