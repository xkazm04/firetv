# kristyna-17 × EM3 · The whole essay (out-of-segment: a Czech piece)

- Cert level: **L1**. Base `main` HEAD `4af25199`. Prior: `uat/runs/2026-10-09-essay-l1/kristyna-17--EM3.md` (L1-fail, two blockers).
- **Verdict: L1-conditional.** Both blockers are fixed (counts from a broken split; a failed paragraph drawn as pending). Two majors/minors stay (the page never names the paragraph; a Czech title line is read as English) and the language bypass applies per paragraph.

## Reachable surface set

As Daniel: the paste box, "Read the whole piece on the TV", the notice, the shelf. `route.ts:93-96`: a piece with no English paragraph is refused whole with the NOT_ENGLISH line before anything is kept or read; otherwise each paragraph is checked in code before its call (`desk/essay.ts:164`).

## Walk

She pastes a Czech essay: a title ("Je škola důležitá?") and two body paragraphs of three and two sentences. **Executed (t3.cjs):** `paragraphsOf` gives the title plus two body paragraphs; `paragraphIsEnglish` gives [true, false, false], because the title has under 6 words. So the piece is not refused whole (one paragraph "is English"); the two body paragraphs are `notEnglish` (no call, struck through on the map, named in the summary: `rules/essay.ts:526-532`), and the title is sent to the model as paragraph 1 and counted. L1-kristyna-17-EM3-10 (new). If the title line is left out, the piece is refused whole in one line (`route.ts:96`).

Counts: **Executed (t3.cjs)** for a five-block piece with one failed paragraph: "0 of 9 sentences to fix across 5 paragraphs. Paragraph 3 did not come back. Send it again from the phone." The counts use `ruledSentences`, so unruled paragraphs are not counted as "to fix" or as read (`rules/essay.ts:456-457,521-524`). Fixed: L1-kristyna-17-EM3-1.

A failed paragraph is `not-read`, drawn struck through, captioned "Not read · Paragraph k did not come back" (`EssayTV.tsx:268-270,413`) and can be sent again alone (`page.tsx:311`; `rules/essay.ts:503-519`). Fixed: L1-kristyna-17-EM3-2. A paragraph still being read says "Neutral · Nothing flagged." on the page (L1-daniel-15-EM3-13; same surface).

The forensic page's crumb says "Sentence n of N" and never the paragraph; "Start with paragraph p, sentence n" is on the lens home only (`EssayTV.tsx:421,149`): L1-kristyna-17-EM3-3, recurrence 2. After "Delete" the phone keeps the deleted piece's id, so the next keep-and-read fails "That piece is not on your shelf." (EM3-4). The first wait on a first piece says "your paragraph" (EM3-6).

| C | Result | Evidence |
|---|---|---|
| EM3 definition of done: a paragraph that fails to come back does not lose the rest | **pass** | `desk/essay.ts:165-170` |
| chooses to keep, told where the text goes, can reopen as a version or delete | **partial** | notice and delete: pass; reopen as a version only through Open (Daniel EM3-2); a deleted piece's id lingers (EM3-4) |

## Metrics

Language: of three paragraphs, two correctly refused, one (the title) read as English: 2 of 3 right. Reliability: failures are recoverable.

## Grounding and wiring

ES-READ 3/8 (EM1-5). `GET /api/texts` `noticed` / `notice` unwired (EM3-7).

## Time saved

Her file: negative if the desk reads what it cannot. L1-live: about +1 (a mixed piece is refused paragraph by paragraph, in lines she can read, after the title's wasted call).

## Findings

Fixed: EM3-1, EM3-2. Open, recurrence 2: EM3-3, -4, -5, -6, -7. New: EM3-10. Strengths: EM3-8, -9, -11.

## Voice

When I pasted the whole Czech essay it did not pretend. It marked the two real paragraphs as not read and told me why in a line I can read. That is the opposite of last time, when it counted sixty sentences that were not sentences.

But it still read my title, "Je škola důležitá?", as if it were English, and gave it a place in the list. And the big screen never says which paragraph I am looking at, I count the gaps on the left with my finger. For a Czech teacher this tool is honest and useless. For my friend with English essays it might be good.
