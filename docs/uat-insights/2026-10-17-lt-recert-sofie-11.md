# LT ledger recertify of sofie-11 (2026-10-17)

One live LT run, `node uat/driver/linga-text.cjs --recertify sofie-11 --parallel 3`. Nothing in `desk/` or `tools/` changed. Baseline: `2026-10-17-lt-recert-third-pass.md`, which could not rerun her (the run-id form plans from that run's own `findings.json`, where her rows were already answered).

**Planned:** `--status` listed her 8 open J1 rows first. Driver line: `LT run 2026-10-16-lt-placement-oos/recert-4 · 1 Character(s) · claude-cli/sonnet (best) · parallel 3 · recertify 1 open pair(s), 8 open row(s) from every run`. J1 ran 10 steps, 0 failed calls, judged `conditional` (C4). Driver result: `3 fixed (LT), 5 recur, 0 not evaluable (rows) · stamped 2026-10-16-lt-a2b1-tightening 5, 2026-10-16-lt-placement-oos/recert-1 3`. The usage ledger could not be written (`data/usage.jsonl` missing in this worktree); no call failed, no retry. The ledger form writes no `recertify-4.md`; the run is `recert-4/` (`report.md`, `SUMMARY.md`, `findings.json`, `sofie-11.md`).

**Engine, from `run.json`:** claude-cli for every role. Tutor per request (fast haiku, best sonnet). Character `best` = sonnet, thinking off. Judge `best` = sonnet, thinking on. `DESK_TEXT_ENGINE` unset; no codex call.

**Product commit stamped:** 31493cc5, `dirty: false`.

Not-seen is fixed at LT only, one sample; it is not resolved-verified.

## (a) Blocker `recert-1/LT-sofie-11-J1-3` — 'Your words': recurs

The headline block on the TV verdict screen now (#10):

    Your words
    Your words: “we build spaceship”.
    Linga says
    You can say what you did, like building a house in Roblox with a friend. Keep practising to chat with people in Roblox.

Her error is quoted under the heading 'Your words', with the praise below it. Ledger answer: recurs, `#10 'Your words: “we build spaceship”.' under the band`. Rerun finding `recert-4/LT-sofie-11-J1-2` (blocker, rank 18, recurrence 2). Her own voice: `the TV showing my mistake, 'we build spaceship', as my words was a bit embarrassing`.

## (b) The other open rows

| Open row | Ledger answer | Rerun finding / quoted line |
|---|---|---|
| `a2b1-tightening/LT-sofie-11-J1-2` listen 'the first one' | not-seen | `#7 listen task 'What was the problem that made the speaker give up?' matches the heard line 'I quit that game last week.'` |
| `a2b1-tightening/LT-sofie-11-J1-3` B2 wording too abstract | not-seen | `#8 B2 task is simple: 'you would rather build a spaceship. Which idea would you suggest...'` |
| `a2b1-tightening/LT-sofie-11-J1-4` note praises, verdict fail | recurs | `recert-4/LT-sofie-11-J1-1` (major): `#10 'B2 · Say it · not yet' with 'You gave an idea and a reason.'` |
| `a2b1-tightening/LT-sofie-11-J1-5` verdict quotes her error as 'Your words' | recurs | `recert-4/LT-sofie-11-J1-2`: `#10 'Your words: “we build spaceship”.'` (same row as (a)) |
| `a2b1-tightening/LT-sofie-11-J1-6` lowered 'to be safe' | not-seen | `#10 no 'one level lower to be safe' line; placement A2 matches answers (confidence low though).` |
| `recert-1/LT-sofie-11-J1-4` verdict text long and abstract | recurs | `recert-4/LT-sofie-11-J1-3`: `#10 'B1 was close, but a harder task fell short and what you said pointed lower, so you start at A2.'` Sofie: `the long sentence about a harder task falling short I did not really read` |
| `recert-1/LT-sofie-11-J1-5` B2 task marked fail though partial | recurs | `recert-4/LT-sofie-11-J1-1`: `#10 B2 task 'not yet' for an idea plus reason answer`. Screen: `B2 · Say it · not yet ... Your English read as A2 here, and this task was B2. Held back: "we build spaceship". You gave an idea and a reason.` |

## (c) This pass

- **LG-8 core-first slips (3f7d47e0):** yes, it leads with a core slip. Next focus: `Practise putting 'a' or 'the' before nouns: "we build spaceship" should be "we build a spaceship".` Slips: `“we build spaceship” → try “we build a spaceship”`, `“castle is boring” → try “a castle is boring”`, `“today i build a big house” → try “today I built a big house”`. The articles lead, the tense slip is third. Her listen answer (`the game was too hard for him`) carried no slip into either.
- **LG-55 goal-aim (1ee71f8c):** her goal, #4: `i want talk with people in roblox and understand english youtube without czech subtitles`. Task 5 asks a real situation's question: `You are playing a Roblox game with a new friend. They ask, "What did you do in the game today?" Tell them about one thing you did or saw, and why you liked it.` Task 4 is a Roblox teammate choice. The judge marked the tasks as her world (strength `recert-4/LT-sofie-11-J1-4`). I cannot tell from the transcript that the goal-aim rule produced task 5; it fits the aim either way. No repeated or near-duplicate prompts (tasks 1 and 2 differ: a game invite and a shop).

## (d) Placement

A2, confidence `low`, against her true band A2: exact. Phone line: `Linga's read from your answers, not a certificate. B1 was close, but a harder task fell short and what you said pointed lower, so you start at A2.` The earlier out-of-sample run placed her at B1, one band high.

## New findings that look like a regression

None. The rows are `recert-4/LT-sofie-11-J1-1` (verdict vs note), `-2` (headline), `-3` (long explanation), all recurrences of open rows, and `-4` a strength. Her ask, once more: `I want more praise first`.

## Result

3 rows moved to not-seen at LT (`a2b1-tightening` -2, -3, -6), 5 still recur (headline x3 as one finding across `a2b1` -5 and `recert-1` -3, `a2b1` -4 and `recert-1` -5 as the verdict-vs-note finding, `recert-1` -4 the long explanation), 0 were not evaluable.
