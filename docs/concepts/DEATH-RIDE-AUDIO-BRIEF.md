# Death Ride audio brief — X1, 2026-10-02

Current application, 2026-10-03: [owner selections applied](deathride/OWNER-APPLY-3-AUDIO.md). Per-car engines and delivered voices are active; rejected movement/mine-drop/lap cues are silent; countdown is kept and flagged. **No music ships**. [Suno handoff](deathride/SUNO-MUSIC-BRIEF.md) reserves 19 future contexts. Earlier audition plans and measurements below remain historical evidence, not authorization for new spending.

Design note for X1. This is an audition brief and a proposed implementation contract, not an implemented audio bible. X2 compares four philosophies; the owner chooses. X3 requires `deathride/audio/OWNER-AUDIO-CHOICE.md` and is outside this run.

## World and listening purpose

Rust and Ink material, Soot Pulp tension, Hot Ink punctuation: raw, gritty, mechanical, close and dirty. Hear stressed metal, air in engines, tyre load and dangerous proximity. The emotional reference is 1970s–80s road-war cinema, never a specific film, franchise, score, performer or copied recording. No named franchise terms in generation prompts. No polished arcade bleeps. Dirt is texture, not digital clipping or unintelligibility.

Four candidate philosophies change the hierarchy of sound, not merely the instruments:

| Direction | What carries the race | Effects relationship | Voice relationship |
|---|---|---|---|
| Dust and drums | Space between dry war drums; tape-echo guitar as a distant horizon | Natural, exposed metal and dust; transient first | A close, weathered rival against a wide world |
| Diesel brutalism | Machine rhythm and distorted bass pressure; almost no melody | Engine is the musical centre; impacts are dense, short punctuation | A harsh challenge that cuts through machinery |
| Grindhouse funk | Dirty bass groove, raw breaks, wah and blunt brass; dangerous comic swagger | Springy mechanical rhythm; readable gestures with more bounce | A brash announcer sells the spectacle |
| Soot noir | Restrained low strings and sub pulses; tension from withheld release | Small, intimate, weighty details; selective silence | Quiet menace, not a shouted sports broadcast |

All get the same proof kit: 20 s race-loop intent at main intensity, 2 s low-rev engine loop, 1.5 s Rivet burst, 2 s Mine blast, 1.5 s car crunch, 1 s pickup, 1 s UI confirm, and the same 100–150-character spoken line. Three existing account voices across four kits; duplicated voice is a second take, not a fourth candidate. Lobby generation is optional only if the entire equal set fits the cap with headroom. Do not compromise the proof kit to buy a fifth direction.

## Source inventory and hooks

Paths below are relative to `deathride/`. The simulation is silent today. Snapshot and painter fields are presentation evidence, not an existing audio event service. X3 must add deduplicated events where an edge cannot safely be recovered from snapshots; never play once per rendered frame.

