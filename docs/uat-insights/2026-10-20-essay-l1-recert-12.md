# L1 recertify, round 12, of the Essay Master run 2026-10-09-essay-l1 (2026-10-20)

A code-only L1 re-walk of the 10 pairs of `uat/runs/2026-10-09-essay-l1` that still had an open row, on ee7d6ac7 (`ee7d6ac770ff1f6f4a10e03c5410aba688a423d7`, local main), after the 43 commits that landed since f788a5dd (five of them Essay: 69b5b059, aa2d0cd5, f36296f2, a3db5db2, ee7d6ac7; also the TV-led work TL-1..TL-13 and the tv-phone-pairing lite r3 reworks), plus a fresh held-out measure of the Essay language check. No model call of any kind (no claude CLI, no API, no judge model), no vision call, no browser, no Fire TV; nothing under `desk/` or `desk/data/` changed. Full report: `uat/runs/2026-10-09-essay-l1/recertify-12.md`; data: `recert-12/`.

## Counts: Essay before and after

| | Blocker | Major | Minor | Polish | Total |
| --- | --- | --- | --- | --- | --- |
| Open before (recert-11) | 0 | 9 | 16 | 5 | **30** |
| Fixed | 0 | 0 | 4 | 2 | **6** |
| Recur (severity now) | 0 | 9 | 12 | 3 | **24** |
| New | 0 | 0 | 0 | 0 | **0** |
| Open now | 0 | 9 | 12 | 3 | **24** |

