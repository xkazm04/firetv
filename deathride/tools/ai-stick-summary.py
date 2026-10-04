"""Summarize retained Stick telemetry without inventing race-wide percentiles."""
from pathlib import Path
import gzip
import hashlib
import json

root = Path(__file__).resolve().parents[1]
out = root / 'evidence/ai/z4/stick'
path = out / 'campaign-resumed/result.json'
if not path.exists():
    path = path.with_suffix('.json.gz')
raw = gzip.decompress(path.read_bytes()) if path.suffix == '.gz' else path.read_bytes()
r = json.loads(raw)
post = json.loads((out/'resumed-postflight.json').read_text())
assert r['pkg'] == 'dev.deathride.ai' and r['functionalPass'] and r['cleanupPass']
assert post['protectedUnchanged'] and post['aiApkMatches'] and post['isolatedAiStopped']
assert not r['errors'] and r['final']['phase'] == 'results'
windows = r['windows']
hunts = [(s,c) for s in windows for c in s['traffic'] if c['ai']['hunting'] and c['ai']['target'] >= 0]
assert hunts
captured_hunts = [(capture[side],c) for capture in r['captures'] for side in ('before','after')
                  if capture[side]['phase'] == 'race'
                  for c in capture[side]['traffic'] if c['ai']['hunting'] and c['ai']['target'] >= 0]
first_s, first_c = min(hunts + captured_hunts, key=lambda pair: pair[0]['raceSeconds'])
target = next(c for c in first_s['traffic'] if c['id'] == first_c['ai']['target'])
assert target['position'] in (1,2) and not target['human']
assert first_c['ai']['visible'] & (1 << target['id'])
assert first_s['raceSeconds'] >= 4
metrics = r['final']['traffic'][0]['ai']
assert metrics['maxAttackers'] <= 2 and metrics['huntIntentDamage'] > 0
end = r['final']
assert end['slots'][0]['combat']['hp'] > 0 and end['slots'][0]['lap'] == 6
race = [s for s in windows if s['phase'] == 'race' and s['raceSeconds'] >= 10]
assert race
window_p95 = [s['frameTimeMs']['last10s']['p95'] for s in race]
frame, sim = end['frameTimeMs'], end['simStepMs']
delta_discard = end['discardedSimulationMs']['sinceStart'] - r['start']['discardedSimulationMs']['sinceStart']
summary = dict(applicationId=r['pkg'], device=r['device'], model='AFTKM', apkSha256=r['apkSha256'],
    functionalPass=True, cleanupPass=True, protectedPackagesUnchanged=True, aiStopped=True,
    scope=r['scope'], rawFile=str(path.relative_to(out)).replace('\\','/'), rawSha256=hashlib.sha256(raw).hexdigest(),
    raceSeconds=end['raceSeconds'], observationWallSeconds=r['wallSeconds'], observationStartRaceSeconds=r['start']['raceSeconds'],
    laps=6, playerPosition=end['slots'][0]['position'], playerHp=end['slots'][0]['combat']['hp'],
    telemetryWindows=len(windows), windowsWithHunt=sum(any(c['ai']['hunting'] and c['ai']['target']>=0 for c in s['traffic']) for s in windows),
    sampledHuntDecisions=len(hunts), firstObservedHunt=dict(raceSeconds=first_s['raceSeconds'],hunterId=first_c['id'],
        targetId=target['id'],targetRank=target['position'],targetHuman=target['human'],visibleMask=first_c['ai']['visible'],reason=first_c['ai']['reason']),
    leaderChanges=metrics['leaderChanges'],maxAttackers=metrics['maxAttackers'],leaderDamage=metrics['leaderDamage'],
    hunterDamage=metrics['hunterDamage'],huntIntentDamage=metrics['huntIntentDamage'],
    frameTimeMs=frame,simStepMs=sim,rollingRaceP95RangeMs=[min(window_p95),max(window_p95)],
    discardedSimulationMsDuringObservedRace=delta_discard,
    timingScope='End snapshot last10s is exact and includes the result transition. SinceStart is a process-lifetime histogram, including loading/lobby/captures; not race-only. Rolling windows overlap and are not pooled into a race percentile.',
    previousAttempt='campaign-pro: 154 retained windows; hunt observed; interrupted/timeout after machine pause, no duration or functional pass.')
