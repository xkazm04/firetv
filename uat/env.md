# Environment — Linga

## LT — text-live (no server, no browser)

```bash
node uat/driver/linga-text.cjs [character …] [--journeys J1,J2] [--run <id>]
```

The driver loads desk's TypeScript directly (desk's own compiler, as `tools/linga-rules-test.cjs` does) and calls `englishCommand`, the same function the `/api/english` route calls. There is no dev server and no browser.

| Switch | Default | Effect |
|---|---|---|
| `DESK_TEXT_ENGINE` | set to `codex` by the driver | `lib/engines/text.ts` sends every text request to codex-cli instead of the Claude CLI. Unset in the dev server, so manual testing stays on claude. |
| `UAT_CODEX_MODEL` | `gpt-6-astra` | Model for all three roles. |
| `UAT_CODEX_EFFORT` | `medium` | Reasoning effort for the tutor and the Character. |
| `UAT_JUDGE_EFFORT` | `high` | Reasoning effort for the judge. |
| `CODEX_JS` | the install beside the running node, then `%APPDATA%\npm` | Path to codex's JS entry, launched with node (the `codex` on PATH is a `.cmd` shim, which cannot be spawned without a shell). **This machine has two installs:** `C:\nvm4w\nodejs` is 0.154.0 and serves `gpt-6-astra`; `%APPDATA%\npm` is 0.139.0 and fails every call with "requires a newer version of Codex". Check `node <path>/codex.js --version` after any upgrade. |

**What the Character sees.** Each step, `driver/surface.cjs` renders the real `LingaTV` and `LingaPhone` for the session with react-dom/server (desk's own react, the TSX transpiled with desk's typescript, no browser) and gives the Character their text, a TV section and a Phone section, plus the line the TV speaks ("Heard from the TV"). The actions come from the Linga screen model (`lib/english/view.ts`): a TV button is tied to a view action by its label, a phone control by the command its own handler sends (caught before it is posted). A phone control the TV does not offer on this screen, such as the situation list on home, is offered too, marked phone-only. A rendered control with no view action is an unmapped control, and a view action with no control is counted as well; `report.md` lists both under **driver coverage**, and 0 is the target. `tools/uat-surface-test.cjs` (in `npm test`) holds the driver to this in fifteen screen states. The judge reads each step's screens whole up to 8,000 characters, and a longer screen is cut with `[... N more characters not shown]`.

**Data isolation.** Every Character runs in its own process with its own `DESK_DATA_DIR` under `uat/runs/<id>/data/<character>/` (gitignored). A run never touches `desk/data`, so Ema and Jakub's real records are safe.

**Profiles.** The driver creates the Character's profile in its isolated session (`profile.draft` + `profile.save`) from the `sim.profile` block, selects it, saves the `sim.preferences`, then walks the journeys in order. Journeys chain in one session: J2 starts from J1's verdict, J3 from J2's plan.

**Model calls.** Codex answers in 8–30 s a call at medium effort (smoke test 15 Sep 2026: 8 s, schema with `maxLength`/`enum` honoured). A Character walking J1–J3 makes roughly 30–50 calls. Ten Characters run in parallel.

## Required fixtures

None beyond the Character files: every LT run builds its own profile and state from scratch. The seeded Ema (16) and Jakub (other, no age) are not used by LT.

## L2 — empirical (not scaffolded)

Would run against `npm run dev` in `desk/` at `http://localhost:3000` (`/tv` for the TV, `/phone` for the phone; the phone joins with the PIN on the pair screen; no auth). **An L2 run must not use the owner's running dev server**: its data dir holds the real learners. Start a second server with its own `DESK_DATA_DIR` (worktrees need `next dev --webpack`, see the repo notes).
