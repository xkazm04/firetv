---
id: 0004
kind: decision
scope: path:core/
date: 2026-10-05
supersedes: null
refs: [path:tv-app/, path:docs/PLATFORM-RISK.md]
---

The TV reaches the phone through **two transports behind one interface**. Either it *listens* on the
LAN (Ktor CIO server in the APK, which serves the phone page itself so `ws://` is same-origin), or
it *dials out* to a relay (Ktor client). Both are exercised by tests (`tools/live-ui-test.mjs`,
`tools/relay-test.mjs`). Keep both working, and keep transport choice out of the pen and annotation
logic. **Why:** a target platform may not let an app listen at all (Fire OS vs Vega OS, see
`docs/PLATFORM-RISK.md`), so the relay is the escape hatch, not dead code. Source: README, "What is
actually working".
