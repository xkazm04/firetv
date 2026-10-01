"""Final bounded corrections and versioned prompt lessons from inspected proofs."""
import concurrent.futures
from common import ART,read_json,write_json,briefs,now,file_lock
from family import write_csv
from gen import Budget,candidates,generate

def run():
    rows=briefs(ART/'briefs/p4-world.csv');budget=Budget();style=read_json(ART/'style.json');jobs=[];amendments={}
    if (ART/'brief-amendments.json').exists():raise ValueError('amendments already applied; inspect results instead')
    with file_lock(ART/'.run.lock',timeout=1):
        for row in rows:
            found=candidates(row)
            if row['id']=='p4-pickups-ammo-v1':
                old=read_json(found[-1]);before=row['id'];row['id']='p4-pickups-ammo-v2';row['reference']=old['image']
                row['prompt_action']='Edit this exact olive ammunition box. Preserve its shape, three ivory bullets, latches, camera and scale. Replace the entire lower half of the box lid with a completely smooth blank olive panel; only the three bullets occupy the upper half. The lower half has no decoration at all. Isolate the complete box on solid magenta with generous clear margin.'
                amendments[before]=dict(row);jobs.append((dict(row),False))
            elif row['batch'] in ('p4-effects','p4-backdrops') and found:
                old=read_json(found[-1])
                note=('The ENTIRE canvas including every border and every space between effects must be the SAME pure magenta. No white lines, no white gutters, no cell backgrounds, no grid, no separators. ONLY six separate floating effects. Keep every effect in the middle third of its cell, widely spaced. No weapon, car, barrel or other object. Flash shapes should extend mainly to the RIGHT, not symmetric stars.' if row['batch']=='p4-effects' else 'Remove the dark cast shadows around every structure. Use completely even flat overhead illumination. Show only roof/top planes, no visible vertical side walls or front faces. Keep the central area quiet and clear; structures stay near the perimeter.')
                rejection={'asset':row['id'],'image_sha256':old['sha256'],'note':note,'attempt':old['attempt'],'at':now()};write_json(ART/'rejections'/(row['id']+'.json'),rejection);budget.record({'event':'content-rejection',**rejection});jobs.append((dict(row),True))
            elif not found:
                lesson={'p4-barriers':' Only the narrow TOP surface seen exactly from above; no vertical front face, side wall or upright. Flat plan-view diagram of the material geometry.',
                        'p4-props':' Use only the specified material colours. No purple, decorative badges, arrows, labels or vehicle parts. Empty openings show the same pure magenta background.',
                        'p4-effects':' The entire canvas and every border/gap is one pure magenta field. No white gutters, cell backgrounds, grid, drawn separators, hardware, guns or vehicle pieces. Effects remain in the middle half of each cell.',
                        'p4-portraits':' The small head-and-shoulders bust ends in a deliberate curved silhouette at upper chest, with at least fifteen percent pure magenta clear margin beneath the chest and around both shoulders. No torso runs off the canvas.',
                        'p4-pickups':' Only the explicitly requested decoration. No small badge, hand symbol, arrow, lettering or extra emblem.',
                        'p4-backdrops':' Strict roof-only plan view; completely even light with no dark cast shadows at any structure.'}.get(row['batch'],'')
                if lesson:row['prompt_action']+=lesson;amendments[row['id']]=dict(row)
        write_json(ART/'brief-amendments.json',{'at':now(),'reason':'Inspected proof failures; only unused IDs changed, ammo edit minted v2; original call history retained.','rows':amendments})
        write_csv(ART/'briefs/p4-world.csv',rows)
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
            list(pool.map(lambda job:generate(job[0],style,budget,job[1]),jobs))
        print(budget.summary())

if __name__=='__main__':run()
