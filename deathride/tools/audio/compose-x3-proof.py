"""One original, locally scored 150 s arrangement proof. No provider or sample inputs.
Run from deathride/. Re-running reproduces this composition, not a new candidate.
"""
from pathlib import Path
import importlib.util
import json
import math
import re
import hashlib
import shutil
from datetime import datetime, timezone
import numpy as np

loader=importlib.util.spec_from_file_location('meters',Path(__file__).with_name('measure-audition.py'))
m=importlib.util.module_from_spec(loader);loader.loader.exec_module(m)
BASE=Path('audio/x3/music');BASE.mkdir(parents=True,exist_ok=True);m.BASE=BASE
if (BASE/'acceptance.json').exists() and not (BASE/'first-pass').exists():
    archive=BASE/'first-pass';archive.mkdir()
    for name in ['dust-road-score.flac','dust-road-proof.flac','dust-road-proof.mp3','score.json','protocol.json','acceptance.json']:
        shutil.copyfile(BASE/name,archive/name)
    first=json.loads((archive/'acceptance.json').read_text())
    for row in first['samples']:
        for key in ['raw','edited','preview']:
            row[key]['file']=(archive/Path(row[key]['file']).name).as_posix()
    m.save(archive/'acceptance.json',first)
RATE=22050;BPM=96;BEAT=60/BPM;BAR=4*BEAT;SECONDS=150;SEED=31003;OVERLAP=BEAT
rng=np.random.default_rng(SEED)
sections=[dict(name='Intro',start=0,bars=8,description='Low toms, open fifths and isolated echo guitar; motif enters gradually.'),
          dict(name='Verse',start=20,bars=16,description='Bass pulse and alternating guitar questions; minor progression changes every two bars.'),
          dict(name='Peak',start=60,bars=16,description='Double-time percussion, octave guitar answer, ascending fills and broader harmony.'),
          dict(name='Break',start=100,bars=8,description='Drum bed drops out; low drone and high sparse plucks leave a deliberate space.'),
          dict(name='Outro',start=120,bars=12,description='Half-time return, reduced motif, low final root and a four-second natural fade.')]
policy=dict(durationSeconds=150,durationTolerance=.35,loudnessLufs=-14,loudnessToleranceLu=1,truePeakMaxDbtp=-1,
            clippingThreshold=.999,silenceFractionMax=.35,
            joins=dict(sampleJumpMax=.02,rmsStepMaxDb=6,windowSeconds=.05,
                       spectralCosine='reported only: deliberate instrumentation changes; not a steady loop'),
            structure=dict(requiredSections=['Intro','Verse','Peak','Break','Outro'],
                           repeatedPcmBarsMax=0,peakEventsPerBarMustExceedBreak=True),
            notMeasured=['human musical/style preference','long-race fatigue','new provider long-form quality','physical Stick playback'])
# Declare screens before rendering; do not choose thresholds from the result.
m.save(BASE/'protocol.json',policy)
events=[]
def event(section,bar,beat,kind,note,amp,pan=0,duration=None):
    time=bar*BAR+beat*BEAT+.012
    events.append(dict(section=section['name'],time=round(section['start']+time,6),local=round(time,6),
                       kind=kind,note=note,amp=round(amp,5),pan=pan,duration=duration))

