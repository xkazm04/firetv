# X3 wave 2 — effects and acceptance

Owner board:
file:///C:/Users/kazda/kiro/firetv-deathride-audiox/deathride/audio/x3/effects/index.html

34 new guarded effects, six reused owner-direction sources, 40 candidates. Engine,
Rivet and Mine retain the 02 generation provenance; pickup retains 01; confirm
retains 04. The old 02 crunch and one new heavy-metal retry both remain on the board.
The retry is the provisional game cue, **not an owner winner**. New material covers
tyre/skid/drift, concrete wall and loose barrier, Hammer launch/hit, mine drop/arm,
Rivet hit, Scatter, ammo/repair pickup, wreck, countdown/start/lap, nonmelodic
victory/defeat percussion stings, menus and all ten signature tells.

All 40 final edited candidates pass decode, declared edited duration, loudness,
true peak, silence and clipping screens; four repeat-intent edits also pass the
unchanged seam thresholds. They are mono 22,050 Hz PCM16; exact decoded loop frames
are in acceptance and manifest. 39 unique installed cues consume 1,408,202 decoded
bytes. Position reuses lap, low-health/empty reuse denied, ability-ready reuses
confirm; these four aliases are declared in data and create no extra cache assets.

## Local repair and limits

First pass: 32/40 passed, with eight failures retained in `first-pass/` and reachable
on the page. Whole-file DC subtraction on one-shots can raise an otherwise silent
tail, so it is reserved for steady loops. Edge trimming preserves 10 ms margins;
measured trailing silence may remove <=25 ms codec residue beyond a >=100 ms gap.
This fixed edit policy preserves interior speech pauses. Short mechanical clicks
use a disclosed 400 ms padded loudness measurement, never padded playback.

Three peaky clicks needed additional bounded crest compression. Tanh saturation is
recorded, may alter timbre and cannot recover source clipping. Two movement loops
needed a better decoded start point after the 125 ms overlap: minimum derivative,
50 ms RMS/spectral mismatch over 48 interior candidates. Rotation changes the
decoder boundary; the actual overlapped transition remains inside each repeat
preview for listening. It does not prove no audible pulse or blur. Originals, first
edits, final edits, recipes and hashes remain separate; no threshold was relaxed.

Rivet's chosen burst is trimmed to its first 180 ms for the game's 200 ms cadence.
No source is described as unclipped merely because a derivative is under the peak
ceiling. No model, agent or owner listening verdict is invented. Device masking,
latency, fatigue and material accuracy are still unmeasured.

## Spend and verification

Dry-run 3,440 credits. One X3 session: 3,440/9,000 conservative charge, 399 credits
confirmed by response headers. Before 24,672; immediate after 24,293 at
2026-10-02T21:39:54Z. The 379 shared-account decrease is not an invoice; billing
lags and Garden VR can spend concurrently. No error/retry or unresolved reservation.
Reserve 8,000; reset 2026-10-04T19:31:41Z. Local edits spend zero.

Eight existing guarded CLI tests and four adversarial meter fixtures pass. Chrome
checks all 124 players, eight responsive/theme layouts, single playback, stop,
filter, persistent theme/notes and notes export. Hash/provenance/budget audit passes;
in-memory key scan found no credential in deliverables. No gameplay code changed;
required build gate is wave 5. One commit for wave 2, never pushed.
