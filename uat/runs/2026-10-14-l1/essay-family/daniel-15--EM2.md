# daniel-15 × EM2 · Fix it myself

- Cert level: **L1**. Base `main` HEAD `4af25199`. Prior: `uat/runs/2026-10-09-essay-l1/daniel-15--EM2.md` (conditional).
- **Verdict: L1-conditional.** Two prior majors are fixed (a piece's rewrite asymmetry; the model's note on a still-faulty rewrite). Three majors stay open (the LINK regex, the ghostwriting backstop, rewrites that never reach the phone's text).

## Reachable surface set

Profile `high-school`, 15, `cz`, Family. Teen voice ("a 15-year-old", `rules/voice.ts:68-72`). Forensic page, the phone rewrite panel with "Next paragraph" (`page.tsx:674`), `kind: rewrite` (`route.ts:51-75`). A rewrite is refused (400) while the piece is still being read (`route.ts:56`, `REWRITE_WHILE_READING`).

## Walk

He pastes, reads, opens the problem sentence, rewrites it on the phone, Send. Refusals before any call; one sentence re-judged; the other verdicts kept; the move inks only on a hold.

**Executed (scratch t5.cjs, 5-block piece).** A near-unchanged thesis rewrite ("I believe schools should start later in the morning.") stays faulty under Structure (`before faulty, after faulty`); an explain-sentence rewrite stays faulty. So the prior row (a piece's rewrite ruled on context the first reading never used) is closed: the first reading is now ruled once over all paragraphs (`desk/essay.ts:164-176`) and the rewrite over the whole piece (`:249`). The Evidence-lens false hold (an opinion rewritten as another opinion goes neutral → "holds") is the same one raised for Eliska (L1-eliska-12-EM2-1); it reaches him whenever he picks Evidence.

**Executed (scratch t1.cjs).** `LINK = /^(therefore|so|...)/i` has no word boundary (`rules/essay.ts:15`): "Some children walk to school.", "Social media harms sleep.", "Sometimes it rains.", "Soon the bell rings.", "Software helps.", "Sodium is a mineral." all get role `link`. The role feeds the rewrite context and the crumb. L1-daniel-15-EM2-3.

| C | Result | Evidence |
|---|---|---|
| C1 BLOCKER, no rewritten sentence, even when his text asks | **uncertain (L2), narrower** | summary and faulty notes are code now; strong/neutral notes and a ten-word slot frame are not checked; his text enters the prompt with no "treat as data" line (`desk/essay.ts:95-97`). L1-daniel-15-EM2-4 |
| C5 a still-faulty rewrite stays hatched, the caption says why | **pass** | `EssayTV.tsx:415` shows the code's check line; the move never inks without a hold (`:335,425`). Fixed: L1-daniel-15-EM2-2 |
| C7 nothing claims grammar was checked | **pass** | nothing says it; nothing says it was not (L1-daniel-15-EM3-9) |

New: **L1-daniel-15-EM2-7**. Dictate in the rewrite panel listens in cs-CZ for a `cz` learner while the desk reads English (`page.tsx:351`, `recogniserLang.ts:8-9`).

Still open, recurrence 2: **EM2-5**: a rewrite exists only in the session reading. The phone's `paras` are never updated from `s.essay` (`page.tsx:76,84`), so reading the piece again sends the unrevised text and the shelf's version is the original.

## Metrics

| Metric | L1 |
|---|---|
| others kept | true by construction |
| rewrite uplift | L2 |
| ghostwriting | L2 |

## Grounding

ES-REVISE 7/7 (as Eliska). ES-READ 3/8 for the first reading.

## Time saved

Honest number (his file): 0 to 10 minutes against doing nothing, negative against ChatGPT. L1-live: about 0. The loop is sound; the thing that would save him a mark (grammar) is not in the product and he is not told so.

## Findings

Fixed: EM2-1, EM2-2. Open, recurrence 2: EM2-3, EM2-4, EM2-5. New: EM2-7. Strength: EM2-6.

## Voice

Rewrite, send, it tells me yes or no. Fine. The "no" now says why in a normal sentence, not some chatty thing that says good job and then red. I rewrote the thesis three times and it stayed red every time I only changed a word, so I did not have to guess.

Two things annoy me. I rewrote one sentence on my phone, then I pasted the essay again from my laptop, and my rewrite was gone, it read the old one. And it still thinks "Some" and "Social" are link words, so it calls my sentence a link when it is a claim. Small, but then why do I believe the rest?
