# radka-41 x MB1 · Tonight's sheet, together — L1 re-walk (2026-10-14, main 4af25199)

Verdict: **L1-conditional.** The two blockers (an unguarded Czech sheet; a recap that said "all of it right") are fixed; the first has a narrower residual that is still a major for the one thing she cares about. Carried 4 rows + 1 strength: 4 fixed. New 1 (major, recurrence 2 on the class).
Time saved if it all worked: **~15-20 min an evening** (40 min of her own time -> 20, beside Nela, not teaching), confidence **medium**. Grounding (shared denominators): MB-READ **5/5** (was 2/5), MB-HINT **6/8** on a read task / 4/8 unread (was 4/8).

## What I walked

I sit beside Nela. I never touch the TV; I read it.

- Tonight -> homework door -> tonight's sheet (`desk/src/tv/mathsRows.ts:21`) -> a problem -> hint, then 'still stuck' for hint 2 only after hint 1 (`desk/src/tv/keys.ts:393-402`).
- The check on a hint is code: on a read school task `leaksSchool` runs on both fields, on an equation `leaks()`, and a leaking hint is re-asked once, then replaced by the unit's fixed line (`desk/src/lib/desk/hint.ts:105-114,176`). A unit task has no library lesson and the hint screen says so (`desk/src/app/api/hint/route.ts:67-68`).
- Executed (scratch `leak.cjs`, `read2.cjs`): on '2/3 · 9/4', '0,3 × 0,4', 'Vypočítej: 3/4 + 1/6', 'Řeš rovnici 3(x - 2) = 2x + 5' and 'Solve 3(x - 2) = 2x + 5' every answer-giving line I tried is caught. On 'Sečti 3/4 a 1/6', 'Zkrať zlomek 18/24', 'Kolik je 3/4 z 20?' (and 6 more) the task is read as nothing and 'Then you get 15.' passes.
- Recap of a homework night: 'Worked through with 3 hints; nothing was marked.' (`desk/src/tv/recapRows.ts:109-118`); the phone line '3 hints, 1 needed a second'.

## Scored criteria

| | Result |
|---|---|
| C1 BLOCKER never the final answer before the child answers | holds on every phrasing the readers read; **not established** on the unread Czech verbs (L1-radka-41-MB1-6) |
| C5 recap in sentences incl. second hint | pass |
| C6 no board/grade/prediction | pass |
| C7 tick from the desk's own check vs a guess | pass: the desk marks by code and says 'not sure' with a reason; hints are model-written and never ticked |

## Findings this pair

- **Fixed:** L1-radka-41-MB1-1 (Czech notation), -2 (the false 'all of it right'), -3 (hint grounding), -4 (read prompt).
- **New, major:** L1-radka-41-MB1-6. I cannot see which lines are guarded; a guarded and an unguarded line look the same on the TV.

## In my voice

OK, I looked for what I looked for last time: does it ever just say it. On the lines with the dot and the colon, on 'Vypočítej', on a simple equation, it does not, and when I read the recap it no longer tells me 'all of it right' after a night when nothing was marked. That recap sentence was the reason I stopped believing the screen, and it is gone. Thank you.

What I still do not know is how I would know. 'How do I know it's right, who checked this?' If half the Czech verbs on Nela's sheet are covered and the other half are covered by 'we asked the model nicely', that is not something I can see from the sofa. Say the same thing about every line, or tell me which ones the desk is sure about.

## L2 handoff

- Live hints on 'Kolik je 3/4 z 20?' and 'Zkrať zlomek 18/24': text engine and a cz profile; count lines that state the result.
- Czech page read quality: **needs Ollama qwen host.**
