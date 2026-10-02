"""Paired comparison of completed pre/post N2 runs; no inferred mine-only damage."""
import argparse
import csv
import gzip
import json
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('before', type=Path)
parser.add_argument('after', type=Path)
parser.add_argument('output', type=Path)
args = parser.parse_args()

def cells(folder):
    result = {}
    for p in sorted(list(folder.glob('*.csv')) + list(folder.glob('*.csv.gz'))):
        key = p.name.removesuffix('.gz').removesuffix('.csv')
        if not key.startswith(('roster-', 'early-', 'rotation-')):
            continue
        with (gzip.open(p, 'rt') if p.suffix == '.gz' else p.open()) as handle:
            rows = list(csv.DictReader(handle))
        result[key] = {r['seed']: r for r in rows}
        assert len(result[key]) == len(rows)
    return result

before, after = cells(args.before), cells(args.after)
assert before.keys() == after.keys() and before
comparison = {}
for key, old in before.items():
    new = after[key]
    assert old.keys() == new.keys(), key
    for seed, a in old.items():
        b = new[seed]
        assert all(a[field] == b[field] for field in ('classes', 'skills', 'raceLaps', 'gridRotation'))
    def totals(rows):
        return {'observedFirstWrecks': sum(bool(r['firstWreckSeconds']) for r in rows.values()),
                'leadEarlyWrecks': sum(r['leadEarlyWreck'] == 'true' for r in rows.values()),
                'oneShots': sum(int(r['oneShots']) for r in rows.values()),
                'allHpDamage': sum(sum(map(float, r['damageTaken'].split('|'))) for r in rows.values()),
                'abilityHpDamage': sum(sum(map(float, r['abilityDamage'].split('|'))) for r in rows.values())}
    comparison[key] = {'pairedRaces': len(old),
                       'changedTerminalHashes': sum(a['hash'] != new[seed]['hash'] for seed, a in old.items()),
                       'changedClassWinners': sum(a['winner'] != new[seed]['winner'] for seed, a in old.items()),
                       'changedWinnerSlots': sum(bool(a['winner']) and a['positions'].split('|').index('1') != new[seed]['positions'].split('|').index('1') for seed, a in old.items()),
                       'before': totals(old), 'after': totals(new)}
old_audit = json.loads((args.before/'audit.json').read_text())
new_audit = json.loads((args.after/'audit.json').read_text())
result = {'pairedRaces': sum(c['pairedRaces'] for c in comparison.values()), 'cells': comparison,
          'beforeRuns': {p.name: json.loads(p.read_text()) for p in args.before.glob('run-*.json')},
          'afterRuns': {p.name: json.loads(p.read_text()) for p in args.after.glob('run-*.json')},
          'beforeNumericPass': old_audit['numericAcceptancePassed'], 'afterNumericPass': new_audit['numericAcceptancePassed'],
          'beforeTierResults': old_audit['tiers'], 'afterTierResults': new_audit['tiers'],
          'beforeEarlyResults': old_audit['early'], 'afterEarlyResults': new_audit['early'],
          'limits': ['Paired seeds and fields; no human-play claim.',
                     'Compares complete recorded configurations; see the design note for changes between them.',
                     'All-HP damage includes downstream driving and combat changes; it is not isolated mine damage.',
                     'Early rows use the declared observation horizon and remain censored where no wreck occurred.']}
args.output.write_text(json.dumps(result, indent=2)+'\n', encoding='utf-8', newline='\n')
print(json.dumps({'pairedRaces': result['pairedRaces'],
                  'changedTerminalHashes': sum(c['changedTerminalHashes'] for c in comparison.values()),
                  'changedClassWinners': sum(c['changedClassWinners'] for c in comparison.values()),
                  'changedWinnerSlots': sum(c['changedWinnerSlots'] for c in comparison.values()),
                  'beforeNumericPass': result['beforeNumericPass'], 'afterNumericPass': result['afterNumericPass']}))
