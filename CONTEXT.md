# CONTEXT: . (repository root)

> Co-located, agent-readable context for the root of the repo. Keep it short and TRUE. The full
> guidance is [AGENTS.md](AGENTS.md); this file is the module card the `.ai` context index points at.

## Owns
The three TV products in this repository and the glue between them:
- the Telestrator PoC (`core/`, `tv-app/`, `companion/`)
- the Study Desk prototype (`desk/`, with its rules suites in `tools/` and UAT in `uat/`)

It also owns the root Gradle build (`settings.gradle.kts`: `:core`, `:tv-app`, `:stick-app`; versions in
`gradle/libs.versions.toml`) and the agent contract in `.ai/`.

## Public contract
- The wire protocol in `core/` that the companion PWA and the TV both speak. A change there is a change on both sides of the socket.
- The capability commands in `.ai/manifest.yaml`. Agents and CI call them by name.
- `desk/package.json` `rulesSuites`, the desk gate's list of suites (`test:rules` runs it through `tools/run-rules.cjs`). A new suite goes just before `harness-rules-test.cjs`, which stays last.

## Invariants: never break
- `core/` stays free of Android imports.
- `companion/` is the single source of the phone page. The APK copies it at build time.
- No live model call runs in any gate.
- `desk/data/` and `desk/.env.local` are never committed or rewritten by a test.

## Key files
- `AGENTS.md`: canonical agent guidance (commands, map, constraints).
- `settings.gradle.kts`, `gradle/libs.versions.toml`: the root build and its dependency versions (Ktor, Media3, Compose).
- `desk/package.json`: the Study Desk gate (`npm test`).
- `tools/gradlew.cjs`: the cross-platform Gradle entry the manifest and docs use.
- `scripts/dev.ps1`: the full telestrator cycle, from unit tests to the live UI test on an emulator.

## Data flow
- Telestrator: phone PWA → WebSocket (LAN listen or relay dial-out) → `core` pen conversation → `tv-app` overlay on the paused frame.
- Study Desk: phone and TV browsers → `desk/src/proxy.ts` → API routes → the session store → SSE back to the TV.

## Decisions & memory
- `.ai/memory/` (0002 onwards) records the repo-level decisions: the sports direction is closed, desk is a prototype, there are two transports, and the gate rules.
- `docs/README.md` indexes the product docs and the owner decision records.