| Need | Existing source / signal | Proposed sound and hook |
|---|---|---|
| Engine per class | `core/.../Cars.kt`, `resources/data/cars/*.csv`, `Car.speedMps`, input throttle, ability engineScale | One pitched loop per audible car; smoothed pitch/load from speed and throttle, not frame rate. No invented measured RPM. Ten class identities below. |
| Tyre, skid, drift | `Drift.kt`, `Car.drifting`, `driftQuality`, `slipRadians`, `spunOut`, `surface`; `game/.../AtlasEffects.kt`, `TrackScene.kt` | Asphalt scrub, gravel chatter, drift sustain and recovery release. Start/end edges, continuous gain from slip/load. Spinout has a rough release, no reward jingle. |
| Car / wall / barrier contact | `World.kt` contact solver; `Combat.kt` wallImpactMps, damageEvents; world contact/track geometry | Metal crumple for car; scrape/thud for wall; loose rattling for barrier. Damage totals cannot distinguish materials: X3 needs a contact event containing pair/material/impulse. Dedup pair per fixed step. |
| Rivet | `weapons.csv`: ray, 0.20 s cooldown; `Combat.kt` fire/trace | Short dry burst with mechanical bolt and separate hit tick. Audition burst is a timbre proof, not the future per-shot cadence. |
| Hammer | Projectile, 1.4 s cooldown; projectiles and hit resolution | Heavy launch thunk, short travel texture only nearby, impact/blast with weight, grit and debris. Do not infer hit from muzzle trace expiry. |
| Mine | 2.5 s deployment cooldown, 1.4 s arming, 0.5 m radius, 24 damage; blast.activation | Drop clunk, local arming latch, compact violent blast, optional debris layer. Preserve current small-radius identity; one sound per activation, never per lingering visual frame. |
| Scatter | Existing fourth weapon in `weapons.csv`, spread, 1 s cooldown | Broad short slap, dry mechanical cycling, deduplicated pellet impact cluster. Included in the future inventory even though the common audition kit uses Rivet. |
| Weapon hits | `Combat.damage` / DamageKind, lastTarget, damageEvents | Armour ping, body crunch, terminal hit distinct from fire. Add bounded event data at successful damage application. |
| Pickups | `pickups.csv`: ammo / repair / cash; `Combat.kt` pickup resolution | Ammo rack latch, repair ratchet/clamp, cash token scrape. No coin cascade. Emit on successful collection, not respawn visibility. |
| Wreck | `Combat.wrecked`, wreckSeconds, LifeState edge | One tearing impact and engine choke, short debris. No repeated death cue while a wreck remains on track. |
| Countdown / start | `game/.../RaceGame.kt`: countdown=3, phase, scene.ready | Three mechanical knocks and a starting crack. Scene preparation freezes both countdown and sound. Emit each integer edge once; start when phase becomes race. |
| Lap / position | `Car.lap.laps`, position, finishSeconds, finishKind | Final-lap call; sparse overtake/lost-place punctuation with debounce. No sound for every position recalculation. |
| Victory / defeat | RaceGame results transition and race outcome | 2–4 s original stings, winner lift / exhausted stop. Resolve once per race ticket; P2 spectator is not a losing entrant. |
| Menu / garage / shop | RaceGame phase and input handlers; garage transaction/receipt result | Focus tick, confirm latch, back release, denied dry knock, purchase stamp. Successful transaction event owns purchase sound, not receipt redraw. |
| HUD | `game/.../HudTheme.kt`, RaceGame combat/ability HUD; HP/ammo/arming/energy states | Low HP, empty weapon, ability ready, lock/denied. Threshold edges with hysteresis and cooldown; HUD animation and digits stay silent. |
| Rival taunts | `resources/data/rivals.csv`, career dialogue data, `Career.kt` | Rare short rival lines at authored events. One speaker at a time, captions retained, never tied to portrait repaint. |
| Story-card voice | Career authored story-card rows / RaceGame career presentation | Optional line-by-line narration, skip cancels immediately, text always remains available. Catalog and timing windows precede later bulk rendering. |
| Race music / lobby | RaceGame phase, world/combat/car state | Four declared race tiers below; separate quiet lobby loop, garage uses lobby bed. Story card ducks or stops music. |
| Phone vibration | Phone/link drift, impact and control feedback | Independent haptic channel; audio mute never toggles vibration, vibration permission never gates sound. No duplicate phone audio. |

`core/...` means `core/src/main/kotlin/dev/deathride/core/`; data lives at `core/src/main/resources/data/`; `game/...` means `game/src/main/kotlin/dev/deathride/game/`. The current asset/presentation snapshot includes six entrants and two human seats; audio must never allocate a voice to each visible object automatically.

### Ten car engines and signature abilities

Engine timbres are proposed from authored roles, not claims of actual cylinder counts. Each family is one loop pitched modestly (initial 0.75–1.5x envelope), low-pass/gain shaped by load, with 100 ms smoothing. Use a single baked composite per car, not simultaneous idle/mid/high layers. The low-rev audition uses a generic battered coupe for fair comparison, not ten production engines.

