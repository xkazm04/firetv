"""Reproducible offline X3 edits, meters, and publish of technically screened assets.

Run from deathride: python tools/audio/master-x3.py effects|engines|voices
Original generation files/sidecars are immutable. No provider calls.
"""
from pathlib import Path
import importlib.util
import json
import math
import re
import shutil
import sys
from datetime import datetime, timezone
import numpy as np

spec = importlib.util.spec_from_file_location('meters', Path(__file__).with_name('measure-audition.py'))
meters = importlib.util.module_from_spec(spec)
spec.loader.exec_module(meters)
wave = sys.argv[1]
BASE = Path('audio/x3') / wave
meters.BASE = BASE
RATE = 22050
for folder in ['edited', 'repeats', 'measurements']:
    (BASE/folder).mkdir(exist_ok=True, parents=True)


def pcm_write(path, pcm, rate=RATE):
    meters.run(['ffmpeg','-hide_banner','-v','error','-y','-f','f32le','-ar',str(rate),
                '-ac',str(pcm.shape[1]),'-i','-','-c:a','pcm_s16le',str(path)],pcm.astype('<f4').tobytes())


def measure(path, category, window, loop=False):
    pcm, rate, channels, stream = meters.decode(path)
    # BS.1770 integrated gate is 400 ms. Preserve short-file timing separately.
    padded = np.pad(pcm, ((0,max(0,math.ceil(.4*rate)-len(pcm))),(0,0)))
    target,tolerance = meters.TARGETS[category]
    log=meters.run(['ffmpeg','-hide_banner','-nostats','-f','f32le','-ar',str(rate),'-ac',str(channels),
                    '-i','-','-af',f'loudnorm=I={target}:TP=-2:LRA=11:print_format=json','-f','null','-'],
                    padded.astype('<f4').tobytes()).stderr.decode(errors='replace')
    loud=json.loads(re.search(r'\{\s*"input_i"[\s\S]*?\}',log).group())
    lufs,peak=float(loud['input_i']),float(loud['input_tp'])
    finite=math.isfinite(lufs) and math.isfinite(peak)
    duration=len(pcm)/rate
    silence=meters.silence(pcm,rate)
    clip=int(np.count_nonzero(np.abs(pcm)>=.999))
    seam=meters.seam(pcm,rate) if loop else {'status':'not applicable','reason':'one-shot or full song'}
    checks=dict(decode=True,duration=window[0]<=duration<=window[1],
                loudness=finite and abs(lufs-target)<=tolerance,truePeak=finite and peak<=-1,
                silence=silence['fraction']<=(.45 if category=='tts' else .35)
                and (not loop or silence['longestInteriorSeconds']<=.25),clipping=clip==0)
    if loop: checks['loopSeam']=seam['status']=='pass'
    return dict(file=path.as_posix(),sha256=meters.sha(path),bytes=path.stat().st_size,
                status='pass' if all(checks.values()) else 'fail',checks=checks,
                failures=[k for k,v in checks.items() if not v],durationSeconds=duration,
                durationWindowSeconds=window,sampleRate=rate,channels=channels,decodedFrames=len(pcm),
                decodedBytes=len(pcm)*channels*2,integratedLufs=lufs if finite else None,
                truePeakDbtp=peak if finite else None,loudnessRangeLu=float(loud['input_lra']),
                loudnessTargetLufs=target,loudnessToleranceLu=tolerance,
                meterPaddingFrames=len(padded)-len(pcm),fullScaleSampleCount=clip,silence=silence,
                loopSeam=seam,loopBoundary=dict(sampleRate=rate,channels=channels,totalFrames=len(pcm),
                startFrame=0,endFrameExclusive=len(pcm),preRollFrames=0,tailPolicy='baked overlap; plain full-span repeat') if loop else None),pcm,loud


