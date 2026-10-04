# Guarded audition tooling

Run from `deathride/`, Node 22+. Port source: read-only Garden VR `tools/audio/elevenlabs.mjs`, consulted 2026-10-02.

```powershell
node tools/audio/elevenlabs.mjs credits
node tools/audio/elevenlabs.mjs voices --filter gravelly
node tools/audio/elevenlabs.mjs music --prompt "Original instrumental race loop" --seconds 20 --out audio/audition/example.mp3 --session x2-2026-10-02 --session-cap 9000 --dry-run
node --test tools/audio/elevenlabs.test.mjs
```

`--dry-run` is offline: no key load, API request, output or ledger write. Remove it only for an authorized generation. Commands `sfx`, `music`, `tts` require `--session` and `--session-cap` (maximum 9000). The reserve is `DEATHRIDE_AUDIO_RESERVE`, default and minimum 8000. SFX accepts `--loop` for v2 engine beds. Music is instrumental. TTS is pinned to `eleven_multilingual_v2`; `--stability`, `--similarity`, `--style` are explicit controls.

The key is read in memory from `ELEVENLABS_API_KEY` or `C:/Users/kazda/kiro/garden-vr/.env`. Do not source, echo, copy or log that file. Only this repo's ledger and sidecars are written. No account mutation occurs in `credits` or `voices`.

The persisted session cap/reserve cannot change across invocations. An exclusive local generation lock serializes calls. A pending ledger reservation is flushed before POST; there is no automatic POST retry, including after HTTP errors. Unknown billing blocks the session. Do not delete the ledger, change the session ID or clear an interrupted lock to evade a refusal. Reconcile an interruption against provider history and the saved bytes before a future authorized run. This audition uses exactly one session.

Budget charge per completed request is `max(estimate, provider character-cost)` when the numeric response header exists, otherwise `max(estimate, observed account decrease)`. SFX estimates use max(100, 40/second), music 60/second, speech 1/character. The ledger's pending and completion records share an ID and count once. Account deltas may include another project's use or omit delayed billing; they are not exact provider invoices. A local lock cannot lock Garden VR's separate tool or a provider price change. A fresh account check precedes every call; an unexpected cost/reserve breach stops immediately. Reset changes also stop the session. These limitations are disclosed rather than claiming distributed atomic credit reservation.

Provider errors omit response bodies and headers; only a restricted machine error code may be recorded. Success sidecars record timestamp, prompt/request body, model where explicitly pinned, duration intent, byte hash, account tier, estimate, balance delta, numeric character-cost when present and budget charge. X2 music used the unpinned provider default; music cost was not returned in a character-cost header during X2. X3.6 pins future music requests to `music_v1` so a changing API default cannot silently change the plan schema.

X2 found the SFX prompt limit of 450 characters and now refuses longer prompts locally. The first overlong request returned HTTP 400; read-only provider analytics confirmed its rejection. `reconcile-rejected.mjs` records that one specific attempt as `abandoned-reserved`, retaining its **full 100-credit charge** with no claim of zero billing. It is not a general retry/refund command. The corrected brief was dry-run again. Unknown transport/billing failures still block automatically.

Reproduce the offline page from the committed inputs (no generation):

```powershell
python tools/audio/test-measure.py
python tools/audio/build-audition.py
node tools/audio/check-audition.mjs
```

Measurement requires ffmpeg/ffprobe and NumPy; browser verification uses Python Playwright and installed Chrome. Measurements keep every original and all failures. Comparison copies use two-pass normalization, with dynamic limiting disclosed; repeat previews contain three unchanged decoded cycles. `run-audition.mjs` defaults to an offline plan/dry-run and accepts `--credits-final` for a read-only balance snapshot. `--generate` is the spending action; **the X2 run is finished, so do not invoke it as part of offline reproduction**.

## Owner review format (X2 and X3)

From `deathride/`, rebuild all five reports and their combined index using existing
evidence only. These builders do not render, measure, normalize or generate audio:

```powershell
python tools/audio/build-audition.py
python tools/audio/build-x3-page.py effects
python tools/audio/build-x3-page.py engines
python tools/audio/build-x3-page.py voices
python tools/audio/build-x3-music-page.py
python tools/audio/build-review-index.py
python tools/audio/check-review.py
```

The browser runner uses Python Playwright and installed Chrome. The existing Node
check commands forward to that runner; an optional report name (`x2`, `effects`,
`engines`, `voices`, `music`) limits the check. Evidence goes to
`audio/review-evidence/`; test decisions use disposable browser contexts.

`report_format.py` supplies the shared controls/export shell; `audio/report.js`
binds `article.card` metadata to per-sample Keep/Maybe/Reject and notes, plus
independent category winners. Each report has its own `deathride.audio.*` storage
key. Earlier local notes are imported without inferred picks. Copy Markdown fills
a visible textarea even when the clipboard is unavailable, ready to paste into
`audio/OWNER-AUDIO-CHOICE.md`. It never modifies that gate automatically. Shared
`report.css` handles System/Light/Dark themes and mobile layout. Playback-only
attenuation targets −26 LUFS with a −3 dBTP ceiling; it never boosts quiet files.

API references checked 2026-10-02: [SFX request, loop and credit header](https://elevenlabs.io/docs/api-reference/text-to-sound-effects/convert), [SFX prompt limit](https://help.elevenlabs.io/hc/en-us/articles/25735182995985-What-is-Sound-Effects), [request analytics](https://elevenlabs.io/docs/api-reference/analytics/workspace/requests). The conservative music estimate comes from the authorized plan and Garden VR tool; headers, balances and unresolved attribution are all reported separately.

## X3 reproduction and future structured music

X3 generation is finished. `run-x3.mjs --wave effects|engines|voices` defaults to
offline estimates; **do not use `--generate` to reproduce the pages**. Original
takes, edited clips and first-pass failures are committed. `build-x3-page.py`
accepts each wave name; `check-x3-page.mjs` verifies its native players and controls.
`audit-x3.py` validates hashes, budget, all current/first-pass screens and leaks.

Music now also accepts `--composition-plan FILE`, mutually exclusive with
`--prompt` and `--seconds`. This is an instrumental **v1** plan only: global style
lists and named sections with local style lists, integer duration_ms and empty
lines. Each section is at least three seconds; the sum must be <=180 seconds.
The request pins the model and section-duration enforcement. It omits the
prompt-only force_instrumental/music_length_ms fields; unwanted vocals must still
be screened. Estimates use the section sum and the same 60 credits/second guard.

`node tools/audio/plan-x3-tracks.mjs` writes six offline future-session dry runs.
It never sends paid requests. The [music research](../../audio/x3/music/RESEARCH.md)
contains post-reset timing, aggregate/reserve limits and model-version caveats.
The local 150-second proof is reproducible with `compose-x3-proof.py` and
`build-x3-music-page.py`; it spends zero credits. This proves a local arrangement
method, not new provider long-form quality. Runtime verification is recorded by
`python tools/audio/validate-runtime.py --build` (requires Windows and the repo's
Java/Android SDK setup). No physical device acceptance is implied.
