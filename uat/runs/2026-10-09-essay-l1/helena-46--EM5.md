# helena-46 x EM5 · My writing, kept and known — L1

- Character: `helena-46` (Helena, 46, account manager, B2 business English, Adult mode)
- Journey: EM5 · My writing, kept and known (never reached at L2; walked in full here)
- Cert level: **L1** (theoretical, code walk; no model, no browser, no server)
- Base commit: 12592a71
- **Verdict: L1-fail** — a boundary breach: a kept piece with no typed title is titled from its own first line when that line has no closing punctuation, so the Workroom shows 6-9 of her words and her clients' names (curtain = 1; C1 BLOCKER fails). Beside it, the twin's level words misdescribe her (directness is inverted against the spec), and "Delete everything I kept" leaves the full text of a read piece in `session.json` and on the TV.

## Reachable surface set

Profile `other`, no age, Mode `Adult (18+)` (`desk/src/lib/rules/mode.ts:44`, `desk/src/tv/profileRows.ts:74`; repro R1).

- **TV:** Workroom, only from the landing while no reading is on the desk (`desk/src/tv/keys.ts:259` after `:257`), or from the PC page's "Show the Workroom on the TV" (`desk/src/app/drop/page.tsx:65`, `:101`). Lens home and Family screens behind it (`keys.ts:419`).
- **PC page `/drop`:** join with the TV code, keep a piece (paste, .txt/.md/.docx; Message / Email / Essay radio, optional title), the shelf (Open / Delete / Delete everything), the twin panel with exemplar review, Twin Card download (Adult only) (`desk/src/app/drop/page.tsx:75-104`).
- **Phone Essay tab:** the same shelf (`desk/src/app/phone/page.tsx:605`); a kept piece is read on the TV only from here: Open (`:242`) -> "Read the whole piece on the TV" (only with 2+ paragraphs, `:600-602`).
- **Routes:** `/api/texts` (phone or PC only, TV refused 403: `desk/src/app/api/texts/route.ts:29-31`), `/api/twin` (`desk/src/app/api/twin/route.ts`), `/api/twin/card` (phone or PC, Adult, born: `desk/src/app/api/twin/card/route.ts:19`, `:23`, `:27`), `/api/analyse {kind:"piece", keep}` (`desk/src/app/api/analyse/route.ts:51-77`).
- **Unreachable:** specimen cabinet (Family only, `desk/src/lib/rules/collect.ts:53`).

## Surface model (EM5 path)

| # | Affordance | file:line | Route / pipeline | AI? |
|---|---|---|---|---|
| 1 | /drop: join with code | `drop/page.tsx:68-74` | `/api/session {type:"join"}` | no |
| 2 | /drop: Keep a piece (format radio default **Message**, title optional, paste or file) | `drop/page.tsx:23`, `:79-88` | POST `/api/texts` -> `addPiece` `desk/src/lib/session/texts.ts:93-104`; title `titleOf` `:73-78`; one-time notice 428 (`texts route:54`) | no |
| 3 | The notice: "To read your writing, the desk sends it to … Claude … Pieces you keep stay on this desk under your name until you delete them." · "I understand, keep it" / "Read without keeping" | `texts.ts:127`; `desk/src/app/phone/EssayShelf.tsx:54-63` | `markNoticed` `texts.ts:130-135` | no |
| 4 | Shelf: title, paragraphs, version, date; Open; Delete; Delete everything (second press confirms) | `EssayShelf.tsx:36-50` | GET / DELETE `/api/texts` (`texts route:36-41`, `:68-76`) -> `deletePiece` / `deleteAll` `texts.ts:117-142`; then `workroom.set` refresh (`texts route:23`) | no |
| 5 | Twin panel: per channel "born" / "N more to keep", level words, exemplar checkboxes, Download your Twin Card, Show the Workroom on the TV | `drop/page.tsx:90-102` | GET `/api/twin` `twin/route.ts:27-41` -> `portraitOf` `desk/src/lib/twin/card.ts:39-52`, `levelWords` `:79`; POST exclude `:49-56`; card `card/route.ts` -> `buildCard` `card.ts:87-129` | no (code: `desk/src/lib/rules/style.ts`) |
| 6 | TV Workroom: pieces (title, format tag, version, paragraphs, change pips), twin (Born / N more to keep, level words), "The lenses" | `desk/src/essay/Workroom.tsx:20-52` | session `workroom` from `workroomOf` `desk/src/lib/twin/workroom.ts:15-28` | no |
| 7 | Read a kept piece through a lens | phone `page.tsx:242`, `:225-236`; TV forensic `desk/src/essay/EssayTV.tsx:315-344` | `/api/analyse {kind:"piece", keep:true, pieceId}` -> `addVersion` (same text tolerated, `route.ts:59-62`) -> `analysePiece` `desk/src/lib/desk/essay.ts:120-145` | ES-READ |

