"""Run the isolated GLES heading experiment; retain raw evidence and restore activity."""
import argparse
import json
import re
import subprocess
import time
from common import ART,ROOT,now,sha,write_json,read_json

def run(device):
    folder=ART/'device';folder.mkdir(parents=True,exist_ok=True)
    def adb(*args,binary=False):
        out=subprocess.check_output(['adb','-s',device,*args],timeout=40)
        return out if binary else out.decode(errors='replace')
    before=adb('shell','dumpsys','activity','activities')
    resumed=re.search(r'mResumedActivity:.*?\s([\w.]+/[\w.]+)\s',before)
    prior=resumed.group(1) if resumed else None
    apkdir=ROOT/'tools/art/stick-probe/build/outputs/apk/debug'
    metadata=read_json(apkdir/'output-metadata.json');apk=apkdir/metadata['elements'][0]['outputFile']
    print(adb('install','-r',str(apk)),flush=True)
    evidence={'started_at':now(),'device':device,'model':adb('shell','getprop','ro.product.model').strip(),'apk_sha256':sha(apk),'prior_activity':prior,'scope':'six sprites in isolated GLES2 renderer; no gameplay, no soak, no owner taste','runs':[]}
    try:
        adb('shell','input','keyevent','224')
        for headings in (1,16,32):
            adb('shell','am','force-stop','dev.deathride.artprobe')
            adb('shell','am','start','-n','dev.deathride.artprobe/.ProbeActivity','--ei','headings',str(headings))
            start=time.monotonic();pid='';capture=False;result=None;logs=''
            while time.monotonic()-start<80:
                if not pid:
                    try:pid=adb('shell','pidof','dev.deathride.artprobe').strip()
                    except subprocess.CalledProcessError:pass
                if pid:
                    logs=adb('logcat','-d','-v','epoch','--pid='+pid,'-s','ArtProbe:I')
                    if 'READY' in logs and not capture and time.monotonic()-start>10:
                        (folder/f'headings-{headings}.png').write_bytes(adb('exec-out','screencap','-p',binary=True))
                        (folder/f'headings-{headings}-meminfo.txt').write_text(adb('shell','dumpsys','meminfo','--local','dev.deathride.artprobe'),encoding='utf-8')
                        capture=True
                    matches=re.findall(r'RESULT (\{[^\n]+\})',logs)
                    if matches:result=json.loads(matches[-1]);break
                time.sleep(1)
            (folder/f'headings-{headings}-logcat.txt').write_text(logs,encoding='utf-8')
            if result is None:raise RuntimeError('probe produced no complete timing result: '+str(headings))
            memory=(folder/f'headings-{headings}-meminfo.txt').read_text()
            pss=re.search(r'TOTAL PSS:\s*(\d+)',memory) or re.search(r'^\s*TOTAL\s+(\d+)',memory,re.M)
            result['pss_kib']=int(pss.group(1)) if pss else None
            result['screenshot']=f'headings-{headings}.png'
            evidence['runs'].append(result);write_json(folder/'heading-probe.json',evidence)
            print(result,flush=True)
    finally:
        current=adb('shell','dumpsys','activity','activities')
        still_probe=bool(re.search(r'mResumedActivity:.*dev.deathride.artprobe',current))
        adb('shell','am','force-stop','dev.deathride.artprobe')
        if still_probe and prior:adb('shell','am','start','-n',prior)
        evidence['finished_at']=now();evidence['restored_prior_activity']=still_probe and prior is not None
        write_json(folder/'heading-probe.json',evidence)

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('device');a=p.parse_args();run(a.device)
