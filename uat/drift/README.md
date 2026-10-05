# uat/drift: does live model quality move when a provider changes?

The deterministic suites pin the code around model output, with every model role stubbed (.ai/memory/0007). A
provider update to the text model or a new local vision model could still make the hints, the page read or the lesson
pick worse, and no gate would notice. This directory is where that leaves a trace.

- **The instrument** is the lab bench, `tools/lab-bench.cjs --live`. It runs the PRODUCTION `readPage`, `hint` and
  `pickLesson` over the lab's corpus and scores them in code: `rules/maths leaks()`, the phone's `nearestItem()` and the
  lab's ACCEPT table. Nothing new judges the model.
- **The record**: `tools/model-drift.cjs --live` keeps each run's counts, never the model's words, as
  `<YYYY-MM-DD>-<n>.json`. It compares them with the previous live record, rewrites `DRIFT.md` (derived: do not edit)
  and exits 1 on an alert.
- **The watch**: `.github/workflows/model-drift.yml` runs `node tools/model-drift.cjs --status --max-age 21` every
  Monday. It reads only the committed records and makes no model call. The run goes red, and GitHub emails the owner,
  in three cases:
  - no live record exists ("never measured")
  - the newest live record alerted
  - the newest live record is older than 21 days

## Which role drifts first

**The hint writer** (`desk/src/lib/desk/hint.ts`) drifts first.
- It writes free text on the hosted CLI model (`model: "fast"`, claude-cli or codex). Its provider can change the model
  without notice.
- Its withholding is checked after the fact. A hint that gives the answer away is re-asked once, then replaced by the
  item's fixed withheld line. So a worse model does not break the TV. It quietly turns real hints into the generic line.
- The first-ask leak count and the re-ask count are the early signal.

**The marker** is safer. A typed answer is marked by code and never calls a model. A photographed page is marked by code
from the vision read.

**The vision read** runs on a local Ollama model, which changes only when the operator pulls a new one. It is still
measured, because a pull is exactly that kind of change.

## What alerts

The numbers are provisional. Recalibrate them once three live records show the run-to-run noise.

| Measure | Out of | Alerts when | Why this size |
|---|---|---|---|
| `hints.reached` | 12 maths problems | any, on any record | An answer on the TV breaks withholding, the product. The code's fallback should make it impossible. |
| a pipeline error (read, hints, lessons) | — | any, on any record | An unmeasured run is not a clean run. |
| a PoC kill criterion (A read, B hints, C lessons) | — | it fails, on any record | These are the lines set before the PoCs ran (`docs/STUDY-DESK-POC-RESULTS.md`). |
| `hints.leaked` | 12 | up by 2 or more | Kill criterion B allows 1 of 12. A sampled model flips one problem between runs, and two is a trend. |
| `hints.reasked` | 12 | up by 2 or more | Each re-ask is a second paid call, and the step before the generic line. |
| `hints.latex` | 12 | up by 1 or more | LaTeX in a spoken line is read aloud as noise (`docs/STUDY-DESK-POC-RESULTS.md`). |
| `read.<page>.exact`, `read.<page>.selects` | each page's items (10 on the maths page) | down by 1 or more | One misread item is a wrong question on the TV. |
| `retrieval.right` | 9 queries | down by 2 or more | The lab measured 8 of 9. One flip is within its noise. |

A change of provider or model (`providers.text`, `providers.vision`) is written as a note beside the alerts, as their
likely cause. It never alerts on its own.

## Running it

| Who | Command | Model calls |
|---|---|---|
| the operator, weekly | `./scripts/model-drift.ps1` (it runs `MODEL_DRIFT_ALLOW_LIVE=1 node tools/model-drift.cjs --live`) | yes |
| the operator, once | `./scripts/model-drift.ps1 -Register` (a weekly Windows Scheduled Task for the line above) | no |
| anyone, CI | `node tools/model-drift.cjs --status --max-age 21` | no |
| anyone, the suite | `node tools/model-drift-test.cjs` (the replay path, into a temp directory) | no |

A live run needs the engines the desk uses: Ollama with the vision model for the read, and claude-cli (or codex with
`DESK_TEXT_ENGINE=codex`) for the hints and lessons. **Commit the new record and `DRIFT.md`.** CI can only watch what is
committed. The records are append-only: a record is never edited or deleted, and a bad run stays as the trace it is.
