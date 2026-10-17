# helena-46 × EM5 · My writing, kept and known (recert-1)

- Character: helena-46 (46, account manager, B2 business English, Adult mode, no age)
- Journey: EM5 My writing, kept and known
- Cert level: L1 re-walk, code only, no model
- Head 782afdfb
- Recertifies 2026-10-09-essay-l1 at 12592a71
- **Verdict now: L1-fail.** Three blockers remain. A piece kept as 'essay' (every phone keep) is still titled from its own first line on the TV Workroom. The twin's directness is still inverted, and its formality and detail words still misread email. Delete now clears the reading on the desk.

## Reachable surface (now)

- PC page `/drop`: keep a piece (Message / Email / Essay radio, default Message `desk/src/app/drop/page.tsx:23`; optional title `:81`; .txt/.md/.docx `:48-52`), the shelf (`:89`), the twin panel with exemplar checkboxes and card download (`:90-101`), "Show the Workroom on the TV" (`:65`, `:101`). No read action.
- Phone Essay tab: the same shelf; a piece is kept only through "Read the whole piece on the TV" with 2+ paragraphs (`desk/src/app/phone/page.tsx:718-720`, `:280`). No format and no title control.
- Routes: `/api/texts` (TV refused, `desk/src/app/api/texts/route.ts:29-34`; delete now dispatches `essay.clear` `:71-75`), `/api/twin` (`desk/src/app/api/twin/route.ts:27-57`, no mode gate), `/api/twin/card` (Adult and born only), `/api/analyse {kind:"piece", keep}` (`desk/src/app/api/analyse/route.ts:103-140`).
- TV Workroom (`desk/src/essay/Workroom.tsx:20-52`), opened from the landing only while no reading is on the desk (`desk/src/tv/keys.ts:290-292`).

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| EM5-1 Curtain: an untitled piece is titled from its own first line, drawn on the Workroom (blocker) | **recurs** (narrowed) | `desk/src/lib/session/texts.ts:92` email and message are exempt now, but format 'essay' still takes an unpunctuated first line; `route.ts:115` the phone keep path passes no format, so it is always 'essay' (`texts.ts:114`); `Workroom.tsx:33` {p.title}. Repro: addPiece('helena',{text:'ok the Rabobank demo moved to thursday at ten\n\ncan you bring the slides'}) -> title 'ok the Rabobank demo moved to thursday at ten', format essay. Still a blocker (curtain boundary) | partial: 0a53e75e (UD-14) |
| EM5-2 Directness inverted against SPEC 5.1 (blocker) | **recurs** | `desk/src/lib/rules/style.ts:95` directness = 6 - band(hedge); `desk/src/lib/twin/card.ts:75` blunt … indirect; `card.ts:107` dims exported. Repro: no hedges -> 5 'indirect'; hedge 3333 per mille -> 1 'blunt' | — |
| EM5-3 Level words misread email: greeting + sign-off make 'ceremonial'; sign-off lines count as sentences (blocker) | **recurs** | `style.ts:89` formalScore adds greeting/4 + signoff/4; `style.ts:50-52` sentencesOf splits at line breaks; `:94`, `:97` length and detail from medians; `:85` 'the host's first guess'. Repro: three 'Hi Jan … Best, Helena' emails -> wps p50 2 -> ceremonial, brief, indirect, headline | — |
| EM5-4 Delete everything leaves the read piece's text in session.json and on the TV (blocker) | fixed | `desk/src/app/api/texts/route.ts:71-75` delete one or all dispatches `essay.clear`; `desk/src/lib/session/store.ts:795-796` clears essay and essayAt, here and in the away slot, and leaves forensic. Pinned by `tools/texts-rules-test.cjs:132-144` (run: 11/11 pass) | 0a53e75e fix(desk,uat): UAT 2026-10-14 build items UD-4..7, 9-11, 13-24, 26 (partial) (UD-6) |
| EM5-5 No remote path back to the Workroom after the first reading (major) | **recurs** | `keys.ts:290` forensic opens first whenever a reading is on the desk, `:292` Workroom only otherwise; `:431-432` lens home Menu -> playbook, Back -> landing; `:459` forensic Back -> essaytype | — |
| EM5-6 A kept piece is read only from the phone; PC has no read; Workroom piece rows do nothing on OK (major) | **recurs** | `drop/page.tsx:79-102` keep, shelf, twin, no read; `keys.ts:449-455` Select acts only on 'lenses'; `page.tsx:718-720` piece read only with paras.length > 1 | — |
| EM5-7 Reading a kept email puts every sentence on the TV and its first words on the lens home (major) | **recurs** | `EssayTV.tsx:424` the sentence on the forensic page; `:257-258`, `:280` the opening words; `:490` the table. Grep 'verdicts' and '.summary' under app/phone and app/drop: 0 hits | — |
| EM5-8 Emails grow the wrong twin: phone pieces are 'essay', /drop defaults to Message, shelf hides format (major) | **recurs** | `route.ts:115` addPiece with no format; `texts.ts:114` default 'essay'; `card.ts:25` channelOf; `drop/page.tsx:23` useState('message'); `desk/src/app/phone/EssayShelf.tsx:41` no format. Repro: phone-style keep of 'Hi Anna,…' -> format essay | — |
| EM5-9 'Never keeps what other people wrote to you' is false: quoted replies go into exemplars (major) | **recurs** | `drop/page.tsx:91` the claim; `Workroom.tsx:47` 'never what you wrote for someone else'; `card.ts:48` exemplars verbatim, cutAt 500; `style.ts:60-81` no quoted-line handling. Repro: '> Our board has cut the 2027 budget…' found in buildCard output: true | — |
| EM5-10 On /drop 'Read without keeping' reads nothing; empty shelf says pieces come from the TV (minor) | **recurs** | `drop/page.tsx:86` TextNotice with no mode, so the default 'piece' labels apply (`EssayShelf.tsx:54`, `:61` 'Read without keeping'); `EssayShelf.tsx:44` empty text. 998153b3 added a paragraph mode for the phone only | — |
| EM5-11 Leaving a piece out still shapes the dims and counts toward birth (polish) | **recurs** | `card.ts:46-48` born and dims over every piece, exclusion on exemplars only; `drop/page.tsx:96` 'leave out anything you would not share'. Repro: dims identical with one piece excluded; still 4 pieces, 3 exemplars | — |

