# daniel-15 × EM3 · The whole essay

- Cert level: **L1**. Base `main` HEAD `4af25199`. Prior: `uat/runs/2026-10-09-essay-l1/daniel-15--EM3.md` (L1-fail, one blocker).
- **Verdict: L1-conditional.** The blocker (every intro and conclusion false-faulty, "Start with" pointing at it) is fixed for the Structure lens given a named claim chain. Four new or narrowed majors: verdicts withheld until the last paragraph (C3), the pending page says "Neutral", Evidence-lens intro/conclusion faults, and the chain dependence.

## Reachable surface set

Phone: paste with blank lines → paragraphs (`page.tsx:258-263`), "Read the whole piece on the TV" and Keep (`:695-697`), the one-time notice (`:694`, `EssayShelf.tsx:54`), the shelf (`:700`), "Read the paragraphs that did not come back" (`:311`). Route `kind: piece` (`route.ts:90-124`): limits, language check per paragraph, optional keep after the notice (428), then one call per paragraph with progress dispatched to the TV; the piece is ruled once after the last paragraph (`desk/essay.ts:171`). Unreachable: the Workroom, a grammar check.

## Walk

1. He opens the Essay tab. The box starts with the sample (`page.tsx:53,76`). He pastes four paragraphs plus a title line at the cursor. **Executed (t1):** sample + paste at the end → paragraph 1 is "...This is bad.Should school start later"; at the start the last paragraph fuses with the sample. L1-daniel-15-EM3-3.
2. "That is 5 paragraphs. Read the whole piece, or one paragraph at a time." The title line is its own paragraph and costs a call (`rules/essay.ts:82`; only a "# " heading is a title). L1-daniel-15-EM3-7.
3. Read the whole piece. The notice shows once; "Read without keeping" is offered. The TV leaves the lens home for `forensic` when paragraph 1 returns (`store.ts:723`). Every paragraph is drawn pending until the last returns. The sentence page for a pending paragraph says "Neutral · Nothing flagged." (`EssayTV.tsx:418`). **New L1-daniel-15-EM3-13.** No verdict lands before the last paragraph: **new L1-daniel-15-EM3-14** (C3 second clause fails by design, about 100 s of outlines for four paragraphs).
4. **Executed (t3.cjs, 5-block essay, model names the chain):** Structure gives 1 of 12 to fix; thesis, topic sentences and conclusion strong. Same labels without `supports`: the thesis is the first unsupported claim and the summary reads "Start with paragraph 2, sentence 2" (**L1-daniel-15-EM3-16**, uncertain: does the live model name the chain?). **Evidence lens:** 6 of 12 faulty, including the thesis, the intro's second sentence and the conclusion (**L1-daniel-15-EM3-15**).
5. The summary names the paragraph to start with, but it is drawn only on the lens home's "Last verdict" caption and the landing card (`EssayTV.tsx:149`); the page he is on says "Sentence n of N" and never names the paragraph (L1-daniel-15-EM3-4).
6. After the read the phone offers "Next paragraph (2 of 5)" (`page.tsx:674`), and "This paragraph only" would replace the piece's reading with one paragraph (EM3-5). With the TV on a sentence the paste box and the shelf are hidden (`:668,682`; EM3-6).
7. He rewrites and pastes the revised essay from the laptop: `setPieceId(undefined)` (`:262`), so it is a second "Untitled essay", not a version (EM3-2; C6 fails; the 409-duplicate half is fixed, `route.ts:98-101`).

| C | Result | Evidence |
|---|---|---|
| C1 BLOCKER | **uncertain (L2)** | as EM2 |
| C2 whole essay from one paste, no paragraph-by-paragraph step | **pass** | `page.tsx:258-263,695-697` |
| C3 progress k of n, and the first paragraph's verdicts before the last | **fail** | no verdicts until the last (`desk/essay.ts:171`); "reading k of N" only on the lens home card (`EssayTV.tsx:278`) |
| C4 summary names the paragraph to start with | **pass on the lens home, not on the page he is on** | `rules/essay.ts:459` |
| C5 still-faulty stays hatched with a reason | **pass** | as EM2 |
| C6 same piece again is a version | **fail** | `page.tsx:262` |
| C7 nothing claims grammar was checked | **pass** | EM3-9 |

## Metrics

| Metric | L1 |
|---|---|
| time to first verdict (piece) | about 4 × 25 s = 100 s before any verdict (W-run: 27.6 s per paragraph) |
| curtain | 0 |
| reliability | a failed paragraph is struck through and can be sent again (`rules/essay.ts:473-477`, `page.tsx:311`); fixed L1-daniel-15-EM3-8 |

## Grounding and wiring

ES-READ 3/8; the whole piece is context for each call (S1). The task (S6) is never sent, so a title line is read as a paragraph. Unwired: `provider`, `stats.words`, `stats.links`, `connectors`, GET `/api/texts` `noticed` / `notice` (EM3-10).

## Time saved

Promise 5 minutes (his own estimate: 0 to 10). L1-live: about 0 to -5: 100 s of nothing, a Start-with that may point at the thesis, and the revised essay cannot be re-read as a version.

## Findings

Fixed: EM3-1, EM3-8. Open, recurrence 2: EM3-2, -3, -4, -5, -6, -7, -9, -10, -11. New: EM3-13, -14, -15, -16. Strength: EM3-12.

## Voice

I pasted four paragraphs and a title and it read them all, nobody made me send them one by one. Good. Then I waited, and the big screen showed me boxes. I opened my first sentence and it said "Neutral. Nothing flagged." which is lying, it has not looked at it yet. After a minute and a half it picked a paragraph. If it is the intro again, I do not care.

Then I fixed it on the laptop, pasted it again, and now I have two "Untitled essay" on the shelf. And nothing says it does not check my grammar. My teacher marks grammar. I wanted to know what this actually does for tomorrow.
