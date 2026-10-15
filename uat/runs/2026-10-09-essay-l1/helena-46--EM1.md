# helena-46 x EM1 · What does my paragraph do? — L1

- Character: `helena-46` (Helena, 46, account manager, B2 business English, Adult mode)
- Journey: EM1 · What does my paragraph do?
- Cert level: **L1** (theoretical, code walk; no model, no browser, no server)
- Base commit: 12592a71
- **Verdict: L1-conditional** — the paragraph reaches the forensic page and every refusal she can hit is said before she waits, but the reading is written for "a 15-year-old" student, never told it is an email, and on the Language lens a code-faulty long sentence falls back to the essay move "Claim, then evidence, then the link back".

## Reachable surface set

Profile: type `other`, no age, Mode `Adult (18+)`, all modules on.

- The Mode row is offered to her: `adultAllowed` holds for type `other` with no age (`desk/src/lib/rules/mode.ts:44`; row at `desk/src/tv/profileRows.ts:74`). Repro R1: `modeOf` = `adult`.
- Landing -> Essay Master -> **Workroom** while no reading is on the desk (`desk/src/tv/keys.ts:259`, POST `/api/twin {open:true}` -> `desk/src/app/api/twin/route.ts:48` -> `workroom.set open` `desk/src/lib/session/store.ts:601`). With a reading on the desk it opens **forensic** instead (`desk/src/tv/keys.ts:257`). Repro R6.
- Workroom -> "The lenses" (Select) or Menu -> lens home `essaytype` (`desk/src/tv/keys.ts:419`); then the Family screens: plan (`:401-413`), forensic (`:423-438`), playbook / x-ray (`:440-445`).
- Phone Essay tab (`desk/src/app/phone/page.tsx:588-605`): lens radio, file (.txt/.md), textarea, Dictate, Analyse on the TV; "Read the whole piece" only for 2+ paragraphs (`:600-602`); the shelf (`:605`).
- **Unreachable:** the specimen cabinet (Family only, `desk/src/lib/rules/collect.ts:53`; `desk/src/essay/EssayCabinet.tsx:12` renders nothing without pins). Not judged.

## Surface model (EM1 path)

| # | Affordance | file:line | Behind it | AI prompt sources |
|---|---|---|---|---|
| 1 | Landing, Select on Essay Master | `desk/src/tv/keys.ts:286`, `:253-262` | `openWaiting` -> `/api/twin` (Adult, nothing read) | none |
| 2 | Workroom, empty state "Nothing kept yet. On a PC, open /drop…" and "The lenses" | `desk/src/essay/Workroom.tsx:38`, `:50`; keys `:415-421` | session `workroom` (`desk/src/lib/twin/workroom.ts:15-28`) | none (code) |
| 3 | Lens home: four lenses, the plan door, caption | `desk/src/essay/EssayTV.tsx:113-196`; keys `:383-399` | Select = `essay.type` + status "language lens chosen — paste or dictate the paragraph on the phone" (`keys.ts:395`) | none |
| 4 | Phone Essay tab, lens synced from TV, paste, Analyse on the TV | `desk/src/app/phone/page.tsx:124`, `:244-255`, `:604` | POST `/api/analyse {kind:"essay"}` -> `desk/src/app/api/analyse/route.ts:80-88` -> `analyseEssay` `desk/src/lib/desk/essay.ts:105-112` | ES-READ prompt `desk/src/lib/desk/essay.ts:66-79` |
| 4b | (2+ paragraphs) Read the whole piece, keep on shelf | `page.tsx:225-236`, `:600-602` | `/api/analyse {kind:"piece"}` `route.ts:51-77` -> `analysePiece` `essay.ts:120-145` | same prompt, per paragraph |
| 5 | Forensic page: rail, one sentence, note, THE MOVE, THE PATTERN, four actions | `desk/src/essay/EssayTV.tsx:315-344`, `:378-429` | verdicts decided in code `desk/src/lib/rules/essay.ts:266-316`; move from `taught` `:369-374` with playbook fallback `desk/src/lib/library/lessons.data.ts:59-62` | — |
| 6 | Why this matters -> playbook / x-ray | `keys.ts:435`, `EssayTV.tsx:496-561` | static library | none |
| 7 | Start from the pattern (plan) | `keys.ts:388-391`, `:401-413`; `EssayTV.tsx:203-246` | `planFill` `rules/essay.ts:405-415`, then `/api/analyse` | ES-READ |
| 8 | Refusals | `page.tsx:206-211` (`essayFileProblem`), `:246-247` (`essayTooLong`), route `:80-81` | `rules/essay.ts:98-101`, `:127-141` | — |

