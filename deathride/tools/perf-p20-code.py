"""P20 (card 13, research; no verdict reads it): the meminfo Code line, row by row, and the smaps files behind it.

The App Summary's Code is the private (dirty + clean) pages of the .so, .jar, .apk, .ttf, .dex and .oat mmap rows; their
Pss Total also holds a share of the pages other processes map. Inputs: P20's dumpsys meminfo files and smaps files, and the
meminfo text of every probe sample in earlier runs' raw.json.gz (P19's).
Usage: python -I tools/perf-p20-code.py OUT.json --meminfo LABEL=FILE ... --raw LABEL=RAW.json.gz ... --smaps LABEL=FILE ...
"""
import argparse, collections, gzip, json, re
from pathlib import Path

ROWS = ('.so mmap', '.jar mmap', '.apk mmap', '.ttf mmap', '.dex mmap', '.oat mmap', '.art mmap', 'Other mmap', 'Dalvik Heap',
        'GL mtrack', 'Native Heap')
COLS = ('pssTotal', 'privateDirty', 'privateClean', 'swapPssDirty', 'rssTotal')


def rows(text):
    """Per row: Pss Total, Private Dirty, Private Clean, SwapPss Dirty, Rss Total (KB); App Summary Code and TOTAL PSS."""
    out = {}
    for name in ROWS:
        m = re.search(r'^\s*' + re.escape(name) + r'\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)', text, re.M)
        if m:
            out[name] = dict(zip(COLS, map(int, m.groups())))
    m = re.search(r'^\s*Code:\s+(\d+)\s+(\d+)', text, re.M)
    if m:
        out['Code'] = {'pss': int(m[1]), 'rss': int(m[2])}
    m = re.search(r'TOTAL PSS:\s+(\d+)', text)
    if m:
        out['TOTAL PSS'] = int(m[1])
    m = re.search(r'^\s*Java Heap:\s+(\d+)', text, re.M)
    if m:
        out['Java Heap'] = int(m[1])
    return out


def smaps(path):
    """Pss, private clean and dirty, shared clean and Rss (KB) per mapped file, from /proc/<pid>/smaps."""
    per = collections.defaultdict(lambda: collections.Counter())
    name = None
    for ln in Path(path).read_text(errors='replace').splitlines():
        head = re.match(r'^[0-9a-f]+-[0-9a-f]+\s+\S+\s+\S+\s+\S+\s+\d+\s*(.*)$', ln)
        if head:
            name = head[1].strip() or '[anon]'
            per[name]['mappings'] += 1
            continue
        m = re.match(r'^(Pss|Private_Clean|Private_Dirty|Shared_Clean|Shared_Dirty|Rss|Swap|SwapPss):\s+(\d+) kB', ln)
        if m and name is not None:
            per[name][m[1]] += int(m[2])
    return per


def kind(name):
    for ext in ('.so', '.jar', '.apk', '.ttf', '.dex', '.vdex', '.odex', '.oat', '.art'):
        if name.endswith(ext) or (ext + ' ') in name or name.endswith(ext + ']'):
            return ext
    return 'other'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out', type=Path)
    ap.add_argument('--meminfo', action='append', default=[])
    ap.add_argument('--raw', action='append', default=[])
    ap.add_argument('--smaps', action='append', default=[])
    a = ap.parse_args()
    out = {'what': __doc__.strip().split('\n\n')[0], 'meminfo': {}, 'runs': {}, 'smaps': {}}
    for item in a.meminfo:
        label, path = item.split('=', 1)
        out['meminfo'][label] = rows(Path(path).read_text(errors='replace'))
    for item in a.raw:
        label, path = item.split('=', 1)
        raw = json.loads(gzip.decompress(Path(path).read_bytes()))
        out['runs'][label] = [{'second': round(m['second'], 1), **rows(m['text'])} for m in raw['memory'] if m.get('text')]
    for item in a.smaps:
        label, path = item.split('=', 1)
        per = smaps(path)
        files = []
        by_kind = collections.Counter()
        by_kind_private = collections.Counter()
        for name, c in per.items():
            k = kind(name)
            if k == 'other':
                continue
            private = c['Private_Clean'] + c['Private_Dirty']
            by_kind[k] += c['Pss']
            by_kind_private[k] += private
            files.append({'file': name, 'kind': k, 'pss': c['Pss'], 'private': private, 'privateClean': c['Private_Clean'],
                          'privateDirty': c['Private_Dirty'], 'sharedClean': c['Shared_Clean'], 'rss': c['Rss'],
                          'mappings': c['mappings']})
        files.sort(key=lambda f: -f['private'])
        out['smaps'][label] = {'pssByKind': dict(by_kind), 'privateByKind': dict(by_kind_private),
                               'filePrivateTotal': sum(by_kind_private.values()), 'files': files[:40]}
    a.out.write_text(json.dumps(out, indent=1) + '\n')


if __name__ == '__main__':
    main()
