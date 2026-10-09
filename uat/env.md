# Environment — Linga, Essay Master, Math Buddy

Linga's levels come first (LT, then L2); Essay Master and Math Buddy have their own sections at the end.

## LT — text-live (no server, no browser)

```bash
node uat/driver/linga-text.cjs [character …] [--journeys J1,J2] [--run <id>]
node uat/driver/linga-text.cjs --recertify <run> [character …]
node uat/driver/linga-text.cjs --recertify [character …]   # every open pair of every run
node uat/driver/linga-text.cjs --status                    # what is open now; no model call
```

Any of them takes `--runs <dir>` in place of `uat/runs/`.

The driver loads desk's TypeScript directly (desk's own compiler, as `tools/linga-rules-test.cjs` does) and calls `englishCommand`, the same function the `/api/english` route calls. There is no dev server and no browser.

| Switch | Default | Effect |
|---|---|---|
| `DESK_TEXT_ENGINE` | removed from every Character child; the parent refuses to start if it is `codex` | `lib/engines/text.ts` then picks claude-cli for the tutor, as in the dev server. A run never sends a call to codex (operator rule of 2026-10-09). |
| `CLAUDE_BIN` | `claude` | The Claude CLI executable all three roles launch (read by `lib/engines/text.ts`). |
| `CLAUDE_FAST_MODEL` | `haiku` | Model name behind `fast`, which the desk's tutor calls may ask for. |
| `CLAUDE_BEST_MODEL` | `sonnet` | Model name behind `best`: the Character, the judge and the synthesis. |
| `--parallel N` | `3` | At most N Character processes at once. Every role shares the subscription and this machine's memory; `--parallel 1` is the cheapest smoke. |

`UAT_CODEX_MODEL`, `UAT_CODEX_EFFORT`, `UAT_JUDGE_EFFORT` and `CODEX_JS` belonged to the codex era (runs up to 2026-09-15) and are no longer read. Role settings are fixed in the driver: Character `best`, thinking off (`MAX_THINKING_TOKENS=0`); judge and synthesis `best`, thinking on.

**What the Character sees.** Each step, `driver/surface.cjs` renders the real `LingaTV` and `LingaPhone` for the session with react-dom/server (desk's own react, the TSX transpiled with desk's typescript, no browser) and gives the Character their text, a TV section and a Phone section, plus the line the TV speaks ("Heard from the TV"). The actions come from the Linga screen model (`lib/english/view.ts`): a TV button is tied to a view action by its label, a phone control by the command its own handler sends (caught before it is posted). A phone control the TV does not offer on this screen, such as the situation list on home, is offered too, marked phone-only. A rendered control with no view action is an unmapped control, and a view action with no control is counted as well; `report.md` lists both under **driver coverage**, and 0 is the target. `tools/uat-surface-test.cjs` (in `npm test`) holds the driver to this in fifteen screen states. The judge reads each step's screens whole up to 8,000 characters, and a longer screen is cut with `[... N more characters not shown]`.

**Recertify.** `node uat/driver/linga-text.cjs --recertify <run> [character …]` closes the loop after a fix in one command. It reruns only the Character x journey pairs of `<run>` that still have open non-strength findings (7 pairs for `2026-09-15-lt-recert2-beginners`), inside that run as `recert-<k>/`, with data and logs under `<run>/data/recert-<k>/` and `<run>/logs/recert-<k>/` (gitignored). Each pair's judge is shown that pair's open finding ids and must answer every one in `prior[]`: `recurs`, `not-seen` or `not-evaluable`, with step evidence. Code then decides: `not-seen` from a journey that ended `done` becomes `resolution: fixed` in `<run>/findings.json` (never `resolved-verified`, which takes L2), `recurs` keeps it open with `recurrence + 1` and the rerun's matching finding carries `recurs: <id>`, and an omitted id, or `not-seen` from a journey that crashed or stalled, is `not-evaluable`. Every stamped row names the rerun in `recertify_run`. `<run>/recertify.md` (then `recertify-<k>.md`) is written beside it: Fixed, Still open, Regressed, Metric deltas (before counted over the same pairs), Confounded and New findings. A journey that started from a fixture in one run and after a real earlier journey in the other (a shift of more than a quarter of the cast, read from each journey's `setup`), or a changed instrument, is listed as a confound and kept out of Regressed; so is a verdict change on a product that did not move (*Product*, below): it is run-to-run noise, and when the product did move the Regressed row names the changed files. `tools/uat-recertify-test.cjs` (in `npm test`) holds this to the committed runs, all three roles stubbed.

