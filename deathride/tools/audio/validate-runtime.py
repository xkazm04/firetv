"""Required build gate and installed-content evidence, without device claims."""
from pathlib import Path
import hashlib
import json
import subprocess
import sys
import xml.etree.ElementTree as ET
import zipfile
from datetime import datetime, timezone

base=Path('audio/x3/runtime');base.mkdir(parents=True,exist_ok=True)
command=['cmd.exe','/d','/c',str(Path('gradlew.bat').resolve()),':core:test',':link:test',':game:test',':app:assembleDebug','--console=plain']
if '--build' in sys.argv:
    with (base/'build.log').open('wb') as log:
        result=subprocess.run(command,stdout=log,stderr=subprocess.STDOUT)
    if result.returncode:
        print((base/'build.log').read_text(encoding='utf-8',errors='replace')[-6000:])
        raise SystemExit(result.returncode)
tests={}
for module in ['core','link','game']:
    suites=[ET.parse(p).getroot() for p in Path(module+'/build/test-results/test').glob('TEST-*.xml')]
    assert suites,'Missing test evidence: '+module
    tests[module]={k:sum(int(s.attrib.get(k,0)) for s in suites) for k in ['tests','failures','errors','skipped']}
    assert tests[module]['failures']==tests[module]['errors']==0
apk=Path('app/build/outputs/apk/debug/app-debug.apk')
manifest=json.loads(Path('assets/audio/cues.json').read_text())
with zipfile.ZipFile(apk) as bundle:
    paths={r['path']:r for r in manifest['cues'] if r['path']}
    for path,row in paths.items():
        data=bundle.read('assets/'+path)
        assert hashlib.sha256(data).hexdigest()==row['sha256'],path
    assert not any('/x3/' in p or '/audition/' in p for p in bundle.namelist()),'Auditions must not ship'
    assert json.loads(bundle.read('assets/audio/cues.json'))==manifest
native=json.loads((base/'desktop-audio.json').read_text()) if (base/'desktop-audio.json').exists() else None
report=dict(at=datetime.now(timezone.utc).isoformat(),command=command,result='pass',tests=tests,
            apk=str(apk),apkBytes=apk.stat().st_size,apkSha256=hashlib.sha256(apk.read_bytes()).hexdigest(),
            installedAudioFiles=len(paths),decodedAudioBytes=sum(r['decodedBytes'] for r in paths.values()),
            nativeHost=native,physicalStick='not measured: adb devices has no attached device',
            phoneHaptics='controller vibration code unchanged; audio service has no haptic API')
(base/'validation.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8',newline='\n')
print(json.dumps(report))

