# kristyna-17 × EM1 · What does my paragraph do?

- **Character:** Kristýna, 17 (`uat/characters/essay/kristyna-17.md`), out-of-segment: she writes Czech
- **Journey:** EM1 (`uat/journeys/essay/EM1-what-my-paragraph-does.md`)
- **Cert level:** L1 (theoretical: code read, rules executed with node, no model, no browser)
- **Base commit:** 12592a71
- **Verdict:** **L1-fail**. Three blocker-rank findings. Two of them are confirmed by execution: nothing ever tells her the desk reads English writing (DoD bullet 5, C2), and the code's own sentence count and verdicts on a Czech paragraph are wrong with no word about language (C1, C3). The third, also confirmed, is that the verdict rules depend on English word lists (C4).

## Reachable surface set

Profile: `high-school`, age 17, system `cz`, all three modules on (no `modules` row saved).

| Gate | Result for her | Where |
|---|---|---|
| Mode row | not shown (age < 18); `modeOf` → `family` | `desk/src/tv/profileRows.ts:74`, `desk/src/lib/rules/mode.ts:44-52` (executed: `adultAllowed false`, `modeOf family`) |
| Modules on the landing | maths, english, essay | `desk/src/tv/profileRows.ts:7-10`, `desk/src/tv/landingRows.ts:31-34` (executed: `onModules ["maths","english","essay"]`) |
| Essay Master entry | lens home `essaytype` (not the Workroom) | `desk/src/tv/keys.ts:257-260`, `isAdultHere` `keys.ts:75` (executed: `false`) |
| Phone hand-off | `essaytype`/`forensic`/`essayplan` → the phone's Essay tab (`paste`) | `desk/src/app/phone/panelFor.ts:42,46` |
| Tutor voice | teen band, `who: "a 15-year-old"` | `desk/src/lib/rules/voice.ts:68-77` (executed) |

Reachable: landing → lens home (4 lenses + the plan door) → plan (`essayplan`) → forensic page + Table (Menu) → playbook/x-ray; the phone's Essay tab (paragraph, file pick, dictate, the plan's slot writer).
Unreachable: the Workroom (`keys.ts:259`, Family mode), and any Czech-language reading (no code path; see EM1-1).

## Surface model (EM1)

| # | Affordance | file:line | Behind it | AI prompt sources |
|---|---|---|---|---|
| 1 | Landing, Essay Master card line | `desk/src/tv/landingRows.ts:136-151` | `essayWaiting` → `BLURB_ONE.essay` "See what your paragraph does and what it lacks." | none |
| 2 | Lens home: 4 lenses, captions = `promise` | `desk/src/essay/EssayTV.tsx:120-196`; `desk/src/lib/rules/essay.ts:155-160` | `essay.type` event, `keys.ts:395` | none |
| 3 | Phone Essay tab: lens radio, file pick, textarea (pre-filled with an English sample, `page.tsx:58`), Dictate (`r.lang = "en-US"`, `page.tsx:288`), "Analyse on the TV" | `desk/src/app/phone/page.tsx:588-605`, `:243-255` | `POST /api/analyse {kind:"essay"}` → `route.ts:78-88` → `essayTooLong` → `analyseEssay` (`lib/desk/essay.ts:105-112`) | ES-READ |
| 4 | Splitting, stats, first-pass roles (code) | `desk/src/lib/rules/essay.ts:25-46,143-153` | `splitSentences`, `paragraphStats` | — |
| 5 | The reading (model observes) | `desk/src/lib/desk/essay.ts:62-86` | `text({system, prompt, schema, model:"best"})` | ES-READ: numbered sentences, counts, lens, voice |
| 6 | The verdicts (code rules) | `desk/src/lib/rules/essay.ts:266-316` | `decideVerdicts` over the English `EVIDENCE`/`CONNECTORS`/`CONTRAST` lists (`:13-15,201`) | — |
| 7 | Forensic page: crumb "Sentence n of N · role", note caption, the move, the pattern, 4 actions | `desk/src/essay/EssayTV.tsx:331-428` | `forensicAt` opens on the first faulty sentence (`keys.ts:157-163`) | — |
| 8 | Table (Menu): sentences/claims/evidence/connectors/words avg | `desk/src/essay/EssayTV.tsx:463-488` | `a.stats` | — |
| 9 | The plan: three slots written one sentence at a time on the phone | `EssayTV.tsx:203-242`; `page.tsx:582-586`; `rules/essay.ts:405-431` | `planFill`, `planFit`, `planText` → `POST /api/analyse {kind:"essay"}` (`keys.ts:411`) | ES-READ |

