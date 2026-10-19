# Recertify, round 8 — L1 run 2026-10-09-essay-l1

Rerun: `2026-10-09-essay-l1/recert-8`, **level L1 only (code re-walk on 318bbea4, 2026-10-19)**; no model, no vision, no browser, desk/data untouched, nothing under desk/ or tools/ changed. Every row open in `recert-7/findings.json` (37 rows) was answered `fixed` or `recurs` with current file:line evidence at 318bbea4; the three rows 2ab0130f names were executed in a scratch probe outside the repo. Nothing here is `resolved-verified`: that needs live L2 evidence.

The stamps were written by `uat/driver/recertify.cjs` `writeBack()` into every run that holds an open row of the gap (the parent `findings.json` and `recert-1` to `recert-7` `findings.json`): a recurring row stays open with `recurrence` + 1, `recurred_as`, `recertify_status: recurs` and `recertify_run: 2026-10-09-essay-l1/recert-8`. Its restatement is in `recert-8/findings.json` (`recurs: 2026-10-09-essay-l1/recert-7/<id>`). Rerun ids are positional, so they are written `2026-10-09-essay-l1/recert-8/<id>`.

Head of this round: **318bbea411e117db22d705a6f15d6d7422119ea8** (318bbea4), the Linga recert-10 commit on top of main 40169894; its product files are main's. The previous round (recert-7, commit e0bfc3af) read 5096c0cecc51d8f79594bc9381136a0c800f4b29 (5096c0ce). One commit touches Essay code since: 2ab0130f (see *Method*). It was checked with `git merge-base --is-ancestor 2ab0130f HEAD`.

## Counts

| | Rows | By severity |
| --- | --- | --- |
| Open before | 37 | 0 blocker, 12 major, 19 minor, 6 polish |
| Fixed (L1) | 0 | 0 blocker, 0 major, 0 minor, 0 polish |
| Recurs | 37 | 0 blocker, 12 major, 19 minor, 6 polish (severity now) |
| New | 0 | 0 blocker, 0 major, 0 minor, 0 polish |
| Open after | 37 | 0 blocker, 12 major, 19 minor, 6 polish |

OPEN.md Essay 37 -> 37 (whole file 283 -> 283); the Linga and Math sections are byte for byte as the recert-10 commit left them. The three rows 2ab0130f names are narrowed, not closed.

## Pair verdicts now

| Pair | At recert-7 | Now | Walk |
| --- | --- | --- | --- |
| barbora-43 EM1 | L1-conditional | L1-conditional | [barbora-43--EM1.md](recert-8/barbora-43--EM1.md) |
| barbora-43 EM4 | L1-conditional | L1-conditional | [barbora-43--EM4.md](recert-8/barbora-43--EM4.md) |
| daniel-15 EM2 | L1-conditional | L1-conditional | [daniel-15--EM2.md](recert-8/daniel-15--EM2.md) |
| daniel-15 EM3 | L1-conditional | L1-conditional | [daniel-15--EM3.md](recert-8/daniel-15--EM3.md) |
| eliska-12 EM1 | L1-conditional | L1-conditional | [eliska-12--EM1.md](recert-8/eliska-12--EM1.md) |
| eliska-12 EM2 | L1-conditional | L1-conditional | [eliska-12--EM2.md](recert-8/eliska-12--EM2.md) |
| helena-46 EM1 | L1-conditional | L1-conditional | [helena-46--EM1.md](recert-8/helena-46--EM1.md) |
| helena-46 EM5 | L1-fail | L1-fail | [helena-46--EM5.md](recert-8/helena-46--EM5.md) |
| kristyna-17 EM1 | L1-conditional | L1-conditional | [kristyna-17--EM1.md](recert-8/kristyna-17--EM1.md) |
| kristyna-17 EM3 | L1-conditional | L1-conditional | [kristyna-17--EM3.md](recert-8/kristyna-17--EM3.md) |

