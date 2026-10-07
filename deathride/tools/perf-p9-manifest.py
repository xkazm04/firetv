"""Seal P9: committed summaries under evidence/perf/p9 and the raw evidence kept outside git, each with its SHA-256."""
import argparse, datetime, hashlib, json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
p = argparse.ArgumentParser()
p.add_argument('--raw', type=Path, default=Path('C:/Users/kazda/kiro/deathride-raw-evidence/p9'))
a = p.parse_args()
base = ROOT / 'evidence/perf/p9'

def item(path, root):
    return {'path': path.relative_to(root).as_posix(), 'bytes': path.stat().st_size,
            'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}

committed = [item(f, ROOT) for f in sorted(base.rglob('*')) if f.is_file() and f.name != 'manifest.json']
raw = [item(f, a.raw) for f in sorted(a.raw.rglob('*')) if f.is_file()]
total = sum(f['bytes'] for f in committed)
assert total < 5 * 1048576, f'committed P9 evidence is {total} bytes, over 5 MiB'
(base / 'manifest.json').write_text(json.dumps({
    'generatedUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'committedBytes': total, 'committed': committed,
    'rawRoot': a.raw.as_posix(), 'rawBytes': sum(f['bytes'] for f in raw), 'raw': raw,
    'limits': 'Raw traces (.gz), full-size captures, logs and APKs stay outside git; this manifest binds their bytes. It excludes itself.'},
    indent=2) + '\n')
print('committed', len(committed), total, 'bytes; raw', len(raw), 'files')
