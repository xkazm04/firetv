"""Generate only uncalled first proofs, sequentially. Never retry failed jobs."""
import argparse
from common import ART, file_lock, style_for
from gen import generate, candidates
from agy_provider import AgyBudget
from agy_pipeline import pipeline

def main(variants=False):
    budget=AgyBudget();groups={}
    for row in pipeline.rows():
        if ('-kept-edits' in row['batch'])!=variants:continue
        groups.setdefault(row['batch'],[]).append(row)
    with file_lock(ART/'.run.lock',timeout=1):
        for group in groups.values():
            if budget.summary()['stop']:break
            row=group[0]
            if candidates(row):
                print('Existing proof attempt; no retry:',row['id'],flush=True);continue
            result=generate(row,style_for(row),budget)
            if result['status']!='generated' or not result.get('prompt_verbatim_verified'):
                print('STOP: proof requires inspection',row['id'],flush=True);break

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--variants',action='store_true');main(p.parse_args().variants)
