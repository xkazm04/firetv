# P1 Style and generation pipeline — design first

2026-10-01, ART on `deathride/art`. The approved local samples were inspected read-only: bold ink contours, cel-painted metal, sparse chips, dark glass, yellow/red/olive/orange/blue class accents. They approve the direction, not their perspective, crop, lettering or baked shadows. The scene is a mood reference, not a camera reference.

The compiler reads one immutable style block and versioned CSV briefs. `car-shapes.csv` remains the dimensional authority; the W6 addendum overrides the older prose size estimate. Source resolution is independent of world scale. Output cars use a declared pixels/metre density, art-derived pivots, and the existing simulation dimensions without retuning the game.

Generation uses the owner's Grok CLI only, one image tool call per job, no video, fresh isolated output folders, a proof before each batch, bounded concurrency and at most three attempts per asset. Every dispatch reserves an image before starting; uncertain/interrupted calls remain charged conservatively. A cross-process lock serializes budget updates, and a durable stop latch prevents any new dispatch after the first quota/rate-limit error. Already dispatched calls are recorded, never retried automatically. Accepted IDs are immutable.

Initial local weekly cap: 180 image attempts, zero videos; expected purposeful session consumption 80–140 if gates permit. This is a local spending guard, not a claim about the unknown subscription quota. Only the owner raises the cap. Earlier art-test usage is outside this new run and recorded as unknown, not zero account usage. A failed proof stops its batch; absence of owner approval does not become acceptance.

Validation: budget race/cap/stop tests, prompt identity and brief content assertions, resumability, proof binding to content hashes, generation sidecars and owner contact sheets. Required core/link/APK tasks must be green before commit. No runtime integration in P1.

Sources: Phase 2 sections a–g; Phase 1 g; W6 scale contract; Grok `game-assets` (assets/characters/tilesets/animation/ui-icons) and `imagine`; registry style locking, two-block prompt composition, colour roles, negative prompting, credit gating and generation-history notes. The old individual Grok skill paths have been consolidated under `game-assets`. The no-video phase rule overrides that skill's video-first animation default.

## Restart design, 2026-10-01

The inherited eight reservations include four interrupted jobs without returned images. Audit their specific local Grok transcripts before closing them as interrupted; retain all charges. New revision IDs in `p1-current.csv` replace only those interrupted jobs. The original CSV remains immutable evidence. Bind each new CLI call to an explicit session UUID so tool-call count, verbatim prompt, output path and errors can be verified even when stdout omits them. Observe quota errors while the process runs and latch the shared stop immediately. Return blocked records for queued jobs so a stop still produces a complete contact sheet. A missing output is never silently rerun.

## Executed result

Ten raw candidates now exist with hashes and sidecars. Eight calls in this resumed wave; 16 weekly reservations including four conservatively charged interruptions; 164 remain. Replay makes no calls. Seven Python gates pass and required Gradle tasks are green. `p1-evidence.json` records the output set. Inspection finds four car backgrounds ignore magenta and three tile outputs contain vehicles despite material briefs: these are P2 rejection inputs, not accepted assets. Neither owner quality nor Stick memory/look is measured.
