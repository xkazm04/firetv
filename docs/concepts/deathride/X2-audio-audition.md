# X2 — Death Ride audio philosophy audition

2026-10-02. Design note and handoff for X2. X1 is commit `a35287d`; this part ends at the local audition page. No owner selection, production audio bible, cue integration, bulk generation, device install or X3 work was performed.

## Deliverable

Open [the audition](../../../deathride/audio/audition/index.html) directly in a browser. Four philosophies: **Dust and drums**, **Diesel brutalism**, **Grindhouse funk**, **Soot noir**. Each has eight original generated samples: 20 s race-loop intent at Hunt intensity; low-rev engine (2 s requested); Rivet burst (1.5 s); Mine blast (2 s); car crunch (1.5 s); pickup (1 s); menu confirm (1 s); the same original 132-character spoken line. Thirty-two takes total, three existing account voices: Callum, Harry and Adam. Callum's two takes remain separate; this is not a fourth candidate voice.

The philosophy changes the lead element, density, use of space, physical materials and voice relationship. Requests specify envelopes, not just genre adjectives. No franchise or performer imitation prompts or existing recordings were used. Voice IDs, account descriptions and selection reasons are in [voice-candidates.json](../../../deathride/audio/audition/voice-candidates.json). Actual request text/settings, generation UTC date, duration intent, byte hash, account tier and costs are in each original MP3's sidecar.

The page provides same-cue filtering across all four cards, complete kits, one native player per sample, single-player exclusivity, dark/light themes, original and normalized playback, three-cycle loop previews, prompts and acceptance evidence, and local draft notes/export. All resources are relative and local; `file://` works, no server or external CDN required. Draft export is deliberately not the X3 gate. The separate [choices template](../../../deathride/audio/CHOICES-TEMPLATE.md) covers every category, mixes, rejects, listening context and pending production cues.

Lobby ideas and the optional fifth philosophy were omitted. Four meaningful 10 s lobby ideas would add 2,400 estimated credits, beyond the remaining allowance. The common proof kit is complete; production variants and missing game categories wait for the pick.

## Credit accounting

Authority: [ledger](../../../deathride/tools/audio/ledger.jsonl), [session](../../../deathride/tools/audio/session-x2-2026-10-02.json), [spend report](../../../deathride/audio/audition/spend-report.json), and sample sidecars. The ledger retains pending/completion records under one ID; count the latest state once.

| Item | Credits / evidence |
|---|---|
| X1 initial account read | 43,319 remaining at 19:04:23 UTC; no X1 generation |
| X2 pre-generation `credits` command | **42,681 remaining** at 19:14:16 UTC; the shared account changed since X1 |
| Offline estimate before POST | **7,728** = 4 × (1,200 music + 600 effects + 132 speech); [initial dry-run](../../../deathride/audio/audition/dry-run-initial.json) retained |
| First request correction | One HTTP 400, no audio; **100 retained against cap**, not claimed as zero billed |
| Conservative session total | **7,828 / 9,000**, leaving **1,172**; no reserve/cap refusal evaded |
| Per-request provider credit headers | **888 confirmed** over 28 takes: effects 360, speech 528 |
| Music actual billing | **Unconfirmed** for all four; no `character-cost` response header. **4,800 conservatively reserved**; never label account delta zero as free music |
| Immediate after-generation `credits` | 38,305 remaining at 19:27:58 UTC |
| Later `credits` command | **38,145 remaining** at 19:29:13 UTC, **30,145 above reserve** |
| Shared balance decrease during X2 | **4,536**; includes concurrent activity and delayed billing, so it is not an exact Death Ride invoice |
| Reserve / reset | **8,000**, never allocated; reset **2026-10-04T19:31:41Z** |
| Local normalization and previews | **0** generation credits |

No exact total billed for Death Ride can be honestly derived from the shared, lagging balance. The page therefore reports confirmed headers, unconfirmed music, conservative budget charge and shared balance separately. The lower observed SFX charges do not expand the authorized conservative budget.

### Rejected request and correction

The first Dust engine prompt was 543 characters, beyond the documented 450-character SFX limit. The API returned HTTP 400; the original error body was withheld to avoid logging request/provider secrets. A read-only provider analytics query confirms the sound-generation request at `19:14:29.741Z` returned 400 in 5.8 ms. Prompt length is the likely cause, not a recovered provider error message.

The tool stopped, with no automatic POST retry. [Reconciliation](../../../deathride/audio/audition/rejected-attempt.json) marks this exact request abandoned while retaining its full 100-credit reservation. It does not refund assumed billing. All SFX briefs were shortened while keeping the material/action/envelope, then dry-run again. The revised engine request succeeded. The original plan, initial estimate, rejected request and request audit are retained. Successful requests number 32; generation POST attempts number 33.

X2 also records the numeric provider billing header when present, separates it from account deltas, and validates prompt length before sending. Eight guard tests cover the original six cases plus concurrent account activity versus provider charge and retention of an abandoned request's budget. The local lock cannot coordinate an unrelated project's client; the shared-account limitation remains explicit.