## The walk (in character)

**1. Landing, Select on Essay Master.** Q1 yes — the shelf of apps is the landing. Q2 yes. Q3 yes. Q4 the TV opens the Workroom: "Workroom · your pieces", "Nothing kept yet. On a PC, open …/drop…". For EM1 that is a detour: I came to read one email, the Workroom tells me to go to a PC first. "The lenses" is the one action (Right or Select). Fine, I find it.

**2. Lens home.** Q1 "Choose a lens"; Q2 four lens names with their promises; Q3 partly: Structure "claim, evidence, link", Argument "does the paragraph take a side", Evidence "a fact a reader can check", Language "sentence length, rhythm, connectors, repeated words". Only Language is about my email; the other three are an essay teacher's. "Paste, type or dictate one paragraph on the phone." Q4 the citron flood and the status say the lens is chosen; the phone's radio follows the TV (`page.tsx:124`).

**3. Phone, paste, Analyse on the TV.** Q1 "Your paragraph… Send a .txt or .md file, or type, paste or dictate a message." Q2 yes. Q3 yes. Q4 "the desk is reading it…", then "on the TV"; the TV caption says "The desk is reading your paragraph. It lands here." (`EssayTV.tsx:144`). About 25-30 s (env.md W-run). If I paste the whole email with blank lines, the phone splits it and offers "Read the whole piece" or "This paragraph only" (`page.tsx:222`, `:600-604`).

**4. Forensic page.** Opens on the first faulty sentence (`forensicAt`, `keys.ts:157-163`). Q1 yes: one sentence, the problem, THE MOVE, THE PATTERN. Q3 depends on the advice. On the Language lens the length rule is code's (`rules/essay.ts:308`, 35 words) and the model is told "the desk counts length itself" (`lib/desk/essay.ts:33`): my 44-word opening sentence is faulty with the model's own note, which can praise it, and with no fix of its own the page teaches the **Paragraph** playbook: "Claim, then evidence, then the link back", pattern "[Your claim]. For example, [the evidence]. This shows [the link back]." (repro R3). That is exactly the "add evidence" advice I do not want on a client email. Q4 Rewrite on my phone / Next sentence / Why this matters are clear.

**5. Why this matters.** Playbook "Thesis, Paragraph, Order, Conclusion", units and minutes; the x-ray is a model paragraph about students arriving at school exhausted (`EssayTV.tsx:531-535`). Not my world.

**6. Start from the pattern.** Reachable (nothing read yet, `keys.ts:133`). Three slots: claim, evidence, link back. A school paragraph frame; I would not use it for an email.

**7. Refusals.** A 4,100-character paste: refused on the phone before any wait (`page.tsx:246-247`, repro R7). A .docx from Outlook/Word: refused on the phone ("The desk reads .txt and .md files…"), though the PC page takes .docx (`desk/src/app/drop/page.tsx:48`). A Czech text: no check exists (repro R7), it would be read.

## Scored criteria (those EM1 touches)

