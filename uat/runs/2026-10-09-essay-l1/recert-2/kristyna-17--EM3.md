# kristyna-17 × EM3 · Read my whole piece (recert-2)

- Character: kristyna-17
- Journey: EM3 Read my whole piece
- Cert level: L1 re-walk, code only, no model
- Head 90e032f2
- Recertifies: 2026-10-09-essay-l1 at 782afdfb
- **Verdict now: L1-conditional.** Every open row still holds; 2bf64f3e changes which sentence Start with lands on and 390d9408 the shelf title of an untitled piece, but neither names the paragraph on the forensic page nor stops a plain title being paragraph 1.

## Reachable surface (now)

- Same as recert-1: piece route (`route.ts:107-118`), summary `essay.ts:485`, forensic crumb `EssayTV.tsx:423`, rail `:365`, caption `:144-150`, shelf delete `EssayShelf.tsx:30-34`.

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| EM3-1 | **recurs** (major 9, unchanged) | Crumb still "Sentence n of N · role" (EssayTV.tsx:423), rail label "N paragraphs" (:365); "Start with paragraph p" built at essay.ts:485 but drawn only in the last-verdict caption (EssayTV.tsx:150) and cut by firstSentence (landingRows.ts:86,149). 2bf64f3e moved which sentence is first (body evidence), not where it is shown. | - |
| EM3-2 | **recurs** (minor 6, unchanged) | EssayShelf.tsx:30-34 remove reloads only its list; page.tsx:97 pieceId cleared only at :263,271,423; route.ts:115 addVersion with a deleted id fails. | - |
| EM3-3 | **recurs** (minor 6, unchanged) | essay.ts:83-96 paragraphsOf makes only "# " lines their own item; a plain title is paragraph 1. 390d9408 changed the shelf title (untitled keep) in texts, not the splitter. | - |
| EM3-4 | **recurs** (minor 3, unchanged) | EssayTV.tsx:144-146 `reading = pieceBeingRead(a?.piece)` tests the previous reading; a first piece shows "reading your paragraph". | - |
| EM3-5 | **recurs** (minor 3, unchanged) | texts/route.ts:39 returns pieces, noticed, notice; EssayShelf.tsx:19 reads only pieces; no other GET reader. | - |

## New findings

None.

## Notes

- 390d9408 checked as asked: it affects shelf naming in texts, not `paragraphsOf` (essay.ts:83-96), so EM3-3 recurs. 2bf64f3e: only moves the first faulty sentence into a body paragraph; the display gap is intact. No model, no browser.
