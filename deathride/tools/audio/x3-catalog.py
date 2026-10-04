"""Author the initial X3 cue contract. Offline; never calls a provider.

Only run to initialise a new manifest. Later mastering publishes asset metadata.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
cues = []


def cue(id, bus='effects', group='impact', priority=2, cooldown=50, loop=False,
        seconds=1.5, spatial=True, gain=.7):
    cues.append(dict(id=id, bus=bus, group=group, priority=priority,
                     cooldownMs=cooldown, loop=loop, durationSeconds=seconds,
                     spatial=spatial, gain=gain, path='', decodedBytes=0,
                     fallback='silent', status='pending', pitchMin=.75, pitchMax=1.5))


cue('engine.base', 'engines', 'engine', 0, 150, True, 2, True, .35)
for name in ['tyre', 'skid', 'drift']:
    cue('movement.'+name, 'effects', 'movement', 0, 150, True, 2, True, .25)
for name in ['car', 'wall', 'barrier']:
    cue('collision.'+name)
for name in ['rivet.fire', 'rivet.hit', 'hammer.fire', 'hammer.hit', 'mine.drop', 'mine.arm', 'mine.blast', 'scatter.fire']:
    cue('weapon.'+name, group='weapon', seconds=2 if 'blast' in name else 1)
for name in ['ammo', 'repair', 'cash']:
    cue('pickup.'+name, group='pickup', priority=1, cooldown=300, seconds=1, spatial=False)
cue('race.wreck', group='critical', priority=3, cooldown=0, seconds=2)
cue('race.countdown', group='alert', cooldown=500, seconds=.5, spatial=False)
cue('race.start', group='critical', priority=3, cooldown=0, seconds=1, spatial=False)
for name in ['lap', 'position', 'low-hp', 'empty', 'ability-ready']:
    cue('race.'+name, group='alert', cooldown=500, seconds=1, spatial=False, gain=.5)
for name in ['victory', 'defeat']:
    cue('race.'+name, 'music', 'sting', 2, 500, False, 3, False, .6)
for name in ['focus', 'confirm', 'back', 'denied', 'purchase']:
    cue('ui.'+name, 'ui', 'ui', 1, 150 if name=='focus' else 300, False, .5, False, .5)
for name in ['steel-flick','flywheel','shoulder','turbine','ground-bite','punch-lance','bone-rack','scrambler','arc-harpoon','plate-brace']:
    cue('ability.'+name, group='critical', priority=3, cooldown=0, seconds=1)
for name in ['announcer.debt','announcer.boss','announcer.ally','announcer.seizure','announcer.duel','announcer.freedom',
             'mechanic.welcome','mechanic.repair','mechanic.books','mechanic.ally','mechanic.seizure','mechanic.rig','mechanic.duel','mechanic.after']:
    cue('voice.'+name, 'voice', 'voice', 2, 500, False, 12, False, .85)
for name in ['lobby','rolling','hunt','contact','redline']:
    cue('music.'+name, 'music', 'music', 0, 0, False, 150, False, .35)

manifest = dict(schemaVersion=1, maxVoices=8, decodedBudgetBytes=6*1024*1024,
                residentBudgetBytes=12*1024*1024, installedBudgetBytes=24*1024*1024,
                groupCaps=dict(engine=2,movement=1,impact=2,weapon=2,pickup=1,critical=1,alert=1,sting=1,ui=1,voice=1,music=1),
                buses=dict(master=.8,music=.65,engines=.7,effects=.8,voice=1,ui=.7),
                ducking=dict(musicDb=-6,enginesDb=-3,attackSeconds=.06,releaseSeconds=.35),
                spatial=dict(nearM=4,farM=45,cutoffM=60), cues=cues)
dest=ROOT/'assets/audio/cues.json'
if dest.exists():
    raise SystemExit('Manifest already exists; do not overwrite mastered metadata.')
dest.parent.mkdir(parents=True,exist_ok=True)
dest.write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8',newline='\n')
print(f'{len(cues)} cue contracts written')
