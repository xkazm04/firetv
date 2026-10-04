"""Standalone measured timing/PSS figure; overlapping windows are not averaged."""
import gzip
import json
from pathlib import Path
import sys
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

source,output=map(Path,sys.argv[1:])
with (gzip.open(source,'rt') if source.suffix=='.gz' else source.open()) as handle:raw=json.load(handle)
assert not raw['screenshotsEnabled'],'Timing figure excludes screenshot runs'
windows=raw['windows'];x=[w['second']/60 for w in windows]
active=[w['stats']['phase']=='race' and w['stats']['raceSeconds']>=10 for w in windows]
fig,axes=plt.subplots(3,1,figsize=(12,9),sharex=True,layout='constrained')
for axis,key in zip(axes[:2],['frameTimeMs','simStepMs']):
    for field,label,color in [('max','Active window maximum','#a64428'),('p95','Active window p95','#867123'),('p50','Active window p50','#235c7c')]:
        axis.plot(x,[w['stats'][key]['last10s'][field] if keep else float('nan') for w,keep in zip(windows,active)],label=label,color=color,linewidth=1)
    axis.set_ylabel('Frame interval (ms)' if key=='frameTimeMs' else 'Simulation step (ms)')
    axis.grid(alpha=.2);axis.legend(loc='upper right',ncol=3,fontsize=8)
axes[0].axhline(16.7,color='#666666',linestyle='--',linewidth=.8,label='p95 gate')
axes[0].axhline(33,color='#666666',linestyle=':',linewidth=.8,label='maximum gate')
axes[0].legend(loc='upper right',ncol=3,fontsize=8)
axes[0].set_title('Death Ride HUD / AFTKM / ordinary two-controller run, screenshots disabled')
memory=raw['memory'];axes[2].plot([m['second']/60 for m in memory],[m['pssKb']/1024 for m in memory],'o-',color='#235c7c',label='Actual dumpsys total PSS')
axes[2].axhline(192,color='#a64428',linestyle='--',label='192 MiB gate');axes[2].set_ylabel('Process PSS (MiB)');axes[2].set_xlabel('Elapsed host minutes');axes[2].grid(alpha=.2);axes[2].legend(fontsize=8)
fig.supxlabel('Ten-second windows overlap. Gaps are preparation/countdown or the first ten race seconds; transition maxima remain in the JSON report.',fontsize=9)
output.parent.mkdir(parents=True,exist_ok=True);fig.savefig(output,dpi=160);plt.close(fig)
