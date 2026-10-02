"""Offline deterministic screening and loudness-matched comparison copies; no API access.
Run from deathride/: python tools/audio/measure-audition.py
Requires ffmpeg, ffprobe, numpy. Original bytes are never modified.
"""
from pathlib import Path
import hashlib
import json
import math
import re
import subprocess
from datetime import datetime, timezone
import numpy as np

BASE = Path('audio/audition')
TARGETS = {'music': (-14, 1), 'sfx': (-20, 2), 'tts': (-18, 1)}


def run(args, data=None):
    p = subprocess.run(args, input=data, capture_output=True, check=False)
    if p.returncode:
        raise RuntimeError(f'{args[0]} failed: {p.stderr.decode(errors="replace")[-1600:]}')
    return p


def save(path, value):
    path.write_text(json.dumps(value, indent=2, allow_nan=False) + '\n', encoding='utf-8', newline='\n')


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def decode(path):
    probe = json.loads(run(['ffprobe', '-v', 'error', '-select_streams', 'a:0', '-show_streams', '-of', 'json', str(path)]).stdout)
    stream = probe['streams'][0]
    rate, channels = int(stream['sample_rate']), int(stream['channels'])
    p = run(['ffmpeg', '-hide_banner', '-v', 'error', '-xerror', '-i', str(path), '-map', '0:a:0', '-f', 'f32le', '-acodec', 'pcm_f32le', '-'])
    pcm = np.frombuffer(p.stdout, dtype='<f4').reshape(-1, channels).astype(np.float64)
    if not len(pcm) or not np.isfinite(pcm).all():
        raise RuntimeError('Empty or nonfinite decoded signal')
    return pcm, rate, channels, stream


def rms(x):
    return float(np.sqrt(np.mean(np.square(x))))


def silence(pcm, rate):
    # Each interval must remain below -50 dBFS in every channel for >=100 ms.
    quiet = np.max(np.abs(pcm), axis=1) < 10 ** (-50 / 20)
    edges = np.flatnonzero(np.diff(np.r_[False, quiet, False].astype(np.int8)))
    intervals = [[int(a), int(b)] for a, b in zip(edges[::2], edges[1::2]) if b - a >= math.ceil(.1 * rate)]
    total = sum(b - a for a, b in intervals)
    interior = max([0] + [(b - a) / rate for a, b in intervals if a > .05 * rate and b < len(pcm) - .05 * rate])
    return {'thresholdDbfs': -50, 'minimumIntervalSeconds': .1, 'intervalsFrames': intervals,
            'fraction': total / len(pcm), 'longestInteriorSeconds': interior}


def seam(pcm, rate):
    n = max(32, round(.05 * rate))
    head, tail = pcm[:n], pcm[-n:]
    jump = float(np.max(np.abs(pcm[0] - pcm[-1])))
    # Per-channel levels/spectra avoid stereo cancellation hiding a bad channel.
    level_steps, similarities = [], []
    bands = np.array([20, 80, 250, 1000, 4000, 12000, rate / 2])
    freq = np.fft.rfftfreq(n, 1 / rate)
    for c in range(pcm.shape[1]):
        h, t = head[:, c], tail[:, c]
        level_steps.append(abs(20 * math.log10(max(rms(h), 1e-12) / max(rms(t), 1e-12))))
        spectra = []
        for x in (h, t):
            power = np.abs(np.fft.rfft(x * np.hanning(n))) ** 2
            spectra.append(np.sqrt([float(power[(freq >= a) & (freq < b)].sum()) for a, b in zip(bands[:-1], bands[1:])]))
        norm = float(np.linalg.norm(spectra[0]) * np.linalg.norm(spectra[1]))
        similarities.append(float(np.dot(*spectra) / norm) if norm > 1e-18 else 0.0)
    level, spectrum = max(level_steps), min(similarities)
    # Exercise two actual joins in a 3-cycle PCM sequence; no repair/crossfade.
    repeated = np.tile(pcm, (3, 1))
    repeated_jumps = [float(np.max(np.abs(repeated[k * len(pcm)] - repeated[k * len(pcm) - 1]))) for k in (1, 2)]
    return {'status': 'pass' if jump <= .02 and level <= 3 and spectrum >= .8 else 'fail',
            'sampleJumpFullScale': jump, 'boundaryRmsStepDb': level, 'spectralCosine': spectrum,
            'windowSeconds': .05, 'repeatedJoinJumps': repeated_jumps, 'cycles': 3,
            'limits': {'sampleJumpMax': .02, 'rmsStepMaxDb': 3, 'spectralCosineMin': .8},
            'musicalContinuity': 'not measured', 'humanRepeatedListen': 'not measured'}


