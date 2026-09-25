# Fire TV Telestrator — feasibility PoC

A vertical slice of the [design doc](../../Downloads/firetv-telestrator-design-doc.md), built to answer one
question before committing to the full scope: **can the whole toolchain run on this Windows machine,
and can we get a hands-off development cycle that ends in a real UI test?**

Answer: yes. See [docs/POC-FINDINGS.md](docs/POC-FINDINGS.md) for the numbers and the caveats.

## What is actually working

```
Chrome (real touch events)          Android TV emulator, API 34, leanback
┌──────────────────────────┐        ┌─────────────────────────────────────┐
│ companion PWA            │  ws:// │ Ktor CIO server inside the APK      │
│  pen surface, tools,     │───────▶│ PenEngine (shared JVM core)         │
│  transport, local echo   │◀───────│ Media3/ExoPlayer + Compose overlay  │
└──────────────────────────┘  state │ QR pairing card, D-pad handling     │
         served by the TV           └─────────────────────────────────────┘
                                                   │ adb screencap
                                                   ▼
                                        pixel assertions in CI
```

- Phone draws → stroke appears over the video on the TV, anchored to the paused frame.
- Seek away → the drawing leaves with its frame. Seek back → it returns.
- **Tools:** freehand (smoothed, pressure-varying width), arrow, circle, spotlight, name tag,
  eraser — five colours, and a Pin toggle for drawings that should outlive the hold window.
- **Undo / redo** as an operation log, so undoing an erase restores the annotation *in place*.
- **Edits you can see:** like the eraser, no edit changes ink off screen. Clear cleans the frame on
  screen (Clear all is its own button, and the remote's Down still clears the clip). An undo or redo
  whose ink is on another frame names it on the phone ("Undo · 5.0s"); the first press takes the TV
  there, paused, and the next press acts.
- **Transport from the phone:** play/pause, single-frame step, 0.25×/0.5× slow motion, scrub.
- **Review mode:** the scrub bar carries a tick for every drawn moment, and previous/next drawing
  land the TV paused on the exact frame the ink is anchored to, so a walk-through is a row of taps.
- **The phone can see what it is drawing on:** the paused frame arrives as a JPEG thumbnail, and
  the TV mirrors its annotation document back so the eraser is aimed rather than guessed.
- **Two transports behind one interface:** the TV either *listens* (LAN, lowest latency, serves the
  phone page itself so `ws://` is same-origin) or *dials out* to a relay. Both are exercised by
  tests. The second exists because a platform may not let an app listen at all — see
  [docs/PLATFORM-RISK.md](docs/PLATFORM-RISK.md).
- Pairing QR + rotating PIN; a phone with the wrong PIN is refused.
- Fire TV remote keys drive playback, undo and clear.

## Layout

| Path | What |
|---|---|
| `core/` | Pure JVM: annotation schema + codec, timeline, letterbox mapping, pen engine, Catmull-Rom smoothing, hit-testing, undo history, wire protocol, pen conversation, transport plan. No Android imports — 79 unit tests run in seconds with no device. |
| `tv-app/` | Android app: Media3 player, Compose overlay, embedded Ktor server, QR pairing, D-pad input. |
| `companion/` | The phone PWA. Single file, copied into the APK's assets at build time so there is one source of truth. |
| `tools/` | `live-ui-test.mjs` (Playwright → real PWA → real TV → pixel assertions, 28 checks), `relay-test.mjs` + `relay-stub.mjs` (the same APK with no listening socket, 11 checks), `pen-sim.mjs` (headless protocol check), `latency-probe.mjs`. |
| `scripts/dev.ps1` | The whole cycle in one command. |
| `fixtures/` | Reserved for clips; the PoC generates its own synthetic clip with ffmpeg (no copyright exposure). |
| `vision/` | Local vision-model client and the mark-as-pointer technique. Two files, domain-neutral — see the lessons doc. |

## Running it

One-time setup is already done on this machine (see the findings doc for exact versions and the
AVD definition). After that:

```powershell
./scripts/dev.ps1                    # unit → build → boot emulator → deploy → live UI test
./scripts/dev.ps1 -Stage unit        # ~6 s, no device needed
./scripts/dev.ps1 -Stage live        # re-run just the live UI test
./scripts/dev.ps1 -Headless:$false   # watch the emulator while it runs
```

Extra probes, once the app is deployed and `adb forward tcp:8765 tcp:8765` is in place:

```powershell
cd tools
node pen-sim.mjs                     # headless phone, protocol only
node latency-probe.mjs --seconds 6   # pen round-trip under 60 Hz load
node latency-probe.mjs --idle        # same socket, no pen traffic (baseline)
node relay-test.mjs                  # relaunches the app with no listening socket
```

`relay-test.mjs` starts a local relay stub, restarts the app with `--es transport relay`, checks
that nothing answers on the LAN port any more, and drives the whole thing through the relay. It
puts the app back on the LAN transport when it finishes.

Screenshots and a JSON result file land in `artifacts/`.

## What this PoC deliberately does not cover

Everything in the design doc's P1 and P2 tiers: the AWS tracking pipeline, name-tag *snapping* to
tracked players, Bedrock, voice.

## Where the product is going

The sports-analytics direction was investigated and **closed** — a local vision model turned out to
be a good describer and a poor measurer, and the advanced graphics on real broadcasts are driven by
sensors in the venue rather than by anything visible in the picture. What came out of that work is
a set of transferable techniques for asking a model about a paused frame, kept in `vision/` and
written up in the lessons doc. The next use case is being shaped separately.

- [docs/POC-FINDINGS.md](docs/POC-FINDINGS.md) — what the toolchain proved, what it did not, and
  the latency finding that came out of it.
- [docs/PLATFORM-RISK.md](docs/PLATFORM-RISK.md) — Fire OS vs Vega OS, which Stick to buy, and why
  the transport should sit behind an interface.
- [docs/FRAME-ANALYSIS-LESSONS.md](docs/FRAME-ANALYSIS-LESSONS.md) — what a local vision model can
  and cannot be asked about a paused frame, measured. Domain-neutral.
- [docs/USE-CASE-OPTIONS.md](docs/USE-CASE-OPTIONS.md) — candidate directions, scored on user pull,
  reuse and measured risk.