| Id | Result | Evidence |
|---|---|---|
| C1 (BLOCKER, Workroom curtain) | pass on EM1's path | the Workroom is empty on EM1 (`Workroom.tsx:38`); the curtain breach is walked in EM5 |
| C2 | **pass** | R6: Select with nothing on the desk -> `{"calls":[{"url":"/api/twin","body":{"open":true}}]}`; Workroom Menu -> `{"type":"nav","screen":"essaytype","focus":0}` |
| C3 | **fail (prompt), output uncertain(L2)** | R1: `voiceOf("essay", undefined)` = `{"band":"teen","who":"a 15-year-old","manner":""}`; prompt "You are a writing tutor for a 15-year-old" and "Each note is one short sentence a student can act on" (`lib/desk/essay.ts:67`, `:70`), "The student's paragraph" (`:75`); mode never passed (`route.ts:23`) |
| C4 | **uncertain(L2)**, guard pass | a flagged word must be in the sentence or the verdict drops it (`rules/essay.ts:211-217`, `:295`); R4: "a lot of things" (multi-word) dropped -> neutral, "things" kept -> faulty. Whether she agrees it is padding is model output |
| C5, C6 | not on EM1 | EM5 |

Definition of done: D1 pass (structure) · D2 pass (opens on first faulty; whether she can say why is L2) · D3 partial (every faulty sentence carries a move and a pattern, own or playbook; nothing ghostwritten by structure, but the fallback move is an essay move) · D4 pass structurally (plan reachable; frame is a school paragraph) · D5 partial (too long and wrong file said before the wait; no language check).

## Module metrics (rubric units)

| Metric | L1 value |
|---|---|
| verdict agreement | L2 |
| ghostwriting | 0 structural paths (pattern guard `cleanFix` `rules/essay.ts:174-194`, `NEVER_REWRITE` `lib/desk/essay.ts:49`); note/summary text L2 |
| note-verdict consistency | structural cause confirmed: a Language length-faulty sentence keeps the model's note (`rules/essay.ts:308-311`); R3 shows "This sentence clearly explains the reason for the delay." on a faulty verdict; R4 shows a gap-naming note on a neutral verdict. Live count L2 |
| fix coverage | L2; structurally, a length-only faulty sentence has no model fix to clean (the model is not told it is long) and falls back to the playbook |
| time to first verdict | L2 |
| curtain | 0 on EM1's surfaces (Workroom empty; recap builders count-only, `desk/src/tv/recapRows.ts:28-36`) |
| entrance | L2 |
| reliability | L2 |

## Wiring audit

| Route / builder | Wired / computed user-facing | Unwired |
|---|---|---|
| `/api/analyse` -> `EssayAnalysis` (TV) | 18/22 | `provider` (0 UI hits), `stats.links`, `stats.words`, `sentences[].connectors` (only `stats.connectors` is drawn, `EssayTV.tsx:467`) |
| session `workroom` (TV, `lib/twin/workroom.ts`) | 12/15 | `pieces[].updated`, `pieces[].diff.paragraphs` (Pips reads `diff.sentences` only, `Workroom.tsx:15-18`, `:35`), `channels[].words[].level` |

## Grounding audit — ES-READ (`lib/desk/essay.ts` judge, `:62-86`)

| Source | Reaches? | Where |
|---|---|---|
| S1 her own text | yes | `essay.ts:75` numbered lines |
| S2 lens | yes | `essay.ts:67`, `:69` |
| S3 kind of writing (email) | **no** | body has no format (`route.ts:15`); the prompt says "The student's paragraph" (`essay.ts:75`) |
| S4 age / stage | **no** — her stage does not reach; an undefined age becomes the default "a 15-year-old" (`voice.ts:68-70`, `:75`) |
| S5 mode (Adult) | **no** | only `age` is read (`route.ts:23`) |
| S6 the task | no | — |
| S7 history on this desk | no | `record()` writes history after the call (`essay.ts:93-102`); never read into a prompt |
| S8 memory notes | no | `lib/desk/memory.ts` is maths-only and not on this path |

**ES-READ 2/8.** Named additions (outside the score): first-pass role and word count per sentence, and paragraph counts (`essay.ts:77`, `rules/essay.ts:57-61`); for a piece, the whole piece as context (`essay.ts:76`). ES-REVISE: not on EM1 (EM2). MEM: not reached.

## Executions (run from ROOT, `DESK_DATA_DIR` under the scratch dir)

