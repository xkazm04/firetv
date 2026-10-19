"""Mount pilot ledger contracts with the fake agy transport (fake_agy.py); never an image provider."""
import json, os, subprocess, sys, tempfile, unittest
from pathlib import Path
from unittest.mock import patch
from PIL import Image
from common import write_json
import agy_provider as agy

class Pilot(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory(); self.addCleanup(tmp.cleanup); self.art = Path(tmp.name)
        env = dict(asset_prefixes=['mount-'], max_new_images=2, started_at='2026-01-01T00:00:00+00:00')
        write_json(self.art/'budget.json', dict(max_attempts_per_asset=3,
                   providers=dict(agy=dict(model=agy.MODEL, run_id='t', run_image_cap=50, envelopes={'mount-pilot': env}))))
        self.ref = self.art/'ref.png'; Image.new('RGB', (64, 64), 'magenta').save(self.ref)
        self.style = dict(style_block='Original art.', negative='No text.')
        self.budget = agy.AgyBudget(self.art)

    def row(self, i):
        return dict(id=f'mount-rivet-x{i}-v1', prompt_action='Rivet.', size='1024x1024', kind='sprite', background_key='#FF00FF',
                    style_references=[str(self.ref)])

    def run_fake(self, row, mode='success'):
        real = subprocess.Popen
        def launch(args, **kw): return real([sys.executable, str(Path(__file__).with_name('fake_agy.py'))]+args[1:], **kw)
        with patch.dict(os.environ, {'AGY': sys.executable, 'FAKE_AGY_MODE': mode}), patch.object(agy.subprocess, 'Popen', side_effect=launch):
            return agy.generate(row, self.style, self.budget)

    def history(self):
        p = self.art/'history.jsonl'
        return [json.loads(l) for l in p.read_text(encoding='utf-8').splitlines()] if p.exists() else []

    def test_envelope_cap_blocks_third_image(self):
        self.assertEqual(self.run_fake(self.row(1))['status'], 'generated')
        self.assertEqual(self.run_fake(self.row(2))['status'], 'generated')
        r = self.run_fake(self.row(3))
        self.assertEqual(r['status'], 'spend-blocked'); self.assertIn('AGY_ENVELOPE_CAP', r['error'])
        self.assertEqual(self.budget.summary()['images_reserved'], 2)

    def test_prefix_outside_envelope_not_counted(self):
        self.budget.reserve('other-v1', 1); self.budget.record(dict(event='result', asset='other-v1', attempt=1))
        self.assertEqual(self.run_fake(self.row(1))['status'], 'generated')

    def test_first_error_latches_and_nothing_retries(self):
        r = self.run_fake(self.row(1), 'quota')
        self.assertEqual(r['status'], 'generation-error'); self.assertTrue(self.budget.summary()['stop'])
        r2 = self.run_fake(self.row(2))
        self.assertEqual(r2['status'], 'spend-blocked')
        self.assertEqual(sum(e.get('event') == 'reserved' for e in self.history()), 1)

    def test_attempt_ceiling_per_asset(self):
        for i in range(3):
            self.budget.reserve('free-rivet-z-v1', i+1); self.budget.record(dict(event='result', asset='free-rivet-z-v1', attempt=i+1))
        with self.assertRaisesRegex(RuntimeError, 'ASSET_ATTEMPT_CAP'): self.budget.reserve('free-rivet-z-v2', 4)

    def test_clear_stop_logs_and_keeps_count_and_caps(self):
        self.run_fake(self.row(1), 'quota')
        with self.assertRaises(ValueError): self.budget.clear_stop('', 'x')
        cap = self.budget.config['run_image_cap']
        cleared = self.budget.clear_stop("owner said so", "failure record text")
        self.assertTrue(cleared); self.assertIsNone(self.budget.summary()['stop'])
        self.assertEqual(self.budget.summary()['images_reserved'], 1); self.assertEqual(self.budget.config['run_image_cap'], cap)
        ev = [e for e in self.history() if e['event'] == 'spend-stop-cleared'][0]
        self.assertEqual(ev['owner_message'], 'owner said so'); self.assertFalse(ev['caps_changed'])
        # the failed reservation is finished, so the next image may be reserved
        self.assertEqual(self.run_fake(self.row(2))['status'], 'generated')

    def test_history_has_full_prompt_hashes_and_model_and_no_secrets(self):
        os.environ['GEMINI_API_KEY'] = 'sk-test-secret-123'
        self.addCleanup(os.environ.pop, 'GEMINI_API_KEY')
        r = self.run_fake(self.row(1))
        res = [e for e in self.history() if e['event'] == 'result'][0]
        self.assertIn('Rivet.', res['prompt']); self.assertEqual(res['model'], agy.MODEL)
        self.assertEqual(res['origin'], 'agy-cli'); self.assertEqual(len(res['sha256']), 64); self.assertEqual(len(res['input_hash']), 64)
        self.assertNotIn('sk-test-secret', (self.art/'history.jsonl').read_text())

if __name__ == '__main__': unittest.main()
