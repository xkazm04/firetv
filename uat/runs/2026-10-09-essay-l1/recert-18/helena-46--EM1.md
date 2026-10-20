# helena-46 × EM1 · (recert-18)

- Character: helena-46
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head 8a739027
- Recertifies: 2026-10-09-essay-l1/recert-17 at 37d8e8e6
- **Verdict now: L1-conditional.** 0 fixed, 1 recur; 1 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-helena-46-EM1-4 A language the desk does not read is refused only when it is clearly Czech; short Czech, C… (polish) | recurs → L1-helena-46-EM1-4 | recert-18 @8a739027: Re-walked at 8a739027 (the local main tip); what the previous walk (at 37d8e8e6) found: paragraphIsEnglish (desk/src/lib/rules/essay.ts:270-280) changed in 23ce1e87: a paragraph under ENGLISH_MIN_WORDS (6, :265) with no English function word and one plain-letter Czech word of three letters or more (czechPlain >= 1, :276) is now refused, and about 180 everyday words joined CZECH_WORDS (:208-210), with CZECH_NAME_LIKE (:244) keeping tim, pak, nas, mas, nim, jen, tam, ani, ted from counting alone. Measured in the scratch script (rc18/exec18.cjs, tools/ts-load.cjs, no model): paragraphIsEnglish refuses 45 of 53 Czech and 0 of 42 English lines of tools/essay-heldout-czech-short.json (84.9%; the file was committed by 5b71182b before the rule change 23ce1e87, its sha256 still equals the pinned one); the 8 held-out leaks are "Sneh uz roztal.", "Pozdravuj sestru.", "Autobus ujel.", "Telefon mi dosel.", "Ucitel nas pochvalil.", "Dej mi vedet.", "Pojd s nami ven.", "Pomuzes mi s ukolem?"; recert-12/heldout.json Czech 48/48, English 0/32, German 5/5, Polish 3/3, short plain-letter Czech 6/6 (a tuned figure: some of those lines informed the tuning set); recert-11/heldout.json Czech 72/72, English 0/34; the Kamarad line is refused. The row's expected text, "A Czech message is refused in a plain sentence before the wait", does not hold on held-out evidence: 8 of 53 short plain-letter Czech lines (15.1%) still reach the model. The tuned figure (the 6 cs-short-plain-letter lines of recert-12/heldout.json, 6 of 6) and the held-out figure (45 of 53) are kept apart on purpose. Narrowed, not fixed: the polish row stays open; it was 4 of 6 at 37d8e8e6. The remaining gap is a lexicon question (the refusal is a word list, so every unlisted everyday word is a leak), and a further round needs a FRESH held-out set, never this one. git diff -U0 37d8e8e6 8a739027 touches desk/src/app/api/analyse/route.ts (:58-60 assignmentOf added; the readPiece call :190 -> :193 and the analyseEssay call :203 -> :206), desk/src/app/phone/page.tsx (:124-125 the assignment expression added; the piece call :340 -> :342 and the paragraph call :367 -> :369 changed in place; every later line is +2), desk/src/lib/desk/essay.ts (additions at :83-86, :90-96, :122, :132-133, :181, :201: ReadingFor.assignment and .earlier, withEarlier and earlierLine, one system sentence, two data rows, a withEarlier call in analyseEssay and in analysePiece; every later line is +16) and desk/src/lib/rules/essay.ts (:208-210 the CZECH_WORDS tail, :243-244 CZECH_NAME_LIKE, :246/:248 the englishReading signature, :254-255 czechPlain, :262, :274-278 the short-paragraph arm of paragraphIsEnglish; every later line is +10), and no other desk file. Every cite of recert-17 (101 cited line numbers, ranges expanded) was re-mapped through it per file and compared byte for byte with the old line: 0 differ; the 5 inside a hunk (route.ts old :190 and :203, page.tsx old :340 and :367, rules/essay.ts old :268) were re-read by hand at route.ts :193 and :206, page.tsx :342 and :369, rules/essay.ts :274-278. |  |

## New findings

None.

## Notes

- Evidence check at 8a739027: every cited line was re-mapped through `git diff -U0 37d8e8e6 8a739027` per file and compared with the old line (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> main` (5b71182b, 23ce1e87 and 8a739027: all true). Model-dependent behaviour stays with L2.
