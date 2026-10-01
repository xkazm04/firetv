"""Offline authored-plan compiler. No randomness; checked-in CSVs ship, not this script."""
from pathlib import Path
import math, csv

DATA=Path(__file__).resolve().parents[1]/'core/src/main/resources/data'
# name, theme, half straight, bend radius, top/bottom displacement, tier band
PLANS=[
 ('slagway','Slagway','industrial',100,48,12,-8,0,1),
 ('railcut','Rail Cut','industrial',145,44,-8,14,1,2),
 ('furnace','Furnace Mile','industrial',180,55,10,-12,2,4),
 ('crown','Crown Speedway','industrial',170,65,-12,8,3,4),
 ('scree','Scree Run','quarry',75,48,15,-4,0,1),
 ('ballast','Ballast Bend','quarry',110,58,-15,10,1,2),
 ('cutface','Cut Face','quarry',135,50,8,16,2,3),
 ('haulroad','Haul Road','quarry',175,60,-12,-8,3,4),
 ('saltline','Salt Line','desert',160,48,8,-8,0,2),
 ('dustwake','Dust Wake','desert',110,62,14,12,1,3),
 ('mirage','Mirage Loop','desert',140,54,-16,10,2,4),
 ('sunspike','Sunspike','desert',185,58,12,-14,3,4),
 ('sluice','Sluice Gate','wetland',85,56,15,8,0,1),
 ('reedcut','Reed Cut','wetland',115,48,-10,-14,1,2),
 ('spillway','Spillway','wetland',155,62,16,-8,2,3),
 ('lowwater','Low Water','wetland',130,70,-14,12,3,4),
 ('ridge','Ridge Wire','alpine',80,50,-12,6,1,2),
 ('frostline','Frost Line','alpine',120,60,16,-12,2,4),
 ('highpass','High Pass','alpine',150,54,-14,-10,3,4),
 ('summit','Summit Return','alpine',105,72,12,6,3,4),
]

def write(name,header,rows):
 with (DATA/name).open('w',newline='',encoding='utf-8') as f:
  w=csv.writer(f,lineterminator='\n');w.writerow(header.split(','));w.writerows(rows)

def bake(nodes):
 points=[];n=len(nodes)
 for j in range(n):
  for step in range(20):
   t=step/20
   def axis(k):
    a,b,c,d=[nodes[i%n][k] for i in [j-1,j,j+1,j+2]]
    return .5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t)
   points.append((axis(0),axis(1)))
 lengths=[math.dist(points[i],points[(i+1)%len(points)]) for i in range(len(points))]
 arc=[0]
 for v in lengths:arc.append(arc[-1]+v)
 headings=[math.atan2(points[(i+1)%len(points)][1]-p[1],points[(i+1)%len(points)][0]-p[0]) for i,p in enumerate(points)]
 curv=[abs((h-headings[i-1]+math.pi)%(2*math.pi)-math.pi)/((lengths[i]+lengths[i-1])/2) for i,h in enumerate(headings)]
 return arc,curv

def longest_run(arc,curv,predicate):
 runs=[];start=None
 for i,c in enumerate(curv+[float('inf')]):
  if i<len(curv) and predicate(c):
   if start is None:start=i
  elif start is not None:
   runs.append((arc[i]-arc[start],start,i));start=None
 return max(runs)

def main():
 originals=list(csv.DictReader((DATA/'tracks.csv').open()))[:5]
 catalog=[[r[k] for k in ['id','name','lesson','startFraction','theme']] for r in originals]
 features=[];pools=[[r['id'],0,4] for r in originals]
 for index,(id,name,theme,h,r,top,bottom,low,high) in enumerate(PLANS):
  q=math.sqrt(.5)*r
  n=math.ceil(2*h/(r*.7))
  xy=[(-h+2*h*j/n,r+top*math.sin(math.pi*j/n)**2) for j in range(n+1)]
  xy += [(h+q,q),(h+r,0),(h+q,-q)]
  bottomStart=len(xy)
  xy += [(h-2*h*j/n,-r+bottom*math.sin(math.pi*j/n)**2) for j in range(n+1)]
  bottomEnd=len(xy)-1
  xy += [(-h-q,-q),(-h-r,0),(-h-q,q)]
  nodes=[]
  for j,(x,y) in enumerate(xy):
   surface='Asphalt'
   if theme=='quarry' and j in (n+1,n+2,n+3,len(xy)-3):surface='Gravel'
   if theme=='desert' and j in (len(xy)-3,len(xy)-2):surface='Gravel'
   if theme=='wetland' and j==len(xy)-2:surface='Oil'
   if theme=='alpine' and j==n+3:surface='Ice'
   nodes.append([round(x,5),round(y,5),12+index%3,surface,0])
  write(f'tracks/{id}.csv','xM,yM,halfWidthM,surface,aiLaneM',nodes+[nodes[0]])
  arc,curv=bake(xy);length=arc[-1]
  # Place features in measured geometric runs; keep margins away from junctions.
  clear=[c if bottomStart*20<=i<bottomEnd*20 else float('inf') for i,c in enumerate(curv)]
  _,a,b=longest_run(arc,clear,lambda c:c<.009)
  accelStart=arc[a]+8;accelEnd=arc[b]-8
  # First clockwise bend, with its whole middle arc available for an inside line.
  shortcutStart=arc[(n+1)*20]+5;shortcutEnd=arc[(n+3)*20]-5
  features.extend([[id,'acceleration',round(accelStart/length,8),round(accelEnd/length,8),0,4,'Asphalt','gantry',35],
                   [id,'shortcut',round(shortcutStart/length,8),round(shortcutEnd/length,8),-5,4,'Gravel','split-marker',35]])
  # Grid positions measured in meters so longer circuits do not stretch the grid.
  spots=[['checkpoint',f,0] for f in [0,.2,.45,.7,.88]]
  spots += [['grid',round(-back/length,8),lane] for back in [12,28,44] for lane in [-3.5,3.5]]
  spots += [['ammo',.36,-3],['repair',.67,3],['hazard',.79,4],['cash',.54,3]]
  write(f'tracks/{id}-spots.csv','kind,fraction,laneM',spots)
  catalog.append([id,name,'Use the clear straight and weigh the gravel inside line',.10,theme]);pools.append([id,low,high])
 write('tracks.csv','id,name,lesson,startFraction,theme',catalog)
 write('track-features.csv','course,kind,start,end,laneM,widthM,surface,landmark,warningM',features)
 write('track-pools.csv','course,minTier,maxTier',pools)
 # W7 compatibility: new practice circuits are available immediately; C4 replaces the schedule.
 unlocks=list(csv.DictReader((DATA/'career-unlocks.csv').open()))
 existing={u['id'] for u in unlocks if u['kind']=='track'}
 unlocks += [dict(kind='track',id=p[0],afterRounds='0',name=p[1]) for p in PLANS if p[0] not in existing]
 write('career-unlocks.csv','kind,id,afterRounds,name',[[u[k] for k in ['kind','id','afterRounds','name']] for u in unlocks])

if __name__=='__main__':main()
