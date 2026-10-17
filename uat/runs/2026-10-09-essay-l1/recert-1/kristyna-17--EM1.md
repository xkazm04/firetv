# kristyna-17 × EM1 · What does my paragraph do? (recert-1)

- Character: kristyna-17 (17, Prague gymnázium, writes Czech; out of segment)
- Journey: EM1 What does my paragraph do?
- Cert level: L1 re-walk, code only, no model
- Head 782afdfb
- Recertifies 2026-10-09-essay-l1 at 12592a71
- **Verdict now: L1-conditional.** All four blockers are gone: a Czech paragraph is now refused before any call with "Essay Master reads English writing.", and the splitter and the plan take Czech capitals. What is left is major and minor: the language check lets some Czech through, and a leaked paragraph is still ruled on English word lists.

## Reachable surface (now)

- Phone Essay tab: lens radio, file pick, textarea, Dictate, "Analyse on the TV" (`desk/src/app/phone/page.tsx:705-722`). The copy still says nothing about language (`page.tsx:706`).
- The single-paragraph read: `essayTooLong`, then `paragraphIsEnglish`, then the one-time notice (`desk/src/app/api/analyse/route.ts:144-148`). A refusal reaches the TV as its own caption (`desk/src/lib/rules/essay.ts:145-147`, `desk/src/essay/EssayTV.tsx:148`).
- The language check: function-word shares, floors 6 words / 0.15 English / 0.25 Czech, and a short paragraph that is mostly Czech is refused too (`desk/src/lib/rules/essay.ts:149-175`).
- Splitting: any Unicode capital or „ opens a sentence (`desk/src/lib/rules/essay.ts:35`).
- The reading prompt: voice, lens, numbered sentences, counts (`desk/src/lib/desk/essay.ts:88-103`).
- Verdict rules still on English lists (`desk/src/lib/rules/essay.ts:13-15,258,268-271,302-312`).
- The plan: `planFill` takes `\p{Lu}` (`desk/src/lib/rules/essay.ts:652`); "Read it" posts `planText` as an essay read (`desk/src/tv/keys.ts:445`), so the language check runs at the end.
- Dictate listens in cs-CZ for a `cz` profile (`desk/src/app/phone/recogniserLang.ts:8-9`, `page.tsx:373`).

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| EM1-1 no language check, no word that it reads English (blocker) | fixed | `route.ts:146` refuses a non-English paragraph with `NOT_ENGLISH_LINE` (`essay.ts:138`) before any run; a piece with no English paragraph is refused at `route.ts:109`. Repro: her 5-sentence P1 gives `paragraphIsEnglish false` (English 0.05, Czech 0.74). The advance word on the Essay tab is still absent: new row below | 803c6075 essay: E3, E3-a code decides whether a paragraph is English before any verdict or count |
| EM1-2 splitter joins Č Ď É Í Ň Ó Ř Š Ť Ú Ů Ý Ž „ (blocker) | fixed | `essay.ts:35` splits before `[\p{Lu}"“„]`. Repro: P1 gives 5 sentences (16, 11, 15, 15, 8 words); every Czech capital and „ now splits; "Émile" and "Žižek" cases give 2 | 775cb383 essay: EM-B21 a sentence may open with any Unicode capital or an opening low quote |
| EM1-3 code verdicts rest on English word lists (blocker) | **recurs** (major now, narrowed) | The lists are unchanged (`essay.ts:13-15`, `CONTRAST` `:258`, `wordIn` `[a-z0-9']` `:268-271`, `noTurn` `:305`). Most Czech is refused first (803c6075), so they no longer rule her usual paragraph. A Czech paragraph that passes the check is still ruled by them: repro "My jsme telefony do školy nosili ... avšak my to tak vidíme ..." passes (English 0.36) and sentence 2 is faulty "a turn needs a word like 'but' or 'although'." Frequency drops to low (rank 9) | partial 803c6075 |
| EM1-4 plan refuses Š/Č/Ž with "Start it with a capital" (blocker) | fixed | `essay.ts:652` `/^["“„]?\p{Lu}/u`. Repro: "Školy by neměly...", "Žáci se tak učí sebekázni.", "Émile Zola disagreed." all fill slot 1 | 775cb383 |
| EM1-5 ES-READ 3/8 (major) | **recurs** | `lib/desk/essay.ts:88-103`: the prompt carries `voice.who`, the lens, the numbered sentences and the counts; no task, kind, mode, history or memory. `route.ts:54` reads only the age. The language half is moot: Czech is refused before the prompt | — |
| EM1-6 notes' language left to the model (major) | **recurs** (minor now, narrowed) | The prompt still has no language instruction (`lib/desk/essay.ts:88-96`). It only matters for a Czech paragraph that passes the check, where English notes and code lines land on Czech text. Frequency low, trust med: rank 6 | partial 803c6075 |
| EM1-7 Dictate en-US only, nothing says so (minor) | fixed | `page.tsx:373` `r.lang = recogniserLang(s)`; `recogniserLang.ts:8-9` gives cs-CZ for a `cz` profile, so her Czech dictation comes back as Czech. (The panel still names no language; for a Czech learner dictating English that is L1-daniel-15-EM2-7, not this row) | 5a2135b9 MB-B33 (Mic): the phone's speech recogniser follows the seated learner's school system |
| EM1-8 the prompt calls her "a 15-year-old" (minor) | **recurs** | `desk/src/lib/rules/voice.ts:70` TEEN essay "a 15-year-old"; `:36-38` every known age of 14 or more is teen | — |
| EM1-9 stats.links and stats.words shown nowhere (minor) | **recurs** | `essay.ts:203,207` computed; the Table shows sentences, claims, evidence, connectors, words avg only (`EssayTV.tsx:476`); grep for `.links` / `stats.words` outside rules: 0 hits | — |

