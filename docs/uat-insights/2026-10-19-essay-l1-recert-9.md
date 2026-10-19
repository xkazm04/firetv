# L1 recertify, round 9, of the Essay Master run 2026-10-09-essay-l1 (2026-10-19)

A code-only L1 re-walk of the 10 pairs of `uat/runs/2026-10-09-essay-l1` that still had an open row, on b7fca776 (`b7fca776426f764dd3b06bbfeac02098a4631559`), plus a held-out measure of the Essay language check. No model call, no vision call, no browser; nothing under `desk/`, `tools/` or `desk/data/` changed. Full report: `uat/runs/2026-10-09-essay-l1/recertify-9.md`; data: `recert-9/`.

The only Essay-code commit since recert-8 (318bbea4) is **48c75157**, "language check round 2" (checked an ancestor of HEAD with `git merge-base --is-ancestor`). Its commit message reports 1.00 on its own probe set in `tools/essay-rules-test.cjs`; that set is the one the rule was tuned on, so the recert measures the check on other text.

## Counts: Essay before and after

| | Blocker | Major | Minor | Polish | Total |
| --- | --- | --- | --- | --- | --- |
| Open before (recert-8) | 0 | 12 | 19 | 6 | **37** |
| Fixed | 0 | 0 | 0 | 0 | **0** |
| Recur (severity now) | 0 | 12 | 19 | 6 | **37** |
| New | 0 | 0 | 0 | 0 | **0** |
| Open now | 0 | 12 | 19 | 6 | **37** |

- No row is fixed, so no fixing commit is cited. 48c75157 narrows three rows (kristyna-17 EM1-5, EM1-1 and helena-46 EM1-4) and touches the check behind a fourth (kristyna-17 EM1-3); none closes.
- OPEN.md Essay 37 -> 37 (whole file 489 lines -> 489); the Linga and Math sections are byte for byte as the recert-11 commit left them.

## Per pair

| Pair | Open before | Fixed | Recur | New | Open now | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| barbora-43 EM1 | 2 | 0 | 2 | 0 | 2 | L1-conditional |
| barbora-43 EM4 | 2 | 0 | 2 | 0 | 2 | L1-conditional |
| daniel-15 EM2 | 2 | 0 | 2 | 0 | 2 | L1-conditional |
| daniel-15 EM3 | 5 | 0 | 5 | 0 | 5 | L1-conditional |
| eliska-12 EM1 | 6 | 0 | 6 | 0 | 6 | L1-conditional |
| eliska-12 EM2 | 3 | 0 | 3 | 0 | 3 | L1-conditional |
| helena-46 EM1 | 5 | 0 | 5 | 0 | 5 | L1-conditional |
| helena-46 EM5 | 4 | 0 | 4 | 0 | 4 | L1-fail |
| kristyna-17 EM1 | 6 | 0 | 6 | 0 | 6 | L1-conditional |
| kristyna-17 EM3 | 2 | 0 | 2 | 0 | 2 | L1-conditional |

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

## What the language-check rows need

- kristyna-17 EM1-5 / EM1-1: plain-letter Czech is the gap (24 of 30 refused; 0.90 over 60 against 0.95). The lever is the same as at recert-8: a Czech word and ending list that grows with real text. A recorded set of Czech typed without diacritics would let the next round measure it without a self-tuned probe.
- helena-46 EM1-4: short text and German (6 of 10) still reach the model; Italian and Dutch have no list.
- No English was refused in either measure (0 of 34 held-out, 0 of 20 fresh).
