# Recertify, round 9 — L1 run 2026-10-09-essay-l1

Rerun: `2026-10-09-essay-l1/recert-9`, **level L1 only (code re-walk on b7fca776, 2026-10-19)**; no model, no vision, no browser, desk/data untouched, nothing under desk/ or tools/ changed. Every row open in `recert-8/findings.json` (37 rows) was answered `fixed` or `recurs` with current file:line evidence at b7fca776; the language-check rows were executed in a scratch probe outside the repo, and a held-out measure of the language check was added (below). Nothing here is `resolved-verified`: that needs live L2 evidence.

The stamps were written by `uat/driver/recertify.cjs` `writeBack()` into every run that holds an open row of the gap (the parent `findings.json` and `recert-1` to `recert-8`): a recurring row stays open with `recurrence` + 1, `recurred_as`, `recertify_status: recurs` and `recertify_run: 2026-10-09-essay-l1/recert-9`. Its restatement is in `recert-9/findings.json` (`recurs: 2026-10-09-essay-l1/recert-8/<id>`). Rerun ids are positional, so they are written `2026-10-09-essay-l1/recert-9/<id>`.

Head of this round: **b7fca776426f764dd3b06bbfeac02098a4631559** (b7fca776), the Linga recert-11 commit on top of main; its Essay product files are main's. The previous round (recert-8) read 318bbea411e117db22d705a6f15d6d7422119ea8 (318bbea4). Of the 9 commits since, exactly one touches Essay code: **48c75157** (fix(essay): language check round 2), found with `git log 318bbea4..HEAD -- desk/src/essay desk/src/app/phone desk/src/app/drop desk/src/app/api/analyse desk/src/app/api/texts desk/src/lib/desk/essay.ts desk/src/lib/rules desk/src/lib/session desk/src/tv`. It was checked with `git merge-base --is-ancestor 48c75157 HEAD` (ancestor). The other eight touch Linga code and the uat/docs records only.

## Counts

| | Rows | By severity |
| --- | --- | --- |
| Open before | 37 | 0 blocker, 12 major, 19 minor, 6 polish |
| Fixed (L1) | 0 | 0 blocker, 0 major, 0 minor, 0 polish |
| Recurs | 37 | 0 blocker, 12 major, 19 minor, 6 polish (severity now) |
| New | 0 | 0 blocker, 0 major, 0 minor, 0 polish |
| Open after | 37 | 0 blocker, 12 major, 19 minor, 6 polish |

OPEN.md Essay 37 -> 37 (whole file unchanged in length); the Linga and Math sections are byte for byte as the recert-11 commit left them (checked with diff against the file before the rewrite; OPEN.md was rewritten by `ledger.cjs writeStatus()`, the call `finishLedger` makes). No row is fixed, so there is no fixing commit to cite; the one commit that moves rows, 48c75157, narrows three and closes none.

## Pair verdicts now

| Pair | At recert-8 | Now | Walk |
| --- | --- | --- | --- |
| barbora-43 EM1 | L1-conditional | L1-conditional | [barbora-43--EM1.md](recert-9/barbora-43--EM1.md) |
| barbora-43 EM4 | L1-conditional | L1-conditional | [barbora-43--EM4.md](recert-9/barbora-43--EM4.md) |
| daniel-15 EM2 | L1-conditional | L1-conditional | [daniel-15--EM2.md](recert-9/daniel-15--EM2.md) |
| daniel-15 EM3 | L1-conditional | L1-conditional | [daniel-15--EM3.md](recert-9/daniel-15--EM3.md) |
| eliska-12 EM1 | L1-conditional | L1-conditional | [eliska-12--EM1.md](recert-9/eliska-12--EM1.md) |
| eliska-12 EM2 | L1-conditional | L1-conditional | [eliska-12--EM2.md](recert-9/eliska-12--EM2.md) |
| helena-46 EM1 | L1-conditional | L1-conditional | [helena-46--EM1.md](recert-9/helena-46--EM1.md) |
| helena-46 EM5 | L1-fail | L1-fail | [helena-46--EM5.md](recert-9/helena-46--EM5.md) |
| kristyna-17 EM1 | L1-conditional | L1-conditional | [kristyna-17--EM1.md](recert-9/kristyna-17--EM1.md) |
| kristyna-17 EM3 | L1-conditional | L1-conditional | [kristyna-17--EM3.md](recert-9/kristyna-17--EM3.md) |

