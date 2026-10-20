# Study Desk: the TV-led paired experience, design of 2026-10-19

State described: local `main` at f788a5dd (the base of `autopilot/accepted-idea-delivery-161cb6fc`). Design only: no code
changed. Nothing here is verified on the stick; every slice in section 6 names the check the Director runs there.

Source of the change: the operator's run on the real Fire TV stick and a phone (2026-10-19). Pairing worked. The TV and the
phone then did not react to each other compatibly, and the phone's bottom menu did not fit the phone's width. The
operator's ruling: **the TV is the initiator. Once paired, the TV leads every step with the remote. The phone is used only
for typing a name or a text, camera capture, dictation, and private text.**

## 0. The rule, and the one mechanism that carries it

1. The TV leads. Every step is reached, chosen, confirmed and left with the remote.
2. The phone is an instrument the TV picks up for one job and puts down again. The jobs are: type a name, type or paste
   a text, take a photo, dictate, and show a private text the TV must not show.
3. At most one hand-off is open at a time, and it is named in the session as `ask`. The phone shows that hand-off's
   panel and nothing else. With no hand-off open it shows one card: "Look at the TV."
4. The phone never moves the TV. It answers the open hand-off, or cancels it.
5. Every hand-off has a TV way out (Back). Where the job allows it, it also has a remote-only way to finish.

Today the hand-off is not a thing the session holds. It is inferred twice, in two different ways: the TV writes a
`status` sentence ("paste or dictate the paragraph on the phone", `desk/src/tv/keys.ts:455`), and the phone guesses a
panel from the TV's screen id (`cueFor`, `desk/src/app/phone/panelFor.ts:20-52`). Most rows of section 3 come from
that gap. The fix is one new session field:

```ts
// desk/src/lib/session/store.ts (slice TL-5)
type AskKind = "name" | "page" | "sheet" | "answers" | "question" | "explain" | "second" | "paper"
             | "paragraph" | "rewrite" | "slot" | "sentence" | "reply" | "words" | "prefs" | "private";
interface Ask {
  id: string;              // minted by the desk on ask.open (node:crypto); the phone answers this id
  kind: AskKind;
  learner: string | null;  // who it is for; a different learner seated closes it
  screen: Screen;          // the TV screen that opened it; the TV leaving that screen closes it
  at: number;              // when it opened
  phase: "open" | "sent";  // sent: the phone has answered and the desk is working on it
  detail?: { subject?: Subject; n?: number; i?: number; walkIx?: number; turnId?: string };
}
// Session gains: ask: Ask | null; phonesLive: number   (phonesLive: slice TL-3)
// Events: ask.open {kind, detail}   TV role only (route 403 for phone and guest)
//         ask.cancel {id}           TV or phone; a stale id changes nothing (409)
//         ask.sent {id}             server only (SERVER_ONLY in desk/src/app/api/session/route.ts:12)
//         phone.presence {live}     server only, raised by the stream route
```

The result event that answers an ask closes it in the same dispatch (`page.reading`, `practice.marked`, `hint.set`,
`practice.settle`, `practice.second`, `paper.enter`, `essay.set`, `essay.revised`, `essay.slot`, `english.set`,
`linga.changed` for the turn, `profile.draft` with a name followed by the phone's Done). The `status` sentences stay as
captions; they stop being the signal.

## 1. Flow map: who leads each step, and why

"TV" means the remote on the TV. "Phone" means the step is one of the five phone jobs. A step marked "Phone" always runs
inside a hand-off the TV opened (section 2).

### 1.1 Pairing

| # | Step | Leads | Why |
|---|---|---|---|
| P1 | The landing's phone object → Select → `pair` (QR and 4-digit code) | TV | The TV is the initiator. Today the object is a stop only while no phone has ever joined (`desk/src/tv/landingRows.ts:38`); it becomes a stop always (TL-3) |
| P2 | Scan the QR, or open the printed address | Phone | Only the phone's camera or browser can do it |
| P3 | Type the 4 digits (no QR) | Phone | Typing |
| P4 | The join lands: TV shows `joined` ("Paired. Select: choose who is studying"); the phone shows "Paired. Look at the TV." | TV | The next step is a choice, and choices are the remote's |
| P5 | Select → `learner` (no one seated) or `landing` | TV | As today (`keys.ts:342`) |
| P6 | Forget this desk | Phone (More) | It drops the phone's own cookie (`route.ts:56-62`). The TV's counterpart is "Forget every phone" on the TV's phone screen (TL-2) |

### 1.2 Choosing the learner

| # | Step | Leads | Why |
|---|---|---|---|
| L1 | Someone else, or any app with no one seated → `learner` cards | TV | As today (`keys.ts:328`, `:337`) |
| L2 | Select a card → seated → `landing` | TV | As today (`store.ts:703`) |
| L3 | Add a learner → the picks (type, age, mode, system, interests, course) | TV | Picks are choices (`keys.ts:369-393`) |
| L4 | The name | Phone (ask `name`) | Typing. Opened by Select on a new Name row at the top of the profile, and opened at once by Add a learner, since a profile cannot be saved without a name (`store.ts:719`). The TV shows the name live as it is typed (the draft already carries it, `screens.tsx:484`). The remote-only path is Operator decision OD1 |
| L5 | Save, or Back | TV | Today the phone also has Save and Cancel (`desk/src/app/phone/page.tsx:558-559`); they go. The phone's only control is Done, which closes the ask |
| L6 | Edit a learner: Menu on a card | TV | As today (`keys.ts:367`) |

### 1.3 Linga

| # | Step | Leads | Why |
|---|---|---|---|
| E1 | Landing → Linga → home (six states), the menu, situations, map, level, plan, certificates | TV | All are choices; LingaTV already draws every one as an action (`desk/src/english/LingaTV.tsx:36-42`, `:65`) |
| E2 | A level-check question to answer in words or speech | Phone (ask `reply`) | Speech or typing. Choice tasks and "I don't know" stay on the TV |
| E3 | The goal text, "Add a topic", pitching your own scene | Phone (ask `words`) | Typing. The TV keeps "Let Linga pick", "Swap", "All new topics" |
| E4 | Talk: the partner's line | TV | It is shown and spoken |
| E5 | Talk: the learner's line | Phone (ask `reply`, opened when the turn becomes the learner's) | Speech or typing. The TV keeps "Choose a phrase" (the recognition quiz) as the remote-only answer. When the ask opens is OD8 |
| E6 | Help me answer, Pause & coach, Finish, Cut, Take Two, Repeat, Cancel a pending turn | TV | Today LingaPhone has its own copies of these (`desk/src/english/LingaPhone.tsx:83-97`, `:320`); they go |
| E7 | A moment's try | Phone (ask `reply`) | Speech or typing |
| E8 | Learning preferences (Set up) | OD3 | Today phone-only (`LingaPhone.tsx:49`, `:62`), and the TV's "Phone setup" sends the learner to the pairing screen (`desk/src/lib/english/view.ts:681`) |

### 1.4 Essay (Essay Master: reading a text the learner has)

| # | Step | Leads | Why |
|---|---|---|---|
| S1 | Landing → Essay Master → the lenses (or the Workroom in Adult mode) | TV | Choices |
| S2 | Choose the lens | TV | Today the phone has its own lens radios (`page.tsx:726`) and sends its own choice (`page.tsx:293`, `:320`); they become a read-only line naming the TV's lens |
| S3 | Send the text | Phone (ask `paragraph`, opened by Select on a lens) | Typing, pasting, a file, dictation. The shelf, "keep it", the format and the piece's name stay on this panel: they belong to the text |
| S4 | The reading: walk the sentences, Why this matters, Next sentence, the table | TV | As today (`keys.ts:486-501`) |
| S5 | Rewrite one sentence | Phone (ask `rewrite`, detail `n`) | Typing or dictation |
| S6 | The next paragraph of a piece | TV | Today the phone's "Next paragraph" posts `essay.at` or a `nav` (`page.tsx:339-345`); it goes, and the TV's Down walks into the next paragraph |
| S7 | Adult mode, a kept piece under the curtain: see the words | Phone (ask `private`) | The TV must not show the sentence (`curtainOn`, `keys.ts:87-89`); the phone shows it read-only |

### 1.5 Math (Math Buddy)

| # | Step | Leads | Why |
|---|---|---|---|
| M1 | Landing → Math Buddy → Tonight's doors | TV | Choices |
| M2 | I have homework, no page yet | Phone (ask `page`, detail `subject`) | The camera. The TV keeps "Waiting for the photo" (`docs/STUDY-DESK-SCREENS.md:176`); Back cancels (`keys.ts:345`) |
| M3 | A read that failed: Try again | TV | Today it is the phone's (`panelFor.ts:36-39`, `page.tsx:586-593`). The TV's Select on the failed page asks again (`/api/session/retry`, kind `read`); "Snap a new page" reopens ask `page` |
| M4 | Walk the problems; Select → hint; Still stuck; the lesson | TV | As today (`keys.ts:407-428`) |
| M5 | Ask in words | Phone (ask `question`) | Typing or dictation. Opened by a new stop on `hint` and `page`. Today the phone also picks the problem by tapping its photo, and that tap moves the TV (`page.tsx:352-356`); picking the problem is the TV's Up/Down |
| M6 | Teach me something, Get ready for school, the worked lesson | TV | As today |
| M7 | Hand in the set: snap it, or type the answers | TV chooses, Phone does (ask `sheet` or ask `answers`) | Today the phone chooses the route (`page.tsx:620-623`). The practice card gains two stops, "Snap the sheet" and "Type my answers" |
| M8 | The marked sheet and the walk | TV | As today (`keys.ts:584-605`) |
| M9 | "How did you get there", and the one typed second go | Phone (ask `explain`, ask `second`, detail `walkIx`) | Speech or typing. Opened by two new walk stops on an item to look at |
| M10 | A paper you sat: open it | TV | Today only the phone can open it: no TV key leads to `paper` (`docs/STUDY-DESK-SCREENS.md:180`; the only `nav` to it is `desk/src/app/phone/PaperPanel.tsx:72`). Down on Tonight opens it (Down is free once pairing leaves Tonight, TL-13) |
| M11 | Type the marks of a paper | Phone (ask `paper`) | Typing, many rows |
| M12 | The clock (Play/Pause), and ending the evening (Menu on the landing) | TV | As today (`keys.ts:628`, `:324`). The phone's Start, Pause and End session (`page.tsx:750-751`) go; OD4 |

### 1.6 Writing (composing new words)

Writing here is not a fifth app. It is the composing flows that sit inside Linga and Essay Master: Sentence help, and
the paragraph built from the pattern. Whether Writing should be its own landing app is OD9.

