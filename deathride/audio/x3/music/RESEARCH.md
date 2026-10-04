# Full songs after X3

Research checked 2026-10-02 UTC. One local original proof, zero paid music calls.
Review:
file:///C:/Users/kazda/kiro/firetv-deathride-audiox/deathride/audio/x3/music/index.html

## What is proved

`Dust road, unpaid miles` is a 150-second, 60-bar score at 96 BPM. The source is
original note/event data and deterministic synthesis, not a tiled X2 recording.
Five parts change harmony, register, density and instrumentation: intro 0–20,
verse 20–60, peak 60–100, break 100–120, outro 120–150 seconds. The local renderer
creates plucked guitar-like partials/tape echoes, bass, low drums, rim and metal
percussion and a low drone. No imported samples or named artist/franchise prompts.

Each part has a 625 ms overlap, complementary sine-squared fades and preserved
note tails. The first render failed three 50 ms level-step screens (18.0, 14.0,
41.6 dB). It remains in `first-pass/`, playable with its measurements. Four newly
scored sustained transition notes with 500 ms fades repaired the same composition;
there was no second proof song, provider retry or threshold change. This is an
auditable local arrangement method, not evidence that any provider can generate
that result unaided. Exact PCM-bar uniqueness alone is not proof of musical variety:
the changing score, event densities, section energy and listening board supply
additional evidence. Human musical preference is still unmeasured.

The final FLAC and MP3 both pass decode, duration, -14 ±1 LUFS, <=-1 dBTP, silence
<=35%, zero samples >=.999 full scale and all four declared transition screens.
Master: 150.000 s, -14.16 LUFS, -1.97 dBTP; largest join jump .00964, level step
4.623 dB against .02 / 6 dB limits. Normalization is the disclosed dynamic mode
of measured two-pass ffmpeg loudnorm. The unmatched source is retained and fails
the target loudness screen. The linear song has a composed ending: an end-to-start
loop seam is not applicable. This does not waive the separate 3 dB/.8 spectrum
steady-loop contract for engine/movement clips. No music is promoted to game assets.

Reproduce from `deathride/` with `python tools/audio/compose-x3-proof.py`, then
`python tools/audio/build-x3-music-page.py`. The same seed/score produces the same
candidate; first-pass evidence is preserved. The score records renderer/source
hashes and every note. ffmpeg/numpy version differences can affect output bytes;
remeasure regenerated output. Full native decoding is measured offline; browser
tests exercise media starts and five seeks, not a human 150-second listen.

## Provider paths verified in official documentation

