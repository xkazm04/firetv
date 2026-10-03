"""Install owner-selected delivered audio bytes. No synthesis, edits or provider access."""
import copy
import hashlib
import json
import shutil
from pathlib import Path

ROOT=next(p for p in Path(__file__).resolve().parents if (p/'assets/audio/cues.json').exists())
AUTHORITY='docs/concepts/DEATH-RIDE-OWNER-DECISIONS-2026-10-03.md sections 2-4'
ENGINES={'Needle':[],'Line':['line-1'],'Bastion':['bastion-1','bastion-2'],'Comet':['comet-2'],
    'Trail':['trail-2'],'Flint':['flint-1'],'Quill':['quill-1'],'Vandal':['vandal-1'],'Kestrel':['kestrel-1'],'Bulwark':['bulwark-1']}
GAPS={'movement.tyre':'Owner Reject: tyre. Silent; no replacement.',
    'movement.skid':'Owner Reject: skid. Silent; no replacement.',
    'movement.drift':'Owner Reject: drift. Silent; no replacement.',
    'weapon.mine.drop':'Owner Reject: mine-drop. Silent; mine arm and blast remain.',
    'race.lap':'Owner Reject: lap. Silent; no replacement.',
    'race.position':'The position cue reused rejected lap bytes; silent too.'}
MUSIC={**{'music.track.'+t:'track-'+t for t in ('industrial','quarry','desert','wetland','alpine')},
    'music.lobby':'lobby','music.garage':'garage','music.shop':'shop','music.results':'results',
    **{'music.hub.'+h:'hub-'+h for h in ('yards','foundry','flats','mountain','crown')},
    'music.boss':'boss-race','music.finale':'death-duel','music.ending':'ending',
    'music.sting.victory':'sting-victory','music.sting.defeat':'sting-defeat'}


def read(p):return json.loads(p.read_text(encoding='utf-8'))
def write(p,d):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,indent=2)+'\n',encoding='utf-8')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()


