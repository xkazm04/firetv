# kristyna-17 × EM3 · Read my whole piece (recert-1)

- Character: kristyna-17 (17, Prague gymnázium, writes Czech; out of segment)
- Journey: EM3 Read my whole piece
- Cert level: L1 re-walk, code only, no model
- Head 782afdfb
- Recertifies 2026-10-09-essay-l1 at 12592a71
- **Verdict now: L1-conditional.** Both blockers are gone: a Czech piece is refused whole in one line before anything is kept or read, and a paragraph that fails is drawn and named as not read with a send-again. The forensic page still never names the paragraph (major), plus four minors.

## Reachable surface (now)

- Phone: "Read the whole piece on the TV (N paragraphs)" with Keep (`desk/src/app/phone/page.tsx:718-720`), the shelf (`desk/src/app/phone/EssayShelf.tsx`), "Read the paragraphs that did not come back" (`page.tsx:332`).
- Route `kind: "piece"`: `pieceProblem`, then a refusal when no paragraph is English (`desk/src/app/api/analyse/route.ts:107-109`), the notice, keep, then one call per English paragraph (`desk/src/lib/desk/essay.ts:157-180`).
- Paragraph states pending / read / not-read / not-english (`desk/src/lib/rules/essay.ts:480-485`), captions (`:496-499`), summary head over ruled sentences with a line per unruled paragraph (`:457-471,530-541`).
- TV: rail and map with `data-state` (`desk/src/essay/EssayTV.tsx:268,371`), the page caption order (`EssayTV.tsx:411-420`), crumb (`:423`), lens-home caption (`:146-150`); landing line `firstSentence(summaryLine)` (`desk/src/tv/landingRows.ts:86,149`).

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| EM3-1 piece counts built on the broken split (blocker) | fixed | `essay.ts:35` splits Czech capitals (775cb383); a piece with no English paragraph is refused at `route.ts:109` before anything is kept or a call spent; in a mixed piece not-English paragraphs get no call (`lib/desk/essay.ts:169-172`) and leave the head count (`essay.ts:464,530-531`). Repro: a Czech title plus two Czech paragraphs gives `paragraphIsEnglish [false,false,false]`, refused whole | 803c6075 essay: E3, E3-a code decides whether a paragraph is English before any verdict or count |
| EM3-2 a failed paragraph looks pending forever, "Nothing flagged", retry replaces the piece (blocker) | fixed | `essay.ts:481-485` a failed paragraph is `not-read`, never pending once the piece is done; the page shows "Not read · Paragraph k did not come back. Send it again from the phone." before any Neutral line (`EssayTV.tsx:414`, `essay.ts:492,496-499`); the summary names it (`essay.ts:465,535-541`); the phone says it (`page.tsx:286`) and offers a re-read of only those paragraphs into the same piece (`page.tsx:332`) | dd230dc0 essay: E4, E4-a a failed paragraph is drawn as not read, never pending; a34a0333 essay: E4-a send it again |
| EM3-3 the forensic page never names the paragraph (major) | **recurs** | Crumb is still "Sentence n of N · role" (`EssayTV.tsx:423`); rail label "N paragraphs" (`EssayTV.tsx:365`). The summary now says "Start with paragraph p, sentence n" (`essay.ts:467`) but is drawn only on the lens home's last-verdict caption (`EssayTV.tsx:150`) and the landing cuts it to the head (`landingRows.ts:86,149`). "First" is still sentence order (`essay.ts:462`) | — |
| EM3-4 after Delete the phone keeps the old pieceId (minor) | **recurs** | `EssayShelf.tsx:30-34` `remove` reloads only its list; `page.tsx:97` pieceId is cleared only by a file, a multi-paragraph paste or a fresh panel (`:263,271,423`); `route.ts:115,119` `addVersion` fails and returns the error. Repro: `deletePiece -> true`, then `addVersion -> {ok:false, error:'That piece is not on your shelf.', status:404}` | — |
| EM3-5 a plain title line is paragraph 1 and costs a call (minor) | **recurs** | `essay.ts:83-96` only "# " headings are their own item, and they are still read as paragraphs. Repro: "Mobile phones at school" over two paragraphs is paragraph 1, a 4-word claim, ruled faulty under Structure, and the summary opens "Start with paragraph 1, sentence 1". For her a Czech title is now refused as not English (`essay.ts:174`), so it bites only on an English piece | — |
| EM3-6 first piece's first paragraph says "reading your paragraph" (minor) | **recurs** | `EssayTV.tsx:144-146` `reading = pieceBeingRead(a?.piece)` reads the previous reading, so a first piece shows "The desk is reading your paragraph." until paragraph 1 lands (the job's start line does say "reading your piece, N paragraphs", `route.ts:138`) | — |
| EM3-7 GET /api/texts returns noticed and notice no screen reads (minor) | **recurs** | `desk/src/app/api/texts/route.ts:39` returns `pieces, noticed, notice`; `EssayShelf.tsx:19` reads only `pieces`; no other GET reader under `desk/src/app` | — |

## New findings

- None in this pair beyond the EM1 rows. The language-check leak (EM1-11) also lets a function-word-heavy Czech paragraph inside a piece be read as English; it is filed once, under EM1.
- 2026-10-14 lead L1-kristyna-17-EM3-10 (a short Czech title passes the check and is read as English paragraph 1) is **fixed**: a paragraph under 6 words is refused when it is mostly Czech (`essay.ts:173-174`). Repro: "Je škola důležitá?" gives `false`. Commit 0a53e75e fix(desk,uat): UAT 2026-10-14 build items UD-4..7, 9-11, 13-24, 26 (partial) (UD-19).

## Notes

- Executed `paragraphsOf`, `splitSentences`, `paragraphIsEnglish`, `decideVerdicts`, `summaryLine` and the shelf store (`texts.addPiece/deletePiece/addVersion`) with node, DESK_DATA_DIR in scratch (`r2.cjs`). No model, no browser.
- For Kristýna the journey now ends at the refusal line when the piece is all Czech. The remaining rows bite when she sends an English piece (or a leaked paragraph); severities are kept as originally rated since the gaps are module-wide.
- Leads EM3-8, EM3-9, EM3-11 (strengths) still hold: notice enforced before keep (`route.ts:114`), one call per paragraph, a Czech piece refused whole (`route.ts:109`).