| # | Step | Leads | Why |
|---|---|---|---|
| W1 | Linga menu → Sentence help → `sentence` | TV | A choice |
| W2 | Say or type one sentence | Phone (ask `sentence`) | Speech or typing. Opened by "Try a sentence" (today it only writes a status, `keys.ts:438`) |
| W3 | The verdict, Show me the unit, Back | TV | As today (`keys.ts:434-441`) |
| W4 | Essay Master → Down from the last lens → the plan (`essayplan`) | TV | A choice (`keys.ts:448-450`) |
| W5 | Write one slot | Phone (ask `slot`, detail `i`) | Typing or dictation. Opened by Select on a slot (today a status, `keys.ts:469`) |
| W6 | Read it | TV | As today (`keys.ts:470-473`) |

## 2. Every TV → phone → TV hand-off

### 2.1 Rules shared by every hand-off

- **Open.** Only the TV opens a hand-off (`ask.open`). The desk mints its id. A new ask replaces the open one, and the
  phone switches panels.
- **The phone goes there.** On a new `ask.id` the Student phone moves to that ask's panel at once. Two changes from
  today's `follow` (`panelFor.ts:74-87`):
  - Busy hands defer the move; they never spend the hand-off. Today a hand-off that arrives while the learner is typing
    is "spent, not replayed" (`panelFor.ts:71`), and the TV waits for nothing.
  - A phone in the Parent role is never moved. It shows a banner instead: "The TV is asking for a photo. Take it". One
    tap moves it. Today the Parent phone is skipped silently (`panelFor.ts:85`).
- **The phone answers.** It sends the answer to its route with `askId`. If the id does not match, or the open ask is of a
  kind that route does not answer (a Linga `reply` is no page), the route answers 409 "The TV is not asking for that now."
  and changes nothing (TL-11, lite r3). An accepted answer sets `ask.phase = "sent"` once the work begins, and the
  phone shows "Sent. Look at the TV." A real result or a failure of the work closes the ask, and the phone shows the idle
  card again. A request the route refuses before any work (bad input, busy) leaves the ask open for the phone to try again.
- **The TV while it waits.** The screen that asked stays up. It shows an "On your phone" chip (LingaTV already has one,
  `OnYourPhone`, `LingaTV.tsx:15`) and one caption: "Waiting for the phone: <the job>. Back cancels." With no phone live
  (`phonesLive === 0`, TL-3) the caption is: "No phone is connected. Up: pair a phone. Back: cancel."
- **Cancel.** On the asking screen, the TV's first Back cancels the ask. The second Back leaves the screen, as Tonight's
  Back already does with `page.unask` (`keys.ts:345`). The phone's Cancel posts `ask.cancel` too.
- **Timeout.** No ask times out while a phone is live: a child types slowly, and a timeout would throw the words away.
  An ask closes by itself on:
  - a different learner seated (`learner.set`, `profile.save`: `switchedFrom`, `store.ts:641`);
  - `session.end` or `reset`;
  - the TV leaving the asking screen (a `nav` to a screen other than `ask.screen`);
  - a desk restart (`load()`, `store.ts:876-891`, sets `ask: null`);
  - 120 s with no phone live. The TV then says "The phone went away. Select to ask again." NOT BUILT: no slice made this
    closer; an ask stays open while no phone is live until one of the closers above ends it.
- **Two phones.** Any listed phone may answer. The first accepted answer wins, and the other phone's panel closes when
  the ask does.

### 2.2 The hand-offs

| Ask | TV trigger | Phone shows | Phone returns control by | TV while it waits | Cancel / close |
|---|---|---|---|---|---|
| `name` | Add a learner, or Select on the profile's Name row | One Name field (40 characters, `page.tsx:45`) and Done. An unjoined phone may answer it (the lobby already allows a name, `pairing.ts:281-285`) | Each keystroke posts `profile.draft` with the name, as today (`page.tsx:557`); Done closes the ask | The title is the name, live (`screens.tsx:484`); caption "Typing the name on the phone" | First Back closes the ask and keeps the draft; the second discards it (`keys.ts:392`) |
| `page` | Tonight → I have homework with no sheet (`keys.ts:359`); "Snap a new page" on a failed read | The camera, Snap, Retake, Use this page. No subject picker: the TV named it (today `page.tsx:572-574` lets the phone change it) | `/api/read` with `askId` → `page.reading` moves the TV to `page` and closes the ask (`store.ts:724-727`) | The Tonight door: "Waiting for the photo" | Back → `page.unask` and `ask.cancel` (`keys.ts:345`) |
| `sheet` | The practice card's "Snap the sheet" stop | Camera, Snap the sheet, Retake, Send my working | `/api/mark` with the image → `practice.marked` → `sheet` | "The phone is waiting for the sheet" (`docs/STUDY-DESK-SCREENS.md:179`), then "The desk is marking the set…" | Back → Tonight, the set kept (`keys.ts:582`) |
| `answers` | The practice card's "Type my answers" stop | One box per question (`page.tsx:624-645`), Send my answers | `/api/mark` with the answers | The same card, "Type the answers on the phone" | As `sheet` |
| `question` | A new "Ask in words" stop on `page` and `hint` | One field, Mic, three presets, Ask (`page.tsx:698-702`, without the photo) | `/api/hint` with `askedQ` → `hint.set` | "Asked from the phone" once it lands (`screens.tsx:174`) | Back |
| `explain` | A new "Tell the desk how" stop on a walk item that is wrong or unsure | ExplainTalk: hold to speak, or type (`desk/src/app/phone/ExplainTalk.tsx`) | `/api/explain` → the item settles | "The desk is thinking over what you said…" | Back, or Left/Right to another item (`walkIx` changes) |
| `second` | A new "Type my second go" stop on the same items | One input and Send (`page.tsx:675-683`) | `/api/second` | The walk card | As `explain` |
| `paper` | "Type a paper" on the `paper` screen (reached by Down on Tonight, TL-13) | PaperPanel's rows (`desk/src/app/phone/PaperPanel.tsx`), Send. "Show the last paper on the TV" goes | `paper.enter` with `askId` (lite r3) → the `paper` screen redraws | "Type the marks on the phone" | Back |
| `paragraph` | Select on a lens (`keys.ts:455`) | File, text box, paragraph arrows, Dictate, keep/format/name, the shelf, "Read all" and "This paragraph" (`page.tsx:724-745`). The lens is a read-only line | `/api/analyse` kind `piece` or `essay` → `essay.set` → `forensic` (`store.ts:781-782`) | The lens home, "Send the text from the phone" | Back |
| `rewrite` | Rewrite on my phone (`keys.ts:497`) | The sentence, prefilled; Dictate; Send (`page.tsx:710-716`, without "Next paragraph") | `/api/analyse` kind `rewrite` → `essay.revised` | The forensic page inks the move while it waits (as today) | Back, or walking to another sentence (`essayAt` changes) |
| `slot` | Select on a plan slot (`keys.ts:469`) | One sentence, Dictate, Send, the plan-fit line (`page.tsx:718-722`) | `essay.slot` → the slot inks | The plan; the slot under the lamp says "On the phone" | Back; Up/Down alone keeps the ask on its slot, and Select on another slot opens a new one |
| `sentence` | "Try a sentence" on `sentence` (`keys.ts:438`), or Sentence help with no sentence yet (`panelFor.ts:48`) | Field, Mic, four presets, Check (`page.tsx:705-708`) | `/api/analyse` kind `english` → `english.set` → `sentence` (`store.ts:775-776`) | "Say one sentence on your phone" (`screens.tsx:243`) | Back → `linga` |
| `reply` | The learner's turn in `linga-talk`; a say or typed task in `linga-check`; a moment's try | ReplyBox: hold to speak or type, send (`desk/src/english/ReplyBox.tsx`) | `/api/english` `turn`, `check-answer`, `check-task`, `moment-try` → `linga.changed` | "Answer on your phone" (today "TV shows · Phone speaks", `LingaTV.tsx:86`) | The TV's Linga Back (`LingaTV.tsx:51-58`); a phrase chosen with the remote answers the turn and closes the ask |
| `words` | Add a topic, the goal question, pitch a scene | One text field and Send (`LingaPhone.tsx:160`, `:170`, `:208`) | `/api/english` `plan-add`, `plan-goal`, `pitch` | The plan or the scenes screen | Back; "Let Linga pick" on the TV |
| `prefs` | Linga menu → "Set up on the phone" (if OD3 keeps the form on the phone) | The preferences form (`LingaPhone.tsx:37`, `:62`) | `preferences` → Saved | "Setting up on the phone" | Back |
| `private` | "Show the words on my phone" on `forensic` and on the Workroom, only while the curtain is on (`keys.ts:87-89`) | The sentence under the lamp, read-only; Done | Done closes the ask | The curtain stays | Back |

## 3. Where the TV and the phone disagree today

Every row was read from the code at f788a5dd. None was run on the stick.

