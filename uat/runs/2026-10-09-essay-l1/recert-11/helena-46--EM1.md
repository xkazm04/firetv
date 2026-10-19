# helena-46 × EM1 · (recert-11)

- Character: helena-46
- Journey: EM1
- Cert level: L1 re-walk, code only, no model
- Head ffa91a49
- Recertifies: 2026-10-09-essay-l1/recert-10 at 6b189791
- **Verdict now: L1-conditional.** 0 fixed, 5 recur; 5 rows open. (was L1-conditional)

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
| --- | --- | --- | --- |
| L1-helena-46-EM1-1 Adult mode's lens home, plan, playbook and x-ray speak only to school paragraphs (minor) | recurs → L1-helena-46-EM1-1 | Re-walked at ffa91a49; what the previous walk found (at 6b189791) still holds: Cited lines re-found at 6b189791: desk/src/essay/EssayTV.tsx:151 and :328 still say 'one paragraph on the phone', desk/src/essay/EssayTV.tsx:542 still the 'Many students arrive at school exhausted' x-ray sample, desk/src/lib/library/lessons.data.ts:51 the Paragraph playbook entry. The only EssayTV change since b7fca776 (176f04f0) is the Table figures line :477; nothing speaks of messages or emails in Adult mode. At ffa91a49 the cited lines of changed files sit at essay/EssayTV.tsx:542->543 (hunks re-read: they only add the lines named in the commit messages). None of the seven commits since 6b189791 (b75bd45f curtain on a kept piece, 61a8e2ee young voice, ffa91a49 Czech shape; 56f903ae, da6f9f07, 3240d025, e9c5ee8f are Math) changes what this row cites. | none |
| L1-helena-46-EM1-2 Four reading fields are computed and never shown (provider, stats.links, stats.words, sen… (minor) | recurs → L1-helena-46-EM1-2 | Re-walked at ffa91a49; what the previous walk found (at 6b189791) still holds: narrowed by 176f04f0; still missing: The engine that read the text (provider) is still shown nowhere and sentences[].connectors is still drawn nowhere; the acceptance names the engine (her notice names Claude). At ffa91a49 the cited lines of changed files sit at essay/EssayTV.tsx:477->478 (hunks re-read: they only add the lines named in the commit messages). None of the seven commits since 6b189791 (b75bd45f curtain on a kept piece, 61a8e2ee young voice, ffa91a49 Czech shape; 56f903ae, da6f9f07, 3240d025, e9c5ee8f are Math) changes what this row cites. | none |
| L1-helena-46-EM1-3 The phone refuses a .docx that the PC page accepts (polish) | recurs → L1-helena-46-EM1-3 | Re-walked at ffa91a49; what the previous walk found (at 6b189791) still holds: Cited lines re-found at 6b189791 (rules/essay.ts moved the cite to :270). desk/src/lib/rules/essay.ts:270 essayFileProblem still says the desk reads .txt and .md files and refuses anything else; desk/src/app/phone/page.tsx:728 still labels 'Choose a file (.txt or .md)' with accept .txt,.md; desk/src/app/drop/page.tsx:48-50 still reads .docx. The phone refusal does not name the PC page and the phone does not read .docx. At ffa91a49 the cited lines of changed files sit at lib/rules/essay.ts:270->282 (hunks re-read: they only add the lines named in the commit messages). None of the seven commits since 6b189791 (b75bd45f curtain on a kept piece, 61a8e2ee young voice, ffa91a49 Czech shape; 56f903ae, da6f9f07, 3240d025, e9c5ee8f are Math) changes what this row cites. | none |
| L1-helena-46-EM1-4 A language the desk does not read is refused only when it is clearly Czech; short Czech,… (polish) | recurs → L1-helena-46-EM1-4 | paragraphIsEnglish (desk/src/lib/rules/essay.ts:261-268) is unchanged apart from czechShape feeding the Czech share; the under-6-words arm (:265) still needs two Czech words beating the English ones, so a short plain Czech line passes (round-11 probe: 'Rad chodim lesem.', 'Dnes nikam nejdu.', 'Kde bydlis ted?', 'Skola me bavi.', 'Neumim to rict.'). | ffa91a49 (narrows) |
| L1-helena-46-EM1-5 An email read on its own, or a piece read with Keep off, is still judged as an essay: the… (minor) | recurs → L1-helena-46-EM1-5 | Re-walked at ffa91a49; what the previous walk found (at 6b189791) still holds: Cited lines re-found at 6b189791, untouched by any commit: desk/src/app/phone/page.tsx:320 posts kind essay, text, type with no format; :739 shows the message/email/essay radios only with Keep on and no open piece; desk/src/lib/desk/essay.ts:163 analyseEssay(raw, type, learnerId, age, reader) has no format parameter and its judge call passes format undefined (:167); desk/src/app/api/analyse/route.ts:17-18 the essay body has no format. So a single pasted email is still read as an essay. None of the seven commits since 6b189791 (b75bd45f curtain on a kept piece, 61a8e2ee young voice, ffa91a49 Czech shape; 56f903ae, da6f9f07, 3240d025, e9c5ee8f are Math) changes what this row cites. | none |

## New findings

None.

## Notes

- Evidence check at ffa91a49: every cited line was re-mapped through `git diff -U0 6b189791 ffa91a49` per file (a cite inside a changed hunk re-read by hand). Every commit named was checked with `git merge-base --is-ancestor <sha> HEAD`. Model-dependent behaviour stays with L2.
