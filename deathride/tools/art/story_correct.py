"""Explicit reference edits for observed defects; no spend and no approval."""
from pathlib import Path
from common import ART, ROOT, briefs, read_json, write_json, now, sha
from gen import candidates
from family import write_csv

def main():
    path=ART/'briefs/story-art.csv';rows=briefs(path);audit=[]
    for slug in ('ally-ox','ally-mica','rig-reference','icon-diversion'):
        old=next(r for r in rows if r['id']=='story-'+slug+'-v1')
        assert not any(r['id']=='story-'+slug+'-v2' for r in rows)
        s=read_json(candidates(old)[-1]);r={**old,'id':'story-'+slug+'-v2','reference':Path(s['image']).relative_to(ROOT).as_posix()}
        if slug=='rig-reference':
            note='Both generated references failed source margin. Final third attempt is a framing-only edit, no gate changes.'
            r['prompt_action']=('Use case: precise-object-edit. Keep the EXACT supplied car identity, all four wheel positions, red and bone panels, three rear mine discs, rear delivery chute, overhead camera and nose facing RIGHT. '
                'Only change the framing: shrink the complete car to HALF its current width and center it in a 1024 square. '
                'The entire vehicle including rear chute must occupy no more than the central 50 percent of canvas width. '
                'Surround it on EVERY side with a large perfectly uniform SOLID MAGENTA background. There must be at least one QUARTER of canvas width EMPTY on the left and on the right. '
                'Do not zoom in to fill the frame. This is a small overhead vehicle sticker on a huge blank magenta square. No shadows, text, extra parts or ground.')
        elif slug=='icon-diversion':
            note='At actual 32px the branching pipe resembles a shovel or paintbrush and does not communicate diverted funds. Replace with a simple payment split pictogram.'
            r['prompt_action']=('One Hot Ink payment-diversion icon. A single plain BONE COIN at the top feeds a bold inverted Y-shaped channel: '
                'a broad bone arrow continues DOWN LEFT into a plain collection tray, while a thinner DRIED RED arrow branches DOWN RIGHT away from the tray. '
                'Exactly two outgoing arrows, simple broad flat connected silhouettes readable at 32 pixels. No tools, pipe fittings, handles, writing, currency symbols or tiny decorative details. '
                'Worn rust metal outlines, chipped bone fill and a small red branch. Keep ALL elements inside the central 60 percent of a square with huge solid magenta margins.')
            r['reference']=''
        else:
            note='Direct review finds a pale paper border inconsistent with the quiet soot field of the narrative set. Preserve face, gesture and blank evidence; change background edges only.'
            r['prompt_action']=('Use case: precise-object-edit. Preserve the EXACT face, hair, skin, clothing, shoulders, hands, blank papers and story gesture of this supplied narrative panel. '
                'Change ONLY the exterior pale paper border: replace ALL white/cream canvas perimeter with uninterrupted SOOT BLACK #171513 extending fully to every canvas edge. '
                'The entire canvas must have the same dark soot background behind the existing figure. No light paper border, no frame, no outline, no new objects, no text. '
                'Keep the central blank bone-colour papers unchanged and keep all character features and colours unchanged. Flat neutral Soot Pulp illustration, no cast shadow.')
        old['status']='superseded';rows.append(r)
        audit.append({'asset':r['id'],'source_sha256':s['sha256'],'reason':note,'at':now(),'attempt_ceiling':3})
    write_csv(path,rows);write_json(ART/'audits/story-panel-rig-corrections.json',audit)
    # New references intentionally invalidate only their changed proof groups.
    print('Prepared four targeted edits; call gen.py explicitly after inspecting proof evidence.')

if __name__=='__main__':main()
