"""Record the executing agent's inspected observations, not owner decisions."""
from common import ART, read_json, write_json, now

NOTES={
 'mechanic':'Young adult with curly hair, patched apron and bearing; gentle worried smile reads helpful. Final framing edit preserves first face and closes the apron hem with full margin. Owner to judge whether nervousness is strong enough.',
 'debt-contract':'Clamped worn folio, plain key and offered bearing explain the debt without baked text. Faces are out of frame; the power imbalance is told through hands. Local lighting disagreement retained.',
 'ally-rook':'Existing gaunt face, broken goggles and jagged shoulder retained; key extended across counter signals joining the player. Expression remains guarded rather than celebratory.',
 'ally-ox':'Existing broad silver-haired hauler presents duplicate blank receipts over the ledger. Final edit removes the pale border while preserving identity. Existing portrait/prose gender inconsistency is exposed on review, not resolved here.',
 'ally-vex':'Existing crest, moustache and neck goggles retained; receipt and part offered with conspiratorial grin. Character stays energetic and recognizable.',
 'ally-mica':'Existing wrap, ear protector, dark skin and focused face retained. Blank duplicate sheets are held forward. Final edit removes the pale paper perimeter.',
 'car-seizure':'Marrow stands beside a covered generic car and hanging blank claim tag; player-specific chassis is left anonymous. No injury or extra player identity.',
 'rig-reveal':'Mechanic identity retained from portrait beside a humble mine-rack car. Red body repaint aligns the panel with the overhead reference. Final anatomy edit removes the extra hand and the curtain altogether: exactly two hands hold the bearing. Narrative perspective differs deliberately from the car sprite; owner should review the simplification.',
 'final-duel':'Exactly two opponents, a small red dispatcher and a much larger six-wheel carrier; two mine discs behind the small car, no finish flag or lap promise. Oblique narrative illustration, not the orthographic car sprite.',
 'ending':'Mechanic and sibling figure reunite beside the covered returned car, torn blank lien and broken restraint. Sibling identity stays deliberately open. Workshop setting is spare; owner should judge whether relief reads strongly enough.',
 'icon-ledger':'Open blank book and clasp retain a clear 32px silhouette. Both source and keyed export inspected; no baked numbers.',
 'icon-payment':'Plain worn coin entering a tray; small-size read depends on pairing with the visible payment label. Local semantic uncertainty retained for owner.',
 'icon-diversion':'Final revision uses one coin feeding two outgoing arrows, one into tray and one red branch away. This reads more clearly than the first pipe/tool silhouette at 32px.',
 'icon-recovery':'Coin held by a curved returning hook; visual recovery motif paired with the explicit recovered amount in the menu.',
 'icon-cancelled':'Broken iron lien shackle with a visible separation; claim cancellation remains game text, never inferred from icon alone.',
 'debt-meter':'Use attempt 2 as a nine-patch frame candidate: it has a measurable transparent opening and passes original pixel gates. Source is 1.816:1, not the requested long slot. Runtime nine-patch expands only interior/edge runs, preserving corners; owner sees that distinction. Third attempt fails margin and is excluded.',
 'rig-reference':'Final overhead framing edit passes unchanged margins/aspect/axis/palette gates. Nose right, three mine canisters and short chute at left rear; plain red/bone coupe on Line dimensions. Reference only; exact owner approval must precede damage states.'}

def main():
    records=read_json(ART/'reports/story-attempts-deterministic.json');direct={};selected={}
    for r in records:
        key=r['brief']['logical_name'];note=NOTES[key]
        if r['codes']:note='REJECTED: '+', '.join(r['codes'])+'. '+note
        if r['id'] in ('story-ally-ox-v1','story-ally-mica-v1'):note='Earlier attempt retains unwanted pale perimeter; superseded by targeted background correction. '+note
        if r['id']=='story-icon-diversion-v1':note='Earlier attempt reads as a shovel/brush at actual 32px; superseded. '+note
        if r['id'] in ('story-rig-reveal-v1','story-rig-reveal-v2'):note='Earlier reveal has an extra curtain-gripping hand as well as the two bearing hands; v1 also has pale car paint. Superseded by final anatomy edit. '+note
        direct[r['id']]={'reviewed':True,'at':now(),'reviewer':'executing-agent; NOT owner acceptance',
            'source_sha256':r['source_sha256'],'export_sha256':r['sha256'],'note':note,
            'technical_eligible':not r['codes'] and r['id'] not in (
                'story-ally-ox-v1','story-ally-mica-v1','story-icon-diversion-v1',
                'story-rig-reveal-v1','story-rig-reveal-v2','story-debt-meter-v1')}
        selected[key]=r['id']
    selected['debt-meter']='story-debt-meter-v1-a2'
    write_json(ART/'audits/story-direct-review.json',direct)
    write_json(ART/'story-selections.json',{'schema':1,'policy':'Candidates to present, not approvals; all owner flags remain false.',
        'candidates':selected,'rig_states':'Exact reference approval required before generation.'})
    print(len(direct),'direct observations;',len(selected),'review candidates; zero owner approvals')

if __name__=='__main__':main()
