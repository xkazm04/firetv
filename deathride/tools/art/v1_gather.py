"""Recompute current and every-attempt evidence, retaining immutable source hashes."""
from common import ART, briefs, read_json, write_json, make_contact_sheet
from gen import candidates
from process import process_one, run

def main():
    rows=briefs(ART/'briefs/v1-directions.csv');out=[];current=[]
    for batch in dict.fromkeys(r['batch'] for r in rows):current+=run([r for r in rows if r['batch']==batch],batch)
    for row in rows:
        for p in candidates(row):
            r=read_json(p)
            if r['status']!='generated':continue
            version={**row,'id':row['id']+'-a'+str(r['attempt'])}
            result=process_one(version,r['image'],ART/'processed/v1-attempts');result['parent_id']=row['id'];result['attempt']=r['attempt'];out.append(result)
    write_json(ART/'reports/v1-current-deterministic.json',current)
    write_json(ART/'reports/v1-attempts-deterministic.json',out)
    for batch in dict.fromkeys(r['batch'] for r in rows):
        records=[r for r in current if r['brief']['batch']==batch]
        make_contact_sheet([{**r,'path':r['source']} for r in records],ART/'contact-sheets'/f'{batch}-latest-source.png',batch+' | actual latest raw pixels, current gate codes')
    print('Every attempt gated:',len(out),'current:',len(current))

if __name__=='__main__':main()
