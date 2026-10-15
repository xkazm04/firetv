# nela-12 x MB5 · Is it worth keeping? — L1 re-walk (2026-10-14, main 4af25199)

Verdict: **L1-pass** with one narrow new minor. Carried 5 rows + 1 strength: 3 fixed, 2 open (minor, recurrence 2). New 1 (minor).
Time saved if it all worked: **~35-45 min a week** (2-3 sheets), confidence **medium-low** until the photo read is measured. Grounding: not an AI surface of its own; the evening line and Sunday page are code.

## What I walked

- Setup: D-pad plus a name on the phone, no Mode row under 18 (`desk/src/lib/rules/mode.ts:36-47`, profile rows for an elementary 12: type, age, system, interests, path, Save/Back).
- An evening of homework and hints, then Menu on the landing. Executed with a fake clock (scratch `recap2.cjs`):
  - homework page + 3 hints, 1 second hint, nothing marked -> TV caption **'Worked through with 3 hints; nothing was marked.'**; the phone line '3 hints, 1 needed a second' (was 'Good evening's work - all of it right.').
  - Linga only -> 'One conversation in English; nothing to mark.'
  - next day, any first event, then End -> **'A quiet evening.'**, log.hints 0 (`desk/src/lib/session/store.ts:618-623`: the log carries its day).
  - next day, **End session as the very first event** -> still '3 hints'. `dayed()` skips `session.end` (store.ts:620). New: L1-nela-12-MB5-7.
- Sunday page over 3 sheets, 1 paper, 1 set: 'Three homework sheets, 6 hints, 2 needed a second.' / 'Add and subtract fractions: 4 of 6 right, 1 not sure, last set.' / 'One practice paper typed in.' (scratch `week.cjs`; `desk/src/lib/rules/week.ts:177-179,245`).

## Findings this pair

- **Fixed:** L1-nela-12-MB5-1 (recap tells the truth), -2 (the log is per day; residual above), -3 (the week sees homework).
- **Open, minor, recurrence 2:** -4 the school system still defaults to UK and the blurb 'Progress is shown against Czech ročníky.' does not say it decides how 0,5 is read (MB-B21); -5 I am taken for 7. ročník at 12, now documented as 'our own reading' (`syllabus.ts:296-304`).
- **New, minor, recurrence 1:** -7 End session first on a new day.

## In my voice

When Mum pressed the end button yesterday it said I did 'all of it right' and I had not even been marked. Now it says we worked with three hints and nothing was marked. Dobře. That is true, and I do not have to be ashamed of it in front of Mum.

The week page finally knows I did homework. It used to say 'Nothing this week' after three sheets and Mum asked if I was lying.

One odd thing: if you press end before doing anything on a new day it can show yesterday's three hints. Mum will notice that one day and then she will not believe the rest.

## L2 handoff

- A whole real evening on the isolated data dir with a clock moved past midnight: confirm End-first. No vision needed.
