import copy
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
from PIL import Image
from common import write_json, read_json
import agy_provider as agy

class AgyContracts(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.addCleanup(self.tmp.cleanup)
        self.art=Path(self.tmp.name)
        write_json(self.art/'budget.json',dict(max_attempts_per_asset=3,providers=dict(agy=dict(model=agy.MODEL,run_id='test',run_image_cap=2))))
        write_json(self.art/'usage.json',dict(stop={'reason':'402 balance exhausted'},weeks={}))
        self.before=(self.art/'usage.json').read_bytes()
        self.row=dict(id='test-v1',prompt_action='Original worn axle cradle.',size='1024x1024',kind='sprite',background_key='#FF00FF')
        self.style=dict(style_block='Original drawn art.',negative='No text.')
        self.budget=agy.AgyBudget(self.art)

    def run_fake(self,mode='success',row=None):
        real=subprocess.Popen
        def launch(args,**kwargs):return real([sys.executable,str(Path(__file__).with_name('fake_agy.py'))]+args[1:],**kwargs)
        with patch.dict(os.environ,{'AGY':sys.executable,'FAKE_AGY_MODE':mode}),patch.object(agy.subprocess,'Popen',side_effect=launch):
            return agy.generate(row or self.row,self.style,self.budget)

    def test_success_continues_same_session_and_resume_does_not_spend(self):
        result=self.run_fake();self.assertEqual(result['status'],'generated');self.assertTrue(result['continuation_verified'])
        self.assertEqual(self.run_fake(),result);self.assertEqual(self.budget.summary()['images_reserved'],1)
        self.assertEqual((self.art/'usage.json').read_bytes(),self.before)
        for e in map(json.loads,(self.art/'history.jsonl').read_text().splitlines()):
            self.assertEqual(e['provider'],'agy');self.assertEqual(e['model'],agy.MODEL)

    def test_missing_file_is_failure_despite_success_text_and_never_continues(self):
        result=self.run_fake('empty');self.assertEqual(result['status'],'generation-error')
        self.assertIn('EMPTY_OUTPUT',result['error']);self.assertTrue(self.budget.summary()['stop'])
        self.assertFalse(list((self.art/'raw').glob('**/verify.jsonl')))
        result2=self.run_fake(row=dict(self.row,id='next-v1'))
        self.assertEqual(result2['status'],'spend-blocked');self.assertEqual(self.budget.summary()['images_reserved'],1)

    def test_auth_stops_first_call(self):
        self.assertEqual(self.run_fake('auth')['status'],'generation-error');self.assertTrue(self.budget.summary()['stop'])

    def test_quota_stops_first_call(self):
        self.assertEqual(self.run_fake('quota')['status'],'generation-error');self.assertTrue(self.budget.summary()['stop'])

    def test_invalid_file_stops(self):
        self.assertEqual(self.run_fake('invalid')['status'],'generation-error');self.assertTrue(self.budget.summary()['stop'])

    def test_cap_and_source_validation_before_spend(self):
        self.budget.reserve('a-v1',1);self.budget.record(dict(event='result',asset='a-v1',attempt=1))
        self.budget.reserve('b-v1',1);self.budget.record(dict(event='result',asset='b-v1',attempt=1))
        with self.assertRaisesRegex(RuntimeError,'AGY_RUN_CAP'):self.budget.reserve('c-v1',1)
        low=self.art/'low.png';Image.new('RGB',(64,64)).save(low)
        with self.assertRaisesRegex(ValueError,'Full-resolution'):self.run_fake(row=dict(self.row,reference=str(low)))
        with self.assertRaisesRegex(ValueError,'14 total'):self.run_fake(row=dict(self.row,style_references=[str(low)]*15))

    def test_edit_full_resolution_and_hashes(self):
        source=self.art/'source.png';Image.new('RGB',(1024,1024)).save(source)
        result=self.run_fake(row=dict(self.row,reference=str(source),style_references=[str(source)]))
        self.assertEqual(result['mode'],'edit');self.assertEqual(len(result['references']),2)

    def test_changed_brief_rejected_and_failed_resume_never_retries(self):
        result=self.run_fake('empty');self.assertEqual(self.run_fake(),result)
        with self.assertRaisesRegex(ValueError,'Immutable'):self.run_fake(row=dict(self.row,prompt_action='changed'))

    def test_contextual_detection(self):
        for text in ('HTTP 402 Payment Required','resource exhausted','permission denied','empty output'):
            self.assertTrue(agy.failure_evidence(text))
        self.assertIsNone(agy.failure_evidence('Image dimensions 401 by 429, 402 tokens'))

    def test_interrupted_reservation_blocks_other_jobs(self):
        self.budget.reserve('interrupted-v1',1)
        with self.assertRaisesRegex(RuntimeError,'UNFINISHED'):self.budget.reserve('next-v1',1)

    def test_only_explicit_image_child_and_exact_prompt_are_evidence(self):
        brain=self.art/'brain';parent=brain/'parent/.system_generated/logs/transcript_full.jsonl'
        parent.parent.mkdir(parents=True)
        parent.write_text(json.dumps(dict(type='GENERIC',content='Created the following subagents: {"conversationId":"abc-123"}'))+'\n')
        child=brain/'abc-123/.system_generated/logs/transcript_full.jsonl';child.parent.mkdir(parents=True)
        child.write_text(json.dumps(dict(tool_calls=[dict(name='generate_image',args=dict(Prompt='exact'))]))+'\n')
        e=agy.image_evidence('parent',brain)
        self.assertTrue(agy.verify_prompt(e,'exact'));self.assertFalse(agy.verify_prompt(e,'changed'))
        self.assertEqual(len(e['calls']),1)

if __name__=='__main__':unittest.main()
