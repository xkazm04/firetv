# Small Worlds: the Study Desk landing

**Chosen 2026-09-29** in the study-desk-landing-fresh contest (entry A, variant 1; it replaces "Left on the Desk",
chosen 2026-09-25). The landing is the first screen of the TV app: whose desk it is, and which of the three apps to
open. It is the umbrella over three apps that already have their own design languages - Math Buddy is
[Lamplight](DESIGN-MATH-BUDDY.md), Linga [the Open Door](DESIGN-LINGA.md), Essay Master [Specimen](DESIGN-ESSAY-MASTER.md) -
and its job is to hold them together without flattening them. The rest of the shell (pairing, the learner switcher,
profile, break, recap) stays [On Air](DESIGN-ON-AIR.md); the recap's tiles are the exception inside it, each drawn in
its own app's language (see "Tonight, done" below).

## The idea in one line

**Each app is a small world, and the one in the light fills the screen.** Its name is cut from paper over layered
hills, stairs, a hotel desk or a page; a paper shelf below holds what that world has waiting for this learner, one
arched tile per app, and the one big action: *Continue as Ema*.

## Structure: data, keys, look

The landing is split so its look is a **theme** and nothing else is:

| Piece | File | Owns |
|---|---|---|
| The session's rows | `desk/src/tv/landingRows.ts` | which apps are on the desk, the stops, what each app has waiting, where the light rests |
| The keys | `desk/src/tv/keys.ts` (`landing`) | the D-pad, the Select hand-off's step, Back, Menu |
| The view-model | `desk/src/landing/model.ts` | the caption (about 25 words), the art state of each app, the two actions' words, the phone's real code and address, the honesty rules; pure, no React |
| The seam | `desk/src/landing/LandingTV.tsx` | reads the session once, keeps "the room is being entered" and "the app the D-pad was last on", hands both to the theme |
| A theme | `desk/src/landing/themes/<id>/` | only what the eye sees: `paper` (below) and `blueprint` (locked) |
| The registry | `desk/src/landing/themes/index.ts` | `THEMES`, `themeFor()`, and `THEMES_ENABLED` (false) |
| The Select hand-off's wait | `desk/src/app/tv/page.tsx` | plays the theme's zoom, waits `ZOOM_MS` (560), then runs the step; reduced motion does not wait |

