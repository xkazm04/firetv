"""Validate accepted artifacts without needing ignored raw or processed images."""
from pathlib import Path
from PIL import Image
from common import ROOT,ART,read_json,write_json,sha
from atlas import content_hash,validate_layout
from autotile import CASES

def validate_coverage(catalog,region_ids):
    assets=catalog['assets'];ids={r['asset_id'] for r in assets};names={r['logical_name'] for r in assets}
    contracts=catalog['content_contracts'];aliases=catalog['content_landmark_aliases']
    for theme in contracts['track-themes']:
        if 'backdrops/'+theme['id'] not in names:raise ValueError('MISSING_THEME')
        for key in (theme['propSet']+';'+theme['hazardSet']).split(';'):
            if aliases.get(key) not in ids:raise ValueError('MISSING_LANDMARK: '+key)
    for rival in contracts['rivals']:
        if 'portraits/'+rival['id'] not in names:raise ValueError('MISSING_PORTRAIT')
    if catalog.get('provisional_c4'):
        extra=catalog['provisional_c4']
        if 'portraits/'+extra['rival']['id'] not in names or catalog['content_portrait_aliases'].get(extra['story']['portraitKey']) not in ids:raise ValueError('MISSING_PROVISIONAL_PORTRAIT')
    for group in ('weapons','consumables'):
        mappings=catalog['content_combat_aliases'][group]
        for row in contracts[group]:
            if mappings.get(row['id']) not in ids:raise ValueError('MISSING_COMBAT_ICON: '+row['id'])
    for asset in assets:
        expected=asset.get('frames',[asset['asset_id']]) if asset['group'] in ('world','ui') else []
        if any(i not in region_ids for i in expected):raise ValueError('MISSING_CATALOG_REGION')
    return {**{name:len(rows) for name,rows in contracts.items()},'provisional_rivals':1 if catalog.get('provisional_c4') else 0}

def validate(folder):
    folder=Path(folder);manifest=read_json(folder/'manifest.json');count=0;groups=[];region_ids=set()
    for page in manifest['pages']+manifest['tiles']+manifest['themes']:
        path=folder/page['file']
        if sha(path)!=page['sha256']:raise ValueError('PAGE_HASH_CHANGED')
        with Image.open(path) as im:
            if list(im.size)!=[page['width'],page['height']] or im.mode!='RGBA':raise ValueError('PAGE_FORMAT')
    for file in sorted(folder.glob('*.atlas')):
        data=read_json(file.with_suffix('.json'));validate_layout(data['regions']);groups.append(data['group'])
        for region in data['regions']:
            if region['id'] in region_ids:raise ValueError('DUPLICATE_REGION')
            region_ids.add(region['id'])
            page=Image.open(folder/data['pages'][region['page']]['file'])
            cell=page.crop((region['x'],region['y'],region['x']+region['width'],region['y']+region['height']))
            if content_hash(cell)!=region['content_sha256']:raise ValueError('ATLAS_CONTENT_CHANGED: '+region['id'])
            count+=1
        if data['group'].startswith('autotile-'):
            masks={int(r['id'].rsplit('-',1)[1]) for r in data['regions']}
            if masks!=set(CASES):raise ValueError('AUTOTILE_INCOMPLETE')
            rules=read_json(folder/(data['group']+'-rules.json'))
            if len(rules['resolver'])!=256 or set(rules['resolver'])!=masks:raise ValueError('RESOLVER_INCOMPLETE')
    resident=sum(p['rgba_bytes'] for p in manifest['pages']+manifest['tiles'])+max((p['rgba_bytes'] for p in manifest['themes']),default=0)+manifest['cars_reserved_rgba_bytes']
    if resident!=manifest['resident_rgba_bytes_with_reserved_cars'] or resident>32*2**20:raise ValueError('RESIDENT_BUDGET')
    catalog=read_json(folder/'catalog.json');names=[r['logical_name'] for r in catalog['assets']]
    if len(names)!=len(set(names)):raise ValueError('DUPLICATE_LOGICAL_NAME')
    for item in catalog['assets']:
        if 'frames' in item and (len(item['frames'])!=6 or len(item['durations_ms'])!=6 or any(d<=0 for d in item['durations_ms'])):raise ValueError('ANIMATION_INCOMPLETE')
    coverage=validate_coverage(catalog,region_ids)
    result={'status':'pass','atlas_groups':groups,'regions':count,'logical_assets':len(names),'tile_pages':len(manifest['tiles']),'theme_pages':len(manifest['themes']),'content_coverage':coverage,'resident_mib_with_car_reserve':resident/2**20,'scope':'PNG, hash, packing, content ID coverage, 47-case art, 256-mask resolver, six-frame durations and declared residency; no renderer/gameplay/owner claim'}
    write_json(ART/'reports/p4-bundle-validation.json',result);print(result);return result

if __name__=='__main__':
    import sys
    validate(read_json(ART/'reports/p4-draft-location.json')['folder'] if '--draft' in sys.argv else ROOT/'assets/phase2-v1')