## The walk (in character)

**1. /drop, join, keep my first email.** Q1 yes, "Keep a piece". Q2 yes. Q3 yes. But the radio starts on "Message (chat)" (`drop/page.tsx:23`); if I paste without switching, my email is a message and goes to the chat channel. The notice comes once: it names Claude and says pieces stay until I delete them — good, that is what I want to know. Its second button says "Read without keeping" (`EssayShelf.tsx:60`), but nothing on this page reads; pressing it only closes the notice. Q4 "Kept on your shelf."

**2. The shelf on the PC.** Title, paragraphs, version, date. It does not show whether I kept it as Email or Message (`EssayShelf.tsx:41`; `format` unwired). With no title typed, the title comes from my text: "Thanks for the call today Peter", "Hi Jan", "Quick update on the Brenntag contract renewal" (repro R5). With a comma after the greeting it is "Untitled email".

**3. TV, Essay Master -> Workroom.** Q1 "Workroom · your pieces", "Your twin". Q2 the rows, "The lenses". Q4 Those titles are on my television, where my son and his friends sit: "ok the Rabobank demo moved to thursday at ten" is a chat line of mine, and "Quick update on the Brenntag contract renewal" is my client's business (repro R5). Up/Down lights each piece, but OK on a piece does nothing (repro R6: `{"events":[],"calls":[],"local":{}}`); the only action is The lenses.

**4. Get a kept piece read.** Not from the PC: /drop has no reading. On the phone: Essay tab -> shelf -> Open -> "Read the whole piece on the TV" (only if it has blank-line paragraphs; a one-block email gets "Analyse on the TV", which reads it but does not tie the reading to the piece). The reading opens on the TV forensic page: every sentence of my email, in big type (`EssayTV.tsx:415`); the lens home shows its first words, "“Thanks for the call today Peter…”" (`EssayTV.tsx:252-253`, `:273`). The prompt is the EM1 prompt: "a 15-year-old", "The student's piece", no word that this is an email (see EM1 grounding). On the Language lens a long sentence falls back to "Claim, then evidence, then the link back" (EM1 R3). Q3 is weak: the advice is not built for emails.

**5. Back to the Workroom.** After that reading, Select on Essay Master opens the forensic page, not the Workroom (`keys.ts:257` before `:259`); Back goes forensic -> lens home -> landing; Menu on the lens home goes to the playbook (repro R6). By remote I never see my shelf again. Only "Show the Workroom on the TV" on the PC brings it back.

**6. The twin.** After three emails kept as Email, the Emails channel says "born" and shows eight level words; before, "2 more to keep", "1 more to keep" (R5). C5 holds. But the words: for three "Hi Jan … Cheers" emails it says **formality ceremonial, length brief, directness indirect, detail headline** (R8). I am not ceremonial with Jan, and my emails are long. Directness is read backwards: a writer with no hedges is "indirect", one who hedges every line is "blunt" (R7, against `docs/standards/twin-card/1.0/SPEC.md:79`, 1 = blunt … 5 = indirect). The same numbers go into the Twin Card.

