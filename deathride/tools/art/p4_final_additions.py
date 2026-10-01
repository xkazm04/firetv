"""Prepare last ice correction and a separately sourced provisional C4 portrait."""
import csv
from common import ART,read_json,write_json,briefs,now,sha
from family import write_csv
from gen import Budget,candidates
from world import PORTRAITS

def prepare():
    if (ART/'briefs/p4-ice-final.csv').exists() or (ART/'briefs/p4-c4-preview.csv').exists():raise ValueError('one-time preparation already recorded; resume through gen.py')
    ice=next(r for r in briefs(ART/'briefs/p2-materials.csv') if r['class']=='ice')
    old=read_json(candidates(ice)[-1])
    rejection={'asset':ice['id'],'image_sha256':old['sha256'],'attempt':old['attempt'],'at':now(),'note':'VISIBLE_JOIN: actual 2x2 export has a faint bright cross at the repeat boundaries despite passing the provisional numeric seam gate. Reject for final delivery; final allowed attempt requests uniform frost without broad bands or border lighting.'}
    write_json(ART/'rejections'/(ice['id']+'.json'),rejection);Budget().record({'event':'content-rejection',**rejection})
    ice.update(id='p1-tile-ice-v3',batch='p4-ice-final',prompt_action='The entire square is ONLY a uniform empty pale cold blue-grey ice material, with very fine randomly scattered ivory frost grains. Perfectly EVEN brightness and colour across the entire square, including every edge. No broad light or dark bands, no bright border, no grid, no cross, no central highlight, no directional lighting, no gradient, no vignette, no cracks. One single unrepeated stochastic texture swatch, not a tiled preview. Seamless continuous material on all four sides. No car, vehicle, object, scene, lettering or symbol.')
    write_csv(ART/'briefs/p4-ice-final.csv',[ice])
    from pathlib import Path
    source=Path('C:/Users/kazda/kiro/firetv-deathride-content/deathride/core/src/main/resources/data/rivals.csv')
    story=source.with_name('rival-stories.csv')
    rivals=list(csv.DictReader(source.open()));stories=list(csv.DictReader(story.open()))
    if 'marrow' not in {r['id'] for r in rivals}:raise ValueError('C4 draft no longer defines Marrow')
    write_json(ART/'contracts/p4-c4-provisional.json',{'at':now(),'status':'read-only uncommitted C4 preview, not claimed as committed authority','rivals_sha256':sha(source),'stories_sha256':sha(story),'rival':next(r for r in rivals if r['id']=='marrow'),'story':next(r for r in stories if r['id']=='marrow')})
    row=dict(briefs(ART/'briefs/p4-world.csv')[0]);row.update(id='p4-portraits-marrow-v1',**{'class':'marrow'},kind='portrait',batch='p4-c4-preview',cell_limit='256',frame='single',background_key='#FF00FF',reference='',prompt_action=PORTRAITS['marrow']+' One complete head-and-shoulders bust centred inside the middle three quarters of the square, front-facing flat character illustration. Symmetric neutral light. No weapon, car, badge, lettering, numbers or logos. An original fictional identity, no resemblance to a real person.')
    write_csv(ART/'briefs/p4-c4-preview.csv',[row])

if __name__=='__main__':prepare()
