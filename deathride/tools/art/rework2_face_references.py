"""Prepare exact unresampled identity crops as generation inputs, never as delivered candidates."""
from PIL import Image
from common import ART, ROOT, briefs, read_json, write_json, sha, now
from gen import candidates
from family import write_csv

BOXES={'rook':[300,90,700,565],'ox':[365,150,665,520],'vex':[345,95,710,560],
 'mica':[310,65,705,600],'relay':[280,55,755,615],'marrow':[345,105,685,555],
 'mechanic':[430,195,625,435]}

def prepare():
    path=ART/'briefs/rework2-faces.csv';rows=briefs(path);folder=ART/'contracts/rework2-face-inputs';folder.mkdir(exist_ok=True)
    assert not any(r['id']=='rw2-face-debt-contract-v2' for r in rows)
    crops={};audit=[]
    for who,box in BOXES.items():
        row=next(r for r in rows if r['class']==who and r['kind']=='portrait');source=ROOT/row['reference']
        with Image.open(source) as im:
            assert 0<=box[0]<box[2]<=im.width and 0<=box[1]<box[3]<=im.height
            out=im.crop(box);target=folder/(who+'.png');out.save(target)
        crops[who]=target.relative_to(ROOT).as_posix()
        audit.append(dict(character=who,source=row['reference'],source_sha256=sha(source),crop_px=box,
          reference=crops[who],reference_sha256=sha(target),operation='unresampled lossless source crop; conditioning input only; no candidate pixels created'))
    emphasis=(' FINAL COMPOSITION PRIORITY: Preserve the supplied cropped face identity, including skin, scars, eyes and hair. '
      'Forehead-to-chin face alone occupies 65 to 70 percent of the FULL square HEIGHT. Only a sliver of collar. '
      'Do NOT expand back to a body shot or add broad shoulder armour. Face and eyes dominate; small setting or props are subordinate. ')
    updated=[]
    for row in rows:
        if row['id']=='rw2-face-debt-contract-v1':
            updated.append({**row,'status':'superseded'})
            updated.append({**row,'id':'rw2-face-debt-contract-v2','reference':crops['marrow'],
              'prompt_action':row['prompt_action']+emphasis})
        elif not candidates(row):
            updated.append({**row,'reference':crops[row['class']],'prompt_action':row['prompt_action']+emphasis})
        else:updated.append(row)
    write_csv(path,updated)
    write_json(ART/'audits/rework2-face-input-crops.json',dict(at=now(),inputs=audit,
      reason='Full-bust identity references repeatedly pull the generator toward torso framing. Exact face crops constrain input identity; outputs remain newly generated and measured over their complete exported frames.',
      paid_job_policy='Spent Rook brief unchanged. Debt v2 is its third total attempt. Only unspent sibling briefs change inputs. No attempt cap raised.'))

if __name__=='__main__':prepare()