| # | Where | Today | Fix direction | Slice |
|---|---|---|---|---|
| D1 | `desk/src/lib/session/store.ts:689-692`, `desk/src/tv/landingRows.ts:38`, `:178`, `desk/src/tv/keys.ts:348`, `:391`, `desk/src/lib/session/pairing.ts:274` | `joined` is one flag for the whole desk. A join sets it, and nothing ever clears it but a reset: `leave` returns the session unchanged. After a phone forgets the desk (or lapses after 30 days), the TV still hides its phone stop and the pair door on Tonight and on the profile. The only ways back to the code are then the phone's own "Show the code" (`desk/src/app/phone/page.tsx:534`) and Linga's menu. Meanwhile each phone's own view says `joined: true` | The TV reads presence, not history: `phonesLive` from the open phone streams (TL-3). The landing's phone object is a stop always. Paired, it opens a TV phone screen: who is live, Pair another, Forget every phone | TL-3 |
| D2 | `store.ts:876-891` (`load` spreads the saved file over `fresh()`) | After a desk restart the TV opens on the screen it was on: `screen`, `joined`, `status` and `awaiting` come back from session.json. So a TV can open on "The phone is waiting for the sheet", or on a status line telling a phone to do something, with no phone connected and no hand-off behind it | `load` sets `ask: null` and clears a `status` that names the phone. The asking screen then says "Select to ask the phone again" | TL-5 |
| D3 | `store.ts:703` (`learner.set` does not touch `status`), `store.ts:641-651` (`switchedFrom` clears only job lines); `keys.ts:455`, `:469`, `:497` | A learner switch keeps the last learner's phone instruction in `status`, for example "sentence 3: rewrite it in your own words on the phone's Essay tab". The phone clears its own copy of the last learner's work (`page.tsx:439-452`, P17), so the TV asks for something the phone no longer holds | The switch closes the ask (2.1) and clears a phone-directed `status` | TL-5 |
| D4 | `desk/src/tv/useSession.ts:26`; `desk/src/app/tv/page.tsx:158`; `page.tsx:528`; `keys.ts:643-644` | When the stream drops, both sides keep the last session they saw. The TV's only sign is the bench bar's "reconnecting…", which is outside the stage. The phone's header still reads "joined", because it tests `s.joined` before `connected`. Remote presses post into a dead link, and `runStep` swallows the failure, so the TV looks frozen. The reopen is a fixed 1.5 s retry, forever (council economics-2) | Reopen with backoff (1.5 s, doubling, capped at 30 s, reset on the first message). The TV draws a band on the stage: "Lost the desk link. Reconnecting." The phone's header shows the link first, and its Send buttons are disabled while the link is down | TL-4 |
| D5 | `desk/src/app/api/session/stream/route.ts:25` (UNREAD 32), `page.tsx:510-520`, `panelFor.ts:16-17` | A phone that sleeps is let go after 32 unread messages, and it reopens with a stale `seen` key. A hand-off made while it slept is missed. So is a second hand-off of the same kind on the same screen (the key is the screen, `panelFor.ts:42`, `:46`) | The phone follows `ask.id`, not a screen key. On every reopen it goes to the open ask, whatever it saw before | TL-9 |
| D6 | `keys.ts:438`, `:455`, `:469`, `:497`; `panelFor.ts:42`, `:46`, `:48` | The TV asks with a `status` sentence ("…on the phone"). The phone moves only when the TV's screen changes. On `forensic`, `essaytype`, `essayplan` and `sentence`, a second ask on the same screen never moves the phone: if the learner opened another tab, the TV waits and the phone shows something else | Each of those keys raises `ask.open`; the phone follows the ask | TL-6, TL-7, TL-9 |
| D7 | `panelFor.ts:71`, `:85` | A hand-off that arrives while the learner's hands are busy is spent, and one that arrives at a Parent-role phone is skipped. In both cases the TV waits with no answer coming | Busy hands defer the move; a Parent phone gets the banner (2.1) | TL-9 |
| D8 | The phone posts navigation: `page.tsx:355` (a tap on the photo posts `item` and `nav page`), `:343-344` (`essay.at`, `nav essaytype`), `:534` (`nav pair`, allowed to a guest at `pairing.ts:283`), `:559` (`profile.discard` sends the TV to `learner`, `store.ts:722`), `:748-751` (`task.*`, `timer.*`, `session.end`); `PaperPanel.tsx:72` (`nav paper`); `desk/src/english/LingaPhone.tsx:100` (`subject` + `nav linga`), `:219` (starts a scene). Server results also move the TV wherever it is: `store.ts:727` (`page.reading` → `page`, from the phone's "Snap the page" on the Joined panel, `page.tsx:548`), `:776` (`english.set` → `sentence`), `:782` (`essay.set` → `forensic`, from the phone's Essay tab at any time). The TV's own Joined screen invites it: "or snap the page on the phone" (`desk/src/tv/screens.tsx:51`) | The phone leads as often as the TV does. A learner on the TV's Linga can be thrown into a Math Buddy page, or into a forensic page, by the phone | The phone posts only answers to the open ask, plus `ask.cancel`. The session route refuses a phone's `nav`, `focus`, `subject`, `item`, `page.select`, `walk`, `essay.at`, `timer.*` and `session.end` (403), next to the reset refusal (`route.ts:49`). The result routes refuse a phone answer with no matching ask (409). The pairing door "Show the code on the TV" stays for a guest: it is the recovery for a phone with no QR, and `pair`'s Back returns the TV where it was (`keys.ts:340`) | TL-8, TL-11 |
| D9 | `page.tsx:572-574` (capture subject), `page.tsx:164`, `:726`, `:293`, `:320` (the essay lens), `page.tsx:620-623` (snap or type) | The same choice is made in two places. The phone can snap a Linga page while the TV waits for Math Buddy's. The phone's lens radio follows the TV only while the TV is on `essaytype`, and the phone sends its own lens, so the TV's lit lens and the reading's lens can differ. The phone picks the hand-in route the TV's card does not name | The TV makes the choice, and the ask carries it (`detail.subject`; the lens from `s.essayType`; `sheet` or `answers`). The phone shows it as a line, not as a control | TL-6, TL-7, TL-9 |
| D10 | `panelFor.ts:25`; `LingaPhone.tsx:49`, `:83-97`, `:219-254`, `:320`; `LingaTV.tsx:36-42`, `:65`, `:86` | Linga has two drivers. The phone's hand-off key is "linga" for every Linga screen, so moving inside Linga never moves the phone. LingaPhone has its own Talk / Set up / My map tabs, and its own buttons for coach, finish, cut, start, resume, the level check, the plan and the choice of scene, all parallel to the TV's actions. The TV's status line says "TV shows · Phone speaks" | LingaPhone becomes the `reply`, `words` and `prefs` panels only. Every command lives on the TV | TL-12 |
| D11 | `store.ts:719`, `screens.tsx:485`; `docs/STUDY-DESK-SCREENS.md:180` with `PaperPanel.tsx:72`; `view.ts:681`; `panelFor.ts:36-39` | Some TV steps need the phone. A profile with no name does not save, and the TV says nothing (the reducer just breaks). The paper screen has no TV key into it. Linga's "Phone setup" sends the learner to the pairing screen to set preferences. A failed page read can be asked again only from the phone | The remote-only paths of section 5 | TL-8, TL-12, TL-13 |
| D12 | `page.tsx:777`; `desk/src/app/globals.css:24`, `:30-35` | The bottom bar holds ten tabs, each `flex: 1` at 11 px with 2 px side padding, in a page up to 430 px wide. At 360 px each tab is 36 px wide. "Point & ask" (11 characters, about 60 px at 11 px) and the 7-8 character labels wrap to two or three lines, and every tab is under the 44-48 px touch width. An unjoined phone shows nine of the ten disabled | Section 4 | TL-10 |
| D13 | `page.tsx:198`, `:535` | Four digits auto-join, and the Join button stays live while that post is in flight. A tap gives a second post with the code that has just turned. That post counts a wrong code, and the joined phone shows "That code is not on the TV." (council r3 robustness-5) | One join in flight: the field and the button are disabled until it answers; a second call returns the first one's promise | TL-2 |
| D14 | `page.tsx:153-159`; `desk/src/lib/session/pairing.ts:54-63`; `route.ts:67-69`, `:92-95` | A phone that opens an address still carrying `?pin=<old code>` (a bookmark, a home-screen icon) posts it on every open. Ten opens trip the desk-wide cooldown, and then no phone can join for five minutes. The TV's own join skips the brake, but neither a TV reset nor anything else on the TV lifts the cooldown (council r3 robustness-6, and the stale-code answer) | The phone remembers the last QR code the desk refused (in localStorage; a refused code is no secret) and does not post it again. A TV reset, and the TV's "Forget every phone", clear the cooldown | TL-2 |
| D15 | `desk/src/lib/session/store.ts:439-442`; `page.tsx:175`; `desk/src/english/ReplyBox.tsx:43-44` | The phone is served over http unless `DESK_HTTPS=1`. A phone browser on Wi-Fi then gives no camera (`navigator.mediaDevices` is undefined: "No camera here — use a sample page below.") and no speech ("Voice needs HTTPS on a phone"). Two of the five phone jobs are dead on a real phone | OD6 decides how the desk serves https on the LAN. Until then the phone says it plainly on the `page`, `sheet` and `reply` panels, and offers typing where the ask allows it | OD6, TL-9 |
| D16 | `desk/src/tv/keys.ts:28-31`; `LingaTV.tsx:48-50` | The remote map is keyboard names only: arrows, Enter, Backspace/Escape, "m", Space. The repo does not record which key values the stick's browser sends for Menu, Play/Pause and Back. LingaTV keeps its own copy of the list instead of calling `keyOf`, so a name added to the map would not reach Linga | Add the media and browser names to the map; LingaTV calls `keyOf`; the stick check logs what arrives | TL-1 |

## 4. The phone's bottom bar at 360-414 px

Today (D12): ten tabs (`page.tsx:777`). The new shell drops tabs as navigation altogether, since navigation is the TV's.

**The top strip** (sticky, 48 px): a link dot (green: live; amber: reconnecting, D4), then one line, "Ema · TV: Math Buddy"
(`TV_WORDS`, `page.tsx:37-43`), cut with an ellipsis. The Student/Parent toggle (`page.tsx:527`) leaves the strip. The
Parent role becomes Recap under More (OD5).

**The body** shows exactly one of these:
- not joined: the Join panel (or the `name` panel, while the TV is asking for one);
- joined, no ask: the idle card, "Look at the TV. It will ask this phone when it needs a photo, your words or your voice."
  It holds no buttons;
- an ask open: that ask's panel, with only the controls listed in 2.2.

**The bottom bar** (sticky, 56 px plus `env(safe-area-inset-bottom)`, never more than 3 items):

| State | Items, left to right | Widths at 360 px |
|---|---|---|
| Not joined | none (the Join panel carries its own button) | none |
| Joined, no ask | Recap · More | 180 + 180 |
| An ask open, nothing sent | Cancel · <primary> | 40% / 60%: 144 + 216 |
| An ask sent | (disabled) Sent · More | 180 + 180 |

The primary label for each ask, 12 characters at most: `name` Done · `page` Use page (before the shot: Snap) · `sheet` Send sheet (Snap) ·
`answers` Send · `question` Ask · `explain` Send (while held: Listening) · `second` Send · `paper` Send · `paragraph` Read all,
or Read this · `rewrite` Send · `slot` Send · `sentence` Check · `reply` Send · `words` Send · `prefs` Save · `private` Done.
Longer words ("Read the whole piece on the TV (5 paragraphs)") go in the panel above the bar, not on a button.

**Sizes.** Each item is `flex: 1 1 0; min-width: 0`, at least 48 px high, 14 px / 600, one line
(`white-space: nowrap; overflow: hidden; text-overflow: ellipsis`), 12 px side padding. At 360 px the narrowest item is 144 px.

**Overflow.** The bar never holds a fourth item. Anything more goes under More: a bottom sheet of 56 px full-width rows,
at most 70vh high, scrolling, closed by a tap outside or by the system back gesture. Its rows: Recap and This week
(Parent), Tonight's list (if OD4 keeps it), Forget this desk (today `page.tsx:551`), How the TV and phone work together.
Rule pinned by the test: the bar's item count is at most 3 in every state, and every bar label is 12 characters or fewer.

## 5. Remote keys: no TV step may require the phone

