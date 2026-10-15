# barbora-43 × EM1 — What does my paragraph do? (watched from the sofa)

- Character: Barbora, 43 (`uat/characters/essay/barbora-43.md`), external buyer, watching Eliška's seated profile
- Journey: EM1 (`uat/journeys/essay/EM1-what-my-paragraph-does.md`)
- Cert level: L1 (theoretical, over `desk/src`; no browser, no server, no model)
- Base commit: 12592a71
- **Verdict: L1-conditional** — the paragraph is read, the TV points at Eliška's own sentence and the moves and patterns are code-guarded. Two major trust gaps remain: notes and the summary have no code guard against a supplied sentence, and the x-ray shows a hand-in-ready model paragraph on the topic of the phone's own sample.

## Reachable surface set

Barbora drives nothing. She watches the TV that Eliška drives, and she holds the phone (or shares it).

| Surface | Reachable for her? | Gating |
|---|---|---|
| Landing → Essay Master → lens home (`essaytype`) | watched | `essay` on Eliška's profile, `desk/src/tv/landingRows.ts:31`; `desk/src/tv/keys.ts:257-260` |
| Plan (`essayplan`, "Start from the pattern") | watched, only while nothing has been read | `desk/src/tv/keys.ts:133` (`lensStops`: "plan" only when `!s.essay`) |
| Forensic page, rail, table | watched | `desk/src/tv/keys.ts:387`, `:423-439`; `desk/src/essay/EssayTV.tsx:315` |
| Playbook → x-ray | watched (forensic "Why" → playbook → Select) | `desk/src/tv/keys.ts:435`, `:442`; `desk/src/essay/EssayTV.tsx:540` |
| Phone Essay tab (`paste`) | yes, in either role (the nav bar is not role-gated) | `desk/src/app/phone/page.tsx:632`; the Parent role is never moved by a hand-off, `desk/src/app/phone/panelFor.ts:71-83` |
| Reading voice | young band (age 12) | `desk/src/lib/rules/voice.ts:37`; route reads the age, `desk/src/app/api/analyse/route.ts:23` |
| Workroom, Twin Card | **unreachable**: Adult only; Eliška is 12, Family | `desk/src/lib/rules/mode.ts` `modeOf`, `desk/src/tv/keys.ts:259` |
| A locked parent view | **unreachable**: none exists in Phase 1 | `desk/src/app/phone/page.tsx:641-642` |

## Surface model (EM1, in order)

1. **Lens home** `desk/src/essay/EssayTV.tsx:113`: four lenses with the lens promise in the caption (`:149`). Select fires `essay.type` (`desk/src/tv/keys.ts:395`) and the phone (Student role) follows to the Essay tab (`desk/src/app/phone/panelFor.ts:42`).
2. **Phone Essay tab** `desk/src/app/phone/page.tsx:588-605`: lens radios, file picker, textarea **prefilled with a sample paragraph** (`:58`), Dictate, "Analyse on the TV" → `analyseParagraph` (`:244-255`) → `POST /api/analyse {kind:"essay"}`.
3. **Route** `desk/src/app/api/analyse/route.ts:80-88`: refuses over-long text in a sentence (`essayTooLong`), then `runJob` → `analyseEssay(text, type, learnerId, age)`.
4. **Pipeline** `desk/src/lib/desk/essay.ts:105-112` → `judge()` (`:62-86`): one model call, `model: "best"`; the model only *observes*; `decideVerdicts` (`desk/src/lib/rules/essay.ts:266-316`) rules strong / faulty / neutral; `cleanFix` (`:174-194`) keeps a fix only if it is a 2-6 word move and a slotted pattern with no 4-word run of her sentence; `cleanNote` (`:245-248`) strips a leading verdict label. Then `record()` (`essay.ts:93-102`) writes the history line, the lens record and the digest.
5. **Forensic page** `desk/src/essay/EssayTV.tsx:315-349`: opens on the first faulty sentence (`desk/src/tv/keys.ts:157-163`); her sentence in quotes, the end clause underlined with a citron back-arrow (`EssayTV.tsx:432-437`); the problem caption (`:403-414`); THE MOVE and THE PATTERN (`:416-419`), the reading's own fix or the lens's playbook fallback (`:303-307`); the rail (`:351-375`).
6. **Playbook / x-ray** `desk/src/essay/EssayTV.tsx:496`, `:530-561`: an authored three-sentence model paragraph.

