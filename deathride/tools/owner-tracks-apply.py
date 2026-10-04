"""Apply explicit owner picks; preserve rejected proposal files outside runtime/resources."""
from pathlib import Path
import csv, io, json, shutil, zipfile, hashlib

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'core/src/main/resources/data'
FOLDER = ROOT / 'tracks/candidates'
ARCHIVE = ROOT / 'tracks/excluded/owner-2026-10-04'
KEEPS = '''scrap-1-c scrap-2-a scrap-2-c scrap-3-c scrap-4-b scrap-4-c scrap-5-a scrap-5-c scrap-6-b
foundry-1-c foundry-2-b foundry-3-b foundry-4-c foundry-5-a foundry-6-b foundry-7-b
salt-1-b salt-2-c salt-3-a salt-4-c salt-5-a salt-6-a salt-7-b
switchback-1-a switchback-2-c switchback-3-c switchback-5-a switchback-6-c switchback-7-c
crown-1-a crown-2-a crown-3-a crown-4-a crown-5-c crown-6-a crown-7-a'''.split()
UNREVIEWED = {'foundry-7-a', 'foundry-7-c', 'switchback-2-b'}
ALTERNATES = {'scrap-2-c', 'scrap-4-b', 'scrap-5-a'}

def read(path):
    return list(csv.DictReader(path.open(encoding='utf-8-sig', newline='')))

def write(path, rows, keys=None):
    keys = keys or list(rows[0])
    with path.open('w', encoding='utf-8', newline='') as f:
        w = csv.DictWriter(f, keys, lineterminator='\n'); w.writeheader(); w.writerows(rows)

def install(ids, assignment):
    tables = {name: read(DATA / (name + '.csv')) for name in
              ['tracks', 'track-pools', 'track-features', 'track-obstacles', 'course-pacing', 'event-pacing', 'campaign', 'region', 'career-unlocks']}
    fragments = {'tracks-row.csv':'tracks', 'track-pools-row.csv':'track-pools',
                 'track-features-row.csv':'track-features', 'track-obstacles-row.csv':'track-obstacles',
                 'course-pacing-rows.csv':'course-pacing'}
    for candidate in ids:
        with zipfile.ZipFile(FOLDER / 'bundles' / (candidate + '.zip')) as z:
            for name in z.namelist():
                if name.startswith('tracks/') and name.endswith('.csv'):
                    dest = DATA / name
                    assert dest.resolve().is_relative_to((DATA / 'tracks').resolve())
                    dest.write_bytes(z.read(name))
            for fragment, table in fragments.items():
                key = 'id' if table == 'tracks' else 'course'
                tables[table] = [r for r in tables[table] if r[key] != candidate]
                tables[table] += list(csv.DictReader(io.StringIO(z.read(fragment).decode())))
            if candidate in assignment.values():
                event = list(csv.DictReader(io.StringIO(z.read('campaign-row.csv').decode())))[0]
                tables['campaign'] = [event if r['id'] == event['id'] else r for r in tables['campaign']]
                pacing = list(csv.DictReader(io.StringIO(z.read('event-pacing-row.csv').decode())))[0]
                tables['event-pacing'] = [pacing if r['event'] == pacing['event'] else r for r in tables['event-pacing']]
            region = next(r for r in tables['region'] if r['division'] == candidate.split('-')[0])
            members = region['defaultCourses'].split(';')
            if candidate not in members: region['defaultCourses'] += ';' + candidate
            tables['career-unlocks'] = [r for r in tables['career-unlocks'] if not (r['kind']=='track' and r['id']==candidate)]
            event_index = next(i for i,r in enumerate(tables['campaign']) if r['id']==candidate.rsplit('-',1)[0])
            tables['career-unlocks'].append(dict(kind='track', id=candidate, afterRounds=str(event_index), name=candidate))
    for table, rows in tables.items(): write(DATA / (table + '.csv'), rows)

def main():
    assert len(KEEPS) == 36
    ARCHIVE.mkdir(parents=True, exist_ok=True)
    baseline = ARCHIVE / 'campaign-before.csv'
    if not baseline.exists(): shutil.copy2(DATA / 'campaign.csv', baseline)
    manifest = read(FOLDER / 'manifest.csv')
    if len(manifest) == 102:
        shutil.copy2(FOLDER / 'manifest.csv', ARCHIVE / 'manifest-before.csv')
        ledger = []
        for row in manifest:
            candidate = row['candidate']
            if candidate in KEEPS: continue
            status = 'not-reviewed' if candidate in UNREVIEWED else 'rejected'
            for path in list(FOLDER.rglob('*')):
                if path.is_file() and (path.name.startswith(candidate + '.') or path.name.startswith(candidate + '-')):
                    target = ARCHIVE / status / path.relative_to(FOLDER)
                    assert path.resolve().is_relative_to(FOLDER.resolve())
                    assert target.resolve().is_relative_to(ARCHIVE.resolve())
                    target.parent.mkdir(parents=True, exist_ok=True)
                    ledger.append(dict(candidate=candidate, decision=status, path=str(target.relative_to(ROOT)), sha256=hashlib.sha256(path.read_bytes()).hexdigest()))
                    shutil.move(str(path), str(target))
        (ARCHIVE / 'archive-ledger.json').write_text(json.dumps(ledger, indent=2)+'\n')
        for path in FOLDER.glob('*.csv'):
            rows = read(path)
            if not rows: continue
            key = 'candidate' if 'candidate' in rows[0] else None
            if key:
                shutil.copy2(path, ARCHIVE / path.name)
                write(path, [r for r in rows if r[key] in KEEPS or r[key]=='switchback-4-runoff'], list(rows[0]))
    assignment = {c.rsplit('-', 1)[0]:c for c in KEEPS if c not in ALTERNATES}
    assignment['switchback-4'] = 'switchback-4-runoff'
    install(KEEPS, assignment)
    rows = []
    for event in read(DATA / 'campaign.csv'):
        rows.append(dict(event=event['id'], candidate=assignment.get(event['id'], ''), course=event['course'],
                         status='pending-new-layout' if event['id']=='scrap-7' else 'owner-keep',
                         alternate=';'.join(sorted(c for c in ALTERNATES if c.rsplit('-',1)[0]==event['id']))))
    write(FOLDER / 'owner-assignment.csv', rows)
    (FOLDER / 'owner-decisions.json').write_text(json.dumps(dict(keeps=KEEPS+['switchback-4-runoff'], unreviewed=sorted(UNREVIEWED),
        alternates=sorted(ALTERNATES), assignment=assignment, pending=['scrap-7'], rule='Pass gates; minimize early lead-slot wrecks, stalls, then distance from 195 s combat median.'), indent=2)+'\n')
    print('Installed 36 kept composer courses (33 event assignments, three practice alternates); unchanged Runoff; scrap-7 pending.')

if __name__ == '__main__': main()
