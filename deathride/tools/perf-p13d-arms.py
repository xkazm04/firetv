"""P13d: reads one or more perf-device arm directories (logcat.txt with the glInventory lines of a profiled build) and writes
the per-event GL inventory and the slow intervals that follow each course switch, tile release or EARLY stage.

glInventory lines (RaceGame, profiled builds): one per frame for 20 frames from an event, k=0 being the event's frame.
A frame's intervalMs is the time from the previous frame's start to its own, so a slow GPU job queued by frame k-1 shows
as a long interval at k. The P13c measure is the interval 11 frames after the switch frame (k=11).

Usage: perf-p13d-arms.py OUT.json NAME=DIR [NAME=DIR ...]"""
import json, re, sys
from pathlib import Path

LINE = re.compile(r'^(\S+ \S+).*DeathRide: glInventory event=(\w+) k=(-?\d+) frame=(\d+) intervalMs=([\d.]+) workMs=([\d.]+) ?(.*)$')
SLOW_MS = 85.0

def arm(directory: Path):
    log = (directory / 'logcat.txt').read_text(errors='replace')
    events, current, strays = [], None, []
    for m in (LINE.match(l) for l in log.splitlines()):
        if not m:
            continue
        when, event, k, frame, interval, work, inv = m[1], m[2], int(m[3]), int(m[4]), float(m[5]), float(m[6]), m[7]
        counts = dict((a, int(b)) for a, b in re.findall(r'(\w+)=(\d+)', inv))
        row = {'k': k, 'frame': frame, 'intervalMs': interval, 'workMs': work, 'gl': counts}
        if event == 'none':
            strays.append({'logTime': when, **row})
            continue
        if k == 0:
            current = {'event': event, 'logTime': when, 'frame': frame, 'frames': []}
            events.append(current)
        if current is not None and current['event'] == event:
            current['frames'].append(row)
    for e in events:
        e['slowIntervals'] = [{'k': f['k'], 'intervalMs': f['intervalMs']} for f in e['frames'] if f['k'] > 0 and f['intervalMs'] > SLOW_MS]
        e['k11IntervalMs'] = next((f['intervalMs'] for f in e['frames'] if f['k'] == 11), None)
        e['maxIntervalMs'] = max((f['intervalMs'] for f in e['frames'] if f['k'] > 0), default=None)
        e['objectEvents'] = [{'k': f['k'], **{c: v for c, v in f['gl'].items() if c in ('texGen', 'texDelete', 'texUploads', 'texUploadBytes', 'bufGen',
                              'bufDelete', 'shaderCreate', 'shaderDelete', 'programCreate', 'programLink', 'programDelete', 'fboGen',
                              'fboDelete', 'renderbuffers', 'fboAttach', 'mipmaps', 'finish', 'readPixels', 'shaderCompile')}}
                             for f in e['frames'] if any(c in f['gl'] for c in ('texGen', 'texDelete', 'texUploads', 'bufGen', 'bufDelete', 'shaderCreate',
                             'programCreate', 'programLink', 'programDelete', 'fboGen', 'fboDelete', 'renderbuffers', 'fboAttach', 'mipmaps',
                             'finish', 'readPixels', 'shaderCompile', 'shaderDelete'))]
    materials = [l.split('DeathRide: ', 1)[1] for l in log.splitlines() if 'DeathRide: regionMaterials' in l or 'DeathRide: switch arm=' in l]
    return {'events': events, 'strayObjectFrames': strays[:60], 'strayCount': len(strays), 'regionMaterials': materials}

out = Path(sys.argv[1])
result = {}
for spec in sys.argv[2:]:
    name, directory = spec.split('=', 1)
    result[name] = arm(Path(directory))
result['limits'] = ('From the glInventory log lines of a profiled perf build; slowIntervals are intervals over 85 ms inside a 20-frame '
                    'window. A frame interval holds the previous frame\'s GPU wait, so the slow job belongs to frame k-1.')
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(result, indent=1) + '\n')
for name, r in result.items():
    if name == 'limits':
        continue
    print(name)
    for e in r['events']:
        print(f"  {e['event']:8s} k11={e['k11IntervalMs']} max={e['maxIntervalMs']} slow={[(s['k'], s['intervalMs']) for s in e['slowIntervals']]}")
        for o in e['objectEvents']:
            print('     ', o)
    print('  strays', r['strayCount'], r['strayObjectFrames'][:5])
