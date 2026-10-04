"""Owner first-place decision: shared report calculations and falsifiable gates."""
from collections import Counter
from statistics import median


def middle(rows, key):
    return median(float(r[key]) for r in rows) if rows else None


def summarize(careers, timeline, curve):
    first = {}
    for r in timeline:
        first.setdefault((r['seed'], r['event']), r)
    groups = []
    for skill, name in enumerate(('Rookie', 'Club', 'Pro')):
        rows = [r for r in careers if int(r['skill']) == skill]
        done = [r for r in rows if r['completed'] == 'true']
        censored = [r for r in rows if r['completed'] != 'true']
        hours = sorted(float(r['hours']) for r in done)
        groups.append(dict(skill=name, n=len(rows), completed=len(done), censored=len(censored),
            censoredAt=dict(Counter(r['round'] for r in censored)),
            completedHoursMedian=middle(done, 'hours'),
            completedHoursP90=hours[int((len(hours)-1)*.9)] if hours else None,
            censoredHoursMedian=middle(censored, 'hours')))
    bosses = []
    for event in (7, 14, 21, 28):
        rows = [r for (_, e), r in first.items() if int(e) == event]
        attempts = [r for r in timeline if int(r['event']) == event]
        ratio = middle(rows, 'ratio')
        low, high = float(curve[event-1]['ratioLow']), float(curve[event-1]['ratioHigh'])
        bosses.append(dict(event=event, arrivals=len(rows), attempts=len(attempts),
            advanced=sum(r['advanced'] == 'true' for r in attempts),
            firstEntryRatio=ratio, playerPR=middle(rows, 'playerPR'), fieldPR=middle(rows, 'fieldPR'),
            bossPR=middle(rows, 'bossPR'), band=[low, high],
            bandPass=ratio is not None and low <= ratio <= high,
            oldBandPass=ratio is not None and .85 <= ratio <= .90))
    return dict(n=len(careers), completed=sum(r['completed'] == 'true' for r in careers),
        censored=sum(r['completed'] != 'true' for r in careers),
        bankruptcy=sum(r['bankruptcy'] == 'true' for r in careers), groups=groups, bosses=bosses,
        attempts=len(timeline), medianEndCash=middle(careers, 'cash'),
        maxLibraryRatioGap=max((float(r['maxRatioGap']) for r in careers), default=None),
        gates=dict(firstPlacePromotions=all(r['advanced'] != 'true' or int(r['position']) == 1
            for r in timeline if int(r['event']) in (7, 14, 21, 28, 35)),
            censorHorizon=all(int(r['races']) == 70 for r in careers if r['completed'] != 'true'),
            declaredBossBands=all(r['bandPass'] for r in bosses)),
        rewards=[dict(Counter(r['rewards'].split(';')[i] for r in careers)) for i in range(4)],
        meanRestitutionPaid=sum(int(r.get('restitutionPaid', 0)) for r in careers)/len(careers) if careers else 0)


def instrument_cases():
    curve = [dict(ratioLow='.93', ratioHigh='1.03') for _ in range(35)]
    career = dict(seed='1', skill='1', completed='false', round='21', races='70', hours='6',
        bankruptcy='false', cash='8000', maxRatioGap='.1', rewards='1;1;0;0')
    rows = [dict(seed='1', event=str(e), ratio='.98', playerPR='98', fieldPR='100',
        bossPR='100', advanced='true', position='1') for e in (7,14,21,28)]
    cases = []
    def check(name, c, t, gate, expected):
        actual = summarize(c, t, curve)['gates'][gate]
        assert actual == expected, (name, actual)
        cases.append(dict(plantedCase=name, gate=gate, result=actual, expected=expected))
    check('valid control', [career], rows, 'declaredBossBands', True)
    check('below .93', [career], [{**r, 'ratio':'.9299'} for r in rows], 'declaredBossBands', False)
    check('above 1.03', [career], [{**r, 'ratio':'1.0301'} for r in rows], 'declaredBossBands', False)
    check('missing boss arrivals', [career], rows[:-1], 'declaredBossBands', False)
    check('third place falsely promotes', [career], [{**r, 'position':'3'} for r in rows], 'firstPlacePromotions', False)
    check('censor hidden at 69', [{**career, 'races':'69'}], rows, 'censorHorizon', False)
    return cases
