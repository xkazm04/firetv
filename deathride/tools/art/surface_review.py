"""Publish portable, labelled surface A/B boards and measured cost lines."""
import html
import json
import os
from pathlib import Path
import statistics
import textwrap
from PIL import Image, ImageDraw, ImageFont
from common import ART, read_json, write_json, sha
from surface_run import MODES

BASE=ART/'surface-lab'
REVIEW=BASE/'review'
LABELS=['V1 repeated tile','Painted style proof','Low-frequency multiply','Seeded decals','Baked course','Ink edges and shoulders','Warm grade and dust','Tall props and shadows','Persistent wear buffer','Poster and grain','Ground value separation','All layers combined','Live edges and decals','Restrained stack','Narrow-band stack','Cached geometry (held)']
NOTES=[
 ('Comparison only','Keep as control; source is the delivered V1 tile.'),
 ('Source needs revision','Large diagonal crack motifs still repeat. A painted label alone does not remove wallpaper.'),
 ('Candidate','Changes broad values with 64 KiB; does not fix seams. Cheaper: vertex tint patches.'),
 ('Reduce density','64 marks add clutter. Candidate stack uses 32 smaller, fainter marks. Cheaper: reuse fewer regions.'),
 ('Cut at current budget','4 MiB target exceeds remaining production headroom; 1024 bake softens 1080p edges. Cheaper: live ribbon with shared atlas.'),
 ('Candidate with art revision','Clear boundaries lift the course, but uniform bands feel too geometric. Cheaper: two vertex-colour edge strips.'),
 ('Candidate with restraint','One ground shader and 28 alpha quads; no full-screen blur. Cheaper: warm vertex tint, no particles.'),
 ('Hold for chosen kit','Depth reads, but repeated V1 rocks clash with rough cars. Cheaper: sparse existing props and shared shadow mask.'),
 ('Cut from default','Dark repeated stamps distract and add a full-screen layer plus 1 MiB. Cheaper: capped live skid sprites.'),
 ('Reject appearance','Quantisation/grain amplifies coarse pattern and shimmer. Cheaper: paint grain into approved tiles.'),
 ('Candidate','Darker desaturated floor separates car accents. Cheaper: a tuned ground tint.'),
 ('Reject stack','Too much grain, repeated props and black wear. Combined cost is measured, not a sum of single-feature deltas.'),
 ('Owner option, not selected','Painted ground + seeded decals + edges; near 16.7 ms cadence. Same content as the bake, with no extra target. Source motifs and decal density still need art review.'),
 ('Cut: frame budget','Macro + 32 decals + filled edges + 28 dust sprites + value separation still misses the nominal 16.7 ms target. Retained as the optimisation control.'),
 ('Cut: CPU/frame budget','Narrow bands, 16 decals and 8 dust sprites reduce submitted coverage, but rebuilding more geometry raises CPU cost. Paired against restrained on revision 2.'),
 ('Hold: frame budget','Identical pixels and lower CPU cost with a 0.192 MiB vertex cache, but p50 remains above nominal 16.7 ms. Paired against dynamic geometry on revision 3; no combined default accepted.'),
]

def font(n):return ImageFont.truetype('C:/Windows/Fonts/arial.ttf',n)
def summary(rows,key):return statistics.median(r[key] for r in rows)
def load_run(folder):
    value=read_json(folder/'result.json')
    if value['samples']!=900 or value['warmup_frames']!=240 or (value['width'],value['height'])!=(1920,1080):raise ValueError('invalid run '+str(folder))
    for key in ['intervals_ms','cpu_ms','completion_ms']:
        if len(value[key])!=900:raise ValueError('incomplete timing samples')
    return value

