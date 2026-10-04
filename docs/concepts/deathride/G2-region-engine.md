# G2 — Division regions without changing the race

2026-10-04. Design before implementation. `deathride/main` merged cleanly into
`deathride/tracks` as the first action. Read G0/G1, the dated owner decisions,
R0–R3 and the candidate export contract. At the start, R3's 102 choices were proposals, with
three unresolved finale arenas; production course geometry remains intact.

`core/src/main/resources/data/region.csv` is the runtime authority for the five
regions: division, names, material palette, candidate replacement slots, grade,
vignette, fog, weather families/rates/lifetimes/caps, weighted kept prop set,
procedural backdrop, ambience hook and plot. It also explicitly assigns default
production courses. Shared courses use their division's region during a campaign
event; free practice uses the course default. Drafts inherit their event region.
No save fields, event identities, geometry, grip, collision or race rules change.

Only the four exact kept props and existing screened art may appear. The owner approved all five G1 regions during this run; the 16 ground
recolours carry Keep and the dated decision reference, with original material
plus tint as fallback. Missing clinker/salt structures, generated panels and particle sheets
remain gaps. New weather and backdrops use bounded procedural presentation.
Owner browser-local picks cannot be read as repository decisions; recorded exports
are checked before staging and no approval is inferred.

Ground replacements occupy existing 256-square texture slots one-for-one, with
old textures disposed before replacement. Only one region is active. No new
atlas or render target is allocated, and the unused track-edge page remains
unloaded. The declared 31.25 MiB art ceiling including car reserve is retained.
Grade is applied to scenery/road colours in existing draws; gameplay tells and
HUD retain their contrast. Fog/vignette share the existing shape pass. Weather
reserves at most 24 of the current 160 motion-particle slots, leaving 136 for
vehicle dust (above G0's 72-slot minimum), independent of the separate 64 combat sprite slots. No world RNG,
surface, force, collision or fixed-step input is available to weather.

Validation will assert actual content, assignments, replacement hashes/rejection
rules, residency and bounded weather under long/irregular frames, plus identical
simulation state with different region presentation. Required Gradle tasks and
browser checks precede commit. Device evidence uses only `dev.deathride.regions`,
after a 254-host TCP/5555 scan and read-only foreground check. Busy means pending,
with no install, launch or force-stop. Report frame-time delta only if measured.
No paid image/audio generation, push or owner-feel claim.

Content inspection corrected G0's stale 96-slot premise: the merged drift renderer
already has 160 vehicle dust slots. G2 partitions that actual budget as 136 + 24;
it does not grow it or reduce the vehicle reserve to 72. Combat sprites retain
their separate 64 slots. A content assertion caught the discrepancy.

## Results and limits

G2 implemented after merge `eb4711de`. All 29 production courses, 35 stable campaign events and 103 R3 atlas entries have region assignments. The 102 draft JSON files carry region metadata, and each existing candidate ZIP gains a derived `region-membership.csv`. Content checks compare against the merged baseline: all original geometry/proof JSON values and every original ZIP entry are unchanged. The three pre-existing arena candidate failures remain failures; no proposed course becomes production by this work.

Ground variants are the 16 exact G1 recolours with SHA-256 checks and explicit Keep status linked to the owner decision of 2026-10-04. Reject, unknown status, malformed metadata, missing files and hash mismatch fall back. The four exact kept prop exports are verified across 11 memberships. No rejected prop is restored, owner decision edited, or paid-provider ledger changed. Grade is a single RGB multiplication inside the existing scenery shader. Procedural backdrops, banner silhouettes and weather cover the missing G1 art without implying its completion.

Validation is green: **202 core + 8 link + 43 game tests**, `:app:assembleDebug` with application ID **dev.deathride.regions**, candidate export contract, Track Lab simulation/browser checks, archived track atlas and 103-card candidate atlas at 1440/390 widths. The Track Lab ZIP test was updated from nine to ten files and checks the derived region membership contents. All new replay comparisons have identical physics hashes; the v6 save round-trip stays unchanged.

`deathride/evidence/regions/g2/render.json` records 45 actual desktop GL captures: one R3 course, five regions, three views and three material modes. The final capture set uses owner-kept `scrap-1-c`, with the shared simulation hash recorded in `render.json`; each active-art measurement is 19,660,800 bytes (18.75 MiB), with zero growth on region changes and zero new framebuffers. This is the loaded subset; the active bundle plus car reserve still validates at the declared **31.25 MiB** ceiling. Five actual RaceGame division menus are captured under `ui/`, using in-memory fixtures with **zero profile writes**. Screenshot inspection caught and corrected a fixture-ID replacement before final captures. Car colours and road markings remain readable in the captures; owner readability and motion acceptance are still pending.

Stick status: **pending-busy**. Scanned all 254 hosts of `10.0.0.0/24` for TCP/5555; `10.0.0.139:5555` is running `dev.deathride.perf`. No install, launch or force-stop was performed. Frame-time delta is **null/unmeasured**, not zero; screenshots and comparative device timing remain required. The isolated APK identity is verified in `apk-identity.txt`. Debug-only extras on that package support `region`, `regions=off` (baseline presentation) and `regionCandidates=off`; release and `dev.deathride.tv` cannot activate these overrides. Device timing must compare the same course/camera/entrants with presentation off/on, after warm-up, and report distributions and deltas without claiming desktop timing as Stick evidence.

No Grok, ElevenLabs or other provider spend; no push. G2 is engine/data delivered with its device timing gate pending, not a claim of runtime owner approval or completed Stick validation.

Owner update incorporated before the final wave commits: concurrent host commit `f88f41be` recorded ?Regions all approved? and R3 triage (the recorded Keeps, Rejects and unreviewed candidates, including the already accepted Runoff). The G1 approval covers delivered ground variants and kept-prop memberships; it does not conjure missing images or prove their technical gates. The runtime manifest now carries Keep with that exact evidence. Candidate/Maybe/reject fallback support remains tested. The comparison course was changed from rejected `scrap-1-a` to kept `scrap-1-c` and all 45 captures rebuilt. Production track selection, three scrap-7 replacements and the kept Crown finale's technical repair belong to the separate apply run; G2 does not apply or redesign the library. The prior owner's regions/track decisions are preserved verbatim.
