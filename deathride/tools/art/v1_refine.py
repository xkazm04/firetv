"""One deliberate correction per explicitly reviewed asset; never transport retries."""
import argparse
import concurrent.futures
from common import ART, briefs, read_json, write_json, style_for, file_lock, now
from gen import candidates, generate, Budget

def main():
    p=argparse.ArgumentParser();p.add_argument('--reviews',required=True);a=p.parse_args()
    rows={r['id']:r for r in briefs(ART/'briefs/v1-directions.csv')}
    reviews=read_json(a.reviews);budget=Budget()
    jobs=[]
    with file_lock(ART/'.run.lock',timeout=1):
        for asset,note in reviews.items():
            row=rows[asset];last=read_json(candidates(row)[-1])
            if last['status']!='generated':raise ValueError('no retry of failed transport')
            rejection={'asset':asset,'image_sha256':last['sha256'],'note':note,'at':now(),'attempt':last['attempt'],'reviewer':'executing-agent; not owner'}
            write_json(ART/'rejections'/f'{asset}.json',rejection)
            budget.record({'event':'content-rejection',**rejection});jobs.append(row)
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
            for result in pool.map(lambda row:generate(row,style_for(row),budget,refine=True),jobs):
                print(result['asset'],result['status'],flush=True)
        print(budget.summary())

if __name__=='__main__':main()