## The walk (in character)

**1 · Landing → Essay Master.** *Knows what it wants?* The card says "See what your paragraph does and what it lacks." Nothing says "English". *Action visible?* Yes, OK on the card. *Connects to goal?* "An analyst for written thoughts" (`profileRows.ts:20`) reads to her as "it reads my slohovka". *Feedback?* The lens home opens. **She has no reason to think Czech is out.**

**2 · Lens home.** She picks Argument, because her teacher says her arguments wander ("Does the paragraph take a side, and does every sentence push the same way?", `rules/essay.ts:157`). The caption: "Paste, type or dictate one paragraph on the phone." Clear.

**3 · Phone Essay tab.** The textarea holds an English sample, "Many students are tired. Sleep is important…" (`page.tsx:58`). The page copy (`page.tsx:589`) says ".txt or .md file, or type, paste or dictate", and nothing about language. She pastes her Czech paragraph. If she presses Dictate and speaks Czech, the recogniser is `en-US` (`page.tsx:288`) and she gets English mush. *Can she tell it worked?* "the desk is reading it…" then "on the TV". **No sentence anywhere says the desk reads English (C2 fail, DoD 5 fail).**

**4 · The reading.** ~25–30 s (env.md W-run 27.6 s). Execution on her paragraph (R1): five Czech sentences become **one 70-word sentence** with first-pass role `evidence`. The crumb reads "Argument · Sentence 1 of 1 · evidence" (`EssayTV.tsx:414`). The rail shows one arrow. Under Argument, a concession turned back with "avšak" is ruled **faulty** by code, and when the model leaves the note empty it gets the code's line *"It takes the other side but never turns back: a turn needs a word like 'but' or 'although'."* (R4). The same paragraph with "but" is **strong**. Under Language, code alone rules it faulty: *"This sentence runs to 70 words; split it."* (R2). That sentence is five sentences she already split. "takže to umí jenom anglicky?", but only if she guesses it; the desk never says it.

**5 · Why it was marked.** The page explains a code verdict that rests on English words she did not use. She can repeat the reason, but it is wrong for her text (C4 fail). The move and the pattern are model-written. If the model writes a Czech pattern, `cleanFix` keeps it (R5). If the pattern copies her words, it is refused (R5, a strength).

**6 · Start from the pattern (the plan).** The slots are English ("Your claim", "the evidence", "the link back"). She writes slot 1, "Školy by neměly telefony úplně zakazovat.", and the desk refuses it: *"Start it with a capital and end it with a full stop."* (R6). The sentence starts with a capital, Š. The same happens to "Česká školní inspekce…" and "Žáci se tak učí sebekázni.". Slot 2, "Například v naší třídě…" ("for example" in Czech), gets the English comment *"That reads as claim. This slot wants your evidence…"*. This is her pet peeve exactly: "being made to guess why it went wrong".

## Scored criteria

