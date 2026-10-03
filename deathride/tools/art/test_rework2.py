import copy
import csv
import unittest
from common import ART, ROOT, read_json, sha

class EnvironmentContract(unittest.TestCase):
    def test_visual_remap_preserves_every_gameplay_field(self):
        data=read_json(ART/'rework2-environment.json')
        core={r['id']:r for r in csv.DictReader((ROOT/'core/src/main/resources/data/obstacles.csv').read_text().splitlines())}
        self.assertEqual(set(core),{r['id'] for r in data['obstacles']})
        self.assertEqual(data['core_obstacles_sha256'],sha(ROOT/'core/src/main/resources/data/obstacles.csv'))
        for r in data['obstacles']:
            c=core[r['id']]
            self.assertEqual(r['effect_class'],c['effect'])
            self.assertEqual(r['collision_footprint']['radii'],[float(c['rx']),float(c['ry'])])
            self.assertEqual(r['visual_extent_m'],[float(c['visualWidth']),float(c['visualHeight'])])
            self.assertEqual(r['height_m'],float(c['height']))
            self.assertEqual(r['drag_multiplier'],float(c['drag']))
            self.assertFalse(r['owner_approved'])

    def test_owner_theme_sets_cover_game_themes_with_existing_assets(self):
        data=read_json(ART/'rework2-environment.json')
        themes={r['id'] for r in csv.DictReader((ROOT/'core/src/main/resources/data/track-themes.csv').read_text().splitlines())}
        self.assertEqual(set(data['theme_sets']),themes)
        catalog=read_json(ROOT/'assets/phase2-states/catalog.json')
        names={r['logical_name'] for r in catalog['assets']}
        self.assertTrue(all(v and all(k in names for k in v) for v in data['theme_sets'].values()))
        self.assertFalse(data['retained_visuals'])
        self.assertFalse(any('props/soft-dune' in v for v in data['theme_sets'].values()))
        self.assertEqual(set(data['gaps']),themes)

    def test_exact_owner_decisions_reject_stale_hashes_and_reintroduced_candidates(self):
        from owner_art_validation import validate_owner_art,validate_selection
        self.assertEqual(validate_owner_art()['kept'],14)
        catalog=read_json(ROOT/'assets/phase2-states/catalog.json')
        ledger=read_json(ART/'owner-approvals-2026-10-03.json')
        regions={r['id'] for g in ('world','ui','cars') for r in read_json(ROOT/'assets/phase2-states'/(g+'.json'))['regions']}
        stale=copy.deepcopy(catalog)
        next(e for e in stale['assets'] if e['asset_id']=='rw2-env-scrap-pile-v1-a2')['export_sha256']='0'*64
        with self.assertRaisesRegex(AssertionError,'OWNER_EXPORT_HASH'):validate_selection(stale,ledger,regions)
        with self.assertRaisesRegex(AssertionError,'REJECTED_ATLAS_ASSET'):validate_selection(catalog,ledger,regions|{'rw2-face-ox-v1-a1'})
        missing=copy.deepcopy(catalog);missing['environment_sets']['alpine']=[]
        with self.assertRaisesRegex(AssertionError,'THEME_PROP_MISSING'):validate_selection(missing,ledger,regions)

if __name__=='__main__':unittest.main()
