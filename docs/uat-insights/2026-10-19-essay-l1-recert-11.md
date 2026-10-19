# L1 recertify, round 11, of the Essay Master run 2026-10-09-essay-l1 (2026-10-19)

A code-only L1 re-walk of the 10 pairs of `uat/runs/2026-10-09-essay-l1` that still had an open row, on ffa91a49 (`ffa91a4938aa490c91a8c709d097d55f72a3b2f7`, local main), after the seven commits that landed since 6b189791 (three of them Essay: b75bd45f, 61a8e2ee, ffa91a49), plus a fresh held-out measure of the Essay language check. No model call, no vision call, no browser; nothing under `desk/`, `tools/`, `phone/` or `desk/data/` changed. Full report: `uat/runs/2026-10-09-essay-l1/recertify-11.md`; data: `recert-11/`.

## Counts: Essay before and after

| | Blocker | Major | Minor | Polish | Total |
| --- | --- | --- | --- | --- | --- |
| Open before (recert-10) | 0 | 12 | 16 | 5 | **33** |
| Fixed | 0 | 3 | 0 | 0 | **3** |
| Recur (severity now) | 0 | 9 | 16 | 5 | **30** |
| New | 0 | 0 | 0 | 0 | **0** |
| Open now | 0 | 9 | 16 | 5 | **30** |

