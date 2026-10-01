import copy
import tempfile
import unittest
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
from common import ART, read_json
from process import key_image, sprite_metrics, tile_metrics, tile_codes, normalize
from grade import decide, validate, SCHEMA

class AcceptanceContracts(unittest.TestCase):
    def sprite(self,box=(25,40,175,110)):
        im=Image.new('RGB',(200,150),'magenta');ImageDraw.Draw(im).rectangle(box,fill='#CC342F');return im

    def test_empty_and_cropped_sources_cannot_pass_after_trim(self):
        empty,_=key_image(Image.new('RGB',(200,150),'magenta'))
        self.assertIn('EMPTY_ALPHA',sprite_metrics(empty)[1])
        crop,_=key_image(self.sprite((0,40,175,110)))
        self.assertIn('CROPPED_OR_MARGIN',sprite_metrics(crop)[1])
        out,_=normalize(crop,read_json(ART/'style.json'))
        self.assertFalse(np.asarray(out)[0,:,3].any())
        # Normalization clears the border but does not erase the raw-source failure.
        self.assertIn('CROPPED_OR_MARGIN',sprite_metrics(crop)[1])

    def test_vertical_axis_fails_and_neutral_key_preserves_enclosed_highlights(self):
        im=self.sprite().rotate(90,expand=True)
        keyed,_=key_image(im)
        self.assertIn('AXIS_NOT_X',sprite_metrics(keyed,{'lengthM':8,'widthM':4})[1])
        im=Image.new('RGB',(200,150),'white');d=ImageDraw.Draw(im)
        d.rectangle((25,40,175,110),fill='black');d.rectangle((60,60,100,80),fill='white')
        keyed,_=key_image(im)
        self.assertEqual(keyed.getpixel((80,70))[3],255)
        self.assertEqual(keyed.getpixel((0,0))[3],0)

    def test_normalization_preserves_aspect_scale_pivot_and_padding(self):
        keyed,_=key_image(self.sprite())
        style=read_json(ART/'style.json');out,meta=normalize(keyed,style,{'lengthM':7.8,'widthM':3.75})
        self.assertEqual(meta['subject_px'][0],round(7.8*style['pixels_per_metre']))
        self.assertAlmostEqual(meta['subject_px'][0]/meta['subject_px'][1],151/71,delta=.03)
        for n in out.size:self.assertEqual(n&(n-1),0)
        a=np.asarray(out);self.assertFalse(a[0,:,3].any());self.assertGreater(int(a[0,:,:3].sum()),0)
        self.assertEqual(meta['source_pivot_px'],[100.5,75.5])

    def test_seam_measures_both_axes_and_a_local_peak(self):
        im=Image.new('RGB',(256,256),'#333333')
        self.assertEqual(tile_codes(tile_metrics(im),'asphalt'),[])
        a=np.asarray(im).copy();a[20:25,-1]=255
        m=tile_metrics(Image.fromarray(a))
        self.assertLess(m['edge_x_mean'],.08)
        self.assertIn('TILE_SEAM_PEAK',tile_codes(m,'asphalt'))
        self.assertEqual(m['edge_y_mean'],0)

    def test_repetition_detects_internal_copy_and_kerb_exempts_only_repetition(self):
        rng=np.random.default_rng(6);a=rng.integers(30,90,(64,64,3),dtype=np.uint8)
        repeated=Image.fromarray(np.tile(a,(4,4,1)))
        m=tile_metrics(repeated)
        self.assertGreater(m['autocorrelation_peak'],.9)
        self.assertIn('TILE_REPETITION',tile_codes(m,'asphalt'))
        self.assertNotIn('TILE_REPETITION',tile_codes(m,'kerb'))
        m['edge_x_mean']=1
        self.assertIn('TILE_SEAM_MEAN',tile_codes(m,'kerb'))

    def test_historical_regressions_are_actually_measured(self):
        path=ART/'reports/owner-tests-deterministic.json'
        self.assertTrue(path.exists(),'run calibrate.py first')
        rows={r['id']:r for r in read_json(path)}
        self.assertEqual(len(rows),10)
        for asset,code in [('test-car-bastion','CROPPED_OR_MARGIN'),('test-car-trail','AXIS_NOT_X'),('test-tile-asphalt','TILE_REPETITION'),('test-tile-oil','TILE_REPETITION')]:
            self.assertIn(code,rows[asset]['codes'])
            self.assertEqual(rows[asset]['verdict'],'reject')

    def grade(self,**changes):
        a={'forbidden_details':False,'true_top_down':'yes','heading_right':'yes','subject_matches':'yes','neutral_lighting':'yes','confidence':1.,'description':'Overhead red car.'}
        a.update(changes);return {'status':'graded','answers':a}

    def test_models_cannot_accept_and_disagreement_routes(self):
        g=self.grade()
        self.assertEqual(decide([g,g],'car',.85)[0],'owner-review')
        bad=self.grade(true_top_down='no')
        self.assertEqual(decide([g,bad],'car',.85),('owner-review',['VLM_DISAGREEMENT']))
        self.assertIn('NOT_TOP_DOWN',decide([bad,bad],'car',.85)[1])
        self.assertIn('VLM_UNMEASURED',decide([g],'car',.85)[1])
        self.assertIn('VLM_LOW_CONFIDENCE',decide([self.grade(confidence=.4)]*2,'car',.85)[1])

    def test_missing_field_or_wrong_type_is_ungraded(self):
        a=self.grade()['answers'];self.assertTrue(validate(a,SCHEMA))
        del a['heading_right'];self.assertFalse(validate(a,SCHEMA))
        a=self.grade(confidence=True)['answers'];self.assertFalse(validate(a,SCHEMA))

    def test_family_schema_does_not_invent_camera_failures(self):
        g={'status':'graded','answers':{'palette_matches':'yes','silhouette_distinct':'yes','confidence':1.,'description':'Distinct body and same material roles.'}}
        self.assertEqual(decide([g,g],'car',.85),('owner-review',['OWNER_ACCEPTANCE_PENDING']))

if __name__=='__main__':unittest.main()
