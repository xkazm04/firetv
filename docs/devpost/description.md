# Study Desk: homework on the living-room TV

*The text description for the Devpost submission, ready to paste. Every claim cites the doc or
commit it comes from; the citations can be dropped from the pasted copy.*

## What it does

Study Desk turns the Fire TV in the living room into a homework desk for a family. The TV leads:
the learner and a parent sit on the sofa and look at one big screen, driven by the Fire TV remote.
The phone assists: it joins the desk once, and after that it is the camera, the keyboard and the
microphone, used only when the TV asks for one of them. The TV adds what a phone app cannot: two
people looking at one page from the sofa, the phone pointed at the paper instead of held in the hand,
and the work kept away from the phone's notifications ([STUDY-DESK-SCOPE.md](../STUDY-DESK-SCOPE.md), section 1).

Its stance is the opposite of the answer apps: **it never puts the answer on screen**. Hints withhold
the answer, and a verdict on the learner's work is decided by code, not by a model
([AGENTS.md](../../AGENTS.md), "Constraints"; [STUDY-DESK-SCOPE.md](../STUDY-DESK-SCOPE.md), section 2).

The landing ("Small Worlds") holds three apps, each drawn as a small world in layered paper. The one
in the light fills the screen and its shelf shows what that app has waiting for the learner who is
seated ([DESIGN-STUDY-DESK.md](../DESIGN-STUDY-DESK.md)):

- **Math Buddy.** Tonight's homework: the phone photographs the sheet, the TV shows the working in
  the learner's own hand and marks each error inside the line, by kind
  ([DESIGN-MATH-BUDDY.md](../DESIGN-MATH-BUDDY.md)). The model marks the work and must show its own
  solution; the desk re-checks that solution itself, and where the two disagree no verdict reaches the
  screen ([STUDY-DESK-SCOPE.md](../STUDY-DESK-SCOPE.md), "Overturned 2026-09-08"; `desk/src/lib/desk/verify.ts`).
  It also has lessons with a video that Play/Pause controls from the remote, and "Get ready for
  school" ([STICK-APK-WALK-2026-10-20.md](../concepts/STICK-APK-WALK-2026-10-20.md), the TL-1 lesson rows and the re-walk's M6 row).
- **Linga (English).** A conversation is a place you step into: the learner rehearses a situation
  in English with a partner on the TV, answers on the phone, and gets one coaching note
  ([DESIGN-LINGA.md](../DESIGN-LINGA.md), [LINGA-CONVERSATION-DESIGN.md](../LINGA-CONVERSATION-DESIGN.md)).
  A short placement conversation ends in a band from A1 to C2 that the learner can see, instead of
  asking them to guess their level ([LINGA-PLACEMENT-DESIGN.md](../LINGA-PLACEMENT-DESIGN.md)).
- **Essay Master.** "The type is the diagram": the learner sends a paragraph from the phone, and the
  TV reads it through lenses (structure, argument and others) set large enough to read from the sofa
  ([DESIGN-ESSAY-MASTER.md](../DESIGN-ESSAY-MASTER.md); deadline walk rows 18-21 in
  [STICK-DEADLINE-WALK-2026-10-21.md](../concepts/STICK-DEADLINE-WALK-2026-10-21.md)).

Around the three apps is a shell for the family: choosing who is studying, pairing a phone, a break
timer, and a recap of the evening ([DESIGN-ON-AIR.md](../DESIGN-ON-AIR.md)).

## How it is used

1. **Open "Study Desk" on the Fire TV.** The app finds the desk on the home network by itself
   ([STICK-APK-WALK-2026-10-20.md](../concepts/STICK-APK-WALK-2026-10-20.md), "Install and point it";
   commit fe4cb34b).
2. **Choose who is studying** with the D-pad and Select.
3. **Pair a phone.** The TV shows a QR code, a four-digit code and the address; the phone opens the
   address, types the code and joins ([STICK-DEADLINE-WALK-2026-10-21.md](../concepts/STICK-DEADLINE-WALK-2026-10-21.md),
   rows 3-8).
4. **Work on the TV.** The remote moves through the screens. When the TV needs a photo, a typed
   answer, a paragraph or a spoken reply, it opens an *ask*, and the phone shows only the panel for
   that ask. The phone cannot seat a learner or move the TV: the desk refuses those posts and the
   session stays byte-identical ([TV-LED-PAIRED-EXPERIENCE-DESIGN-2026-10-19.md](../concepts/TV-LED-PAIRED-EXPERIENCE-DESIGN-2026-10-19.md),
   H1-H3 under "Stick pass 2026-10-20").

## How it works

- **The desk** (`desk/`) is a web app that runs on a computer on the home network. Its one source of
  state is a session store, a reducer that fans each change out to the TV and the phone over a
  server-sent event stream and keeps it as JSON (`desk/src/lib/session/store.ts`; [AGENTS.md](../../AGENTS.md),
  "Architecture map").
