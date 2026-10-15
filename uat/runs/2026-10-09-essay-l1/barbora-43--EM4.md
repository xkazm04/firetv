# barbora-43 × EM4 — Was tonight worth it?

- Character: Barbora, 43 (`uat/characters/essay/barbora-43.md`), external buyer, Parent role on the phone
- Journey: EM4 (`uat/journeys/essay/EM4-was-tonight-worth-it.md`)
- Cert level: L1 (theoretical, over `desk/src`; builders executed with node on constructed readings)
- Base commit: 12592a71
- **Verdict: L1-conditional.** The curtain holds: no recap or Sunday-page builder can carry a sentence of hers (curtain 0, executed). For paragraph readings the Essay Master line names every lens and the right "k of n". But the parent's copy disappears from the phone once the TV leaves the recap. A whole piece is recapped as "not tonight" or "0 of 0 … all of it right". Rewrites she watched never reach the counts. And the notice and the delete cover kept pieces only.

## Reachable surface set

| Surface | Reachable? | Gating |
|---|---|---|
| TV recap ("Tonight, done"), essay tile, "On the parent's phone" chip | yes, after End session (phone Tonight tab) or Menu on the landing | `session.end` → `screen = "recap"`, `desk/src/lib/session/store.ts:620`; `desk/src/tv/keys.ts:273`; `desk/src/tv/screens.tsx:303-321` |
| Phone Recap tab (Parent role) | yes; the Parent button opens it, `desk/src/app/phone/page.tsx:381`. Its body shows **only while** `s.screen === "recap" \|\| s.log.problems.length` (`:616`), else "Arrives when the session ends." (`:625`) | `log.problems` is only ever filled by Math Buddy hints, `store.ts:542-543` |
| Sunday page ("This week") | yes, under the Recap tab, whenever someone is seated (`page.tsx:626`, `:644-650`) | lines built server-side, `store.ts:716-720`; sent to a phone only, `desk/src/lib/session/pairing.ts:145-147` |
| One-time notice | only when a **multi-paragraph piece** is read with "Keep it on my shelf" ticked, the first time | `desk/src/app/api/analyse/route.ts:57-58`; `page.tsx:599-602` |
| Shelf + "Delete everything I kept" | Essay tab, only when the TV is **not** on a sentence or the plan (`page.tsx:576`, `:582`, `:588`, `:605`); the delete-all button only when something is kept (`desk/src/app/phone/EssayShelf.tsx:45`) | |
| Learner record a reading writes | indirect (counts behind the recap and the week) | `desk/src/lib/desk/essay.ts:93-102` |
| A locked parent view | **unreachable**: Phase 1 has none | `page.tsx:641-642` |

## Surface model (EM4)

1. **Record** (`essay.ts:93-102`): per reading, one history line `{kind:"writing", label: lens.name, detail: "k of n sentences to fix[, P paragraphs]"}`, the lens record, and one digest entry `{kind:"essay", lens, sentences, faulty}` (whitelisted, `desk/src/lib/rules/digest.ts:104-108`). A rewrite writes **nothing** (`essay.ts:150-157`).
2. **Session history**: rehydrated from the learner file only after the events in `REHYDRATE` (`store.ts:690`). `essay.set` is one of them; `essay.progress`, `job.done` and `session.end` are not. The week is redrawn on those events and on `session.end` (`store.ts:744`).
3. **TV recap**: `recapRows` (`desk/src/tv/recapRows.ts:43-68`) parses tonight's `writing` lines with `parseDetail` (`:35`). The essay tile draws the last three readings (`screens.tsx:362`), each as `min(of, 12)` arrows with the last `against` turned citron (`:365`). Caption `recapCaption` (`recapRows.ts:84-88`).
4. **Phone Recap tab**: `recapLine` per tile (`recapRows.ts:121-123`), `tasksLine`, the caption, and "Nothing needed a second hint." / "Needed a second hint: …" (`page.tsx:619-624`).
5. **Sunday page**: `sundayPage` → `sundayWords` (`desk/src/lib/rules/week.ts:118-162`, `:181-217`); the Essay Master line is `week.ts:200-204`.
6. **Notice / shelf / delete**: `TEXT_NOTICE` (`desk/src/lib/session/texts.ts`, the notice constant), `TextNotice` (`EssayShelf.tsx:54-64`), `DELETE /api/texts?all=1` → `deleteAll` (folder of kept pieces only).

