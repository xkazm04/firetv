# radka-41 × MB5 · (recert-10)

- Character: radka-41
- Journey: MB5
- Cert level: L1 re-walk, code only, no model
- Head 67e0a3a6
- Recertifies: 2026-10-09-maths-l1/recert-9 at c2dacc69
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-radka-41-MB5-2 The recap and the week cover only the child seated now (minor) | recurs → L1-radka-41-MB5-2 | Narrowed again by 5358ddeb (ancestor of main); not closed. The code half the recert-9 note named holds. Read: desk/src/lib/session/store.ts slotOf now ends with ...tonightOf(s) (:499-508: the history lines at or after local midnight and the English talks {at, turns} are kept in the MathsSlot of a learner who leaves, "never put back on the session"), emptyOf counts them so a slot with only a talk is kept (:509), and withSlot drops them on sitting back down (:511); desk/src/tv/recapRows.ts:123-124 reads them back (history: x.history ?? [], sessions from x.talks). Executed at 67e0a3a6 (scratch /tmp/rc14/ex.cjs and ex3.cjs outside the repo, loaded through tools/ts-load.cjs, no model; two profiles, Ema seated with a set tonight): Ben away with a set marked tonight and no hint -> [ema, ben], Ben's maths tile sets [5 of 6]; Ben away with only an English talk of 5 turns -> [ema, ben], talks [5]; Ben away with only yesterday's line and talk -> [ema]; Ben away with an empty slot -> [ema]; the present learner alone -> [ema] with the same tiles as before; the real store: reduce(learner.set jakub) from a session with one line tonight, one yesterday and a 6-turn talk leaves away.ema.history = ["Two-step equations"] and away.ema.talks = [{at, turns: 6}], and sitting back down leaves nothing of it on the session. So each away case yields a block from learnerRecaps. What is missing: the block never reaches the phone. The phone Recap renders learnerRecaps(s, now) (desk/src/app/phone/page.tsx:881) over the session the phone is sent, and every response to a phone or the TV passes through view() (desk/src/lib/session/pairing.ts:276 const { away: _away, week, ...seen } = s; the doc comment at :254 says no caller is sent the away work; session/route.ts:49, :63, :119-142 and session/stream/route.ts:53 all use it). Executed the same session through view(s, role): in-process and role null -> [ema, ben]; role phone -> [ema], no away key; role tv -> [ema]. So on the real phone an away learner still gets no block, and the acceptance (every learner with work tonight, one block each, on the phone Recap) is met only in process. tools/tv-recap-test.cjs 62/0 covers the pure function and the store, not the view. Closing it takes a ruling and a small code change: send the phone only the derived tonight tiles of the away learners (a new view field), or relax the away strip for the Recap alone; pairing.ts's privacy rule is the owner's. | 5358ddeb (narrowed) |

## New findings

None.

## Notes

- Evidence check at 67e0a3a6: every cited line was re-mapped through `git diff -U0 c2dacc69 67e0a3a6` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main`. Model-dependent behaviour stays with L2.
- Executed: /tmp/rc14/ex.cjs and ex3.cjs (outside the repo) load desk/src/tv/recapRows.ts, desk/src/lib/session/store.ts and desk/src/lib/session/pairing.ts through tools/ts-load.cjs; the away-learner cases and the view() cases are quoted in the row's evidence. Nothing under desk/ was changed.
