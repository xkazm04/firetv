# daniel-15 x EM3 · The whole essay — L1

- **Character:** daniel-15 (`uat/characters/essay/daniel-15.md`)
- **Journey:** EM3 · The whole essay (`uat/journeys/essay/EM3-the-whole-essay.md`). L2 has never reached it; walked here in full.
- **Cert level:** L1 (theoretical; code read and rule functions executed with node, no model, no browser, no server)
- **Base commit:** 12592a71
- **Verdict:** **L1-fail**. The machinery is there and mostly sound: the phone splits the paste, one call per paragraph, the TV fills in, a failed paragraph does not sink the piece, the notice comes before keeping, and the shelf has versions and delete. One blocker by rank defeats the job's own question, "which paragraph first, what move". Each paragraph is judged on its own paragraph's observations only, so under the default Structure lens every intro thesis and every conclusion link is ruled faulty. The summary's "Start with paragraph k" then points at that false fault. Six majors sit around it. His one-paste revision workflow makes duplicate "Untitled essay" pieces (C6 fails). The pre-filled sample fuses with his paste. The page he is moved to shows neither progress nor the summary. "Next paragraph" after a piece leads back into the one-paragraph flow. The paste box and the shelf hide behind the forensic page. His title line costs a call and lands as a paragraph or fuses into sentence 1.

## Reachable surface set

As EM2: `high-school`, 15 (`desk/src/tv/profileRows.ts:13`), `cz`, Family (`profileRows.ts:74`), teen voice "a 15-year-old" (`desk/src/lib/rules/voice.ts:70`).

| Surface | Reachable | Gate |
|---|---|---|
| Phone Essay tab: paragraph panel, paste split, "Read the whole piece on the TV", "Keep it on my shelf", notice, shelf | yes, **only while the TV is not on forensic** (`page.tsx:588` `!onSentence && !onPlan`) | `desk/src/app/phone/panelFor.ts:42`, `page.tsx:218-242`, `:593-605` |
| `/api/analyse` kind `piece` | yes | `desk/src/app/api/analyse/route.ts:51-77` |
| `/api/texts` GET/POST/DELETE | yes (phone role, seated learner) | `desk/src/app/api/texts/route.ts:29-34` |
| TV `essaytype` (Last piece card), `forensic` (rail with paragraph gaps) | yes | `desk/src/tv/keys.ts:45`, `EssayTV.tsx:249-283`, `:351-375` |
| Workroom (shelf titles on TV) | **unreachable**: Adult only | `desk/src/tv/keys.ts:259` |
| Grammar check | does not exist | `desk/src/lib/rules/essay.ts:155-160` |

## Surface model (EM3, in order)

