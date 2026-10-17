# radka-41 × MB1 · Tonight's sheet, together (recert-2)

- Character: radka-41
- Journey: MB1
- Cert level: L1 re-walk, code only, no model
- Head 90e032f2
- Recertifies: 2026-10-09-maths-l1 at d4f5042a
- **Verdict now: L1-pass.** The one open row, the narrowed Czech leak backstop, is closed: every named phrasing now reads into a spec or is worked out by the unread-item fallback, and the stated result is refused.

## Reachable surface (now)

- Homework door -> tonight's sheet -> a problem -> hints; leak check on both fields (`desk/src/lib/desk/hint.ts:107-114`).
- Task reading: instruction strip with subtrahend, divisor, ratio and simplify forms (`desk/src/lib/rules/taskText.ts:16-53`), plain forms (`:63-71`).
- Unread-item fallback now rounds (`desk/src/lib/rules/maths.ts:325`, numberAnswerOf).

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-radka-41-MB1-1 Odečti X od Y / Vyděl / Rozděl v poměru / Uprav / Zaokrouhli / Doplň leak only prompt-guarded | fixed | taskText.ts:18 (INSTRUCTION now has vydel, uprav, dopln, zapis), :35-44 (od, číslem, v poměru, Uprav forms); Zaokrouhli via maths.ts:325. Executed leaksLine(cz) on all named phrasings plus 'Odečti 1/6 od 3/4' + '7/12' and 'Doplň' + 'The missing numerator is 9': all true | d88fb34c |

## New findings

None.

## Notes

- Executed from current source via tools/ts-load.cjs (scratch/radka-41/leak.cjs): Odečti 1/4 od 3/4, Vyděl 3/4 číslem 1/2, Vydělte 3/4 : 1/2, Rozděl 60 v poměru 2:3, Zaokrouhli 3,456 na desetiny (3,5), Uprav 3/4 + 1/6 (11/12), Doplň: 3/4 = ?/12 (So 9.): all leaksLine=true. Zaokrouhli is caught by unreadLeaks, the rest by leaksSchool on a school spec. No model calls.
- Not run: false-positive rate on method lines (the commit pins passing lines in maths-rules-test); L2 owns that.
