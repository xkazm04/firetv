"""Repair measured C2 handoff defects and the final steel-corner camera mismatch."""
import concurrent.futures
from common import ART,read_json,write_json,briefs,now,file_lock,make_contact_sheet
from family import write_csv
from gen import Budget,candidates,generate

def run():
    rows=briefs(ART/'briefs/p4-world.csv');changes=read_json(ART/'brief-amendments.json');jobs=[];budget=Budget();style=read_json(ART/'style.json')
    concrete=next(r for r in rows if r['id']=='p4-barriers-concrete-corner-v1');anchor=read_json(candidates(concrete)[-1])
    notes={
      'p4-landmarks-gantry-v1':'NOT_TOP_DOWN: the previous structure shows feet BELOW the crossbeam like a front elevation. In strict overhead plan view the shape is a horizontal DUMBBELL with SQUARE END PADS: one thin horizontal grey bar connecting two square olive pads centred on the SAME horizontal centreline, one at its far LEFT end and one at its far RIGHT end. No part extends below like a leg. Orange/ivory bands only near the two ends. No front-facing walls, hanging feet, vertical legs, depth or shadows.',
      'p4-landmarks-sluice-v1':'CROPPED_OR_MARGIN: the rail ends touch the image edges. Reduce the ENTIRE sluice assembly to sixty percent of the canvas width and height, centred, with at least fifteen percent pure magenta clear space on ALL FOUR SIDES. Both parallel rails and all gate pieces completely visible. Preserve the roof-only top-down view.'}
    with file_lock(ART/'.run.lock',timeout=1):
        for row in rows:
            if row['id']=='p4-barriers-metal-corner-v1':
                old_id=row['id'];old=read_json(candidates(row)[-1]);assert old['attempt']==2
                row.update(id='p4-barriers-metal-corner-v2',reference=anchor['image'],prompt_action='Use this exact flat L-shaped corner silhouette and overhead camera as the geometry anchor. Replace only the concrete material inside the L with a plain cool-grey STEEL top surface and two thin flat longitudinal rib marks. Keep two equal-width arms, ninety-degree bend, square ends, framing and complete margin. One perfectly flat top plane, no bevel, thickness, visible side wall, perspective, hazard stripes or shadow. Solid pure magenta background.')
                changes['rows'][old_id]=dict(row);jobs.append((dict(row),False))
            elif row['id'] in notes:
                old=read_json(candidates(row)[-1]);assert old['attempt']==1
                rejection={'asset':row['id'],'image_sha256':old['sha256'],'note':notes[row['id']],'attempt':1,'at':now()};write_json(ART/'rejections'/(row['id']+'.json'),rejection);budget.record({'event':'content-rejection',**rejection});jobs.append((dict(row),True))
        write_json(ART/'brief-amendments.json',changes);write_csv(ART/'briefs/p4-world.csv',rows)
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:results=list(pool.map(lambda item:generate(item[0],style,budget,item[1]),jobs))
        make_contact_sheet([{'id':r['asset'],'path':r.get('image'),'verdict':r['status']} for r in results],ART/'contact-sheets/p4-landmark-repairs.png','P4 | C2 landmark margins and overhead camera corrections')
        print(budget.summary())

if __name__=='__main__':run()
