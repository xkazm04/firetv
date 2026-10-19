# L1 recertify, round 7, of the Math Buddy run 2026-10-09-maths-l1 (2026-10-19)

A code-only L1 re-walk of the 8 pairs of `uat/runs/2026-10-09-maths-l1` that still had an open row, on ffa91a49 (`ffa91a4938aa490c91a8c709d097d55f72a3b2f7`, local main), after the seven commits that landed since 6b189791 (four of them Math: 56f903ae, da6f9f07, 3240d025, e9c5ee8f). No model call, no vision call, no browser; nothing under `desk/`, `tools/`, `phone/` or `desk/data/` changed. Full report: `uat/runs/2026-10-09-maths-l1/recertify-7.md`; data: `recert-7/`.

## Counts: Math before and after

| | Blocker | Major | Minor | Polish | Total |
| --- | --- | --- | --- | --- | --- |
| Open before (recert-6) | 0 | 0 | 10 | 1 | **11** |
| Fixed | 0 | 0 | 3 | 0 | **3** |
| Recur (severity now) | 0 | 0 | 7 | 1 | **8** |
| New | 0 | 0 | 0 | 0 | **0** |
| Open now | 0 | 0 | 7 | 1 | **8** |

OPEN.md Math 11 -> 8; total open 270 -> 264 once both modules are recorded (the other module's note holds its own half). The Linga section of OPEN.md is byte for byte unchanged (checked with git diff against the file before the rewrite).

## Rows now fixed, and the commit that fixed each

| Row | Sev. | Fixed by | What the code does now |
| --- | --- | --- | --- |
| `L1-radka-41-MB4-1` A cz parent picks Czech statements, but the TV and the Prepare line echo the English stat… | minor | **56f903ae** | 56f903ae (ancestor of HEAD) routes every statement the row named through canOf(code, system): paperView's off rows take can: canOf(o.code, system) with o.can as the fallback (desk/src/tv/paperRows.ts:50) with the seated learner's system from systemOf; the flag is beyondFlag(sys) (paperRows.ts:20, ' · těžší tvrzení' for cz, MathsTV.tsx:737); aimLine(p, system) (desk/src/tv/mathsRows.ts:375-376, called MathsTV.tsx:800) and aimBlock(aim, system) (desk/src/lib/desk/items.ts:100, call sites :210-211) print canOf. tools/maths-tv-test.cjs 'paper 10' renders th… |
| `L1-radka-41-MB5-1` Setting up a child takes 24 remote presses past 'Calculus 2' and 'Back' (the silent UK de… | minor | **3240d025** | 3240d025 (ancestor of HEAD) is the second arm of the acceptance ('the TV rows start on the likely value'): in the profile handler a pick now moves the lamp to the next row's current or likely cell (desk/src/tv/keys.ts:375-380 pick(), likelyIx desk/src/tv/profileRows.ts:92-104: the middle of the age range, Family, the system's default, the first course), and the 'Maths course' row is not offered to an elementary child unless the draft already holds a course (profileRows.ts:87). tools/tv-keys-test.cjs 'profile setup (L1-radka-41-MB5-1, TV half)' walks a 1… |
| `L1-vojtech-18-MB4-1` The TV never shows which statement led a question to a topic (topics[].codes unwired) | minor | **da6f9f07** | da6f9f07 (ancestor of HEAD) gave PaperTopic a `said` list (desk/src/tv/paperRows.ts:15, :49: canOf(code, system) per code, the learner's language) and the topic row draws ' · led by ' + t.said.join('; ') instead of the codes (desk/src/maths/MathsTV.tsx:753). tools/maths-tv-test.cjs 'paper 9' renders a pct-of-amount row and asserts the statement words, not 'led by N12', for uk and for a cz learner (Czech words differ); maths-tv 78/0. The row's acceptance (each topic row names the statement's can text it came through) is met. |

Each fixing commit was checked an ancestor of HEAD (`git merge-base --is-ancestor`). "Fixed" is L1 evidence: the code at ffa91a49 meets the row's acceptance; `resolved-verified` still needs live L2.

## Narrowed, still open

| Row | Commit | What is still missing |
| --- | --- | --- |
| `L1-vojtech-18-MB4-3` | e9c5ee8f | they are mapped to no unit, because no school unit teaches them (touches is [] on purpose; the only domain pages are Calculus 1's): a question that tests them lands in 'Not on the desk yet' with a 'harder statement' flag, not on a lesson. The acceptance asks for the units that teach them. |

## Per pair

| Pair | Open before | Fixed | Recur | New | Open now | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| matyas-19 MB1 | 1 | 0 | 1 | 0 | 1 | L1-conditional |
| matyas-19 MB3 | 1 | 0 | 1 | 0 | 1 | L1-conditional |
| nela-12 MB2 | 2 | 0 | 2 | 0 | 2 | L1-conditional |
| nela-12 MB5 | 1 | 0 | 1 | 0 | 1 | L1-conditional |
| owen-17 MB4 | 1 | 0 | 1 | 0 | 1 | L1-conditional |
| radka-41 MB4 | 1 | 1 | 0 | 0 | 0 | L1-pass (no row open) |
| radka-41 MB5 | 2 | 1 | 1 | 0 | 1 | L1-conditional |
| vojtech-18 MB4 | 2 | 1 | 1 | 0 | 1 | L1-conditional |

## Open rows, ranked by how cheaply each could close before 10-23

Effort is the walker's read from each row's acceptance and the code it names: XS a string or one line, S one file and a test, M a few files or a rule change with fixtures, L new content or a model-dependent change that only L2 can confirm. Deadline 2026-10-23.

### Closable without desk/src/app/phone/page.tsx

| # | Row | Effort | What closes it |
| --- | --- | --- | --- |
| 1 | `L1-nela-12-MB2-2` (minor, rank 6) | XS after a ruling | Owner ruling: the add/subtract questions say 'simplest form', or the lesson drops 'then simplify'; one string either way. |
| 2 | `L1-nela-12-MB5-1` (minor, rank 3) | S | Apply the cut-off in schoolYear (rules/stretch.ts, library/syllabus.ts), or add a school-year pick; code-only, no ruling. |
| 3 | `L1-matyas-19-MB3-5` (polish, rank 1) | S after a ruling | Owner ruling: store tex for the typesetter, drop the field and its code (calc.ts:380-396, frozen fixtures regenerate), or accept 'documented'. |
| 4 | `L1-vojtech-18-MB4-3` (minor, rank 6) | ruling, or L | The statements exist; the row closes if the owner accepts 'Not on the desk yet' for A26-A28, else it needs units that teach a quadratic inequality, a logarithm and a domain (new content). |
| 5 | `L1-nela-12-MB2-1` (minor, rank 6) | human gate | A teacher signs off the tier-2 denominator range for cz 6. rocnik; no code closes it, and it cannot close before 10-23 without a teacher. |

### Needing desk/src/app/phone/page.tsx (parked)

| # | Row | Effort | What closes it |
| --- | --- | --- | --- |
| 1 | `L1-owen-17-MB4-1` (minor, rank 6) | XS-S | Persist the typed paper rows on the phone until sent (page.tsx holds them in React state). |
| 2 | `L1-radka-41-MB5-2` (minor, rank 6) | M | The phone Recap lists every learner with work tonight (page.tsx Recap tab; tv/recapRows.ts shares the rows). |
| 3 | `L1-matyas-19-MB1-1` (minor, rank 6) | L | A client sends a page id so a snapped MA1 sheet can be marked by the code judge (page.tsx, api/mark, and the vision host for Math L2). |

Rows that need `desk/src/app/phone/page.tsx`: `L1-owen-17-MB4-1`, `L1-radka-41-MB5-2`, `L1-matyas-19-MB1-1`. The other five Math rows touch no parked file; four of them (`L1-vojtech-18-MB4-3`, `L1-nela-12-MB2-1`, `L1-nela-12-MB2-2`, `L1-matyas-19-MB3-5`) wait on a ruling, a teacher or new content rather than on code, and `L1-nela-12-MB5-1` is code-only.
