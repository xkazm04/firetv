import tempfile
import unittest
from pathlib import Path
from common import write_json
from gen import Budget

class StoryBudget(unittest.TestCase):
    def test_session_prefix_limit_cannot_be_bypassed_by_revision_or_other_spend(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d)
            write_json(root/'budget.json',{'weekly_image_cap':550,'max_attempts_per_asset':3})
            week=Budget(root).summary()['week']
            write_json(root/'budget.json',{'weekly_image_cap':550,'max_attempts_per_asset':3,
                'session_envelopes':{'story-art':{'week':week,'starting_reservations':482,
                'started_at':'2000-01-01','max_new_images':2,'asset_prefixes':['story-']}}})
            b=Budget(root);b.reserve('story-portrait-v1',1);b.reserve('unrelated',1);b.reserve('story-portrait-v2',1)
            with self.assertRaisesRegex(RuntimeError,'SESSION_BUDGET_CAP'):b.reserve('story-panel-v1',1)
            self.assertEqual(b.summary()['images_reserved'],3)

    def test_global_cap_still_dominates_story_envelope(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);write_json(root/'budget.json',{'weekly_image_cap':550})
            week=Budget(root).summary()['week']
            write_json(root/'usage.json',{'schema':1,'weeks':{week:{'images_reserved':550,'videos_reserved':0}},'stop':None})
            with self.assertRaisesRegex(RuntimeError,'LOCAL_BUDGET_CAP'):Budget(root).reserve('story-panel',1)

if __name__=='__main__':unittest.main()
