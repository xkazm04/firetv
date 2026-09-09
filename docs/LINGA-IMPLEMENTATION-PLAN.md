# Linga web implementation

9 September 2026 · Implements [the conversation design](LINGA-CONVERSATION-DESIGN.md) in `desk/`.

## Delivery sequence

1. **Learning foundation.** Shared English types, eight authored skill families, age-eligible scenarios, independent proficiency/interest/creativity/challenge preferences, conservative evidence rules. Add an English namespace to existing learner persistence without changing Math records.
2. **Live conversation service.** Use the existing Claude CLI engine for a generated scene, contextual partner replies, one coaching note, and a changed replay question. Validate model output and quoted evidence. Scope every operation to the current learner and episode; handle duplicate requests, cancellation, errors and stale responses.
3. **TV integration.** Repair the English entrance, add recommendation/scene selection/map/conversation/coaching/recap screens in On Air, real pointer and D-pad actions, readable turn captions, pause and replay audio. Keep sentence help reachable.
4. **Phone integration.** Add Linga to the existing phone navigation. Configure learning preferences, speak with explicit capture controls, review or correct the transcript, send typed alternatives, request cues and choose supporting quiz answers. Show saved evidence and editable learning notes; provide a real print view.
5. **Verification.** Type-check and production build; exercise age restrictions, evidence/progression, isolation, retries, and stale-operation rejection. Run the real model through conversation → coach → replay → finish, then drive TV and phone together in a browser. Use a separate server/data directory for validation.

## First delivery scope

Eight authored scenario contracts: first introductions, interests/weekends, children's space search, teen collaborative planning, practical booking, interview, adult date, and everyday conflict. Dialogue and coaching are generated live inside these contracts. Each of the eight skill families has a scenario that exercises it. Other interests influence the generated details, within scenario boundaries. Recent evidence adjusts support and follow-up complexity inside the learner's chosen comfort and challenge limits. Date practice is never an unsolicited next recommendation.

Speech capture uses the browser speech-recognition facility already used by this app, with explicit user initiation and an editable transcript. Availability is checked and explained; typed input is a complete alternate route. Recognition may use the browser vendor's service and is not described as guaranteed local processing. No raw audio is stored by the app. TV output uses the configured voice engine with browser synthesis fallback. Live recognition quality on physical phones and native Fire TV microphone support are separate device checks.

English evidence distinguishes voice transcripts, typed turns, supported practice, and quiz recognition. No pronunciation or official CEFR score is inferred. Progress uses conservative, inspectable rules and retains historical achievements. Preferences and short learner-authored teaching notes persist across session reset.

## Acceptance

- Choosing Linga never starts Math practice; Math and writing remain reachable.
- The TV and phone show the same generated episode and update without reload.
- The learner can send a real response, ask for support, replay a coaching moment, finish, and return to saved English progress.
- Restricted themes require an adult profile or explicit adult confirmation for an unspecified-age profile; school-age restrictions are enforced by the server.
- Model responses from an old episode/learner cannot update the current one. Retries cannot double-count a turn.
- Taps and edited/typed transcripts cannot earn independent spoken evidence. Uncertain assessments do not reduce progress.
- Model or audio failure is visible and recoverable. A failed model call retains the learner's unsent draft.
- Settings independently control language comfort, interest, creativity, social challenge, and correction preference.
- The map prints actual saved evidence, not the scripted concept's sample achievement.

## Execution record

Completed in the web app:

- Shared curriculum, scenario eligibility, preferences, evidence validation and saved progression in `desk/src/lib/english/`; generated dialogue, coaching and replay through `POST /api/english`.
- TV recommendation, scene picker, eight-chapter map, conversation, support quiz, coaching, replay and recap. Pointer and D-pad actions work; Menu keeps sentence help and phone setup reachable. The English entry no longer starts Math. Writing now opens its own lens picker from the landing screen.
- Phone setup, typed replies, explicit speech capture and transcript review, cues, quizzes, coaching/replay, detailed evidence, editable teaching notes and a real printable map. English remains separate from Math's records and grading.
- Scoped commands, idempotent turn commits, stale response rejection, cancellation, recoverable errors, capture expiry and learner migration. A running Math timer is paused when an English episode starts.

Verification on 9 September 2026:

- `npx tsc --noEmit` and `npm run build` passed. Next reports dynamic filesystem tracing warnings for the existing external CLI/Piper execution paths; this is a local prototype, not a deployment bundle validation.
- `node tools/linga-rules-test.cjs`: 8 tests passed, covering age eligibility, mode/support distinctions, evidence quotations, migration, duplicate/retry behavior, learner isolation, cancellation, and preservation of Math and English records across reset.
- Real Claude-generated adult booking and child rover conversations exercised opening → typed reply → coaching → replay → finish. The browser run additionally exercised synthetic recognition callbacks, transcript confirmation, supported spoken evidence, TV/phone synchronisation, D-pad entry/menu/back, and Math/Essay navigation. Speech callbacks were simulated, not a physical microphone test.
- Live runs encountered 60-second model timeouts. Retrying succeeded; the phone draft and previous turns survived. The full flow was completed across the original run and explicit retry, rather than counting a timed-out call as a passing first attempt. Completion checks: `artifacts/linga-integration/completion-review.json`; screenshots and the printed map are in that directory.
- The actual learning map rendered as one A4 page with all eight chapters. Phone layout at 390 px had no horizontal overflow. Browser checks reported no page exceptions. The configured speech endpoint returned HTTP 200, MPEG audio, 17,598 bytes for the test phrase.

Remaining practical limits:

- Model latency is substantial and variable on this machine/account: measured successful full tutor operations roughly 17–52 seconds, with some calls hitting the 60-second timeout. Disabling unrelated CLI customisations and avoiding its extra structured-output turn did not establish a low-latency guarantee. A streaming service or a faster measured inference path is the next performance improvement; no fast-response claim is made for this delivery.
- Browser speech support, secure-context setup and noisy-room recognition still need a physical-device check. Ordinary LAN HTTP supports the full typed flow. This delivery does not provide native remote-microphone access or streaming interruption of model generation.
- Evidence is model-assisted and conservative, not externally calibrated certification. Teacher evaluation of accepted variants, register feedback and unfamiliar-scene transfer remains necessary before treating progression as an educational assessment.
