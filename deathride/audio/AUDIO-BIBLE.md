# Death Ride audio bible — X3

The owner choice in `OWNER-AUDIO-CHOICE.md` is authoritative. Raw, gritty, mechanical,
close, dry, readable: dirt is timbre, never digital clipping. Original prompts and
dialogue only. Race styles are 01 Dust and drums, 02 Diesel brutalism, 03 Grindhouse
funk. No style 04 race score. Engine/Rivet/Mine use 02, pickup 01, UI confirm 04.
Car crunch has **no winner**: keep the 02 original beside one new heavy-metal take.
Announcer is Callum's noir read; the helpful, nervous shop Mechanic is Harry.

The machine-readable runtime authority is `../assets/audio/cues.json`. A cue's
empty path or nonaccepted signal falls back to silence. Silence never suppresses
captions, visual tells or phone haptics. No provider, credential or generation code
is part of the game. Audition files stay outside installed assets.

## Mix and allocation

Eight simultaneous voices **total**, including tails, music and muted playback.
Typical allocation: one music, two engines, one movement, one voice/alert, three
transients. Group limits do not grant extra voices. A higher-priority request can
steal the oldest lowest-priority voice; equal/lower-priority overflow drops. A new
critical tell can replace the previous critical tell. No stale gunfire queue.
Record active/high-water/suppressed/stolen counts. Critical=3, combat/alerts/voice=2,
UI/pickup=1, engine/movement/music=0. Stop a voice before reusing its slot.

Buses: master, music, engines, effects, voice, UI. Narration ducks music by 6 dB
and engines by 3 dB, attack 60 ms/release 350 ms. Music yields to gameplay cues.
Master mute stops playback; bus mute also stops its voices. Zero-gain sounds must
not accumulate. UI/narration/pickups are centred. World cues use camera-relative
stereo gain/pan, near 4 m, far 45 m, silent beyond 60 m. This is stereo positioning,
not HRTF. Engine pitch .75–1.5 with 100 ms slew reflects speed/load, not measured RPM.
Local seats get two engine slots; distant cars virtualise. One tyre/skid/drift voice.

Cooldowns are per cue and emitter: contacts/weapons 50 ms, movement starts 150 ms,
pickups/UI 300 ms (focus 150), alerts/voice 500 ms. Simulation activation/event IDs
deduplicate transients; rendering cannot replay lingering traces. Contact identity
includes material. Ability windups are protected onsets; no sustained extra layer.
Scene change, pause, wreck and skip stop the corresponding playback immediately.

## Memory and files

Target Fire TV Stick 4K: audio <=12 MiB resident, within the existing process budget;
<=6 MiB decoded effects/voices, <=4 MiB decoder allowance, 2 MiB state/headroom.
Installed audio <=24 MiB. Account from decoded frames × channels × 2, never MP3 size.
Short assets mono 22,050 Hz PCM16 WAV for exact decoded duration and loop boundaries;
music stereo OGG streaming. Short voice lines may be decoded within the same 6 MiB
cache; eviction must never dispose a playing Sound. Maximum one music stream in X3;
two-stream transitions require a future measured grid and shared allocation first.
Actual native buffers/PSS, speaker masking and latency require a physical Stick run.
Host estimates/tests are not device acceptance.

## Loop contract and honest repair

X2: all four music seams fail; all engines decode to 2.25 s against a 2 s request.
Diesel engine additionally has a 5.91 dB boundary RMS step. No X2 loop is accepted.
Preserve original bytes, hashes, measurements and generated provenance.

Engine repair: select a steady interior, remove DC, trim the provider overrun, fold
a short overlap with complementary fades, rotate the join into the body, and publish
the **new** decoded sample rate/frame boundaries. Crossfade can soften a motor pulse;
show original and edited three-cycle previews and leave repeated listening pending.
Never fade both ends to zero and call a silent dip seamless. One-shots may trim
leading/trailing silence with a small protective margin; each edit has its own
duration window and hash. Source clipping remains a source defect after normalization.

Measure after the final encoding: decode, duration, integrated LUFS, oversampled
true peak <=-1 dBTP, silence and full-scale clipping. Targets: SFX -20 ±2 LUFS,
voice -18 ±1, music -14 ±1; mastering headroom -2 dBTP. Silence threshold -50 dBFS
for >=100 ms, <=35% effects/music or <=45% voice; looping interior gaps <=250 ms.
Loop screen: jump <=.02 full scale, 50 ms RMS step <=3 dB, spectral cosine >=.80.
Short clips below 400 ms use an explicitly labelled 400 ms zero-padded meter window
because integrated loudness has no valid gate on a shorter window. Duration still
uses the unpadded delivered PCM. Every fail remains visible on the owner board.
Human timbre, semantic accuracy, voice identity/delivery and fatigue are separate,
unmeasured gates; a meter pass does not invent an owner choice.

## Songs and future adaptation

Compose 120–180 second songs with intro, verse, peak, break, outro; a full song is
not a loop. Play once, then select another song after the outro. Do not promote X2's
20-second candidates into songs by simple repetition. Longer provider takes and
composition-plan sections are research routes; local authored arrangement is a
zero-credit proof route. At most one proof song this run; full set waits until
2026-10-04 19:31 UTC (provider exact reset 19:31:41).

Four future intensity states remain Rolling/Hunt/Contact/Redline. The X1 declared
pressure mapping, hysteresis and 4/8-bar dwell is retained as a design contract in
`docs/concepts/DEATH-RIDE-AUDIO-BRIEF.md`; no gridless asset is represented as a
quantised tier. X3 full-song playback is linear, authored section intensity. Adaptive
assets/scheduling stay explicitly unavailable until measured tempo/downbeat/key,
allowed transitions and all-state trace evidence exist. Phone vibration stays in
its existing link/controller channel, independent of every audio setting.

## Credit contract

One session `x3-2026-10-02`, cap 9,000, reserve 8,000. Live starting balance 24,672.
Dry-run every intended call, check credits before/after each wave and before every
POST. Retain conservative tool charges; account decrease can include Garden VR or
delayed billing. Unknown requests stop the session, never auto-retry. The credential
is read in memory at run time from Garden VR's `.env`; never copied or logged.
