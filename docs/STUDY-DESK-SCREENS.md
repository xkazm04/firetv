# Study Desk — screen inventory

**Read from the code on 2026-09-25** (main at `4bce3c7`). This replaces the 2026-09-07 modelling checkpoint, which
described a product that no longer exists: Tonight as a task board, lesson keys, and only S1 / T0-T6 / M3.
Screens are named here by their id in the `Screen` union, the name the code uses. The S/T/M numbers in code
comments are older than this page and do not match each other. Every key below was checked against `KEYMAP`, not
remembered. To recheck a line, open the file it cites. The profile row and the Math Buddy rows were read again on
2026-09-29 (branch `perfect/2026-09-29-calculus`), when Calculus 1 became a Math course path
([MATH-COURSE-PATHS.md](MATH-COURSE-PATHS.md)).

| What | Where |
|---|---|
| The screen ids (33) | `desk/src/lib/session/store.ts:23` (`Screen`) |
| What a session event does to `screen` / `focus` / `back` | `reduce` in `desk/src/lib/session/store.ts` |
| Which component draws a screen | `desk/src/app/tv/page.tsx` (the `essayOwns`, `mathsOwns` and `lingaOwns` tests are in `desk/src/tv/keys.ts`) |
| The D-pad | `KEYMAP` and `tvKey` in `desk/src/tv/keys.ts`; Linga's own keys in `desk/src/english/LingaTV.tsx`, its actions in `lingaView` (`desk/src/lib/english/view.ts`) |
| Where Linga's server moves the screen | `commit` in `desk/src/lib/english/conversation.ts` (`screenFor`) and `desk/src/lib/english/check.ts` (`stageScreen`) |
| The phone | `desk/src/app/phone/page.tsx`, `desk/src/english/LingaPhone.tsx`; which panel follows which screen: `desk/src/app/phone/panelFor.ts` |
| Tests that hold these | `tools/tv-keys-test.cjs`, `tools/tv-sheet-test.cjs`, `tools/tv-recap-test.cjs`, `tools/phone-panel-test.cjs`, `tools/linga-ui-test.cjs`; the Maths course row, the Topics stops and the frontier: `tools/maths-course-test.cjs` |

---

## 1. The constraints the TV imposes

