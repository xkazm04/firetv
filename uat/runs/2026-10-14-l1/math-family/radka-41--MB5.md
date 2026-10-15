# radka-41 x MB5 · Is it worth keeping? — L1 re-walk (2026-10-14, main 4af25199)

Verdict: **L1-conditional** (the keep decision is no longer blocked by a lying recap; it is blocked by what she cannot yet verify). Carried 7 rows + 1 strength: 3 fixed, 4 open (all minor, recurrence 2). New 1 (minor).
Time saved if it all worked: **~60 min a week** with Nela (about 20 min an evening, 3 evenings), plus a tutor hour for Šimon only if the Paper panel fits a Czech mock (it does not yet), confidence **medium** for Nela, **low** for Šimon.

## What I walked

- Setup: `profileRows` unchanged since before the base commit: a School type, age, school system (default United Kingdom), interests, path, Save: **24 presses** from the landing (the count was not re-measured), and the blurb under the system row does not say it decides how 0,5 is read (`desk/src/tv/profileRows.ts:24-31`).
- One MB1 evening: the recap is true (see radka-41--MB1). One MB2 loop: typed marking by code, 0 false ticks, 'not sure' with a reason.
- End of the session: the TV recap (`recapRows.ts`) and the phone's Recap tab say per tile in sentences what was done, hints and what needed a second hint (`recapLine`, `desk/src/tv/recapRows.ts:132-150`). A blank typed answer is still counted in 'the desk was not sure of' (`desk/src/lib/rules/maths.ts:218-221`).
- This week: **'Three homework sheets, 6 hints, 2 needed a second.' / 'Add and subtract fractions: 4 of 6 right, 1 not sure, last set.' / 'One practice paper typed in.'** (scratch `week.cjs`). It is the page I asked for, in sentences.
- What it covers: the school path of the seated child, GCSE-worded paper statements, no CERMAT list; it says what is not on the desk apart on the Paper screen. Calculus 2 is still offered on the profile row on the way past.

## Scored criteria

| | Result |
|---|---|
| C1 BLOCKER no answer before the child answers | conditional (L1-radka-41-MB1-6) |
| C5 recap in sentences, under a minute | pass (incl. second hints on the phone) |
| C6 nothing the desk cannot back | pass |
| C7 tick from the desk's check vs a guess; 'not sure' visible | pass |

## Findings this pair

- **Fixed:** L1-radka-41-MB5-1 (the log is per day), -2 (the Sunday page sees homework and papers), -8 (the not-sure count is shown).
- **Open, minor, recurrence 2:** -4 setup (24 presses; UK default silent; MB-B21), -5 questions print points and £/€ to a cz learner (MB-B4), -6 a skipped answer is still 'the desk was not sure' in the recap (MB-B1 blank half), -7 the recap and the week cover only the child seated now (MB-B23).
- **New, minor:** L1-radka-41-MB5-10 - End session as the first event of a new day shows yesterday's hints (as nela-12 MB5-7).

## In my voice

Would I keep it? Closer. The thing that was killing it, a screen that tells me my daughter did it all right when she did nothing, is fixed, and the Sunday page finally says what we did in words. I can read it in under a minute and I believe it, because it also says '1 not sure' instead of rounding up.

What stops me is not one big thing now. It is that Šimon is not really in it: the paper list speaks English-school and his test is Czech, and if I do both children in the same evening only the one on the TV is in the recap. And setting a child up was twenty-odd presses on a remote, with the country silently on United Kingdom. I will keep it for Nela for a month and see whether I have to touch the maths myself. Before I pay for it instead of the tutor, show me one Czech mock go through.

## L2 handoff

- Three real evenings with the clock moved and a second child switched in: recap and week for each child. No vision for the typed loop; the homework half **needs Ollama qwen host.**
