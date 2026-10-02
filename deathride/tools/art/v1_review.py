"""Build portable owner boards from actual pixels, never generated labels or layouts."""
import html
import json
import textwrap
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
from common import ART,read_json,write_json,sha,now,digest,style_for
from gen import Budget
from grade import decide
from process import key_image

OUT=ART/'review/v2'
SLUGS=['rust-ink','bleached-poster','hot-ink','scrap-collage','soot-pulp']
ROLES=['heavy','light','portrait','ground','barrier','icon','effect']
NAMES=['Rust and Ink','Bleached Poster','Hot Ink','Scrap Collage','Soot Pulp']
FONT='C:/Windows/Fonts/segoeui.ttf'
def font(n):return ImageFont.truetype(FONT,n)
VISUALS={}

def visual(record):
    key=(record['source_sha256'],record['kind'])
    if key not in VISUALS:
        VISUALS[key]=Image.open(record['repeat_path']).convert('RGBA') if record['kind']=='tile' else key_image(Image.open(record['source']))[0]
    return VISUALS[key].copy()

def board(rows,cols,title,path,headers=None,cw=340,ch=390):
    sheet=Image.new('RGB',(cols*cw,85+((len(rows)+cols-1)//cols)*ch),'#171819');d=ImageDraw.Draw(sheet)
    d.text((18,12),title,fill='#E3D5AC',font=font(23));d.text((18,45),'Original proofs | rejected pixels stay visible | owner choice pending',fill='#C7BCA2',font=font(16))
    for i,r in enumerate(rows):
        x=(i%cols)*cw;y=85+(i//cols)*ch;d.rectangle((x+7,y+5,x+cw-7,y+ch-7),fill='#272625')
        label=r.get('label',r['brief'].get('proof_role',r['id']))
        d.text((x+16,y+12),label,fill='#E3D5AC',font=font(19))
        im=visual(r);im.thumbnail((cw-32,242));sheet.paste(im,(x+(cw-im.width)//2,y+42+(242-im.height)//2),im)
        d.text((x+15,y+288),r.get('verdict','review'),fill='#F0A06A' if r.get('verdict')=='reject' else '#D2BC71',font=font(15))
        codes=[c for c in r.get('codes',[]) if c not in ('OWNER_ACCEPTANCE_PENDING','HUMAN_CALIBRATION_PENDING')]
        lines=textwrap.wrap(', '.join(codes) or 'Pixel gates clear; owner review',width=max(20,(cw-25)//8))
        for j,line in enumerate(lines[:4]):d.text((x+15,y+309+j*17),line,fill='#C8C2B6',font=font(13))
    sheet.save(path,optimize=True)

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    items=read_json(ART/'reports/v1-current-deterministic.json');attempts=read_json(ART/'reports/v1-attempts-deterministic.json')
    models=['mimo-9b','qwen3.8'];by_model=[]
    for model in models:
        p=ART/'reports'/f'v1-attempts-{model}.json';by_model.append({g['image_hashes'][0]:g for g in read_json(p)} if p.exists() else {})
    manual=read_json(ART/'audits/v1-direct-review.json')
    records=[]
    for r in items:
        if r.get('style_hash')!=digest(style_for(r['brief'])):raise ValueError('stale style measurement '+r['id'])
        grades=[m.get(r['source_sha256'],{}) for m in by_model];verdict,codes=decide(grades,r['kind'],read_json(ART/'gates.json')['vlm_confidence_min'])
        note=manual[r['id']]
        if note['source_sha256']!=r['source_sha256']:raise ValueError('stale direct review '+r['id'])
        codes=sorted(set(r['codes']+codes+note['codes']+['HUMAN_CALIBRATION_PENDING']))
        record={**r,'grades':grades,'direct_review':note,'codes':codes,'verdict':'reject' if r['codes'] or verdict=='reject' or note['codes'] else 'owner-review'}
        records.append(record)
        im=visual(record);im.thumbnail((512,512));im.save(OUT/(r['id']+'.png'),optimize=True)
        raw=Image.open(r['source']).convert('RGB');raw.thumbnail((512,512));raw.save(OUT/(r['id']+'-source.jpg'),quality=86)
    write_json(ART/'reports/v1-owner-review.json',records)
    lookup={(r['brief']['style_file'],r['brief']['proof_role']):r for r in records}
    combined=[]
    for role in ROLES:
        for slug,name in zip(SLUGS,NAMES):combined.append({**lookup[(f'style-{slug}.json',role)],'label':name+' / '+role})
    board(combined,5,'Choose a drawing language: five identical seven-subject proof sets',OUT/'combined.png',cw=340,ch=390)
    # Historical comparison: closest delivered v1 subject, explicitly not identity-preserving variants.
    old=[]
    for p in [ART/'reports/p3-references-deterministic.json',ART/'reports/p4-portraits-deterministic.json',ART/'reports/p4-tiles-deterministic.json',ART/'reports/p4-barriers-deterministic.json',ART/'reports/p4-hud-deterministic.json',ART/'reports/p4-effects-deterministic.json',ART/'reports/p4-pickups-deterministic.json']:
        old+=read_json(p)
    def find(kind,cls):return next(r for r in old if r['kind']==kind and r['class']==cls)
    v1={'heavy':find('car','Bastion'),'light':find('car','Needle'),'portrait':find('portrait','rook'),'ground':find('tile','asphalt-worn'),'barrier':find('sprite','concrete-straight')}
    # Locate the historical repair and spark subjects without inventing a mapping.
    for role,needle in [('icon','repair'),('effect','sparks')]:
        candidates=[r for r in old if needle in r['class']]
        if not candidates:raise ValueError('missing v1 counterpart '+role)
        v1[role]=candidates[0]
    for slug,name in zip(SLUGS,NAMES):
        group=[lookup[(f'style-{slug}.json',role)] for role in ROLES]
        board([{**r,'label':r['brief']['proof_role']} for r in group],4,name+' | seven original style proofs',OUT/(slug+'.png'),cw=390,ch=410)
        pairs=[]
        for role,r in zip(ROLES,group):
            older=v1[role]
            if older.get('frames'):
                # Effect source is a sheet; show its source sheet rather than claim identical frame geometry.
                older={**older,'kind':'effect'}
            pairs.extend([{**older,'label':'v1 / '+role,'verdict':'historical comparison'}, {**r,'label':'v2 / '+role}])
        board(pairs,2,name+' | v1 versus v2 (style, not identity)',OUT/(slug+'-vs-v1.png'),cw=400,ch=385)
    # Readability uses measured transparent bounds, not a stretched car cell.
    small=Image.new('RGB',(1000,500),'#34302B');d=ImageDraw.Draw(small);d.text((18,12),'Sofa-scale checks: actual 96px car bounds / 32px icon bounds',fill='#E3D5AC',font=font(22))
    for i,(slug,name) in enumerate(zip(SLUGS,NAMES)):
        y=65+i*84;d.text((18,y+20),name,fill='white',font=font(19))
        for j,role in enumerate(['heavy','light','icon']):
            r=lookup[(f'style-{slug}.json',role)];im=Image.open(r['path']).convert('RGBA');im=im.crop(im.getbbox());size=32 if role=='icon' else 96;im.thumbnail((size,size));x=290+j*180;small.paste(im,(x,y),im);d.text((x+108,y+18),role,fill='#BDB5A3',font=font(13))
    small.save(OUT/'readability.png')
    board([{**r,'label':r['id'].replace('v1-','',1),'verdict':r['verdict']} for r in attempts],5,'All attempts | deterministic outcomes, preserved source pixels',OUT/'all-attempts.png',cw=320,ch=390)
    spend=Budget().summary();cards=''
    for slug,name in zip(SLUGS,NAMES):
        style=read_json(ART/f'style-{slug}.json');group=[lookup[(f'style-{slug}.json',role)] for role in ROLES]
        rows=''.join('<tr><td>'+html.escape(r['brief']['proof_role'])+f'<br><a href="{r["id"]}-source.jpg">source</a> / <a href="{r["id"]}.png">preview</a>'+'</td><td>'+html.escape(r['verdict'])+'</td><td>'+html.escape(', '.join(r['codes']))+'</td><td>'+html.escape(r['direct_review']['note'])+'</td></tr>' for r in group)
        cards+=f'<section id="{slug}"><h2>{name}</h2><p>{html.escape(style["rationale"])}</p><p><a href="{slug}-vs-v1.png">v1 versus v2 board</a> · <a href="../../style-{slug}.json">Full style card</a></p><a href="{slug}.png"><img src="{slug}.png" alt="{name} seven proof assets"></a><details><summary>Gate codes and direct observations</summary><table><tr><th>Subject</th><th>Verdict</th><th>Codes</th><th>Observed pixels</th></tr>{rows}</table></details></section>'
    page=f'''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Death Ride — choose the drawing language</title><style>body{{margin:0;background:#171819;color:#e5d9bd;font:17px/1.6 system-ui}}main{{max-width:1450px;margin:auto;padding:38px}}h1{{font-size:44px;line-height:1.1}}h2{{font-size:30px}}a{{color:#e4aa62}}nav{{display:flex;gap:24px;flex-wrap:wrap}}section{{border-top:1px solid #514533;margin:45px 0;padding-top:22px}}img{{display:block;max-width:100%;height:auto;margin:20px 0;background:#272625}}.lede{{max-width:920px;font-size:20px}}.status{{padding:18px;background:#332c24;border-left:4px solid #c58742}}table{{border-collapse:collapse;width:100%;font-size:14px}}td,th{{text-align:left;border-bottom:1px solid #514533;padding:10px;vertical-align:top}}code{{overflow-wrap:anywhere}}summary{{cursor:pointer}}</style><main><p>DEATH RIDE / ART DIRECTION V2 / OWNER REVIEW</p><h1>Five ways to make the wasteland.</h1><p class="lede">Compare the same heavy, light, rival, ground, barricade, repair icon and spark burst across five drawing languages. These are original style proofs, not production-ready selections.</p><div class="status">Owner choice pending. V2's ten cars and six portraits, and V4's world kit, wait for <code>deathride/art/OWNER-CHOICE.md</code>. Damage states and liveries require a separate exact-reference approval. No approval file has been created by this run.</div><p>V1 spend: {spend['images_reserved']-130} images. Weekly ledger: {spend['images_reserved']}/350; {spend['remaining']} remaining; zero videos. Failed attempts remain charged and visible. Local models route or reject; human calibration and owner taste remain pending.</p><nav>{''.join(f'<a href="#{s}">{n}</a>' for s,n in zip(SLUGS,NAMES))}<a href="../../review-v1.html">Historical review</a><a href="../../surface-lab/review.html">Surface lab</a></nav><h2>Compare by subject</h2><a href="combined.png"><img src="combined.png" alt="Five style columns and seven identical subject rows"></a><p>Ground cells show actual 2×2 repeats of 256px exports. Source margins are measured before extraction. A passing number does not erase a visible motif or border. Cars and icons below are shown at actual display bounds.</p><img src="readability.png" alt="96 pixel cars and 32 pixel icons">{cards}<section><h2>Evidence and next gate</h2><p><a href="all-attempts.png">All {len(attempts)} attempts</a> · <a href="../../reports/v1-owner-review.json">Hash-bound gates and both model observations</a> · <a href="../../briefs/v1-directions.csv">Identical proof briefs</a> · <a href="../../STYLE.md">Choice-file format and preserved contracts</a></p><p>Some proofs remain rejected. Choose or fuse a drawing language only; that does not accept every asset. The production pipeline still checks source hashes and approvals before spending on derived identities.</p></section></main></html>'''
    (OUT/'index.html').write_text(page,encoding='utf-8')
    (ART/'review.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=review/v2/index.html"><title>Death Ride art review</title><p><a href="review/v2/index.html">Open the five-direction owner review</a></p><p><a href="review-v1.html">Historical v1 review</a></p></html>',encoding='utf-8')
    write_json(ART/'reports/v1-review-index.json',{'at':now(),'owner_accepted':False,'count':len(records),'attempts':len(attempts),'spend':spend,'proofs':[{'id':r['id'],'source_sha256':r['source_sha256'],'verdict':r['verdict'],'codes':r['codes']} for r in records],'files':{p.name:sha(p) for p in OUT.iterdir() if p.is_file()}})
    print('Owner boards complete',len(records),'proofs',len(attempts),'attempts')

if __name__=='__main__':main()
