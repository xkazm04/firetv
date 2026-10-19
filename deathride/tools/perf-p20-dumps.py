"""P20 step 2: one diagnostic run with heap dumps after a forced GC. It grades nothing (decisions section 12 ruling 4).

The run is P18's arm and procedure, unchanged: perf-device.py --install --profile --seconds 360 on the default sound arm,
with no settle wait. Beside it this script takes the dumps its plan names, each with `am dumpheap -g` (ART runs a GC, the
finalizers and a second GC, then writes the dump):
  a  in the lobby after the scenery is ready, once perf-device.py has written routes-warmup.json and before the probe
     starts (perf-device.py reads device counters and host CPU in between; P19 measured 16.9-17.0 s);
  b  mid-race in round 1: 25 s after the first raceLaunch;
  c  mid-race in the last round: 10 s after the first raceLaunch seen at or after the probe's 290th second (P19's sixth
     and last round started at 333-334 s and was cut at 360 s);
  d  in the lobby after the last round: after the probe ends; if /stats does not read the lobby, one BACK key to
     dev.deathride.perf (the TV remote's way back to the lobby), then the scenery.
A dump stalls the app while it is written (P13f: 7.0 s for 75 MB), past the probe's 5 s request timeout, so a dump taken
under the probe may end it. Run 1's plan is a,b,c,d. If b ends the probe, c cannot be taken, and d is not taken either (its
lobby would not be the one after the last round); run 2 (allowed because run 1 did not produce all four) then takes
a,c,d, its own a being the same-run baseline of c and d. The dumps are pulled after the probe ends.
Beside each dump: `dumpsys meminfo <pid>` before and after it (the full table: the Code line's .so/.jar/.apk/.dex/.oat/.art
rows), the app's smaps read through run-as (the debuggable perf package only), the app's logcat buffer (its GC and hprof
lines; the whole run is also streamed), then pull, hprof-conv, and delete the dump from the device.
Usage (from deathride/): python -I tools/perf-p20-dumps.py OUT_DIR --apk APK --plan a,c,d
"""
import argparse, json, subprocess, sys, time, urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEV = '10.0.0.139:5555'
PKG = 'dev.deathride.perf'
BASE = 'http://' + DEV.split(':')[0] + ':8772'
ADB = ['adb', '-P', '5041', '-s', DEV]
NOWIN = subprocess.CREATE_NO_WINDOW


