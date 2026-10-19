"""P13g step 2: P13f's lobby A/B for one APK. Installs it as dev.deathride.perf, launches it profiled (as perf-device.py
does), waits for the pairing line and sceneryReady, then runs tools/perf-p13f-stats-load.mjs with the given phases.
Optional --dump-at S: one `am dumpheap` (no -g) S seconds after the load script starts, pulled and hprof-conv'd.
Usage (from deathride/): python -I tools/perf-p13g-lobby-ab.py <apk> <outdir> [--phases quiet,stats,quiet,stats,quiet] [--dump-at S]"""
import argparse, json, re, subprocess, sys, time, urllib.request
from pathlib import Path
p = argparse.ArgumentParser()
p.add_argument('apk', type=Path); p.add_argument('out', type=Path)
p.add_argument('--phases', default='quiet,stats,quiet,stats,quiet'); p.add_argument('--seconds', default='60')
p.add_argument('--dump-at', type=float, default=None)
a = p.parse_args(); a.out.mkdir(parents=True, exist_ok=True)
D, pkg, base = '10.0.0.139:5555', 'dev.deathride.perf', 'http://10.0.0.139:8772'
def adb(*args, **kw): return subprocess.check_output(['adb', '-P', '5041', '-s', D, *args], timeout=120, **kw)
adb('shell', 'input', 'keyevent', 'KEYCODE_WAKEUP')
(a.out / 'install.txt').write_bytes(adb('install', '-r', str(a.apk.resolve())))
adb('shell', 'am', 'force-stop', pkg)
log = (a.out / 'startup-logcat.txt').open('wb')
lc = subprocess.Popen(['adb', '-P', '5041', '-s', D, 'logcat', '-v', 'threadtime', '-T', '1', '-s', 'DeathRide:I'], stdout=log, stderr=subprocess.STDOUT)
adb('shell', 'am', 'start', '-n', pkg + '/dev.deathride.tv.MainActivity', '--ez', 'profile', 'true')
pin = pid = None
try:
    for _ in range(200):
        time.sleep(.5)
        pid = adb('shell', 'pidof', pkg).decode().strip()
        if not pid: continue
        log.flush(); text = (a.out / 'startup-logcat.txt').read_text(errors='replace')
        pins = re.findall(r'^\S+ \S+\s+' + pid + r'\s.*pairing http[^\n]*pin=(\d+)', text, re.M)
        if pins:
            try:
                with urllib.request.urlopen(base + '/stats', timeout=3) as r:
                    if json.load(r)['sceneryReady']: pin = pins[-1]; break
            except OSError: pass
finally:
    lc.terminate(); lc.wait(10); log.close()
assert pin, 'not ready'
(a.out / 'pid.txt').write_text(pid)
full = subprocess.Popen(['adb', '-P', '5041', '-s', D, 'logcat', '-v', 'threadtime', '--pid=' + pid], stdout=(a.out / 'logcat.txt').open('wb'), stderr=subprocess.STDOUT)
load = subprocess.Popen(['node', 'tools/perf-p13f-stats-load.mjs', base, pin, str(a.out / 'load.json'), a.seconds, a.phases],
    stdout=(a.out / 'load.out').open('wb'), stderr=subprocess.STDOUT)
if a.dump_at is not None:
    time.sleep(a.dump_at)
    (a.out / 'heap-utc.txt').write_text(time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()))
    adb('shell', 'am', 'dumpheap', pid, '/data/local/tmp/p13g.hprof')
    time.sleep(20)
rc = load.wait()
if a.dump_at is not None:
    adb('pull', '/data/local/tmp/p13g.hprof', str(a.out / 'heap.raw.hprof')); adb('shell', 'rm', '/data/local/tmp/p13g.hprof')
full.terminate(); full.wait(10)
adb('shell', 'am', 'force-stop', pkg)
print('load exit', rc)