AI surfaces: none. The recap and the week are code. MEM (`/api/memory`, asked on End session) returns `[]` before any model call on an essay-only evening (`desk/src/app/api/memory/route.ts:28`). When there is maths, its prompt holds the maths set only, never essay text (`desk/src/lib/desk/memory.ts:47-53`).

## The walk (in character, four questions per step)

1. **Eliška presses End session on the phone's Tonight tab.** The TV goes to "Tonight, done": a black Essay Master card with arrows and citron ones turned round, a caption ("Good evening's work - three to look at together."), and a chip that says "On the parent's phone". *Wants?* Nothing; it's a picture. *Visible?* Yes. *Connects?* Yes: the citron arrows are "sentences to fix". *Worked?* Yes. The phone (Student role) stays on Tonight with "What the desk noticed: Nothing written down tonight." (memory is maths-only.)
2. **I take the phone, press Parent.** Recap: "Eliška, tonight", then "Essay Master - two readings (Evidence, Structure): 3 of 11 sentences to fix", the caption, and "Nothing needed a second hint." *Wants?* Clear enough. *Connects?* Mostly. "Second hint" is a maths word on an evening of writing.
3. **Meanwhile Eliška presses Back to the desk on the TV.** My phone now says "Arrives when the session ends." The session *has* ended. The words I was reading are gone (finding 1).
4. **The evening she read her whole essay.** If she sent a three-paragraph piece, the phone says "Essay Master - not tonight" and "A quiet evening.", while the Sunday page under it says "One paragraph reading, through Structure." After another reading on the same evening it says "no readings: 0 of 0 sentences to fix … Good evening's work - all of it right." I watched three sentences go citron (finding 2).
5. **The evening she fixed two sentences.** I saw two arrows on the rail turn round and "Rewrite · it holds". The recap still says "2 of 5 sentences to fix" and "two to look at together" (finding 3).
6. **Where did the text go?** I go to the Essay tab. If the TV is on a sentence, the tab is the rewrite box, with no shelf. When the shelf shows, it says "Nothing kept yet". There is no "Delete everything I kept", because she only ever sent paragraphs. The notice that names Claude never appeared, and the paragraph is still on the desk in `session.json` (finding 4).

## Scored criteria touched by EM4

| Criterion | Result | Evidence |
|---|---|---|
| C1 — no text supplies a sentence (recap, Sunday page part) | **pass** for the recap and the week; the evening-wide C1 is **uncertain (L2)**, see `barbora-43--EM1.md` | builders read counts and lens names only (repro G: 0 five-word runs) |
| C2 — the recap names each lens and the same "k of n" as the readings | **fail** | paragraph evenings exact (repro A, C, D); a piece gives "not tonight" or "0 of 0" (repro B, B2); a rewrite that holds never changes the count (`essay.ts:156`) |
| C3 — Recap tab and Sunday page never quote her sentence | **pass** | repro G; `recapRows.ts:63-66`, `:121-123`; `week.ts:152-154`, `:200-204`; digest whitelist `digest.ts:104-108` |
| C5 — the Sunday line names the lenses and the count, nothing else | **pass**, with a wording slip: a multi-paragraph piece is called "One paragraph reading" (repro B) | `week.ts:203` |
| C6 — finds where the text goes and how to delete it | **fail** for a paragraph evening; pass only after a kept piece | finding 4 |

## Module metrics (rubric.md units)

| Metric | L1 value |
|---|---|
| **recap specificity** (per evening: lenses named and "k of n" exact) | **exact on 4 of 6 constructed evenings** (A two paragraphs, C one sentence, D the same lens twice, E four readings, phone line). **Mismatch on B** (a piece, history rehydrated: "no readings: 0 of 0") **and B2** (a piece, not rehydrated: "not tonight" against a Sunday line of one reading). Also, by code, every evening with a rewrite that holds (first-reading counts kept, `essay.ts:156`). Sunday page: lenses exact on all 6. |
| **curtain** (learner sentences or 5+ word runs on the TV recap, Recap tab, Sunday page) | **0** (repro G over the recorded path; the builders take no text input at all) |
| reliability | L2 |

