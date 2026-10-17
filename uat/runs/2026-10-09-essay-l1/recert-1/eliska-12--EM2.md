# eliska-12 × EM2 · Fix it myself (recert-1)

- Character: eliska-12 (12, Year 8, English-medium school in Prague)
- Journey: EM2 Fix it myself
- Cert level: L1 re-walk, code only, no model
- Head 782afdfb
- Recertifies 2026-10-09-essay-l1 at 12592a71
- **Verdict now: L1-conditional.** No blocker on the pair, but no row is fully fixed: a still-opinion rewrite can still 'hold' when a later sentence carries a marker word (major), and the playbook fallback still teaches a three-sentence frame the rewrite refuses (major).

## Reachable surface (now)

- Forensic actions Rewrite on my phone, Why this matters, Next sentence, Back (`desk/src/tv/keys.ts:172,468-471`).
- Phone rewrite panel with Dictate (`desk/src/app/phone/page.tsx:694`).
- Route: `revise()` refuses before any run, then `reviseSentence` (`desk/src/lib/desk/essay.ts:227-267`): one observation for n, ruled by `decideVerdicts` over `[got, ...contextObservations]` (`:260`); every other verdict copied (`:264`).
- Page: 'Rewrite · it holds' / 'Rewrite · not yet' (`desk/src/essay/EssayTV.tsx:416-417`); the move inks on holds (`:336,342`); focus after a hold (`keys.ts:185-188`).

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| EM2-1 false 'holds': a still-opinion rewrite holds when a later sentence carries a marker word (major) | **recurs** (narrowed) | `rules/essay.ts:554` a context sentence with regex role evidence is passed as checkable before the ruled-opinion check at `:556`; `:400` a marked checkable sentence with no accepted link makes every opinion neutral; `:599-602` not faulty = holds; `EssayTV.tsx:416` 'Rewrite · it holds' with the model's note. Repro P3 (S3 'I found out that...' read as opinion): a rewrite of S2 that is still opinion -> neutral, 'holds', note 'This is still only what you think.' Where the checkable sentence is real and backs another opinion (P1, P2), the rewrite now stays 'still' | 95538224 UD-12 (partial) |
| EM2-2 playbook fallback teaches a three-sentence frame the rewrite refuses (major) | **recurs** | `desk/src/lib/library/lessons.data.ts:38,40,41` Structure, Evidence, Language -> para; `:51` three-sentence pattern; `rules/essay.ts:608-613` taught falls back to it; `:587` revise refuses more than one sentence. Repro: the filled frame -> 'That is 3 sentences. Send sentence 3 as one sentence.' | — |
| EM2-3 kept verdicts go stale after the rewrite adds the evidence (minor) | **recurs** | `desk/src/lib/desk/essay.ts:264` other verdicts copied. Repro: S1 and S2 opinion and faulty, S2 rewritten to a study backing S1 -> S2 strong, S1 stays faulty 'This only asserts...'; the rule over the new paragraph gives S1 neutral | — |
| EM2-4 'In the paragraph that would not stay one sentence.' is opaque; dictated rewrites refused (minor) | **recurs** | `rules/essay.ts:593` wording unchanged; `page.tsx:694` Dictate sets the rewrite to the raw transcript. Repro: lower-case start or no full stop -> that line; 'e.g.' and a comma before 'that' accepted | — |
| EM2-5 after a hold focus goes to Next sentence = n+1; the rewrite instruction lands only in the bench bar (minor) | **recurs** | `keys.ts:185-188` focusAfterRewrite; `:470` next = (i + 1) % n; `:468` Rewrite sets the status line only; `desk/src/app/tv/page.tsx:158` status drawn in the bench bar; `EssayTV.tsx:47,335` the stage only lights the phone chip | — |

## New findings

- None in this pair.
- 2026-10-14 lead L1-eliska-12-EM2-1 (false hold on P1/P2, rated blocker there) is fixed for that mechanism by 95538224 UD-12: a ruled opinion stays an opinion in the context (`rules/essay.ts:555-557`), so the rewrite stays faulty. The original P3 mechanism remains, recorded above as EM2-1 at major.

## Notes

- Executed `revise`, `contextObservations`, `decideVerdicts`, `rewriteState`, `taught` and `playFor` with `tools/ts-load.cjs` (scratch `em2.cjs`), mirroring `reviseSentence` lines 260-263 without the model call. Observations were hand-written.
- EM2-1 stays major 9: low frequency (it needs a marker-word sentence the model reads as opinion and no accepted link in the paragraph), high reach, high trust cost.