All signature timing below is seconds, from `abilities.csv` (windup / active / recovery; cooldown). Common hook: `AbilityState.activation` + phase edge; `Snapshot.abilityDefinition/Phase/X/Y/EndX/EndY/RemainingSeconds`, matching `AbilityPainter.kt`. Spatial windups are gameplay tells, not musical risers. Cancel stops active sustain on wreck/reset; ready is a local HUD edge. Every `effectId` is `abilities/<id>`.

| Car / engine colour | Signature ID and timing | Envelope and presentation correspondence |
|---|---|---|
| Needle / small strained rasp | Steel Flick `steel-flick`: .15/.80/.25; 7 | Spring snap windup, short exhaust rip while body dashes, dry let-off. Body ring and engineScale>1 wake; cue follows car. |
| Line / uneven coupe throb | Flywheel `flywheel`: .25/1.40/.30; 9 | Clutch catch, rising flywheel whirr, rough release. Car-bound surge and trailing thrust lines. |
| Bastion / heavy slow diesel knock | Shoulder `shoulder`: .40/1/.35; 10 | Plate draw, loaded engine shove, ram contact crunch on actual hit. Forward prongs identify charge; hit dedup remains Combat-owned. |
| Comet / hot racing whine with raw exhaust | Turbine `turbine`: .40/1.30/.50; 13 | Air spool, narrow turbine scream over engine, pressure dump. Car-bound thrust and reduced grip/steering must remain readable. |
| Trail / rally sputter and intake bark | Ground Bite `ground-bite`: .20/1.80/.25; 9 | Tread bite, low tyre/gravel grind, grip release. Car-bound grip sustain replaces ordinary tyre voice rather than adding another. |
| Flint / short-stroke brawler growl | Punch Lance `punch-lance`: .75/.20/.30; 9 | Ratchet charge, steel bolt crack, tiny tail. Fixed ray corridor from ability origin/end, hit at target only if resolved. |
| Quill / medium-mass dry growl | Bone Rack `bone-rack`: .40/1.80/.30; 9 | Rack extension, sparse spike rattle, mechanical retract. Front/rear prongs and contact scrape. Do not resurrect historical light-class identity. |
| Vandal / lumpy boosted motor | Scrambler `scrambler`: 1/2/.30; 12 | Canister tumble, gritty electrical chatter, sputtering stop. Fixed patch circle; hazard sound at stored position, not moving with owner. |
| Kestrel / tight high-rev rasp | Arc Harpoon `arc-harpoon`: .75/.25/.35; 10 | Tensioned cable ratchet, crack/zip, short target arc. Fixed ray; shock/slow ring is target feedback, never a continuous arcade tone. |
| Bulwark / armoured low diesel | Plate Brace `plate-brace`: .25/1.80/.35; 12 | Plate clamp, low chassis strain, latch release. Body guard ring; incoming hits become duller during damage reduction, not silent. |

Energy/cooldown failures get one local dry refusal at most every 400 ms. Do not imply readiness solely because energy is full: phase, cooldown and weapon lock matter. Windup priority is protected at onset; sustaining cosmetics can be stolen.

## Fire TV budget and event policy (proposed for X3)

Target: Fire TV Stick 4K, 1.7 GB RAM. Audio allocation ceiling **12 MiB resident including decoded cues and decoder buffers**, within the existing 192 MiB whole-process PSS gate, not added to it. Of this, decoded mono SFX/engines <=6 MiB, at most two streaming decoders/buffers <=4 MiB, cue state and safety headroom 2 MiB. Decode only the active car families and current scene; unload on scene change. A 2 s 22.05 kHz mono PCM16 effect costs 88,200 bytes; compressed size is not resident size. Streaming budgets need device measurement in X3.

