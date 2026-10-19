"""P13d evidence summaries: evidence/perf/p13d/arms.json (the diagnostic switch arms) and, once the graded runs exist,
comparison.json (the two P13d runs beside P13c run 1 and run 2).

Usage: perf-p13d.py arms RAW EVIDENCE        RAW = C:/Users/kazda/kiro/deathride-raw-evidence/p13d, EVIDENCE = deathride/evidence/perf
       perf-p13d.py runs RAW EVIDENCE"""
import json, re, sys
from pathlib import Path

mode, raw, ev = sys.argv[1], Path(sys.argv[2]), Path(sys.argv[3])
out = ev / 'p13d'
out.mkdir(parents=True, exist_ok=True)

ARMS = [('off', 'The shipping switch (P13c code plus the inventory).'),
        ('delay', 'Replaced tiles deleted 60 frames after the switch, one per frame.'),
        ('skip', 'No tile replaced: no delete, no upload (diagnostic only).'),
        ('early', 'New tiles uploaded when the pick lands; the switch runs 30 frames later and only swaps and deletes.'),
        ('reuse', 'New pixels uploaded into the old texture objects: no texture created or deleted.'),
        ('holdbake', 'The scenery bake starts 30 frames after the switch (diagnostic only).'),
        ('flush', 'glFlush after every bake slice, after FrameBuffer.end.'),
        ('flushbound', 'glFlush after every bake slice, before FrameBuffer.end (scenery target bound).'),
        ('halfslice', 'Half the per-slice bake budget: about twice the passes (diagnostic only).'),
        ('noclear', 'The bake\'s first pass paints an opaque full-target rect instead of glClear (same pixels).')]

def arms():
    result = {'measure': 'The interval k frames after the event frame (k=0), from the glInventory lines of a profiled perf build. '
                         'A frame interval holds the previous frame\'s GPU wait, so a slow interval at k is the GPU job of frame k-1. '
                         'P13c: the interval at k=11 after every switch frame, 101-112 ms, 22 of 22.',
              'arms': {}}
    for name, what in ARMS:
        d = json.loads((raw / f'arms-{name}.json').read_text())[name]
        installed = json.loads((raw / f'arm-{name}' / 'installed.json').read_text())
        events = []
        for e in d['events']:
            events.append({'event': e['event'], 'frame': e['frame'], 'slowIntervals': e['slowIntervals'], 'k11IntervalMs': e['k11IntervalMs'],
                           'objectEvents': e['objectEvents'],
                           'intervalsMs': [f['intervalMs'] for f in e['frames']]})
        result['arms'][name] = {'what': what, 'apkSha256': installed['apkSha256'], 'extra': installed['extra'], 'events': events,
                                'strayObjectFrames': d['strayCount'],
                                'regionMaterials': [m for m in d['regionMaterials'] if 'regionMaterials' in m][:8]}
    # The OFF arm's whole first switch window, frame by frame (the GL inventory of step 0).
    off = json.loads((raw / 'arms-off.json').read_text())['off']['events'][0]
    result['offFirstSwitchWindow'] = [{'k': f['k'], 'intervalMs': f['intervalMs'], 'workMs': f['workMs'], 'gl': f['gl']} for f in off['frames']]
    result['voided'] = [{'arm': 'noclear', 'dir': 'arm-noclear-void1', 'why': 'perf-device.py polled pidof before the process existed '
                         '(CalledProcessError on the first poll); the app had started. Rerun as arm-noclear.'}]
    result['limits'] = ('About 3 lobby course switches per arm (210 s probe runs, profiled, graded by nothing: the probe exits 1 on its '
                        '900 s duration gate). The GPU job itself is not visible to the app; the arms move or keep it.')
    (out / 'arms.json').write_text(json.dumps(result, indent=1) + '\n')
    for name in result['arms']:
        print(name, [(e['event'], [(s['k'], s['intervalMs']) for s in e['slowIntervals']]) for e in result['arms'][name]['events']])

