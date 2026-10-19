"""P18 (descriptive, written after the A/B runs; no verdict reads it): ART's heap envelope from each run's logged GC lines.

ART logs a GC only when it pauses over 5 ms or runs over 100 ms in total; each line ends with '<free>% free, <used>MB/<footprint>MB':
what survived the GC and the footprint ART grew the heap to after it. The footprint minus the survivors is the headroom the heap
fills before the next GC, whatever the allocation rate. Usage: python -I tools/perf-p18-gc.py OUT.json RUN_DIR...
"""
import json, re, statistics, sys
from pathlib import Path

LINE = re.compile(r'(young )?concurrent copying GC freed (\d+)\((\d+)(KB|MB|B)\) AllocSpace objects, (\d+)\((\d+)(KB|MB|B)\) LOS objects, '
                  r'(\d+)% free, (\d+)MB/(\d+)MB, paused (\S+) total ([\d.]+)(ms|us|s)')
UNIT = {'B': 1 / 1048576, 'KB': 1 / 1024, 'MB': 1}


def read(run):
    gcs = []
    for ln in (run / 'logcat.txt').read_text(errors='replace').splitlines():
        m = LINE.search(ln)
        if m:
            gcs.append({'young': bool(m[1]), 'freedMiB': round(int(m[3]) * UNIT[m[4]], 2), 'losFreedMiB': round(int(m[6]) * UNIT[m[7]], 2),
                        'losObjects': int(m[5]), 'usedMB': int(m[9]), 'footprintMB': int(m[10]),
                        'totalMs': float(m[12]) * {'ms': 1, 'us': 1e-3, 's': 1e3}[m[13]]})
    # Startup GCs run on a small heap before the course and art load; the race's are those with over 30 MB surviving.
    race = [g for g in gcs if g['usedMB'] > 30]
    full = [g for g in race if not g['young']]
    return {'run': run.name, 'loggedGcs': len(gcs), 'raceGcs': len(race), 'fullGcs': len(full),
            'headroomMB': sorted({g['footprintMB'] - g['usedMB'] for g in full}),
            'usedAfterGcMB': [min(g['usedMB'] for g in full), max(g['usedMB'] for g in full)] if full else None,
            'footprintMB': [min(g['footprintMB'] for g in full), max(g['footprintMB'] for g in full)] if full else None,
            'freedPerGcMiB': {'median': round(statistics.median(g['freedMiB'] + g['losFreedMiB'] for g in race), 2),
                              'losShareOfFreed': round(sum(g['losFreedMiB'] for g in race) / sum(g['freedMiB'] + g['losFreedMiB'] for g in race), 3)} if race else None,
            'loggedGcTotalMs': [min(g['totalMs'] for g in race), max(g['totalMs'] for g in race)] if race else None}


def main():
    out = Path(sys.argv[1])
    runs = [read(Path(p)) for p in sys.argv[2:]]
    out.write_text(json.dumps({'what': __doc__.strip().split('\n\n')[0], 'runs': runs}, indent=1) + '\n')
    for r in runs:
        print(r)


main()