Provisional installed audio cap **24 MiB**: short mono OGG effects ~48–64 kb/s, music stereo OGG/MP3 ~96–128 kb/s, speech mono ~64 kb/s. X2 retains original 128 kb/s MP3 plus clearly labelled audition derivatives outside game assets; this is not a shipped content allocation.

Hard ceiling **8 simultaneous voices, including streams, overlaps, tails and muted layers**. Steady mix: 1 music + 2 engines + 1 tyre + 1 voice/alert + 3 transient slots = 8. During a two-stream music crossfade: 2 music + 2 engines + 0 tyre + 1 voice/alert + 3 transients = 8. One monolithic mix per tier; **zero extra running stems**, zero music accent voice outside transient quota. Critical tell reserves one of those transient slots; never raise the total to fit a bus. Two local engines have preference, distant AI engines virtualize using a logical phase clock without an allocated playback voice.

Priorities: critical=3, high=2, normal=1, texture=0. Protected telegraph/start/wreck class max one at onset; simultaneous critical candidates choose nearest dangerous tell, then local outcome, then oldest, and count suppression. Critical does not mean unlimited or undroppable. Voice gets ducking (music -6 dB, engine texture -3 dB, 60 ms attack / 350 ms release), not a second protected reservation. Voice/alert slot is a ceiling, not a guarantee that all requests queue. Stale one-shots drop; no delayed gunfire. Voice lines never stack; story skip cancels, race taunts inside 8 s drop.

| Event class | Priority / space | Max concurrent in class | Start cooldown / scope |
|---|---|---:|---|
| Engine loop | 0 / 3D car | 2 total | 150 ms per emitter start; continuous parameter update |
| Tyre / drift / grip loop | 0 / 3D car | 1 | 150 ms per emitter start; same voice changes state |
| Car crunch / wall / barrier | 2 / 3D contact | 2 combined | 50 ms per contact pair; coalesce same-frame cluster |
| Rivet / Scatter / Hammer launch | 2 local, 1 rival / 3D muzzle | 2 combined | 50 ms per emitter plus authored weapon cooldown |
| Weapon hit / blast debris | 2 / 3D impact | 2 combined | 50 ms per activation/target; one blast per activation |
| Mine drop / arming | 1 / 3D mine | 1 | 150 ms per emitter; dedup activation |
| Signature windup / dangerous tell | 3 / 3D source or fixed patch/ray | 1 protected onset | 0 for new activation, dedup identity; active sustain uses high transient slot |
| Signature active / recover / ready | 2 / 3D source; ready 2D local | 1 | 150 ms phase events; ready 400 ms |
| Pickup ammo / repair / cash | 1 / 2D local, distant suppressed | 1 | 300 ms per seat |
| Wreck / start | 3 / wreck 3D, start 2D | 1 | 0, identity dedup; start once per race |
| Countdown | 2 / 2D | 1 | one integer edge per second |
| Lap / position / HP / ammo alert | 2 / 2D | 1 | 500 ms; position stable 750 ms, HP re-arm >35%, warn <25% |
| Menu / shop confirm, back, denied | 1 / 2D | 1 | 300 ms; focus ticks 150 ms |
| Announcer / rival / story | 2 / 2D | 1 | 500 ms technical gate, rival 8 s editorial spacing |
| Victory / defeat sting | 2 / 2D music bus | 1 | once per outcome; replaces race bed, no extra stream |
| Race tiers / lobby bed | 0 / 2D | 1 steady, 2 transition | tier dwell policy below |

3D here means world-positioned gain/pan derived from the TV camera listener, compatible with ordinary stereo; no claim that libGDX supplies automatic 3D/HRTF. Initial near/far attenuation 4/45 m, silence beyond 60 m; position and pan clamp for intelligibility. Music, captions' voice and UI never get distance attenuation. Outdoor dry acoustic profile; no costly dynamic occlusion/reverb in first implementation. Perceptual stereo/TV-speaker calibration is unmeasured.

