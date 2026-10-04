"""Author story briefs and a bounded session envelope. No generation or approval."""
from common import ART, ROOT, read_json, write_json, now
from family import write_csv
from fusion_roster import PORTRAITS
from gen import Budget

MECHANIC = ('Original young adult male parts-store owner, about 22, slim narrow shoulders, warm brown skin, '
            'soft angular face, unruly short black curls, worried raised brows and a tentative helpful smile. '
            'Oversized patched ochre shop apron over a dried-red rolled-sleeve shirt, soot-stained fingers, '
            'a small plain spare bearing cupped carefully in both hands. No armour, goggles or weapons. ')
RIG = ('A very basic scavenged compact coupe converted into a rough mine-dispatcher car. Rounded nose at RIGHT, '
       'four inset narrow tyres, short patched dried-red hood, dark windshield and a small bone roof patch. '
       'At LEFT rear a clearly exposed welded rectangular rack holds three round flat mine canisters and a '
       'short rear-facing delivery chute. Modest bent scrap rails, mismatched sheet metal, no turret, no luxury '
       'armour or giant engine. One continuous chassis, empty cabin. ')

def setup():
    rows=[]
    def add(slug, family, kind, action, cls=None, reference=''):
        rows.append(dict(id='story-'+slug+'-v1', **{'class':cls or slug}, prompt_action=action,
            size='1024x1024',frame='single',background_key='none' if kind=='backdrop' else '#FF00FF',
            count=1,status='ready',kind=kind,reference=reference,batch='story-'+family,
            approval='pending',requires_approval='',cell_limit=256 if kind=='portrait' else 128,
            style_file='style-fusion.json',wave='V2',asset_family=family,surface_stack='',logical_name=slug))
    add('mechanic','portraits','portrait',MECHANIC+'Head and shoulders plus hands, facing viewer. Complete bust within central 66 percent of square; ample empty margin, no environment.')
    scenes = {
      'debt-contract':'A blank battered debt folio with a heavy iron clamp on a plain vehicle key. A young shopkeeper offers a spare bearing beside it; an older league official in a high black jagged collar presses the closed folio down. The pressure of a fraudulent debt is the subject. No writing anywhere, blank pages.',
      'ally-rook':PORTRAITS['rook']+' After defeat he lowers his jagged shoulder and offers an open palm and a plain car key across a patched counter. Uneasy solidarity replaces hostility. One figure, gesture of joining the player.',
      'ally-ox':PORTRAITS['ox']+' After defeat this hauler calmly lays two matching blank receipt sheets beside an open ledger and pushes them toward the viewer: proof of stolen payments and solidarity with the crew. One figure. Pages have no marks or writing.',
      'ally-vex':PORTRAITS['vex']+' After defeat he offers a folded blank route sheet and a plain spare engine part with a relieved conspiratorial grin, joining the player and sharing the northbound address. One figure, no writing.',
      'ally-mica':PORTRAITS['mica']+' After defeat she divides blank duplicate ledger sheets into several bundles and offers one toward the viewer, protecting the evidence and joining the player. One figure, no writing.',
      'car-seizure':PORTRAITS['marrow']+' He stands beside a generic small coupe under a rough tarpaulin secured by a heavy chain and a blank metal lien tag. The covered car is deliberately anonymous because the actual seized chassis varies. No driver. Control and confiscation, no combat.',
      'rig-reveal':MECHANIC+' He pulls back a workshop curtain with nervous determination to reveal a humble car. '+RIG+' Flat side elevation diagram-like staging with visible rear rack; the young mechanic stands OUTSIDE the empty car. No lettering.',
      'final-duel':'An overhead arena tableau with exactly two unoccupied cars: a small patched red mine-dispatcher coupe with rear rack faces a massive six-wheel rust-armoured league carrier with bone roof ribs. Two flat mine discs lie behind the small car. Open industrial road, last two opponents, no flags, finish line, lap counter or spectators. No gore.',
      'ending':MECHANIC+' In a reopened parts workshop he shares a plain car key with an adult sibling figure shown from behind, identity left open. A returned car is sheltered beneath a plain dust cover, an iron lien clamp lies broken beside torn blank paper. Relief and a workshop belonging to its people; no trophy, no writing.'}
    for slug,action in scenes.items():
        ref=''
        if slug.startswith('ally-'):
            ref='art/review/fusion/sources/v2-fusion-portraits-'+slug[5:]+'-v1.jpg'
            assert (ROOT/ref).is_file()
            action='Preserve the exact face, hair, clothing and identity of the supplied portrait; expand into a story illustration. '+action
        add(slug,'backdrops','backdrop','Use case: illustration-story. One square Soot Pulp narrative panel. '+action+
            ' Flat graphic tableau, large readable shapes, central action in middle 70 percent with quiet soot margins. No speech bubbles, captions, panels within panels, symbols resembling letters, or decorative border.',reference=ref)
    icons={
      'ledger':'one open battered ledger book with two blank bone pages and a rust clasp, no lines or writing',
      'payment':'one worn coin passing into a plain shallow collection tray, simple bold silhouette, no currency mark',
      'diversion':'a single bent pipe splitting into two unequal branches, one bone and one dried red; stolen payment split',
      'recovery':'one plain coin cradled by a curved returning metal hook, recovered payment',
      'cancelled':'one visibly broken iron lien shackle with two separated ends; claim cancelled'}
    for slug,action in icons.items():
        add('icon-'+slug,'hud-icons','icon','One Hot Ink menu icon: '+action+'. Central 60 percent of square, generous empty margin. Strong connected shapes readable at 32px. No extra flecks or decoration.')
    add('debt-meter','hud-frames','icon','One empty horizontal debt-meter frame, a battered flat rust and bone metal rectangular rim with small chipped corners. Length four times height. Entire inside opening is exactly the same solid magenta as outside. No fill, ticks, text, dividers or dial. Keep frame in central 66 percent of square, complete generous margins.',cls='frame-debt')
    add('rig-reference','cars','car',RIG+'True overhead roof planes only, main axis horizontal, nose RIGHT, total length to width ratio 2.08:1. Keep ALL pixels within central 66 percent with 17 percent empty margins. One intact reference, no damage variants.',cls='Line')
    path=ART/'briefs/story-art.csv'
    if path.exists():
        raise RuntimeError('Story briefs already exist; preserve immutable job identities')
    write_csv(path,rows)
    policy=read_json(ART/'budget.json');summary=Budget().summary()
    assert summary['images_reserved']==482 and policy['weekly_image_cap']==550 and not summary['stop']
    policy.setdefault('session_envelopes',{})['story-art']={
        'week':summary['week'],'starting_reservations':482,'max_new_images':55,
        'authorization':'2026-10-03 owner executing CAMPAIGN STORY ART instruction: at most about 55 new images; never past 550.',
        'started_at':now(),'asset_prefixes':['story-']}
    write_json(ART/'budget.json',policy)
    write_json(ART/'audits/story-start.json',{'at':now(),'budget':summary,'assets':len(rows),
        'policy':'All owner approval flags remain false. Rig states require exact owner reference approval. Sequential guarded dispatch; three attempts per asset, no transport retry.'})
    print('Authored',len(rows),'briefs; hard session ceiling 55, global cap 550.')

if __name__=='__main__':setup()
