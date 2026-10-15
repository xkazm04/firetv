# Eliška, 12 — EM1 · What does my paragraph do?

- Character: `eliska-12` (uat/characters/essay/eliska-12.md)
- Journey: EM1 (uat/journeys/essay/EM1-*.md)
- Cert level: **L1** (theoretical; no model, browser or server)
- Base commit: 12592a71
- **Verdict: L1-fail.** One confirmed blocker: a planted unsupported claim placed *before* the evidence is missed by both lenses that look for evidence, even when the model labels every sentence correctly (eliska-12-EM1-1). Everything else completes structurally.

## Reachable surface set

| Surface | Reachable | Gate |
|---|---|---|
| Landing, Essay Master object | yes | `essay` on by default (`desk/src/lib/session/store.ts:517`), `landingModules` (`desk/src/tv/landingRows.ts:31-34`) |
| Landing Select with no one seated asks who first | yes | `desk/src/tv/keys.ts:286` |
| `essaytype` lens home | yes | `openWaiting` (`desk/src/tv/keys.ts:260`) |
| `essayplan` (Start from the pattern) | yes, only with nothing read | `lensStops` (`desk/src/tv/keys.ts:133`), Select at `:390` |
| `forensic` | yes, after a reading or from the landing when her paragraph is on the desk | `desk/src/tv/keys.ts:257`; `essay.set` (`desk/src/lib/session/store.ts:566-567`) |
| `playbook` / `xray` | yes | Menu (`desk/src/tv/keys.ts:397`), Why this matters (`:435`), Select (`:442`) |
| Phone Essay tab: paragraph, plan slot, rewrite, shelf | yes | `panelFor` (`desk/src/app/phone/panelFor.ts:42,46`); `desk/src/app/phone/page.tsx:576-605` |
| Young voice | yes, age 12 ≤ 13 | `desk/src/lib/rules/voice.ts:34,37`; age in range for elementary (`desk/src/tv/profileRows.ts:13`, `[6,14]`) |
| Workroom (Adult) | **unreachable** | under 18 there is no Mode row (`desk/src/tv/profileRows.ts:74`); `isAdultHere` (`desk/src/tv/keys.ts:75-78,259`) |
| Specimen cabinet | only once a lens is Secure (Family) | `desk/src/essay/EssayCabinet.tsx:11` |
| Photo of a handwritten essay | **unreachable** | `desk/src/app/phone/panelFor.ts:30` |

## Surface model (EM1)

1. Landing → Select on Essay Master → `essaytype`, with the lamp on the last lens (`keys.ts:286,260`).
2. Lens home: four lenses, each with its promise in the caption (`desk/src/essay/EssayTV.tsx:144-149`). Select chooses one (`essay.type`, `keys.ts:395`). The phone's radio follows (`page.tsx:124`).
3. Phone Essay tab, paragraph panel (`page.tsx:588-605`): lens radio, file (.txt/.md), textarea, Dictate, **Analyse on the TV**. Before any call, `analyseParagraph` (`page.tsx:244-255`) runs `essayTooLong`, and `pickFile` (`:203-215`) runs `essayFileProblem`.
4. `POST /api/analyse {kind:"essay"}` (`desk/src/app/api/analyse/route.ts:80-88`) → `analyseEssay` (`desk/src/lib/desk/essay.ts:105-112`) → `judge` (`:62-86`), one `text()` call, `model: "best"`. The prompt is at `:67-77`. The model returns observations, and `decideVerdicts` (`desk/src/lib/rules/essay.ts:266-316`) decides strong / faulty / neutral. `record` writes history, writing estimate and digest (`essay.ts:93-102`).
5. `essay.set` → TV `forensic` on the first faulty sentence (`store.ts:567`, `keys.ts:157-163`). Rail of arrows, the sentence, the note caption (`EssayTV.tsx:405-411`), the move and pattern from `taught()` (`EssayTV.tsx:303-307`, `rules/essay.ts:369-374`), and four actions (`keys.ts:155`).
6. Menu → table (`EssayTV.tsx:463-491`); Why this matters → playbook → x-ray.
7. With nothing read: Down past Language → "Start from the pattern" → `essayplan`. The phone writes one sentence per slot (`essay.slot`, `planFill`, `rules/essay.ts:405-415`). Read it sends `planText` (`keys.ts:409-411`).

AI prompt sources for step 4 are in the grounding table below.

## The walk (in character)

