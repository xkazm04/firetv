"""Agy region staging using unchanged G1 deterministic gates and local graders."""
import argparse
from common import ART, briefs, read_json, write_json
import regions_pipeline as pipeline

pipeline.REPORT=ART/'reports/agy-candidates.json'
def rows():
    rows=briefs(ART/'briefs/agy-regions.csv')
    if (ART/'briefs/agy-variants.csv').exists():rows+=briefs(ART/'briefs/agy-variants.csv')
    return rows
pipeline.rows=rows

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('mode',choices=['measure','grade','direct','proof','init']);p.add_argument('--region');p.add_argument('--batch');p.add_argument('--ids',nargs='+');p.add_argument('--note');p.add_argument('--reject',action='store_true');a=p.parse_args()
    if a.mode=='init':
        if pipeline.REPORT.exists():raise ValueError('Already initialized')
        write_json(pipeline.REPORT,[r for r in read_json(ART/'reports/g1-candidates.json') if r['origin']!='generated'])
    elif a.mode=='measure':pipeline.measure()
    elif a.mode=='grade':pipeline.grade(a.region)
    elif a.mode=='direct':pipeline.direct(a.ids,a.note,not a.reject)
    elif a.mode=='proof':pipeline.proof(a.batch)
