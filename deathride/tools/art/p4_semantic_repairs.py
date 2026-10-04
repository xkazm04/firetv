"""Targeted response to corroborated visual/model findings after the full batch."""
import concurrent.futures
from common import ART,read_json,write_json,briefs,now,file_lock,make_contact_sheet
from gen import Budget,candidates,generate

NOTES={
 'p4-barriers-metal-corner-v1':'NOT_TOP_DOWN: visible bevelled side faces make the previous L corner look three-dimensional. Draw a perfectly FLAT two-dimensional L-shaped steel top diagram: two equal-width grey rectangular arms, exact square inside and outside corners, one plane only, squared ends. Two thin grey longitudinal rib marks ON the same flat plane. No bevel, thickness, vertical side wall, perspective, hazard paint or cast shadow.',
 'p4-barriers-hazard-corner-v1':'NOT_TOP_DOWN: previous corner has a visible vertical side face. Draw ONE perfectly FLAT planar L shape with equal-width arms and exact square inside/outside corners. Yellow/charcoal diagonal hazard bands are printed on this one top plane. No edge thickness, bevel, extruded wall, depth, side face, vertical plane or cast shadow.',
 'p4-props-cone-v1':'WRONG_SUBJECT: previous cone resembles a segmented lifebuoy. Show an orange traffic cone from DIRECTLY ABOVE as a small SOLID ORANGE central tip surrounded by smooth concentric orange rings, one THIN continuous ivory circular ring, and a dark square base. The centre is solid orange, never a hole. No alternating coloured wedge segments, no lifebuoy, no screws, no metal and no side profile.',
 'p4-decals-impact-v1':'WRONG_SUBJECT: previous impact looks like a gear with straight mechanical arms. Show a small irregular NEAR-BLACK impact scuff with sparse scattered COOL-GREY chips and several short ragged scrape streaks of different lengths at irregular angles. Flat blood-free ground decal, organic asymmetrical damage mark, no gear, hub, metal object, star, spokes or mechanical symmetry.'}

def run():
    rows=[r for r in briefs(ART/'briefs/p4-world.csv') if r['id'] in NOTES];budget=Budget();style=read_json(ART/'style.json')
    with file_lock(ART/'.run.lock',timeout=1):
        for row in rows:
            old=read_json(candidates(row)[-1])
            if old['attempt']!=1:raise ValueError('semantic correction already attempted')
            rejection={'asset':row['id'],'image_sha256':old['sha256'],'note':NOTES[row['id']],'attempt':1,'at':now()}
            write_json(ART/'rejections'/(row['id']+'.json'),rejection);budget.record({'event':'content-rejection',**rejection})
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(lambda row:generate(row,style,budget,True),rows))
        make_contact_sheet([{'id':r['asset'],'path':r.get('image'),'verdict':r['status']} for r in results],ART/'contact-sheets/p4-semantic-repairs.png','P4 | camera, object and decal corrections')
        print(budget.summary())

if __name__=='__main__':run()
