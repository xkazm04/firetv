"""Portable owner review of exact fusion pixels, observations and unresolved holds."""
import html,json,shutil,textwrap
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
from common import ART,ROOT,read_json,write_json,sha,now,make_contact_sheet
from grade import decide
from gen import Budget

OUT=ART/'review/fusion'
FONT=ImageFont.truetype('C:/Windows/Fonts/consola.ttf',16)

def compose(wave):
    path=ART/'reports'/(wave+'-current-deterministic.json')
    if not path.exists():return []
    models=[]
    for model in ('mimo-9b','qwen3.8'):
        p=ART/'reports'/(wave+'-attempts-'+model+'.json')
        observations={g['image_hashes'][0]:g for g in read_json(p)} if p.exists() else {}
        p=ART/'reports'/(wave+'-derivatives-'+model+'.json')
        if p.exists():observations.update({g['image_hashes'][0]:g for g in read_json(p)})
        models.append(observations)
    manual=read_json(ART/'audits/fusion-direct-review.json') if (ART/'audits/fusion-direct-review.json').exists() else {}
    rows=read_json(path)
    path=ART/'reports'/(wave+'-derivatives-deterministic.json')
    if path.exists():rows+=read_json(path)
    for r in rows:
        if not r.get('source'):continue
        r['grades']=[m.get(r['source_sha256'],{}) for m in models]
        verdict,codes=decide(r['grades'],r['kind'],read_json(ART/'gates.json')['vlm_confidence_min'])
        direct=manual.get(r['id'],{})
        if direct.get('source_sha256')!=r['source_sha256']:direct={}
        r['manual_review']=direct
        r['pixel_codes']=r['codes'][:]
        r['codes']=sorted(set(r['codes']+codes+direct.get('codes',[])+['OWNER_APPROVAL_PENDING','HUMAN_CALIBRATION_PENDING']))
        r['verdict']='reject' if r['pixel_codes'] or verdict=='reject' or direct.get('verdict')=='reject' else 'owner-review'
        if wave=='v4-fusion' and direct and not r['pixel_codes'] and direct.get('verdict')!='reject':
            r['verdict']='owner-review'
            if verdict=='reject':r['codes'].append('DIRECT_REVIEW_MODEL_DISAGREEMENT')
        if not direct:r['codes'].append('DIRECT_REVIEW_PENDING')
    write_json(ART/'reports'/(wave+'-owner-review.json'),rows)
    return rows

def sized(path,w,h):
    im=Image.open(path).convert('RGBA');im.thumbnail((w,h),Image.Resampling.LANCZOS);return im

