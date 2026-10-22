# The phone as a blocker: a pairing page, not a silent key (2026-10-22)

Owner: "If the paired phone is a blocker in the flow, we should pop a page for pairing instead of just deaf-ignoring the user's request."

## What was wrong

Every hand-off to the phone is a session `ask` (`ask.open`, TV only). With no phone live (`phonesLive` is 0) the ask still opened. The screen then showed a caption ("No phone is connected. Back: cancel.") that most screens drew in a small line, and on Tonight, Page, Hint, Paper, Practice and Walk the way out was an undiscoverable Up key. The learner pressed Select and nothing they could answer happened.

## The flow now

1. Select on a stop that wants the phone, `phonesLive === 0`: `tvKey` (src/tv/keys.ts) returns one event, `pair.for {kind}`, and no calls. Nothing else of the step runs (no lens chosen, no page asked for, no draft opened), so Back leaves the screen exactly as it was.
2. The session (src/lib/session/store.ts) keeps `pairFor {screen, focus, kind, gone, at}` and shows the existing `pair` screen. `gone` is true when a phone had been paired before (`joined`): the wording changes from "This needs a phone" to "Your phone is not here". The words are `pairWords` in src/lib/rules/pairBlock.ts. The screen is `Pair` in src/tv/screens.tsx (same QR, code and address; the Forget button is not shown for a wish).
3. A phone joins (`join`) or a returning phone's stream opens (`phone.presence` above 0): the reducer puts the session back on `pairFor.screen` at `pairFor.focus` and sets `pairFor.ready`. The TV (app/tv/page.tsx, Linga in english/LingaTV.tsx) runs the held Select once with the phone counted in (`resumeStep`), which posts `pair.clear` first. The ask then opens as it always did.
4. Back on the page: `nav` to the screen and lamp it came from. Any nav drops `pairFor`, so it cannot linger.

Security is unchanged: `pair.for` and `pair.clear` are not in `PHONE_MAY` or `guestMay`, so only the TV posts them; `pairFor` is a lobby-blank key (`GUEST_BLANK`), and the proxy classification and `PHONE_NEVER` are untouched. A join with a wish pending goes back to the screen, not to the Joined screen.

`reply` (Linga's own turn) is exempt: it opens by itself and the remote can pick a phrase, so a missing phone is not a blocker there.

## Audit: every phone-blocked action

Before: the ask opened (or the status line said "on the phone") with no phone; the caption said so on some screens. After: `pair.for`, the pairing page, resume.

| Screen | Key | Ask | Before (no phone) | After (no phone) |
|---|---|---|---|---|
| Tonight (Math) | Select on I have homework, no sheet | `page` | `page.ask` + ask opened, TV waits on "snap the page"; Up pairs | Pairing page; on join Tonight, then the ask opens |
| Page | Select on Ask in words | `question` | ask opened; caption "Up: pair a phone" | Pairing page |
| Hint | Select on Ask | `question` | same | Pairing page |
| Practice card | Select on Snap the sheet / Type my answers | `sheet`, `answers` | ask opened, Up pairs | Pairing page |
| Walk | Select on Tell the desk how / Type my second go | `explain`, `second` | ask opened, Up pairs | Pairing page |
| Paper | Select on Type a paper | `paper` | ask opened, Up pairs | Pairing page |
| Essay Master lens home | Select on a lens | `paragraph` | lens chosen and status line "paste on the phone", ask opened, caption "No phone" | Pairing page; the lens is chosen on resume |
| Paragraph plan | Select on a slot | `slot` | ask opened, caption "No phone" | Pairing page |
| Forensic page | Select on Rewrite on my phone | `rewrite` | ask opened | Pairing page |
| Forensic page (Adult curtain) | Select on Show the words on my phone | `private` | ask opened | Pairing page |
| Sentence screen | Select on Try a sentence | `sentence` | status line plus ask opened | Pairing page |
| Learner cards | Select on Add a learner | `name` | draft + profile screen + name ask; no way to type | Pairing page; draft opens on resume |
| Profile | Select on the Name row | `name` | ask opened; caption names the pair door | Pairing page |
| Writing | Select on the phone stop | `writing` | ask opened, "No phone is connected. Pair one from the desk." | Pairing page |
| Linga | Select on Type my goal / topic / scene, Phone setup | `words`, `prefs` | ask opened | Pairing page (LingaTV) |
| Linga | the learner's turn (reply) | `reply` | opens by itself | Unchanged (exempt) |

A phone that leaves after an ask is open is unchanged: the screen keeps its "No phone is connected" caption and Back cancels. Only a new Select is gated.

## Deviations and open questions

- Linga's voice and typed answers (start talking, carry on, the level check) have no ask of their own; they are driven by the phone's microphone and reply box. They are not gated here (the screen still says "Answer on your phone"). Gating them needs a decision on which actions count as phone-only; see the questions below.
- A phone that is paired but whose page is closed shows as `phonesLive === 0` (the stream is the signal), so it gets the "not here" wording. That is the intended reading of "gone".
- The bench's "Fake phone" button posts `join` with no stream: it satisfies a pending wish (the join resumes it) but `phonesLive` stays 0, so the next Select blocks again. Use a real phone page, or the test seat, to test a full flow.
- Existing plain-object test sessions with no `phonesLive` are not "no phone": only a counted 0 blocks.

## Gates

`tools/phone-blocker-test.cjs` (in `rulesSuites`), plus the existing `tv-keys-test.cjs`, `desk-pairing-test.cjs` (two new event samples) and `desk-boundaries-test.cjs`.
