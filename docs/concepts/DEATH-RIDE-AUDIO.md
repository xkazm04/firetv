# Death Ride: audio philosophy audition (X1-X3)

Current application, 2026-10-03: [owner selections applied](deathride/OWNER-APPLY-3-AUDIO.md). Per-car engines and delivered voices are active; rejected movement/mine-drop/lap cues are silent; countdown is kept and flagged. **No music ships**. [Suno handoff](deathride/SUNO-MUSIC-BRIEF.md) reserves 19 future contexts. Earlier audition plans and measurements below remain historical evidence, not authorization for new spending.

Written 2026-10-02 from the owner's note: in another project (Garden VR) the owner generated a handful of ElevenLabs samples and triaged directions and themes through an audition page
(`C:\Users\kazda\kiro\garden-vr\docs\audio\audition\r2\index.html`, plus `docs\audio\AUDIO-BIBLE.md`, `docs\audio\CHOICES.md`, `tools\audio\elevenlabs.mjs`, all read only). Do the same here: **establish the audio philosophy first, then cover the game's effects with ElevenLabs.**
The owner picks; this plan stops at the pick and does not mass-generate before it.

## Facts checked on 2026-10-02

- The tool `garden-vr/tools/audio/elevenlabs.mjs` has `credits`, `voices`, `sfx`, `tts`, `music` commands, a credit guard (refuses a call that would drop the plan below a reserve, default 8000) and a committed ledger with sidecars.
  Key lives in `C:\Users\kazda\kiro\garden-vr\.env` (git-ignored there). **Never copy the key into this repo; never print it.** Load it from the environment or by reading that file at run time.
- Plan: starter tier, **43,319 credits remaining of 90,000, resets 2026-10-04**, and the same account is used by Garden VR, so the credits are shared. Costs in that tool: sound effects about **40 credits per second (minimum 100)**, music about **60 credits per second** (max 180 s), speech about 1 credit per character.
- Audition budget cap: **about 9,000 credits** in total, keep the 8,000 reserve, report spend and remaining in the report. The bulk effects set waits for the owner's pick and, if needed, for the 4 October reset.

## X1 Port the tool and write the audio brief

Copy the tool into `deathride/tools/audio/` (own ledger, own reserve variable `DEATHRIDE_AUDIO_RESERVE`, key loading from the environment or the Garden VR `.env` path without copying the secret; add `--dry-run` that prints cost estimates). Add a **hard per-session spend cap** argument and refuse beyond it.
Write `docs/concepts/DEATH-RIDE-AUDIO-BRIEF.md`: what the game needs, from the code and data (engine per car class, tyre and skid, drift, collision (car, wall, barrier), weapons Rivet / Hammer / Mine and their hits and explosions, the ten car abilities in `deathride/core/src/main/resources/data` (abilities CSV) and their presentation hooks, pickups, wreck, countdown and start, lap and position, victory and defeat stings, menu and shop UI, the HUD, rival taunts and story-card voice, race music tiers, lobby music).
Bind it to the registry notes (read only, `C:\Users\kazda\kiro\ai-registry\.claude\worktrees\forge-racing-tv\knowledge\media-generation\audio-generation` and `...\knowledge\game-production`): `adaptive-music-authoring` (3 to 5 named intensity tiers from declared game state, hysteresis, transition quantisation and perceived latency, loop boundary contract, voice and stem budget), `spatial-audio-scene-authoring` (per event priority, concurrency and cooldown: about 50 ms for fast impacts, 100-200 ms movement, 300-500 ms alerts; 2D versus 3D per class), `sound-effect-generation` (envelope-first briefing, layered element assembly, loop seam acceptance), `generated-music-acceptance` (about -14 LUFS, true peak at or under -1 dBTP, defect taxonomy), `generated-speech-acceptance`.
Constraints of the target: Fire TV Stick 4K, 1.7 GB, MP3/OGG sizes small (declare an audio memory and voice budget), at most 8 simultaneous voices, effects mostly short and layered, engine as a pitched loop, phone vibration as a separate channel.
The art direction is the fusion (Rust and Ink, Soot Pulp, Hot Ink; wasteland, raw, rough): sound must match: raw, gritty, mechanical, close and dirty, not clean arcade bleeps. Inspired by the feeling of 1970s-80s road-war cinema; **no named franchise terms in prompts**, no copying of any existing score or sound.

## X2 The audition: four to five audio philosophies, one page