def cell(im,path,x,y,w,h):
    if not path or not Path(path).exists():return
    p=sized(path,w,h);im.alpha_composite(p,(x+(w-p.width)//2,y+(h-p.height)//2))

def boards(roster,world):
    prior={r['class']:r for r in read_json(ART/'reports/p3-references-deterministic.json') if r.get('path')}
    prior_portraits={r['class']:r for r in read_json(ART/'reports/p4-world-candidates-deterministic.json') if r.get('kind')=='portrait' and r.get('path')}
    for kind,title,old,cols in [('car','Ten car references: v1 above / fusion below',prior,5),('portrait','Six rivals: v1 above / fusion below',prior_portraits,3)]:
        rows=[r for r in roster if r['kind']==kind and r.get('source')]
        cw,ch=280,410;im=Image.new('RGBA',(cw*cols,60+ch*((len(rows)+cols-1)//cols)),'#22201e');d=ImageDraw.Draw(im);d.text((16,16),title,fill='#ddd0a6',font=FONT)
        for i,r in enumerate(rows):
            x=(i%cols)*cw;y=60+(i//cols)*ch
            cell(im,old.get(r['class'],{}).get('path'),x,y,cw,160);cell(im,r['path'],x,y+166,cw,170)
            d.text((x+10,y+342),r['class']+' / '+r['verdict'],fill='#ddd0a6',font=FONT)
            for j,line in enumerate(textwrap.wrap(', '.join(r.get('pixel_codes',[])) or 'Pixel gates pass; owner pending',28)):
                d.text((x+10,y+366+j*18),line,fill='#b4a044',font=FONT)
        im.convert('RGB').save(OUT/(kind+'-v1-v2.png'))
    cars=[r for r in roster if r['kind']=='car' and r.get('path')]
    im=Image.new('RGBA',(1000,370),'#665e4c');d=ImageDraw.Draw(im);d.text((16,12),'Actual 96px car lengths / alpha silhouettes / no stretching',font=FONT,fill='white')
    for i,r in enumerate(cars):
        x=(i%5)*200;y=50+(i//5)*155;p=Image.open(r['path']).convert('RGBA');p=p.crop(p.getbbox());p.thumbnail((96,96),Image.Resampling.LANCZOS)
        im.alpha_composite(p,(x+52,y));sil=Image.new('RGBA',p.size,'#111111');sil.putalpha(p.getchannel('A'));im.alpha_composite(sil,(x+52,y+65));d.text((x+12,y+125),r['class'],font=FONT,fill='white')
    im.convert('RGB').save(OUT/'cars-96px.png')
    make_contact_sheet(roster,OUT/'roster-contact.png','Fusion roster | owner approval pending')
    chosen={r['brief']['logical_name']:r for r in world}
    world=list(chosen.values())
    if world:make_contact_sheet(world,OUT/'world-contact.png','68 selected fusion world candidates | owner approval pending')
    for family in sorted({r['brief']['asset_family'] for r in world}):
        make_contact_sheet([r for r in world if r['brief']['asset_family']==family],OUT/('world-'+family+'.png'),family+' | fusion, owner review pending')

def main():
    if (OUT/'review.json').exists() and read_json(OUT/'review.json').get('part')==4:
        from part4_review import publish
        return publish()
    import sys
    if (OUT/'review.json').exists() and read_json(OUT/'review.json').get('part')==3:
        from part3_review import main as publish_part3
        return publish_part3()
    OUT.mkdir(parents=True,exist_ok=True);(OUT/'sources').mkdir(exist_ok=True);(OUT/'pixels').mkdir(exist_ok=True)
    roster=compose('v2-fusion');world=[] if '--roster-only' in sys.argv else compose('v4-fusion');boards(roster,world)
    selected={s['id'] for s in read_json(ART/'fusion-selections.json')['assets']} if world else set()
    cards=[];public=[]
    for r in roster+world:
        if not r.get('source'):continue
        suffix=Path(r['source']).suffix.lower();source='sources/'+r['id']+suffix;shutil.copyfile(r['source'],OUT/source)
        pixels='pixels/'+r['id']+'.png';shutil.copyfile(r['path'],OUT/pixels)
        repeat=None
        if r.get('repeat_path'):
            repeat='pixels/'+r['id']+'-repeat.png';shutil.copyfile(r['repeat_path'],OUT/repeat)
        if r.get('frames'):
            for f in r['frames']:shutil.copyfile(f['path'],OUT/'pixels'/Path(f['path']).name)
        animation=None
        preview=ART/'processed/v4-fusion-export-previews'/(r['id']+'.gif')
        if preview.exists():animation='pixels/'+preview.name;shutil.copyfile(preview,OUT/animation)
        record={'id':r['id'],'class':r['class'],'family':r['brief']['asset_family'],'kind':r['kind'],'verdict':r['verdict'],'codes':r['codes'],'source':source,'source_sha256':r['source_sha256'],'pixels':pixels,'export_sha256':r['sha256'],'repeat':repeat,'animation':animation,'derivation':r.get('derivation'),'grades':r['grades'],'direct_review':r['manual_review'],'brief':r['brief']}
        superseded='SUPERSEDED_SOURCE_REQUIRES_REPAIR' in r['codes']
        record.update(superseded=superseded,world_bundle_selected=r['id'] in selected)
        record['frames']=[{'index':f['index'],'pixels':'pixels/'+Path(f['path']).name,'sha256':f['sha256'],'duration_ms':f['duration_ms']} for f in r.get('frames') or []]
        record['repeat_sha256']=sha(OUT/repeat) if repeat else None
        record['animation_sha256']=sha(OUT/animation) if animation else None
        public.append(record)
        details=[]
        for g in r['grades']:
            if g:details.append('<p><b>'+html.escape(g.get('model',''))+'</b>: '+html.escape(g.get('answers',{}).get('description',g.get('error','ungraded')))+'</p>')
        cards.append('<article data-family="'+r['brief']['asset_family']+'"><h3>'+html.escape(r['class'])+'</h3><a href="'+source+'"><img loading="lazy" src="'+pixels+'" alt="'+html.escape(r['class'])+' fusion export"></a><p class="'+r['verdict']+'">'+r['verdict']+' · '+html.escape(', '.join(r['codes']))+'</p><p>'+html.escape(r['manual_review'].get('note','Direct inspection pending.'))+'</p>'+('<a href="'+repeat+'">2×2 repeat</a>' if repeat else '')+'<details><summary>Local observations and source hash</summary>'+''.join(details)+'<code>'+r['source_sha256']+'</code></details></article>')
        if animation:cards[-1]=cards[-1].replace('<details>','<p><a href="'+animation+'">Play six exported phases</a></p><details>',1)
        if record['frames']:cards[-1]=cards[-1].replace('</details>','<p>Exact RGBA frames: '+' · '.join('<a href="'+f['pixels']+'">'+str(f['index']+1)+'</a>' for f in record['frames'])+'</p></details>',1)
        cards[-1]=cards[-1].replace('<article ','<article data-superseded="'+str(superseded).lower()+'" '+('hidden ' if superseded else ''),1)
    write_json(OUT/'review.json',{'at':now(),'budget':Budget().summary(),'owner_approved':False,'records':public})
    budget=Budget().summary();budget_text=f"Weekly {budget['images_reserved']}/350 reserved; this execution {budget['images_reserved']-198}; {budget['remaining']} remain; videos 0; stop latch {'SET' if budget['stop'] else 'clear'}."
    families=sorted({r['brief']['asset_family'] for r in roster+world});options=''.join('<option>'+f+'</option>' for f in families)
    world_links=' '.join('<a href="world-'+f+'.png">'+f+'</a>' for f in sorted({r['brief']['asset_family'] for r in world}))
    surface='<p>Fusion Stick measurement pending.</p>'
    if (ART/'surface-lab/fusion-costs.json').exists():
        cost=read_json(ART/'surface-lab/fusion-costs.json');surface='<p>'+html.escape(cost['summary'])+'</p><a href="../../surface-lab/fusion-review.html">Open measured surface A/B</a>'
    body='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Death Ride — owner fusion review</title>
<style>body{margin:0;background:#171513;color:#ddd0a6;font:16px/1.5 system-ui}main{max-width:1400px;margin:auto;padding:24px}h1{font-size:clamp(28px,5vw,52px);line-height:1.1}a{color:#e5b770}nav{display:flex;gap:18px;flex-wrap:wrap}section{margin:40px 0}.board{width:100%;height:auto}#cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:16px}article{background:#24201c;border:1px solid #544332;padding:16px;min-width:0}article img{display:block;object-fit:contain;width:100%;height:210px;background:#39302a}code{overflow-wrap:anywhere;font-size:11px}.reject{color:#ed9479}.owner-review{color:#d8cc86}select{font:inherit;background:#39302a;color:#ddd0a6;padding:10px}p{max-width:90ch}details{font-size:14px}article[hidden]{display:none}.callout{border-left:4px solid #b4512d;padding:8px 20px;background:#282018}</style><main>
<p>ART DIRECTION V2 · PART 2</p><h1>One world, three drawing languages.</h1><p>Rust and Ink cars and ground. Soot Pulp rivals and barriers. Hot Ink effects and HUD. One palette, neutral light and shared wear contract.</p>
<nav><a href="#roster">Cars & rivals</a><a href="#world">World kit</a><a href="#surface">Stick A/B</a><a href="../v2/index.html">Earlier five-way choice</a><a href="review.json">Full evidence</a></nav>
<div class="callout"><p><b>Owner reference approval is pending.</b> Seven cars and all six rivals pass pixel gates. <b>Comet, Quill and Kestrel remain rejected</b> at their three-attempt ceilings. No damage states or liveries were generated. Machine observations and this review page do not grant approval.</p><p>'''+budget_text+'''</p><p><a href="../../V2-REFERENCE-APPROVAL.md">Exact-reference approval format</a> · <a href="../../V2-REFERENCE-APPROVAL.template.json">Ten-source template</a> · <a href="../../reports/v4-fusion-validation.json">Final validation</a></p></div>
<section id="roster"><h2>Ten car identities</h2><p>Previous reference above, new fusion below. Compare the broad heavy armour with the open light chassis; all 96px thumbnails preserve aspect.</p><a href="car-v1-v2.png"><img class="board" src="car-v1-v2.png" alt="Ten car v1 versus fusion comparisons"></a><img class="board" src="cars-96px.png" alt="Actual 96px cars and silhouettes"><h2>Six rivals</h2><img class="board" src="portrait-v1-v2.png" alt="Six rival comparisons"></section>
<section id="surface"><h2>Natural edges, seeded marks and height</h2>'''+surface+'''<p>Natural obstacle footprints and drag/solid/none effect classes are supplied for a later core hook. This artlab does not claim implemented gameplay collisions.</p><a href="../../fusion-obstacles-selected.json">Selected obstacle metadata</a></section>
<section id="world"><h2>World kit and exact candidates</h2><p>68 world slots plus six rival portraits form the technical kit: 74 logical assets, 178 regions, four atlas pages. All await owner quality review. Eleven recorded offline repairs retain their original failures. Fire is a fusion repaint of the earlier valid phases after three rejected generation attempts.</p><nav>'''+world_links+'''</nav><p><a href="world-contact.png">Complete 68-asset world contact sheet</a> · <a href="roster-contact.png">Roster contact sheet</a> &middot; <a href="../../../assets/phase2-fusion/README.md">Packed kit</a> · <a href="../../../assets/phase2-fusion/catalog.json">Asset catalog</a></p><label>Asset family <select id="family"><option value="all">All</option>'''+options+'''</select></label> <label><input id="originals" type="checkbox"> Show 11 repaired originals</label><p>Click a sprite for its exact source. Local model observations are diagnostic; source and export gates remain separate. The three car rejections always remain visible in the car family.</p><div id="cards">'''+''.join(cards)+'''</div></section>
<p>Stop here for exact-reference owner approval. The 40 damage states and 30 liveries remain locked. Earlier evidence: <a href="../../review-v1.html">V1 review</a> and <a href="../../surface-lab/review.html">V3 surface experiments</a>.</p>
</main><script>function filter(){const f=document.querySelector('#family').value,old=document.querySelector('#originals').checked;document.querySelectorAll('article').forEach(a=>a.hidden=(f!=='all'&&a.dataset.family!==f)||(!old&&a.dataset.superseded==='true'))}document.querySelector('#family').onchange=filter;document.querySelector('#originals').onchange=filter;filter()</script></html>'''
    (OUT/'index.html').write_text(body,encoding='utf-8')
    print('Review:',OUT/'index.html',len(public),'sources')

if __name__=='__main__':main()
