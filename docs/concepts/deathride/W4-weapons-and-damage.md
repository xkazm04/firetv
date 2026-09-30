# W4 Weapons, damage and controller layouts — design first (2026-09-30)

The official [Death Rally Classic description](https://store.steampowered.com/app/358270/Death_Rally_Classic/) identifies forward guns, mines, pickups and armor as genre ingredients. Our roster uses original names and coefficients. No assets are extracted. Registry read: `single-source-of-health-truth`, `hit-dedup-per-swing`, `death-via-state-tag-not-input-disable`, `telegraph-or-homing-for-area-effects`.

## Roster and authority

Data CSV defines **Rivet** (rapid forward hitscan; chase pressure; large ammo), **Hammer** (visible slow heavy projectile; limited ammo/cooldown; counters an armored car on a straight), **Mine** (rear drop; visible arming delay; counters a chaser but can catch its owner on a later lap). All time fields carry Seconds; range/speed carry meters. Pickups are authored as ammo and repair data with respawn time; W6 will place them, while the stadium initially uses two spaced spots.

`Combat` is the sole writer of car HP/state. Armor is a reduction from the W2 mapping, never a second HP pool. W3 contact peaks are consumed once per pair per cooldown; mines/projectiles have a per-activation hit bitset and reset every field on reuse. Wrecked is a state tag checked by integration, AI, weapon emission and race ranking. Wrecks stop racing; surviving last car can win by wrecking. A human wreck ends their participation, not the other human's race. No one-shot weapon is intended against a full-health unarmored car.

Use bounded projectile/mine storage and counters for pool exhaustion. Render placeholder projectiles, arming rings, shot traces and HP bars; no art/audio. A projectile blast has a short visible lifetime and hits each target once. Damage feedback uses the same HP on phone/TV and optional haptics. Armor/slots from W2 now have consumers: slots >=2 grants Hammer; a third mount increases its carried ammo. All cars retain Rivet and a utility Mine.

AI fires only with a visible forward target in range, uses heavy shots for long clear approaches, drops a mine when it perceives a close chaser, and respects all ammo/cooldowns/arming. No perfect hidden aiming. Combat is enabled in the actual game; existing movement-only fixtures keep it off deliberately so finish tests remain meaningful.

## Two-thumb layout experiment

Implement three selectable layouts, with mirroring for a left-handed player:

1. **Classic**: steer left; right thumb pedals plus separate fire/mine/swap. Familiar but asks the right thumb to leave GO. Suitable for deliberate coasting attacks.
2. **Cruise**: steering left; FIRE right also accelerates. BRAKE overrides drive, DRIFT sits alongside it; letting go stops propulsion/fire. Combines two frequent holds without an automatic always-on throttle.
3. **Split**: throttle is the vertical position on the steering pad, leaving the other thumb free for weapons/brake. More control per thumb but accidental acceleration is a risk; initial touch starts at zero and needs an upward drag.

Mine and swap are separated from the primary hold area, never activated by moving across another button. Pointer ownership is independent and capture-based. Layout changes neutralize controls. Keep explicit profile/layout names in settings and telemetry for owner feedback. Selectable layouts are experiments, not claims of ergonomic success.

## Verification

Tests: damage armor formula, no hits after wreck, blast dedup across multiple steps, mine arming window and owner vulnerability, ammo/cooldown limits, finite bounded pools, ram pair cooldown, pickups, deterministic seeded combat, zero allocations with weapons active. Stick check: all layouts, primary consumption and visible HP/ammo, secondary and swap reachable, stale controls clear. Report race duration/kill share in W8, not a fabricated balance verdict here.
