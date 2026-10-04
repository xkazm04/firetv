"""Standalone charts from the recorded report, with missing/censored outcomes kept explicit."""
from pathlib import Path
import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

root=Path(__file__).resolve().parents[1];out=root/'evidence/ai/z3'
r=json.loads((out/'report.json').read_text())
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':10,'svg.fonttype':'none','axes.spines.top':False,'axes.spines.right':False})
before='#77736b';after='#186957';warning='#a84d28'
fig,ax=plt.subplots(figsize=(11,4.8))
for version,color,label in [('before',before,'Before'),('after',after,'After')]:
    events=r['versions'][version]['physical']['events'];x=[e['number'] for e in events]
    y=[e['bands'].get('0',{}).get('finishSeconds',{}).get('median') for e in events]
    ax.plot(x,y,'o-',color=color,label=label,markersize=3)
for i in (1,8,15,22,29):ax.add_patch(Rectangle((i-.45,120),.9,60,facecolor=after,alpha=.15,edgecolor='none'))
for i in (7,14,21,28):ax.add_patch(Rectangle((i-.45,240),.9,120,facecolor=after,alpha=.15,edgecolor='none'))
ax.set(xlabel='Ordinary event number (35 is the separate elimination duel)',ylabel='Median successful finish, seconds',xticks=range(1,35),xlim=(.4,34.6))
ax.tick_params(axis='x',labelsize=8);ax.legend();ax.grid(axis='y',alpha=.2)
fig.suptitle('Stock Club lead, current-tier peers: fresh before and after')
fig.text(.08,.02,'Shading: opening 120–180 s and boss-final 240–360 s targets. Wrecks/timeouts remain counted in report.json.',fontsize=9)
fig.tight_layout(rect=(0,.05,1,.96));fig.savefig(out/'race-times.svg');plt.close(fig)

fig,ax=plt.subplots(figsize=(11,4.8));labels=[]
for buyer_index,buyer in enumerate(('race','pr')):
    for skill in range(3):
        x=buyer_index*3+skill;labels.append(('Race-aware' if buyer=='race' else 'PR')+' / '+('Rookie','Club','Pro')[skill])
        for offset,version,color in [(-.18,'before',before),(.18,'after',after)]:
            g=r['versions'][version]['cohorts'][buyer]['groups'][skill];value=g['completedHoursMedian']
            if value is None:ax.text(x+offset,.04,'none',ha='center',va='bottom',rotation=90,fontsize=8,color=color)
            else:
                ax.bar(x+offset,value,width=.34,color=color,label=version.title() if x==0 else None)
                ax.text(x+offset,value+.03,str(g['completed']),ha='center',fontsize=8,color=color)
ax.set(xticks=range(6),xticklabels=labels,ylabel='Median driving hours among completed careers',ylim=(0,None));ax.tick_params(axis='x',labelsize=8)
ax.plot([],[],color=before,lw=8,label='Before');ax.plot([],[],color=after,lw=8,label='After');ax.legend();ax.grid(axis='y',alpha=.2)
fig.suptitle('Completion time is conditional on finishing; labels show completed counts')
fig.text(.07,.02,'2,000 careers per buyer/version, split across three lead proxies. “none” means no completion, not zero hours. Menus/pit time unmeasured.',fontsize=8)
fig.tight_layout(rect=(0,.06,1,.95));fig.savefig(out/'career-hours.svg');plt.close(fig)

fig,ax=plt.subplots(figsize=(11,6));rows=r['roster']['tiers']
ax.axvspan(.45,.55,color=after,alpha=.1)
for i,row in enumerate(rows):
    values=list(row['mixedWinnerShare'].items());(first,a),(second,b)=values
    ax.barh(i,a,color=after);ax.barh(i,b,left=a,color='#b97744')
    ax.text(.015,i,f'{first} {a:.1%}',va='center',color='white',fontsize=9)
    ax.text(.985,i,f'{second} {b:.1%}',ha='right',va='center',color='white',fontsize=9)
    if not row['dominancePass']:ax.text(1.01,i,'MISS',va='center',color=warning,fontweight='bold')
ax.axvline(.45,color='#222',ls=':',lw=1);ax.axvline(.55,color='#222',ls=':',lw=1)
ax.set(yticks=range(len(rows)),yticklabels=[f'Tier {x["tier"]+1} / {x["build"]}' for x in rows],xlim=(0,1),xlabel='Class wins / all races, weighted by the declared course mix')
ax.invert_yaxis();fig.suptitle('Contested class balance: six slots crossed, 55% maximum winner share')
fig.text(.07,.02,'334 paired seeds × six rotations per tier/course/build. Unresolved rows and the independent homogeneous check stay in report.json.',fontsize=8)
fig.tight_layout(rect=(0,.04,.96,.95));fig.savefig(out/'class-wins.svg');plt.close(fig)
print('Wrote three standalone SVG measurement charts')
