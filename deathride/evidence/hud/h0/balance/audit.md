# Ability balance audit

Audited 3120 actual seeded races across 78 cells.

| Tier | Abilities | Class winner shares | Skill / straight / hairpin margin (s) | Findings |
|---|---|---|---|---|
| rookie | off | Needle 48.75%; Line 51.25% | 11.42 / 15.00 / 5.96 | none in this sample |
| rookie | on | Needle 45.62%; Line 54.37% | 10.72 / 16.83 / 5.41 | none in this sample |
| club | off | Bastion 47.50%; Trail 52.50% | 21.98 / 18.36 / 17.11 | none in this sample |
| club | on | Bastion 50.00%; Trail 50.00% | 22.09 / 20.85 / 17.98 | none in this sample |
| pro | off | Comet 50.00%; Flint 50.00% | 15.39 / 26.50 / 9.97 | none in this sample |
| pro | on | Comet 50.62%; Flint 49.38% | 15.44 / 27.53 / 9.69 | none in this sample |
| elite | off | Quill 49.38%; Vandal 50.62% | 11.79 / 20.33 / 7.19 | none in this sample |
| elite | on | Quill 49.38%; Vandal 50.62% | 11.79 / 22.48 / 6.98 | none in this sample |
| champion | off | Kestrel 45.00%; Bulwark 55.00% | 13.78 / 16.32 / 7.49 | none in this sample |
| champion | on | Kestrel 45.63%; Bulwark 54.37% | 13.53 / 18.44 / 7.55 | none in this sample |

## Findings

No numeric alarm fired in the examined cells; missing sections or sample sizes prevent acceptance.

## Early-wreck fairness

| Scenario | On / off before lap one | On samples |
|---|---|---|
| scrap-rookie | 0.00% / 0.00% | 40 |
| scrap-club | 0.00% / 0.00% | 40 |
| foundry-club | 0.00% / 0.00% | 40 |
| crown-pro | 0.00% / 0.00% | 40 |

## Homogeneous rotation cross-check

- rookie: 40 samples/class/course; orders agree {'technical': True, 'straight': True, 'loose': True}; alarms []
- club: 40 samples/class/course; orders agree {'technical': True, 'straight': True, 'loose': True}; alarms []
- pro: 40 samples/class/course; orders agree {'technical': True, 'straight': True, 'loose': True}; alarms []
- elite: 40 samples/class/course; orders agree {'technical': True, 'straight': True, 'loose': True}; alarms []
- champion: 40 samples/class/course; orders agree {'technical': True, 'straight': True, 'loose': True}; alarms []

| Homogeneous class | Technical mean (s) | Straight mean (s) | Loose mean (s) |
|---|---:|---:|---:|
| Needle | 43.77 | 241.92 | 76.43 |
| Line | 49.80 | 222.87 | 80.64 |
| Bastion | 58.96 | 198.67 | 88.21 |
| Comet | 49.61 | 184.13 | 80.61 |
| Trail | 38.61 | 227.94 | 62.69 |
| Flint | 41.56 | 216.52 | 68.42 |
| Quill | 39.06 | 202.71 | 66.41 |
| Vandal | 45.70 | 178.45 | 73.02 |
| Kestrel | 37.28 | 194.05 | 61.89 |
| Bulwark | 48.90 | 176.38 | 73.27 |

## Observed signature use

Equal-skill on-cells only; active time ends on finish or wreck. Courses have equal sample counts here; this is an observed rate, not a weighted human-play forecast.

| Class | Entries | Uses / active minute | Zero-use entries | Ability HP damage |
|---|---:|---:|---:|---:|
| Kestrel | 360 | 1.490 | 18.89% | 312.5 |
| Bulwark | 360 | 2.138 | 0.83% | 0.0 |
| Bastion | 360 | 1.013 | 23.61% | 94.0 |
| Trail | 360 | 1.473 | 34.17% | 0.0 |
| Quill | 360 | 1.868 | 3.33% | 178.2 |
| Vandal | 360 | 1.454 | 6.11% | 491.7 |
| Comet | 360 | 3.778 | 0.00% | 0.0 |
| Flint | 360 | 2.408 | 13.89% | 967.6 |
| Needle | 360 | 7.266 | 0.00% | 0.0 |
| Line | 360 | 5.776 | 0.00% | 0.0 |

## Damage and first wreck

Ability share uses actual HP removed and the declared course weights. First-wreck quantiles below are conditional on observing a wreck; censored races are excluded from those quantiles, never assigned a made-up time.

- rookie: 0.00% of mixed-course HP damage from abilities.
- club: 0.97% of mixed-course HP damage from abilities.
- pro: 8.24% of mixed-course HP damage from abilities.
- elite: 4.30% of mixed-course HP damage from abilities.
- champion: 2.59% of mixed-course HP damage from abilities.

| Early on-scenario | Wreck observed / censored | Observed min / p50 / p95 (s) |
|---|---:|---|
| scrap-rookie | 0 / 40 | unobserved / unobserved / unobserved |
| scrap-club | 0 / 40 | unobserved / unobserved / unobserved |
| foundry-club | 0 / 40 | unobserved / unobserved / unobserved |
| crown-pro | 2 / 38 | 150.05 / 150.05 / 177.42 |
