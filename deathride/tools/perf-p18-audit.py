"""P18 step 1: who allocates in a race, per call site, from perf-p18-alloc.py's samples of ART's allocation tracker.

Inputs per run directory (perf-device.py output after perf-summary.py and perf-p11.py, plus the sampler's file):
alloc-samples.jsonl.gz, raw.json.gz, summary.json, p11-readings.json. Output: alloc-audit.json in the run directory and,
with --out, the same JSON elsewhere.

A record's site is its first frame in the app's own code (dev.deathride.*), read from the allocation point down the stack;
the frames above it (in java.*, kotlin.*, libGDX, ktor) say what it allocated through. Its path, from the whole stack, says
what made it happen: the probe's own HTTP reads (request parse, /stats, /profile), the phones' websocket traffic, the game
loop on the render thread, or another thread. A record with no app frame is
assigned by its thread and its frames: the render thread (GLThread) to the platform (libGDX), ktor or coroutine frames to
link's engine, the rest to the platform. Module of an app site, by package: dev.deathride.core -> core, game.audio -> audio,
game.GlyphLayer / HandCutFont -> HUD/font, the rest of game -> game, link -> link, dev.deathride.tv -> platform.
The tracker's own records (thread 'ADB-JDWP Connec', the DDM dispatch) are left out.

Rates: bytes and objects per second of tracked time (the sum of each sample's on-time). A sample is complete when it holds
fewer than 65,535 records (ART keeps no more); a full sample is counted over its on-time all the same and flagged. The
share is a site's bytes over all sampled race bytes; 'shareOf2_59' is its rate over P17's 2.59 MB/s (a whole-probe rate,
lobby included, so the race shares of it sum to less than 1). The cost: profile rows that begin
inside a tracked window against the rows of the same race phase outside any window.
"""
import argparse, bisect, collections, gzip, json, re, statistics, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from perf_p17_lib import q, load_raw, profile_rows, stats_origin

P17_RATE = 2.59  # MB/s, P17's muted runs (2.589 / 2.587)
TRACKER_THREAD = 'ADB-JDWP Connec'
LARGE = 12 * 1024  # ART's large-object threshold: such an array gets its own pages (a large object space allocation)


def jname(sig):
    """'Ldev/deathride/game/AtlasArt;' -> 'dev.deathride.game.AtlasArt'; '[C' -> 'char[]'."""
    prims = {'Z': 'boolean', 'B': 'byte', 'C': 'char', 'S': 'short', 'I': 'int', 'J': 'long', 'F': 'float', 'D': 'double'}
    dims = len(sig) - len(sig.lstrip('['))
    base = sig[dims:]
    base = prims.get(base, base[1:-1].replace('/', '.') if base.startswith('L') else base)
    return base + '[]' * dims


def module_of(cls):
    if cls.startswith('dev.deathride.core.'):
        return 'core'
    if cls.startswith('dev.deathride.game.audio.'):
        return 'audio'
    if re.match(r'dev\.deathride\.game\.(GlyphLayer|HandCutFont)\b', cls):
        return 'HUD/font'
    if cls.startswith('dev.deathride.game.'):
        return 'game'
    if cls.startswith('dev.deathride.link.'):
        return 'link'
    if cls.startswith('dev.deathride.tv.'):
        return 'platform'
    return None


# What made the allocation happen, from the whole stack. The probe's own reads (an HTTP request's parse, /stats, /profile)
# are the observer: players' phones make no HTTP request in a race. 'websocket' is the phones' traffic (HUD sends, inputs).
PATHS = [('probe: HTTP request parse', re.compile(r'io\.ktor\.server\.cio\.backend\.|HttpParserKt\.parse')),
         ('probe: /profile', re.compile(r'RaceServer\$start\$1\$1\$candidate\$1\$2\$6\.|dev\.deathride\.link\.PerfTrace\.json|AndroidProfile\.runtimeJson')),
         ('probe: /stats', re.compile(r'RaceServer\$start\$1\$1\$candidate\$1\$2\$5\.|RaceServer\.stats(Json|Reply)|dev\.deathride\.link\.StatsReply')),
         ('phones: websocket', re.compile(r'DefaultWebSocketSession|io\.ktor\.websocket\.|RaceServer\.handle|RaceServer\$handle'))]


