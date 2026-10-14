# L2 Adult (empirical, live browser): 2026-10-14, product at 0a53e75e

Written by the orchestrator from the executing agent's summary; per-check detail is in `linga/results.json` and `essay/results.json`. One isolated desk (scratch data dir, port 3251, claude CLI), `ADULT=1` on `tools/linga-ui-test.cjs` and `tools/essay-ui-test.cjs` (UD-25). The default Family path is unchanged.

## Linga Adult: 12 pass, 0 fail, 2 skipped
Learner type other, no age, mode adult. Pitch, three turns, Cut and Take Two pass against the real model; all 3 Cut notes quote the learner's own lines. A Family-mode age-22 profile gets 403 on the `date` scene and on Pitch, and its phone shows no Pitch box and no adult scene. Skipped: speech and heard audio.

## Essay Adult: 18 pass, 0 fail, 1 skipped
Notice first, then a titled essay kept and read (3 paragraphs, 20 s); the Workroom screen shows no kept text; delete-all clears `session.essay` and no kept words remain in the data dir (UD-6 live). Twin card: 409 before the twin is born, 200 after three messages, 403 for the TV key and for a Family-mode 18+ profile. Skipped: dictation, .docx upload, camera.

## Observations (not defects)
- The TV forensic page shows the read text: that is the reading act, not the Workroom screen.
- The twin labels casual messages "Formality: ceremonial" (probably `desk/src/lib/twin/card.ts`): a lead for the next L1 of EM5.

## Ceiling
Adult mode is now live-certified for the happy path of Linga (Company) and Essay (Workroom/Twin). Math Adult (Calculus) still has no L2: it needs the vision host for photo reading, and there is no typed-route harness.