**Step 1, landing to lens home.** *(1) Knows what it wants:* yes: "Choose a lens", with each lens's promise in the caption as the lamp moves. *(2) Action visible:* yes. *(3) Connects to goal:* "Evidence: what here is a fact a reader can check, and what is only an opinion." That is exactly Miss's margin note. She picks Evidence. *(4) Feedback:* the citron flood on the lens (`useCommit`), and the caption "Evidence · chosen. Paste, type or dictate one paragraph on the phone."

**Step 2, phone paragraph.** She types her walking-to-school paragraph (P1, below) and presses Analyse on the TV. *(1)–(3)* clear: one panel, one big button, the lens radio already on Evidence. *(4)* "the desk is reading it…" on the phone, and "Reading · The desk is reading your paragraph. It lands here." on the TV. A paragraph over 4000 characters or a .docx is refused before the wait, in one sentence (E15).

**Step 3, the forensic page.** It opens on the first faulty sentence. For P1 under Evidence, that is S3 "Walking also makes children happier than going by car." (E3), the planted one. Correct. The note caption, the move in giant type and the pattern with slots are there, and the crumb says "Evidence · Sentence 3 of 4 · claim". *(4)* She can tell what is wrong in one line, if the model's note is plain (L2).
- If the model reads her link "So schools should ask parents…" as *opinion*, it is red too (E3a), and on a clean PEEL paragraph so is her Explain sentence (E17). Two red marks where Miss would put none. That is her pet peeve.
- If she wrote it the other way round (P2: point, *then* the extra claim, *then* the study), the Evidence lens finds nothing to fix: "Nothing to fix" on the card. Structure puts the citron on her **topic sentence** and "Well done" on the planted claim (E4). Same paragraph, same teacher comment next week.

**Step 4, Why this matters → playbook.** The Paragraph structure, "Claim, then evidence, then the link back", is PEEL minus the Explain step. She recognises it. The x-ray shows a model paragraph about sleep, a different topic, so there is nothing for her to copy.

**Step 5, the plan (nothing read yet).** "Start from the pattern" gives three slots: Your claim / the evidence / the link back. One sentence per slot on the phone. A lower-case sentence is refused with "Start it with a capital and end it with a full stop." A slot answer containing [brackets] is refused. "Read it" reads only her own three sentences (E14c). The fit comment reads "That reads as claim." (no article).

## Scored criteria

| C | Result | Evidence |
|---|---|---|
| C1 BLOCKER, no copyable new content / rewritten sentence | **uncertain (L2)** | Patterns are guarded, but the guard admits a new-content frame such as "A survey found that [number] of children who walk feel happier." (E7, EM1-3). Notes and summary have no code guard at all (E8, EM1-4). Only the prompt holds them (`desk/src/lib/desk/essay.ts:49-51,70`, `voice.ts:57`). |
| C2 planted unsupported claim is the one marked, page opens on it | **fail** | Correct when the claim follows the evidence (E3, E4c). Wrong when it precedes it: Structure marks S1 and inks the planted claim strong, Evidence marks nothing (E4a/E4b). |
| C3 one plain sentence a 12-year-old can act on | **uncertain (L2)** | The young manner asks for it (`voice.ts:54-59`). Nothing in code enforces one sentence. The code's own fallback lines use "asserts" and "checkable" (EM1-7). |
| C4 move + pattern with a [slot] on every faulty sentence | **pass** | `taught()` returns the cleaned own fix or the lens's playbook frame (`rules/essay.ts:369-374`). `cleanFix` requires a slot (`:181`). Every playbook pattern has slots (E13). |
| C6 which lens read it and what it looked for, from the TV | **pass** | Lens icon and name in the crumb (`EssayTV.tsx:414`), "Last verdict · Evidence" on the lens home (`:147`), the promise on the focused lens (`:149`). |
| C7 Analyse → first verdict < 30 s | **uncertain (L2)** | One `best` call. The young manner adds about 500 characters to the system prompt. |

## Module metrics

| Metric | L1 |
|---|---|
| verdict agreement | L2. *Code-only proxy (not the rubric metric):* over P1, P2 and P6 with **model-correct labels**, 11/16 verdicts agree with a KS3 reader, and 1/4 faulty verdicts agree (E4a, E4b, E3b, E17-opinion) |
| ghostwriting | L2. Code guards the pattern only, and admits new-content frames |
| note-verdict consistency | L2. `cleanNote` strips "Good:" but not "Great point, but…" (E6) |
| fix coverage | L2 |
| time to first verdict | L2 |
| entrance | L2 |
| reliability | L2 |

## Wiring audit: `/api/analyse` kind `essay` (computed, user-facing → grep under desk/src UI)