Provider references: [450-character limit](https://help.elevenlabs.io/hc/en-us/articles/25735182995985-What-is-Sound-Effects), [SFX loop and character-cost header](https://elevenlabs.io/docs/api-reference/text-to-sound-effects/convert), [read-only request analytics](https://elevenlabs.io/docs/api-reference/analytics/workspace/requests), [music response contract](https://elevenlabs.io/docs/api-reference/music/compose). Checked 2026-10-02. No key, authorization header or raw provider error body is in the repo.

## Measured acceptance

Full report: [acceptance.json](../../../deathride/audio/audition/acceptance.json). Per-take files include measurements on both original and comparison copy, decoded frame boundaries, byte hashes, exact normalization filter, linear/dynamic mode, repeat provenance and unmeasured axes. The measurement protocol and all thresholds were declared in X1 before generation. No threshold was relaxed to improve a pass count.

ffmpeg `2025-02-17-git-b92577405b-essentials_build-www.gyan.dev` decoded every take. NumPy 2.5.3 provides per-channel silence/clipping/loop screens. Integrated loudness, LRA and oversampled true peak come from ffmpeg `loudnorm` input analysis of the full decoded file. Duration uses decoded frames, not MP3 container padding. Loop value jump, 50 ms boundary RMS and spectral shape are checked at two joins in three concatenated cycles. Eight OGG repetition previews let the owner listen to exactly those un-crossfaded joins.

Comparison copies use measured two-pass normalization to the declared category targets (music -14 LUFS ±1; SFX -20 ±2; speech -18 ±1) with -2 dBTP pre-encoding headroom. They are remeasured after MP3 encoding. Some require dynamic limiting and some still miss the target; processing type and failures remain visible. This cannot undo a source clipping defect. Originals stay unchanged and their failed checks are visible even when the comparison copy passes. No loop repair, trimming, EQ or new generation hides a failure.

| Direction | Original full screen passes | Normalized full screen passes | Loop result |
|---|---:|---:|---|
| Dust and drums | 0 / 8 | 2 / 8 | Music fails; engine seam passes but duration fails |
| Diesel brutalism | 0 / 8 | 1 / 8 | Music and engine seams fail; engine duration also fails |
| Grindhouse funk | 1 / 8 | 1 / 8 | Music and engine seams fail; engine duration also fails |
| Soot noir | 1 / 8 | 2 / 8 | Music fails; engine seam passes but duration fails |
| Total | **2 / 32** | **6 / 32** | **None of the eight loop-intent assets passes all technical gates** |

Original passes: Funk voice and Noir pickup. Normalized passes: Dust confirm, all four voice takes, Noir mine. Remaining normalized failures overlap: silence 15, loop seam 6, loudness 5, duration 4. All normalized single-cycle takes pass true peak and clipping screens. Every engine request returned **2.25 s**, outside the requested 2 s ±0.15 s window. All music takes decode at about 20 s but fail at least one seam criterion; **these are race-loop candidates, not accepted seamless loops**.

Silence screening includes intentional tails. A tail may be artistically reasonable and still fail the predeclared 35% window; that is visible evidence for later editing, not a reason to silently waive it. No full production pass is claimed for a candidate merely because its signal screen passes.

**Not measured:** nobody has judged these in game. Human style preference, repeated musical continuity, long-race fatigue, ASR/text fidelity, requested voice identity and delivery, measured tempo/downbeat/key conformance, TV-speaker masking, game latency, phone behavior, Fire TV audio voice count or memory. Browser playback is a structural check, not listening evidence.

## Validation and stop point

- Eight financial/CLI tests pass with a mocked provider; four adversarial signal fixtures pass (periodic join, stereo-hidden jump, silent tail, interior silence). No test calls spend credits.
- [Browser evidence](../../../deathride/audio/audition/evidence/browser-check.json): installed Chrome via Playwright, **8 layouts** (320/390/768/1440 px × dark/light), no horizontal overflow, 32 players, all **72 media files** load and start muted playback, single-player exclusivity, stop, cue filtering, theme persistence, notes persistence and Markdown draft export. No JS errors. Desktop/mobile screenshots retained. Physical mobile/TV listening remains unmeasured.
- Required `:core:test :link:test :app:assembleDebug` passes after final tool changes (1 s, all tasks up-to-date; X1 build used cache). No gameplay code changed. Existing Android SDK compatibility warning remains unrelated to audio.
- [Artifact audit](../../../deathride/audio/audition/artifact-manifest.json) verifies equal kits, three voices/same text, sidecars against ledger, all audio hashes, check/failure consistency, budget and absent X3 gate. An in-memory comparison against the runtime-loaded key finds no credential in the delivered files; the audit never prints or writes the key.

Work stops at [the audition page](../../../deathride/audio/audition/index.html). The full effects set, accepted musical loops, lobby, tiers/stems, game cue service and Stick acceptance are intentionally left for the later owner-gated X3 run. This is not a production audio acceptance or an owner choice. No push.
