"""Local owner review entry point; derives previews without a generation call."""
import html
from pathlib import Path
from PIL import Image
from common import ART,ROOT,read_json,write_json,make_contact_sheet,now

def build():
    contacts=ART/'contact-sheets';contacts.mkdir(exist_ok=True)
    bundle=ROOT/'assets/phase2-v1'
    if not bundle.exists():bundle=Path(read_json(ART/'reports/p4-draft-location.json')['folder'])
    for name in ('world','ui'):
        im=Image.open(bundle/(name+'-0.png')).convert('RGBA');bg=Image.new('RGBA',im.size,'#70747A');bg.alpha_composite(im)
        bg.convert('RGB').save(contacts/('p4-atlas-'+name+'.png'))
    selected={s['id']:s for s in read_json(ART/'selections.json')['assets'] if s['status']=='technical-accepted'}
    records=[r for r in read_json(ART/'reports/p4-world-candidates-deterministic.json') if r['id'] in selected]
    make_contact_sheet([{**r,'verdict':'technical selection; owner pending','codes':selected[r['id']]['owner_review_reasons']} for r in records],contacts/'p4-selected-owner.png','P4 selected exports | owner quality pending; all machine codes retained')
    repeats=[]
    for r in records:
        if r['kind']!='tile':continue
        tile=Image.open(r['path']).convert('RGB');repeat=Image.new('RGB',(tile.width*2,tile.height*2))
        for x in (0,tile.width):
            for y in (0,tile.height):repeat.paste(tile,(x,y))
        path=contacts/(r['id']+'-repeat.png');repeat.save(path);repeats.append({**r,'path':str(path),'verdict':'exported 2 x 2 repeat','codes':[]})
    make_contact_sheet(repeats,contacts/'p4-selected-materials-repeat.png','All eleven selected ground materials | actual exported 2 x 2 repeats')
    def section(title,files):
        cards=[]
        for path in files:
            rel=path.relative_to(ART).as_posix();label=html.escape(path.stem)
            cards.append(f'<figure><a href="{rel}"><img loading="lazy" src="{rel}" alt="{label}"></a><figcaption>{label}</figcaption></figure>')
        return '<h2>'+title+'</h2><div class="grid">'+''.join(cards)+'</div>'
    owners=sorted(contacts.glob('p4-*-owner.png'))
    sections=[section('Selected exports and repeat checks',[contacts/x for x in ('p4-atlas-world.png','p4-atlas-ui.png','p4-selected-materials-repeat.png')]),
              section('Ten car references — approval pending',sorted(contacts.glob('p3-reference-*.png'))),
              section('World batches — failure codes remain visible',owners),
              section('Six-frame effects — looping here for inspection only',sorted(contacts.glob('*-preview.gif'))),
              section('Autotile geometry and exported frames',[contacts/x for x in ('p4-autotile-track-edge.png','p4-autotile-track-edge-map.png','p4-autotile-barrier.png','p4-autotile-barrier-map.png','p4-export-review.png')]),
              section('Earlier waves and historical defects',sorted(p for p in contacts.glob('*-owner.png') if not p.name.startswith('p4-')))]
    page='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Death Ride ART review</title>
<style>body{background:#171b20;color:#e8dfc8;font:16px system-ui;margin:32px auto;max-width:1400px;padding:0 24px}h1{font-size:36px}p{max-width:1000px;line-height:1.6}a{color:#e5bd24}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(310px,1fr));gap:18px}figure{margin:0;background:#252930;border-radius:8px;overflow:hidden}img{display:block;width:100%;height:auto}figcaption{padding:12px;font-size:13px;overflow-wrap:anywhere}h2{margin-top:48px}</style>
<h1>Death Ride · ART review</h1><p>69 technical world/UI/material selections, 172 atlas regions, ten car references. <strong>Owner quality approval is pending.</strong> Click a sheet for its full resolution. Machine flags are diagnostic; no model vote grants acceptance. Raw sheet defects and rejected attempts remain in the reports.</p>
<p>Car reference approval must precede the 40 state and 30 livery generations. Those jobs remain unrun. Human-labelled grader calibration, renderer integration and full-game Stick measurements also remain pending. No approval controls on this page change pipeline state.</p>
<p><a href="DELIVERY.md">Integration handoff</a> · <a href="ACCEPTANCE.md">Grader limits</a> · <a href="reports/p4-bundle-validation.json">Bundle gates</a> · <a href="selections.json">Selection reasons and model observations</a> · <a href="device/heading-probe.json">Stick heading experiment</a></p>'''+''.join(sections)+'</html>'
    (ART/'review.html').write_text(page,encoding='utf-8')
    write_json(ART/'reports/p4-review-index.json',{'at':now(),'entry':'art/review.html','p4_owner_sheets':[p.name for p in owners],'local_only':'PNG/GIF contact products are git-ignored; accepted bundle and review recipe are versioned.'})
    print('Owner review index:',ART/'review.html')

if __name__=='__main__':build()
