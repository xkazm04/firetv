"""Validate and present matched full-residency Stick runs with portable captures."""
import html,statistics
from pathlib import Path
from PIL import Image
from common import ART,ROOT,read_json,write_json,sha,now
from surface_run import LAB,PACKAGE

BASE=ART/'surface-lab'

def main():
    inputs=read_json(BASE/'fusion-resident-inputs.json');runs=[];sessions=[];pictures={}
    if inputs['fixture_recipe_sha256']!=sha(BASE/'fusion-inputs.json'):raise ValueError('fixture changed')
    for name,digest in inputs['files'].items():
        if sha(ROOT/'assets/phase2-fusion'/name)!=digest or sha(LAB/'assets/fusion-bundle'/name)!=digest:raise ValueError('bundle changed')
    if sha(LAB/'assets/fusion/cars.png')!=inputs['cars_page_sha256']:raise ValueError('car page changed')
    for repeat in ('a','b'):
        session=read_json(BASE/'device'/f'v4-stick-{repeat}-session.json')
        if session['package']!=PACKAGE or session['status']!='complete' or not session['integration_installation_unchanged'] or not session['restored_prior_activity']:raise ValueError('device session not clean')
        sessions.append(session)
        for entry in session['runs']:
            folder=BASE/'device'/entry['name'];path=folder/'result.json';r=read_json(path)
            if sha(path)!=entry['result_sha256'] or sha(folder/'scene.png')!=entry['screenshot_sha256']:raise ValueError('run changed')
            if (r['width'],r['height'],r['samples'],r['warmup_frames'])!=(1920,1080,900,240):raise ValueError('measurement contract')
            if 'NVIDIA' in r['renderer'] or not r['pss_kib'] or r['input_manifest_sha256']!=sha(BASE/'fusion-resident-inputs.json'):raise ValueError('not current Stick evidence')
            if r['fusion_residency_basis']!='full packed bundle plus two allocated car pages; one theme resident':raise ValueError('fixture-only run')
            expected=inputs['resident_rgba_bytes']-(524288 if r['mode']=='fusion-control' else 0)
            if r['rgba_bytes']!=expected or r['cpu_geometry_bytes']!=28800:raise ValueError('residency mismatch')
            for field,stat in [('intervals_ms','p50_ms'),('completion_ms','completion_p50_ms'),('cpu_ms','cpu_p50_ms')]:
                raw=r[field]
                if len(raw)!=900 or min(raw)<0 or abs(sorted(raw)[450]-r[stat])>1e-6:raise ValueError('raw samples invalid')
            if abs(sorted(r['intervals_ms'])[855]-r['p95_ms'])>1e-6:raise ValueError('p95 invalid')
            r['source']=str(path.relative_to(BASE)).replace('\\','/');r['result_sha256']=sha(path);r['repeat']=repeat;runs.append(r)
            if repeat=='a':
                dest=BASE/'fusion-pictures';dest.mkdir(exist_ok=True)
                file=dest/(r['mode']+'.webp');im=Image.open(folder/'scene.png').convert('RGB');im.save(file,lossless=True,method=6)
                if Image.open(file).convert('RGB').tobytes()!=im.tobytes():raise ValueError('review pixels changed')
                pictures[r['mode']]={'file':str(file.relative_to(BASE)).replace('\\','/'),'sha256':sha(file),'png_sha256':sha(folder/'scene.png'),'size':im.size}
    hashes={r['apk_sha256'] for r in runs};apkdir=LAB/'android/build/outputs/apk/debug';meta=read_json(apkdir/'output-metadata.json')
    if len(hashes)!=1 or meta['applicationId']!=PACKAGE or sha(apkdir/meta['elements'][0]['outputFile']) not in hashes:raise ValueError('binary mismatch')
    costs=[]
    for mode in ('fusion-control','fusion-natural'):
        rs=[r for r in runs if r['mode']==mode]
        if len(rs)!=2:raise ValueError('two repeats required')
        c={'mode':mode,'repeats':2,'art_mib':rs[0]['rgba_bytes']/2**20,'cpu_geometry_bytes':28800}
        for field in ('p50_ms','p95_ms','cpu_p50_ms','completion_p50_ms','completion_p95_ms','draw_calls','submitted_pixel_area_ratio','pss_kib','bake_completion_ms'):
            c[field]=statistics.mean(r[field] for r in rs);c[field+'_range']=[min(r[field] for r in rs),max(r[field] for r in rs)]
        costs.append(c)
    control,natural=costs
    deltas={k:natural[k]-control[k] for k in ('art_mib','p50_ms','p95_ms','cpu_p50_ms','draw_calls','submitted_pixel_area_ratio')}
    summary=f"Stick AFTKM, two runs per variant at 1080p: natural edges {natural['p50_ms']:.2f}/{natural['p95_ms']:.2f} ms p50/p95; matched control {control['p50_ms']:.2f}/{control['p95_ms']:.2f} ms. Full art allocation 31.25 MiB (+0.50 MiB ribbon); cached course vertices 28,800 bytes. Short isolated renderer measurements, not a full-game soak."
    result={'at':now(),'status':'pass','summary':summary,'package':PACKAGE,'apk_sha256':next(iter(hashes)),
        'input_manifest_sha256':sha(BASE/'fusion-resident-inputs.json'),'costs':costs,'deltas':deltas,'pictures':pictures,
        'device_runs':[{k:r[k] for k in ('source','result_sha256','mode','repeat','renderer','p50_ms','p95_ms','cpu_p50_ms','completion_p50_ms','pss_kib')} for r in runs],
        'sessions':[{'source':f'device/v4-stick-{s}-session.json','sha256':sha(BASE/'device'/f'v4-stick-{s}-session.json')} for s in ('a','b')],
        'statistics':'costs are arithmetic means of the two run percentiles; ranges retain repeat variation; raw 900-sample arrays remain linked',
        'limitations':'glFinish instrumentation serializes work; completion is CPU/GPU wall time, not GPU timer. PSS sampled once per run before PNG encoding. All atlas/material pages resident but only representative scene regions drawn. No gameplay, collision hook, full-game FBO, or thermal soak.',
        'scope':'4 clean runs; matched single APK; exact packed bundle + allocated car reserve; dev.deathride.tv installation unchanged and prior activity restored in both sessions'}
    write_json(BASE/'fusion-costs.json',result)
    sources={str(p.relative_to(LAB)).replace('\\','/'):sha(p) for p in LAB.rglob('*') if p.is_file() and p.suffix in ('.java','.gradle','.xml','.properties') and not any(x in ('build','.gradle','artlab-output') for x in p.relative_to(LAB).parts)}
    write_json(BASE/'fusion-build-evidence.json',{'apk_sha256':result['apk_sha256'],'package':PACKAGE,'source_files':sources,'input_manifest_sha256':result['input_manifest_sha256'],'runner_sha256':sha(ROOT/'tools/art/surface_run.py')})
    rows=''.join('<tr><td>'+c['mode']+'</td>'+''.join('<td>'+f'{c[k]:.3f}'+'</td>' for k in ('p50_ms','p95_ms','cpu_p50_ms','draw_calls','submitted_pixel_area_ratio','art_mib'))+'</tr>' for c in costs)
    links=''.join('<li><a href="'+r['source']+'">'+r['repeat']+' / '+r['mode']+' raw samples</a></li>' for r in runs)
    page='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Death Ride fusion surface comparison</title><style>