The remote's buttons are D-pad, Select, Back, Menu and Play/Pause (`keys.ts:27`); Home and the voice button belong to
the stick. A step "requires the phone" when the TV can neither finish it nor leave it with these keys.

### 5.1 Coverage, screen by screen (handlers in `desk/src/tv/keys.ts`)

| Screen | Handler | Needs the phone today | Remote-only path in this design |
|---|---|---|---|
| landing | `:320-339` | No | The phone object is a stop always (D1) |
| pair, joined | `:340`, `:342` | No | none needed |
| learner | `:361-368` | No | none needed |
| profile | `:369-393` | Yes: Save needs a name, typed on the phone (`store.ts:719`), and the TV says nothing | Ask `name`; Save with no name says "Type the name on the phone first", OD1 |
| tonight | `:343-360` | No (Back cancels the photo, `:345`) | Down → `paper` (M10) |
| page | `:407-418` | Yes: a failed read is retried only from the phone (`panelFor.ts:36`) | Select on a failed page asks again (M3) |
| hint, lesson, units, calendar | `:419-433`, `:394-406` | No | "Ask in words" stays optional |
| topics, prepare, worked | `:510-558`, `:521-537` | No | none needed |
| practice | `:582` | Finishing does: a camera or typed answers | Back keeps the set; the remote-only finish is OD2 |
| sheet, walk | `:584-605` | No (explaining is optional) | none needed |
| paper | `:563-580` | Yes: no key leads in (D11) | Down on Tonight |
| essaytype, essayplan, forensic, playbook, xray, workroom | `:443-508` | Sending text does; leaving does not | The Workroom reads a kept piece on OK, TV only (`keys.ts:482`, the 2026-10-18 decision). A School or Family learner has no TV way to get text onto the desk; OD9 notes it |
| sentence, headtohead | `:434-441` | Checking a sentence does | Back; nothing else needs words |
| break | `:509` | No, but Back does nothing (only Select skips) | Back also ends the break (TL-1) |
| recap | `:608-615` | No | none needed |
| Linga screens | `LingaTV.tsx:45-68` (keys.ts returns an empty step, `:625`) | Speaking does; preferences do (`view.ts:681`) | Choose a phrase answers a turn; "I don't know" skips a check task; "Let Linga pick" replaces the goal; preferences per OD3 |
| All screens: Play | `:626-628` | No | none needed |

### 5.2 The key map itself (D16)

`keyOf` (`keys.ts:28-32`) maps ArrowUp/Down/Left/Right, Enter, Backspace, Escape, "m"/"M" and Space. TL-1 adds
`MediaPlayPause` → play, `ContextMenu` → menu, and `GoBack` / `BrowserBack` → back. LingaTV's own list (`LingaTV.tsx:48`)
goes, and it calls `keyOf`. Which of these names the stick's browser actually sends is the stick check of TL-1. If Back
leaves the page instead of reaching the handler, TL-1 reports it and does not guess a fix.

## 6. Build plan

The slices run in this order. Each is one builder's work. `desk/src/app/phone/page.tsx` is in TL-2, TL-4, TL-8, TL-9,
TL-10 and TL-11, and `desk/src/tv/keys.ts` is in TL-1, TL-3, TL-6, TL-7, TL-8 and TL-13, so slices that share a file run one after
another, never side by side. TL-2 onward comes after the P17 fix merges, since P17 is in `page.tsx:439-452`. A new suite
is added to `desk/package.json` `rulesSuites` in the same slice: `tools/run-rules.cjs` runs only that list. The
live-model suites `tools/linga-ui-test.cjs` and `tools/essay-ui-test.cjs` are not on the list and prove nothing in the gate.

For every slice, "test:rules proves" means: the new cases are red on the slice's base and green after it, no existing
assertion is changed unless the slice names it, and every suite in `rulesSuites` is green.

### TL-1. Every remote button reaches every screen
- Files: `desk/src/tv/keys.ts`, `desk/src/english/LingaTV.tsx`, `tools/tv-keys-test.cjs`.
- Change: the new names in `KEYBOARD` (5.2). LingaTV's handler calls `keyOf` and switches on the Key. On `break`, Back is `timer.skipbreak`, as Select is.
- Acceptance: `keyOf` maps the new names; `break` Back emits `timer.skipbreak`; `LingaTV.tsx` imports `keyOf` and holds no `"ArrowLeft"` literal.
- Tests: `tools/tv-keys-test.cjs`: cases for each new name, `break` Back, and a source pin on `LingaTV.tsx`.
- Stick check: open `/tv?key=…` on the stick. On the landing, Linga home, a lesson and the break, press Back, Menu and Play/Pause. Record which key value each sends and what it does. Back must not leave the page.
- Landed: ba1899bb (the new key names, LingaTV calls keyOf, Back on break skips it).

### TL-2. Pairing holds: one join in flight, no stale QR code, the TV lifts the lock
- Files: `desk/src/app/phone/page.tsx`, `desk/src/lib/session/pairing.ts`, `desk/src/app/api/session/route.ts`, `tools/desk-pairing-test.cjs`, `tools/phone-panel-test.cjs`.
- Change: `join()` keeps one promise in flight, and the field and the Join button are disabled while it runs (D13). A QR code the desk refused is remembered and not posted again (D14). A new `joinClear()` in pairing.ts, called on a TV reset and on a new TV-only event `phones.forget` (forget every phone, keep the session).
- Acceptance: two right-code posts from one phone give one join and no wrong-code count; ten opens with the same stale `?pin=` post once; after the cooldown trips, a TV reset lets a new phone join at once; `phones.forget` from a phone or a guest is 403.
- Tests: `tools/desk-pairing-test.cjs` (route: reset clears the cooldown, `phones.forget` roles and effect); `tools/phone-panel-test.cjs` (source pins on the single-flight join and the remembered refused code).
- Stick check: pair a phone by QR, tap Join during the auto-join, and check that the phone shows no "That code is not on the TV."; reset on the TV and pair again.
- Landed: d585d9fe (one join in flight, the refused QR code remembered, joinClear on a TV reset and on phones.forget).

### TL-3. The TV knows a phone is here: presence, and a phone stop always
- Files: `desk/src/app/api/session/stream/route.ts`, `desk/src/lib/session/store.ts`, `desk/src/lib/session/pairing.ts`, `desk/src/app/api/session/route.ts`, `desk/src/tv/landingRows.ts`, `desk/src/tv/keys.ts`, `desk/src/tv/screens.tsx`, `desk/src/landing/model.ts`, `tools/desk-pairing-test.cjs`, `tools/tv-landing-test.cjs`, `tools/tv-keys-test.cjs`.
- Change: the stream route dispatches `phone.presence` (server only) when a phone device key opens its first stream or closes its last; the session gains `phonesLive`, sent to the TV only (GUEST_BLANK 0). `landingStops` keeps the phone stop always. Paired, Select opens `pair` with its status: "N phones here", Pair another, Forget every phone (`phones.forget`, TL-2). The Joined copy becomes "Paired. Select: choose who is studying" / "Select: go to the desk" (`screens.tsx:51`).
- Acceptance: one phone stream opened → `phonesLive` 1; closed → 0; a guest stream changes nothing; `phone.presence` posted by any role is 403; the landing has a phone stop with `joined` true; `Joined` holds no "on the phone".
- Tests: `tools/desk-pairing-test.cjs` (presence counts, SERVER_ONLY), `tools/tv-landing-test.cjs` (the stop list, paired and unpaired), `tools/tv-keys-test.cjs` (Select on the paired phone stop).
- Stick check: pair, then close the phone's browser tab. Within about 20 s (the 15 s ping) the TV's phone object reads "No phone here", and Select on it shows the code.
- Landed: f9e9593f (phone.presence and phonesLive, the phone stop always on the landing, panelFor asks nothing of the phone on joined).

### TL-4. A dropped link is seen on both screens
- Files: `desk/src/tv/useSession.ts`, `desk/src/app/tv/page.tsx`, `desk/src/app/phone/page.tsx`, `tools/session-link-test.cjs` (new), `desk/package.json`.
- Change: a pure `reopenDelay(attempt)` exported from useSession.ts (1500 ms doubling, 30 000 ms cap; zero after a message). The TV stage draws a band "Lost the desk link. Reconnecting." while `!connected`. The phone's header tests `connected` first, and its Send buttons are disabled while it is false.
- Acceptance: `reopenDelay` gives 1500, 3000, 6000, …, 30000; the TV page renders the band inside `.stage`, not the bench bar; the phone header source tests `connected` before `s.joined`.
- Tests: `tools/session-link-test.cjs` (the delay table; source pins on both pages), added to `rulesSuites`.
- Stick check: with the TV on Tonight, stop the desk server for 10 s and start it again. The band shows within 2 s and leaves once the stream is back; the remote works again with no reload.
- Landed: afa4a488 (reopenDelay backoff, the TV stage band, the phone header tests the link first, Sends disabled while it is down).

