# Writing on the TV (2026-10-21)

The operator's item (1) at the 13:20 to 14:00 say: the Writing screen inside /tv is the top priority, and the demo film depends on it. It closes walk blocker **B1** of [STICK-DEADLINE-WALK-2026-10-21.md](STICK-DEADLINE-WALK-2026-10-21.md) (rows 28 to 31). The stick loads only /tv, and nothing on the remote could drive /writing.

**In one line:** Writing is now a stop on the TV landing and a D-pad screen inside /tv. The phone takes the typing as a named hand-off (the `writing` ask). The coaching note and the saved line come back to the TV, and the episode is saved to the learner's record through the existing writing save path. Nothing changes in the APK: the stick reaches Writing with the remote on the /tv it already loads.

## What was built

| Piece | Where |
|---|---|
| The landing stop | `tv/landingRows.ts` (`LandingApp`, `writingOn`, `landingApps`); `landing/model.ts` (the Writing `AppView`, `writingCaption`, `WritingArt`, `worldArt`); `landing/themes/paper/Paper.tsx` (its colours, `railOf` for four tiles); `stamps.tsx` (a lined sheet and a pencil). |
| The screen | `tv/writingScreen.ts` (the pure rows: the phase, the stops, the line, what Writing has waiting); `writing/WritingTV.tsx` (drawn in the On Air shell); `app/tv/page.tsx` (`case "writing"`). |
| The keys | `tv/keys.ts`: the landing's Select on Writing, and the `writing` keymap. |
| The episode on the session | `lib/session/store.ts`: `Screen` `"writing"`, `AskKind` `"writing"`, `Session.writingTv`, and the events `writing.pick` / `writing.clear` (the TV's) and `writing.busy` / `writing.coached` / `writing.finished` (the routes' only, not in `SHAPES`). |
| The hand-off | `app/phone/WritingPanel.tsx`, `panelFor.ts` (`writing` → panel `write`), `phoneBar.ts` (Cancel alone in the bar; the panel sends). |
| The routes | `app/api/writing/coach` and `.../finish`: a body that carries an `askId` goes through the ask door (`lib/session/phoneAsk.ts` `withPhoneAsk(req, ["writing"], ...)`). A body without one is the /writing page, as before. |
| Tests | `tools/writing-tv-test.cjs` (new, 10 cases). The landing, keys, panel, shell and pairing suites are updated for the new stop, ask kind and events. |

