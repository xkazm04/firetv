"""Reproduce the v2 root-cause measurements from immutable release observations."""
import collections
import csv
import gzip
import hashlib
import json
import statistics
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'evidence/gameplay/campaign/release'
OUT = ROOT / 'evidence/campaign/design-v2/before'
OUT.mkdir(parents=True, exist_ok=True)


def rows(name):
    with gzip.open(SOURCE / (name + '.csv.gz'), 'rt', newline='') as f:
        return list(csv.DictReader(f))


report = {'source': str(SOURCE.relative_to(ROOT)), 'scope': 'Retained release observations, not new independent races', 'buyers': {}}
for buyer in ['race', 'pr']:
    careers, trace = rows('careers-' + buyer), rows('timeline-' + buyer)
    groups = []
    for skill in range(3):
        c = [r for r in careers if int(r['skill']) == skill]
        t = [r for r in trace if int(r['skill']) == skill]
        groups.append(dict(skill=['Rookie', 'Club', 'Pro'][skill], n=len(c), completed=sum(r['completed'] == 'true' for r in c),
            censoredAt=dict(collections.Counter(r['round'] for r in c if r['completed'] == 'false')),
            medianHours=statistics.median(float(r['hours']) for r in c),
            bossAttempts=dict(collections.Counter(r['event'] for r in t if r['event'] in ['7', '14', '21', '28', '35']))))
    events = []
    for event in range(1, 36):
        t = [r for r in trace if int(r['event']) == event]
        first = {}
        for r in t:
            first.setdefault(r['seed'], r)
        f = list(first.values())
        events.append(dict(event=event, arrivals=len(f), attempts=len(t), advances=sum(r['advanced'] == 'true' for r in t),
            retries=len(t)-len(f), medianEntryPR=statistics.median(float(r['playerPR']) for r in f) if f else None,
            medianFieldPR=statistics.median(float(r['fieldPR']) for r in f) if f else None,
            medianEntryRatio=statistics.median(float(r['ratio']) for r in f) if f else None,
            medianIncome=statistics.median(int(r['income']) for r in t) if t else None,
            medianEntryCash=statistics.median(int(r['cash'])-int(r['income']) for r in f) if f else None))
    report['buyers'][buyer] = dict(n=len(careers), completed=sum(r['completed'] == 'true' for r in careers), attempts=len(trace),
        bankruptcy=sum(r['bankruptcy'] == 'true' for r in careers), medianEndCash=statistics.median(int(r['cash']) for r in careers),
        meanPaid=statistics.mean(int(r['paid']) for r in careers), meanRecovered=statistics.mean(int(r['recovered']) for r in careers),
        actualRewards=[dict(collections.Counter(r['rewards'].split(';')[i] for r in careers)) for i in range(4)], groups=groups, events=events)
physical = rows('physical') + rows('boss-extra')
report['bossPhysical'] = []
for event in [7, 14, 21, 28]:
    for skill in range(3):
        for car in sorted({int(r['car']) for r in physical if int(r['round']) == event-1}):
            c = [r for r in physical if int(r['round']) == event-1 and int(r['skill']) == skill and int(r['car']) == car and int(r['band']) == 17]
            # Named boss is first in the event cast. Rival indexes are Rook/Ox/Mica/Vex/Relay/Marrow.
            boss = {7: 0, 14: 1, 21: 3, 28: 2}[event]
            beat = sum(r['finished'] == 'true' and int(r['position']) < next(int(v.split(':')[1]) for v in r['rivals'].split(';') if int(v.split(':')[0]) == boss) for r in c)
            report['bossPhysical'].append(dict(event=event, skill=skill, car=car, n=len(c), firsts=sum(r['position'] == '1' and r['finished'] == 'true' for r in c), beatNamedBoss=beat))
report['sourceHashes'] = {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in SOURCE.glob('*.csv.gz')}
(OUT / 'diagnosis.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps({b: {k: v for k, v in r.items() if k not in ['events', 'groups', 'actualRewards']} for b, r in report['buyers'].items()}, indent=2))
