# UAT overlay — Linga, Essay Master, Math Buddy

Simulated user acceptance testing for the Study Desk's three modules, **Linga**, **Essay Master** and **Math Buddy**, driven by the `/uat` skill (`.claude/skills/uat`, linked from `ai-registry/skills/uat`). The skill is the engine; this directory is the per-app overlay.

Each module has its own Characters and journeys: Linga's at the top of `characters/` and `journeys/` (J1–J5, with the `sim` blocks the LT driver reads), Essay Master's in `characters/essay/` and `journeys/essay/` (EM1–EM5), Math Buddy's in `characters/maths/` and `journeys/maths/` (MB1–MB5). Essay and Math files carry no `sim` block (no driver reads them yet) and live in subdirectories because the LT driver throws on a top-level file without one (`driver/linga-text.cjs:38-44`). A journey that wanders out of its module is a finding about the exit, not a journey into another module.

## Levels in this repo

The skill defines two levels. For Linga this overlay adds a third between them, because Linga's value lives in prompts and model output that neither code-reading nor a browser measures cheaply.

| Level | What runs | Engine | Cost | Status |
|---|---|---|---|---|
| **L1 — theoretical** (Linga) | A walker reads the code and walks the journey on paper | none | cheap | available through the skill |
| **LT — text-live** | The real server command surface (`englishCommand`) with a real model as the tutor, a model playing the Character, and a model judging the transcript | claude CLI: Character and judge on `best` (Character thinking off, judge and synthesis thinking on); the desk picks the tutor's model per request | medium, parallel (`--parallel N`, default 3) | **this overlay's workhorse** |
| **L2 — empirical** (Linga) | A real browser on the TV and phone pages | claude (manual, with the owner) | expensive, serial | not scaffolded yet |
| **L1 — theoretical** (Essay Master) | A walker reads the code and walks EM1–EM5 on paper | none | cheap | available through the skill |
| **L2 — empirical** (Essay Master) | `tools/essay-ui-test.cjs`: a real browser on `/tv` and `/phone` against an isolated server, one writing episode (W1–W8) | claude CLI, sonnet (model `best`) | expensive, serial, 2 model calls | one run, 2026-10-09 (`runs/2026-10-09-essay-w-run`); fixed learner and paragraph, so a Character-specific run needs the harness extended; EM3 and EM5 not reachable |
| **L1 — theoretical** (Math Buddy) | A walker reads the code and walks MB1–MB5 on paper | none | cheap | available through the skill |
| **L2 — empirical** (Math Buddy) | A real browser on `/tv` and `/phone`; a snapped page or sheet is read by the vision engine | vision: local Ollama qwen 27B (`qwen3.8:27b`); text: claude CLI | expensive, serial | **not run**: precondition is the vision host (env.md, *Math Buddy*); no Math harness yet |

**LT runs on the claude CLI, for all three roles** (tutor, Character, judge) and for the run synthesis: the operator's rule of 2026-10-09 is that live model calls go only through the claude CLI on the subscription, never codex and never a paid API. A model judging its own tutor output is still a known bias — every LT verdict names the engine (`claude-cli/<model>`, taken from the provider's own answer), and anything that matters is re-checked at L2. Runs of 2026-09-15 were produced on codex-cli (`gpt-6-astra`) and keep their records; a recertify across the move lists the engine change as a confound (env.md, *Instrument*).

LT certifies what the prompts and server logic do for a user: the level the check lands on, the topics it proposes, how the partner pitches its English, whether moments are correct, whether boundaries hold. It cannot see layout, audio, speech recognition or latency on the real engine — those stay L2's.

## Layout

```
uat/
  README.md              this file
  rubric.md              dimensions, Linga / Essay Master / Math Buddy metrics (with their units), impact scoring, finding schema
  env.md                 how to run each level; engine switches; data isolation
  accepted-gaps.md       known and accepted issues
  characters/*.md        ten Characters; each has a `sim` JSON block the LT driver reads
  journeys/*.md          five Linga journeys: goals and definitions of done, not scripts
  characters/essay/*.md  five Essay Master Characters (no `sim` block)
  characters/maths/*.md  five Math Buddy Characters (no `sim` block)
  journeys/essay/*.md    Essay Master journeys EM1–EM5
  journeys/maths/*.md    Math Buddy journeys MB1–MB5
  driver/linga-text.cjs  the LT driver
  driver/surface.cjs     what a Character sees and can do: LingaTV and LingaPhone rendered for the session
  driver/recertify.cjs   recertify from a run's own data: open pairs, metric deltas, confounds, write-back
  driver/ledger.cjs      one open ledger across every run: run-qualified ids, recurs chains, unasked counts, OPEN.md
  driver/product.cjs     the product a run saw: the desk/src files the driver loads, git blobs, stamped into run.json; read from git for older runs
  driver/verdict.cjs     the journey verdict decided in code from named checks
  runs/<id>/             findings.json, report.md, SUMMARY.md, run.json, per-Character transcripts and voices
  runs/<id>/recert-<k>/  a rerun of <id>'s open pairs; recertify.md (then recertify-<k>.md) sits beside <id>'s findings
  runs/OPEN.md           derived by --status (and after a ledger recertify): what is open now across every run
```

