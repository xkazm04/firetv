"""Install the campaign APK and explicitly funded diagnostic profiles on the scanned Stick."""
import hashlib,json,re,subprocess,sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
address=sys.argv[1];assert re.fullmatch(r'10\.0\.0\.\d+',address)
device=address+':5555';pkg='dev.deathride.campaign';out=root/'evidence/campaign/q4';out.mkdir(exist_ok=True)
discovery=json.loads((out/'discovery.json').read_text());assert address in discovery['reachable'] and discovery['port']==5555
apk=root/'app/build/outputs/apk/debug/app-debug.apk'
def run(args,**kw):return subprocess.check_output(args,creationflags=subprocess.CREATE_NO_WINDOW,timeout=120,**kw)
def adb(*args,**kw):return run(['adb','-P','5041','-s',device,*args],**kw)
manifest=run(['C:/Users/kazda/scoop/apps/android-clt/current/build-tools/36.1.0/aapt.exe','dump','badging',str(apk)],text=True)
assert re.search(r"package: name='dev.deathride.campaign'",manifest)
(out/'apk-manifest.txt').write_text(manifest,encoding='utf-8')
run(['adb','-P','5041','connect',device],text=True)
def package_identity(name):
    try:paths=adb('shell','pm','path',name,text=True).strip()
    except subprocess.CalledProcessError as error:
        if error.returncode==1 and not error.output.strip():paths=''
        else:raise
    hashes=[adb('shell','sha256sum',line.removeprefix('package:'),text=True).strip() for line in paths.splitlines() if line.startswith('package:')]
    return {'paths':paths,'hashes':hashes}
protected=package_identity('dev.deathride.tv')
before=package_identity(pkg)
result=adb('install','-r',str(apk),text=True);assert 'Success' in result
adb('shell','am','force-stop',pkg)
adb('shell','run-as',pkg,'mkdir','-p','files/profiles')
fixtures={}
for profile in ['campaign-stick-boss','campaign-stick-finale','campaign-stick-guest']:
    data=(root/'build/reports/campaign/q3/device-q4'/f'{profile}.sav').read_bytes()
    if '--preserve-profiles' not in sys.argv:adb('shell','run-as',pkg,'sh','-c',f'"cat > files/profiles/{profile}.sav"',input=data)
    saved=adb('exec-out','run-as',pkg,'cat',f'files/profiles/{profile}.sav')
    if '--preserve-profiles' not in sys.argv:assert saved==data
    fixtures[profile]=hashlib.sha256(saved).hexdigest()
after=package_identity(pkg);sha=hashlib.sha256(apk.read_bytes()).hexdigest();assert any(h.startswith(sha) for h in after['hashes'])
assert package_identity('dev.deathride.tv')==protected
record={'applicationId':pkg,'device':device,'model':adb('shell','getprop','ro.product.model',text=True).strip(),'localApkSha256':sha,'installed':after,'previousCampaign':before,'protectedTvUnchanged':True,'protectedTv':protected,'fixtures':fixtures,'fixtureScope':'Funded legal menu/race fixtures, not earned progression','result':result}
(out/'installation.json').write_text(json.dumps(record,indent=2),encoding='utf-8')
(out/f'installation-{sha[:12]}.json').write_text(json.dumps(record,indent=2),encoding='utf-8')
print(json.dumps(record,indent=2))
