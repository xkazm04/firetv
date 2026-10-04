"""Assemble current world candidates, preserving rejected sources and local remedies."""
from common import ART,read_json,write_json,briefs,make_contact_sheet

def build():
    rows=briefs(ART/'briefs/p4-world.csv');items=[]
    for batch in dict.fromkeys(r['batch'] for r in rows):items+=read_json(ART/'reports'/(batch+'-deterministic.json'))
    carry=[]
    for batch,ids in [('p2-materials',{'p1-tile-ice-v2','p1-tile-kerb-v2'}),('p2-oil-final',{'p1-tile-oil-v3'})]:
        carry += [r for r in read_json(ART/'reports'/(batch+'-deterministic.json')) if r['id'] in ids]
    write_json(ART/'reports/p4-carry-deterministic.json',carry);items+=carry
    make_contact_sheet(carry,ART/'contact-sheets/p4-carry-gates.png','P4 | existing material candidates carried forward without spend')
    for name in ('wrap','asphalt-clean','gravel-recovery','ice-final','ice-recovery','c4-preview'):
        path=ART/'reports'/('p4-'+name+'-deterministic.json')
        if path.exists():items += [r for r in read_json(path) if r['id'] not in {i['id'] for i in items}]
    write_json(ART/'reports/p4-world-candidates-deterministic.json',items)
    print('Current world review records:',len(items))

if __name__=='__main__':build()