for s in sections:
    name=s['name']
    for bar in range(s['bars']):
        root=([38,38,34,36] if name!='Peak' else [38,41,36,43])[(bar//2)%4]
        if name=='Outro' and bar>=8:root=38
        energy={'Intro':.65+bar*.035,'Verse':.9,'Peak':1.0,'Break':.4,'Outro':.8*(1-bar/16)}[name]
        # No pre-rendered musical phrase is tiled. Each event receives its own
        # articulation; the composed motif develops by register, rhythm and harmony.
        if name!='Break':
            kicks=[0,2] if name!='Peak' else [0,1.5,2,3.5]
            if name=='Intro' and bar<4:kicks=[0]
            for b in kicks:event(s,bar,b,'tom',42 if b==0 else 46,.65*energy,(-.12 if b==0 else .15))
            for b in ([1,3] if name not in ['Intro','Outro'] else [3]):
                event(s,bar,b,'rim',58,.16*energy,.25)
            if name in ['Verse','Peak']:
                for b in np.arange(.5,4,.5 if name=='Peak' else 1):
                    event(s,bar,float(b),'metal',80,.052*energy*(.8+.2*rng.random()),float(rng.uniform(-.65,.65)))
            if bar%4==3 and name in ['Verse','Peak']:
                for j in range(3):event(s,bar,3+j*.25,'tom',50-j*3,.26*energy,-.3+j*.3)
        elif bar in [0,4]:event(s,bar,0,'tom',38,.24,-.1)
        if name in ['Verse','Peak','Outro']:
            for b in ([0,1.5,2.5,3.5] if name=='Peak' else [0,2,3.5]):
                if name=='Outro' and bar>=8 and b>0:continue
                event(s,bar,b,'bass',root-12,.23*energy,0,duration=BEAT*(1.4 if b==0 else .65))
        if name=='Break':
            if bar%2==0:event(s,bar,0,'drone',root-12,.13,0,duration=4.8)
            motif=[(1,root+24),(2.75,root+31)] if bar%2==0 else [(2,root+29)]
        elif name=='Intro':
            motif=[(0,root+12),(2.5,root+19)] if bar<4 else [(0,root+12),(1.75,root+15),(3,root+19)]
        elif name=='Peak':
            motif=[(0,root+24),(1,root+19),(1.75,root+27),(2.5,root+22),(3.25,root+19)]
        elif name=='Outro':
            motif=[(0,root+12),(2.5,root+19)] if bar<8 else [(0,root+12)]
        else:
            motif=[(0,root+12),(1.5,root+19),(2.75,root+15),(3.5,root+22)] if bar%2==0 else [(0,root+19),(2,root+17),(3.25,root+12)]
        for j,(b,note) in enumerate(motif):
            event(s,bar,b,'guitar',note,.18*energy*(.92+.16*rng.random()),-.35 if j%2==0 else .32)
        if name=='Outro' and bar==11:event(s,bar,0,'drone',26,.15,0,duration=2.48)

def synth(e):
    kind=e['kind'];freq=440*2**((e['note']-69)/12)
    duration=e['duration'] or {'guitar':3.2,'bass':.7,'tom':1.25,'rim':.25,'metal':.22,'drone':4.8}[kind]
    t=np.arange(round(duration*RATE))/RATE
    if kind=='guitar':
        signal=np.zeros(len(t))
        for h in range(1,13):
            signal+=np.sin(2*np.pi*freq*h*(1+.00012*h*h)*t+rng.uniform(-.03,.03))*np.exp(-t*(1.4+h*.7))/h**.82
        signal=np.tanh(1.4*signal)*.65
        # Tiny excitation and asymmetric tape echoes retain an original note score.
        signal+=rng.normal(0,.05,len(t))*np.exp(-t*120)
    elif kind=='bass':
        signal=(np.sin(2*np.pi*freq*t)+.28*np.sin(4*np.pi*freq*t))*np.exp(-t*3)
        signal=np.tanh(signal*1.5)*.7
    elif kind=='drone':
        signal=(np.sin(2*np.pi*freq*t)+.25*np.sin(2*np.pi*freq*2.003*t))*(.85+.15*np.cos(2*np.pi*.7*t))*np.exp(-t*.25)
    elif kind=='tom':
        phase=2*np.pi*(freq*t+freq*.45*.045*(1-np.exp(-t/.045)))
        signal=np.sin(phase)*np.exp(-t*6)+.23*np.sin(phase*1.61)*np.exp(-t*10)
        noise=rng.normal(0,1,len(t));signal+=np.convolve(noise,np.ones(9)/9,'same')*.16*np.exp(-t*65)
    elif kind=='rim':
        signal=(rng.normal(0,.45,len(t))+np.sin(2*np.pi*1740*t)*.45)*np.exp(-t*35)
    else:
        signal=sum(np.sin(2*np.pi*f*t+rng.uniform(0,6.28)) for f in [3240,4790,5980,7130])/4*np.exp(-t*33)
    attack=min(len(t),round(RATE*(.08 if kind=='drone' else .002)))
    signal[:attack]*=np.linspace(0,1,attack);tail=min(len(t)//4,round(.04*RATE));signal[-tail:]*=np.linspace(1,0,tail)
    pan=(e['pan']+1)*np.pi/4
    result=signal[:,None]*np.array([np.cos(pan),np.sin(pan)])[None,:]*e['amp']
    if kind=='guitar':
        dry=result.copy()
        for delay,gain in [(BEAT*.75,.23),(BEAT*1.5,.10)]:
            n=round(delay*RATE)
            result[n:]+=dry[:-n,::-1]*gain
    return result

song=np.zeros((round(SECONDS*RATE),2),dtype=np.float64)
partHashes=[]
for i,s in enumerate(sections):
    start=s['start'];duration=s['bars']*BAR
    pad=OVERLAP/2
    part=np.zeros((round((duration+2*pad)*RATE),2))
    for e in (e for e in events if e['section']==s['name']):
        sound=synth(e);a=round((e['local']+pad)*RATE);n=min(len(sound),len(part)-a)
        if n>0:part[a:a+n]+=sound[:n]
    ramp=np.sin(np.linspace(0,np.pi/2,round(OVERLAP*RATE)))**2
    if i>0:part[:len(ramp)]*=ramp[:,None]
    if i<len(sections)-1:part[-len(ramp):]*=(1-ramp)[:,None]
    partHashes.append(dict(section=s['name'],floatPcmSha256=hashlib.sha256(part.astype('<f4').tobytes()).hexdigest(),events=sum(e['section']==s['name'] for e in events)))
    a=round((start-pad)*RATE);lo=max(0,-a);dst=max(0,a);n=min(len(part)-lo,len(song)-dst)
    song[dst:dst+n]+=part[lo:lo+n]
# Revision 2 of the same score: sustained pitched transition notes carry the
# intentional sparse-to-dense changes across the four measured joins. No gate
# changes and no replacement candidate. Preserve the first render above.
bridges=[]
for s,note in zip(sections[1:],[38,45,50,38]):
    e=dict(kind='drone',note=note,amp=.30,pan=0,duration=1.8)
    sound=synth(e);fade=round(.5*RATE)
    sound[:fade]*=np.sin(np.linspace(0,np.pi/2,fade))[:,None]**2
    sound[-fade:]*=np.cos(np.linspace(0,np.pi/2,fade))[:,None]**2
    a=round((s['start']-.75)*RATE);song[a:a+len(sound)]+=sound
    bridges.append(dict(into=s['name'],time=s['start']-.75,**e,fadeSeconds=.5))
song[:round(.02*RATE)]*=np.linspace(0,1,round(.02*RATE))[:,None]
song[-4*RATE:]*=np.cos(np.linspace(0,np.pi/2,4*RATE))[:,None]**2
# Gentle disclosed bus saturation tames percussive crest; raw arrangement retains it.
song=np.tanh(song*1.25)*.8
raw=BASE/'dust-road-score.flac';master=BASE/'dust-road-proof.flac';preview=BASE/'dust-road-proof.mp3'
m.run(['ffmpeg','-hide_banner','-v','error','-y','-f','f32le','-ar',str(RATE),'-ac','2','-i','-','-c:a','flac',str(raw)],song.astype('<f4').tobytes())
spec=dict(category='music',seconds=SECONDS,loop=False)
rawMetric,_=m.measure(raw,spec);ln=rawMetric['loudnormAnalysis']
filt=(f"loudnorm=I=-14:TP=-2:LRA=11:measured_I={ln['input_i']}:measured_TP={ln['input_tp']}:"
      f"measured_LRA={ln['input_lra']}:measured_thresh={ln['input_thresh']}:offset={ln['target_offset']}:linear=true:print_format=json")
norm=m.run(['ffmpeg','-hide_banner','-nostats','-y','-i',str(raw),'-af',filt,'-ar',str(RATE),'-c:a','flac',str(master)])
normReport=json.loads(re.search(r'\{\s*"input_i"[\s\S]*?\}',norm.stderr.decode(errors='replace')).group())
m.run(['ffmpeg','-hide_banner','-v','error','-y','-i',str(master),'-c:a','libmp3lame','-b:a','128k',str(preview)])
edited,pcm=m.measure(master,spec);webMetric,webPcm=m.measure(preview,spec)
def joins(pcm):
    rows=[]
    for s in sections[1:]:
        n=round(s['start']*RATE);w=round(.05*RATE)
        jump=float(np.max(np.abs(pcm[n]-pcm[n-1])))
        steps=[abs(20*math.log10(max(m.rms(pcm[n:n+w,c]),1e-12)/max(m.rms(pcm[n-w:n,c]),1e-12))) for c in range(2)]
        spectrum=m.seam(np.concatenate((pcm[n:n+w],pcm[n-w:n])),RATE)['spectralCosine']
        row=dict(atSeconds=s['start'],into=s['name'],sampleJumpFullScale=jump,rmsStepDb=max(steps),spectralCosine=spectrum,
                 spectralPolicy='reported, not gated: deliberate song section instrumentation changes')
        row['status']='pass' if jump<=.02 and max(steps)<=6 else 'fail';rows.append(row)
    return rows
masterJoins=joins(pcm);previewJoins=joins(webPcm)
for metric,join in [(edited,masterJoins),(webMetric,previewJoins)]:
    metric['checks']['sectionJoins']=all(j['status']=='pass' for j in join)
    metric['failures']=[k for k,v in metric['checks'].items() if not v];metric['status']='pass' if not metric['failures'] else 'fail'
    metric['sectionJoins']=join;metric['loopSeam']={'status':'not applicable','reason':'Linear song with intro/outro; no end-to-start loop claim'}
barFrames=round(BAR*RATE)
hashes=[hashlib.sha256(pcm[i*barFrames:(i+1)*barFrames].astype('<f4').tobytes()).hexdigest() for i in range(60)]
# Coarse 20 ms energy similarity is evidence only; never a musical-quality verdict.
envelope=np.sqrt(np.mean(pcm[:(len(pcm)//441)*441].reshape(-1,441,2)**2,axis=(1,2)))
sectionEvidence=[]
for s in sections:
    a=round(s['start']*RATE);b=round((s['start']+s['bars']*BAR)*RATE)
    sectionEvidence.append({**s,'end':s['start']+s['bars']*BAR,'events':sum(e['section']==s['name'] for e in events),
                            'rmsDbfs':20*math.log10(max(m.rms(pcm[a:b]),1e-12))})
for metric in [rawMetric,edited,webMetric]:metric['file']=(BASE/metric['file']).as_posix()
structure=dict(sections=sectionEvidence,identicalPcmBars=60-len(set(hashes)),uniqueBars=len(set(hashes)),
               peakEventsPerBar=sectionEvidence[2]['events']/16,breakEventsPerBar=sectionEvidence[3]['events']/8)
structure['status']='pass' if structure['identicalPcmBars']==0 and structure['peakEventsPerBar']>structure['breakEventsPerBar'] else 'fail'
score=dict(title='Dust road, unpaid miles',style='01 Dust and drums',origin='Original local note score and synthesis; no imported audio, franchise or artist prompt',
           bpm=BPM,meter='4/4',tonalCentre='D minor with minor-third and flattened-seventh movement',seconds=SECONDS,seed=SEED,
           renderer='tools/audio/compose-x3-proof.py',rendererSha256=m.sha(Path(__file__)),sections=sections,events=events,
           sectionRenders=partHashes,transitionNotes=bridges,arrangement='Five independently rendered parts; 625 ms complementary sine-squared crossfades around four section boundaries; four original sustained transition notes with 500 ms fades; final four-second fade',
           mastering=dict(filter=filt,normalization=normReport['normalization_type'],bus='tanh(1.25*x)*0.8 before raw score export'),credits=0)
m.save(BASE/'score.json',score)
report=dict(at=datetime.now(timezone.utc).isoformat(),protocol='x3-local-full-song-v1',samples=[dict(id='dust-road-proof',status=edited['status'],raw=rawMetric,edited=edited,preview=webMetric)],
            structure=structure,credits=0,paidMusicGenerations=0,proofTracks=1,notMeasured=policy['notMeasured'])
m.save(BASE/'acceptance.json',report)
m.save(BASE/'timeline.json',dict(sections=sectionEvidence,seconds=SECONDS,energyEnvelope20ms=[round(float(x),5) for x in envelope]))
print(json.dumps(dict(master=edited['status'],preview=webMetric['status'],failures=edited['failures'],lufs=edited['integratedLufs'],peak=edited['truePeakDbtp'],joins=masterJoins,structure=structure,credits=0)))
