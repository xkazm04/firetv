"""Bind current pixel gates to recorded semantic observations and owner review sheets."""
import argparse
from common import ART, read_json, write_json, make_contact_sheet, digest
from grade import decide

def combine(batch,semantic_batch,family_batch=None):
    items=read_json(ART/'reports'/(batch+'-deterministic.json'))
    cfg=read_json(ART/'gates.json')
    models=('mimo-9b','qwen3.8')
    readings=[]
    for model in models:
        path=ART/'reports'/(semantic_batch+'-'+model+'.json')
        readings.append({g['asset']:g for g in read_json(path)} if path.exists() else {})
    family=[]
    if family_batch:
        for model in models:
            path=ART/'reports'/(family_batch+'-'+model+'-family.json')
            family.append({g['asset']:g for g in read_json(path)} if path.exists() else {})
    result=[]
    for item in items:
        if item.get('gates_hash')!=digest(cfg):raise ValueError('pixel report stale; rerun process.py: '+item['id'])
        grades=[m.get(item['id'],{}) for m in readings]
        verdict,codes=decide(grades,item['kind'],cfg['vlm_confidence_min'])
        family_grades=[m.get(item['id'],{}) for m in family]
        if family_grades and item['kind']=='car':
            fv,fc=decide(family_grades,item['kind'],cfg['vlm_confidence_min'])
            codes+=fc
            if fv=='reject':verdict='reject'
        final={**item,'grades':grades,'family_grades':family_grades,'codes':sorted(set(item['codes']+codes+['HUMAN_CALIBRATION_PENDING'])),'verdict':'reject' if item['codes'] or verdict=='reject' else 'owner-review'}
        result.append(final)
    write_json(ART/'reports'/(batch+'-acceptance.json'),result)
    make_contact_sheet(result,ART/'contact-sheets'/(batch+'-owner.png'),batch+' | owner review queue; machine agreement is not acceptance')
    print(batch,{v:sum(r['verdict']==v for r in result) for v in ('reject','owner-review')})
    return result

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--batch',required=True);p.add_argument('--semantic-batch',required=True);p.add_argument('--family-batch');a=p.parse_args()
    combine(a.batch,a.semantic_batch,a.family_batch)
