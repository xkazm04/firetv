"""Export review candidates disabled by default. Only a separate exact-byte owner ledger can enable them."""
from PIL import Image
from common import ART, ROOT, read_json, write_json, sha

FOLDER=ROOT/'assets/story-art'

def build():
    records={r['id']:r for r in read_json(ART/'reports/story-attempts-graded.json')}
    selection=read_json(ART/'story-selections.json')
    approval_path=ART/'story-approvals.json'
    approvals=read_json(approval_path) if approval_path.exists() else {'schema':1,'assets':{}}
    entries=[];exports=[];FOLDER.mkdir(parents=True,exist_ok=True)
    for key,id in selection['candidates'].items():
        r=records[id]
        # Rig remains a review-only reference. No unsupported state family enters gameplay.
        if key=='rig-reference':continue
        direct=r.get('direct_review') or read_json(ART/'audits/story-direct-review.json').get(id,{})
        pixel=next(x for x in read_json(ART/'reports/story-attempts-deterministic.json') if x['id']==id)
        eligible=not pixel['codes'] and r['verdict']!='reject' and direct.get('reviewed',False) and direct.get('technical_eligible',False)
        assert sha(r['path'])==r['sha256']
        im=Image.open(r['path']).convert('RGBA')
        if r['kind']=='backdrop':im.thumbnail((512,512),Image.Resampling.LANCZOS)
        crop=None
        if key=='debt-meter':
            # Remove only surplus transparent cell space; original source gates stay authoritative.
            box=im.getbbox();crop=[max(0,box[0]-4),max(0,box[1]-4),min(im.width,box[2]+4),min(im.height,box[3]+4)]
            im=im.crop(crop)
        path=FOLDER/(key+'.png');im.save(path)
        a=approvals['assets'].get(key,{})
        approved=(a.get('owner_approved') is True and bool(a.get('owner_evidence')) and
                  a.get('source_sha256')==r['source_sha256'] and a.get('export_sha256')==sha(path))
        entry=dict(key=key,file=path.name,source_id=id,source_sha256=r['source_sha256'],sha256=sha(path),
                   width=im.width,height=im.height,rgba_bytes=im.width*im.height*4,
                   technical_eligible=eligible,owner_approved=approved,
                   owner_evidence=a.get('owner_evidence',''),approved_source_sha256=a.get('source_sha256','') if approved else '',
                   approved_export_sha256=a.get('export_sha256','') if approved else '')
        if pixel.get('hud_interior_px'):
            b=pixel['hud_interior_px'];entry['interior']=[b[0]-crop[0],b[1]-crop[1],b[2]-crop[0],b[3]-crop[1]] if crop else b
        if crop:entry['transparent_cell_crop']=crop
        entries.append(entry)
        if not approvals['assets'].get(key,{}).get('owner_approved'):
            approvals['assets'][key]={'owner_approved':False,'owner_evidence':'','source_sha256':r['source_sha256'],'export_sha256':sha(path)}
        exports.append({'id':key,'class':r['class'],'kind':r['kind'],'brief':r['brief'],
            'source':str(path),'source_sha256':sha(path),'path':str(path),'sha256':sha(path),
            'original_id':id,'original_source_sha256':r['source_sha256'],
            'codes':list(pixel['codes']),'verdict':'owner-review' if eligible else 'reject',
            'metrics':{'export_size_px':list(im.size),'rgba_bytes':im.width*im.height*4},
            'review_context':'Inspect the exact candidate menu PNG, including transparency composited over grey. Source gates remain in the separate original-attempt report; this is an additional export observation.'})
    write_json(approval_path,approvals)
    write_json(FOLDER/'catalog.json',{'schema':1,'policy':'Exact owner approval plus technical eligibility required; default procedural/text fallback.',
        'max_resident_rgba_bytes':1572864,'assets':entries})
    write_json(ART/'reports/story-exports-deterministic.json',exports)
    print('Exported',len(entries),'candidates;',sum(e['owner_approved'] for e in entries),'owner approved')

def validate():
    catalog=read_json(FOLDER/'catalog.json');seen=set()
    for e in catalog['assets']:
        assert e['key'] not in seen;seen.add(e['key'])
        assert sha(FOLDER/e['file'])==e['sha256']
        with Image.open(FOLDER/e['file']) as im:
            assert im.mode=='RGBA' and im.size==(e['width'],e['height']) and max(im.size)<=512
            assert im.width*im.height*4==e['rgba_bytes']
        if e['owner_approved']:
            assert e['technical_eligible'] and e['owner_evidence']
            assert e['approved_source_sha256']==e['source_sha256'] and e['approved_export_sha256']==e['sha256']
        if e['key']=='debt-meter':
            b=e['interior']
            assert (b[1]+e['height']-b[3])*.25<=18 and (b[0]+e['width']-b[2])*.25<=250
    lookup={e['key']:e['rgba_bytes'] for e in catalog['assets']}
    panel=max((v for k,v in lookup.items() if not k.startswith('icon-') and k not in ('mechanic','debt-meter')),default=0)
    career=panel+sum(lookup.get(k,0) for k in ('debt-meter','icon-ledger','icon-payment'))+max(lookup.get(k,0) for k in ('icon-diversion','icon-recovery','icon-cancelled'))
    garage=sum(lookup.get(k,0) for k in ('mechanic','icon-ledger'))
    assert max(career,garage)<=catalog['max_resident_rgba_bytes']
    result={'status':'pass','candidates':len(seen),'owner_approved':sum(e['owner_approved'] for e in catalog['assets']),
            'worst_menu_rgba_bytes':max(career,garage),'all_images_rgba_bytes':sum(lookup.values()),
            'policy':'Only current menu images resident, additionally bounded by shared art and total headroom.'}
    write_json(ART/'reports/story-bundle-validation.json',result);print(result)

if __name__=='__main__':
    import sys
    if '--validate' not in sys.argv:build()
    validate()