1. **Paste.** The textarea's value starts as a sample paragraph (`page.tsx:58`, rendered as `value` at `:597`). `onEssayPaste` splits `value-before-cursor + pasted + value-after` with `paragraphsOf` and loads ≥2 paragraphs, resetting `pieceId` (`page.tsx:218-223`). The info line reads "That is N paragraphs. Read the whole piece, or one paragraph at a time." `paragraphsOf`: a blank line ends a paragraph, `#` headings stand alone (`rules/essay.ts:74-87`).
2. **Read the whole piece.** The button and "Keep it on my shelf" (default on, `page.tsx:74`) appear only with >1 paragraph (`page.tsx:600-602`). It is disabled while `busy`, so he cannot send twice (`:602`). `readPiece` joins the paragraphs with `\n\n`, checks `pieceProblem` on the phone (`page.tsx:225-227`), and POSTs `{kind:"piece", text, type: etype, keep, pieceId, source}` (`:230`). The lens defaults to Structure (`page.tsx:67`).
3. **Route.** `pieceProblem` is checked again (`route.ts:54-55`, `rules/essay.ts:111-119`: 100 KB, 30 paragraphs, 4000 chars a paragraph). With `keep` and no notice it answers 428 + `TEXT_NOTICE` (`route.ts:58`). Then `addPiece` / `addVersion` run (`route.ts:59-63`) **before** `runJob` (`route.ts:67`), whose 409 "already on it" comes after the keep.
4. **One-time notice** (`EssayShelf.tsx:54-64`, text `desk/src/lib/session/texts.ts:127`): "the desk sends it to its text engine: Claude, through the command line on this computer…". "I understand, keep it" calls POST `/api/texts {notice:true}` and then reads (`page.tsx:237-241`). "Read without keeping" reads with keep=false (`page.tsx:599`).
5. **AI surface `analysePiece` (ES-READ).** It makes one `judge()` call per paragraph, each with the whole piece numbered and "Judge only paragraph k of n" (`desk/src/lib/desk/essay.ts:62-86`, `:120-145`). Observations outside the paragraph are dropped (`essay.ts:83`). Then `decideVerdicts(lens, all sentences, this paragraph, these observations)` (`essay.ts:84`). A paragraph that throws goes into `piece.failed`, and the rest continue (`essay.ts:136-139`). The piece throws only if every paragraph failed (`:142`). The summary is built by code: "k of N sentences to fix across P paragraphs. Start with paragraph j: <that paragraph's model summary>" (`essay.ts:128-133`).
6. **TV progress.** The first paragraph back dispatches `essay.set`: screen `forensic`, `essayAt=null` (`route.ts:72`, `store.ts:566-567`). Later ones dispatch `essay.progress`, which updates the reading without moving the screen (`store.ts:569-570`). The rail draws pending (and failed) paragraphs at opacity .22 (`EssayTV.tsx:362`, `design/essay-specimen.css:134`). "reading k of n" exists only on the lens home's Last piece card (`EssayTV.tsx:272`). The lens home's caption while running is chosen by `a?.piece` of the *previous* reading (`EssayTV.tsx:143-144`).
7. **Summary.** It is drawn only on the lens home with the caret on the Last stop (`EssayTV.tsx:147`). The landing shows its first sentence only (`desk/src/tv/landingRows.ts:148`, `firstSentence` at `:85`). It is not on the forensic page and not on the phone.
8. **Shelf** (`EssayShelf.tsx:14-51`). Cards show title, paragraphs, version, date. Open loads the last version, sets `pieceId` and says "Change it, then read it again as a new version." (`page.tsx:242`). Delete and "Delete everything I kept" (second press confirms) go through `/api/texts` DELETE (`route.ts:68-76`, `texts.ts:117-121`, `:138-142`). Titles come from `titleOf` (`texts.ts:73-78`).
9. **Open later → new version.** `addVersion` when the phone still holds `pieceId` and the text changed. The same text is refused with "kept last", and the route then reads on the kept version (`route.ts:62`, `texts.ts:110`).

## The walk (in character)

**Step 1: paste.** He opens the Essay tab. The box already holds "Many students are tired. Sleep is important. Schools start early. This is bad." *Does he know what it wants?* The copy says "Send a .txt or .md file, or type, paste or dictate a message. The desk reads a whole piece, or one paragraph at a time." Clear. *Action visible?* The box, yes. He taps in and pastes. Unless he first selects all, the sample fuses with his title ("This is bad.Should mobile phones be banned at school?", executed, daniel-15-EM3-3). *Feedback:* "That is 5 paragraphs." He wrote four. With a blank line under the title, the title is paragraph 1 of 5. Without one, it fuses into sentence 1, or into a 20-word non-sentence when the title has no "?" (executed, daniel-15-EM3-7).

**Step 2: Read the whole piece.** One button, "Read the whole piece on the TV (5 paragraphs)", with "Keep it on my shelf" ticked. *Connects to the goal?* Exactly what he wanted (C2). The first time, a notice appears instead of a reading. It says where the text goes, gives two clear buttons, and appears once. Fine.

**Step 3: waiting.** The phone status says "the desk is reading your piece…" and nothing more. On the TV, if it was on the lens home with no earlier piece, the caption says "The desk is reading your **paragraph**. It lands here." (daniel-15-EM3-4). After ~25 s the first "paragraph", his title, lands and the TV jumps to the forensic page on sentence 1. The card that counts "reading 2 of 5" is on the screen he was just moved away from. On the forensic page the rest of the rail is faded and there is no "paragraph k of n". When paragraph 2 lands, the page jumps from his title to sentence 3 under his eyes, because `essayAt` is still null (executed). *Can he tell it worked and what comes next?* Partly: the faded rows fill in, a picture, no words.

