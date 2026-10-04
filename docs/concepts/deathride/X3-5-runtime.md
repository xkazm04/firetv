# X3 wave 5 — game cue service

`game/.../audio/CueManifest.kt` parses the installed data; `CueService` is the single
allocator for every Sound/Music instance. `GdxAudioBackend` owns native resources
and a bounded decoded cache. No provider code or key ships. Missing files, invalid
manifest, failed-screen assets and unavailable native playback degrade to silence.
The one failed voice still has a caption. Silent fallback never affects controls,
simulation, captions or phone vibration.

## Runtime behavior

- Eight total voices including real Music streams, active tails and muted voices;
  group caps and per-cue/emitter cooldowns come from the manifest. Higher priority
  steals oldest lowest priority; same-priority critical onsets replace their old
  critical slot. Overflow is dropped immediately, never queued as stale gunfire.
- Buses master/music/engines/effects/voice/UI, narration ducking (-6 dB music,
  -3 dB engines; 60 ms attack / 350 ms release), camera-relative stereo distance
  and pan, speed-based .75–1.5 engine pitch with 100 ms smoothing. Engine slots
  favour the two local drivers; spectator hears one car. Tyre/skid/drift share one
  slot; untouched loops retire after 300 ms.
- `PresentationEvents` is a preallocated 128-slot observational ring. Successful
  fire/hit, mine arm/blast, pickup, wreck, signature windup and one contact per
  pair/material per fixed step are emitted by the actual state transition. Event
  serials survive world resets, stale events drop, simulation hashes exclude them.
  `BoundaryMaterial` supplies both the rendered steel/concrete asset and sound.
- `RaceAudioDirector` consumes events once, handles countdown only after scenery
  readiness, start, lap, debounced position, HP hysteresis, empty/ready, local
  outcomes and scene exits. A spectator is never labelled defeated. Pause, skip,
  scene changes and dispose stop/release playback. M/Y toggles saved master mute;
  N/X skips narration. Captions stay visible while muted or missing.
- Garage welcome, successful repair and compatible debt/boss briefings use the
  new voices. New ally/seizure/death-duel/finale narrative cues remain prepared
  until the campaign supplies those states. The existing lap duel cannot emit
  “No laps”. No campaign mechanics or phone vibration policy was changed.

The accepted effect/voice cache totals 3,970,682 decoded PCM16 bytes, under 6 MiB;
the manifest reserves <=12 MiB audio resident (4 MiB decoder allowance plus 2 MiB
headroom). Actual device buffers and PSS are **not measured**. Android SoundPool is
also configured for eight sounds; the service additionally includes Music in its
shared limit. Current full songs/adaptive assets remain absent and silent. The
stream path is implemented, with one linear stream and no hidden stems or claimed
bar-accurate scheduler. X1 adaptive tiers remain a future measured-asset contract.

## Evidence

The final required `:core:test :link:test :game:test :app:assembleDebug` passed:
124 core, three link and 17 game tests, zero failures or skips. Build log and APK
hash/content verification are in `deathride/audio/x3/runtime/build.log` and
`validation.json`. The APK contains all 52 installed clips with matching hashes
and no audition assets. New tests cover
allocator overflow/stealing (including streams), cooldown/identity suppression,
ducking/release, duration at changed pitch, spatial cutoff, stale loops,
mute/pause/skip/caption fallback, missing media, cache eviction refusing playing
resources, cue hashes/installed budget, countdown readiness and spectator outcomes.
Core tests cover ring overflow/reset, successful action edges, concrete/metal
contacts and unchanged simulation hashes with observation enabled.

Native OpenAL desktop check passed with a real Music decoder plus seven Sounds
at the eight-voice maximum, one steal, zero missing playable files, 3,970,682 cache
bytes, and pause/mute/skip/disposal. A 15-second hidden full-game run reached a
six-car race: 53 plays, voice high-water 7, two steals. Its one missing request is
the intentionally absent race music. These are actual host playback exercises,
not human listening, physical Stick acceptance or a device performance comparison.
`adb devices` returned no attached device; nothing was installed.

No generation spend: conservative run total remains 6,400/9,000. One commit for
wave 5 after the final gate; no push.
