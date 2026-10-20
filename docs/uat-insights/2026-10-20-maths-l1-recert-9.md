# L1 recertify, round 9, of the Math Buddy run 2026-10-09-maths-l1 (2026-10-20)

A code-only L1 re-walk of the 5 pairs of `uat/runs/2026-10-09-maths-l1` that still had an open row, on c2dacc69 (`c2dacc69705874d892b7444918eaf3a8e3df3269`, local main), after the 9 commits that landed since the recert-8 head ee7d6ac7 (one of them Math: 25b8fdf4; the rest Essay, the phone shelf, and the recert-8 uat commit f2bb1dd2). No model call of any kind (no claude CLI, no API, no judge model), no vision call, no browser, no Fire TV; nothing under `desk/`, `desk/data/` or `tools/` changed. Full report: `uat/runs/2026-10-09-maths-l1/recertify-9.md`; data: `recert-9/`.

## Counts: Math before and after

| | Blocker | Major | Minor | Polish | Total |
| --- | --- | --- | --- | --- | --- |
| Open before (recert-8) | 0 | 0 | 5 | 1 | **6** |
| Fixed | 0 | 0 | 0 | 0 | **0** |
| Recur (severity now) | 0 | 0 | 5 | 1 | **6** |
| New | 0 | 0 | 0 | 0 | **0** |
| Open now | 0 | 0 | 5 | 1 | **6** |

OPEN.md Math 6 -> 6 (rows re-keyed to `recert-9`, recurrence + 1); total open 256 -> 256. The Linga and Essay sections of OPEN.md are byte for byte unchanged: Linga sha256 2a273aabbf8fcc3ba868809183e2b1257fd14fc1a85779ba4324112cffc46a15, Essay Master sha256 cca666e75d431fe5ff0e1571bf704785a92ec68b22acea9d00c05b36f1795cb8, each the same before and after.

## Rows now fixed, and the commit that fixed each

None. The round was cut to stamp `L1-radka-41-MB5-2` fixed by 25b8fdf4; the code does not meet the acceptance in full, so the row stays open, narrowed.

| Row | Commit (ancestor of main) | Why it is not fixed |
| --- | --- | --- |
| `L1-radka-41-MB5-2` The recap and the week cover only the child seated now (minor) | 25b8fdf4, narrows | learnerRecaps (desk/src/tv/recapRows.ts:114-130) and the per-learner blocks (desk/src/app/phone/page.tsx:873-881) are there, but an away learner is read off their slot with `history: []` and no English sessions (recapRows.ts:121-123), and a maths tile counts only history lines and hints (:93). Executed outside the repo: an away learner with a set marked tonight and no hint gets no block ([ada], not [ada, ben]); only an away learner with a hint shows. The commit's test case gives every away learner hints. |

`resolved-verified` still needs live L2 for any row.

## Narrowed, still open

| Row | Commit | What is still missing |
| --- | --- | --- |
| `L1-radka-41-MB5-2` | 25b8fdf4 | The away learner's tonight history lines (sets, pages, readings) and talks must reach learnerRecaps, from the session or from a read of each learner's own history; add the case "away, set marked tonight, no hint" to tools/tv-recap-test.cjs (red at c2dacc69). |
| `L1-vojtech-18-MB4-3` | e9c5ee8f | Unchanged: A26-A28 exist (desk/src/lib/library/gcse.ts:85-87) and map to no unit. |

## Per pair

| Pair | Open before | Fixed | Recur | New | Open now | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| matyas-19 MB1 | 1 | 0 | 1 | 0 | 1 | L1-conditional |
| matyas-19 MB3 | 1 | 0 | 1 | 0 | 1 | L1-conditional |
| nela-12 MB2 | 2 | 0 | 2 | 0 | 2 | L1-conditional |
| radka-41 MB5 | 1 | 0 | 1 | 0 | 1 | L1-conditional |
| vojtech-18 MB4 | 1 | 0 | 1 | 0 | 1 | L1-conditional |

## Open rows, ranked by how cheaply each could close before 10-23

Effort is the walker's read from each row's acceptance and the code it names: XS a string or one line, S one file and a test, M a few files or a rule change with fixtures, L new content or a model-dependent change that only L2 can confirm. Deadline 2026-10-23.

### Closable without desk/src/app/phone/page.tsx

| # | Row | Effort | Files | What closes it |
| --- | --- | --- | --- | --- |
| 1 | `L1-nela-12-MB2-2` (minor, rank 6) | XS after a ruling | desk/src/lib/library/worked.ts:15, desk/src/lib/rules/school.ts:1588 | **Owner ruling**: the add/subtract questions say "simplest form" (unsure, not wrong, for 6/4), or the lesson drops "then simplify"; one string either way. |
| 2 | `L1-matyas-19-MB3-5` (polish, rank 1) | S after a ruling | desk/src/lib/rules/calc.ts:380-396, desk/src/lib/desk/items.ts:575 | **Owner ruling**: store tex for the typesetter, drop the field and its code (frozen fixtures regenerate), or accept "documented". |
| 3 | `L1-radka-41-MB5-2` (minor, rank 6) | S-M | desk/src/tv/recapRows.ts:114-130, desk/src/lib/session/store.ts (MathsSlot :486-492, or the session's per-learner history), tools/tv-recap-test.cjs | The away learner's tonight history lines and talks reach learnerRecaps. The phone page already draws one block per entry (25b8fdf4), so it should not need page.tsx again unless the history is read on the phone side. |
| 4 | `L1-vojtech-18-MB4-3` (minor, rank 6) | ruling, or L | desk/src/lib/library/gcse.ts:85-87, desk/src/lib/library/paths.ts | **Owner ruling** to accept "Not on the desk yet" for A26-A28, else units that teach a quadratic inequality, a logarithm and a domain (new content). |
| 5 | `L1-nela-12-MB2-1` (minor, rank 6) | human gate | desk/src/lib/rules/school.ts:2798, :3040 | **A teacher** signs off the tier-2 denominator range for cz 6. ročník; no code closes it, and it cannot close before 10-23 without a teacher. |

### Needing desk/src/app/phone/page.tsx

| # | Row | Effort | Files | What closes it |
| --- | --- | --- | --- | --- |
| 1 | `L1-matyas-19-MB1-1` (minor, rank 6) | L | desk/src/app/phone/page.tsx:424-429, desk/src/app/api/mark/route.ts:12-14, :64 | A client sends a page id so a snapped MA1 sheet can be marked by the code judge; **waits on the vision path** (Math L2). |

`L1-radka-41-MB5-2` moved out of the page.tsx group: its remainder is in the data learnerRecaps reads (recapRows.ts and the session store), not in the page. Of the six open rows, three wait on an owner ruling (MB2-2, MB3-5, MB4-3), one on a teacher (MB2-1), one on the vision path (MB1-1), and one (MB5-2) is code that can still land before 10-23.
