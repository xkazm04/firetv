# helena-46 × EM1 · What my paragraph does (recert-1)

- Character: helena-46 (46, account manager, B2 business English, Adult mode, no age)
- Journey: EM1 What my paragraph does
- Cert level: L1 re-walk, code only, no model
- Head 782afdfb
- Recertifies 2026-10-09-essay-l1 at 12592a71
- **Verdict now: L1-conditional.** No blocker is open on this pair: a faulty sentence now carries code's own line, and the summary is code's. The reading still does not know she is an adult writing an email. A long Language sentence is still taught an essay move, and a one-paragraph email opened from the shelf is not kept as a new version (majors).

## Reachable surface (now)

- Phone Essay tab: paste, type or a .txt/.md file (`desk/src/app/phone/page.tsx:706-709`). One paragraph: "Analyse on the TV" posts `kind:"essay"` (`:307`, `:722`). Two or more: "Read the whole piece on the TV" with "Keep it on my shelf" ticked (`:718-720`, `:280`).
- The one-time engine notice now shows before the first paragraph read too (route `desk/src/app/api/analyse/route.ts:148`, phone `page.tsx:307-312`, buttons "I understand, read it" / "Not now" `desk/src/app/phone/EssayShelf.tsx:60-61`).
- Code refusals before any run: too long, not English (`route.ts:106-109`, `:143-146`).
- Reading: `desk/src/lib/desk/essay.ts:81-116`, verdicts in code (`desk/src/lib/rules/essay.ts:351-430`). Voice comes from age only (`route.ts:54`, `desk/src/lib/rules/voice.ts:75-78`).
- TV: lens home (`desk/src/essay/EssayTV.tsx:150-158`), forensic page (`:424-427`), table behind Menu (`:476-490`), playbook and x-ray (`:502-541`).

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| EM1-1 Adult readings written for 'a 15-year-old' student; mode never reaches the prompt (major) | **recurs** (minor now) | `voice.ts:68-72` TEEN essay 'a 15-year-old'; `:75-78` voiceOf has no mode; `route.ts:54` only learnerAge; `essay.ts:86`, `:90`, `:99` and `:236-246` 'writing tutor for a 15-year-old', 'a student can act on', 'The student's paragraph'. Repro: voiceOf('essay', learnerAge(adult profile)) -> {"band":"teen","who":"a 15-year-old"}. Narrowed: faulty notes and the summary are code's words now (`essay.ts:426`, summaryLine `:457`), so only strong and neutral notes carry the model's voice. Trust erosion drops to low (rank 6) | partial: 4158321b |
| EM1-2 The kind of writing never reaches the reading; Language falls back to 'Claim, then evidence, then the link back' (major) | **recurs** | `route.ts:16-18` no format in the body; `desk/src/lib/library/lessons.data.ts:41` language -> 'para', `:59-62` playFor; `essay.ts:608-613` taught falls back to the playbook; `desk/src/lib/desk/essay.ts:40` 'the desk counts length itself'; `EssayTV.tsx:427` 'The move · playbook · Paragraph'. Repro: a 46-word sentence -> faulty, no fix; taught -> 'Claim, then evidence, then the link back', own:false | — |
| EM1-3 A length-faulty sentence keeps the model's praising note (major) | fixed | `desk/src/lib/rules/essay.ts:423` length > 35 -> faulty with CHECKS.long; `:426` note = check line on every faulty verdict. Repro: note 'This sentence runs to 46 words; split it.' | 4158321b essay: E6 under a faulty verdict the words are code's |
| EM1-4 Lens home, plan, playbook and x-ray speak only to school paragraphs (minor) | **recurs** | `EssayTV.tsx:151` and `:328` 'Paste, type or dictate one paragraph on the phone'; `:158` 'paragraphs read'; `lessons.data.ts:49-54` Thesis/Paragraph/Order/Conclusion; `EssayTV.tsx:541` x-ray 'Many students arrive at school exhausted' | — |
| EM1-5 provider, stats.links, stats.words, sentences[].connectors computed and never shown (minor) | **recurs** | `desk/src/lib/desk/essay.ts:104`, `:143` provider on every reading; `desk/src/lib/rules/essay.ts:201-208` words, links; `EssayTV.tsx:476` figures draw sentences, claims, evidence, connectors, words avg only. Grep under essay/, app/phone, app/drop: 0 hits | — |
| EM1-6 Phone refuses a .docx the PC page accepts (polish) | **recurs** | `desk/src/lib/rules/essay.ts:190` '.txt and .md files'; `page.tsx:709` 'Choose a file (.txt or .md)'; `desk/src/app/drop/page.tsx:48-52`, `:82` .docx read on the PC page | — |
| EM1-7 No refusal for a language the desk does not read (polish) | **recurs** (in part) | `desk/src/lib/rules/essay.ts:171-176` refuses only a mostly-Czech paragraph; Czech with diacritics of 6+ words is refused (`route.ts:109`, `:146`). Repro: 'Dobrý den, posílám fakturu za říjen…' -> refused; 'Dobrý den, posílám fakturu.' (4 words), the same text typed without diacritics, and a German paragraph -> read as English and sent to the model | partial: 803c6075 essay: E3, E3-a code decides whether a paragraph is English; 0a53e75e (UD-19) |

## New findings

- EM1-10 (from 2026-10-14 L1-helena-46-EM1-10, still holds): open a one-paragraph kept email on the phone, change it, press "Analyse on the TV". The phone says "Change it, then read it again as a new version" (`page.tsx:297`), but one paragraph posts `kind:"essay"` with no pieceId (`:307`), and the route keeps nothing on that path (`route.ts:141-155`). Only the 2+ paragraph button adds a version (`:718-720`, `route.ts:115`). Major, rank 12.
- 2026-10-14 L1-helena-46-EM1-9 (a one-paragraph read goes to the engine with no notice) is **fixed** for the notice: the paragraph path now answers 428 before any run (`route.ts:147-148`, 0a53e75e UD-7), and the phone shows the notice with an accept button that retries (`page.tsx:307-312`, 274f3e42; wording 998153b3). The read paragraph still sits on the session until a newer reading; delete on the shelf clears it only when she has a kept piece to delete.
- 2026-10-14 L1-helena-46-EM1-8 (verdicts are code's, flagged words must be in the sentence) re-verified: `desk/src/lib/rules/essay.ts:351-430`.

## Notes

- Executed the rules with scratch `r1.cjs` and `r2.cjs` (voiceOf, decideVerdicts, taught, essayFileProblem, paragraphIsEnglish). No model call.
- EM1-1 is re-ranked minor because the lines she reads first (the faulty note, the summary caption and the spoken line) are now code's. A strong sentence's note is still written for a 15-year-old, so C3 is not yet safe.
