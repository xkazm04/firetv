"""Archive fresh owner-rule runs; keep DV3 unchanged as a historical comparator."""
import csv
from collections import defaultdict
import gzip
import hashlib
import html
import io
import json
import os
from pathlib import Path
from owner_campaign_metrics import summarize, instrument_cases

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT/'build/reports/campaign/q3/owner-2026-10-03'
OUT = ROOT/'evidence/owner-decisions/campaign'
OUT.mkdir(parents=True, exist_ok=True)


def read(path):
    raw = gzip.decompress(path.read_bytes()) if path.suffix == '.gz' else path.read_bytes()
    return list(csv.DictReader(io.StringIO(raw.decode('utf-8'))))


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


curve = read(ROOT/'core/src/main/resources/data/career-curve.csv')
result = dict(rule='Ordinary bosses require a surviving first-place finish; finale remains last car running.',
    horizon=70, scope='Two 2,000-career conditional ledgers, not independently driven full campaigns. Lead decision proxies versus fixed Club opponents. Same physical seed schedule as DV3; paired observations are not new independent seed blocks. Buyer training now rewards first place.',
    cohorts={}, archives=[], instrumentCases=instrument_cases(), physicalComparison={})
frozen=ROOT/'build/campaign-v2-runtime/owner-2026-10-03'
provenance=json.loads((frozen/'provenance.json').read_text())
for name,digest in provenance['sha256'].items():
    path=Path(name)
    assert sha((path if path.is_absolute() else frozen/path).read_bytes())==digest
old_dirs=[Path(x) for x in (frozen/'classpath.txt').read_text().split(os.pathsep) if Path(x).is_dir()]
new_dirs=[Path(x) for x in (ROOT/'core/build/report-classpath.txt').read_text().strip().split(os.pathsep) if Path(x).is_dir()]
assert len(old_dirs)==len(new_dirs)
for a,b in zip(old_dirs,new_dirs):
    hashes=lambda p:{str(f.relative_to(p)):sha(f.read_bytes()) for f in p.rglob('*') if f.is_file()}
    assert hashes(a)==hashes(b)
result['runtimeAudit']=dict(frozenMatchesFinalBuild=True,verifiedDigests=len(provenance['sha256']))
old = json.loads((ROOT/'evidence/campaign/design-v2/review-data.json').read_text())
result['beforeDV3'] = old['cohorts']['after']
for buyer in ('race', 'pr'):
    c, t = read(SOURCE/f'careers-{buyer}.csv'), read(SOURCE/f'timeline-{buyer}.csv')
    assert len(c) == 2000 and len({r['seed'] for r in c}) == 2000
    result['cohorts'][buyer] = summarize(c, t, curve)
    assert result['cohorts'][buyer]['gates']['firstPlacePromotions']
    assert result['cohorts'][buyer]['gates']['censorHorizon']
for path in sorted(SOURCE.glob('*.csv')):
    raw = path.read_bytes()
    (OUT/(path.name+'.gz')).write_bytes(gzip.compress(raw, mtime=0))
    result['archives'].append(dict(file=path.name+'.gz', sha256=sha(raw), rows=len(read(path))))
    previous = ROOT/'evidence/campaign/design-v2/after'/(path.name+'.gz')
    if previous.exists() and path.stem in ('physical','boss-extra','reference-garages','boss-extra-garages','duels'):
        before = gzip.decompress(previous.read_bytes())
        result['physicalComparison'][path.stem] = dict(byteIdentical=before==raw,
            beforeSha256=sha(before), afterSha256=sha(raw))
physical = read(SOURCE/'physical.csv')+read(SOURCE/'boss-extra.csv')
result['physicalRows'] = len(physical)
cells=defaultdict(list)
for r in physical:cells[tuple(r[k] for k in ('round','skill','car','band'))].append(r)
events=read(ROOT/'core/src/main/resources/data/campaign.csv')
cars=read(ROOT/'core/src/main/resources/data/cars.csv')
tiers=['rookie','club','pro','elite','champion']
bands=[0,4,sum(int(r['maxTier']) for r in read(ROOT/'core/src/main/resources/data/parts.csv'))]
expected={(str(round),str(skill),str(car),str(band)) for round,e in enumerate(events[:34])
    for skill in range(3) for car,c in enumerate(cars) if tiers.index(c['tier'])<=int(e['playerTier']) for band in bands}
result['physicalInstrument']=dict(completeCross=set(cells)==expected and all(len(v)==(20 if int(k[0]) in (6,13,20,27) else 4) for k,v in cells.items()),
    cells=[dict(round=int(k[0])+1,skill=int(k[1]),car=cars[int(k[2])]['id'],band=int(k[3]),
        rows=len(v),uniqueSeeds=len({r['seed'] for r in v}),uniqueHashes=len({r['hash'] for r in v})) for k,v in sorted(cells.items())])
