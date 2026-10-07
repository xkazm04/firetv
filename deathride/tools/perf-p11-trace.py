"""P11 scheduler attribution of slow Stick frames: where the render thread was when it was not running.

capture: waits until the perf app is racing (GET /health), lets the race run --after seconds, then records one
  atrace (sched, gfx, dalvik and the app's DR.* sections, which exist only with --profile) for --seconds. Intrusive:
  run it beside a diagnostic arm, never inside a measured one.
analyze: splits every frame interval (DR.requests begin to the next DR.requests begin on the GL thread) into
  running, runnable (preempted: which threads held the CPUs) and sleeping (blocked: in which DR section or gfx
  slice, and which task woke it), with ConcurrentGC overlap from the dalvik sections. Slow = interval over 20 or 33 ms."""
import argparse, bisect, collections, datetime, gzip, json, re, subprocess, sys, time, urllib.request, zlib
from pathlib import Path

p = argparse.ArgumentParser()
sub = p.add_subparsers(dest='cmd', required=True)
c = sub.add_parser('capture')
c.add_argument('output', type=Path)
c.add_argument('--device', default='10.0.0.139:5555')
c.add_argument('--after', type=float, default=12.0, help='seconds into a race before tracing starts')
c.add_argument('--seconds', type=int, default=30)
z = sub.add_parser('analyze')
z.add_argument('trace', type=Path, help='trace.txt.gz from capture')
z.add_argument('out', type=Path)
a = p.parse_args()

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
    path = '/data/local/tmp/deathride-p11.atrace'
    started = datetime.datetime.now(datetime.timezone.utc).isoformat()
    r = subprocess.run(prefix + ['shell', 'atrace', '-z', '-b', '16384', '-t', str(a.seconds), '-a', 'dev.deathride.perf',
                       'sched', 'freq', 'gfx', 'dalvik', '-o', path], stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                       creationflags=subprocess.CREATE_NO_WINDOW, timeout=a.seconds + 120)
    (a.output / 'atrace.txt').write_bytes(r.stdout)
    data = subprocess.check_output(prefix + ['exec-out', 'cat', path], creationflags=subprocess.CREATE_NO_WINDOW)
    subprocess.run(prefix + ['shell', 'rm', path], creationflags=subprocess.CREATE_NO_WINDOW)
    body = data[data.find(b'TRACE:\n') + 7:] if b'TRACE:\n' in data else data
    try:
        body = zlib.decompress(body)
    except zlib.error:
        pass
    (a.output / 'trace.txt.gz').write_bytes(gzip.compress(body, mtime=0))
    (a.output / 'capture.json').write_text(json.dumps({'startedUtc': started, 'endedUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'afterRaceStartSeconds': a.after, 'seconds': a.seconds, 'returncode': r.returncode, 'bytes': len(body)}, indent=2))
    print(json.dumps({'returncode': r.returncode, 'bytes': len(body)}))
    sys.exit(0)

text = gzip.decompress(a.trace.read_bytes()).decode(errors='replace')
line = re.compile(r'^\s*(.*)-(\d+)\s+\(\s*(\d+|-+)\)\s+\[(\d+)\].*?\s(\d+\.\d+):\s+(\w+):\s+(.*)$')
switch = re.compile(r'prev_comm=(.*?) prev_pid=(\d+) prev_prio=(\d+) prev_state=(\S+) ==> next_comm=(.*?) next_pid=(\d+) next_prio=(\d+)')
names, tgids, prios = {}, {}, {}
running_on = {}      # cpu -> (tid, since)
cpu_slices = []      # (start, end, cpu, tid)
gl_tid = None
marks = collections.defaultdict(list)  # tid -> [(t, 'B'|'E', label)]
events = []          # (t, 'out'|'in', detail, cpu)
wakeups = []         # (t, wakee tid, waker name)
for raw in text.splitlines():
    m = line.match(raw)
    if not m:
        continue
    comm, tid, tgid, cpu, t, event, body = m.groups()
    tid, cpu, t = int(tid), int(cpu), float(t)
    names[tid] = comm
    if tgid.isdigit():
        tgids[tid] = int(tgid)
    if event == 'sched_switch':
        sm = switch.match(body)
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
    sys.exit('no DR.requests section: was the arm profiled (--profile)?')

def short(tid):
    return re.sub(r'[-\d]+$', '', names.get(tid, str(tid))).strip() or names.get(tid, str(tid))

def tagged(tid):
    # Kernel priority: below 100 is real-time; 100-139 is CFS at nice (priority - 120).
    prio = prios.get(tid, 120)
    return short(tid) + (' (RT)' if prio < 100 else f' (nice {prio - 120})' if prio != 120 else '')

def stack_spans(tid):
    stack, out = [], []
    for t, kind, label in marks[tid]:
        if kind == 'B':
            stack.append((label, t))
        elif stack:
            label, t0 = stack.pop()
            out.append((t0, t, label, len(stack)))
    return out

# The GL thread's open section over time; GC spans are HeapTaskDaemon's outermost sections naming a GC.
sections, stack = [], []
for t, kind, label in marks[gl_tid]:
    if kind == 'B':
        stack.append(label)
    elif stack:
        stack.pop()
    sections.append((t, stack[-1] if stack else '(none)'))
sec_t = [x[0] for x in sections]

def section_at(t):
    k = bisect.bisect_right(sec_t, t) - 1
    return sections[k][1] if k >= 0 else '(none)'

gcs = sorted((t0, t1, label) for tid in list(marks) if names.get(tid, '').startswith('HeapTaskDaemon')
             for t0, t1, label, depth in stack_spans(tid) if depth == 0 and 'GC' in label)

# GL thread timeline: running; preempted (charged to the task that took its CPU); sleep (charged to the section open at
# switch-out and the task that woke it); wakeup latency (from that wakeup until it runs).
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
for s0, s1, state in timeline:
    if state[0] == 'sleep':
        k = bisect.bisect_left(wk_t, s0)
        if k < len(wk) and wk[k][0] <= s1:
            w, waker = wk[k]
            final.append((s0, w, ('sleep', state[1], re.sub(r'[-\d]+$', '', waker).strip() or waker)))
            final.append((w, s1, ('wakeupLatency', state[1])))
        else:
            final.append((s0, s1, ('sleep', state[1], '?')))
    else:
        final.append((s0, s1, state))
final.sort(key=lambda x: x[0])
fin_t = [x[0] for x in final]
per_cpu = collections.defaultdict(list)
for x in sorted(cpu_slices):
    per_cpu[x[2]].append(x)
per_cpu_t = {k: [x[0] for x in v] for k, v in per_cpu.items()}

def clip(x0, x1, t0, t1):
    return max(0.0, min(x1, t1) - max(x0, t0))

def occupancy(t0, t1):
    """CPU-ms every other task held on any CPU in [t0, t1], and the ms with at least one CPU idle."""
    out, idle_spans = collections.Counter(), []
    for core, slices in per_cpu.items():
        k = max(0, bisect.bisect_right(per_cpu_t[core], t0) - 1)
        while k < len(slices) and slices[k][0] < t1:
            s0, s1, cpu, tid = slices[k]
            d = clip(s0, s1, t0, t1)
            if d > 0 and tid != gl_tid:
                if tid:
                    out[tagged(tid)] += d * 1000
                else:
                    idle_spans.append((max(s0, t0), min(s1, t1)))
            k += 1
    idle_spans.sort()
    idle, end = 0.0, t0
    for x0, x1 in idle_spans:
        if x1 > end:
            idle += x1 - max(x0, end)
            end = x1
    return out, idle * 1000

frames = [t for t, kind, label in marks[gl_tid] if kind == 'B' and label.startswith('DR.requests')]

def split(t0, t1):
    r = collections.Counter()
    sleepBy, preemptedBy, inSection, occ = (collections.Counter() for _ in range(4))
    idle = 0.0
    k = max(0, bisect.bisect_right(fin_t, t0) - 1)
    while k < len(final) and final[k][0] < t1:
        s0, s1, state = final[k]
        d = clip(s0, s1, t0, t1) * 1000
        if d > 0:
            r[state[0] + 'Ms'] += d
            if state[0] == 'sleep':
                sleepBy[f'{state[1]} <- {state[2]}'] += d
            elif state[0] in ('preempted', 'wakeupLatency'):
                inSection[state[1]] += d
                if state[0] == 'preempted':
                    preemptedBy[tagged(state[2])] += d
                o, i = occupancy(max(s0, t0), min(s1, t1))
                occ.update(o)
                idle += i
        k += 1
    g = [x for x in gcs if x[0] < t1 and x[1] > t0]
    return r, sleepBy, preemptedBy, inSection, occ, idle, g

# NetworkStats (system_server) polls: that thread's slices merged across gaps under 50 ms, kept when longer than 200 ms.
ns = sorted((s0, s1) for s0, s1, cpu, tid in cpu_slices if names.get(tid, '').startswith('NetworkStats'))
bursts = []
for s0, s1 in ns:
    if bursts and s0 - bursts[-1][1] < .05:
        bursts[-1][1] = max(bursts[-1][1], s1)
    else:
        bursts.append([s0, s1])
bursts = [b for b in bursts if b[1] - b[0] > .2]
allFrames = [(f0, f1, (f1 - f0) * 1000) for f0, f1 in zip(frames, frames[1:])]
span = frames[-1] - frames[0]
result = {}
for lim in (20.0, 33.0):
    slow = [x for x in allFrames if x[2] > lim]
    tot, sb, pb, ins, occ = (collections.Counter() for _ in range(5))
    idle, ngc = 0.0, 0
    for f0, f1, ms in slow:
        r, s_, p_, i_, o_, idle_, g = split(f0, f1)
        tot.update(r); sb.update(s_); pb.update(p_); ins.update(i_); occ.update(o_)
        idle += idle_
        ngc += bool(g)
    n = max(1, len(slow))
    result[f'over{lim:g}Ms'] = {
        'frames': len(slow), 'meanIntervalMs': round(sum(x[2] for x in slow) / n, 3),
        'meanMs': {k: round(tot[k] / n, 3) for k in ('runningMs', 'preemptedMs', 'wakeupLatencyMs', 'sleepMs')},
        'duringConcurrentGc': ngc,
        'insideNetworkStatsPoll': sum(1 for f0, f1, ms in slow if any(b0 < f1 and b1 > f0 for b0, b1 in bursts)),
        'preemptedByMs': {k: round(v, 1) for k, v in pb.most_common(12)},
        'waitingInSectionMs': {k: round(v, 1) for k, v in ins.most_common(10)},
        'sleepBySectionAndWakerMs': {k: round(v, 1) for k, v in sb.most_common(12)},
        'waitingMs': round(tot['preemptedMs'] + tot['wakeupLatencyMs'], 1),
        'whileWaitingSomeCpuIdleMs': round(idle, 1),
        'whileWaitingAnyCpuHeldByMs': {k: round(v, 1) for k, v in occ.most_common(14)}}
whole = collections.Counter()
for s0, s1, state in final:
    whole[state[0] + 'Ms'] += clip(s0, s1, frames[0], frames[-1]) * 1000
threads, procs, slices_of = collections.Counter(), collections.Counter(), collections.defaultdict(list)
for s0, s1, cpu, tid in cpu_slices:
    d = clip(s0, s1, frames[0], frames[-1])
    if tid and d > 0:
        threads[(tid, short(tid))] += d
        procs[tgids.get(tid, -1)] += d
        slices_of[tid].append(d)
proc_name = {}
for tid, g in tgids.items():
    if tid == g or g not in proc_name:
        proc_name[g] = names.get(tid)
# Threads at real-time or nice <= -10 using over 5% of a core: what can take the GL thread's (nice -4) CPU at once.
rt = [{'thread': name, 'tid': tid, 'process': proc_name.get(tgids.get(tid)), 'prio': prios.get(tid),
       'cpuPercentOfOneCore': round(v / span * 100, 1), 'switchInsPerSecond': round(len(slices_of[tid]) / span),
       'meanSliceUs': round(v / len(slices_of[tid]) * 1e6, 1)}
      for (tid, name), v in threads.most_common() if prios.get(tid, 120) <= 110 and v / span > .05]
out = {'source': a.trace.as_posix(), 'glThread': {'tid': gl_tid, 'name': names.get(gl_tid)}, 'frames': len(allFrames), 'spanSeconds': round(span, 3),
       'intervalsOver': {f'{x:g}': sum(1 for f in allFrames if f[2] > x) for x in (16.7, 20, 25, 33, 50)},
       'wholeSpanMs': {k: round(v, 1) for k, v in whole.items()},
       'concurrentGc': {'count': len(gcs), 'totalMs': round(sum(x[1] - x[0] for x in gcs) * 1000, 1)},
       'networkStatsPolls': {'count': len(bursts), 'seconds': [round(b0 - frames[0], 2) for b0, b1 in bursts],
                             'durationsMs': [round((b1 - b0) * 1000) for b0, b1 in bursts],
                             'shareOfSpan': round(sum(clip(b0, b1, frames[0], frames[-1]) for b0, b1 in bursts) / span, 3)},
       'slow': result, 'highPriorityThreads': rt,
       'cpuPercentOfOneCoreByProcess': {f'{proc_name.get(g)} ({g})': round(v / span * 100, 1) for g, v in procs.most_common(12)},
       'cpuPercentOfOneCoreByThread': {f'{name} ({tgids.get(tid)})': round(v / span * 100, 1) for (tid, name), v in threads.most_common(20)},
       'limits': 'Bounded intrusive trace (atrace with app sections); tracing adds work to every phase. Frames are DR.requests to '
                 'DR.requests on the GL thread, whatever the phase. Preempted time is charged to the task that took the GL thread\'s CPU '
                 '(the GL thread may later run elsewhere); sleep to the section open at switch-out and the task that woke it; wakeup '
                 'latency is the wait from that wakeup until it runs. Occupancy sums the CPU-ms of every other task on any CPU while '
                 'the GL thread waited. NetworkStats polls are inferred from that thread\'s CPU bursts.'}
a.out.write_text(json.dumps(out, indent=2) + '\n')
print(json.dumps({k: out[k] for k in ('frames', 'spanSeconds', 'intervalsOver', 'wholeSpanMs', 'concurrentGc', 'networkStatsPolls', 'highPriorityThreads')}, indent=1))
print(json.dumps(out['slow'], indent=1))
