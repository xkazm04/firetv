import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path
from common import write_json, sha
from gen import Budget


class Part4BudgetContracts(unittest.TestCase):
    def policy(self, root, **extra):
        write_json(root/'budget.json', {'weekly_image_cap':550, 'max_attempts_per_asset':3, **extra})

    def test_override_is_scoped_across_revisions_and_requires_exact_audit(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory);audit=root/'reason.json';write_json(audit, {'reason':'source margin and aspect repair'})
            self.policy(root, asset_attempt_overrides={'car':{'limit':4,'reason':'repair','authorization':'owner task','audit_file':'reason.json','audit_sha256':sha(audit)}})
            budget=Budget(root)
            for revision in range(1,5):budget.reserve(f'car-v{revision}',1)
            with self.assertRaisesRegex(RuntimeError,'ASSET_ATTEMPT_CAP'):budget.reserve('car-v5',1)
            for revision in range(1,4):budget.reserve(f'other-v{revision}',1)
            with self.assertRaisesRegex(RuntimeError,'ASSET_ATTEMPT_CAP'):budget.reserve('other-v4',1)
            write_json(audit, {'reason':'changed'})
            with self.assertRaisesRegex(RuntimeError,'AUDIT_MISMATCH'):budget.reserve('car-v6',1)

    def test_session_ceiling_and_stop_fail_before_reservation(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory);week=datetime.now(timezone.utc).strftime('%G-W%V')
            self.policy(root, session_envelopes={'part4':{'week':week,'starting_reservations':401,'max_new_images':120}})
            write_json(root/'usage.json', {'schema':1,'weeks':{week:{'images_reserved':521,'videos_reserved':0}},'stop':None})
            budget=Budget(root);before=sha(root/'usage.json')
            with self.assertRaisesRegex(RuntimeError,'SESSION_BUDGET_CAP'):budget.reserve('car-v1',1)
            self.assertEqual(before,sha(root/'usage.json'));self.assertFalse((root/'history.jsonl').exists())
            budget.stop('test quota')
            with self.assertRaisesRegex(RuntimeError,'SPEND_STOP'):budget.reserve('car-v1',1)

    def test_session_scope_does_not_charge_or_block_another_art_task(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory);week=datetime.now(timezone.utc).strftime('%G-W%V')
            self.policy(root, session_envelopes={'part4':{'week':week,'starting_reservations':0,'max_new_images':1,'started_at':'2000','asset_prefixes':['rework-']}})
            budget=Budget(root)
            budget.reserve('hud-one',1);budget.reserve('rework-car-v1',1)
            with self.assertRaisesRegex(RuntimeError,'SESSION_BUDGET_CAP'):budget.reserve('rework-car-v2',1)
            budget.reserve('hud-two',1)
            self.assertEqual(budget.summary()['images_reserved'],3)


if __name__=='__main__':unittest.main()
