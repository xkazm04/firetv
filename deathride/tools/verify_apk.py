"""Static package inspection only; never connects to a device."""
import json, os, pathlib, subprocess, sys, zipfile, hashlib
apk, app_id, label = sys.argv[1:4]
sdk = pathlib.Path(os.environ['ANDROID_HOME'])
folders = sorted((sdk/'build-tools').iterdir(), key=lambda p: tuple(int(x) for x in p.name.split('.') if x.isdigit()))
aapt = folders[-1]/('aapt.exe' if os.name == 'nt' else 'aapt')
badging = subprocess.check_output([str(aapt), 'dump', 'badging', apk], text=True, encoding='utf-8')
assert "package: name='"+app_id+"'" in badging
assert "application-label:'"+label+"'" in badging
assert "uses-feature: name='android.hardware.touchscreen'" not in badging
with zipfile.ZipFile(apk) as z:
    names=z.namelist()
    abis=['arm64-v8a','armeabi-v7a','x86_64']
    for abi in abis: assert f'lib/{abi}/libgdx.so' in names, abi
    assert 'assets/index.html' in names
    assert 'assets/manifest.webmanifest' in names
manifest = subprocess.check_output([str(aapt),'dump','xmltree',apk,'AndroidManifest.xml'],text=True,encoding='utf-8')
assert 'android.intent.category.LEANBACK_LAUNCHER' in manifest
assert 'android.permission.INTERNET' in manifest
result={'applicationId':app_id,'label':label,'nativeAbis':abis,'leanback':True,'touchscreenRequired':False,'controllerAssets':True,'apkBytes':pathlib.Path(apk).stat().st_size,'sha256':hashlib.sha256(pathlib.Path(apk).read_bytes()).hexdigest(),'deviceLaunch':'not measured'}
print(json.dumps(result,indent=2))
