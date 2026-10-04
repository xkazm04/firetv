# Ability balance audit

Audited 66000 actual seeded races across 78 cells.

| Tier | Abilities | Class winner shares | Skill / straight / hairpin margin (s) | Findings |
|---|---|---|---|---|
| rookie | off | Needle 48.62%; Line 51.38% | 11.49 / 15.12 / 5.72 | none in this sample |
| rookie | on | Needle 47.24%; Line 52.76% | 10.88 / 16.84 / 5.28 | none in this sample |
| club | off | Bastion 48.75%; Trail 51.25% | 21.95 / 20.44 / 17.29 | none in this sample |
| club | on | Bastion 48.83%; Trail 51.18% | 22.48 / 20.25 / 17.51 | none in this sample |
| pro | off | Comet 50.25%; Flint 49.75% | 15.00 / 25.36 / 9.39 | none in this sample |
| pro | on | Comet 50.04%; Flint 49.96% | 15.64 / 25.99 / 9.78 | none in this sample |
| elite | off | Quill 49.38%; Vandal 50.62% | 12.04 / 21.00 / 6.81 | none in this sample |
| elite | on | Quill 49.44%; Vandal 50.56% | 12.01 / 21.61 / 6.88 | none in this sample |
| champion | off | Kestrel 47.50%; Bulwark 52.50% | 13.48 / 17.60 / 7.82 | none in this sample |
| champion | on | Kestrel 48.41%; Bulwark 51.59% | 13.51 / 16.69 / 8.28 | none in this sample |

## Findings

- roster-elite-skill-technical-on: unresolved=2, oneShots=0

## Early-wreck fairness

| Scenario | On / off before lap one | On samples |
|---|---|---|
| scrap-rookie | 0.00% / 0.00% | 2000 |
| scrap-club | 0.00% / 0.00% | 2000 |
| foundry-club | 0.00% / 0.00% | 2000 |
| crown-pro | 0.00% / 0.00% | 2000 |

## Homogeneous rotation cross-check

- rookie: 200 samples/class/course; orders agree {'technical': True, 'straight': True, 'loose': True}; alarms []
- club: 200 samples/class/course; orders agree {'technical': True, 'straight': True, 'loose': True}; alarms []
- pro: 200 samples/class/course; orders agree {'technical': True, 'straight': True, 'loose': True}; alarms []
- elite: 200 samples/class/course; orders agree {'technical': True, 'straight': True, 'loose': True}; alarms []
- champion: 200 samples/class/course; orders agree {'technical': True, 'straight': True, 'loose': True}; alarms []

| Homogeneous class | Technical mean (s) | Straight mean (s) | Loose mean (s) |
|---|---:|---:|---:|
| Needle | 43.69 | 241.93 | 76.21 |
| Line | 49.71 | 222.60 | 81.11 |
| Bastion | 58.30 | 198.36 | 88.49 |
| Comet | 49.50 | 183.96 | 80.59 |
| Trail | 38.60 | 227.96 | 62.71 |
| Flint | 41.48 | 215.99 | 68.64 |
| Quill | 38.94 | 202.59 | 66.42 |
| Vandal | 46.01 | 177.96 | 72.86 |
| Kestrel | 37.17 | 193.94 | 62.61 |
| Bulwark | 49.01 | 176.72 | 73.48 |

## Observed signature use

Equal-skill on-cells only; active time ends on finish or wreck. Courses have equal sample counts here; this is an observed rate, not a weighted human-play forecast.

| Class | Entries | Uses / active minute | Zero-use entries | Ability HP damage |
|---|---:|---:|---:|---:|
| Kestrel | 18000 | 1.554 | 15.80% | 16769.2 |
| Bulwark | 18000 | 2.158 | 1.24% | 0.0 |
| Bastion | 18000 | 1.005 | 25.66% | 5131.9 |
| Trail | 18000 | 1.450 | 35.16% | 0.0 |
| Quill | 18000 | 1.894 | 2.64% | 8987.4 |
| Vandal | 18000 | 1.404 | 6.33% | 24032.7 |
| Comet | 18000 | 3.747 | 0.00% | 0.0 |
| Flint | 18000 | 2.426 | 14.46% | 46676.2 |
| Needle | 18000 | 7.267 | 0.00% | 0.0 |
| Line | 18000 | 5.779 | 0.00% | 0.0 |

## Damage and first wreck

Ability share uses actual HP removed and the declared course weights. First-wreck quantiles below are conditional on observing a wreck; censored races are excluded from those quantiles, never assigned a made-up time.

- rookie: 0.00% of mixed-course HP damage from abilities.
- club: 1.08% of mixed-course HP damage from abilities.
- pro: 7.53% of mixed-course HP damage from abilities.
- elite: 4.30% of mixed-course HP damage from abilities.
- champion: 2.72% of mixed-course HP damage from abilities.

| Early on-scenario | Wreck observed / censored | Observed min / p50 / p95 (s) |
|---|---:|---|
| scrap-rookie | 0 / 2000 | unobserved / unobserved / unobserved |
| scrap-club | 0 / 2000 | unobserved / unobserved / unobserved |
| foundry-club | 0 / 2000 | unobserved / unobserved / unobserved |
| crown-pro | 106 / 1894 | 78.28 / 126.15 / 169.32 |
