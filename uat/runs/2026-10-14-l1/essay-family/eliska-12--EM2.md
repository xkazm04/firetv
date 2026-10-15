# eliska-12 × EM2 · Fix it myself

- Cert level: **L1**. Base `main` HEAD `4af25199`. Prior: `uat/runs/2026-10-09-essay-l1/eliska-12--EM2.md` (conditional).
- **Verdict: L1-fail.** One blocker by rank: under the Evidence lens a rewrite that is still only an opinion is ruled neutral, so it "holds" and THE MOVE inks (L1-eliska-12-EM2-1, was major, now deterministic and re-ranked). Her C5 ("the move inks only when the rewrite holds") fails on her own lens. Everything else completes.

## Reachable surface set

Forensic page actions (`EssayTV.tsx:343-348`), Rewrite on my phone (`keys.ts:466`, status line only), the phone rewrite panel (`page.tsx:668-674`, her sentence prefilled), `/api/analyse` `kind: rewrite` (`route.ts:51-75`). Unreachable: nothing relevant.

## Walk

She is on the page for the planted sentence (EM1), presses Rewrite on my phone (the instruction lands only on the status bar, `keys.ts:466`), the phone moves to the rewrite panel with her sentence prefilled, she edits it, Send. Refusals before any call: blank, two sentences, the same sentence again, one that "would not stay one sentence" (`rules/essay.ts:571-581`). The model is asked about sentence n alone with the other sentences as context; `decideVerdicts` rules; the other verdicts are kept (`desk/essay.ts:253`); the move inks only for a hold (`EssayTV.tsx:335,425`).

**Executed (scratch t2.cjs).** P1, planted S3 faulty under Evidence. She rewrites S3 as "Walking is just much nicer for everybody." The model reads it as `opinion`. Result: `before faulty, after neutral` → `rewriteState` = holds → the move inks, the caption says "Rewrite · it holds". Cause: the Evidence context passes only checkable sentences (`rules/essay.ts:540-550`), the opinion S1 it would back is absent, `backsOf` is undefined (`:362`), and rule (d) makes every opinion neutral (`:392`). The same rewrite under Structure stays faulty. A rewrite that adds a number ("A survey in 2020 found that 60% of walkers felt happier.") is strong, correctly.

| C | Result | Evidence |
|---|---|---|
| C5 judged alone, others kept, move inks only on a hold | **fail (Evidence lens)** | above; others kept: pass (`desk/essay.ts:253`) |
| C3 note she can act on | **fail on wording** | "Rewrite · not yet" now shows the code line (`EssayTV.tsx:415`), adult wording (L1-eliska-12-EM1-7) |
| C4 move and slotted pattern | **pass; fallback frame has three sentences** | the playbook frame for Evidence and Language is the Paragraph pattern (`lessons.data.ts:37-42,51`) and a one-sentence rewrite refuses three sentences (`rules/essay.ts:574-575`). L1-eliska-12-EM2-2 |

Other rows re-derived, still open: EM2-3 (kept verdicts go stale after her rewrite adds the evidence, `desk/essay.ts:253`), EM2-4 (the refusal "In the paragraph that would not stay one sentence." is unchanged, `rules/essay.ts:581`), EM2-5 (after a hold, focus goes to Next sentence, which steps to n+1, `keys.ts:182-187,470`).

## Metrics

| Metric | L1 |
|---|---|
| others kept | true by construction |
| rewrite uplift | L2; code-only locator: 4 simulated Evidence-lens rewrites (P1 S3 and P2 S2, each once as a new opinion and once with a number): the 2 with a number hold correctly, the 2 opinion rewrites hold wrongly |
| rewrite turnaround | L2 |
| ghostwriting | as EM1 |

## Grounding

ES-REVISE **7/7** (R1 rewrite, R2 original, R3 verdict and note, R4 the move, R5 surrounding sentences, R6 lens, R7 age): `desk/essay.ts:222-256`. Unchanged.

## Time saved

If it all worked: about 6 minutes of her 18 (the loop replaces a week). L1-live: about 3, confidence low, because a wrong "it holds" costs a handed-in paragraph that still has no evidence.

## Findings

Open, recurrence 2: EM2-1 (re-ranked blocker), EM2-2, EM2-3, EM2-4, EM2-5. Strength: EM2-6.

## Voice

I wrote "Walking is just much nicer for everybody" and the TV went "it holds" and the move turned yellow-to-solid. But I still did not give any evidence! That is exactly what Miss would write on it again. So now I do not know when "it holds" is real.

The rest is good. My sentence is already in the box, so I only change it, and the other verdicts do not jump around. I want the TV to say which sentence is next that is bad, not just the next one. If "holds" lies, the whole thing is worth less than Mum reading it.
