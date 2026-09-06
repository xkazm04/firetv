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
- **Transport from the phone:** play/pause, single-frame step, 0.25×/0.5× slow motion, scrub.
- **The phone can see what it is drawing on:** the paused frame arrives as a JPEG thumbnail, and
  the TV mirrors its annotation document back so the eraser is aimed rather than guessed.
- The TV serves the phone page itself, so `ws://` is same-origin (no mixed-content problem).
- Pairing QR + rotating PIN; a phone with the wrong PIN is refused.
- Fire TV remote keys drive playback, undo and clear.

## Layout

| Path | What |
|---|---|
| `core/` | Pure JVM: annotation schema + codec, timeline, letterbox mapping, pen engine, Catmull-Rom smoothing, hit-testing, undo history, wire protocol. No Android imports — 46 unit tests run in seconds with no device. |
| `tv-app/` | Android app: Media3 player, Compose overlay, embedded Ktor server, QR pairing, D-pad input. |
| `companion/` | The phone PWA. Single file, copied into the APK's assets at build time so there is one source of truth. |
| `tools/` | `live-ui-test.mjs` (Playwright → real PWA → real TV → pixel assertions, 27 checks), `pen-sim.mjs` (headless protocol check), `latency-probe.mjs`. |
| `scripts/dev.ps1` | The whole cycle in one command. |
| `fixtures/` | Reserved for clips; the PoC generates its own synthetic clip with ffmpeg (no copyright exposure). |

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
```

Screenshots and a JSON result file land in `artifacts/`.

## What this PoC deliberately does not cover

Everything in the design doc's P1 and P2 tiers: the AWS tracking pipeline, name-tag *snapping* to
tracked players, Bedrock, voice. It also has not run on real Fire TV hardware.

- [docs/POC-FINDINGS.md](docs/POC-FINDINGS.md) — what the toolchain proved, what it did not, and
  the latency finding that came out of it.
- [docs/PLATFORM-RISK.md](docs/PLATFORM-RISK.md) — Fire OS vs Vega OS, which Stick to buy, and why
  the transport should sit behind an interface.