AI prompt sources: one surface, ES-READ (below).

## The walk (in character, four questions per step)

1. **Lens home.** *Knows what it wants?* "Choose a lens", and the caption says what the lens reads. In English, but short. *Action visible?* For Eliška, yes. *Connects to goal?* For me, no; I don't know what "Evidence" means for her homework, but she does. *Can tell it worked?* A citron flood on the chosen lens, and the caption says "paste, type or dictate one paragraph on the phone".
2. **Phone Essay tab.** The box already has a paragraph in it ("Many students are tired. Sleep is important..."). *Wants?* "Your paragraph". *Visible?* Yes. *Connects?* Only if Eliška replaces the sample. If she just presses Analyse to try it, the desk reads a paragraph nobody in this house wrote and files it as her reading (finding 6). *Worked?* "the desk is reading it…", then "on the TV".
3. **Waiting.** The TV caption says "The desk is reading your paragraph. It lands here." (`EssayTV.tsx:144`). Fine.
4. **Forensic page.** *Wants?* It shows one of her sentences, in quotes, with an underline and an arrow pointing back, and "Look again · the problem". *Visible?* Up/Down walk the sentences and the rail shows which ones are citron. *Connects?* Yes. This is what I want to see: her sentence pointed at, not replaced. *Worked?* The move inks once a rewrite holds (EM2).
5. **Why → playbook → x-ray.** A full model paragraph, "Many students arrive at school exhausted, and the reason is not laziness but biology..." On the same subject as the sample in the phone box. If her homework is "Should school start later?", she can copy that onto paper (finding 2).

## Scored criteria touched by EM1

| Criterion | Result | Evidence |
|---|---|---|
| C1 — BLOCKER: nothing on the TV or phone supplies a sentence she could hand in | **uncertain (L2)** | Guarded in code: the pattern (`cleanFix`, the 4-word copied-run check, repro 2 sentence 2: a pattern that held her words was dropped) and the move (2-6 words, `rules/essay.ts:180`). **Not guarded in code:** the note (only `cleanNote`, which strips a label; repro 2: a note carrying a ready sentence of new content, and a note that *is* her sentence 1, both pass) and the summary (`essay.ts:85`, taken as is). Prompt-only rules: `NEVER_REWRITE` and `PATTERN_RULE` (`essay.ts:49-51`). It does not forbid supplying new content in a note. The x-ray's authored paragraph is hand-in-ready (finding 2). |
| C4 — from the TV alone she can tell which sentence is the problem | **pass (L1, structural)**; legibility from the sofa waits for L2 | Rail: citron arrows point back for faulty sentences (`EssayTV.tsx:363-372`); her sentence underlined with a back-arrow (`:432-437`); the page opens on the first faulty sentence (`keys.ts:157-163`, repro 3). |

C2, C3, C5 and C6 belong to EM4 (`barbora-43--EM4.md`).

## Module metrics (rubric.md units)

| Metric | L1 value |
|---|---|
| verdict agreement | L2 (needs a reader over a real reading) |
| ghostwriting | L2 (count per reading). L1 coverage: 2 of the 4 shown text types are guarded in code (fix.move, fix.pattern); note and summary are prompt-only, and repro 2 shows both kinds of breach would pass the code. |
| note-verdict consistency | L2; the leading-label part is stripped in code (repro 2: "Faulty: …" became "This is only your feeling…") |
| fix coverage | L2; a dropped fix falls back to the lens's playbook move (repro 2 sentence 2 → fallback; repro 4 for the fallback per lens) |
| time to first verdict | L2 |
| entrance | L2 |
| reliability | L2 |

