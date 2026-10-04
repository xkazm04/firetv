"""Independent raw-row audit; thresholds are read from shipped canonical CSVs."""
import argparse
import csv
import gzip
import hashlib
import json
import math
import statistics
from collections import defaultdict
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('directory', type=Path)
parser.add_argument('--strict', action='store_true')
args = parser.parse_args()
data = Path(__file__).resolve().parents[1] / 'core/src/main/resources/data'
def table(name):
    return list(csv.DictReader((data / (name + '.csv')).open(encoding='utf-8-sig')))
def rules(name):
    return {r['key']: float(r['value']) for r in table(name)}
roster = rules('roster-rules')
combat = rules('combat-depth-rules')
balance = rules('balance-rules')
weights = {r['id']: float(r['mixedWeight']) for r in table('roster-courses')}
cars = table('cars')
pairs = defaultdict(list)
for car in cars:
    pairs[car['tier']].append(car['id'])
car_stats = {car['id']: table('cars/' + car['id'])[0] for car in cars}
assert abs(sum(weights.values()) - 1) < 1e-9
def percentile(values, fraction):
    if not values:
        return None
    return sorted(values)[max(0, math.ceil(len(values) * fraction) - 1)]
def distribution(values):
    return {'observed': len(values), 'min': min(values) if values else None,
            'p05': percentile(values, .05), 'p50': percentile(values, .5),
            'p95': percentile(values, .95), 'max': max(values) if values else None}
def wilson(wins, n):
    z = 1.96
    centre = (wins / n + z*z/(2*n)) / (1+z*z/n)
    half = z * math.sqrt(wins/n*(1-wins/n)/n+z*z/(4*n*n)) / (1+z*z/n)
    return [centre-half, centre+half]