def measure(path, spec):
    pcm, rate, channels, stream = decode(path)
    target, tolerance = TARGETS[spec['category']]
    log = run(['ffmpeg', '-hide_banner', '-nostats', '-i', str(path), '-af',
               f'loudnorm=I={target}:TP=-2:LRA=11:print_format=json', '-f', 'null', '-']).stderr.decode(errors='replace')
    match = re.search(r'\{\s*"input_i"[\s\S]*?\}', log)
    if not match:
        raise RuntimeError('ffmpeg loudness report unavailable')
    loud = json.loads(match.group())
    values = {k: float(loud[k]) for k in ['input_i', 'input_tp', 'input_lra']}
    if not all(math.isfinite(x) for x in values.values()):
        raise RuntimeError('Nonfinite loudness measurement; cannot accept or normalize')
    duration = len(pcm) / rate
    lo, hi = ((4, 15) if spec['category'] == 'tts' else
              (spec['seconds'] - (.35 if spec['category'] == 'music' else .15),
               spec['seconds'] + (.35 if spec['category'] == 'music' else .15)))
    silent = silence(pcm, rate)
    clip_count = int(np.count_nonzero(np.abs(pcm) >= .999))
    checks = {'decode': True, 'duration': lo <= duration <= hi,
              'loudness': abs(values['input_i'] - target) <= tolerance,
              'truePeak': values['input_tp'] <= -1,
              'silence': silent['fraction'] <= (.45 if spec['category'] == 'tts' else .35)
                         and (not spec['loop'] or silent['longestInteriorSeconds'] <= .25),
              'clipping': clip_count == 0}
    loop = seam(pcm, rate) if spec['loop'] else {'status': 'not applicable', 'reason': 'one-shot'}
    if spec['loop']:
        checks['loopSeam'] = loop['status'] == 'pass'
    failures = [k for k, ok in checks.items() if not ok]
    metrics = {'file': path.relative_to(BASE).as_posix(), 'sha256': sha(path), 'bytes': path.stat().st_size,
               'status': 'pass' if not failures else 'fail', 'failures': failures, 'checks': checks,
               'durationSeconds': duration, 'durationWindowSeconds': [lo, hi], 'sampleRate': rate, 'channels': channels,
               'decodedFrames': len(pcm), 'containerDurationSeconds': float(stream.get('duration', duration)),
               'integratedLufs': values['input_i'], 'truePeakDbtp': values['input_tp'], 'loudnessRangeLu': values['input_lra'],
               'loudnormAnalysis': loud,
               'loudnessTargetLufs': target, 'loudnessToleranceLu': tolerance,
               'samplePeakDbfs': 20 * math.log10(max(float(np.max(np.abs(pcm))), 1e-12)),
               'fullScaleSampleCount': clip_count, 'clippingScreenThreshold': .999, 'silence': silent, 'loopSeam': loop,
               'loopBoundary': {'startFrame': 0, 'endFrameExclusive': len(pcm), 'sampleRate': rate, 'preRollFrames': 0,
                                'tailPolicy': 'unaltered full-span generated candidate; no tail fold or seam repair'} if spec['loop'] else None}
    return metrics, pcm


