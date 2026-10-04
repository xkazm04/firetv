# Campaign + X3 audio merge

2026-10-03. One local merge on `deathride/main`, parents `7d3a21b` (audio)
and `cd89ea4` (Q0-Q4). Nothing pushed or installed on a device.

`World.reset` keeps both the observational event-ring reset and the supplied rig.
`RaceGame` keeps campaign transactions, menus, spectator rules and persistence
alongside audio lifecycle, UI cues and captions. `/stats` publishes both audio
and elimination/entrant fields. Automatic dispatcher placement now emits the
same successful mine-drop event as manual placement; arm/blast hooks survive.

## State cues and decisions

| Actual state | Narration |
|---|---|
| First-season opening / ordinary boss briefing | Existing debt / boss announcer |
| Saved boss recruitment / pending reward menu | Announcer ally; menu continues with Mechanic ally |
| Successful reward choice | Mechanic ally, replacing the current briefing; denied/stale choices retain denial feedback |
| Ox exposes the receipts in a saved settlement | Announcer ally, then Mechanic books |
| Saved seizure / seized retry preparation | Announcer seizure, held Mechanic seizure caption, rig, Mechanic duel |
| Actual elimination race starts | Announcer no-laps duel |
| Saved finale victory and restitution | Announcer freedom, then Mechanic after |

The short narrative sequence is bounded to four lines. Skip, pause and scene
exit clear it; starting immediately interrupts preparation without delaying
controls. Muted/missing media retains captions. The held seizure clip stays
unshipped. First-season debt narration no longer replays after liberation.

Campaign elimination takes precedence over lap/position audio: neither cue
plays in the death duel; ordinary races retain both. The dispatcher reuses the
accepted `ability.bone-rack` rear-rack tell because X3 has no dedicated rig take.
No new assets or generation spend. The 62-cue manifest and 52 installed files
are unchanged. Q3 qualifier licences, balance coefficients, reward selection
controls and the campaign application ID/port (`dev.deathride.campaign`, 8770)
are retained. No campaign mechanic was traded away for audio.

## Verification

[Evidence and source/APK hashes](../../../deathride/evidence/merge-campaign-audio/validation.json):
136 core, 3 link, 20 game tests; no failures/skips; required APK and desktop
distribution green. Dispatcher replay matches with observation on/off and
measures zero step allocations with the ring enabled. New tests cover real
dispatcher cues, no duel lap cues, saved recruitment/finale transitions, held
captions, mute and sequence cancellation.

All six controller browser suites pass. Actual host playback is confirmed for
the ally choice, seizure and no-laps duel. All five offline audio pages pass;
Q3/Q4 galleries load all 37 images. Native OpenAL passes eight voices including
a Music decoder, stealing, mute/pause/disposal and 3,970,682 decoded bytes.
Real GL atlas/text/fallback checks pass. APK SHA-256 is
`2aaf4c28ba9c1b51fbbec119fad5377d06aaa2074a7708d24e52eebfba31b36b`.

Initial test failures are retained: cross-module fixture setters, then missing
NPC fixture funds; public transactions and explicit diagnostic funding fixed
both. No runtime gate was relaxed. Logs normalize encoding/line whitespace.
Browser missing requests are the intentionally absent music. The full Q3 cohort
was not rerun; its progression/PR misses, Q4 frame tails, merged Stick playback
and owner listening/feel remain unqualified.

## Cleanup

After the merge commit, ancestry and the campaign worktree's clean status were
verified. All 2,436 ignored non-cache files were copied and rehashed, including
raw device results, saves, reports and APK/build outputs. The local archive is
[`deathride/build/campaign-worktree-archive/ignored-files.zip`](../../../deathride/build/campaign-worktree-archive/ignored-files.zip);
[its tracked manifest](../../../deathride/evidence/merge-campaign-audio/campaign-archive.json)
records every file hash. Only reproducible Gradle/Kotlin/Node/Python caches were
excluded.

`git worktree remove` unregistered the worktree but returned Windows
`Permission denied` during directory deletion. Automatic approval review then
rejected recursive cleanup as `blocked by policy`; it was not bypassed.
`C:\Users\kazda\kiro\firetv-deathride-camp` therefore has leftover files but is
no longer a registered worktree. The fully merged branch was deleted with
`git branch -d`. The archive is intact. Documentation was folded into the same
merge commit after cleanup; no extra commit or push.
