"""Audit the narrow, inactive elimination-only differences between ordinary-study snapshots."""
from pathlib import Path
import csv,hashlib,json,re,subprocess,difflib

root=Path(__file__).resolve().parents[1];runs=root/'build/campaign-v2-runtime'
old=json.loads((runs/'ai-z3-lane/provenance.json').read_text())['sha256']
new=json.loads((runs/'ai-z3-balanced/provenance.json').read_text())['sha256']
keys={k for k in old|new if k.startswith(('4/','5/'))}
changed=sorted(k for k in keys if old.get(k)!=new.get(k))
expected=['4/dev/deathride/core/AiBehaviour.class','4/dev/deathride/core/AiCatalog.class','4/dev/deathride/core/AiControls.class','4/dev/deathride/core/RacePhase.class','5/data/ai-bosses.csv','5/data/ai-control-rules.csv']
assert changed==expected,changed
bytecode=[];damage_diff=[]
for file in changed:
    if not file.endswith('.class'):continue
    name=file[2:-6].replace('/','.')
    code=[]
    for snapshot in ('ai-z3-lane','ai-z3-balanced'):
        disassembly=subprocess.check_output(['javap','-classpath',str(runs/snapshot/'4'),'-c','-p',name],text=True,creationflags=subprocess.CREATE_NO_WINDOW)
        code.append(re.sub(r'#\d+','#REF',disassembly))
    if name.endswith('.AiBehaviour'):
        damage_diff=list(difflib.unified_diff(code[0].splitlines(),code[1].splitlines(),fromfile='lane',tofile='balanced',lineterm=''))
        pattern=r'(?s)  public final void onDamage\(int, int, double\);\n.*?(?=\n  public final void afterStep)'
        assert all(re.search(pattern,c) for c in code)
        code=[re.sub(pattern,'  ON_DAMAGE_AUDITED_SEPARATELY',c) for c in code]
    assert code[0]==code[1],f'Unexpected executable change: {name}'
    bytecode.append(dict(className=name,codeUnchangedOutsideEliminationRecovery=True))
def table(snapshot,file):return list(csv.DictReader((runs/snapshot/'5/data'/file).open()))
boss_old=table('ai-z3-lane','ai-bosses.csv');boss_new=table('ai-z3-balanced','ai-bosses.csv')
assert [{k:v for k,v in r.items()} for r in boss_old if r['id']!='marrow']==[r for r in boss_new if r['id']!='marrow']
assert [r for r in boss_old if r['id']=='marrow']==[dict(id='marrow',healthMultiplier='1.25')]
assert [r for r in boss_new if r['id']=='marrow']==[dict(id='marrow',healthMultiplier='1.05')]
controls_old=table('ai-z3-lane','ai-control-rules.csv');controls_new=table('ai-z3-balanced','ai-control-rules.csv')
assert controls_new==controls_old+[dict(key='duelHitRecoveryScale',value='0.1')]
source=(root/'core/src/main/kotlin/dev/deathride/core/AiBehaviour.kt').read_text()
assert 'if(world.eventType==EventType.ELIMINATION)AiControls["duelHitRecoveryScale"] else 1.0' in source
events=table('ai-z3-balanced','campaign.csv')
assert all(r['type']=='LAPS' for r in events[:34]) and events[34]['type']=='ELIMINATION'
report=dict(changed=changed,allowlistPass=True,bytecode=bytecode,
    scope='Ordinary campaign events 1–34 and unnamed stock/developed roster studies only. Their recovery multiplier remains exactly 1.0; no ordinary event makes Marrow a boss. Duels are freshly run on balanced bytes.',
    replayRequirement='Final-core campaign replay must match 34 event hashes; two-seed full roster/rotation-case replay must match every selected full-study row. Replays are not additional samples.')
out=root/'evidence/ai/z3';(out/'ordinary-reuse-audit.json').write_text(json.dumps(report,indent=2)+'\n')
(out/'ordinary-bytecode-diff.txt').write_text('\n'.join(damage_diff)+'\n')
for name in ('ai-z1-before','ai-z3-lane','ai-z3-duel-probes','ai-z3-balanced'):
    (out/f'{name}-provenance.json').write_bytes((runs/name/'provenance.json').read_bytes())
print(json.dumps(report,indent=2))
