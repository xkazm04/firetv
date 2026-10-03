"""Archive v2 diagnostics and build the static, offline owner decision page."""
import collections
import csv
import gzip
import hashlib
import html
import io
import json
import statistics as st
from pathlib import Path
from campaign_v2_metrics import roster_review, difficulty_cross, homogeneous_review, SEED_DIVERSITY_FLOOR

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'evidence/campaign/design-v2'
PAGE = ROOT / 'campaign/design-v2'
SOURCE = ROOT / 'build/reports/campaign/q3/design-v2-final-v6b'
BEFORE = ROOT / 'evidence/gameplay/campaign/release'
AFTER = OUT / 'after'
DATA = ROOT / 'core/src/main/resources/data'
PAGE.mkdir(parents=True, exist_ok=True)
AFTER.mkdir(parents=True, exist_ok=True)


def read(path):
    data = gzip.decompress(path.read_bytes()) if path.suffix == '.gz' else path.read_bytes()
    return list(csv.DictReader(io.StringIO(data.decode('utf-8'))))


def pack(source, target):
    raw = source.read_bytes()
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(gzip.compress(raw, mtime=0))
    assert gzip.decompress(target.read_bytes()) == raw
    return {'file': str(target.relative_to(OUT)), 'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest()}


def median(rows, key):
    return st.median(float(r[key]) for r in rows) if rows else None


def percentile(values, p):
    return sorted(values)[min(len(values)-1, int((len(values)-1)*p))] if values else None


def cohort(careers, timeline):
    groups = []
    for skill in range(3):
        c = [r for r in careers if r['skill'] == str(skill)]
        done = [r for r in c if r['completed'] == 'true']
        censored = [r for r in c if r['completed'] != 'true']
        groups.append({'skill': ['Rookie', 'Club', 'Pro'][skill], 'n': len(c), 'completed': len(done),
            'censoredAt': dict(collections.Counter(r['round'] for r in censored)),
            'completedHoursMedian': median(done, 'hours'), 'completedHoursP90': percentile([float(r['hours']) for r in done], .9),
            'censoredHoursMedian': median(censored, 'hours'), 'allHoursMedian': median(c, 'hours'),
            'completedRacesMedian': median(done, 'races')})
    first = {}
    for r in timeline: first.setdefault((r['seed'], r['event']), r)
    events = []
    for event in range(1, 36):
        f = [r for (_, e), r in first.items() if int(e) == event]
        t = [r for r in timeline if int(r['event']) == event]
        events.append({'event': event, 'arrivals': len(f), 'attempts': len(t), 'retries': len(t)-len(f),
            'playerPR': median(f, 'playerPR'), 'fieldPR': median(f, 'fieldPR'), 'ratio': median(f, 'ratio'),
            'bossPR': median(f, 'bossPR') if f and 'bossPR' in f[0] else None,
            'cashAfterSettlement': median(f, 'cash'), 'entryCash': st.median(int(r['cash'])-int(r['income']) for r in f) if f else None, 'income': median(t, 'income'), 'debt': median(f, 'leagueDebt'), 'nextUsefulPrice': median(f,'nextUsefulPrice') if f and 'nextUsefulPrice' in f[0] else None})
    actual = [{key: count for key, count in collections.Counter(r['rewards'].split(';')[i] for r in careers).items()} for i in range(4)]
    purchases = {}
    for key in ['firstUpgrade', 'firstClubCar']:
        found = [int(r[key]) for r in careers if key in r and int(r[key]) >= 0]
        purchases[key] = {'n': len(found), 'medianRace': st.median(found) if found else None}
    tiers={row['id']:['rookie','club','pro','elite','champion'].index(row['tier']) for row in read(DATA/'cars.csv')}
    selected_tiers=[]
    for tier in range(1,5):
        seen={}
        for row in timeline:
            if int(row['event'])<35 and tiers[row['car']]==tier: seen.setdefault(row['seed'],int(row['race'])-1)
        selected_tiers.append(dict(tier=tier,careers=len(seen),medianCompletedRaces=st.median(seen.values()) if seen else None))
    return {'n': len(careers), 'selectedTiers':selected_tiers, 'maxLibraryRatioGap':max(float(r['maxRatioGap']) for r in careers), 'completed': sum(r['completed'] == 'true' for r in careers), 'censored': sum(r['completed'] != 'true' for r in careers),
        'bankruptcy': sum(r['bankruptcy'] == 'true' for r in careers), 'medianEndCash': median(careers, 'cash'), 'groups': groups, 'events': events,
        'actualRewards': actual, 'purchases': purchases, 'meanRecovered': st.mean(int(r['recovered']) for r in careers),
        'meanRestitutionPaid': st.mean(int(r.get('restitutionPaid', 0)) for r in careers),
        'meanRestitutionDue': st.mean(int(r.get('restitutionDue', 0)) for r in careers)}


result = {'scope': 'Before is retained release data exactly replayed on consolidated main. After uses the fresh v5 library with every affected Line build rerun for the final ceiling, audited reuse of unchanged outcomes, and rerun 2,000-ledger policies at the same 70-attempt horizon. These are not 2,000 separately driven full physical careers.',
    'stick': 'pending; never accessed', 'ownerFeel': 'pending', 'artChanged': False, 'cohorts': {}, 'archives': []}
for label, root in [('before', BEFORE), ('after', SOURCE)]:
    result['cohorts'][label] = {}
    for buyer in ['race', 'pr']:
        suffix = '.csv.gz' if label == 'before' else '.csv'
        result['cohorts'][label][buyer] = cohort(read(root / ('careers-' + buyer + suffix)), read(root / ('timeline-' + buyer + suffix)))

# Name the actual boss garage as well as the mean-field PR denominator.
result['bossGarages'] = []
for label, root in [('before', BEFORE), ('after', SOURCE)]:
    path=root / ('reference-garages.csv.gz' if label=='before' else 'reference-garages.csv')
    for row in read(path):
        if (int(row['event']),row['rival']) in [(7,'rook'),(14,'ox'),(21,'vex'),(28,'mica')]:
            result['bossGarages'].append(dict(version=label, **row))

weights = {r['id']: float(r['mixedWeight']) for r in read(DATA / 'roster-courses.csv')}
assert abs(sum(weights.values())-1) < 1e-9
result['roster'] = {}
roster_peers={i:[r['id'] for r in read(DATA/'cars.csv') if r['tier']==tier] for i,tier in enumerate(['rookie','club','pro','elite','champion'])}
for label in ['before', 'after']:
    probe = ROOT / ('build/reports/campaign/design-v2-' + ('before' if label=='before' else 'final-v6') + '-probes')
    roster = read(probe / 'roster.csv')
    assert len(roster)==(5760 if label=='before' else 60120), 'Incomplete roster artifact'
    result['roster'][label] = roster_review(roster, weights, 32 if label == 'before' else 334, peers=roster_peers)
    result['archives'].append(pack(probe / 'roster.csv', OUT / label / 'roster.csv.gz'))
    difficulty = read(probe / 'difficulty.csv')
    cars = read(DATA / 'cars.csv')
    peers = {e: [r['id'] for r in cars if r['tier'] == tier] for e,tier in zip([7,14,21,28], ['club','pro','elite','champion'])}
    assert difficulty_cross(difficulty, 32, peers), 'Incomplete or collapsed difficulty cross'
    result['archives'].append(pack(probe / 'difficulty.csv', OUT / label / 'difficulty.csv.gz'))
    groups = []
    for event in [7, 14, 21, 28]:
        for lead in range(3):
            for opponent in range(3):
                g = [r for r in difficulty if r['event'] == str(event) and r['lead'] == str(lead) and r['difficulty'] == str(opponent)]
                groups.append({'event': event, 'lead': lead, 'difficulty': opponent, 'n': len(g), 'beatBoss': sum(r['beatBoss'] == 'true' for r in g),
                    'first': sum(r['first'] == 'true' for r in g), 'early': sum(r['early'] == 'true' for r in g),
                    'unresolved': sum(int(r['unresolved']) for r in g), 'medianSeconds': median(g, 'seconds')})
    result.setdefault('difficulty', {})[label] = {'completeCross': True, 'rows': len(difficulty), 'samplesPerCell': 32, 'groups': groups,
        'scope': 'Funded diagnostic next-tier peer cars. 32 paired seed blocks per cell. Two slots and two peers are paired observations; not independent human samples.'}
before_roster = ROOT / 'build/reports/campaign/design-v2-before-probes/roster.csv'
after_roster = ROOT / 'build/reports/campaign/design-v2-final-v6-probes/roster.csv'
before_rows, after_rows = read(before_roster), read(after_roster)
paired_after = read(ROOT/'build/reports/campaign/design-v2-legal-cap-pilot-v6/roster.csv')
pre_caps = read(ROOT/'build/reports/campaign/design-v2-after-probes/roster.csv')
result['roster']['preCapsFull'] = roster_review(pre_caps, weights, 334, peers=roster_peers)
result['roster']['freshSeedOverlapWithCalibration'] = len({r['seed'] for r in pre_caps} & {r['seed'] for r in after_rows})
result['roster']['preCapsBaselineReplay'] = before_rows == [r for r in pre_caps if int(r['sample'])<32]
result['roster']['pairedChangedRows'] = sum(a!=b for a,b in zip(before_rows,paired_after))
result['archives'].append(pack(ROOT/'build/reports/campaign/design-v2-after-probes/roster.csv',OUT/'candidate-v1/roster.csv.gz'))
result['roster']['pairedRowsByteIdentical'] = before_rows == paired_after
result['roster']['pairedRaces'] = len(before_rows)
result['roster']['afterRaces'] = len(after_rows)
rotation_file = ROOT / 'build/reports/campaign/design-v2-final-v6-probes/rotation.csv'
rotation = read(rotation_file)
assert len(rotation)==3840, 'Incomplete homogeneous-control artifact'
result['archives'].append(pack(rotation_file, AFTER / 'rotation.csv.gz'))
rotation_groups = collections.defaultdict(list)
for r in rotation: rotation_groups[r['build'], r['course']].append(r)
assert len(rotation_groups) == 30 and all(len(v) == 128 and len({r['hash'] for r in v}) >= SEED_DIVERSITY_FLOOR*128 for v in rotation_groups.values())
result['homogeneousRotation'] = {str(k): {'n': len(v), 'slotWins': dict(collections.Counter(r['winnerSlot'] for r in v)), 'uniqueHashes': len({r['hash'] for r in v})} for k, v in rotation_groups.items()}
result['homogeneousCrossCheck'] = homogeneous_review(rotation, result['roster']['after'], 128)
result['duels'] = json.loads((AFTER / 'summary.json').read_text())['duels']
duel_before = ROOT / 'build/reports/campaign/q3/design-v2-before-duel/duels.csv'
duel_after = SOURCE / 'duels.csv'
result['beforeDuels'] = []
for skill in range(3):
    for rotation in [None,0,1]:
        rows=[r for r in read(duel_before) if r['skill']==str(skill) and (rotation is None or r['rotation']==str(rotation))]
        result['beforeDuels'].append(dict(skill=['Rookie','Club','Pro'][skill],rotation=rotation,fights=len(rows),rigWins=sum(r['win']=='true' for r in rows),draws=sum(r['draw']=='true' for r in rows),earlyLosses=sum(r['early']=='true' for r in rows),meanSeconds=st.mean(float(r['seconds']) for r in rows)))
result['pairedDuelByteIdentical'] = duel_before.read_bytes() == duel_after.read_bytes()
result['archives'].append(pack(duel_before, OUT / 'before/fresh-duels.csv.gz'))
result['catalog'] = read(ROOT / 'build/reports/campaign/design-v2-final-v6-probes/catalog.csv')
result['classCaps'] = read(DATA/'class-upgrade-caps.csv')
result['fixedRig'] = read(DATA/'mechanic-rig.csv')[0]
result['preCapCohorts'] = {b:cohort(read(ROOT/('build/reports/campaign/q3/design-v2-acceptance/careers-'+b+'.csv')),read(ROOT/('build/reports/campaign/q3/design-v2-acceptance/timeline-'+b+'.csv'))) for b in ['race','pr']}
curve = read(DATA / 'career-curve.csv')
result['newBossChecks'] = [{**e, 'buyer': b, 'low': float(curve[e['event']-1]['ratioLow']), 'high': float(curve[e['event']-1]['ratioHigh']),
    'pass': e['ratio'] is not None and float(curve[e['event']-1]['ratioLow']) <= e['ratio'] <= float(curve[e['event']-1]['ratioHigh'])}
    for b, c in result['cohorts']['after'].items() for e in c['events'] if e['event'] in [7, 14, 21, 28]]
result['legacyBossChecks'] = [{**e, 'pass': e['ratio'] is not None and .85 <= e['ratio'] <= .90} for e in result['newBossChecks']]
result['unresolvedDiagnostics'] = [json.loads((OUT/'dv3'/name).read_text()) for name in ['timeout-witness.json','roster-timeout-witness.json']]
result['instrumentReview'] = {'tests': 'python -m unittest discover -s tools -p test_*metrics.py', 'plantedDefects': ['100% class winner share crosses .55 with three copies on a six-car grid', 'constant hashes trip per-cell .99 diversity', 'missing and aliased rotations trip complete-cross gate', 'correct rotation labels with unchanged class slots still fail', 'reversed homogeneous timing order fails the independent cross-check', 'unpaired seed blocks trip pairing', 'all-draw duel has no resolved winner share', '5% opening losses trips fairness gate'],
    'limits': ['Passes concern simulated decision proxies only', 'Fixed reference fields and three upgrade bands approximate ledger garages', 'Ordinary campaign library fixes player in slot 0; separate difficulty and homogeneous controls expose rotation', 'Stock roster and developed roster gates are separate; unchanged failures are still failures', 'No actual-phone or Stick observation', 'Rejected launch candidate failed the unchanged all-Offtrack and rig-reference regressions; its stopped partial acceptance is never pooled with final samples']}
(OUT / 'review-data.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')

# Exportable standard plots: data figures, not generated art.
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
plt.rcParams.update({'figure.facecolor': '#f2ede3', 'axes.facecolor': '#fffaf1', 'font.size': 10})
colors = {'before': '#777369', 'after': '#a74420'}
fig, axes = plt.subplots(3, 1, figsize=(12, 10), layout='constrained')
for label in ['before', 'after']:
    e = result['cohorts'][label]['race']['events'][:34]
    x = [r['event'] for r in e]
    axes[0].plot(x, [r['playerPR'] for r in e], color=colors[label], label=label + ' player')
    axes[0].plot(x, [r['fieldPR'] for r in e], color=colors[label], linestyle='--', label=label + ' field')
    axes[1].plot(x, [r['ratio'] for r in e], color=colors[label], label=label)
    axes[2].plot(x, [r['debt'] for r in e], color=colors[label], label=label)
axes[1].scatter([7, 14, 21, 28], [.89]*4, marker='x', color='#222', label='old target')
axes[1].scatter([7, 14, 21, 28], [.89, .89, .98, .98], marker='o', facecolors='none', edgecolors='#a74420', label='proposed target')
for ax, title, unit in zip(axes, ['Actual player and mean-field PR', 'Entry ratio; old late dips remain a separate failed contract', 'Debt after first attempt; stolen-money restitution is separate'], ['PR', 'Player / field', 'CR']):
    ax.set(title=title, ylabel=unit, xlabel='Event');ax.grid(alpha=.2);ax.legend(ncol=4, fontsize=8)
    for boss in [7, 14, 21, 28]: ax.axvline(boss, color='#777', alpha=.15)
fig.suptitle('Race-informed buyer: first entry among arrivals; changing censored populations. Duel excluded.')
fig.savefig(PAGE / 'curves.png', dpi=145);plt.close(fig)
fig, axes = plt.subplots(1, 2, figsize=(12, 4.7), layout='constrained')
for label in ['before', 'after']:
    c = result['cohorts'][label]['race']
    axes[0].plot([e['event'] for e in c['events']], [e['income'] for e in c['events']], color=colors[label], label=label+' settlement wallet change')
    axes[1].plot([e['event'] for e in c['events']], [e['retries'] for e in c['events']], color=colors[label], label=label)
axes[0].set(title='Wallet change at settlement (cap and restitution included)', xlabel='Event', ylabel='Median CR')
axes[1].set(title='Where the cohort spends repeat attempts', xlabel='Event', ylabel='Attempts beyond first entry')
for ax in axes: ax.grid(alpha=.2);ax.legend()
fig.savefig(PAGE / 'economy-and-retries.png', dpi=145);plt.close(fig)

esc = html.escape
def table(headers, rows):
    return '<div class="table-wrap"><table><thead><tr>'+''.join('<th>'+esc(str(h))+'</th>' for h in headers)+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+esc(str(v))+'</td>' for v in row)+'</tr>' for row in rows)+'</tbody></table></div>'
