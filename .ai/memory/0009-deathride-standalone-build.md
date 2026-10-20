---
id: 0009
kind: decision
scope: path:deathride/
date: 2026-10-05
supersedes: null
refs: [path:docs/concepts/DEATH-RIDE-STATUS.md]
---

`deathride/` is a **standalone Gradle build** (`deathride/settings.gradle.kts`: `:core`, `:link`,
`:game`, `:app`, `:desktop`) with its own wrapper (Gradle 8.14) and its own `gradle.properties`. It
is not included in the root `settings.gradle.kts`. Run its tasks from `deathride/` (`.\gradlew.bat
:core:test`, `:link:test`, `:app:assembleDebug`). Root tooling (the `.ai` capabilities and
`tools/gradlew.cjs`) covers only the root build. Its design and owner decisions live in
`docs/concepts/` (start at `DEATH-RIDE-STATUS.md`). Source: `deathride/README.md`.
