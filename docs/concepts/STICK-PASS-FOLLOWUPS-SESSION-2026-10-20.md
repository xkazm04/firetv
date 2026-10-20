# Session and Essay fixes after the stick pass (2026-10-20)

From "Stick pass 2026-10-20" in TV-LED-PAIRED-EXPERIENCE-DESIGN-2026-10-19.md (rows W5/W6 and the open-findings table). Cases are in tools/handoff-test.cjs.

- **F17** - `essay.slot` closes the `slot` ask it answers (only when the ask is a slot ask on that slot's index) and clears a status naming the phone. The next slot is asked by Select on it, which opens its own ask with its own `detail.i` (section 2.2: "Select on another slot opens a new one"). `store.ts`.
- **F21** - `ask.cancel` clears a status that names the phone. Seating another learner already cleared such a status (`switchedFrom`); a case in tools/learner-switch-test.cjs now pins it for `learner.set` and `profile.save`, and it was green before the change, so the carry seen on the stick was the ask.cancel gap, not the switch.
- **F16** - the analyse route keeps its 428 and the notice body, and now also sets an essay-refusal status (`NOTICE_FIRST_LINE`): the plan's caption (`refusalCaption`, already drawn by `EssayPlan`) says to read the text notice on the phone's Essay tab first, then press OK on Read it again. No ask is opened for the notice; the notice itself is read on the phone.
