"""Face-first identity briefs. Existing owner approvals and historical images are immutable."""
from common import ART, ROOT, read_json, write_json
from family import write_csv
from fusion_roster import PORTRAITS

FACE = ('The FACE is the subject. Tight head-and-upper-shoulders close-up, facing viewer with BOTH eyes open and clearly readable. '
        'The visible face from forehead to chin occupies 50 to 60 percent of the full image HEIGHT; hair and ears fit within the canvas. '
        'Face centered, eyes separated and mouth expression distinct at 96 pixels. Only neck and a narrow hint of collar/shoulders below the chin; '
        'NO arms, hands, chest armour display, waist or full torso. Do not shrink the head to fit broad shoulders. '
        'Keep a complete small shoulder silhouette and hair inside a 5 percent empty margin. No mask, eye-covering goggles, hair across eyes, deep eye shadow or silhouette face. ')
MECHANIC = ('Original young adult male parts-store owner about 22, warm brown skin, soft angular face, short unruly black curls, '
            'worried lifted brows, dark eyes and a tentative helpful smile; hint of patched ochre apron strap over a dried-red shirt collar. '
            'Nervous, capable and loyal, never an armoured warrior. ')

def setup():
    path=ART/'briefs/rework2-faces.csv'
    if path.exists():raise RuntimeError('Immutable face briefs already exist')
    rows=[]
    prior=read_json(ART/'review/story/review.json')['records']
    story=read_json(ART/'story-selections.json')['candidates']
    def old_story(key):
        r=next(r for r in prior if r['id']==story[key])
        return 'art/review/story/'+r['source']
    identity={**PORTRAITS,'mechanic':MECHANIC}
    refs={k:'art/review/fusion/sources/v2-fusion-portraits-'+k+'-v1.jpg' for k in PORTRAITS}
    refs['mechanic']=old_story('mechanic')
    def add(slug,who,action,kind,batch,before):
        reference=refs[who];assert (ROOT/reference).exists() and (ROOT/before).exists()
        rows.append(dict(id='rw2-face-'+slug+'-v1',**{'class':who},prompt_action=action,
          size='1024x1024',frame='single',background_key='#FF00FF' if kind=='portrait' else 'none',
          count=1,status='ready',kind=kind,reference=reference,batch=batch,approval='pending',requires_approval='',
          cell_limit=128,style_file='style-fusion.json',wave='V2',asset_family='portraits' if kind=='portrait' else 'backdrops',
          surface_stack='',logical_name=('portraits/' if kind=='portrait' else 'story/')+slug,
          face_subject='yes',before_path=before))
    for who,description in identity.items():
        add(who,who,'Reframe the supplied original identity as a new Soot Pulp FACE-FIRST portrait. Preserve skin, facial structure, age, hair and identity markers. '+
            FACE+description+' Facial expression and eyes take precedence over shoulder armour; reduce shoulder context. Flat neutral material values; no environment or text.',
            'portrait','rw2-faces-portraits',refs[who])
    scenes={
      'debt-contract':('marrow','Marrow fills the foreground from upper shoulders up, his hostile controlling face beside the top edge of a blank clamped debt folio. One face only. Distant rusted collection gate and burnt yard roof behind him; folio and iron key clamp are small bottom-edge context.'),
      'ally-rook':('rook','Rook faces us at the Yards workshop counter, calculating hostility softened into wary solidarity. A small plain car key at the bottom edge hints at his gift. Corrugated salvage racks recede behind his face.'),
      'ally-ox':('ox','Ox faces us in Foundry Row, calm anger becoming trust. Two small matching blank receipts at the bottom edge suggest proof of diverted payments. Cold smelter mouths and rust beams form quiet distant context. Preserve the established adult female identity.'),
      'ally-vex':('vex','Vex faces us at a salt-run service shelter, relieved conspiratorial grin; a small folded blank route sheet at the lower edge. Broken salt crust, a rust pylon and a hoarding silhouette remain distant, quiet setting.'),
      'ally-mica':('mica','Mica faces us at a mountain-road workshop, focused patient eyes and a faint resolved smile; a small bundle of blank duplicate ledger sheets at the lower edge. Bent guard rail and quarry-grey rock outside a small distant window.'),
      'car-seizure':('marrow','Marrow faces us in an industrial speedway impound bay, cold possessive mouth and controlling stare. Behind his shoulder a small anonymous covered car, heavy chain and blank lien tag establish seizure; the car remains secondary and unidentifiable.'),
      'rig-reveal':('mechanic','The young Mechanic faces us close in his rough parts shop, anxious courage and a hopeful tight smile. Behind one shoulder is a SMALL basic patched coupe with a plain rear rack holding three flat mine canisters, completely empty cabin. The face dominates, car secondary, no curtain or foreground hands.'),
      'ending':('mechanic','The young Mechanic faces us in the reopened parts workshop, tired relieved smile and visible warm eyes. A small adult sibling silhouette behind him hangs a coat; identity left open, no second face to distract. Broken lien clamp and returned covered car remain small quiet background context. Hope through shared work, no victory trophy.'),
    }
    for slug,(who,scene) in scenes.items():
        add(slug,who,'Original square Soot Pulp narrative illustration; preserve the supplied FACE identity. '+
            FACE.replace('NO arms, hands, chest armour display, waist or full torso.','No full torso or wide body shot. Small story objects at the bottom edge only.')+
            'Medium-close or tighter framing. Face foreground, environment subordinate. '+scene+
            ' Quiet soot backdrop to all canvas edges, no pale border, captions, text, panels or cast shadows.',
            'backdrop','rw2-faces-stories',old_story(slug))
    write_csv(path,rows)
    write_json(ART/'audits/rework2-faces-plan.json',dict(portraits=7,story_characters=8,owner_approved=False,
      unchanged=['final-duel (no faces)','rig reference and states','ledger icons and meter'],
      identity_note='Ox keeps the established female portrait; inherited masculine campaign prose is not rewritten by art.'))
    print('Authored seven portraits and eight face-first story panels.')

if __name__=='__main__':setup()
