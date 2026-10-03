"""Fresh isolated desktop host for each existing controller check; no ADB operations."""
import os
from pathlib import Path
import re
import socket
import shutil
import subprocess
import sys
import time

root=Path(__file__).resolve().parents[1]
os.chdir(root)
output=Path(sys.argv[1] if len(sys.argv)>1 else 'evidence/hud/h2/browser-suite');output.mkdir(parents=True,exist_ok=True)
env={**os.environ,'CHROME_EXECUTABLE':os.environ.get('CHROME_EXECUTABLE','C:/Program Files/Google/Chrome/Application/chrome.exe'),'DEATHRIDE_TEST_STREAM':'hud'}
checks=sys.argv[2:] or ['browser-check','combat-check','ability-controller-check','hud-browser-check']
port=int(os.environ.get('DEATHRIDE_BROWSER_PORT','8768'))
for name in checks:
    if name=='campaign-browser-check':
        (root/'profiles').mkdir(exist_ok=True)
        shutil.copyfile(root/'core/build/reports/campaign/q1-fixture.sav',root/'profiles/campaign-probe-q1.sav')
    if name=='duel-browser-check':
        (root/'profiles').mkdir(exist_ok=True)
        for source,target in [('q2-fixture','campaign-probe-q2'),('q2-guest','campaign-guest-q2')]:
            shutil.copyfile(root/f'core/build/reports/campaign/{source}.sav',root/f'profiles/{target}.sav')
    with socket.socket() as sock:assert sock.connect_ex(('127.0.0.1',port))!=0,'Refuse an occupied listener'
    log=output/(name+'-host.log')
    with log.open('w',encoding='utf-8') as hostlog:
        host=subprocess.Popen(['java','-cp','desktop/build/install/desktop/lib/*','dev.deathride.desktop.LauncherKt','--hidden','--1080',f'--port={port}','--duration=600'],stdout=hostlog,stderr=subprocess.STDOUT,creationflags=subprocess.CREATE_NO_WINDOW)
        try:
            pin=None
            for _ in range(150):
                match=re.search(r'pin=(\d+)',log.read_text(encoding='utf-8',errors='replace'))
                if match:pin=match[1];break
                assert host.poll() is None,'Desktop exited before pairing'
                time.sleep(.1)
            assert pin,'Pairing timeout'
            target=output/name;target.mkdir(exist_ok=True)
            runenv={**env,'BROWSER_OUTPUT':str(target/'result.json'),'BROWSER_SCREENSHOT':str(target/'controller.png'),'COMBAT_OUTPUT':str(target)}
            args=['node','tools/'+name+'.mjs',f'http://127.0.0.1:{port}',pin]
            if name in ['ability-controller-check','hud-browser-check','campaign-browser-check','duel-browser-check']:args.append(str(target))
            with (output/(name+'.log')).open('w',encoding='utf-8') as runlog:
                result=subprocess.run(args,env=runenv,stdout=runlog,stderr=subprocess.STDOUT,timeout=240,creationflags=subprocess.CREATE_NO_WINDOW)
            assert result.returncode==0,name+' failed; inspect '+str(output/(name+'.log'))
            print(name,'PASS',flush=True)
        finally:
            host.terminate();host.wait(timeout=15)
