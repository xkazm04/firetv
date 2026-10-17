# vojtech-18 × MB1 · Tonight's sheet, together (recert-1)

- Character: vojtech-18 (18, high school, cz, School maths path)
- Journey: MB1 · Tonight's sheet, together
- Cert level: L1 re-walk, code only, no model
- Head: d4f5042a
- Recertifies: 2026-10-09-maths-l1 at 12592a71
- **Verdict now: L1-fail**. The code leak guard now covers his equations, school sums, quadratic inequalities, a1/d sequences and two-point lines, but a listed sequence, a bare log, a simplify item and a combination count still have no backstop, so the C1 blocker narrows rather than closes.

## Reachable surface (now)

- Read: `POST /api/read` passes his profile (`desk/src/app/api/read/route.ts:37`); the prompt carries cz notation, course, age and printed language (`desk/src/lib/desk/read.ts:27-48`).
- Hint: `desk/src/lib/desk/hint.ts:141-198`. Stance by `stanceOf` (`:93-98`), voice by `voiceOf` (`desk/src/lib/rules/voice.ts:75-78`), 25-word cap (`hint.ts:50`), leak check `leaksLine` (`:107-109`) -> `leaks()` (`desk/src/lib/rules/maths.ts:281-291`), which now adds `unreadLeaks` (`:314-317`) and `leaksMaturita` (`desk/src/lib/rules/maturita.ts:80-106`).
- Point & ask: recogniser cs-CZ for cz (`desk/src/app/phone/recogniserLang.ts:7-8`), presets English (`desk/src/app/phone/page.tsx:680`).
- Recap: named hinted problems (`desk/src/tv/recapRows.ts:112-125, 171-180`; `desk/src/tv/screens.tsx:380-382`).

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| MB1-1 leak guard reads none of his tasks (blocker 27) | recurs, narrowed (blocker 18) | Executed 25 answer-bearing lines at cz: 19 refused (equations with or without a colon, Czech instructions, quadratic inequality, a1/d sequence, two-point line, school sums). Still passing: 'The 10th term is 39.' / 'Desátý člen je 39.' on a listed sequence (`maturita.ts:47-62` needs a1 and d), 'Je to 3.' on 'Vypočtěte log_2 8.', '10 choose 3 is 120.' / 'Je to 120 způsobů.', 'Je to x + 3.' on a simplify item, 'x leží mezi dvěma a třemi.' (inflected number words) | 0a53e75e (UD-26, partial); earlier 119988a1, c4d9ef75 |
| MB1-2 linear-equations stance, 'a 15-year-old' | recurs, partial | Wrong unit gone: neutral stance (`hint.ts:87, 93-98`). It names no method for the task and still says 'a 15-year-old' (`voice.ts:68-78`) | 0599317f (partial) |
| MB1-3 read prompt has no school system or notation | fixed | `read.ts:27-48` mathsContext; route passes who (`route.ts:37`) | 50fd60a4 |
| MB1-4 English only, no word cap, en-US speech | fixed | 25-word cap with re-ask (`hint.ts:50, 182-187`); cs-CZ recogniser (`recogniserLang.ts:7-8`). Presets stay English, which his expected line allows | d642c422, 5a2135b9 |
| MB1-5 recap cannot say which problems | fixed | `recapRows.ts:112-125` hintedOf, `:171-180` hintedLine ('Hints on 3 and 5b; a second on 5b.'), named lamps `screens.tsx:380-382` | bf99e8ac, 26e477c4, 92647c57 |

## New findings

None. (The 2026-10-14 walk raised no new MB1 row for him; its MB1-6 was a strength.)

## Notes

- Probes: scratch `p1.cjs`, `p7.cjs` (leaksLine with `readQuestion` at cz). No model was called.
- The residual MB1-1 gap is the backstop only. The prompt's withhold rule (`hint.ts:75-76`, HINT_WITHHOLD) still applies to every task; whether the model obeys it is L2.
