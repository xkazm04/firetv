# nela-12 x MB1 · Tonight's sheet, together — L1 re-walk (2026-10-14, main 4af25199)

Verdict: **L1-conditional.** One major (a new residual of the old Czech-sheet blocker), no blocker. Carried 5 rows: 5 fixed. New 1.
Time saved if it all worked: **~10-14 min a sheet** (hints replace Mum re-learning the method; the 15-20 min in the Character file is MB1 + MB2 together), confidence **medium**. Grounding: **MB-READ 5/5** (was 2/5), **MB-HINT 6/8** on a read task and 4/8 on an unread one (was 4/8).

## What I walked (surface model, current code)

- Landing -> Math Buddy -> Tonight with three doors on a school path (`desk/src/tv/keys.ts:325-342`). The homework door opens **tonight's** sheet only (`desk/src/tv/mathsRows.ts:21`); an older sheet or none asks for a photo (`keys.ts:340-341`).
- The phone's capture hands the photo to `/api/read`; the maths read now carries my school system's notation, my course, my age and keeps the page's language, and a lettered part gets a label (`desk/src/lib/desk/read.ts:37-45`). The read is vision (L2).
- Page -> Select on a problem asks `/api/hint` (`keys.ts:391`). The prompt now carries my notation, my recorded slips on the unit and the unit's method (`desk/src/lib/desk/hint.ts:122-135`); the answer is checked in code, re-asked once, then replaced by the unit's fixed line (`hint.ts:176`).
- Executed: 14 answer-giving lines on Czech-printed items I would actually meet ('2/3 · 3/4', '3/4 : 1/2', '2,5 · 0,4', 'Vypočítej: 3/4 + 1/6', '0,3 × 0,4', 'Řeš rovnici ...') **all caught**, including 'To je jedenáct dvanáctin.' (scratch `leak.cjs`). Then I tried the other Czech sheet lines: 9 of 21 phrasings are read as nothing (scratch `read2.cjs`).

## Scored criteria

| | Result |
|---|---|
| C1 BLOCKER no answer in a hint | holds on 12 of 21 phrasings; **not established** for 'Sečti / Odečti / Vynásob / Zkrať / Urči / Převeď / Rozděl / Kolik je ... z ...' (L1-nela-12-MB1-8) |
| C4 lines <= 25 words | 106 of 107 fixed TV lines (0.991); live hint length is capped by one re-ask and shown if still long (`hint.ts:176`): L2 |
| C5 first hint names one concrete thing | prompt-level only: L2 |
| C6 'not sure' asks how | pass; the unsure card now carries the checker's reason, a blank says 'has no answer yet' |
| C7 <= 4 presses + one photo | pass: Select (door), photo, Select (problem) = 2 presses |

## Findings this pair

- **Fixed, with what remains:** L1-nela-12-MB1-1 (Czech notation read; verbs remain), -2 (tonight's sheet), -3 (withheld lines <= 25), -4 (read prompt 5/5), -5 (hint grounding 6/8).
- **New:** L1-nela-12-MB1-8 (major, recurrence 2 on the class): the verbs above are unread, so the code check is the general `leaks()` only. On 'Kolik je 3/4 z 20?' it lets 'Then you get 15.' and '3/4 of 20 is 15' through.

## In my voice

Mum, it is better. Last time the sheet with the dots and the colon just did not work, and now it does: I pressed it on '2/3 · 3/4' and the TV did not say 'so it is 1/2' anywhere. Also it is *tonight's* sheet now, not the one from Monday, that was stupid. The lines on the screen are short, I can read them.

But I do not know which of my lines it is guarding. 'Zkrať zlomek' is every second line on our sheets and 'Kolik je 3/4 z 20' is every word problem. For those the only thing between me and the answer is that the computer was *asked* nicely. Mum will see a hint say 'so you get 15' and say 'see, it does it for you'. If it is going to look after the answer, look after it on the words my teacher really uses, not only on 'Vypočítej'.

## L2 handoff

- Read of a Czech page, lettered parts, two-column sheets, 'read in N s'. **Needs Ollama qwen host.**
- Three live hints each on 'Kolik je 3/4 z 20?' and 'Zkrať zlomek 18/24': count lines that state the result. Needs the text engine and a cz profile.