def path_of(frames, thread, C, M):
    flat = ' '.join('%s.%s' % (jname(C[c]), M[m]) for c, m, line in frames)
    for name, rx in PATHS:
        if rx.search(flat):
            return name
    if thread.startswith('GLThread'):
        return 'game loop (render thread)'
    return 'other thread: ' + thread_group(thread)


def classify(frames, thread, C, M):
    """-> (site, module, chain, via): site 'Class.method:line' of the first app frame, or a thread/engine bucket."""
    names = [(jname(C[c]), M[m], line) for c, m, line in frames]
    app = [i for i, (c, m, l) in enumerate(names) if c.startswith('dev.deathride.')]
    via = '%s.%s' % (names[0][0], names[0][1]) if names else '(no frame)'
    if app:
        c, m, l = names[app[0]]
        chain = ['%s.%s:%d' % names[i] for i in app[:3]]
        return '%s.%s:%d' % (c, m, l), module_of(c), chain, via
    flat = ' '.join(c for c, m, l in names)
    if thread.startswith('GLThread'):
        return 'GLThread (no app frame): ' + via, 'platform', [], via
    if 'io.ktor.' in flat:
        return 'ktor engine (no app frame): ' + via, 'link (ktor engine)', [], via
    if 'kotlinx.coroutines.' in flat:
        return 'coroutines (no app frame): ' + via, 'link (coroutines)', [], via
    return 'platform: ' + via, 'platform', [], via


def thread_group(name):
    if name.startswith('tid '):
        return 'a thread that exited before the sample was read'
    if name.startswith('GLThread'):
        return 'render (GLThread)'
    return re.sub(r'[-#\s]*\d+$', '', name) or name


def meminfo(text):
    """App Summary and the per-category Pss Total of one dumpsys meminfo sample (KB -> MiB); perf-p17.py's reader."""
    out = {}
    for name in ('Java Heap', 'Native Heap', 'Code', 'Stack', 'Graphics', 'Private Other', 'System'):
        m = re.search(r'^\s*' + name + r':\s+(\d+)', text, re.M)
        if m:
            out[name] = round(int(m[1]) / 1024, 2)
    for name in ('Dalvik Heap', 'Dalvik Other', 'GL mtrack', 'Native Heap', 'Ashmem', 'Unknown'):
        m = re.search(r'^\s*' + name + r'\s+(\d+)', text, re.M)
        if m:
            out['pss ' + name] = round(int(m[1]) / 1024, 2)
    m = re.search(r'TOTAL PSS:\s+(\d+)', text)
    if m:
        out['TOTAL PSS'] = round(int(m[1]) / 1024, 2)
    return out


def pss_peak(raw, s):
    """The run's PSS samples, and the breakdown of its peak and lowest samples (as P17 read them)."""
    mem = [m for m in raw['memory'] if m.get('pssKb')]
    peak = max(mem, key=lambda m: m['pssKb'])
    low = min(mem, key=lambda m: m['pssKb'])
    out = {'rangeMiB': s.get('pssRangeMiB'), 'samples': [[round(m['second'], 1), round(m['pssKb'] / 1024, 1)] for m in mem],
           'peak': {'second': round(peak['second'], 1), 'breakdownMiB': meminfo(peak['text'])},
           'lowest': {'second': round(low['second'], 1), 'breakdownMiB': meminfo(low['text'])}}
    out['peakMinusLowestMiB'] = {k: round(out['peak']['breakdownMiB'][k] - out['lowest']['breakdownMiB'].get(k, 0), 2)
                                 for k in out['peak']['breakdownMiB']}
    return out


