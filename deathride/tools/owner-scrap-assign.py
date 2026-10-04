"""Apply the recorded section-4 decision once, preserving rejected bytes and catalog positions."""
import csv
import hashlib
import importlib.util
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'core/src/main/resources/data'
FOLDER = ROOT / 'tracks/candidates'
ARCHIVE = ROOT / 'tracks/excluded/owner-2026-10-04'
REJECTS = {'scrap-7-d', 'scrap-7-f'}

def read(path):
    with path.open(encoding='utf-8-sig', newline='') as f:
        return list(csv.DictReader(f))

def write(path, rows, keys):
    with path.open('w', encoding='utf-8', newline='') as f:
        w = csv.DictWriter(f, keys, lineterminator='\n')
        w.writeheader(); w.writerows(rows)

def main():
    owner = json.loads((FOLDER / 'owner-decisions.json').read_text())
    assert owner['assignment']['scrap-7'] == 'scrap-7-f', 'Decision already applied or unexpected source assignment'
    before = read(DATA / 'campaign.csv')
    catalog = read(DATA / 'tracks.csv')
    regions = read(DATA / 'region.csv')
    ledger = json.loads((ARCHIVE / 'archive-ledger.json').read_text())
    def archive(source, target, candidate):
        assert source.resolve().is_relative_to(ROOT.resolve())
        assert target.resolve().is_relative_to(ARCHIVE.resolve())
        assert not target.exists(), target
        target.parent.mkdir(parents=True, exist_ok=True)
        digest = hashlib.sha256(source.read_bytes()).hexdigest()
        shutil.move(str(source), str(target))
        ledger.append(dict(candidate=candidate, decision='rejected', path=str(target.relative_to(ROOT)), sha256=digest))
    # Keep the previous review data as provenance, independent of the active library.
    shutil.copy2(ROOT / 'tracks/atlas/scrap-7-data.js', ARCHIVE / 'scrap-7-review-before.js')
    for candidate in sorted(REJECTS):
        for path in sorted(FOLDER.rglob('*')):
            if path.is_file() and (path.name.startswith(candidate + '.') or path.name.startswith(candidate + '-')):
                archive(path, ARCHIVE / 'rejected' / path.relative_to(FOLDER), candidate)
        for path in sorted((DATA / 'tracks').glob(candidate + '*.csv')):
            archive(path, ARCHIVE / 'rejected/runtime/tracks' / path.name, candidate)
    for path in FOLDER.glob('*.csv'):
        rows = read(path)
        if rows and 'candidate' in rows[0]:
            rejected = [r for r in rows if r['candidate'] in REJECTS]
            if rejected:
                target = ARCHIVE / 'scrap-7-decision-tables' / path.name
                target.parent.mkdir(parents=True, exist_ok=True)
                write(target, rejected, list(rows[0]))
                write(path, [r for r in rows if r['candidate'] not in REJECTS], list(rows[0]))
    for name, key in [('tracks','id'),('track-pools','course'),('track-features','course'),('track-obstacles','course'),('course-pacing','course'),('career-unlocks','id')]:
        path = DATA / (name + '.csv'); rows = read(path)
        rejected = [r for r in rows if r[key] in REJECTS]
        target = ARCHIVE / 'rejected/runtime' / path.name
        target.parent.mkdir(parents=True, exist_ok=True)
        write(target, rejected, list(rows[0]))
        write(path, [r for r in rows if r[key] not in REJECTS], list(rows[0]))
    spec = importlib.util.spec_from_file_location('owner_apply', ROOT / 'tools/owner-tracks-apply.py')
    installer = importlib.util.module_from_spec(spec); spec.loader.exec_module(installer)
    installer.install(['scrap-7-e'], {'scrap-7':'scrap-7-e'})
    # Replace f at its previous catalog index; no other course or region attachment moves.
    current = {r['id']:r for r in read(DATA / 'tracks.csv')}
    ordered = [current['scrap-7-e' if r['id']=='scrap-7-f' else r['id']] for r in catalog]
    write(DATA / 'tracks.csv', ordered, list(catalog[0]))
    active = read(DATA / 'active-tracks.csv')
    for r in active:
        if r['id']=='scrap-7-f': r['id']='scrap-7-e'
    write(DATA / 'active-tracks.csv', active, list(active[0]))
    for r in regions:
        r['defaultCourses'] = ';'.join('scrap-7-e' if c=='scrap-7-f' else c for c in r['defaultCourses'].split(';'))
    write(DATA / 'region.csv', regions, list(regions[0]))
    assignments = read(FOLDER / 'owner-assignment.csv')
    # The generic candidate-table filter removed the old boss assignment.
    assignments.append(dict(event='scrap-7',candidate='scrap-7-e',course='scrap-7-e',status='owner-keep',alternate=''))
    assignments.sort(key=lambda r: next(i for i,e in enumerate(before) if e['id']==r['event']))
    write(FOLDER / 'owner-assignment.csv', assignments, list(assignments[0]))
    owner['assignment']['scrap-7'] = 'scrap-7-e'
    owner['keeps'].append('scrap-7-e')
    owner['rejectedAfterReview'] = sorted(REJECTS)
    owner.pop('provisional', None); owner.pop('provisionalRule', None)
    owner['scrap7Decision'] = dict(date='2026-10-04',status='applied',keep='scrap-7-e',reject=sorted(REJECTS),source='docs/concepts/DEATH-RIDE-OWNER-DECISIONS-2026-10-04.md#4',balanceStatus='flagged: first-place promotion diagnostic; no rule change')
    (FOLDER / 'owner-decisions.json').write_text(json.dumps(owner, indent=2)+'\n')
    snapshots = [ARCHIVE / 'scrap-7-review-before.js', *sorted((ARCHIVE / 'scrap-7-decision-tables').glob('*.csv')), *sorted((ARCHIVE / 'rejected/runtime').glob('*.csv'))]
    for path in snapshots:
        ledger.append(dict(candidate='scrap-7',decision='decision-provenance',path=str(path.relative_to(ROOT)),sha256=hashlib.sha256(path.read_bytes()).hexdigest()))
    (ARCHIVE / 'archive-ledger.json').write_text(json.dumps(ledger, indent=2)+'\n')
    after = read(DATA / 'campaign.csv')
    assert len(after)==35 and [r['id'] for r in before]==[r['id'] for r in after]
    for a,b in zip(before,after):
        assert {k:v for k,v in a.items() if k!='course'}=={k:v for k,v in b.items() if k!='course'}
        assert b['course']==('scrap-7-e' if a['id']=='scrap-7' else a['course'])
    print('Applied scrap-7-e; archived d/f; 35 event IDs and non-course fields preserved.')

if __name__ == '__main__':
    main()
