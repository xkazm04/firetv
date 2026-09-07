---
product: "Study Desk"
surfaces: ["tv", "phone"]
vault: ["C:/Users/kazda/kiro/firetv/.cx"]
vault_subdir: Cx
design_doc: docs/DESIGN-ON-AIR.md
screens_source: docs/STUDY-DESK-SCREENS.md
executor: opus
stops_per_session: 3
---

# /cx overlay - firetv (Study Desk)

Study Desk is the homework desk on the TV: a Fire TV surface driven by a D-pad and a phone that
is the instrument (camera, pen, keyboard, mic). The prototype is a Next.js app in `desk/`; it is
the design document for the native Fire TV + AWS product, so every proposal here is a proposal
about the product, made on the prototype. The design language is On Air (`docs/DESIGN-ON-AIR.md`)
and it is law for the walk: a proposal that needs the philosophy changed is raised, not enacted.

## Journeys

- Ema (15, learner) - Maths homework night: pair, tonight, snap the sheet, page, hint, still stuck, lesson, back to the page, recap - success: finished the sheet with hints, not answers
- Ema - English sentence check: say a sentence on the phone, see the tense and the time word on the TV, the rule, the head-to-head unit - success: knows which tense and why
- Ema - Essay draft: choose the lens on the TV, paste the paragraph on the phone, forensic view, playbook, x-ray - success: knows what the paragraph needs, without it being rewritten
- Parent - Evening check-in: join as parent, point at a problem from the sofa, ask, later read the recap - success: knows where it was hard, in two minutes
- Ema - Between sessions: calendar of lessons on file, units guide, break screen, learner switch - success: knows where she is in the syllabus

## Screens

TV screens are keyed by the session's `screen` id in `desk/src/lib/session/store.ts`; compositions
in `desk/src/tv/screens.tsx`; the inventory with D-pad behaviour in `docs/STUDY-DESK-SCREENS.md`.

- pair - tv - reset the session (`POST /api/session {"type":"reset"}`), open /tv
- tonight - tv - after join; Left/Right over tasks, Enter opens a subject, Menu marks done, Up = learner
- units - tv - Enter on the English or Essay task; Up/Down rows, Menu = head-to-head / playbook
- calendar - tv - from maths units, Menu
- page - tv - after a phone snap or Down from tonight; Up/Down items, Menu = overview, Enter = hint
- hint - tv - Enter on a page item; Left/Right actions, Enter = still stuck / lesson, Back = page
- lesson - tv - from hint (Show me the lesson) or units (Enter); Space pauses, Back returns
- sentence - tv - from the phone's Say it; Enter on "Show me the unit" = head-to-head
- headtohead - tv - from units (Menu) or sentence
- essaytype - tv - Enter on the Essay task; arrows over four lenses, Enter chooses
- forensic - tv - from the phone's Essay after a lens; Menu = table view, Enter = playbook
- playbook / xray - tv - from essaytype (Menu) or forensic (Enter); Enter on a play = xray
- break - tv - Clock x60 in the dev bar, then wait; Enter skips
- recap - tv - End session on the phone's Tonight; Enter = send to parent
- learner - tv - Up from tonight
- join / capture / point / say / paste / tonight / parent - phone - the bottom nav on /phone

## Run

```
cd desk && npm run dev                     # http://localhost:3000/tv and /phone
```

Capture a TV screen with Playwright from `tools/` (installed for the live UI test):

```
cd tools && node -e "const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1130}});await p.goto('http://localhost:3000/tv');await p.waitForTimeout(3000);await (await p.$('.frame')).screenshot({path:process.argv[1]});await b.close();})();" <out.png>
```

Drive the screen first by posting session events to `/api/session` (nav, page.select, item) or by
sending keys in the same Playwright script; the phone is `/phone` at 430x900. Reads take ~25 s
(vision), hints 2-8 s, the first lesson pick ~1 min - wait for the status line before capturing.

## Gates

```
cd desk && npx tsc --noEmit -p tsconfig.json
```

plus a re-capture of the changed screen compared against the acceptance line in the brief.

## Repo law

- On Air (`docs/DESIGN-ON-AIR.md`): one band per screen; no two screens share a layout; the hint
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