## New findings

- EM5-13 (from 2026-10-14 L1-helena-46-EM5-13, still holds): the Workroom and the twin portrait are served for any mode. `desk/src/app/api/twin/route.ts:20-24` computes `adult` and nothing gates on it; `:30` and `:48` open the Workroom for role tv, phone or none; `:33-40` the portrait with exemplar text; `drop/page.tsx:90-101` the twin panel for every profile. Only the card download is Adult-gated. Her son's profile at the same desk can open his Workroom on the TV from /drop. Major, rank 8.
- EM5-15 (from 2026-10-14 L1-helena-46-EM5-15, still holds): a .docx kept on /drop splits table cells into separate paragraphs and drops a non-breaking hyphen. `desk/src/lib/rules/docx.ts:62-63` handles only w:t, w:tab, w:br. Repro on a hand-built docx: 'Item', 'Price' as two paragraphs; 'go' + noBreakHyphen + 'live' -> 'golive'. Polish, rank 2.
- EM5-16 (from 2026-10-14 L1-helena-46-EM5-16, still holds): a piece kept from the phone cannot be named. No title field on the Essay tab, and a picked file's name is not used (`page.tsx:709`, grep 'title' on the Essay tab); `route.ts:115` addPiece with no title. Each phone piece is its first line (EM5-1) or 'Untitled essay'. Major, rank 9.
- 2026-10-14 L1-helena-46-EM5-14 (the vague-opener detector fires on 'This is Helena from Acme.') still reproduces (`desk/src/lib/rules/habits.ts:55`, `:61`), but no file under desk/src imports rules/habits, so no screen shows it. Not filed.
- 2026-10-14 L1-helena-46-EM5-12 re-verified: PieceCard has no text (`texts.ts:31`), the TV is refused on /api/texts (`texts/route.ts:31`).

## Notes

- Executed `addPiece`, `styleSheet`/`twinDims`/`levelWords`, `buildCard`, `portraitOf`, `docxText` and `detect` in scratch `r1.cjs` and `r4.cjs` with DESK_DATA_DIR in scratch. Ran `tools/texts-rules-test.cjs` for EM5-4 (11/11). A direct store simulation hung on the store's timers and was stopped; the shipped test covers the same path.
- EM5-1 for Helena herself: /drop's default Message keeps her PC emails safe now, so the breach needs the phone keep path or the Essay radio. Reachability is lower, but the curtain rule keeps it a blocker.
- EM5-4 leaves one edge unverified: a whole-piece reading still running when she deletes could write its next paragraph back to the desk (`route.ts:126-136`), since `readingStands` does not look at the shelf.
