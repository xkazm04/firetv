# Owner audio choice (2026-10-02)

This file is the gate for X3 (`docs/concepts/DEATH-RIDE-AUDIO.md`). Audition: `deathride/audio/audition/index.html` (directions 01 Dust and drums, 02 Diesel brutalism, 03 Grindhouse funk, 04 Soot noir). Quoted verbatim, then the host's reading (marked as the host's).

## The owner's words

> A. Race music: Pretty good job with the music samples - 1,2,3 styles can be used across multiple tracks if developed further into full audio songs.
> B. Engine: 02 style would win yet different cars should have a bit different engine sounds and we should break down and triage in the future variants for each car type
> C. River Burst [sic, Rivet Burst] - 02 for standard machine gun would work well
> D. Mine Blast - 02
> E. Car crunch - no winner, 02 closest to sound of heavy metal collision
> F. Pickup - 01
> G. UI confirm - 04
> H - Voice announcer - 04. 02 can be assigned as supporting character (nervous helpful young mechanic, as parts store owner).
> F. Full tracks - we need to find way to escape the loops and create full 2-3 minutes audio tracks.

## Host reading (not the owner's words)

| Category | Choice | Notes |
|---|---|---|
| Race music | directions 01, 02 and 03 as the three style families; no 04 for race music | Each to be developed into full songs; several tracks across the three styles |
| Engine | 02 Diesel brutalism base | Per-car variants to be triaged in a later audition: ten car classes, each a distinct engine character (heavy diesel for Bastion/Bulwark, turbine whine for Comet, electric/arc for Kestrel, light buzz for Needle, and so on) |
| Rivet (standard machine gun) | 02 | |
| Mine blast | 02 | |
| Car crunch | no winner; 02 is closest to heavy metal collision | Use 02 as the base and iterate; a further take is allowed |
| Pickup | 01 | |
| UI confirm | 04 | |
| Announcer voice | 04's voice (`noir-voice`, Callum) | The page shows `dust-voice` and `noir-voice` are both Callum, two takes; the announcer is Callum with the noir read |
| Supporting character | 02's voice (`diesel-voice`, Harry) | The Mechanic: a nervous, helpful young mechanic who runs the parts store (the shop); ties to the campaign choice in `deathride/campaign/OWNER-CAMPAIGN-CHOICE.md` |
| Full tracks | two to three minutes, not loops | Needs a method that escapes the loop seam failures: see X3 below |

## X3 scope (a later run)

1. **Audio bible** (philosophy: raw, gritty, mechanical; buses, priorities, ducking, cooldowns, loop and tier rules), a **cue manifest** as data, and the in-game implementation (libGDX sound behind a cue service, procedural fallback, voice and memory budget, phone vibration kept separate).
2. **Effects set** in the chosen directions through the guarded tool: engine, tyre and skid and drift, collisions (car, wall, barrier), weapons (Rivet, Hammer, Mine and their hits and blasts), pickups, wreck, countdown and start, lap, victory and defeat stings, UI, abilities' tells, and so on.
3. **Per-car engine character triage**: an audition page of engine variants per car class (the owner picks), after the base is set; do not mass-generate all ten before the triage.
4. **Voice**: announcer (Callum) and the Mechanic (Harry) lines per the campaign plan; story-card narration optional.
5. **Full tracks**: research and prove a way to produce two to three minute songs without a loop (generate sections or longer single takes, structure with intro, verse, peak, break, outro; arrange and crossfade locally; loop-seam and loudness acceptance), then produce tracks in styles 01, 02 and 03. Music is the expensive call: the audition showed roughly 40 to 110 s costing about 4,000 to 4,500 credits in the Garden VR ledger.
6. **Credits**: the ElevenLabs account is shared with Garden VR (its runs spend from the same pool). On 2026-10-02 the balance was 24,672 of 90,000 and it resets 2026-10-04 19:31 UTC. Keep the 8,000 reserve. Spend now: effects and voices and at most one proof track; produce the full tracks after the reset.
