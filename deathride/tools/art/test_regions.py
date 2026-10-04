import copy
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from contextlib import nullcontext
from common import ART, read_json
import gen
from regions_setup import catalog, build_briefs
from regions_validate import validate_plan

class RegionContracts(unittest.TestCase):
    def test_catalog_is_five_divisions_with_original_kits_and_nonphysical_weather(self):
        data=catalog();self.assertEqual({r['division'] for r in data['regions']},{'scrap','foundry','salt','switchback','crown'})
        for region in data['regions']:
            self.assertTrue(8<=len(region['props'])<=12)
            self.assertEqual(sum(p['origin']=='new' for p in region['props']),8)
            self.assertEqual(sum(w['max_live'] for w in region['atmosphere']),region['weather_cap'])
            self.assertLessEqual(region['weather_cap'],24)
            for prop in region['props']:
                self.assertFalse(prop['owner_approved'])
                if prop['effect_class']=='none':self.assertIsNone(prop['collision_footprint'])
                else:self.assertEqual(prop['collision_footprint']['radii'],[x/2 for x in prop['placement_extent_m']])
        jobs=build_briefs(data);self.assertEqual(len(jobs),59)
        self.assertEqual(len({r['batch'] for r in jobs}),17)
        self.assertTrue(all(r['approval']=='pending' and r['style_file']=='style-fusion.json' for r in jobs))

    def test_unknown_provider_failure_stops_later_proof_groups(self):
        jobs=[dict(id='test-a',batch='a',status='ready'),dict(id='test-b',batch='b',status='ready')]
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            with patch('sys.argv',['gen.py','--mode','proof']),patch.object(gen,'briefs',return_value=jobs),patch.object(gen,'ART',root),\
                 patch.object(gen,'style_for',return_value={}),patch.object(gen,'file_lock',return_value=nullcontext()),\
                 patch.object(gen,'proof_valid',return_value=False),patch.object(gen,'make_contact_sheet'),patch.object(gen,'Budget') as budget,\
                 patch.object(gen,'generate',return_value=dict(asset='test-a',status='generation-error',image=None)) as call:
                budget.return_value.summary.return_value={'stop':None}
                gen.main();self.assertEqual(call.call_count,1)

    def test_existing_quota_latch_stops_before_any_generation(self):
        with patch('sys.argv',['gen.py','--mode','proof']),patch.object(gen,'briefs',return_value=[dict(id='test',batch='a',status='ready')]),\
             patch.object(gen,'file_lock',return_value=nullcontext()),patch.object(gen,'Budget') as budget,patch.object(gen,'generate') as call:
            budget.return_value.summary.return_value={'stop':{'reason':'402 Payment Required'}}
            gen.main();call.assert_not_called()

    def test_plan_refuses_budget_growth_approval_and_unknown_material_slots(self):
        plan=read_json(ART/'regions/atlas-plan.json');validate_plan(plan)
        bad=copy.deepcopy(plan);bad['residency']['active_regions_max']=5
        with self.assertRaisesRegex(ValueError,'MULTIPLE_RESIDENT'):validate_plan(bad)
        bad=copy.deepcopy(plan);bad['residency']['regional_page_max_mib']=8
        with self.assertRaisesRegex(ValueError,'PROJECTED_RESIDENCY'):validate_plan(bad)
        bad=copy.deepcopy(plan);bad['regions'][0]['tiles'][0]['owner_approved']=True
        with self.assertRaisesRegex(ValueError,'INFERRED_APPROVAL'):validate_plan(bad)
        bad=copy.deepcopy(plan);bad['regions'][0]['tiles'][0]['replacement_slot']='tiles/new-unbudgeted-material'
        with self.assertRaisesRegex(ValueError,'MATERIAL_SLOT_UNKNOWN'):validate_plan(bad)
        bad=copy.deepcopy(plan);bad['regions'][0]['tiles'][0]['rgba_bytes']+=4
        with self.assertRaisesRegex(ValueError,'CANDIDATE_BYTE_COUNT'):validate_plan(bad)

if __name__=='__main__':unittest.main()
