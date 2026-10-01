"""Explicit executing-agent observations of P4 proof pixels, preserved before refinement."""
import concurrent.futures
from common import ART,read_json,write_json,briefs,now,file_lock,make_contact_sheet
from gen import Budget,candidates,generate,fingerprint

CORRECTIONS={
 'p4-barriers':'NOT_TOP_DOWN / WRONG_MATERIAL: previous image shows a metal vertical front wall. Show ONLY the narrow horizontal TOP SURFACE of a low solid concrete wall as seen by a camera exactly above it: a simple long thin grey rectangle, length six times width, sparse concrete pores and tiny chips. No front face, vertical side, panels, slots, ribs or uprights. Background pure magenta.',
 'p4-props':'WRONG_SUBJECT / PALETTE: previous image looks like a decorated wheel with a metal rim and purple paint. Draw only BLACK RUBBER tyre rings from directly above, circular EMPTY OPEN centre filled with the same pure magenta background. No wheel rim, hub, bolts, red pointer, purple paint, labels, stripes or decoration. A plain chunky rubber tyre stack top with concentric tread rings; all foreground near-black charcoal.',
 'p4-pickups':'EXTRA_EMBLEM: previous ammo box adds an unrequested hand-and-arrow badge. Keep ONLY the three large bullet shapes as the entire top decoration. Remove all badges, pictograms, hands, arrows, labels, small symbols and lettering. Box otherwise plain olive with cool-grey latches. Neutral top-down icon, on pure magenta.',
 'p4-effects':'WRONG_SUBJECT / FRAME_BOUNDARY: previous sheet contains guns and vehicle pieces. The output must contain ONLY six floating flash/ember shapes on a single uniform pure magenta field. Absolutely no weapon, muzzle hardware, barrel, vehicle, mechanical object, panel or scenery anywhere. Six widely separated effects, arranged 3 across and 2 down, no drawn cells. Each effect stays inside the middle half of its cell. Top row: tiny ivory spot, medium orange rightward star, large orange rightward star. Bottom row: medium yellow rightward star, two tiny orange sparks, one tiny orange ember. Each has the same centre position within its cell.',
 'p4-portraits':'CROPPED_OR_MARGIN: previous jacket runs off bottom and sides. Reduce the entire head-and-shoulders bust to 65 percent of canvas width and height. Draw an intentional smooth curved bust silhouette ending at upper chest, with a large continuous pure magenta margin BELOW the chest and beside BOTH shoulders. Nothing touches any image edge. Preserve the fictional adult identity and yellow jacket; no full torso.'}
APPROVALS={
 'p4-tiles':'Inspected raw swatch and 256px gates: empty worn asphalt, restrained grain, both axes pass seams, autocorrelation .0865. Direction checked; each remaining material requires its own gates.',
 'p4-decals':'Inspected complete isolated two-streak skid silhouette; suitable decal direction. Small purple accents are a palette issue for final selection, not permission to accept other outputs.',
 'p4-hud':'Inspected empty chamfered HUD frame with red end cap and magenta interior; neutral metallic border, no text. Final extraction must prove interior transparency.'}

def review():
    rows=briefs(ART/'briefs/p4-world.csv');style=read_json(ART/'style.json');budget=Budget()
    with file_lock(ART/'.run.lock',timeout=1):
        jobs=[]
        for batch in list(CORRECTIONS)+list(APPROVALS):
            group=[r for r in rows if r['batch']==batch];row=group[0];old=read_json(candidates(row)[-1])
            if batch in CORRECTIONS:
                if old['attempt']!=1:raise ValueError('review already applied; inspect new proof: '+batch)
                rejection={'asset':row['id'],'image_sha256':old['sha256'],'note':CORRECTIONS[batch],'attempt':old['attempt'],'at':now()}
                write_json(ART/'rejections'/(row['id']+'.json'),rejection);budget.record({'event':'content-rejection',**rejection});jobs.append(row)
            else:
                write_json(ART/'proofs'/(batch+'.json'),{'batch':batch,'input_hash':fingerprint(group,style),'image':old['image'],'sha256':old['sha256'],'verdict':'batch-direction-checked','reviewer':'executing-agent; NOT owner acceptance','note':APPROVALS[batch],'at':now()})
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
            results=list(pool.map(lambda row:generate(row,style,budget,True),jobs))
        make_contact_sheet([{'id':r['asset'],'path':r.get('image'),'verdict':r['status']} for r in results],ART/'contact-sheets/p4-proof-corrections.png','P4 | corrected proofs; inspect before batch approval')
        print(budget.summary())

def approve_current():
    rows=briefs(ART/'briefs/p4-world.csv');style=read_json(ART/'style.json')
    notes={**APPROVALS,
      'p4-barriers':'Corrected proof is a narrow overhead grey concrete top with no front wall. Pixel gates pass. Transfer camera lesson to unused briefs; every corner/module still inspected.',
      'p4-props':'Corrected proof is a plain charcoal rubber ring, no rim, hub or coloured markings, empty magenta opening. Overhead stack-top silhouette supports this batch direction.',
      'p4-pickups':'Final image_edit removes the unwanted hand badge. Three ivory bullet tips remain on an olive box; lower panel blank. Readable pickup direction, individual output semantics still gated.',
      'p4-effects':'Final proof has six isolated visible rightward flashes/embers, no gun or car, and passes boundary/occupancy/pivot/difference gates. Magenta separators key out. This validates the sheet workflow; each different effect still requires frame and semantic review.',
      'p4-portraits':'Corrected proof is a complete, small fictional bust with clear margin below the chest. No lettering; family colours and frontal illustration direction. Extra eyewear differs from initial identity brief and remains visible for final review.',
      'p4-backdrops':'Inspected quiet central ground area and industrial structures at perimeter, no text or vehicle. Composition direction is usable; static background camera/lighting must still be individually reviewed and owner quality is pending.'}
    for batch in dict.fromkeys(r['batch'] for r in rows):
        group=[r for r in rows if r['batch']==batch];old=read_json(candidates(group[0])[-1])
        write_json(ART/'proofs'/(batch+'.json'),{'batch':batch,'input_hash':fingerprint(group,style),'image':old['image'],'sha256':old['sha256'],'verdict':'batch-direction-checked','reviewer':'executing-agent; NOT owner acceptance','note':notes[batch],'at':now()})

if __name__=='__main__':
    import sys
    (approve_current if '--approve-current' in sys.argv else review)()
