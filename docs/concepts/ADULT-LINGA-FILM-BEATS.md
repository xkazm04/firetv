# Adult Linga in the Devpost film: proposed beats

Written 2026-10-23 on branch `polish/adult-linga`, after driving the whole adult flow live (claude CLI engine) on a scratch
desk at TV 1920 x 1080 and phone 414 x 896. Captures: `artifacts/adult-linga-2026-10-23/` (git-ignored). The beats follow
the format of `film/studydesk/film.json` and `tools/film-capture/beats.mjs` in the film worktree (`firetv-film`): a
`line` of narration per beat, a `capture.beat` program with `setup` (off-window), `act` (on camera, the first step the
anchor unless a step says `anchor: true`), `phone`, `live`, `expect`.

**Budget: about 29 s in four beats**, to sit after the child's Linga beats (`linga-reply`) and before Math Buddy, so the
film says once: the same Linga, a grown-up at the desk, a different game.

## The seed the film needs

A second learner beside **Nell** (11, UK, all three apps):

| Field | Value | Why |
| --- | --- | --- |
| `id`, `name` | `demo-dana`, `Dana` (invented) | Not the operator's learners. Avoid a name the model may give the partner: in the live run the learner was "Marta" and the model named the chef "Chef Marta Ilic". |
| `type`, `age` | `other`, no age | The Adult row shows for `other` (or age 18+); picking "Adult (18+)" there is the 18+ confirmation (`lib/rules/mode.ts`). |
| `mode` | `adult` | `profile.draft` accepts it for `other` (`adultGated`, `store.ts`). |
| `modules` | `["english"]` | Keeps her landing to Linga alone; the switch beat then lands on Linga at once. |
| English preferences | `level: "B1"`, `correction: "pauses"`, `creativity: "playful"`, `challenge: "realistic"` | `pauses` is load-bearing: with the default `as-needed` the first slip stops the scene for a fix moment ("One thing to fix"), so the roleplay never flows and Cut has less to say. With `pauses` the slips are kept for Cut. |
| Placement | `{ band: "B1", source: "self", confidence: "low" }` | Without one, Linga home opens on "Let's find your level" (a 7-minute check). A self-picked level is honest and is what the live run used ("I'll pick my level"). |

How to seed it, the way `seed.mjs` seeds Nell: `profile.draft` with the profile above, `profile.save`, then write the
English part into the film desk's own `demo-data/learners.json` under `demo-dana` (as `tools/linga-cert-live.cjs` seeds
its learners: `{ ...emptyEnglish(), preferences, placement }`). Then `learner.set` back to Nell so the film's earlier
beats are unchanged.

**How the TV switches learner.** On the remote: from the landing, Down to the place card ("Choose who"), Select opens
"Who is at the desk?"; Right walks the cards; Select on Dana seats her (`learner.set`) and returns to the landing. From
Linga home, Up opens the same screen. Off-window, the setup step is one event: `{ type: 'learner.set', id: 'demo-dana' }`.
The learner card says "OTHER", not "Adult": the mode is not drawn on the card (see "Left as is").

## The beats

| # | Beat | Hold | Screen | Remote / phone | Narration (draft) |
| --- | --- | --- | --- | --- | --- |
| 1 | `adult-pitch` | 8 s | Linga situations, then "Shaping your scene" (TV + phone split) | setup: `learner.set` Dana, `nav linga-scenes`, focus 2 (Pitch a scene). act: OK; phone types the pitch, taps **Play it**; until the partner's first line (anchor) | "Grown-ups get their own Linga. Dana pitches a scene in her own words: a job interview at a fancy restaurant, and she knows nothing about wine." |
| 2 | `adult-scene` | 7 s | the conversation: the chef's line, Dana's reply (TV + phone split) | phone types a reply with one slip ("Last year I work in a hotel and I explain the menu every evening."), **Send reply**; until the chef answers (anchor) | "The chef plays the part. Dana answers from the phone, mistakes and all." |
| 3 | `adult-cut` | 7 s | Cut, "Writing your notes", then the tape of notes | DOWN, DOWN, DOWN (the fourth door, Cut, in the 2 x 2 row), OK; until `conversation.cut` (anchor); RIGHT once to walk to the second pin | "When she says Cut, the scene stops. Up to three notes, each quoting her own words." |
| 4 | `adult-take-two` | 7-8 s | Take Two: the chef's line again, Dana's new line, back to the tape with the fixed line struck through (TV + phone split) | RIGHT to "Take Two · note N", OK; phone types the line with the fix, **Send reply**; until the take's reply (anchor); BACK; hold on the struck pin and the branch | "Take Two plays that moment again. Fixed, the old line is struck through. No score, just the second go." |

Narration is plain and names no product but our own. "Cut" and "Take Two" are the desk's own words.

### The programs, as `beats.mjs` would hold them

