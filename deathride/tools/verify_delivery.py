"""Read-only final structure, source isolation and APK/source asset checks."""
from pathlib import Path
import hashlib, json, re, zipfile
from html.parser import HTMLParser
from urllib.parse import unquote

root=Path(__file__).resolve().parents[2]
project=root/'project'
for relative in ['index.html','NOTES.md','deathride.apk','project/gradlew','project/gradlew.bat','project/gradle/wrapper/gradle-wrapper.jar','project/gradle/wrapper/gradle-wrapper.properties']:
    assert (root/relative).is_file(), relative
forbidden={'build','.gradle','.idea','.kotlin','node_modules','__pycache__'}
bad=[str(p.relative_to(project)) for p in project.rglob('*') if (p.is_dir() and p.name in forbidden) or p.name=='local.properties']
assert not bad, bad
for file in (project/'core/src').rglob('*.kt'):
    assert not re.search(r'^\s*import\s+(android\.|com\.badlogic\.gdx)',file.read_text(),re.M),file
notes=(root/'NOTES.md').read_text(encoding='utf-8'); assert len(notes.split())<400
for heading in ['## The bets','## How it feels','## Verified vs not measured','## Known limits']: assert heading in notes
metadata=json.loads((root/'evidence/apk-check.json').read_text(encoding='utf-8-sig'))
assert hashlib.sha256((root/'deathride.apk').read_bytes()).hexdigest()==metadata['sha256']
with zipfile.ZipFile(root/'deathride.apk') as apk:
    for file in ['index.html','manifest.webmanifest']:
        assert apk.read('assets/'+file)==(project/'controller'/file).read_bytes(), file+' source differs from delivered APK'
    for abi in ['arm64-v8a','armeabi-v7a','x86_64']: assert 'lib/'+abi+'/libgdx.so' in apk.namelist()
assert json.loads((root/'evidence/report-check.json').read_text())['pass']
class Links(HTMLParser):
    def __init__(self): super().__init__(); self.links=[]
    def handle_starttag(self,tag,attrs):
        if tag=='a':
            for key,value in attrs:
                if key=='href' and value and not value.startswith(('#','http:','https:')): self.links.append(value)
links=Links(); links.feed((root/'index.html').read_text(encoding='utf-8'))
for link in links.links:
    target=(root/unquote(link.split('#')[0])).resolve()
    assert target.is_relative_to(root) and target.exists(),link

assert json.loads((root/'evidence/soak-summary.json').read_text())['completed']
sources={str(p.relative_to(project)).replace('\\','/'):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(project.rglob('*')) if p.is_file() and p.suffix in {'.kt','.kts','.xml','.properties','.html','.webmanifest','.jar','.bat'}}
result={'pass':True,'apkSha256':metadata['sha256'],'apkControllerMatchesSource':True,'sourceFilesHashed':len(sources),'noGeneratedDirectories':True,'notesWords':len(notes.split()),'localReportLinksChecked':len(links.links),'sourceSha256':sources}
(root/'evidence/delivery-check.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in result.items() if k!='sourceSha256'},indent=2))