Layered design happens offline: low weight + mid attack + air/debris tail, separately editable source elements, then bake to one runtime voice where simultaneous layers would break budget. X2's six short composites explore palette only; they do not constitute a production stem library.

## Adaptive music contract (proposed, not commissioned as four tiers yet)

Four named tiers: **Rolling** (sparse motion), **Hunt** (main racing groove; X2 audition), **Contact** (combat weight), **Redline** (short climax). Inputs use the active local driver, or leader while spectating: phase enum; speed/maxSpeed normalized 0..1; HP/maxHP 0..1; damage events in trailing 3 s capped at 3; opponent distance m mapped `proximity=clamp(1-distance/30,0,1)`; completed laps / authored raceLaps. Damage window is new presentation state, not an existing field.

Declare pressure `P = .40*proximity + .35*min(damageEvents3s/3,1) + .25*(1-hpFraction)` in [0,1]. Rolling->Hunt at speed fraction >=.35, falls at <=.15. Hunt->Contact at P>=.55, falls at <=.35. Contact->Redline at P>=.80 or final-lap flag with P>=.60; falls at P<=.60 (final-lap branch releases at <=.40). Final lap alone never pins climax. Race state gates everything; lobby/garage use lobby, results use sting, pause/stop exit immediately.

Rise must hold .25 s, fall 3 s; minimum dwell 4 bars; falls wait 8 bars where feasible. Redline maximum 12 bars (30 s at audition 96 BPM), then Contact for at least 8 bars before re-entry. These are proposed thresholds; X3 must replay traces, count changes/minute, report tier coverage and suppressed changes, and tune with owner listening. No trace-tested mapping is claimed here.

Audition music requests **96 BPM, 4/4, eight bars = 20 s** for all four directions. This makes loop length and comparisons equal; tempo/key/downbeat compliance still require measured/listened evidence. Future selected tier set must share key, meter, measured tempo and sample boundaries. Prefer horizontal resequencing of composed full mixes over live stems under the two-stream maximum.

Harmonic transitions quantize to next bar: at 96 BPM that is 2.5 s worst wait, which cannot claim a <=500 ms immediate response. Cover important entry with an unpitched accent within the transient budget, then change harmonic state on the bar. Initial commit horizon 80 ms (to be measured on Stick); inside horizon defer one boundary, never clamp to now. Log requested/used boundary and first rendered sample under load. Crossfade maximum one beat (625 ms) consumes second stream; reversal resumes existing playback phase, never restarts. Mute, pause, wreck exit and story skip do not wait for a bar.

Loop declaration travels with the **decoded byte stream**: sampleRate, channels, totalFrames, startFrame=0, endFrame exclusive, preRollFrames=0, tail policy. X2 measures original full-span candidates; it must not call an MP3's container duration a verified eight-bar grid. Re-encode means re-decode and republish boundaries. X3 requires tail folded into head for plain loops, or an explicitly supported pre-roll/loop/exit-tail scheduler. A fade longer than ~10 ms can disguise a musical mismatch: retain that failure rather than stamping seamless. Repetition acceptance includes value discontinuity, boundary RMS/spectrum, tempo/downbeat continuity and human repeated listening (at least three passes, then long-race fatigue).

## Acceptance and comparison

Save original generated bytes and sidecars. Decode with ffmpeg; duration tolerance music ±0.35 s, SFX ±0.15 s; speech 4–15 s window (text length does not guarantee delivery duration). Measure integrated LUFS, LRA and true peak on the full decoded file. Audition music target **-14 LUFS ±1**, true peak **<=-1 dBTP**; use -2 dBTP processing headroom before lossy encoding. Audition voice target -18 LUFS ±1; SFX -20 LUFS ±2 for comparison, not a promised in-game mix. Short-effect integrated readings are screening metrics; attack quality remains a listening decision.

