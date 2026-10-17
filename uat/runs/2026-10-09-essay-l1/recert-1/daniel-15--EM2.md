# daniel-15 × EM2 · Fix it myself (recert-1)

- Character: daniel-15 (15, first-year gymnázium, Brno; pastes a whole four-paragraph essay with a title line)
- Journey: EM2 Fix it myself
- Cert level: L1 re-walk, code only, no model
- Head 782afdfb
- Recertifies 2026-10-09-essay-l1 at 12592a71
- **Verdict now: L1-conditional.** Three of five rows are fixed (the rewrite is ruled over the same whole piece as the first reading, a faulty caption is the code's check line, 'Some' is no longer a link), but the ghostwriting backstop still lets a pattern slot carry a whole pasteable sentence and leaves strong and neutral notes unchecked (C1; major by impact, no breach observed), and rewrites still never reach the phone's text or the shelf.

## Reachable surface (now)

- Phone Essay tab, rewrite panel when the TV is on a forensic page with a reading (`desk/src/app/phone/page.tsx:231`, `:691-697`); Send posts kind `rewrite` (`page.tsx:244-247`).
- Route `rewrite`: refused before any run while the piece is still being read (`desk/src/app/api/analyse/route.ts:69`), for an unruled paragraph (`:72-73`), and by `revise` (`:74-75`); then `reviseSentence` (`desk/src/lib/desk/essay.ts:227-267`).
- Rule: the rewrite is decided over the whole piece with the kept `supports` links as context (`desk/src/lib/desk/essay.ts:260`, `desk/src/lib/rules/essay.ts:548-562`); every other verdict copied by code (`essay.ts:264`).
- TV forensic page: 'Rewrite · it holds' / 'Rewrite · not yet' captions (`desk/src/essay/EssayTV.tsx:416-417`); the move inks only on `holds` (`EssayTV.tsx:336,342`).
- Prompts are assembled with the learner's sentences as quoted data and the DATA_CLAUSE (`desk/src/lib/prompt/assemble.ts:34-36`, `essay.ts:243-254`).

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| EM2-1 a piece rewrite is ruled against cross-paragraph context while the first reading was paragraph-only, so a near-unchanged thesis 'holds' (major) | fixed | The piece is ruled once over every paragraph's observations (`desk/src/lib/desk/essay.ts:176`) and the rewrite over the whole piece with the kept links (`essay.ts:260`). Repro on a 5-block essay: thesis faulty, rewrite 'In my opinion phones should not be banned.' -> faulty, state still. | da4379a8 essay: E2 a piece is ruled once over the observations of all its paragraphs (with 0a148283, E1 a rewrite is ruled against the kept links) |
| EM2-2 a still-faulty rewrite's caption is the model's note (major) | fixed | `desk/src/lib/rules/essay.ts:426` a faulty note is always the check line; `EssayTV.tsx:417` shows it. Repro: model note 'A clear claim.' -> note 'This claim has no evidence after it that a reader can check.' | 4158321b essay: E6 under a faulty verdict the words are code's |
| EM2-3 LINK regex lacks a word boundary (major) | fixed | `desk/src/lib/rules/essay.ts:15` ends `)\b/i`. Repro: 'Some…', 'Social…', 'Sometimes…', 'Soon…', 'Software…', 'Solutions…' -> claim; 'So schools should ask.' -> link. | 0a53e75e fix(desk,uat): UAT 2026-10-14 build items (UD-18 link words need a word boundary) |
| EM2-4 ghostwriting backstop is narrow (C1) (major) | **recurs** (major) | Narrower: the summary is code's (`rules/essay.ts:457-471`), a faulty note is code's (`:426`), and his text is quoted data under DATA_CLAUSE (b10bf34c). Still: `cleanFix` compares literal words with the same sentence only (`rules/essay.ts:245-249`), so a frame copying a neighbour sentence passes, and a slot may hold a whole sentence (`:226`, slot up to 60 chars, literal words counted outside slots only, `:240-243`); a strong or neutral note is the model's (`:425-426`). Repro: pattern '[Phones stop students listening, so they lose marks in tests].' kept; strong note 'Try: "Phones are useful because apps like Quizlet help us learn new words."' kept. Severity: C1 is a ghostwriting boundary, rated blocker whatever the rank. | partial b10bf34c |
| EM2-5 rewrites never reach the phone's text or the shelf (major) | **recurs** | `page.tsx:244-247` sendRewrite sets no paragraphs; `page.tsx:275,280` readPiece sends `paras.join`, the unrevised text; with Keep, `route.ts:118` reads on after 'kept last'; `desk/src/lib/session/store.ts:780-781` essay.set replaces the reading that held the rewrites. Repro: addVersion(same text) -> 400 'That is the version you kept last.' | — |

## New findings

- **N1 (minor, rank 4).** A rewrite of a sentence the first reading ruled neutral as a later unsupported claim is ruled faulty, so it shows 'Rewrite · not yet'. The first reading faults only the first unsupported claim (`rules/essay.ts:416`, `unsupportedSeen`); a rewrite judges one sentence alone, so that sentence is always the first (`essay.ts:260`). Repro: conclusion 'Schools should make rules instead.' was neutral; rewrite 'Schools should make some rules instead.' -> faulty, state still.
- **N2 (minor, rank 6), from 2026-10-14 L1-daniel-15-EM2-7, now confirmed.** Dictate listens in Czech for a `cz` learner (`desk/src/app/phone/recogniserLang.ts:7-8`, `page.tsx:373`), on the rewrite, plan and paragraph panels, while Essay Master reads English only.
- 2026-10-14 L1-daniel-15-EM2-6 (refusals before any call, the move inks only on a hold) still holds: `rules/essay.ts:581-594`, `EssayTV.tsx:336,342`.

## Notes

- Executed `splitSentences`, `decideVerdicts`, `contextObservations`, `revise`, `rewriteState`, `cleanFix` on a 5-block essay (scratch `t1.cjs`) and `addVersion` with a scratch data dir (`t2.cjs`). No model call, so whether the model writes a sentence into a slot is unmeasured; the row is about the missing code backstop.
- The rewrite context still uses first-pass roles for the other sentences, not the model's observed jobs (`rules/essay.ts:559-560`); the kept `supports` links make the common case agree with the first reading.
- EM2-4: Severity ruling (orchestrator): kept at major 9 by impact, as the 2026-10-09 walk and the Math recert filed a blind backstop. The rubric boundary (always blocker) is a seen ghostwriting breach, and this code-only walk saw no model output.
