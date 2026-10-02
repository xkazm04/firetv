"""Full post-merge replay matrix, independent strict audit, and exact A3 comparison."""
import csv
import gzip
import json
from pathlib import Path
import subprocess
import os

root=Path(__file__).resolve().parents[1];os.chdir(root)
out=root/'evidence/hud/h3';out.mkdir(parents=True,exist_ok=True)
classpath=(root/'core/build/report-classpath.txt').read_text()
for part,samples,baseline in [('roster',2000,200),('early',2000,2000),('rotation',200,0)]:
    with (out/('balance-'+part+'.log')).open('w') as log:
        subprocess.run(['java','-Djava.util.concurrent.ForkJoinPool.common.parallelism=4','-Xmx1g','-cp',classpath,'dev.deathride.core.AbilityReportKt',str(samples),str(baseline),part,'hud-final','all','abilities/acceptance-v2'],stdout=log,stderr=subprocess.STDOUT,check=True,creationflags=subprocess.CREATE_NO_WINDOW|subprocess.BELOW_NORMAL_PRIORITY_CLASS)
    print(part,'complete',flush=True)
report=root/'core/build/reports/abilities/hud-final'
with (out/'balance-audit.log').open('w') as log:subprocess.run(['python','tools/audit-abilities.py',str(report),'--strict'],stdout=log,stderr=subprocess.STDOUT,check=True)
comparison=[]
for file in sorted(report.glob('*.csv')):
    with gzip.open(root/'evidence/abilities/a3/balance'/(file.name+'.gz'),'rt') as stream:old={r['seed']:r for r in csv.DictReader(stream)}
    with file.open() as stream:rows=list(csv.DictReader(stream))
    assert len(rows)==len(old),file.name
    changed=[r['seed'] for r in rows if r!=old[r['seed']]]
    comparison.append({'cell':file.stem,'races':len(rows),'changedRows':changed})
assert len(comparison)==78 and sum(r['races'] for r in comparison)==66000
(out/'balance-comparison.json').write_text(json.dumps({'cells':comparison,'races':66000,'identical':not any(r['changedRows'] for r in comparison),'basis':'All CSV fields per seed, not only class winners; A3 accepted final archive'},indent=2)+'\n')
subprocess.run(['python','tools/archive-abilities.py',str(report),str(out/'balance')],check=True)
print('Strict audit and exact comparison complete',flush=True)
