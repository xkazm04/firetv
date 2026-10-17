# daniel-15 × EM3 · The whole essay (recert-2)

- Character: daniel-15 (15, first-year gymnázium, Brno; pastes a whole four-paragraph essay with a title line)
- Journey: EM3 The whole essay
- Cert level: L1 re-walk, code only, no model
- Head 90e032f2
- Recertifies: 2026-10-09-essay-l1 at 782afdfb
- **Verdict now: L1-conditional.** EM3-1 (thesis and conclusion false faults) is fixed by 2bf64f3e and executed; the other ten rows recur, EM3-4 only narrowed by 390d9408's untitled numbering.

## Reachable surface (now)

- Phone Essay tab paste/shelf/rewrite panel unchanged (`desk/src/app/phone/page.tsx:267-286,691-722`); route `piece` (`desk/src/app/api/analyse/route.ts:106-119`, now passes `body.format` to addPiece); `analysePiece` rules once after the last paragraph (`desk/src/lib/desk/essay.ts:176`).
- Rules: `decideVerdicts` with `bodyProves` (`desk/src/lib/rules/essay.ts:380-386`); TV forensic page unchanged (`desk/src/essay/EssayTV.tsx:415-423`).

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| EM3-1 intro thesis and conclusion faulty, Start with points at it | fixed | `bodyProves` (`rules/essay.ts:382`) is used at `:416` (Evidence) and `:433` (Structure). Executed (scratch r.cjs) on a 4-paragraph essay: Evidence -> thesis, intro and conclusion not faulty, body paragraph without evidence faulty, 'Start with paragraph 3, sentence 4'; Structure with supports chain and with none -> same, thesis neutral, conclusion strong. Bare opinions with no marked evidence anywhere stay faulty (pinned by the new test). | 2bf64f3e (partial earlier: da4379a8, 0a148283) |
| EM3-2 paste is the sample fused (major) | recurs (major) | `page.tsx:59,82` FRESH_PARAS; `:269` splices at the cursor. | none |
| EM3-3 Next paragraph after a piece read leads to This paragraph only (major) | recurs (major) | `page.tsx:697`, `:326`, `:722`; `store.ts:780-781`. | none |
| EM3-4 pasting the revised essay makes a second card, not a version (major) | recurs (major) | `page.tsx:271` clears pieceId; `route.ts:115` addPiece; `texts.ts:89-95` titleOf now 'Untitled essay <n>': two pastes give 'Untitled essay 1' and '2', still two cards and the question title is not kept. | partial 390d9408 |
| EM3-5 forensic page has no paragraph k of n or summary (major) | recurs (major) | `EssayTV.tsx:423` crumb, `:279` k of n on the lens home only, `:150` summary at last stop; `landingRows.ts:149` first sentence. | none |
| EM3-6 paste box and shelf hidden on forensic (major) | recurs (major) | `page.tsx:705`, `:231`; `keys.ts:290`. | none |
| EM3-7 title line is its own paragraph or fuses (major) | recurs (major) | `rules/essay.ts:91` only '#' is a heading; `desk/essay.ts:170-175` one call per paragraph. 390d9408 changed the shelf title only. | none |
| EM3-8 nothing says grammar and spelling are not checked (minor) | recurs (minor) | `EssayTV.tsx:419` Well done; no grammar/spelling scope line in essay, phone or landing. | none |
| EM3-9 deleting the open piece leaves the phone pointing at it (minor) | recurs (minor) | `EssayShelf.tsx:30-34`; `page.tsx:97,280`; `texts.ts:123`. | none |
| EM3-10 unwired provider, stats.words/links, notice (minor) | recurs (minor) | `rules/essay.ts:200-210`; `EssayTV.tsx:476` draws other stats; `api/texts/route.ts:6-7`. | none |
| EM3-11 no verdict until the last paragraph (major) | recurs (major) | `desk/essay.ts:176`; `rules/essay.ts:461-466`; `EssayTV.tsx:415`. | none |

## New findings

None.

## Notes

- Probe: scratch `r.cjs` ran `splitSentences`, `decideVerdicts`, `summaryLine` over the 4-paragraph essay (thesis / two body paragraphs, one with a checkable sentence / conclusion). Did not exercise the live route or model; the model naming `supports` and real observations are L2's.
- L2: send the four-paragraph essay on Structure and Evidence; paste twice and count shelf cards; title line both ways.
