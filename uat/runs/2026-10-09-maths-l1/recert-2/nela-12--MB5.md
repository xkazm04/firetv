# nela-12 × MB5 · Is it worth keeping? (recert-2)

- Character: nela-12 (12, cz, elementary), with Mum beside her.
- Journey: MB5 · Is it worth keeping?
- Cert level: L1 re-walk, code only, no model
- Head 90e032f2
- Recertifies: 2026-10-09-maths-l1 at d4f5042a (recert-1)
- **Verdict now: L1-conditional.** Three minors remain, all unchanged: the silent UK default, the school year off by one, and the phone Recap showing yesterday's hints on a new day before any event.

## Reachable surface (now)

- Profile: `desk/src/tv/profileRows.ts:24-33`. School year: `desk/src/lib/library/syllabus.ts:302-304`, `desk/src/lib/rules/stretch.ts:74-78`.
- Recap: `desk/src/tv/recapRows.ts:79`; log day `desk/src/lib/session/store.ts:664-669,679`; phone guard `desk/src/app/phone/page.tsx:740-746`.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-nela-12-MB5-1 silent UK default, blurb silent on 0,5 | recurs (minor) | `profileRows.ts:24` DEFAULT_SYSTEM 'uk', `:29` cz blurb names ročníky only, `:33` systemOf falls back silently. Untouched since recert-1. | null |
| L1-nela-12-MB5-2 12-year-old taken for 7. ročník | recurs (minor) | `syllabus.ts:302-304` age - start + 1 with no cut-off; `stretch.ts:74-78` learnerYear. Untouched. | null |
| L1-nela-12-MB5-3 phone Recap on a new day shows yesterday's hints | recurs (minor) | `recapRows.ts:79` still reads `s.log?.hints` without `s.log.day`; `store.ts:664-669,679` clears only inside reduce; `phone/page.tsx:740-741` guard passes when a tile is non-empty. | null |

## New findings

None.

## Notes

- Evidence check at HEAD (file/line; git log shows none of these files changed after d4f5042a); repros not re-run.
