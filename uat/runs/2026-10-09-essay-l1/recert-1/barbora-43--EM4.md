# barbora-43 × EM4 · What happened tonight? (recert-1)

- Character: barbora-43 (Barbora, 43, Eliška's mother, external buyer; reads the recap and the Sunday page for Eliška, age 12, Family)
- Journey: EM4 the evening's recap and the week, read by the parent
- Cert level: L1 re-walk, code only, no model
- Head 782afdfb
- Recertifies 2026-10-09-essay-l1 at 12592a71
- **Verdict now: L1-conditional.** The recap now stays on the phone, counts a piece and a rewrite, and agrees with the week. A paragraph-only evening still has no delete and leaves the paragraph in session.json (major).

## Reachable surface (now)

- Phone Recap tab: shows whenever tonight has a tile with work or the evening ended since local midnight (`desk/src/app/phone/page.tsx:741`); one line per tile (`desk/src/tv/recapRows.ts:251-282`), the caption (`recapRows.ts:228-238`), the hint list only with a maths tile (`page.tsx:747`).
- TV recap essay tile: last three readings with 'and N earlier' (`desk/src/tv/screens.tsx:419-427`), each rail scaled past 12 (`recapRows.ts:201-205`).
- Essay history line: written by record() (`desk/src/lib/desk/essay.ts:123-134`), restated in place after a rewrite (`desk/essay.ts:277-286`), re-read after a piece (`desk/src/app/api/analyse/route.ts:136`; REHYDRATE `desk/src/lib/session/store.ts:995`).
- Sunday page: readings vs pieces and lenses in order read (`desk/src/lib/rules/week.ts:203-208,251-253,318-323`).
- Where the text goes: the one-time notice before the first reading of any kind (`route.ts:148`, accept button `page.tsx:717`); the shelf and its deletes only on the paragraph panel (`page.tsx:705,723`; `desk/src/app/phone/EssayShelf.tsx:45-47`).

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-barbora-43-EM4-1 Recap reverts to 'Arrives when the session ends.' (major) | fixed | `page.tsx:740-741` shows the body when any tile has work or the session ended since local midnight, whatever the TV shows | 715744b3 M7 (EM-B19): the phone's Recap shows for any tile with work or an evening ended since local midnight |
| L1-barbora-43-EM4-2 a piece recapped as 'not tonight' / '0 of 0' (major) | fixed | `recapRows.ts:56` takes ', N paragraphs'; `route.ts:136` dispatches essay.progress after record(), REHYDRATE `store.ts:995`; `week.ts:253` counts a piece. Repro: '3 of 12 ..., 3 paragraphs' → 'one reading (Structure): 3 of 12 sentences to fix', caption 'three to look at together'; Sunday 'one piece' | 8f8241fe M8 (EM-B20): a piece's history line is read again once the piece is recorded |
| L1-barbora-43-EM4-3 rewrites never reach the recap (major) | fixed | `desk/essay.ts:265,277-286` restates the line with ', k fixed'; `recapRows.ts:56,281`. Repro: '0 of 5 ..., 2 fixed' → '0 of 5 sentences to fix, 2 fixed tonight', caption 'Read through; nothing to fix.' | 1637cff6 M1 (EM-B1): a rewrite restates the reading's history line in place |
| L1-barbora-43-EM4-4 where the text goes and how to delete it covers kept pieces only (major) | **recurs** (narrowed) | Now the engine notice shows before the first paragraph, with an accept button (`route.ts:148`, `page.tsx:312-323,717`), and a delete clears s.essay (`desk/src/app/api/texts/route.ts:71-72`). Still: 'Delete everything I kept' shows only when a piece is kept (`EssayShelf.tsx:45`), so a paragraph evening has no delete; the paragraph stays in session.json (`store.ts:1130`); the shelf is hidden while the TV is on a sentence or the plan (`page.tsx:705`) | partial 0a53e75e (UD-6, UD-7), 274f3e42 the single-paragraph 428 opens the one-time text notice with its accept button |
| L1-barbora-43-EM4-5 the same paragraph read twice counts twice (minor) | fixed | `recapRows.ts:276-281` each reading's count in order, never summed; `recapRows.ts:220` caption counts the last reading. Repro: 'two readings (Evidence): 2 of 5, then 2 of 5 sentences to fix', caption 'two to look at together' | 4e209aef recap: essay phone line lists each reading's count in order read, caption counts the last reading |
| L1-barbora-43-EM4-6 'Nothing needed a second hint.' on a writing evening (minor) | fixed | `page.tsx:747` the hint list renders only for a maths tile that is not empty | 715744b3 M7 (EM-B19) ... the second-hint line only with a maths tile |
| L1-barbora-43-EM4-7 TV, phone and Sunday disagree in small ways (polish) | fixed | (a) phone lists the last three, 'the last three' (`recapRows.ts:277-280`), TV draws the same three plus 'and N earlier' (`screens.tsx:419-427`); (b) `railOf` scales: 14/2 → 12 arrows, 2 citron (`recapRows.ts:201-205`); (c) Sunday lenses in order read (`week.ts:203-208`) | 8eaf85c4 recap: railOf scales long readings, tiles say 'and N earlier'; 75154729 week: the Sunday page lists essay lenses in the order read |

## New findings

- **Polish (rank 2), from lead L1-barbora-43-EM4-7 / EM4-10 ceiling.** A piece is 'one reading' on the recap but 'one piece' on the Sunday page. Repro, same evening: recap 'two readings: Evidence 2 of 5, then Structure 3 of 12 sentences to fix'; Sunday 'One paragraph reading and one piece, through Evidence and Structure.' (`recapRows.ts:280`, `week.ts:322`). parseDetail drops the paragraph count (`recapRows.ts:56`).

## Notes

- Repro: `C:/Users/kazda/AppData/Local/Temp/essay-recert/scratch-barbora-43/repro.cjs` (recapRows, recapLine, recapCaption, railOf, sundayPage over synthetic evenings; no model).
- Curtain still 0: over a recorded reading the recap lines and the Sunday lines hold no 5-word run of the learner's paragraph (repro). Lead strengths EM4-8, EM4-9 and EM4-10 hold.
- The caption counts the last reading only (`recapRows.ts:216-220`); two different paragraphs both with faults count only the last. The code comment accepts it as a ceiling; not raised as a row.
- EM4-4 keeps rank 12: the delete half of C6 still fails on every paragraph-only evening. The L2 at 3e494e0c saw no accept button on the paragraph path; that part is now built (274f3e42), not live-verified.
