"""Optional policy lifecycle and original-package preservation, outside soaks."""
import datetime,json,re,subprocess,sys,time,urllib.request
from pathlib import Path
out=Path('evidence/perf/final/lifecycle');out.mkdir(parents=True,exist_ok=True)
adb=['adb','-P','5041','-s','10.0.0.139:5555'];pkg='dev.deathride.perf';activity=pkg+'/dev.deathride.tv.MainActivity'
def run(*args):return subprocess.check_output(adb+list(args),creationflags=subprocess.CREATE_NO_WINDOW,timeout=60).decode(errors='replace')
def ready():
 for _ in range(150):
  try:
   with urllib.request.urlopen('http://10.0.0.139:8772/stats',timeout=2) as r:s=json.load(r)
   if s['sceneryReady']:return s
  except OSError:pass
  time.sleep(.2)
 raise AssertionError('listener/scenery not ready')
def locks():return [s.strip() for s in run('shell','dumpsys','wifi').splitlines() if 'WifiLock{DeathRide:controllers' in s]
if '--handoff-only' not in sys.argv:
 run('shell','am','force-stop',pkg);run('shell','am','start','-n',activity,'--es','wifiLatency','low');ready();held=locks();assert held
 run('shell','input','keyevent','KEYCODE_HOME');time.sleep(1);paused=locks();assert not paused
 run('shell','am','start','-n',activity);ready();resumed=locks();assert resumed
 pid=run('shell','pidof',pkg).strip();(out/'wifi-logcat.txt').write_text(run('logcat','-d','--pid='+pid,'-s','DeathRide:I'))
 (out/'wifi.json').write_text(json.dumps({'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'pass':True,'held':held,'paused':paused,'resumed':resumed,'limit':'System lifecycle only; does not establish radio latency benefit.'},indent=2))
# Leave the actual default build in a fresh lobby for the owner.
run('shell','am','force-stop',pkg);run('shell','am','start','-n',activity);pin=None
for _ in range(150):
 pid=run('shell','pidof',pkg).strip()
 if pid:
  log=run('logcat','-d','--pid='+pid,'-s','DeathRide:I');pins=re.findall(r'pairing http[^\n]*pin=(\d+)',log)
  if pins:pin=pins[-1]
  if pin:
   try:
    with urllib.request.urlopen('http://10.0.0.139:8772/stats',timeout=2) as r:s=json.load(r)
    if s['sceneryReady']:break
   except OSError:pass
 time.sleep(.2)
else:raise AssertionError('Fresh process PIN/listener/scenery did not become ready')
(out/'owner-ready.json').write_text(json.dumps({'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'package':pkg,'pid':pid,'pin':pin,'url':'http://10.0.0.139:8772/?pin='+pin,'sceneryReady':s['sceneryReady'],'phase':s['phase'],'log':log},indent=2))
after=run('shell','dumpsys','package','dev.deathride.tv');(out/'tv-after.txt').write_text(after)
before=Path('evidence/perf/p0/tv-before.txt').read_text(encoding='utf-16')
keys=['codePath','versionCode','versionName','firstInstallTime','lastUpdateTime','signatures']
def values(text):return {k:[line.strip() for line in text.splitlines() if line.strip().startswith(k+'=')] for k in keys}
left,right=values(before),values(after);assert all(left[k] and left[k]==right[k] for k in keys),(left,right)
(out/'tv-preserved.json').write_text(json.dumps({'pass':True,'before':left,'after':right,'scope':'Original package only read; no install, stop, clear or compile command targeted it.'},indent=2))
print('Optional Wi-Fi lifecycle PASS; original TV package unchanged; default perf lobby ready')
