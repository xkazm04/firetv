"""V2 audit calculations shared by the report and adversarial instrument tests."""
from collections import Counter, defaultdict
from campaign_metrics import repeated
import csv,json
from pathlib import Path

_ROOT=Path(__file__).resolve().parents[1]
SEED_DIVERSITY_FLOOR=json.loads((_ROOT/'tools/campaign-analysis-rules.json').read_text())['seedDiversityFloor']
with (_ROOT/'core/src/main/resources/data/roster-rules.csv').open() as _file:
    MAX_WIN_SHARE=next(float(r['value']) for r in csv.DictReader(_file) if r['key']=='maxWinShare')


def roster_review(rows, weights, samples, threshold=MAX_WIN_SHARE, peers=None):
    expected = {(str(t), c, b, str(r)) for t in range(5) for c in weights for b in ['stock', 'developed'] for r in range(6)}
    cells = defaultdict(list)
    for row in rows:
        cells[row['tier'], row['course'], row['build'], row['rotation']].append(row)
    cross = set(cells) == expected and all(len(v) == samples for v in cells.values())
    allocation_cross = cross
    for t in range(5):
        for c in weights:
            for b in ['stock', 'developed']:
                group = [r for r in rows if r['tier'] == str(t) and r['course'] == c and r['build'] == b]
                slots = Counter((entry.split(':')[0], slot) for r in group for slot, entry in enumerate(r['cars'].split(';')))
                names = {name for name, _ in slots}
                allocation_cross = allocation_cross and (peers is None or names == set(peers[t])) and len(names) == 2 and set(slots) == {(name, slot) for name in names for slot in range(6)} and all(n == samples*3 for n in slots.values())
    unique = cross and all(not repeated([r['hash'] for r in v], SEED_DIVERSITY_FLOOR) and len({r['seed'] for r in v}) == samples for v in cells.values())
    pairing = cross and all(len({frozenset(r['seed'] for r in cells[str(t), c, b, str(slot)]) for slot in range(6)}) == 1 for t in range(5) for c in weights for b in ['stock', 'developed'])
    summaries = []
    for tier in range(5):
        for build in ['stock', 'developed']:
            subset = [r for r in rows if r['tier'] == str(tier) and r['build'] == build]
            classes = sorted({v.split(':')[0] for r in subset for v in r['cars'].split(';')})
            course_results, mixed = {}, dict.fromkeys(classes, 0.)
            for course, weight in weights.items():
                group = [r for r in subset if r['course'] == course]
                wins = Counter(r['winner'] for r in group)
                share = {c: wins[c]/len(group) if group else None for c in classes}
                times = {c: [float(v.split(':')[1]) for r in group for v in r['cars'].split(';') if v.split(':')[0] == c and float(v.split(':')[1]) >= 0] for c in classes}
                means = {c: sum(v)/len(v) if v else None for c, v in times.items()}
                course_results[course] = {'races': len(group), 'uniqueHashes':len({r['hash'] for r in group}), 'pairedSeedBlocks':len({r['seed'] for r in group}), 'wins': dict(wins), 'winnerShare': share, 'meanFinishSeconds': means,
                    'rotations': {str(slot): dict(Counter(r['winner'] for r in group if r['rotation'] == str(slot))) for slot in range(6)}}
                for c in classes:
                    if share[c] is not None: mixed[c] += weight*share[c]
            complete = (peers is None or set(classes) == set(peers[tier])) and len(classes) == 2 and all(x['races'] == samples*6 for x in course_results.values()) and all(int(r['unresolved']) == 0 and r['winner'] in classes for r in subset)
            summaries.append({'tier': tier, 'build': build, 'mixedWinnerShare': mixed, 'courses': course_results,
                'scenarioComplete':complete, 'winnerShareWithinLimit':bool(classes) and max(mixed.values(), default=1) <= threshold,
                'dominancePass': complete and max(mixed.values(), default=1) <= threshold,
                'bestAndWorstPass': complete and all(any(x['meanFinishSeconds'][c] == min(x['meanFinishSeconds'].values()) for x in course_results.values() if all(v is not None for v in x['meanFinishSeconds'].values())) and any(x['meanFinishSeconds'][c] == max(x['meanFinishSeconds'].values()) for x in course_results.values() if all(v is not None for v in x['meanFinishSeconds'].values())) for c in classes)})
    return {'completeCross': cross, 'actualClassSlotCross': allocation_cross, 'pairedRotations': pairing, 'seedDiversity': unique, 'allResolved': bool(rows) and all(int(r['unresolved']) == 0 for r in rows), 'threshold': threshold, 'seedDiversityFloor':SEED_DIVERSITY_FLOOR,
        'diversityCells':[dict(tier=k[0],course=k[1],build=k[2],rotation=k[3],rows=len(v),uniqueSeeds=len({r['seed'] for r in v}),uniqueHashes=len({r['hash'] for r in v})) for k,v in sorted(cells.items())],
        'metric': 'Class wins / all races; range 0..1; fair share .5 for each symmetric two-class tier; declared course weights', 'weights': weights, 'tiers': summaries}


def difficulty_cross(rows, samples, peers):
    cells = defaultdict(list)
    for r in rows:
        cells[r['event'], r['lead'], r['difficulty'], r['car'], r['rotation']].append(r)
    # The content supplies the legal peer identities; a row label alone does not prove a complete cross.
    expected = {(str(e), str(l), str(d), car, str(r)) for e, cars in peers.items() for l in range(3) for d in range(3) for car in cars for r in range(2)}
    return set(cells) == expected and all(len(v) == samples and len({r['seed'] for r in v}) == samples and not repeated([r['hash'] for r in v], SEED_DIVERSITY_FLOOR) for v in cells.values()) and all(
        len({frozenset(r['seed'] for r in v) for key, v in cells.items() if key[0] == str(event)}) == 1 for event in peers)


def homogeneous_review(rows, roster, samples):
    """Independent all-six-slot timing orders must agree with contested stock peers."""
    stock = [r for r in roster['tiers'] if r['build'] == 'stock']
    expected = {(car, course) for tier in stock for car in tier['mixedWinnerShare'] for course in roster['weights']}
    cells = defaultdict(list)
    for r in rows: cells[r['build'], r['course']].append(r)
    complete = set(cells) == expected and all(len(v) == samples for v in cells.values())
    diverse = complete and all(len({r['seed'] for r in v}) == samples and not repeated([r['hash'] for r in v], SEED_DIVERSITY_FLOOR) for v in cells.values())
    paired, comparisons = complete, []
    for tier in stock:
        names = sorted(tier['mixedWinnerShare'])
        if len(names) != 2: paired = False; continue
        for course, contested in tier['courses'].items():
            groups = [cells[c, course] for c in names]
            paired = paired and len({frozenset(r['seed'] for r in g) for g in groups}) == 1
            values = [[float(v.split(':')[1]) for r in g for v in r['cars'].split(';') if float(v.split(':')[1]) >= 0] for g in groups]
            means = [sum(v)/len(v) if v else None for v in values]
            other = [contested['meanFinishSeconds'].get(c) for c in names]
            agree = all(v is not None for v in means+other) and (means[0]-means[1])*(other[0]-other[1]) > 0
            comparisons.append(dict(tier=tier['tier'], course=course, classes=names, homogeneousMean=means, contestedMean=other, orderAgrees=agree))
    return dict(completeCross=complete, seedDiversity=diverse, pairedPeerSeeds=paired,
        allResolved=bool(rows) and all(int(r['unresolved']) == 0 for r in rows),
        orderPass=complete and paired and all(r['orderAgrees'] for r in comparisons), comparisons=comparisons)
