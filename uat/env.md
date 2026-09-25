# Environment — Linga

## LT — text-live (no server, no browser)

```bash
node uat/driver/linga-text.cjs [character …] [--journeys J1,J2] [--run <id>]
node uat/driver/linga-text.cjs --recertify <run> [character …]
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

**Recertify.** `node uat/driver/linga-text.cjs --recertify <run> [character …]` closes the loop after a fix in one command. It reruns only the Character x journey pairs of `<run>` that still have open non-strength findings (7 pairs for `2026-09-15-lt-recert2-beginners`), inside that run as `recert-<k>/`, with data and logs under `<run>/data/recert-<k>/` and `<run>/logs/recert-<k>/` (gitignored). Each pair's judge is shown that pair's open finding ids and must answer every one in `prior[]`: `recurs`, `not-seen` or `not-evaluable`, with step evidence. Code then decides: `not-seen` from a journey that ended `done` becomes `resolution: fixed` in `<run>/findings.json` (never `resolved-verified`, which takes L2), `recurs` keeps it open with `recurrence + 1` and the rerun's matching finding carries `recurs: <id>`, and an omitted id, or `not-seen` from a journey that crashed or stalled, is `not-evaluable`. Every stamped row names the rerun in `recertify_run`. `<run>/recertify.md` (then `recertify-<k>.md`) is written beside it: Fixed, Still open, Regressed, Metric deltas (before counted over the same pairs), Confounded and New findings. A journey that started from a fixture in one run and after a real earlier journey in the other (a shift of more than a quarter of the cast, read from each journey's `setup`), or a changed instrument, is listed as a confound and kept out of Regressed. `tools/uat-recertify-test.cjs` (in `npm test`) holds this to the committed runs, all three roles stubbed.

**prior[] under codex strict mode.** Smoke test 25 Sep 2026: one live call on `gpt-6-astra` (effort low, tiny prompt) with the judge schema carrying `prior` `minItems`/`maxItems` = 2 was **accepted** (13 s, two rows back). Accepting the keywords is not proof they are enforced, so the answer is held to a looser shape (`accept`, prior[] unchecked) and `priorStatuses()` checks it in code: an id missing, answered twice, or with an unknown status is `not-evaluable` for that id, an id never shown is dropped, and the pair is never errored by it.

**The verdict is decided in code.** Each judge is shown the journey's Definition-of-done bullets as D1…Dn (`driver/verdict.cjs` `doneChecks()`, read from the journey file) and answers one `done[]` row per D id (`id`, `result` pass | fail | n-a, `evidence`) beside `criteria[]`; it is asked for exactly one row per id (`minItems` = `maxItems`) but held to the looser `accept` shape, as for `prior[]`, so a missing, doubled or off-enum row is `not-evaluable` for that check and never throws the pair. `verdictOf()` then decides pass | conditional | fail | not-reached from the D rows, the Character's criteria (`BLOCKER:` ones fail), the gates in each journey's sim block, breaches and how the journey ended (order in `rubric.md`). Each per-Character journey record gains `doneAsked` (the D ids asked), `verdict`, `verdictWhy` (`[{ kind, id, level, text }]`, kind `ended | judge | breach | criterion | done | gate`), `verdictNotes` and `judgeVerdict` (the judge's own, still inside `judge.verdict`). `report.md` prints the code verdict with its reasons, the judge's beside it, and *judge verdicts no recorded check explains: N*. Runs before 25 Sep 2026 carry no D rows: they are read without them, noted *no definition-of-done rows*, and 42 of their 84 judged journeys agree with the judge. Recertify's **Regressed** compares code verdicts, so a judge that changes its mind on unchanged checks is not a regression. A named check also finds driver artefacts: `LT-viktor-67-J2-1` in `runs/2026-09-15-lt-recert2-goal/findings.json` failed Viktor's J2 for "the added topic is saved but absent from the agreement screen", which was the judge's 900-character screen cut. A fail naming J2's D2 would have pointed there at once. `tools/uat-verdict-test.cjs` (in `npm test`) holds all of this, the judge stubbed.

**Instrument.** Every run writes `run.json`: the model, the three efforts, the judge's screen cap and a hash of each driver file (`verdict.cjs` included). A recertify compares the two; runs before 23 Sep 2026 have none, which the report notes as *instrument not recorded*.

**Data isolation.** Every Character runs in its own process with its own `DESK_DATA_DIR` under `uat/runs/<id>/data/<character>/` (gitignored). A run never touches `desk/data`, so Ema and Jakub's real records are safe.

**Profiles.** The driver creates the Character's profile in its isolated session (`profile.draft` + `profile.save`) from the `sim.profile` block, selects it, saves the `sim.preferences`, then walks the journeys in order. Journeys chain in one session: J2 starts from J1's verdict, J3 from J2's plan.

**Model calls.** Codex answers in 8–30 s a call at medium effort (smoke test 15 Sep 2026: 8 s, schema with `maxLength`/`enum` honoured). A Character walking J1–J3 makes roughly 30–50 calls. Ten Characters run in parallel.

## Required fixtures

None beyond the Character files: every LT run builds its own profile and state from scratch. The seeded Ema (16) and Jakub (other, no age) are not used by LT.

## L2 — empirical (not scaffolded)

Would run against `npm run dev` in `desk/` at `http://localhost:3000` (`/tv` for the TV, `/phone` for the phone; the phone joins with the PIN on the pair screen; no auth). **An L2 run must not use the owner's running dev server**: its data dir holds the real learners. Start a second server with its own `DESK_DATA_DIR` (worktrees need `next dev --webpack`, see the repo notes).