findings, cells, cell_seeds = [], {}, {}
all_class = defaultdict(lambda: {'entries': 0, 'uses': 0, 'zeroUseEntries': 0, 'activeSeconds': 0.0, 'abilityDamage': 0.0})
for file in sorted(list(args.directory.glob('*.csv')) + list(args.directory.glob('*.csv.gz'))):
    cell_key = file.name.removesuffix('.gz').removesuffix('.csv')
    if not file.name.startswith(('roster-', 'early-', 'rotation-')):
        continue
    with (gzip.open(file, 'rt', encoding='utf-8-sig') if file.suffix == '.gz' else file.open(encoding='utf-8-sig')) as handle:
        rows = list(csv.DictReader(handle))
    assert rows, file
    classes = defaultdict(lambda: {'wins': 0, 'entries': 0, 'finishSeconds': [], 'penalizedSeconds': [], 'uses': 0, 'zeroUseEntries': 0, 'activeSeconds': 0.0, 'abilityDamage': 0.0})
    hashes, seeds, first_wrecks = set(), set(), []
    grid = defaultdict(lambda: defaultdict(int))
    lane_grid = defaultdict(int)
    seed_signs = defaultdict(int)
    unresolved = one_shots = early = unsettled_leads = 0
    ability_damage = total_damage = 0.0
    for row in rows:
        hashes.add(row['hash']); seeds.add(row['seed'])
        seed_signs['negative' if int(row['seed']) < 0 else 'nonnegative'] += 1
        if cell_key.startswith('roster-'):
            lane_grid[row['gridRotation']+':'+str(int(row['seed']) % 5)] += 1
        assert abs(int(row['steps']) / 60 - float(row['seconds'])) < 1e-5
        slots = {key: row[key].split('|') for key in ('classes', 'positions', 'finishSeconds', 'wreckSeconds', 'laps', 'hp', 'uses', 'abilityDamage', 'damageTaken', 'activeSeconds', 'skills')}
        count = len(slots['classes'])
        assert all(len(v) == count for v in slots.values())
        assert sorted(map(int, slots['positions'])) == list(range(1, count + 1))
        winner = slots['classes'][slots['positions'].index('1')]
        observation_final = row.get('observation') == 'early-facts-final'
        if cell_key.startswith('early-'):
            assert row['winner'] == ''
        else:
            assert winner == row['winner']
        wrecks = [float(v) for v in slots['wreckSeconds'] if float(v) >= 0]
        assert (not row['firstWreckSeconds']) == (not wrecks)
        if wrecks:
            assert float(row['firstWreckSeconds']) == min(wrecks)
            first_wrecks.append(min(wrecks))
        actual_early = float(slots['wreckSeconds'][0]) >= 0 and int(slots['laps'][0]) == 0
        assert actual_early == (row['leadEarlyWreck'] == 'true')
        if observation_final:
            assert wrecks and (int(slots['laps'][0]) > 0 or float(slots['wreckSeconds'][0]) >= 0 or float(slots['finishSeconds'][0]) >= 0)
        early += actual_early
        if cell_key.startswith('early-') and int(slots['laps'][0]) == 0 and float(slots['wreckSeconds'][0]) < 0 and float(slots['finishSeconds'][0]) < 0:
            unsettled_leads += 1
        actual_unresolved = sum(float(slots['finishSeconds'][i]) < 0 and float(slots['wreckSeconds'][i]) < 0 for i in range(count))
        assert actual_unresolved == int(row['unresolved'])
        unresolved += actual_unresolved; one_shots += int(row['oneShots'])
        if not cell_key.startswith('early-'):
            classes[winner]['wins'] += 1
            grid[row['gridRotation']][winner] += 1
        for i, name in enumerate(slots['classes']):
            c = classes[name]; c['entries'] += 1
            finish = float(slots['finishSeconds'][i])
            if finish >= 0:
                c['finishSeconds'].append(finish)
            c['penalizedSeconds'].append(finish if finish >= 0 else roster['probeMaxSeconds'])
            uses = int(slots['uses'][i]); active = float(slots['activeSeconds'][i]); damage = float(slots['abilityDamage'][i])
            assert uses >= 0 and active >= 0 and damage >= 0 and float(slots['hp'][i]) >= 0
            c['uses'] += uses; c['zeroUseEntries'] += uses == 0; c['activeSeconds'] += active; c['abilityDamage'] += damage
            if cell_key.startswith('roster-') and cell_key.endswith('-on') and '-equal-' in cell_key:
                total = all_class[name]
                for key in ('entries', 'uses', 'zeroUseEntries', 'activeSeconds', 'abilityDamage'):
                    total[key] += {'entries': 1, 'uses': uses, 'zeroUseEntries': uses == 0, 'activeSeconds': active, 'abilityDamage': damage}[key]
        rd = sum(map(float, slots['abilityDamage'])); td = sum(map(float, slots['damageTaken']))
        assert rd <= td + 1e-7
        if cell_key.endswith('-off'):
            assert sum(map(int, slots['uses'])) == 0 and rd == 0
        ability_damage += rd; total_damage += td
    assert len(seeds) == len(rows), file
    cell_seeds[cell_key] = seeds
    diverse = len(hashes) / len(rows) >= balance['minimumDistinctHashFraction']
    if not diverse:
        findings.append(f'{cell_key}: repeated seed outcomes {len(hashes)}/{len(rows)}')
    if (unresolved and not cell_key.startswith('early-')) or one_shots:
        findings.append(f'{cell_key}: unresolved={unresolved}, oneShots={one_shots}')
    if unsettled_leads:
        findings.append(f'{cell_key}: {unsettled_leads} lead lap-one outcomes not settled within the observation horizon')
    for c in classes.values():
        c['meanPenalizedSeconds'] = statistics.mean(c.pop('penalizedSeconds'))
        finishes = c.pop('finishSeconds')
        c['finishedEntries'] = len(finishes)
        c['meanFinishedSeconds'] = statistics.mean(finishes) if finishes else None
        c['winnerShare'] = c['wins'] / len(rows) if diverse and not cell_key.startswith('early-') else None
        c['winnerShare95CI'] = wilson(c['wins'], len(rows)) if diverse and not cell_key.startswith('early-') else None
        c['usesPerActiveMinute'] = c['uses'] / c['activeSeconds'] * 60 if c['activeSeconds'] else None
    cells[cell_key] = {'races': len(rows), 'distinctHashes': len(hashes), 'ratesValid': diverse,
                       'seedSetSha256': hashlib.sha256('\n'.join(sorted(seeds)).encode()).hexdigest(),
                       'unresolved': unresolved, 'oneShots': one_shots, 'earlyWrecks': early, 'unsettledLeadOutcomes': unsettled_leads,
                       'earlyRate': early/len(rows) if diverse else None, 'firstWreckSeconds': distribution(first_wrecks),
                       'noWreckCensored': len(rows)-len(first_wrecks), 'abilityDamage': ability_damage,
                       'totalDamage': total_damage, 'abilityDamageShare': ability_damage/total_damage if total_damage else None,
                       'classes': dict(classes), 'gridWinnerCounts': dict(grid)}
    cells[cell_key]['seedSignCounts'] = dict(seed_signs)
    cells[cell_key]['laneCycleGridCounts'] = dict(lane_grid)