| Field | Wired | Where |
|---|---|---|
| sentences[].n / text / words / role / para | yes | `EssayTV.tsx:366,415,414,482,362` |
| stats.sentences / claims / evidence / connectors / avgWords | yes | `EssayTV.tsx:467` |
| **stats.links** | **no** (0 hits) | none |
| **stats.words** | **no** (0 hits) | none |
| verdicts[].n / verdict / note / fix.move / fix.pattern | yes | `EssayTV.tsx:324-329,403,418-419` |
| summary | yes | `EssayTV.tsx:147`, `tv/landingRows.ts:148` |

**17/19 wired** (unwired: stats.links, stats.words). `provider` and the per-sentence `connectors` are internal and not counted.

## Grounding audit: ES-READ (N = 8)

| Source | Reaches the prompt | Line |
|---|---|---|
| S1 her text | yes | `desk/src/lib/desk/essay.ts:75` (numbered sentences) |
| S2 the lens | yes | `:67` (lens name + lens), `:69` (OBSERVE) |
| S3 kind of writing | no | none |
| S4 age / stage | yes | `:67` `voice.who` "a learner aged 11 to 13" + `withManner` young manner (`:74`, `voice.ts:54-59`) |
| S5 mode | no | not passed |
| S6 the task / question | no | the phone has no field for it |
| S7 her history on the desk | no | `record()` writes history (`:93-102`) but nothing reads it back into the prompt |
| S8 memory notes | no | none |

**ES-READ 3/8.** Named additions for Eliška: her school's scheme (UK KS3, PEEL; profile `system: uk`) does not reach the prompt. The PEEL vocabulary her teacher uses (point, evidence, explain, link) is not the lens's vocabulary.

## Executions

Scratch script `C:/Users/kazda/AppData/Local/Temp/uat-l1-adf0a33d/data/eliska-12/walk.cjs` (rules only). Run from ROOT:
`DESK_DATA_DIR=C:/Users/kazda/AppData/Local/Temp/uat-l1-adf0a33d/data/eliska-12 node C:/Users/kazda/AppData/Local/Temp/uat-l1-adf0a33d/data/eliska-12/walk.cjs <E-id>`

Paragraphs (hers, 12, Czech traces left out for clarity):
- P1: "Children should walk or cycle to school instead of going by car. A study from 2019 found that children who walk to school get 20 more minutes of exercise every day. Walking also makes children happier than going by car. So schools should ask parents to let their children walk." (planted S3 after the evidence)
- P2: the same with the planted claim moved to S2 (before the evidence).
- P6: a clean PEEL paragraph (point, study, "This means they are fitter and more awake in lessons.", "So walking to school is better than going by car.").

```
E1  voiceOf(essay,12)            {"band":"young","who":"a learner aged 11 to 13","bandAt14":"teen"}
E2  P1 roles                      [[1,"claim",12],[2,"evidence",19],[3,"claim",9],[4,"link",10]]
E3a evidence, S4 read as opinion  [[1,"neutral"],[2,"strong"],[3,"faulty"],[4,"faulty"]]
E3b evidence, S4 read as context  [[1,"neutral"],[2,"strong"],[3,"faulty"],[4,"neutral"]]
E4a evidence, P2 (planted S2)     [[1,"neutral"],[2,"neutral"],[3,"strong"],[4,"neutral"]]
E4b structure, P2                 [[1,"faulty","This claim has no evidence after it that a reader can check."],[2,"strong",""],[3,"strong",""],[4,"strong",""]]
E4c structure, P1                 [[1,"strong"],[2,"strong"],[3,"faulty"],[4,"strong"]]
E5  P3 roles (crumb)              [[1,"claim"],[2,"claim"],[3,"evidence"],[4,"link"]]   (S3 = "I found out that my friends who walk…")
E5b "In Year 8 we all have to wear a blazer." / "I found the lesson boring."  [[1,"evidence"],[2,"evidence"]]
E6  cleanNote  "Good: but where is the proof?"->"But where is the proof?"; "Strong - this has a number."->"This has a number.";
               "Great point, but you need a fact." / "Nice try: add a fact." / "Strong claim: but nothing backs it up." /
               "Well done! Now add a number." / "Good—this has a number."  -> unchanged
E7  cleanFix(…, "Walking also makes children happier than going by car.")
    "[Your point], because [a fact a reader can check]." KEPT
    "A survey found that [number] of children who walk feel happier." KEPT
    "A study found that [number] children are happier." KEPT
    "Walking also makes children [how much] happier, a survey says." dropped (4-word run)
    "[Your point]." (move "Fix") dropped; "Walking to school makes children happier." dropped (no slot)
E8  note "Write: Walking also makes children happier, because a 2020 survey found 7 in 10 walkers feel calm at school." -> passed through unchanged on a faulty verdict
E14 plan slots [Your claim/claim, the evidence/evidence, the link back/link]; "my cousin walks every day" -> "Start it with a capital and end it with a full stop." + fit "That reads as claim. This slot wants your evidence: something a reader can check."; "This shows [that walking is good]." -> "Leave the [brackets] out. Write the sentence in your own words."; planText -> her three sentences only
E15 4001 chars -> "That paragraph is too long to read in one go. Split it in two and send one part at a time (up to 4000 characters)."; .docx/.pdf -> "The desk reads .txt and .md files. Pick one of those, or type the paragraph here."; empty .txt -> "That file is empty. Pick one with some writing in it."; Czech paragraph -> null (no refusal)
E17 P6 evidence, E and L as opinion  [[1,"neutral"],[2,"strong"],[3,"faulty","This only asserts; nothing here is checkable."],[4,"faulty",…]]
    P6 evidence, E and L as context  all neutral but S2 strong
    P6 structure, Explain as claim   [[1,"strong"],[2,"strong"],[3,"faulty","This claim has no evidence after it that a reader can check."],[4,"strong"]]
```