def span(values):
    return [round(min(values), 1), round(max(values), 1)] if values else None

def runs():
    p13c = json.loads((ev / 'p13c/comparison.json').read_text())
    res = {'p13c': {k: {'bar': v['bar'], 'requestsMs': v['requestsMs'], 'flushMsPerSeat': v['flushMsPerSeat'], 'pssMiB': v['pssMiB']}
                    for k, v in p13c['runs'].items()}, 'runs': {}}
    for n in (1, 2):
        r = json.loads((raw / f'run{n}-readings.json').read_text())
        sw = json.loads((raw / f'run{n}-switches.json').read_text())[f'run{n}']
        log = (raw / f'run{n}' / 'logcat.txt').read_text(errors='replace')
        timers = r['requestTimers']
        def req(what, key='totalMs'):
            return span([t[key] for t in timers if t['what'] == what and key in t])
        flush = {}
        for t in timers:
            if t['what'] == 'flush':
                flush.setdefault(f"seat{int(t['seat'])}", []).append(round(t['ms'], 1))
        reading = {x['reading']: x for x in r['readings']}
        settle = json.loads((raw / f'run{n}-settle.json').read_text(encoding='utf-8-sig'))
        art = [json.loads(m) for m in re.findall(r'"art":(\{"regions".*?"carStrategy":"[^"]*"\})', (raw / f'run{n}' / 'raw.json').read_text(errors='replace'))[:1]]
        res['runs'][f'run{n}'] = {
            'bar': {'transitionMaxMs': round(r['transitionMaxMs'], 1), 'windowsOver100': len(r['transitionWindowsOver100Ms']),
                    'transitionWindows': reading['transitionFramesOver100Ms']['value']['transitionWindows'], 'pass': not r['transitionWindowsOver100Ms']},
            'perRoundTransitionMaxMs': [(p['track'], round(p['transitionMaxMs'], 1) if p['transitionMaxMs'] is not None else None) for p in r['perRound']],
            'renders100msPlus': [{k: (round(v, 1) if isinstance(v, float) else v) for k, v in h.items()} for h in r['renders100msPlus']],
            'switchK11IntervalsMs': [e['k11IntervalMs'] for e in sw['events'] if e['event'] == 'switch'],
            'switchSlowIntervals': [[(s['k'], s['intervalMs']) for s in e['slowIntervals']] for e in sw['events'] if e['event'] == 'switch'],
            'requestsMs': {'car': req('car'), 'startRace': req('startRace'), 'raceLaunch': req('raceLaunch'), 'track': req('track'), 'lobby': req('lobby')},
            'flushMsPerSeat': {k: {'count': len(v), 'rangeMs': span(v), 'all': v} for k, v in sorted(flush.items())},
            'uiDeferredMs': span([t['ms'] for t in timers if t['what'] == 'uiDeferred']),
            'pssMiB': [round(x, 1) for x in reading['pssRangeMiB']['value']], 'rejected': reading['rejectedInputs']['value'],
            'inputStream': reading['inputStream']['value'],
            'hostCpuPercent': {k: v.get('totalPercentSamples') for k, v in r['hostCpu'].items()},
            'hostSettle': {k: settle.get(k) for k in ('settled', 'waitedSeconds', 'rule')},
            'finishRace': [t for t in timers if t['what'] in ('finishRace',)] or 'no finishRace timer (no race finished, or none logged)',
            'artStatsFirst': art[0] if art else None,
        }
    (out / 'comparison.json').write_text(json.dumps(res, indent=1) + '\n')
    print(json.dumps({k: {kk: v[kk] for kk in ('bar', 'switchK11IntervalsMs', 'requestsMs', 'pssMiB', 'rejected', 'inputStream', 'hostCpuPercent', 'hostSettle')}
                      for k, v in res['runs'].items()}, indent=1))

{'arms': arms, 'runs': runs}[mode]()
