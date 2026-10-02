"""Read-only device/package and art-budget snapshot, then portable evidence index and hashes."""
from datetime import datetime,timezone
import hashlib
import gzip
import html
import json
import os
from pathlib import Path
import re
import subprocess
import sys

root=Path(__file__).resolve().parents[1];os.chdir(root)
device=sys.argv[1];assert re.fullmatch(r'\d+\.\d+\.\d+\.\d+:5555',device)
out=root/'evidence/hud/h3'
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def write(name,value):(out/name).write_text(json.dumps(value,indent=2)+'\n',encoding='utf-8')
def adb(*args):return subprocess.check_output(['adb','-P','5039','-s',device,*args],text=True,creationflags=subprocess.CREATE_NO_WINDOW,timeout=30)
subprocess.run(['adb','-P','5039','connect',device],check=True,creationflags=subprocess.CREATE_NO_WINDOW,timeout=30)
installed=adb('shell','pm','path','dev.deathride.hud').strip().removeprefix('package:')
assert re.fullmatch(r'/data/app/[A-Za-z0-9_=/\.~\-]+/base\.apk',installed),installed
installed_hash=adb('shell','sha256sum',installed).split()[0]
local_hash=sha(root/'app/build/outputs/apk/debug/app-debug.apk')
assert installed_hash==local_hash,'Installed APK differs from final local APK'
write('installed-apk.json',{'utc':datetime.now(timezone.utc).isoformat(),'device':device,'applicationId':'dev.deathride.hud','path':installed,'installedSha256':installed_hash,'localSha256':local_hash,'match':True})
after=adb('shell','dumpsys','package','dev.deathride.tv')
(out/'tv-package-after.txt').write_text(after,encoding='utf-8')
before_bytes=(root/'evidence/hud/h0/tv-package-before.txt').read_bytes()
before=before_bytes.decode('utf-16' if before_bytes.startswith(b'\xff\xfe') else 'utf-8-sig')
def identity(text):
    return {k:re.search(r'^\s*'+k+r'=(.+)$',text,re.MULTILINE).group(1).strip() for k in ['versionCode','versionName','firstInstallTime','lastUpdateTime']}
assert identity(before)==identity(after),'Unrelated TV package install identity changed'
write('tv-preservation.json',{'before':identity(before),'after':identity(after),'unchanged':True,'scope':'Read-only package identity and install timestamps; no TV install, launch or force-stop command was issued.'})
canonical=root.parent.parent/'firetv-deathride-art/deathride/art'
usage=json.loads((canonical/'usage.json').read_text());policy=json.loads((canonical/'budget.json').read_text())
history=[json.loads(line) for line in (canonical/'history.jsonl').read_text(encoding='utf-8').splitlines()]
reserved=[r for r in history if r.get('event')=='reserved' and r.get('asset','').startswith('v4-hud-')]
assert len(reserved)==22 and policy['weekly_image_cap']==550
assert all(week['images_reserved']<=550 for week in usage['weeks'].values())
write('spend-final.json',{'utc':datetime.now(timezone.utc).isoformat(),'hudReserved':len(reserved),'selectedAssets':14,'accountSnapshot':usage,'weeklyCap':policy['weekly_image_cap'],'scope':'Shared canonical ledger is read only here; other art jobs also reserve. No stop latch cleared and no further HUD generation.'})
# Presentation source plus the unchanged simulation, data, package configuration and exact accepted bundle.
paths=[]
for directory in ['core/src','link/src','game/src','app/src','desktop/src','controller','assets/phase2-hud']:
    paths.extend(p for p in (root/directory).rglob('*') if p.is_file())
paths.extend(p for p in root.glob('**/*.gradle.kts') if 'build' not in p.parts)
paths.append(root/'gradle.properties')
paths.extend(p for p in (root/'tools').iterdir() if p.is_file() and p.suffix in ['.py','.mjs','.json'])
paths=sorted(set(paths));blobs=[]
for start in range(0,len(paths),40):
    blobs.extend(subprocess.check_output(['git','hash-object','--',*[p.relative_to(root).as_posix() for p in paths[start:start+40]]],text=True,creationflags=subprocess.CREATE_NO_WINDOW).splitlines())
assert len(paths)==len(blobs)
write('source-hashes.json',{'baseCommit':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'note':'Exact build working-tree SHA-256 plus Git blob identity after repository filters, so line-ending normalization remains explicit. H3 commit is created after this audit.','files':{p.relative_to(root).as_posix():{'workingTreeSha256':sha(p),'gitBlob':blob} for p,blob in zip(paths,blobs)}})
panels=['<!doctype html><html><meta charset="utf-8"><title>Death Ride HUD evidence</title><style>body{background:#171513;color:#ddd0a6;font:18px system-ui;max-width:1200px;margin:24px auto}a{color:#e7b47b}section{margin:28px 0}img{max-width:100%;height:auto}figure{margin:12px 0}h2{font-size:23px}</style><h1>Death Ride / HUD device evidence</h1><p>Ordinary controller inputs unless a file explicitly says fixture. Captures follow telemetry; short phases can advance during readback. Technical observations do not establish sofa readability or human feel. See the H3 report for final APK mapping, gates and retained failed attempts.</p>']
panels.append('<p><a href="stick-timing/timing/summary.json">Final timing gates and measurements</a></p><figure><a href="timing.png"><img src="timing.png"></a><figcaption>Final APK, 900 seconds, screenshots disabled. Frame-tail and zero-loss input gates remain open.</figcaption></figure>')
for directory in ['gallery-accepted','stick-final/visual','stick-accepted/ability-controller-check','stick-accepted/hud-browser-check','header-final/hud-header-check']:
    images=sorted((out/directory).glob('*.png'))
    if not images:continue
    panels.append('<section><h2>'+html.escape(directory)+'</h2>')
    for path in images:
        rel=path.relative_to(out).as_posix();panels.append('<figure><a href="'+rel+'"><img loading="lazy" src="'+rel+'"></a><figcaption>'+html.escape(path.stem)+'</figcaption></figure>')
    panels.append('</section>')
(out/'index.html').write_text('\n'.join(panels),encoding='utf-8')
for raw in out.rglob('raw.json'):
    assert raw.resolve().is_relative_to(out.resolve())
    data=raw.read_bytes();packed=gzip.compress(data,mtime=0)
    assert gzip.decompress(packed)==data
    target=raw.with_suffix('.json.gz');assert not target.exists() or target.read_bytes()==packed
    target.write_bytes(packed)
    raw.with_name('archive.json').write_text(json.dumps({'source':raw.name,'rawBytes':len(data),'rawSha256':hashlib.sha256(data).hexdigest(),'archive':target.name,'archiveBytes':len(packed),'archiveSha256':sha(target),'roundTripIdentical':True},indent=2)+'\n',encoding='utf-8')
    raw.unlink()
write('manifest.json',{'utc':datetime.now(timezone.utc).isoformat(),'apkSha256':local_hash,'files':{p.relative_to(out).as_posix():sha(p) for p in sorted(out.rglob('*')) if p.is_file() and p.name!='manifest.json'}})
print('Installed APK, unrelated TV package, HUD spend and portable evidence manifest verified')