**7. Take it away.** "Download your Twin Card" appears once born and in Adult mode (`drop/page.tsx:100`; route gate `card/route.ts:23`, `:27`). The card carries up to five exemplars per born channel, verbatim to 500 characters (`card.ts:48`). The review list lets me untick each one — good. But the PC page says the twin "never keeps what other people wrote to you" (`drop/page.tsx:91`) and the Workroom says it "learns how you write, never what you wrote for someone else" (`Workroom.tsx:47`). A pasted reply with the client's quoted text below it goes into the card word for word (R9: "Our board has cut the 2027 budget by 30%, please keep this confidential." is in an exemplar). And the exemplars are, by design, what I wrote for someone else.

**8. Delete one, delete everything.** Delete removes the file; Delete everything (two presses) removes my folder, the twin's state and the notice; the Workroom refreshes to empty (R9, R6). Good. But the reading of the deleted email is still on the desk: `session.json` still holds its full text, and Select on Essay Master still opens the forensic page on "Thanks for the call today Peter" (R6). The notice promised "until you delete them".

## Scored criteria

| Id | Result | Evidence |
|---|---|---|
| C1 (BLOCKER) | **fail (boundary)** | R5: auto-titles "Thanks for the call today Peter" (6 of her words), "ok the Rabobank demo moved to thursday at ten" (9), "Quick update on the Brenntag contract renewal" (7) drawn at `Workroom.tsx:33`; `titleOf` `texts.ts:76` takes a first line with no closing punctuation; its own comment (`:69-71`) and `docs/DESIGN-ESSAY-MASTER.md:189` say the TV never shows a sentence |
| C2 | pass, first visit only | R6; after a reading the landing opens forensic, and no key path returns to the Workroom (`helena-46-EM5-5`) |
| C3 | fail (prompt) | EM1 R1: "a 15-year-old" (`lib/desk/essay.ts:67`); the piece reading uses the same prompt (`essay.ts:137`) |
| C4 | uncertain(L2), guard pass | EM1 R4 |
| C5 | **pass** (structure), with caveats | R5: Emails channel `born:true` at 3, `need 3`; Workroom "N more to keep" `Workroom.tsx:44`; caveats: phone-kept pieces are always format `essay` -> Essays channel (`route.ts:59`, `texts.ts:98`); /drop default is Message |
| C6 | **pass** for the Workroom; the reading survives | R9: `deletePiece true -> 4 pieces`, `deleteAll true folder exists false workroom {"pieces":[],"channels":[]…}`; R6: `session essay kept? true`, `session.json holds Brenntag: true` |

Definition of done: D1 **fail** (listed by title, but the title can be content: C1) · D2 partial (a kept piece can be read, only via the phone, the reading puts every sentence on the TV, and the advice is not built for email) · D3 **fail on "words they recognise"** (R7, R8), pass on "take it away" (card) · D4 partial (Workroom shows it gone; the text and the TV reading remain).

## Module metrics (rubric units)

| Metric | L1 value |
|---|---|
| curtain | **1** on the Workroom (any auto-titled piece whose first line is an unpunctuated phrase of 5+ words; R5 shows 3 such titles); TV recap 0 and Sunday page 0 by their builders (counts only: `desk/src/tv/recapRows.ts:28-36`, `desk/src/lib/rules/digest.ts:33-34`); phone Recap 0 (no essay text field read in `app/phone`) |
| ghostwriting | 0 structural paths; L2 for model texts |
| verdict agreement, note-verdict consistency, fix coverage, time to first verdict, entrance, reliability | as EM1: L2 (with the EM1 structural causes) |
| rewrite turnaround, others kept, recap specificity | not on this journey |

## Wiring audit

| Route / builder | Wired / computed user-facing | Unwired |
|---|---|---|
| GET `/api/texts` (shelf) | 5/8 | `pieces[].format` (shelf never shows Email / Message / Essay), `noticed`, `notice` (the notice arrives by 428 instead) |
| GET `/api/twin` (PC twin panel) | 11/12 | `channels[].words[].level` (the word is shown; the number is not) |
| session `workroom` (TV) | 12/15 | `pieces[].updated`, `pieces[].diff.paragraphs`, `channels[].words[].level` |
| `/api/analyse` piece reading (TV) | 18/22 | `provider`, `stats.links`, `stats.words`, `sentences[].connectors` |