OPEN.md Essay 30 -> 24; total open 264 -> 256 once both modules are recorded (the other module's note holds its own half). The Linga section of OPEN.md is byte for byte unchanged (sha256 2a273aabbf8fcc3ba868809183e2b1257fd14fc1a85779ba4324112cffc46a15 before and after).

## Rows now fixed, and the commit that fixed each

| Row | Sev. | Fixed by | What the code does now |
| --- | --- | --- | --- |
| `L1-barbora-43-EM4-2` A piece is 'one reading' on the recap but 'one piece' on the Sunday page | polish | **f36296f2** | f36296f2 (ancestor of HEAD) makes the recap use the Sunday page's words: parseDetail keeps the ", N paragraphs" count (desk/src/tv/recapRows.ts:59), recapLine (:264) counts a reading with more than one paragraph (or, with no count, PIECE_SENTENCES = 12 sentences or more, imported from rules/week, :16) as a piece and says "one paragraph reading and one piece" as week.ts:322 does. Executed at ee7d6ac7 (scratch /tmp/rc12/ex2.cjs): a 3-paragraph piece reads "Essay Master - one piece (Structure): 2 of 14 sentences to fix"; one paragraph reading plus one piece reads "one paragraph reading and one piece"; a pure-paragraph evening keeps "one reading" / "two readings". tools/essay-rules-test.cjs 161… |
| `L1-eliska-12-EM1-5` PEEL's Explain is still marked faulty when it has no connector or linker opener: closesAf… | minor | **69b5b059** | 69b5b059 (ancestor of HEAD) drops the connector requirement for the Evidence lens: closesAfterEvidence (desk/src/lib/rules/essay.ts:555-558) returns false for a connector-less sentence only when lens !== "evidence", so an opinion after the paragraph's last marked evidence in the same paragraph is neutral whatever it opens with; with no marked evidence before it the opinion stays faulty. Executed at ee7d6ac7 (scratch /tmp/rc12/ex2.cjs, no model): "Cars should be banned near schools. A 2021 study found that 40% of pupils live within one mile. Cleaner air helps pupils concentrate in lessons. The council should act now." with the model naming the link (backs: 1) gives S3 neutral and S4 neutral … |
| `L1-eliska-12-EM1-6` cleanFix's content check is a closed list of verbs: a frame with any other verb ('Teenage… | minor | **aa2d0cd5** | aa2d0cd5 (ancestor of HEAD) adds FIX_LIMITS.contentWords: 2 (desk/src/lib/rules/essay.ts:320) and a check in cleanFix (:346) that refuses a frame whose literal words, minus SCAFFOLD, number more than that, so no verb list is needed for it (addsContent and FINITE :359 stay as the first arm). Executed at ee7d6ac7 (no model): cleanFix({move:"State the point",pattern:"Teenagers sleep [how many] hours."}) and "Councils ban cars outside schools [where]." both return undefined (kept at ffa91a49); "Because of [reason], [claim]." is still kept. tools/essay-rules-test.cjs 161/0 pins both repros. The acceptance (the content check does not depend on a verb list; the two repros pinned) is met. |
| `L1-eliska-12-EM2-2` After a rewrite holds, focus goes to 'Next sentence', which steps to n+1, not to the next… | minor | **562811ec** | The two halves of the row are both in code. 32ffdf92 (already narrowed at recert-11) sends Next sentence to the next faulty sentence: focusAfterRewrite lands on Next when the rewrite holds and another sentence is faulty (desk/src/tv/keys.ts:201-204) and nextFaultyAt (:206-213, called at :596) wraps to it. 562811ec (TL-7, ancestor of HEAD) puts the instruction on the TV page itself: Rewrite on my phone opens the rewrite hand-off (keys.ts:592 ask.open rewrite, kinds listed at :260), essayHandoffLine (:274-278) gives "On the phone: your rewrite. Back cancels." (or "No phone is connected. Back: cancel."), and the forensic Page draws it as the caption under "On your phone" (desk/src/essay/EssayT… |
| `L1-helena-46-EM1-3` The phone refuses a .docx that the PC page accepts | polish | **ee7d6ac7** | ee7d6ac7 (HEAD, ancestor of main) makes the phone's refusal name the PC page: essayFileProblem (desk/src/lib/rules/essay.ts:282) answers a .docx (by name or by the Word MIME type) with "The phone reads .txt and .md files. The PC page (/drop) reads .docx, or save the document as .txt and pick it again.", and the phone's Essay panel says "a .docx goes through the PC page" before any pick (desk/src/app/phone/page.tsx:837). Executed at ee7d6ac7: essayFileProblem({name:"a.docx",type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",size:1000}) returns that line. tools/essay-rules-test.cjs 161/0. The acceptance (the phone's refusal names the PC page for .docx) is met; the … |
| `L1-kristyna-17-EM3-2` GET /api/texts returns noticed and notice that no screen reads | minor | **a3db5db2** | a3db5db2 (ancestor of HEAD) makes the shelf read the fields: EssayShelf.tsx load() keeps noticed and notice from GET /api/texts (desk/src/app/phone/EssayShelf.tsx:18, :22) and draws the notice line, data-role="essay-shelf-notice", above the list until it is accepted (:42); the route still returns both (desk/src/app/api/texts/route.ts:40). tools/essay-piece-test.cjs 50/0 holds it. The acceptance (the shelf shows the notice line, or the fields are dropped) is met. Not screenshot-verified: L2. |

Each fixing commit was checked an ancestor of main (`git merge-base --is-ancestor`). "Fixed" is L1 evidence: the code at ee7d6ac7 meets the row's acceptance; `resolved-verified` still needs live L2.

## Narrowed, still open

| Row | Commit | What is still missing |
| --- | --- | --- |
| `L1-daniel-15-EM3-4` | a3db5db2 | provider is computed (desk/src/lib/desk/essay.ts:124, :135, :169, :194, :239, :294) and returned in the reading, and drawn nowhere on the TV or the phone. [narrowed by 176f04f0 (stats.words, stats.links, connectors drawn, EssayTV.tsx:484) and by a3db5db2 (the shelf reads noticed/notice from /api/texts and shows the notice line until it is accepted, EssayShelf.tsx:22, :42); still missing: provider.] |
| `L1-helena-46-EM1-4` | ffa91a49 | paragraphIsEnglish (desk/src/lib/rules/essay.ts:261-268) is unchanged since ffa91a49. On the recert-12 held-out probe (recert-12/heldout.json) all 48 Czech paragraphs, 5 of 5 German and 3 of 3 Polish are refused and 0 of 32 English texts; short Czech lines with diacritics 6 of 6, short plain-letter Czech lines 4 of 6 ("Preji hezky den.", "Venku fouka vitr." go to the model), because a paragraph under 6 words is judged by a laxer rule on purpose (:265). |
| `L1-kristyna-17-EM1-1` | ffa91a49 | On the recert-12 held-out probe 48 of 48 Czech paragraphs are refused (36 plain-letter, 12 with diacritics), against 59 of 60 on recert-11's; 4 of 174 over the three fresh probes still clear the check. Both arms of the acceptance stay open: refusal is not complete over all corpora (a leak at recert-11: "Kamarad mi pujcil knizku o vesmiru a ja ji precetl za dva dny."; short plain lines pass) and the verdict rules still hold English-only word lists (CONNECTORS essay.ts:14, EVIDENCE/LINK :16, CONTRAST :412, wordIn :425, noTurn :580), so a Czech paragraph that does clear the check is ruled on English lists with English advice. |

## Per pair

| Pair | Open before | Fixed | Recur | New | Open now | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| barbora-43 EM1 | 2 | 0 | 2 | 0 | 2 | L1-conditional |
| barbora-43 EM4 | 2 | 1 | 1 | 0 | 1 | L1-conditional |
| daniel-15 EM2 | 2 | 0 | 2 | 0 | 2 | L1-conditional |
| daniel-15 EM3 | 5 | 0 | 5 | 0 | 5 | L1-conditional |
| eliska-12 EM1 | 4 | 2 | 2 | 0 | 2 | L1-conditional |
| eliska-12 EM2 | 2 | 1 | 1 | 0 | 1 | L1-conditional |
| helena-46 EM1 | 5 | 1 | 4 | 0 | 4 | L1-conditional |
| helena-46 EM5 | 3 | 0 | 3 | 0 | 3 | L1-conditional |
| kristyna-17 EM1 | 4 | 0 | 4 | 0 | 4 | L1-conditional |
| kristyna-17 EM3 | 1 | 1 | 0 | 0 | 0 | L1-pass (no row open) |

## Held-out measure of the language check (ee7d6ac7, unchanged since ffa91a49)

`recert-12/heldout.json` holds a FRESH probe written for this round, after reading the rule and the three open language rows' acceptances, with no item of `recert-11/heldout.json` in it (letter-normalised string match: 0 of 92) and none in tools/, uat/ or desk/src: 36 Czech paragraphs written with diacritics and folded to plain letters, 12 Czech paragraphs with diacritics, 6 short Czech lines (with diacritics and folded), 5 German and 3 Polish paragraphs, 32 English texts (some built to collide: Vespa, Roma, Praha Castle, 5k, Skype, Pilsner Urquell, Brown v Board, Tesco, martini, Zlatan, spaghetti, learner-grammar English). paragraphIsEnglish was executed per item (scratch scripts outside the repo, no model). The rule is byte for byte what it was at ffa91a49 (git diff -U0 touches rules/essay.ts at :282, :320, :345 and :556 only), so there is no before column.

| Measure | ee7d6ac7 |
| --- | --- |
| Fresh plain-letter Czech paragraphs, refused | **36 of 36 refused** |
| Fresh diacritic Czech paragraphs, refused | **12 of 12 refused** |
| All fresh Czech paragraphs, refused | **48 of 48 refused** |
| Short Czech lines, refused | diacritics 6 of 6, plain-letter 4 of 6 refused |
| German / Polish, refused | German 5 of 5, Polish 3 of 3 refused |
| Fresh English wrongly refused | **0 of 32** |
| Czech paragraphs refused over this probe and recert-11's | 107 of 108 |

This probe is easier than the last: every item is a grammatical, diacritic-correct sentence before folding, and the words were chosen without the Czech function-word collisions the earlier probes were built around. A pass here does not move the open acceptances: `L1-kristyna-17-EM1-1` asks for a complete refusal and for verdict rules that take the text language (the English word lists in rules/essay.ts are untouched), and `L1-helena-46-EM1-4` is about short lines, where two of six plain-letter lines ("Preji hezky den.", "Venku fouka vitr.") still go to the model by design of the under-6-words arm (rules/essay.ts:265). No test pins the Czech shape rule beyond the existing cases of tools/essay-rules-test.cjs; the two heldout.json files are the only record of the fresh measures.

## Open rows, ranked by how cheaply each could close before 10-23

Effort is the walker's read from each row's acceptance and the code it names: XS a string or one line, S one file and a test, M a few files or a rule change with fixtures, L new content or a model-dependent change that only L2 can confirm. Deadline 2026-10-23. The next deliveries are cut from this order.

### Closable without desk/src/app/phone/page.tsx

| # | Row | Effort | Files | What closes it |
| --- | --- | --- | --- | --- |
| 1 | `L1-helena-46-EM5-3` (polish, rank 2) | XS | desk/src/app/drop/page.tsx:96 | Copy: say an excluded piece still shapes the style numbers (the other arm, excluding it from the measure, is desk/src/lib/twin/card.ts:46-48 and costs more). |
| 2 | `L1-helena-46-EM5-2` (minor, rank 3) | XS | desk/src/app/phone/EssayShelf.tsx:66, :48 (TextNotice mode from desk/src/app/drop/page.tsx:86) | Copy: the decline reads "Not now" on /drop, and the empty shelf names where to keep a piece there. |
| 3 | `L1-daniel-15-EM3-3` (minor, rank 6) | XS | desk/src/essay/EssayTV.tsx:155 (lens home caption), :426 | One caption line: the desk reads structure, argument, evidence and word choice, not grammar or spelling. |
| 4 | `L1-daniel-15-EM3-4` (minor, rank 3) | XS-S | desk/src/essay/EssayTV.tsx:484, desk/src/lib/desk/essay.ts:124-294 | The one field left is `provider`: draw it in the Table figures, or stop returning it from the reading. |
| 5 | `L1-helena-46-EM1-2` (minor, rank 3) | S | desk/src/essay/EssayTV.tsx:484, :498 | Same change as L1-daniel-15-EM3-4 plus sentences[].connectors drawn per row, or dropped from the type; one EssayTV edit closes both rows. |
| 6 | `L1-barbora-43-EM1-1` (major, rank 9) | S | desk/src/essay/EssayTV.tsx:547-549 | Change the x-ray sample to a topic school would not set, never sharing one with the phone placeholder (page.tsx:66); a render test pins it. |
| 7 | `L1-daniel-15-EM3-5` (major, rank 9) | S | desk/src/essay/EssayTV.tsx:421-422, desk/src/lib/rules/essay.ts:637 | Second arm: the wait line says verdicts come when the whole piece is read and how far it has got (pieceReadingLine exists). |
| 8 | `L1-kristyna-17-EM1-3` (minor, rank 6) | S | desk/src/lib/desk/essay.ts:102-112 | One language line in the reading prompt; which language is the owner's call. |
| 9 | `L1-helena-46-EM5-4` (polish, rank 2) | S | desk/src/lib/rules/docx.ts:59, tools/ | noBreakHyphen reads "-", a table row reads as one line, a fixture pins both. |
| 10 | `L1-eliska-12-EM1-2` (minor, rank 6) | S-M | desk/src/essay/EssayTV.tsx:430, :439, :498, desk/src/lib/rules/essay.ts:45 | The crumb and "Its job" name the job the lens observed, or label the first-pass guess as such. |
| 11 | `L1-helena-46-EM1-1` (minor, rank 6) | M | desk/src/essay/EssayTV.tsx:155, :333, :547, desk/src/lib/library/lessons.data.ts:51 | Adult mode: lens-home captions and playbook speak of messages and emails, or the playbook is hidden; a render test. |
| 12 | `L1-eliska-12-EM2-1` (minor, rank 6) | M | desk/src/lib/desk/essay.ts:288-292 | A kept faulty verdict the rule would now clear carries a "read the paragraph again" line. |
| 13 | `L1-daniel-15-EM2-2` (minor, rank 4) | M | desk/src/lib/rules/essay.ts:569, :609, desk/src/lib/desk/essay.ts:288 | A rewrite of a claim first ruled neutral as a later unsupported claim is not ruled faulty on that ground alone (judge it with its paragraph's context). |
| 14 | `L1-helena-46-EM1-4` (polish, rank 2) | M | desk/src/lib/rules/essay.ts:265 | Short plain-letter Czech (2 of 6 lines pass): tighten the under-6-words arm without refusing short English; needs a short-English held-out set first (this round holds one line). |
| 15 | `L1-daniel-15-EM3-2` (major, rank 9) | M | desk/src/lib/rules/essay.ts:86-103, desk/src/lib/desk/essay.ts, desk/src/app/api/analyse/route.ts:54 | The title line reaches the reading prompt as the task and is shown as a title. |
| 16 | `L1-kristyna-17-EM1-1` (major, rank 9) | M-L | desk/src/lib/rules/essay.ts:14, :16, :412, :425, :580 | Refusal arm: close the short plain-Czech gap and pin a 50+ held-out Czech corpus in tools/ (refusal is 107 of 108 on the two fresh probes); the other arm is language-aware verdict rules (L). |
| 17 | `L1-eliska-12-EM1-4` (major, rank 9) | M-L | desk/src/lib/desk/essay.ts:33-35, desk/src/lib/rules/essay.ts:558-576 | Require supports/backs for evidence-job and checkable sentences, or refuse a reading that names none; model-dependent, so only L2 shows it. |

### Needing desk/src/app/phone/page.tsx

| # | Row | Effort | Files | What closes it |
| --- | --- | --- | --- | --- |
| 1 | `L1-daniel-15-EM2-1` (minor, rank 6) | XS | desk/src/app/phone/page.tsx:413 (recognisers at :823, :834, :855) | The Essay panels listen in English (recogniserLang(s) is cs-CZ for a cz learner). |
| 2 | `L1-kristyna-17-EM1-6` (minor, rank 6) | S | desk/src/app/phone/page.tsx:837, desk/src/tv/profileRows.ts:32, desk/src/essay/EssayTV.tsx:155 | One line "Essay Master reads English" on the phone Essay panel and on the TV blurb/plan caption; the row needs both halves. |
| 3 | `L1-daniel-15-EM3-1` (major, rank 9) | S-M | desk/src/app/phone/page.tsx:822-857 | The rewrite panel carries "Send a new piece" / "Your shelf", or the shelf and box stay reachable below it. |
| 4 | `L1-barbora-43-EM4-1` (major, rank 8) | M | desk/src/app/phone/page.tsx:822, :832, :857, desk/src/app/phone/EssayShelf.tsx:52 | The shelf and "Forget tonight's paragraph" render outside the paste screen; the same change as L1-daniel-15-EM3-1 closes both. |
| 5 | `L1-helena-46-EM1-5` (minor, rank 6) | M | desk/src/app/phone/page.tsx:343, :849, desk/src/lib/desk/essay.ts:159-163 | The phone asks message / email / essay before any read; analyseEssay takes the format. |
| 6 | `L1-kristyna-17-EM1-2` (major, rank 9) | M-L | desk/src/app/phone/page.tsx:316, :343, desk/src/app/api/analyse/route.ts:54, desk/src/lib/desk/essay.ts:102-120 | A client sends the task and the learner's recurring faults reach the prompt; a server-side arm (read the open task and last fault counts in the route) avoids page.tsx but not the no-client-sends-a-task half. |
| 7 | `L1-barbora-43-EM1-2` (major, rank 9) | M-L | same files as L1-kristyna-17-EM1-2 | Same gap (S6 task name, S7 fault counts); closes with it. |

Rows that need `desk/src/app/phone/page.tsx`: `L1-daniel-15-EM2-1`, `L1-kristyna-17-EM1-6`, `L1-daniel-15-EM3-1`, `L1-barbora-43-EM4-1`, `L1-helena-46-EM1-5`, `L1-kristyna-17-EM1-2`, `L1-barbora-43-EM1-2`. The page was edited by this round's own commits (ee7d6ac7 and the TL-9/10/11 work), so it is no longer a parked file; the split stays because those rows share one file and one test surface and should be cut as one delivery. `L1-daniel-15-EM3-1` and `L1-barbora-43-EM4-1` close with one change to the same three panels; `L1-kristyna-17-EM1-2` and `L1-barbora-43-EM1-2` close with one task-sender change. Cheapest first cut: the five XS/S rows of the first table that share desk/src/essay/EssayTV.tsx (`L1-daniel-15-EM3-3`, `L1-daniel-15-EM3-4`, `L1-helena-46-EM1-2`, `L1-barbora-43-EM1-1`, `L1-daniel-15-EM3-5`) close five rows and a major in one file, then `L1-daniel-15-EM2-1` (one line, phone page).
