"""P17: the muted tail's frames in a scheduler trace, one account per frame, joined to the profile rows and present times.

capture: waits until the perf app is racing (GET /health), lets it run --after seconds, then records one atrace (sched,
  gfx, dalvik and the app's DR.* sections, which exist only with --profile) for --seconds into a --buffer-kb per-CPU
  buffer. It then reads the kept span: per CPU, the first and last event. The capture is whole when every CPU's first event
  is within 1 s of the trace's start and the span covers --seconds less 1 s; capture.json says which. Intrusive: run it
  beside a diagnostic run, never inside a measured one.
analyze <trace.txt.gz...> <run dir> <out>: perf-p11-trace.py's split of every frame interval (DR.requests begin to the
  next on the GL thread) into running, preempted (by whom), wakeup latency and sleep (in which section, woken by whom),
  per frame, for every frame over 20 ms and every class (b) frame (a present interval of 1.5 refresh periods or more,
  from the run's present-latency.txt joined to its profile rows). Beside each: the concurrent GCs it overlaps (the dalvik
  GC sections of HeapTaskDaemon, by name), the app's link threads' CPU inside it, sleep in buffer dequeue/queue, and a
  NetworkStats poll. Its cause by the trace (the largest excess over the trace's own medians of running, waiting =
  preempted + wakeup latency, and sleep) is set beside the profile's cause (perf-p17.py) for the same row."""
import argparse, bisect, collections, datetime, gzip, json, re, statistics, subprocess, sys, time, urllib.request, zlib
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from perf_p17_lib import load_raw, profile_rows, parse_present, join_present

p = argparse.ArgumentParser()
sub = p.add_subparsers(dest='cmd', required=True)
c = sub.add_parser('capture')
c.add_argument('output', type=Path)
c.add_argument('--device', default='10.0.0.139:5555')
c.add_argument('--after', type=float, default=12.0)
c.add_argument('--seconds', type=int, default=25)
c.add_argument('--buffer-kb', type=int, default=16384)
z = sub.add_parser('analyze')
z.add_argument('traces', type=Path, nargs='+', help='trace.txt.gz files, then the run directory, then the output JSON')
a = p.parse_args()
LINE = re.compile(r'^\s*(.*)-(\d+)\s+\(\s*(\d+|-+)\)\s+\[(\d+)\].*?\s(\d+\.\d+):\s+(\w+):\s+(.*)$')

if a.cmd == 'capture':
    a.output.mkdir(parents=True, exist_ok=True)
    base = 'http://' + a.device.split(':')[0] + ':8772'
    deadline = time.time() + 600
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(base + '/health', timeout=3) as r:
                if json.load(r)['phase'] == 'race':
                    break
        except OSError:
            pass
        time.sleep(.5)
    else:
        sys.exit('no race within 600 s')
    time.sleep(a.after)
    prefix = ['adb', '-P', '5041', '-s', a.device]
    path = '/data/local/tmp/deathride-p17.atrace'
    started = datetime.datetime.now(datetime.timezone.utc).isoformat()
    r = subprocess.run(prefix + ['shell', 'atrace', '-z', '-b', str(a.buffer_kb), '-t', str(a.seconds), '-a', 'dev.deathride.perf',
                       'sched', 'gfx', 'dalvik', '-o', path], stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                       creationflags=subprocess.CREATE_NO_WINDOW, timeout=a.seconds + 180)
    (a.output / 'atrace.txt').write_bytes(r.stdout)
    data = subprocess.check_output(prefix + ['exec-out', 'cat', path], creationflags=subprocess.CREATE_NO_WINDOW, timeout=300)
    subprocess.run(prefix + ['shell', 'rm', path], creationflags=subprocess.CREATE_NO_WINDOW)
    body = data[data.find(b'TRACE:\n') + 7:] if b'TRACE:\n' in data else data
    try:
        body = zlib.decompress(body)
    except zlib.error:
        pass
    first, last = {}, {}
    for ln in body.decode(errors='replace').splitlines():
        m = LINE.match(ln)
        if m:
            cpu, t = int(m[4]), float(m[5])
            first.setdefault(cpu, t)
            last[cpu] = t
    t0 = min(first.values()) if first else None
    whole = bool(first) and max(first.values()) - t0 < 1.0 and max(last.values()) - t0 >= a.seconds - 1
    (a.output / 'trace.txt.gz').write_bytes(gzip.compress(body, mtime=0))
    info = {'startedUtc': started, 'endedUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'afterRaceStartSeconds': a.after,
            'seconds': a.seconds, 'bufferKbPerCpu': a.buffer_kb, 'returncode': r.returncode, 'bytes': len(body),
            'firstEventByCpu': {k: round(v - t0, 3) for k, v in sorted(first.items())},
            'lastEventByCpu': {k: round(v - t0, 3) for k, v in sorted(last.items())}, 'whole': whole}
    (a.output / 'capture.json').write_text(json.dumps(info, indent=2))
    print(json.dumps({k: info[k] for k in ('returncode', 'bytes', 'whole', 'firstEventByCpu', 'lastEventByCpu')}))
    sys.exit(0)

