"""Extend the common frame/latency summary with declared I2 texture/PSS limits."""
import json, statistics, subprocess, sys
from pathlib import Path
p=Path(sys.argv[1] if len(sys.argv)>1 else 'evidence/phase2/i2-soak.json')
subprocess.run([sys.executable,str(Path(__file__).with_name('summarize_stick_soak.py')),str(p)],check=True,stdout=subprocess.DEVNULL)
raw=json.loads(p.read_text(encoding='utf-8'));target=p.with_name(p.stem+'-summary.json');out=json.loads(target.read_text(encoding='utf-8'))
samples=raw['thermals'];warm=samples[1:];first=statistics.median(t['pssKb'] for t in warm[:3]);last=statistics.median(t['pssKb'] for t in warm[-3:])
x=[t['second']/60 for t in warm];y=[t['pssKb']/1024 for t in warm];xm=statistics.mean(x);ym=statistics.mean(y)
slope=sum((a-xm)*(b-ym) for a,b in zip(x,y))/sum((a-xm)**2 for a in x)
art=[w['stats']['art'] for w in raw['windows']]
active=[w['stats']['frameTimeMs']['last10s'] for w in raw['windows'] if w['fullRace']]
out['memoryBudget']=dict(method='dumpsys meminfo --local dev.deathride.tv',limitMiB=192,growthLimitMiB=8,
    minimumMiB=min(t['pssKb'] for t in samples)/1024,maximumMiB=max(t['pssKb'] for t in samples)/1024,
    firstThreeWarmMedianMiB=first/1024,lastThreeWarmMedianMiB=last/1024,medianGrowthMiB=(last-first)/1024,
    warmLinearTrendMiBPerMinute=slope,withinLimit=all(0<t['pssKb']<=192*1024 for t in samples),growthWithinLimit=last-first<=8*1024)
out['textures']=dict(artLimitMiB=32,ownedLimitMiB=52,allWithinLimit=all(a['budgetOk'] for a in art),
    maximumArtMiB=max(a['textureBytes'] for a in art)/1048576,maximumOwnedMiB=max(a['ownedTextureBytes'] for a in art)/1048576,
    final=raw['final']['art'],drawsDuringLoad=raw['final']['art']['draws']-raw['initial']['art']['draws'])
out['frameTargets']=dict(activeP50RangeMs=[min(w['p50'] for w in active),max(w['p50'] for w in active)],
    activeMediansNear16_7=all(16<=w['p50']<=18 for w in active),activeMaxWithin33=all(w['max']<=33 for w in active),
    activeP95WithinOriginal16_7=all(w['p95']<=16.7 for w in active),activeP95WithinG1_21_60=all(w['p95']<=21.60 for w in active))
target.write_text(json.dumps(out,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:out[k] for k in ['completed','checksPassed','memoryBudget','textures','frameTargets','allWindows','activeWindows']},indent=2))
