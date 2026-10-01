import tempfile,unittest,base64,io
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
from autotile import CASES,canonical,footprint,barrier_mask,mask_from_grid,require_complete
from animation import split_sheet,remove_cell_backgrounds
from common import sha
from process import key_image
from wrap_tiles import wrap
from atlas import layout,validate_layout,validate_selection
from grade import encode
from validate_bundle import validate_coverage

class WorldContracts(unittest.TestCase):
    def test_content_aliases_and_animation_regions_must_exist(self):
        import copy
        catalog={'assets':[{'asset_id':'forest','logical_name':'backdrops/forest','group':'theme'},
                           {'asset_id':'rival','logical_name':'portraits/rook','group':'ui'},
                           {'asset_id':'prop','logical_name':'props/gate','group':'world'},
                           {'asset_id':'effect','logical_name':'effects/fire','group':'world','frames':['fire-0','fire-1']}],
                 'content_contracts':{'track-themes':[{'id':'forest','propSet':'gate','hazardSet':'gate'}],
                                      'rivals':[{'id':'rook'}],'weapons':[{'id':'Rivet'}],'consumables':[]},
                 'content_landmark_aliases':{'gate':'prop'},'content_combat_aliases':{'weapons':{'Rivet':'prop'},'consumables':{}}}
        regions={'rival','prop','fire-0','fire-1'}
        self.assertEqual(validate_coverage(catalog,regions)['rivals'],1)
        with self.assertRaisesRegex(ValueError,'MISSING_CATALOG_REGION'):validate_coverage(catalog,regions-{'fire-1'})
        broken=copy.deepcopy(catalog);broken['content_combat_aliases']['weapons']['Rivet']='missing'
        with self.assertRaisesRegex(ValueError,'MISSING_COMBAT_ICON'):validate_coverage(broken,regions)
        broken=copy.deepcopy(catalog);broken['content_landmark_aliases']['gate']='missing'
        with self.assertRaisesRegex(ValueError,'MISSING_LANDMARK'):validate_coverage(broken,regions)

    def test_all_256_inputs_resolve_to_47_complete_cases(self):
        self.assertEqual(len(CASES),47)
        self.assertEqual({canonical(i) for i in range(256)},set(CASES))
        self.assertEqual(canonical(2|8|32|128),0)
        self.assertEqual(canonical(255),255)
        self.assertEqual(len({footprint(m).tobytes() for m in CASES}),47)
        with tempfile.TemporaryDirectory() as d:
            p=Path(d)/'tile.png';Image.new('RGBA',(8,8),'grey').save(p)
            records=[{'mask':m,'path':str(p),'sha256':sha(p)} for m in CASES]
            require_complete(records)
            with self.assertRaisesRegex(ValueError,'INCOMPLETE'):require_complete(records[:-1])
            p.write_bytes(b'changed')
            with self.assertRaisesRegex(ValueError,'CHANGED'):require_complete(records)

    def test_neighbour_edges_match_on_random_connected_maps(self):
        rng=np.random.default_rng(47)
        for _ in range(40):
            grid=rng.random((8,8))>.35
            for y,x in np.argwhere(grid):
                a=footprint(mask_from_grid(grid,x,y),32)
                if x+1<8 and grid[y,x+1]:
                    b=footprint(mask_from_grid(grid,x+1,y),32);np.testing.assert_array_equal(a[:,-1],b[:,0])
                if y+1<8 and grid[y+1,x]:
                    b=footprint(mask_from_grid(grid,x,y+1),32);np.testing.assert_array_equal(a[-1],b[0])
        self.assertFalse(barrier_mask(255).any())
        self.assertTrue(barrier_mask(0).any())

    def test_sheets_fail_empty_duplicate_and_cross_boundary_frames(self):
        spec={'columns':3,'rows':2,'frames':6,'durations_ms':[50]*6,'frame_cell_px':128}
        with tempfile.TemporaryDirectory() as d:
            sheet=Image.new('RGBA',(300,200));draw=ImageDraw.Draw(sheet)
            for n in range(6):
                x=n%3*100;y=n//3*100;r=7+n*3
                draw.ellipse((x+50-r,y+50-r,x+50+r,y+50+r),fill=(255,150,20,255))
            frames,codes=split_sheet(sheet,spec,d,'valid');self.assertEqual(codes,[])
            self.assertEqual(len(frames),6);self.assertTrue(all(f['pivot_px']==[64,64] for f in frames))
            empty=Image.new('RGBA',(300,200));_,codes=split_sheet(empty,spec,d,'empty');self.assertIn('EMPTY_FRAME',codes)
            full=Image.new('RGBA',(300,200),'orange');_,codes=split_sheet(full,spec,d,'full')
            self.assertIn('FRAME_BOUNDARY',codes);self.assertIn('DUPLICATE_FRAME',codes)

    def test_mixed_sheet_gutters_remove_background_preserve_enclosed_ivory(self):
        im=Image.new('RGB',(300,200),'white');d=ImageDraw.Draw(im)
        d.rectangle((10,10,290,190),fill='#FF00FF')
        d.ellipse((100,50,200,150),fill='#171B20');d.ellipse((125,75,175,125),fill='#E8DFC8')
        out,meta=key_image(im)
        self.assertTrue(meta['mixed_border_key'])
        self.assertEqual(out.getpixel((0,0))[3],0);self.assertEqual(out.getpixel((15,15))[3],0)
        self.assertEqual(out.getpixel((150,100))[3],255)

    def test_wrap_changes_only_boundary_band_and_matches_both_edges(self):
        rng=np.random.default_rng(5);a=rng.integers(0,255,(256,256,4),dtype=np.uint8);a[:,:,3]=255
        b=np.asarray(wrap(Image.fromarray(a)))
        np.testing.assert_array_equal(a[8:-8,8:-8],b[8:-8,8:-8])
        np.testing.assert_array_equal(b[0],b[-1]);np.testing.assert_array_equal(b[:,0],b[:,-1])

    def test_pastel_cell_panels_cannot_pass_as_smoke(self):
        spec={'columns':3,'rows':2,'frames':6,'durations_ms':[50]*6,'frame_cell_px':128}
        im=Image.new('RGB',(300,200),'#DD147F');d=ImageDraw.Draw(im)
        for n in range(6):
            x=n%3*100;y=n//3*100;d.rectangle((x+16,y+20,x+84,y+90),fill='#D8BFE6');d.ellipse((x+35,y+35,x+65,y+65),fill='#C0C0C0')
        keyed,_=key_image(im)
        with tempfile.TemporaryDirectory() as folder:
            _,codes=split_sheet(keyed,spec,folder,'panels');self.assertIn('FRAME_KEY_RESIDUE',codes)
            cleaned,_=remove_cell_backgrounds(im,keyed,spec)
            self.assertEqual(cleaned.getpixel((25,25))[3],0)
            self.assertEqual(cleaned.getpixel((50,50))[3],255)

    def test_long_white_grid_removal_preserves_short_effect_highlights(self):
        spec={'columns':3,'rows':2,'frames':6,'durations_ms':[50]*6,'frame_cell_px':128}
        im=Image.new('RGB',(300,200),'#FF00FF');d=ImageDraw.Draw(im)
        d.line((100,0,100,199),fill='white',width=2);d.line((200,0,200,199),fill='white',width=2);d.line((0,100,299,100),fill='white',width=2)
        for n in range(6):
            x=n%3*100+50;y=n//3*100+50;d.ellipse((x-8,y-8,x+8,y+8),fill='white')
        keyed,_=key_image(im);cleaned,meta=remove_cell_backgrounds(im,keyed,spec)
        self.assertGreater(meta['long_white_separator_pixels_removed'],0)
        self.assertEqual(cleaned.getpixel((100,25))[3],0);self.assertEqual(cleaned.getpixel((50,50))[3],255)

    def test_atlas_budget_overlap_and_stale_review_are_hard_failures(self):
        items=[{'id':str(i),'width':128,'height':128} for i in range(64)]
        pages,positions=layout(items);self.assertEqual(len(pages),1);validate_layout(positions)
        with self.assertRaisesRegex(ValueError,'PAGE_BUDGET'):layout(items+[{'id':'overflow','width':128,'height':128}])
        positions[1].update(x=positions[0]['x'],y=positions[0]['y'])
        with self.assertRaisesRegex(ValueError,'OVERLAP'):validate_layout(positions)
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/'asset.png';Image.new('RGBA',(128,128),'grey').save(path)
            record={'path':str(path),'sha256':sha(path),'source_sha256':'source','codes':[]}
            selection={'status':'technical-accepted','review_note':'Inspected subject and both model observations','processed_sha256':sha(path),'source_sha256':'source','owner_approved':False,'model_observations':[{'model':m,'status':'graded','image_sha256':'source'} for m in ('mimo','qwen')]}
            validate_selection(selection,record)
            path.write_bytes(b'changed')
            with self.assertRaisesRegex(ValueError,'STALE'):validate_selection(selection,record)

    def test_grader_never_sees_extruded_rgb_under_zero_alpha(self):
        with tempfile.TemporaryDirectory() as d:
            im=Image.new('RGBA',(32,32),(255,0,0,0));im.putpixel((16,16),(10,20,30,255));path=Path(d)/'alpha.png';im.save(path)
            decoded=Image.open(io.BytesIO(base64.b64decode(encode(path))))
            self.assertEqual(decoded.getpixel((0,0)),(112,116,122))
            self.assertEqual(decoded.getpixel((16,16)),(10,20,30))

if __name__=='__main__':unittest.main()
