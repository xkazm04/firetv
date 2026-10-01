"""Final allowed attempts for three explicit remaining defects."""
import concurrent.futures
from common import ART,read_json,write_json,briefs,now,file_lock,make_contact_sheet
from family import write_csv
from gen import Budget,candidates,generate

def run():
    rows=briefs(ART/'briefs/p4-world.csv');changes=read_json(ART/'brief-amendments.json');jobs=[];budget=Budget();style=read_json(ART/'style.json')
    actions={
      'p4-effects-explosion-v1':('SIX separate small overhead explosion effects in a landscape image, arranged as THREE columns and TWO rows of equal square cells. ONLY TWO ROWS. All cells share the same pure magenta background with no visible grid. Top row has: a tiny ivory ignition dot; a small orange starburst; a medium orange round blast cloud. Bottom row has: a large orange cloud; a medium charcoal smoke puff; a tiny grey wisp. Exactly one effect centred in each cell, each fully inside its cell with generous clear space. No additional effects, duplicates, objects, hardware, debris, text or labels.','1536x1024',False),
      'p4-pickups-turbo-v1':('Edit the reference bottle. Preserve the pressure bottle shape, valve and large ivory lightning bolt. Smooth every painted panel to plain orange except for the single lightning bolt. Remove the tiny black outlined mechanical badge below the centre of the bolt; that area is completely plain orange paint. No extra symbols. Replace the entire background with uniform pure magenta, including every gap around the valve. The complete bottle stays centred with generous margin.','1024x1024',True),
      'p4-decals-cracks-v1':('One isolated flat decal consisting ONLY of five thin near-black branching cracks and a few tiny cool-grey chips. All empty spaces BETWEEN the thin crack lines are pure magenta, exactly matching the surrounding background. The cracks are bare disconnected ink strokes with no floor, no asphalt slab, no square patch, no filled polygon, no rectangular backing, no scene. A small asymmetrical fracture cluster centred with generous clear magenta margin.','1024x1024',False)}
    with file_lock(ART/'.run.lock',timeout=1):
        for row in rows:
            if row['id'] not in actions:continue
            old_id=row['id'];old=read_json(candidates(row)[-1])
            if old['attempt']!=2:raise ValueError('expected exactly two previous attempts')
            action,size,edit=actions[old_id]
            row.update(id=old_id[:-2]+'v2',prompt_action=action,size=size,reference=old['image'] if edit else '')
            changes['rows'][old_id]=dict(row);jobs.append(dict(row))
        if len(jobs)!=3:raise ValueError('last corrections already applied or briefs changed')
        changes['last_corrections_at']=now();write_json(ART/'brief-amendments.json',changes);write_csv(ART/'briefs/p4-world.csv',rows)
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:results=list(pool.map(lambda row:generate(row,style,budget),jobs))
        make_contact_sheet([{'id':r['asset'],'path':r.get('image'),'verdict':r['status']} for r in results],ART/'contact-sheets/p4-last-repairs.png','P4 | final allowed attempts; remaining failures stay rejected')
        print(budget.summary())

if __name__=='__main__':run()