body{margin:0;background:#191614;color:#ddd0a6;font:17px/1.5 system-ui}main{max-width:1400px;margin:auto;padding:24px}a{color:#efbb76}h1{line-height:1.1}.stage{position:relative;aspect-ratio:16/9;background:#33281c}.stage img{position:absolute;width:100%;height:100%;object-fit:contain}#right{clip-path:inset(0 0 0 50%)}.tag{position:absolute;top:8px;background:#000c;padding:4px 10px}.r{right:8px}input{width:100%}table{border-collapse:collapse;width:100%;font-size:14px}td,th{padding:10px;text-align:left;border-bottom:1px solid #66513b}.table{overflow:auto}p{max-width:100ch}code{overflow-wrap:anywhere}</style><main>
<p><a href="../review/fusion/index.html">Owner fusion review</a> · <a href="FUSION-COSTS.md">Cost report</a> · <a href="fusion-costs.json">Evidence index</a> · <a href="review.html">Earlier V3 experiments</a></p>
<h1>Natural wear, baked once.</h1><p>'''+html.escape(summary)+'''</p><div class="stage"><img src="'''+pictures['fusion-control']['file']+'''" alt="Hard-edge control"><img id="right" src="'''+pictures['fusion-natural']['file']+'''" alt="Baked natural edges"><span class="tag">Hard-edge control</span><span class="tag r">Baked natural edges</span></div><label for="wipe">Drag to compare identical capture time</label><input id="wipe" type="range" min="0" max="100" value="50">
<p>The two scenes share seed 713, sixteen decals, six cars, six props and six barriers. Dirt encroachment, sparse rubber and worn paint are baked into a 512×256 ribbon. Its 360 quads are cached once; no band rebuilding occurs per frame. Tall crowns use ground shadows and foot-position sorting. Collision footprints remain metadata for a later core hook.</p>
<div class="table"><table><thead><tr><th>Variant</th><th>p50 ms</th><th>p95 ms</th><th>CPU p50 ms</th><th>Draws</th><th>Area proxy</th><th>Art MiB</th></tr></thead><tbody>'''+rows+'''</tbody></table></div>
<p>Four short runs, forward then reverse order. Values above average the two run percentiles; raw arrays and repeat ranges are retained. Tiny timing differences are within run variation. The natural variant adds 0.5 MiB and no extra ribbon draw. PSS includes runtime memory and is separate from RGBA texture accounting. One backdrop and both 1024² car pages were allocated.</p>
<p>'''+html.escape(result['limitations'])+'''</p><ul>'''+links+'''</ul><p>Only <code>dev.deathride.artlab</code> was installed. Both session readbacks confirm the integration installation was unchanged and its prior activity restored.</p></main><script>document.querySelector('#wipe').oninput=e=>document.querySelector('#right').style.clipPath='inset(0 0 0 '+e.target.value+'%)'</script></html>'''
    (BASE/'fusion-review.html').write_text(page,encoding='utf-8')
    md='# Fusion surface cost report\n\n'+summary+'\n\n| Variant | p50 ms | p95 ms | CPU p50 ms | Draws | Submitted area | RGBA MiB | PSS KiB |\n|---|---:|---:|---:|---:|---:|---:|---:|\n'
    for c in costs:md+='| '+c['mode']+' | '+' | '.join(f'{c[k]:.3f}' for k in ('p50_ms','p95_ms','cpu_p50_ms','draw_calls','submitted_pixel_area_ratio','art_mib','pss_kib'))+' |\n'
    md+='\n'+result['statistics']+'. Startup completion includes texture uploads and geometry setup; the ribbon texture was baked offline.\n\n'+result['limitations']+'\n\nFour 1024² atlases = 16 MiB; eleven 256² tiles = 2.75 MiB; one 1024² backdrop = 4 MiB; two allocated car pages = 8 MiB; 512×256 ribbon = 0.5 MiB. Total 31.25 MiB versus 30.75 MiB control. Five new obstacles and a shadow mask fit existing atlas pages. Cached course vertices add 28,800 CPU bytes. The game\'s separate 36 MiB scenery FBO is excluded and was not allocated by the lab.\n\nBoth variants use seeded marks and tall props. No continuous edge stroke, live macro layer, dust pass or per-frame band construction. Median cadence stays approximately 16.7 ms; tail frames remain above that nominal budget. This establishes isolated cost, not production integration acceptance.\n\n[Interactive comparison](fusion-review.html), [raw evidence and repeat ranges](fusion-costs.json), [exact source/build hashes](fusion-build-evidence.json). No Grok calls for rendering. Both sessions verified unchanged integration installation and restored its activity.\n'
    (BASE/'FUSION-COSTS.md').write_text(md,encoding='utf-8')
    write_json(ART/'reports/v4-fusion-stick-validation.json',{'status':'pass','runs':4,'modes':2,'samples_per_run':900,'warmup':240,'resident_mib':31.25,'integration_unchanged':True,'summary':summary})
    print(summary)

if __name__=='__main__':main()
