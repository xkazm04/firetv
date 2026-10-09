# kristyna-17 × EM3 · The whole essay

- **Character:** Kristýna, 17 (`uat/characters/essay/kristyna-17.md`), out-of-segment: Czech slohovka
- **Journey:** EM3 (`uat/journeys/essay/EM3-the-whole-essay.md`); L2 has never reached it, so it is walked here in full
- **Cert level:** L1
- **Base commit:** 12592a71
- **Verdict:** **L1-fail**. The piece machinery is structurally sound and well guarded: the split, the limits, the notice, the per-paragraph isolation, the shelf, a new version, delete. Two things fail it for her. Every count the piece surfaces is built by code from a split that collapses her 14 Czech sentences into 6 (C1 blocker, confirmed by execution). And nothing says the desk reads English (C2). Two majors hold for any learner: a paragraph that fails to come back is never said, and the forensic page never names the paragraph it is on.

## Reachable surface set

The same gating as EM1 (`kristyna-17--EM1.md`, R0): Family mode, all modules, lens home rather than the Workroom (`desk/src/tv/keys.ts:257-260`). The piece is reachable for her: the phone shows "Read the whole piece" once the panel holds more than one paragraph (`desk/src/app/phone/page.tsx:600-602`), and `/api/texts` serves any seated learner from the phone (`desk/src/app/api/texts/route.ts:29-34`).
Unreachable: the Workroom (titles and twin, Adult only, `keys.ts:259`), so the shelf exists for her only on the phone.

## Surface model (EM3)

| # | Affordance | file:line | Behind it |
|---|---|---|---|
| 1 | Paste with blank lines → "That is N paragraphs. Read the whole piece, or one paragraph at a time." (a file: `name: N paragraphs`) | `page.tsx:218-223`, `:203-216` | `paragraphsOf` (`rules/essay.ts:74-87`), `essayFileProblem` (`:127-141`) |
| 2 | Previous / "Paragraph k of N" / Next | `page.tsx:593-596` | local state |
| 3 | "Keep it on my shelf" (ticked by default, `page.tsx:74`) + "Read the whole piece on the TV (N paragraphs)" | `page.tsx:600-602`, `:225-236` | `pieceProblem` on the phone, then `POST /api/analyse {kind:"piece", keep, pieceId, source}` |
| 4 | Piece limits | `rules/essay.ts:107-119` | 30 paragraphs, 100 KB, 4000 chars each; refused with a sentence |
| 5 | One-time notice (428) → "I understand, keep it" / "Read without keeping" | `route.ts:57-58`; `texts.ts:127-135`; `EssayShelf.tsx:54-63`; `page.tsx:232,237-241,599` | `noticed` / `markNoticed`; `POST /api/texts {notice:true}` |
| 6 | Keep: `addPiece` / `addVersion` (the same text again: the reading goes ahead on the kept version) | `route.ts:59-63`; `texts.ts:93-115` | disk under `DESK_DATA_DIR/texts/<learner>/` |
| 7 | Whole-piece read: one model call per paragraph, the whole piece as context | `lib/desk/essay.ts:120-145`, `judge` `:62-86` | ES-READ per paragraph |
| 8 | TV progress: the first paragraph back → `essay.set` (opens the forensic page); the rest → `essay.progress` | `route.ts:69-74`; `store.ts:566-570` | — |
| 9 | Paragraph gaps and pending state: rail rows (`data-pending`, opacity .22), lens-home card strip (dashed outline), "Last piece · reading k of N" | `EssayTV.tsx:353-371`, `:252-279`; `design/essay-specimen.css:133-134` | `piece.read` / `piece.failed` |
| 10 | Piece summary "k of n sentences to fix across p paragraphs. Start with paragraph P: …" | `lib/desk/essay.ts:128-133`; shown on the lens home's "last" stop (`EssayTV.tsx:147`) and, first sentence only, on the landing (`landingRows.ts:85,148`) | code + the model's paragraph summary |
| 11 | Shelf: title · N paragraphs · version v · date; Open; Delete; "Delete everything I kept" (second press confirms) | `EssayShelf.tsx:14-51`; `texts/route.ts:36-76` | `listPieces`, `getPiece`, `deletePiece`, `deleteAll` |
| 12 | Open → "Opened from your shelf: N paragraphs. Change it, then read it again as a new version." | `page.tsx:242` | `pieceId` held in page state |

