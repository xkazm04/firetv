"""Independent owner-decision/hash/budget/APK audit. Reads local files only."""
import hashlib
import html
import json
import os
import wave
import zipfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'evidence/owner-decisions/audio'
ENGINES={'Needle':[],'Line':['line-1'],'Bastion':['bastion-1','bastion-2'],'Comet':['comet-2'],
    'Trail':['trail-2'],'Flint':['flint-1'],'Quill':['quill-1'],'Vandal':['vandal-1'],'Kestrel':['kestrel-1'],'Bulwark':['bulwark-1']}
REJECTS={'tyre','skid','drift','mine-drop','lap'}
SILENT={'movement.tyre','movement.skid','movement.drift','weapon.mine.drop','race.lap','race.position'}
EFFECTS={'engine-base','rivet-base','mine-base','crunch-base','crunch-retry','pickup-base','confirm-base',
    'wall','barrier','rivet-hit','hammer-fire','hammer-hit','mine-arm','scatter','pickup-ammo','pickup-repair',
    'wreck','start','victory','defeat','ui-focus','ui-back','ui-denied','ui-purchase','countdown',
    'ability-steel-flick','ability-flywheel','ability-shoulder','ability-turbine','ability-ground-bite',
    'ability-punch-lance','ability-bone-rack','ability-scrambler','ability-arc-harpoon','ability-plate-brace'}
VOICES={'announcer.debt','announcer.boss','announcer.ally','announcer.seizure','announcer.duel','announcer.freedom',
    'mechanic.welcome','mechanic.repair','mechanic.books','mechanic.ally','mechanic.seizure','mechanic.rig','mechanic.duel','mechanic.after'}

def read(path):return json.loads(path.read_text(encoding='utf-8'))
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def require(ok,message):
    if not ok:raise AssertionError(message)