## New findings

- **EM1-11 (from the 2026-10-14 lead, still holds) major 9.** The language check lets some Czech through. A paragraph whose Czech-and-English shared function words (my, a, to, do) reach 15% is "English". Repro at HEAD: "Je mi líto, že se do toho nemohu zapojit, ale jak to jen jde, pomáhám doma a ve škole." passes (English 0.158); "My jsme to do školy nosili a nikdy to nebyl problém pro nás ani pro učitele." passes (0.31). Such a paragraph is read under English rules with no word about language (see EM1-3). The short-title half of the lead is fixed: a 3-word Czech title is now refused (`essay.ts:174`, 0a53e75e UD-19).
- **EM1-12 (recert-1 walk) minor 6.** Nothing says before the first send that Essay Master reads English. The Essay tab copy (`page.tsx:706`), the profile blurb (`desk/src/tv/profileRows.ts:20`), the landing line (`desk/src/tv/landingRows.ts:90`) and the plan caption (`EssayTV.tsx:149`) never name the language. On the plan she can write and ink all three Czech slots, and the refusal comes only at "Read it" (`keys.ts:445`, `route.ts:146`). On the way, `planFit` comments from English frames: "Například v naší třídě..." in the evidence slot gets "That reads as claim. This slot wants your evidence..." (`essay.ts:665-670`).

## Notes

- Executed the rules with node (scratch `r1.cjs`, `r3.cjs`): split, language shares, argument/structure/language verdicts, planFill/planFit. No model, no browser.
- The R2/R7/R8/R9 repros from the original walk (structure, evidence, language on Czech text) no longer reach a verdict: each test paragraph is refused by the check (English 0.04 to 0.08). They would still mis-rule if a paragraph leaked.
- `cleanFix` still tokenises `[a-z0-9']` (`essay.ts:228`), so the copied-words guard sees only the ASCII parts of Czech words. Not re-tested here since Czech text no longer reaches the model on the main path.
- C2 is now met only by the refusal itself: she learns it at her first reading, which is the criterion's floor.
