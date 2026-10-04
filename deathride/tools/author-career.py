"""Compile the original Ash Circuit story/schedule into the project's flat CSV format."""
from pathlib import Path
import csv

D=Path(__file__).resolve().parents[1]/'core/src/main/resources/data'
def write(name,header,rows):
    assert all(',' not in str(cell) and '\n' not in str(cell) for row in rows for cell in row)
    with (D/name).open('w',encoding='utf-8',newline='') as f:
        w=csv.writer(f,lineterminator='\n');w.writerow(header.split(','));w.writerows(rows)

ACTS=[
 ('scrap','Scrap League','The Yards','rook',['foundry','slagway','scree','sluice','switchback','foundry','slagway'],[367,370,374,380,390,405,505],1.6,0),
 ('foundry','Foundry Cup','Foundry row','ox',['railcut','ballast','reedcut','ridge','switchback','redline','foundry'],[505,520,535,550,570,590,620],2.2,350),
 ('salt','Salt Flats Series','The flats and the quarry','vex',['saltline','dustwake','cutface','mirage','redline','ballast','mirage'],[620,625,630,635,640,645,655],2.9,500),
 ('switchback','Switchback Circuit','The mountain road','mica',['frostline','highpass','summit','runoff','spillway','crucible','frostline'],[655,660,665,670,680,690,705],3.1,650),
 ('crown','The Crown','Marrow speedway','marrow',['furnace','crown','lowwater','haulroad','sunspike','summit','crown'],[705,705,705,705,705,705,635],3.3,800),
]
STORY=[
 [
  ('Ash on the key','Your sibling left a burnt garage.','Marrow kept the debt alive.','Rook says the Yards will finish what the fire began.'),
  ('The first invoice','The engine turns over at last.','A race receipt buys a part.','Every payment leaves another question in the ledger.'),
  ('Loose ground','Scree hides yesterday under fresh stone.','A mechanic remembers your sibling passing through.','The car was damaged before the garage burned.'),
  ('A sealed box','Relay offers work without a signature.','Deliveries pay better when nobody asks what is inside.','You can refuse and still keep racing.'),
  ('A local debt','Rook once owed this same garage.','He calls the debt a lesson.','His hands shake when Marrow is mentioned.'),
  ('Numbers under soot','A scorched page survives behind a tool rack.','Two race entries share one payment number.','Someone collected the same debt twice.'),
  ('Rook at the gate','Rook blocks the road out of the Yards.','Beat his field and the next division opens.','He will remember who sent him into the barrier.'),
 ],
 [
  ('Foundry row','The furnaces light the road all night.','Ox races to keep his crew employed.','Marrow owns the loan on their machines too.'),
  ('Easy money','A lender offers an advance with a fixed fee.','The ledger makes the price plain.','The safer climb needs no signature.'),
  ('Weight of a promise','Ox gives no ground on a straight.','His heavy car needs room to turn.','The crew watches every brake light.'),
  ('A second name','Your sibling used a false name at Ridge Wire.','Mica recognizes the handwriting on the entry form.','She pockets the page before you can ask why.'),
  ('The crew account','A crew wage appears in the debt book as a race penalty.','The money never reached the workers.','Ox has started checking your sums.'),
  ('Borrowed steel','Relay finds a chassis with an honest serial plate.','Trading the old car leaves its parts behind.','Choose what the next field demands.'),
  ('Ox holds the line','Ox knows the books are wrong.','He needs proof that survives Marrow.','Earn his respect on the road first.'),
 ],
 [
  ('White horizon','The salt hides distance and danger alike.','Vex trusts speed more than people.','Your sibling followed him to the quarry.'),
  ('A dry footprint','A shelter holds a glove from your garage.','The stitching is fresh.','Your sibling survived the fire.'),
  ('Switch in the crate','A shipment contains the wrong ammunition.','Sabotage has a visible cost and a named target.','You can win without buying it.'),
  ('Vex runs ahead','Vex saw a car leave after the last official race.','Its driver carried a copy of Marrow books.','He will tell you where for a clean contest.'),
  ('The missing lap','An official result omits an entire lap.','The payment still lists a full race.','The same account number appears again.'),
  ('Relay at dusk','Relay admits moving sealed ledgers for the league.','One delivery went north instead of to Marrow.','Mica arranged the change.'),
  ('Vex opens the throttle','Vex turns the flats into a wager.','Stay close through the bends and deny his free straight.','The northbound address is the prize he cannot sell.'),
 ],
 [
  ('The mountain road','Cold air reaches the engine before dawn.','Mica waits above the last town.','She has kept your sibling hidden through the season.'),
  ('The books','The duplicate debts paid for Marrow private fleet.','A wreck became a new fee on the next page.','Your garage burned when the copies disappeared.'),
  ('A voice on the line','Your sibling calls from a safe workshop.','The escape cost other drivers their cars.','Winning the circuit is the only public way to expose it.'),
  ('Water over ink','Mica divides the evidence among the crews.','One lost race can no longer erase it.','The mountain still demands an exact line.'),
  ('A remembered wreck','A rival carries a grudge into the next grid.','The passing gets sharper.','The car obeys the same rules as before.'),
  ('No private deal','Marrow offers to clear only your family debt.','The crew accounts would stay buried.','You send the offer back unsigned.'),
  ('Mica tests the line','Mica will not hand you her place.','She wants a driver who can finish the job.','Beat the mountain field and take the books to the Crown.'),
 ],
 [
  ('Inside the gates','Marrow opens his own speedway to the circuit.','The crews arrive with copies of the ledger.','The cameras now belong to everyone.'),
  ('The house cars','The league drivers bring the cars they could afford.','Victories paid for their parts.','Wrecks cost them the same way they cost you.'),
  ('A public account','Relay reads the duplicate entries over the pit radio.','Ox confirms the missing wages.','Rook finally names the collector.'),
  ('The last shipment','Your sibling sends the original ledger.','The optional contracts have bought allies or grudges.','None can change the rules of the final race.'),
  ('Vex returns','Vex gives the crews an unedited race recording.','The missing lap is there.','Marrow has run out of numbers to hide behind.'),
  ('Before the Crown','Mica checks your car without touching the setup.','The next grid has two places.','Spend what you have earned and choose your line.'),
  ('Marrow on his road','Marrow takes the second grid slot himself.','Win the duel and the circuit sees the whole account.','Your sibling waits at the garage with a new key.'),
 ],
]