- **R1** `node -e "require('./tools/ts-load.cjs'); const m=require('./desk/src/lib/rules/mode.ts'), v=require('./desk/src/lib/rules/voice.ts'); const h={id:'helena',type:'other',mode:'adult'}; …"` -> `adultAllowed true modeOf adult adultContent true` · `rows Type of student | Mode | School system | Interested in | Maths course | (actions)` · `learnerAge undefined` · `voice {"band":"teen","who":"a 15-year-old","manner":""}`
- **R3** `decideVerdicts('language', splitSentences(<3-sentence email paragraph, sentence 1 = 44 words>), …, [{n:1,issues:[],note:'This sentence clearly explains the reason for the delay.'}, …])` -> `{"n":1,"verdict":"faulty","note":"This sentence clearly explains the reason for the delay."}` (no fix); `playFor('language')` -> `para | Claim, then evidence, then the link back | [Your claim]. For example, [the evidence]. This shows [the link back].`; `taught(v1, playbook)` -> `{"fix":{"move":"Claim, then evidence, then the link back",…},"own":false}`
- **R4** `decideVerdicts('language', splitSentences('We will do a lot of things for you next week.'), …)` with issue word `a lot of things` -> `{"verdict":"neutral","note":"Name the things."}`; with `things` and empty note -> `{"verdict":"faulty","note":"'things' is doing too little here; say what you mean."}`
- **R6** store simulation (scratch `store3`): profile.draft {type other, mode adult} + save + learner.set -> `isAdultHere true`; landing Select on essay with nothing read -> `/api/twin {open:true}`; with a reading on the desk -> `nav forensic`; workroom Menu -> `nav essaytype`
- **R7** `essayFileProblem({name:'Visser follow-up.docx',…})` -> `The desk reads .txt and .md files. Pick one of those, or type the paragraph here.` · `essayTooLong('a'.repeat(4100))` -> `That paragraph is too long… (up to 4000 characters).` · `essayTooLong('Dobrý den, posílám fakturu.')` -> `null` (no language check exists)

## Findings (scratch keys)

- `helena-46-EM1-1` major — the reading is written for "a 15-year-old" student; Adult mode and her stage never reach the prompt (C3).
- `helena-46-EM1-2` major — the kind of writing never reaches the prompt, and the Language lens falls back to the essay move "Claim, then evidence, then the link back" for a fix-less faulty sentence.
- `helena-46-EM1-3` major — a Language length-faulty sentence keeps the model's own note, which was never told the sentence is long: praise on a faulty verdict.
- `helena-46-EM1-4` minor — the lens home, playbook and x-ray speak only to school paragraphs in Adult mode.
- `helena-46-EM1-5` minor — `provider`, `stats.links`, `stats.words`, `sentences[].connectors` computed and never shown.
- `helena-46-EM1-6` polish — the phone refuses .docx that the PC page accepts.
- `helena-46-EM1-7` polish — no "language it does not read" refusal (D5).
- `helena-46-EM1-8` strength — verdicts decided in code, flagged words checked against the sentence, refusals said before the wait.

## Time saved and grounding

- **~1 min saved · confidence low** (against ~5 min of re-reading and trimming one important email; a 25-30 s reading plus walking the sentences, but advice on long sentences falls back to essay structure, so the trim is still hers).
- **Grounding: ES-READ 2/8.**

## Voice — Helena, first person (over the designed experience)

Fine. It showed me which sentence is too long, and it did not rewrite it. That part I like: Grammarly's rewrites never sounded like me. But I opened Essay Master and the TV sent me to a PC before I could read anything; then four lenses, three of which are for my son's essays. I chose Language, as anyone writing to clients would. My first sentence was 44 words and the page said, in big letters, "Claim, then evidence, then the link back" — "For example, [the evidence]". I write to a Dutch logistics manager, not to an examiner. And the note under it may well tell me the sentence is clear, while the arrow says it is wrong; which one do I believe? I also know, because I looked, that it is told I am fifteen. Show me what it would change, and then let me decide — yes; but talk to me as the account manager I am, and know that an email is not a paragraph. Would I tell a colleague? Not yet. I would tell her the sentence-length check is honest and the rest is homework.
