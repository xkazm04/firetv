You are a builder in a scan-sweep backlog drain for the repo at C:/Users/kazda/kiro/firetv. First read `.claude/scan-sweep/runs/backlog-2026-09-25/builder-brief.md` in full and follow it exactly. It covers the shared checkout, commit rules, gates, lock, repo law and result file.

You own ONE finding, id `linga-controls` (linga).
Title: Phone shows Linga controls the view model does not offer on that screen

- `lingaView(session).actions` (desk/src/lib/english/view.ts) is meant to be the one list of what a learner can do on each Linga screen. desk/src/english/LingaPhone.tsx draws controls that the view does not offer for that screen:
  - the situation list on home and on the recap
  - Stop / Not now during a task or while agreeing topics
  - Choose a phrase / Help me answer after a reply
- The UAT surface layer (uat/driver/surface.cjs) currently reports these as `phoneOnly` controls. tools/uat-surface-test.cjs has a fifteen-state parity case (case 4) and a case asserting `pick.phoneOnly === true` (around line 82).
- **The owner decided (2026-09-25): the VIEW OFFERS THEM.** Add each control to view.ts's actions for the screens where the phone draws it, as a phone-side action. Follow whatever `on`/side convention view.ts and surface.cjs already use. If there is none, add the smallest field that says the action lives on the phone. The phone keeps its controls, and LingaPhone should draw them FROM the view's actions rather than from its own conditions where that is a contained change. The TV must not start drawing phone-side actions: check LingaTV.tsx and desk/src/english/OpenDoor.tsx. The Open Door is the TV's current design language. Do not restyle it.
- Tests first: extend tools/uat-surface-test.cjs, or linga-rules-test if the case is about view.ts alone. In each of the fifteen states, every control the phone renders is a view action, so phone-only count = 0 (red before: count the current phone-only controls; that is the Before figure). The TV renders no phone-side action (guard). Each named control is offered on exactly the screens listed above and not elsewhere. Then update the case that asserted `phoneOnly === true` to pin the new expression, and forbid the old one.
- Keep `phoneOnly` detection in surface.cjs working as a detector: a future stray must still be caught. Seed one to prove it.
- Write set: desk/src/lib/english/view.ts, desk/src/english/LingaPhone.tsx, uat/driver/surface.cjs, tools/uat-surface-test.cjs, tools/linga-rules-test.cjs. Do NOT touch uat/driver/linga-text.cjs, because a sibling builder owns it. If the driver genuinely needs a change, describe it in the result notes instead.
- Gate: `cd desk && npm test`, exit asserted. Withholding is the product: none of these actions may reveal an answer the view withholds.

Commit: `test(linga): ...` then `fix(linga): the view offers every control the phone draws - the situation list, Stop/Not now, and the reply helpers`. Reply only after the result file is written.
