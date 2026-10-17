# nela-12 × MB5 · Setting up a child (recert-4)

- Character: nela-12
- Journey: MB5
- Cert level: L1 re-walk, code only, no model
- Head 67581c54
- Recertifies: 2026-10-09-maths-l1/recert-3 at 00f5db95
- **Verdict now: L1-conditional.** 1 fixed, 2 recur; 2 rows open.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-nela-12-MB5-1 The school system defaults silently to UK, and the row's blurb does not say it d… (minor) | **fixed** (not-seen) | 5da74e9a makes the School system blurbs name the number convention (profileRows.ts:26-31: cz 'Progress is shown against Czech ročníky. 0,5 is a half (decimal comma).', uk and us 'decimal point', de 'decimal comma') and the Save cell name the system it will save (saveBlurb, :71-76, used at :87). Executed at 67581c54 (scratch r5.cjs): profileRows(null) Save -> 'Saves as United Kingdom (0.5 is a half); pick a school system above to change it.'; system uk -> 'Saves as United Kingdom (0.5 is a half).'; cz -> 'Saves as Czech Republic (0,5 is a half).'; de -> 'Saves as Germany (0,5 is a half).'. The default is still UK (DEFAULT_SYSTEM, :24) but no longer silent. Pinned by tools/tv-keys-test.cjs:543. | 5da74e9a |
| L1-nela-12-MB5-2 A 12-year-old in 6. ročník is taken for 7. ročník (schoolYear ignores the cut-of… (minor) | recurs → L1-nela-12-MB5-1 | cited lines re-found at 67581c54; no commit since 00f5db95 touched the cited files | none |
| L1-nela-12-MB5-3 The phone's Recap tab, opened on a new day before any desk event, still shows ye… (minor) | **recurs, fix in flight** → L1-nela-12-MB5-2 | recurs, fix in flight. Read from the code at 67581c54: recapRows.ts:79 still reads hints and second from s.log with no day check, store.ts:665-670,680 still clears only inside reduce, and the phone's Recap guard (phone/page.tsx:746-747) is unchanged; no commit since 00f5db95 touched recapRows.ts or store.ts. A separate run is building the next-day Recap fix (recapRows.ts, phone/page.tsx); it is not on this HEAD, so the row stays open until it lands, then re-walk. | none |

## New findings

None.

## Notes

- Evidence check at 67581c54: every cited line was re-mapped through `git diff -U0 00f5db95 67581c54` (a cite inside a changed hunk is re-read by hand; all shifted cites were compared line for line with the old content, 77 of 77 identical); commits that changed a file a row cites are named in the row. Scratch repros are outside the repo. Model-dependent behaviour stays with L2.