## Run

```bash
node uat/driver/linga-text.cjs                       # every Character, their bound journeys, three at a time
node uat/driver/linga-text.cjs --parallel 1 viktor-67   # cap concurrent Character processes (default 3; every role shares the subscription and this machine's memory)
node uat/driver/linga-text.cjs viktor-67 adela-17    # only these Characters
node uat/driver/linga-text.cjs --journeys J1,J2      # only these journeys
node uat/driver/linga-text.cjs --recertify 2026-09-15-lt-recert2-beginners   # after a fix: rerun only what that run left open
node uat/driver/linga-text.cjs --status              # what is open now across every run (writes runs/OPEN.md; no model call)
node uat/driver/linga-text.cjs --recertify           # rerun every pair with an open row in any run
```

`--parallel N` works with every run command above.

See `env.md` for the engine switches. A run writes `uat/runs/<date>-lt/`. A recertify writes into the run it recertifies (see env.md, *Recertify*); a recertify with no run stamps each answer into the run that owns the row (env.md, *The open ledger*). Start a drain from `--status`: it lists every open row by its run-qualified id `<run>/<id>` and how many later runs passed it by unasked.

## Character template

Every Character file has the prose the skill asks for (an Essay or Math Character lists its scored criteria C1… in the prose instead of a `sim` block, and cites each surface by `file:line`) (background, voice, jobs-to-be-done, what good looks like, pet peeves, motivation in minutes, senior-quality bar, scored criteria, surface binding) and one fenced `sim` JSON block:

```json
{
  "id": "slug", "name": "First name", "trueBand": "A2",
  "profile": { "type": "elementary|high-school|other", "age": 13, "adultConfirmed": false },
  "preferences": { "correction": "as-needed", "creativity": "familiar", "challenge": "supportive", "interest": "", "goal": "" },
  "journeys": ["J1", "J2", "J3"],
  "play": "How to play this learner: language of answers, length, typical errors, mode, temperament, what they try.",
  "wants": "Which topics they would actually choose, in their words.",
  "criteria": [{ "id": "C1", "check": "An explicit pass/fail check applied identically every run." }]
}
```

`trueBand` is the ground truth the placement is scored against. `play` is what the Character model is told; it never sees `criteria`. The judge sees both.

## Drain homes

`/uat drain` writes here, per module. The format of each home is stated in the home itself.

- Analysis documents, every module: `docs/uat-insights/<run-id>.md` (one per drained run; the three sections are in `docs/uat-insights/README.md`)
- Backlog: `docs/BACKLOG.md`, one section per module (entry format at the top of the file)

| Module | Backlog section | Concept documents |
|---|---|---|
| Linga | `## Linga` | `docs/`, beside `LINGA-PLACEMENT-DESIGN.md` |
| Essay Master | `## Essay Master` | `docs/`, beside `DESIGN-ESSAY-MASTER.md` |
| Math Buddy | `## Math Buddy` | `docs/`, beside `DESIGN-MATH-BUDDY.md` and `MATH-COURSE-PATHS.md` |

## Skill improvement log

- 2026-09-15 — Adopted for Linga with an added **LT (text-live)** level on codex-cli. Proposal for the method, not applied: the skill has no level for AI products whose value is prompt output reachable through a server command surface without a browser; LT fills it and should be judged on whether its findings survive L2.
- 2026-10-09 — LT moved off codex onto the claude CLI for all three roles and the synthesis (operator rule of 2026-10-09: claude CLI on the subscription only). Tutor through the desk registry, Character (best, thinking off), judge and synthesis (best, thinking on) through the desk's claude-cli provider under the shape rule; `--parallel N` added. The 09-15 codex runs are unchanged, and a recertify across the move reports the engine change as a confound, never a fix.
- 2026-10-09 — `/uat update` for Essay Master and Math Buddy (mode update, not init: the Linga overlay is unchanged). Five Characters and five journeys each, at L1, Essay also at L2 through `tools/essay-ui-test.cjs`, Math L2 waiting on the vision host. Proposal for the skill, not applied: the overlay layout assumes one flat `characters/` and `journeys/` per app, and a per-module driver that requires its own block in every file there breaks when a second module joins; module subdirectories (or a driver that skips files without its block) should be the documented shape for a multi-module app.
