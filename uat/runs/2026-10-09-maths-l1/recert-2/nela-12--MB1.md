# nela-12 × MB1 · Sheet to hint (recert-2)

- Character: nela-12 (12, cz, elementary), with Mum beside her.
- Journey: MB1 · Sheet to hint
- Cert level: L1 re-walk, code only, no model
- Head 90e032f2
- Recertifies: 2026-10-09-maths-l1 at d4f5042a (recert-1)
- **Verdict now: L1-conditional.** The Czech instruction backstop (L1-nela-12-MB1-1) is closed by d88fb34c; one residual 'Zaokrouhli' phrasing leaks through the blind fallback (new, minor).

## Reachable surface (now)

- Instruction stripping: `desk/src/lib/rules/taskText.ts:16-21` (INSTRUCTION now lists vydel, uprav, dopln, zapis), `:35-45` (Odečti X od Y, Vyděl X číslem Y, Rozděl N v poměru, Uprav, Zapiš jako).
- Reader: `desk/src/lib/rules/kinds.ts` readQuestion; hint leak check `desk/src/lib/desk/hint.ts:107-109`.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-nela-12-MB1-1 leak backstop reads nothing on common Czech phrasings | fixed | Executed (scratch `read.cjs`, cz): 'Odečti 1/6 od 3/4' reads compute 3/4 - 1/6 and 'You get 7/12.' leaks=true; 'Odečti 1/2 od 3/4', 'Vyděl 3/4 číslem 1/2' ('= 1 1/2'), 'Uprav na základní tvar 18/24' and 'Uprav 18/24 na základní tvar' ('3/4'), 'Doplň: 3/4 = ?/12' ('9'), 'Zapiš 3/4 jako desetinné číslo' ('0,75'), 'Rozděl 60 v poměru 2:3' ('So 24 and 36.') all read into a school spec and every answer line leaks=true. 'Zaokrouhli ... na desetiny/setiny/jednotky' is no school unit, but `maths.ts:325` works the rounded value out and general leaks() is true. | d88fb34c |

## New findings

- **Minor (rank 6).** 'Zaokrouhli 3,456 na dvě desetinná místa', 'na 2 desetinná místa', 'na jedno desetinné místo': no spec, and the blind rounding fallback `desk/src/lib/rules/maths.ts:325` matches only `(\d) decimal places|dp`, desetiny, setiny, jednotky, tisiciny, so '3,46' is not caught (general leaks false). English 'Round 3.456 to 2 decimal places' is caught.

## Notes

- Probes: scratch `read.cjs`, `rd2.cjs` (recert2/scratch/nela-12), real readQuestion / leaksSchool / leaks, no model.
- L2: three live hints on 'Odečti 1/6 od 3/4' and 'Uprav na základní tvar 18/24' on a cz profile, counting lines that state the result.