def main():
    # Contact-sheet compression should yield CPU to a concurrent integration controller.
    if os.name=='nt':
        import ctypes
        ctypes.windll.kernel32.SetPriorityClass(ctypes.windll.kernel32.GetCurrentProcess(),0x4000)
    REVIEW.mkdir(parents=True,exist_ok=True)
    desktop={};device_all={};evidence=[]
    # Final renderer revision only; earlier smoke and development runs remain local.
    for folder in sorted((BASE/'desktop').glob('v3-b-*')):
        if folder.is_dir() and (folder/'result.json').exists():
            r=load_run(folder);desktop[(int(r['style']),r['mode'])]=(folder,r)
    sessions={p.name.removesuffix('-session.json'):read_json(p) for p in (BASE/'device').glob('*-session.json')}
    excluded=[]
    for folder in sorted((BASE/'device').glob('v3-stick-*')):
        if folder.is_dir() and (folder/'result.json').exists():
            session=next((s for name,s in sessions.items() if folder.name.startswith(name+'-')),None)
            if not session or session.get('status')!='complete' or not session.get('integration_installation_unchanged'):
                excluded.append(str(folder.relative_to(ART)));continue
            r=load_run(folder);device_all.setdefault((int(r['style']),r['mode']),[]).append((folder,r))
            evidence.append({'result':str((folder/'result.json').relative_to(ART)),'result_sha256':sha(folder/'result.json'),'screenshot_sha256':sha(folder/'scene.png')})
    apk_hashes={r['apk_sha256'] for rows in device_all.values() for _,r in rows}
    primary_apk=sessions.get('v3-stick-c',{}).get('apk_sha256')
    revisions={'efficient-stack':sessions.get('v3-stick-f',{}).get('apk_sha256'),'cached-stack':sessions.get('v3-stick-h',{}).get('apk_sha256')}
    device={key:[item for item in rows if item[1]['apk_sha256']==revisions.get(key[1],primary_apk)] for key,rows in device_all.items()}
    device={key:rows for key,rows in device.items() if rows}
    active_modes=[mode for mode in MODES if (0,mode) in desktop or (0,mode) in device]
    manifest_hash=sha(BASE/'inputs.json')
    for rows in device_all.values():
        for _,r in rows:
            if r['input_manifest_sha256']!=manifest_hash:raise ValueError('stale input measurement')
    costs=[];pictures={}
    for mode in active_modes:
        i=MODES.index(mode)
        control='efficient-stack' if mode=='cached-stack' else 'lean-stack' if mode=='efficient-stack' else 'ribbon-control' if mode=='ribbon' else 'baseline' if mode in ('baseline','painted') else 'painted'
        drows=device.get((0,mode),[]);crows=device.get((0,control),[])
        if mode in revisions:crows=[item for item in device_all[(0,control)] if item[1]['apk_sha256']==drows[0][1]['apk_sha256']]
        folder,draw=(drows or [desktop[(0,mode)]])[0]
        cf,cr=(crows or [desktop[(0,control)]])[0]
        cost={'mode':mode,'label':LABELS[i],'control':control,'verdict':NOTES[i][0],'observation_and_cheaper_swap':NOTES[i][1],
              'lab_rgba_mib':draw['rgba_bytes']/1048576,'texture_delta_mib':(draw['rgba_bytes']-cr['rgba_bytes'])/1048576,
              'draw_calls':draw['draw_calls'],'draw_delta':draw['draw_calls']-cr['draw_calls'],
              'fill_proxy':draw['submitted_pixel_area_ratio'],'fill_delta':draw['submitted_pixel_area_ratio']-cr['submitted_pixel_area_ratio'],
              'cpu_geometry_mib':draw.get('cpu_geometry_bytes',0)/1048576,
              'measurement':'Stick' if drows and crows else 'Stick NOT MEASURED; geometry from desktop',
              'repeats':len(drows),'source':str((folder/'result.json').relative_to(ART)),'control_source':str((cf/'result.json').relative_to(ART)),'apk_sha256':draw.get('apk_sha256'),
              'bake_startup_ms':summary([r for _,r in drows],'bake_completion_ms') if drows else None}
        if drows and crows:
            if {r['apk_sha256'] for _,r in drows+crows}!={drows[0][1]['apk_sha256']}:raise ValueError('mixed APK within a timing comparison')
            rs=[r for _,r in drows];cs=[r for _,r in crows]
            for key in ['p50_ms','p95_ms','max_ms','cpu_p50_ms','completion_p50_ms','completion_p95_ms','pss_kib']:
                aggregate=max if key=='max_ms' else statistics.median
                cost[key]=aggregate(r[key] for r in rs)
                cost[key+'_delta']=cost[key]-aggregate(r[key] for r in cs)
                cost[key+'_range']=[min(r[key] for r in rs),max(r[key] for r in rs)]
        costs.append(cost)
    # Full-size exports preserve the 96px car reading test; WebP is lossless.
    for key in sorted(set(desktop)|set(device)):
        selected=device[key][0] if key in device else desktop[key];source=selected[0]/'scene.png'
        name=f'{key[0]}-{key[1]}.webp'
        old=read_json(BASE/'review-index.json').get('source_images',{}).get(name) if (BASE/'review-index.json').exists() else None
        if old!=sha(source) or not (REVIEW/name).exists():Image.open(source).save(REVIEW/name,lossless=True,method=1)
        pictures[f'{key[0]}:{key[1]}']={'src':'review/'+name,'origin':'Stick' if key in device else 'desktop visual only','source_sha256':sha(source),'export_sha256':sha(REVIEW/name)}
    control_names={'efficient-stack':'0-efficient-control.webp','cached-stack':'0-cached-control.webp'}
    for c in costs:
        if c['mode'] not in control_names:continue
        source=(ART/c['control_source']).parent/'scene.png';name=control_names[c['mode']];Image.open(source).save(REVIEW/name,lossless=True,method=1)
        pictures['control:'+c['mode']]={'src':'review/'+name,'origin':'Stick, same-revision paired control','source_sha256':sha(source),'export_sha256':sha(REVIEW/name)}
    def line(c):
        geom=f"{c['lab_rgba_mib']:.3f} MiB RGBA ({c['texture_delta_mib']:+.3f}) | {c['draw_calls']:.2f} draws ({c['draw_delta']:+.2f}) | fill proxy {c['fill_proxy']:.2f}x"
        if 'p50_ms' not in c:return geom+' | Stick NOT MEASURED'
        return geom+f" | Stick p50/p95 {c['p50_ms']:.2f}/{c['p95_ms']:.2f} ms; delta {c['p50_ms_delta']:+.2f}/{c['p95_ms_delta']:+.2f} | PSS {c['pss_kib']/1024:.1f} MiB"
    # One paired board per experiment, plus a compact all-mode board.
    for c in costs:
        board=Image.new('RGB',(1960,810),'#191b1c');d=ImageDraw.Draw(board)
        d.text((20,16),c['label']+'  |  '+c['verdict'],font=font(28),fill='#f3cf8b')
        for j,mode in enumerate([c['control'],c['mode']]):
            name=control_names[c['mode']] if c['mode'] in control_names and j==0 else f'0-{mode}.webp'
            im=Image.open(REVIEW/name).convert('RGB');im.thumbnail((950,535))
            board.paste(im,(20+j*970,90));d.text((20+j*970,57),('A: ' if j==0 else 'B: ')+mode,font=font(20),fill='white')
        d.text((20,643),line(c),font=font(18),fill='white')
        timing=(f"CPU submit p50 {c['cpu_p50_ms']:.2f} ms ({c['cpu_p50_ms_delta']:+.2f}); completion p50 {c['completion_p50_ms']:.2f} ms ({c['completion_p50_ms_delta']:+.2f}); CPU vertex cache {c['cpu_geometry_mib']:.3f} MiB. {c['repeats']} runs." if 'p50_ms' in c else 'No hardware timing claim.')
        d.text((20,680),timing,font=font(18),fill='white')
        d.text((20,717),NOTES[MODES.index(c['mode'])][1],font=font(18),fill='#ddd0bb')
        d.text((20,754),'Same seed, camera and 12s capture phase. Isolated renderer; glFinish each frame. No integrated soak or owner approval.',font=font(18),fill='#bbb')
        board.save(REVIEW/(c['mode']+'-ab.png'))
    board=Image.new('RGB',(1960,((len(costs)+1)//2)*390+80),'#191b1c');d=ImageDraw.Draw(board)
    measured=sum('p50_ms' in c for c in costs)
    d.text((20,16),f'SURFACE LAB | {measured}/{len(costs)} measured on Stick | unapproved style proof inputs',font=font(30),fill='#f3cf8b')
    for i,c in enumerate(costs):
        x=20+(i%2)*970;y=80+(i//2)*390
        im=Image.open(REVIEW/f"0-{c['mode']}.webp").convert('RGB');im.thumbnail((620,349));board.paste(im,(x,y))
        for k,text in enumerate(textwrap.wrap(c['label'],24)):d.text((x+632,y+k*25),text,font=font(21),fill='#f3cf8b')
        lines=[f"{c['lab_rgba_mib']:.3f} MiB",f"{c['draw_calls']:.2f} draws",f"fill {c['fill_proxy']:.2f}x"]
        if 'p50_ms' in c:lines += [f"p50 {c['p50_ms']:.2f} ms",f"p95 {c['p95_ms']:.2f} ms",f"PSS {c['pss_kib']/1024:.1f} MiB"]
        else:lines+=['Stick not measured']
        for k,text in enumerate(lines):d.text((x+632,y+70+k*25),text,font=font(19),fill='white')
    board.save(REVIEW/'all-modes.png')
    payload={'schema':1,'source_inputs_sha256':manifest_hash,'apk_sha256':sorted(apk_hashes),'primary_apk_sha256':primary_apk,'costs':costs,'device_runs':evidence,'excluded_device_runs':excluded,'pictures':pictures,
             'method':'Median of per-run statistics, except max_ms is worst observed across repeats; 240 warmup + 900 samples/run; glFinish each frame. Completion is CPU+GPU wall time, not a GPU timer. PSS one sample per run. Fill is submitted geometry proxy, not fragments. Negative small deltas can be noise.',
             'production_budget':{'existing_mib':30.75,'limit_mib':32,'candidate_new_atlas_mib':1,'candidate_macro_mib':.0625,'conservative_candidate_total_mib':31.8125,'remaining_mib':.1875,'static_edges_decals_total_mib':31.75,'static_edges_decals_remaining_mib':.25,'status':'static edges/decals is an owner option; graded cached design held on frame cost; all proposals require chosen kit repack and integrated measurement'}}
    write_json(BASE/'costs.json',payload)
    header=['# Surface laboratory cost report','','See [interactive A/B review](review.html) and [all-mode board](review/all-modes.png).','',payload['method'],'','Lab residency includes its own ground, dirt, car and 512px experimental detail page. It excludes production gameplay allocations. No additive sum is presented as a measured combined stack.','', '| Mode | RGBA MiB (delta) | Draws (delta) | Fill proxy | Stick p50 / p95 ms (delta) | PSS MiB | Repeats |','|---|---:|---:|---:|---|---:|---:|']
    for c in costs:
        timing=f"{c['p50_ms']:.2f} / {c['p95_ms']:.2f} ({c['p50_ms_delta']:+.2f} / {c['p95_ms_delta']:+.2f})" if 'p50_ms' in c else 'NOT MEASURED'
        pss=f"{c['pss_kib']/1024:.1f}" if 'pss_kib' in c else '-'
        header.append(f"| {c['mode']} | {c['lab_rgba_mib']:.3f} ({c['texture_delta_mib']:+.3f}) | {c['draw_calls']:.2f} ({c['draw_delta']:+.2f}) | {c['fill_proxy']:.2f}x | {timing} | {pss} | {c['repeats']} |")
    header += ['', 'Deltas use painted ground as the control, except painted vs V1 baseline and baked course vs its matched live control. Efficient-stack compares with the restrained control freshly measured on revision 2; cached-stack compares with dynamic narrow-band geometry on revision 3. Baseline is its own zero control. Per-run ranges and all raw samples are linked in costs.json.', '', '## Submission and synchronised completion','','| Mode | CPU p50 ms (delta) | Completion p50 / p95 ms | Startup bake ms |','|---|---:|---:|---:|']
    for c in costs:
        if 'p50_ms' in c:header.append(f"| {c['mode']} | {c['cpu_p50_ms']:.2f} ({c['cpu_p50_ms_delta']:+.2f}) | {c['completion_p50_ms']:.2f} / {c['completion_p95_ms']:.2f} | {c['bake_startup_ms']:.2f} |")
    header += ['', 'The display cadence can mask small costs. Completion includes driver synchronisation and previous queued work; it does not isolate shader execution or establish spare GPU capacity. PSS changes include allocator variation. A tiny negative delta is not a speed-up claim. No GPU fragment counter or unpaced GPU timer was collected.', '', f'{len(excluded)} completed captures from interrupted/concurrently changed device sessions are retained as diagnostics and excluded from these costs. See excluded_device_runs in costs.json. An integration deployment changed its own package while the first lab pass was active; the lab aborted on lost foreground. The runner only installs the verified artlab package.', '', '## Decisions and cheaper alternatives','']
    for c in costs:header += [f"- **{c['label']}: {c['verdict']}.** {c['observation_and_cheaper_swap']}"]
    header += ['', '## Budget and source gates','','The measured live edges/decals option (ribbon-control) would conservatively total 31.75 MiB with a new 1 MiB detail page, leaving 0.25 MiB. It is an owner option, not an accepted production stack.', '','The cached-geometry design, currently held on frame cost, would add at most a 1 MiB dedicated detail atlas plus 0.0625 MiB macro to the existing declared 30.75 MiB: **31.8125 MiB, 0.1875 MiB headroom**. Repacking can reduce that, but no saving is assumed. A further 1 MiB wear target or 4 MiB bake exceeds 32 MiB and is cut unless an explicit replacement is validated. Main bundle and selections remain unchanged.','','Rust ground is an unapproved proof. Bleached Poster has a seam failure. Scrap Collage is a rejected negative control: its bright tile border and isolated graphic motifs repeat visibly, even where numerical seam tests pass. Surface tricks do not upgrade those source gates. Ground choice and all production artwork wait for OWNER-CHOICE.md.','','The only atmospheric experiment is a warm ground grade plus bounded dust; no vignette, heat-shimmer or full-screen smoke pass is claimed. The ribbon test bakes the entire course into a 1024-square target, not a production streaming strip. Persistent wear is stamped, not driven by production tyre physics.']
    (BASE/'COSTS.md').write_text('\n'.join(header)+'\n',encoding='utf-8')
    data=json.dumps({'costs':costs,'pictures':pictures,'labels':[LABELS[MODES.index(m)] for m in active_modes],'modes':active_modes}).replace('</','<\\/')
    rows=''.join('<tr><td><a href="review/'+c['mode']+'-ab.png">'+html.escape(c['label'])+'</a></td><td>'+html.escape(line(c))+'</td><td>'+html.escape(c['verdict'])+'</td></tr>' for c in costs)
    page='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Death Ride — surface lab</title>
<style>body{margin:0;background:#191b1c;color:#eee;font:17px/1.5 system-ui}main{max-width:1400px;margin:auto;padding:24px}a{color:#f3cf8b}h1{line-height:1.1}select,input{font:inherit;max-width:100%}label{display:inline-block;margin:8px 18px 8px 0}.stage{position:relative;width:100%;aspect-ratio:16/9;background:#333}.stage img{position:absolute;width:100%;height:100%;object-fit:contain}.stage #right{clip-path:inset(0 0 0 50%)}.stage span{position:absolute;top:8px;padding:4px 10px;background:#000b}.right{right:8px}.left{left:8px}#cost,#note{padding:10px;background:#27292b}table{border-collapse:collapse;width:100%;font-size:14px}td,th{padding:10px;text-align:left;border-bottom:1px solid #555}.table{overflow:auto}details{margin:24px 0}small{color:#c8bba4}</style>
<main><p><a href="../review/v2/index.html">← Five style directions</a> · <a href="COSTS.md">Cost report</a> · <a href="costs.json">Raw evidence index</a></p><h1>Surface laboratory</h1>
<p>The simple painted-ground, edge and decal combination stays near nominal 16.7 ms cadence. Compare it with individual treatments and the more elaborate stacks that miss the frame budget. No art or stack is owner-approved. These are owner choices, not approved production art.</p>
<p><strong>Measured scope:</strong> isolated 1080p libGDX renderer, six cars, 240 warmup frames and 900 samples per run. glFinish every frame; completion is CPU + GPU wall time, not a GPU timer. No gameplay or 15-minute soak.</p>
<label>Experiment <select id="mode"></select></label><label>Ground proof <select id="style"><option value="0">Rust and Ink</option><option value="1">Bleached Poster — seam failure</option><option value="2">Scrap Collage — rejected border</option></select></label><label>A/B split <input id="split" type="range" min="0" max="100" value="50" aria-label="A/B comparison split"></label>
<div class="stage"><img id="left" alt="Control"><img id="right" alt="Experiment"><span class="left" id="alabel"></span><span class="right" id="blabel"></span></div><p id="cost"></p><p id="note"></p><p id="origin"></p>
<p><a id="full" href="">Open full 1920×1080 image</a> · <a id="pair" href="">Paired cost board (Rust)</a> · <a href="review/all-modes.png">All tested experiments</a></p>
<details><summary>How to read costs and source failures</summary><p>Deltas compare against painted ground, except painted vs V1, baked course vs matched live decals/edges, efficient vs restrained on revision 2, and cached vs dynamic geometry on revision 3. Small positive or negative differences can be noise; see per-run ranges. Fill is submitted geometry coverage, not a hardware fragment counter. PSS includes Java/native/driver allocation, not only textures.</p><p>The two alternate style proofs only have painted, combined and restrained captures. Unavailable modes are disabled. Poster source fails seams; collage is a rejected negative control with a repeating white border. Neither is approved by a surface treatment.</p><p>Conservative live-edge/decal option: 30.75 existing + 1.00 detail page = 31.75 MiB, leaving 0.25 MiB. The graded cached design adds 0.0625 MiB macro but is held on frame cost. Neither allowance fits an extra wear or bake target. These are proposed allocations, not a validated new bundle.</p></details>
<h2>Per-trick cost lines</h2><div class="table"><table><tr><th>Experiment / A/B board</th><th>Cost</th><th>Decision</th></tr>ROWS</table></div><p><small>V3 spends zero generated images. Owner choice and exact-reference approval gates stay closed. The lab runner installs only dev.deathride.artlab; interrupted concurrent sessions are excluded.</small></p></main>
<script>const D=DATA;const mode=document.querySelector('#mode'),style=document.querySelector('#style');D.modes.forEach((m,i)=>mode.add(new Option(D.labels[i],m)));mode.value='ribbon-control';function update(){let s=style.value;for(const o of mode.options)o.disabled=!D.pictures[s+':'+o.value];if(mode.selectedOptions[0].disabled)mode.value='lean-stack';const c=D.costs.find(c=>c.mode===mode.value);let a=c.control;if(!D.pictures[s+':'+a])a='painted';const left=D.pictures['control:'+c.mode]||D.pictures[s+':'+a],right=D.pictures[s+':'+c.mode];document.querySelector('#left').src=left.src;document.querySelector('#right').src=right.src;document.querySelector('#alabel').textContent='A: '+a;document.querySelector('#blabel').textContent='B: '+c.mode;document.querySelector('#cost').textContent=c.lab_rgba_mib.toFixed(3)+' MiB | '+c.draw_calls.toFixed(2)+' draws | fill proxy '+c.fill_proxy.toFixed(2)+'x | '+(c.p50_ms!==undefined?'Stick p50/p95 '+c.p50_ms.toFixed(2)+' / '+c.p95_ms.toFixed(2)+' ms; delta '+c.p50_ms_delta.toFixed(2)+' / '+c.p95_ms_delta.toFixed(2)+' ms; PSS '+(c.pss_kib/1024).toFixed(1)+' MiB ('+c.repeats+' runs)':'Stick NOT MEASURED');document.querySelector('#note').textContent=c.verdict+'. '+c.observation_and_cheaper_swap;document.querySelector('#origin').textContent='Images: '+left.origin+' / '+right.origin+'. Cost lines use Rust ground; alternate styles test appearance only.';document.querySelector('#full').href=right.src;document.querySelector('#pair').href='review/'+c.mode+'-ab.png';}mode.onchange=style.onchange=update;document.querySelector('#split').oninput=e=>document.querySelector('#right').style.clipPath='inset(0 0 0 '+e.target.value+'%)';update();</script></html>'''.replace('ROWS',rows).replace('DATA',data)
    (BASE/'review.html').write_text(page,encoding='utf-8')
    write_json(BASE/'review-index.json',{'files':{str(p.relative_to(BASE)):sha(p) for p in REVIEW.iterdir() if p.is_file()},'source_images':{p['src'].split('/')[-1]:p['source_sha256'] for p in pictures.values()},'device_runs':len(evidence),'complete_stick_modes':sum(bool(device.get((0,m))) for m in MODES)})
    print('Published',len(costs),'cost lines and',len(evidence),'Stick runs')

if __name__=='__main__':main()
