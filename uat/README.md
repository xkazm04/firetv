# UAT overlay — Linga

Simulated user acceptance testing for the Study Desk's **Linga** module only, driven by the `/uat` skill (`.claude/skills/uat`, linked from `ai-registry/skills/uat`). The skill is the engine; this directory is the per-app overlay.

Maths (Math Buddy) and writing (Essay Master) are out of scope for this overlay. A journey that wanders out of Linga is a finding about the exit, not a journey into another module.

## Levels in this repo

The skill defines two levels. This overlay adds a third between them, because Linga's value lives in prompts and model output that neither code-reading nor a browser measures cheaply.

| Level | What runs | Engine | Cost | Status |
|---|---|---|---|---|
| **L1 — theoretical** | A walker reads the code and walks the journey on paper | none | cheap | available through the skill |
| **LT — text-live** | The real server command surface (`englishCommand`) with a real model as the tutor, a model playing the Character, and a model judging the transcript | codex-cli (`gpt-6-astra` by default) | medium, parallel | **this overlay's workhorse** |
| **L2 — empirical** | A real browser on the TV and phone pages | claude (manual, with the owner) | expensive, serial | not scaffolded yet |

**LT is deliberately not claude.** Claude models are kept for manual testing with the owner; LT runs codex for all three roles (tutor, Character, judge). A model judging its own tutor output is a known bias — every LT verdict names the engine, and anything that matters is re-checked at L2.

LT certifies what the prompts and server logic do for a user: the level the check lands on, the topics it proposes, how the partner pitches its English, whether moments are correct, whether boundaries hold. It cannot see layout, audio, speech recognition or latency on the real engine — those stay L2's.

## Layout

```
uat/
  README.md              this file
  rubric.md              dimensions, Linga metrics (with their units), impact scoring, finding schema
  env.md                 how to run each level; engine switches; data isolation
  accepted-gaps.md       known and accepted issues
  characters/*.md        ten Characters; each has a `sim` JSON block the LT driver reads
  journeys/*.md          five Linga journeys: goals and definitions of done, not scripts
  driver/linga-text.cjs  the LT driver
  driver/surface.cjs     what a Character sees and can do: LingaTV and LingaPhone rendered for the session
  runs/<id>/             findings.json, report.md, SUMMARY.md, per-Character transcripts and voices
```

## Run

```bash
node uat/driver/linga-text.cjs                       # every Character, their bound journeys, in parallel
node uat/driver/linga-text.cjs viktor-67 adela-17    # only these Characters
node uat/driver/linga-text.cjs --journeys J1,J2      # only these journeys
```

See `env.md` for the engine switches. A run writes `uat/runs/<date>-lt/`.

## Character template

Every Character file has the prose the skill asks for (background, voice, jobs-to-be-done, what good looks like, pet peeves, motivation in minutes, senior-quality bar, scored criteria, surface binding) and one fenced `sim` JSON block:

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

- Analysis documents: `docs/uat-insights/<run-id>.md`
- Backlog: `docs/BACKLOG.md` (section `## Linga`)
- Concept documents: `docs/` beside `LINGA-PLACEMENT-DESIGN.md`

## Skill improvement log

- 2026-09-15 — Adopted for Linga with an added **LT (text-live)** level on codex-cli. Proposal for the method, not applied: the skill has no level for AI products whose value is prompt output reachable through a server command surface without a browser; LT fills it and should be judged on whether its findings survive L2.