def main():
    plan = json.loads((BASE / 'plan.json').read_text(encoding='utf-8'))
    for name in ['matched', 'repeats', 'measurements']:
        (BASE / name).mkdir(exist_ok=True)
    rows = []
    for spec in plan['samples']:
        raw = BASE / 'raw' / (spec['id'] + '.mp3')
        if not raw.exists():
            rows.append({'id': spec['id'], 'status': 'missing', 'reason': 'No generated audio; not accepted'})
            continue
        provenance = json.loads(Path(str(raw) + '.json').read_text(encoding='utf-8'))
        if provenance['sha256'] != sha(raw):
            raise RuntimeError('Original differs from generated sidecar: ' + spec['id'])
        row = {'id': spec['id'], 'measuredAt': datetime.now(timezone.utc).isoformat(), 'generationSidecar': f'raw/{spec["id"]}.mp3.json'}
        try:
            metrics, _ = measure(raw, spec)
            row['raw'] = metrics
            # Standard measured two-pass normalization. Dynamic limiting is disclosed when needed.
            # Preserve originals and their failures; no trim, EQ, seam repair or new generation.
            ln = metrics['loudnormAnalysis']
            filt = (f'loudnorm=I={metrics["loudnessTargetLufs"]}:TP=-2:LRA=11:'
                    f'measured_I={ln["input_i"]}:measured_TP={ln["input_tp"]}:measured_LRA={ln["input_lra"]}:'
                    f'measured_thresh={ln["input_thresh"]}:offset={ln["target_offset"]}:linear=true:print_format=json')
            matched = BASE / 'matched' / (spec['id'] + '.mp3')
            processed = run(['ffmpeg', '-hide_banner', '-nostats', '-y', '-i', str(raw), '-af', filt,
                 '-ar', str(metrics['sampleRate']), '-c:a', 'libmp3lame', '-b:a', '128k', '-map_metadata', '-1', str(matched)])
            processing_report = json.loads(re.search(r'\{\s*"input_i"[\s\S]*?\}', processed.stderr.decode(errors='replace')).group())
            row['matched'], pcm = measure(matched, spec)
            row['processing'] = {'operation': 'two-pass ffmpeg loudnorm and MP3 re-encode; dynamic limiting when linear gain cannot meet target; no trim, EQ or seam repair',
                                 'normalizationType': processing_report['normalization_type'], 'ffmpegFilter': filt,
                                 'credits': 0, 'sourceSha256': metrics['sha256'],
                                 'targetReached': row['matched']['checks']['loudness'], 'peakHeadroomDbtp': -2}
            if spec['loop']:
                repeat = BASE / 'repeats' / (spec['id'] + '-three-cycles.ogg')
                run(['ffmpeg', '-hide_banner', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(row['matched']['sampleRate']),
                     '-ac', str(row['matched']['channels']), '-i', '-', '-c:a', 'libvorbis', '-q:a', '5', str(repeat)],
                    np.tile(pcm, (3, 1)).astype('<f4').tobytes())
                repeat_spec = {**spec, 'seconds': row['matched']['durationSeconds'] * 3, 'loop': False}
                repeat_metrics, _ = measure(repeat, repeat_spec)
                row['repeat'] = {'file': repeat.relative_to(BASE).as_posix(), 'cycles': 3, 'credits': 0,
                                 'sourceSha256': row['matched']['sha256'], 'sha256': sha(repeat),
                                 'operation': 'three exact decoded cycles concatenated without fades, encoded OGG',
                                 'durationSeconds': repeat_metrics['durationSeconds'],
                                 'truePeakDbtp': repeat_metrics['truePeakDbtp'], 'decodePass': repeat_metrics['checks']['decode'],
                                 'humanListen': 'not measured'}
            row['status'] = row['matched']['status']
        except Exception as error:
            row['status'] = 'fail'
            row['error'] = str(error)
        row['notMeasured'] = ['in-game playback/masking/latency', 'Stick memory and voice budget', 'human conformance and preference',
                              'long-race fatigue', 'speech transcription/identity/style' if spec['category'] == 'tts' else 'musical tempo/key/downbeat and semantic fidelity']
        save(BASE / 'measurements' / (spec['id'] + '.json'), row)
        rows.append(row)
        print(json.dumps({'id': spec['id'], 'status': row['status'], 'rawFailures': row.get('raw', {}).get('failures'),
                          'matchedFailures': row.get('matched', {}).get('failures')}), flush=True)
    report = {'protocol': 'deathride-audio-screen-v1', 'at': datetime.now(timezone.utc).isoformat(),
              'ffmpegVersion': run(['ffmpeg', '-version']).stdout.decode().splitlines()[0], 'numpyVersion': np.__version__,
              'basis': 'Full decoded stream. LUFS and oversampled true peak from ffmpeg loudnorm input measurements. PCM silence/clipping and three-cycle seam screens; no perceptual verdict.',
              'samples': rows}
    save(BASE / 'acceptance.json', report)


if __name__ == '__main__':
    main()
