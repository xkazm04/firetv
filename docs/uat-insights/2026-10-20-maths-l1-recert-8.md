# L1 recertify, round 8, of the Math Buddy run 2026-10-09-maths-l1 (2026-10-20)

A code-only L1 re-walk of the 7 pairs of `uat/runs/2026-10-09-maths-l1` that still had an open row, on ee7d6ac7 (`ee7d6ac770ff1f6f4a10e03c5410aba688a423d7`, local main), after the 43 commits that landed since f788a5dd (three of them Math: 7f74afb3, d5857318, d164089b; also the TV-led work TL-1..TL-13 and the tv-phone-pairing lite r3 reworks). No model call of any kind (no claude CLI, no API, no judge model), no vision call, no browser, no Fire TV; nothing under `desk/` or `desk/data/` changed. Full report: `uat/runs/2026-10-09-maths-l1/recertify-8.md`; data: `recert-8/`.

## Counts: Math before and after

| | Blocker | Major | Minor | Polish | Total |
| --- | --- | --- | --- | --- | --- |
| Open before (recert-7) | 0 | 0 | 7 | 1 | **8** |
| Fixed | 0 | 0 | 2 | 0 | **2** |
| Recur (severity now) | 0 | 0 | 5 | 1 | **6** |
| New | 0 | 0 | 0 | 0 | **0** |
| Open now | 0 | 0 | 5 | 1 | **6** |

