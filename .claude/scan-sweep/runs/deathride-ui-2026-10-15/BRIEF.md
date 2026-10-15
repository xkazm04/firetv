# Round-agent brief - Death Ride UI sweep (2026-10-15)

You are one round-agent in a /scan-sweep stabilize run over ONE Death Ride context (named in your task). Repo root: C:\Users\kazda\kiro\firetv-deathride (git worktree, branch deathride/main). Game module root: deathride/.

## Lenses (both, applied to every screen of your context)
1. **UI perfectionist** - hierarchy, alignment, spacing, one focal point per screen, consistent type scale, tap-target size, contrast, nothing clipped or overlapping, states (empty/loading/disabled/error) designed.
2. **Ambiguity guardian** - at every moment the player must know: where am I, what is happening, what can I do, what will this button do. Hunt: two names for one thing, one name for two things, labels that do not say the verb, numbers without units/meaning, jargon (PR, CR, tier), controls whose effect is not visible, **phone and TV disagreeing** (different words, different phase, phone shows something the TV does not).

## The owner's complaint (this is the problem statement)
"The menu UX is overflowing with text. The phone often does not correlate with the TV screen. It is not straight and visually appealing what is going on." Target: **a picture and one short line per screen; at most ~6 words per label; detail behind a deliberate tap, not on the surface.** Prefer deleting text, grouping, and progressive disclosure over rewording. The TV is a television (read from 3 m): large, few elements. The phone in race is a controller: no reading at all.

## What to produce
- Read your context's files in full first. Walk its screens/states in order. Find up to 16 findings (24 if you dig deep). Each in the standard form (Summary / Description / Flow / Expected impact / Evaluation) with `<repo-relative path>:<line>` anchors, size XS/S/M/L, impact/risk 1-10.
- **Build** every finding that is XS/S (or M with low risk) and verifiable: write/extend a test first when a test seam exists (string-length budget tests are welcome: e.g. a test that fails when a surface label exceeds N characters), make the change, run the gate, commit. One atomic commit per finding.
- Everything bigger, or needing a product decision, or outside your paths: write it as a finding (Lane B/C) - do not build it.
- Write ALL findings (built and not) as JSON lines to `.claude/scan-sweep/runs/deathride-ui-2026-10-15/findings/<your-context>.jsonl` with fields: id, context, lens, title, body, evidence, size, effort, impact, risk, result, method, gate, lane (A|B|C), status (built|backlog|rejected), commit (sha or null).

## Rules (binding)
- Edit ONLY files under your context's paths (plus their tests). A needed change elsewhere = a finding, not an edit. Other agents are working in parallel on the other contexts in this same checkout.
- Commit with explicit pathspec: `git add <files>` then `git commit -m "..." -- <files>`. Never `git add -A`/`.`, never stash, never reset, never push, never checkout another branch.
- End every commit message with the line: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Message form `fix(<context>): <title>` with the lens in the body.
- Gates: run in their own invocation, exit code asserted, never piped through tail/head before `&&`. Gradle from `deathride/` (PowerShell: `./gradlew.bat :game:test`, `:link:test`, `:core:test --tests "<pattern>"`). Other agents run gradle in the same tree: if a build lock waits, wait. A whole-tree red that names files you did not touch is not yours - say so. Do NOT run the full `:core:test` suite (very slow); run targeted tests. Do not install on the TV Stick, do not start servers, do not run the perf harness.
- Do not touch `deathride/evidence/`, `deathride/audio/`, `deathride/tracks/`, generated data. No live model calls.
- Never author regexes through shell heredocs; use the file tools.
- Never-re-propose: do not re-file anything already decided in `.claude/scan-history/open-backlogs.jsonl` rows for deathride.
- The Auto layout (GO automatic, left thumb steers+brakes) landed in commit 8f211d0f; judge the controller as it is now.

## Reply (short)
Counts: built / backlogged (lane) / rejected; the commit shas; gates run with exit codes; the top 5 backlog items by impact in one line each; any seam you need from another context (name the file and the change).
