# L1 recertify, round 10, of the Essay Master run 2026-10-09-essay-l1 (2026-10-19)

A code-only L1 re-walk of the 10 pairs of `uat/runs/2026-10-09-essay-l1` that still had an open row, on 6b189791 (`6b1897912bab71ae7197ad4064f40fff5db2e1e9`, local main), plus a rerun of the held-out measure of the Essay language check against d051b6f2. No model call, no vision call, no browser; nothing under `desk/`, `tools/`, `phone/` or `desk/data/` changed. Full report: `uat/runs/2026-10-09-essay-l1/recertify-10.md`; data: `recert-10/`.

## Counts: Essay before and after

| | Blocker | Major | Minor | Polish | Total |
| --- | --- | --- | --- | --- | --- |
| Open before (recert-9) | 0 | 12 | 19 | 6 | **37** |
| Fixed | 0 | 0 | 3 | 1 | **4** |
| Recur (severity now) | 0 | 12 | 16 | 5 | **33** |
| New | 0 | 0 | 0 | 0 | **0** |
| Open now | 0 | 12 | 16 | 5 | **33** |

OPEN.md Essay 37 -> 33; total open 282 -> 270 once both modules are recorded (the other module's note holds its own half). The Linga section of OPEN.md is byte for byte unchanged.

## Rows now fixed, and the commit that fixed each

| Row | Sev. | Fixed by | What the code does now |
| --- | --- | --- | --- |
| `L1-eliska-12-EM1-3` stats.links (PEEL's L) and stats.words are computed for every reading and shown nowhere | polish | **176f04f0** | desk/src/essay/EssayTV.tsx:477 now builds figs as sentences, words (a.stats.words), claims, evidence, links (a.stats.links), connectors, words avg, so the table shows links beside claims and evidence, and the words total; stats are computed at desk/src/lib/rules/essay.ts:286-287. Fixed by 176f04f0 (ancestor of HEAD); essay-spec… |
| `L1-eliska-12-EM2-3` Refusal 'In the paragraph that would not stay one sentence.' is opaque; a dictated mid-pa… | minor | **645fdc94** | revise() (desk/src/lib/rules/essay.ts:775-791) tidies dictated text first: capitalises a lower-case first letter (:780) and adds a full stop when none of . ! ? ends it (:781), then checks; the refusal is now 'Sentence N would run into the sentence next to it. Start it with a capital letter and end it with a full stop.' (:790), … |
| `L1-kristyna-17-EM1-4` stats.links and stats.words are computed for every reading and shown nowhere | minor | **176f04f0** | 176f04f0 (ancestor of HEAD) changed the Table figures: desk/src/essay/EssayTV.tsx:477 now lists sentences, words, claims, evidence, links, connectors, words avg, drawn by the em-figs row at :482. stats.links is computed at desk/src/lib/rules/essay.ts:287 and now reaches the screen, which is the row's acceptance (links shown on … |
| `L1-kristyna-17-EM3-1` A plain title line becomes paragraph 1 of the piece, costs a model call, and can become '… | minor | **cae23442** | cae23442 (ancestor of HEAD) added readTitle/titleOf (desk/src/lib/rules/essay.ts:104-131, TITLE_MAX_WORDS 12): a short unpunctuated first line above more text is the title and is left out of paragraphsOf (desk/src/lib/rules/essay.ts:85-87) and splitSentences (:29-30). Executed: title line, blank line, a 2-sentence paragraph, bl… |

Each fixing commit was checked an ancestor of HEAD (`git merge-base --is-ancestor`). "Fixed" is L1 evidence: the code at 6b189791 meets the row's acceptance; `resolved-verified` still needs live L2.

## Narrowed, still open

| Row | Commit | What is still missing |
| --- | --- | --- |
| `L1-daniel-15-EM3-2` | cae23442 | The title is not shown as a title anywhere, is not passed to the reading prompt as the task, and a question line followed by a paragraph still stays a paragraph (by design). |
| `L1-daniel-15-EM3-4` | 176f04f0 | provider is still drawn nowhere, and /api/texts GET noticed/notice has no reader (the shelf does not say whether the notice is accepted). |
| `L1-eliska-12-EM2-2` | 32ffdf92 | The instruction ('rewrite it in your own words on the phone's Essay tab, then analyse again') is not shown on the TV page itself after pressing Rewrite on my phone; only the phone chip lights and the bench status bar carries the text. |
| `L1-helena-46-EM1-2` | 176f04f0 | The engine that read the text (provider) is still shown nowhere and sentences[].connectors is still drawn nowhere; the acceptance names the engine (her notice names Claude). |
| `L1-helena-46-EM1-4` | d051b6f2 | Fresh plain-letter Czech (6 of 42 leak), short plain Czech (4 of 9 leak, e.g. "Mam rad hory.", "Bydlim ve meste u reky.") and a short Polish line still go to the model; the prior leaks are refused only because their words were added to the lists. |
| `L1-kristyna-17-EM1-1` | d051b6f2 | About 9 percent of fresh Czech paragraphs (14 percent of plain-letter ones) still clear the language check and are ruled under English word lists; the rules do not take the text language. |
| `L1-kristyna-17-EM1-3` | d051b6f2 | No language instruction in the prompt and no page-level single language; a leaked Czech paragraph still gets notes in whatever language the model picks. |
| `L1-kristyna-17-EM1-5` | d051b6f2 | Fresh Czech refusal is 0.909 (plain-letter 0.857), under 0.95; the former 0.90 corpus passes only because its words were added to CZECH_WORDS (tools/essay-rules-test.cjs:1938-1940). |

## Per pair

| Pair | Open before | Fixed | Recur | New | Open now | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| barbora-43 EM1 | 2 | 0 | 2 | 0 | 2 | L1-conditional |
| barbora-43 EM4 | 2 | 0 | 2 | 0 | 2 | L1-conditional |
| daniel-15 EM2 | 2 | 0 | 2 | 0 | 2 | L1-conditional |
| daniel-15 EM3 | 5 | 0 | 5 | 0 | 5 | L1-conditional |
| eliska-12 EM1 | 6 | 1 | 5 | 0 | 5 | L1-conditional |
| eliska-12 EM2 | 3 | 1 | 2 | 0 | 2 | L1-conditional |
| helena-46 EM1 | 5 | 0 | 5 | 0 | 5 | L1-conditional |
| helena-46 EM5 | 4 | 0 | 4 | 0 | 4 | L1-fail |
| kristyna-17 EM1 | 6 | 1 | 5 | 0 | 5 | L1-conditional |
| kristyna-17 EM3 | 2 | 1 | 1 | 0 | 1 | L1-conditional |

## Held-out measure of the language check (d051b6f2, language check round 3)

d051b6f2 reports plain Czech 27 of 30 = 0.90 (target 0.95 not met) on `tools/essay-heldout-r3.json`, a corpus written in 3988b75c before the rule change; the rerun reproduces it exactly. Three measures at 6b189791 (scratch scripts outside the repo, items in `recert-10/heldout.json`):

| Measure | English wrongly refused | Foreign text passed as English |
| --- | --- | --- |
| Recorded learner text of recert-9 (37 held out of tools/essay-rules-test.cjs) | 0 of 34 | Czech 0 of 3 (no German or plain-letter text recorded) |
| tools/essay-heldout-r3.json (written before d051b6f2) | 0 of 30 | plain Czech 3 of 30 (0.90 refused), short Czech 4 of 10, German 0 of 10, Italian 0 of 4, Dutch 0 of 4, Polish 0 of 4 |
| Fresh probe of this round (written after reading the rule, not tuned on) | 0 of 16 | Czech paragraphs 6 of 66 (0.909 refused; plain-letter 6 of 42), short Czech 5 of 18, German 0 of 10, Polish 1 of 4, Italian and Dutch 0 of 4 |

The recert-9 fresh-probe leaks (21 paragraphs) are all refused now, but d051b6f2 put exactly those into the word lists and pins them (tools/essay-rules-test.cjs:1938-1940): that is the rule remembering its tuning set. The Czech acceptance (0.95 on 50+) is met on neither non-tuned corpus, so L1-kristyna-17-EM1-5 stays open; L1-kristyna-17-EM1-1, L1-kristyna-17-EM1-3 and L1-helena-46-EM1-4 are narrowed and stay open (a Czech paragraph that clears the check is still ruled on English word lists with a prompt that names no language; short plain Czech and a short Polish line still go to the model). English was not refused anywhere.

## What the next round needs

- A recorded set of real or live-model-played Czech (with and without diacritics), German and short texts would make the language check measurable without a probe the rule's author has seen; the held-out set still cannot grade the foreign side.
- The rows with a split acceptance are the cheapest next fixes: L1-daniel-15-EM3-2 (the title never reaches the reading prompt as the task), L1-daniel-15-EM3-4 and L1-helena-46-EM1-2 (provider and connectors are computed and drawn nowhere), L1-eliska-12-EM2-2 (the 'Rewrite on my phone' instruction lands only on the bench status bar).
- helena-46 EM5 stays L1-fail on L1-helena-46-EM5-1 (a kept email's sentences are on the TV), which nothing touched.