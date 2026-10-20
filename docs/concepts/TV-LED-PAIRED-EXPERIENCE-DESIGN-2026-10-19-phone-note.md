# Phone fixes after the stick pass

A note under "Stick pass 2026-10-20" in `TV-LED-PAIRED-EXPERIENCE-DESIGN-2026-10-19.md` (that file is not edited here). Both rows are in `desk/src/app/phone/page.tsx`, each with cases in `tools/phone-panel-test.cjs`.

| # | Finding | State |
|---|---|---|
| MB5-2 | UAT `2026-10-09-maths-l1/recert-13/L1-radka-41-MB5-2`. The phone's Recap named every learner with work tonight. Operator ruling (b), 2026-10-20: keep the privacy strip. | **Fixed.** The Recap shows the seated learner only, then one line, "The other learners' evenings show on the TV.", when others have work. With no one seated it shows the plain Tonight tiles and no other learner's name. This week was already the seated learner's own (`s.learner ? s.week : null`), pinned now. `desk/src/tv/recapRows.ts` and the TV's recap are untouched. |
| F6 | The `rewrite` and `slot` panels carried the whole paragraph composer (paste box, Analyse on the TV, whole-piece read, shelf). | **Fixed.** Each panel is one field, Dictate and Send (section 2.2). The slot panel keeps its fit line, and the rewrite panel its wait line and its Next paragraph button (`tools/essay-piece-test.cjs` and `tools/essay-file-live.cjs` pin that button). The paste box, read, send and shelf live on the paragraph panel only. The old shared-panel pins in `tools/phone-panel-test.cjs` now name that panel alone. |

The bar stays at most 3 items at 360 and 414 px (`tools/phone-shell-test.cjs`, TL-10), as no bar item changed.
