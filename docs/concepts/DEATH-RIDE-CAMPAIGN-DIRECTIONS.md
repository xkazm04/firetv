# Death Ride: campaign direction triage (K1-K2)

Written 2026-10-02. The owner wants to triage the campaign direction before the story, rival cast, events and tone are developed further, the same way the art directions and the audio directions are triaged: **a few genuinely different options on one comparison page, then the owner picks or fuses.**

## What exists (read first)

- `docs/concepts/DEATH-RIDE-PROGRESSION.md` (power rating, archetypes, the stats timeline, the "Ash Circuit" story proposed on 2026-10-01: a debt owed to a league boss Marrow, five divisions, boss rivals Rook, Ox, Vex, Mica and Marrow, side contracts and grudges).
- `docs/concepts/deathride/C4-ash-circuit.md` and the implemented career (35 events, 18/21/24 laps, rival garages that buy through the shop, tiers Rookie/Club/Pro, simulated 5.9-6.5 h active time), `G2-REPORT.md`, `W7-campaign.md`.
- The ten car classes and their abilities (`deathride/core/src/main/resources/data`), the weapons Rivet/Hammer/Mine, surfaces and the ten-plus tracks in five themes, the fusion art direction and rival portraits (`deathride/art/OWNER-CHOICE.md`, `art/review/fusion`).
- The owner's constraints: the campaign must put the player through **a story**, with **difficulty and stats timeline** (poor car and poor opponents at the start, money from wins buys upgrades or a new car, opponents' stats rise to match), cars with visible strengths and weaknesses, and original content (nothing from the arcade game or the Death Rally titles; no franchise names).

## K1 Directions (design note first)

Produce **four distinct campaign directions**, each fully specified at the same depth so they compare fairly:
1. **Ash Circuit (the current one)**: debt and revenge in a blood-money league; the baseline.
2. **A different premise with a different structure**, for example (rename and replace freely, keep them truly different in structure, not just plot): a **convoy / road-passage** campaign (race to survive crossing a wasteland, towns as hubs, the road is the track, the garage travels with you); a **televised blood-sport league** (sponsors, ratings, celebrity rivals, satire, the audience decides rules); an **underdog crew** campaign (build a team of drivers and a garage, recruit rivals, each act changes who you race for); a **territory war** (take over circuits town by town, rival gangs hold regions, a map layer between races).
3. and 4. likewise, with a different tone from the others (gritty serious, dark comedy, pulp melodrama, mythic).
For each direction give, in one page of structure: the premise in three sentences; the **tone words** and an art/audio fit note (it must suit the fusion art direction: raw, wasteland, rough); the **structure** (acts, hubs or map, how many events, what repeats and what changes); **how the player progresses** (money, parts and cars, unlocks, how the opponents' stats track the player: the PR ratio curve with boss dips from `DEATH-RIDE-PROGRESSION.md`, no rubber band); the **rival cast** (five to eight named originals with one-line personalities and which of the ten car classes they drive, plus a final antagonist); **event types and side content** (contracts, grudges, special rule races, destruction derbies, boss races, sponsor challenges), mapped onto mechanics that **already exist or are cheap to add** and flagged where they need new systems (be honest about cost: S/M/L); **sample story-card text** (three cards, three lines each) and **three rival taunts** per direction; **risks** (scope, repetition, tone clash, content volume) and what the campaign data model would need (reuse the existing `career` data: events, divisions, rivals, unlocks).
Do not copy any film, game or franchise story, characters or vehicles; take only feeling.

## K2 The triage page

Build `deathride/campaign/directions/index.html` (static, offline, no build; inline CSS and JS; dark and light; mobile-friendly; a clean "magazine" layout): one card per direction with the premise, tone, structure diagram (simple inline SVG of the act or map structure), rival cast table, the PR-ratio curve sketch (inline SVG, labelled as design intent), sample cards and taunts, risks and cost, and a comparison matrix across the four (scope cost, fit with existing systems, replayability, tone fit, content volume, risk). Use the rival portraits from the fusion review where the cast overlaps (read from the repo, do not regenerate; no Grok or ElevenLabs spend in this task).
Write `deathride/campaign/CHOICES-TEMPLATE.md` (what the owner should answer: pick one, fuse, or reject; the three questions that most change the build).
Honest labelling: all of this is design intent; nothing has been played.

## Rules

Text and static HTML only; no changes to game code or data in this run (a later run implements the chosen direction). One design note (`docs/concepts/deathride/K1-campaign-directions.md`), a status row, a session-log entry and one commit per part. Never push, never ask a question.

| Id | Wave | Status |
|---|---|---|
| K1 | Four directions, design note | complete — 2026-10-02; [K1 note](deathride/K1-campaign-directions.md); design intent, owner choice pending |
| K2 | Triage page, comparison matrix, choices template | complete — 2026-10-02; [offline page](../../deathride/campaign/directions/index.html), [choices template](../../deathride/campaign/CHOICES-TEMPLATE.md), [K2 note](deathride/K2-triage-page.md); owner choice pending |

## Session log

### K1 — 2026-10-02

Read progression, C4, W7, G2, fusion owner choice/review and current career, roster, ability, weapon, surface and track data. Wrote [four comparable directions](deathride/K1-campaign-directions.md): Ash Circuit, Last Passage, Dead Air Championship and The Common Road. Each includes structure/counts, progression, five rivals plus a final antagonist, mechanic/cost mapping, three three-line cards, three taunts, risks and model changes. Distinguished signature cars from actual tier purchases, three AI settings from five licence tiers, proposed PR dips from G2's misses, and closed circuits from physical convoy/map systems. Read the cast/contract consumers to identify hard-coded Ash identities; alternatives include their generalization cost. Checked local source links and content counts; no game tests or new play evidence were needed for this text-only part. Game code/data/assets unchanged, zero Grok/ElevenLabs spend, no push. K2 page/template remains next; owner direction and all proposed feel remain unmeasured.

### K2 — 2026-10-02

Wrote [K2 design/verification note](deathride/K2-triage-page.md), [static triage page](../../deathride/campaign/directions/index.html) and [choices template](../../deathride/campaign/CHOICES-TEMPLATE.md). Four complete direction articles, six-criterion matrix, four structure SVGs and four explicitly unmeasured PR SVGs; six existing fusion portraits are referenced only for the Ash cast. Native offline HTML contains all content; inline CSS supports dark/light/mobile/print and inline JS only switches theme. Thirteen browser configurations pass: five widths (320–1440 px) in both themes, two no-JS configurations and denied-storage fallback/keyboard/print. Fixed narrow-grid overflow; source disclosure also fits at 320/390/1440. Local links, images, labels, counts and navigation pass with zero page errors/HTTP requests. Inspected desktop/mobile, matrix and diagram captures; temporary evidence stays outside the repository. All deliverables remain design intent, with G2's missed boss targets disclosed. Game code/data/assets unchanged, no gameplay build or new play evidence, zero Grok/ElevenLabs spend, no push. No K1/K2 work remains; owner choice, implementation, pacing and feel validation are future work.