No pair changed its verdict. helena-46 EM5 stays L1-fail on `2026-10-09-essay-l1/recert-9/L1-helena-46-EM5-1` (a kept email's sentences are on the TV; major, rank 12), which no commit touched.

## Fixed (L1: the fix has landed in code; not resolved-verified)

None.

## Narrowed (still open): the language-check rows

48c75157 changed `englishReading` and `paragraphIsEnglish` (desk/src/lib/rules/essay.ts:150-200): Polish, French and Spanish function-word lists (:162-166), a wider plain-Czech list (:154), Slavic endings (:170), and the decision is now "another language's signal is at or over 0.25 AND over the English share" (:200), so English words mixed into a foreign paragraph no longer rescue it; a paragraph under 6 words is refused when 40% or more of its words read as any of the five (:198). Each row was re-read by hand (its cites sit in the rewritten hunks) and the fresh probe below was run at b7fca776.

| Finding | Restated as | What the commit changed | What stays open |
| --- | --- | --- | --- |
| 2026-10-09-essay-l1/recert-8/L1-kristyna-17-EM1-5 | 2026-10-09-essay-l1/recert-9/L1-kristyna-17-EM1-5 | The rule is no longer English by default; Czech with diacritics: 30 of 30 refused in the fresh probe. | Plain-letter Czech: 24 of 30 refused (6 pass, e.g. "Moje sestra chodi do osme tridy a kazde rano vstava v sest hodin."). Czech overall 54 of 60 = **0.90**, below the row's acceptance (0.95 on 50+). tools/essay-rules-test.cjs shows 36/36 and 18 plain, but that is the set the rule was tuned on. |
| 2026-10-09-essay-l1/recert-8/L1-kristyna-17-EM1-1 | 2026-10-09-essay-l1/recert-9/L1-kristyna-17-EM1-1 | Fewer Czech paragraphs clear the check, so fewer reach the English word lists (0 of 30 with diacritics; 6 of 30 plain). | A paragraph that clears it is still ruled on EVIDENCE/CONNECTORS/LINK (rules/essay.ts:13-15), CONTRAST (:342) and wordIn [a-z0-9'] (:355-357). The acceptance (refused, or ruled in its own language) is not met for plain-letter Czech and short Czech. |
| 2026-10-09-essay-l1/recert-8/L1-helena-46-EM1-4 | 2026-10-09-essay-l1/recert-9/L1-helena-46-EM1-4 | Short paragraphs: the 40% rule now covers Polish, French and Spanish too. | Short Czech 7 of 16 refused (with diacritics 5 of 8, plain 2 of 8), German 6 of 10 ("Ich bin müde.", "Kannst du mir helfen?", "Die Schule beginnt jeden Morgen um acht Uhr." pass), Polish 1 of 2, Italian 0 of 1, Dutch 0 of 1. The acceptance (a non-English paragraph gets the desk's sentence before any model call) is not met. |
| 2026-10-09-essay-l1/recert-8/L1-kristyna-17-EM1-3 | 2026-10-09-essay-l1/recert-9/L1-kristyna-17-EM1-3 | None; its cite :178-184 sat in the rewritten hunk and was re-read by hand (now :194-200). | The 6 leaked plain-letter Czech paragraphs reach the model, and no language line was added to the prompt (desk/essay.ts:102-112). |

English was not refused anywhere: 0 of 20 in the fresh probe and 0 of 34 held-out, so the narrowing cost no false refusal this measure can see.

## Held-out measure of the language check

`tools/essay-rules-test.cjs` is the probe set the rule was written and tuned on (E3-a, E3-d: 36 Czech, 18 plain Czech, 12 other-language and 16 English cases). Its 1.00 in 48c75157 is therefore a self-tuned figure: it shows the rule fits its own cases, not that it generalises. This measure is not self-tuned. It runs the product's own `paragraphIsEnglish` (desk/src/lib/rules/essay.ts at b7fca776, loaded with `tools/ts-load.cjs`, no model) from a scratch script outside the repo over the learner text recorded under `uat/runs/*essay*/`: the Sam W-run in `2026-10-09-essay-w-run/results.json` and the learner text the five walkers quoted in the ten `2026-10-09-essay-l1/*--EM*.md` walks. 45 distinct texts were recorded; the 8 that also appear in tools/essay-rules-test.cjs are set aside, leaving **37 held-out texts**. All of it is simulated-learner text (a model-played Sam, walker-written repros), not real learners; desk/data was not opened. Every item and its signals are in `recert-9/heldout.json`.

| | Held out (not in tools/) | Also counting the 8 shared with tools/ |
| --- | --- | --- |
| (a) English wrongly refused | **0 of 34** (7 multi-sentence paragraphs, 27 single sentences) | 0 of 38 |
| (b) Non-English passed as English | **0 of 3** Czech (all single sentences) | 0 of 7 Czech |
| German or other-language text recorded | 0 | 0 |

Examples. (a) No English text was refused, including the ones with few English function words: "Sometimes my teacher lets us use phones." (English share 0), "Walking to school makes children happier." (0), "Software like Quizlet helps us." (0), "In my opinion phones should not be banned completely." (Czech signal 0.11). (b) The three held-out Czech texts were all refused: "Mobilní telefony by ve škole neměly být zakázány." (Czech 0.75), "Například v naší třídě telefony odkládáme do krabice." (0.50), "Tento problém je hodně důležitý pro celou společnost." (0.75). None leaked.

**What this does not show.** The recorded set holds no foreign-language paragraph outside the tools/ probe: both Czech paragraphs of the walks are literals of tools/essay-rules-test.cjs, the held-out Czech is three sentences with diacritics, and no German, Polish, French or Spanish text, no Czech typed without diacritics and no short foreign text was ever recorded. So (b) is 0 of 3 on a base too small to read as a rate, and the weak spots the rows name (plain-letter Czech, short text, German) are not covered by held-out evidence at all. The English side is better covered (34 texts) and clean.

**Fresh probe (not held-out).** To cover those spots, a second corpus was written for this round (`recert-9/heldout.json`, `freshProbe`): text written by the walker after reading the rule, none of it in tools/essay-rules-test.cjs and none taken from the word lists. It is fresh to the repo, not independent of the person tuning the rule, so read it as a probe, not as held-out evidence.

| Fresh probe at b7fca776 | Refused / passed as English |
| --- | --- |
| Czech paragraphs with diacritics (30) | 30 refused, 0 leak |
| The same 30 folded to plain letters | 24 refused, **6 leak** ("Moje sestra chodi do osme tridy a kazde rano vstava v sest hodin.", "Muj nejlepsi kamarad hraje fotbal a kazdy vikend ma zapas.", "Skolni uniformy by podle me zhorsily naladu v tride.") |
| Czech, 60 paragraphs together | 54 refused = **0.90** (the row asks 0.95 on 50+) |
| Short Czech under 6 words (8 with diacritics, 8 plain) | 5 of 8 and 2 of 8 refused; 9 leak ("To je pravda.", "Děkuji za pomoc.", "Ja nevim.", "Mam hlad a zizen.") |
| German (10) | 6 refused; 4 leak ("Die Schule beginnt jeden Morgen um acht Uhr.", "Meine Schwester geht gern ins Kino und liest viele Bücher.", "Ich bin müde.", "Kannst du mir helfen?") |
| Slovak 2, French 2, Spanish 2, Polish 2, Italian 1, Dutch 1 | all Slovak, French and Spanish refused; Polish 1 of 2 ("Moja siostra chodzi do szóstej klasy i bardzo lubi matematykę." leaks); Italian and Dutch have no list and pass |
| English (20, built to collide with the shared function words: "Ten to one, ...", "To be honest, ...", "My dog ...", four-word sentences with no function word) | **0 refused** |

Against recert-8 (a different, hand-written corpus at 318bbea4: Czech 0.716, plain Czech 16 of 35, German 4 of 10, Polish 0 of 4, French 1 of 4, Spanish 2 of 4, English 0 of 16), 48c75157 clearly narrowed the three rows: plain Czech is now 24 of 30, German 6 of 10, French and Spanish 2 of 2. The corpora differ, so the figures are not a before and after of one set.

## Still open (no commit touched what they cite)

The other 33 rows recur unchanged. Each cites files no commit since 318bbea4 touched, or cites desk/src/lib/rules/essay.ts, which 48c75157 changed only above line 200: every cite below it moved by +17 and was compared with the old line (same content each time); cites above the hunks did not move; the ones in the rewritten hunks are the language rows above. The full table, with severity, rank and the restated id of each row, is `recert-9/findings.json`; the walk of each pair is `recert-9/<pair>.md`.

## Regressed

None. A regression would be a pair whose code verdict dropped, or a row that was fixed and came back; the rows fixed at earlier rounds were not re-walked. The rules suite was not re-run for this round beyond the merge gate; tools/essay-rules-test.cjs was not touched.

## New findings for the next drain

None filed. The gaps the probes show are the open acceptances of the narrowed rows (plain-letter Czech, short Czech, German, Polish/Italian/Dutch), so they are restated there rather than filed again. One thing for the drain: the held-out set cannot grade those gaps because nobody recorded foreign-language text for it; a recorded set of real or live-model-played Czech (with and without diacritics), German and short texts would make the language check measurable without a self-tuned probe.

## Method

Rows were answered from the code at b7fca776. A cite is a line of recert-8's evidence re-mapped through `git diff -U0 318bbea4 b7fca776` per file: only desk/src/lib/rules/essay.ts changed in Essay code. The scratch scripts (cite re-mapper, fresh probe, held-out run, generator) lived outside the repo and loaded the desk code with `tools/ts-load.cjs`; their outputs are in `recert-9/heldout.json` and in each row's evidence. The ledger was read before any stamp was written and the rerun's own rows were skipped, as `finishLedger` does; stamps were written once (parent 26, recert-1 34, recert-2 34, recert-3 35, recert-4 36, recert-5 36, recert-6 37, recert-7 37, recert-8 37 Essay rows: 312 rows, 0 fixed, 312 recurs).

## Confounded - do not read as a regression

| Confound | Covers | Run pair |
| --- | --- | --- |
| Walker and instrument are the same kind as recert-8 (an L1 code walk, by the builder session itself); the product moved in one Essay file (desk/src/lib/rules/essay.ts, 48c75157), which is why three rows narrowed. The fresh probe is written by the walker and is not held-out; the held-out set is recorded text but of simulated learners, and too small for the foreign side. | all rows | 2026-10-09-essay-l1/recert-8 -> 2026-10-09-essay-l1/recert-9 |