## The walk (in character)

**1 · Paste the whole slohovka.** A title line, a blank line, five body paragraphs: 1025 characters. The phone splits it: "That is 6 paragraphs." The title counts as paragraph 1 (R10: `paragraphsOf → 6`). *Knows what to do?* Yes, the two buttons are plain. *Connects to her goal?* "Read the whole piece on the TV (6 paragraphs)": yes.

**2 · Limits.** `pieceProblem` → `null` (R10). A 31-paragraph or 4001-character paragraph is refused with a sentence before any call (`rules/essay.ts:111-119`). Clean.

**3 · The notice.** Keep is ticked by default, so the first press answers 428. The phone shows: "To read your writing, the desk sends it to its text engine: Claude, through the command line on this computer. Pieces you keep stay on this desk under your name until you delete them." with "I understand, keep it" and "Read without keeping". That is honest about where the text goes. It says nothing about the language. **C2 is still unmet at the one moment the desk stops to explain itself.**

**4 · Reading, paragraph by paragraph.** While the first call runs, the TV caption is computed from the *previous* reading's `piece`: on a first-ever piece it reads "The desk is reading your paragraph. It lands here." (`EssayTV.tsx:143-144`). Paragraph 1 lands (`essay.set`) and the TV opens the forensic page. The remaining paragraphs grow the rail in place (`essay.progress`), ~25 s each, about 2.5 min for six (env.md: W-run 27.6 s a call). The phone shows "the desk is reading your piece…" until the last one, then "on the TV".

**5 · What she sees.** Execution (R10): **6 sentences, one per paragraph, against 14 a Czech reader counts.** Body paragraphs read as 38-, 39-, 28-, 29- and 24-word "sentences". Under Language, sentences 2 and 3 are over 35 words and are ruled faulty by code alone (R10). The piece summary head, built by code, is "2 of 6 sentences to fix across 6 paragraphs." On the landing, `firstSentence` keeps exactly that head and cuts "Start with paragraph P" (`landingRows.ts:85,148`). The crumb on each page: "Sentence 2 of 6 · claim", where sentence 2 is three of her sentences. **C1 fails again, now across the whole essay.**

**6 · Which paragraph first?** "Start with paragraph P" appears only on the lens home's last-verdict stop (`EssayTV.tsx:147`), and P is simply the first faulty sentence's paragraph in reading order (`lib/desk/essay.ts:130-132`). The forensic page never names the paragraph: its crumb says "Sentence n of N" (`EssayTV.tsx:414`), the rail's label says "6 paragraphs" (`:358`) and the gaps carry no numbers. *Can she say which paragraph needs which move?* Only by counting gaps on the rail.

**7 · A paragraph fails.** `analysePiece` catches the call, adds the paragraph to `piece.failed` and keeps going (`lib/desk/essay.ts:136-140`), so the rest land, as the DoD asks. But nothing ever says so. The rail dims a failed paragraph exactly like one still being read (`data-pending` = not in `read`, `EssayTV.tsx:362`, css `:134`), and it stays dimmed for good. Walk Down into it and the page says **"Neutral · Nothing flagged."** with "Its job: claim" (`EssayTV.tsx:411,423`): a confident "nothing to fix" over a paragraph nobody read. The summary does not mention it (`essay.ts:128-133`), and the phone says "on the TV" (`page.tsx:233`). To retry, she can only send that paragraph alone ("This paragraph only"), and that replaces the whole piece reading (`store.ts:566-567`).

**8 · The shelf.** "Mobilní telefony ve škole · 6 paragraphs · version 1 · 9 Oct" (R11: title taken from the heading-like first line). Open loads the latest version with "Change it, then read it again as a new version." She edits paragraph 3 and reads again: version 2 (R11). Sending the same text again is not an error; the reading goes ahead (`route.ts:62`). Delete removes the piece (R11).

**9 · After Delete.** The phone still holds the deleted piece's `pieceId` (`EssayShelf.remove` reloads only the list, `EssayShelf.tsx:30-34`; `pieceId` is reset only by a multi-paragraph paste or a file, `page.tsx:214,222`). Pressing "Read the whole piece" with Keep ticked → `addVersion` → 404 → the phone shows **"That piece is not on your shelf."** and nothing is read (`route.ts:59-63`; R11). Typed edits also keep the `pieceId`, so a different essay typed into the same panel is kept as a new version of the old one.