```js
'adult-pitch': {
  phone: true, live: true,
  setup: [{ event: { type: 'learner.set', id: 'demo-dana' } }, { event: { type: 'subject', subject: 'english' } }, nav('linga-scenes', 2)],
  act: [{ key: 'OK' }, { wait: 1200 },
    { phone: 'fill', label: 'Where are you, and who do you meet? Linga plays the other person.', text: 'A job interview for a sommelier at a fancy restaurant. I know nothing about wine, and the head chef is very serious.' },
    { phone: 'click', name: '^Play it$' },
    { until: (s) => (s.conversation?.turns?.length ?? 0) >= 1 && !s.conversation?.pending, ms: 60_000, anchor: true }],
  expect: (s) => [...at('linga-talk')(s), ...(s.conversation?.sceneId?.startsWith('pitch') ? [] : ['not a pitched scene'])],
},
'adult-scene': {
  phone: true, live: true, setup: [],
  act: [{ phone: 'type', label: 'Your reply', text: 'Talking with guests. Last year I work in a hotel and I explain the menu every evening.' },
    { phone: 'click', name: '^Send reply$' }, { until: (s) => !s.conversation?.pending && s.ask?.phase !== 'sent', ms: 60_000, anchor: true }],
  expect: at('linga-talk'),
},
'adult-cut': {
  live: true, setup: [],
  act: [{ keys: ['DOWN', 'DOWN', 'DOWN'], gap: 700 }, { key: 'OK' }, { until: (s) => !!s.conversation?.cut, ms: 60_000, anchor: true }, { wait: 1500 }, { key: 'RIGHT' }],
  expect: (s) => [...at('linga-recap')(s), ...((s.conversation?.cut?.notes?.length ?? 0) >= 1 ? [] : ['no note kept'])],
},
'adult-take-two': {
  phone: true, live: true, setup: [],
  act: [/* RIGHT until "Take Two · note N" is lit, N = the note quoting the scripted slip */ { key: 'OK' }, { wait: 1500 },
    { phone: 'type', label: 'Your reply', text: '<the line with the note\'s better form>' }, { phone: 'click', name: '^Send reply$' },
    { until: (s) => !s.conversation?.pending, ms: 60_000, anchor: true }, { key: 'BACK' }],
  expect: (s) => [...at('linga-recap')(s), ...((s.conversation?.takes ?? []).some((t) => t.held === true) ? [] : ['the take did not hold'])],
},
```

Two things the program cannot fix in advance, because the notes are the model's:

- **Which note to replay.** The beat must find the note whose `quote` is the scripted slip (`s.conversation.cut.notes`)
  and press RIGHT `notes.length + i` times from the first pin (the row is: each note, then each Take Two, then Another
  situation, Learning map). That needs a key count computed from the session, which `beats.mjs` steps do not take today.
- **The fixed line.** The take holds when the new line contains the note's better form (code, `lib/english/take.ts`).
  The live run held both times with the obvious correction ("worked ... explained"; "where the map goes"), but the
  exact words come from the note. Either `phone: 'type'` takes `text: (s) => ...`, or the line is sent in a `setup`
  `phonePost` and only the result is filmed (weaker: the phone is then not seen typing).

Measured on 2026-10-23 with the claude CLI: pitch to first line 14-18 s, a turn 11-18 s, Cut 8-12 s, a take's turn 8-11 s.
Every live step is anchored on its arrival, so the cut can drop the wait.

## Does the stick show the same thing?

Not filmed here (the task did not need the stick). The adult screens are the same `LingaTV` door, tape and phone panels
the child's beats already showed on the stick, so nothing stick-specific is expected; two cautions for the stick take:
the footer reads "Audio is unavailable. Follow the captions." on the film desk (no voice key), as in the child's beats;
and the 2 x 2 action row is walked by DOWN in reading order (Help, Pause & coach, Choose a phrase, Cut), so Cut is three
DOWNs from rest. If "Choose a phrase" is not offered on that line the row has three doors and Cut is two DOWNs:
the program should walk until the lit door reads Cut rather than count.

## Fixed on this branch for the camera

- The situations row: "Pitch a scene" was crushed to three lines by the full "On your phone" badge in a half-width door; a half-width door now carries the phone icon alone.
- Sending a pitch left the old situation card standing for 10-20 s with nothing said; the TV now says "Shaping your scene" and the footer "Shaping your scene…".
- The adult conversation (four doors: Help, Pause & coach, Choose a phrase, Cut) with a try card overflowed the top of the stage (the kicker cut off, the partner's card under the learner's name); four doors now sit two by two.
- Cut in flight said "Your partner is preparing the next turn" and "Preparing a reply…"; it now says Linga is writing up to three notes, and the footer "Writing your notes…".
- The tape of notes had no layout of its own (pins borrowed the topic doors, the better form drawn as an uppercase label) and the Take Two branch and the counts rendered at the top-left of the stage, out of sight; the tape is now one column of pins, the branch and the counts under the head.
- Inside Take Two the TV and phone showed "Saved for the end: 2" (nothing in a take is recorded); gone. A focused "Take Two · note N" now lights its pin; after the learner's new line the caption tag reads "Your turn".
- The phone's pitch field repeated "Pitch a scene" as its label; it now asks "Where are you, and who do you meet? Linga plays the other person." and sends with "Play it".
- A pitched scene's kicker wrapped mid-number ("8–" / "10 MIN"); it reads "Your own scene · 8–10 min".

## Left as is (with where)

- The learner card on "Who is at the desk?" says "OTHER", never "Adult" (`desk/src/tv/screens.tsx`, shared).
- A pitched fantasy scene draws a generic picture with the arch's "A way into English" label (`lib/english/view.ts` `artOf`, `english/art`): the art is chosen from place words, and a tavern has none.
- The default `correction: "as-needed"` stops an adult roleplay at the first slip; whether Adult should default to `pauses` (notes at Cut) is a product call (`lib/english/curriculum.ts` `defaultPreferences`, on the live model surface).
- A pitched scene's "sentence to take with you" keeps the model's straight quotes ("\"I don't know much about wine yet...\"") (`lib/english/pitch.ts`, live surface).
- The recap's counts line ("0 spoken · 3 written replies · ...") is hidden only while a Take Two branch is drawn.
