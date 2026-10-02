"""Compile the explicit 2026-10-02 owner instruction without changing generation guards."""
from common import ART, ROOT, read_json, write_json, sha, now, briefs
from family import write_csv, check_scale_contract, STATES
from fusion_roster import CARS
from gen import reference_gate

APPROVED = ['Line', 'Bastion', 'Trail', 'Flint', 'Vandal', 'Bulwark']
REWORK = {
    'Needle': 'Preserve the supplied skeletal buggy identity: empty slender cage, four skinny exposed wheels on outriggers, forked short RIGHT nose and exposed LEFT rear engine. Change the tubular construction and small body panels to clearly visible SILVER STEEL: broad pale neutral silver-grey metal planes with dark scratched edges, darker steel joints and sparse rust in seams. Steely value separation against dark ground, not white bone paint or yellow tubes. Keep the fragile open gaps and original proportions.',
    'Comet': 'Rework the supplied long low speed racer with AIR-TURBINE ENGINES: two unmistakable cylindrical turbine housings along the LEFT rear chassis, visible open top intake mouths with fan blades, paired exhaust nozzles toward LEFT. A substantially more massive reinforced rear cradle with thick longitudinal spars and plated turbine mounts supports them. Keep the long tapered rust-orange RIGHT nose and small dark canopy; rear mass grows within a narrow footprint, NOT a wide transverse wing. Clearly a ground racing car with four wheels, no aircraft wings. Original improvised mechanical design.',
    'Quill': 'Rework the supplied spider into a MEDIUM-WEIGHT CONTACT FIGHTER. Thicken the central armoured body and wheel-support structure, keep four wheels and some open mechanical gaps but give it substantial welded shoulders and a robust central cockpit. Bone-like curved ivory spikes surround this heavier construction: two or three large attached forward tusks point RIGHT and two or three large rear tusks point LEFT, plus short side teeth. Both front and rear close-contact weapons must be obvious at 96px. Spikes are artificial bone-shaped weapon structures, not loose bones; no gore. Bone and soot metal with rust joints, no lightweight pencil chassis.',
    'Kestrel': 'Rework the supplied long narrow sprint car with ELECTRICITY. An over-energised exposed LEFT rear engine carries chunky coil rings and short bright pale electric arcs contained within its housing, sparse muted blue-white electrical cores. Replace the plain RIGHT front spike with a recognisable ELECTRIC HARPOON: barbed spearhead on a short launching rail, visible coiled tether and insulated cable leading to the engine. Preserve the long narrow cockpit, tiny wheel pods and swept rear fins. Electric energy is drawn flat and crisp, no bloom, ground glow, cast light or detached lightning. Engine and harpoon read at 96px; all parts attached.'
}