OPEN.md Math 8 -> 6; total open 264 -> 256 once both modules are recorded (the other module's note holds its own half). The Linga section of OPEN.md is byte for byte unchanged (sha256 2a273aabbf8fcc3ba868809183e2b1257fd14fc1a85779ba4324112cffc46a15 before and after).

## Rows now fixed, and the commit that fixed each

| Row | Sev. | Fixed by | What the code does now |
| --- | --- | --- | --- |
| `L1-nela-12-MB5-1` A 12-year-old in 6. ročník is taken for 7. ročník (schoolYear ignores the cut-off) | minor | **7f74afb3** | 7f74afb3 (ancestor of HEAD) adds the school-year pick the acceptance names: Profile.year (desk/src/lib/session/store.ts:49) is the learner's own year, the store drops it when it does not fit the type and system and clears it when type, system or age change under it (:772-773); the TV profile has a School year row (desk/src/tv/profileRows.ts:99-103, yearOf :22 reads the pick before the age-derived year; the lamp passes the row, keys.ts:442-444, and a pick sets {year}, :451); learnerYear prefers it (desk/src/lib/rules/stretch.ts:75-79, `who.year` before schoolYear), recovery's Reader carries it (desk/src/lib/rules/recovery.ts readerOf, destinations `at.year ?? schoolYear(...)`), and the pract… |
| `L1-owen-17-MB4-1` 31 typed paper rows live only in React state: a phone reload or tab discard loses them | minor | **d5857318** | d5857318 (ancestor of HEAD) keeps the typed Paper rows in the phone's localStorage per seated learner: keepDraft writes them on every edit (desk/src/app/phone/page.tsx:477-485, through editPaperRows which PaperPanel now gets as setRows, :673) and an effect restores the seated learner's own draft on load (:487-492); the key, serialise and parse are pure in desk/src/lib/rules/paperDraft.ts (draftKey, serialiseDraft returns null for all-blank rows, parseDraft returns null for anything but a version-1 draft); every storage call is in try/catch. d164089b (ancestor) takes keepDraft out of the learner-switch reset so the outgoing learner's draft is not overwritten with a blank row. tools/paper-dra… |

Each fixing commit was checked an ancestor of main (`git merge-base --is-ancestor`). "Fixed" is L1 evidence: the code at ee7d6ac7 meets the row's acceptance; `resolved-verified` still needs live L2.

## Narrowed, still open

| Row | Commit | What is still missing |
| --- | --- | --- |
| `L1-vojtech-18-MB4-3` | e9c5ee8f | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: narrowed by e9c5ee8f, unchanged since: the statements A26-A28 exist (desk/src/lib/library/gcse.ts:85-87, flagged foundation false, touches []) with Czech wording (desk/src/lib/library/gcse-cz.ts:61-63), and git log e9c5ee8f..HEAD finds no commit on gcse.ts, gcse-cz.ts, paths.ts or school.ts. They map to no unit because no school unit teaches them (the only domain pages are Calculus 1's), so a question that tests them lands in "Not on the desk yet" with the harder-statement flag. The acceptance asks for the units that teach them. Cites re-mapped through git diff -U0 ffa91a49 ee7d6ac7 per file. None of the 43 commi… |

## Per pair

| Pair | Open before | Fixed | Recur | New | Open now | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| matyas-19 MB1 | 1 | 0 | 1 | 0 | 1 | L1-conditional |
| matyas-19 MB3 | 1 | 0 | 1 | 0 | 1 | L1-conditional |
| nela-12 MB2 | 2 | 0 | 2 | 0 | 2 | L1-conditional |
| nela-12 MB5 | 1 | 1 | 0 | 0 | 0 | L1-pass (no row open) |
| owen-17 MB4 | 1 | 1 | 0 | 0 | 0 | L1-pass (no row open) |
| radka-41 MB5 | 1 | 0 | 1 | 0 | 1 | L1-conditional |
| vojtech-18 MB4 | 1 | 0 | 1 | 0 | 1 | L1-conditional |

## Open rows, ranked by how cheaply each could close before 10-23

Effort is the walker's read from each row's acceptance and the code it names: XS a string or one line, S one file and a test, M a few files or a rule change with fixtures, L new content or a model-dependent change that only L2 can confirm. Deadline 2026-10-23. The next deliveries are cut from this order.

### Closable without desk/src/app/phone/page.tsx

| # | Row | Effort | Files | What closes it |
| --- | --- | --- | --- | --- |
| 1 | `L1-nela-12-MB2-2` (minor, rank 6) | XS after a ruling | desk/src/lib/library/worked.ts:15, desk/src/lib/rules/school.ts:1588 | Owner ruling: the add/subtract questions say "simplest form" (unsure, not wrong, for 6/4), or the lesson drops "then simplify"; one string either way. |
| 2 | `L1-matyas-19-MB3-5` (polish, rank 1) | S after a ruling | desk/src/lib/rules/calc.ts:380-396, desk/src/lib/desk/items.ts:575 | Owner ruling: store tex for the typesetter, drop the field and its code (frozen fixtures regenerate), or accept "documented". |
| 3 | `L1-vojtech-18-MB4-3` (minor, rank 6) | ruling, or L | desk/src/lib/library/gcse.ts:85-87, desk/src/lib/library/paths.ts | The statements exist; the row closes if the owner accepts "Not on the desk yet" for A26-A28, else it needs units that teach a quadratic inequality, a logarithm and a domain (new content). |
| 4 | `L1-nela-12-MB2-1` (minor, rank 6) | human gate | desk/src/lib/rules/school.ts:2798, :3040 | A teacher signs off the tier-2 denominator range for cz 6. rocnik; no code closes it, and it cannot close before 10-23 without a teacher. |

### Needing desk/src/app/phone/page.tsx

| # | Row | Effort | Files | What closes it |
| --- | --- | --- | --- | --- |
| 1 | `L1-radka-41-MB5-2` (minor, rank 6) | M | desk/src/app/phone/page.tsx:866-877, desk/src/tv/recapRows.ts:78 | The phone Recap lists every learner with work tonight, one block each (recapRows takes the seated session's log today). |
| 2 | `L1-matyas-19-MB1-1` (minor, rank 6) | L | desk/src/app/phone/page.tsx:422-427, desk/src/app/api/mark/route.ts:12-14, :64 | A client sends a page id so a snapped MA1 sheet can be marked by the code judge (and the vision host for Math L2). |

Rows that need `desk/src/app/phone/page.tsx`: `L1-radka-41-MB5-2`, `L1-matyas-19-MB1-1`. The page was edited by this round's own commits (d5857318, d164089b and the TL-9/10/11 work), so it is no longer a parked file; the split stays because those rows share one file and one test surface and should be cut as one delivery. Four of the six wait on a ruling, a teacher or new content rather than on code.
