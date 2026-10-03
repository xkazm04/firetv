"""Freeze report classpath directories before a long run; leave dependency jars in place."""
import hashlib
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
tag = sys.argv[1]
target = root / 'build' / 'campaign-v2-runtime' / tag
target.mkdir(parents=True, exist_ok=False)
entries = (root / 'core/build/report-classpath.txt').read_text().strip().split(os.pathsep)
frozen, hashes, empty = [], {}, []
for i, entry in enumerate(entries):
    p = Path(entry)
    if p.is_dir():
        dest = target / str(i)
        shutil.copytree(p, dest)
        frozen.append(str(dest))
        for f in sorted(dest.rglob('*')):
            if f.is_file():
                hashes[str(f.relative_to(target)).replace('\\', '/')] = hashlib.sha256(f.read_bytes()).hexdigest()
    else:
        if not p.is_file():
            # Gradle includes Java output folders in this Kotlin-only module.
            if p.suffix == '.jar':
                raise FileNotFoundError(p)
            empty.append(str(p))
            continue
        frozen.append(str(p))
        hashes[str(p)] = hashlib.sha256(p.read_bytes()).hexdigest()
(target / 'classpath.txt').write_text(os.pathsep.join(frozen))
manifest = dict(tag=tag, commit=subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip(),
    scope='Executing copied class/resource bytes; external immutable dependency jars hashed. Replays are not independent samples.', emptyClasspathDirectories=empty, sha256=hashes)
(target / 'provenance.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(target)
