# Essay W-run, 2026-10-09 (M5 goal 3)

One run of `tools/essay-ui-test.cjs` (committed first as f8661061), plus the reread. DATA: a fresh directory in the OS temp dir
(outside every repo), pairing.json seeded with a random key; port 3241; `next dev --webpack`; ANTHROPIC_API_KEY, CLAUDECODE,
CLAUDE_CODE_*, ELEVENLABS_*, PIPER_*, DESK_TEXT_ENGINE, CLAUDE_FAST_MODEL, CLAUDE_BEST_MODEL unset; no `.env`. claude CLI 2.1.295.
Server 1 PID 58100, server 2 (restart, same DATA and port) PID 35004; both stopped by PID, the port is free. No push, nothing under desk/ touched.
The first run passed, so there was no second run. All 7 screenshots the harness wrote are kept (under the cap of 8).

## Steps

| Step | Verdict | Evidence |
|---|---|---|
| W1 Seat and pair | pass | results.json:4-7 |
| W2 Enter | pass (timing below) | results.json:8-13; timings.json:5-9 |
| W3 Start (Evidence lens, paragraph typed, Analyse on the TV) | pass: 5 sentences, provider claude-cli/sonnet | results.json:14-20; timings.json:15-20 |
| W4 Coached | pass: five verdicts, problems, moves, patterns and a summary recorded; no ghostwriting seen | results.json:21-95; transcript.md; tv-coached.png |
| W5 Rewrite (sentence 4, faulty before) | pass: faulty to strong; the other four verdicts kept | results.json:96-124; tv-rewrite-offered.png, tv-rewrite-judged.png |
| W6 Finish | pass: End session to screen `recap` in 1896 ms; recap "Essay Master - one reading (Evidence): 2 of 5 sentences to fix", caption "two to look at together" | results.json:125-129; tv-recap.png, phone-recap.png |
| W7 Saved | pass: (a) learners.json holds one writing entry and writing.evidence; (b) TV reloaded | results.json:130-148; tv-after-reload.png |
| W8 Page errors | pass: none on either page | results.json:149-152 |
| Reread | pass, with the caveat below | results-reread.json; tv-reread-lens-home.png |

## Model calls

| Call | ms | Provider |
|---|---|---|
| analyse (essay, Evidence) | 27551 (server log: POST /api/analyse 200 in 25.8s) | claude-cli/sonnet |
| rewrite (sentence 4) | 23057 (server log: 200 in 22.9s) | claude-cli/sonnet |
| End session (/api/memory; no model call, nothing marked and no hints) | 1896 | none |

CLI arguments of a 'best' call (desk/src/lib/engines/text.ts:46-47 and 53): `-p --no-session-persistence --tools "" --system-prompt <system> --output-format json --model sonnet --json-schema <schema>`. The model is `MODELS.best`, CLAUDE_BEST_MODEL or "sonnet" (line 12). The essay calls (essay.ts `judge` and `reviseSentence`) pass `model: "best"` and not `isolated`, so line 50's safe-mode flags are not added and line 53's `--json-schema` is.

## learners.json, quoted (results.json:130-148)

- history: one entry, `{"kind":"writing","label":"Evidence","detail":"2 of 5 sentences to fix"}`
- writing.evidence: `{"topic":"evidence","seen":1,"right":0,"estimate":0,"secure":false,"slips":[]}` (lastSeen left out)

## The reread

The server was stopped by PID and started again on the same DATA and port. `--reread` opened the TV, seated essay-browser-teen the way the desk does (profile draft and save, subject essay, nav essaytype) and read GET /api/session: history one writing entry (same detail), writing.evidence seen 1. The TV's lens home (`EssayType`, desk/src/essay/EssayTV.tsx:106-115, `lensStandings(s.history, s.writing)`) shows the Evidence lens as "READ Today" and "1 PARAGRAPH READ" (tv-reread-lens-home.png).

**Caveat:** DATA also held session.json, which survived the restart, so the reread did not start from an empty session. The proof that the episode is on disk is W7's direct read of learners.json before the restart (results.json:130-148); the reread shows the restarted desk serves it. I did not isolate which file the restarted history came from.

## Server log lines, 4xx/5xx

One: `POST /api/speak 503 in 3.7s` (run 1 log line 233): no voice is configured, and the TV asked for audio. No 4xx or 5xx on /api/analyse or /api/memory.

## W2: Enter to essaytype

**744 ms** (results.json:10), from `keyboard.press('Enter')` to the first poll (100 ms steps) that read screen `essaytype` and subject `essay`. That **exceeded the 560 ms zoom** (ZOOM_MS, desk/src/landing/model.ts:19) by 184 ms: the zoom, then the step's post, then the poll. The harness clicked `.stage` first (as Linga's first Enter did) and asserted the screen was still `landing` before pressing.

Bearing on Linga run 2's Maths entrance failure: it adds weight to the harness-defect reading. An Enter on the landing takes at least 560 ms to change the session, and linga-ui-test.cjs line 142 waited for `.linga-tv` to vanish (already true on the landing) and asserted at once, so it read the state before the zoom ended. It does not settle it: that Enter in Linga run 2 was not preceded by a `.stage` click, and this one was. A rerun of the Linga entrance with a poll for the screen, with and without the click, would separate the two.

## Not covered

A real phone, heard audio (the voice call answered 503), and the owner's reading of transcript.md.
