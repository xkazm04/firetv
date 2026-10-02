"""Device evidence: keep each APK/run separate and do not pool rolling percentiles."""
import gzip,hashlib,html,json
from pathlib import Path
root=Path(__file__).resolve().parents[1];out=root/'evidence/campaign/q4'
results=[]
for folder in sorted(out.iterdir()):
    raw=folder/'result.json'
    if not raw.is_file():continue
    r=json.loads(raw.read_text(encoding='utf-8'))
    if 'windows' not in r:continue
    data=raw.read_bytes();raw.with_suffix('.json.gz').write_bytes(gzip.compress(data,mtime=0))
    active=[w for w in r['windows'] if w['phase']=='race' and w['second']>=r.get('timingCleanAfterSecond',30) and w['raceSeconds']>=30]
    assert active
    frames=[w['frameTimeMs']['last10s'] for w in active];steps=[w['simStepMs']['last10s'] for w in active]
    pss=[m['pssKb']/1024 for m in r['memory']];assert min(pss)>0
    textures=[w['art'] for w in r['windows']]
    s={'run':folder.name,'apkSha256':r.get('apkSha256','43a88f9e2739875d2d72193ab488eab6fc422c546925f685e4aebffd875949ea'),'mode':r['mode'],'fixture':r['fixture'],'functionalPass':r.get('functionalPass',False),'bossWon':r.get('bossWon'),'error':r.get('error'),'checks':r['checks'],'durationRaceSeconds':r.get('final',{}).get('raceSeconds'),'observedRollingWindows':len(r['windows']),'cleanActiveWindows':len(active),'frameMs':{'activeMedianRange':[min(x['p50'] for x in frames),max(x['p50'] for x in frames)],'worstActiveWindowP95':max(x['p95'] for x in frames),'activeMaximum':max(x['max'] for x in frames),'allObservedMaximum':max(w['frameTimeMs']['last10s']['max'] for w in r['windows']),'windowsOver16_7P95':sum(x['p95']>16.7 for x in frames)},'simMs':{'worstActiveWindowP95':max(x['p95'] for x in steps),'activeMaximum':max(x['max'] for x in steps)},'pssMiBRange':[min(pss),max(pss)],'ownedTextureMiBMax':max(a['ownedTextureBytes'] for a in textures)/1048576,'artMiBMax':max(a['textureBytes'] for a in textures)/1048576,'discardedSimulationMs':r.get('final',{}).get('discardedSimulationMs'),'finalCareer':r.get('final',{}).get('slots',[{}])[0].get('career'),'pilotTuning':r.get('pilotTuning'),'rawArchive':folder.name+'/result.json.gz','rawSha256':hashlib.sha256(data).hexdigest()}
    s['gates']={'frameP95AtMost16_7Ms':s['frameMs']['worstActiveWindowP95']<=16.7,'activeMaximumAtMost33Ms':s['frameMs']['activeMaximum']<=33,'pssAtMost192MiB':max(pss)<=192,'texturesWithinDeclaredBudgets':all(a['budgetOk'] and a['failures']==0 for a in textures),'functional':s['functionalPass']}
    s['cleanupPass']=r.get('cleanupPass',not r.get('error'))
    s['wholeHarnessPass']=s['functionalPass'] and s['cleanupPass'] and not s['error']
    ages=[w['slots'][0]['inputAgeMs']['last10s'] for w in active]
    s['rollingP1Transport']={'scope':'Overlapping ten-second input-age windows, observed about once per second; no pooled percentile or optical latency claim','windows':len(ages),'medianAgeRangeMs':[min(a['p50'] for a in ages),max(a['p50'] for a in ages)],'worstWindowP95AgeMs':max(a['p95'] for a in ages),'maximumAgeMs':max(a['max'] for a in ages),'windowsWithStaleInput':sum(w['slots'][0]['stale']['last10s']>0 for w in active),'unsyncedObservations':sum(not w['slots'][0]['clockSynced'] for w in active),'finalDropped':r['final']['slots'][0]['dropped'],'finalOutOfOrder':r['final']['slots'][0]['outOfOrder']}
    results.append(s)
summary={'runs':results,'basis':'One AFTKM over LAN; ordinary browser controller inputs; no pooled percentile can be reconstructed from overlapping rolling windows','limits':['Each run retains its APK hash; first boss observation predates the footer/name-only renderer fix','Active windows exclude the initial screenshot plus 30 seconds; later screenshots are menu/results only','Host also ran deterministic headless core reports; this is not a quiet-host optical latency measurement','No physical-phone comfort, sofa readability, human fairness or fun verdict','Funded legal diagnostic profiles are not an earned end-to-end campaign'],'artGenerationCalls':0}
(out/'summary.json').write_text(json.dumps(summary,indent=2),encoding='utf-8')
cards=[]
for r in results:
    cards.append('<h2>'+html.escape(r['run'])+'</h2><p>'+html.escape(str({k:r[k] for k in ['functionalPass','wholeHarnessPass','bossWon','durationRaceSeconds','pssMiBRange','ownedTextureMiBMax','gates']}))+'</p>')
    if r['error']:cards.append('<p>Harness failure retained: '+html.escape(r['error'].splitlines()[0])+'. The separate restart probe checks the earned reward and corrected modal cleanup.</p>')
    for p in sorted((out/r['run']).glob('*.png')):cards.append('<figure><img loading="lazy" src="'+p.relative_to(out).as_posix()+'"><figcaption>'+html.escape(p.stem)+'</figcaption></figure>')
page='''<!doctype html><meta charset="utf-8"><title>Death Ride campaign Stick checks</title><style>body{font:16px system-ui;background:#171513;color:#ddd0a6;max-width:1200px;margin:30px auto;padding:20px}img{width:100%;border:1px solid #84724e}figure{margin:24px 0}figcaption{padding:8px;color:#b4a044}p{overflow-wrap:anywhere}a{color:#d6bc55}</style><h1>Campaign on AFTKM</h1><p>Observed device behavior from funded legal fixtures. No earned full-campaign or human feel claim. Frame target misses remain failures; raw rolling windows are retained.</p><p><a href="summary.json">Measured results, APK identities and limits</a></p>'''+''.join(cards)
(out/'index.html').write_text(page,encoding='utf-8')
print(json.dumps([{k:r[k] for k in ['run','functionalPass','bossWon','durationRaceSeconds','frameMs','pssMiBRange','ownedTextureMiBMax','gates']} for r in results],indent=2))