Produce **four to five genuinely different audio directions** and one comparison page like the Garden VR r2 page (cards, one audio player per sample, short description of each, a dark/light theme, mobile-friendly), at `deathride/audio/audition/index.html`. Each direction is a philosophy, not a skin, and has the **same proof kit** so the comparison is fair:
- **Music**: one race loop (about 20 s) per direction at its main intensity, plus (if the budget allows) a lobby or menu idea.
- **Effects** (about 6 per direction, 1-2 s): engine (low rev), a gun burst (Rivet), a mine blast, a car-to-car crunch, a pickup, a menu/UI confirm.
- **Voice**: one announcer or rival taunt line (3 candidate voices tried across the page, chosen from the account's voices that fit a gravelly or menacing read), about 100-150 characters each.
Suggested directions, rename and replace freely but keep them distinct:
1. **Dust and drums**: sparse, wasteland, big war drums and tape-echo guitar, mechanical foley, dry and wide.
2. **Diesel brutalism**: heavy industrial percussion, metal on metal, engine-forward, distorted bass drones, minimal melody.
3. **Grindhouse funk**: gritty bass, brass stabs and wah guitar, raw drum breaks, comic energy to match Hot Ink.
4. **Soot noir**: dark, smoky, tense low strings and sub pulses, spare and cinematic (Soot Pulp).
5. **Scrapyard percussion** (optional fifth): found-object percussion, anvil and chain, junkyard orchestra.
Honest labelling on the page: each sample shows its prompt, seconds, credits spent and generation date (from the ledger sidecar), the acceptance results (loudness, peak, loop seam where relevant), and what is **not** measured (nobody has judged it in game). Generated audio is accepted only after the deterministic checks (decode, duration within tolerance, loudness and true-peak measurement with ffmpeg if installed, loop seam check for loops, silence/clipping detect); a failed sample is shown and marked, not hidden.
Run the audition within the credit cap, **stop at the page**, and write `deathride/audio/CHOICES-TEMPLATE.md` (what the owner should answer: per category, which direction or a mix, plus notes) like Garden VR's `CHOICES.md`.

## X3 After the owner's pick

`deathride/audio/OWNER-AUDIO-CHOICE.md` is the gate. The owner authorized the six-wave X3 run: bible/cue data, effects, engine triage only, campaign voice, game cue service and at most one full-song proof. Results and remaining physical Stick/adaptive-asset work are in `deathride/audio/x3/README.md`. Full paid songs are planned after the reset; the single local proof is not installed as race music.

## Rules

Original work only. The ElevenLabs key never enters the repo or the logs. One design note, one status row, one session-log entry and one commit per part. Build stays green if code is touched (`:core:test :link:test :app:assembleDebug`). Never push, never ask a question.

| Id | Wave | Status |
|---|---|---|
| X1 | Port the tool, audio brief | complete — [brief/design](DEATH-RIDE-AUDIO-BRIEF.md), guarded port, six guard tests and required build pass; zero generation spend |
| X2 | Audition page with proof kits, spend report, choices template | complete — [audition](../../deathride/audio/audition/index.html), [design/results](deathride/X2-audio-audition.md); 4 equal kits / 32 takes, failures visible, conservative charge 7,828/9,000; stopped at page |
| X3 | After the owner's pick | six authorized waves delivered; owner listening, campaign-state integration and physical Stick checks remain documented |
| X3.1 | Bible, cue data, seam repair plan | complete — [design](deathride/X3-1-audio-contract.md); 62 cue contracts, zero spend |
| X3.2 | Effects and deterministic acceptance | complete — [design](deathride/X3-2-effects.md); 34 new + 6 reused, 40 final signal passes, first failures retained; charge 3,440 |
| X3.3 | Ten-class engine triage | complete — [design](deathride/X3-3-engine-triage.md); 20 short proofs, no production picks; charge 2,000 |
| X3.4 | Announcer and Mechanic lines | complete with one held candidate — [design](deathride/X3-4-campaign-voices.md); 14 lines, 13 signal passes, seizure silence fail visible; charge 960 |
| X3.5 | Runtime cue service and build | complete — [design](deathride/X3-5-runtime.md); 144 tests and debug APK pass, native eight-voice exercise, 3.97 MB decoded clips; physical Stick unmeasured |
| X3.6 | Full-song proof/research and reset cost plan | complete — [design](deathride/X3-6-full-songs.md); one local 150 s style-01 proof, four repaired joins, zero paid music; six-track base estimate 43,200 after reset |
| Review format | Shared owner review across X2 and X3 | complete — [design](deathride/AUDIO-REVIEW-FORMAT.md), [index](../../deathride/audio/index.html); 109 sample judgements, 50 category choices, persistent notes and Markdown export; 287 browser media starts, 40 responsive/theme layouts and 144-test/APK gate pass; zero audio generation/spend |