From Amazon's [design and UX guidelines](https://developer.amazon.com/docs/fire-tv/design-and-user-experience-guidelines.html)
and [display and layout](https://developer.amazon.com/docs/fire-tv/display-and-layout.html) docs,
numbers as stated:

| Rule | Value | What it means for us |
|---|---|---|
| Design target | **1920 × 1080**, rendered as 960 × 540 dp at xhdpi | the TV page is one 1920×1080 stage scaled to the window (`app/tv/page.tsx`) |
| Safe zone | nothing in the **outer 5%** of any edge | 96 px side margins, 54 px top/bottom, hard. The landing, Math Buddy and Essay Master draw the whole stage and keep the margins themselves |
| Body text minimum | **14 sp ≈ 28 px at 1080p** | a worksheet is shown one problem band at a time, not whole, so its printed text lands at ≥ 28 px |
| Input | **D-pad only** — Up/Down/Left/Right/Select/Back/Menu/Play-Pause | every screen is a focus graph; no hover, no scroll wheel, no pointer |
| Focus | must be **unmistakable** at 3 m | each surface draws it its own way (the lamp's pool, a filled plum door, a citron caret, the On Air ring); see section 3 |
| Density | low | one job per screen; a verdict is a picture and prose lives only in the caption slot |
| Text entry | system keyboard is painful | the TV never asks for typing — the phone does it |

**The rule that shapes the product most:** *the TV never asks for typing.* Anything that needs a
camera, a keyboard, a microphone or a finger happens on the phone. The TV shows, the phone does.

On the bench the keyboard stands in for the remote (`keyOf`, `desk/src/tv/keys.ts`): arrows are the D-pad,
**Enter** is Select, **Backspace** or **Escape** is Back, **M** is Menu, **Space** is Play/Pause.

## 2. Two surfaces, one session

```
TV  /tv?key=<key>  (D-pad)                     Phone  /phone?pin=<pin>  (no install)
┌──────────────────────────────────┐           ┌──────────────────────┐
│ the big shared view, drawn from  │   SSE     │ camera · mic · text  │
│ session.screen by one of five    │◀────────▶ │ the learner's hands  │
│ owners (section 4)               │  events   │ (and the parent's)   │
└──────────────────────────────────┘           └──────────────────────┘
                       one Session on the server (store.ts)
```

The session lives on the server and is pushed to both screens as it changes; the TV and the phone POST events
(`nav`, `focus`, `item`, `timer.start` ...). The engines' results (`page.reading`, `hint.set`, `practice.set`,
`practice.marked`, `essay.set`, `english.set`, `linga.changed` ...) come only from the server routes. A browser
without the desk's key sees "Not this desk's TV" (`NotThisTV`, `app/tv/page.tsx`) and no keys work there.

**Play/Pause** is the work clock on every screen but `lesson`, where it plays the video, and Linga's, where Space
pauses the scene (`tvKey`). A work block is 25 minutes; when it runs out the TV goes to `break`.

## 3. The design law per surface

- **The landing** — *Small Worlds*: the app in the light fills the screen as a paper-cut world, a paper shelf holds what it has waiting and one tile per app; the light starts on what was left; the look is a theme. [DESIGN-STUDY-DESK.md](DESIGN-STUDY-DESK.md)
- **Math Buddy** — *Lamplight*: homework under a lamp; the learner's working in their own hand, the desk's pen marking the one place to look again, never the answer. [DESIGN-MATH-BUDDY.md](DESIGN-MATH-BUDDY.md)
- **Linga** — *the Open Door*: every screen is an arch on the left with the situation behind it and the few words to walk in beside it. [DESIGN-LINGA.md](DESIGN-LINGA.md)
- **Essay Master** — *Specimen*: the type is the diagram; lenses inked as progress, the missing half hatched, the move set large, the sentence never written for you. [DESIGN-ESSAY-MASTER.md](DESIGN-ESSAY-MASTER.md)
- **The shell** — *On Air*: the screen is a broadcast, not a menu; one band per screen, the caption and the clock are the living elements. [DESIGN-ON-AIR.md](DESIGN-ON-AIR.md)

## 4. Who draws which screen

`app/tv/page.tsx` asks in this order and the first yes draws the whole stage:

| Test | Draws | Screens |
|---|---|---|
| `screen === "landing"` | `LandingTV` (`desk/src/landing/LandingTV.tsx`) | `landing` |
| `essayOwns` | `EssayTV` (`desk/src/essay/EssayTV.tsx`) | `essaytype`, `forensic`, `playbook`, `xray` |
| `mathsOwns` | `MathsTV` (`desk/src/maths/MathsTV.tsx`) | `tonight` (unless Linga's), `topics`, `practice`, `sheet`, `walk`, `calendar`; and `page` / `hint` when the page is a maths page, `units` / `lesson` when the subject is maths |
| `lingaOwns` | `LingaTV` (`desk/src/english/LingaTV.tsx`) | every `linga*` screen, and `tonight` when the subject is English (Linga's home) |
| otherwise | `ScreenFor`, the shell (`desk/src/tv/screens.tsx`) | `pair`, `joined`, `learner`, `profile`, `break`, `recap`, `sentence`, `headtohead`; and `page`, `hint`, `lesson`, `units` for English and Essay Master |

The keys follow the same split: under `lingaOwns` `tvKey` returns nothing and `LingaTV` takes the keys; everywhere
else `KEYMAP[screen]` does. A screen's key handler is the same whoever draws it.

## 5. TV screens

In the key columns, `→ x` means the key goes to screen `x`. A key not listed does nothing on that screen (except
Play/Pause, section 2).

### 5.1 The desk

#### `landing` · Small Worlds
The first screen: whose desk it is, and which app to open. *Small Worlds*
([DESIGN-STUDY-DESK.md](DESIGN-STUDY-DESK.md)): the app in the light fills the screen - its name cut from paper over
a small world (Math Buddy's stairs lit by the marked set's right answers, Linga's hotel reception with the
conversation left mid-way or the next one waiting, Essay Master's page of sentence bars with the loupe on the one to
fix) - and a paper shelf below holds a caption (a chip for when, a headline, one line; about 25 words), one arched
tile per app on the learner's profile, the big *Continue as Ema* and *Someone else*. Top right: the phone and who is
at the desk; an unpaired phone is a postcard with the desk's real address and code. The light starts on the app with
something waiting (marked > left mid-way > next > last). The look is a theme (`desk/src/landing/themes/`): paper today,
a blueprint look kept and locked off until product splits the landing by age.
*Reached:* the session's first screen; every `learner.set` and `profile.save`; Back from an app's home, the
switcher or pairing (light on the object it came from); `joined`'s Select or Back and the recap's desk (light at rest).
*D-pad:* Left/Right along the shelf of apps; Up to the phone (top right) while it is unpaired; Down to Someone else
(bottom right), and from there Up back to the app above it (Down or Left from the phone goes back to the last app);
Select on an app plays the hand-off into its colours, then opens its home (`tonight` for Math Buddy, `linga`,
`essaytype`) after a `subject` event; Select on Someone else → `learner`, on the unpaired phone → `pair` (both with
`from: landing`); the *Continue as ...* button is not a stop, it names what Select does; Back brings the light home to
the CONTINUE app (the phone while none is paired and nothing waits); **Menu ends tonight** wherever the light is -
`session.end` → `recap`, and the memory is written (`/api/memory`), as the phone's End session does.
A nav to the landing without a focus rests the light (`LANDING_REST`, -1). Choosing a learner in the switcher, or
saving a profile, returns to the desk with the light at rest on what that learner left - never straight into one app.
*Feeds:* the profile's modules (`onModules`), `continueCard` and `practice` (Math Buddy), Linga's own home view
(`lingaView`, `lingaHome`, `progressDots`), the writing record and history (`lensStandings`, `writingTotals`, the
session's `essay` when this learner read it), `joined` / `pin` / `phoneUrl`.
*Code:* `desk/src/landing/` (model, seam, themes), `desk/src/tv/landingRows.ts`, the `landing` entry of the keymap in
`desk/src/tv/keys.ts`, `desk/src/design/desk-landing.css`. Tests: `tools/tv-keys-test.cjs` (landing 1-6),
`tools/tv-landing-test.cjs`, `tools/tv-landing-live.cjs`.

### 5.2 The shell (On Air, `desk/src/tv/screens.tsx`)

| Screen | What it is | Reached | D-pad → next |
|---|---|---|---|
| `pair` (`Pair`) | QR + 4-digit code centred, the phone's address, a "Waiting for a phone" ticker | the landing's unpaired phone; Down on Math Buddy's `tonight` while unpaired; Menu on `profile` while unpaired; Linga's menu "Phone setup"; the phone's Join panel "Show the code on the TV" (each sets `back`) | Back → `back` (the landing on its phone, else that screen). A phone's `join` → `joined` |
| `joined` (`Joined`) | "Ema's phone is on the desk", one picture, "Open an app on the desk, or snap the page on the phone", one action: The desk | a `join` while the TV was waiting for a phone (unpaired, or on `pair` / `joined`) and not on `profile`. A phone joining mid-evening does not move the TV | Select or Back → `landing` (lamp at rest) |
| `learner` (`Learner`) | who is at the desk: one card per profile, then Add a learner | the landing's place card; Up on Math Buddy's `tonight`; Up on Linga's home; Cancel on the phone's Profile / Back on `profile` (`profile.discard`) | Left/Right the cards; Select a learner → `learner.set` → `landing`; Select Add a learner → `profile` (new draft); Menu on a learner → `profile` (edit that learner); Back → `tonight` when Tonight opened the switcher, else the landing with the lamp on its place card |
| `profile` (`ProfileScreen`) | the picks on the TV, the name on the phone: rows Type of student, Age (school types only), School system, Interested in, Maths course (only while Math Buddy is among the interests: two cells, **School maths** and **Calculus 1**, the learner's `mathPath`, School maths chosen when none is set), then Save / Back (`profileRows`, `desk/src/tv/profileRows.ts`); one caption under the rows names the focused pick and its blurb (for a course, the path's one sentence from `desk/src/lib/library/paths.ts`) | Add a learner, or Menu on a learner, in `learner` (Menu copies the learner's picks, their Maths course included) | Left/Right in a row, Up/Down between rows keeping the column; Select picks (interests toggle; a course sets `mathPath`); Select Save → `profile.save` (needs the name typed on the phone) → `landing`; Select Back, or Back → `profile.discard` → `learner`; Menu while unpaired → `pair` |
| `break` (`BreakScreen`) | see below | the work clock runs out | Select → the screen the break interrupted |
| `recap` (`Recap`) | see below | `session.end`: Menu on the landing, or End session on the phone's Tonight | Left/Right the tiles and the desk; Select a tile → what that app still has on the desk; Select the desk, or Back → `landing` at rest |
| `sentence` (`SentenceScreen`) | the English sentence checked: the time word and the verb that disagree, marked; "Nothing yet" before any sentence | `english.set` (the phone's Say it → `/api/analyse` kind english); Linga's menu "Sentence help" | Left/Right between Try it again / Show me the unit; Select Show me the unit → `headtohead`; Select Try it again → a status line to the phone; Back → `linga` |
| `headtohead` (`HeadToHead`) | past simple vs present perfect, one example each that never answers the learner's sentence | Show me the unit on `sentence`; Menu on English `units` or `lesson` | Back → `sentence` when a sentence is checked, else `units` |
| `page` / `hint` / `lesson` / `units` | the English and Essay Master versions of Math Buddy's screens below, in On Air | as below, with an English or essay page | as below |

#### `break`
The timer's other face. When a work block ends: full-screen, calm, the break countdown, what's
next ("Stand up. The page will still be here."). Select skips the break; Back does nothing (a break you can't
accidentally cancel). When the break runs out, or is skipped, the TV returns to the screen it interrupted
(`timer.before`).
*Feeds:* timer. *Code:* `BreakScreen` in `desk/src/tv/screens.tsx`; `timer.tick` / `timer.skipbreak` in `store.ts`.

#### `recap` · "Tonight, done"
End of session, reached from the phone's End session or Menu on the landing. The whole evening as one
picture: a tile per app on the profile, each in its own app's language, from tonight's work only —
Math Buddy's marked sets as ticks and rings (a dashed ring where the desk was not sure), pages read, hints
(second hints ringed); Linga's conversations as marks sized by their replies; Essay Master's readings as arrows,
the ones to fix reversed. "Not tonight" for an app with nothing. No problem texts: the one sentence is the caption.
Left/Right walk the tiles, then **"Back to the desk"**. Select on a tile opens what that app still has on the desk
(Math Buddy's continue card, else `tonight`; Essay Master's reading → `forensic` when it is this learner's, else
`essaytype`; Linga → `linga`); the desk (and Back) is the landing at rest. The parent's copy is the phone's Recap
tab, shown as a chip, not a button.
*Feeds:* history, englishLearning.sessions, session log (`desk/src/tv/recapRows.ts`). Tests: `tools/tv-recap-test.cjs`.

### 5.3 Math Buddy (Lamplight, `desk/src/maths/MathsTV.tsx`)

| Screen | What it is | Reached | D-pad → next |
|---|---|---|---|
| `tonight` (`Tonight`) | Math Buddy's home: the continue card when something is open (Finish the set / Back to the marked set / Back to the sheet, `continueCard` in `desk/src/tv/mathsRows.ts`), else the path title over the learner's own path (`pathSecure` in `desk/src/tv/mathsRows.ts`: "N of M topics secure", or on the first evening the path's own name ("School maths" or "Calculus 1"), "from the first step", `secureTitle`) and a blank sheet; two doors, **I have homework** and **Teach me something**; the topic ruler (a path of more than eight topics is drawn as one bar per strand, inked by its share of secure topics, the needle at the frontier: `stripModel` in `desk/src/tv/rulerRows.ts`) | Select Math Buddy on the landing; Back from `page`, `topics`, `practice`, `sheet`, `units`; `practice.clear` | Left/Right the stops; Select the card → where it leads (`practice`, `sheet` at the first to look at, or `page`); Select homework → the first maths page (`page`), or with none asks the phone for a photo (`page.ask`: the door says "Waiting for the photo"); Select Teach me something → `topics`; Up → `learner`; Down while unpaired → `pair`; Back cancels a pending ask, else → `landing` on Math Buddy |
| `topics` (`Topics`) | "Pick a topic": the ruler large, one stop per topic on the learner's path (`learnerPath` in `desk/src/lib/library/paths.ts`: the school path, or Calculus 1 when the profile says so) with its word (Secure only when the learner's record has latched it, `topicStates` in `desk/src/tv/mathsRows.ts`); the needle at the same frontier; the SCHOOL tick where the learner's school system would have them, and no gap line until a Math placement exists (none in Phase 1, owner decision D2); the focused name fitted whole; a path too long for one box per topic (Calculus 1) pans under the lamp so the focused topic is always on screen with its whole name, chevrons at an edge with more (`rulerModel` in `desk/src/tv/rulerRows.ts`), its blurb, and while a set is written the preparing lines | Teach me something on `tonight`, the lamp on the learner's frontier (`topicsFocus` in `desk/src/tv/keys.ts`): on the school path the first topic not latched secure after the last latched one (a learner with one-step equations secure opens on two-step equations, a fresh learner on Add and subtract fractions), on Calculus 1 the first not latched secure whose prerequisites all are; the first stop when nothing is secure or nothing is left; `topic.open` (focus on that topic's place on the learner's path) | Left/Right the topics; Select → asks `/api/practice` for six questions (nothing locked; on Calculus 1 the model gives specs and the desk prints and checks every question itself; on Add and subtract fractions the desk writes all six itself from a seed, no model call, `makeSchoolItems` in `desk/src/lib/desk/items.ts`); Up, Menu or Back → `tonight`. The set arriving (`practice.set`) → `practice` |
| `practice` (`PracticeScreen`) | the six questions on the paper, headed and crumbed with the topic's name on its path (`topicName`, so a Calculus set reads "The chain rule and implicit differentiation", never an id), to work on real paper, every one fitted to it (the paper takes smaller squares rather than run past the safe line); the card says "The phone is waiting for the sheet or your answers" (the set can be snapped or typed, Family W6), or while the snapped set is marked "The desk is marking the set…", or after a failed mark the job's own sentence and that snapping again tries again (`markLine` in `desk/src/tv/mathsRows.ts`) | `practice.set`; Finish the set on `tonight` | Back → `tonight`, the set kept. The phone's Practice tab snaps the worked sheet (`/api/mark` with `image`) or takes six typed answers (`/api/mark` with `answers`, no vision call) → `practice.marked` → `sheet` |
| `sheet` (`Sheet`) | see below | `practice.marked`; Back to the marked set on `tonight`; Back or the last item on `walk` | see below |
| `walk` (`Walk`) | one marked item at a time: the question, the learner's working with the pen in it, the caption; the phone asks "How did you get there?"; while the answer is thought over the card says "The desk is thinking over what you said…", and a failed one says its own sentence (`explainLine`) | Select a tile on `sheet` | Left/Right the items; on the last item Select → `sheet`; Back → `sheet` at this item. An explanation (`/api/explain`) settles the item in place |
| `page` (`PageScreen`) | the snapped worksheet, one problem band at a time, a "reading…" state while the read runs; Menu flips to the whole photo | `page.reading` (a phone capture, `/api/read`); homework or the continue card on `tonight`; a tap on the phone's Point & ask | Up/Down the problems; Right the next page; Left the previous page, or → `tonight` from the first; Menu band ↔ overview; Select → asks `/api/hint` → `hint.set` → `hint`; Back → the page's own app home (`tonight` for maths, `essaytype` for an essay page), and Back works while a page is being read (the read still lands); every other key waits for the read |
| `hint` (`HintScreen`) | the problem under the lamp and the hint on a taped card; spoken. For a learner on Calculus 1 the hint takes a Calculus I stance and no lesson is looked for ("No lesson for this"). A Calculus task the desk can read into a spec is leak-checked against its own answer, and a hint that gives it away twice becomes the shape's fixed sentence (`desk/src/lib/desk/hint.ts`). A fractions task ("3/4 + 1/6", "Work out 3/4 - 1/6") is read the same way by `rules/school.ts`: leak-checked against its answer, the unit's fixed sentence after a second leak, the unit named in the stance, and no lesson looked for ("No lesson for this") | `hint.set` (Select on `page`, or Ask the desk on the phone) | Left/Right between Still stuck / Show me the lesson; Select Still stuck on a first hint → asks for the second (`/api/hint` stage 2); Select the lesson, once one is picked → `lesson`; Back → `page` |
| `lesson` (`LessonScreen`) | the picked lesson in a lamp-lit frame, with its why | Show me the lesson on `hint`; Select on `units` or `calendar` | Play/Pause the video; Back → `hint` when there is one, else `units`; Menu → `calendar` (English → `headtohead`, essay → `xray`) |
| `units` (`Units`) | a contents page: the subject's units | Menu on Math Buddy's `tonight` (the "MENU Lessons" chip); as a Back target: `lesson` with no hint (on the lesson that was playing), `calendar`, `headtohead` | Up/Down the units; Select → `lesson`; Menu → `calendar` (English → `headtohead`, essay → `playbook`); Back or Left → the app's home (`tonight`, or `essaytype` for essay units) |
| `calendar` (`Calendar`) | a planner: Math Buddy's lessons on file, three to a row, one week per row for as many weeks as there are lessons (`calendarWeeks` in `desk/src/tv/mathsRows.ts`, the same 3-wide grid the D-pad walks) | Menu on maths `units` or `lesson` | the arrows over the grid (3 wide); Select → `lesson`; Back → `units` |

`page`, `hint`, `lesson` and `units` are Math Buddy's only for maths; for an English or essay page the shell draws
them with the same keys. `tonight` is Math Buddy's unless the subject is English, when it is Linga's home.

#### `sheet` · the marked sheet
Where a practice set lands when the phone's photo of it comes back marked. The whole set on the
learner's paper under the lamp (Lamplight, [DESIGN-MATH-BUDDY.md](DESIGN-MATH-BUDDY.md)): each item
folded to its printed question and the one line of their working the desk's pen is on - a right item
is its question and a tick, a wrong one its marked line (the pen inside the line where the data places
it), an unsure one its last line and "not sure". Never an answer the learner did not write. The title counts what to look at ("Two to look at", "All six right"); the caption
names the focused item and where to start looking (the slip's `points`), the only prose on screen.
Two actions: **Six more** (a new set on the same topic, written by the same `/api/practice` job
as Topics and aimed at the learner's recorded slips) and **Put the sheet away** (clears the set).
*D-pad:* focus lands on the first item to look at (on *Six more* when all are right).
Left/Right over the tiles, Down to the actions, Up back to the first item to look at. Select on a
tile opens it in the walk (`walk`); Back from the walk, or Select on its last item, returns to the
sheet at that item. Back from the sheet goes to `tonight` **with the set kept**: Tonight's continue
card ("Back to the marked set") reopens it. Back from the unmarked set (`practice`) keeps its set the same
way ("Finish the set"). Put the sheet away → `tonight`.
*Feeds:* `practice.items[].verdict` and `slip` as the store holds them (marking, or an
explanation that settled an unsure item later) — the sheet never recomputes a verdict. A Calculus set is
marked by code from each item's spec (`checkAnswer`, `desk/src/lib/rules/calc.ts`). The crumb and "Six more
on ..." name its topic on the Calculus path, and a wrong item's pen is the answer line (a Calculus item carries no
`slipAt`).
*Code:* `desk/src/tv/sheetRows.ts` (tiles, stops, first to look at), the `sheet` entry of the
keymap in `desk/src/tv/keys.ts`, `Sheet` / `Walk` in `desk/src/maths/MathsTV.tsx`, the pen in
`desk/src/maths/working.ts`, `desk/src/design/maths-lamplight.css`. Tests: `tools/tv-sheet-test.cjs`.

### 5.4 Linga (the Open Door, `desk/src/english/LingaTV.tsx`)

Linga drives its own screens. Every action on its row is data from `lingaView` (`desk/src/lib/english/view.ts`):
a command to `POST /api/english`, a nav, or a step of the TV's local state. The server then moves the screen with a
`linga.changed` event: `screenFor` in `conversation.ts` (finished → `linga-recap`, a moment → `linga-moment`,
coaching → `linga-coach`, else `linga-talk`) and `stageScreen` in `check.ts` (`linga-check`, `linga-verdict`,
`linga-plan`).

**Linga's keys** (the handler in `LingaTV.tsx`, the same on every Linga screen):

| Key | Does |
|---|---|
| Left/Right/Up/Down | move along the action row, wrapping (Right/Down forward, Left/Up back). From the resting focus (-1) any arrow lands on the first action |
| Up on Linga home | → `learner` (`from: linga`), not the row |
| Select | runs the focused action (the first one at rest); while Linga is thinking only Cancel runs |
| Menu | opens or closes Linga's menu (below) |
| Play/Pause | pauses or resumes the scene, where the turn takes a pause |
| Back | closes the menu or the level picker if open; on Linga home → `landing` on Linga; on `linga-check` → `check-leave` (→ `linga`, the place kept); on `linga-talk` → `leave` (→ `linga`, the scene paused); on `linga-moment` → `moment-done` (→ `linga-talk`); anywhere else → `linga` |

| Screen | What it is | Reached | Actions (Select) → next |
|---|---|---|---|
| `linga` (and `tonight` with English) — Linga home | one of six home states (`lingaHome`): resume, check part-way, no level yet, no plan, plan done, next topic | Select Linga on the landing or the recap; the phone's "Linga on the TV"; `/tv?module=english`; `leave`, `check-leave`, `plan-agree`; Back from most Linga screens | resume: Carry on talking → `linga-talk`, Choose a situation → `linga-scenes`. Part-way: Carry on → the check's screen, Start again → `linga-check`. No level: Find my level → `linga-check`, I'll pick my level → the level picker. No plan: See my topics / Carry on choosing → `linga-plan`, Choose a situation. Plan done: New topics → `linga-plan`, Talk again → `linga-talk`. Next topic: Start talking → `linga-talk`, Choose a situation |
| `linga-check` | finding the level: three questions about you, then short tasks (say, listen, choose); answered on the phone except a choice | `check-start`, `check-resume` | About you: Hear it again, Stop for now (Try again before the first question). Tasks: Reply 1..n and I don't know (a choice); Hear it again / Hear the task, Show the words (listening), I don't know. While thinking: Cancel & come back later. Done → `linga-verdict` |
| `linga-verdict` | your level on the ladder, Linga's read or your own pick | the check finishing; This is my level in the picker (`level-self`); My level in the menu | See my topics → `linga-plan`; Find my level again → `linga-check`; Pick it myself → the level picker |
| (the level picker) | local state over the ladder, drawn as `linga-verdict` | I'll pick my level / Pick it myself | This is my level → `linga-verdict`; Lower / Higher move the band; Not sure · go back closes it |
| `linga-plan` | the row of topic doors for your level, or first "What would you like to practise?" | See my topics, New topics, My topics (`plan-propose` / `plan-open`) | Asking the goal: Let Linga pick, Not now (→ `linga`). Topics: Agree to these topics → `linga`; Swap this topic (one per topic, only the focused shown); All new topics. The phone adds a topic in words |
| `linga-scenes` | one situation at a time behind the arch, its goal and a sentence to take with you; the list is what this learner's age allows (`eligibleScenes`): the three school situations show for a learner under 18 and never for type Other or an adult, so "Situation n of N" counts the learner's own list; the picture is the scene's own when its id is in `SCENE_ART` (`teacher` is a classroom, `lost` a school corridor, both with a dashed-outline gap as the one story prop), else the one for its skill (`project` shows the planning room) | Choose a situation (home, menu, recap, an unprepared scene) | Start this situation → `linga-talk`; Next situation (local) |
| `linga-talk` | the conversation: the partner's line in the arch, the goal, the caption; the learner answers on the phone | `start`, `resume`, `moment-done`, the turn coming back | Help me answer / More help (the rescue ladder), Choose a phrase (opens the recognition quiz: Option 1..n), Pause & coach → `linga-coach`; while a reply is on its way Cancel & go back → `linga`; paused: Resume, Finish rehearsal → `linga-recap`; a scene that did not prepare: Retry the scene, Choose another |
| `linga-moment` | one thing worth keeping, before and after | a turn that comes back with a moment | Back to the conversation → `linga-talk` |
| `linga-coach` | one useful change: you said / one way to try it | Pause & coach | Replay the moment → `linga-talk`; Finish for today → `linga-recap` |
| `linga-recap` | the rehearsal done: the phrase to take with you, or "It came back" when a taught phrase was used again; replies and moments counted | `finish` | Another situation → `linga-scenes`; Learning map → `linga-map` |
| `linga-map` | the eight abilities, one chapter at a time, with speaking progress | Learning map (recap, menu) | Next chapter, Previous chapter (local) |
| (Linga's menu) | local state, drawn over any Linga screen as the menu | Menu | Back to the scene; Learning map → `linga-map`; Choose a situation → `linga-scenes`; My level → `linga-verdict` (or the check when there is no level); My topics → `linga-plan`; Phone setup → `pair`; Sentence help → `sentence`; Finish rehearsal (during one) → `linga-recap` |

### 5.5 Essay Master (Specimen, `desk/src/essay/EssayTV.tsx`)

| Screen | What it is | Reached | D-pad → next |
|---|---|---|---|
| `essaytype` (`EssayType`) — the lens home | the four lenses top to bottom, each inked as far as the learner has got; the last paragraph's card on the right once one is read | Select Essay Master on the landing; the recap's essay tile with no reading of this learner's; Back from `forensic`, `playbook` | Up/Down the lenses; Right → the last paragraph's card, Left back to its lens; Select a lens → `essay.type` and "paste or dictate the paragraph on the phone" (the phone's Essay tab posts `/api/analyse` → `essay.set` → `forensic`); Select the card → `forensic`; Menu → `playbook`; Back → `landing` on Essay Master |
| `forensic` (`Forensic`) — one sentence | the paragraph as a rail of arrows, one sentence at a time: its verdict, the move that fixes it (hatched until a rewrite holds), one caption | `essay.set`; `essay.revised` (a rewrite from the phone); the last paragraph's card; the recap's essay tile | Up/Down walk the sentences; Left/Right the actions Rewrite on my phone / Why this matters / Next sentence / Back to the paragraph; Select Rewrite → the status line (the phone's Essay tab offers that sentence); Why this matters → `playbook` on this lens's structure; Next sentence → the next one (wraps); Back to the paragraph, or Back → `essaytype` on this lens. Menu opens the table of every sentence (Up/Down still walk; Select or Back close it) |
| `playbook` (`Playbook`) | the four structures top to bottom | Menu on `essaytype`; Why this matters on `forensic`; Menu on essay `units`; Back from `xray` | Up/Down the structures; Select → `xray`; Back or Menu → `forensic` on Why this matters when it came from there, else `essaytype` |
| `xray` (`Xray`) | one structure laid open | Select on `playbook`; Menu on an essay `lesson` | Back or Menu → `playbook` on that structure |

## 6. The phone

One page, two roles (Student / Parent toggle at the top), a tab bar: **Capture, Practice, Point & ask, Linga,
Say it, Essay, Tonight, Recap, Profile**, plus the Join and Joined panels which are not tabs. The tabs wait for a
joined phone, except Profile. The status line under the role says what the TV is on, in words (`TV_WORDS`).

**Following the TV** (`follow`, `panelFor.ts`, tested by `tools/phone-panel-test.cjs`): when the TV's screen
*changes into* a hand-off, the Student phone moves once to the panel that does it. The same screen updating does
not move it, so a tab the learner picked stays picked. It never moves the Parent role, never takes a panel away from
busy hands (typing, a shot held unsent, recording), and a phone that has just joined lands on Joined rather than in
the camera.

| Panel (tab) | What it does | Follows the TV screen | Sends |
|---|---|---|---|
| Join | type the 4-digit code, or arrive with it from the QR; remembers the desk; "Show the code on the TV" | any screen while unjoined (except `profile`) | `join`; `nav pair` (from the current screen) |
| Joined | "On the desk": Snap the page, Set up tonight first, or Name the new learner | `joined`; where a fresh join lands | — (moves to a panel) |
| Profile | the new or edited learner's name; Save / Cancel | `profile` (joined or not) | `profile.draft` (name), `profile.save` → `landing`, `profile.discard` → `learner` |
| Capture | camera, a module picker (Math Buddy or Linga, or the module the TV asked for; Essay Master is not offered, an essay is text and never a snapped page), Snap / Use this page / Retake, samples (a maths and an English sheet); after a read: Add another page, Point & ask; Try again for a failed read | `tonight` while it waits for a photo (`awaiting`, never an essay: that goes to Essay); `page` when that page's read failed (a maths or English page) | `/api/read` → `page.reading` → `page`; `/api/session/retry` |
| Practice | no set: "open Teach me something on the TV"; unmarked set: two routes side by side, "Snap the sheet" (snap the whole worked sheet, Send my working) and "Type my answers" (one numbered box per question with the plain question above it, Enter moves to the next box, a blank is left empty, Send my answers once a box has text; the camera stays off on this route); marked: "N right, M to look at", and on the walk "How did you get there?" (hold to talk, or type) | `practice`, `sheet`, `walk` | `/api/mark` (`image` or `answers`, exactly one) → `practice.marked` → `sheet`; `/api/explain` → `practice.settle` |
| Point & ask | the page mirror with the TV's band; tap a problem, a question (typed, preset or Mic), Ask the desk | — (picked by hand, or from Capture) | a tap → `item` and `nav page`; `/api/hint` → `hint.set` → `hint` |
| Linga | `LingaPhone`, below | every Linga screen (`lingaOwns`) | `/api/english` commands |
| Say it | an English sentence, typed, preset or Mic; Check it on the TV | `sentence` with nothing checked yet (Linga's Sentence help) | `/api/analyse` kind english → `english.set` → `sentence` |
| Essay | the lens; a file picker for a `.txt` or `.md` file, or a typed, pasted or dictated message; the text is split on blank lines (`paragraphsOf`) and the desk reads ONE paragraph at a time: the textarea holds the current one (still editable), "Paragraph 2 of 3" with Previous and Next appears when there is more than one, and Next is the button after a reading; Dictate, Analyse on the TV. A file is read in the browser, never uploaded or kept; one over 100 KB, empty, binary or of another type is refused in one sentence, and a paragraph over 4000 characters is refused with "split it" (both limits unmeasured, `rules/essay`). On `forensic`, the TV's sentence to rewrite in your own words, and Next paragraph (which sends the TV back to the lens home) | `essaytype`, `forensic`; also `tonight` waiting for an essay page and an unread essay page (`panelFor`: an essay is never a Capture hand-off) | `/api/analyse` kind essay (one paragraph, capped) → `essay.set` → `forensic`; kind rewrite → `essay.revised`; `nav essaytype` from Next paragraph |
| Tonight | the assignment list (add, tick done), the work clock Start/Pause, End session, then "What the desk noticed" | — | `task.add`, `task.done`, `timer.start` / `timer.pause`; End session: `/api/memory`, then `session.end` → `recap` |
| Recap (Parent) | the TV's recap in words, app by app (`recapRows`), the caption sentence, what needed a second hint; "Arrives when the session ends" before | — (the Parent role opens it) | — |

**Linga on the phone** (`desk/src/english/LingaPhone.tsx`): three buttons, **Talk / Set up / My map**.
Talk holds a panel of its own whatever the TV shows (`phonePanel`, `view.ts`): the level check (the question or
task, the answer box, Stop / Not now, the topic handshake with Swap and "add a topic in your own words"), a moment
(Back to the conversation), the start panel (Linga home on the phone: the same six states, a band chosen by hand,
and a list of every situation this learner is offered), or the live conversation (the partner's line, the reply box that records or takes
text, Help me answer, Choose a phrase, Pause & coach, Resume, Replay, Repeat audio / Cancel, Finish rehearsal, the
transcript). Set up holds the level, interests, goal, preferences and notes; My map the eight abilities, what Linga
taught, recent evidence and a printable map (`/english/print`). Two buttons under Talk: **Linga on the TV** (→
`linga`) and **Help with a sentence** (the Say it panel).

## 7. The flows, as the code runs them

1. **Pairing:** `landing` → Down to the phone → Select → `pair` → the phone joins → `joined` → Select → `landing`.
2. **Homework:** `landing` → Math Buddy → `tonight` → I have homework → the phone's Capture opens → Use this page →
   `page` reads, problems become focusable → Select → `hint` (spoken) → Still stuck → the second hint → Show me the
   lesson → `lesson` → Back → `hint` → Back → `page`.
3. **Point from the phone:** Point & ask, tap problem 7 (the TV goes to `page` on it) + "why is this negative?" →
   `hint`.
4. **Practice:** `tonight` → Teach me something → `topics` → Select → `practice` → the phone snaps the worked sheet →
   `sheet` → a tile → `walk` → the phone explains → the item settles → Back → `sheet` → Six more or Put the sheet
   away.
5. **Essay:** `landing` → Essay Master → `essaytype` → a lens → the phone's Essay tab → `forensic` → Rewrite on my
   phone → `essay.revised` → Next sentence; Why this matters → `playbook` → `xray`.
6. **Linga:** `landing` → Linga → `linga` → Find my level → `linga-check` → `linga-verdict` → See my topics →
   `linga-plan` → Agree → `linga` → Start talking → `linga-talk` → (`linga-moment`, `linga-coach`) → Finish →
   `linga-recap` → Learning map → `linga-map`.
7. **Timer:** Play/Pause (or Start on the phone's Tonight) → 25 minutes → `break` → back where it was.
8. **Recap:** Menu on the landing (or End session on the phone) → `recap` → Select a tile → what it names, or Back →
   the desk; the phone's Recap tab shows the same evening.