tier_results = {}
for tier, pair in pairs.items():
    fast = max(pair, key=lambda c: int(car_stats[c]['speed']))
    agile = next(c for c in pair if c != fast)
    result = {}
    for mode in ('off', 'on'):
        keys = [f'roster-{tier}-equal-{course}-{mode}' for course in weights]
        skill_key = f'roster-{tier}-skill-technical-{mode}'
        if not all(key in cells and cells[key]['ratesValid'] for key in keys + [skill_key]):
            continue
        equal = {course: cells[key] for course, key in zip(weights, keys)}
        shares = {car: sum(weights[course]*cell['classes'][car]['winnerShare'] for course, cell in equal.items()) for car in pair}
        means = {course: {car: cell['classes'][car]['meanPenalizedSeconds'] for car in pair} for course, cell in equal.items()}
        skill = cells[skill_key]['classes']
        margins = {'skillSeconds': skill[fast]['meanPenalizedSeconds']-skill[agile]['meanPenalizedSeconds'],
                   'straightDeficitSeconds': means['straight'][agile]-means['straight'][fast],
                   'hairpinDeficitSeconds': means['technical'][fast]-means['technical'][agile]}
        alarms = []
        if max(shares.values()) > roster['maxWinShare']:
            alarms.append('dominant class')
        for car in pair:
            peer = next(c for c in pair if c != car)
            if not any(m[car] < m[peer] for m in means.values()) or not any(m[car] > m[peer] for m in means.values()):
                alarms.append(car+' lacks best/worst course rotation')
        for key, rule in [('skillSeconds', 'minimumSkillMarginSeconds'), ('straightDeficitSeconds', 'minimumStraightDeficitSeconds'), ('hairpinDeficitSeconds', 'minimumHairpinDeficitSeconds')]:
            if margins[key] < roster[rule]:
                alarms.append(key+' below declared minimum')
        result[mode] = {'winnerShares': shares, 'courseMeans': means, 'margins': margins, 'alarms': alarms,
                        'minimumCellSamples': min(cells[k]['races'] for k in keys+[skill_key])}
        weighted_ability = sum(weights[course]*cell['abilityDamage']/cell['races'] for course, cell in equal.items())
        weighted_total = sum(weights[course]*cell['totalDamage']/cell['races'] for course, cell in equal.items())
        result[mode]['mixedAbilityDamageShare'] = weighted_ability/weighted_total if weighted_total else None
        if mode == 'on':
            findings.extend(tier+': '+alarm for alarm in alarms)
    if result:
        if 'on' in result and 'off' in result:
            for scenario, course in [('equal', course) for course in weights] + [('skill', 'technical')]:
                key = f'roster-{tier}-{scenario}-{course}-'
                assert cell_seeds[key+'off'].issubset(cell_seeds[key+'on']), 'Roster baseline must use matched seeds'
        tier_results[tier] = result
early_results = {}
for row in table('combat-scenarios'):
    key = 'early-'+row['id']+'-on'
    if key not in cells:
        continue
    on = cells[key]; off = cells.get(key[:-2]+'off')
    early_results[row['id']] = {'on': on['earlyRate'], 'off': off['earlyRate'] if off else None, 'samples': on['races'],
                                'baselineSamples': off['races'] if off else 0, 'pairedSeedSets': bool(off and on['seedSetSha256'] == off['seedSetSha256'])}
    if on['earlyRate'] is not None and on['earlyRate'] >= combat['maximumEarlyWreckRate']:
        findings.append(row['id']+': early wreck rate fails')
    if off and on['earlyRate'] is not None and off['earlyRate'] is not None and on['earlyRate'] > off['earlyRate']:
        findings.append(row['id']+': early wreck rate regressed versus paired baseline')
