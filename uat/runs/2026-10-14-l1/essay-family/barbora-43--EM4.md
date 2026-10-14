# barbora-43 × EM4 · Was tonight worth it?

- Cert level: **L1**. Base `main` HEAD `4af25199`. Prior: `uat/runs/2026-10-09-essay-l1/barbora-43--EM4.md` (conditional, four majors).
- **Verdict: L1-conditional.** Three of four prior majors and the "second hint" confusion are fixed; the recap is now exact for a paragraph, a rewrite and a piece. One major stays: C6, where the text goes and how to delete it, for a paragraph evening.

## Reachable surface set

The TV recap (`screens.tsx:343-401`, essay tile of arrows per reading) and its "On the parent's phone" chip (`:335`); the phone's Recap tab in the Parent role (`page.tsx:712-727`) with the Sunday page under it (`:744-750`); the Essay tab's notice and shelf (Student role). No parent lock (Phase 1).

## Walk

Eliska reads one paragraph (Evidence, 1 of 4 sentences to fix), rewrites the faulty sentence (holds), ends the evening. **Executed (scratch t4.cjs):**

- TV tile line source / phone line: "Essay Master - one reading (Evidence): 1 of 4 sentences to fix, 1 fixed tonight". Matches the readings and the rewrite (`recapRows.ts:157-160`, `desk/essay.ts:266-275`). Fixed: L1-barbora-43-EM4-3.
- A five-paragraph piece (`3 of 12 sentences to fix, 5 paragraphs`) is parsed (`recapRows.ts:36`) and no longer "not tonight" or "0 of 0"; Sunday says "One piece, through Structure." (`week.ts:198,262`). Fixed: L1-barbora-43-EM4-2.
- The phone Recap shows whenever a tile has work or the evening ended since midnight, whatever the TV is on (`page.tsx:717-718`). Fixed: L1-barbora-43-EM4-1. "Nothing needed a second hint." shows only beside a maths tile with work (`:724`). Fixed: L1-barbora-43-EM4-6.
- Three readings in an evening: "three readings: Evidence 1 of 4, then Evidence 1 of 4, then Structure 2 of 5 sentences to fix"; the caption says "two to look at together" (last reading only; accepted in code, `recapRows.ts:97-100`): L1-barbora-43-EM4-5, recurrence 2.
- The Sunday page: "Eliska worked on one evening. Essay Master. One paragraph reading, through Evidence." Lenses and counts, nothing about the writing: C5 pass. Strength EM4-9 holds.

| C | Result | Evidence |
|---|---|---|
| C1 BLOCKER, nothing she could hand in | **uncertain (L2)**, recap and Sunday: **pass** (counts and lens names only) | `recapRows.ts:132-161`, `week.ts:258-264` |
| C2 recap counts match the readings | **pass** | above; one qualification, the caption's last-reading rule |
| C3 Recap tab and Sunday page never quote her sentences | **pass** | curtain 0 by construction (EM4-8) |
| C4 which sentence, from the TV alone | **pass** | EM1 |
| C5 Sunday names lenses and a count, nothing else | **pass** | EM4-9 |
| C6 where the text goes and how to delete it | **fail** | below |

**C6 (L1-barbora-43-EM4-4, recurrence 2).** The notice (the only place the engine is named) appears only on `body.keep` of a multi-paragraph piece (`route.ts:98-101`; Keep and the piece button exist only with more than one paragraph, `page.tsx:92,695-697`). A single-paragraph evening shows no notice, no shelf entry and no delete; the shelf says "Nothing kept yet" (`EssayShelf.tsx:44`). The paragraph and its sentences sit in `session.json` (`store.ts:1070`, `JSON.stringify(store.session)`), and "Delete everything I kept" removes the shelf folder only (`api/texts/route.ts:77-79`), clearing nothing on the desk.

## Metrics

| Metric | L1 |
|---|---|
| recap specificity | exact on the six evenings walked (one reading, a rewrite, a piece, three readings; Sunday for a paragraph, a piece, a mix); the caption's number is the last reading's |
| curtain | 0 |

## Grounding

n-a (code-built); the memory line for an essay evening is counts and lens names only (`recapRows.ts:191-202`).

## Time saved

Promise about 13 minutes an evening. L1-live: about 13, confidence medium-high: the recap is now a reliable statement of the evening. Her condition (it is Eliska's work) rests on EM1's C1, which L1 cannot discharge.

## Findings

Fixed: EM4-1, -2, -3, -6. Open, recurrence 2: EM4-4, -5, -7. Strengths: EM4-8, -9, -10 (new).

## Voice

Tonight's page says: one reading, Evidence, 1 of 4 sentences to fix, 1 fixed tonight. That is what happened on the sofa, I counted. And the Sunday page says only which lens and how many readings; it does not show what she wrote. That is how I want it.

What I still cannot find: where did her paragraph go? On a normal evening, one paragraph, nothing told me the desk sends it to some engine on the computer, and nothing showed me how to throw it away. I looked for the delete and the shelf says "nothing kept". That bothers me more than any wrong number. A tool that says it holds nothing while it holds her paragraph is not one I leave in the living room.
