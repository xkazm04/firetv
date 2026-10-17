# nela-12 × MB1 · Tonight's sheet, together (recert-1)

- Character: nela-12 (Nela, 12, 6. ročník, Brno; profile `elementary`, age 12, system `cz`, School maths, Family)
- Journey: MB1 · Tonight's sheet, together
- Cert level: L1 re-walk, code only, no model
- Head d4f5042a
- Recertifies 2026-10-09-maths-l1 at 12592a71
- **Verdict now: L1-conditional.** All five prior rows are fixed, but the hint's code leak check still does not run on several common Czech phrasings (one major).

## Reachable surface (now)

- Tonight's homework door opens only a sheet snapped today, else asks for a photo (`desk/src/tv/keys.ts:339-341`, `desk/src/tv/mathsRows.ts:22-30`).
- The maths read prompt carries the cz notation, course, age, printed language and a lettered-part label (`desk/src/lib/desk/read.ts:27-46`, `desk/src/app/api/read/route.ts:37`). The read itself is vision (L2).
- A hint reads the task through `readQuestion` (`desk/src/lib/rules/kinds.ts:41-46`, which uses `desk/src/lib/rules/taskText.ts:51-71`), grounds the prompt (`desk/src/lib/desk/hint.ts:124-139`), runs `leaks` plus `leaksSchool` on both lines (`hint.ts:107-109`), re-asks once, then falls back to the unit's withheld line (`hint.ts:182-197`).

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-nela-12-MB1-1 Czech notation not read; leak check lost | fixed | `taskText.ts:51-58` reads ·, the fraction colon and the decimal comma; `taskText.ts:16-21` strips Vypočítej. Scratch `read.cjs`: all five original lines read as their unit, every answer line (including 'To je jedenáct dvanáctin.') leak=true | 119988a1 MB-B2: the reader strips a leading instruction and reads the middle dot... |
| L1-nela-12-MB1-2 the next evening reopens the first sheet | fixed | `mathsRows.ts:22-30` keeps only a page with day == today; `keys.ts:339-341` else page.ask | 3a98790e HW2: the homework door opens tonight's sheet only |
| L1-nela-12-MB1-3 withheld lines 31-54 words | fixed | `desk/src/lib/rules/school.ts:4463` all 15 lines at or under 25 words; pinned at `tools/school-rules-test.cjs:491-492` | 993948e5 school: every withheld hint line is 25 words or fewer (MB-B6 part 2) |
| L1-nela-12-MB1-4 MB-READ 2/5 | fixed | `read.ts:27-46` mathsContext; `read.ts:18-21` label field | 50fd60a4 MB-B3: the maths read prompt carries the learner's school system... |
| L1-nela-12-MB1-5 MB-HINT 4/8 | fixed | `hint.ts:124-139` groundFor (notation, recorded slips, unit method); `desk/src/app/api/hint/route.ts:39,42,51` | c7460599 MB-B8 (grounding) |

## New findings

- **Major (rank 12), carried from 2026-10-14 L1-nela-12-MB1-8, narrowed.** Since that walk, 'Sečti ... a ...', 'Vynásob', 'Zkrať (zlomek)', 'Převeď ... na ...', 'Urči', 'Odečti ... a ...' and 'Kolik je 3/4 z 20?' all read as their unit and their answer lines are caught (`taskText.ts:16-40, 53-56`, commit 0a53e75e). Still read as nothing (kind linear): 'Odečti 1/6 od 3/4' (the usual Czech order), 'Vyděl 3/4 číslem 1/2', 'Uprav na základní tvar 18/24', 'Doplň: 3/4 = ?/12', 'Zapiš 3/4 jako desetinné číslo', 'Rozděl 60 v poměru 2:3'. On these, only the general `leaks()` runs, and it lets 'You get 7/12.', '= 1 1/2', '0,75' and 'So 24 and 36.' through (scratch `read.cjs`, `read3.cjs`). The lesson pick also goes to the linear library (`hint/route.ts:67-68`).

## Notes

- Repro scripts are in `C:/Users/kazda/AppData/Local/Temp/recert-c258/scratch-nela-12/` (DESK_DATA_DIR in scratch, no model).
- The C1 blocker criterion holds on every phrasing that reads. On the unread phrasings it is still not established in code, and only the live model's obedience stands between her and the answer. That is an L2 count.
