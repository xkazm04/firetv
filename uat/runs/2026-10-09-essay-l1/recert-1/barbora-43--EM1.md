# barbora-43 × EM1 · What does my paragraph do? (recert-1)

- Character: barbora-43 (Barbora, 43, Eliška's mother, external buyer; watches Eliška's seated profile, age 12, Family)
- Journey: EM1 What does my paragraph do? (watched from the sofa)
- Cert level: L1 re-walk, code only, no model
- Head 782afdfb
- Recertifies 2026-10-09-essay-l1 at 12592a71
- **Verdict now: L1-conditional.** Two ghostwriting gaps stay open (major): a strong or neutral note is still the model's text with no code check, and the x-ray still shows a hand-in-ready paragraph on the phone sample's topic. No blocker is open.

## Reachable surface (now)

- Phone Essay tab: the box still opens with the sample paragraph (`desk/src/app/phone/page.tsx:59,82`). Analyse posts `/api/analyse {kind:"essay"}` (`page.tsx:299-316`).
- Route: refuses too long (`desk/src/app/api/analyse/route.ts:143-144`) and not English (`route.ts:146`) in one line, then asks the one-time engine notice before the first reading (`route.ts:148`), with an accept button on the phone (`page.tsx:717`, `desk/src/app/phone/EssayShelf.tsx:54-64`).
- Reading: one model call that only observes (`desk/src/lib/desk/essay.ts:81-116`); code decides verdicts (`desk/src/lib/rules/essay.ts:351-435`). A faulty note is the failed check's own line (`rules/essay.ts:426`). The summary is code (`rules/essay.ts:457-472`, `desk/essay.ts:144`).
- Forensic page: her sentence quoted, the caption slot shows the note under 'Look again', 'Well done', 'Neutral' or 'Rewrite · it holds' (`desk/src/essay/EssayTV.tsx:410-420`); THE MOVE / THE PATTERN is the reading's fix or the lens's playbook fallback (`EssayTV.tsx:310-314`).
- Why → playbook → Select → x-ray (`desk/src/tv/keys.ts:469,476`; `EssayTV.tsx:539-575`).

## Prior rows

| Finding | Status | Evidence (current code) | Commit |
|---|---|---|---|
| L1-barbora-43-EM1-1 notes and summary have no code guard (major) | **recurs** (narrowed, major) | Summary is code (`rules/essay.ts:457-472`) and a faulty note is the check line (`rules/essay.ts:426`). A strong or neutral note is still the model's, through `cleanNote` only (`rules/essay.ts:317-320,425`), shown on the TV (`EssayTV.tsx:416,419,420`). Repro: a neutral note that is her sentence 1 whole, and a neutral note 'You could write: Most schools here start at 8:00, before teenage brains wake up.', both pass. Major by impact (see Notes) | partial 4158321b essay: E6 under a faulty verdict the words are code's |
| L1-barbora-43-EM1-2 x-ray shows a hand-in-ready paragraph on the sample's topic (major) | **recurs** (major) | `EssayTV.tsx:540-544` the same three sleep sentences; sample `page.tsx:59`; seeded task 'Later school starts — first draft' `desk/src/lib/session/store.ts:564`. Major by impact (see Notes) | — |
| L1-barbora-43-EM1-3 ES-READ grounding 3/8 (major) | **recurs** | `desk/essay.ts:86-103` prompt carries voice.who (age band), the lens, the numbered sentences and counts; `route.ts:128,151` pass text, lens, learner, age only. No task, history, notes, mode or kind. Still S1 S2 S4 = 3/8 | — |
| L1-barbora-43-EM1-4 Language lens falls back to the Paragraph move (minor) | **recurs** | `desk/src/lib/library/lessons.data.ts:41` language → 'para'; `EssayTV.tsx:310-314`. Repro: `taught()` with no own fix under Language gives 'Claim, then evidence, then the link back' | — |
| L1-barbora-43-EM1-5 no language check before the wait (minor) | fixed | `route.ts:146` (paragraph) and `route.ts:109` (piece) refuse with `NOT_ENGLISH_LINE` (`rules/essay.ts:138,171`) before any run. Repro: a Czech paragraph, with and without diacritics, is not English | 803c6075 essay: E3, E3-a code decides whether a paragraph is English before any verdict or count |
| L1-barbora-43-EM1-6 sample prefilled and filed as hers (minor) | **recurs** | `page.tsx:59,82,423` the box opens and resets to the sample; `desk/essay.ts:123-134` record() files any reading for the seated learner, with no check for the unchanged sample | — |

## New findings

- None in this pair.
- Lead rows EM1-7, EM1-8 and EM1-9 (strengths) still hold: `cleanFix` refuses a 4-word run (`rules/essay.ts:244-248`), the page points at her own sentence, and too long / wrong file are refused in a sentence.

## Notes

- Repro: `C:/Users/kazda/AppData/Local/Temp/essay-recert/scratch-barbora-43/repro.cjs` (pure rules, no model, DESK_DATA_DIR in scratch).
- EM1-1 is a missing code guard, not an observed breach. Whether the model actually writes such notes is an L2 count. Severity ruling (orchestrator): kept at major 9 by impact, as the 2026-10-09 walk and the Math recert filed a blind backstop. The rubric boundary (always blocker) is a seen ghostwriting breach, and this code-only walk saw no model output.
- The Language fallback also covers the code-decided long sentence (`rules/essay.ts:423`): the model was never told the sentence is long, so a fix is unlikely and the Paragraph move shows.