**10 · Delete everything.** The second press confirms, and the folder goes, notice included, so the notice shows again next time (R11: `deleteAll true → noticed false`). Clean.

## Scored criteria

| C | Result | Evidence |
|---|---|---|
| C1 (BLOCKER) | **fail** (confirmed) | R10: 14 sentences → 6; the summary head "2 of 6 sentences to fix across 6 paragraphs."; the landing line; the history line `essay.ts:97` |
| C2 | **fail** (confirmed-absent) | the notice (`texts.ts:127`) and every piece line are silent on language |
| C3 | **fail** (confirmed) | R10: every body paragraph collapses to one sentence |
| C4 | **fail** (code part); model part uncertain | the code CHECKS lines are English (`rules/essay.ts:232-240`); the per-paragraph summaries' language is the model's |
| C5 | **uncertain (L2)**; the pattern guard passes | `cleanFix` (EM1 R5); the summaries go through no code check for her sentences |

## Module metrics (rubric units)

| Metric | L1 value |
|---|---|
| time to first verdict (piece) | L2. Structurally: first paragraph ≈ one call (~25-30 s); last ≈ 6 calls (~2.5-3 min) for her 6-paragraph piece |
| reliability | L2 for the rate. L1: a `piece.failed` paragraph is recovered for the rest of the piece but **never reported** to her (EM3-2) |
| verdict agreement | carried from EM1 fixtures (1/8, faulty 1/6); piece-level L2 |
| ghostwriting | pattern guard 0 in fixtures; summaries L2 |
| curtain | 0 on the landing line for a piece (counts only, `landingRows.ts:148`); the shelf is phone-only (`texts/route.ts:2-4`) |
| recap specificity | out of journey (EM4). Note: the history detail "k of 6 sentences to fix, 6 paragraphs" is built from the same wrong count |

## Wiring audit

**`/api/analyse` kind `piece` (the reading as `s.essay`):** the 18 EM1 fields plus `piece.paragraphs` (`EssayTV.tsx:272`), `piece.read` (`:257,362`), `piece.failed` (`:143,272`, arithmetic only, never named as a failure) and `piece.pieceId` (`page.tsx:233`). **Wired 20/22** (unwired: `stats.links`, `stats.words`). `piece.failed` passes the grep but reaches no word (EM3-2).

**`GET /api/texts`:** `pieces[].id, title, versions, paragraphs, updated` (`EssayShelf.tsx:40-43`), `format` (`Workroom.tsx:32-34`, unreachable for her), `noticed`, `notice`. **Wired 6/8** (unwired: `noticed`, `notice`; the phone learns of the notice only from the 428).

## Grounding audit: ES-READ, per paragraph (`judge` with `focus`, `lib/desk/essay.ts:62-79`)

| Source | Present? | Line |
|---|---|---|
| S1 own text | yes: the whole piece numbered, with "Paragraph k:" lines (the merged sentences) | `essay.ts:64,75`, `rules/essay.ts:57-61` |
| S2 lens | yes | `essay.ts:67` |
| S3 kind of writing | no: the shelf's `format: "essay"` (`texts.ts:98`) is never passed | — |
| S4 age/stage | yes, the band "a 15-year-old" | `voice.ts:70` |
| S5 mode | no | — |
| S6 task | no | — |
| S7 history | no | — |
| S8 memory | no | — |

**ES-READ 3/8.** Named additions, all absent: the language; system `cz`; the maturita task. The whole piece as context **is** present (`essay.ts:59,76`). That is a real strength for Structure.

## Executions (ROOT, `DESK_DATA_DIR=…/data/kristyna-17`, `node - <<'EOF' require('./tools/ts-load.cjs'); … EOF`)

- **R10** `r.paragraphsOf(ESSAY)`, `r.pieceProblem(ESSAY)`, `r.splitSentences(ESSAY)`, where ESSAY = the title "Mobilní telefony ve škole" + 5 body paragraphs (sentences opening Mobilní/Řada/Úplný · Česká/Školy/Žáci · Druhým/Žáci/Člověk · Šikana/Účinnější · Závěrem/Škola) →
  `paragraphsOf -> 6 paragraphs; pieceProblem -> null ; chars 1025`
  `sentences per paragraph (code): 1,1,1,1,1,1  total 6 | a Czech reader: 1,3,3,3,2,2  total 14`
  `1 para 0 4w claim | Mobilní telefony ve škole` · `2 para 1 38w claim` · `3 para 2 39w evidence` · `4 para 3 28w claim` · `5 para 4 29w claim` · `6 para 5 24w claim`
  `over 35 words (Language lens auto-faulty): 2:38, 3:39`
  `piece summary head would read: 2 of 6 sentences to fix across 6 paragraphs.` (the template of `lib/desk/essay.ts:131`, with 2 faulty)
  `history detail (essay.ts:97): 2 of 6 sentences to fix, 6 paragraphs`