## Wiring audit — `/api/analyse` (paragraph) → `EssayAnalysis`

Computed user-facing fields (21): `type`, `sentences[].n`, `.text`, `.words`, `.role`, `.para`, `.connectors`, `stats.sentences`, `stats.words`, `stats.avgWords`, `stats.claims`, `stats.evidence`, `stats.links`, `stats.connectors`, `verdicts[].verdict`, `.note`, `.fix.move`, `.fix.pattern`, `.was`, `summary`, `provider`.

| Field | UI hit |
|---|---|
| type, n, text, words, role, para, verdict, note, fix.move, fix.pattern, was | `desk/src/essay/EssayTV.tsx` (Rail `:351-375`, Page `:378-430`, Table `:463-490`) |
| stats.sentences / claims / evidence / connectors / avgWords | `EssayTV.tsx:467` (the table's figures) |
| summary | `EssayTV.tsx:147` (lens home caption, "Last verdict") |
| sentences[].connectors | **0 hits** (only the stats total is drawn) |
| stats.words | **0 hits** |
| stats.links | **0 hits** |
| provider | **0 hits** in essay UI (only Linga's test bar reads a `provider`) |

**Wiring 17/21** (unwired: sentences[].connectors, stats.words, stats.links, provider). `provider` is the one that matters to me. The desk never says on the TV or the phone which engine read the paragraph (see EM4 finding 4).

## Grounding audit — ES-READ (`analyseEssay`, `desk/src/lib/desk/essay.ts:62-86`, `:105-112`)

| Source | In the prompt? | Where |
|---|---|---|
| S1 the learner's own text | yes | `essay.ts:75` (numbered sentences) |
| S2 the lens chosen | yes | `essay.ts:67-69` (name, lens, OBSERVE line) |
| S3 the kind of writing | no | `analyseEssay` takes no kind; the route body has none (`route.ts:15`) |
| S4 the learner's age or stage | yes | `essay.ts:109` `voiceOf("essay", age)` → `:67` `who` + `withManner` (repro 1: band young, "a learner aged 11 to 13") |
| S5 the mode | no | `voiceOf` reads age only (`voice.ts:75-78`) |
| S6 the task the writing answers | no | the session's tasks (an essay task can be added, `page.tsx:655`) never reach `judge()` |
| S7 the learner's history on this desk | no | `s.writing` / history not passed |
| S8 kept memory notes | no | `lib/desk/memory` not read; memory is maths-only (`memory.ts:47-53`) |

**ES-READ 3/8.** Named additions (outside the score): the code's first-pass role per sentence and the counts line (`essay.ts:75-77`). ES-REVISE is not on this journey.

## Executions

Script: `C:/Users/kazda/AppData/Local/Temp/uat-l1-adf0a33d/data/barbora-43/em1-rules.cjs`. Command, from ROOT:

```
DESK_DATA_DIR=C:/Users/kazda/AppData/Local/Temp/uat-l1-adf0a33d/data/barbora-43 node C:/Users/kazda/AppData/Local/Temp/uat-l1-adf0a33d/data/barbora-43/em1-rules.cjs
```

Paragraph: "Many students in my class are always tired. Sleep is really important for teenagers. Schools start too early in the morning. This is bad for everyone." Output (abridged to the lines cited):

```
sentences: 1:claim 2:claim 3:claim 4:claim
1 age 12 band young who: a learner aged 11 to 13 | manner chars 698
2 verdict 1 faulty | note: "This is only your feeling; add a fact, for example: A 2019 survey found 7 in 10 teenagers sleep under eight hours." | fix: {"move":"Back it with a number","pattern":"[A source] found that [a number] of [a group] [what they found]."}
2 verdict 2 faulty | note: "Many students in my class are always tired." | fix: null
2 verdict 3 neutral | note: "Sets the scene." | fix: null
2 verdict 4 faulty | note: "Say what is bad and for whom." | fix: {"move":"Say who it hurts","pattern":"This [harms] [who] because [reason]."}
3 forensicAt -> 0 (index; sentence 1)
4 lens structure -> playbook para | Claim, then evidence, then the link back | ...
4 lens argument -> playbook thesis | Take a side, then say why | ...
4 lens evidence -> playbook para | Claim, then evidence, then the link back | ...
4 lens language -> playbook para | Claim, then evidence, then the link back | ...
5 tooLong(4001): That paragraph is too long to read in one go. Split it in two and send one part at a time (up to 4000 characters).
5 docx: The desk reads .txt and .md files. Pick one of those, or type the paragraph here.
5 czech text tooLong / pieceProblem: null null
6 x-ray: sentences 3 words 14/26/12 roles claim/claim/claim
```

The observations in step 2 are constructed (what a model *might* return), not model output. They show what the code lets through. Note 1 was submitted as "Faulty: This is only…"; the label was stripped and the supplied sentence was kept. Note 2 is Eliška's sentence 1, kept whole on sentence 2. The fix on sentence 2 ("Sleep is really important for [who]…") was dropped by `cleanFix`.

## Findings (scratch keys)

| Key | Severity | Title |
|---|---|---|
| barbora-43-EM1-1 | major | Notes and the summary have no code guard against a supplied sentence (new content or her own) |
| barbora-43-EM1-2 | major | The x-ray shows a hand-in-ready model paragraph on the topic of the phone's own sample paragraph |
| barbora-43-EM1-3 | major | ES-READ 3/8: the reading never sees the assignment, her earlier readings or her notes |
| barbora-43-EM1-4 | minor | The Language lens falls back to the Paragraph structure move when the model's fix is dropped |
| barbora-43-EM1-5 | minor | No language check before the wait (a Czech paragraph goes straight to the model) |
| barbora-43-EM1-6 | minor | The phone's paragraph box is prefilled with a sample, and reading it files a reading as hers |
| barbora-43-EM1-7 | strength | Verdicts and patterns are code's: a pattern holding her words is refused |
| barbora-43-EM1-8 | strength | The TV points at her own sentence (quoted, underlined, arrow back), never a replacement |
| barbora-43-EM1-9 | strength | Too long and the wrong file are refused in a plain sentence before any wait |

## Time saved and grounding

- **~13 min saved per evening · confidence low.** From the Character's Motivation: 30 minutes beside her on a paragraph I cannot judge, against 15 minutes watching plus 2 reading. The upside depends entirely on my trusting that the words are hers, and C1 is uncertain at L1.
- Grounding: **ES-READ 3/8**.

## Voice — Barbora, first person (L1, over the designed experience)

Would I adopt it? Maybe. What I wanted to see is there. Her own sentence sits on the TV in quotes with a line under it and an arrow pointing back, and nothing on that screen is a better sentence than hers. The pattern has gaps in brackets that she has to fill. That one I can check without reading English closely: if it has brackets, she writes it.

What bothers me is the small print I cannot check. The note under her sentence is written by the machine, and nothing in the code stops it from handing her a ready sentence, "for example: A 2019 survey found…". She would copy that, and I would not know. Then she pressed "Why", and the TV showed a whole model paragraph about tired students and school starting too early. That is the same subject as the sample text sitting in the phone box when we opened it. If her teacher sets that essay, the answer is on my television.

Does it fit my world? The words are English and short, which is fine; she reads them to me. Is it worth the wait? Half a minute is nothing next to a tutor's travel. What's missing for my job: one plain line on the TV saying "the desk never writes your sentences: notes point, patterns have gaps", and a guarantee behind it that covers the notes too. Would I tell another parent? I would say it points at the right sentence. I would not yet say it never writes for her.