| C | Result | Evidence |
|---|---|---|
| C1 (BLOCKER) never a verdict on Czech as if read under English rules without saying so | **fail** (confirmed) | R1: 5 sentences → "Sentence 1 of 1"; R2: code-only Language verdict "runs to 70 words; split it"; R4: argument turn faulty unless English "but"; history line "k of 1 sentence to fix" (`lib/desk/essay.ts:97`) |
| C2 something tells her Essay Master reads English, within the first reading | **fail** (confirmed-absent) | no language check in `route.ts:78-87`; no English-only wording on any essay surface (grep below); the decision exists only in `docs/FAMILY-PHASE-1-PLAN.md:50` |
| C3 Č/Š/Ř/Ž/Ú-opening sentences split as a Czech reader counts | **fail** (confirmed) | R3: splits before A C D E I N O R S T U Y Z only; joins before Č Ď É Í Ň Ó Ř Š Ť Ú Ů Ý Ž and „ |
| C4 feedback in a language she can act on, about her text, not English grammar | **fail** (code part confirmed; model part uncertain) | code CHECKS lines are English (`rules/essay.ts:232-240`) and name English words; the prompt gives no language instruction (`lib/desk/essay.ts:67-77`) |
| C5 no shown text rewrites one of her Czech sentences | **uncertain (L2)**; the pattern guard **passes** by execution | R5: `cleanFix` refuses a pattern that copies 4+ of her words (diacritics included). Notes and summary are guarded only by the prompt (`NEVER_REWRITE`, `lib/desk/essay.ts:49`) |

## Module metrics (rubric units)