## Wiring audit

| Route / builder | Computed user-facing fields | Wired | Unwired |
|---|---|---|---|
| `recapRows` essay tile | app, empty, readings[].lens, .against, .of | 5/5 (`screens.tsx:361-365`; `recapRows.ts:121-123`) | none |
| `weekOf` → `WeekLine` | section, head, text | 3/3 (`page.tsx:644-650`) | none |
| `EssayAnalysis.provider` (the engine that read her text) | — | — | 0 UI hits (see EM1); the only place the engine is named is the notice, which a paragraph evening never shows |

**Wiring 8/8** on EM4's own builders. The gap is upstream: the piece's history line reaches neither builder in usable form (finding 2).

## Grounding

No AI surface on EM4: the recap and the week are code by construction (`week.ts:1-22`, no engine import). **MEM**: an essay-only evening never calls the model (`memory/route.ts:28`); on a mixed evening its prompt carries the topic, the marked maths items with working, the hint count and the existing notes (`memory.ts:47-53`), and no essay source.

## Executions

Script: `C:/Users/kazda/AppData/Local/Temp/uat-l1-adf0a33d/data/barbora-43/em4-recap.cjs`. It builds history lines with the exact template `record()` writes (`essay.ts:97`) and runs `recapRows`, `recapLine`, `recapCaption`, `sundayPage`/`sundayWords`. For G it writes a real line through `addHistory` / `addDigest` into the scratch `DESK_DATA_DIR` and reads it back. Command, from ROOT:

```
DESK_DATA_DIR=C:/Users/kazda/AppData/Local/Temp/uat-l1-adf0a33d/data/barbora-43 node C:/Users/kazda/AppData/Local/Temp/uat-l1-adf0a33d/data/barbora-43/em4-recap.cjs
```

Output:

```
--- A two paragraphs: Evidence 2/5, Structure 1/6
tile: {"app":"essay","empty":null,"readings":[{"lens":"Evidence","against":2,"of":5},{"lens":"Structure","against":1,"of":6}]}
phone line: Essay Master - two readings (Evidence, Structure): 3 of 11 sentences to fix
caption: Good evening's work - three to look at together.
sunday essay line: ["Two paragraph readings, through Structure and Evidence."]
--- B one piece: Structure, 3 paragraphs, 3/12
tile: {"app":"essay","empty":null,"readings":[]}
phone line: Essay Master - no readings: 0 of 0 sentences to fix
caption: Good evening's work - all of it right.
sunday essay line: ["One paragraph reading, through Structure."]
parseDetail(piece): {}  parseDetail(paragraph): {"against":3,"of":12}
--- B2 piece, history not rehydrated in the session
tile: {"app":"essay","empty":"Not tonight","readings":[]}
phone line: Essay Master - not tonight
caption: A quiet evening.
sunday essay line: ["One paragraph reading, through Structure."]
--- C one-sentence paragraph 1/1
phone line: Essay Master - one reading (Language): 1 of 1 sentence to fix
sunday essay line: ["One paragraph reading, through Language."]
--- D Evidence twice on one paragraph: 3/5 then 1/5
phone line: Essay Master - two readings (Evidence): 4 of 10 sentences to fix
caption: Good evening's work - four to look at together.
sunday essay line: ["Two paragraph readings, through Evidence."]
--- E four readings: tile readings 4 TV draws Argument,Evidence,Language | phone: Essay Master - four readings (Structure, Argument, Evidence, Language): 4 of 20 sentences to fix
F rail of=5 against=2: arrows drawn 5, citron drawn 2
F rail of=12 against=3: arrows drawn 12, citron drawn 3
F rail of=14 against=2: arrows drawn 12, citron drawn 0
F rail of=20 against=3: arrows drawn 12, citron drawn 0
--- G curtain over the recorded path:
 Math Buddy - not tonight / Linga - not tonight / Essay Master - one reading (Evidence): 2 of 4 sentences to fix /
 Good evening's work - two to look at together. / Eliška worked on one evening. / Essay Master /
 One paragraph reading, through Evidence. / One thing to try together /
 Ask them to read you a paragraph they worked on and say what changed.
 sentences: 4 | 5-word runs of the learner found in recap+week: 0
```

