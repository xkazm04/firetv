# Recertify, round 12 — L1 run 2026-10-09-essay-l1

Rerun: `2026-10-09-essay-l1/recert-12`, **level L1 only (code re-walk on main ee7d6ac7, 2026-10-20)**; no model, no vision, no browser, desk/data untouched, nothing under desk/, tools/ or phone/ changed by this round. Every row open in `recert-11/findings.json` (30 rows) was answered `fixed` or `recurs` with current file:line evidence at ee7d6ac7; the rows the new commits claim to close were executed against their tests and, for the language check, a fresh probe. Nothing here is `resolved-verified`: that needs live L2 evidence.

The stamps were written by `uat/driver/recertify.cjs` `writeBack()` into every run that holds an open row of the gap (the parent `findings.json` and `recert-1` to `recert-11`): a fixed row carries `resolution: fixed`, `recertify_status: not-seen`, `recertify_run: 2026-10-09-essay-l1/recert-12` and `recertify_evidence` with the fixing commit; a recurring row stays open with `recurrence` + 1 and `recurred_as`. Its restatement is in `recert-12/findings.json` (`recurs: 2026-10-09-essay-l1/recert-11/<id>`). Rerun ids are positional, so they are written `2026-10-09-essay-l1/recert-12/<id>`. OPEN.md was rewritten by `uat/driver/ledger.cjs` `writeStatus()` only.

Head of this round: **ee7d6ac770ff1f6f4a10e03c5410aba688a423d7** (ee7d6ac7), the local main tip. The previous round (recert-11) read ffa91a4938aa490c91a8c709d097d55f72a3b2f7 (ffa91a49). 43 commits landed between f788a5dd and main; every one was checked an ancestor of main.

## Reconcile: every commit the round was asked to stamp

| Commit | Row | Ancestor of main | Change present at ee7d6ac7 |
| --- | --- | --- | --- |
| b75bd45f | EM5-1 | yes | curtainOn desk/src/tv/keys.ts:89; EssayTV.tsx:285, :432, :498 read it (stamped fixed at recert-11) |
| 61a8e2ee | EM1-1 | yes | YOUNG_CHECKS desk/src/lib/rules/essay.ts:472; decideVerdicts callers pass voice.band (desk/src/lib/desk/essay.ts:134, :204, :236) (stamped fixed at recert-11) |
| ffa91a49 | EM1-5 kristyna | yes | czechShape desk/src/lib/rules/essay.ts:235, used :246 (stamped fixed at recert-11) |
| 69b5b059 | EM1-5 eliska | yes | closesAfterEvidence `lens !== "evidence" &&` desk/src/lib/rules/essay.ts:557; executed, tools/essay-rules-test.cjs 161/0 |
| aa2d0cd5 | EM1-6 | yes | FIX_LIMITS.contentWords desk/src/lib/rules/essay.ts:320, check :346; executed |
| f36296f2 | EM4-2 | yes | pieces/paras head desk/src/tv/recapRows.ts:295-298, parseDetail :59; executed |
| ee7d6ac7 | L1-helena-46-EM1-3 | yes | docx refusal desk/src/lib/rules/essay.ts:282, phone copy desk/src/app/phone/page.tsx:837; executed |
| a3db5db2 | L1-kristyna-17-EM3-2, partial on L1-daniel-15-EM3-4 | yes | shelf notice line desk/src/app/phone/EssayShelf.tsx:18, :22, :42; tools/essay-piece-test.cjs 50/0 |

A commit that was missing would have been reported and its row left open; none was.

## The TV-led work and the lite r3 reworks

