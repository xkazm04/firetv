import concurrent.futures
import tempfile
import unittest
from pathlib import Path
from common import ART, briefs, compile_prompt, read_json, write_json
from gen import Budget, QUOTA, fingerprint

class GenerationContracts(unittest.TestCase):
    def test_budget_is_atomic_under_concurrent_dispatch(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            write_json(root/'budget.json',{'weekly_image_cap':3})
            budget=Budget(root)
            def dispatch(i):
                try: budget.reserve(str(i),1); return True
                except RuntimeError: return False
            with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
                results=list(pool.map(dispatch,range(20)))
            self.assertEqual(sum(results),3)
            self.assertEqual(budget.summary()['remaining'],0)

    def test_quota_latch_survives_new_driver_and_never_clears_itself(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            write_json(root/'budget.json',{'weekly_image_cap':20})
            Budget(root).stop('429 quota exceeded')
            with self.assertRaisesRegex(RuntimeError,'SPEND_STOP'):
                Budget(root).reserve('another',1)
            self.assertEqual(Budget(root).summary()['images_reserved'],0)

    def test_quota_messages(self):
        for message in ['HTTP 429', 'Rate limit exceeded', 'quota has been exhausted', 'Too many requests', 'usage limit reached']:
            self.assertIsNotNone(QUOTA.search(message),message)
        self.assertIsNone(QUOTA.search('generated image successfully'))

    def test_ten_original_briefs_and_exact_style_prefix(self):
        rows=briefs(ART/'briefs/p1.csv')
        self.assertEqual(len(rows),10)
        self.assertEqual({r['class'] for r in rows if r['kind']=='car'},{'Needle','Line','Bastion','Comet','Trail'})
        self.assertEqual({r['class'] for r in rows if r['kind']=='tile'},{'asphalt','gravel','ice','oil','kerb'})
        style=read_json(ART/'style.json')
        for row in rows:
            prompt=compile_prompt(row,style)
            self.assertTrue(prompt.startswith(style['style_block']+'\n\nACTION: '))
            self.assertIn(style['negative'],prompt)
        changed=[dict(r) for r in rows]
        changed[0]['prompt_action']+=' MUTATED'
        self.assertNotEqual(fingerprint(rows,style),fingerprint(changed,style))

if __name__=='__main__': unittest.main()
