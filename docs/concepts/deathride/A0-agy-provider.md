# A0 — Second guarded image provider

2026-10-04. Owner explicitly authorizes Antigravity CLI image generation and editing, maximum 120 image reservations for A0–A2. Real provider allowance is unknown. Grok's exhausted-balance latch and 582 reservations remain unchanged; waiting cannot clear HTTP 402.

`gen.py --provider agy` resolves the same fusion briefs and reference checks. A separate `usage-agy.json` shares the append-only history, with provider/model fields on new records. Immutable provider-specific IDs preserve the failed G1 evidence. Reservations precede subprocess execution and count even on uncertainty. Execution is sequential, at most three deliberate content attempts per asset, with no retries after provider errors. The first auth, quota, rate-limit, timeout, invalid/missing output or uncertain execution latches the agy stop.

Exact headless mode uses `--dangerously-skip-permissions`, records streamed output and resumes the explicit returned conversation only to verify an already saved image, forbidding another generation. A missing output never triggers continuation or a success claim. Edits require a source with minimum edge 512 pixels; original full-resolution sources are used, with up to 14 total image inputs including style references. One image-tool call is authorized per reservation. Prompt/tool evidence must be audited before proof release.

The 59 region briefs retain their G1 content and unchanged style contracts under new `agy-` IDs. Region/family proofs, deterministic gates, local observations and direct inspection still precede sibling generation. Existing owner decisions, runtime, track data and packaged assets are protected. No new owner approvals. No Stick, push, or external messages.

Validation: fake CLI covers success, missing/invalid output, auth/quota, continuation, cap, immutable resume and edit input limits. Live smoke and required build/art/bundle checks are recorded below before commit.

## Measured result

Two reservations, two valid PNGs, stop clear. Generate and full-resolution EDIT both worked with one exact-prompt image call each; source hashes and explicit parent/child image-tool transcripts are recorded. Both outputs are **1024×1024**, despite the 2K instruction; no claimed resolution increase or fabricated upscale. The edit preserves the kept scrap pile's layout closely, but repaints/softens fine marks. Its comparison is unapproved.

The initial smoke's overbroad “do not delegate” instruction caused exploratory file reads because this agy installation routes its image tool through its built-in image-generator component. The executor interrupted to correct routing; in the inspection/interrupt race, the component had already completed its single call and saved the PNG. The same conversation then verified that existing file without generating again. The audit retains this chronology, reservation and log hash. The subsequent edit smoke ran the corrected routing normally. No provider error or stop latch was cleared. The interrupted driver's stale run lock was removed only after confirming its PID was dead.

The axle proof passes deterministic pixel gates; local graders disagree on side-depth and export cleanliness. Direct inspection holds it for camera correction; no sibling generation or technical proof release. Neither technical screening nor these smoke results approve art. Grok usage and all 157 protected runtime/data/style/owner files remain unchanged.

Required Gradle tasks, 68 art tests, both bundle validators and desktop/mobile review checks pass (reports `a0-*`, `agy-browser.json`). Owner preview: file:///C:/Users/kazda/kiro/firetv-deathride/deathride/art/review/agy/index.html . A1 still owes the other 58 first region attempts and the held proof correction; A2 uses the existing scrap-pile edit as its first restoration comparison.