def fmt(v): return 'not reached' if v is None else f'{v:.2f}'
def card(key, label, samples, text):
    return f'<article class="card" data-direction="{key}" data-label="{esc(label)}" data-samples="{esc(samples)}"><h3>{esc(label)}</h3>{text}</article>'
cohort_rows = [[b, label, c['n'], c['completed'], c['censored'], c['bankruptcy']] for b in ['race', 'pr'] for label in ['before', 'after'] for c in [result['cohorts'][label][b]]]
hours_rows = [[label, g['skill'], f"{g['completed']}/{g['n']}", fmt(g['completedHoursMedian']), fmt(g['completedHoursP90']), fmt(g['censoredHoursMedian'])] for label in ['before', 'after'] for g in result['cohorts'][label]['race']['groups']]
ratio_rows = [[r['buyer'], r['event'], r['arrivals'], f"{r['ratio']:.4f}" if r['ratio'] is not None else 'not reached', f"{r['low']:.2f}–{r['high']:.2f}", 'not measured' if r['ratio'] is None else 'pass' if r['pass'] else 'MISS', 'not measured' if r['ratio'] is None else 'pass' if .85<=r['ratio']<=.90 else 'MISS'] for r in result['newBossChecks']]
roster_rows = [[r['tier']+1, r['build'], '; '.join(f'{c} {v:.1%}' for c,v in result['roster']['preCapsFull']['tiers'][i]['mixedWinnerShare'].items()), '; '.join(f'{c} {v:.1%}' for c,v in r['mixedWinnerShare'].items()), 'INCOMPLETE' if not r['scenarioComplete'] else 'pass' if r['dominancePass'] else 'MISS', 'INCOMPLETE' if not r['scenarioComplete'] else 'pass' if r['bestAndWorstPass'] else 'MISS'] for i,r in enumerate(result['roster']['after']['tiers'])]
course_rows = [[t['tier']+1,t['build'],course,c,counters['wins'].get(c,0),counters['races'],f"{counters['winnerShare'][c]:.1%}",fmt(counters['meanFinishSeconds'][c]),counters['uniqueHashes'],counters['pairedSeedBlocks']] for t in result['roster']['after']['tiers'] for course,counters in t['courses'].items() for c in t['mixedWinnerShare']]
difficulty_rows = []
for event in [7,14,21,28]:
    for lead in range(3):
        pair=[next(r for r in result['difficulty'][label]['groups'] if r['event']==event and r['lead']==lead and r['difficulty']==lead) for label in ['before','after']]
        difficulty_rows.append([event,['Rookie','Club','Pro'][lead]]+[f"{r['beatBoss']}/{r['n']}" for r in pair]+[f"{r['first']}/{r['n']}" for r in pair])
