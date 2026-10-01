"""Run identical libGDX lab modes on desktop or an exclusively held idle Stick."""
import argparse
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import time
import urllib.request
from datetime import datetime, timezone
from common import ART, ROOT, file_lock, now, sha, write_json, read_json

PACKAGE='dev.deathride.artlab'
MODES=['baseline','painted','macro','decals','ribbon','edges','grade-dust','depth','wear','poster-grain','contrast','combined','ribbon-control','lean-stack','efficient-stack','cached-stack']
LAB=ROOT/'tools/art/surface-lab'

def desktop(modes,styles,run):
    dest=ART/'surface-lab/desktop';dest.mkdir(parents=True,exist_ok=True)
    binaries={p.name:sha(p) for p in (LAB/'desktop/build/install/desktop/lib').glob('*.jar') if p.name.startswith(('core-','desktop-')) or p.name in ('core.jar','desktop.jar')}
    for style in styles:
        for mode in modes:
            name=f'{run}-{style}-{MODES[mode]}';folder=dest/name
            if (folder/'result.json').exists(): print('cached',name,flush=True);continue
            log=dest/(name+'.txt')
            with log.open('w') as f:
                p=subprocess.run(['java','-cp',str(LAB/'desktop/build/install/desktop/lib/*'),'dev.deathride.artlab.DesktopLauncher',str(mode),str(style),run],cwd=LAB/'desktop',stdout=f,stderr=subprocess.STDOUT,timeout=120,creationflags=subprocess.CREATE_NO_WINDOW)
            if p.returncode:raise RuntimeError(log.read_text())
            source=LAB/'desktop/artlab-output'/name
            if not (source/'result.json').exists():raise RuntimeError('no complete render result: '+name)
            shutil.copytree(source,folder)
            result=read_json(folder/'result.json');result['binary_sha256']=binaries;result['input_manifest_sha256']=sha(ART/'surface-lab/inputs.json');write_json(folder/'result.json',result);print(name,'p50',result['p50_ms'],'bytes',result['rgba_bytes'],flush=True)

