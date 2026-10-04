from pathlib import Path
import csv,json
root=Path(__file__).resolve().parents[1]
def read(path):return list(csv.DictReader(path.open()))
full=read(root/'build/reports/ai/z3/ai-z3-roster/roster.csv')
replay=read(root/'build/reports/ai/z3/ai-z3-roster-replay/roster.csv')
key=lambda r:tuple(r[k] for k in ('tier','course','build','rotation','sample'))
index={key(r):r for r in full}
assert len(replay)==360
assert all(r==index[key(r)] for r in replay)
out=root/'evidence/ai/z3/roster-final-core-replay.json'
out.write_text(json.dumps(dict(checked=len(replay),identicalRows=True,scope='Two paired seeds across every tier/course/build/grid rotation; exact full-row comparison, not extra independent samples.'),indent=2)+'\n')
print('Exact final-core roster rows:',len(replay))
