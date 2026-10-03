# AUDIO X3 handoff

Branch `deathride/audio-x3`. Six waves, one commit each; never pushed.

| Wave | Result |
|---|---|
| 1 | Audio bible, 62-cue data contract, honest seam repair plan |
| 2 | 34 new + 6 reused effects; 40 final technical passes; first failures retained |
| 3 | Ten car classes × two small engine proofs; 20 passes; no production car selections |
| 4 | Six Callum + eight Harry lines; 13 passes, one held; captions for all |
| 5 | libGDX manifest cue service, buses/ducking/priorities/cooldowns, cap 8, silent fallback; 144 tests + APK pass |
| 6 | One local 150-second style-01 song, four repaired transitions, full-set research and six future dry runs |

## Review pages

- Effects (including original and revised crunch):
  file:///C:/Users/kazda/kiro/firetv-deathride-audiox/deathride/audio/x3/effects/index.html
- Ten-class engine triage, two short candidates per class:
  file:///C:/Users/kazda/kiro/firetv-deathride-audiox/deathride/audio/x3/engines/index.html
- Campaign voice script and takes:
  file:///C:/Users/kazda/kiro/firetv-deathride-audiox/deathride/audio/x3/voices/index.html
- One full-song proof and section navigation:
  file:///C:/Users/kazda/kiro/firetv-deathride-audiox/deathride/audio/x3/music/index.html

Pages are offline, have dark/light themes, one-player behavior and local note
export. Technical pass is not owner selection or human semantic acceptance.
Automated browser notes live only in the disposable test profile.

## Build and runtime

From `deathride/`: `gradlew.bat :core:test :link:test :game:test :app:assembleDebug`.
Final evidence: `runtime/validation.json`, `runtime/build.log`. 124 core, three
link, 17 game tests; all pass. Debug APK at `app/build/outputs/apk/debug/app-debug.apk`.
52 unique clips decode to 3,970,682 PCM16 bytes, under 6 MiB; installed APK hashes
match. Native host exercise includes one Music decoder + seven Sounds and proves
the shared cap, stealing and disposal. Hidden full-game smoke reached a six-car
race. No physical Stick was attached; actual native PSS and speaker mix unmeasured.

M / Y toggles saved master mute. N / X skips narration. Captions survive mute or
missing clips. Phone vibration remains separate. Missing music is silent; the
local proof and engine-triage candidates do not ship. New owner campaign beats
remain available in the manifest but are gated by the campaign's actual states.

## Spend and next run

Live balance 24,672 before -> 22,913 after. Conservative charge 6,400/9,000;
provider-header confirmed 1,759; reserve 8,000 preserved. All 68 paid takes have
resolved ledger records. No paid music in X3. `spend-summary.json` records the
separate credit measures; shared account delta is not treated as an invoice.

Reset: 2026-10-04 19:31:41 UTC. See [music research](music/RESEARCH.md) and
`music/cost-plan.json`: six 120-second songs across styles 01/02/03, 43,200 base
estimate, 54,000 with bounded repairs, 62,000 including reserve **plus Garden VR
allocation**. First stage is one per style. Nothing is scheduled or prepaid.

## Remaining decisions and device work

Campaign merge update (2026-10-03): Q0-Q4 now supplies these states on
`deathride/main`. Ally promotion/choice, Ox's receipts, seizure (including the held
caption), rig briefing, actual elimination start and saved finale victory are wired.
See [merge evidence and behavior decisions](../../../docs/concepts/deathride/MERGE-campaign-audio.md).
The original X3-only limitations below are historical; merged Stick playback still
needs device qualification.

1. Owner audition: crunch retry, per-class engine character, voice delivery/text,
   and the synthesized song's musical/style value. Signal screens cannot choose
   these. Generate full per-car engine sets only after those choices.
2. Held `voice.mechanic.seizure`: 55.52% measured silence exceeds the 45% screen.
   Original and edited candidate remain playable; no paid retry or undisclosed
   speech retiming. Runtime uses the caption while the clip is absent.
3. Campaign supplies the new Marrow seizure, ally rewards and no-laps finale
   states before those prepared lines can trigger. Current lap-based duel must
   not play the no-laps announcement. This task did not rewrite the campaign.
4. On a Stick, verify cold/warm playback, pause/resume, narration skip and captions,
   SoundPool onset behavior, eight-voice stress, actual process/audio memory,
   controller vibration independence, mono TV mix and long-race fatigue. If a
   missing/failed clip appears, keep fallback and retain the failure evidence.
5. After the reset and live shared-budget reconciliation, audition a full paid
   song per style before commissioning the other three. Adaptive excerpts/stems
   and their exact bar/loop seams are still a separate measured asset task.
