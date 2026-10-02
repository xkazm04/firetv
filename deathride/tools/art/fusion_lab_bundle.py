"""Stage the exact published kit, not a reduced fixture, for residency measurement."""
import shutil
from common import ART,ROOT,sha,read_json,write_json

def main():
    source=ROOT/'assets/phase2-fusion';dest=ROOT/'tools/art/surface-lab/assets/fusion-bundle'
    shutil.copytree(source,dest,dirs_exist_ok=True)
    files={str(p.relative_to(source)).replace('\\','/'):sha(p) for p in source.rglob('*') if p.is_file()}
    for name,digest in files.items():
        if sha(dest/name)!=digest:raise ValueError('staged bundle changed')
    manifest=read_json(source/'manifest.json')
    write_json(ART/'surface-lab/fusion-resident-inputs.json',{'schema':1,'bundle':'phase2-fusion',
        'fixture_recipe_sha256':sha(ART/'surface-lab/fusion-inputs.json'),'files':files,
        'cars_page_sha256':sha(ART/'surface-lab/fusion-inputs/cars.png'),
        'resident_rgba_bytes':manifest['resident_rgba_bytes_with_reserved_cars'],
        'scope':'all four packed atlases and eleven materials, one theme, natural ribbon, one reference-car page and one allocated blank reserve car page; no game scenery FBO'})
    print('Staged complete bundle:',len(files),'files')

if __name__=='__main__':main()
