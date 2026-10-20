---
id: 0011
kind: decision
scope: repo
date: 2026-10-05
supersedes: null
refs: [path:.ai/manifest.yaml, path:.editorconfig, path:AGENTS.md]
---

`.ai/manifest.yaml` declares `controls.prePush: [lint, scan-secrets]`, and the repo has no local hook
runner (no `lefthook.yml`, `.husky` or `.pre-commit-config.yaml`). So `node .ai/doctor.mjs` fails
`control.prepush`, and that failure is **deliberate and owned by a human**. Do not loosen the controls
to turn the doctor green. An autopilot session's write to `lefthook.yml` was refused as a sensitive
file. The operator adds the hook.

Lint itself is also still owed: detekt for `core/` and `tv-app/`, and ESLint (eslint-config-next) for
`desk/`. Neither can be added by a file-only session:
- A detekt baseline comes from running Gradle.
- New `desk/` devDependencies need a regenerated `package-lock.json`, or CI's `npm ci` breaks.
- A Gradle plugin that is never resolved can break `:core:test` configuration.

A session with a shell and network does it in one pass:
1. Add the plugin, then run `detektBaseline`.
2. Run `npm i -D --prefix desk eslint eslint-config-next`.
3. Add a `lint` script and capability, then a CI lint job.
4. Update AGENTS.md ("no linter or formatter wired yet").

Until then, `.editorconfig` carries only the indentation style. It leaves line endings and whitespace
alone because deathride/ holds byte-hashed evidence.

Pinning the GitHub Actions to commit SHAs is open for the same reason: it needs the network. Never
write an invented SHA.