def validate(manifest=None,apk=True):
    m=manifest if manifest is not None else read(ROOT/'assets/audio/cues.json')
    cues={c['id']:c for c in m['cues']}
    require(len(cues)==len(m['cues']),'duplicate cue id')
    require(m['musicMode']=='none' and m['music']==[],'music must be explicitly empty')
    require(all(not c['path'] and c['decodedBytes']==0 and c['status']=='no-music' for c in cues.values() if c['bus']=='music'),'music path leaked')
    expected={car:['engine.'+s.replace('-','.') for s in ids] for car,ids in ENGINES.items()}
    require(m['engineVariants']==expected and m['engineFallback']=='engine.base','engine owner selection changed')
    for id in SILENT:
        c=cues[id]
        require(not c['path'] and c['decodedBytes']==0 and c['status']=='owner-rejected' and id in m['gaps'],f'{id} must remain silent with gap')
    require('engine.Needle' in m['gaps'],'Needle fallback gap missing')
    selected=[];rejected_hashes=set()
    for group in ('effects','engines','voices'):
        samples=read(ROOT/f'audio/x3/{group}/acceptance.json')['samples']
        if group=='effects':require({s['id'] for s in samples}==EFFECTS|REJECTS,'effect inventory changed')
        if group=='voices':require({s['cue'].removeprefix('voice.') for s in samples}==VOICES,'voice inventory changed')
        for s in samples:
            keep=s['id'] in EFFECTS if group=='effects' else s['id'] in sum(ENGINES.values(),[]) if group=='engines' else True
            if not keep:
                rejected_hashes.add(s['edited']['sha256']);continue
            id='engine.'+s['id'].replace('-','.') if group=='engines' else 'collision.car.base' if s['id']=='crunch-base' else s['cue']
            c=cues[id];e=s['edited'];path=ROOT/'assets'/c['path']
            require(c['path'] and path.is_file(),f'missing selected {id}')
            require(sha(path)==c['sha256']==e['sha256']==sha(ROOT/e['file']),f'exact delivered hash mismatch {id}')
            require(c['sourceSha256']==s['provenance']['sourceSha256'],f'provenance mismatch {id}')
            require(c['technicalStatus']==e['status'] and c['technicalFailures']==e['failures'],f'technical history changed {id}')
            require(c['ownerReview']==('Maybe' if id=='race.countdown' else 'Keep') and c['ownerEvidence'],f'owner authority missing {id}')
            require(c['status']==('technical-pass' if e['status']=='pass' else 'owner-accepted'),f'status mismatch {id}')
            with wave.open(str(path),'rb') as w:
                decoded=w.getnframes()*w.getnchannels()*w.getsampwidth()
                require(w.getframerate()==22050 and w.getnchannels()==1 and w.getsampwidth()==2,f'PCM format changed {id}')
                require(decoded==c['decodedBytes']==e['decodedBytes'],f'decoded accounting mismatch {id}')
                require(abs(w.getnframes()/w.getframerate()-c['durationSeconds'])<1e-8,f'duration mismatch {id}')
            selected.append(dict(id=id,path=c['path'],sha256=c['sha256'],sourceSha256=c['sourceSha256'],
                decodedBytes=decoded,seconds=c['durationSeconds'],technicalStatus=c['technicalStatus'],failures=c['technicalFailures'],ownerReview=c['ownerReview']))
    require(len(selected)==59,'selected inventory must be 35 effects + 10 engines + 14 voices')
    used={c['path'] for c in cues.values() if c['path']}
    require(used=={c['path'] for c in selected},'unreviewed playable asset')
    actual={p.relative_to(ROOT/'assets').as_posix() for p in (ROOT/'assets/audio').rglob('*') if p.is_file() and p.name!='cues.json'}
    require(actual==used,'unreferenced audio shipped')
    require(not rejected_hashes.intersection(c['sha256'] for c in cues.values() if c['path']),'rejected audio bytes shipped under alias')
    require(cues['race.countdown'].get('reviewFlag'),'countdown review flag absent')
    require(all(cues[id]['bus']=='effects' and not cues[id]['stream'] for id in ('race.victory','race.defeat')),'kept percussion effects must remain audible')
    require(cues['voice.mechanic.seizure']['status']=='owner-accepted' and cues['voice.mechanic.seizure']['technicalFailures']==['silence'],'delivered paused voice must retain honest status')
    for alias,base in [('race.low-hp','ui.denied'),('race.empty','ui.denied'),('race.ability-ready','ui.confirm')]:
        require(cues[alias]['path']==cues[base]['path'] and cues[alias]['sha256']==cues[base]['sha256'],f'alias mismatch {alias}')
    decoded=sum(c['decodedBytes'] for c in selected)
    require(decoded<=m['decodedBudgetBytes']<=6*1024*1024 and m['maxVoices']<=8,'audio budget exceeded')
    brief=(ROOT.parent/'docs/concepts/deathride/SUNO-MUSIC-BRIEF.md').read_text(encoding='utf-8')
    future={id:c['expectedPath'] for id,c in cues.items() if c.get('expectedPath')}
    require(len(future)==19 and all(id in brief and Path(p).name in brief for id,p in future.items()),'Suno cue handoff mismatch')
    apk_path=ROOT/'app/build/outputs/apk/debug/app-debug.apk'
    if apk:
        with zipfile.ZipFile(apk_path) as z:
            shipped={n.removeprefix('assets/') for n in z.namelist() if n.startswith('assets/audio/')}
            require(shipped==used|{'audio/cues.json'},'APK audio inventory differs')
            require(z.read('assets/audio/cues.json')==(ROOT/'assets/audio/cues.json').read_bytes(),'APK manifest stale')
            for c in selected:require(hashlib.sha256(z.read('assets/'+c['path'])).hexdigest()==c['sha256'],f'APK hash {c["id"]}')
            require(not any('dust-road-proof' in n for n in z.namelist()),'rejected proof in APK')
    return dict(result='pass',musicMode='none',uniqueFiles=len(used),decodedBytes=decoded,decodedBudgetBytes=m['decodedBudgetBytes'],
        maxVoices=m['maxVoices'],engineVariants=m['engineVariants'],gaps=m['gaps'],countdown='Maybe, kept as delivered',selected=selected,
        futureMusic=future,apkSha256=sha(apk_path) if apk else None,
        notMeasured=['physical Fire TV','human listening','speaker masking','native PSS'])

