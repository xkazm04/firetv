"""Isolated Stick installation/run. Never changes dev.deathride.tv."""
import argparse, hashlib, json, os, re, subprocess, time, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
os.chdir(ROOT)
p = argparse.ArgumentParser()
p.add_argument('output', type=Path)
p.add_argument('--device', default='10.0.0.139:5555')
p.add_argument('--seconds', type=int, default=900)
p.add_argument('--install', action='store_true')
p.add_argument('--profile', action='store_true')
p.add_argument('--extra', action='append', default=[])
# Courses build lazily since baf5181a: the first /routes builds every playable course, past the
# probe's 5 s setup fetch on a Stick. P8 paid that at class load; this pays it before the probe.
p.add_argument('--warm-routes', action='store_true')
p.add_argument('--tracks', help='comma-separated five playable course ids (PROBE_TRACKS)')
p.add_argument('--apk', type=Path, default=ROOT / 'app/build/outputs/apk/debug/app-debug.apk')
a = p.parse_args()
a.output.mkdir(parents=True, exist_ok=True)
package = 'dev.deathride.perf'
base = 'http://' + a.device.split(':')[0] + ':8772'

def adb(*args, **kw):
    return subprocess.check_output(['adb', '-P', '5041', '-s', a.device, *args],
        creationflags=subprocess.CREATE_NO_WINDOW, timeout=60, **kw)

apk = a.apk.resolve()
receipt = {'apkSha256': hashlib.sha256(apk.read_bytes()).hexdigest(),
    'device': a.device, 'package': package, 'profile': a.profile, 'extra': a.extra}
# aapt identity check before any installation.
sdk = Path(os.environ['ANDROID_HOME'])
aapt = sorted((sdk / 'build-tools').glob('*/aapt.exe'))[-1]
badging = subprocess.check_output([str(aapt), 'dump', 'badging', str(apk)], text=True)
assert "package: name='dev.deathride.perf'" in badging
(a.output / 'badging.txt').write_text(badging)
adb('shell', 'input', 'keyevent', 'KEYCODE_WAKEUP')
if a.install:
    (a.output / 'install.txt').write_bytes(adb('install', '-r', str(apk)))
remote = adb('shell', 'pm', 'path', package).decode().strip().removeprefix('package:')
installed = adb('shell', 'sha256sum', remote).decode().split()[0]
assert installed == receipt['apkSha256']
receipt['installedSha256'] = installed
(a.output / 'installed.json').write_text(json.dumps(receipt, indent=2))
adb('shell', 'am', 'force-stop', package)
launch = ['shell', 'am', 'start', '-n', package + '/dev.deathride.tv.MainActivity']
if a.profile:
    launch += ['--ez', 'profile', 'true']
for entry in a.extra:
    name, value = entry.split('=', 1)
    launch += ['--es', name, value]
adb(*launch)
pin = None
for _ in range(100):
    time.sleep(.5)
    pid = adb('shell', 'pidof', package).decode().strip()
    if not pid:
        continue
    log = adb('logcat', '-d', '--pid=' + pid, '-s', 'DeathRide:I').decode(errors='replace')
    pins = re.findall(r'pairing http[^\n]*pin=(\d+)', log)
    if pins:
        try:
            with urllib.request.urlopen(base + '/stats', timeout=3) as r:
                stats = json.load(r)
            if stats['sceneryReady']:
                pin = pins[-1]
                break
        except OSError:
            pass
assert pin, 'Listener not ready; no fixed-delay pairing'
if a.warm_routes:
    started = time.perf_counter()
    with urllib.request.urlopen(base + '/routes', timeout=300) as r:
        size = len(r.read())
    (a.output / 'routes-warmup.json').write_text(json.dumps({'seconds': time.perf_counter() - started,
        'bytes': size, 'limit': 'One untimed-out GET before the probe; includes LAN transfer.'}, indent=2))
(a.output / 'thread-priorities-before.txt').write_bytes(adb('shell','ps','-T','-p',pid,'-o','PID,TID,NI,CMD'))

def host_cpu(name):
    # P9: other sessions held the host at 85-91% CPU; record it beside each run (3 x 1 s samples, top processes).
    ps = ("$t=1..3|%{(Get-CimInstance Win32_PerfFormattedData_PerfOS_Processor -Filter \"Name='_Total'\").PercentProcessorTime;Start-Sleep 1};"
          "$p=Get-CimInstance Win32_PerfFormattedData_PerfProc_Process|?{$_.Name -notin '_Total','Idle'}|sort PercentProcessorTime -desc|select -first 10 Name,IDProcess,PercentProcessorTime;"
          "@{utc=(Get-Date).ToUniversalTime().ToString('o');totalPercentSamples=@($t);logicalProcessors=[Environment]::ProcessorCount;"
          "topProcesses=@($p);limit='Process percentages are per logical processor (can exceed 100)'}|ConvertTo-Json -Depth 3")
    try:
        (a.output / name).write_text(subprocess.check_output(['powershell', '-NoProfile', '-Command', ps], text=True,
            creationflags=subprocess.CREATE_NO_WINDOW, timeout=60))
    except (OSError, subprocess.SubprocessError) as e:
        (a.output / name).write_text(json.dumps({'error': repr(e)}))

host_cpu('host-cpu-start.json')
env = {**os.environ, 'DEATHRIDE_TEST_STREAM': 'perf', 'PROBE_SCREENSHOTS': '0',
    'PROBE_MINES': '1', 'PROBE_DEVICE': a.device, 'PROBE_ADB_PORT': '5041',
    'PROBE_PRIORITY': 'AboveNormal', 'PROBE_PROFILE': '1' if a.profile else '0', 'PROBE_APK_PATH': str(apk)}
if a.tracks:
    env['PROBE_TRACKS'] = a.tracks
with (a.output / 'logcat.txt').open('wb') as log:
    logcat = subprocess.Popen(['adb', '-P', '5041', '-s', a.device, 'logcat', '--pid=' + pid,
        '-v', 'threadtime'], stdout=log, stderr=subprocess.STDOUT, creationflags=subprocess.CREATE_NO_WINDOW)
    try:
        with (a.output / 'probe.log').open('w') as out:
            result = subprocess.run(['node', 'tools/ability-stick-probe.mjs', base, pin,
                str(a.output / 'raw.json'), str(a.seconds)], env=env, stdout=out,
                stderr=subprocess.STDOUT, creationflags=subprocess.CREATE_NO_WINDOW)
    finally:
        logcat.terminate()
        logcat.wait(timeout=10)
host_cpu('host-cpu-end.json')
print(json.dumps({'output': str(a.output), 'returncode': result.returncode, **receipt}), flush=True)
raise SystemExit(result.returncode)