**The open ledger.** `driver/ledger.cjs` derives one ledger from every run under `uat/runs/` and each rerun inside one (`recert-<k>/`), in order (run.json `started`, else the directory name, a rerun after its parent). A finding id is positional within its run (`LT-<character>-<journey>-<n>`), so the same id names a different finding in each run: 51 of the 114 distinct open ids of the five committed runs do. The ledger names every row by its run, the global id `<run>/<id>` (`2026-09-15-lt/LT-tomas-9-J3-3`), and derives it on every read: no committed file is rewritten to carry it. A rerun's finding with `recurs` joins the row it restates into one gap, named by its newest row, with the highest `recurrence` of the chain, and counted once. `unasked` is the number of later runs that ran the gap's pair without showing its judge the gap (in the journey record's `prior[]` or by a `recertify_run` stamp). On the committed runs: 186 open rows in 36 pairs across 5 runs, recurrence 1 on every row (no rerun has linked one yet), and 108 open rows that a later run of their pair never asked about.

`--status` writes `uat/runs/OPEN.md` and prints it: the open total, then a line splitting it by product (`186 open: 0 seen on the current product, 186 seen before a product change`, plus `, N unknown` for a run with no record; *Product*, below), how many runs are drained (a `docs/uat-insights/<run-id>.md` exists; 0 of 5 today), then one section per Character x journey, highest rank first, each row the global id, severity, rank, title, *unasked since <run>* and, for a row seen before a product change, *product: N of M files changed since*. It reads files and git only and calls no model. OPEN.md is derived; regenerate it, never edit it.

`--recertify` with no run reruns every pair with an open gap in any run (36 pairs today, against 7 for `--recertify 2026-09-15-lt-recert2-beginners`), inside the newest run that holds one as `recert-<k>/`. The parent fixes what each pair's judge is shown in the rerun's `run.json` (`ledger.prior`: per Character and journey, the open rows with their global ids and the run that holds each), and the judge answers every one in `prior[]` by global id, checked by `priorStatuses()` as in a per-run recertify. `recertify.cjs finishLedger()` then stamps each answer into the `findings.json` of every run holding an open row of that gap, under the row's own local id and with the per-run fields only: `recertify_run` (the rerun's id, `<run>/recert-<k>`), `recertify_status`, `recertify_evidence`, and `resolution: fixed` for `not-seen` from a journey that ended `done`, `recurrence + 1` and `recurred_as` (the rerun's local id) for `recurs`. No id is rewritten. The one new form is in the rerun's own `findings.json`: a restated gap carries `recurs: <run>/<id>`, a global id, where a per-run rerun writes the local id. Then OPEN.md is rewritten. `--recertify <run>` is unchanged, for a targeted rerun. `tools/uat-ledger-test.cjs` (in `npm test`) holds all of this on temp copies of the committed runs, the judge stubbed.

**prior[] under `claude --json-schema`.** The judge schema carries `prior` `minItems`/`maxItems` = the number of ids shown, and the claude CLI is given the schema with `--json-schema`; the desk's shape rule (`answer()`) then validates the reply. Asking is not the guarantee: the answer is held to a looser shape (`accept`, prior[] unchecked) and `priorStatuses()` checks it in code. An id missing, answered twice, or with an unknown status is `not-evaluable` for that id, an id never shown is dropped, and the pair is never errored by it. (The codex-era 25 Sep 2026 smoke on `gpt-6-astra` had accepted the same keywords; it is history.)

**The verdict is decided in code.** Each judge is shown the journey's Definition-of-done bullets as D1…Dn (`driver/verdict.cjs` `doneChecks()`, read from the journey file) and answers one `done[]` row per D id (`id`, `result` pass | fail | n-a, `evidence`) beside `criteria[]`; it is asked for exactly one row per id (`minItems` = `maxItems`) but held to the looser `accept` shape, as for `prior[]`, so a missing, doubled or off-enum row is `not-evaluable` for that check and never throws the pair. `verdictOf()` then decides pass | conditional | fail | not-reached from the D rows, the Character's criteria (`BLOCKER:` ones fail), the gates in each journey's sim block, breaches and how the journey ended (order in `rubric.md`). Each per-Character journey record gains `doneAsked` (the D ids asked), `verdict`, `verdictWhy` (`[{ kind, id, level, text }]`, kind `ended | judge | breach | criterion | done | gate`), `verdictNotes` and `judgeVerdict` (the judge's own, still inside `judge.verdict`). `report.md` prints the code verdict with its reasons, the judge's beside it, and *judge verdicts no recorded check explains: N*. Runs before 25 Sep 2026 carry no D rows: they are read without them, noted *no definition-of-done rows*, and 42 of their 84 judged journeys agree with the judge. Recertify's **Regressed** compares code verdicts, so a judge that changes its mind on unchanged checks is not a regression. A named check also finds driver artefacts: `LT-viktor-67-J2-1` in `runs/2026-09-15-lt-recert2-goal/findings.json` failed Viktor's J2 for "the added topic is saved but absent from the agreement screen", which was the judge's 900-character screen cut. A fail naming J2's D2 would have pointed there at once. `tools/uat-verdict-test.cjs` (in `npm test`) holds all of this, the judge stubbed.

