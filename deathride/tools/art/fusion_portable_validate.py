"""Validate the owner handoff without following local ignored generation paths."""
from common import ART,ROOT,read_json,write_json,sha,now
from validate_bundle import validate

def main():
    folder=ART/'review/fusion';review=read_json(folder/'review.json');rows=review['records']
    if review.get('part')==5:
        from states_validate import validate as validate_states
        return validate_states()
    if review.get('part')==4:
        from part4_validate import validate as validate_part4
        return validate_part4()
    if review.get('part')==3:
        from part3_validate import validate as validate_part3
        return validate_part3()
    if len(rows)!=95 or review['owner_approved']:raise ValueError('review inventory/approval')
    checks=0
    for r in rows:
        for key,digest in [('source','source_sha256'),('pixels','export_sha256'),('repeat','repeat_sha256'),('animation','animation_sha256')]:
            if r.get(key):
                if sha(folder/r[key])!=r[digest]:raise ValueError('changed portable '+r['id']+' '+key)
                checks+=1
        for frame in r['frames']:
            if sha(folder/frame['pixels'])!=frame['sha256']:raise ValueError('changed effect frame')
            checks+=1
        if len(r['grades'])!=2 or any(g['status']!='graded' or g['image_hashes'][0]!=r['source_sha256'] for g in r['grades']):raise ValueError('review model provenance')
    if sum(r['superseded'] for r in rows)!=11 or sum(r['world_bundle_selected'] for r in rows)!=74:raise ValueError('selection presentation mismatch')
    cars=[r for r in rows if r['kind']=='car'];portraits=[r for r in rows if r['kind']=='portrait']
    if len(cars)!=10 or len(portraits)!=6 or {r['class'].lower() for r in cars if r['verdict']=='reject'}!={'comet','quill','kestrel'}:raise ValueError('roster holds changed')
    approvals=read_json(ART/'reference-approvals.json')['references']
    for car in cars:
        a=approvals[car['id']]
        if a['owner_approved'] or a['source_sha256']!=car['source_sha256']:raise ValueError('approval handoff changed')
    catalog=read_json(ROOT/'assets/phase2-fusion/catalog.json')
    if read_json(ART/'fusion-obstacles-selected.json')!=catalog['natural_obstacles']:raise ValueError('obstacle handoff stale')
    browser=read_json(ART/'reports/fusion-browser.json')
    if browser['status']!='pass' or len(browser['results'])!=4:raise ValueError('browser review incomplete')
    costs=read_json(ART/'surface-lab/fusion-costs.json')
    for p in costs['pictures'].values():
        if sha(ART/'surface-lab'/p['file'])!=p['sha256']:raise ValueError('capture changed')
    for r in costs['device_runs']:
        if sha(ART/'surface-lab'/r['source'])!=r['result_sha256']:raise ValueError('timing changed')
    files={str(p.relative_to(folder)).replace('\\','/'):sha(p) for p in folder.rglob('*') if p.is_file()}
    write_json(ART/'reports/fusion-portable-review-index.json',{'at':now(),'files':files})
    result={'status':'pass','portable_hash_checks':checks,'review_files':len(files),'current_candidates':84,'repaired_originals':11,
        'world_bundle_assets':74,'car_rejects':['Comet','Quill','Kestrel'],'owner_approved':False,
        'browser_views':4,'budget':review['budget'],'scope':'portable sources, exports, frame hashes, exact local observations, chosen metadata, review filters/links and held approvals; no ignored raw images needed'}
    write_json(ART/'reports/fusion-portable-validation.json',result);print(result)

if __name__=='__main__':main()