f = lambda x: f'{x:.2f}'
summary['reviewHtml'] = f'''<p class="callout"><strong>PASS — isolated app dev.deathride.ai.</strong> Fire TV Stick AFTKM at {r['device']}, discovered by a fresh /24 port-5555 scan. The installed APK hash was verified; protected TV and tracks package identities are unchanged. The AI app was stopped after returning to the lobby.</p>
<p>A fresh named campaign profile drove stock Line in “Ash on the key”, six laps on Foundry, with Pro opposition. A browser telemetry pilot supplied ordinary controller inputs; no save fixture, supplied funds or human driver. It finished sixth, alive at {f(summary['playerHp'])} HP, in <strong>{f(end['raceSeconds'])} simulation seconds</strong> (2:49), inside 120–180 s. The observed wall interval was {f(r['wallSeconds'])} s and began at race time {f(r['start']['raceSeconds'])} s, so those clocks have different origins.</p>
<p>There are {len(windows)} retained telemetry windows, {summary['windowsWithHunt']} with a sampled hunt target. First sampled hunt: {f(first_s['raceSeconds'])} s, AI {first_c['id']} targeting visible AI {target['id']} at rank {target['position']}. Final cumulative leader-rank changes: {metrics['leaderChanges']}; maximum intentional claims: {metrics['maxAttackers']}. Impact-time leader damage: {f(metrics['leaderDamage'])} HP, of which {f(metrics['hunterDamage'])} HP came from hunters and {f(metrics['huntIntentDamage'])} HP from live hunt intent. The image shows ordinary racing with no hunt cue; the debug telemetry establishes the hunt.</p>
<div class="table-wrap" tabindex="0" role="region" aria-label="Measured Stick timing"><table id="device-timing-table"><caption>Direct measured timing, milliseconds; no FPS-derived percentiles</caption><thead><tr><th scope="col">Metric / scope</th><th scope="col">p50</th><th scope="col">p95</th><th scope="col">Maximum</th><th scope="col">Samples</th></tr></thead><tbody>
<tr><td>Frame interval, final exact 10 s (includes result transition)</td><td>{f(frame['last10s']['p50'])}</td><td>{f(frame['last10s']['p95'])}</td><td>{f(frame['last10s']['max'])}</td><td>{frame['last10s']['count']}</td></tr>
<tr><td>Frame interval, process lifetime; 0.1 ms histogram bins</td><td>{f(frame['sinceStart']['p50'])}</td><td>{f(frame['sinceStart']['p95'])}</td><td>{f(frame['sinceStart']['max'])}</td><td>{frame['sinceStart']['count']}</td></tr>
<tr><td>Simulation step, final exact 10 s</td><td>{f(sim['last10s']['p50'])}</td><td>{f(sim['last10s']['p95'])}</td><td>{f(sim['last10s']['max'])}</td><td>{sim['last10s']['count']}</td></tr>
<tr><td>Simulation step, process lifetime; 0.001 ms histogram bins</td><td>{f(sim['sinceStart']['p50'])}</td><td>{f(sim['sinceStart']['p95'])}</td><td>{f(sim['sinceStart']['max'])}</td><td>{sim['sinceStart']['count']}</td></tr>
</tbody></table></div>
<p>After the first 10 race seconds, sampled rolling-10-s frame p95 ranges from {f(min(window_p95))} to {f(max(window_p95))} ms. These overlapping windows are not a whole-race percentile. Lifetime statistics include startup, lobby and screenshot captures. Lifetime histogram caps are 5,000 ms for frames and 50 ms for simulation; maxima are exact. Discarded simulation time increased by {delta_discard} ms during the observed race (380 ms already present at its first snapshot). This is one scripted run, not an optical-latency or human-feel measurement. Optimisation remains deferred under N3.</p>
<div class="device-images"><figure><a href="../../evidence/ai/z4/stick/campaign-resumed/hunt-observed.png"><img src="../../evidence/ai/z4/stick/campaign-resumed/hunt-observed.png" alt="Stick race capture at an observed hunter decision" loading="lazy"></a><figcaption>Race capture paired with hunt telemetry; no visible hunt marker.</figcaption></figure><figure><a href="../../evidence/ai/z4/stick/campaign-resumed/result.png"><img src="../../evidence/ai/z4/stick/campaign-resumed/result.png" alt="Stick race result after six laps" loading="lazy"></a><figcaption>Sixth-place finish from ordinary scripted driving.</figcaption></figure></div>
<p class="small"><a href="../../evidence/ai/z4/stick/summary.json">Summary and timing definitions</a> · <a href="../../evidence/ai/z4/stick/{summary['rawFile']}">Complete successful telemetry</a> · <a href="../../evidence/ai/z4/stick/scan-resumed.json">Fresh scan</a> · <a href="../../evidence/ai/z4/stick/resumed-preflight.json">Preflight</a> · <a href="../../evidence/ai/z4/stick/resumed-postflight.json">Postflight package checks</a></p>
<p>The earlier campaign-pro attempt retains 154 windows and an observed hunt, but ended with a fetch timeout across the machine pause. It is explicitly interrupted, not a completed race or acceptance pass. The initial pairing-log failure is also retained. <a href="../../evidence/ai/z4/stick/README.md">Device evidence inventory</a>.</p>'''
(out/'summary.json').write_text(json.dumps(summary,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:summary[k] for k in ('functionalPass','raceSeconds','windowsWithHunt','leaderChanges','maxAttackers','rollingRaceP95RangeMs')},indent=2))
