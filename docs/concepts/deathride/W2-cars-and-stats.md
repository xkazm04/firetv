# W2 Cars and stats — design before implementation (2026-09-30)

The [official Death Rally Classic listing](https://store.steampowered.com/app/358270/Death_Rally_Classic/) makes car choice and engine/tire/armor upgrades explicit. Its progression roster is a genre reference, not coefficients to copy. The separate experiment's `research/GAME-FACTS.md` was read as **unverified claims**; notably it says original handling coefficients were not found. We author original classes and verify our own tradeoffs.

Registry read: `data-driven-type-objects-over-subclass-growth`, `canon-as-single-source-of-thresholds`, `skill-scaling-versus-power-scaling`, `structural-economy-simulation-before-numbers`. Classes are data objects on the same simulation, not subclasses or hidden AI power multipliers.

## Model and grant path

Five original classes: **Needle** (light, quick launch, agile), **Line** (balanced), **Bastion** (heavy, armored, more mounts), **Comet** (straight-line speed, weak grip), **Trail** (high grip, moderate pace). Each is a separate CSV. Primary stats: Speed, Acceleration, Grip, Armor, Mass, Handling (1–10) and Slots (integer). One mapping CSV derives SI speed, acceleration, lateral grip/force, armor reduction, mass, yaw authority/response and mount capacity. Remaining baseline physical coefficients move to a single data resource. The renderer and phone show the same stat bars from the catalog. Selection is available in the lobby/results only, remote DOWN cycles P1, phone chooses its own slot. A selection updates the car's spec at a structural boundary; the next grid uses it. Six AI cars rotate through the roster; their driving skill remains separate.

No combat exists yet: Armor and Slots are declared for W4 and explicitly displayed as future combat capacity in this wave. Racing duel means two classes sharing a six-car grid, **not damage performance**. W3 owns mass collision response.

## Validation plan

Headless timed runs across tight, mixed, fast stadiums report a lap matrix. Paired racing duels swap grid positions over seeds to remove a fixed-slot advantage. At least two track types must have different fastest classes; no roster-wide winner may dominate every type. Handling, determinism and allocation gates remain. Pin declared stat ranges and mapping consumption; invalid IDs fail loudly. The comparison table and measured matrix follow after execution. Owner chooses feel; this wave cannot certify it.

## Authored roster and measured comparisons

| Class | Speed | Accel | Grip | Armor | Mass | Handling | Slots |
|---|---:|---:|---:|---:|---:|---:|---:|
| Bastion | 4 | 3 | 5 | 10 | 10 | 3 | 3 |
| Comet | 10 | 6 | 4 | 2 | 4 | 4 | 2 |
| Line | 6 | 6 | 6 | 5 | 5 | 6 | 2 |
| Needle | 5 | 9 | 7 | 2 | 2 | 9 | 1 |
| Trail | 5 | 6 | 10 | 4 | 4 | 7 | 2 |

Primary numbers are unitless ratings, with mappings in `stat-mapping.csv`; see `physics.csv` for the untouched Spike baseline. W2 simulation: three seeds ? six finishers = 18 finishes per class/type, three laps, 60 Hz JVM, no combat.

| Track type | Class | Mean race s | n |
|---|---|---:|---:|
| tight | Needle | 36.232 | 18 |
| tight | Line | 40.406 | 18 |
| tight | Bastion | 47.477 | 18 |
| tight | Comet | 45.750 | 18 |
| tight | Trail | 35.943 | 18 |
| mixed | Needle | 60.496 | 18 |
| mixed | Line | 63.442 | 18 |
| mixed | Bastion | 71.895 | 18 |
| mixed | Comet | 66.415 | 18 |
| mixed | Trail | 58.344 | 18 |
| fast | Needle | 101.224 | 18 |
| fast | Line | 97.452 | 18 |
| fast | Bastion | 113.056 | 18 |
| fast | Comet | 94.499 | 18 |
| fast | Trail | 102.205 | 18 |

`w2-duels.csv` records all 10 pairings on each of three track types, four alternating-grid seeds each (120 races). Trail leads tight/mixed; Comet leads fast. Comet originally lost on fast too; increasing authored acceleration/grip to 6/4 exposed its intended speed role while leaving tight-track weakness. Bastion is slower; its armor and mounts await W4 combat validation. These matrices cannot prove combat balance.

## Validation and device evidence

20 core + 3 link tests and Android debug build green. Installed `dev.deathride.tv` / Death Ride on AFTKM. `tools/wave-check.mjs ... 2` exercised all five selections, seven phone stat bars, start, real CDP touch throttle and lobby, with zero page exceptions. Remote DOWN cycled Trail to Needle; `w2-tv.png` confirms TV bars. APK SHA-256 `aa3eca31e68aae28a1037366023bd79ee3498677eda8e0ebabbc3345deedc2c8`. Feel and optical latency not measured.
