# radka-41 × MB4 · Mapping a paper (recert-2)

- Character: radka-41
- Journey: MB4
- Cert level: L1 re-walk, code only, no model
- Head 90e032f2
- Recertifies: 2026-10-09-maths-l1 at d4f5042a
- **Verdict now: L1-conditional.** The single open row is unchanged: a cz parent still maps a CERMAT mock from the one GCSE-worded statement list.

## Reachable surface (now)

- Phone Paper tab: rows, per-row statement picker with a find box (`desk/src/app/phone/PaperPanel.tsx:15-40`), one list for every system (`:12`).

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-radka-41-MB4-1 97 GCSE-worded statements for a CERMAT mock | recurs (major, rank 9, unchanged) | PaperPanel.tsx:12 WHOLE = statementChoices() with no system; :36 prints c.can and '(a harder statement)'; paperEntry.ts:48 takes no system. 37425037 touched MB4-2 routing only | none |

## New findings

- **L1-radka-41-MB4-2** (major 12, new, the routing watch item): 37425037 and 4b82f0a3 send the school-age learner's fraction and notation statements (N1, N2, N8, A1) to not-on-the-desk when the unit is below their year. Executed: a UK 12-year-old, a CZ 12-year-old and Šimon (CZ 14) lose every fraction topic, the TV caption reads "None of these has a topic on the desk yet."; a UK 10-year-old and the old routing keep them. See the row in recert-2/findings.json.


## Notes

- Evidence check only; no PaperPanel, paperEntry or gcse.ts change since recert-1. L2: time a non-specialist typing the 16-question mock.