rotation_results = {}
for tier, pair in pairs.items():
    means = {}
    for course in weights:
        keys = {car: f'rotation-{car}-{course}-on' for car in pair}
        if all(k in cells and cells[k]['ratesValid'] for k in keys.values()):
            assert len({cells[k]['seedSetSha256'] for k in keys.values()}) == 1, 'Homogeneous peers need identical seed sets'
            means[course] = {car: cells[key]['classes'][car]['meanPenalizedSeconds'] for car, key in keys.items()}
    if len(means) != len(weights):
        continue
    rotation_results[tier] = {'courseMeans': means, 'alarms': [], 'minimumCellSamples': min(cells[f'rotation-{car}-{course}-on']['races'] for car in pair for course in weights)}
    for car in pair:
        peer = next(c for c in pair if c != car)
        if not any(m[car] < m[peer] for m in means.values()) or not any(m[car] > m[peer] for m in means.values()):
            rotation_results[tier]['alarms'].append(car+' lacks homogeneous best/worst rotation')
    contested = tier_results.get(tier, {}).get('on', {}).get('courseMeans', {})
    rotation_results[tier]['orderAgreesWithContested'] = {course: (m[pair[0]] < m[pair[1]]) == (contested[course][pair[0]] < contested[course][pair[1]]) for course, m in means.items() if course in contested}
    findings.extend(tier+': '+alarm for alarm in rotation_results[tier]['alarms'])
for c in all_class.values():
    c['usesPerActiveMinute'] = c['uses']/c['activeSeconds']*60 if c['activeSeconds'] else None
    c['zeroUseFraction'] = c['zeroUseEntries']/c['entries']
for name, c in all_class.items():
    if c['uses'] == 0:
        findings.append(name+': signature unused in all measured contested races')
assert cells, 'No raw scenario cells were examined'
acceptance_checks = {
    'allRosterTiers': len(tier_results) == len(pairs),
    'rosterSamples': len(tier_results) == len(pairs) and all(v.get('on', {}).get('minimumCellSamples', 0) >= roster['racesPerScenario'] for v in tier_results.values()),
    'rosterBaselinesPresent': len(tier_results) == len(pairs) and all('off' in v for v in tier_results.values()),
    'allEarlyScenarios': len(early_results) == len(table('combat-scenarios')),
    'earlySamples': len(early_results) == len(table('combat-scenarios')) and all(v['samples'] >= combat['samplesPerScenario'] for v in early_results.values()),
    'completePairedEarlyBaselines': len(early_results) == len(table('combat-scenarios')) and all(v['baselineSamples'] >= combat['samplesPerScenario'] and v['pairedSeedSets'] for v in early_results.values()),
    'allRotationPairs': len(rotation_results) == len(pairs),
    'rotationOrderAgrees': len(rotation_results) == len(pairs) and all(len(v['orderAgreesWithContested']) == len(weights) and all(v['orderAgreesWithContested'].values()) for v in rotation_results.values()),
    'everySignatureUsed': len(all_class) == len(cars) and all(c['uses'] > 0 for c in all_class.values()),
    'noNumericFindings': not findings,
}
report = {'cells': cells, 'tiers': tier_results, 'early': early_results, 'rotation': rotation_results, 'classUsage': dict(all_class),
          'acceptanceChecks': acceptance_checks, 'numericAcceptancePassed': all(acceptance_checks.values()),
          'racesAudited': sum(c['races'] for c in cells.values()), 'findings': findings,
          'limits': ['AI proxy, not human fairness or feel', 'winner share denominator is races, not entries',
                     'penalized means use the declared roster time limit for wrecked/unresolved entries; finished means are separate',
                     'early first-wreck observations use the canonical C3 horizon (180 seconds); no-wreck cases are right-censored, never assigned a fake first-wreck time',
                     'early observations can stop once both lead lap-one fate and first wreck are final; no winner share is inferred from these rows',
                     'baseline and rotation sample counts are separate; a pilot is not acceptance']}
