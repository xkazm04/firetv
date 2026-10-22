# Loading states and their theme, 2026-10-22

Owner report: a loading screen often blinks into the old unified On Air view instead of keeping the look of the module
the learner is in. This audits every wait a learner meets on the TV and the phone, and records what was changed.

The decision is `desk/src/tv/look.ts` (pure, pinned by `tools/tv-look-test.cjs`): `lookOf` (whose look the TV is in),
`lookOfWait` (a wait the On Air shell would have drawn that belongs to a module), `lookToRemember`. `tv/LookWait.tsx`
only draws it: the module's own root (`.maths-tv`, `.essay-tv`, `.linga-tv`) for the ground and faces, plus one fixed
line (`design/loading-look.css`). Nothing in a wait carries the page's or the learner's words, so nothing can put an
answer on screen.

## Audit

| State | Where | Look before | Look after |
|---|---|---|---|
| TV first paint, session not yet arrived (also a dropped stream) | `app/tv/page.tsx` (`s === null`) | On Air grid on `--ink`, empty (the shell's `.grid` + `.safe`), whatever module the learner was in | the last module look this browser drew (`localStorage` `desk-look`): Math Buddy night + lamp, Linga cream, Essay Master dark, the paper ground; neutral plain ink (no grid) when none is known. Before hydration the server HTML is the neutral ground. |
| Page being read, subject English or Essay (`reading`, screen `page`) | `app/tv/page.tsx` -> `tv/screens.tsx` `PageScreen` | On Air page screen ("Linga · the page" on the grey grid with a red band) | Linga cream / Essay Master dark ground with "Reading the page..." until the read lands |
| Page being read, Math Buddy | `maths/MathsTV.tsx` `PageScreen` | Math Buddy (own `mb-reading`) | unchanged |
| Practice set being written (`busy`, `jobs.practice`) | `maths/MathsTV.tsx` Topics/Prepare | Math Buddy ("Preparing", `PREP` lines) | unchanged |
| Hint in flight / "Looking for a lesson" / "Waiting for the photo" | `MathsTV.tsx` | Math Buddy | unchanged |
| Essay read, piece read, rewrite running | `essay/EssayTV.tsx` (`READING_LABEL`, `PIECE_WAIT`) | Essay Master | unchanged |
| Linga turn, check, moment pending | `english/LingaTV.tsx` (`useEnglish`, `v.busy`) | Linga | unchanged |
| Landing before/while zooming into an app | `landing/LandingTV.tsx` | paper | unchanged (not touched) |
| Link lost banner | `app/tv/page.tsx` | red On Air banner over whatever is drawn | unchanged: a system notice, over the module's look |
| Not this desk's TV (lobby) | `NotThisTV` | On Air | unchanged: no module is known |
| Pair / joined / learner / profile / recap / break | On Air shell | On Air | unchanged: cross-module desk screens, On Air is law for them |
| Hint, lesson, units, head-to-head, sentence of English or Essay (settled, not waiting) | `tv/screens.tsx` | On Air shell | **left as is** (open, below) |
| Route-level `loading.tsx`, `Suspense` fallbacks | `desk/src/app` | none exist | n/a |
| Phone: first paint, "Looking for the TV...", "the desk is reading...", job buttons | `app/phone/page.tsx` | one phone look (light card, `.phone`), no per-module theme anywhere | unchanged: the phone has a single design language, so there is no module look to flash away from |
| Linga phone and print waits | `english/LingaPhone.tsx`, `app/english/print/page.tsx` | Linga (`.linga-print`, `.linga-phone`) | unchanged |
| Fatal error | `app/global-error.tsx` | On Air charcoal | unchanged: no session to ask |
| stick-app splash/probe | `stick-app/` | not in `desk/` | out of scope |

## Captures (Playwright, own dev server on 3201, own `DESK_DATA_DIR`, 1920x1080)

The "Lost the desk link" strip in the captures is the harness: the stream is blocked or replaced by one mocked message.

- before: `loading-states-2026-10-22/before/first-paint.png`, `before/page-reading-english.png`, `before/page-reading-essay.png`, `before/english-units.png` (the settled shell screen, for reference)
- after: `after/first-paint-{neutral,maths,linga,essay,paper}.png` (the remembered look), `after/page-reading-{english,essay}.png`, `after/page-reading-maths.png` (unchanged Math Buddy)

## Open for the owner

- English and Essay settled screens of the shared shell (page with items, hint, lesson, units, head-to-head, sentence) are still On Air.
  A learner who opens a page in Linga or Essay Master still passes from the themed wait to an On Air page. A full fix is design work
  (their own page/hint screens), not a wait: say if it is wanted.
- The remembered look is a browser hint only; it is neutral on a first-ever visit and in a private window.
- The phone has no module themes; giving it any is a design decision.
