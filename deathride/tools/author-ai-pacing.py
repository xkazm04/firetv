"""Original course/pacing authoring. Inputs are retained; runtime ships the resulting CSVs."""
import csv
import importlib.util
import math
from pathlib import Path
import shutil
import statistics
import sys

ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'core/src/main/resources/data'
BEFORE=ROOT/'evidence/ai/z1/before-data'
spec=importlib.util.spec_from_file_location('tracks',ROOT/'tools/author-tracks.py')
tracks=importlib.util.module_from_spec(spec);spec.loader.exec_module(tracks)

def read(name,base=DATA):
    return list(csv.DictReader((base/(name+'.csv')).open(encoding='utf-8')))

def write(name,rows):
    with (DATA/(name+'.csv')).open('w',newline='',encoding='utf-8') as f:
        w=csv.DictWriter(f,fieldnames=list(rows[0]),lineterminator='\n');w.writeheader();w.writerows(rows)

def timing(rows,course,tier):
    values=[float(r['flyingLapSeconds']) for r in rows if r['course']==course and int(r['tier'])==tier and r['skill']=='Club']
    assert len(values)==4 and min(values)>0,(course,tier,values)
    return statistics.mean(values)

def geometry():
    if not BEFORE.exists():shutil.copytree(DATA,BEFORE)
    measures=read('laps-before',ROOT/'evidence/ai/z1')
    events=read('campaign',BEFORE)
    catalog=read('tracks',BEFORE);features=read('track-features',BEFORE)
    pools=read('track-pools',BEFORE);unlocks=read('career-unlocks',BEFORE)
    obstacles=read('track-obstacles',BEFORE)
    # The qualifier introduces the extended final route; IDs and story order are stable.
    finals=[('slagway-final','Slagway Long Cut','industrial',0,1,270,64,20),
            ('foundry-final','Foundry Backworks','industrial',1,2,300,66,24),
            ('mirage-final','Mirage Crosswind','desert',2,3,315,68,26),
            ('frostline-final','Frostline High Loop','alpine',3,4,320,62,38)]
    for act,final in enumerate(finals):
        events[act*7+5]['course']=final[0];events[act*7+6]['course']=final[0]
    # Crown's last lap event previews the final arena; the fight keeps the existing Crown road.
    events[33]['course']='frostline-final'
    # Keep every original course in the 35-event campaign: the narrow foundry opener
    # teaches lane discipline before Rail Cut's longer pressure visit.
    events[7]['course']='crucible'
    events[11]['course']='railcut'
    # Lengthen short non-final courses in metres. Preserve transverse radii/widths and feature roles.
    need={}
    for i,e in enumerate(events):
        if e['type']!='LAPS' or e['course'].endswith('-final'):continue
        target=150+25*(i%7)
        ratio=target/(6*timing(measures,e['course'],int(e['playerTier'])))
        need[e['course']]=max(need.get(e['course'],1),ratio)
    changes=[]
    for course,ratio in need.items():
        if ratio<=1.03:continue
        # Extending longitudinal road adds time without making every corner easier.
        scale=1+(ratio-1)*1.8
        nodes=read('tracks/'+course,BEFORE)
        for n in nodes:
            n['xM']=f"{float(n['xM'])*scale:.5f}"
            if course in ('redline','runoff'):n['yM']=f"{float(n['yM'])*math.sqrt(scale):.5f}"
        if course in ('redline','runoff'):
            # Rebuild a long straight as a broad double bend; width stays in metres.
            a,b=nodes[0],nodes[1]
            amplitude=14 if course=='redline' else 8
            for fraction,offset in ((.25,amplitude),(.5,-amplitude),(.75,amplitude)):
                nodes.insert(nodes.index(b),{**a,'xM':float(a['xM'])+(float(b['xM'])-float(a['xM']))*fraction,
                    'yM':float(a['yM'])+(float(b['yM'])-float(a['yM']))*fraction+offset})
        write('tracks/'+course,nodes)
        xy=[(float(n['xM']),float(n['yM'])) for n in nodes[:-1]]
        arc,curv=tracks.bake(xy);length=arc[-1]
        spots=read('tracks/'+course+'-spots',BEFORE)
        oldLength=float(next(r['lengthM'] for r in measures if r['course']==course))
        for s in spots:
            if s['kind']=='grid':s['fraction']=f"{float(s['fraction'])*oldLength/length:.8f}"
        write('tracks/'+course+'-spots',spots)
        # Existing feature fractions track their original spline spans in the new bake.
        oldNodes=read('tracks/'+course,BEFORE)
        oldArc,_=tracks.bake([(float(n['xM']),float(n['yM'])) for n in oldNodes[:-1]])
        for f in features:
            if f['course']!=course:continue
            for k in ('start','end'):
                oldS=float(f[k])*oldArc[-1]
                j=next(j for j in range(len(oldArc)-1) if oldArc[j+1]>=oldS)
                frac=(oldS-oldArc[j])/(oldArc[j+1]-oldArc[j])
                f[k]=f'{(arc[j]+frac*(arc[j+1]-arc[j]))/length:.8f}'
        # Keep existing physical scenery on the same spline segment after lengthening.
        for o in obstacles:
            if o['course']!=course:continue
            oldS=float(o['fraction'])*oldArc[-1]
            j=next(j for j in range(len(oldArc)-1) if oldArc[j+1]>=oldS)
            frac=(oldS-oldArc[j])/(oldArc[j+1]-oldArc[j])
            if course in ('redline','runoff'):
                at=(j+frac)*4 if j<20 else j+frac+60
                j=int(at);frac=at-j
            o['fraction']=f'{(arc[j]+frac*(arc[j+1]-arc[j]))/length:.8f}'
        changes.append(dict(course=course,kind='longitudinal extension',xScale=scale,lengthM=length))
    for act,(id,name,theme,low,high,h,r,amplitude) in enumerate(finals):
        n=16;q=math.sqrt(.5)*r
        xy=[(-h+2*h*j/n,r+amplitude*math.sin(2*math.pi*j/n)) for j in range(n+1)]
        xy += [(h+q,q),(h+r,0),(h+q,-q)]
        bottomStart=len(xy)
        xy += [(h-2*h*j/n,-r-8*math.sin(math.pi*j/n)**2) for j in range(n+1)]
        bottomEnd=len(xy)-1
        xy += [(-h-q,-q),(-h-r,0),(-h-q,q)]
        nodes=[]
        for j,(x,y) in enumerate(xy):
            surface='Gravel' if j in (4,5,n+2) else 'Asphalt'
            if theme=='alpine' and j==n+3:surface='Ice'
            nodes.append(dict(xM=round(x,5),yM=round(y,5),halfWidthM=13,surface=surface,aiLaneM=0))
        write('tracks/'+id,nodes+[nodes[0]])
        arc,curv=tracks.bake(xy);length=arc[-1]
        clear=[v if bottomStart*20<=i<bottomEnd*20 else math.inf for i,v in enumerate(curv)]
        _,a,b=tracks.longest_run(arc,clear,lambda v:v<.009)
        for kind,start,end,lane,surface,landmark in [
            ('acceleration',arc[a]+8,arc[b]-8,0,'Asphalt','gantry'),
            ('shortcut',arc[(n+1)*20]+5,arc[(n+3)*20]-5,-5,'Gravel','split-marker')]:
            features.append(dict(course=id,kind=kind,start=round(start/length,8),end=round(end/length,8),laneM=lane,widthM=4,surface=surface,landmark=landmark,warningM=35))
        spots=[dict(kind='checkpoint',fraction=f,laneM=0) for f in (0,.2,.45,.7,.88)]
        spots += [dict(kind='grid',fraction=round(-back/length,8),laneM=lane) for back in (12,28,44) for lane in (-3.5,3.5)]
        spots += [dict(kind=kind,fraction=f,laneM=lane) for kind,f,lane in [('ammo',.36,-3),('repair',.67,3),('cash',.54,3)]]
        write('tracks/'+id+'-spots',spots)
        catalog.append(dict(id=id,name=name,lesson='Read the double bend and loose approach before the long return',startFraction=.10,theme=theme))
        pools.append(dict(course=id,minTier=low,maxTier=high))
        unlocks.append(dict(kind='track',id=id,afterRounds=act*7+5,name=name))
        for j,(definition,f,lane) in enumerate([('rubble',.24,11.8),('tyres-scattered',.61,-11.8),('tree-decoration',.8,17)]):
            obstacles.append(dict(course=id,definition=definition,fraction=f,lane=lane,heading=0,seed=104000+j+act*71))
        changes.append(dict(course=id,kind='new double-bend final',xScale=1,lengthM=length))
    for unlock in unlocks:
        if unlock['kind']=='track':
            visits=[i for i,e in enumerate(events) if e['course']==unlock['id']]
            if visits:unlock['afterRounds']=min(int(unlock['afterRounds']),min(visits))
    for name,rows in [('tracks',catalog),('track-features',features),('track-pools',pools),('career-unlocks',unlocks),('track-obstacles',obstacles),('campaign',events)]:write(name,rows)
    write('course-redesigns',changes)

