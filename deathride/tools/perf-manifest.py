"""Seal settled evidence, source bytes and local frozen APK identities."""
import datetime,hashlib,json,subprocess
from pathlib import Path
root=Path('..').resolve();base=root/'deathride/evidence/perf'
def item(p):return {'path':p.relative_to(root).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
def listed(prefix):
 text=subprocess.check_output(['git','-C',str(root),'ls-files','--cached','--others','--exclude-standard','--',prefix]).decode()
 return sorted(set(root/s for s in text.splitlines() if (root/s).is_file()))
stamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
waveFiles=[p for p in listed('deathride/evidence/perf/p8') if p.name!='manifest.json']
(base/'p8/manifest.json').write_text(json.dumps({'generatedUtc':stamp,'scope':'P8 completed experiments; diagnostic observers are identified per run.','files':[item(p) for p in waveFiles]},indent=2)+'\n')
files=[p for p in listed('deathride/evidence/perf') if p!=base/'manifest.json']
sources=[]
for prefix in ['deathride/app/src','deathride/game/src','deathride/link/src','deathride/core/src','deathride/controller','deathride/gradle.properties']:
 sources+=listed(prefix)
documents=[root/'docs/concepts/DEATH-RIDE-PERF.md',root/'deathride/OWNER-CHECKS.md',root/'docs/concepts/deathride/PERF-REPORT.md',root/'docs/concepts/deathride/PERF-SESSION.md',root/'docs/concepts/deathride/PITFALLS.md']
documents+=list((root/'docs/concepts/deathride').glob('P[0-8]-*.md'))
conclusion=json.loads((base/'conclusion.json').read_text())
result={'generatedUtc':stamp,'branch':subprocess.check_output(['git','-C',str(root),'branch','--show-current']).decode().strip(),
 'qualification':conclusion['qualification'],'tests':json.loads((base/'final/tests.json').read_text()),
 'files':[item(p) for p in files],'runtimeAndTestSources':[item(p) for p in sorted(set(sources))],
 'documents':[item(p) for p in sorted(set(documents))],
 'localApks':[dict(**item(p),tracked=False) for p in sorted(base.rglob('*.apk'))],
 'limits':'APK files are frozen local artifacts, not committed binaries. Raw JSON/trace bodies are retained as exact gzip; summaries bind original bytes. This manifest excludes itself.'}
(base/'manifest.json').write_text(json.dumps(result,indent=2)+'\n');print('sealed',len(files),'evidence files,',len(sources),'source files,',len(result['localApks']),'local APKs')
