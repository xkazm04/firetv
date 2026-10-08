"""P17 shared readers: profile rows, SurfaceFlinger present times and their join, the probe's /stats windows on the device clock.
Used by perf-p17.py (per-run readings) and perf-p17-trace.py (the diagnostic trace). Definitions only; no thresholds of I2 change."""
import bisect, gzip, json, math, re, statistics
from pathlib import Path

INT64_MAX = 9223372036854775807


def q(values, p):
    """The quantile of perf-summary.py and link's Distribution (exact, ceil rank): the I2 definition."""
    v = sorted(values)
    return v[max(0, math.ceil(len(v) * p) - 1)] if v else None


def load_raw(run: Path):
    return json.loads(gzip.decompress((run / 'raw.json.gz').read_bytes()))


def profile_rows(raw):
    """Every profile row by its frame index (PerfTrace sequence), with the column index map."""
    profiles = raw.get('profiles') or []
    cols = profiles[0]['frames']['columns']
    I = {c: i for i, c in enumerate(cols)}
    rows = {}
    for prof in profiles:
        f = prof['frames']
        for k, row in enumerate(f['rows']):
            rows[f['first'] + k] = row
    return I, rows


def parse_present(path: Path):
    """SurfaceFlinger --latency dumps -> {queueNs: (presentNs, readyNs)}, refresh periods seen, and the dump record.
    A dump's rows are the layer's last 127 frames; pending (INT64_MAX) and empty rows are skipped. A gap is a dump whose
    oldest frame is newer than the previous dump's newest frame: frames between them were never seen."""
    text = path.read_text(errors='replace').splitlines()
    entries, periods, dumps, cur, end = {}, set(), [], None, None
    for ln in text:
        if ln.startswith('== '):
            cur = {'uptime': float(ln.split()[1]), 'rows': []}
            dumps.append(cur)
        elif ln.startswith('end '):
            end = [float(x) for x in ln.split()[1:]]
        elif cur is not None:
            parts = ln.split()
            if len(parts) == 1 and parts[0].isdigit():
                periods.add(int(parts[0]))
            elif len(parts) == 3 and all(x.isdigit() for x in parts):
                d, act, rdy = map(int, parts)
                if d == 0 or act in (0, INT64_MAX) or d == INT64_MAX:
                    continue
                cur['rows'].append(d)
                entries[d] = (act, rdy)
    gaps, prev_newest = 0, None
    for dmp in dumps:
        if dmp['rows']:
            if prev_newest is not None and min(dmp['rows']) > prev_newest:
                gaps += 1
            prev_newest = max(dmp['rows'])
    return {'entries': entries, 'periods': sorted(periods), 'dumps': len(dumps), 'gaps': gaps, 'end': end}


def join_present(I, rows, present):
    """Each SF frame belongs to the profile row whose render began last before the buffer was queued (one eglSwapBuffers
    per render). Returns {rowIndex: (queueNs, presentNs, readyNs)} and the count of SF frames that fell before the work of
    their row ended (a mapping check; expected 0)."""
    idx = sorted(rows)
    starts = [rows[k][I['startNs']] for k in idx]
    out, early = {}, 0
    for qn, (act, rdy) in present['entries'].items():
        j = bisect.bisect_right(starts, qn) - 1
        if j < 0:
            continue
        k = idx[j]
        row = rows[k]
        if qn < row[I['startNs']] + row[I['workMs']] * 1e6 - 1e5:
            early += 1
        if k in out:  # two buffers in one row's interval cannot happen with one swap per render; keep the first, count it
            early += 1
            continue
        out[k] = (qn, act, rdy)
    return out, early


def stats_origin(raw, rows, I):
    """link's RaceServer.nowMs() = (nanoTime - origin) / 1e6. A /stats read takes `now` first and builds after it: its window
    holds every frame added before the build read frameNumber (rows below frameNumber) whose add time is at or after
    now - 10 s. The origin is fitted: the value, on a 0.25 ms grid within 150 ms of the frameNumber bounds, at which most active
    windows rebuilt this way hold exactly their own count. Returns origin (ns) and the share of windows that match."""
    idx = sorted(rows)
    starts = [rows[k][I['startNs']] for k in idx]
    pos = {k: i for i, k in enumerate(idx)}
    wins = [w['stats'] for w in raw['windows'] if w['stats'].get('uptimeMs') is not None and w['stats'].get('frameNumber') in pos
            and w['stats']['phase'] == 'race' and w['stats']['raceSeconds'] >= 10]
    if not wins:
        return None, None
    guess = statistics.median(rows[w['frameNumber'] - 1][I['startNs']] - w['uptimeMs'] * 1e6 for w in wins if w['frameNumber'] - 1 in rows)
    def matches(org):
        n = 0
        for w in wins:
            hi = pos[w['frameNumber']]
            lo = bisect.bisect_left(starts, org + (w['uptimeMs'] - 10000) * 1e6, 0, hi)
            n += (hi - lo) == w['frameTimeMs']['last10s']['count']
        return n
    best = max((matches(guess + s * 2.5e5), -abs(s), guess + s * 2.5e5) for s in range(-600, 601))
    return best[2], best[0] / len(wins)