result['physicalInstrument']['seedDiversity']=all(c['uniqueSeeds']==c['rows'] and c['uniqueHashes']/c['rows']>=.99 for c in result['physicalInstrument']['cells'])
assert result['physicalInstrument']['completeCross']
result['unresolvedLeadRows'] = [r for r in physical if r['finished']=='false' and float(r['hp'])>0]
result['duelRows'] = len(read(SOURCE/'duels.csv'))
result['retainedPhysicalLimitations'] = old['unresolvedDiagnostics']
result['retainedRoster'] = 'DV3 stock/developed controls retained; no car, cap, physics, weapon or ability change in this application. Developed Rookie all-resolved failure remains INCOMPLETE. No new roster acceptance claimed.'
result['instrumentReview'] = 'Exact core tests exercise first place, third ahead of boss, wreck, unfinished, duplicate settlement and finale. Shared Python report gates are probed below; DV3 winner-share, diversity, rotation and all-resolved adversarial tests are rerun. PR denominator is field mean; old bands remain visible. Missing arrivals fail rather than pass. Numeric campaign acceptance remains separate from owner design acceptance.'
for name in ('provenance.json',):
    (OUT/name).write_bytes((ROOT/'build/campaign-v2-runtime/owner-2026-10-03'/name).read_bytes())
for name in ('buyer-race.txt','buyer-pr.txt','final-core-replay.txt'):
    if (SOURCE/name).exists(): (OUT/name).write_bytes((SOURCE/name).read_bytes())
(OUT/'report.json').write_text(json.dumps(result, indent=2)+'\n', encoding='utf-8')
table = ''
bands = ''
for buyer, c in result['cohorts'].items():
    b = result['beforeDV3'][buyer]
    table += f'<tr><td>{buyer}</td><td>{b["completed"]}</td><td>{c["completed"]}</td><td>{c["censored"]}</td><td>{c["bankruptcy"]}</td></tr>'
    for r in c['bosses']:
        bands += f'<tr><td>{buyer}</td><td>{r["event"]}</td><td>{r["arrivals"]}</td><td>{r["attempts"]}</td><td>{r["firstEntryRatio"]}</td><td>{r["band"]}</td><td>{r["bandPass"]}</td><td>{r["oldBandPass"]}</td></tr>'
page = f'''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Owner campaign rule applied — 2026-10-03</title><style>body{{font:16px system-ui;max-width:1100px;margin:2em auto;padding:1em;background:#eee9dc;color:#242020}}table{{border-collapse:collapse}}td,th{{padding:.5em;border:1px solid #777}}pre{{white-space:pre-wrap;overflow-wrap:anywhere}}.scroll{{overflow:auto}}</style><h1>Win the boss race</h1><p>{html.escape(result['rule'])}</p><p>{html.escape(result['scope'])} The 4–6 hour target is an accepted design goal, not a completion guarantee. Menus/story add an assumed 30–60 minutes.</p><h2>Completions out of 2,000 per policy</h2><div class="scroll"><table><tr><th>Buyer</th><th>DV3</th><th>First-place rule</th><th>Censored at 70</th><th>Bankrupt</th></tr>{table}</table></div><h2>First-entry field-mean PR ratios</h2><div class="scroll"><table><tr><th>Buyer</th><th>Boss event</th><th>Arrivals</th><th>Attempts</th><th>Median ratio</th><th>Accepted band</th><th>Pass</th><th>Old .85–.90 pass</th></tr>{bands}</table></div><h2>Completed and censored driving hours</h2><pre>{html.escape(json.dumps({b:c['groups'] for b,c in result['cohorts'].items()},indent=2))}</pre><h2>Instrument self-review</h2><p>{html.escape(result['instrumentReview'])}</p><pre>{html.escape(json.dumps(result['instrumentCases'],indent=2))}</pre><h2>Physical comparison and unresolved evidence</h2><p>{html.escape(result['retainedRoster'])}</p><pre>{html.escape(json.dumps(result['physicalComparison'],indent=2))}</pre><p>Fresh unresolved lead rows: {len(result['unresolvedLeadRows'])}. All Stick and human pacing/feel checks remain unmeasured; no device accessed.</p><p><a href="report.json">Full report, limitations, gates and archive hashes</a> · <a href="../../../campaign/design-v2/index.html">Historical DV3 owner proposal</a> · <a href="../../../../docs/concepts/DEATH-RIDE-OWNER-DECISIONS-2026-10-03.md">Owner decisions</a></p></html>'''
(OUT/'index.html').write_text(page, encoding='utf-8')
print(json.dumps({b:dict(completed=c['completed'],censored=c['censored'],bossRatios=[r['firstEntryRatio'] for r in c['bosses']]) for b,c in result['cohorts'].items()},indent=2))
