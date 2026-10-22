# Open Source mini-challenge

The fields of the Open Source mini-challenge form.

| Field | Value |
|---|---|
| Repository URL | https://github.com/xkazm04/firetv |
| GitHub username | xkazm04 |
| Contribution URL | https://github.com/xkazm04/firetv-key-bridge |
| Standalone key-bridge repository | https://github.com/xkazm04/firetv-key-bridge |

## What

`firetv` is the whole source of Study Desk, a homework desk on the Fire TV that the TV leads and a phone
assists ([description.md](description.md)), together with the two other products built in the same
repository: a telestrator where a phone draws on a paused video frame
([AGENTS.md](../../AGENTS.md), "What this repository is"). The parts most reusable by other Fire TV builders:

- **`stick-app/`**: a dependency-free Fire OS app that wraps a LAN web page in a fullscreen WebView and
  hands it the remote's keys (the D-pad, Select, Back, Menu, Play/Pause) as standard key events, with Back
  going to the page first and a held Back leaving the app. It finds its server on the /24 by itself and
  recovers when the server comes back (commits 17a3a854, 56e9db4e, 59e7e00a, fe4cb34b, d9bb3c9e).
- **`firetv-key-bridge`** (https://github.com/xkazm04/firetv-key-bridge): a public, MIT-licensed, standalone
  extraction of the stick-app key bridge, with 24 unit tests. It has not been tested on the device yet; the
  on-device claims in this repository are about `stick-app/`, not about the extraction.
- **`tools/stick-perf/`**: a probe that scores a web page's transitions on the stick from a DevTools
  trace, frame by frame in a window after each key (commit f8ba80f6;
  [STICK-PERFORMANCE-2026-10-20.md](../concepts/STICK-PERFORMANCE-2026-10-20.md)).
- **`tools/stick-walk/`**: the scripted walk of the TV with remote key events and screencaps (commit e4176983).
- **`core/`**: the telestrator's pure-JVM annotation, pen and protocol engine, with no Android imports
  ([AGENTS.md](../../AGENTS.md), "Constraints").

## How

- The key bridge maps each Android key code to the name a web page already handles, dispatches a `keydown`
  and `keyup`, and reads `defaultPrevented` back; the mapping and the address rules are plain JVM code with
  JUnit tests (`stick-app/src/test/kotlin/dev/studydesk/stick/KeyBridgeTest.kt`, `DeskTest.kt`).
- The desk keeps its decisions in code and its models behind one provider seam, so its 100 rules suites
  (`npm run test:rules`, 2,583 tests) run with no live model call ([AGENTS.md](../../AGENTS.md), "Commands" and "Constraints").
- Every on-device claim is recorded with its method and captures in `docs/concepts/STICK-*.md`.

## Why

Silk passes only Play/Pause to a web page, so a web-first TV app cannot be driven by the remote in the
browser ([friction-log.md](friction-log.md), FL-1). The wrapper and the measuring tools are what it took
to make one work on a real stick, and they apply to any web app on Fire TV, not only to this one. The
friction log and the feature requests are written so the next builder does not have to rediscover them.

## Before submitting

- Licence: the repository has an MIT `LICENSE`, and GitHub detects it (`gh api repos/xkazm04/firetv/license`
  returned `MIT` on 2026-10-22).
