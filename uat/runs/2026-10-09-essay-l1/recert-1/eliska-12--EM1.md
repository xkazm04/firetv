# eliska-12 × EM1 · What does my paragraph do? (recert-1)

- Character: eliska-12 (12, Year 8, English-medium school in Prague; "Miss says my paragraphs have no evidence")
- Journey: EM1 What does my paragraph do?
- Cert level: L1 re-walk, code only, no model
- Head 782afdfb
- Recertifies 2026-10-09-essay-l1 at 12592a71
- **Verdict now: L1-conditional.** The blocker is gone: a planted claim before the evidence is now the one marked, under Structure and under Evidence, when the model names the links it is asked for. Majors remain: that fix depends on optional link fields, a clean PEEL Explain sentence is still marked faulty, the pattern and note guards still admit new content, and every faulty note is fixed adult wording.

## Reachable surface (now)

- Landing, lens home and phone paragraph panel as at 12592a71. A non-English paragraph is now refused before any call (`desk/src/app/api/analyse/route.ts:146`, piece `:109`).
- Reading: `judge` asks for observations with optional `supports` (Structure) and `backs` (Evidence) links (`desk/src/lib/desk/essay.ts:31,33,37,39,46`), and `decideVerdicts` rules (`desk/src/lib/rules/essay.ts:351-432`).
- A faulty sentence's note is the failed check's own line (`rules/essay.ts:426`, CHECKS `:302-312`). Strong and neutral sentences keep the model's note (`:425`). The summary is code (`summaryLine`, `:457-471`); the landing line reads it (`desk/src/tv/landingRows.ts:149`).
- Forensic page: opens on the first faulty sentence (`desk/src/tv/keys.ts:174-180`); caption, move and pattern (`desk/src/essay/EssayTV.tsx:410-438`); table (`:476-491`).
- Plan: `planSlots`, `planFill`, `planFit`, `planText` (`rules/essay.ts:627-673`).

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| EM1-1 planted claim before the evidence is missed; Structure marks the wrong sentence (blocker) | fixed | `rules/essay.ts:360-364` a Structure evidence sentence names the claim it backs; `:410-416` a claim nothing names is unsupported; `:367-374` an Evidence opinion is backed only by a checkable sentence that names it; `:400-405` the first unbacked opinion is faulty. Repro P2 with links: Structure [[1,strong],[2,faulty],[3,strong],[4,strong]], Evidence [[1,neutral],[2,faulty],[3,strong],[4,neutral]]; planted after the evidence still correct. Without links it still fails (new row EM1-12) | 0a148283 E1 Structure supports; 8bb84552 E5 Evidence rules an opinion by a link the model names |
| EM1-2 PEEL Explain/Link faulty under Evidence (major) | **recurs** | `rules/essay.ts:263` SUPPORTS has no explain; `:400-405` an opinion no checkable sentence names is faulty; `:410-416` an unnamed claim is faulty under Structure. Repro clean PEEL with S2 backing S1: Explain as opinion -> S3 faulty 'No checkable sentence here backs this opinion.'; Structure with Explain as claim -> S3 faulty. As context or link it is neutral or strong. The Link sentence is no longer marked when the evidence names S1 | — (8bb84552 changed the mechanism, not the outcome) |
| EM1-3 pattern guard admits a new-content sentence with one slot (major) | **recurs** | `rules/essay.ts:227` FIX_LIMITS literalWords 10, copiedRun 4; `:231-251` the only checks. 'A survey found that [number] of children who walk feel happier.' KEPT; 'Research by [source] shows [number] percent of pupils sleep less.' KEPT. `desk/src/lib/desk/essay.ts:56-57` still says none of their words | — |
| EM1-4 notes and summary carry no code guard against ghostwriting (major) | **recurs** (narrowed) | Summary is now code (`rules/essay.ts:457-471`) and a faulty note is a CHECKS line (`:426`). A strong or neutral note is the model's text after `cleanNote` only (`:425`), shown under 'Well done', 'Neutral' and 'Rewrite · it holds' (`EssayTV.tsx:416,418-419`). Repro: a 'Write: Walking also makes children happier, because a 2020 survey found 7 in 10 ...' note on a strong sentence comes back verbatim | 4158321b (partial) |
| EM1-5 crumb, 'Its job' and table show the regex role (minor) | **recurs** | `rules/essay.ts:14,43` role from marker words; `EssayTV.tsx:423` crumb, `:431-432` 'Its job', `:491` table chip. Repro: 'I found out that my friends...', 'In Year 8 we all have to wear a blazer.', 'I found the lesson boring.' -> all evidence | — |
| EM1-6 praise-led notes survive on faulty sentences (minor) | fixed | `rules/essay.ts:426` under a faulty verdict the note is the check line, never the model's. Repro: 'Great point, but you need a fact.' on a faulty sentence -> 'This only asserts; nothing here is checkable.' | 4158321b E6 under a faulty verdict the words are code's |
| EM1-7 code lines not in the young voice (minor) | **recurs** (major now) | `rules/essay.ts:302-312` CHECKS have no voice parameter and are now the note on every faulty sentence (`:426`): 'This only asserts; nothing here is checkable.', 'No checkable sentence here backs this opinion.'; `:669` planFit still prints 'That reads as claim.' Every fault now shows these lines, so frequency rises (rank 9) | — |
| EM1-8 stats.links and stats.words shown nowhere (polish) | **recurs** | `rules/essay.ts:201-207` computed; `EssayTV.tsx:476` figs omit them; grep over essay, tv, app/phone, app/tv: 0 readers | — |
| EM1-9 no refusal for a language the desk does not read (polish) | fixed | `rules/essay.ts:138,171-176` paragraphIsEnglish; `route.ts:146` refused before any run. Repro: a Czech paragraph -> false, NOT_ENGLISH_LINE | 803c6075 E3, E3-a code decides whether a paragraph is English |

## New findings

- **EM1-12 (2026-10-14 lead, still holds), major 9.** The planted-claim fix depends on the model naming links. `supports` and `backs` are not required (`desk/src/lib/desk/essay.ts:31,33,46`). With them absent, P2 under Structure gives [[1,faulty],[2,neutral],[3,strong],[4,strong]] and the page opens on her topic sentence; under Evidence nothing is faulty (rule d, `rules/essay.ts:400`) and the card says Nothing to fix.

## Notes

- Executed `decideVerdicts`, `cleanFix`, `cleanNote`, `planFit`, `paragraphStats` and `paragraphIsEnglish` with `tools/ts-load.cjs` (scratch `walk.cjs`). Model observations were hand-written, so whether the model actually names links is for L2.
- EM1-3 and EM1-4 are guard gaps under C1 (a BLOCKER criterion). No ghostwritten text was observed in code; they stay major as at 12592a71. An L2 run that sees the model write a sentence there makes them blockers.
- Leads L1-eliska-12-EM1-6 and EM1-9 (fixed on 4af25199) are confirmed fixed at HEAD. Lead EM1-1 (fixed) holds only with links named, hence EM1-12.