*traces, run, out = a.traces
raw = load_raw(run)
I, rows = profile_rows(raw)
idx = sorted(rows)
starts = [rows[k][I['startNs']] for k in idx]
present = parse_present(run / 'present-latency.txt') if (run / 'present-latency.txt').exists() else None
joined = join_present(I, rows, present)[0] if present else {}
period = statistics.median(present['periods']) / 1e6 if present and present['periods'] else None
p17 = json.loads((run / 'p17-readings.json').read_text()) if (run / 'p17-readings.json').exists() else {}
profile_cause = {f['row']: f for f in p17.get('slowFrames', [])}
SWITCH = re.compile(r'prev_comm=(.*?) prev_pid=(\d+) prev_prio=(\d+) prev_state=(\S+) ==> next_comm=(.*?) next_pid=(\d+) next_prio=(\d+)')

def analyze(trace):
    text = gzip.decompress(trace.read_bytes()).decode(errors='replace')
    names, tgids, prios = {}, {}, {}
    running_on, cpu_slices, marks, events, wakeups = {}, [], collections.defaultdict(list), [], []
    gl_tid = None
    for rawl in text.splitlines():
        m = LINE.match(rawl)
        if not m:
            continue
        comm, tid, tgid, cpu, t, event, body = m.groups()
        tid, cpu, t = int(tid), int(cpu), float(t)
        names[tid] = comm
        if tgid.isdigit():
            tgids[tid] = int(tgid)
        if event == 'sched_switch':
            sm = SWITCH.match(body)
            if not sm:
                continue
            pn, prev, pprio, state, nn, nxt, nprio = sm.groups()
            prev, nxt = int(prev), int(nxt)
            names[prev], names[nxt], prios[prev], prios[nxt] = pn, nn, int(pprio), int(nprio)
            if cpu in running_on:
                rt, since = running_on[cpu]
                cpu_slices.append((since, t, cpu, rt))
            running_on[cpu] = (nxt, t)
            events.append((t, 'out', (prev, state, nxt), cpu))
            events.append((t, 'in', nxt, cpu))
        elif event == 'sched_wakeup':
            wm = re.search(r'comm=(.*?) pid=(\d+)', body)
            if wm:
                wakeups.append((t, int(wm[2]), comm))
        elif event == 'tracing_mark_write':
            parts = body.split('|')
            if parts[0] == 'B' and len(parts) >= 3:
                label = parts[2].strip()
                marks[tid].append((t, 'B', label))
                if label.startswith('DR.requests') and gl_tid is None:
                    gl_tid = tid
            elif parts[0].startswith('E'):
                marks[tid].append((t, 'E', None))
    if gl_tid is None:
        sys.exit('no DR.requests section in ' + str(trace))
    app = tgids.get(gl_tid)
    short = lambda tid: re.sub(r'[-\d]+$', '', names.get(tid, str(tid))).strip() or names.get(tid, str(tid))
    def tagged(tid):
        prio = prios.get(tid, 120)
        return short(tid) + (' (RT)' if prio < 100 else f' (nice {prio - 120})' if prio != 120 else '')
    def spans(tid):
        stack, outp = [], []
        for t, kind, label in marks[tid]:
            if kind == 'B':
                stack.append((label, t))
            elif stack:
                label, t0 = stack.pop()
                outp.append((t0, t, label, len(stack)))
        return outp
    sections, stack = [], []
    for t, kind, label in marks[gl_tid]:
        if kind == 'B':
            stack.append(label)
        elif stack:
            stack.pop()
        sections.append((t, stack[-1] if stack else '(none)'))
    sec_t = [x[0] for x in sections]
    section_at = lambda t: sections[bisect.bisect_right(sec_t, t) - 1][1] if bisect.bisect_right(sec_t, t) else '(none)'
    gcs = sorted((t0, t1, label) for tid in list(marks) if names.get(tid, '').startswith('HeapTaskDaemon')
                 for t0, t1, label, depth in spans(tid) if depth == 0 and 'GC' in label)
    wk = sorted((t, name) for t, w, name in wakeups if w == gl_tid)
    wk_t = [x[0] for x in wk]
    timeline, state, since = [], None, None
    for t, kind, detail, cpu in events:
        if kind == 'in' and detail == gl_tid:
            if state is not None:
                timeline.append((since, t, state))
            state, since = ('running',), t
        elif kind == 'out' and detail[0] == gl_tid:
            if state is not None:
                timeline.append((since, t, state))
            prev, st, nxt = detail
            state = ('preempted', section_at(t), nxt) if st.startswith('R') else ('sleep', section_at(t), st)
            since = t
    final = []
    for s0, s1, st in timeline:
        if st[0] == 'sleep':
            k = bisect.bisect_left(wk_t, s0)
            if k < len(wk) and wk[k][0] <= s1:
                w, waker = wk[k]
                final.append((s0, w, ('sleep', st[1], re.sub(r'[-\d]+$', '', waker).strip() or waker)))
                final.append((w, s1, ('wakeupLatency', st[1])))
            else:
                final.append((s0, s1, ('sleep', st[1], '?')))
        else:
            final.append((s0, s1, st))
    final.sort(key=lambda x: x[0])
    fin_t = [x[0] for x in final]
    clip = lambda x0, x1, t0, t1: max(0.0, min(x1, t1) - max(x0, t0))
    link = [(s0, s1) for s0, s1, cpu, tid in cpu_slices if tgids.get(tid) == app and tid != gl_tid
            and re.match(r'(DefaultDispatch|deathride-link|ktor|eventLoop|raw-|nioEventLoop|OkHttp)', names.get(tid, ''))]
    link.sort()
    link_t = [x[0] for x in link]
    ns = sorted((s0, s1) for s0, s1, cpu, tid in cpu_slices if names.get(tid, '').startswith('NetworkStats'))
    bursts = []
    for s0, s1 in ns:
        if bursts and s0 - bursts[-1][1] < .05:
            bursts[-1][1] = max(bursts[-1][1], s1)
        else:
            bursts.append([s0, s1])
    bursts = [b for b in bursts if b[1] - b[0] > .2]
    per_cpu = collections.defaultdict(list)
    for x in sorted(cpu_slices):
        per_cpu[x[2]].append(x)
    per_cpu_t = {k: [x[0] for x in v] for k, v in per_cpu.items()}
    def occupancy(t0, t1):
        occ = collections.Counter()
        for core, sl in per_cpu.items():
            k = max(0, bisect.bisect_right(per_cpu_t[core], t0) - 1)
            while k < len(sl) and sl[k][0] < t1:
                s0, s1, cpu, tid = sl[k]
                d = clip(s0, s1, t0, t1)
                if d > 0 and tid and tid != gl_tid:
                    occ[tagged(tid)] += d * 1000
                k += 1
        return occ
    def split(t0, t1):
        r, sleep_by, pre_by, occ = collections.Counter(), collections.Counter(), collections.Counter(), collections.Counter()
        k = max(0, bisect.bisect_right(fin_t, t0) - 1)
        while k < len(final) and final[k][0] < t1:
            s0, s1, st = final[k]
            d = clip(s0, s1, t0, t1) * 1000
            if d > 0:
                r[st[0]] += d
                if st[0] == 'sleep':
                    sleep_by[f'{st[1]} <- {st[2]}'] += d
                elif st[0] == 'preempted':
                    pre_by[tagged(st[2])] += d
                if st[0] in ('preempted', 'wakeupLatency'):
                    occ.update(occupancy(max(s0, t0), min(s1, t1)))
            k += 1
        return r, sleep_by, pre_by, occ
    begins = [t for t, kind, label in marks[gl_tid] if kind == 'B' and label.startswith('DR.requests')]
    # Trace clock (boot) -> profile clock (monotonic): one constant, the one that puts most DR.requests begins on a row start.
    sns = [s / 1e9 for s in starts]
    best = None
    for t in begins[:40]:
        for j in range(len(sns)):
            off = t - sns[j]
            if best is not None and abs(off - best[0]) < 1e-4:
                continue
            hits = 0
            for u in begins[:200]:
                x = bisect.bisect_left(sns, u - off - .0003)
                hits += x < len(sns) and abs(sns[x] - (u - off)) < .0003
            if best is None or hits > best[1]:
                best = (off, hits)
        if best and best[1] >= min(200, len(begins)) * .95:
            break
    off = best[0]
    row_of = {}
    for t in begins:
        x = bisect.bisect_left(sns, t - off - .0003)
        if x < len(sns) and abs(sns[x] - (t - off)) < .0003:
            row_of[t] = idx[x]
    frames = list(zip(begins, begins[1:]))
    splits = {f: split(*f) for f in frames}
    med = {x: statistics.median(splits[f][0][x] for f in frames) for x in ('running', 'preempted', 'wakeupLatency', 'sleep')}
    accounts = []
    for f0, f1 in frames:
        k = row_of.get(f1)
        ms = (f1 - f0) * 1000
        pres = None
        if k is not None and joined.get(k - 1) and joined.get(k - 2):
            pres = (joined[k - 1][1] - joined[k - 2][1]) / 1e6
        b = pres is not None and period and pres >= 1.5 * period
        if not (ms > 20 or b):
            continue
        r, sleep_by, pre_by, occ = splits[(f0, f1)]
        wait = r['preempted'] + r['wakeupLatency']
        ex = {'running': r['running'] - med['running'], 'waiting': wait - med['preempted'] - med['wakeupLatency'], 'sleep': r['sleep'] - med['sleep']}
        top = max(ex, key=ex.get)
        g = [x for x in gcs if x[0] < f1 and x[1] > f0]
        j = bisect.bisect_right(link_t, f1)
        link_ms = sum(clip(s0, s1, f0, f1) for s0, s1 in link[max(0, j - 400):j]) * 1000
        deq = sum(v for kk, v in sleep_by.items() if re.search(r'dequeueBuffer|queueBuffer|eglSwapBuffers|DR\.clear', kk))
        pc = profile_cause.get(k, {})
        accounts.append({'trace': trace.parent.name, 'row': k, 'second': round(f0 - begins[0], 3), 'intervalMs': round(ms, 3),
            'presentIntervalMs': None if pres is None else round(pres, 3), 'classB': bool(b),
            'runningMs': round(r['running'], 2), 'preemptedMs': round(r['preempted'], 2), 'wakeupLatencyMs': round(r['wakeupLatency'], 2),
            'sleepMs': round(r['sleep'], 2), 'traceCause': top,
            'preemptedBy': {kk: round(v, 2) for kk, v in pre_by.most_common(4)},
            'whileWaitingCpuHeldBy': {kk: round(v, 2) for kk, v in occ.most_common(5)},
            'sleepBy': {kk: round(v, 2) for kk, v in sleep_by.most_common(4)}, 'sleepInDequeueOrSwapMs': round(deq, 2),
            'gc': [{'name': lab, 'ms': round((x1 - x0) * 1000, 1)} for x0, x1, lab in g], 'linkThreadsCpuMs': round(link_ms, 2),
            'inNetworkStatsPoll': any(b0 < f1 and b1 > f0 for b0, b1 in bursts),
            'profileCause': pc.get('cause'), 'profileDominantPhase': pc.get('dominantPhase')})
    span = begins[-1] - begins[0]
    return {'trace': str(trace.parent.name), 'glThread': gl_tid, 'frames': len(frames), 'framesOnRows': sum(1 for f in frames if f[1] in row_of),
            'spanSeconds': round(span, 3), 'offsetSeconds': round(off, 6), 'medianSplitMs': {kk: round(v, 3) for kk, v in med.items()},
            'intervalsOver': {f'{x:g}': sum(1 for f0, f1 in frames if (f1 - f0) * 1000 > x) for x in (16.7, 20, 33)},
            'concurrentGcs': len(gcs), 'gcNames': dict(collections.Counter(lab for x0, x1, lab in gcs)),
            'networkStatsPolls': len(bursts), 'linkThreadsCpuPercent': round(sum(clip(s0, s1, begins[0], begins[-1]) for s0, s1 in link) / span * 100, 1),
            'accounts': accounts}

res = [analyze(t) for t in traces]
allacc = [x for r in res for x in r['accounts']]
summary = {'traces': [{k: v for k, v in r.items() if k != 'accounts'} for r in res], 'accounts': allacc,
           'over20': collections.Counter(x['traceCause'] for x in allacc if x['intervalMs'] > 20),
           'classB': collections.Counter(x['traceCause'] for x in allacc if x['classB']),
           'limits': 'Intrusive trace: tracing adds work to every phase, so its frame counts are not I2 figures. Waiting = preempted + '
                     'wakeup latency. Preempted time is charged to the task that took the GL thread\'s CPU; sleep to the section open at '
                     'switch-out and the task that woke it. Link threads are the app\'s threads named DefaultDispatch*, deathride-link*, ktor* '
                     'or eventLoop*.'}
Path(out).write_text(json.dumps(summary, indent=1) + '\n')
print(json.dumps({'traces': summary['traces'], 'over20': summary['over20'], 'classB': summary['classB']}, indent=1))
