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

## Resumed execution contract (after W6, before code)

W6 now supplies pickup locations and the actual larger car dimensions. Combat detection uses the same three-circle bodies and swept projectile paths; wall clearance and firing position derive from those dimensions. `Combat` owns HP arrays and ACTIVE/WRECKED state tags; UI, AI and scoring only read them. Finished cars are no longer valid combat targets. Destroyed cars remain physical obstacles with damped velocity; no input, weapon or pickup can revive them. Last survivor wins by elimination, while wrecked humans can watch until all human seats resolve. Ram cooldowns are per pair; area hit masks belong to the activation pool entry and reset on reuse.

Initial roster coefficients, authored next in CSV: 100 HP; Rivet 3 damage every 0.20 s, 180 rounds, 48 m range; Hammer 26 damage every 1.4 s, 5 rounds (extra on three mounts), 55 m/s visible projectile over 65 m; Mine 30 damage, 4 charges, 2.5 s drop cooldown, 1.4 s arming, 5 m blast, 18 s lifetime. Armor uses the W2 reduction. The stock rapid gun takes at least 6.6 seconds of perfect unarmored contact to wreck; no weapon one-shots. Mine lead time exceeds a 0.25 s perception allowance plus 5 m traversal at a declared 10 m/s reference speed. This is an authored readability budget, not a human reaction result. Ring plus flashing mine state are visual cues; no audio or reliable haptic channel is assumed.

AI uses its existing reaction schedule, forward/lateral perception and a per-target attacker cap; it drops hazards only with a close chaser, and steers away from perceived armed mines. There is no target-seeking projectile or physics boost. Weapon, pickup, combat tuning and controller-layout definitions are data; all pools have explicit capacities. The protocol keeps `f` for the optical flash and adds absolute `fire`, `mine`, `weapon` states. A stale/disconnected/layout-switched phone clears all attacks. Fire is a hold, mine a hold with cooldown, weapon selection an explicit index so packet repeats cannot cycle it.

Two-thumb choices remain Classic, Cruise and Split with a left-handed mirror. Cruise combines GO with firing; Split adds an intentional upward drag on the steering pad for throttle. Mine/swap are separate targets with pointer capture, and opening any settings sheet neutralizes the car. Phone and TV show HP, selected weapon, ammunition, mine stock and cooldown. Tests will drive true independent touch pointers, layout changes, mirror and reconnect over the Stick connection; comfort remains for the owner.


## Executed and tuned result, 2026-09-30

The initial 20-race physical sample exposed a grid burst problem: first wreck 1.58-6.02 seconds, 4.35 wrecks/race, with deaths attributed to Rivet 43 / Hammer 11 / Mine 24 / ram 9. This was not acceptable opening pacing. The final CSV reduces damage to Rivet 2.4, Hammer 21 and Mine 24, and introduces a visible four-second start-protection/weapon-arming period. No ammunition is spent before it expires. Final 20 races over all five tracks: 43.15-117.28 seconds to all cars resolved; mean 3.35 wrecks/race; first wreck 8.35-18.07 seconds. Final kill sources: Rivet 37 / Hammer 7 / Mine 18 / ram 5 / wall 0; one-shot kills 0. This small seeded sample is tuning evidence, not a human balance verdict. Full G1 matrix remains W8.

`gradlew :core:test :link:test :app:assembleDebug`: green, 41 core + 3 link tests. Combat tests assert actual damage/armor, shooter exclusion, arming, blast dedup, owner mine vulnerability, capacities, pickup caps/respawn, wreck rejection, elimination, ram cooldown, deterministic full races and 10,000 live weapon steps allocating zero bytes (resets outside the measured intervals). Link test sends fire/mine/weapon and optical-flash fields together and verifies they are distinct.

`tools/combat-check.mjs` on AFTKM, 1080p, with installed Chrome CDP touch over LAN: all three layouts emit real primary/heavy/mine inputs, consume ammo, preserve independent steering/fire/release, and apply their declared throttle behavior. Mirroring and disconnect clearing verified. Screenshots and device JSON in `deathride/evidence/phase1/w4-*`. Physical-phone ergonomics, vibration support, owner fun and optical latency **not measured**. No audio was added. This wave has an on-device behavior check; the sustained all-effects performance/thermal claim is reserved for W8. Latest release-id APK remains installed, SHA256 `2f763e9f28e8c84953bc0a3d29d62546bbe1a42c1975f82d3db08afc581b433d`.


## WPN-A addendum, 2026-10-06: cooldowns, bursts and heat

Owner request: weapons must not be permanently available, and the machine gun fires a round of bullets per click. Rivet (ray) is now a burst weapon (6 bullets 0.06 s apart, 1.2 s cooldown from the last bullet, repeat cycle 1.5 s); Rivet and Scatter add a heat model (heat per bullet/shot, cooling per second, lockout at 1.0, resume at a fraction). Hammer/Mine keep cooldown plus scarce ammo. Cooldown state is per car and weapon, so swapping never resets another weapon. All numbers are columns of `weapons.csv` with a rationale column; `Combat` owns bursts and heat, AI uses the same `fire()` gate, and `setAmmo` is test-only.

Measured with `weaponCooldownReport` (300 seeded all-AI races per balance scenario; the AI barely sustains fire, so these races are tap-fire pressure): the old continuous Rivet gave 1.37-1.86 wrecks/race and a first wreck at 28-32 s. Bursts at 2.4 damage raised AI wrecks to 1.74-2.24 per race (a committed burst lands every tap) so bullet damage went to 2.0: 1.66-2.15 wrecks/race, first wreck 26-31 s, Rivet kill share 0.13-0.20 (was 0.03-0.11), 28-46 % of races see some weapon lockout, no one-shot. Sustained held-FIRE damage over 10 s fell from 12.0 to 8.4 dps (time to wreck a Needle 13.8 s to 22.6 s): deliberate, it is the requested end of permanent access. Total damage in a full Rivet magazine falls from 432 to 360. Candidates tried: damage 2.4 at 1.0/1.2 s, 2.8 at 1.2 s, 3.0 at 1.4 s, 1.8/2.0 at 1.2 s, 2.0/2.2 at 1.4 s. Telemetry fields are additive: `Combat.burstRemaining/cooldownFraction/heatFraction/overheated/fireCount`, `Snapshot.weapon*`, phone/stats `weaponStates`. Replay hashes of races with firing changed; CollisionGolden re-recorded.