def apply():
    target=ROOT/'assets/audio/cues.json';manifest=read(target)
    archive=ROOT/'audio/owner-2026-10-03';archive.mkdir(exist_ok=True)
    if not (archive/'before-cues.json').exists():shutil.copy2(target,archive/'before-cues.json')
    manifest=read(archive/'before-cues.json');cues={c['id']:c for c in manifest['cues']}
    audit=dict(authority=AUTHORITY,generated_assets=0,spend=0,installed=[],gaps=GAPS,engine_variants=ENGINES,
        music='none; rejected proof remains in audio/x3/music outside assets')
    def install(cue,sample,wave):
        edited=sample['edited'];source=ROOT/edited['file']
        assert sha(source)==edited['sha256']
        path='audio/clips/'+cue['id']+'.wav';dest=ROOT/'assets'/path
        shutil.copy2(source,dest)
        cue.update(path=path,sha256=edited['sha256'],decodedBytes=edited['decodedBytes'],
            durationSeconds=edited['durationSeconds'],status='technical-pass' if edited['status']=='pass' else 'owner-accepted',
            technicalStatus=edited['status'],technicalFailures=edited['failures'],ownerReview='Keep',ownerEvidence=AUTHORITY,
            sourceId=sample['id'],sourceSha256=sample['provenance']['sourceSha256'],
            evidence=f'audio/x3/{wave}/acceptance.json',loopBoundary=edited.get('loopBoundary'))
        audit['installed'].append(dict(cue=cue['id'],sample=sample['id'],path=path,sha256=sha(dest),technicalStatus=edited['status'],failures=edited['failures']))
    for wave in ('effects','voices'):
        for sample in read(ROOT/f'audio/x3/{wave}/acceptance.json')['samples']:
            id=sample.get('cue')
            if sample['id']=='crunch-base':
                id='collision.car.base';cues[id]=copy.deepcopy(cues['collision.car']);cues[id]['id']=id
            if not id or id not in cues:continue
            cue=cues[id]
            if id in GAPS:continue
            install(cue,sample,wave)
            if id=='race.countdown':cue.update(ownerReview='Maybe',reviewFlag='Kept as delivered; owner flagged for later review.')
            if id in ('race.victory','race.defeat'):
                cue.update(bus='effects',stream=False,note='Owner-kept nonmelodic percussion effect; not a music track.')
    for car,variants in ENGINES.items():
        for sample_id in variants:
            sample=next(s for s in read(ROOT/'audio/x3/engines/acceptance.json')['samples'] if s['id']==sample_id)
            id='engine.'+sample_id.replace('-','.')
            cue=copy.deepcopy(cues['engine.base']);cue.update(id=id,fallback='engine.base')
            install(cue,sample,'engines');cues[id]=cue
    for id,note in GAPS.items():
        cue=cues[id]
        cue.update(path='',decodedBytes=0,status='owner-rejected',ownerReview='Reject',ownerEvidence=AUTHORITY,gap=note,fallback='silent')
        cue.pop('sha256',None);cue.pop('loopBoundary',None)
    # Retained non-rejected aliases inherit the exact selected file and owner status.
    for alias,base in [('race.low-hp','ui.denied'),('race.empty','ui.denied'),('race.ability-ready','ui.confirm')]:
        for key in ('path','sha256','decodedBytes','durationSeconds','status','ownerReview','ownerEvidence'):
            cues[alias][key]=cues[base][key]
    music_base=copy.deepcopy(cues['music.lobby'])
    for id,name in MUSIC.items():
        cue=cues.setdefault(id,{**music_base,'id':id})
        cue.update(path='',decodedBytes=0,status='no-music',ownerReview='Deferred to owner Suno delivery',
            expectedPath='audio/music/'+name+'.ogg',stream=True,loop=False,
            durationSeconds=6 if id.startswith('music.sting.') else 150,
            group='sting' if id.startswith('music.sting.') else 'music')
    for cue in cues.values():
        if cue['bus']=='music':cue.update(path='',decodedBytes=0,status='no-music')
    manifest.update(cues=list(cues.values()),ownerDecisions=AUTHORITY,musicMode='none',music=[],
        musicPolicy='No music ships. The rejected 150-second proof is archived outside assets. See SUNO-MUSIC-BRIEF.md.',
        engineVariants={car:['engine.'+s.replace('-','.') for s in variants] for car,variants in ENGINES.items()},
        engineFallback='engine.base',engineVariantPolicy='Primary at index 0, alternate at index 1. Stable emitter-slot selection; Needle uses base.',
        gaps={**GAPS,'engine.Needle':'Both Needle candidates rejected; engine.base fallback. No replacement generation.'})
    # Only remove exact previously shipped files now unreferenced. Originals remain in X3's archive.
    used={c['path'] for c in cues.values() if c['path']}
    for p in (ROOT/'assets/audio/clips').glob('*.wav'):
        if p.relative_to(ROOT/'assets').as_posix() not in used:
            old=archive/'excluded'/p.name;old.parent.mkdir(exist_ok=True)
            if old.exists():assert sha(old)==sha(p)
            else:shutil.copy2(p,old)
            p.unlink()
        elif (archive/'excluded'/p.name).exists():
            assert sha(archive/'excluded'/p.name)==sha(p)
            (archive/'excluded'/p.name).unlink()
    audit['decodedBytes']=sum(c['decodedBytes'] for c in {c['path']:c for c in cues.values() if c['path']}.values())
    assert audit['decodedBytes']<=manifest['decodedBudgetBytes']
    write(target,manifest);write(archive/'application.json',audit)
    print(json.dumps(dict(cues=len(cues),uniqueFiles=len(used),decodedBytes=audit['decodedBytes'],musicMode='none')))


if __name__=='__main__':apply()