Measure decode errors, silence (below -50 dBFS intervals >=100 ms; fail >35% of non-voice duration or >45% voice, or interior gap >250 ms in a loop), and full-scale samples (|sample|>=.999; any is a clipping-screen fail). Report loops' sample jump, first/last 50 ms RMS difference and spectrum difference separately. Planned loop screen: jump <=.02 full scale, RMS step <=3 dB, spectral shape cosine >=.80. Passing these cannot prove a musical seam; failed loops remain visible. No hidden retries or generation replacement.

If matching levels for a fair audition, create explicitly named derivatives; show raw results and original download beside them. Gain/normalization is local edit cost=0 credits, never a second generation. Recheck every derivative after encoding. Do not change thresholds after seeing failures. A deterministic pass is only a technical screen; **owner choice, in-game masking, spatial placement, latency, repeated-loop feel and Stick voice/memory compliance are unmeasured**.

Defect taxonomy from the registry: smeared transient, vocal garble, section bleed, tempo instability, broken ending, loop seam, spectral imbalance/hole, phase/width collapse, unrequested instrument/voice/underscore. Meters can flag some, not classify all by themselves. Repair spectral/edge issues locally with provenance; structural misses wait for a better brief after the pick. No audition sample is shipping-approved.

Speech has separate axes: text fidelity, voice identity, signal quality and delivery. Use the same line/settings/format across candidates. No ASR model or reference speaker recording is installed as part of X1; WER, similarity and style scores remain **not measured**, never inferred from successful TTS. Owner should check missing words, pronunciation, menace without parody, register and intelligibility against engines. Future transcription must pin recognizer/normalizer/reference floor. Captions remain available independent of narration.

## Spend, provenance and registry binding

X1 credit check: **43,319 / 90,000 remaining**, starter, `2026-10-02T19:04:23.214Z`; reset `2026-10-04T19:31:41Z`. X1 made no generation calls. X2 cap 9,000, reserve >=8,000, one persisted session `x2-2026-10-02`. Four core kits estimate about 7,700 credits; exact script character count and aggregate dry-run must precede POST. Shared account deltas can include Garden VR activity; report that attribution limit. No bulk set, retry spree or new voice creation. Tool details and safe commands: [README](../../deathride/tools/audio/README.md).

Read-only source root `C:/Users/kazda/kiro/ai-registry/.claude/worktrees/forge-racing-tv/knowledge/`:

| Registry subject (relative to root) | Binding decision here |
|---|---|
| `game-production/asset-production/motion-and-audio/adaptive-music-authoring/` | Four declared tiers, hysteresis and dwell, transition latency/commit horizon, decoded loop boundary/tail contract, one/two-stream budget. Read subject plus intensity-mapping, transition-quantization, loop-boundary-and-tail, stem-and-voice-budget techniques. |
| `game-production/asset-production/motion-and-audio/spatial-audio-scene-authoring/` | Per-event priority/concurrency/cooldown, stereo positional vs 2D routing, suppression and eight-voice ceiling. Read subject and event-priority-concurrency-cooldown. |
| `media-generation/audio-generation/sound-effect-generation/` | Envelope-first prompts, separately editable layers before offline baking, declared loop intent and repeat acceptance. Read subject and envelope-first, layered-element-assembly, loop-seam-acceptance. |
| `media-generation/audio-generation/generated-music-acceptance/` | -14 LUFS music, <=-1 dBTP, decode versus musical conformance, named defect classes and provenance. Read subject, loudness-and-peak, defect-taxonomy. |
| `media-generation/audio-generation/generated-speech-acceptance/` | Same-text board, fidelity/identity/quality separate, listening cannot be replaced by a decode pass; unmeasured axes disclosed. Read subject. |

Also read Garden VR `docs/audio/AUDIO-BIBLE.md`, `CHOICES.md`, `audition/r2/index.html`, `tools/audio/elevenlabs.mjs`. Borrow its comparison and ledger discipline, not its quiet wellness aesthetic. All generated prompts and dialogue here are original. Record provider tier/time/request/voice and file hash; no claim of legal clearance or owner adoption is made by a technical pass.
