# helena-46 × EM1 · (recert-12)

- Character: helena-46
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head ee7d6ac7
- Recertifies: 2026-10-09-essay-l1/recert-11 at ffa91a49
- **Verdict now: L1-conditional.** 1 fixed, 4 recur; 4 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-helena-46-EM1-1 Adult mode's lens home, plan, playbook and x-ray speak only to school paragraphs (minor) | recurs → L1-helena-46-EM1-1 | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: desk/src/essay/EssayTV.tsx:155 and :333 still say "one paragraph on the phone", EssayTV.tsx:547-549 is still the school x-ray sample, and desk/src/lib/library/lessons.data.ts:51 is still the Paragraph playbook entry; TL-7's Adult change is the kept-piece curtain's "Show the words on my phone" stop (EssayTV.tsx:82), which speaks of a piece, not of the lens home's school wording. Cites re-mapped through git diff -U0 ffa91a49 ee7d6ac7 per file; EssayTV.tsx:151 -> 155, :542 -> 548. None of the 43 commits since ffa91a49 changes what this row cites except as named. | none |
| L1-helena-46-EM1-2 Four reading fields are computed and never shown (provider, stats.links, stats.… (minor) | recurs → L1-helena-46-EM1-2 | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: the engine that read the text (provider) is drawn nowhere and sentences[].connectors is drawn nowhere (desk/src/essay/EssayTV.tsx:484 figs draw the stats words, claims, evidence, links, connectors counts only); the acceptance names the engine (her notice names Claude). Cites re-mapped through git diff -U0 ffa91a49 ee7d6ac7 per file; EssayTV.tsx:477-478 -> 483-484. None of the 43 commits since ffa91a49 changes what this row cites except as named. | none |
| L1-helena-46-EM1-3 The phone refuses a .docx that the PC page accepts (polish) | fixed | ee7d6ac7 (HEAD, ancestor of main) makes the phone's refusal name the PC page: essayFileProblem (desk/src/lib/rules/essay.ts:282) answers a .docx (by name or by the Word MIME type) with "The phone reads .txt and .md files. The PC page (/drop) reads .docx, or save the document as .txt and pick it again.", and the phone's Essay panel says "a .docx goes through the PC page" before any pick (desk/src/app/phone/page.tsx:837). Executed at ee7d6ac7: essayFileProblem({name:"a.docx",type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",size:1000}) returns that line. tools/essay-rules-test.cjs 161/0. The acceptance (the phone's refusal names the PC page for .docx) is met; the PC page still reads .docx (desk/src/app/drop/page.tsx:48). | ee7d6ac7 |
| L1-helena-46-EM1-4 A language the desk does not read is refused only when it is clearly Czech; sho… (polish) | recurs → L1-helena-46-EM1-4 | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: paragraphIsEnglish (desk/src/lib/rules/essay.ts:261-268) is byte for byte what it was at ffa91a49 (git diff ffa91a49 ee7d6ac7 touches essay.ts at :282, :320-346 and :555 only). Fresh held-out probe, recert-12/heldout.json: 36 plain-letter Czech paragraphs 36 of 36 refused, 12 diacritic Czech paragraphs 12 of 12, 5 German 5 of 5, 3 Polish 3 of 3, 31 English paragraphs and 1 short English line 0 of 32 refused; short Czech lines with diacritics 6 of 6 refused, short plain-letter Czech lines 4 of 6 (the two that pass: "Preji hezky den.", "Venku fouka vitr."). Still open: a short plain-letter line goes to the model by design of the under-6-words arm (:265). Cites re-mapped through git diff -U0 ffa91a49 ee7d6ac7 per file; rules/essay.ts:261-265 unchanged. None of the 43 commits since ffa91a49 changes what this row cites except as named. | ffa91a49 |
| L1-helena-46-EM1-5 An email read on its own, or a piece read with Keep off, is still judged as an … (minor) | recurs → L1-helena-46-EM1-5 | Re-walked at ee7d6ac7; what the previous walk (at ffa91a49) found still holds: desk/src/app/phone/page.tsx:343 still posts kind essay, text, type with no format; the message/email/essay radios show only with Keep on and no open piece (:849-850); desk/src/lib/desk/essay.ts:159 takes the format only from a kept piece or a sent one, and :163 analyseEssay(raw, type, learnerId, ...) still judges an email read on its own as an essay; desk/src/app/api/analyse/route.ts:19 types no format on kind essay. Cites re-mapped through git diff -U0 ffa91a49 ee7d6ac7 per file; phone/page.tsx:320 -> 343, :737 -> 849. None of the 43 commits since ffa91a49 changes what this row cites except as named. | none |

## New findings

None.

## Notes

- Evidence check at ee7d6ac7: every cited line was re-mapped through `git diff -U0 ffa91a49 ee7d6ac7` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