def self_review():
    import copy
    original=read(ROOT/'assets/audio/cues.json');results=[]
    def case(name,change):
        m=copy.deepcopy(original);change(m)
        try:validate(m,apk=False)
        except AssertionError as e:results.append(dict(planted=name,caught=str(e)));return
        raise AssertionError('gate did not fire: '+name)
    case('music mode re-enabled',lambda m:m.update(musicMode='enabled'))
    case('Needle candidate substituted',lambda m:m['engineVariants'].update(Needle=['engine.line.1']))
    case('rejected lap path restored',lambda m:next(c for c in m['cues'] if c['id']=='race.lap').update(path='audio/clips/race.start.wav'))
    case('kept exact hash stale',lambda m:next(c for c in m['cues'] if c['id']=='engine.base').update(sha256='0'*64))
    case('technical failed silence hidden',lambda m:next(c for c in m['cues'] if c['id']=='voice.mechanic.seizure').update(technicalStatus='pass'))
    case('countdown flag removed',lambda m:next(c for c in m['cues'] if c['id']=='race.countdown').pop('reviewFlag'))
    case('kept victory accidentally muted',lambda m:next(c for c in m['cues'] if c['id']=='race.victory').update(bus='music'))
    return results

def main():
    r=validate();r['selfReview']=self_review();OUT.mkdir(parents=True,exist_ok=True)
    (OUT/'report.json').write_text(json.dumps(r,indent=2)+'\n',encoding='utf-8')
    esc=html.escape;rel=lambda p:Path(os.path.relpath(p,OUT)).as_posix()
    cards=''.join(f'<article><h3>{esc(c["id"])}</h3><audio controls preload="none" src="{rel(ROOT/"assets"/c["path"])}"></audio><p>{c["ownerReview"]}; {c["seconds"]:.2f}s. Technical: {c["technicalStatus"]} {esc(str(c["failures"]))}</p><details><summary>Exact delivered hash</summary><code>{c["sha256"]}</code></details></article>' for c in r['selected'])
    gaps=''.join(f'<li><b>{esc(k)}</b>: {esc(v)}</li>' for k,v in r['gaps'].items())
    rows=''.join(f'<tr><td>{esc(k)}</td><td>{esc(", ".join(v) or "engine.base fallback")}</td></tr>' for k,v in r['engineVariants'].items())
    page=f'''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Audio owner decisions applied</title><style>body{{font:16px system-ui;background:#eee5d8;color:#251e17;max-width:1100px;margin:2em auto;padding:1em}}.cards{{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:14px}}article{{border:1px solid #7e6b54;padding:12px;min-width:0}}audio{{width:100%;max-width:100%}}code,td,h3{{overflow-wrap:anywhere}}table{{width:100%;border-collapse:collapse}}td{{padding:8px;border:1px solid #7e6b54}}</style><h1>Audio decisions applied — 2026-10-03</h1><p><b>No music ships.</b> All 59 files below are exact delivered X3 WAVs: 35 effects (including flagged countdown), 10 car engine variants and 14 voices. Decoded resident audio is {r['decodedBytes']:,} bytes of {r['decodedBudgetBytes']:,}; all Sound/Music voices share the cap of eight.</p><p>Needle uses the approved base. Bastion primary is variant 1 and alternate is variant 2; stable emitter slots select the variant. Quiet contacts use kept crunch-base, strong contacts use kept crunch-retry. Kept victory/defeat percussion are effects. The rejected 150-second proof remains archived outside assets and the APK.</p><p>The owner accepted mechanic.seizure as delivered. Its pauses retain the technical silence failure; the clip plays and captions remain. Countdown is kept with its Maybe flag. No edits, generation, provider calls or spending occurred.</p><h2>Engine routing</h2><table>{rows}</table><h2>Logged gaps</h2><ul>{gaps}</ul><h2>Active deliveries</h2><div class="cards">{cards}</div><h2>Evidence and music handoff</h2><p><a href="report.json">Hashes, APK proof, budgets and seven planted audit failures</a> · <a href="native-audio.json">Native decoder / eight-voice / lifecycle audit</a> · <a href="{rel(ROOT.parent/'docs/concepts/deathride/SUNO-MUSIC-BRIEF.md')}">Suno brief: 19 contexts and reserved cue IDs</a> · <a href="{rel(ROOT.parent/'docs/concepts/DEATH-RIDE-OWNER-DECISIONS-2026-10-03.md')}">Owner authority</a></p><p>Desktop/browser checks do not establish physical TV listening, masking or memory. No Stick access.</p><script>document.addEventListener('play',e=>{{if(e.target.tagName==='AUDIO')for(const a of document.querySelectorAll('audio'))if(a!==e.target)a.pause()}},true)</script></html>'''
    (OUT/'index.html').write_text(page,encoding='utf-8')
    print(json.dumps({k:v for k,v in r.items() if k not in ('selected','engineVariants','gaps','futureMusic')},indent=2))

if __name__=='__main__':main()
