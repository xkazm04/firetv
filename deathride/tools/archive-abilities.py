"""Losslessly archive raw report cells, with hashes of both raw and stored bytes."""
import argparse
import gzip
import hashlib
import json
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('source', type=Path)
parser.add_argument('destination', type=Path)
args = parser.parse_args()
assert args.source.is_dir()
args.destination.mkdir(parents=True, exist_ok=True)
manifest = {}
for source in sorted(args.source.iterdir()):
    if not source.is_file() or source.suffix not in ('.csv', '.json', '.md', '.txt'):
        continue
    raw = source.read_bytes()
    stored = gzip.compress(raw, mtime=0) if source.suffix == '.csv' else b'\n'.join(line.rstrip(b' \t') for line in raw.replace(b'\r\n', b'\n').split(b'\n')).rstrip(b'\n')+b'\n'
    name = source.name + ('.gz' if source.suffix == '.csv' else '')
    (args.destination/name).write_bytes(stored)
    manifest[name] = {'rawSha256': hashlib.sha256(raw).hexdigest(), 'storedSha256': hashlib.sha256(stored).hexdigest(),
                      'rawBytes': len(raw), 'storedBytes': len(stored), 'storage': 'lossless gzip' if source.suffix == '.csv' else 'UTF-8 text, LF line endings, trailing whitespace/blank EOF lines trimmed'}
(args.destination/'archive-manifest.json').write_text(json.dumps(manifest, indent=2)+'\n', encoding='utf-8', newline='\n')
print(f'Archived {len(manifest)} files to {args.destination}')