| Work | Commits | Ancestor of main |
| --- | --- | --- |
| TL-1 | ba1899bb | yes |
| TL-2 | d585d9fe | yes |
| TL-3 | f9e9593f | yes |
| TL-4 | afa4a488 | yes |
| TL-5 | 1ce95935 | yes |
| TL-6 | a9ef8747 | yes |
| TL-7 | 562811ec | yes |
| TL-8 | d2b8812e | yes |
| TL-9 | 955f0f58 | yes |
| TL-10 | b09c86fb | yes |
| TL-11 | 618819b7, cb0acb71, 7ea64626 | yes |
| TL-12 | 8060bedb, b65d7d77 | yes |
| TL-13 | 1ce6815f | yes |
| lite r3 reworks (tv-phone-pairing) | 17caa213, 8060bedb, plus 3f7ecb09, 51c5a406, 1601ce3b, 67908789, bcb165e3, 2cfcc0b5, 2ba0e400, cb477f93 | yes |

The TV-led work moved the Essay and Math screens the open rows cite (desk/src/tv/keys.ts, desk/src/essay/EssayTV.tsx, desk/src/maths/MathsTV.tsx, desk/src/app/phone/page.tsx, panelFor.ts, phoneBar.ts; the phone page grew by about 300 lines). Every cited screen still exists; each cite was re-found at its new line (the table below and the per-pair files name the moves) and none of the TL commits closes a row except where a row says so: `L1-eliska-12-EM2-2` closes on TL-7 (562811ec: the rewrite hand-off's caption is drawn on the forensic page itself). TL-7's other Essay changes (the hand-off chip and caption on the lens home, the plan and the sentence screen; the curtain's Show-the-words stop) leave the recurring rows' wording intact.

## Counts

| | Rows | By severity |
| --- | --- | --- |
| Open before | 30 | 0 blocker, 9 major, 16 minor, 5 polish |
| Fixed (L1) | 6 | 0 blocker, 0 major, 4 minor, 2 polish |
| Recurs | 24 | 0 blocker, 9 major, 12 minor, 3 polish |
| New | 0 | 0 blocker, 0 major, 0 minor, 0 polish |
| Open after | 24 | 0 blocker, 9 major, 12 minor, 3 polish |

OPEN.md Essay 30 -> 24; total open 264 -> 256 once both modules are recorded (the other module's note holds its own half). The Linga section of OPEN.md is byte for byte unchanged (sha256 of the section 2a273aabbf8fcc3ba868809183e2b1257fd14fc1a85779ba4324112cffc46a15 before and after). Every fixed row names its commit (6 of 6).

## Pair verdicts now

| Pair | At recert-11 | Now | Walk |
| --- | --- | --- | --- |
| barbora-43 EM1 | L1-conditional | L1-conditional | [barbora-43--EM1.md](recert-12/barbora-43--EM1.md) |
| barbora-43 EM4 | L1-conditional | L1-conditional | [barbora-43--EM4.md](recert-12/barbora-43--EM4.md) |
| daniel-15 EM2 | L1-conditional | L1-conditional | [daniel-15--EM2.md](recert-12/daniel-15--EM2.md) |
| daniel-15 EM3 | L1-conditional | L1-conditional | [daniel-15--EM3.md](recert-12/daniel-15--EM3.md) |
| eliska-12 EM1 | L1-conditional | L1-conditional | [eliska-12--EM1.md](recert-12/eliska-12--EM1.md) |
| eliska-12 EM2 | L1-conditional | L1-conditional | [eliska-12--EM2.md](recert-12/eliska-12--EM2.md) |
| helena-46 EM1 | L1-conditional | L1-conditional | [helena-46--EM1.md](recert-12/helena-46--EM1.md) |
| helena-46 EM5 | L1-conditional | L1-conditional | [helena-46--EM5.md](recert-12/helena-46--EM5.md) |
| kristyna-17 EM1 | L1-conditional | L1-conditional | [kristyna-17--EM1.md](recert-12/kristyna-17--EM1.md) |
| kristyna-17 EM3 | L1-conditional | L1-pass (no row open) | [kristyna-17--EM3.md](recert-12/kristyna-17--EM3.md) |

## Fixed (L1: the fix has landed in code; not resolved-verified)

| Row | Sev. | Fixed by | What the code does now |
| --- | --- | --- | --- |
| `L1-barbora-43-EM4-2` A piece is 'one reading' on the recap but 'one piece' on the Sunday page | polish | **f36296f2** | f36296f2 (ancestor of HEAD) makes the recap use the Sunday page's words: parseDetail keeps the ", N paragraphs" count (desk/src/tv/recapRows.ts:59), recapLine (:264) counts a reading with more than one paragraph (or, with no count, PIECE_SENTENCES = 12 sentences or more, imported from rules/week, :16) as a piece and says "one paragraph reading and one piece" as week.ts:322 does. Executed at ee7d6ac7 (scratch /tmp/rc12/ex2.cjs): a 3-paragraph piece reads "Essay Master - one piece (Structure): 2 of 14 sentences to fix"; one paragraph reading plus one piece reads "one paragraph reading and one piece"; a pure-paragraph evening keeps "one reading" / "two readings". tools/essay-rules-test.cjs 161… |
| `L1-eliska-12-EM1-5` PEEL's Explain is still marked faulty when it has no connector or linker opener: closesAf… | minor | **69b5b059** | 69b5b059 (ancestor of HEAD) drops the connector requirement for the Evidence lens: closesAfterEvidence (desk/src/lib/rules/essay.ts:555-558) returns false for a connector-less sentence only when lens !== "evidence", so an opinion after the paragraph's last marked evidence in the same paragraph is neutral whatever it opens with; with no marked evidence before it the opinion stays faulty. Executed at ee7d6ac7 (scratch /tmp/rc12/ex2.cjs, no model): "Cars should be banned near schools. A 2021 study found that 40% of pupils live within one mile. Cleaner air helps pupils concentrate in lessons. The council should act now." with the model naming the link (backs: 1) gives S3 neutral and S4 neutral … |
| `L1-eliska-12-EM1-6` cleanFix's content check is a closed list of verbs: a frame with any other verb ('Teenage… | minor | **aa2d0cd5** | aa2d0cd5 (ancestor of HEAD) adds FIX_LIMITS.contentWords: 2 (desk/src/lib/rules/essay.ts:320) and a check in cleanFix (:346) that refuses a frame whose literal words, minus SCAFFOLD, number more than that, so no verb list is needed for it (addsContent and FINITE :359 stay as the first arm). Executed at ee7d6ac7 (no model): cleanFix({move:"State the point",pattern:"Teenagers sleep [how many] hours."}) and "Councils ban cars outside schools [where]." both return undefined (kept at ffa91a49); "Because of [reason], [claim]." is still kept. tools/essay-rules-test.cjs 161/0 pins both repros. The acceptance (the content check does not depend on a verb list; the two repros pinned) is met. |
| `L1-eliska-12-EM2-2` After a rewrite holds, focus goes to 'Next sentence', which steps to n+1, not to the next… | minor | **562811ec** | The two halves of the row are both in code. 32ffdf92 (already narrowed at recert-11) sends Next sentence to the next faulty sentence: focusAfterRewrite lands on Next when the rewrite holds and another sentence is faulty (desk/src/tv/keys.ts:201-204) and nextFaultyAt (:206-213, called at :596) wraps to it. 562811ec (TL-7, ancestor of HEAD) puts the instruction on the TV page itself: Rewrite on my phone opens the rewrite hand-off (keys.ts:592 ask.open rewrite, kinds listed at :260), essayHandoffLine (:274-278) gives "On the phone: your rewrite. Back cancels." (or "No phone is connected. Back: cancel."), and the forensic Page draws it as the caption under "On your phone" (desk/src/essay/EssayT… |
| `L1-helena-46-EM1-3` The phone refuses a .docx that the PC page accepts | polish | **ee7d6ac7** | ee7d6ac7 (HEAD, ancestor of main) makes the phone's refusal name the PC page: essayFileProblem (desk/src/lib/rules/essay.ts:282) answers a .docx (by name or by the Word MIME type) with "The phone reads .txt and .md files. The PC page (/drop) reads .docx, or save the document as .txt and pick it again.", and the phone's Essay panel says "a .docx goes through the PC page" before any pick (desk/src/app/phone/page.tsx:837). Executed at ee7d6ac7: essayFileProblem({name:"a.docx",type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",size:1000}) returns that line. tools/essay-rules-test.cjs 161/0. The acceptance (the phone's refusal names the PC page for .docx) is met; the … |
| `L1-kristyna-17-EM3-2` GET /api/texts returns noticed and notice that no screen reads | minor | **a3db5db2** | a3db5db2 (ancestor of HEAD) makes the shelf read the fields: EssayShelf.tsx load() keeps noticed and notice from GET /api/texts (desk/src/app/phone/EssayShelf.tsx:18, :22) and draws the notice line, data-role="essay-shelf-notice", above the list until it is accepted (:42); the route still returns both (desk/src/app/api/texts/route.ts:40). tools/essay-piece-test.cjs 50/0 holds it. The acceptance (the shelf shows the notice line, or the fields are dropped) is met. Not screenshot-verified: L2. |

## Narrowed (still open)

| Row | Commit | What is still missing |
| --- | --- | --- |
| `L1-daniel-15-EM3-4` | a3db5db2 | provider is computed (desk/src/lib/desk/essay.ts:124, :135, :169, :194, :239, :294) and returned in the reading, and drawn nowhere on the TV or the phone. [narrowed by 176f04f0 (stats.words, stats.links, connectors drawn, EssayTV.tsx:484) and by a3db5db2 (the shelf reads noticed/notice from /api/texts and shows the notice line until it is accepted, EssayShelf.tsx:22, :42); still missing: provider.] |
| `L1-helena-46-EM1-4` | ffa91a49 | paragraphIsEnglish (desk/src/lib/rules/essay.ts:261-268) is unchanged since ffa91a49. On the recert-12 held-out probe (recert-12/heldout.json) all 48 Czech paragraphs, 5 of 5 German and 3 of 3 Polish are refused and 0 of 32 English texts; short Czech lines with diacritics 6 of 6, short plain-letter Czech lines 4 of 6 ("Preji hezky den.", "Venku fouka vitr." go to the model), because a paragraph under 6 words is judged by a laxer rule on purpose (:265). |
| `L1-kristyna-17-EM1-1` | ffa91a49 | On the recert-12 held-out probe 48 of 48 Czech paragraphs are refused (36 plain-letter, 12 with diacritics), against 59 of 60 on recert-11's; 4 of 174 over the three fresh probes still clear the check. Both arms of the acceptance stay open: refusal is not complete over all corpora (a leak at recert-11: "Kamarad mi pujcil knizku o vesmiru a ja ji precetl za dva dny."; short plain lines pass) and the verdict rules still hold English-only word lists (CONNECTORS essay.ts:14, EVIDENCE/LINK :16, CONTRAST :412, wordIn :425, noTurn :580), so a Czech paragraph that does clear the check is ruled on English lists with English advice. |

## Still open (nothing touched what they cite, or a commit narrowed only a part)

| Finding | Sev. | Title | Evidence at the new head |
| --- | --- | --- | --- |
| `2026-10-09-essay-l1/recert-12/L1-barbora-43-EM1-1` | major · rank 9 | The x-ray shows a hand-in-ready model paragraph on the topic of the phone's own sample pa… | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: desk/src/essay/EssayTV.tsx:547-549 (XRAY_ROWS, XRAY) still draw the three whole "Many students arrive at school exhausted" sentences; desk/src/app/phone/page.tsx:66 ESSAY_PLACEHOLDER is still the tired / sleep sample; desk/src/lib/session/store.ts:60… |
| `2026-10-09-essay-l1/recert-12/L1-barbora-43-EM1-2` | major · rank 9 | ES-READ grounding: the reading still never sees her earlier readings or notes, and no cli… | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: desk/src/app/api/analyse/route.ts:54 taskOf(body.task) is still the only way a task enters; the phone's piece call (desk/src/app/phone/page.tsx:316) and paragraph call (:343) send kind, text, type, keep, pieceId, source and format/title, no task; the… |
| `2026-10-09-essay-l1/recert-12/L1-barbora-43-EM4-1` | major · rank 8 | A paragraph-only evening's delete is out of reach when the TV is on a sentence or the pla… | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: EssayShelf is rendered once, in the paragraph panel (desk/src/app/phone/page.tsx:857, inside the screen === "paste" && !onSentence && !onPlan block opened at :836); the sentence panel (:822, onSentence :262) and the plan panel (:832, onPlan :270) car… |
| `2026-10-09-essay-l1/recert-12/L1-daniel-15-EM2-1` | minor · rank 6 | Dictate on the Essay tab and the rewrite panel listens in Czech for a cz learner, but the… | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: desk/src/app/phone/page.tsx:413 still sets r.lang = recogniserLang(s) for every phone recogniser, including the Essay panels' Dictate buttons (:823, :834, :855), and recogniserLang returns cs-CZ for a cz learner; the desk reads English. Cites re-mapp… |
| `2026-10-09-essay-l1/recert-12/L1-daniel-15-EM2-2` | minor · rank 4 | A rewrite of a sentence first ruled neutral as a later unsupported claim is ruled faulty:… | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: a rewrite is judged on its own: desk/src/lib/desk/essay.ts:288 decideVerdicts(lens.id, next.sentences, new Set([n]), ...), and only the first unsupported claim of a paragraph is faulty (desk/src/lib/rules/essay.ts:569 unsupportedSeen, :609), so a cla… |
| `2026-10-09-essay-l1/recert-12/L1-daniel-15-EM3-1` | major · rank 9 | The paste box and the shelf are hidden whenever the TV is on the forensic page, and Essay… | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: the paste box and shelf still render only when !onSentence && !onPlan (desk/src/app/phone/page.tsx:836); onSentence is set while the TV is on forensic with a reading (:262); Select on Essay Master still reopens forensic when ownReading (desk/src/tv/k… |
| `2026-10-09-essay-l1/recert-12/L1-daniel-15-EM3-2` | major · rank 9 | A title line is read as its own paragraph or fuses into sentence 1; the task never reache… | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: paragraphsOf (desk/src/lib/rules/essay.ts:86, :103) still reads a title line as its own paragraph or fuses it into sentence 1; the phone sends no task (desk/src/app/phone/page.tsx:316), the TV shows no title (EssayTV.tsx), and a question line followe… |
| `2026-10-09-essay-l1/recert-12/L1-daniel-15-EM3-3` | minor · rank 6 | Nothing says grammar and spelling are not checked; 'Well done' lands on sentences with er… | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: the strong note still reads "Well done" (desk/src/essay/EssayTV.tsx:426) and no caption says grammar and spelling are not checked; the faulty-note tables ADULT_CHECKS (desk/src/lib/rules/essay.ts:459) and YOUNG_CHECKS (:472) do not mention grammar or… |
| `2026-10-09-essay-l1/recert-12/L1-daniel-15-EM3-5` | major · rank 9 | No verdict lands until the last paragraph is read (C3 second clause fails by design) | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: decideVerdicts still runs only after the last paragraph is read (desk/src/lib/desk/essay.ts:204 para === of - 1, :236), the wait line is pieceReadingLine "Reading paragraph k of N." (desk/src/lib/rules/essay.ts:637), and EssayTV.tsx:421-422 still sho… |
| `2026-10-09-essay-l1/recert-12/L1-eliska-12-EM1-2` | minor · rank 6 | The forensic crumb, 'Its job' and the table show the regex first-pass role, which can con… | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: role is still the regex first-pass guess (desk/src/lib/rules/essay.ts:45, LINK.test ? link : EVIDENCE.test ? evidence : claim); EssayTV.tsx:430 (crumb), :439 ("Its job" and the move-type word) and :498 (table chip) still draw sn.role / x.role unlabel… |
| `2026-10-09-essay-l1/recert-12/L1-eliska-12-EM1-4` | major · rank 9 | The planted-claim fix depends on the model naming links (supports / backs): when it omits… | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: supports / backs are still optional in the request schema (desk/src/lib/desk/essay.ts:33, :35, not in required); the Evidence branch of decideVerdicts (desk/src/lib/rules/essay.ts:558-572, moved +4) still rules neutral when no accepted link and marks… |
| `2026-10-09-essay-l1/recert-12/L1-eliska-12-EM2-1` | minor · rank 6 | Kept verdicts go stale: after her rewrite adds the evidence, the earlier claim stays 'no … | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: reviseSentence (desk/src/lib/desk/essay.ts:255) still decides only sentence n (:288) and copies every other verdict unchanged (reading.verdicts.filter(v => v.n === s.n), :292); no line marks a kept faulty verdict that the rule would now clear. Cites … |
| `2026-10-09-essay-l1/recert-12/L1-helena-46-EM1-1` | minor · rank 6 | Adult mode's lens home, plan, playbook and x-ray speak only to school paragraphs | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: desk/src/essay/EssayTV.tsx:155 and :333 still say "one paragraph on the phone", EssayTV.tsx:547-549 is still the school x-ray sample, and desk/src/lib/library/lessons.data.ts:51 is still the Paragraph playbook entry; TL-7's Adult change is the kept-p… |
| `2026-10-09-essay-l1/recert-12/L1-helena-46-EM1-2` | minor · rank 3 | Four reading fields are computed and never shown (provider, stats.links, stats.words, sen… | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: the engine that read the text (provider) is drawn nowhere and sentences[].connectors is drawn nowhere (desk/src/essay/EssayTV.tsx:484 figs draw the stats words, claims, evidence, links, connectors counts only); the acceptance names the engine (her no… |
| `2026-10-09-essay-l1/recert-12/L1-helena-46-EM1-5` | minor · rank 6 | An email read on its own, or a piece read with Keep off, is still judged as an essay: the… | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: desk/src/app/phone/page.tsx:343 still posts kind essay, text, type with no format; the message/email/essay radios show only with Keep on and no open piece (:849-850); desk/src/lib/desk/essay.ts:159 takes the format only from a kept piece or a sent on… |
| `2026-10-09-essay-l1/recert-12/L1-helena-46-EM5-2` | minor · rank 3 | On /drop the notice's 'Read without keeping' reads nothing, and the empty shelf says piec… | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: desk/src/app/drop/page.tsx:86 renders TextNotice with no mode (default piece), so desk/src/app/phone/EssayShelf.tsx:66 still labels the decline "Read without keeping" on /drop; EssayShelf.tsx:48 still says pieces you read on the TV with "Keep it on m… |
| `2026-10-09-essay-l1/recert-12/L1-helena-46-EM5-3` | polish · rank 2 | Leaving a piece out of the exemplars still lets its text shape the dims and count toward … | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: desk/src/lib/twin/card.ts:46-48 still computes born (ps.length >= TWIN_BORN) and the dims over every piece ps, with the excluded filter only on the exemplars (:48); desk/src/app/drop/page.tsx:96 still promises "leave out anything you would not share"… |
| `2026-10-09-essay-l1/recert-12/L1-helena-46-EM5-4` | polish · rank 2 | .docx text: table cells become separate paragraphs and a non-breaking hyphen is dropped a… | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: desk/src/lib/rules/docx.ts:59 handles only w:tab, w:br and w:t per </w:p> split; a search for noBreakHyphen, w:tc and w:tbl in docx.ts finds none, so table cells are still separate paragraphs and a non-breaking hyphen is still dropped and glues the w… |
| `2026-10-09-essay-l1/recert-12/L1-kristyna-17-EM1-2` | major · rank 9 | ES-READ: kind and mode now reach the reading, a task has no sender and no history or memo… | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: desk/src/lib/desk/essay.ts:102-120 prompt carries person, task and format but no history; desk/src/app/api/analyse/route.ts:54 taskOf(body.task), :154, :172 hand a task to the reading; the phone's piece call (desk/src/app/phone/page.tsx:316) and para… |
| `2026-10-09-essay-l1/recert-12/L1-kristyna-17-EM1-3` | minor · rank 6 | A Czech paragraph that passes the language check gets notes in whatever language the mode… | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: the reading prompt (desk/src/lib/desk/essay.ts:102-112) still has no language instruction and the CHECKS lines are English (ADULT_CHECKS desk/src/lib/rules/essay.ts:459, YOUNG_CHECKS :472); a Czech paragraph that clears the language check (none of 48… |
| `2026-10-09-essay-l1/recert-12/L1-kristyna-17-EM1-6` | minor · rank 6 | Nothing says before the first send that Essay Master reads English; on the plan she write… | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: desk/src/app/phone/page.tsx:837 Essay panel copy ("Send a .txt or .md file (a .docx goes through the PC page), or type, paste or dictate a message...") still names no language; desk/src/tv/profileRows.ts:32 essay blurb has none; desk/src/tv/keys.ts:5… |

## Regressed

None. A regression would be a pair whose code verdict dropped, or a row that was fixed and came back; the rows fixed at earlier rounds were not re-walked (the rules suites cover them in the merge gate, `cd desk && npm run test:rules`). Suites run at ee7d6ac7 for this round: tools/essay-rules-test.cjs 161/0, tools/essay-piece-test.cjs 50/0, tools/week-digest-test.cjs 32/0, tools/tv-keys-test.cjs 80/0, tools/phone-panel-test.cjs 112/0, tools/phone-shell-test.cjs 17/0, tools/maths-tv-test.cjs 86/0, tools/gcse-rules-test.cjs 6/0, tools/school-stretch-test.cjs 13/0, tools/paper-draft-test.cjs 4/0.

## New findings for the next drain

None filed. The probe's two short plain-letter lines that pass are the open acceptance of L1-helena-46-EM1-4, so they are restated there rather than filed again.

## Method

Every row open in recert-11 (30) was re-walked at ee7d6ac7. A cite is a line of recert-11's evidence re-mapped through `git diff -U0 ffa91a49 ee7d6ac7` per file by a scratch script (/tmp/rc12/cites.cjs, outside the repo); a cite inside a replaced hunk or in a rewritten screen was re-read by hand against its replacement, and a row is never closed on the absence of a screen. Every commit named was checked an ancestor of main with `git merge-base --is-ancestor`. The rows the new commits claim to close were executed against the code in scratch scripts (decideVerdicts, cleanFix, essayFileProblem, recapLine) and the suites that pin them. A split row was scored on its own text: `L1-daniel-15-EM3-4` is narrowed, not fixed (a3db5db2 closes the notice half, `provider` is still drawn nowhere). Suites at ee7d6ac7: tools/essay-rules-test.cjs 161/0, tools/essay-piece-test.cjs 50/0, tools/week-digest-test.cjs 32/0, tools/tv-keys-test.cjs 80/0, tools/phone-panel-test.cjs 112/0, tools/phone-shell-test.cjs 17/0, tools/maths-tv-test.cjs 86/0, tools/gcse-rules-test.cjs 6/0, tools/school-stretch-test.cjs 13/0, tools/paper-draft-test.cjs 4/0.

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

## Confounded - do not read as a regression

| Confound | Covers | Run pair |
| --- | --- | --- |
| Walker and instrument are the same kind as recert-11 (an L1 code walk by the builder session); the product moved in five Essay commits (69b5b059, aa2d0cd5, f36296f2, a3db5db2, ee7d6ac7) and the TV-led work, which is why 6 rows are fixed. The fresh probe is written by the walker and is held out from the fix, not from the walker; English is checked on 32 texts only. | all rows | 2026-10-09-essay-l1/recert-11 -> 2026-10-09-essay-l1/recert-12 |