## Findings (keys in the scratch JSON)

- **eliska-12-EM1-1 (blocker, confirmed):** planted claim before the evidence: Structure marks the wrong sentence, Evidence marks none.
- **eliska-12-EM1-2 (major, uncertain):** Evidence lens marks PEEL's Explain and Link faulty when the model calls them opinion.
- **eliska-12-EM1-3 (major, uncertain):** the `cleanFix` guard admits a new-content sentence frame (looser than the prompt's "none of their words").
- **eliska-12-EM1-4 (major, uncertain):** notes and summary have no code guard against ghostwriting.
- eliska-12-EM1-5 (minor, confirmed): the crumb, "Its job" and the table show the regex role, which can contradict the verdict.
- eliska-12-EM1-6 (minor, uncertain): `cleanNote` leaves praise-led notes on faulty sentences.
- eliska-12-EM1-7 (minor, confirmed): code-written lines are not young-voiced ("asserts", "checkable", "That reads as claim.").
- eliska-12-EM1-8 (polish): stats.links / stats.words unwired.
- eliska-12-EM1-9 (polish, scope note): no language refusal (not her path).
- Strengths: EM1-10 (refusals before the wait; the plan reads only her words), EM1-11 (code-decided anchored verdicts, young voice, a move and a slotted pattern on every fault).

## Time saved and grounding

- **~10 min saved · low** for the reading half of the Character's 18-minute paragraph cycle. Her 30-minute sofa session with Mum becomes a reading in under a minute plus her own thinking, and the verdict lands the same evening rather than a week later. EM1-1 makes the saving unreliable: on a claim-claim-evidence paragraph the desk sends her to the wrong sentence, and Miss's "where is your evidence?" comes back anyway.
- Grounding: **ES-READ 3/8**.

## Voice — Eliška, first person

Ok so the TV is actually nice. It's big, my sentence is on it, and there's one yellow arrow pointing back at the bad one, not red pen everywhere. And Mum can see I typed it myself, because it says "the desk is reading your paragraph" and then it's my words up there. The Evidence button literally says "a fact a reader can check, and what is only an opinion". That's what Miss means, so I'd use it.

But wait, why? I tried it with my walking paragraph where I put "it makes children happier" in the middle, before the study. Evidence said "Nothing to fix" and Structure said my *first* sentence has no evidence and gave the happier one "Well done". Ale to je naopak, it's the opposite! If I hand that in, Miss writes "where is your evidence?" next to *happier*, same as always. And when I did it properly, point, evidence, explain, link like we learned, it could put my "This means…" sentence in yellow and say it "only asserts". We are *supposed* to explain after the evidence. That's PEEL.

I like that it doesn't write it for me. The pattern has gaps, like a worksheet, so it's still mine. But if a pattern said "A survey found that [number] of children…", I'd just put in a number and that's basically ChatGPT. I'd feel weird, and I'm not sure Mum would know the difference.

Would I tell Tereza? Yes for the sentence-by-sentence thing and the "it lands the same evening" thing. But I'd tell her to put the evidence straight after the point, otherwise it gets confused about which sentence the study belongs to. It needs to know which claim the evidence is for, and that "explain" is a real job, not an opinion.