B2 is the state the session is in right after a piece, by code: `analysePiece` calls `record()` after its last `onProgress` (`essay.ts:134-143`), and the route dispatches only `essay.set` for the first paragraph, then `essay.progress` and the job events (`route.ts:67-75`, `desk/src/lib/desk/job.ts:80-96`). None of the later events is in `REHYDRATE` (`store.ts:690`), so `s.history` lacks the piece until a later learner, join or `essay.set` event. `session.end` redraws the week (`store.ts:744`), not the history, which is why the Sunday line has the piece and the recap does not. F reproduces the arithmetic of `screens.tsx:365` (`i >= r.of - r.against` over `min(r.of, 12)` arrows).

## Findings (scratch keys)

| Key | Severity | Title |
|---|---|---|
| barbora-43-EM4-1 | major | The phone's Recap goes back to "Arrives when the session ends." once the TV leaves the recap, on any evening without a maths hint |
| barbora-43-EM4-2 | major | A whole piece is recapped as "not tonight" / "0 of 0 … all of it right", and the Sunday page calls it one paragraph reading |
| barbora-43-EM4-3 | major | Rewrites that hold never reach the recap: "k of n to fix" and "to look at together" count the first reading only |
| barbora-43-EM4-4 | major | Where the text goes and how to delete it covers kept pieces only; a paragraph evening shows no notice and the paragraph stays in session.json |
| barbora-43-EM4-5 | minor | The same paragraph read twice counts its sentences twice ("4 of 10" for a 5-sentence paragraph) |
| barbora-43-EM4-6 | minor | "Nothing needed a second hint." on the parent's recap of a writing evening |
| barbora-43-EM4-7 | polish | TV, phone and Sunday disagree in small ways: last 3 tiles vs all; no citron past 12 sentences; lens order |
| barbora-43-EM4-8 | strength | Curtain 0 by construction: the recap and the week are built from counts and lens names only |
| barbora-43-EM4-9 | strength | The Sunday Essay Master line is exactly C5: lenses and a count, nothing about the writing |

## Time saved and grounding

- **~13 min saved per evening · confidence low**, the same evening as EM1. EM4 is the condition on it: the Motivation says "if, and only if, she trusts that the work is Eliška's". With the recap gone from the phone after one press on the TV, and wrong on piece and rewrite evenings, the 2-minute read does not yet settle that. The tutor at 380-600 CZK an hour stays on the table.
- Grounding: no AI surface (n-a); MEM not reached on an essay-only evening.

## Voice — Barbora, first person (L1, over the designed experience)

Would I adopt it? The idea is right for me. A black card with arrows, the turned-round ones in yellow, and one line on my phone: "two readings, 3 of 11 sentences to fix." No percentages, no stars. Nothing on that card or on the Sunday page could be one of her sentences, because it is made only of counts and the lens names. That is exactly what I asked for, and I trust it more for being so plain.

What frustrated me is that it does not hold still. I read the line, she presses Back on the TV, and my phone says the recap "arrives when the session ends", after the session ended. The night she read her whole essay, the phone told me it was a quiet evening, while the Sunday page under it said there had been a reading. And the night I watched her fix two sentences, and saw the arrows turn and the TV say "it holds", the phone still said two to fix. A form tutor would not call that a truthful description of the evening. It tells me less than I saw.

Where does her writing go? I looked for the delete button and found "Nothing kept yet", while the paragraph is still sitting on the desk. The sentence that says the text goes to Claude only appears if she keeps a whole piece. I want that sentence the first time she sends anything, and a delete that clears what is on the desk, not only the shelf.

Would I tell another parent? "It shows you the count without showing you her homework" — yes. "It tells you what happened tonight" — not yet.
