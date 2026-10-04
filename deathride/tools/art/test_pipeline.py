import concurrent.futures
import tempfile
import unittest
from unittest.mock import patch
from pathlib import Path
from common import ART, briefs, compile_prompt, read_json, write_json, digest, sha
from gen import Budget, QUOTA, fingerprint, generate,quota_evidence

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

    def test_revision_cannot_bypass_asset_attempt_cap(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory);write_json(root/'budget.json',{'weekly_image_cap':20,'max_attempts_per_asset':3})
            budget=Budget(root)
            for n in range(1,4):budget.reserve('asset-v'+str(n),1)
            with self.assertRaisesRegex(RuntimeError,'ASSET_ATTEMPT_CAP'):
                budget.reserve('asset-v4',1)
            self.assertEqual(budget.summary()['images_reserved'],3)

    def test_quota_messages(self):
        for message in ['HTTP 429', 'Rate limit exceeded', 'quota has been exhausted', 'Too many requests', 'usage limit reached']:
            self.assertIsNotNone(QUOTA.search(message),message)
        self.assertIsNone(QUOTA.search('generated image successfully'))
        self.assertIsNone(QUOTA.search('{"type":"usage","usage":{"output_tokens":429}}'))
        self.assertIsNotNone(QUOTA.search('{"status_code":429,"message":"request rejected"}'))
        self.assertIsNone(quota_evidence('{"type":"usage","usage":{"output_tokens":429}}'))
        self.assertEqual(quota_evidence('{"error":{"code":429}}'),'structured HTTP status 429')
        self.assertEqual(quota_evidence('{"type":"error","code":429}'),'structured HTTP status 429')

    def test_exhausted_grok_build_balance_is_quota_not_generic_failure(self):
        cases = [
            'API error (status 402 Payment Required): Grok Build usage balance exhausted',
            '{"type":"error","message":"Internal error: {\\n  \\"message\\": \\"API error (status 402 Payment Required): Grok Build usage balance exhausted\\",\\n  \\"http_status\\": 402\\n}"}',
            '{"error":{"http_status":402}}',
            '{"type":"error","code":402}',
            '{"error":"402"}',
            'Grok Build usage balance exhausted',
        ]
        for message in cases:
            self.assertIsNotNone(quota_evidence(message),message)
        for message in ['{"type":"usage","output_tokens":402}', 'image size 402 x 429', '{"code":402}', 'balance available: 402']:
            self.assertIsNone(quota_evidence(message),message)
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory);write_json(root/'budget.json',{'weekly_image_cap':850})
            budget=Budget(root);budget.reserve('proof-v1',1)
            budget.stop(quota_evidence(cases[0]))
            with self.assertRaisesRegex(RuntimeError,'SPEND_STOP'):
                Budget(root).reserve('sibling-v1',1)
            self.assertEqual(Budget(root).summary()['images_reserved'],1)

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

    def test_resume_never_spends_on_unchanged_output_or_uncertain_job(self):
        row=briefs(ART/'briefs/p1-current.csv')[0]
        style=read_json(ART/'style.json')
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            image=root/'image.png'; image.write_bytes(b'resume checks content hash')
            side=root/'sidecar.json'
            record={'input_hash':digest({'row':row,'style':style}),'status':'generated','image':str(image),'sha256':sha(image)}
            write_json(side,record)
            with patch('gen.ART',root),patch('gen.candidates',return_value=[side]),patch.object(Budget,'reserve') as spend:
                self.assertEqual(generate(row,style,Budget()),record)
                image.write_bytes(b'corrupted')
                # A damaged/missing existing artifact is not license for a new paid call.
                self.assertEqual(generate(row,style,Budget())['status'],'artifact-invalid')
                record['status']='interrupted-unknown-spend';write_json(side,record)
                self.assertEqual(generate(row,style,Budget()),record)
                spend.assert_not_called()
                with self.assertRaisesRegex(ValueError,'never retry transport errors'):
                    generate(row,style,Budget(),refine=True)

    def test_changed_used_id_refuses_before_spending(self):
        row=briefs(ART/'briefs/p1-current.csv')[0]
        with tempfile.TemporaryDirectory() as directory:
            side=Path(directory)/'sidecar.json';write_json(side,{'input_hash':'different'})
            with patch('gen.candidates',return_value=[side]),patch.object(Budget,'reserve') as spend:
                with self.assertRaisesRegex(RuntimeError,'mint new id'):
                    generate(row,read_json(ART/'style.json'),Budget())
                spend.assert_not_called()

    def test_restart_manifest_has_five_cars_five_tiles_and_safe_revisions(self):
        rows=briefs(ART/'briefs/p1-current.csv')
        self.assertEqual(len(rows),10)
        self.assertEqual(sum(r['kind']=='car' for r in rows),5)
        self.assertEqual(sum(r['kind']=='tile' for r in rows),5)
        originals={r['id'] for r in briefs(ART/'briefs/p1.csv')}
        self.assertEqual(len({r['id'] for r in rows}-originals),4)

if __name__=='__main__': unittest.main()