The compose endpoint accepts either a text prompt with a duration or a composition
plan. The API reference permits lengths covering our 120–180 second target. For
v1, section-duration enforcement is an explicit option. Instrumental forcing is
prompt-only; plans instead use empty lyric lists and instrumental styles. The
guard now validates a v1 plan, derives total seconds, pins `music_v1`, and retains
all cost/reserve/ledger checks. No paid plan was sent in X3.
[Compose API](https://elevenlabs.io/docs/api-reference/music/compose).

The documented v1 plan shape contains global styles and named sections with local
styles, duration and lyric lines. The plan endpoint is documented as free, but we
authored the six plans locally and made no request to it.
[Plan API](https://elevenlabs.io/docs/api-reference/music/create-composition-plan).

The current overview describes v2/v2.5 long-form sections and improved inpainting;
it still describes v1 as the transitional API default. Its five-minute overview
limit differs from the compose reference's ten-minute ceiling; both cover our
target. No inference about this account's model access or billing is made.
[Music capabilities](https://elevenlabs.io/docs/overview/capabilities/music).

Newer models use a different chunk plan schema. Do not send these v1 plans to v2
or change a model default silently. A future migration must validate the new
schema, output format and actual billing before any generation.
[Composition plan guide](https://elevenlabs.io/docs/eleven-api/guides/how-to/music/composition-plans).

Public API pricing advertises $0.15/minute and dollar billing. This account instead
reports a 90,000 credit allowance and supplied character-cost headers for our
SFX/voice requests. Public dollars are **not** a conversion for that account.
Keep the existing conservative 60 credits/second estimate and verify billing live
after reset; do not lower the guard to fit another call.
[API pricing](https://elevenlabs.io/pricing/api).

## Method for the paid set

1. Start with one 120-second **structured single take** per style. Use the five
   named sections in `plans/`, phrase-development instructions, empty lyrics and
   original timbre descriptions. A prompt-only 120-second alternative for each
   song is stored in `cost-plan.json`; it is an alternative request, not an extra
   take. This preserves continuity better than independently generated fragments
   in our working hypothesis; provider quality is not tested by this local proof.
2. Decode the entire take. Inspect actual section timing, tempo/key consistency,
   ending, unwanted vocals and repetition by listening. Requested times and BPM
   are instructions, not measurements. Save the untouched original and sidecar.
3. Mark musical edits at observed phrase boundaries. Split into intro/verse/peak/
   break/outro, retain tails, align downbeats and adjust gain before crossfading.
   Try 0.25–1 beat complementary fades for correlated material; use equal-power
   fades only when correlation/headroom justify them. Remeasure every join and
   listen through the overlaps. Do not repair only the end/start sample while
   leaving a structural discontinuity inside the song.
4. For a defective section, first rearrange existing unique material locally.
   A replacement up to 30 s fits the 1,800-credit repair allowance; five independent
   sections totalling 120 s also estimate 7,200 before overlap/tail padding.
   Padding increases cost: e.g. 125 s total = 7,500, leaving 1,500. Do not pretend
   five unrelated clips establish coherent harmony. Inpainting may help later,
   but no unguarded inpainting/upload tool is added in this run.
5. Preserve contrast, normalize the final full timeline (-14 ±1 LUFS, <=-1 dBTP),
   test decoded duration, silence and clipping, then inspect each edit at the
   declared .02 jump / 6 dB local level thresholds. Spectral/timbre changes across
   song sections require human review rather than a steady-engine similarity gate.
   A failed automatic edit stays labelled on the board. Save a lossless master
   and measure the actual delivery encode separately. Test mono playback and
   in-game masking before promotion. A future adaptive excerpt must additionally
   satisfy the exact loop and bar-boundary contract; full songs are linear streams.

## Cost plan and reset procedure

Six songs: two each of 01 Dust and drums, 02 Diesel brutalism, 03 Grindhouse funk.
`cost-plan.json` contains six validated section files, prompt alternatives and six
actual **offline dry-run results**; `node tools/audio/plan-x3-tracks.mjs` reproduces
them. No future job or automatic spending is scheduled.

| Scope | Base at 60 credits/s | Repair allowance | Allocation | Live balance needed, including reserve |
|---|---:|---:|---:|---:|
| One 120 s song | 7,200 | 1,800 | 9,000 | 17,000 |
| First stage: one per style | 21,600 | 5,400 | 27,000 | 35,000 |
| Full six-song set | 43,200 | 10,800 | 54,000 | 62,000 |

Those minimum balances exclude Garden VR's planned use, which needs an additional
allocation by the shared-account coordinator. A repair allowance is not a full
reroll: another 120-second take would exceed that song's 9,000 session cap.
150-second single takes cost 9,000 with no repair headroom. 180-second takes cost
10,800 and are refused by the current tool cap. Prefer 120-second source songs and
authored local development to 150–180 s when musically warranted; future cap changes
require separate authorization, not a split-session workaround.

Wait until **2026-10-04 19:31:41 UTC** (provider timestamp; owner named the 19:31
minute). Run `node tools/audio/elevenlabs.mjs credits` and verify that the billing
window actually advanced. Reconcile Garden VR allocation and any unresolved
charges. Do not assume a reset restores 90,000 available. The existing X3 session
cannot cross a reset; use the named future per-track sessions only after the next
run's total allocation is established. The per-track guard does not enforce the
54,000 aggregate by itself: keep a batch ledger and stop at that aggregate too.

From `deathride/`, the first concrete reviewable request is:

```powershell
node tools/audio/elevenlabs.mjs credits
node tools/audio/elevenlabs.mjs music --composition-plan audio/x3/music/plans/01-a.json --out audio/full-tracks/01-a.mp3 --session x3-reset-01-a --session-cap 9000 --dry-run
```

Remove `--dry-run` only in the authorized post-reset run after checking its live
account and aggregate budgets. The tool checks credits immediately before and
after each serial POST, reserves before spending, never retries a possibly billed
POST, and retains unknown billing. Read the runtime key from the existing Garden
VR location only. No key, headers or raw provider body enters plans, logs or
sidecars. A local lock cannot coordinate another repository's simultaneous use:
if shared activity leaves insufficient reserve/allocation, stop the batch.

Current run: 6,400 conservative charge / 9,000 cap; 1,759 provider-header credits
confirmed, 68 generated effects/engine/voice takes. Live pre-music balance 22,913
at 22:24:13 UTC, safely above the 8,000 reserve. Music cost zero. Final snapshot
and whole-run totals are in `../spend-summary.json`. Shared balance deltas are
reported separately and are not an invoice for this project.