| Metric | L1 value | Note |
|---|---|---|
| verdict agreement | **fixture 1/8 overall, 1/6 on faulty** (L1, code verdicts over *faithful simulated observations*, judged against a Czech maturita marker) | R2 language 0/1; R4 argument 0/1; R7 structure 0/3; R8 evidence 1/3. Live: L2 |
| ghostwriting | pattern guard: 0 copies through `cleanFix` in fixtures; notes and summary: L2 | (a) measured by the harness, (b) by a reader |
| note-verdict consistency | L2. Structural risk: when the model's note says her evidence is good and code rules it neutral/faulty (R7), the note and the verdict disagree | |
| fix coverage | L2 | |
| time to first verdict | L2 (W-run 27.6 s for an English paragraph) | |
| curtain | 0 on the landing line (summary's first sentence, or counts) | `landingRows.ts:148` |
| reliability | L2 | |

## Wiring audit: `/api/analyse` kind `essay` (the reading as `s.essay`)

User-facing fields computed: `sentences[].n, text, words, role`; `verdicts[].verdict, note, fix.move, fix.pattern, was`; `summary`; `stats.sentences, claims, evidence, connectors, avgWords, links, words`. Excluded as not user-facing: `provider`, per-sentence `connectors[]` (prompt only).

| Field | UI hit |
|---|---|
| sentences n/text/words/role | `EssayTV.tsx:364,415,414,423` |
| verdict / note / fix / was | `EssayTV.tsx:362,403,418-419,368` |
| summary | `EssayTV.tsx:147`, `landingRows.ts:148` |
| stats.sentences/claims/evidence/connectors/avgWords | `EssayTV.tsx:467` |
| **stats.links** | **0 hits** |
| **stats.words** | **0 hits** |

**Wired 16/18** (unwired: `stats.links`, `stats.words`). The language-statement grep: `grep -rni "english writing\|in english\|reads english\|english only" desk/src/essay desk/src/app/phone desk/src/landing desk/src/tv/profileRows.ts` → only Linga's blurb (`profileRows.ts:19`), nothing for Essay Master.

## Grounding audit: ES-READ (`analyseEssay` → `judge`, `lib/desk/essay.ts:62-79`)

| Source | Reaches the prompt? | Line |
|---|---|---|
| S1 the learner's own text | yes, as numbered code-split "sentences" (merged for Czech) | `essay.ts:64,75` |
| S2 the lens | yes | `essay.ts:67,69` |
| S3 kind of writing | no ("The student's paragraph") | `essay.ts:75` |
| S4 age or stage | yes, as the band only: "a 15-year-old" for a 17-year-old | `essay.ts:67`, `voice.ts:70` |
| S5 mode | no | — |
| S6 the task | no | — |
| S7 history on this desk | no | — |
| S8 kept memory notes | no | — |

**ES-READ 3/8.** Named additions for Kristýna (outside the score), all absent: the text's language (Czech); the school system `cz`, which is on her profile but never passed to `analyseEssay` (`route.ts:23,84`); the exam she is writing for (maturita úvaha, ≥250 words).
ES-REVISE: not on this journey (EM2).

## Executions (all from ROOT, `DESK_DATA_DIR=C:/Users/kazda/AppData/Local/Temp/uat-l1-adf0a33d/data/kristyna-17`, `node - <<'EOF' require('./tools/ts-load.cjs'); const r=require('./desk/src/lib/rules/essay.ts'); … EOF`)

- **R0 gating**: `mode.adultAllowed(p17)`, `modeOf`, `voiceOf('essay', learnerAge(s))`, `keys.isAdultHere(s)` → `adultAllowed false | modeOf family` · `voiceOf essay {"band":"teen","who":"a 15-year-old","manner":""}` · `isAdultHere false`.
- **R1** `r.splitSentences(P1)`, where P1 = "Mobilní telefony by ve škole neměly být zakázány, nicméně … Řada učitelů tvrdí … Žáci, kteří se naučí … Česká školní inspekce v roce 2023 uvedla, že 45 % škol … Úplný zákaz tudíž …" (5 sentences) →
  `SENTENCES 1` · `1 | 70 w | evidence | [] | Mobilní telefony…` · `STATS {"sentences":1,"words":70,"avgWords":70,"claims":0,"evidence":1,"links":0,"connectors":0}`. The prompt gets `1. <all five sentences>  [70 words, first-pass role: evidence]`.
- **R2** `r.decideVerdicts(lens, s, all, obs)` on R1 →
  `structure {job:claim}` → `faulty "This claim has no evidence after it that a reader can check."` · `language {issues:[]}` → `faulty "This sentence runs to 70 words; split it."` · `language {issues:[vague 'nějak', repeated 'telefonů']}` → the same length verdict (the Czech words are dropped).
- **R3** each Czech capital opening a second sentence, `splitSentences("Škola začíná brzy. <C>lovo dál.").length === 2` → `splits before: A C D E I N O R S T U Y Z` · `JOINS before : Č Ď É Í Ň Ó Ř Š Ť Ú Ů Ý Ž „`. P2 (5 sentences: Mobilní/Řada/Proto/Žáci/Ve) → `3 sentences: 1:13w, 2:11w, 3:7w`. English control: "Many critics praise the novel. Émile Zola disagreed with them." → `1`; "…Žižek would call that ideology." → `1`; "…Zizek…" → `2`.
- **R4** argument: "Telefony by ve škole měly zůstat povolené. Někteří učitelé tvrdí, že rozptylují, avšak bez nich se žáci nenaučí sebekázni. Proto je lepší je regulovat." with `{n:2, side:'against', turnsBack:true}` → `faulty "It takes the other side but never turns back: a turn needs a word like 'but' or 'although'."`. Control, "avšak"→"but" → `strong`.
- **R5** `r.cleanFix(fix, own)`: Czech move+pattern "Připusť, pak se vrať" / "Ačkoli [protiargument], [proč tvé tvrzení platí]." → kept · the pattern "Mobilní telefony by ve škole [proč], protože [důkaz]." → `undefined` · "Neměly být zakázány, nicméně [důkaz]." → `undefined`.
- **R6** the plan: `planFill(plan, i, t)` / `planFit(slots, i, t)`: "Školy by neměly telefony úplně zakazovat." → `Start it with a capital and end it with a full stop.` · "Mobilní telefony by ve škole neměly být zakázány." → ok · "Česká školní inspekce v roce 2023 uvedla…" → `Start it with a capital…` · "Například v naší třídě telefony odkládáme do krabice." → ok, fit `That reads as claim. This slot wants your evidence: something a reader can check.` · "Žáci se tak učí sebekázni." → `Start it with a capital…`.
- **R7** structure: "Telefony by ve škole měly zůstat povolené. Podle výzkumu Univerzity Karlovy se žáci s jasnými pravidly soustředí lépe. To ukazuje, že zákaz není nutný." with the model's correct `claim, evidence, link` → `1 faulty "This claim has no evidence after it…"`, `2 neutral`, `3 faulty "This links back to nothing…"`. Control "Podle výzkumu"→"According to research by" → `strong, strong, strong`.
- **R8** evidence on R7's text, `opinion, checkable, opinion` → `faulty, neutral, faulty`.
- **R9** language lens, "Tento problém je hodně důležitý pro celou společnost.": issue word `důležitý` → `neutral`, `hodně` → `neutral`, `problém` → `neutral`, `celou` → `faulty`. `wordIn` tokenises `[a-z0-9']`, so a word with a diacritic is never found (`rules/essay.ts:211-217`).

## Findings (scratch keys)

| Key | Sev | Title |
|---|---|---|
| kristyna-17-EM1-1 | blocker | No language check and no word that Essay Master reads English: a Czech paragraph is read confidently (C2, DoD 5) |
| kristyna-17-EM1-2 | blocker | The splitter joins every sentence that opens with Č Ď É Í Ň Ó Ř Š Ť Ú Ů Ý Ž or „ (5 Czech sentences → "Sentence 1 of 1", 70 words); English text with Émile/Žižek too |
| kristyna-17-EM1-3 | blocker | Code verdicts rest on English word lists: Czech evidence, concessions and vague words are mis-ruled, with English advice ("needs a word like 'but'") |
| kristyna-17-EM1-4 | major | The plan refuses a Czech sentence opening with Š/Č/Ž with a false reason: "Start it with a capital" |
| kristyna-17-EM1-5 | major | ES-READ 3/8: no task, kind, mode, history or memory; her `cz` system and the text's language never reach the prompt |
| kristyna-17-EM1-6 | major (uncertain) | The notes' and summary's language is left to the model: an English prompt over a Czech text, with no instruction |
| kristyna-17-EM1-7 | minor | Dictate is en-US only, and nothing says so |
| kristyna-17-EM1-8 | minor | The prompt calls a 17-year-old "a 15-year-old" (the teen band's fixed words, by design) |
| kristyna-17-EM1-9 | minor | `stats.links` and `stats.words` are computed and never shown |
| kristyna-17-EM1-10 | strength | `cleanFix` refuses a pattern that copies her words, Czech diacritics included; the model never decides a verdict |

## Time saved and grounding

- **Time saved:** ~-5 min (a loss) · confidence medium. The best case for her by design is a plain decline in the first minute, about 0 min. As built she pairs, pastes, waits ~30 s and reads a confident "Sentence 1 of 1". She works out what happened only by suspicion, never because the desk tells her.
- **Grounding:** ES-READ 3/8.

## Voice (first person, L1 over the designed experience)

Adéla showed me this thing with the big arrows and I thought, fine, I'll give it my paragraph about phones, the one Nováková says wanders. Nothing told me not to. The card says "an analyst for written thoughts". My thoughts are written in Czech, so I pasted them. Then the TV says "Sentence 1 of 1", over five sentences, with a bar seventy words long, and tells me to *split it*. I did split it. Five times. Then it says my "avšak" isn't a turn and I need a word like "but". Takže to umí jenom anglicky? Fine, but then say so, on the first screen, in one line, and I'm gone in a minute and not annoyed. What actually makes me angry is that it's so sure of itself: the verdicts look decided, ink and arrows, a bit like a teacher's red pen, and they come from a rule that can't see my capital Š. Then I tried "start from the pattern" and it told me to begin my sentence with a capital. It began with one. Would I use it for the maturita? No. Would I tell Adéla? I'd tell her not to show it to anyone writing Czech. For my job the missing thing isn't even a Czech reading. It's one honest sentence: "Essay Master reads English writing."
