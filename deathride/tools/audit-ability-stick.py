"""Summarize measured rolling windows without averaging overlapping quantiles."""
import argparse
import gzip
import json
import statistics
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('raw', type=Path)
parser.add_argument('output', type=Path)
args = parser.parse_args()
with (gzip.open(args.raw, 'rt', encoding='utf-8') if args.raw.suffix == '.gz' else args.raw.open(encoding='utf-8')) as handle:
    raw = json.load(handle)
windows = raw['windows']
active = [w for w in windows if w['stats']['phase'] == 'race' and w['stats']['raceSeconds'] >= 10]
assert active, 'No complete active ten-second window'

def timing(metric):
    values = [w['stats'][metric]['last10s'] for w in active]
    return {'activeP50Range': [min(v['p50'] for v in values), max(v['p50'] for v in values)],
            'worstActiveP95': max(v['p95'] for v in values), 'activeMaximum': max(v['max'] for v in values),
            'allWindowMaximum': max(w['stats'][metric]['last10s']['max'] for w in windows)}

memory = raw['memory']
pss = [m['pssKb']/1024 for m in memory]
assert all(p > 0 for p in pss)
warm = [m for m in memory if m['second'] >= 60]
first = statistics.median(m['pssKb']/1024 for m in warm[:3])
last = statistics.median(m['pssKb']/1024 for m in warm[-3:])
x = [m['second']/60 for m in warm]
y = [m['pssKb']/1024 for m in warm]
xm, ym = statistics.mean(x), statistics.mean(y)
slope = sum((a-xm)*(b-ym) for a,b in zip(x,y))/sum((a-xm)**2 for a in x)
final = raw.get('finalStats', raw['rounds'][-1]['final'])
frame, step = timing('frameTimeMs'), timing('simStepMs')
texture = [w['stats']['art'] for w in windows]
class_use = raw['classUses']
result = {
    'startedUtc': raw['startedUtc'], 'finishedUtc': raw['finishedUtc'], 'apkSha256': raw['apkSha256'],
    'model': raw['model'], 'hostPriority': raw.get('hostPriority'), 'screenshotsEnabled': raw.get('screenshotsEnabled'), 'minesEnabled': raw.get('minesEnabled'),
    'mineBlastRadiiM': sorted(set(w['stats']['combatSummary'].get('mineBlastRadiusM', -1) for w in windows)),
    'mineTriggerRadiiM': sorted(set(w['stats']['combatSummary'].get('mineTriggerRadiusM', -1) for w in windows)),
    'peakLiveMines': max(w['stats']['combatSummary']['mines'] for w in windows),
    'mineShotsAcrossRounds': sum(r['final']['combatSummary']['shotsByWeapon'][2] for r in raw['rounds']), 'durationSeconds': raw['actualDurationSeconds'],
    'rounds': len(raw['rounds']), 'completedRounds': sum(r.get('endedEarly', False) for r in raw['rounds']),
    'observedWindows': len(windows), 'completeActiveWindows': len(active),
    'adbReconnects': raw.get('adbReconnects', []), 'clients': raw['clients'], 'pumpStalls': raw['pumpStalls'], 'rejections': raw.get('rejections', 'not recorded in initial probe'),
    'classUses': class_use, 'classActiveHudSamples': raw['classActiveHudSamples'],
    'peakConcurrentCommittedAbilities': max(sum(t['ability']['phase'] != 'READY' for t in w['stats']['traffic'] if t.get('ability')) for w in windows),
    'frameMs': frame, 'stepMs': step,
    'discardedSimulationMsSinceAppStart': final['discardedSimulationMs']['sinceStart'],
    'discardedMsInAnyCompleteActiveWindow': max(w['stats']['discardedSimulationMs']['last10s'] for w in active),
    'inputAgeWorstActiveP95Ms': [max(w['stats']['slots'][i]['inputAgeMs']['last10s']['p95'] for w in active) for i in range(2)],
    'staleConsumeSamplesSinceAppStart': [s['stale']['sinceStart'] for s in final['slots']],
    'pssMiBRange': [min(pss), max(pss)], 'warmFirstLastMedianMiB': [first,last], 'warmMedianGrowthMiB': last-first,
    'warmPssTrendMiBPerMinute': slope, 'thermalStatuses': sorted(set(m['thermalStatus'] for m in memory)),
    'maxOwnedTexturesMiB': max(a['ownedTextureBytes'] for a in texture)/1048576,
    'maxArtMiB': max(a['textureBytes'] for a in texture)/1048576,
    'gates': {'allClassActivations': len(class_use) == 10 and all(v > 0 for v in class_use.values()),
              'inputs': all(c['rejected'] == 0 and c['accepted'] == c['sent'] and c['hz'] >= 29 for c in raw['clients']) and not raw['pumpStalls'],
              'frameP95AtMost16_7Ms': frame['worstActiveP95'] <= 16.7, 'activeMaxAtMost33Ms': frame['activeMaximum'] <= 33,
              'activeMedians16to18Ms': 16 <= frame['activeP50Range'][0] and frame['activeP50Range'][1] <= 18,
              'pssAtMost192MiB': max(pss) <= 192, 'warmMedianGrowthAtMost8MiB': last-first <= 8,
              'textureBudget': all(a['budgetOk'] and a['failures'] == 0 for a in texture)},
    'limits': ['Windows overlap: their percentiles are not averaged or added.',
               'Active windows require at least ten simulated race seconds; preparation and startup tails remain separately visible.',
               'Class cycling includes interrupted practice rounds; completed round count is separate.',
               'Normal AI and mortal cars, not a forced maximum-effects stress fixture.',
               'Scripted LAN traffic is not optical latency, physical-phone comfort, fairness or fun.']
}
args.output.write_text(json.dumps(result, indent=2)+'\n', encoding='utf-8', newline='\n')
print(json.dumps(result, indent=2))