- **Three kinds of caller.** Every request is classified as the TV (it holds the desk's key, set once
  as an httpOnly cookie), a phone (it joined with the TV's code and holds its own token) or a guest
  (anyone else on the network, who sees only the lobby) (`desk/src/lib/session/pairing.ts`, `desk/src/proxy.ts`).
- **Decisions in code.** The rules live in `desk/src/lib/rules/`. Models explain; they do not decide.
  The model engines (text, vision, voice, embeddings) sit behind one provider seam
  (`desk/src/lib/engines/registry.ts`), so every one of the 104 rules suites in `tools/*-test.cjs`
  runs with the models stubbed and no live call ([AGENTS.md](../../AGENTS.md), "Constraints").
- **The Fire TV app** (`stick-app/`) is a small Android app for Fire OS with no dependencies: one
  fullscreen WebView that loads the desk's TV page, launchable from the Fire TV launcher (commit
  17a3a854). Its `KeyBridge` turns each remote button into the key event the page already handles:
  the D-pad to the arrow keys, Select to Enter, Back, Menu and Play/Pause. A short Back goes to the
  page; a held Back, or a page that does not handle Back, leaves the app (commits 56e9db4e, 59e7e00a).
  It probes the desk's guest door, searches its own /24 network when the kept address does not answer,
  keeps only `host:port` (never the key, never a loopback address), shows its own "The desk is not
  answering" and "Where is the desk?" screens, and recovers by itself when the desk comes back
  (commits fe4cb34b, d9bb3c9e; [STICK-APK-WALK-2026-10-20.md](../concepts/STICK-APK-WALK-2026-10-20.md),
  "Standalone").

## What runs on the real Fire TV Stick

The device is a Fire TV Stick 4K (model AFTKM, Fire OS 8, Android 11) with Amazon WebView 150
([STICK-APK-WALK-2026-10-20.md](../concepts/STICK-APK-WALK-2026-10-20.md), "TL-1 through the APK").

- **Every remote button reaches every TV screen through the app.** On the landing, Linga, a Math
  Buddy lesson and the break, the D-pad, Select, Back, Menu and Play/Pause each arrive with the key
  name the page maps, and Back never leaves the page while the page handles it (TL-1 table, 24 rows,
  all pass; walk commit fa678440).
- **Finding the desk with no tunnel.** With no `adb reverse` or `forward` in place, the app found the
  desk, moved to it when its address changed, showed the error screen while the stick's Wi-Fi was off
  and recovered about 12 s after it came back ("Proof, without adb reverse"; commit 83ea464c).
- **The deadline walk against the production desk** (2026-10-21): pairing, choosing a learner, Linga's
  menu and its first placement question, and Essay Master's lens home and paragraph ask passed on the
  stick, with the phone side checked at 360 and 414 px
  ([STICK-DEADLINE-WALK-2026-10-21.md](../concepts/STICK-DEADLINE-WALK-2026-10-21.md); commit e4176983).
- **Smooth on the stick's GPU.** The idle landing went from 8.7 to 59 fps and lamp moves and Back from
  6-7 fps to 22-45 fps, with the same picture, after the landing's shadows were moved inside the
  drawing ([STICK-PERFORMANCE-2026-10-20.md](../concepts/STICK-PERFORMANCE-2026-10-20.md); commits
  c5dfc4cb, 9d5de46f, 51d960bf, 0260f23a, 40afd99c). No blank frame shows between the apps any more
  ([STICK-WHITE-FRAME-2026-10-20.md](../concepts/STICK-WHITE-FRAME-2026-10-20.md); commit 6c7d24f6).

The repository's first product, a telestrator where a phone draws on a paused video frame, also ran on
the same stick model over Wi-Fi on 2026-09-07: its live UI test passed 27 of 27 and its pen round-trip
p95 is 21.1 ms ([POC-FINDINGS.md](../POC-FINDINGS.md), section 7).

## Honest limits

- The desk is a functional prototype, a design document to be rebuilt natively on Fire TV; it runs on
  a computer on the home network, not on the stick ([AGENTS.md](../../AGENTS.md), "What this repository is").
- Linking the stick to a desk once needs one `adb` command carrying the TV link the desk prints at
  start ([STICK-APK-WALK-2026-10-20.md](../concepts/STICK-APK-WALK-2026-10-20.md), "Provisioning the TV key").
- Each module switch still holds one 0.4-0.7 s stall while the stick rasters the arriving screen
  ([STICK-PERFORMANCE-2026-10-20.md](../concepts/STICK-PERFORMANCE-2026-10-20.md), "Left open").
- The Writing page cannot be reached from the stick yet, and the Math Buddy flow was not re-walked on
  2026-10-21 ([STICK-DEADLINE-WALK-2026-10-21.md](../concepts/STICK-DEADLINE-WALK-2026-10-21.md), B1 and B3).
- The stick walks pressed the keys with `adb shell input keyevent`, which enters the same
  `dispatchKeyEvent` path as the remote; a press of the physical remote is still the operator's
  ([STICK-APK-WALK-2026-10-20.md](../concepts/STICK-APK-WALK-2026-10-20.md), "Open").