def main():
    history=ART/'history.jsonl'
    if history.exists() and '"asset": "v2-part3-' in history.read_text(encoding='utf-8'):
        raise ValueError('Part 3 already initialized: resume the versioned briefs; never overwrite reviewed corrections')
    template=read_json(ART/'V2-REFERENCE-APPROVAL.template.json')['references']
    ledger=read_json(ART/'reference-approvals.json')
    evidence='2026-10-02, OWNER-CHOICE.md section C: "Approved the art direction, looks very solid. For cars." The executing owner instruction explicitly records approval for Line, Bastion, Trail, Flint, Vandal and Bulwark, which were not requested to change. Reviewed exact image: '
    for cls in APPROVED:
        key=f'v2-fusion-cars-{cls.lower()}-v1';entry=dict(template[key])
        assert sha(ROOT/entry['candidate_source'])==entry['source_sha256']
        assert not entry['pixel_codes']
        entry.update(owner_approved=True,owner_evidence=evidence+entry['candidate_source'],approved_at='2026-10-02',owner_evidence_file='art/OWNER-CHOICE.md#c-car-reference-review-owner-2026-10-02')
        ledger['references'][key]=entry
    write_json(ART/'reference-approvals.json',ledger)
    binding=read_json(ART/'owner-choice-binding.json')
    audit=ART/'audits/v2-part3-owner-instruction.json'
    if not audit.exists():
        write_json(audit,{'at':now(),'prior_binding':binding,'current_owner_sha256':sha(ART/'OWNER-CHOICE.md'),'reason':'Owner appended Section C in ec1caa8; Part 3 explicitly authorizes its execution. Original A/B decision and exact style bytes retained.','new_design_slots':list(REWORK),'approved_references':[f'v2-fusion-cars-{c.lower()}-v1' for c in APPROVED],'starting_reservations':338})
    binding.update(owner_choice_sha256=sha(ART/'OWNER-CHOICE.md'),owner_evidence='OWNER-CHOICE.md, owner quotations A/B and appended C (2026-10-02); executing Part 3 instruction authorizes continued fusion and six exact car approvals')
    write_json(ART/'owner-choice-binding.json',binding)
    base=briefs(ART/'briefs/v2-fusion-roster.csv')[0];shapes=check_scale_contract();reworks=[];derived=[]
    for cls,action in REWORK.items():
        ratio=float(shapes[cls]['lengthM'])/float(shapes[cls]['widthM'])
        framing=f' Recompose as one SMALL COMPLETE car in the CENTRAL HALF of the square canvas, only 50 percent canvas width, at least 25 percent empty magenta space LEFT and RIGHT. All wheels, spikes, turbine mounts and electrical marks must stay in this small central region. Total silhouette length-to-width ratio {ratio:.2f}:1 including all appendages. True roof-only overhead plan, horizontal chassis, nose RIGHT; tyre tread tops only, no side doors or wheel hubs. Neutral even material shading and NO cast shadow.'
        reworks.append({**base,'id':f'v2-part3-rework-{cls.lower()}-v1','class':cls,'prompt_action':action+framing,'reference':template[f'v2-fusion-cars-{cls.lower()}-v1']['candidate_source'],'batch':'v2-part3-reworks','requires_approval':''})
    for cls in APPROVED:
        refid=f'v2-fusion-cars-{cls.lower()}-v1'
        invariant='Use the supplied approved image as the exact identity. Freeze geometry, wheel count and wheel centres, chassis footprint, roof/cabin, attachments, camera, rightward heading, neutral lighting and framing. Preserve the same car and its material roles. '+CARS[cls]
        for state,action in STATES.items():
            label='intact' if state=='clean' else state
            derived.append({**base,'id':f'v2-part3-{cls.lower()}-state-{label}-v1','class':cls,'prompt_action':invariant+' Change ONLY state: '+action+' Existing stylistic rust and wear remain even in intact state. Keep the complete subject and clear magenta margin; no background scenery.','reference':template[refid]['candidate_source'],'requires_approval':refid,'batch':f'v2-part3-{cls.lower()}-states'})
        for name,paint in [('bone','muted bleached bone #DDD0A6'),('red','dried blood red #6C2427'),('ochre','sun-baked ochre #A37738')]:
            derived.append({**base,'id':f'v2-part3-{cls.lower()}-livery-{name}-v1','class':cls,'prompt_action':invariant+' Change ONLY painted body panels to '+paint+'. Preserve all glass, rubber, bare metal, structural parts, wear and existing contrasting identity stripe/patches. No new damage. No emblems, text or numbers. Keep the exact complete footprint and generous empty border.','reference':template[refid]['candidate_source'],'requires_approval':refid,'batch':f'v2-part3-{cls.lower()}-liveries'})
    # Identical prompt and style; image conditioning alone is removed in the control arm.
    anchor=next(r for r in derived if r['id']=='v2-part3-line-livery-bone-v1')
    control={**anchor,'id':'v2-part3-consistency-control-v1','reference':'','requires_approval':'','batch':'v2-part3-consistency-control'}
    write_csv(ART/'briefs/v2-part3-reworks.csv',reworks)
    write_csv(ART/'briefs/v2-part3-derived.csv',derived)
    write_csv(ART/'briefs/v2-part3-control.csv',[control])
    for row in reworks+derived+[control]:reference_gate(row)
    print('6 exact approvals; 4 reworks; 42 approved-reference derivatives; 1 unconditioned diagnostic control; all preflight gates pass')

if __name__=='__main__':main()