def utc():
    return datetime.now(timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')


def adb(*args, timeout=60):
    return subprocess.run([*ADB, *args], capture_output=True, timeout=timeout, creationflags=NOWIN)


def shell(cmd, timeout=60):
    return adb('shell', cmd, timeout=timeout).stdout.decode(errors='replace')


class Log:
    """The app's logcat, streamed to a file and read as it grows (host time of first sight per line)."""

    def __init__(self, path, pid):
        self.path = path
        self.f = path.open('wb')
        self.proc = subprocess.Popen([*ADB, 'logcat', '-v', 'threadtime', '--pid=' + pid], stdout=self.f,
                                     stderr=subprocess.STDOUT, creationflags=NOWIN)
        self.pos = 0
        self.lines = []

    def poll(self):
        self.f.flush()
        with self.path.open('rb') as r:
            r.seek(self.pos)
            chunk = r.read()
        cut = chunk.rfind(b'\n') + 1
        self.pos += cut
        now = time.time()
        for ln in chunk[:cut].decode(errors='replace').splitlines():
            self.lines.append((now, ln))
        return self.lines

    def close(self):
        self.proc.terminate()
        self.proc.wait(timeout=10)
        self.f.close()


def stats():
    with urllib.request.urlopen(BASE + '/stats', timeout=10) as r:
        return json.load(r)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('out', type=Path)
    ap.add_argument('--apk', type=Path, required=True)
    ap.add_argument('--plan', required=True)
    ap.add_argument('--seconds', type=int, default=360)
    a = ap.parse_args()
    plan = a.plan.split(',')
    out = a.out
    out.mkdir(parents=True, exist_ok=True)
    run = out.name
    record = {'run': run, 'plan': plan, 'startedUtc': utc(), 'dumps': [], 'notes': []}

    def save():
        (out / 'dumps.json').write_text(json.dumps(record, indent=1) + '\n')

    device_out = (out.parent / f'{run}-device.out').open('w')
    dev = subprocess.Popen([sys.executable, '-I', str(ROOT / 'tools/perf-device.py'), str(out), '--apk', str(a.apk),
                            '--install', '--profile', '--seconds', str(a.seconds)],
                           cwd=ROOT, stdout=device_out, stderr=subprocess.STDOUT, creationflags=NOWIN)
    while not (out / 'startup-logcat.txt').exists():
        assert dev.poll() is None, 'perf-device.py ended before the launch'
        time.sleep(0.2)
    pid = ''
    for _ in range(200):
        pid = shell('pidof ' + PKG).strip()
        if pid:
            break
        time.sleep(0.25)
    assert pid, 'no process'
    record['pid'] = pid
    log = Log(out / 'dumps-logcat.txt', pid)

    def dump(label):
        remote = f'/data/local/tmp/p20-{run}-{label}.hprof'
        d = {'label': label, 'remote': remote, 'hostStartUtc': utc()}
        (out / f'meminfo-{label}-before.txt').write_text(shell('dumpsys meminfo ' + pid))
        t0 = time.time()
        r = adb('shell', f'am dumpheap -g {pid} {remote}', timeout=300)
        d['amSeconds'] = round(time.time() - t0, 3)
        d['amOutput'] = (r.stdout + r.stderr).decode(errors='replace').strip()
        started = completed = None
        for _ in range(240):
            for _, ln in log.poll():
                if 'hprof: heap dump' in ln and remote in ln:
                    started = ln
                if started and 'hprof: heap dump completed' in ln:
                    completed = ln
            if completed:
                break
            time.sleep(0.5)
        d['hprofStart'], d['hprofCompleted'] = started, completed
        d['hostDoneUtc'] = utc()
        (out / f'meminfo-{label}.txt').write_text(shell('dumpsys meminfo ' + pid))
        (out / f'smaps-{label}.txt').write_bytes(adb('shell', f'run-as {PKG} cat /proc/{pid}/smaps').stdout)
        (out / f'logcat-{label}.txt').write_bytes(adb('logcat', '-d', '-v', 'threadtime', '--pid=' + pid).stdout)
        d['remoteLs'] = shell('ls -l ' + remote).strip()
        d['probeAlive'] = dev.poll() is None
        record['dumps'].append(d)
        save()
        print(label, d['amSeconds'], completed, flush=True)

    def pull(d):
        # Pulled after the probe ends, so the transfer does not share the Wi-Fi or the host with a race.
        remote, label = d['remote'], d['label']
        local = out / f'heap-{label}.raw.hprof'
        d['pull'] = adb('pull', remote, str(local), timeout=900).stdout.decode(errors='replace').strip()[-200:]
        d['rm'] = shell('rm ' + remote + '; ls ' + remote + ' 2>&1').strip()
        d['localBytes'] = local.stat().st_size if local.exists() else None
        conv = subprocess.run(['hprof-conv', str(local), str(out / f'heap-{label}.hprof')], capture_output=True,
                              creationflags=NOWIN)
        d['hprofConv'] = conv.returncode
        save()

    def wait_for(pred, deadline):
        while time.time() < deadline:
            hit = pred(log.poll())
            if hit:
                return hit
            if dev.poll() is not None:
                return None
            time.sleep(0.3)
        return None

    try:
        body(plan, dump, pull, wait_for, dev, device_out, log, out, pid, record, save)
    finally:
        for d in record['dumps']:
            if 'rm' not in d:
                pull(d)
        log.poll()
        log.close()
        record['endedUtc'] = utc()
        record['leftOnDevice'] = shell('ls /data/local/tmp/ | grep -i hprof').strip()
        save()


def body(plan, dump, pull, wait_for, dev, device_out, log, out, pid, record, save):
    # a: after the warm-up, before the probe.
    while not (out / 'routes-warmup.json').exists():
        if dev.poll() is not None:
            record['notes'].append('perf-device.py ended before the warm-up')
            break
        time.sleep(0.2)
    if 'a' in plan and dev.poll() is None:
        if (out / 'probe.log').exists():
            record['notes'].append('a skipped: the probe had already started')
        else:
            dump('a')
            record['dumps'][-1]['probeStartedBeforeDone'] = (out / 'probe.log').exists()
    while not (out / 'probe.log').exists() and dev.poll() is None:
        time.sleep(0.2)
    probe_start = time.time()
    record['probeSeenUtc'] = utc()
    launches = lambda lines: [(t, ln) for t, ln in lines if 'transition raceLaunch' in ln]
    if 'b' in plan:
        hit = wait_for(lambda lines: launches(lines)[:1], probe_start + 120)
        if hit:
            time.sleep(max(0, hit[0][0] + 25 - time.time()))
            if dev.poll() is None:
                dump('b')
        else:
            record['notes'].append('b not taken: no raceLaunch within 120 s or the probe ended')
    if 'c' in plan:
        hit = wait_for(lambda lines: [x for x in launches(lines) if x[0] >= probe_start + 290][:1], probe_start + 352)
        if hit:
            record['lastRoundLaunch'] = {'line': hit[0][1], 'probeSecond': round(hit[0][0] - probe_start, 1),
                                         'launchesSeen': len(launches(log.lines))}
            time.sleep(max(0, hit[0][0] + 10 - time.time()))
            if dev.poll() is None:
                dump('c')
            else:
                record['notes'].append('c not taken: the probe had ended')
        else:
            record['notes'].append('c not taken: no raceLaunch at or after 290 s, or the probe ended')
    dev.wait()
    device_out.close()
    record['deviceExit'] = dev.returncode
    record['deviceEndedUtc'] = utc()
    save()
    if 'd' in plan and 'c' in plan and not any(d['label'] == 'c' for d in record['dumps']):
        record['notes'].append('d not taken: without c the lobby is not the one after the last round')
    elif 'd' in plan:
        alive = shell('pidof ' + PKG).strip() == pid
        if not alive:
            record['notes'].append('d not taken: the process is gone')
        else:
            s = stats()
            record['afterProbe'] = {'phase': s.get('phase'), 'sceneryReady': s.get('sceneryReady')}
            if s.get('phase') != 'lobby':
                top = shell('dumpsys activity activities | grep mResumedActivity')
                record['afterProbe']['resumed'] = top.strip()
                if PKG in top:
                    shell('input keyevent KEYCODE_BACK')
                    record['afterProbe']['backKeyUtc'] = utc()
            for _ in range(60):
                s = stats()
                if s.get('phase') == 'lobby' and s.get('sceneryReady'):
                    break
                time.sleep(2)
            record['beforeD'] = {'phase': s.get('phase'), 'sceneryReady': s.get('sceneryReady'), 'track': s.get('track', {}).get('id')}
            if s.get('phase') == 'lobby':
                time.sleep(5)
                dump('d')
            else:
                record['notes'].append('d not taken: not in the lobby')


main()