**Instrument.** Every run writes `run.json`: the model, each role's engine, model and thinking setting (`roles`; runs up to 2026-09-15 recorded the three codex `efforts` instead), the judge's screen cap and a hash of each driver file (`verdict.cjs` and `product.cjs` included). A recertify compares the two; runs before 23 Sep 2026 have none, which the report notes as *instrument not recorded*. A recertify of a codex-era run on the claude CLI therefore lists the instrument change (model, efforts -> roles) as a confound, keeps verdict drops out of Regressed, and warns under Fixed that nothing there is a fix until L2 or a same-instrument rerun shows it.

**Product.** Beside the instrument, never inside it, `run.json` carries `product`: `{ commit, dirty, files: { path: git blob } }` over the desk/src files the driver loads (`driver/product.cjs` measures the set: what `require.cache` holds under desk/src after the driver's entry modules load and one Linga screen renders, in a child process on a scratch `DESK_DATA_DIR`; 65 files on 5 Oct 2026). A run with no stamp is read from git instead: the commit that first added its `findings.json`, with that commit's blobs of the same files; a run with neither is *unknown*, never current. The ledger gives each gap `seen`, `changed` (the files whose blob differs from the working tree now) and a state: current, aged or unknown; the five committed runs (15 Sep) read `186 seen before a product change`, 62 of 65 files changed since. `recertify.md` compares the two runs' products: identical means a verdict change is *product unchanged in N files: run-to-run noise* under Confounded; different means it is Regressed and names the files; neither recorded adds the note *product not recorded*. It states a fact, not a cause: no gap is mapped to a file. No model call.

**Data isolation.** Every Character runs in its own process with its own `DESK_DATA_DIR` under `uat/runs/<id>/data/<character>/` (gitignored). A run never touches `desk/data`, so Ema and Jakub's real records are safe.

**Profiles.** The driver creates the Character's profile in its isolated session (`profile.draft` + `profile.save`) from the `sim.profile` block, selects it, saves the `sim.preferences`, then walks the journeys in order. Journeys chain in one session: J2 starts from J1's verdict, J3 from J2's plan.

**Model calls.** Every call is `claude -p` on the subscription: the Character on `best` with thinking off, the judge and synthesis on `best` with thinking on, the tutor as the desk asks. A Character walking J1–J3 makes roughly 30–50 calls; per-role call counts and ms are in each run's `report.md` (reliability line) and the Character's `<id>.json`. At most `--parallel` (default 3) Characters run at once. *Historical (codex era, to 2026-09-15):* codex answered in 8–30 s a call at medium effort, ten Characters in parallel.

## Required fixtures

None beyond the Character files: every LT run builds its own profile and state from scratch. The seeded Ema (16) and Jakub (other, no age) are not used by LT.

## L2 — empirical (not scaffolded)

Would run against `npm run dev` in `desk/` at `http://localhost:3000` (`/tv` for the TV, `/phone` for the phone; the phone joins with the PIN on the pair screen; no auth). **An L2 run must not use the owner's running dev server**: its data dir holds the real learners. Start a second server with its own `DESK_DATA_DIR` (worktrees need `next dev --webpack`, see the repo notes).

## Essay Master

Characters in `uat/characters/essay/`, journeys EM1–EM5 in `uat/journeys/essay/`. They sit in subdirectories, without `sim` blocks, because the LT driver reads every top-level `.md` in `characters/` and `journeys/` and throws on a file with no json block (`uat/driver/linga-text.cjs:38-44`).

### L1 — theoretical

Needs nothing. A walker reads `desk/src` (each Character's Surface binding names the files and lines) and the journeys. No server, no model, no data.

### L2 — empirical, `tools/essay-ui-test.cjs`

One writing episode, end to end in a real browser with the real model. Steps W1–W8: seat and pair, Enter, one paragraph read, coached, one rewrite, End session to the recap, the learner record on disk, no page errors. Then `--reread` after a restart. The recipe is the script's header (`tools/essay-ui-test.cjs:3-11`):

1. An isolated desk: a fresh directory outside every repo, seeded with `pairing.json` `{"key":"<48 hex chars>"}`. Never `desk/data/`; the script refuses it (`:19-22`).
2. In `desk/`: `DESK_DATA_DIR=<dir> npx next dev --webpack -p 3241`, with `ANTHROPIC_API_KEY`, `CLAUDECODE`, `CLAUDE_CODE_*`, `ELEVENLABS_*`, `PIPER_*`, `DESK_TEXT_ENGINE`, `CLAUDE_FAST_MODEL` and `CLAUDE_BEST_MODEL` unset. The `claude` CLI must be on PATH and signed in.
3. `ESSAY_TEST_ALLOW_WRITES=1 DESK_DATA_DIR=<the same dir> [ESSAY_TEST_URL=http://localhost:3241] node tools/essay-ui-test.cjs`. Then stop the server, start it again on the same dir and port, and run the same command with `--reread`.

Playwright comes from `tools/node_modules` (or `NODE_PATH`). Output goes to `artifacts/essay-integration/`: `timings.json` after every step, `results.json` last, `results-reread.json`, and screenshots. Copy the evidence into `uat/runs/<date>-essay-<slug>/`, as `2026-10-09-essay-w-run` did. Never use the owner's running dev server, and stop yours by PID.

**Model.** Both essay calls ask for model `best`: the claude CLI with `--model sonnet` (`desk/src/lib/engines/text.ts:25`, `:47`). The reading records `provider: claude-cli/sonnet`. With `DESK_TEXT_ENGINE` unset the text engine stays on claude, never codex. Cost: two model calls a run, about 25 s each (W-run: 27.6 s read, 23.1 s rewrite). A whole piece would be one call per paragraph.

**Fixed inputs.** The script fixes all of these:
- the learner: Sam, `high-school`, 15, all modules (`:27`);
- one English paragraph (`:28`);
- one rewrite, of sentence 4 (`:29`);
- the Evidence lens (`:103`);
- the kind: `essay` only (`:106`).

A Character-specific L2 needs these made into parameters: the profile (type, age, system, mode), the text, the lens, the rewrite and the sentence index.

**What it cannot see:**
- a physical phone, a real keyboard, dictation or speech (the textarea is only filled, `:14`);
- heard audio (the W-run's voice call answered 503);
- whether the model's judgement is right: nothing asserts it (`:15-16`), so a person reads `results.json` and the transcript;
- a newly written sentence in a note: its echo check (`:120-122`) finds only a learner sentence repeated;
- the Parent role and the Sunday page's lines;
- a whole piece, the notice, the shelf, or the plan;
- Adult mode, the Workroom, `/drop` and the Twin Card.

EM3 and EM5 have no L2 today.

**Reread caveat.** `session.json` survives the restart, so `--reread` proves only that the restarted desk serves the record, not that the record came from `learners.json`. W7's direct read of `learners.json` is the disk proof.

**Fixtures.** None beyond `pairing.json`; the run creates its own learner.

## Math Buddy

Characters in `uat/characters/maths/`, journeys MB1–MB5 in `uat/journeys/maths/`. They are in subdirectories for the same reason as Essay Master's.

### L1 — theoretical

Needs nothing: no server, no browser, no model call. A walker reads `desk/src` and the Character and journey files: MathsTV, the `tv/` rows, the phone page and panels, the `lib/desk` pipelines, `lib/library` and `lib/rules`.

### L2 — empirical (precondition not met; not run)

**Environment precondition:** vision on local Ollama, with the qwen 27B model pulled. Until that host exists, Math L2 is not run, and a journey part that needs vision resolves `uncertain` with that reason: never pass, never refuted.

| Switch | Default | Where |
|---|---|---|
| `OLLAMA_HOST` | `http://127.0.0.1:11434` | `desk/src/lib/engines/vision.ts:15` |
| `OLLAMA_VISION_MODEL` | `qwen3.8:27b`: one call to `POST /api/chat`, with `format` set to the schema | `desk/src/lib/engines/vision.ts:16`, `:41` |

- **Preflight.** The vision probe (`GET {OLLAMA_HOST}/api/tags`, model pulled; `desk/src/lib/engines/vision.ts:22`), which `GET /api/smoke` surfaces on the TV (`desk/src/app/api/smoke/route.ts:2`). Run it before any browser time.
- **What calls vision.** Two things: reading a snapped page (`desk/src/lib/desk/read.ts:25`), and marking a snapped worked sheet (`desk/src/lib/desk/mark.ts:194`). The marked-paper reader (`desk/src/lib/desk/paperRead.ts:52`) has no caller in `desk/src`, so it is out of L2.
- **What does not call vision:**
  - Typed answers: code marks them (`desk/src/app/api/mark/route.ts:7`).
  - Hints, explain replies and Calculus sets: these use the text engine, the claude CLI (`CLAUDE_FAST_MODEL` haiku, `CLAUDE_BEST_MODEL` sonnet; `desk/src/lib/engines/text.ts:25`).
  - So MB4 and the typed route of MB2 could run at L2 without the vision host. They still need a Math harness, which does not exist yet.
- **Data.** A second `next dev --webpack` with its own `DESK_DATA_DIR` (read at `desk/src/lib/session/learners.ts:86`), outside every repo. Never `desk/data`, and never the owner's running server.
- **Profiles.** Each Character's profile is created in that isolated data dir from its Surface binding: type, age, system and Maths course.
