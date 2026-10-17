# radka-41 × MB1 · Tonight's sheet, together (recert-1)

- Character: radka-41
- Journey: MB1
- Cert level: L1 re-walk, code only, no model
- Head d4f5042a
- Recertifies 2026-10-09-maths-l1 at 12592a71
- **Verdict now: L1-conditional.** All four prior rows are fixed. A narrower leak gap remains on a few common Czech verbs ('Odečti X od Y', 'Vyděl', 'Rozděl ... v poměru'), where only the prompt keeps the answer back.

## Reachable surface (now)

- Homework door -> tonight's sheet -> a problem -> hint 1, then 'still stuck' for hint 2 (`desk/src/app/api/hint/route.ts:22-74`).
- Read prompt: cz notation, course, age, printed language, lettered labels (`desk/src/lib/desk/read.ts:37-46`).
- Hint: stance by task kind, neutral when unread (`desk/src/lib/desk/hint.ts:84-98`); ground = notation + slips + method (`hint.ts:124-139`); leak check on both fields, one re-ask, then a fixed line (`hint.ts:107-109,182-197`).
- Task reading: instruction strip, middle dot, fraction colon, decimal comma, 'Kolik je ... z ...' (`desk/src/lib/rules/taskText.ts:16-71`).
- Recap caption (`desk/src/tv/recapRows.ts:228-238`), the same on the phone (`desk/src/app/phone/page.tsx:747`).

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-radka-41-MB1-1 leak backstop blind on Czech items | fixed | taskText.ts:16-19,51-71; kinds.ts:41; hint.ts:107-109. Scratch: all five original forms leak=true | 119988a1 MB-B2: the reader strips a leading instruction... |
| L1-radka-41-MB1-2 'all of it right' after a hints-only night | fixed | recapRows.ts:233-234 'Worked through with N hints; nothing was marked.' | 715ce1ef M6 (MB-B11): the recap caption says 'all of it right' only when an item was marked... |
| L1-radka-41-MB1-3 hint grounding 4/8, fixed wrong-unit stance | fixed | hint/route.ts:36-39; hint.ts:87,124-139 | c7460599 MB-B8 (grounding)... |
| L1-radka-41-MB1-4 page read blind to system/age/labels | fixed | read.ts:17-20,37-46,109-113 | 50fd60a4 MB-B3: the maths read prompt carries the learner's school system... |

## New findings

- **Major (rank 9), carried from 2026-10-14 L1-radka-41-MB1-6, narrowed.** Most Czech forms now read and their answers are caught (Sečti X a Y, Vynásob, Zkrať, Převeď, Urči, 'Kolik je 3/4 z 20?', mixed numbers). Still unread, and the general `leaks()` lets the result through: 'Odečti 1/4 od 3/4' (VERB_OP joins only 'X a Y', taskText.ts:24,34), 'Vyděl/Vydělte' (not in INSTRUCTION, taskText.ts:18), 'Rozděl 60 v poměru 2:3', 'Uprav', 'Zaokrouhli ... na', 'Doplň'. Repro: scratch-radka-41/leak2.cjs. Frequency lowered to low, since the core verbs are covered.

## Notes

- Executed `readQuestion` + the leak rules from current source through tools/ts-load.cjs (scratch leak.cjs, leak2.cjs); no model calls.
- C1 holds for every form the readers read. On the forms listed above it rests on the prompt alone, and the TV still shows guarded and unguarded lines the same way.
