"""Required pre-commit checks; no device actions."""
import argparse
from pathlib import Path
import subprocess
import sys
from common import ART, ROOT, now, read_json, sha, write_json
from validate_bundle import validate
from agy_provider import AgyBudget

def main(wave):
    start=read_json(ART/'audits/agy-start.json')
    assert sha(ART/'usage.json')==start['grok_usage_sha256'],'Grok latch/usage changed'
    for name,expected in start['protected_hashes'].items():
        path=ROOT.parent/name
        if not path.exists():path=ROOT/name
        assert sha(path)==expected,('Protected file changed',name)
    commands=[('build',['cmd','/d','/c',str(ROOT/'gradlew.bat'),':core:test',':link:test',':game:test',':app:assembleDebug'],ROOT),
              ('art-tests',[sys.executable,'-m','unittest','discover','-s',str(ROOT/'tools/art'),'-p','test_*.py'],ROOT.parent)]
    for label,command,cwd in commands:
        with (ART/f'reports/{wave}-{label}.txt').open('w',encoding='utf-8') as log:
            result=subprocess.run(command,cwd=cwd,stdout=log,stderr=subprocess.STDOUT)
        if result.returncode:raise RuntimeError(label+' failed; see log')
        print(label,'pass',flush=True)
    for label,bundle in [('legacy','phase2-v1'),('active','phase2-states')]:validate(ROOT/'assets'/bundle,ART/f'reports/{wave}-{label}-bundle.json')
    write_json(ART/f'reports/{wave}-checks.json',dict(at=now(),status='pass',protected_files=len(start['protected_hashes']),grok_latch_unchanged=True,agy=AgyBudget().summary(),device='untouched'))

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('wave',choices=['a0','a1','a2']);main(p.parse_args().wave)