(args.directory/'audit.json').write_text(json.dumps(report, indent=2)+'\n', encoding='utf-8', newline='\n')
lines = ['# Ability balance audit', '', f"Audited {report['racesAudited']} actual seeded races across {len(cells)} cells.", '', '| Tier | Abilities | Class winner shares | Skill / straight / hairpin margin (s) | Findings |', '|---|---|---|---|---|']
for tier, modes in tier_results.items():
    for mode, result in modes.items():
        lines.append('| '+tier+' | '+mode+' | '+'; '.join(f'{c} {v:.2%}' for c,v in result['winnerShares'].items())+' | '+' / '.join(f'{v:.2f}' for v in result['margins'].values())+' | '+('; '.join(result['alarms']) or 'none in this sample')+' |')
lines += ['', '## Findings', ''] + (['- '+f for f in findings] or ['All declared numeric acceptance checks passed.' if report['numericAcceptancePassed'] else 'No numeric alarm fired in the examined cells; missing sections or sample sizes prevent acceptance.'])
lines += ['', '## Early-wreck fairness', '', '| Scenario | On / off before lap one | On samples |', '|---|---|---|']
for scenario, result in early_results.items():
    lines.append(f"| {scenario} | {result['on']:.2%} / {result['off']:.2%} | {result['samples']} |" if result['on'] is not None and result['off'] is not None else f'| {scenario} | missing/invalid | {result["samples"]} |')
lines += ['', '## Homogeneous rotation cross-check', '']
for tier, result in rotation_results.items():
    lines.append(f"- {tier}: {result['minimumCellSamples']} samples/class/course; orders agree {result['orderAgreesWithContested']}; alarms {result['alarms']}")
lines += ['', '| Homogeneous class | Technical mean (s) | Straight mean (s) | Loose mean (s) |', '|---|---:|---:|---:|']
for car in cars:
    name = car['id']
    keys = [f'rotation-{name}-{course}-on' for course in weights]
    if all(key in cells for key in keys):
        lines.append('| '+name+' | '+' | '.join(f"{cells[key]['classes'][name]['meanPenalizedSeconds']:.2f}" for key in keys)+' |')
lines += ['', '## Observed signature use', '', 'Equal-skill on-cells only; active time ends on finish or wreck. Courses have equal sample counts here; this is an observed rate, not a weighted human-play forecast.', '',
          '| Class | Entries | Uses / active minute | Zero-use entries | Ability HP damage |', '|---|---:|---:|---:|---:|']
for name, c in all_class.items():
    lines.append(f"| {name} | {c['entries']} | {c['usesPerActiveMinute']:.3f} | {c['zeroUseFraction']:.2%} | {c['abilityDamage']:.1f} |")
lines += ['', '## Damage and first wreck', '', 'Ability share uses actual HP removed and the declared course weights. First-wreck quantiles below are conditional on observing a wreck; censored races are excluded from those quantiles, never assigned a made-up time.', '']
for tier, modes in tier_results.items():
    value = modes.get('on', {}).get('mixedAbilityDamageShare')
    if value is not None:
        lines.append(f'- {tier}: {value:.2%} of mixed-course HP damage from abilities.')
lines += ['', '| Early on-scenario | Wreck observed / censored | Observed min / p50 / p95 (s) |', '|---|---:|---|']
for scenario in early_results:
    cell = cells['early-'+scenario+'-on']; d = cell['firstWreckSeconds']
    text = ' / '.join(f"{d[k]:.2f}" if d[k] is not None else 'unobserved' for k in ('min','p50','p95'))
    lines.append(f"| {scenario} | {d['observed']} / {cell['noWreckCensored']} | {text} |")
(args.directory/'audit.md').write_text('\n'.join(lines)+'\n', encoding='utf-8', newline='\n')
print(json.dumps({'races': report['racesAudited'], 'cells': len(cells), 'findings': findings, 'tiers': tier_results}, indent=2))
if args.strict:
    assert report['numericAcceptancePassed'], {key: value for key,value in acceptance_checks.items() if not value}