### TL-5. The hand-off lives in the session
- Files: `desk/src/lib/session/store.ts`, `desk/src/lib/session/pairing.ts`, `desk/src/app/api/session/route.ts`, `tools/handoff-test.cjs` (new), `desk/package.json`, `tools/desk-pairing-test.cjs`.
- Change: `Ask`, `ask.open`, `ask.cancel` and `ask.sent` as in section 0. Closed by the closers in 2.1: a learner switch, `session.end`, `reset`, a `nav` off `ask.screen`, and `load()`. `load()` also clears a `status` that names the phone (D2), and the switch clears it too (D3). The phone's view carries `ask`; a guest's view carries it only when its kind is `name` (LOBBY).
- Acceptance: open, replace, cancel (a stale id changes nothing); each closer closes; a restored session.json holding an ask loads with `ask: null`; roles: `ask.open` from a phone or a guest is 403, `ask.sent` from anyone is 403.
- Tests: `tools/handoff-test.cjs` (the reducer, over plain sessions), added to `rulesSuites`; `tools/desk-pairing-test.cjs` (the route's role rows and the guest view).
- Stick check: none. Nothing on screen changes in this slice.
- Landed: 1ce95935 (Ask, ask.open, ask.cancel and ask.sent, the closers, load() clears the ask and a status naming the phone, the phone and guest views).

### TL-6. Math Buddy opens its hand-offs from the TV
- Files: `desk/src/tv/keys.ts`, `desk/src/tv/mathsRows.ts`, `desk/src/maths/MathsTV.tsx`, `tools/tv-keys-test.cjs`, `tools/maths-tv-test.cjs`.
- Change: `page.ask` also posts `ask.open page`. The practice card gets two stops, Snap the sheet and Type my answers. `page` and `hint` get "Ask in words". A walk item to look at gets "Tell the desk how" and "Type my second go". The first Back on an asking screen cancels the ask.
- Acceptance: each key emits the `ask.open` with its kind and detail; Back with an ask open emits `ask.cancel` and does not leave the screen; the screens draw the "On your phone" chip while `ask.kind` matches.
- Tests: `tools/tv-keys-test.cjs` (each trigger and the two-step Back), `tools/maths-tv-test.cjs` (the stops and the chip).
- Stick check: Tonight → I have homework, and the TV shows "Waiting for the photo" with the chip; Back cancels it. Practice: both stops can be reached with the D-pad.
- Landed: a9ef8747 (ask.open for page, sheet, answers, question, explain and second; two-step Back; the On your phone chip and caption).

### TL-7. Essay Master and Writing open their hand-offs from the TV
- Files: `desk/src/tv/keys.ts`, `desk/src/essay/EssayTV.tsx`, `desk/src/tv/screens.tsx`, `tools/tv-keys-test.cjs`, `tools/essay-piece-test.cjs`.
- Change: Select on a lens → `ask.open paragraph`. Rewrite on my phone → `rewrite {n}`. Select on a slot → `slot {i}`. "Try a sentence" on `sentence` → `sentence`. With the curtain on, a "Show the words on my phone" action on `forensic` → `private`. The status sentences stay as captions.
- Acceptance: each trigger emits its ask; Up/Down to another sentence emits `ask.cancel` beside its `essay.at` when a `rewrite` ask names a different `n`; with the curtain off, no `private` action is drawn or reachable.
- Tests: `tools/tv-keys-test.cjs` (the triggers, the walk-away close), `tools/essay-piece-test.cjs` (`private` only under the curtain, and the TV still receives no sentence text).
- Stick check: Essay Master → a lens → Select; the TV shows "Send the text from the phone". The plan: Select on slot 2, and the slot reads "On the phone".
- Landed: 562811ec (ask.open paragraph, rewrite {n}, slot {i}, sentence, private under the curtain only; two-step Back; ask.cancel beside essay.at; the On your phone chip and caption).

### TL-8. The profile's name is a hand-off, and Save says why it waits
- Files: `desk/src/tv/profileRows.ts`, `desk/src/tv/keys.ts`, `desk/src/tv/screens.tsx`, `desk/src/lib/session/store.ts`, `desk/src/app/phone/page.tsx`, `tools/tv-keys-test.cjs`, `tools/learner-switch-test.cjs`.
- Change: a Name row first in `profileRows`. Add a learner opens `ask.open name`. Save with an empty name sets `status` "Type the name on the phone first" instead of breaking silently (`store.ts:719`). The phone's Profile panel loses Save and Cancel and gains Done.
- Acceptance: Add a learner emits `profile.draft` then `ask.open name`; Save with no name leaves the draft and sets the line; the phone source has no `profile.save` and no `profile.discard` post.
- Tests: `tools/tv-keys-test.cjs` (the row, the ask, focus after a pick unchanged below the new row), `tools/learner-switch-test.cjs` (Save with no name).
- Stick check: Add a learner with the remote and type the name on the phone; the TV's title follows each letter; Save on the TV seats them.
- Landed: d2b8812e (OD1 b: the name stays a phone job; the phone's Done only closes its end of the ask). Stick check not run.

### TL-9. The phone follows the hand-off, not the screen
- Files: `desk/src/app/phone/panelFor.ts`, `desk/src/app/phone/page.tsx`, `tools/phone-panel-test.cjs`.
- Change: `cueFor` reads `s.ask` first and keys on `ask.id`. Busy hands defer the move and do not spend it (D7). The Parent role shows the banner. A reopened stream goes to the open ask (D5). Answers carry `askId`. The capture subject and the essay lens are read from the ask and the session, and drawn as lines (D9). The phone states the http limit on the camera and voice panels (D15).
- Acceptance: a new ask id moves a Student phone on the same TV screen; busy hands move as soon as they are free; a Parent phone does not move and gets the banner; no panel offers a subject select or a lens radio.
- Tests: `tools/phone-panel-test.cjs`. Its derivation changes from "screens whose copy asks for the phone" to "every `AskKind` has exactly one panel, and no TV copy says 'on the phone' on a screen that opens no ask". The two old rows this replaces are named in the commit.
- Stick check: on the forensic page, open the phone's More, then press Rewrite on the TV. The phone goes to the rewrite panel. Press Rewrite again after Back, and the phone goes there again.
- Landed: 955f0f58 (panelFor reads s.ask first and keys on ask.id, one panel per AskKind; busy hands defer the move unspent; the Parent role gets the banner; a reopened stream goes to the open ask; answers carry askId; the capture subject and the essay lens are lines, not controls; the camera and voice panels state the http limit). The Linga, failed-read and paper cues stay screen-keyed until TL-12 and TL-13. Stick check not run.

### TL-10. The phone shell fits 360-414 px
- Files: `desk/src/app/phone/page.tsx`, `desk/src/app/globals.css`, `tools/phone-shell-test.cjs` (new), `desk/package.json`.
- Change: section 4. The ten tabs go. The top strip, the idle card, the bar of at most 3 items, and the More sheet.
- Acceptance: in every state the bar renders 3 items or fewer; every bar label is 12 characters or fewer; `.pnav button` has `min-width: 0`, `white-space: nowrap`, `text-overflow: ellipsis` and a 48 px minimum height; More holds Forget this desk.
- Tests: `tools/phone-shell-test.cjs` (source and CSS pins over page.tsx and globals.css), added to `rulesSuites`.
- Stick check: on the operator's phone (and a 360 px browser window), joined with no ask, then with ask `paragraph` open: no label wraps, nothing scrolls sideways, and Cancel and Read all are each a thumb wide.
- Landed: b09c86fb (a 48 px strip, one body, a bar of at most three items, More as a sheet).

### TL-11. The phone stops moving the TV
- Files: `desk/src/app/api/session/route.ts`, `desk/src/app/api/read/route.ts`, `desk/src/app/api/mark/route.ts`, `desk/src/app/api/analyse/route.ts`, `desk/src/app/api/hint/route.ts`, `desk/src/app/api/explain/route.ts`, `desk/src/app/api/second/route.ts`, `desk/src/app/phone/page.tsx`, `desk/src/app/phone/PaperPanel.tsx`, `tools/desk-pairing-test.cjs`, `tools/handoff-test.cjs`.
- Change: the session route refuses a phone's `nav` (but a guest's `nav pair`), `focus`, `subject`, `item`, `page.select`, `walk`, `essay.at`, `timer.*`, `task.*` (per OD4) and `session.end`. The result routes refuse a phone request whose `askId` is not the open ask's (409), and set `ask.sent` on acceptance. TV-role and in-process calls are unchanged. The phone page drops every such post (D8).
- Acceptance: each refused event from a phone is 403 and leaves the session byte-identical; a phone `/api/read` with no ask is 409 and the TV's screen does not change; with the right `askId` it reads as today and closes the ask.
- Tests: `tools/desk-pairing-test.cjs` (the role table), `tools/handoff-test.cjs` (409 and close-on-result, one case per result route, in-process with a stub engine, no model).
- Stick check: on Linga's home, send a paragraph from the phone by any means left. The TV must stay on Linga. Then do it properly from Essay Master and watch the TV open the reading.
Landed: 7ea64626, cb0acb71, 618819b7 (the session route refuses a phone's nav, focus, subject, item, page.select, walk, essay.at, timer.* and session.end with 403 and leaves the session byte-identical; read, mark, analyse, hint, explain and second answer a phone only with the open ask's id (409 otherwise, nothing changes), through one shared door in lib/session/phoneAsk.ts; after the lite r3 rework below, the door also checks the open ask's kind, marks the ask sent only once the work begins, and closes it on a real result or a failure of the work, while a request the route refuses before any work leaves it open; the phone page drops its item and nav posts, Next paragraph's essay.at and nav, the End session button and PaperPanel's Show on the TV). OD4 was decided (b): Tonight's list stays under More, so task.add and task.done stay allowed for the phone while timer.* and session.end are refused. Step 0 found the lite r2 leftovers (a listed phone's duplicate right code, revocation reaching streams, the TV lifting the cooldown) already carried by 429e815a, so none was rebuilt. Stick check not run.

### TL-12. Linga: the TV drives, the phone speaks
- Files: `desk/src/english/LingaPhone.tsx`, `desk/src/lib/english/view.ts`, `desk/src/english/LingaTV.tsx`, `desk/src/app/phone/panelFor.ts`, `tools/linga-rules-test.cjs`, `tools/phone-panel-test.cjs`.
- Change: LingaPhone renders the `reply`, `words` and `prefs` panels and nothing else: no tabs, no command buttons, no scene picker (D10). view.ts: "Phone setup" becomes "Set up on the phone" (ask `prefs`) or a TV screen, per OD3. The status line reads "Answer on your phone" while a `reply` ask is open. Choose a phrase answers the turn from the TV and closes the ask.
- Acceptance: LingaPhone's source posts no `nav` and no `subject` and runs no command outside its asks; `view.ts` has no action that navigates to `pair`; every learner turn offers Choose a phrase on the TV.
- Tests: `tools/linga-rules-test.cjs` (the view's actions and the phrase answer), `tools/phone-panel-test.cjs` (the Linga panel follows `reply` and `words`).
- Stick check: a whole short scene on the stick. Every step comes from the remote but the spoken or typed lines; one turn is answered with Choose a phrase alone.
Landed: 0b8a9a68 (LingaPhone draws only the reply, words and prefs panels, by the open ask's kind, with no tab, command, scene picker, plan or check-start button and no nav or subject post, and one idle line with no Linga ask open; every phone answer posts askId, and a words or prefs answer closes its ask with ask.cancel. OD3 (b): the preferences form stays the phone's, opened as ask prefs by the menu's "Set up on the phone", which no longer navigates to pair; the TV line reads "Setting up on the phone" and Back or closing the menu takes it back. OD8 (a): the reply ask opens by itself as the learner's turn begins (the turn, a say or typed level-check question or task, a moment's try) and LingaTV cancels it when the turn stops being the learner's, on Linga's Back and when a phrase is chosen with the remote; the status line reads "Answer on your phone" while it is open. The words actions (Type my goal, Add a topic, Pitch a scene in Adult mode) open ask words from the TV; Choose a phrase stays on the row at every learner turn that has a quiz of its own; Take Two moved from the phone to the Cut recap's row. panelFor follows the three Linga asks by ask.id and the screen-keyed Linga cue is gone. The english route does not look at askId on this base: it is not behind withPhoneAsk, so a phone post with no askId is accepted as before, and the posts carry it anyway; the route and phoneAsk.ts are untouched, and the ask is closed by the TV (reply) or the phone (words, prefs), not by the route.) Stick check not run.

### TL-13. Math Buddy's last phone-only steps
- Files: `desk/src/tv/keys.ts`, `desk/src/maths/MathsTV.tsx`, `desk/src/tv/mathsRows.ts`, `desk/src/app/phone/PaperPanel.tsx`, `tools/tv-keys-test.cjs`, `tools/maths-tv-test.cjs`, `tools/paper-probe-test.cjs`.
- Change: Select on a failed page read posts `/api/session/retry` kind `read` from the TV (M3). Down on Tonight opens `paper` (the unpaired Down to `pair`, `keys.ts:348`, goes: pairing is on the landing, TL-3). The paper screen gets "Type a paper" → `ask.open paper`. PaperPanel loses "Show the last paper on the TV".
- Acceptance: the TV retry emits the call only for a failed read that may be retried (`retry !== false`); Down on Tonight navigates to `paper`; PaperPanel posts no `nav`.
- Tests: `tools/tv-keys-test.cjs`, `tools/maths-tv-test.cjs`, `tools/paper-probe-test.cjs`.
- Stick check: Tonight → Down shows the last paper; "Type a paper" moves the phone to the rows; a forced failed read is asked again with Select.
Landed: 1ce6815f, 5752d598 (Select retries a failed read, Down on Tonight opens paper, the paper screen's Type a paper stop with ask.open paper and a two-step Back). PaperPanel's Show on TV moved to TL-11. Stick check not run.

### Lite r3 rework (council-lite c126c54e at 4620a696, LITE READY, robustness 0.50 at its floor)
- H1 (robustness): the ask door checked the ask's id, never its kind, so a Linga `reply` ask answered on `/api/read` moved the TV to Math Buddy. `withPhoneAsk` now takes the kinds each result route answers: read `page`; mark `sheet`, or `answers` for typed answers; analyse `sentence` (english), `paragraph` (essay, piece, piece-again) or `rewrite`; hint `question`; explain `explain`; second `second`. Any other kind is 409 and nothing changes.
- H2 (robustness): a phone could still seat another learner and move the TV through session events outside PHONE_NEVER. A phone's `learner.set`, `profile.discard`, `topic.open` and `practice.clear` are 403 "Only the TV moves the desk." with the session byte-identical (no phone flow posted them). A phone's `paper.enter` is taken only with the askId of the open `paper` ask (409 otherwise); it is marked sent as the desk goes to write the paper and closed by what that came to, and a paper with no row left keeps the ask open. `task.*` (OD4 b), `profile.draft` and `profile.save` (OD1 b) stay the phone's.
- Medium: `/api/session/retry` dropped `x-desk-role`, so a phone's retry bypassed the door. It now forwards the role and the body's askId; the TV and an in-process retry are as before.
- Medium: a refused answer spent the ask. The ask is marked sent only once the work begins (the first run started inside the answer, `answerAsk` in store.ts) and closes on a real result or a failure of the work; a 4xx before any work leaves it open. `ask.sent` stays server only for every role.
- Medium: the paper answer carried no askId. PaperPanel sends the open paper ask's id with `paper.enter`.
- Landed (TL-12 H3): /api/english now answers a phone only through desk/src/lib/english/phoneDoor.ts. A phone command is taken when it carries the askId of an open ask of the kind that answers it: reply (turn, check-answer, check-task, moment-try, capture start), words (plan-goal, plan-add, pitch), prefs (preferences). Anything else from a phone is 409 'The TV is not asking for that now.' before any work. Capture stop and lost-picture stay open. The TV and in-process callers are unchanged. An accepted answer marks the ask sent as the work begins (the TV closes reply, the phone closes words and prefs, as TL-12 set it) and no client cancels a sent ask before its result. A failed answer reopens the ask for the phone. Commit 8060bedb on main (rework ded8eb4e); tests in tools/linga-rules-test.cjs.
- Tests: `tools/handoff-test.cjs`, 12 new cases red on ff681a01 and green after.
- Landed: 3f7ecb09 (repro cases), 1601ce3b (H1), 51c5a406 (a refusal does not spend the ask), 67908789 (H2), 2cfcc0b5 (paper.enter's askId shape), bcb165e3 (retry), 2ba0e400 (PaperPanel askId), 17caa213 (this doc entry), on main (rework 8cf8ece7). Stick check not run.

### After the slices: the council

The tv-phone-pairing feature stands at full fail. Full r3 had robustness at 0.40, under its 0.50 floor
(`docs/concepts/STUDY-DESK-COUNCIL-RULINGS-2026-10-09.md`, section 8). This plan carries its open findings as follows:

- r3 must-address 5 (Forget swallows a failed leave), 6 (a server fault shown as a wrong code) and 7 (stream fan-out):
  already delivered (PR11 80a4447a, PR12 e6d6af46).
- robustness-5 (a double join post): D13, TL-2.
- robustness-6 (a cooldown any guest can renew, which the TV cannot lift) and the stale `?pin=` answer: D14, TL-2.
- economics-2 (an endless 1.5 s reopen): D4, TL-4.
- Report-only answer 2 of PR12 (a forgotten phone's open stream keeps its slot until it ends): unchanged. TL-3's
  presence counts a forgotten phone's stream as gone at its next message, when it turns guest.
- Not taken up, left as known limits: robustness-4 (a duplicated `desk-phone` cookie name, `pairing.ts:201`),
  robustness-7 and robustness-8 (two instances, an unsaved last seen), robustness-9 (an unwritable first key mint).
- Council lite r2 (63c4bf98, at f9e9593f), the three medium findings, closed by one `fix(pairing)` commit that is no TL slice:
  robustness-double-join-client-only / craft-join-not-resolution-stable (a listed phone's duplicate right code now gets 200 and
  the phone view, uncounted, with no token, cookie or pin turn); robustness-forget-not-reaching-streams / craft-revoke-not-reaching-work
  (phones.forget, a phone's leave and a reset close the open phone streams through `closePhoneStreams`, `lib/session/streams.ts`,
  so phonesLive drops); robustness-cooldown-renewable / value-lockout-recovery-hidden (a TV code-less join lifts the lockout).
  Known limits left: a guest can still renew the lockout (the desk-wide wrong-code budget is unchanged), and the TV never shows
  that a cooldown is running.
- Must-address 1 to 4 (the floor; value, craft and rivalry unmeasured) close only with a round that runs every member.
  How that round happens is OD7.

## Operator decisions

- **OD1. A name with no phone.** (a) An on-screen letter grid on the TV, typed with the D-pad: remote-only, slow. (b) The
  name stays a phone job; Save with no name says "Type the name on the phone first" (TL-8). (c) A few preset names on
  the TV, with the phone for the rest. Lean: (b) by 2026-10-23, (a) after.
- **OD2. A worked set with no phone.** (a) A remote-only self-mark on the practice card: Right / Wrong per item, marked as
  the learner's own. (b) No TV finish: Back keeps the set, and the TV says a phone is needed for the photo or the
  answers. Lean: (b).
- **OD3. Linga's learning preferences.** (a) A TV screen of picks, with the notes as a `words` hand-off. (b) The phone's
  form, opened as hand-off `prefs` from the TV's Linga menu. Lean: (b), the smaller slice.
- **OD4. Tonight's list and the clock on the phone.** (a) Both go: the clock is Play/Pause, and there is no list.
  (b) The list stays under More as a household tool; the clock is the TV's alone. (c) Both stay under More. Lean: (b).
- **OD5. The Parent role.** (a) Recap and This week stay, read-only, under More, at any time. (b) The phone drops the
  Parent role. Lean: (a). The parent copy is the reason the recap's chip reads "On the parent's phone" (`screens.tsx:337`).
- **OD6. HTTPS on the LAN, so the camera and the microphone work on a real phone (D15).** (a) `DESK_HTTPS=1` with a
  certificate the family phones are told to trust once. (b) A local certificate authority (mkcert) installed on each
  phone. (c) Stay on http: the phone types only, and the photo and voice jobs are off on real phones. This is a scope
  and a data-path question, so it is the operator's.
  Status of (a): code path landed in d371f78a (MH-1), trust doc in 40aa9441 (`docs/DESK-HTTPS-ON-THE-LAN.md`), real-phone camera and microphone check not run.
- **OD7. How the pairing reaches its decision (ask 276c835a).** (a) A council lite r2 after TL-2, TL-3 and TL-4 (the App
  Master's earlier lean). (b) One full round 4, as an exception to "there is no round 4". (c) A decision on the record,
  with the known limits above.
  **Status: resolved (c), a decision on the record.** Chosen by the operator on 2026-10-20 in terminal triage.
  - The constraint that forced it: tv-phone-pairing has used all three lite and all three full council rounds, so a fourth
    round is refused. It now goes to the operator as a Report, with no more council rounds.
  - Lost: (a), because a lite r2 is a round 4 under another name and the rounds are spent; (b), because it is the exception
    to "there is no round 4" that the rule exists to prevent.
  - Evidence: the stick pass, in `artifacts/stick-2026-10-20/` and `docs/concepts/STICK-PASS-FOLLOWUPS-SESSION-2026-10-20.md`
    (that doc is not in this tree yet; it is not merged here).
  - Known limits, stated plainly:
    - F0: the stick browser (Silk) does not pass the D-pad, Select, Back or Menu to the page. A new stick-app WebView APK is
      being built to address it; its walk will be recorded in `docs/concepts/STICK-APK-WALK-2026-10-20.md`. That walk is not
      merged yet, and no result of it is claimed here.
    - The three council must-address lines on tv-phone-pairing stay open, as the lines the council reported (see "After the
      slices: the council"; the full text is in the council run). One is the ask door that checks the ask id but not its kind
      (`desk/src/lib/session/phoneAsk.ts:21`). Note: `phoneAsk.ts:28` now compares the kind (`1601ce3b`, lite r3 H1), so this
      line may already be closed in code; the council has not re-judged it.
- **OD8. When Linga's `reply` hand-off opens.** (a) By itself, as the learner's turn begins: the fewest presses, and
  what "Phone speaks" means today. (b) On Select of "Answer on the phone": the TV leads even that step. Lean: (a).
- **OD9. Writing as its own app.** (a) No: Writing is the composing flows inside Linga and Essay Master (1.6). (b) A
  fourth landing app, Writing, that gathers Sentence help and the paragraph plan, and could later hold a TV-side way to
  start a text (a School or Family learner has none today, 5.1). Lean: (a).
- **OD10. What lands before the 2026-10-23 deadline.** (a) TL-1 to TL-4 and TL-10: the remote keys, pairing, presence, the
  link and the bar the operator saw. The hand-off model follows after the deadline. (b) TL-1 to TL-11: the full TV-led
  model for Math Buddy and Essay Master, with Linga after. (c) All thirteen slices. Lean: (a), because TL-5 to TL-11 change
  every module's hand-off at once, four days before a demo.

## Stick pass 2026-10-20

This was the first run of the TV-led flows on the real stick: an AFTKM on Android 11, reached over `adb` at 10.0.0.139:5555, running Silk 152.5.31. The base was `main` at ed23c4ac. Every screencap is under `artifacts/stick-2026-10-20/`:
- `tv-<step>.png` is an `adb exec-out screencap` of the stick.
- `phone-<step>-360.png` and `phone-<step>-414.png` are the phone at both widths.

The fixes made in this pass are the commits listed near the end of this section. Everything else is listed for the next builders.

### How it was run

- **The desk.** `next dev --webpack` ran from this branch's worktree on port 3107, with `DESK_DATA_DIR` set to a fresh temp dir (it seeds Ema and Jakub). The main checkout could not serve it: its `desk/node_modules` currently has no `@next/env` and no native `sharp` binary, so `next dev` dies at start. The operator's dev server on :3000 had started before the modules went missing. `@next/env` was supplied through `NODE_PATH` (a temp copy of 16.3.8). Nothing in the main checkout was touched.
- **The way in.** The Windows firewall opens only port 3000 ("StudyDesk 3000 (Private)"). The stick therefore reached the desk through `adb reverse tcp:3107 tcp:3107` and opened `http://localhost:3107/tv?key=…`. The QR still prints `10.0.0.141:3107`.
- **The remote.** In Silk, the D-pad, Select, Back and Menu never reach the page (see the key table). Every step below was driven by `Input.dispatchKeyEvent` over Silk's DevTools socket (`adb forward tcp:9333 localabstract:amazon_silk_devtools_remote`). The injected keys were the browser key names `ArrowUp`…, `Enter`, `Backspace`, `m` and `MediaPlayPause`. The screens, fonts, layout and timing are the stick's own; the key path is not the remote's.
- **The phone.** A headless mobile Chromium (Playwright, DPR 2) at 360 and 414 px, joined with the TV's code. Each phone shot also records whether the page scrolls sideways, and the width, height and wrapping of each bar item.
- **Models.** Live calls went only through the desk's own engine, the claude CLI: Linga's topics and scene, the essay reading, the practice set and the explain reply. The vision engine is not running on this host, so every page read fails ("The engine behind it is not answering"). For that reason M5, Ask in words, could not be reached.
- **Fullscreen.** The captures were taken in Silk fullscreen (`requestFullscreen` on the bench), so the stage fills the stick's screen. Silk shows a toast for a few seconds on entering fullscreen, and some captures carry it.

### TL-1: the key values each remote button sends (stick check)

| Button (`adb shell input keyevent`) | What the page receives | What happens |
|---|---|---|
| DPAD_UP/DOWN/LEFT/RIGHT | nothing | Silk moves its own on-screen cursor (`tv-K1-silk-windowed-cursor.png`) |
| DPAD_CENTER, ENTER | nothing | Silk clicks under its cursor; no TV screen handles a click (only LingaTV has two `onClick`s) |
| BACK | nothing | Silk's own Back: browser history, then "Exiting Amazon Silk"; in fullscreen it leaves fullscreen (`tv-key-after-back-in-fullscreen.png`) |
| MENU | nothing | Silk's own menu and toolbar |
| MEDIA_PLAY_PAUSE | `keydown` with `key: "MediaPlayPause"`, `code: ""`, `keyCode: 179`; `defaultPrevented` true | the desk's play: the clock started and stopped on the marked sheet (`tv-TL1-play-on-tonight.png`) |
| MEDIA_REWIND, MEDIA_FAST_FORWARD | nothing | nothing |

The results were the same in fullscreen and with the stage focused. Amazon's Fire TV web-app docs give these values for a page inside a Fire TV web app or an Android WebView wrapper: Select 13, arrows 37-40, Play/Pause 179, Back 4. In the Silk browser, the cursor keeps those keys.

**So on this stick, in Silk, the remote cannot drive the TV at all beyond Play/Pause.** TL-1's key map is right for the one key that arrives. For the D-pad to reach the page, the desk has to open either in a WebView wrapper (an APK like `tv-app/` whose activity forwards `dispatchKeyEvent`) or as a Fire TV web app. Which one is a scope question for the operator. As TL-1 asked, Back leaving the page is reported here, not guessed at.

### The walk

| Step | Expected | Seen | Screencaps | Verdict |
|---|---|---|---|---|
| P1 Landing, unpaired | The phone object is a stop; Select opens `pair` with the QR and code | As expected; the lamp rests on the phone | `tv-P1-landing-unpaired`, `tv-P1-pair-screen` | pass |
| P2 Phone opens `/phone` | Join panel, no bar | Join panel, no bar, no sideways scroll at 360/414 | `phone-P2-unjoined-*` | pass |
| P3 Wrong code `1111` | Refused on the phone; TV unchanged | "That code is not on the TV."; TV stays on `pair` | `phone-P3-wrong-code-*`, `tv-P3-wrong-code` | pass |
| P3 Right code, Join tapped during the auto-join (D13) | One join, no wrong-code line | Join was disabled during the auto-join; joined, no error | `phone-P4-joined-*` | pass |
| P4 Joined | TV "Paired. Select: choose who is studying"; phone "Look at the TV" | As expected; phone bar Recap · More, 180 px each at 360 | `tv-P4-joined`, `phone-P4-joined-*` | pass |
| P5 Select on Joined, no one seated | `learner` | `landing` (F1, fixed f8561690) | `tv-L1-learner-empty` | fail → fixed |
| L1 Learner cards | Cards and Add a learner | Laid out (CDP rects), but in fullscreen only the top 290 px painted; windowed they paint (F13) | `tv-L1-learner-cards` | pass (render gap noted) |
| L3/L4 Add a learner | Profile opens with ask `name`; phone shows the Name panel | As expected; phone Name, Cancel · Done | `tv-L3-profile-ask-name`, `phone-L4-ask-name-*` | pass |
| L4 Type "Tomas" on the phone | TV title follows each letter | As expected | `tv-L4-name-typed`, `phone-L4-name-typed-*` | pass |
| L5 Done on phone, Save on TV | Done closes the ask; Save seats Tomas | As expected; phone strip "Tomas · TV: the desk" | `tv-L5-saved-seated`, `phone-L5-*` | pass |
| E1 Linga home, I'll pick my level, A1, See my topics | All on the remote | As expected | `tv-E1-*` | pass |
| E3 Type my goal | Ask `words`; phone moves; Send closes it | As expected; phone Sent, then idle; 6 topics planned | `tv-E3-*`, `phone-E3-*` | pass |
| E4/E5 Start talking | Partner line; ask `reply` opens by itself (OD8 a); phone follows | As expected | `tv-E4-talk-partner-line`, `phone-E5-reply-ask-*` | pass |
| E5 One turn by Choose a phrase only | The phrase answers the turn and closes the ask | Focus starts at −1 with the first action drawn lit, so Down then Select ran Help me answer twice (F15). Choose a phrase → Option 1 "I want a hot drink." closed the reply ask, but the turn did not move. The TV said "Say it in your own reply on the phone" while the phone showed the idle card for at least 15 s (F14) | `tv-E5-choose-phrase*`, `tv-E5-phrase-quiz`, `tv-E5-phrase-answered`, `phone-E5-after-phrase-*` | **fail** |
| E5 The same turn typed on the phone | The phone's reply answers it | The panel's "Send reply" worked; the partner answered, a new `reply` ask opened, and the phone followed. The bar's Send was dead (F3, fixed a8e53e1d) | `phone-E5-reply-typed-*`, `tv-E4-partner-second-line` | pass (bar fixed) |
| E6 Back from the scene | Leaves to Linga home, closes the ask | As expected | `tv-E6-back-from-talk` | pass |
| E8 Set up on the phone | Ask `prefs` | Opens; phone shows the form. The bar's Save used the name's rule and stayed off (F3, fixed) | `tv-E8-prefs-ask`, `phone-E8-prefs-ask-*` | pass (bar fixed) |
| W1 Sentence help | `sentence`, with a way to ask | "Nothing yet" with no action drawn; Select opened the ask through a hidden stop (F4, fixed 3c761b61) | `tv-W1-sentence`, `tv-W2-sentence-ask-hidden-select`, `tv-FIX-F4-*` | fail → fixed |
| W2/W3 A sentence from the phone | Check → verdict on the TV, ask closed | As expected ("I lived here since 2019." → the rule) | `phone-W2-sentence-ask-*`, `tv-W3-sentence-verdict` | pass |
| S1 Essay Master | Lens home | As expected | `tv-S1-essay-lenses` | pass |
| S3 Select on a lens | Ask `paragraph`; phone shows the lens as a line | As expected. The first read raised the text notice on the phone ("I understand, read it", 428), while the TV only said "On the phone: the paragraph" | `tv-S3-*`, `phone-S3-*` | pass |
| S4 The reading | `forensic`, ask closed | As expected | `tv-S4-forensic`, `phone-S4-after-read-*` | pass |
| S5 Rewrite on my phone | Ask `rewrite {n}`; phone prefilled; Send → `essay.revised` | As expected ("REWRITE · IT HOLDS"). The status said "on the phone's Essay tab" (F5, fixed 2a78c7af). The panel also carries the whole paragraph composer and the shelf (F6) | `tv-S5-*`, `phone-S5-*` | pass |
| W4 The plan | Down from the last lens → plan | Offered only with no paragraph on the desk (`lensStops`, `tv/keys.ts:160`); reached as Ema | `tv-W4-*` | pass |
| W5/W6 Slots from the phone | Ask `slot {i}`; slot inks; Read it reads | Slots ink and the phone follows the caret, but the ask stays open (`i: 0`) through all three slots (F17). Read it did nothing: `/api/analyse` returned 428 because Ema had not seen the text notice, and the TV said nothing (F16) | `tv-W5-slot-ask`, `tv-W6-*`, `phone-W5-*`, `phone-W6-*` | **fail** (Read it) |
| M1 Tonight | The doors | As expected | `tv-M1-tonight` | pass |
| M2 I have homework | Ask `page {subject}`; "Waiting for the photo"; phone camera panel | As expected; sample sheet sent | `tv-M2-page-ask`, `phone-M2-*` | pass |
| M3 Failed read, Select on the TV | A new read | A new read job started (the engine is down, so it failed again). The caption still says "Open Try again on the phone" (F8) | `tv-M4-page`, `tv-M3-retry-pressed` | pass (copy owed) |
| M10/M11 Down on Tonight, Type a paper | `paper`; ask `paper`; phone shows the rows | `paper` and the ask opened, but the phone stayed on Capture with the old Try again (F9, fixed 469beb8b) | `tv-M10-paper`, `tv-M11-paper-ask`, `phone-M11-paper-ask-*` | fail → fixed |
| M10 Back from the empty paper | Back to Tonight | Lands on Get ready for school (F10) | `tv-M10-back-lands-on-prepare` | fail (pinned) |
| M7 Practice card, Type my answers | Ask `answers`; phone shows the boxes | Phone stuck on Capture again (F9). Once freed, it opened on the camera route with its own Snap/Type toggle (F11, fixed 11a37c39). The typed answers were marked: 5 right, 1 to look at | `tv-M7-*`, `phone-M7-*` | fail → fixed |
| M8/M9 The walk, Tell the desk how | Ask `explain {walkIx}`; reply on the TV | The ask opens and the typed explanation was sent (200). The card flips to "The desk replied" but shows the same opening question (F18, not diagnosed) | `tv-M8-*`, `tv-M9-*`, `phone-M9-explain-ask-*` | pass (reply text owed) |
| M12 Play/Pause | The clock | The real `MEDIA_PLAY_PAUSE` started and stopped it | `tv-TL1-play-on-tonight` | pass |
| P6 Forget this desk (phone, More) | Phone back to Join; TV "No phone here" | As expected, within 20 s | `phone-P6-*`, `tv-P6-tv-after-phone-forgot` | pass |
| TL-2 Forget every phone (TV) | Phone dropped to Join; `phonesLive` 0 | As expected | `tv-TL2-*`, `phone-TL2-after-forget-every-*` | pass |
| TL-3 Paired phone stop | "1 phone here", Pair another, Forget every phone | As expected, but the ticker said "Waiting for a phone" and the buttons cut the address line (F12, fixed b46f5bc2) | `tv-P6-pair-paired`, `tv-FIX-F12-pair-paired` | pass (fixed) |
| TL-4 Server stopped ~30 s with the TV on Tonight | Band on the stage within 2 s; phone header shows the link; back with no reload | Band at 2 s; phone "Lost the desk link. Reconnecting…"; both came back and the remote worked again | `tv-TL4-link-lost-2s`, `tv-TL4-link-back`, `phone-TL4-*` | pass |
| TL-10 Bottom bar 360-414 px | ≤ 3 items, no wrap, no sideways scroll | In every phone shot: no sideways scroll, at most 2 items, 56 px high, no label wraps; the narrowest item is 149 px (Cancel at 360) | all `phone-*` | pass |

Not walked:
- S7 (`private`, the Adult curtain).
- E2 and E7 (a level-check question, a moment).
- M5 Ask in words (no page could be read).

Next.js's dev badge sits over the phone's left bar item in the captures. It appears only in dev.

### The section 6 stick checks

| Slice | Stick check | Verdict |
|---|---|---|
| TL-1 | Back, Menu, Play/Pause on the landing, Linga, a lesson, the break; Back must not leave the page | **fail**: in Silk only Play/Pause arrives; Back leaves (key table) |
| TL-2 | Join during the auto-join; reset and pair again | pass (Join disabled in flight; Forget every phone, then rejoin) |
| TL-3 | Close the phone; the TV reads "No phone here" | pass |
| TL-4 | Stop the server; the band; back with no reload | pass |
| TL-5 | none | n/a |
| TL-6 | Waiting for the photo with the chip; Back cancels; practice stops reachable | pass (with CDP keys) |
| TL-7 | A lens → "Send the text from the phone"; slot 2 "On the phone" | pass |
| TL-8 | Add a learner, name on the phone, Save on the TV | pass |
| TL-9 | The phone follows a second ask on the same screen | pass for rewrite, reply and slot; fail after a failed send (F9, fixed) |
| TL-10 | No wrap, no sideways scroll at 360 and 414 | pass |
| TL-11 | The phone cannot move the TV | pass (H2 below) |
| TL-12 | A whole scene, one turn by Choose a phrase alone | **fail** (F14) |
| TL-13 | Down shows the paper; Type a paper moves the phone; a failed read retried with Select | pass on the TV; the phone did not move (F9, fixed) |

### The lite r3 reworks on the stick

- **H1 (the ask door checks the ask's kind): pass.** Three refusals were checked:
  - With ask `rewrite` open, the phone's "Analyse on the TV" posted `/api/analyse` kind `essay` → 409 "The TV is not asking for that now." The ask stayed open and the TV stayed on `forensic` (`tv-H1-rewrite-ask-paragraph-refused`, `phone-H1-paragraph-on-rewrite-refused-*`).
  - `/api/read` with the rewrite ask's id → 409, TV unchanged.
  - With ask `explain` open, the second-go Send → `/api/second` 409 (`phone-H1-second-on-explain-refused-*`).
- **H2 (the phone cannot seat a learner or move the TV): pass.** From the joined phone:
  - `learner.set`, `profile.discard`, `topic.open`, `practice.clear`, `nav`, `focus` and `session.end` → 403 "Only the TV moves the desk."
  - `paper.enter` with no ask → 409.
  - The session was byte-identical after each post, and the TV stayed on `forensic` (`tv-H2-after-phone-posts`).
- **H3 (phoneDoor for `/api/english`): pass.** These posts each got 409 and moved nothing (`tv-H3-after-phone-english-posts`): `turn` with no askId, `turn` and `plan-goal` carrying the open `rewrite` ask's id, and `preferences` with a stale id. The accepting side was seen in the walk: `plan-goal` (E3) and `turn` (E5), each with the open ask's id, went through and closed their asks.

### Fixed in this pass (each with a case in tools/)

| # | Finding | Commit | Test |
|---|---|---|---|
| F1 | Joined's Select went to the landing with no one seated | f8561690 | `tools/tv-keys-test.cjs` |
| F3 | The bar's dead Send for `paper`/`reply`/`words`; the `prefs` Save on the name's rule | a8e53e1d | `tools/phone-shell-test.cjs` |
| F9 | A shot whose send failed held the phone on Capture, deferring every later ask | 469beb8b | `tools/phone-panel-test.cjs` |
| F11 | The practice panel ignored the ask's route and kept its own toggle | 11a37c39 | `tools/phone-panel-test.cjs` |
| F4 | Empty Sentence help drew no action; Select hit a hidden stop | 3c761b61 | `tools/tv-keys-test.cjs` |
| F12 | Paired pair screen: ticker "Waiting for a phone"; buttons over the address | b46f5bc2 | `tools/tv-keys-test.cjs` |
| F5 | The rewrite status named the phone's Essay tab | 2a78c7af | `tools/tv-keys-test.cjs` |

### Linga stick fixes (2026-10-20, after the pass)

Not yet walked on the stick.

| # | Finding | Commit | Test |
|---|---|---|---|
| F14 | Choose a phrase on the TV now answers the turn: a right pick is sent as the learner's line (mode `choice`, helped), the partner answers and the next reply ask opens. A wrong pick, a duet, a running take and the turn cap still cue the phone | 5cf2f07f | `tools/linga-rules-test.cjs` (F14) |
| F15 | At rest (focus −1) the first lit action is the stop the D-pad moves from, so the first Down reaches the second action (`focusStep`) | 64bce506 | `tools/linga-rules-test.cjs` (F15) |
| F19 | A generated scene draws its place's picture (café, hotel, classroom, interview, moon) or the neutral `start`, never its skill's; the plan doors follow the same rule | 868dfccd | `tools/linga-rules-test.cjs` (F19) |

### Math TV fixes (2026-10-20, after the pass)

Not yet walked on the stick.

| # | Finding | Commit | Test |
|---|---|---|---|
| F8 | A failed maths read names the TV's Select as its retry, not the phone | 474e4b6f | `tools/tv-keys-test.cjs`, `tools/desk-jobs-rules-test.cjs` |
| F10 | Back from a paper that Down on Tonight opened returns to Tonight | 515fa619 | `tools/tv-keys-test.cjs` |
| F18 | A withheld explain reply is the desk's own line, not the opening question again | 400156f1 | `tools/maths-tv-test.cjs` |
| F20 | With a phone joined and no ask open, the practice card names the TV's two ways in (Snap the sheet, Type my answers) instead of saying the phone is waiting | b4d5638a | `tools/phone-panel-test.cjs` (case 14, F20) |

### Open, for the next builders (not fixed here)

| # | Finding | Where |
|---|---|---|
| F0 | In Silk, the D-pad, Select, Back and Menu never reach the page; only Play/Pause does. The TV-led design cannot run in the stick's browser | platform chosen (OD7, 2026-10-20): the stick-app WebView APK; still open until its walk lands in `docs/concepts/STICK-APK-WALK-2026-10-20.md` (not yet merged) |
| F6 | The `rewrite` and `slot` panels carry the whole paragraph composer, with its Analyse on the TV and the shelf; section 2.2 lists one field, Dictate and Send | `desk/src/app/phone/page.tsx:857`, `:863`, pinned by `tools/phone-panel-test.cjs:1183-1208` |
| F16 | Read it on the plan gets a 428 when the learner has not seen the text notice, and the TV shows nothing | `desk/src/app/api/analyse/route.ts:203`; `desk/src/essay/EssayTV.tsx` has no line for a refused read |
| F17 | `essay.slot` does not close the `slot` ask: it stays open with `detail.i` 0 after all three slots, and the TV keeps "On your phone" | `desk/src/lib/session/store.ts:863` |
| F21 | A phone-naming status outlives its ask. After Back cancelled the slot ask, Math Buddy's Tonight still carried "say or type slot 1, Your claim, on the phone", and Tomas's statuses carried into Ema's evening | `desk/src/lib/session/store.ts` (`ask.cancel` does not clear a `namesPhone` status) |
| F13 | In Silk fullscreen, the learner screen painted only its top 290 px; windowed, it paints | stick render, not diagnosed |
| F22 | The main checkout's `desk/node_modules` lacks `@next/env` and sharp's native binary, so `next dev` cannot start there | environment, `C:/Users/kazda/kiro/firetv/desk/node_modules` |

### Input to OD7

On the stick, the pairing core held:
- join, a wrong code, and one join in flight;
- Forget this desk and Forget every phone;
- presence and the dropped link;
- H1-H3, under live posts.

The TV-led experience as a whole did not run on the stick, though. In Silk the remote reaches the page only with Play/Pause, and Linga's remote-only turn dead-ends. Any round that judges the pairing feature should know that both of these facts lie outside the pairing code.
