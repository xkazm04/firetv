"""Install only the isolated AI package on a host found by the explicit /24 scan."""
from pathlib import Path
import hashlib,json,os,re,subprocess,sys,time
root=Path(__file__).resolve().parents[1];out=root/'evidence/ai/z4/stick';address=sys.argv[1]
scan_path=out/('scan-resumed.json' if (out/'scan-resumed.json').exists() else 'scan.json')
scan=json.loads(scan_path.read_text());assert address in scan['reachable'] and scan['port']==5555
device=address+':5555';pkg='dev.deathride.ai';apk=root/'app/build/outputs/apk/debug/app-debug.apk';port='5043'
def run(args,**kw):return subprocess.check_output(args,creationflags=subprocess.CREATE_NO_WINDOW,timeout=120,**kw)
def adb(*args):return run(['adb','-P',port,'-s',device,*args],text=True)
run(['adb','-P',port,'connect',device],text=True)
# Do not displace another Death Ride workstream. Retry read-only; leave pending if busy.
for attempt in range(7):
    active=adb('shell','dumpsys','activity','activities')
    foreground=next((line.strip() for line in active.splitlines() if 'mResumedActivity' in line),'')
    if not ('dev.deathride.' in foreground and 'dev.deathride.ai/' not in foreground):break
    if attempt==6:
        (out/'install-pending.json').write_text(json.dumps(dict(status='pending',reason='Another Death Ride app is foreground',foreground=foreground),indent=2)+'\n')
        sys.exit('Stick busy; isolated install pending')
    time.sleep(10)
manifest=run([str(Path(os.environ['ANDROID_HOME'])/'build-tools/35.0.0/aapt.exe'),'dump','badging',str(apk)],text=True)
assert re.search(r"package: name='dev.deathride.ai'",manifest)
(out/'apk-manifest.txt').write_text(manifest,encoding='utf-8')
def identity(name):
    result=subprocess.run(['adb','-P',port,'-s',device,'shell','pm','path',name],capture_output=True,text=True,creationflags=subprocess.CREATE_NO_WINDOW)
    assert result.returncode==0 or result.returncode==1 and not result.stdout.strip() and not result.stderr.strip(),result.stderr
    return [adb('shell','sha256sum',p.removeprefix('package:')).strip() for p in result.stdout.splitlines() if p.startswith('package:')]
protected={name:identity(name) for name in ('dev.deathride.tv','dev.deathride.tracks')};previous=identity(pkg)
installed=adb('install','-r',str(apk));assert 'Success' in installed
after=identity(pkg);sha=hashlib.sha256(apk.read_bytes()).hexdigest();assert any(h.startswith(sha) for h in after)
assert all(identity(name)==value for name,value in protected.items())
record=dict(applicationId=pkg,device=device,adbPort=port,model=adb('shell','getprop','ro.product.model').strip(),apkSha256=sha,
    installed=after,previous=previous,protected=protected,protectedUnchanged=True,fixtures='None; fresh named profile through ordinary pairing')
(out/'installation.json').write_text(json.dumps(record,indent=2)+'\n');print(json.dumps(record,indent=2))
