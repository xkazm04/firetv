"""Compile the recorded owner fusion; never mutate the owner's evidence."""
from common import ART, read_json, write_json, sha

BRIDGE = ('FUSION BRIDGE: Anchor all families to soot #171513, dark earth #39302A, ochre #A37738, '
          'rust #B4512D, dried red #6C2427, bone #DDD0A6 and sparse hazard yellow #B4A044. '
          'Neutral flat diffuse light only; value changes are pigment and material, never a directional lamp; '
          'no baked cast shadow. At a 96-pixel subject read, broken outer contours occupy 1 to 2 pixels, '
          'interior marks at most 1 pixel; retain large quiet planes. Cluster heavy wear at joints and impact '
          'anchors: chipped paint, soot, exposed metal and rust; natural materials use sparse abrasion and '
          'dry broken texture. Ground, surface and decal boundaries have no continuous ink outline: '
          'use irregular dirt encroachment, worn rubber and fragmentary worn paint. Original designs only.')

def main():
    families = {'cars':'rust-ink','ground':'rust-ink','surfaces':'rust-ink','props':'rust-ink',
                'landmarks':'rust-ink','decals':'rust-ink','portraits':'soot-pulp','barriers':'soot-pulp',
                'backdrops':'soot-pulp','pickups':'hot-ink','effects':'hot-ink','hud-icons':'hot-ink','hud-frames':'hot-ink'}
    style = {**read_json(ART/'style-rust-ink.json'), 'version':'wasteland-family-fusion-v2',
             'name':'Death Ride family fusion', 'status':'owner-chosen-families; references-pending',
             'style_block':BRIDGE, 'bridge_block':BRIDGE,
             'rationale':'Owner family assignments plus explicitly recorded nearest-family host assignments.',
             'family_directions':{f:{'style_file':f'style-{s}.json','sha256':sha(ART/f'style-{s}.json'),
                 'assignment':'owner' if f in ('cars','ground','surfaces','portraits','barriers','hud-icons','effects') else 'host-nearest-family'} for f,s in families.items()}}
    write_json(ART/'style-fusion.json',style)
    (ART/'FUSION-BRIDGE.md').write_text('# Shared fusion bridge\n\n'+BRIDGE+'\n',encoding='utf-8')
    write_json(ART/'owner-choice-binding.json',{'schema':1,'owner_choice':'approved',
        'owner_evidence':'OWNER-CHOICE.md, owner quotations A/B; executing Part 2 instruction authorizes compilation',
        'owner_choice_sha256':sha(ART/'OWNER-CHOICE.md'),'style_file':'style-fusion.json',
        'style_sha256':sha(ART/'style-fusion.json'),'surface_stack':'seeded-decals-tall-props-baked-natural-bands',
        'compiled_by':'executing agent; compilation is not owner reference approval'})

if __name__=='__main__': main()
