"""Render the retained measurements as a portable HTML evidence page and PNG plots."""
import gzip,html,json,math
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

root=Path('evidence/perf');charts=root/'charts';charts.mkdir(exist_ok=True)
config=json.loads((root/'conclusion.json').read_text(encoding='utf-8'))
paths=['p0/baseline','p0/profile','p1/profile','p1/clean','p2/profile','p2/clean',
       'p3/vsync','p3/vsync-display','p3/vsync-display-720','p3/continuous-display',
       'p4/profile','p5/profile','p7/profile','p6/baseline','p6/low-latency',
       'p8/slot-2','p8/slot-3','p8/slot-4','p8/aligned-native','final/clean',
       'p8/network-ring/probe','p8/callback-display','p8/slot-6','p8/slot-8','final/delivery']
runs={p:json.loads((root/p/'summary.json').read_text()) for p in paths if (root/p/'summary.json').exists()}
final=runs[config['qualification']]
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':10,'axes.spines.top':False,'axes.spines.right':False})
clean=[p for p in ['p0/baseline','p1/clean','p2/clean','p6/baseline','p6/low-latency',config['qualification']] if p in runs]
clean=list(dict.fromkeys(clean))
fig,axes=plt.subplots(1,2,figsize=(11,4.6),layout='constrained')
for ax,key,title,target in [(axes[0],'worstP95Ms','Worst active rolling-window p95',16.7),(axes[1],'maxMs','Maximum active rolling-window interval',33)]:
 vals=[runs[p]['activeWindows'][key] for p in clean]
 ax.bar(range(len(clean)),vals,color='#ad7935');ax.axhline(target,color='#a43131',ls='--',label=f'Target {target} ms')
 ax.set_xticks(range(len(clean)),clean,rotation=25,ha='right');ax.set_ylabel('Milliseconds');ax.set_title(title)
 for i,v in enumerate(vals):ax.text(i,v+.02*max(vals),f'{v:.2f}',ha='center',fontsize=9)
 ax.set_ylim(0,max(vals)*1.18);ax.legend()
fig.savefig(charts/'frames.png',dpi=160);plt.close(fig)

fig,ax=plt.subplots(figsize=(10,4),layout='constrained')
for p in clean:
 raw=json.loads(gzip.decompress((root/p/'raw.json.gz').read_bytes()))
 ax.plot([m['second']/60 for m in raw['memory']],[m['pssKb']/1024 for m in raw['memory']],marker='.',label=p)
ax.axhline(192,color='#a43131',ls='--',label='192 MiB budget');ax.set_xlabel('Minutes');ax.set_ylabel('PSS MiB');ax.set_title('Device-local PSS samples; no process-forced GC');ax.legend(ncol=3,fontsize=8)
fig.savefig(charts/'memory.png',dpi=160);plt.close(fig)

phases=['requestsMs','prepareMs','simulationMs','audioMs','telemetryMs','clearMs','cameraMs','effectsUpdateMs','sceneryDrawMs','carsEffectsMs','hudMs','captionMs']
profilePaths=[p for p in ['p0/profile','p2/profile','p4/profile','p5/profile','p7/profile'] if p in runs and 'profile' in runs[p]]
fig,ax=plt.subplots(figsize=(11,5),layout='constrained');bottom=[0.0]*len(profilePaths)
for phaseIndex,phase in enumerate(phases):
 vals=[runs[p]['profile']['active'][phase]['mean'] for p in profilePaths]
 ax.bar(profilePaths,vals,bottom=bottom,label=phase.removesuffix('Ms'),color=plt.get_cmap('tab20')(phaseIndex));bottom=[a+b for a,b in zip(bottom,vals)]
ax.set_ylabel('Mean phase wall time, ms');ax.set_title('Diagnostic active-frame phase means (not summed percentiles)');ax.legend(bbox_to_anchor=(1.01,1),loc='upper left',fontsize=8)
fig.savefig(charts/'phases.png',dpi=160);plt.close(fig)

