"""Export the legal PR ceiling separately from conditional career medians."""
import csv,json,sys
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
root=Path(__file__).resolve().parents[1]
out=root/(sys.argv[1] if len(sys.argv)>1 else 'evidence/gameplay/campaign/final')
rows=list(csv.DictReader((out/'headroom.csv').open()))
curve=list(csv.DictReader((root/'core/src/main/resources/data/career-curve.csv').open()))
data=[]
for event,car in [(21,'Flint'),(28,'Quill')]:
    a=[r for r in rows if int(r['event'])==event]
    player=float(next(r for r in a if r['car']==car)['maximumLegalPR'])
    ceiling=max(float(r['maximumLegalPR']) for r in a)
    target=float(curve[event-1]['ratioTarget'])
    data.append(dict(event=event,retainedCar=car,playerCeiling=player,opponentCeiling=ceiling,
                     target=target,requiredField=player/target,minimumRatio=player/ceiling))
plt.rcParams.update({'figure.facecolor':'#eee7d6','axes.facecolor':'#faf6ed','font.size':11})
fig,ax=plt.subplots(figsize=(10,5),layout='constrained')
for i,r in enumerate(data):
    ax.barh(i+.18,r['opponentCeiling'],height=.3,color='#646447',label='Strongest possible legal opponent' if i==0 else None)
    ax.barh(i-.18,r['requiredField'],height=.3,color='#9d422a',label='Field PR required for a 0.89 ratio' if i==0 else None)
    ax.text(r['opponentCeiling']+4,i+.18,f"{r['opponentCeiling']:.1f}",va='center')
    ax.text(r['requiredField']+4,i-.18,f"{r['requiredField']:.1f}",va='center')
ax.set_yticks([0,1],[f"Vex: developed Flint\n{data[0]['playerCeiling']:.1f} PR",f"Mica: developed Quill\n{data[1]['playerCeiling']:.1f} PR"])
ax.set_xlim(0,max(max(r['opponentCeiling'],r['requiredField']) for r in data)*1.12);ax.set_xlabel('Derived performance rating (shared rules, no extra rival power)')
ax.set_title('Legal upgrade ceilings and the field rating required for the planned dip',fontsize=13)
ax.set_ylim(-.85,1.6);ax.legend(loc='lower left',fontsize=9);ax.grid(axis='x',alpha=.2)
fig.savefig(out/'legal-headroom.png',dpi=160);plt.close(fig)
(out/'headroom-scope.json').write_text(json.dumps({'scope':'Exhaustive legal part combinations at each qualifier, ignoring purchase cost. A mixed field cannot exceed its strongest legal single opponent. These are ceiling bounds, not cohort medians or a claim that every career is fully developed.','bounds':data},indent=2))
