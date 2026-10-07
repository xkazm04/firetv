"""P13f: every ART GC of a perf-device run, on the probe's clock, with what the app was doing.

Reads <run>/logcat.txt (ART logs only GCs over 5 ms of pause or 100 ms in total) and <run>/raw.json (the probe's rounds,
windows and /profile runtime stats). The runtime stats give every GC (art.gc.gc-count) and every byte allocated
(art.gc.bytes-allocated), logged or not.

Usage: python -I tools/perf-p13f-gc.py <run dir> [<run dir> ...] > out.json
"""
import datetime, json, re, sys
from pathlib import Path

LINE = re.compile(r'^(\d\d-\d\d) (\d\d:\d\d:\d\d\.\d+)\s+\d+\s+\d+ I [^:]*: (Background|Explicit|Alloc)?\s*(young )?concurrent copying GC '
                  r'freed (\d+)\((\d+)(KB|MB)\) AllocSpace objects, (\d+)\((\d+)(KB|MB|B)\) LOS objects, (\d+)% free, (\d+)MB/(\d+)MB, '
                  r'paused ([\d.]+)(us|ms) total ([\d.]+)(us|ms|s)')


def mb(v, unit):
    return float(v) / {'B': 1048576, 'KB': 1024, 'MB': 1}[unit]


def ms(v, unit):
    return float(v) * {'us': .001, 'ms': 1, 's': 1000}[unit]


def phase_at(raw, second):
    for r in raw['rounds']:
        if r['startedSecond'] <= second <= r.get('endedSecond', 1e9):
            return 'race ' + r['track']
    return 'lobby'


def run(path):
    path = Path(path)
    raw = json.loads((path / 'raw.json').read_text())
    year = datetime.datetime.fromisoformat(raw['startedUtc'].replace('Z', '+00:00')).year
    def local(day, clock):
        return datetime.datetime.strptime(f'{year}-{day} {clock[:15]}', '%Y-%m-%d %H:%M:%S.%f')
    text = (path / 'logcat.txt').read_text(errors='replace')
    gcs = []
    for line in text.splitlines():
        m = LINE.match(line)
        if not m:
            continue
        gcs.append(dict(local=local(m[1], m[2]), kind=((m[3] or '') + ' ' + (m[4] or '')).strip(), freedMB=round(mb(m[6], m[7]), 2),
                        losObjects=int(m[8]), losMB=round(mb(m[9], m[10]), 2), heapMB=int(m[12]), heapTotalMB=int(m[13]),
                        pauseMs=round(ms(m[14], m[15]), 3), totalMs=round(ms(m[16], m[17]), 1)))
    # The device clock is placed on the probe clock by the race starts: the probe records each round's startedSecond just
    # before it sends 'start', and the app logs 'transition startRace' when it handles it (the median offset of the rounds).
    starts = [local(m[1], m[2]) for m in re.finditer(r'^(\d\d-\d\d) (\S+)\s+\d+\s+\d+ I DeathRide: transition startRace ', text, re.M)]
    pairs = sorted((t - datetime.timedelta(seconds=r['startedSecond'])) for t, r in zip(starts, raw['rounds']))
    assert pairs, 'no startRace line to place the device clock'
    zero = pairs[len(pairs) // 2]
    spread = round((pairs[-1] - pairs[0]).total_seconds(), 3)
    for g in gcs:
        g['second'] = round((g.pop('local') - zero).total_seconds(), 2)
        g['doing'] = phase_at(raw, g['second']) if g['second'] >= 0 else 'before probe (startup, /routes warm-up)'
    inside = [g for g in gcs if 0 <= g['second'] <= raw['actualDurationSeconds']]
    prof = [p for p in raw.get('profiles', []) if p.get('runtime')]
    rate = None
    if len(prof) >= 2:
        a, b = prof[0], prof[-1]
        dt = b['second'] - a['second']
        da = int(b['runtime']['art.gc.bytes-allocated']) - int(a['runtime']['art.gc.bytes-allocated'])
        dc = int(b['runtime']['art.gc.gc-count']) - int(a['runtime']['art.gc.gc-count'])
        rate = dict(fromSecond=round(a['second'], 1), toSecond=round(b['second'], 1), allocatedMB=round(da / 1e6, 1),
                    allocatedMBps=round(da / 1e6 / dt, 2), gcCount=dc, gcPerMinute=round(dc / dt * 60, 1),
                    unit='MB = 10^6 B, from art.gc.bytes-allocated and art.gc.gc-count')
    los = [g['losMB'] for g in inside]
    gaps = [b['second'] - a['second'] for a, b in zip(inside, inside[1:])]
    return dict(run=str(path), probeSeconds=raw['actualDurationSeconds'], clockSpreadSeconds=spread, loggedGcs=len(inside),
                loggedBackgroundGcs=sum(1 for g in inside if g['kind'].startswith('Background')),
                losMBPerGc=[min(los), max(los)] if los else None, losMBTotal=round(sum(los), 1),
                losMBps=round(sum(los) / raw['actualDurationSeconds'], 2),
                gapSeconds=[round(min(gaps), 2), round(sorted(gaps)[len(gaps) // 2], 2), round(max(gaps), 2)] if gaps else None,
                totalMs=[min(g['totalMs'] for g in inside), max(g['totalMs'] for g in inside)] if inside else None,
                runtime=rate, gcs=gcs)


print(json.dumps([run(p) for p in sys.argv[1:]], indent=1))