fig,axes=plt.subplots(1,2,figsize=(11,4),layout='constrained')
for p in ['p0/baseline','p1/clean','p2/clean','p6/baseline','p6/low-latency',config['qualification']]:
 if p not in runs:continue
 raw=json.loads(gzip.decompress((root/p/'raw.json.gz').read_bytes()))
 if raw.get('ackObservations'):
  rows=[r for r in raw['ackObservations'] if r[2] is not None and len(r)>6 and r[6] is not None]
  ages=sorted(r[4]-r[2]-r[6] for r in rows)
  # Quantiles of original observations, not averages of rolling percentiles.
  qs=[.5,.9,.95,.99,.999,1.0]
  axes[0].plot([q*100 for q in qs],[ages[max(0,math.ceil(q*len(ages))-1)] for q in qs],marker='.',label=p)
 axes[1].bar(p,sum(c['rejected'] for c in runs[p]['clients']),color='#ad7935')
axes[0].axhline(250,color='#a43131',ls='--');axes[0].set_xlabel('Percentile');axes[0].set_ylabel('Calibrated age at ack timestamp, ms');axes[0].set_title('All input observations; clock estimate retained');axes[0].legend(fontsize=7)
axes[1].set_title('Rejected inputs across both seats');axes[1].tick_params(axis='x',rotation=30)
fig.savefig(charts/'inputs.png',dpi=160);plt.close(fig)

esc=html.escape
def cell(v):return f'<td>{v}</td>'
table=''
for p,s in runs.items():
 w=s['activeWindows'];six=s['sixLiveWindows'];g=s['gates']
 receipt=json.loads((root/p/'installed.json').read_text())
 mode='phase diagnostic' if receipt.get('profile') else 'standard probe'
 if p=='p3/continuous-display':mode+=' + intrusive native trace'
 if p=='p7/profile':mode+=' + intrusive native trace/sample'
 if p in ('p8/aligned-native','p8/network-ring/probe'):mode+=' + intrusive native capture'
 if p=='p5/profile':mode+=' + extra full-ring export'
 if p=='p0/baseline':mode+=' + 1 s sampler check'
 g={**g,'inputStream':not s['pumpStalls'] and all(c['hz']>29 for c in s['clients'])}
 g['functional']=s['functionalPass']
 checks=' / '.join(('PASS' if g[k] else 'FAIL') for k in ['duration','zeroRejected','inputStream','functional','frameP95','frameMax','memory','textures'])
 row=[f'<a href="{p}/summary.json">{esc(p)}</a><small>{esc(mode)}</small>',f"{s['durationSeconds']:.1f}",f"{w['worstP95Ms']:.3f} / {w['maxMs']:.3f}",f"{six['worstP95Ms']:.3f} / {six['maxMs']:.3f}<small>{six['count']} overlapping windows</small>",'/'.join(str(c['rejected']) for c in s['clients']),f"{max(s['pssRangeMiB']):.2f}",checks,f'<a href="{p}/raw.json.gz">raw.gz</a> · <a href="{p}/installed.json">APK receipt</a>']
 table+='<tr>'+''.join(cell(v) for v in row)+'</tr>'
truth=''.join('<tr>'+cell(esc(k))+cell(esc(v))+'</tr>' for k,v in config['truth'].items())
findings=''.join(f'<li>{esc(s)}</li>' for s in config['findings'])
limits=''.join(f'<li>{esc(s)}</li>' for s in config['limits'])
gallery=''
if (root/'final/lifecycle/active.png').exists():
 gallery='<h2>Separate device behavior and art check</h2><p><a href="final/lifecycle/result.json">Browser/reconnect/Home observations</a> · <a href="final/lifecycle/wifi.json">Optional Wi-Fi lock lifecycle</a> · <a href="final/lifecycle/tv-preserved.json">Original TV package verification</a>. Real captures follow ordinary inputs; they are outside timing qualification and do not certify human feel.</p>'
 for name,label in [('active','Actual Stick racing capture'),('home-resume','Actual Stick capture after Home/resume'),('controller-active','Headless browser controller during the device race')]:
  if (root/f'final/lifecycle/{name}.png').exists():gallery+=f'<a href="final/lifecycle/{name}.png"><img src="final/lifecycle/{name}.png" alt="{label}"></a>'