**Step 4: which paragraph first?** The page opens on the first faulty sentence, his thesis "In my opinion phones should not be banned completely, but…", with "This claim has no evidence after it that a reader can check." (or the model's note in its place). That is the rule seeing only paragraph 2's observations (daniel-15-EM3-1). His conclusion is all faulty too ("links back to nothing"). The summary says "4 of 13 sentences to fix across 5 paragraphs. Start with paragraph 2: …" but only on the lens home's Last card, which he must Back out to and walk the caret onto. A gymnázium teacher would start with the body paragraphs' weak support, or the "It is a big problem." sentence, not with a thesis lacking statistics. *Trust:* low once he notices that every intro and conclusion is "wrong".

**Step 5: a paragraph that fails.** Say paragraph 4 times out. The other four land, and the job ends "done" with the summary as its status. The phone says "on the TV". On the TV, paragraph 4's rows stay faded exactly like rows still being read, and the Last card says "5 paragraphs". Nothing says paragraph 4 is missing or how to get it (executed, daniel-15-EM3-8). The only way back is to read the whole piece again, all five calls, about 2 min.

**Step 6: the shelf.** On the phone's Essay tab the shelf is not there while the TV is on the forensic page: the whole paragraph panel, shelf included, is replaced by the rewrite panel (`page.tsx:588`). He has to find Back on the remote. Next evening, opening Essay Master puts the TV straight back on last night's forensic page (`keys.ts:257`), so the paste box is hidden again (daniel-15-EM3-6). The rewrite panel offers "Next paragraph (2 of 5)", which sends the TV to the lens home and the phone to paragraph 2 with "This paragraph only". That button re-reads one paragraph and replaces the whole piece's reading (daniel-15-EM3-5).

**Step 7: tomorrow, the revised essay.** He fixes it on his laptop and pastes all of it again. The paste clears `pieceId`, so the shelf gets a second "Untitled essay" (his title ends in "?"), not version 2 (executed, daniel-15-EM3-2, C6 fails). The new-version path exists only through Open, then editing in the phone's box paragraph by paragraph. Pasting the whole text after Open resets `pieceId` again.

**Step 8: delete.** Delete works, and "Delete everything I kept" asks twice. Deleting the piece he has open leaves the phone pointing at it, and the next Read with Keep on fails with "That piece is not on your shelf." (executed, daniel-15-EM3-11).

## Scored criteria touched by EM3

| C | Result | Evidence |
|---|---|---|
| C1 (BLOCKER) no rewritten sentence anywhere | **uncertain (L2)** | As EM2 (daniel-15-EM2-4). The piece summary carries the model's paragraph summary unchecked (`essay.ts:132`). |
| C2 four paragraphs + title from one paste, read whole, never one by one | **pass** (caveats EM3-3, EM3-7) | `page.tsx:218-223`, `:600-602`; `route.ts:51-77`. Executed: his paste is 5 paragraphs, `pieceProblem` null. |
| C3 progress (paragraph k of n) on the TV; first verdicts before the last paragraph | **fail (partial)**: first verdicts land early (pass); "k of n" is not on the forensic page he is moved to; the first ~25 s caption says "paragraph" | `store.ts:566-570`, `EssayTV.tsx:143-144`, `:272`, `:362` (EM3-4) |
| C4 the summary names the paragraph to start with | **pass (code)**, shown only on the lens home's Last stop, and the named paragraph is a false fault under Structure | `essay.ts:128-133`, `EssayTV.tsx:147` (EM3-1, EM3-4) |
| C6 the same piece sent again is a new version, not a duplicate | **fail** | `page.tsx:222` resets `pieceId` on paste; executed: two `addPiece` give two "Untitled essay" cards (EM3-2) |
| C7 nothing claims to have checked grammar | **pass (code)** | 0 hits for grammar or spelling in essay UI. No disclosure either (EM3-9). |

## Definition of done (EM3)

- Several paragraphs in one go, read paragraph by paragraph on the TV: **met structurally**, but the progress words are on the wrong screen (EM3-4).
- They leave knowing which paragraph needs which move first: **not met in substance**. The rule sends him to the intro thesis (EM3-1).
- A failed paragraph does not lose the rest: **met** (`essay.ts:136-142`), but the failure is invisible (EM3-8).
- Choose to keep, told where the text goes first, open later as a new version, or delete: **keep, notice and delete met**. New version: **not met for his paste workflow** (EM3-2).

## Module metrics (rubric.md units)

| Metric | L1 |
|---|---|
| verdict agreement | L2. L1 predicts disagreement on faulty verdicts under Structure in a piece: thesis and conclusion sentences are faulty by rule, with a control arm showing them strong in one paragraph (E5). |
| ghostwriting | L2 (backstop gaps, EM2-4) |
| note-verdict consistency | L2 (path confirmed, EM2-2) |
| fix coverage | L2 |
| time to first verdict | L2. Estimate from env.md's ~25 s a call: about 25 s to his **title** paragraph, about 50 s to the first real paragraph, about 125 s to the last (5 sequential calls; 4 without the title line). |
| reliability | L2. L1: a failed paragraph is isolated (`essay.ts:136-142`) but not shown (EM3-8). |
| curtain | not touched: the shelf is phone-only (`texts/route.ts:1-4`); the Workroom is unreachable |
| entrance | L2 |

## Wiring audit

| Route | Computed user-facing fields | Wired | Unwired |
|---|---|---|---|
| `/api/analyse` kind `piece` → `EssayAnalysis` | sentences.{n,text,words,role,para}; stats.{sentences,claims,evidence,connectors,avgWords,words,links}; verdicts.{verdict,note,fix.move,fix.pattern,was}; summary; provider; piece.{paragraphs,read,failed,pieceId} = 23 | **20/23** | `stats.words`, `stats.links`, `provider` (0 hits under `desk/src/essay`, `desk/src/tv`, `desk/src/app/phone`). `piece.failed` is wired only as a count (`EssayTV.tsx:143`, `:272`) and never drawn apart from "pending" (EM3-8). `summary` is wired only on the lens home's Last stop and as its first sentence on the landing (EM3-4). |
| `/api/texts` GET (`texts/route.ts:39`) | pieces[].{id,title,format,versions,paragraphs,updated}, noticed, notice = 8 | **5/8** | `format` (drawn only on the Workroom, `essay/Workroom.tsx:32-34`, unreachable for him), `noticed`, `notice` (the phone learns the notice only from a 428) |

## Grounding audit

| Surface | Score | Present (prompt line) | Absent |
|---|---|---|---|
| ES-READ `analysePiece` → `judge` | **3/8** | S1 his text `essay.ts:75` (`numberedLines`, whole piece, "Paragraph k:" headers); S2 lens `essay.ts:67` (`lens.name`, `lens.lens`); S4 age `essay.ts:67` (`voice.who` = "a 15-year-old", `voice.ts:70`) | S3 kind of writing (`type` is the lens id; `format` "essay" is only on the shelf record, `texts.ts:98`); S5 mode; S6 the task (his title reaches the prompt only as a numbered sentence with "first-pass role: claim", executed E1); S7 his history (`addHistory` is written after, `essay.ts:95`, never read into the prompt); S8 memory notes |

Named additions: the whole piece as context for each paragraph (present, `essay.ts:75-76`); the maturita written-paper format and criteria for a `cz` high-schooler (absent).

## Executions

All are run from ROOT with `DESK_DATA_DIR=C:/Users/kazda/AppData/Local/Temp/uat-l1-adf0a33d/data/daniel-15 node - <<'EOF' require('./tools/ts-load.cjs'); … EOF`. Model observations are simulated; every verdict, split, limit and store result is the code's.

**E1: his paste, four title variants** (`paragraphsOf`, `splitSentences`, `pieceProblem`). A = title + blank line, B = title + single newline, C = title without "?" + single newline, D = A with CRLF:
```
--- A: paragraphs=5 sentences=13 pieceProblem=null
  s1: "Should mobile phones be banned at school?" para 0 role claim words 7
--- B: paragraphs=4 sentences=13 pieceProblem=null
  p1: "Should mobile phones be banned at school? Nowadays almost every student has a smartphone a"
--- C: paragraphs=4 sentences=12 pieceProblem=null
  s1: "Mobile phones at school Nowadays almost every student has a smartphone and many schools ar" para 0 role claim words 20
--- D: paragraphs=5 sentences=13 pieceProblem=null
--- A sentences (excerpt)
9 p3 link 11 "Some students play games in the lesson and they don't listen."
12 p4 claim 10 "Schools should make rules, e.g. phones in lockers during lessons."
--- A numberedLines (prompt) head
Paragraph 1:
1. Should mobile phones be banned at school?  [7 words, first-pass role: claim]
```
(The "e.g." abbreviation holds; sentence 9 is misread as a link, see EM2-3.)

**E2: the pre-filled sample and the paste** (`page.tsx:58`, `:220`):
```
cursor at end   -> "Many students are tired. Sleep is important. Schools start early. This is bad.Should mobile phones be banned at school?"
cursor at start -> "In conclusion, schools should make rules.Many students are tired. Sleep is important. Schools start early. This is bad."
select-all      -> "Should mobile phones be banned at school?" n= 5
```

**E3: piece limits** (`pieceProblem`, the same function on the phone `page.tsx:226` and the route `route.ts:54`):
```
31 paragraphs  -> That is 31 paragraphs. The desk reads up to 30 at a time: send it in parts.
30 paragraphs  -> null
one para 4001  -> Paragraph 2 is too long to read in one go. Split it in two (up to 4000 characters each).
101 KB         -> That piece is too long to read in one go. Keep it under 100 KB.
blank          -> There is nothing to read. Write or send a piece first.
```

**E4: progress, page focus, a failed paragraph, the summary.** `tv/keys.ts` `forensicAt`, the card label from `EssayTV.tsx:272`, `pieceSummary` replicated from `essay.ts:128-133` because `analysePiece` calls the engine. Structure lens, paragraph 4 failing:
```
after p1: forensic on sentence 1 (para 1) | rail pending paras=2,3,4,5 | card "reading 2 of 5"
after p2: forensic on sentence 3 (para 2) | rail pending paras=3,4,5 | card "reading 3 of 5"
after p3: forensic on sentence 3 (para 2) | rail pending paras=4,5 | card "reading 4 of 5"
after p4: forensic on sentence 3 (para 2) | rail pending paras=4,5 | card "reading 5 of 5"
after p5: forensic on sentence 3 (para 2) | rail pending paras=4 | card "5 paragraphs"
verdicts: 1:neutral 2:neutral 3:faulty 4:strong 5:strong 6:neutral 11:faulty 12:faulty 13:faulty
summary: 4 of 13 sentences to fix across 5 paragraphs. Start with paragraph 2: (model summary of paragraph 2)
crumb of the open sentence: Sentence 3 of 13 · claim
```

**E5: the per-paragraph rule across every lens branch, with a control arm** (`decideVerdicts` with only the judged paragraph's observations, as `essay.ts:83-84` passes them):
```
structure title as claim  : [{"n":1,"verdict":"faulty","note":"This claim has no evidence after it that a reader can check."}]
structure thesis (para 2) : [{"n":2,"verdict":"faulty","note":"This claim has no evidence after it that a reader can check."}]
structure evidence (p3)   : [{"n":3,"verdict":"strong","note":""}]
structure conclusion link : [{"n":4,"verdict":"faulty","note":"This links back to nothing: no evidence comes before it."}]
evidence  opinion thesis  : [{"n":2,"verdict":"faulty","note":"This only asserts; nothing here is checkable."}]
argument  thesis pushes   : [{"n":2,"verdict":"strong","note":""}]
language  thesis no issue : [{"n":2,"verdict":"neutral","note":""}]
control one paragraph     : [{"n":1,"verdict":"faulty",…},{"n":2,"verdict":"strong","note":""},{"n":3,"verdict":"strong","note":""},{"n":4,"verdict":"strong","note":""}]
```
Branches: Structure claim and link are **broken** (paragraph-blind). Evidence opinion is **broken** (backing looked for only in the same paragraph). Structure evidence, Evidence checkable, Argument and Language are **clean** (local by nature).

**E6: the shelf store in the scratch dir** (`lib/session/texts.ts`: `addPiece`, `addVersion`, `listPieces`, `deletePiece`, `deleteAll`):
```
noticed before: false
paste 1 -> true Untitled essay | paste 2 -> true Untitled essay
shelf: [{"title":"Untitled essay","versions":1,"paragraphs":5},{"title":"Untitled essay","versions":1,"paragraphs":5}]
open+change -> true versions 2
same again -> {"ok":false,"error":"That is the version you kept last. Change it, then send it.","status":400}
title of "Mobile phones at school\n\nPhones are useful." -> Mobile phones at school
title of "# Phones at school\nPhones are useful." -> Phones at school
title of "Should mobile phones be banned at school?\nNow" -> Untitled essay
delete -> true
read again with the old pieceId -> {"ok":false,"error":"That piece is not on your shelf.","status":404}
deleteAll -> true noticed after: false
```

## Findings (scratch keys)

| Key | Sev | Rank | Title |
|---|---|---|---|
| daniel-15-EM3-1 | **blocker** | 18 | Each paragraph of a piece is ruled on its own paragraph's observations: every intro thesis and conclusion link is faulty under Structure (and opinion theses under Evidence), and "Start with paragraph k" points at that false fault |
| daniel-15-EM3-2 | major | 9 | Pasting the revised essay makes a second "Untitled essay", not a version (C6); a 409-refused read also keeps a duplicate |
| daniel-15-EM3-3 | major | 12 | The Essay box is pre-filled with a sample paragraph; a paste at the cursor fuses it into his first paragraph |
| daniel-15-EM3-4 | major | 9 | The forensic page he is moved to shows neither "paragraph k of n" nor the summary; the page jumps as paragraphs land; the first wait says "your paragraph" |
| daniel-15-EM3-5 | major | 12 | After a whole-piece read the phone offers "Next paragraph (2 of 5)", which leads to "This paragraph only" and replaces the piece's reading |
| daniel-15-EM3-6 | major | 9 | The paste box and the shelf are hidden whenever the TV is on the forensic page, and Essay Master reopens there |
| daniel-15-EM3-7 | major | 9 | A title line is read as its own paragraph (a call, a verdict, "5 paragraphs") or fuses into sentence 1; the task never reaches the prompt as a task |
| daniel-15-EM3-8 | minor | 6 | A failed paragraph is drawn exactly like one still being read, the phone says "on the TV", and only a whole re-read gets it back |
| daniel-15-EM3-9 | minor | 6 | Nothing says grammar and spelling are not checked; "Well done" lands on sentences with errors |
| daniel-15-EM3-10 | minor | 3 | Unwired: `provider`, `stats.words`, `stats.links`; `/api/texts` `noticed`/`notice` |
| daniel-15-EM3-11 | minor | 6 | Deleting the open piece leaves the phone pointing at it; the next Read with Keep fails "That piece is not on your shelf." |
| daniel-15-EM3-12 | strength | n-a | Limits checked on the phone and the route in plain words; one call per paragraph with failure isolation; notice before keeping with a decline; Read disabled while busy; delete-all confirmed |

## Time saved and grounding

- **Time saved (if it all worked):** about 5 min saved · confidence low. One paste, about 2 min of reading, then a ranked "start here" against a marked essay a week later. Against ChatGPT it is a loss in minutes. If EM3-1 stands, the "start here" costs time.
- **Grounding:** ES-READ 3/8 (S1, S2, S4).

## Voice: Daniel, first person (L1, the designed experience)

I paste the whole thing once, that's the bit I actually wanted, no "send paragraph one, now paragraph two". But first it glued their example text onto my title, so I had to delete it all and paste again. Then it says five paragraphs when I wrote four, because it counts my title. Reading takes about two minutes. The TV jumps to my title first, then jumps somewhere else while I'm looking at it, and it never says how far it's got unless I go back to the other screen. Then it tells me to start with my intro because my opinion sentence "has no evidence after it". It's the intro, the evidence is in the next paragraph, that's how you write it. Our teacher would never mark that, and my conclusion is apparently all wrong too. After that I don't really trust the "start with paragraph 2". If one paragraph doesn't come back, it just looks grey forever and nothing tells me. The shelf is fine, but every time I paste the new version it's another "Untitled essay", so now I have three of the same thing. It doesn't say anything about grammar, which is what I actually lose marks for, and it doesn't pretend to check it. That's honest, I guess, but it's also the thing I needed. Would I tell someone? "It reads the whole essay, but it's weird about intros and conclusions."
