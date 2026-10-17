# nela-12 × MB1 · Sheet to hint (recert-3)

- Character: nela-12
- Journey: MB1
- Cert level: L1 re-walk, code only, no model
- Head 00f5db95
- Recertifies: 2026-10-09-maths-l1/recert-2 at 90e032f2
- **Verdict now: L1-pass.** 1 fixed, 0 recur; 0 rows open. Was L1-conditional.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-nela-12-MB1-1 'Zaokrouhli 3,456 na dvě/2 desetinná místa' is not read by the rounding fallbac… (minor) | **fixed** | 8f5e4a5e widens the rounding fallback (rules/maths.ts:325-327) to "na <N/jedno/jeden/jedna/dve/tri/ctyri> desetinná místa". Executed leaksLine at cz (scratch r3.cjs): "Zaokrouhli 3,456 na dvě desetinná místa" with "3,46" and with "Je to 3,46." true; "na 2 desetinná místa" with "3,46" true; "na jedno desetinné místo" with "3,5" true; English "Round 3.456 to 2 decimal places" with "3.46" true; a method line ("Zaokrouhlení se řídí třetí číslicí.") false. Edge, not a new row: "na tři desetinná místa" with "3,456" is not flagged, because that is the number the question prints. | 8f5e4a5e |

## New findings

None.

## Notes

- Evidence check at 00f5db95: every cited line was re-mapped through `git diff -U0 90e032f2 00f5db95` (a cite inside a changed hunk is re-read by hand); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