def edit(pcm, row):
    # Mono resampling already done by ffmpeg. A fixed policy, not per-result gate tuning.
    if row['loop']:
        pcm=pcm-np.mean(pcm,axis=0)
        length=round(2*RATE)
        overlap=round(.125*RATE)
        if len(pcm)<length+overlap:
            # No invented audio: use an explicitly shorter loop if source is short.
            length=len(pcm)-overlap
        if length < RATE:
            raise ValueError('Insufficient steady source for engine/movement loop')
        start=max(0,(len(pcm)-length-overlap)//2)
        x=pcm[start:start+length+overlap]
        ramp=np.linspace(0,1,overlap)[:,None]
        result=np.concatenate((x[overlap:length],x[length:length+overlap]*(1-ramp)+x[:overlap]*ramp))
        # Put the actual folded transition in the preview body, not at a decoder edge.
        # Choose a quiet derivative on a steady interior boundary. This rotates the
        # same edited cycle; the overlapped seam remains audible inside the cycle.
        best=None
        for centre in np.linspace(0,length-1,48,dtype=int):
            lo=max(1,centre-64);hi=min(length,centre+65)
            if hi<=lo: continue
            point=int(lo+int(np.argmin(np.abs(result[lo:hi,0]-result[lo-1:hi-1,0]))))
            candidate=np.roll(result,-point,axis=0)
            screen=meters.seam(candidate,RATE)
            score=screen['boundaryRmsStepDb']/3+(1-screen['spectralCosine'])*5+screen['sampleJumpFullScale']*50
            if best is None or score<best[0]: best=(score,point,candidate)
        result=best[2]
        return result,dict(operation='mono resample, DC removal, 125 ms complementary overlap, measured interior rotation',
                           sourceStartFrame=start,loopFrames=length,overlapFrames=overlap,rate=RATE,
                           rotationFrames=best[1],rotationPolicy='48 interior candidates, minimum derivative/RMS/spectrum mismatch; no samples replaced',
                           blurRisk='Crossfade can blur motor pulses; repeated human listening pending')
    magnitude=np.max(np.abs(pcm),axis=1)
    active=np.flatnonzero(magnitude>10**(-45/20))
    if not len(active): raise ValueError('No non-silent source to edit')
    margin=round(.01*RATE)
    start=max(0,int(active[0])-margin)
    end=min(len(pcm),int(active[-1])+1+margin)
    # Rivet: first onset from the chosen burst becomes a short per-shot event.
    if row['id']=='rivet-base': end=min(end,start+round(.18*RATE))
    out=pcm[start:end].copy()
    edge=min(round(.003*RATE),len(out)//4)
    out[:edge]*=np.linspace(0,1,edge)[:,None]
    out[-edge:]*=np.linspace(1,0,edge)[:,None]
    return out,dict(operation='mono resample, -45 dBFS edge trim with 10 ms margin, 3 ms edge fades; preserve zero tails (no whole-file DC subtraction)',
                    startFrame=start,endFrameExclusive=end,rate=RATE,rivetFirstOnsetOnly=row['id']=='rivet-base')


def normalize(path, category):
    # Analyse padded window, then apply measured gain to the real short clip.
    metric,pcm,ln=measure(path,category,[0,180])
    if metric['integratedLufs'] is None: raise ValueError('Nonfinite loudness; refused')
    gain=10**((meters.TARGETS[category][0]-metric['integratedLufs'])/20)
    peak=float(np.max(np.abs(pcm*gain)))
    limited=False
    if peak>10**(-2/20):
        # Mild static soft saturation before final loudness normalization, disclosed.
        pcm=np.tanh(pcm*gain/0.5)*0.5
        pcm_write(path,pcm)
        metric,pcm,ln=measure(path,category,[0,180])
        gain=10**((meters.TARGETS[category][0]-metric['integratedLufs'])/20)
        limited=True
    gain=min(gain,10**((-2-float(metric['truePeakDbtp']))/20))
    pcm_write(path,pcm*gain)
    passes=0
    # Bounded crest compression for exceptionally peaky mechanical clicks. Preserve
    # initial attempt evidence; do not relax gates or issue generation retries.
    for _ in range(3):
        current,signal,_=measure(path,category,[0,180])
        if current['checks']['loudness']: break
        if current['integratedLufs'] is None: break
        peak=max(float(np.max(np.abs(signal))),1e-9)
        signal=np.tanh(signal/peak*3)*.35
        pcm_write(path,signal)
        current,signal,_=measure(path,category,[0,180])
        scale=min(10**((meters.TARGETS[category][0]-current['integratedLufs'])/20),10**((-2-current['truePeakDbtp'])/20))
        pcm_write(path,signal*scale)
        passes+=1
    return dict(operation='measured gain with -2 dBTP ceiling; tanh soft limiting if crest exceeds ceiling',
                softLimited=limited,additionalCrestCompressionPasses=passes,gain=gain,credits=0)


def main():
    plan=json.loads((BASE/'plan.json').read_text())
    if (BASE/'acceptance.json').exists() and not (BASE/'first-pass').exists():
        archive=BASE/'first-pass'
        archive.mkdir()
        shutil.copyfile(BASE/'acceptance.json',archive/'acceptance.json')
        for folder in ['edited','measurements','repeats']:
            shutil.copytree(BASE/folder,archive/folder)
        for file in archive.rglob('*.json'):
            text=file.read_text(encoding='utf-8')
            for folder in ['edited','repeats']:
                text=text.replace((BASE/folder).as_posix()+'/',(archive/folder).as_posix()+'/')
            file.write_text(text,encoding='utf-8',newline='\n')
    rows=[]
    manifest_path=Path('assets/audio/cues.json')
    manifest=json.loads(manifest_path.read_text())
    catalogue={r['id']:r for r in manifest['cues']}
    for row in plan['samples']:
        original=(Path('audio/audition/raw')/(row['source']+'.mp3')) if row['kind']=='reuse' else BASE/'raw'/(row['id']+'.mp3')
        entry=dict(id=row['id'],cue=row['cue'],category=row['category'],loop=bool(row['loop']),
                   measuredAt=datetime.now(timezone.utc).isoformat(),ownerStatus='listening pending',
                   notMeasured=['semantic fidelity','owner preference','in-game masking/latency','physical Stick playback/memory'])
        if not original.exists():
            entry.update(status='missing',error='No generated source; fallback remains silent')
            rows.append(entry)
            continue
        try:
            side=json.loads(Path(str(original)+'.json').read_text())
            if side['status']!='complete' or side['sha256']!=meters.sha(original): raise ValueError('Source/sidecar mismatch')
            entry['provenance']=dict(sidecar=str(original)+'.json',sourceSha256=side['sha256'],
                                     generatedAt=side['ts'],request=side['request'],
                                     budgetCharge=side['budgetCharge'],providerCredits=side.get('providerCredits'),
                                     session=side['session'],reused=row['kind']=='reuse')
            raw_window=([1,20] if row['category']=='tts' else [row['seconds']-.15,row['seconds']+.15])
            entry['raw'],_,_=measure(original,row['category'],raw_window,row['loop'])
            p=meters.run(['ffmpeg','-hide_banner','-v','error','-i',str(original),'-ar',str(RATE),'-ac','1','-f','f32le','-'])
            mono=np.frombuffer(p.stdout,dtype='<f4').astype(np.float64).reshape(-1,1)
            edited,recipe=edit(mono,row)
            path=BASE/'edited'/(row['id']+'.wav')
            pcm_write(path,edited)
            entry['edit']=recipe
            entry['normalization']=normalize(path,row['category'])
            intended=len(edited)/RATE
            if not row['loop']:
                preliminary,signal,_=measure(path,row['category'],[0,180])
                intervals=preliminary['silence']['intervalsFrames']
                # Ignore <=25 ms codec-edge residue beyond a >=100 ms silent tail.
                # Preserve interior speech pauses. This is an edit, never a waived gate.
                start,end=0,len(signal)
                for a,b in intervals:
                    if a<=round(.025*RATE): start=max(start,b-round(.01*RATE))
                    if b>=len(signal)-round(.025*RATE): end=min(end,a+round(.01*RATE))
                if end>start and (start>0 or end<len(signal)):
                    entry['tailCleanup']=dict(before=preliminary,startFrame=start,endFrameExclusive=end,
                                              operation='trim measured edge silence and <=25 ms codec residue; retain 10 ms margin')
                    signal=signal[start:end].copy()
                    fade=min(round(.003*RATE),len(signal)//4)
                    signal[:fade]*=np.linspace(0,1,fade)[:,None]
                    signal[-fade:]*=np.linspace(1,0,fade)[:,None]
                    pcm_write(path,signal)
                    entry['tailCleanup']['normalization']=normalize(path,row['category'])
                    intended=len(signal)/RATE
            entry['edited'],out,_=measure(path,row['category'],[max(0,intended-.002),intended+.002],row['loop'])
            entry['status']=entry['edited']['status']
            entry['sourceDefects']=entry['raw']['failures']
            if row['loop']:
                repeat=BASE/'repeats'/(row['id']+'-three-cycles.ogg')
                meters.run(['ffmpeg','-hide_banner','-v','error','-y','-f','f32le','-ar',str(RATE),'-ac','1','-i','-',
                            '-c:a','libvorbis','-q:a','4',str(repeat)],np.tile(out,(3,1)).astype('<f4').tobytes())
                entry['repeat']=dict(file=repeat.as_posix(),sha256=meters.sha(repeat),cycles=3,humanListen='not measured')
            if row['cue'] and wave!='engines':
                cue=catalogue[row['cue']]
                if entry['status']=='pass':
                    dest=Path('assets/audio/clips')/(row['cue']+'.wav')
                    dest.parent.mkdir(exist_ok=True,parents=True)
                    shutil.copyfile(path,dest)
                    cue.update(path=dest.relative_to('assets').as_posix(),status='technical-pass',
                               durationSeconds=entry['edited']['durationSeconds'],decodedBytes=entry['edited']['decodedBytes'],
                               sha256=entry['edited']['sha256'],ownerReview='pending',
                               evidence=(BASE/'measurements'/(row['id']+'.json')).as_posix(),
                               loopBoundary=entry['edited']['loopBoundary'])
                else:
                    cue.update(path='',decodedBytes=0,status='failed-screen')
        except Exception as error:
            entry.update(status='fail',error=str(error))
        meters.save(BASE/'measurements'/(row['id']+'.json'),entry)
        rows.append(entry)
        print(json.dumps(dict(id=row['id'],status=entry['status'],failures=entry.get('edited',{}).get('failures'),error=entry.get('error'))),flush=True)
    meters.save(BASE/'acceptance.json',dict(protocol='deathride-x3-screen-v1',wave=wave,
        at=datetime.now(timezone.utc).isoformat(),sampleRate=RATE,
        ffmpegVersion=meters.run(['ffmpeg','-version']).stdout.decode().splitlines()[0],
        notes='Original failures retained. Edited duration based on reproducible trim recipe; thresholds fixed in bible before edits. Short-clip meter padding disclosed.',samples=rows))
    if wave=='effects':
        # Deliberate vocabulary reuse, not invented generation or four extra loads.
        for target,source in {'race.position':'race.lap','race.low-hp':'ui.denied',
                              'race.empty':'ui.denied','race.ability-ready':'ui.confirm'}.items():
            dest,original=catalogue[target],catalogue[source]
            for key in ['path','status','durationSeconds','decodedBytes','sha256','evidence','ownerReview']:
                if key in original: dest[key]=original[key]
            dest['sourceCue']=source
    if wave!='engines': meters.save(manifest_path,manifest)


if __name__=='__main__': main()