def schedule(path):
    measures=read(path.stem,path.parent)
    rules={r['key']:float(r['value']) for r in read('pacing-rules')}
    courses=[]
    for course in read('tracks'):
        for tier in range(5):
            rows=[r for r in measures if r['course']==course['id'] and int(r['tier'])==tier and r['skill']=='Club']
            if not rows:continue
            first=rows[0]
            courses.append(dict(course=course['id'],tier=tier,referenceLapSeconds=timing(measures,course['id'],tier),
                lengthM=first['lengthM'],nodes=first['nodes'],turnChanges=first['turnChanges'],surfaceChanges=first['surfaceChanges'],features=first['features'],obstacles=first['obstacles']))
    write('course-pacing',courses)
    events=read('campaign');targets=[]
    for i,e in enumerate(events):
        elimination=e['type']=='ELIMINATION'
        target=0 if elimination else rules['firstTargetSeconds']+(rules['finalTargetSeconds']-rules['firstTargetSeconds'])*(i%7)/6
        lap=timing(measures,e['course'],int(e['playerTier']))
        laps=0 if elimination else max(int(rules['minimumLaps']),min(int(rules['maximumLaps']),math.floor(target/lap+.5)))
        e['laps']=laps
        targets.append(dict(event=e['id'],targetSeconds=target,basis='elimination' if elimination else 'solo-stock-Club'))
    write('campaign',events);write('event-pacing',targets)
    print('ordinary laps',sum(int(e['laps']) for e in events))

if __name__=='__main__':
    if sys.argv[1]=='geometry':geometry()
    elif sys.argv[1]=='schedule':schedule(Path(sys.argv[2]))
