"""Versioned fusion reference briefs. No states, liveries or approvals are emitted."""
from common import ART
from family import write_csv, check_scale_contract

CARS={
 'Bastion':'A heavy four-wheel spiked fortress: hugely swollen squared wheel guards, four enormous exposed tyres, broad slab roof with a short roof cannon aimed RIGHT, blunt full-width welded ram at RIGHT, stacked scrap armour and triangular shoulder teeth. Compressed cabin swallowed by armour. Soot, ochre and rust, bone chipped plate edges. The strongest broad solid mass of the roster.',
 'Needle':'A very light skeletal rat-rod buggy: pencil-thin EMPTY cage, four exposed skinny wheels on long visible outriggers, tiny rust nose ending in a forked ram at RIGHT, exposed engine at LEFT rear. Large magenta negative-space gaps between the central chassis and wheel pods. Bare tubular spars, only two small ochre patched panels. No broad continuous body shell; fragile and stripped to the bones.',
 'Line':'A scavenged compact coupe with a rounded RIGHT nose, broad dark windshield, patched dried-red hood, one off-centre chipped bone stripe, welded door shields and a short bent flat rear spoiler at LEFT. A wedge of rough welded plates reinforces the nose. Recognisable low coupe roof, four inset wheels.',
 'Comet':'A lopsided dragster: long tapered rust-orange triangular nose at RIGHT, narrow dark teardrop canopy offset slightly upward, one oversize exposed exhaust on the opposite flank, wide patched split wing at LEFT. Long forward thrust, four exposed wheels, small triangular ram fork, interrupted bone stripes. Preserve a single continuous chassis.',
 'Trail':'A squat grip-specialist rally hatchback: short boxy ochre roof, broad round exposed wheel arches, stubby RIGHT nose, four aggressively treaded tyres, empty roof-rack brace, small flat broken spoiler at LEFT. Chipped bone fender patches, torn rubber flaps and dusty rust underpanels. Compact wide agile stance, no mounted gun.',
 'Flint':'A blunt ram pickup: giant shovel-like welded wedge bumper at RIGHT, short rust forward cab, open EMPTY rectangular scrap cargo bed at LEFT, four oversized squared tyres. A battered bone cross-brace lies flat in the bed. Very squat blocky footprint and broad rightward ram, no occupants.',
 'Quill':'A light mechanical spider: pinched pencil-thin empty central cockpit, four detached-looking slim wheel pods visibly joined by exposed tubular arms, twin bare rear booms at LEFT, one needle-like RIGHT nose. Bone and soot metal with two small rust plates. Large open gaps and spindly limbs, more negative space than bodywork, no full-width hood.',
 'Vandal':'An aggressive interceptor sedan: long chamfered dried-red hood at RIGHT, squared soot cabin, two blank chipped bone diagonal shoulder patches, short unequal fins at LEFT, four mostly enclosed wheels. Asymmetric welded door armour and a low serrated right-facing ram; broad prow, low compact rear.',
 'Kestrel':'A very long spear-like sprint chassis: slender bone spear nose points RIGHT, very narrow dark capsule cockpit, tiny tucked wheel pods, two swept rust rear fins and exposed engine at LEFT. Sparse wrapped exhaust tubes and chipped panels, length dominates width, no large ram or turret.',
 'Bulwark':'An enormous six-wheel armoured endurance carrier: three pairs of massive tyres, full-width squared ram at RIGHT, three parallel bone roof ribs separated by soot channels, two squat roof gun mounts pointing RIGHT, short engine deck at LEFT. Layered rust plate skirts, toothed corner shields. A broad nearly solid battle-wagon mass with very little empty space.'}
PORTRAITS={
 'rook':'Original adult male bitter scavenger, medium-brown skin, gaunt angular cheeks, healed cheek scar, one broken goggle lens on the forehead, uneven close-cropped hair, dust scarf, single oversized jagged welded shoulder plate. Calculating sour expression and a narrow hunched silhouette.',
 'ox':'Original adult female heavy hauler, pale weathered skin, broad square face and neck, short silver bristle hair, dark eyebrow scar, enormous unequal slab shoulder armour and a patched soot work vest. Calm implacable stare, low wide fortress silhouette; chipped bone collar bolts.',
 'vex':'Original adult male speed addict, light-brown skin, swept-back ragged tall crest of dark hair, small moustache, chipped racing goggles hanging at the neck, rust-orange patched sleeveless suit, narrow sharp shoulders. Wild clenched grin, asymmetrical scarf ends and restless pointed silhouette.',
 'mica':'Original adult female grip artist, dark skin, short coiled hair under a dirty bone head wrap, patient focused eyes, two short soot cheek-paint dashes, cropped patched ochre jacket, tyre-rubber shoulder guards. Balanced compact silhouette, rust ear protector, deliberate controlled expression.',
 'relay':'Original adult androgynous racer, fair weathered skin, short asymmetrical dark undercut, repaired ear defenders with a short broken aerial, dried-red and bone patched high-neck jacket, one thin scrap shoulder fin. Thoughtful alert expression, distinctive slanted silhouette, no letters or display screens.',
 'marrow':'Original older adult league boss, olive weathered skin, angular face, deeply lined mouth, silver hair swept into a severe short crest, high soot-black jagged collar and layered rust metal shoulder mantle. Stern hostile composure, imposing wide triangular silhouette, bone scarf and one old healed temple scar; no crown or insignia.'}

def main():
    shapes=check_scale_contract();rows=[]
    for family,items,kind,cell in [('cars',CARS,'car',256),('portraits',PORTRAITS,'portrait',256)]:
        for cls,action in items.items():
            if family=='cars':
                ratio=float(shapes[cls]['lengthM'])/float(shapes[cls]['widthM'])
                action+=' Total silhouette length-to-width ratio '+str(round(ratio,2))+':1, including wheels and appendages. One intact identity reference only, no damage-state variation. Strict overhead roof planes only; NO visible front grille, side doors or vertical walls. Horizontal main axis and nose RIGHT. Keep ALL pixels inside the central 66 percent of the square, at least 17 percent empty margin on each side.'
            else:action+=' One head-and-shoulders bust, facing viewer. Entire hair and shoulders in the central 66 percent of the square; generous empty margin. Symmetric flat material shading, no directional facial lamp. No weapon, car, lettering, real person resemblance or background scene.'
            rows.append(dict(id=f'v2-fusion-{family}-{cls.lower()}-v1',**{'class':cls},prompt_action=action,size='1024x1024',frame='single',background_key='#FF00FF',count=1,status='ready',kind=kind,reference='',batch='v2-fusion-'+family,approval='pending',requires_approval='',cell_limit=cell,style_file='style-fusion.json',wave='V2',asset_family=family,surface_stack=''))
    write_csv(ART/'briefs/v2-fusion-roster.csv',rows)

if __name__=='__main__': main()