No pair changed its verdict. helena-46 EM5 stays L1-fail on `2026-10-09-essay-l1/recert-8/L1-helena-46-EM5-1` (a kept email's sentences are on the TV; major, rank 12), which no commit touched.

## Fixed (L1: the fix has landed in code; not resolved-verified)

None.

## Narrowed (still open)

2ab0130f (fix(essay): language check refuses Czech built on shared function words, short plain Czech and German) names three rows. Each moved, none closed:

| Finding | Restated as | What the commit changed | What stays open |
| --- | --- | --- | --- |
| 2026-10-09-essay-l1/recert-7/L1-kristyna-17-EM1-5 | 2026-10-09-essay-l1/recert-8/L1-kristyna-17-EM1-5 | Words shared with Czech (my, a, to, do, by, so, on…) no longer count toward the English share (SHARED_WITH_CZECH, rules/essay.ts:150), the Czech list grows by about 60 words (:156), a German list joins (:158-159). The function-word-heavy paragraphs of the row are refused: 4 of 4 long ones in the probe, and the three corpus cases of tools/essay-rules-test.cjs ('E3-a: Czech made of words shared…'). | The rule still says English by default: 6+ words are refused only at a Czech or German signal of 0.25 (:183), and plain Czech off the list reads 0.13-0.17. On a 74-paragraph Czech probe corpus 53 are refused, **0.716**, below the row's acceptance (0.95 on 50+). All 21 that pass have an English share of 0: e.g. "Hlavni postava je odvazna a chytra." (czech 0.17), "V nasi tride je dvacet pet zaku." (0.14). |
| 2026-10-09-essay-l1/recert-7/L1-kristyna-17-EM1-1 | 2026-10-09-essay-l1/recert-8/L1-kristyna-17-EM1-1 | Fewer Czech paragraphs clear the check, so fewer reach the English word lists. | A paragraph that clears it is still ruled on EVIDENCE/CONNECTORS/LINK (rules/essay.ts:13-15), CONTRAST (:325) and wordIn [a-z0-9'] (:338-340): 21 of 74 in the probe would be. The acceptance (refused, or ruled in its own language) is not met. |
| 2026-10-09-essay-l1/recert-7/L1-helena-46-EM1-4 | 2026-10-09-essay-l1/recert-8/L1-helena-46-EM1-4 | A paragraph under 6 words is refused when 2 or more of its words, 40% or more, read as Czech or German (:182); German is checked. | Short Czech refused 11 of 18, Czech without diacritics 16 of 35, German 4 of 10 ("Die Schule sollte später beginnen.", "Ich bin müde.", "Kannst du mir helfen?" go to the model). Polish 0 of 4, French 1 of 4, Spanish 2 of 4 read as English. The acceptance (a non-English paragraph gets the desk's sentence before any model call) is not met. |

No English probe was refused (0 of 16, including "To be or not to be.", "So do I.", "A to Z.", "My dog.", "Ten to one."), and the repo's E3-a English corpus stays green, so the narrowing cost no false refusal that the probe or the suite shows.

## Still open

| Finding | Restated as | Sev. now | Title | What the code does now |
| --- | --- | --- | --- | --- |
| 2026-10-09-essay-l1/recert-7/L1-barbora-43-EM1-1 | 2026-10-09-essay-l1/recert-8/L1-barbora-43-EM1-1 | major · rank 9 | The x-ray shows a hand-in-ready model paragraph on the topic of the phone's own sample paragraph | cited lines re-found at 318bbea4; no commit since 5096c0ce touched the cited files |
| 2026-10-09-essay-l1/recert-7/L1-barbora-43-EM1-2 | 2026-10-09-essay-l1/recert-8/L1-barbora-43-EM1-2 | major · rank 9 | ES-READ grounding: the reading still never sees her earlier readings or notes, and no client sends t… | cited lines re-found at 318bbea4; no commit since 5096c0ce touched the cited files |
| 2026-10-09-essay-l1/recert-7/L1-barbora-43-EM4-1 | 2026-10-09-essay-l1/recert-8/L1-barbora-43-EM4-1 | major · rank 8 | A paragraph-only evening's delete is out of reach when the TV is on a sentence or the plan: the shel… | cited lines re-found at 318bbea4; no commit since 5096c0ce touched the cited files |
| 2026-10-09-essay-l1/recert-7/L1-barbora-43-EM4-2 | 2026-10-09-essay-l1/recert-8/L1-barbora-43-EM4-2 | polish · rank 2 | A piece is 'one reading' on the recap but 'one piece' on the Sunday page | cited lines re-found at 318bbea4; no commit since 5096c0ce touched the cited files |
| 2026-10-09-essay-l1/recert-7/L1-daniel-15-EM2-1 | 2026-10-09-essay-l1/recert-8/L1-daniel-15-EM2-1 | minor · rank 6 | Dictate on the Essay tab and the rewrite panel listens in Czech for a cz learner, but the desk reads… | cited lines re-found at 318bbea4; no commit since 5096c0ce touched the cited files |
| 2026-10-09-essay-l1/recert-7/L1-daniel-15-EM2-2 | 2026-10-09-essay-l1/recert-8/L1-daniel-15-EM2-2 | minor · rank 4 | A rewrite of a sentence first ruled neutral as a later unsupported claim is ruled faulty: 'Rewrite ·… | cited lines re-found at 318bbea4; rules/essay.ts changed since 5096c0ce (2ab0130f) and the cite moved with it (same line content); no commit since 5096c0ce touched desk/essay.ts |
| 2026-10-09-essay-l1/recert-7/L1-daniel-15-EM3-1 | 2026-10-09-essay-l1/recert-8/L1-daniel-15-EM3-1 | major · rank 9 | The paste box and the shelf are hidden whenever the TV is on the forensic page, and Essay Master reo… | cited lines re-found at 318bbea4; no commit since 5096c0ce touched the cited files |
| 2026-10-09-essay-l1/recert-7/L1-daniel-15-EM3-2 | 2026-10-09-essay-l1/recert-8/L1-daniel-15-EM3-2 | major · rank 9 | A title line is read as its own paragraph or fuses into sentence 1; the task never reaches the promp… | cited lines re-found at 318bbea4; rules/essay.ts changed since 5096c0ce (2ab0130f) but not at the cited lines; no commit since 5096c0ce touched desk/essay.ts |
| 2026-10-09-essay-l1/recert-7/L1-daniel-15-EM3-3 | 2026-10-09-essay-l1/recert-8/L1-daniel-15-EM3-3 | minor · rank 6 | Nothing says grammar and spelling are not checked; 'Well done' lands on sentences with errors | cited lines re-found at 318bbea4; rules/essay.ts changed since 5096c0ce (2ab0130f) and the cite moved with it (same line content); no commit since 5096c0ce touched essay/EssayTV.tsx |
| 2026-10-09-essay-l1/recert-7/L1-daniel-15-EM3-4 | 2026-10-09-essay-l1/recert-8/L1-daniel-15-EM3-4 | minor · rank 3 | Present-and-correct-but-unwired: provider, stats.words, stats.links; /api/texts noticed and notice | cited lines re-found at 318bbea4; rules/essay.ts changed since 5096c0ce (2ab0130f) and the cite moved with it (same line content); no commit since 5096c0ce touched api/texts/route.ts, essay/EssayTV.tsx |
| 2026-10-09-essay-l1/recert-7/L1-daniel-15-EM3-5 | 2026-10-09-essay-l1/recert-8/L1-daniel-15-EM3-5 | major · rank 9 | No verdict lands until the last paragraph is read (C3 second clause fails by design) | cited lines re-found at 318bbea4; rules/essay.ts changed since 5096c0ce (2ab0130f) and the cite moved with it (same line content); no commit since 5096c0ce touched desk/essay.ts, essay/EssayTV.tsx |
| 2026-10-09-essay-l1/recert-7/L1-eliska-12-EM1-1 | 2026-10-09-essay-l1/recert-8/L1-eliska-12-EM1-1 | major · rank 9 | Every faulty note is a code line not in the young voice: 'asserts', 'checkable'; planFit prints 'Tha… | cited lines re-found at 318bbea4; rules/essay.ts changed since 5096c0ce (2ab0130f) and the cite moved with it (same line content) |
| 2026-10-09-essay-l1/recert-7/L1-eliska-12-EM1-2 | 2026-10-09-essay-l1/recert-8/L1-eliska-12-EM1-2 | minor · rank 6 | The forensic crumb, 'Its job' and the table show the regex first-pass role, which can contradict the… | cited lines re-found at 318bbea4; rules/essay.ts changed since 5096c0ce (2ab0130f) but not at the cited lines; no commit since 5096c0ce touched essay/EssayTV.tsx |
| 2026-10-09-essay-l1/recert-7/L1-eliska-12-EM1-3 | 2026-10-09-essay-l1/recert-8/L1-eliska-12-EM1-3 | polish · rank 2 | stats.links (PEEL's L) and stats.words are computed for every reading and shown nowhere | cited lines re-found at 318bbea4; rules/essay.ts changed since 5096c0ce (2ab0130f) and the cite moved with it (same line content); no commit since 5096c0ce touched essay/EssayTV.tsx |
| 2026-10-09-essay-l1/recert-7/L1-eliska-12-EM1-4 | 2026-10-09-essay-l1/recert-8/L1-eliska-12-EM1-4 | major · rank 9 | The planted-claim fix depends on the model naming links (supports / backs): when it omits them, Stru… | cited lines re-found at 318bbea4; rules/essay.ts changed since 5096c0ce (2ab0130f) and the cite moved with it (same line content); no commit since 5096c0ce touched desk/essay.ts |
| 2026-10-09-essay-l1/recert-7/L1-eliska-12-EM1-5 | 2026-10-09-essay-l1/recert-8/L1-eliska-12-EM1-5 | minor · rank 6 | PEEL's Explain is still marked faulty when it has no connector or linker opener: closesAfterEvidence… | cited lines re-found at 318bbea4; rules/essay.ts changed since 5096c0ce (2ab0130f) and the cite moved with it (same line content) |
| 2026-10-09-essay-l1/recert-7/L1-eliska-12-EM1-6 | 2026-10-09-essay-l1/recert-8/L1-eliska-12-EM1-6 | minor · rank 6 | cleanFix's content check is a closed list of verbs: a frame with any other verb ('Teenagers sleep [h… | cited lines re-found at 318bbea4; rules/essay.ts changed since 5096c0ce (2ab0130f) and the cite moved with it (same line content) |
| 2026-10-09-essay-l1/recert-7/L1-eliska-12-EM2-1 | 2026-10-09-essay-l1/recert-8/L1-eliska-12-EM2-1 | minor · rank 6 | Kept verdicts go stale: after her rewrite adds the evidence, the earlier claim stays 'no evidence' | cited lines re-found at 318bbea4; no commit since 5096c0ce touched the cited files |
| 2026-10-09-essay-l1/recert-7/L1-eliska-12-EM2-2 | 2026-10-09-essay-l1/recert-8/L1-eliska-12-EM2-2 | minor · rank 6 | After a rewrite holds, focus goes to 'Next sentence', which steps to n+1, not to the next faulty sen… | cited lines re-found at 318bbea4; no commit since 5096c0ce touched the cited files |
| 2026-10-09-essay-l1/recert-7/L1-eliska-12-EM2-3 | 2026-10-09-essay-l1/recert-8/L1-eliska-12-EM2-3 | minor · rank 3 | Refusal 'In the paragraph that would not stay one sentence.' is opaque; a dictated mid-paragraph rew… | cited lines re-found at 318bbea4; rules/essay.ts changed since 5096c0ce (2ab0130f) and the cite moved with it (same line content); no commit since 5096c0ce touched phone/page.tsx |
| 2026-10-09-essay-l1/recert-7/L1-helena-46-EM1-1 | 2026-10-09-essay-l1/recert-8/L1-helena-46-EM1-1 | minor · rank 6 | Adult mode's lens home, plan, playbook and x-ray speak only to school paragraphs | cited lines re-found at 318bbea4; no commit since 5096c0ce touched the cited files |
| 2026-10-09-essay-l1/recert-7/L1-helena-46-EM1-2 | 2026-10-09-essay-l1/recert-8/L1-helena-46-EM1-2 | minor · rank 3 | Four reading fields are computed and never shown (provider, stats.links, stats.words, sentences[].co… | cited lines re-found at 318bbea4; no commit since 5096c0ce touched the cited files |
| 2026-10-09-essay-l1/recert-7/L1-helena-46-EM1-3 | 2026-10-09-essay-l1/recert-8/L1-helena-46-EM1-3 | polish · rank 2 | The phone refuses a .docx that the PC page accepts | cited lines re-found at 318bbea4; rules/essay.ts changed since 5096c0ce (2ab0130f) and the cite moved with it (same line content); no commit since 5096c0ce touched phone/page.tsx, drop/page.tsx |
| 2026-10-09-essay-l1/recert-7/L1-helena-46-EM1-5 | 2026-10-09-essay-l1/recert-8/L1-helena-46-EM1-5 | minor · rank 6 | An email read on its own, or a piece read with Keep off, is still judged as an essay: the kind of wr… | cited lines re-found at 318bbea4; no commit since 5096c0ce touched the cited files |
| 2026-10-09-essay-l1/recert-7/L1-helena-46-EM5-1 | 2026-10-09-essay-l1/recert-8/L1-helena-46-EM5-1 | major · rank 12 | Reading a kept email puts every sentence on the TV and its first words on the lens home | cited lines re-found at 318bbea4; no commit since 5096c0ce touched the cited files |
| 2026-10-09-essay-l1/recert-7/L1-helena-46-EM5-2 | 2026-10-09-essay-l1/recert-8/L1-helena-46-EM5-2 | minor · rank 3 | On /drop the notice's 'Read without keeping' reads nothing, and the empty shelf says pieces arrive f… | cited lines re-found at 318bbea4; no commit since 5096c0ce touched the cited files |
| 2026-10-09-essay-l1/recert-7/L1-helena-46-EM5-3 | 2026-10-09-essay-l1/recert-8/L1-helena-46-EM5-3 | polish · rank 2 | Leaving a piece out of the exemplars still lets its text shape the dims and count toward birth | cited lines re-found at 318bbea4; no commit since 5096c0ce touched the cited files |
| 2026-10-09-essay-l1/recert-7/L1-helena-46-EM5-4 | 2026-10-09-essay-l1/recert-8/L1-helena-46-EM5-4 | polish · rank 2 | .docx text: table cells become separate paragraphs and a non-breaking hyphen is dropped and glues th… | cited lines re-found at 318bbea4; no commit since 5096c0ce touched the cited files |
| 2026-10-09-essay-l1/recert-7/L1-kristyna-17-EM1-2 | 2026-10-09-essay-l1/recert-8/L1-kristyna-17-EM1-2 | major · rank 9 | ES-READ: kind and mode now reach the reading, a task has no sender and no history or memory reaches … | cited lines re-found at 318bbea4; no commit since 5096c0ce touched the cited files |
| 2026-10-09-essay-l1/recert-7/L1-kristyna-17-EM1-3 | 2026-10-09-essay-l1/recert-8/L1-kristyna-17-EM1-3 | minor · rank 6 | A Czech paragraph that passes the language check gets notes in whatever language the model picks; th… | cited lines re-found at 318bbea4; rules/essay.ts changed since 5096c0ce (2ab0130f) and a cite sits in a changed hunk: re-read by hand (the language check 2ab0130f rewrote); no commit since 5096c0ce touched desk/essay.ts |
| 2026-10-09-essay-l1/recert-7/L1-kristyna-17-EM1-4 | 2026-10-09-essay-l1/recert-8/L1-kristyna-17-EM1-4 | minor · rank 3 | stats.links and stats.words are computed for every reading and shown nowhere | cited lines re-found at 318bbea4; rules/essay.ts changed since 5096c0ce (2ab0130f) and the cite moved with it (same line content); no commit since 5096c0ce touched essay/EssayTV.tsx |
| 2026-10-09-essay-l1/recert-7/L1-kristyna-17-EM1-6 | 2026-10-09-essay-l1/recert-8/L1-kristyna-17-EM1-6 | minor · rank 6 | Nothing says before the first send that Essay Master reads English; on the plan she writes and inks … | cited lines re-found at 318bbea4; rules/essay.ts changed since 5096c0ce (2ab0130f) and the cite moved with it (same line content); no commit since 5096c0ce touched phone/page.tsx, tv/profileRows.ts, tv/keys.ts, api/analyse/route.ts |
| 2026-10-09-essay-l1/recert-7/L1-kristyna-17-EM3-1 | 2026-10-09-essay-l1/recert-8/L1-kristyna-17-EM3-1 | minor · rank 6 | A plain title line becomes paragraph 1 of the piece, costs a model call, and can become 'Start with … | cited lines re-found at 318bbea4; rules/essay.ts changed since 5096c0ce (2ab0130f) but not at the cited lines; no commit since 5096c0ce touched desk/essay.ts |
| 2026-10-09-essay-l1/recert-7/L1-kristyna-17-EM3-2 | 2026-10-09-essay-l1/recert-8/L1-kristyna-17-EM3-2 | minor · rank 3 | GET /api/texts returns noticed and notice that no screen reads | cited lines re-found at 318bbea4; no commit since 5096c0ce touched the cited files |

## Regressed

None. A regression would be a pair whose code verdict dropped, or a row that was fixed and came back; the rows fixed at earlier rounds were not re-walked. The rules suites (`npm run test:rules`) pass at 318bbea4: see *Method*.

## New findings for the next drain

None filed. The gaps the probe shows are the open acceptances of the three narrowed rows (Czech without diacritics and short Czech under EM1-5 and EM1-4, German and other languages under EM1-4), so they are restated there rather than filed again. The probe does not suggest a simple fix: every leaked paragraph had an English share of 0 to 0.17, but so can plain English ("Phones distract students." has no English function word), and tools/essay-rules-test.cjs notes that its lowest English paragraph is under the English floor too. A Czech word list that grows with the corpus is the lever the rule has.

## Method

Commits on main since 5096c0ce that touch desk/src/essay/, desk/src/app/phone/, desk/src/app/drop/, desk/src/app/api/analyse/, desk/src/app/api/texts/, desk/src/lib/desk/essay.ts, desk/src/lib/rules/, desk/src/lib/session/ or desk/src/tv/ (`git log 5096c0ce..HEAD -- <paths>`): 1. The other commits since 5096c0ce touch only desk/src/lib/english/ and desk/src/english/ (Linga), which no Essay row cites.

| Commit | Subject | Row it names | Result |
| --- | --- | --- | --- |
| 2ab0130f | fix(essay): language check refuses Czech built on shared function words, short plain Czech and German | recert-7/L1-kristyna-17-EM1-1, L1-kristyna-17-EM1-5, L1-helena-46-EM1-4 | all three narrowed, recur |

Rows were answered only from the code at 318bbea4. A cite is a line of recert-7's evidence re-mapped through `git diff -U0 5096c0ce 318bbea4` per file: only desk/src/lib/rules/essay.ts changed, so its cites past line 148 moved by +2 to +8 and were compared line for line with the old content (all the same). The four cites inside the hunk 2ab0130f rewrote (kristyna-17 EM1-5 :149-153 and :166-177, kristyna-17 EM1-3 :171-177, helena-46 EM1-4 :171-176) were re-read by hand and re-pointed: the shared list :150, ENGLISH_WORDS :151-152, CZECH_WORDS :154-156, GERMAN_WORDS :158-159, the floors :173-175, the rule :178-184.

The probe (scratch probe.cjs, outside the repo, loaded with `tools/ts-load.cjs`, no model) ran `paragraphIsEnglish` and `englishReading` at 318bbea4 over a hand-written corpus: 35 Czech sentences with diacritics (school, opinion, family, greetings; from one word to 13), the same 35 folded to plain letters, 4 long function-word-heavy paragraphs, 10 German, 4 each of Slovak, Polish, French and Spanish, and 16 English probes chosen to collide with the shared list. Results are in the narrowed table. The corpus is not in the repo; the brief keeps tools/ out of reach.

The ledger was read before any stamp was written and the rerun's own rows were skipped, as `finishLedger` does; stamps were written once (parent 26, recert-1 34, recert-2 34, recert-3 35, recert-4 36, recert-5 36, recert-6 37, recert-7 37 Essay rows stamped: 275 rows, 0 fixed, 275 recurs). OPEN.md was rewritten by `ledger.cjs writeStatus()`, the call `finishLedger` makes, so the Linga and Math sections are byte for byte the recert-10 commit's.

## Confounded - do not read as a regression

| Confound | Covers | Run pair |
| --- | --- | --- |
| Walker and instrument are the same kind as recert-7 (an L1 code walk, by the builder session itself); the product moved in one Essay file (desk/src/lib/rules/essay.ts, 2ab0130f), which is why three rows narrowed. The probe corpus is new to this round and hand-written; its refusal rate is a measure on that corpus, not on learners' writing. | all rows | 2026-10-09-essay-l1/recert-7 -> 2026-10-09-essay-l1/recert-8 |