def main():
    # Keep measured annotations only while the authored schedule inputs are identical.
    curve_path=D/'career-curve.csv'
    previous=list(csv.DictReader(curve_path.open(encoding='utf-8'))) if curve_path.exists() else []
    if not (D/'legacy-campaign.csv').exists():(D/'legacy-campaign.csv').write_bytes((D/'campaign.csv').read_bytes())
    previous_events=list(csv.reader((D/'campaign.csv').open(encoding='utf-8')))[1:]
    events=[];cards=[];curve=[];cups=[]
    for act,(id,name,place,boss,courses,targets,reward,grant) in enumerate(ACTS):
        cups.append([id,name,14,32,49,260+act*60,420+act*80,600+act*120])
        for j,course in enumerate(courses):
            k=act*7+j+1;event=f'{id}-{j+1}';title,*lines=STORY[act][j]
            events.append([event,title,id,course,event,int(j==6),int(k==35),18 if act==0 else 21 if act==1 else 24])
            cards.append([event,title,f'ash-{id}',*lines])
            ratio=.89 if j==0 or j==6 else [.89,.95,.98,1.0,.98,.96,.89][j]
            if k==35:ratio=1.05
            curve.append([event,k,act,targets[j],ratio,reward,grant if j==0 else 900+act*200 if j==6 else 40,min(4,act+1) if j==6 else act])
    write('campaign.csv','id,name,cup,course,story,boss,duel,laps',events)
    write('championships.csv','id,name,bronzePoints,silverPoints,goldPoints,bronzeBonus,silverBonus,goldBonus',cups)
    write('story-cards.csv','id,title,backdropKey,line1,line2,line3',cards)
    header='event,number,act,fieldTarget,ratioTarget,rewardScale,rivalGrant,fieldTier'
    extras=[key for key in previous[0] if key not in header.split(',')] if previous else []
    if previous_events==[[str(v) for v in row] for row in events] and len(previous)==len(curve) and all(all(old[key]==str(value) for key,value in zip(header.split(','),row)) for old,row in zip(previous,curve)):
        for row,old in zip(curve,previous):row.extend(old[key] for key in extras)
        if extras:header+=','+','.join(extras)
    write('career-curve.csv',header,curve)
    tracks=list(csv.DictReader((D/'tracks.csv').open(encoding='utf-8')))
    gates={r['id']:next((i for i,e in enumerate(events) if e[3]==r['id']),0) for r in tracks}
    cars=list(csv.DictReader((D/'cars.csv').open(encoding='utf-8')));ranks={'rookie':0,'club':1,'pro':2,'elite':3,'champion':4}
    write('career-unlocks.csv','kind,id,afterRounds,name',[["car",c['id'],ranks[c['tier']]*7,c['id']] for c in cars]+[["track",r['id'],gates[r['id']],r['name']] for r in tracks])
    assert {e[3] for e in events}=={r['id'] for r in tracks}

if __name__=='__main__':main()