The default theme, **paper**, is contest A/1. `desk/src/landing/themes/paper/` draws it: `Paper.tsx` (the landing),
`worlds.tsx` (the key art per app, as layered SVG components), `stamps.tsx` (each app's small arched picture),
`glyphs.tsx` (the house mark, the icons, the pairing postcard's picture), `shapes.tsx` (bars, clouds, seeded hills, the
shared gradients). Its CSS is `desk/src/design/desk-landing.css`, scoped under `.desk-tv.pp` with `pp-` classes and
loaded from `app/globals.css` like the other designs. Its faces - Fraunces for the paper-cut names and headings, DM
Sans for words, DM Mono for the pairing code - are self-hosted by `next/font` (`desk/src/landing/fonts.ts`).

### The blueprint theme is kept and locked

Contest A/3, a drafting-sheet look (a blue blueprint sheet, an index list, a callout with a leader line, line
drawings), was shortlisted, not chosen. It is ported as the second theme (`themes/blueprint/`, CSS in
`design/desk-landing-blueprint.css` under `.desk-tv.bp`, faces in `themes/blueprint/fonts.ts`) so the look is kept,
typechecked and testable. **Nothing can select it**: `THEMES_ENABLED` is `false`, so `themeFor()` answers paper to any
request; no route, query parameter, setting, storage key or profile field names a theme; `LandingTV` asks the registry
for the default with no argument. The owner will later split the look by age (a children's landing, an adolescent
one); until product decides the tiers, turning themes on means flipping the constant *and* giving it a real source in
the same change. `tools/tv-landing-test.cjs` proves the blueprint renders when a test instantiates it and that the app
cannot reach it (it fails if anything else names it or asks `themeFor()` for a theme). Bundling: the registry imports
the blueprint statically, so its code and CSS still ship though they are never drawn; making it tree-shake would mean
a dynamic import, left for the day the flag is turned on.

## Principles

1. **Only what is real, and only this learner's.** Every word and number is read off the session
   (`landing/model.ts`). A set, a conversation or a reading belonging to someone else is not shown. An app with
   nothing on the desk says so in two words ("Not started", "Nothing read"), never invented progress: its art shows
   no lit step, no level, no paragraph. Only the apps on the profile lie on the shelf; no age is compared for a
   learner without a school system.
2. **The world in the light says what is waiting, in pictures first.** Math Buddy's stairs are lit by the marked
   set's right answers, of the questions asked, with the lantern on the next step; Linga's reception shows the
   waiting or unfinished conversation (its bubble stops mid-way when it was left) and the empty hook; Essay Master's
   page shows the paragraph's sentence bars with the one that argues the other way in coral and the loupe on it.
   The art is stylised and says so ("Stylised" on the hand-off).
3. **A television, not a book.** One caption slot on the shelf: a chip (when: Marked, Left Wednesday, Read yesterday,
   Next up), one headline, one line under it - about 25 words. The big button names what Select does on the app in
   the light (*Continue as Ema*, *Start as Ema* when nothing is waiting, *Choose who is studying* when no one is
   seated).
4. **One thing in the light.** The tile of the app in the world is lifted and ringed (indigo, then warm gold); the
   others sit desaturated. The light starts on the app with something waiting (marked, then left mid-way, then the
   next step, then the last thing done; the most recent on a tie), else on the phone while none is paired, else on
   the first app. The world stays on the last app while the D-pad is on Someone else or the phone.
5. **The phone is a stop only while it is unpaired.** Paired, it is a chip beside who is at the desk. Unpaired, it is
   a postcard with the desk's real address and four-digit code in big type; Select opens the pairing screen.
6. **The learner is a disc.** Top right: the phone, the learner's initial in a colour by their place in the profiles,
   their name. No one seated: "Whose desk?".
7. **Ten-foot law.** 1920 x 1080 stage, 5% safe zone (96 / 54 px) for every word and control (the art and the paper
   shelf bleed off the edge on purpose); nothing meaning-carrying under 28 px; the 20 px chips and key hints are
   uppercase labels that never carry a meaning alone; D-pad only. `tools/tv-landing-live.cjs` measures the safe
   zone, the type floor and the caption's word count on the real page at 1920 x 1080 and 1280 x 720.

## The D-pad

| Key | What it does |
|---|---|
| Left / Right | the light moves along the shelf of apps (clamped at both ends); the world slides the way it went |
| Up | from an app, to the unpaired phone (top right); nothing when it is paired. From Someone else, back to the app above it (the middle one) |
| Down | from an app, to Someone else (bottom right). From the phone, back to the last app |
| Select | an app: the hand-off, then its home (Math Buddy Tonight, Linga home, Essay Master's lenses); Someone else: the learner switcher; the phone: pairing; with no one seated, any app opens the switcher first |
| Back | the light goes home to where it rests (principle 4) |
| Menu | ends tonight, wherever the light is: the recap, and what the desk noticed is written (`/api/memory`), as the phone's End session does |

The big *Continue as ...* button is not a stop of its own: it names what Select does on the app in the light.
Arriving without a stop named (a fresh desk, a nav with no focus) the focus is `LANDING_REST` (-1) and the light
rests on the CONTINUE app; with no phone paired and nothing waiting the lamp rests on the phone, else on the first app
(`restStop`). Back from an app's home, the switcher or pairing lands on the object it came from. (When this look
replaced Left on the Desk, Up and Down swapped to follow where the phone and Someone else now sit.)

## Tonight, done (the recap)

Menu on the desk ends the evening and shows it as one picture (`desk/src/tv/recapRows.ts`, the `Recap` screen in
`desk/src/tv/screens.tsx`): one tile per app on the profile, in the desk's order, each from tonight's work only (the
dated history lines and Linga's conversations since local midnight). Math Buddy's sheet carries a pen tick per right
answer and a ring per slip for each marked set, a page per sheet read and an amber lamp per hint, ringed when it took
a second. Linga's card holds a plum mark per conversation, sized by its replies. Essay Master's black card has an
arrow per sentence read, the ones to fix turned round in citron. An app with nothing tonight says "Not tonight". No
problem text, question or answer is on it; the caption slot holds the one sentence. Left / Right walk the tiles and
then "Back to the desk"; Select on a tile opens what that app still has on the desk (the marked set at its first
slip, this learner's reading, Linga's home); Back, or the desk, is this landing with the light at rest. "On the
parent's phone" is a chip, not a stop: the phone's Recap tab already shows the evening.

**The Sunday page (the recap's companion, parent only, in words; Family W9).** Under tonight's recap, the phone's Recap
tab (Parent role) carries "This week": the seated learner's past seven days (local midnight six days back to now),
written by code from the learner's own weekly digest (`desk/src/lib/rules/digest.ts`, `desk/src/lib/rules/week.ts`),
never by a model. In order, and only where something true can be said: how many evenings had work; Math Buddy, per unit
worked (three at most, then "and N more"), the last set's count right, and "a step up taken" in words; one thing to look
at, the week's most frequent code-detected slip by its plain name, only when it came twice or more, phrased as a fact
about the work; Linga's conversations with the situations' names; Essay Master's readings with their lenses; and one
thing to try together, a single everyday act from an authored table keyed by the unit worked most (a teacher reads the
table). An empty week is "Nothing this week." It is words, not a picture - the TV draws a verdict, the parent's page
says it - with counts of things done as the recap's are, never a percentage, a ranking, praise, a sibling, a school
year or age, a problem, an answer or a transcript. Lines stay within 14 words and the page within 90 (headings
aside). It is never on the TV. Phase 1 writes it in English only (the page follows the desk's language, and the desk
is English in Phase 1); the Parent tab is a household convenience, not a lock (Phase 1 has no parent lock, D1).

## Motion

- **Arrival.** Once when someone sits down at the desk: the house mark draws itself (three arches, the innermost
  lit), the world opens out of it in a circle, the shelf rises, the chrome fades in (about 1.8 s).
- **Choosing.** Left / Right slide the old world out and the new one in from the side the D-pad went; each layer
  travels by its own factor (hills barely, the hero pieces fully); the name's letters rise in one by one (.7 s).
- **Hand-off.** Select floods the stage from the tile in the app's own colours (Lamplight blue, Linga's terracotta,
  Essay Master's green) with its arched picture, "Opening" and its name, then the app opens (`ZOOM_MS`, 560 ms). The
  keys wait while it plays.
- **Reduced motion.** No arrival, no drift, no slide: the world is simply there, and Select opens the app at once.

## What the landing is not

Not a menu of three tiles, not a fourth colour scheme laid over the apps, not a dashboard of numbers. Choosing a
learner in the switcher, or saving a profile, returns to the desk with the light at rest on what that learner left -
never straight into one app. **Menu ends tonight** wherever the light is - `session.end` -> `recap`, and the memory is
written (`/api/memory`).

*Feeds:* the profile's modules (`onModules`), `continueCard` and `practice` (Math Buddy), Linga's own home view
(`lingaView`, `lingaHome`, `progressDots`), the writing record and history (`lensStandings`, `writingTotals`, the
session's `essay` when this learner read it), `joined` / `pin` / `phoneUrl`.
*Code:* `desk/src/landing/` (model, seam, themes), `desk/src/tv/landingRows.ts`, the `landing` entry of the keymap in
`desk/src/tv/keys.ts`, `desk/src/design/desk-landing.css`. *Tests:* `tools/tv-keys-test.cjs` (landing 1-6),
`tools/tv-landing-test.cjs` (the view-model, the paper theme, the blueprint lock), `tools/tv-landing-live.cjs` (the
real page: D-pad, hand-off, reduced motion, safe zone, type floor; needs a server). *Promotion:* the paper port was
held to the winner's computed styles with `style-contract.py` (20 roles: title, tiles, shelf, caption, both actions,
chrome).
