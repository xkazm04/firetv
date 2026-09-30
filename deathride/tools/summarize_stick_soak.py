"""Report device measurements without treating percentile averages as pooled percentiles."""
import json, pathlib, sys
p = pathlib.Path(sys.argv[1] if len(sys.argv)>1 else 'evidence/phase1/w8-soak.json')
s = json.loads(p.read_text(encoding='utf-8'))
w = s['windows']; active = [x for x in w if x['fullRace']]
phase_seconds = {}
for i, change in enumerate(s['phaseChanges']):
    end=s['phaseChanges'][i+1]['second'] if i+1<len(s['phaseChanges']) else s['inputDurationSeconds']
    phase_seconds[change['phase']]=phase_seconds.get(change['phase'],0)+max(0,end-change['second'])
def frame(x):
    return dict(second=x['second'], phase=x['stats']['phase'], track=x['stats']['track']['id'], fullRace=x['fullRace'], **x['stats']['frameTimeMs']['last10s'])
def bounds(rows):
    return {'windows':len(rows), 'frameSamples':sum(x['stats']['frameTimeMs']['last10s']['count'] for x in rows),
            'worstP95':frame(max(rows,key=lambda x:x['stats']['frameTimeMs']['last10s']['p95'])),
            'worstMax':frame(max(rows,key=lambda x:x['stats']['frameTimeMs']['last10s']['max']))}
def at(second):
    x=min(w,key=lambda x:abs(x['second']-second))
    return {'frame':frame(x),'inputAgeMs':[slot['inputAgeMs']['last10s'] for slot in x['stats']['slots']], 'simStepMs':x['stats']['simStepMs']['last10s']}
out = {
 'hardware':s['hardware'],'apkSha256':s['apkSha256'],'inputDurationSeconds':s['inputDurationSeconds'],
 'completed':not s.get('failure') and s['inputDurationSeconds']>=s['requestedSeconds'],
 'ranFullDuration':s['inputDurationSeconds']>=s['requestedSeconds'],'checksPassed':not s.get('failure'),
 'inputHz':[c['sent']/s['inputDurationSeconds'] for c in s['clients']], 'clients':s['clients'],
 'minute1':at(60),'minute15':at(900),'allWindows':bounds(w),'activeWindows':bounds(active),
 'sinceProcessStartFrameMs':s['final']['frameTimeMs']['sinceStart'],
 'discardedSimulationMs':s['final']['discardedSimulationMs'],
 'loadDiscardedSimulationMs':s['final']['discardedSimulationMs']['sinceStart']-s['initial']['discardedSimulationMs']['sinceStart'],
 'worstActiveInputAgeMs':[{'p95':max(x['stats']['slots'][i]['inputAgeMs']['last10s']['p95'] for x in active),
                           'max':max(x['stats']['slots'][i]['inputAgeMs']['last10s']['max'] for x in active)} for i in range(2)],
 'inputCounters':[{k:slot[k] for k in ('stale','dropped','outOfOrder')} for slot in s['final']['slots']],
 'loadInputCounterDelta':[{k:s['final']['slots'][i][k]['sinceStart']-s['initial']['slots'][i][k]['sinceStart'] for k in ('stale','dropped','outOfOrder')} for i in range(2)],
 'loadObservations':s['loadObservations'],
 'phaseWallSeconds':phase_seconds,
 'telemetryPolling':'100 ms wait after each HTTP response, nominal maximum 10 Hz; response time lowers actual rate',
 'observedRacePollHz':s['loadObservations']['racePolls']/phase_seconds.get('race',1),
 'completedRaces':len(s['races']), 'courses':sorted(set(x['stats']['track']['id'] for x in s['races'])),
 'completedRaceShots':sum(x['stats']['combatSummary']['shots'] for x in s['races']),
 'thermal':[{k:x[k] for k in ('second','status','sensors','pssKb')} for x in s['thermals']],
 'errors':s['errors'],'failure':s.get('failure')
}
target=p.with_name(p.stem+'-summary.json');target.write_text(json.dumps(out,indent=2),encoding='utf-8')
print(json.dumps(out,indent=2))