OPEN.md Essay 33 -> 30; total open 270 -> 264 once both modules are recorded (the other module's note holds its own half). The Linga section of OPEN.md is byte for byte unchanged (checked with git diff against the file before the rewrite).

## Rows now fixed, and the commit that fixed each

| Row | Sev. | Fixed by | What the code does now |
| --- | --- | --- | --- |
| `L1-eliska-12-EM1-1` Every faulty note is a code line not in the young voice: 'asserts', 'checkable'; planFit… | major | **61a8e2ee** | 61a8e2ee (ancestor of HEAD) gave the faulty note a young wording: desk/src/lib/rules/essay.ts keeps ADULT_CHECKS (:456) and adds YOUNG_CHECKS (:469-479), and decideVerdicts(…, band) picks YOUNG_CHECKS when band is 'young' (a learner of 13 or less, rules/voice bandOf); every caller in desk/src/lib/desk/essay.ts (:134, :204, :236, :288) passes voice.band. Executed at ffa91a49 (scratch /tmp/rc11/ex.cjs, no model): three opinion sentences ruled with band 'young' carry 'This says what you think, but gives nothing a reader could check.' (the row's own example… |
| `L1-helena-46-EM5-1` Reading a kept email puts every sentence on the TV and its first words on the lens home | major | **b75bd45f** | b75bd45f (ancestor of HEAD) added curtainOn(s) (desk/src/tv/keys.ts:82-89: a kept piece, s.essay.piece.pieceId, in Adult mode) and EssayTV.tsx reads it on all three surfaces the row cited: the lens home's opening words (LastParagraph h2 :280 -> 'Your kept piece. The words are on the PC page and the phone.'), the forensic page's sentence (Page :426 -> 'Sentence N · the words are on the PC page and the phone') and the Table row text (:492 -> 'Sentence N', with the same line on the keys row :500). The Rail draws arrows only, no text. School and Family mode… |
| `L1-kristyna-17-EM1-5` The language check lets some Czech through: a paragraph whose shared function words (my,… | major | **ffa91a49** | ffa91a49 (ancestor of HEAD) added czechShape (desk/src/lib/rules/essay.ts:231-235): a word of 4+ letters that opens with zv zm zr zl zd zb hr hl kd vz ct krk rz, or ends in -ych -ymi -eho -emu -uje -ejte -ujte -ovat -ou -ym (or -ci/-ni/-ti/-ri on 5+ letters), or a stand-alone v, z, k counts as a Czech word in englishReading (:246); no word was added to any list. FRESH held-out probe written for this round (recert-11/heldout.json, 40 plain-letter + 20 diacritic Czech paragraphs of 6-42 words, 34 English; none of it in tools/, uat/ or desk/src, none of it… |

Each fixing commit was checked an ancestor of HEAD (`git merge-base --is-ancestor`). "Fixed" is L1 evidence: the code at ffa91a49 meets the row's acceptance; `resolved-verified` still needs live L2.

## Narrowed, still open

| Row | Commit | What is still missing |
| --- | --- | --- |
| `L1-helena-46-EM1-4` | ffa91a49 | Narrowed by ffa91a49: long plain-letter Czech and German, Italian, Dutch and Polish paragraphs are refused (round-11 probe 39 of 40 plain-letter Czech; r3 corpus 30 of 30 plain Czech, German 10/10, Polish 4/4), and English is not refused (0 of 34, 0 of 30). Still open: short plain-letter Czech lines go to the model (5 of 6 on the round-11 probe, e.g. 'Rad chodim lesem.', 'Skola me bavi.'; r3 short Czech 4 of 10 pass), because a paragraph under 6 words is judged by a laxer rule on purpose (rules/essay.ts:265). |
| `L1-kristyna-17-EM1-1` | ffa91a49 | Narrowed again by ffa91a49: on the round-11 held-out probe 1 of 60 Czech paragraphs clears the language check (plain-letter 1 of 40), 4 of 126 over both fresh probes (3.2 percent; the round-10 probe's 21 earlier leaks went to 3). A Czech paragraph that clears the check is still ruled on the English word lists (rules/essay.ts CONNECTORS :14, EVIDENCE/LINK :16, CONTRAST :409, wordIn :422, noTurn :576) and the rules do not take the text language; short plain Czech still goes straight to the model (5 of 6 short plain… |

## Per pair

| Pair | Open before | Fixed | Recur | New | Open now | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| barbora-43 EM1 | 2 | 0 | 2 | 0 | 2 | L1-conditional |
| barbora-43 EM4 | 2 | 0 | 2 | 0 | 2 | L1-conditional |
| daniel-15 EM2 | 2 | 0 | 2 | 0 | 2 | L1-conditional |
| daniel-15 EM3 | 5 | 0 | 5 | 0 | 5 | L1-conditional |
| eliska-12 EM1 | 5 | 1 | 4 | 0 | 4 | L1-conditional |
| eliska-12 EM2 | 2 | 0 | 2 | 0 | 2 | L1-conditional |
| helena-46 EM1 | 5 | 0 | 5 | 0 | 5 | L1-conditional |
| helena-46 EM5 | 4 | 1 | 3 | 0 | 3 | L1-conditional |
| kristyna-17 EM1 | 5 | 1 | 4 | 0 | 4 | L1-conditional |
| kristyna-17 EM3 | 1 | 0 | 1 | 0 | 1 | L1-conditional |

## Held-out measure of the language check (ffa91a49, language check round 4)

`recert-11/heldout.json` holds a FRESH probe written for this round, after reading the rule and the acceptance but not the set ffa91a49 was tuned on: 40 Czech paragraphs written with diacritics and folded to plain letters, 20 other Czech paragraphs with diacritics, 6 short Czech lines, 34 English texts (some built to collide: `5k`, `Zlatan`, `Brown v Smith`, spaghetti, martini, gym). A string search found none of it in tools/, uat/ or desk/src, and none of it is the round-10 probe or tools/essay-heldout-r3.json. paragraphIsEnglish was executed per item (scratch scripts outside the repo, no model), at ffa91a49 and at 6b189791 loaded from git:

| Measure | 6b189791 | ffa91a49 |
| --- | --- | --- |
| Fresh plain-letter Czech, refused | 37 of 40 | **39 of 40 (0.975)** |
| Fresh diacritic Czech, refused | 20 of 20 | **20 of 20 (1.00)** |
| All fresh Czech, refused | 57 of 60 | **59 of 60 (0.983)** |
| Fresh English wrongly refused | 0 of 34 | **0 of 34** |
| Round-10 probe's six plain-letter leaks, refused | 0 of 6 | 3 of 6 |
| Both fresh probes together, Czech refused | 117 of 126 (0.929) | **122 of 126 (0.968)**; plain-letter 78 of 82 (0.951) |
| r3 corpus (written before d051b6f2): plain Czech / short Czech / German / Italian / Dutch / Polish refused | 27 of 30 / 6 of 10 / 10 of 10 / 4 of 4 / 4 of 4 / 4 of 4 | **30 of 30 / 6 of 10** / 10 of 10 / 4 of 4 / 4 of 4 / 4 of 4 |
| r3 English wrongly refused | 0 of 30 | 0 of 30 |
| Recorded learner text (recert-9 set): English / Czech refused | 0 of 38 / 7 of 7 | 0 of 38 / 7 of 7 |
| Short Czech lines on the fresh probe, refused | diacritics 5 of 6, plain-letter 1 of 6 | diacritics 5 of 6, plain-letter 1 of 6 |

The one fresh paragraph that still passes as English is "Kamarad mi pujcil knizku o vesmiru a ja ji precetl za dva dny." The acceptance of `L1-kristyna-17-EM1-5` (50+ Czech paragraphs of mixed length, 0.95) is met on every corpus the rule's author had not seen; the plain-letter figure is narrow (0.951 over 82). ffa91a49 added no test of its own, so the shape rule is pinned only by the existing Czech cases of tools/essay-rules-test.cjs; recert-11/heldout.json is the only record of the fresh measure. Short plain-letter Czech lines still pass as English by design of the under-6-words arm (L1-helena-46-EM1-4).

## Open rows, ranked by how cheaply each could close before 10-23

Effort is the walker's read from each row's acceptance and the code it names: XS a string or one line, S one file and a test, M a few files or a rule change with fixtures, L new content or a model-dependent change that only L2 can confirm. Deadline 2026-10-23.

### Closable without desk/src/app/phone/page.tsx

| # | Row | Effort | What closes it |
| --- | --- | --- | --- |
| 1 | `L1-helena-46-EM1-3` (polish, rank 2) | XS | One refusal string: fileProblem (rules/essay.ts:282) names the PC page for a .docx. |
| 2 | `L1-helena-46-EM5-3` (polish, rank 2) | XS | Copy: drop/page.tsx:96 says an excluded piece still shapes the style numbers (the other arm, excluding it from the measure, is twin/card.ts and costs more). |
| 3 | `L1-helena-46-EM5-2` (minor, rank 3) | XS | Copy: EssayShelf.tsx:64 reads 'Not now' for the decline, and the empty shelf names 'Keep it' on /drop. |
| 4 | `L1-barbora-43-EM4-2` (polish, rank 2) | XS | One word in tv/recapRows.ts: name a piece as a piece (or its paragraph count), as the Sunday page does. |
| 5 | `L1-daniel-15-EM3-3` (minor, rank 6) | XS | One caption line on the lens home: the desk reads structure, argument, evidence and word choice, not grammar or spelling. |
| 6 | `L1-kristyna-17-EM3-2` (minor, rank 3) | XS | EssayShelf draws the notice line from /api/texts (or drop noticed/notice from the GET). |
| 7 | `L1-helena-46-EM1-2` (minor, rank 3) | S | Draw provider (the engine that read it) in the Table figures; connectors drawn or dropped. One EssayTV change that also closes L1-daniel-15-EM3-4. |
| 8 | `L1-daniel-15-EM3-4` (minor, rank 3) | S | Same change as L1-helena-46-EM1-2, plus the shelf saying whether the notice is accepted. |
| 9 | `L1-barbora-43-EM1-1` (major, rank 9) | S | Change the XRAY sample (EssayTV.tsx:542) to a topic school would not set, so it never shares one with the phone placeholder; a render test pins it. |
| 10 | `L1-eliska-12-EM2-2` (minor, rank 6) | S | After Rewrite on my phone the TV page itself says what to do (today only the phone chip and the status bar do). |
| 11 | `L1-kristyna-17-EM1-3` (minor, rank 6) | S | One language line in the reading prompt (desk/essay.ts:102-112); which language is the owner's call. |
| 12 | `L1-helena-46-EM5-4` (polish, rank 2) | S | docx.ts: noBreakHyphen reads '-', a table row reads as one line, a fixture pins both. |
| 13 | `L1-daniel-15-EM3-5` (major, rank 9) | S | Second arm: the wait screen says verdicts come when the whole piece is read and how far it has got (pieceReadingLine exists). |
| 14 | `L1-eliska-12-EM1-2` (minor, rank 6) | S-M | The crumb and 'Its job' name the job the lens observed, or label the first-pass guess as such. |
| 15 | `L1-helena-46-EM1-1` (minor, rank 6) | M | Adult mode: lens-home captions and playbook speak of messages and emails, or the playbook is hidden; a render test. |
| 16 | `L1-eliska-12-EM1-5` (minor, rank 6) | M | closesAfterEvidence: an opinion after the last marked evidence is neutral with or without a connector; touches verdicts, so many fixtures. |
| 17 | `L1-eliska-12-EM1-6` (minor, rank 6) | M | cleanFix content check without the verb list. |
| 18 | `L1-eliska-12-EM2-1` (minor, rank 6) | M | A kept faulty verdict the rule would now clear carries a 'read the paragraph again' line. |
| 19 | `L1-daniel-15-EM2-2` (minor, rank 4) | M | A rewrite of a claim first ruled neutral as a later unsupported claim is not ruled faulty on that ground alone (rules/essay.ts). |
| 20 | `L1-helena-46-EM1-4` (polish, rank 2) | M | Short plain-letter Czech (5 of 6 lines pass): tighten the under-6-words arm without refusing short English; needs a short-English held-out set first. |
| 21 | `L1-daniel-15-EM3-2` (major, rank 9) | M | The title line reaches the reading prompt as the task (route + desk/essay.ts) and is shown as a title. |
| 22 | `L1-kristyna-17-EM1-1` (major, rank 9) | M-L | Refusal arm: close the short plain-Czech gap and pin a 50+ held-out Czech corpus in tools/; or language-aware rules (L). Refusal is at 0.98 on fresh long paragraphs. |
| 23 | `L1-eliska-12-EM1-4` (major, rank 9) | M-L | Require supports/backs for evidence-job and checkable sentences, or refuse a reading that names none; model-dependent, so only L2 shows it. |

### Needing desk/src/app/phone/page.tsx (parked)

| # | Row | Effort | What closes it |
| --- | --- | --- | --- |
| 1 | `L1-daniel-15-EM2-1` (minor, rank 6) | XS | phone/page.tsx:392 sets r.lang = recogniserLang(s): the Essay tab must listen in English. |
| 2 | `L1-daniel-15-EM3-1` (major, rank 9) | S-M | The rewrite panel carries 'Send a new piece' / 'Your shelf', or the shelf and box stay reachable below it (the phone screen test is page.tsx). |
| 3 | `L1-kristyna-17-EM1-6` (minor, rank 6) | S | The TV half (plan caption, profileRows.ts blurb) is S; the phone's Essay tab copy (page.tsx:725) is the other half and the row needs both. |
| 4 | `L1-helena-46-EM1-5` (minor, rank 6) | M | The phone asks message / email / essay before any read (page.tsx:737, :318), analyseEssay takes the format. |
| 5 | `L1-barbora-43-EM4-1` (major, rank 8) | M | The shelf and 'Forget tonight's paragraph' render outside the paste screen (page.tsx:710, :729). |
| 6 | `L1-kristyna-17-EM1-2` (major, rank 9) | M-L | A client sends the task (page.tsx:291, :318) and the learner's recurring faults reach the prompt; the server-side arm (read the open task and last fault counts in the route) avoids page.tsx but not the 'no client sends a task' half. |
| 7 | `L1-barbora-43-EM1-2` (major, rank 9) | M-L | Same gap as L1-kristyna-17-EM1-2 (S6 task name, S7 fault counts); closes with it. |

Rows that need `desk/src/app/phone/page.tsx`: `L1-daniel-15-EM2-1`, `L1-daniel-15-EM3-1`, `L1-kristyna-17-EM1-6`, `L1-helena-46-EM1-5`, `L1-barbora-43-EM4-1`, `L1-kristyna-17-EM1-2`, `L1-barbora-43-EM1-2`. The half-and-half case is `L1-kristyna-17-EM1-6`: its TV half (plan caption, essay blurb) can land now, the phone Essay tab copy cannot.
