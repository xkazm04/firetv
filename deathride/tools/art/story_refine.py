"""One explicit final content correction per proof; uses the unchanged guarded driver."""
from pathlib import Path
from common import ART, ROOT, briefs, read_json, write_json, now, sha
from family import write_csv
from gen import candidates

def main():
    path=ART/'briefs/story-art.csv';rows=briefs(path);changes=[]
    for slug in ('mechanic','debt-meter'):
        old=next(r for r in rows if r['id']=='story-'+slug+'-v1')
        assert not any(r['id']=='story-'+slug+'-v2' for r in rows)
        sidecar=read_json(candidates(old)[0 if slug=='mechanic' else -1]);ref=sidecar['image']
        row={**old,'id':'story-'+slug+'-v2','reference':Path(ref).relative_to(ROOT).as_posix()}
        if slug=='mechanic':
            note='Two source-margin failures. Last attempt minimum margin 30/1024 below unchanged 3 percent floor. Use first portrait identity in a single targeted framing edit.'
            row['prompt_action']=('Use case: precise-object-edit. Preserve this exact young adult face, curly hair, nervous helpful smile, red shirt, ochre apron, bearing and both hands. '
                'Shrink the ENTIRE bust to HALF its current image height, centered on the same square canvas. '
                'Finish the lower apron with a ragged rounded hem just below the hands. All of the hair, shoulders, hands and apron must be visible. '
                'Surround it with a huge perfectly uniform solid magenta field, at least a QUARTER of the image height ABOVE and BELOW the complete bust. '
                'No part may extend to the image edge. This is a small sticker centred in a large blank square. No design or colour change to the character.')
        else:
            note='Two images retain nearly square framing; attempt 2 is 1.816:1. One final reference edit targets a genuinely long shallow slot.'
            row['size']='1536x1024'
            row['prompt_action']=('Use case: precise-object-edit. Convert the supplied empty frame into a VERY LONG SHALLOW horizontal debt-meter slot. '
                'Keep the same Hot Ink chipped rust/bone rim and tiny yellow corner patch. The outer rim must be FIVE TIMES wider than high. '
                'Keep its width at 70 percent of the landscape canvas, but compress the opening HEIGHT to just 15 percent of canvas height. '
                'Repaint the rim to retain consistent thickness, never scale/distort the texture. Both interior and exterior perfectly uniform solid magenta. '
                'No fill, ticks, divisions, text or additional objects. Large margins on every side.')
        old['status']='superseded';rows.append(row)
        changes.append({'id':row['id'],'reference_sha256':sha(ref),'reason':note,'at':now(),'attempt_ceiling':3})
    write_csv(path,rows);write_json(ART/'audits/story-final-proof-corrections.json',changes)

if __name__=='__main__':
    main()
