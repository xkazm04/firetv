"""Validate device evidence and portable review integrity; never grants art acceptance."""
from pathlib import Path
import re
from PIL import Image
from common import ART, read_json, write_json, sha
from surface_run import MODES, PACKAGE, LAB

def main():
    import sys
    archived='--archived' in sys.argv
    base=ART/'surface-lab';costs=read_json(base/'costs.json');index=read_json(base/'review-index.json')
    manifest=read_json(base/'inputs.json')
    for name,item in manifest['files'].items():
        if sha(base/'inputs'/name)!=item['sha256']:raise ValueError('changed input '+name)
    for name,expected in index['files'].items():
        if sha(base/name)!=expected:raise ValueError('changed review export '+name)
    if costs['source_inputs_sha256']!=sha(base/'inputs.json'):raise ValueError('stale cost inputs')
    if not costs['apk_sha256']:raise ValueError('missing device binary')
    for cost in costs['costs']:
        if read_json(ART/cost['source'])['apk_sha256']!=read_json(ART/cost['control_source'])['apk_sha256']:raise ValueError('mixed binary within comparison')
    records={}
    for item in costs['device_runs']:
        path=ART/item['result'];r=read_json(path)
        if sha(path)!=item['result_sha256']:raise ValueError('changed measured result')
        if r['apk_sha256'] not in costs['apk_sha256']:raise ValueError('unregistered binary')
        if r['input_manifest_sha256']!=costs['source_inputs_sha256']:raise ValueError('mixed input')
        if 'NVIDIA' in r['renderer']:raise ValueError('desktop passed as device')
        if (r['width'],r['height'],r['samples'],r['warmup_frames'])!=(1920,1080,900,240):raise ValueError('measurement contract')
        for field,stat in [('intervals_ms','p50_ms'),('completion_ms','completion_p50_ms'),('cpu_ms','cpu_p50_ms')]:
            raw=r[field]
            if len(raw)!=900 or min(raw)<0 or abs(sorted(raw)[450]-r[stat])>1e-6:raise ValueError('invalid raw samples')
        if not r.get('pss_kib'):raise ValueError('missing PSS')
        records.setdefault((int(r['style']),r['mode']),[]).append(r)
    for mode in MODES[:16]:
        if len(records.get((0,mode),[]))<2:raise ValueError('requires two Stick repeats: '+mode)
    sessions=[]
    for p in (base/'device').glob('v3-*-session.json'):
        session=read_json(p)
        if session['package']!=PACKAGE or not session.get('finished_at'):raise ValueError('unfinished device session')
        if session.get('status')=='complete' and session.get('integration_installation_unchanged'):sessions.append(p.name)
    for picture in costs['pictures'].values():
        if Image.open(base/picture['src']).size!=(1920,1080):raise ValueError('wrong review resolution')
    cached=Image.open(base/costs['pictures']['0:cached-stack']['src']).convert('RGB')
    dynamic=Image.open(base/costs['pictures']['control:cached-stack']['src']).convert('RGB')
    if cached.tobytes()!=dynamic.tobytes():raise ValueError('cached geometry changed rendered pixels')
    if records[(0,'cached-stack')][0].get('cpu_geometry_bytes')!=201600:raise ValueError('CPU vertex payload not accounted')
    # Guard against forgetting the periodic FBO draw and full-screen wear composite.
    wear=records[(0,'wear')][0];painted=records[(0,'painted')][0]
    if wear['rgba_bytes']-painted['rgba_bytes']!=1048576:raise ValueError('wear allocation not accounted')
    if wear['draw_calls']-painted['draw_calls']<1.3:raise ValueError('periodic wear submission missing')
    if wear['submitted_pixel_area_ratio']-painted['submitted_pixel_area_ratio']<1:raise ValueError('wear screen fill missing')
    if records[(0,'ribbon')][0]['rgba_bytes']-painted['rgba_bytes']!=4194304:raise ValueError('bake allocation missing')
    budget=costs['production_budget']
    if budget['existing_mib']+budget['candidate_new_atlas_mib']+budget['candidate_macro_mib']!=budget['conservative_candidate_total_mib'] or budget['conservative_candidate_total_mib']>budget['limit_mib']:raise ValueError('candidate over budget')
    apkdir=LAB/'android/build/outputs/apk/debug'
    if not archived and (apkdir/'output-metadata.json').exists():
        meta=read_json(apkdir/'output-metadata.json')
        if meta['applicationId']!=PACKAGE or sha(apkdir/meta['elements'][0]['outputFile']) not in costs['apk_sha256']:raise ValueError('local APK differs from measured binaries')
    sources={str(p.relative_to(LAB)):sha(p) for p in LAB.rglob('*') if p.is_file() and p.suffix in ('.java','.gradle','.xml','.properties') and not any(part in ('build','.gradle','artlab-output') for part in p.relative_to(LAB).parts)}
    if not archived:write_json(base/'build-evidence.json',{'package':PACKAGE,'apk_sha256':costs['apk_sha256'],'primary_apk_sha256':costs['primary_apk_sha256'],'input_manifest_sha256':costs['source_inputs_sha256'],'sources':sources,'revisions':'Initial fourteen modes: revisions/v3-1/SurfaceLab.java. Narrow-band iteration: revisions/v3-2/SurfaceLab.java. Cached geometry: revisions/v3-3/SurfaceLab.java. Every revision remeasures its matched control; no mixed-binary delta.'})
    if archived:
        original={k.replace('\\','/'):v for k,v in read_json(base/'build-evidence.json')['sources'].items()}['core/src/main/java/dev/deathride/artlab/SurfaceLab.java']
        if sha(base/'revisions/v3-3/SurfaceLab.java')!=original:raise ValueError('archived V3 renderer changed')
    result={'status':'pass','archived':archived,'modes_with_two_stick_repeats':16,'cached_geometry_identical_pixels':True,'device_runs':len(costs['device_runs']),'sessions':sessions,'excluded_diagnostic_runs':len(costs['excluded_device_runs']),'review_files':len(index['files']),'apk_sha256':costs['apk_sha256'],'scope':'hashes, real-device sample integrity, warmup/resolution, repeated measurements, paired binary identity, pixel equivalence, allocation accounting, separate package and portable exports; no owner acceptance, no full-game soak'}
    write_json(ART/'reports'/('v3-archived-evidence-validation.json' if archived else 'v3-evidence-validation.json'),result);print(result)

if __name__=='__main__':main()
