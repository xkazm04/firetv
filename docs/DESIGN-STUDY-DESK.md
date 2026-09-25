# Left on the Desk: the Study Desk landing

**Chosen 2026-09-25** in the study-desk-landing contest (entry A, variant 2; the entry's `NOTES.md` has the
reasoning). The landing is the first screen of the TV app: whose desk it is, and which of the three apps to open.
It is the umbrella over three apps that already have their own design languages - Math Buddy is
[Lamplight](DESIGN-MATH-BUDDY.md), Linga [the Open Door](DESIGN-LINGA.md), Essay Master [Specimen](DESIGN-ESSAY-MASTER.md) -
and its job is to hold them together without flattening them. The rest of the shell (pairing, the learner switcher,
profile, break, recap) stays [On Air](DESIGN-ON-AIR.md); the recap's tiles are the exception inside it, each drawn in
its own app's language like the objects here (see "Tonight, done" below).

The CSS is `desk/src/design/desk-landing.css`, scoped under `.desk-tv` with `dk-` classes. The screen is
`desk/src/landing/LandingTV.tsx`, routed from `desk/src/app/tv/page.tsx` when the session is on `landing`. What
each app has waiting, the stops and where the lamp starts are `desk/src/tv/landingRows.ts`; the keys are the
`landing` entry of `desk/src/tv/keys.ts`. The desk's face is Figtree (`desk/src/landing/fonts.ts`).

## The idea in one line

**What you left is still lying where you left it.** A walnut study desk at night, seen from above, one lamp on.
Each app is an object on the desk in its own brand, showing what it has waiting for this learner. The lamp starts
on what was left.

## Principles

1. **Study Desk is the desk, not a fourth brand.** Walnut, a green leather blotter with the wordmark embossed
   into it, one sage accent (`#A9BBA3`), bone type (`#EFE8DC`), and a place card saying whose desk it is. The
   desk frames the apps; it never recolours them.
2. **Each object quotes its app, unmistakably.** An object is made of its app's own parts, not a drawing of them:
   - *Math Buddy* is its night-blue folder with a sheet on it: the real practice set in the learner's hand
     (`MathText`, Lamplight's typesetter), a tick after each right item and the pen's ring around each slip,
     dashed sky where the desk is not sure; the Lamplight mark and "Math *Buddy*" wordmark below. A set not yet
     marked is its questions in print; a snapped page is its problems in print. Nothing on the desk: a blank sheet
     saying so.
   - *Linga* is its cream card with the plum arch on a plinth and the scene behind it, taken from Linga's own view
     of home (`lingaView`): the scene of the next topic or of the conversation left mid-way, its name tag, the
     level badge, and the marks under it (the replies so far, the check's steps, or the plan's topics). Before a
     level, the Open Door's own open door.
   - *Essay Master* is its black specimen card with the E-and-caret mark: the lens last read, inked as far as the
     learner has got with it and cut by the citron cursor there; under it the paragraph on the desk as arrows,
     one a sentence, the one that argues the other way reversed in citron. Nothing read: the lens names as
     hatched ghosts.
3. **Only what is real, and only this learner's.** Every object reads the session. A set, a conversation or a
   reading belonging to someone else is not shown. An empty object says so in two words ("Not started",
   "Nothing read", "Nothing open"), never invented progress, never a made-up equation. Only the apps on the
   profile lie on the desk; no age is compared for a learner without a school system.
4. **The lamp is the focus.** A warm pool of light sits on exactly one object; the rest of the room dims. The lit
   object straightens, lifts (1.06) and wears a 6 px warm-white ring. The lamp starts on the object with something
   waiting, marked with the one sage **CONTINUE** tag: a marked set, then something left mid-way, then the next
   step, then the last thing done (the most recent on a tie). With nothing waiting there is no tag and the lamp
   rests on the first app.
5. **The lit object comes alive.** The pen draws its ticks and rings in; Linga's scene drifts and its pendant
   lamp swings; the citron cursor blinks and the reversed arrow turns round; the place card offers "Someone else";
   an unpaired phone breathes sage until it is lit.
6. **A verdict is a picture; sentences live in one slot.** Ticks, rings, the reversed arrow, the mid-way marks and
   the inked lens carry the state. The one caption slot on the blotter's lip holds a sage label and one sentence
   about the lit object.
7. **The phone is an object too.** Paired, it is a chip on the desk (status, not a stop). Not yet, its screen
   carries the address and the four-digit code in big type, and it is a stop: Select opens the pairing screen.
8. **Ten-foot law.** 1920 x 1080 stage, 5% safe zone (96 / 54 px) for every object and the caption (the lamp in
   the corner is decoration); nothing under 28 px except 20-22 px uppercase labels (CONTINUE, a tab, PARAGRAPH,
   MID-WAY, PHONE) that never carry a meaning alone; exactly one lit object; D-pad only.

## The D-pad

| Key | What it does |
|---|---|
| Left / Right | the lamp moves along the apps (clamped at both ends) |
| Up | to the place card |
| Down | from the place card, to the app under it; from an app, to the phone while it is unpaired |
| Select | an app: the zoom, then its home (Math Buddy Tonight, Linga home, Essay Master's lenses); the place card: the learner switcher; the phone: pairing |
| Back | the lamp goes home to the CONTINUE object |
| Menu | ends tonight, wherever the lamp is: the recap, and what the desk noticed is written (`/api/memory`), as the phone's End session does |

Arriving without a stop named (a fresh desk, a nav with no focus) the focus is `LANDING_REST` (-1) and the lamp
rests on the CONTINUE object. Back from an app's home, the switcher or pairing lands on the object it came from.

## Tonight, done (the recap)

Menu on the desk ends the evening and shows it as one picture (`desk/src/tv/recapRows.ts`, the `Recap` screen in
`desk/src/tv/screens.tsx`): one tile per app on the profile, in the desk's order, each from tonight's work only (the
dated history lines and Linga's conversations since local midnight). Math Buddy's sheet carries a pen tick per right
answer and a ring per slip for each marked set, a page per sheet read and an amber lamp per hint, ringed when it took
a second. Linga's card holds a plum mark per conversation, sized by its replies. Essay Master's black card has an
arrow per sentence read, the ones to fix turned round in citron. An app with nothing tonight says "Not tonight". No
problem text, question or answer is on it; the caption slot holds the one sentence. Left / Right walk the tiles and
then "Back to the desk"; Select on a tile opens what that app still has on the desk (the marked set at its first
slip, this learner's reading, Linga's home); Back, or the desk, is this landing with the lamp at rest. "On the
parent's phone" is a chip, not a stop: the phone's Recap tab already shows the evening.

## Motion

- **Flicker-on.** The room is dark, then the lamp catches (1.15 s), once when someone sits down at the desk.
- **Glide.** The pool of light and the dimming glide to the lit object (.45 s); the object lifts and straightens.
- **Zoom.** Select grows the lit object until the stage is its app's own colours - Lamplight night, the Open
  Door's cream, Specimen black, or the desk's leather for the switcher and pairing - with the app's mark on it
  (.55 s), then the app opens. The keys wait while it plays.
- **Reduced motion.** Every glide, lift, draw, flicker and zoom is a cut: the room is simply lit, and Select opens
  the app at once.

## What the landing is not

Not a menu of three tiles, not a fourth colour scheme laid over the apps, not a dashboard of numbers. No
Continue button: the lamp is already on what you left.
