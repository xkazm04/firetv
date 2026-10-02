"""Execute explicit, source-bound content corrections through the guarded driver."""
import argparse
from common import ART, briefs, read_json, write_json, now, style_for, file_lock, sha
from gen import generate, Budget, candidates, proof_valid


def run(notes_path):
    rows=briefs(ART/'briefs/v2-part4-derived.csv');by_id={r['id']:r for r in rows};budget=Budget()
    with file_lock(ART/'.run.lock',timeout=1):
        for key,note in read_json(notes_path).items():
            if budget.summary()['stop']:break
            row=by_id[key];group=[r for r in rows if r['batch']==row['batch']]
            if not proof_valid(row['batch'],group,style_for(row)):raise ValueError('VALID_INSPECTED_BATCH_PROOF_REQUIRED')
            if any(read_json(p)['prompt'].endswith('\nCorrection from previous measured rejection: '+note) for p in candidates(row)):
                print(key,'correction already attempted; no new reservation',flush=True)
                continue
            previous=read_json(candidates(row)[-1])
            if previous['status']!='generated':raise ValueError('NO_TRANSPORT_RETRY')
            rejection={'asset':key,'image_sha256':previous['sha256'],'attempt':previous['attempt'],'at':now(),'note':note}
            write_json(ART/'rejections'/(key+'.json'),rejection)
            budget.record({'event':'content-rejection',**rejection})
            result=generate(row,style_for(row),budget,refine=True)
            print(key,result['status'],budget.summary(),flush=True)
            if result['status']!='generated':break
            # Keep the inspected original proof intact. A changed proof image gets
            # a fresh explicit review using gen.py approve-proof after inspection.


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('notes');run(p.parse_args().notes)
