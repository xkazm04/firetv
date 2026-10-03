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

    def test_theme_sets_are_distinct_and_cover_game_themes(self):
        data=read_json(ART/'rework2-environment.json')
        themes={r['id'] for r in csv.DictReader((ROOT/'core/src/main/resources/data/track-themes.csv').read_text().splitlines())}
        self.assertEqual(set(data['theme_sets']),themes)
        self.assertEqual(len({tuple(v) for v in data['theme_sets'].values()}),5)
        self.assertTrue(all(len(v)>=6 for v in data['theme_sets'].values()))

if __name__=='__main__':unittest.main()
