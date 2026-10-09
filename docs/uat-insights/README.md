# UAT insights — one analysis document per drained run

`/uat drain` writes here. One file per drained run, named `<run-id>.md`, where `<run-id>` is the run's directory under `uat/runs/` (for example `2026-10-09-essay-w-run.md`). A run counts as drained when its file exists: `node uat/driver/linga-text.cjs --status` reads exactly that (`uat/driver/ledger.cjs`, `drained N of M runs`). This README is not a run and is never counted.

A drain reads everything the run produced: `SUMMARY.md`, `findings.json`, `report.md`, every per-Character report **including the first-person voices**, the journals, and the `recertify.md` of any already-drained run in scope. It writes exactly three sections.

## The three sections

### 1. Confirmed-and-fixed

Reference only: what went finding → fix → `resolved-verified`, each with its **ceiling** (what the Character still cannot do after the fix). Read from the run's own `findings.json` rows. A run that folded its re-certification into prose gets its rows reconstructed here, and the schema miss is recorded in section 3. Ceilings are inputs to section 2, not closed topics.

### 2. Design opportunities

Ranked: `recurrence` first, then convergence (several Characters independently), then voice escalation (a voice harsher than its finding row ranks by the voice), then impact. Each opportunity cites a quoted Character voice or a finding id `<run>/<finding-id>`; an uncited idea does not enter. Each carries an honest cost/value call and one recommendation:

- **build** → an entry in `docs/BACKLOG.md` under its module;
- **concept-doc** → the module's concept home (below) gets the open design questions;
- **method-commitment** → a standing commitment in `docs/BACKLOG.md` with its trigger;
- **decline-with-reason** → recorded here and in `docs/BACKLOG.md`, so it cannot return without new evidence.

A root cause is a hypothesis until checked against the run's stored artifacts; an unchecked one is labelled `hypothesis`. Opposing verdicts on the same evidence are one item (usually a segmentation question, routed to concept-doc), never averaged. Strengths are written as do-not-touch constraints on the build items. An opportunity another active workstream owns is recorded as covered-elsewhere.

### 3. Methodology lessons

What the run taught about `/uat` and this overlay: surface-model blind spots a later level exposed, env-contract drift, which finding types each level produced. Folded back into `uat/` (or proposed for the skill) in the same change when actionable.

## Homes, per module

| Module | Backlog section | Concept documents |
|---|---|---|
| Linga | `docs/BACKLOG.md` `## Linga` | `docs/`, beside `LINGA-PLACEMENT-DESIGN.md` |
| Essay Master | `docs/BACKLOG.md` `## Essay Master` | `docs/`, beside `DESIGN-ESSAY-MASTER.md` |
| Math Buddy | `docs/BACKLOG.md` `## Math Buddy` | `docs/`, beside `DESIGN-MATH-BUDDY.md` and `MATH-COURSE-PATHS.md` |

A shipped `build` item is not done at merge: it goes back through `/uat recertify` against the originating Character's scored criteria, and its backlog status moves to `resolved-verified <recertify ref>` only on that evidence.
