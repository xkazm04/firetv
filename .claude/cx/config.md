---
product: "Study Desk"
surfaces: ["tv", "phone"]
vault: ["C:/Users/kazda/kiro/firetv/.cx"]
vault_subdir: Cx
design_doc: docs/DESIGN-ON-AIR.md       # the shell's; each app has its own, see Design law by surface
screens_source: docs/STUDY-DESK-SCREENS.md   # stale since the 2026-09-24 redesigns: read the code (see Screens)
executor: opus
stops_per_session: 3
commit_format: "cx(S<n>): <screen> - <what changed>"   # no commit gate in this repo (checked 2026-09-25)
---

# /cx overlay - firetv (Study Desk)

Study Desk is the homework desk on the TV: a Fire TV surface driven by a D-pad and a phone that
is the instrument (camera, pen, keyboard, mic). The prototype is a Next.js app in `desk/`; it is
the design document for the native Fire TV + AWS product, so every proposal here is a proposal
about the product, made on the prototype. The design language is On Air (`docs/DESIGN-ON-AIR.md`)
and it is law for the walk: a proposal that needs the philosophy changed is raised, not enacted.

## Journeys

- Anyone - First arrival: landing, settings / profile (create or switch; type of student and preferences drive the content), pair - success: at their own profile in under a minute
- Ema (15, learner) - Maths homework night: pair, tonight, snap the sheet, page, hint, still stuck, lesson, back to the page, recap - success: finished the sheet with hints, not answers
- Ema - English sentence check: say a sentence on the phone, see the tense and the time word on the TV, the rule, the head-to-head unit - success: knows which tense and why
- Ema - Essay draft: choose the lens on the TV, paste the paragraph on the phone, forensic view, playbook, x-ray - success: knows what the paragraph needs, without it being rewritten
- Parent - Evening check-in: join as parent, point at a problem from the sofa, ask, later read the recap - success: knows where it was hard, in two minutes
- Ema - Between sessions: calendar of lessons on file, units guide, break screen, learner switch - success: knows where she is in the syllabus

Audiences: English is for anybody (Duolingo-like); maths mainly for high-school students; essays primarily for students, with adult review and a more philosophical conversation on top of the review in scope.

## Design law by surface

Since the 2026-09-24/25 contests each app is its own brand, and a proposal is judged against the doc of the
surface it touches:

