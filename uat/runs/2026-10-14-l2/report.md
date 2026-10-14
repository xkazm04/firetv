# L2 (empirical, live browser): 2026-10-14

Isolated desk (`next dev --webpack`, port 3241, scratch `DESK_DATA_DIR` under %TEMP%, claude CLI on the subscription, `ANTHROPIC_API_KEY`/`CLAUDECODE`/`DESK_TEXT_ENGINE` unset). Never `desk/data`, never the owner's server. Product commit 4af25199 (`desk/node_modules` was missing `@next/env`; repaired with `npm install`, lockfile unchanged).

| Harness | Result | Mode covered |
|---|---|---|
| `tools/essay-ui-test.cjs` W1-W8 | **pass** (analyse 9.7 s, claude-cli/sonnet, Evidence lens, 5 sentences, sentence 4 flagged) | Family only (learner Sam, high-school, 15) |
| `tools/linga-ui-test.cjs` E2-E9 + sync, D-pad, mobile width, Math/Essay entrances | **pass**, 15 checks, 0 errors | Family only (age-restricted API 403 checked) |
| Math Buddy L2 | **not run**: precondition unmet (no Ollama / qwen vision host at 127.0.0.1:11434); typed route has no harness | - |
| Adult mode (Twin/Workroom, Company/Take Two, Calculus) | **not run live**: no harness exists; fixed learners in both scripts are Family | - |

Linga moments: typed reply fired none, spoken reply fired a "fix" moment (`Where you saw the rover last time?` -> `Where did you see...`). Voice is the TV footer event, not heard audio; recognition simulated.

Honest ceiling: this L2 certifies that the Family happy path of Essay and Linga is live and error-free. It certifies nothing about Adult mode or Math live. Those rest on L1 (and the rules suites, `npm test` exit 0 at the start of this pass).