def device(device,modes,styles,run,window_file='DEVICE-WINDOW.txt'):
    if not re.fullmatch(r'DEVICE-WINDOW(?:-\d+)?\.txt',window_file):raise ValueError('invalid window marker filename')
    window=ART/'surface-lab'/window_file
    if window.exists():
        raw=window.read_bytes();window_text=raw.decode('utf-16' if raw.startswith((b'\xff\xfe',b'\xfe\xff')) else 'utf-8-sig')
        if not re.search(r'^integration_device_window: available\s*$',window_text,re.M):raise RuntimeError('STICK_BUSY: handoff file does not grant an available window')
        expiry=re.search(r'^expires_utc:\s*(\S+)\s*$',window_text,re.M)
        if expiry and datetime.now(timezone.utc)>=datetime.fromisoformat(expiry.group(1).replace('Z','+00:00')):raise RuntimeError('STICK_BUSY: handoff window expired')
    def adb(*args,binary=False):
        value=subprocess.check_output(['adb','-s',device,*args],timeout=45)
        return value if binary else value.decode(errors='replace')
    def foreground():
        value=adb('shell','dumpsys','activity','activities')
        match=re.search(r'mResumedActivity:.*?\s([\w.]+/[\w.]+)\s',value)
        return match.group(1) if match else None
    def integration_state():
        try:
            with urllib.request.urlopen('http://'+device.split(':')[0]+':8765/stats',timeout=3) as response:return json.load(response)
        except Exception:return None
    stats=integration_state();prior=foreground()
    if prior and prior.startswith('dev.deathride.tv/') and stats is None:
        raise RuntimeError('STICK_BUSY: integration foreground, idle state unavailable; no launch or install performed')
    # A separate package prevents replacement; it does not make foreground takeover harmless.
    if stats and stats.get('phase') in ('race','countdown') and not stats.get('paused'):
        raise RuntimeError('STICK_BUSY: integration race/countdown is active; no launch or install performed')
    common_dir=Path(subprocess.check_output(['git','rev-parse','--path-format=absolute','--git-common-dir'],text=True).strip())
    dest=ART/'surface-lab/device';dest.mkdir(parents=True,exist_ok=True)
    with file_lock(common_dir/'deathride-stick-5555.lock',timeout=1):
        apkdir=LAB/'android/build/outputs/apk/debug';meta=read_json(apkdir/'output-metadata.json')
        if meta['applicationId']!=PACKAGE:raise RuntimeError('refuse APK with non-lab package')
        apk=apkdir/meta['elements'][0]['outputFile']
        apk_hash=sha(apk)
        evidence={'started_at':now(),'device':device,'model':adb('shell','getprop','ro.product.model').strip(),'prior_activity':prior,'apk_sha256':apk_hash,'package':PACKAGE,'preflight_integration_phase':stats.get('phase') if stats else None,'runs':[],'requested_runs':len(styles)*len(modes),'status':'running','runner_sha256':sha(Path(__file__)),'coordination':'shared git-common-dir lease; refuse active race; abort if foreground changes; install only artlab'}
        before=adb('shell','dumpsys','package','dev.deathride.tv');(dest/(run+'-integration-package-before.txt')).write_text(before,encoding='utf-8')
        print(adb('install','-r',str(apk)),flush=True)
        try:
            for style in styles:
                for mode in modes:
                    name=f'{run}-{style}-{MODES[mode]}';folder=dest/name
                    if (folder/'result.json').exists(): print('cached',name,flush=True);continue
                    if sha(apk)!=apk_hash:raise RuntimeError('APK changed during measurement; stop before mixing binaries')
                    current=foreground()
                    if current and current!=prior and not current.startswith(PACKAGE+'/'):raise RuntimeError('STICK_BUSY: foreground taken by '+current)
                    # Recheck race immediately before the first lab takeover, not only at invocation.
                    if not current or not current.startswith(PACKAGE+'/'):
                        live=integration_state()
                        if live and live.get('phase') in ('race','countdown') and not live.get('paused'):raise RuntimeError('STICK_BUSY: race started after preflight')
                    adb('shell','am','force-stop',PACKAGE)
                    adb('shell','am','start','-n',PACKAGE+'/.LabActivity','--ei','mode',str(mode),'--ei','style',str(style),'--ez','auto','true','--es','run',run)
                    start=time.monotonic();pid='';mem=None;logs='';done=False
                    while time.monotonic()-start<100:
                        time.sleep(1)
                        current=foreground()
                        if current and not current.startswith(PACKAGE+'/'):raise RuntimeError('STICK_BUSY: lab lost foreground; discard interrupted timing')
                        if not pid:
                            try:pid=adb('shell','pidof',PACKAGE).strip()
                            except subprocess.CalledProcessError:continue
                        logs=adb('logcat','-d','-v','epoch','--pid='+pid,'-s','ArtLab:I','AndroidRuntime:E')
                        if 'READY' in logs and mem is None and time.monotonic()-start>10:mem=adb('shell','dumpsys','meminfo','--local',PACKAGE)
                        if 'RESULT artlab-output/'+name in logs:done=True;break
                        if 'FATAL EXCEPTION' in logs:raise RuntimeError(logs)
                    folder.mkdir(parents=True,exist_ok=True);(folder/'logcat.txt').write_text(logs,encoding='utf-8')
                    if not done:raise RuntimeError('no complete lab result; '+name)
                    remote='files/artlab-output/'+name+'/'
                    for f in ['result.json','scene.png']:(folder/f).write_bytes(adb('exec-out','run-as',PACKAGE,'cat',remote+f,binary=True))
                    # PSS is sampled during timed rendering, before PNG capture allocation.
                    (folder/'meminfo.txt').write_text(mem or 'not measured',encoding='utf-8')
                    result=read_json(folder/'result.json');match=re.search(r'TOTAL PSS:\s*(\d+)',mem or '') or re.search(r'^\s*TOTAL\s+(\d+)',mem or '',re.M)
                    result['pss_kib']=int(match.group(1)) if match else None;result['pss_basis']='single dumpsys during timed render, before screenshot encoding';result['apk_sha256']=apk_hash;result['input_manifest_sha256']=sha(ART/'surface-lab/inputs.json')
                    write_json(folder/'result.json',result);evidence['runs'].append({'name':name,'result_sha256':sha(folder/'result.json'),'screenshot_sha256':sha(folder/'scene.png')})
                    write_json(dest/(run+'-session.json'),evidence);print(name,'p50',result['p50_ms'],'PSS',result['pss_kib'],flush=True)
            evidence['status']='complete'
        except Exception as error:
            evidence['status']='interrupted';evidence['error']=str(error);raise
        finally:
            current=foreground();owned=bool(current and current.startswith(PACKAGE+'/'))
            adb('shell','am','force-stop',PACKAGE)
            if owned and prior:adb('shell','am','start','-n',prior)
            after=adb('shell','dumpsys','package','dev.deathride.tv');(dest/(run+'-integration-package-after.txt')).write_text(after,encoding='utf-8')
            def installation(text):return {k:re.findall(r'\b'+k+r'=([^\r\n]+)',text) for k in ['versionCode','versionName','firstInstallTime','lastUpdateTime','codePath']}
            evidence.update(finished_at=now(),restored_prior_activity=owned and bool(prior),integration_installation_unchanged=installation(before)==installation(after))
            write_json(dest/(run+'-session.json'),evidence)

def main():
    p=argparse.ArgumentParser();p.add_argument('--device');p.add_argument('--modes',default=','.join(map(str,range(len(MODES)))));p.add_argument('--styles',default='0');p.add_argument('--run',default='v3-a');p.add_argument('--wait-idle-seconds',type=int,default=0);p.add_argument('--window-file',default='DEVICE-WINDOW.txt');a=p.parse_args()
    modes=[int(v) for v in a.modes.split(',')];styles=[int(v) for v in a.styles.split(',')]
    if any(v<0 or v>=len(MODES) for v in modes) or any(v not in range(3) for v in styles):raise ValueError('invalid mode/style')
    if a.device:
        if a.wait_idle_seconds:
            deadline=time.monotonic()+a.wait_idle_seconds;quiet=0;observations=[]
            while time.monotonic()<deadline:
                try:
                    with urllib.request.urlopen('http://'+a.device.split(':')[0]+':8765/stats',timeout=3) as response:state=json.load(response)
                    idle=state.get('phase') not in ('race','countdown') or state.get('paused') is True
                    observations.append({'at':now(),'phase':state.get('phase'),'paused':state.get('paused'),'idle':idle})
                except Exception:idle=False;observations.append({'at':now(),'idle':False,'state':'unavailable'})
                quiet=quiet+1 if idle else 0
                write_json(ART/'surface-lab/device-idle-observations.json',observations)
                if quiet>=4:break
                print('Waiting for 60-second idle integration window:',observations[-1],flush=True);time.sleep(20)
            if quiet<4:raise RuntimeError('STICK_BUSY: idle window not obtained; no install/launch performed')
        device(a.device,modes,styles,a.run,a.window_file)
    else:desktop(modes,styles,a.run)

if __name__=='__main__':main()
