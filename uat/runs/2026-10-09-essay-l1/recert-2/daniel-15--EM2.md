# daniel-15 × EM2 · Fix it myself (recert-2)

- Character: daniel-15 (15, first-year gymnázium, Brno; pastes a whole four-paragraph essay with a title line)
- Journey: EM2 Fix it myself
- Cert level: L1 re-walk, code only, no model
- Head 90e032f2
- Recertifies: 2026-10-09-essay-l1 at 782afdfb
- **Verdict now: L1-conditional.** No commit since recert-1 touched the rewrite path, the phone page or the fix backstop; all four open rows recur at their recert-1 severity.

## Reachable surface (now)

- Phone Essay tab rewrite panel (`desk/src/app/phone/page.tsx:231,691-697`); Send posts kind `rewrite` (`:244`); route refusals and `reviseSentence` unchanged (`desk/src/lib/desk/essay.ts:227-267`, one-sentence ruling at `:260`).
- Rules: `cleanFix` (`desk/src/lib/rules/essay.ts:231-249`), `decideVerdicts` (now with `bodyProves` and `closesAfterEvidence`, `:380-395`, which only act on multi-sentence context).

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| EM2-1 rewrites never reach the phone's text or the shelf (major) | recurs (major) | `page.tsx:244` sendRewrite sets no paragraphs; `page.tsx:274-286` readPiece sends `paras.join`; `route.ts:118` reads on after 'kept last'; `store.ts:780-781` essay.set replaces the reading. | none |
| EM2-2 ghostwriting backstop narrow (C1) (major) | recurs (major) | Executed `cleanFix({pattern:'[Phones stop students listening, so they lose marks in tests].'})` at HEAD: kept unchanged (`rules/essay.ts:226` slot up to 60 chars, `:238-249` literal words and same-sentence copied run only); strong/neutral note is the model's (`:444-445`). ae2544b5 touched planSlots only. No breach seen in a code-only walk, severity unchanged. | none (ae2544b5 does not touch it) |
| EM2-3 Dictate listens in Czech on the Essay tab (minor) | recurs (minor) | `recogniserLang.ts:7-8` cz -> cs-CZ; `page.tsx:373` `r.lang = recogniserLang(s)`. | none |
| EM2-4 a rewrite of a sentence first ruled neutral is ruled faulty (minor) | recurs (minor) | `rules/essay.ts:434` only the first unsupported claim is faulty; `desk/essay.ts:260` a rewrite judges `{n}` alone, so it is always the first. The new `bodyProves` needs a multi-paragraph context and `closesAfterEvidence` needs prior evidence in the paragraph, so neither helps a one-sentence rewrite. | none |

## New findings

None.

## Notes

- Executed `cleanFix` in scratch (`scratch/daniel-15/s.cjs`). No model call; whether the model writes a sentence into a slot is L2's.
- L2: rewrite then re-read to see the rewrite vanish; dictate in Czech on the Essay tab.