## Grounding audit

- **ES-READ** (the kept piece read, `analysePiece`, prompt `lib/desk/essay.ts:66-79`): S1 yes (`:75`), S2 yes (`:67`, `:69`), S3 **no** (the piece's own `format` is on disk, `texts.ts:28`, and never passed: `route.ts:69`), S4 no (default "a 15-year-old"), S5 no, S6 no, S7 no, S8 no. **2/8.** Named additions: the whole piece as context and "Judge only paragraph k of n" (`essay.ts:76`).
- **Twin portrait and card:** no model call — code (`rules/style.ts` `styleSheet`, `twinDims`; `lib/twin/card.ts`). No shared denominator; n-a (code).
- **MEM:** not reached (memory is maths-only, `lib/desk/memory.ts:21-58`).

## Executions (run from ROOT, `DESK_DATA_DIR` under `C:/Users/kazda/AppData/Local/Temp/uat-l1-adf0a33d/data/helena-46/…`)

- **R1** mode and voice: `adultAllowed true modeOf adult` · `voice {"band":"teen","who":"a 15-year-old","manner":""}` (EM1 R1).
- **R5** `texts.addPiece('helena', {text, format:'email'})` for three emails and one piece with no format, then `workroomOf('helena')`:
  `titles: email:"Thanks for the call today Peter" | email:"Untitled email" | email:"Hi Jan" | essay:"Untitled essay"` ·
  `workroom pieces: [["Untitled essay","essay",1,3],["Hi Jan","email",1,3],["Untitled email","email",1,3],["Thanks for the call today Peter","email",1,3]]` ·
  `channels: [{"ch":"email","n":3,"born":true,"words":"formality=ceremonial,warmth=cordial,humor=none,energy=matter-of-fact,length=medium,directness=indirect,expressiveness=none,detail=headline"},{"ch":"generic","n":1,"born":false,…}] need 3`.
  Second run (scratch `titles`): `message "ok the Rabobank demo moved to thursday at ten"` · `email "Quick update on the Brenntag contract renewal"` · `email "Untitled email"` (for "Dear Mr Visser,") · `message "Untitled message"`.
- **R6** store simulation (scratch `store3`, `lib/session/store.ts` + `tv/keys.ts` + `lib/session/texts.ts`): `seated Helena screen landing isAdultHere true` · `Select, nothing on desk -> {"events":[{"type":"subject","subject":"essay"}],"calls":[{"url":"/api/twin","body":{"open":true}}]}` · after `essay.set` of a kept email: `Select, a reading on desk -> […{"type":"nav","screen":"forensic","focus":0}]` · `deleteAll true shelf 0` · `after delete-all: session essay kept? true | sentences 4 | first "Thanks for the call today Peter"` · `session.json holds Brenntag: true` · `Select after delete-all -> […"screen":"forensic"…]` · `forensic Back -> nav essaytype | Menu -> []` · `essaytype Back -> nav landing | Menu -> nav playbook` · `workroom Back -> nav landing | Menu -> nav essaytype` · `Select on piece -> {"events":[],"calls":[],"local":{}}`.
- **R7** `twinDims(styleSheet(…))`: three blunt texts (no hedges) -> `hedge permille 0 directness 5 indirect`; three heavily hedged texts -> `hedge permille 5000 directness 1 blunt`. `SPEC.md:79`: `directness | blunt | direct | balanced | softened | indirect` (1..5). `style.ts:93`: `directness = 6 - band(r.hedge, …)`. No test pins the direction (`tools/style-rules-test.cjs`, `tools/twin-rules-test.cjs:81` checks only the word table).
- **R8** three casual emails ("Hi Jan … Best,", "Hi Petra … Cheers,", "Hi Tom … Best,") -> `wps p50 2 greeting 1000 signoff 1000 contraction 0` -> `formality=ceremonial, warmth=neutral, humor=none, energy=matter-of-fact, length=brief, directness=indirect, expressiveness=none, detail=headline`. `sentencesOf` splits on line breaks, so "Dear Mr Visser,", "Kind regards," and "Helena" are sentences: `["Dear Mr Visser,","I wanted to follow up …","Could you please confirm …","Kind regards,","Helena"]`.
- **R9** `buildCard` over the shelf plus a reply with a quoted client line -> `email exemplars: 4 | quoted client text in card: true`; `deletePiece true -> 4 pieces`; `deleteAll true folder exists false workroom {"owner":"helena","pieces":[],"channels":[],"born":false,"need":3} noticed false`.

## Findings (scratch keys)

- `helena-46-EM5-1` **blocker (boundary)** — the curtain: auto-titles put her own words and clients' names on the Workroom.
- `helena-46-EM5-2` **blocker** — the twin's directness is inverted against Twin Card SPEC 5.1, on screen and in the exported card.
- `helena-46-EM5-3` **blocker** — the twin's level words misread email: a greeting and a sign-off alone make "ceremonial"; sign-off and name lines count as sentences, so detail is "headline" and length "brief".
- `helena-46-EM5-4` **blocker** — "Delete everything I kept" leaves the read piece's full text in `session.json` and on the TV forensic page.
- `helena-46-EM5-5` major — after the first reading, no remote path leads back to the Workroom.
- `helena-46-EM5-6` major — a kept piece can be read only from the phone; the PC page cannot ask for a reading, and the Workroom's piece rows do nothing on OK.
- `helena-46-EM5-7` major — reading a kept email puts every sentence on the TV (forensic) and its first words on the lens home; her goal's "without putting my clients' business on the TV" cannot hold for a reading (curtain scope, by design).
- `helena-46-EM5-8` major — format: phone-kept pieces are always "essay", /drop defaults to "Message", and the shelf does not show the format, so emails can grow the wrong twin.
- `helena-46-EM5-9` major — "never keeps what other people wrote to you" / "never what you wrote for someone else" is false: quoted replies and her client emails go verbatim into the card's exemplars.
- `helena-46-EM5-10` minor — on /drop the notice's "Read without keeping" reads nothing, and the empty shelf says pieces land here from the TV.
- `helena-46-EM5-11` polish — leaving a piece out of the exemplars still lets its text shape the dims and count toward birth.
- `helena-46-EM5-12` strength — the shelf is the learner's alone and never reaches the TV as text; delete-all removes the folder, the twin state and the notice; the card is gated to Adult and to a born channel.

## Time saved and grounding

- **~0 min saved, a loss of ~3-5 min per kept piece until the card is used elsewhere · confidence low.** The payoff the Character file names (another tool drafting emails she would send as her own) rests on dims that are partly inverted and miscalibrated; marked uncertain, as the Character file asks.
- **Grounding: ES-READ 2/8; twin n-a (code).**

## Voice — Helena, first person (over the designed experience)

I set up my own profile because I saw "Adult", and the PC page is the right idea: a real keyboard, my files, a shelf I can empty. The notice told me the text goes to Claude and stays until I delete it; I appreciated that sentence. Then I looked at the television. "Quick update on the Brenntag contract renewal" was on it, in large serif type, because I did not bother to type a title. That is exactly what I asked it not to do. I pressed OK on the piece to read it and nothing happened; I had to take my phone, open the shelf, and press "Read the whole piece", and then the whole email was on the TV anyway. After that I could not get back to the Workroom with the remote at all.

The twin: three emails to Jan, Petra and Tom, all "Hi" and "Best", and it calls me ceremonial and indirect, with headline detail. I am the person whose emails get "TL;DR?". If a trainer read me those words she would laugh. I would not hand that card to another tool and expect it to write like me. And when I deleted everything, the TV still opened my email to Peter. Fine — show me what it keeps, and where; today the answer is "more than it says". I would not tell a peer yet. Fix the title, the delete and the words, and I would try it again, because the shelf and the delete button are what Grammarly never gave me.