Writing stands on the landing **whenever Essay Master is on the profile**. It is a coached episode of the essay family, not a `Subject`. `Subject` was not widened, so tasks, recaps, the CONTINUE tag and the paper worlds stay the three apps. Writing **has no world of its own**: when it is lit, the paper theme draws the empty world (`worldArt` returns null for it, so `worldFor(null)`). `worlds.tsx` and `shapes.tsx` are not touched (they belong to perf pass 3). Writing never takes the CONTINUE tag (`continueStop` is the three apps').

## The key map

**Landing** (unchanged for the other stops). Writing lies after the apps: Left and Right walk the shelf, Up goes to the phone, Down to Someone else.
- **Select on Writing** opens the Writing screen at focus 0, on the episode left there. A finished episode starts over at the list (`writing.clear` first). With no one seated, Select asks who first, as every app does.

**Writing screen, the prompt list** (the learner's band: `promptsFor(bandOf(age))`, the list `/api/writing/prompts` gives):

| Key | Does |
|---|---|
| Up / Left, Down / Right | the previous or next prompt |
| Select | picks it (`writing.pick`); the screen shows the chosen prompt |
| Back | the landing, the lamp on Writing (`landingFocus(s, "writing")`) |
| Menu | nothing |

**The chosen prompt** shows the prompt, the progress (Write · Coached · Revised and saved), the note once coached, and two actions:

| Key | Does |
|---|---|
| Up / Left, Down / Right | between "Write it on your phone" (later "Revise it on your phone") and "Another prompt" |
| Select on the phone action | opens the `writing` ask (no second one while one is open) |
| Select on Another prompt, or Menu | back to the list, the lamp on the prompt that was chosen (nothing was saved) |
| Back | cancels an open hand-off first; with none open, the landing on Writing. The episode stays for next time. |
| any key while the desk reads or saves (`busy`) | nothing moves |

Once saved, the one action is "Write another".

## The hand-off

1. The TV opens `{ type: "ask.open", kind: "writing" }`. The phone follows the new ask id to the **write** panel. The panel shows the prompt (the title, or "Revise your paragraph" with the note), one text box and its own Send. Cancel is in the bar (`PANEL_SUBMITS`).
2. The phone posts `{ askId, draft }` to `/api/writing/coach`, or later `{ askId, revision }` to `/api/writing/finish`. The prompt, paragraph and note come from the TV's episode, never from the phone's body.
3. **The ask door checks the ask's kind as well as its id.** This was already true for every kind on main: `phoneAsk.ts:28` refuses an `askId` whose open ask is not of a kind the route answers (`!answers.includes(ask.kind)`, commit 1601ce3b, lite r3 H1). The writing routes answer only `["writing"]`. `writing-tv-test` shows that an open Essay Master `paragraph` ask's own id is refused 409 at the coach route, with no model call and the other ask left open.
4. A paragraph the rules refuse (fewer than two sentences, too long, or a revision that changes nothing) is a 400 **before any work**. The ask stays open and the text stays on the phone to fix. Once the work begins (`writing.busy` marks the ask sent), the result closes it.
5. The note lands with `writing.coached`. The save goes through `saveEpisode` (a `writing` history line and `recordWriting` on the learner's record in learners.json), then `writing.finished`. `writing.finished` re-reads the record (`REHYDRATE`), so the landing says "Wrote today · <prompt>" at once.
6. A phone may not post `writing.pick` or `writing.clear` (`PHONE_NEVER` in the session route). No screen or phone can post busy, coached or finished. A learner switch drops the episode, and a result for another learner is dropped.

## Captures

Against a second dev server (`next dev --webpack -p 3217`) with its own seeded `DESK_DATA_DIR` and a demo learner (Ema, 16), and `CLAUDE_BIN` pointed at nothing. The coach therefore falls back to its code note, and no model call was made. The script is `artifacts/writing-tv-2026-10-21/capture.mjs`, and the shots are in `artifacts/writing-tv-2026-10-21/shots/` (gitignored):

| Shot | What it shows |
|---|---|
| `01-landing-writing-lit` | the landing, Writing lit (empty world, "Not started", its stamp) |
| `02-writing-prompt-list` | the three teen prompts, the lit one's task in the caption |
| `03-writing-chosen-prompt` | School uniform, progress, the two actions |
| `04-writing-handed-to-phone` | the `writing` ask open: "On the phone: your paragraph. Back cancels." |
| `05-phone-panel-360`, `06-phone-panel-414` | the write panel; `scrollWidth == clientWidth` at both (360/360, 414/414) |
| `07-writing-coached` | the note on the TV, "Revise it on your phone" |
| `08-phone-revise-414` | the revise panel with the note, prefilled with the paragraph, no sideways scroll |
| `09-writing-saved` | "Saved to your record: 2 sentences, coached and revised once." |
| `10-back-on-landing` | Back: the landing on Writing, "Wrote today · School uniform · 1 paragraph coached and revised" |

The first pass caught two layout faults, both fixed in `cf009ae7`. With four tiles, the 3-app pitch put the lit Writing tile into "Start as Ema", and the chosen prompt's text ran under the corner band. It also caught one data fault: the landing said "Not started" after a save, until the record was re-read on `writing.finished`.

**Not done: the stick walk** (optional item 4). No stick hold was taken in this run, so landing → Writing → Back is not verified on the device. It needs the :3000 desk rebuilt from this branch, or an `adb reverse` hold on a desk built from it.

## Follow-ups

- **A Writing world of its own** in the paper theme (`worlds.tsx`, after perf pass 3 merges). Today Writing shows the empty world under the maths sky.
- **The stick walk:** landing → Writing → prompt → phone → note → Back on the device, after the :3000 desk is rebuilt from this branch.
- **Essay Master counts Writing episodes in its "paragraphs read"** (`tv/writingRows.ts` `writingTotals` counts every `writing` history line, and `save.ts` records into the `language` lens). This was true before this change for /writing too. Decide whether a Writing episode is an Essay Master reading.
- **CONTINUE on Writing:** an episode left mid-way could carry the CONTINUE tag; today `continueStop` is the three apps'.
- **Dictation on the write panel** (the Essay panel has Dictate; this one types only).
- **Up from a hand-off with no phone connected** goes to pairing on Math Buddy's screens (`pairUp`); Writing says "Pair one from the desk" instead.