page=f'''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Death Ride — Stick performance evidence</title><style>
body{{font:16px/1.55 system-ui,sans-serif;background:#f6f3ed;color:#252727;margin:0}}main{{max-width:1240px;margin:auto;padding:36px 28px}}h1,h2{{line-height:1.15}}h1{{font-size:34px}}h2{{margin-top:40px}}.stamp{{color:#765326;letter-spacing:.06em;text-transform:uppercase;font-size:13px}}.verdict{{padding:20px;border-left:6px solid #a43131;background:#fff}}table{{border-collapse:collapse;width:100%;font-size:13px;background:white}}th,td{{padding:10px;border-bottom:1px solid #d5d0c6;text-align:left;vertical-align:top}}th{{background:#e6dfd2}}small{{display:block;color:#606665;font-size:11px}}a{{color:#705016}}img{{display:block;width:100%;height:auto;margin:20px 0;background:white}}.scroll{{overflow:auto}}code{{overflow-wrap:anywhere}}li{{margin:.5em 0}}footer{{margin-top:40px;border-top:1px solid #aaa;padding-top:15px;font-size:13px}}</style>
<main><div class="stamp">2026-10-03 · AFTKM · dev.deathride.perf · local evidence</div>
<h1>Death Ride: Stick performance and input robustness</h1>
<div class="verdict"><strong>{esc(config['verdict'])}</strong><p>{esc(config['outcome'])}</p>
<p>Qualification APK SHA-256: <code>{esc(final['apkSha256'])}</code></p></div>
<p><a href="../../../docs/concepts/deathride/PERF-REPORT.md">Detailed report</a> · <a href="../../../docs/concepts/deathride/PERF-SESSION.md">Session log</a> · <a href="../../../docs/concepts/DEATH-RIDE-PERF.md">Wave status</a> · <a href="../../OWNER-CHECKS.md">Owner checks</a> · <a href="manifest.json">Evidence hashes</a></p>
<h2>What changed and what remains</h2><ul>{findings}</ul>
<h2>Truth tiers</h2><table><tr><th>Tier</th><th>Evidence and boundary</th></tr>{truth}</table>
<h2>Device runs</h2><p>Gate order: duration ≥900 s / zero rejects / input rate &amp; no host pump stalls / functional probe / active p95 ≤16.7 ms / max &lt;33 ms / PSS / textures. Short trials retain FAIL on duration. Six-live windows are shown separately. Rolling windows overlap and are never pooled.</p>
<div class="scroll"><table><tr><th>Run / observer</th><th>Seconds</th><th>Active p95 / max ms</th><th>Six-live p95 / max ms</th><th>Rejects P1/P2</th><th>Max PSS MiB</th><th>Gates</th><th>Original data</th></tr>{table}</table></div>
<img src="charts/frames.png" alt="Frame timing comparisons with unchanged targets"><img src="charts/inputs.png" alt="Input age and rejected input comparisons"><img src="charts/memory.png" alt="PSS across device soaks">
<h2>Where frame time went</h2><p>Phase wall time includes sleep and preemption. Clear includes buffer acquisition; it is not equivalent to clear CPU. Native traces separate CPU, sleep and runnable delay. Diagnostic exports themselves allocate and cost time.</p><img src="charts/phases.png" alt="Mean phase breakdown across diagnostic runs">
<p><a href="p0/native/trace-summary.json">Baseline scheduler analysis</a> · <a href="p3/network/audio-wait-excerpt.txt">Measured audio monitor stall</a> · <a href="p7/native/trace-summary.json">Mailbox scheduler analysis</a> · <a href="p5/pixels/result.json">Pixel-equivalence audit</a> · <a href="p4/desktop/summary.json">Desktop allocation profile</a></p>
{gallery}<h2>Limits and next work</h2><ul>{limits}</ul>
<footer>Real render-entry intervals, ordinary two-controller inputs, six entrants per race, abilities/HUD/audio enabled. No optical latency, physical-phone ergonomics, listening or owner-feel certification. No push; original TV package preserved.</footer></main></html>'''
(root/'index.html').write_text(page,encoding='utf-8')
print((root/'index.html').resolve().as_uri())