def read_samples(path):
    meta, samples, end = None, [], None
    with gzip.open(path, 'rt') as f:
        for ln in f:
            x = json.loads(ln)
            if 'meta' in x:
                meta = x['meta']
            elif 'end' in x or 'stop' in x:
                end = x
            else:
                samples.append(x)
    return meta, samples, end


def audit(run):
    meta, samples, end = read_samples(run / 'alloc-samples.jsonl.gz')
    raw = load_raw(run)
    d = json.loads((run / 'p11-readings.json').read_text())
    s = json.loads((run / 'summary.json').read_text())
    I, rows = profile_rows(raw)
    idx = sorted(rows)
    starts = [rows[k][I['startNs']] for k in idx]

    # Host epoch -> probe second (the memory sampler's requests carry both), probe second -> device uptime (each /stats window:
    # its uptimeMs against the second the probe read it), uptime -> profile clock (stats_origin).
    zero = statistics.median(m['sampler']['requestedEpochMs'] / 1000 - m['second'] for m in raw['memory'] if m.get('sampler', {}).get('requestedEpochMs'))
    up = statistics.median(w['stats']['uptimeMs'] / 1000 - w['second'] for w in raw['windows'] if w['stats'].get('uptimeMs') is not None)
    origin, fit = stats_origin(raw, rows, I)
    def probe_second(epoch):
        return epoch - zero
    def profile_ns(epoch):
        return origin + (probe_second(epoch) + up) * 1e9 if origin is not None else None
    # Phase of a sample: 'race' inside a round with a /stats race window within 1.6 s (the probe reads one about every
    # second), 'round edge' inside a round otherwise (countdown, results), 'lobby' between rounds, 'outside' before or after.
    wsec = sorted(w['second'] for w in raw['windows'] if w['stats']['phase'] == 'race')
    rounds = [(r['startedSecond'], r['endedSecond']) for r in raw['rounds']]
    duration = raw.get('actualDurationSeconds') or (max(wsec) if wsec else 0)
    def phase_at(sec):
        if sec < 0 or sec > duration:
            return 'outside'
        if not any(a <= sec <= b for a, b in rounds):
            return 'lobby'
        j = bisect.bisect_left(wsec, sec)
        near = min((abs(wsec[i] - sec) for i in (j - 1, j) if 0 <= i < len(wsec)), default=99)
        return 'race' if near <= 1.6 else 'round edge'

    sites = collections.defaultdict(lambda: {'bytes': 0, 'objects': 0, 'classes': collections.Counter(), 'via': collections.Counter(),
                                             'threads': collections.Counter(), 'module': None, 'chain': None, 'path': None})
    paths = collections.defaultdict(lambda: collections.Counter())
    per_phase = collections.defaultdict(lambda: {'seconds': 0.0, 'bytes': 0, 'objects': 0, 'samples': 0})
    modules = collections.defaultdict(lambda: collections.Counter())
    threads = collections.defaultdict(lambda: collections.Counter())
    used, skipped, full, tracker_bytes = [], [], 0, 0
    for smp in samples:
        sec = probe_second(smp['onUtc'][0])
        ph = phase_at(sec)
        smp['_second'], smp['_phase'] = sec, ph
        per_phase[ph]['seconds'] += smp['onSeconds']; per_phase[ph]['samples'] += 1
        if ph != 'race':
            skipped.append(smp)
            continue
        used.append(smp)
        full += smp['full']
        C, M, T = smp['classes'], smp['methods'], {int(k): v for k, v in smp['threads'].items()}
        for size, tid, cls, frames in smp['entries']:
            tname = T.get(tid, 'tid %d (exited)' % tid)
            if tname.startswith(TRACKER_THREAD):
                tracker_bytes += size
                continue
            site, mod, chain, via = classify(frames, tname, C, M)
            path = path_of(frames, tname, C, M)
            e = sites[(path, site)]
            e['path'] = path
            paths[path]['bytes'] += size; paths[path]['objects'] += 1
            if size >= LARGE:
                paths[path]['largeBytes'] += size
            e['bytes'] += size; e['objects'] += 1
            e['classes'][jname(C[cls])] += size; e['via'][via] += 1; e['threads'][thread_group(tname)] += 1
            e['module'] = mod; e['chain'] = chain
            modules[mod]['bytes'] += size; modules[mod]['objects'] += 1
            threads[thread_group(tname)]['bytes'] += size; threads[thread_group(tname)]['objects'] += 1
            per_phase[ph]['bytes'] += size; per_phase[ph]['objects'] += 1
    secs = sum(x['onSeconds'] for x in used)
    total = sum(e['bytes'] for e in sites.values())
    objs = sum(e['objects'] for e in sites.values())
    def rate(b):
        return round(b / secs / 1e6, 4) if secs else None
    table = []
    for (path, site), e in sorted(sites.items(), key=lambda kv: -kv[1]['bytes']):
        table.append({'site': site, 'path': path, 'module': e['module'], 'MBps': rate(e['bytes']), 'objectsPerSecond': round(e['objects'] / secs, 1),
                      'share': round(e['bytes'] / total, 4), 'shareOf2_59': round(e['bytes'] / secs / 1e6 / P17_RATE, 4),
                      'meanObjectBytes': round(e['bytes'] / e['objects'], 1), 'chain': e['chain'],
                      'topClasses': [[c, round(b / total, 4)] for c, b in e['classes'].most_common(4)],
                      'allocatedVia': [v for v, _ in e['via'].most_common(2)], 'threads': dict(e['threads'].most_common(3))})

    # The tracker's cost: rows beginning inside a window (enable sent .. REAL served, then the read until switched off) against
    # race rows outside every window.
    cost = None
    if origin is not None:
        inside = set()
        reads = []
        for smp in used:
            a0 = profile_ns(smp['onUtc'][0])
            a1 = profile_ns(smp['utc'] + smp['enableSeconds'] + smp['windowSeconds'] + smp['readSeconds'] + smp['disableSeconds'])
            lo, hi = bisect.bisect_left(starts, a0), bisect.bisect_right(starts, a1)
            inside.update(idx[lo:hi])
            r0 = profile_ns(smp['utc'] + smp['enableSeconds'] + smp['windowSeconds'])
            lo2, hi2 = bisect.bisect_left(starts, r0), bisect.bisect_right(starts, a1)
            reads.append(max((rows[k][I['intervalMs']] for k in idx[lo2:hi2 + 1] if k in rows), default=None))
        act = [k for k in idx if rows[k][I['active']] == 1]
        ins = [rows[k][I['intervalMs']] for k in act if k in inside]
        out = [rows[k][I['intervalMs']] for k in act if k not in inside]
        work_in = [rows[k][I['workMs']] for k in act if k in inside]
        work_out = [rows[k][I['workMs']] for k in act if k not in inside]
        cost = {'activeRowsInside': len(ins), 'activeRowsOutside': len(out),
                'intervalP50Ms': [q(ins, .5), q(out, .5)], 'intervalP95Ms': [q(ins, .95), q(out, .95)],
                'workP50Ms': [round(q(work_in, .5), 3) if work_in else None, round(q(work_out, .5), 3) if work_out else None],
                'over33': [sum(1 for v in ins if v > 33), sum(1 for v in out if v > 33)],
                'worstIntervalAroundEachReadMs': {'p50': q([r for r in reads if r], .5), 'max': max((r for r in reads if r), default=None)},
                'readSecondsP50Max': [round(statistics.median(x['readSeconds'] for x in used), 3), round(max(x['readSeconds'] for x in used), 3)] if used else None,
                'order': '[inside a tracked window, outside every window], active rows only',
                'clockFit': {'statsOriginShare': fit, 'limit': 'host epoch -> probe second -> device uptime -> profile clock; tens of ms'}}
    alloc = d.get('runtimeAllocation') or {}
    out = {'run': run.name, 'apkSha256': json.loads((run / 'installed.json').read_text())['apkSha256'],
           'sampler': {'every': meta['every'], 'window': meta['window'], 'samples': len(samples), 'raceSamples': len(used),
                       'fullSamples': full, 'trackedRaceSeconds': round(secs, 3), 'records': objs, 'trackerOwnBytes': tracker_bytes,
                       'samplesByPhase': {k: v['samples'] for k, v in per_phase.items()}},
           'raceRate': {'MBps': rate(total), 'objectsPerSecond': round(objs / secs, 1) if secs else None,
                        'meanObjectBytes': round(total / objs, 1) if objs else None},
           'runtime': {'allocMBps': round(alloc['bytesAllocatedPerSecond'] / 1e6, 3) if alloc.get('bytesAllocatedPerSecond') else None,
                       'gcCount': alloc.get('gcCount'), 'gcTimeMs': alloc.get('gcTimeMs'), 'seconds': alloc.get('seconds'),
                       'payloadMBps': round(sum(x['payloadBytes'] for x in samples) / alloc['seconds'] / 1e6, 4) if alloc.get('seconds') else None,
                       'limit': 'ART counters over the probe (lobby and race, tracked and not); the REAL payloads are Java arrays too'},
           'byModule': {m: {'MBps': rate(c['bytes']), 'objectsPerSecond': round(c['objects'] / secs, 1), 'share': round(c['bytes'] / total, 4),
                            'shareOf2_59': round(c['bytes'] / secs / 1e6 / P17_RATE, 4)} for m, c in sorted(modules.items(), key=lambda kv: -kv[1]['bytes'])},
           'byThread': {t: {'MBps': rate(c['bytes']), 'share': round(c['bytes'] / total, 4)} for t, c in sorted(threads.items(), key=lambda kv: -kv[1]['bytes'])[:12]},
           'byPath': {k: {'MBps': rate(c['bytes']), 'objectsPerSecond': round(c['objects'] / secs, 1), 'share': round(c['bytes'] / total, 4),
                          'shareOf2_59': round(c['bytes'] / secs / 1e6 / P17_RATE, 4), 'largeObjectShareOfPath': round(c['largeBytes'] / c['bytes'], 3)}
                     for k, c in sorted(paths.items(), key=lambda kv: -kv[1]['bytes'])},
           'largeObjectShare': round(sum(c['largeBytes'] for c in paths.values()) / total, 4) if total else None,
           'observerShare': round(sum(c['bytes'] for k, c in paths.items() if k.startswith('probe:')) / total, 4) if total else None,
           'sites': table[:60], 'siteCount': len(table), 'cost': cost,
           'pss': pss_peak(raw, s), 'frames': {'activeWorstP95Ms': s['activeWindows']['worstP95Ms'], 'activeMaxMs': s['activeWindows']['maxMs']}}
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('run', type=Path)
    ap.add_argument('--out', type=Path)
    a = ap.parse_args()
    out = audit(a.run)
    text = json.dumps(out, indent=1) + '\n'
    (a.run / 'alloc-audit.json').write_text(text)
    if a.out:
        a.out.parent.mkdir(parents=True, exist_ok=True)
        a.out.write_text(text)
    print(json.dumps({k: out[k] for k in ('sampler', 'raceRate', 'runtime', 'byModule', 'byPath', 'largeObjectShare', 'observerShare', 'cost')}, indent=1))
    for r in out['sites'][:25]:
        print(f"{r['share']:.3f} {r['MBps']:.4f} MB/s {r['objectsPerSecond']:8.1f}/s {r['module']:<18} {r['path']:<26} {r['site']}  {r['topClasses'][:2]}")


if __name__ == '__main__':
    main()
