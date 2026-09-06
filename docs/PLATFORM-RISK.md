# Platform risk: Fire OS vs Vega OS

**Researched:** 2026-09-06, prompted by [pocket-lint, "The end of Android Fire Sticks is near"](https://www.pocket-lint.com/the-end-of-android-fire-sticks-is-near-still-hope-for-one-device/) (2026-09-03).

**Short answer: not a dead end, but a shrinking lane. Build on Fire OS for the hackathon; do not
let the transport decision become load-bearing.**

---

## What is actually confirmed

| Claim | Source | Date |
|---|---|---|
| "Starting with Fire TV Stick 4K Select, all future Fire TV **Sticks** will run on Vega" | Amazon developer site | Oct 2025 |
| "We're a multi-OS company, and Fire OS isn't going anywhere" | Amazon spokesperson, via Android Authority | Nov 2025 |
| Fire TV Stick 4K Select and the 2026 Fire TV Stick HD ship **Vega OS** | AFTVnews, 9to5Google | Apr 2026 |
| Fire TV Stick 4K Plus and 4K Max still ship **Fire OS 8** (Android-based) | device specs | 2026 |
| Android 16 is still coming to Fire TV | 9to5Google | May 2026 |
| Vega has **no sideloading** and no Downloader app; dev-mode install only via CLI credentials | Amazon Vega docs | 2026 |
| Vega SDK is public beta, open to all — no allowlist | Amazon developer blog | Sep 2025 |
| The hackathon accepts **either** Fire OS or Vega submissions | Devpost listing | live |

## What is speculation

The pocket-lint framing. Amazon's "all future Fire TV Sticks" statement is scoped to the **Stick**
line only; it says nothing about the Fire TV Cube or the Fire OS smart TVs, and pocket-lint's
"few short weeks" timeline is the author's extrapolation from Amazon's silence about the Cube,
not a quote. Amazon has, if anything, gone out of its way to say the opposite about Fire OS as a
whole.

## What nobody could confirm — and one of them matters a lot

- **No stated cutoff for new Android/Fire OS app submissions to the Amazon Appstore.** No source
  sets a date.
- ⚠️ **Whether a Vega app can open a listening TCP/WebSocket server socket.** Amazon's public docs
  cover outbound connectivity (`expo-network`) and a debugging transport, and are silent on
  app-level server sockets. Given Vega's posture — no sideloading, Appstore-only distribution,
  sandboxed TurboModules — treat this as *unavailable until proven otherwise*.
- No documented frame-accurate seek or slow-motion API on Vega beyond W3C `currentTime` /
  `playbackRate` over its GStreamer-backed media element. No Media3/ExoPlayer equivalent.

## Why the third one matters to this project

Decision **D3** puts a WebSocket server *inside the TV app* and has the phone connect to it. That
is the single most load-bearing assumption in the architecture, and it is exactly the capability
Vega does not document. The design doc's Appendix A already guessed this ("Vega apps may not be
able to listen on a port — the relay path becomes primary"); the research raises it from a hunch
to the most likely blocker in a future port.

What survives a Vega port unchanged, and it is most of the code:

| Layer | Ports? | Why |
|---|---|---|
| `core/` — schema, codec, timeline, pen engine, smoothing, hit-test, history | ✅ | No Android imports at all. Kotlin/JVM today, and the same logic is a direct port to TS if the Vega shell is React Native. |
| `companion/` — the phone PWA | ✅ | Plain web. Only its transport target changes. |
| Annotation and tracking JSON schemas | ✅ | Wire formats, not platform APIs. |
| Overlay rendering | ⚠️ | Compose Canvas → `react-native-svg`, which Vega does ship. Rewrite, but a mechanical one. |
| Media3 player control | ⚠️ | Frame stepping would have to be rebuilt on `currentTime`; precision unproven. |
| **Embedded LAN server (D3)** | ❌ | Likely impossible. The relay path becomes mandatory — and now exists. |

## Decisions this changes

1. **Keep building on Fire OS.** The hackathon accepts it, the deadline is Oct 23 2026, and the
   runway on 4K Plus/Max class hardware is at least 12 months. Nothing here justifies restarting.
2. **Buy a Fire TV Stick 4K Plus or 4K Max — not the 4K Select or the new HD.** The Select and the
   2026 HD are Vega and will not run an APK at all. Amazon does not print the OS on the box, so
   match the model name on the retail listing before ordering; the lineup gets refreshed each
   autumn, so re-check the current names at purchase time rather than trusting this table.
3. ~~Put the transport behind an interface now~~ — **done, 2026-09-06.** `PenTransport` has two
   implementations: `LanTransport` listens, `RelayTransport` dials out. Everything that carries
   meaning — pairing, dispatch, the state and document heartbeat — moved into `PenSessionHost`,
   which knows nothing about how a pen arrived. `tools/relay-test.mjs` runs the same APK with
   `--es transport relay` and proves the app works with **nothing listening on the device**: it
   asserts the LAN port stops answering, then drives a stroke onto the TV through a relay. The
   relay was already on the roadmap as a hostile-Wi-Fi fallback (D3); it is now a portability
   hedge as well.
4. **Do not build anything else that depends on the TV being a server.** Discovery, multi-pen and
   the watch-party experiment should all be expressible over a relay.

## What the relay work does and does not prove

It proves the *shape* works: an outbound-only TV, a phone that meets it at a third party, and a
relay dumb enough that it never learns the PIN or the annotation document.

It does not prove the latency. The stub runs on the same machine as the test, so its round-trip
(p50 ~5 ms) measures protocol overhead and nothing else — it reads *faster* than the LAN path only
because the LAN probe goes through an adb tunnel. A hosted relay adds two internet legs to
whichever region it lives in. Budget the design doc's +100–200 ms, expect shapes and tags to be
fine and freehand to be marginal, and re-measure against a deployed relay before believing any of
it.

## What is not decided

Whether to actually do a Vega port. That is a post-hackathon question and depends on whether
Amazon documents server sockets, and on where the Cube and the smart TVs land. The point of the
hedge is that the answer can be deferred cheaply.