- **R11** `require('./desk/src/lib/session/texts.ts')` in the scratch dir, learner `kristyna-17-l1`:
  `noticed before: false` · `markNoticed: true -> noticed true` · `addPiece: true t-3b9d4a3888c8 "Mobilní telefony ve škole"` · `list: [{"id":"t-3b9d4a3888c8","format":"essay","title":"Mobilní telefony ve škole","versions":1,"paragraphs":3,…}]` · `addVersion same text: {"ok":false,"error":"That is the version you kept last. Change it, then send it.","status":400}` · `addVersion changed: true versions 2 sources paste,message` · `deletePiece: true` · `addVersion after delete (phone still holds pieceId): {"ok":false,"error":"That piece is not on your shelf.","status":404}` · `title of a question heading: "Untitled essay"` · `deleteAll: true -> noticed false`.
- EM1's R3–R9 (the splitter branches, English word lists, the cleanFix guard) apply to every paragraph of the piece unchanged.

## Findings (scratch keys)

| Key | Sev | Title |
|---|---|---|
| kristyna-17-EM3-1 | blocker | The piece's counts are code-built from the broken split: "2 of 6 sentences to fix across 6 paragraphs" for 14 sentences, on the TV, the landing and the history |
| kristyna-17-EM3-2 | major | A paragraph that fails to come back is never said: it stays dimmed like one being read, its sentences show "Neutral · Nothing flagged", and the only retry replaces the piece |
| kristyna-17-EM3-3 | major | The forensic page never names the paragraph; "Start with paragraph P" lives on one lens-home stop, is cut from the landing, and means "earliest", not "most important" |
| kristyna-17-EM3-4 | minor | After Delete the phone keeps the deleted piece's id: the next keep-and-read fails "That piece is not on your shelf."; typed text becomes a version of the old piece |
| kristyna-17-EM3-5 | minor (uncertain) | A plain title line becomes paragraph 1, costs a model call and can become "Start with paragraph 1" |
| kristyna-17-EM3-6 | minor | The TV says "reading your paragraph" while the first paragraph of a first piece is read (stale `piece`) |
| kristyna-17-EM3-7 | minor | `GET /api/texts` `noticed`/`notice` unwired (0 UI reads) |
| kristyna-17-EM3-8 | strength | One-time notice enforced by the server (428) before anything is kept, with an honest engine statement and a "Read without keeping" path; delete-all also forgets it |
| kristyna-17-EM3-9 | strength | One call per paragraph with the whole piece as context; a failure loses one paragraph, never the piece; limits refuse with a sentence and never truncate |

## Time saved and grounding

- **Time saved:** ~-12 min (a loss) · confidence medium. She pastes, answers the notice, waits ~2.5-3 min for six calls, walks a rail of six fat arrows and slowly works out that the counts cannot be hers. The design's best case for her is a plain decline before the wait.
- **Grounding:** ES-READ 3/8 (per paragraph, with the whole piece as context).

## Voice (first person, L1 over the designed experience)

The whole-essay part is actually thought through, and I'll give it that. It split my paste into paragraphs straight away, asked me once whether to keep it and told me straight that it goes to Claude, and the shelf has delete and "delete everything", which is more than school's Moodle does. But then I waited almost three minutes for it to tell me my essay has six sentences. Six. One of them is the title. It wants me to "start with paragraph 2", but only if I go back to the menu and land on the right card. The page I'm actually looking at only says "Sentence 2 of 6", as if I'm supposed to count gaps between arrows. And if one paragraph didn't come back, I'd never know. It would just say "Nothing flagged" over it, which is the most confident sentence on the whole TV and the one with the least behind it. That's exactly what I can't stand. For the mock maturita this is useless to me as it is. I'd use it again only if the first thing it said was "this reads English writing", and then I'd write my English essays here. Would I tell a friend? About the shelf, yes. About the reading, not in Czech.
