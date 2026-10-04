"""Summarize the desktop log, preserving exact maxima and explicit device provenance."""
import json, pathlib, re, sys
p=pathlib.Path(sys.argv[1]); raw=p.read_bytes()
text=raw.decode('utf-16') if raw.startswith(b'\xff\xfe') else raw.decode('utf-8',errors='replace')
rows=[]; audit=None
for line in text.splitlines():
    if line.startswith('DeathRide {'):
        rows.append(json.loads(line[len('DeathRide '):]))
    if line.startswith('DeathRide timed desktop run complete; '):
        rows.append(json.loads(line.split('; ',1)[1]))
    if line.startswith('DeathRide allocationAudit '):
        audit=json.loads(line[len('DeathRide allocationAudit '):])
assert rows, 'No measurements in log'
first=next((r for r in rows if r['uptimeMs']>=60000),rows[0])
last=rows[-1]
result={'device':'Windows 11 desktop, NVIDIA GeForce RTX 4090; NOT Fire TV','outputPixels':'1920x1080','load':'six AI cars; repeated countdown/race/results/rematch; no phones in this soak','completed':'BUILD SUCCESSFUL' in text and last['uptimeMs']>=899000,'durationSeconds':last['uptimeMs']/1000,'raceStarts':text.count('DeathRide race countdown'),'minute1':first,'minute15':last,'allocationAudit':audit,'logWindows':len(rows)}
target=p.with_name('soak-summary.json');target.write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps({'completed':result['completed'],'durationSeconds':result['durationSeconds'],'raceStarts':result['raceStarts'],'minute1FrameMs':first['frameTimeMs']['last10s'],'minute15FrameMs':last['frameTimeMs']['last10s'],'lifetimeFrameMs':last['frameTimeMs']['sinceStart'],'allocationAudit':audit},indent=2))