- landing - `docs/DESIGN-STUDY-DESK.md` (Left on the Desk: walnut, the lamp, objects in each app's brand)
- Math Buddy (tonight, topics, practice, sheet, walk, maths page/hint/lesson/units/calendar) - `docs/DESIGN-MATH-BUDDY.md` (Lamplight)
- Linga (every `linga*` screen, tonight while the subject is english) - `docs/DESIGN-LINGA.md` (the Open Door)
- Essay Master (essaytype, forensic, playbook, xray) - `docs/DESIGN-ESSAY-MASTER.md` (Specimen)
- the shell (pair, joined, learner, profile, break, recap, sentence, headtohead, the english/essay page and hint) - `docs/DESIGN-ON-AIR.md`

## Screens

The session's `screen` union is `desk/src/lib/session/store.ts:22`; `desk/src/app/tv/page.tsx` routes a screen
to `LandingTV`, `EssayTV` (`essayOwns`), `MathsTV` (`mathsOwns`), `LingaTV` (`lingaOwns`) or the shell's
`tv/screens.tsx`, in that order; the D-pad is `KEYMAP` in `desk/src/tv/keys.ts` (Linga keys in `english/LingaTV.tsx`).
The phone is `desk/src/app/phone/page.tsx` (tabs: Capture, Practice, Point & ask, Linga, Say it, Essay, Tonight,
Recap, Profile) and `english/LingaPhone.tsx`; which panel follows which TV screen is `phone/panelFor.ts`.

- landing - tv - the start and every `learner.set`; Left/Right the apps, Up the place card, Down the phone while unpaired, Menu ends the evening
- pair / joined - tv - the landing's phone stop; a phone `join` lands on joined
- learner / profile - tv (+ phone for the name) - the place card; add, or Menu on a profile to edit
- tonight / topics / practice / sheet / walk - tv (Math Buddy) - Select Math Buddy; Teach me something -> topics
- page / hint / lesson - tv - Homework on tonight + a phone capture (`/api/read`), Select an item (`/api/hint`)
- units / calendar - tv - only as Back targets, or Menu from a maths lesson
- linga / linga-check / -verdict / -plan / -scenes / -talk / -moment / -coach / -recap / -map - tv - Select Linga; every step is `POST /api/english`
- essaytype / forensic / playbook / xray - tv - Select Essay Master; the phone's Essay tab posts `/api/analyse`
- sentence / headtohead - tv - the phone's Say it; Linga's menu "Sentence help"
- break / recap - tv - a finished work block (the TV bar's Clock x60); Menu on the landing or End session on the phone

Content screens need the real routes (they call the engines; `practice.set`, `hint.set`, `essay.set`,
`linga.changed` and the like are server-only and answer 403 to a posted event).

## Run

Pairing is a server fact since 2026-09-25: the TV page needs `/tv?key=<key>` from `<DESK_DATA_DIR>/pairing.json`,
and a phone joins with `/phone?pin=<pin>` (the TV's `GET /api/session` carries the pin). A plain `/tv` shows
"Not this desk's TV".

Never walk against `desk/data` (the owner's): copy it and point `DESK_DATA_DIR` at the copy. Next refuses a
second `next dev` in the same checkout, so when the owner's server is up the walk runs in its own worktree
(junction `desk/node_modules` and `tools/node_modules` to the operator's, copy `desk/.env.local`) with webpack:

```
DESK_DATA_DIR=<copy> npx next dev --webpack -p 3210          # in <worktree>/desk
```

Drive and capture with Playwright from `tools/node_modules` (load it with `createRequire`): open
`/tv?key=`, post events to `/api/session` with the TV's cookie, press keys on `.stage`, and screenshot `.frame`
at a 1920x1130 viewport; the phone is a second context at 430x900 opened on `/phone?pin=`. Reads take ~25 s,
hints 2-8 s, a practice set about a minute, a Linga turn 10-30 s (claude-cli) - wait for the screen's own
text before capturing.

## Gates

```
cd desk && npm test          # tsc --noEmit plus the rules suites (worktree-preflight links node_modules first)
```

plus a re-capture of the changed screen compared against the acceptance line in the brief.

## Repo law

- On Air (`docs/DESIGN-ON-AIR.md`, the shell's language; each app follows its own doc - see Design law by surface): one band per screen; no two screens share a layout; the hint
  is the caption and the timer is the clock; condensed caps label, Barlow reads; red signals,
  white speaks, charcoal holds; cuts not fades; focus is a skew with a hard red shadow; subject
  channel colours are thin - tags and strokes only; 5% safe zone; nothing under 28 px; the TV
  never asks for typing.
- Decisions stay in code (`desk/src/lib/rules/`): the model explains, it does not decide. A
  proposal must not move a decision (a tense, a sentence role, a retrieval pick) into a prompt.
- Engines stay behind `desk/src/lib/engines/` with a `provider` field; nothing calls Ollama, the
  CLI or ElevenLabs directly from a page.
- The session is the only state (`desk/src/lib/session/store.ts`); the TV renders it, the phone
  posts events to it. No page keeps product state of its own.
- Pathspec-scoped commits; `desk/data/`, `desk/.env.local` and the vault's PNGs are never staged.

## Heuristics

- **The phone never renders the big view** - a phone screen that shows what the TV shows is a
  defect, except the page mirror used for pointing.
- **Reads and hints are slow and must look busy in the product's voice** - a bare spinner is a
  defect; the ticker or the status line should say what the desk is doing.
- **Withholding is the product** - any proposal that would put the answer, a verb form, or a
  rewritten sentence on screen is withdrawn on sight.
