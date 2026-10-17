# helena-46 × EM1 · What my paragraph does (recert-2)

- Character: helena-46 (46, account manager, B2 business English, Adult mode, no age)
- Journey: EM1 What my paragraph does
- Cert level: L1 re-walk, code only, no model
- Head 90e032f2
- Recertifies: 2026-10-09-essay-l1 at 782afdfb
- **Verdict now: L1-conditional.** None of the seven open rows is closed: no commit since the recert-1 base touched the phone page, voice, lens home or the English rule; 390d9408 passes the body's format only for a kept 2+ paragraph piece.

## Reachable surface (now)

- Phone Essay tab: one paragraph posts kind:"essay" (page.tsx:307, :722); two or more offer "Read the whole piece on the TV" with keep (page.tsx:280, :720).
- Route: analyse/route.ts, piece path passes body.format to addPiece (:120); the one-paragraph path keeps nothing (:145-155).
- Reading prompts: desk/essay.ts:86-99, voice from age only (voice.ts:75-78). TV: lens home EssayTV.tsx:151, forensic page :427, figures :476.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| helena-46-EM1-1 (major) | **recurs** (major, unchanged) | The Language lens still teaches the essay move: language -> lesson 'para' (lessons.data.ts:41), a faulty sentence without its own fix falls back to the playbook (rules/essay.ts:626-631), and the TV labels it 'The move · playbook · Paragraph' (EssayTV.tsx:427). The body carries no format (route.ts:15-17). ae2544b5 only made the fallback pattern one sentence (lessons.data.ts:51), the move is still 'Claim, then evidence, then the link back'. | — |
| helena-46-EM1-2 (minor) | **recurs** (minor, unchanged) | voiceOf has no mode: TEEN essay 'a 15-year-old' (voice.ts:70, :75-78); the prompts say 'writing tutor for ${voice.who}', 'a student can act on' (desk/essay.ts:86, :90, :236-239); route.ts reads only learnerAge. Executed nothing new; no commit since recert-1 touched voice.ts. | — |
| helena-46-EM1-3 (minor) | **recurs** (minor, unchanged) | Unchanged: EssayTV.tsx:151 and :328 'Paste, type or dictate one paragraph on the phone', lessons.data.ts:49-54 playbook is Thesis/Paragraph/Order/Conclusion, x-ray sentence about students at EssayTV.tsx:541. No commit touched these. | — |
| helena-46-EM1-4 (minor) | **recurs** (minor, unchanged) | Unchanged: stats.words/links (rules/essay.ts, stats builder) and provider (desk/essay.ts:143) are computed; EssayTV.tsx:476 draws sentences, claims, evidence, connectors, words avg only; no provider grep hit under essay/ or app/phone. | — |
| helena-46-EM1-5 (polish) | **recurs** (polish, unchanged) | Unchanged: rules/essay.ts:190 'The desk reads .txt and .md files', phone page.tsx:709 'Choose a file (.txt or .md)', while drop/page.tsx:48-50 reads .docx on the PC page. | — |
| helena-46-EM1-6 (polish) | **recurs** (polish, unchanged) | Executed paragraphIsEnglish at HEAD (scratch t.cjs): long Czech with diacritics -> false (refused); 'Dobrý den, posílám fakturu.' -> true; the same long text without diacritics -> true; a German paragraph -> true. Rule at rules/essay.ts:171-176 unchanged since recert-1. | — |
| helena-46-EM1-7 (major) | **recurs** (major, unchanged) | 390d9408 made the route pass body.format to addPiece (route.ts:120), but this row is the one-paragraph path: page.tsx:307 still posts {kind:'essay'} with no pieceId and the route's essay path (route.ts:145-155) keeps nothing, while page.tsx:297 still promises 'read it again as a new version'. Only the 2+ paragraph button (page.tsx:718-720) sends keep/pieceId. | — |

## New findings

None.

## Notes

- Executed paragraphIsEnglish via tools/ts-load.cjs (scratch t.cjs): long diacritic Czech refused; short Czech, undiacritic Czech and German read. No model call.
- 390d9408 (analyse keep passes the body's format) does not bear on EM1-7: the one-paragraph button never sends keep or pieceId, and the phone sends no format at all.
- L2: read one long client email through Language; open a one-paragraph kept email, change it, Analyse, list versions.