boss_garage_rows = [[r['version'],r['event'],r['rival'],r['car'],fmt(float(r['pr'])),r['credits'],r['parts']] for r in result['bossGarages']]
tier_rows = [[label,b,r['tier'],r['careers'],fmt(r['medianCompletedRaces'])] for label,cohorts in result['cohorts'].items() for b,c in cohorts.items() for r in c['selectedTiers']]
purchase_rows = [[b,key,c['purchases'][key]['n'],fmt(c['purchases'][key]['medianRace'])] for b,c in result['cohorts']['after'].items() for key in ['firstUpgrade','firstClubCar']]
censor_rows = [[label,b,g['skill'],g['n']-g['completed'],str(g['censoredAt'])] for label,cohorts in result['cohorts'].items() for b,c in cohorts.items() for g in c['groups']]
entry_rows = [[label,b,e['event'],e['arrivals'],fmt(e['entryCash']),fmt(e['nextUsefulPrice'])] for label,cohorts in result['cohorts'].items() for b,c in cohorts.items() for e in c['events'] if e['event'] in [7,14,21,28]]
reward_rows = [[label,b,['Rook','Ox','Vex','Mica'][i],'; '.join({'0':'unearned','1':'pending','2':'money','3':'car','4':'part','5':'migrated'}[code]+': '+str(n) for code,n in counts.items())] for label,cohorts in result['cohorts'].items() for b,c in cohorts.items() for i,counts in enumerate(c['actualRewards'])]
restitution_rows = [[label,b,fmt(c['meanRecovered']),fmt(c['meanRestitutionPaid']),fmt(c['meanRestitutionDue'])] for label,cohorts in result['cohorts'].items() for b,c in cohorts.items()]
duel_rows = [[label,r['skill'], 'both (paired)' if r['rotation'] is None else r['rotation'], r['fights'], r['rigWins'], f"{r['rigWins']/r['fights']:.1%}", f"{r['rigWins']/(r['fights']-r['draws']):.1%}" if r['fights']>r['draws'] else 'undefined', r['draws'], r['earlyLosses'], fmt(r['meanSeconds'])] for label,rows in [('before',result['beforeDuels']),('after',result['duels'])] for r in rows]
plot = (ROOT / 'campaign/OWNER-CAMPAIGN-CHOICE.md').read_text(encoding='utf-8').split("## The owner's words")[1].split('## Host reading')[0].strip().removeprefix('> ')
after_summary = json.loads((AFTER/'summary.json').read_text())
after_gates = after_summary['gates']
result['approximation'] = after_summary['approximation']
(OUT / 'review-data.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
gate_table = table(['Measured gate', 'Result'], [(k, 'pass' if v else 'MISS') for k,v in after_gates.items()])
cards = [
 card('rhythm','01 · Seven visits with a purpose','campaign.csv / 367 laps','<p><b>Proposed default:</b> retain 35 events and every course. Four build-up visits lead to a pressure run; a shorter qualifier gives room to prepare; the boss contest ends in a saved payout and a consequence beat.</p><p>Each act has a distinct job: shelter → receipts → route → public evidence → freedom. 753 old laps become 367. Stable event IDs preserve saves.</p>'),
 card('promotion','02 · Beat the named boss','Career.settle / DV1','<p><b>Proposed default:</b> finish alive ahead of the named boss to earn promotion. Other entrants still determine prize money and cup points. Third place can recruit a fourth-place boss.</p><p>A wreck or unfinished attempt cannot promote. No loss counter grants victory. The finale still requires being the last car running.</p>'),
 card('tiers','03 · A finite power ladder','career-curve.csv / roster controls','<p><b>Proposed default:</b> keep global ceiling 10 and three weapon slots; preserve class weaknesses with shared speed/grip limits. Early tiers are acquisition; Pro completes a build; Elite and Champion provide different strengths inside a finite physical envelope.</p><p>Explicit owner decision: replace the impossible late 0.89 PR target with a 0.93–1.03 band and judge tension through named-boss outcomes. The old-band misses remain visible. Line speed is capped at 8.125; Bastion grip at 9; Quill and Kestrel speed at 9.5. Stock Line speed is 5.5 instead of 6 and handling is 3 instead of 4; its original launch is retained. Installed tiers stay saved; their derived stats follow the shared limits. Physics and visible offers use the same fractional values. The measured gates below decide whether this candidate is balanced.</p>'),
 card('rewards','04 · Promotion through allies','campaign-allies.csv / Campaign.claim','<p><b>Proposed default:</b> choose money; the named car or its missing tier peer; or the ally specialty part with a useful unlocked fallback. The exact asset is named before claiming.</p><p>Money remains 350 / 650 / 1,000 / 1,400 CR. Options have different market values. A complete garage may leave only cash useful; pending choices survive restart. Allies give no hidden race boost.</p>'),
 card('debt','05 · The receipts return real money','save v6 / restitution ledger','<p><b>Proposed default:</b> Ox proves that diverted payments bought the enforcement fleet. Recovery reduces remaining principal first; the rest returns as cash. A full wallet retains the unpaid amount.</p><p>Debt never gates entry and insured repairs preserve a usable car. Marrow later invents an ownership lien even when the debt is zero. Seizure exposes his demand for control rather than a new surprise bill.</p>'),
 card('loyalty','06 · A coalition with something to lose','35 original beats / loyal Mechanic','<p><b>Proposed default:</b> Rook opens the crew account; Ox brings duplicate receipts; Vex opens the courier road and releases the recording; Mica distributes evidence and wins public access to the Crown.</p><p>The young Mechanic hides the sibling and builds the quarry-dispatcher rig in view of the player. Secrecy comes from fear and protection; there is no random betrayal. Text deepens the plot without new art or voice recordings.</p>'),
 card('finale','07 · The last car running','DeathDuel / paired survivor simulation','<p><b>Proposed default:</b> Marrow takes your developed car. The Mechanic supplies a basic Line rig with the automatic half-metre Mine Dispatcher. One-on-one; no lap win; free fully repaired retries.</p><p>Victory ends Marrow’s reign and returns the seized car. The rig is a fixed basic build on loan, with its original 6 / 3 / 5 / 4 / 4 / 4 / 2 / 4 stats shown in game; it is not a sellable reward. The crew coalition becomes the new league. The fight-to-the-death ending preserves the owner plot.</p>'),
 card('length','08 · A shorter complete campaign','OWNER FLAG / old 5–8 hour target','<p><b>Owner decision required:</b> adopt a provisional <b>4–6 hour</b> campaign target instead of the old 5–8 hours. The old race-informed Club median was 10.24 simulated driving hours with 233/667 careers still censored.</p><p>The new measured completed and censored hours are shown separately below. The earlier 3–5 hour proposal was too optimistic: final completed driving medians are about 4.60 hours for Club decisions and 3.73 for Pro. Adding an explicitly assumed 30–60 minutes for shops and story supports a typical 4–6 hour target; retry-heavy tails run longer. Neither proxy timing nor a Keep choice establishes human pacing or enjoyment.</p>'),
]
act_rows = [
 ['1 · The Yards','8 / 10 / 8 / 10 → 12 → 8 → 10','Rook: crew account','Survival becomes public'],
 ['2 · Foundry row','9 / 11 / 9 / 11 → 13 → 9 → 11','Ox: receipts and restitution','The stolen money bought the fleet'],
 ['3 · Flats and quarry','10 / 12 / 10 / 12 → 14 → 10 → 12','Vex: courier road and recording','The sibling survived'],
 ['4 · Mountain workshop','10 / 12 / 10 / 12 → 14 → 10 → 12','Mica: distributed evidence','No single wreck can erase it'],
 ['5 · Crown pits','10 / 12 / 10 / 12 → 14 → 10 → death duel','Car returns; fraudulent claim void','The crews inherit the league'],
]
story_rows = [[i+1,r['name'],r['phase'],read(DATA/'campaign-beats.csv')[i]['beat']] for i,r in enumerate(read(DATA/'campaign.csv'))]
catalog_rows = [[r['car'], r['price'], fmt(float(r['stockPR'])), fmt(float(r['developedPR'])), r['partSpend'], r['remainingUsefulOffers']] for r in result['catalog']]
page = f'''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Death Ride · campaign design pass 2</title>
<link rel="stylesheet" href="../../audio/report.css"><style>figure{{margin:24px 0}}figure img{{display:block;width:100%;height:auto;border:1px solid var(--line)}}.owner-flag{{border-left:5px solid var(--warn);padding:12px 20px;background:var(--wash)}}blockquote{{margin:20px 0;padding:18px 24px;border-left:4px solid var(--accent);background:var(--panel)}}details{{margin:22px 0}}summary{{cursor:pointer;font-weight:700;min-height:44px}}.lead{{font-size:1.15rem}}.cards{{margin:22px 0}}.truth{{display:flex;flex-wrap:wrap;gap:10px}}.truth span{{padding:6px 12px;border:1px solid var(--line);border-radius:5px}}code{{overflow-wrap:anywhere}}</style>
<body data-round="deathride.campaign.design-v2" data-page-title="Campaign design pass 2"><main><p class="owner-flag"><b>Historical proposal; owner decisions applied on 2026-10-03.</b> Item 02 was rejected: ordinary promotion requires first place. Items 01 and 03?08 were kept. <a href="../../evidence/owner-decisions/campaign/index.html">Current rule and fresh measured results</a>. The proposal and its original evidence below remain archived for comparison.</p>
<p>DEATH RIDE / THE ASH CIRCUIT / OWNER REVIEW</p><h1>The crews carry your name.</h1>
<p class="lead">A design pass on progression, pacing and the debt story. The rules are implemented on this branch. The choices below are proposals for you to Keep, Maybe or Reject.</p>
<p class="owner-flag"><b>Design candidate; acceptance remains incomplete.</b> Rookie decision proxies still censor at Vex, some proposed PR bands miss, one Frostline AI recovery jam is retained, and a developed Rookie roster race has two unresolved entrants. The class result below includes any failed gate; passing build tests is not a campaign balance approval.</p><div class="truth"><span>Core and desktop checks</span><span>Simulated careers; censoring retained</span><span>Stick: pending</span><span>Owner feel: pending</span><span>Art unchanged</span></div>
<p class="owner-flag"><b>Two explicit changes to the old brief:</b> a proposed 4–6 hour campaign target and a late-boss PR band of 0.93–1.03. Neither silently passes the old target. Remaining class and campaign misses appear below.</p>
<div class="report-toolbar"><label>Theme <select id="theme"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label><a href="#decisions">Eight design decisions</a><a href="#measurements">Measured before / after</a><a href="#export-panel">Copy Markdown</a><input id="matched" type="checkbox" hidden></div><p id="status" class="status" role="status" aria-live="polite"></p>
<details><summary>Your original plot, verbatim</summary><blockquote>{esc(plot)}</blockquote><a href="../OWNER-CAMPAIGN-CHOICE.md">Original owner choice document</a></details>
<h2>The new act rhythm</h2><p>Build-up → pressure → short qualifier → named boss → payout → consequence. Payout and consequence do not add another compulsory race.</p>
{table(['Act','Lap sequence: build-up → pressure → qualifier → boss','Promotion','Story turn'], act_rows)}
<details id="story-sheet"><summary>Read all 35 original plot beats</summary><p>Existing art and audio cues remain. These are the implemented text beats; no new spoken recordings are claimed.</p>{table(['Event','Title','Phase','Story beat'],story_rows)}</details>
<section id="decisions"><h2>Decisions for owner review</h2><p>No choices are preselected. A Keep is a design preference; it does not override a failed measurement. Notes stay in this browser until exported.</p><div class="cards">{''.join(cards)}</div><div id="winners" hidden></div></section>
<section id="measurements" class="review-section"><h2>What changed in the measured careers</h2><p>{esc(result['scope'])} Scripted Rookie / Club / Pro lead decisions face fixed Club rivals. These are not measurements of human skill or the three in-game difficulty settings.</p>
{table(['Buyer','Version','Careers','Completed','Censored at 70 attempts','Bankruptcies'],cohort_rows)}
<p>The first complete rhythm/promotion candidate, before class-limit changes, completed {result['preCapCohorts']['race']['completed']}/2,000 race-informed and {result['preCapCohorts']['pr']['completed']}/2,000 PR-buyer ledgers. It is retained separately. The final physical library uses a fresh namespace, so the difference from that intermediate candidate is not a paired estimate of the caps alone.</p>
<p>In the final race-informed cohort, all 667 Rookie proxies end at Vex in Quill with 8,000 CR and no useful unlocked offer. Their fully developed Quill cell beats Vex in 0/20 samples, including 0/18 held-out outcomes. More cash cannot escape that sampled cell. The separate funded cross gives Rookie decisions 17/128 boss wins against Rookie opponents, 2/128 against Club and 0/128 against Pro; that is diagnostic evidence, not an earned or human completion guarantee.</p><p>The baseline stalls despite a median end wallet of 8,000 CR. Useful upgrades have run out; the old rule also demands beating every entrant to recruit one named boss. Retained maximum-band Ox cells give Rookie decisions 20/120 named-boss wins but only 1/120 whole-field wins. Vex gives 0/160 for both. Promotion semantics alone cannot cure every stall.</p>
<details><summary>Where careers censor, and what they can still buy</summary>{table(['Version','Buyer','Lead decisions','Censored','Event: careers'],censor_rows)}{table(['Version','Buyer','Boss event','Arrivals','Median cash before attempt','Next useful part price'],entry_rows)}<p>Cash before an attempt follows any purchases and reward claim. A blank next-part price means the older trace did not record it. Final zero means no useful unlocked part. Entry cash can be tight immediately after acquisition while repeated losses later fill an exhausted garage's wallet.</p></details>
<figure><img src="curves.png" alt="Before and after player PR, field PR, ratio and debt among first arrivals"><figcaption>Arrival medians change population as careers censor. The supplied-rig finale is excluded from ordinary PR curves.</figcaption></figure>
{table(['Buyer','Boss event','Arrivals','Entry ratio','Proposed band','Proposed result','Old .85–.90 result'],ratio_rows)}
<figure><img src="economy-and-retries.png" alt="Wallet changes at settlement and repeated event attempts before and after"><figcaption>Settlement wallet change includes paid restitution and can be zero at the wallet cap; zero banked money is not zero prize income. Ally grants claimed before racing are separate. Repeat attempts remain counted.</figcaption></figure>
<details><summary>Boss cars, real difficulty and the money schedule</summary>
<p>Boss PR below is the named opponent, not the mean-field ratio denominator. Garages use earned and authored rival funds through the same legal shop.</p>
{table(['Version','Event','Boss','Car','PR','Remaining CR','Installed part tiers'],boss_garage_rows)}
<p>These separate funded tests match the lead decision setting to the actual opponent difficulty. Each row has 32 paired seed blocks crossed with two eligible cars and two lead slots. They diagnose difficulty effects; they are not 128 independent human players or earned careers.</p>
{table(['Boss event','Matched difficulty','Before beat boss','After beat boss','Before first','After first'],difficulty_rows)}
<p>The full three-by-three lead/opponent cross is retained in the review data. Career cohorts above keep fixed Club opponents for comparability.</p>
{table(['Buyer','Purchase','Careers making purchase','Completed races before purchase'],purchase_rows)}
{table(['Version','Buyer','Selected tier rank','Careers reaching this tier','Completed races before first selection'],tier_rows)}
{table(['Version','Buyer','Ally','Actual terminal reward states'],reward_rows)}<p>Unearned and pending choices remain distinct from claimed money, cars and parts. These are terminal states, not equal market-value offers. The old Rook race-buyer cohort took cash in all 2,000 careers because its named car and useful specialty part were already acquired.</p>
{table(['Version','Buyer','Mean recovered against principal','Mean restitution paid','Mean restitution still owed'],restitution_rows)}
<p>The league starts with 1,200 CR principal; interest adds 6 CR once per new event through the first 14 events while unexposed and indebted. Payment takes up to 20% of net winnings after loan service, preserves at least 40 CR take-home, and diverts 25% of that league payment before exposure. Ox exposes the theft at event 14. Principal recovery and cash restitution are conserved separately; retries do not add per-attempt interest. Optional loan debt remains a separate ledger.</p><p>Prize scales remain 1.6 / 2.2 / 2.2 / 2.4 / 2.6. Sixth-place gross before extras is 160 / 220 / 220 / 240 / 260 CR; first place is 320 / 440 / 440 / 480 / 520. Useful part base prices are 120 to 240 CR with a 1.85 multiplier per tier. Part tier 2 opens after four cleared events and tier 3 after eight; the second mount tier opens after five. Car licences open after 6 / 13 / 20 / 27 cleared events, before each ordinary boss, so an ally reward must account for an already-owned qualifier car. The economy is not made faster by hidden gifts.</p>
</details>
<p>A developed Kestrel / Rookie-policy sample at Mica (Frostline), seed 130194723, remains unfinished at the 720-second watchdog. An exact replay and a diagnostic extension to 1,020 seconds stay in RECOVER on lap 10 of 12. The accepted outcome remains unresolved. Neither 2,000-career cohort samples that row; both have zero Rookie arrivals at Mica. This is an open AI recovery defect, not evidence that more campaign cash would help.</p><h3>Length: completions and unfinished runs remain separate</h3>{table(['Version','Lead decisions','Completed / cohort','Completed driving hours p50','Completed hours p90','Censored hours p50'],hours_rows)}
<p>Hours exclude menus and reading. The 30–60 minute shop/story allowance is an assumption for planning, not measured human play.</p>
<h3>Finite garage: the actual price and power envelope</h3>{table(['Car','Stock price CR','Stock PR','Developed PR','Useful parts spend CR','Useful offers left'],catalog_rows)}
<p>The old legal PR upper bounds make a repeated late dip impossible: developed Flint / maximum Quill is 0.9456, and developed Quill / maximum Bulwark is 0.9896. Those bounds cannot reach 0.89 by adding rival cash. PR includes durability and weapons, so it also cannot substitute for measured race outcomes.</p><p>Developed builds use the real PR-buyer shop to exhaustion with explicit diagnostic funding. Only whole-credit prices round upward; effective stats and offer deltas retain their fractional values. They are not free campaign gifts. Higher caps are not used.</p>
<h3>Ten-class winner shares</h3><p>Each tier is a symmetric two-class field with three cars of each class and the same Rookie decision policy, six independently crossed grid rotations and 334 seed blocks per course: 2,004 races per course/build. Course weights are technical 25%, straight 50%, loose 25%. Winner share divides class wins by races, not by entries. Both assembled comparisons have 60,120 races. After the 8.25 cap failed at 56.11% developed Line wins, the Rookie pair was rerun through legal shops on 334 fresh seed blocks with an 8.125 cap. The other four tier pairs and stock homogeneous control are reused from the complete v5 run because their physical inputs are unchanged; they are not counted as new observations. Distinct seed values shared with calibration: {result['roster']['freshSeedOverlapWithCalibration']}. A separate 5,760-race before/after real-shop control uses the same 32 blocks. These tests isolate equal-tier peers on three synthetic courses; they do not establish balance across every mixed-tier campaign field or human driving style. The final paired control reruns Rookie and retains the unchanged other four pairs. Those shared rows identical: <b>{result['roster']['pairedRowsByteIdentical']}</b>.</p>
{table(['Tier','Build','Pre-cap mixed winner share','Final mixed winner share','Final 55% dominance gate','Final best/worst course gate'],roster_rows)}
<p>Stock and developed builds are separate verdicts. Terminal hashes cover physical positions, velocities, handling and combat state rather than simply hashing the seed label. The pre-cap full control reproduces all 5,760 frozen-baseline paired rows: <b>{result['roster']['preCapsBaselineReplay']}</b>. All final empirical mixed winner shares are within 55%, but the developed Rookie scenario remains INCOMPLETE: two Line entrants do not resolve in one of 12,024 Rookie races at the unchanged 300-second probe limit (seed 105254614). An exact diagnostic replay shows both cars still driving above 34 m/s at the limit and finishing at 392.95 / 393.22 seconds. The extension does not replace the accepted timeout. No limit or gate was widened. Any failed gate remains open. Homogeneous controls cover every class, course and all six occupied slots; the raw slot distributions and independent timing-order cross-check are in the review data. Timing-order agreement: <b>{result['homogeneousCrossCheck']['orderPass']}</b>.</p>
<details><summary>Per-course winners, times and distinct states</summary>{table(['Tier','Build','Course','Class','Wins','Races','Winner share','Mean finish seconds','Distinct hashes across rotations','Paired seed blocks'],course_rows)}<p>The 99% diversity alarm is evaluated separately in every rotation cell; full cell counts are in the review data. Distinct physical states do not prove statistical independence. Course weights are a content-mixture assumption.</p></details>
<h3>Final duel</h3>{table(['Version','Lead decisions','Grid rotation','Fights','Rig survivor wins','Wins / all fights','Wins / resolved fights','Draws','Opening losses','Mean seconds'],duel_rows)}
<p>512 paired seed blocks per skill and both slots. Draws stay in the all-fight denominator. Paired before/after duel rows identical: <b>{result['pairedDuelByteIdentical']}</b>. The Mechanic loaner has a fixed declared body matching the original basic rig. Dealership rebalancing does not rewrite this mission build. Its displayed stats and PR use that same definition; this fresh paired comparison checks the retained physics claim.</p>
<details><summary>Evidence gates and instrument limits</summary>{gate_table}<p>The old ratio and all-careers-completed failures are retained. Planted defects make the real dominance, diversity, opening-loss and rotation gates fire. Paired rotations are not counted as independent seeds.</p>{table(['Buyer','Median ratio approximation gap','95th percentile gap','Maximum gap'],[[r['buyer'],fmt(r['medianRatioGap']),fmt(r['p95RatioGap']),fmt(r['maximumRatioGap'])] for r in result['approximation']])}<p>The ordinary library uses a reference rival garage and three upgrade bands. Sparse held-out outcomes can produce zero-win cells. A separate fully crossed difficulty probe tests both next-tier peers against all three opponent settings; its 32 seed blocks per cell support diagnosis rather than precise human win rates.</p></details>
<p><a href="../../evidence/campaign/design-v2/review-data.json">Full review data, difficulty cross and control metrics</a> · <a href="../../evidence/campaign/design-v2/after/summary.json">Raw archive index and campaign audit</a> · <a href="../../../docs/concepts/deathride/DV0-campaign-diagnosis.md">Root-cause note</a> · <a href="../../../docs/concepts/deathride/DV2-campaign-evidence.md">Retained experiments</a> · <a href="../../../docs/concepts/deathride/DV3-owner-review-and-acceptance.md">Final conclusions and remaining work</a></p>
</section><section id="export-panel" class="review-section export"><h2>Your review</h2><p>Export before moving this folder or changing browsers. This page never writes an owner approval file.</p><button id="refresh-export" type="button">Refresh Markdown</button> <button id="copy" type="button">Copy Markdown</button><label for="export">Markdown in the same four-column format as the audio review</label><textarea id="export" readonly></textarea></section>
<p class="small">Static and offline. No remote requests, art generation or Stick access. Full file: <code>{esc((PAGE/'index.html').as_uri())}</code></p></main><script src="review.js"></script></body></html>'''
(PAGE/'index.html').write_text(page, encoding='utf-8')
print(json.dumps({'cohorts': {l: {b: c['completed'] for b,c in v.items()} for l,v in result['cohorts'].items()}, 'rosterPaired': result['roster']['pairedRowsByteIdentical'], 'duelPaired': result['pairedDuelByteIdentical']}, indent=2))
