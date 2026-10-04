"""Fresh HUD-only device process for each ordinary browser/probe check."""
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import time
import urllib.request

root=Path(__file__).resolve().parents[1];os.chdir(root)
base,output,*checks=sys.argv[1:]
assert base.startswith('http://') and base.endswith(':8768')
device=base.removeprefix('http://').split(':')[0]+':5555'
output=Path(output);output.mkdir(parents=True,exist_ok=True)
env={**os.environ,'CHROME_EXECUTABLE':os.environ.get('CHROME_EXECUTABLE','C:/Program Files/Google/Chrome/Application/chrome.exe'),'DEATHRIDE_TEST_STREAM':'hud','PROBE_DEVICE':device,'PROBE_MINES':'1','PROBE_ADB_PORT':'5039'}
def adb(*args):
    return subprocess.check_output(['adb','-P','5039','-s',device,*args],text=True,creationflags=subprocess.CREATE_NO_WINDOW,timeout=30)
def restart():
    subprocess.run(['adb','-P','5039','connect',device],check=True,creationflags=subprocess.CREATE_NO_WINDOW,timeout=30)
    adb('shell','input','keyevent','KEYCODE_WAKEUP')
    adb('shell','am','force-stop','dev.deathride.hud')
    adb('shell','am','start','-n','dev.deathride.hud/dev.deathride.tv.MainActivity')
    for _ in range(60):
        time.sleep(.5)
        pid=adb('shell','pidof','dev.deathride.hud').strip()
        if not pid:continue
        pins=re.findall(r'pairing http[^\n]*pin=(\d+)',adb('logcat','-d','--pid='+pid,'-s','DeathRide:I'))
        if pins:
            try:
                with urllib.request.urlopen(base+'/stats',timeout=3) as response:s=json.load(response)
                if s['sceneryReady']:return pins[-1]
            except OSError:pass
    raise RuntimeError('HUD listener failed to start')
for name in checks or ['browser-check','combat-check','ability-controller-check','hud-browser-check']:
    pin=restart();target=output/name;target.mkdir(exist_ok=True)
    runenv={**env,'BROWSER_OUTPUT':str(target/'result.json'),'BROWSER_SCREENSHOT':str(target/'controller.png'),'COMBAT_OUTPUT':str(target)}
    if name in ['visual','timing']:
        runenv.update(PROBE_SCREENSHOTS='1' if name=='visual' else '0',PROBE_ROTATE_FIRST='1' if name=='visual' else '0',PROBE_PRIORITY='Normal' if name=='visual' else 'AboveNormal')
        args=['node','tools/ability-stick-probe.mjs',base,pin,str(target/'raw.json'),'720' if name=='visual' else '900'];timeout=1100
    else:
        args=['node','tools/'+name+'.mjs',base,pin];timeout=300
        if name in ['ability-controller-check','hud-browser-check','hud-header-check']:args.append(str(target))
    with (output/(name+'.log')).open('w',encoding='utf-8') as log:
        done=subprocess.run(args,env=runenv,stdout=log,stderr=subprocess.STDOUT,creationflags=subprocess.CREATE_NO_WINDOW,timeout=timeout)
    print(name,'PASS' if done.returncode==0 else 'FAIL: inspect retained log',flush=True)
    if done.returncode and name!='visual':sys.exit(done.returncode)
