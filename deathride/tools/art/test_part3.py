import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from common import ART, ROOT, read_json, briefs, sha, compile_prompt, style_for, digest, write_json
from gen import reference_gate
from grade import ask, prompt_for, SCHEMA
from PIL import Image
import numpy as np
from part3_register import translate

class Part3Contracts(unittest.TestCase):
    def test_six_approved_exact_sources_and_four_pending(self):
        approved={'line','bastion','trail','flint','vandal','bulwark'}
        ledger=read_json(ART/'reference-approvals.json')['references']
        for key,entry in read_json(ART/'V2-REFERENCE-APPROVAL.template.json')['references'].items():
            actual=ledger[key]
            self.assertEqual(actual['source_sha256'],entry['source_sha256'])
            self.assertEqual(sha(ROOT/entry['candidate_source']),entry['source_sha256'])
            self.assertEqual(actual['owner_approved'],key.split('-')[-2] in approved)
            if actual['owner_approved']:self.assertIn('Approved the art direction, looks very solid. For cars.',actual['owner_evidence'])

    def test_derived_coverage_and_identical_control_prompt(self):
        rows=briefs(ART/'briefs/v2-part3-derived.csv');self.assertEqual(len(rows),42)
        self.assertEqual({r['class'] for r in rows},{'Line','Bastion','Trail','Flint','Vandal','Bulwark'})
        for row in rows:reference_gate(row)
        for cls in {r['class'] for r in rows}:
            self.assertEqual(sum(r['class']==cls and '-state-' in r['id'] for r in rows),4)
            self.assertEqual(sum(r['class']==cls and '-livery-' in r['id'] for r in rows),3)
        anchor=next(r for r in rows if r['id']=='v2-part3-line-livery-bone-v1')
        control=briefs(ART/'briefs/v2-part3-control.csv')[0]
        self.assertEqual(compile_prompt(anchor,style_for(anchor)),compile_prompt(control,style_for(control)))
        self.assertFalse(control['reference']);self.assertTrue(anchor['requires_approval'])

    def test_cached_observation_follows_report_alias_without_paid_or_local_call(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);source=root/'source.png';Image.new('RGB',(20,20),'red').save(source)
            item={'id':'current-attempt-alias','source':str(source),'class':'Line','brief':{'kind':'car','prompt_action':'car'}}
            key=digest({'images':[sha(source)],'model':'local','model_digest':'digest','prompt':prompt_for(item),'schema':SCHEMA})
            write_json(root/'grades/local'/(key+'.json'),{'asset':'previous-alias','status':'graded','image_hashes':[sha(source)]})
            with patch('grade.ART',root),patch('grade.post') as post:
                result=ask(item,'local','digest')
                post.assert_not_called()
            self.assertEqual(result['asset'],item['id']);self.assertEqual(result['cached_asset'],'previous-alias')

    def test_half_pixel_registration_preserves_transparency_and_colour(self):
        image=Image.new('RGBA',(32,32),(255,0,255,0))
        image.paste((210,190,140,255),(8,8,24,24))
        out=translate(image,[32,32],[0,.5]);a=np.asarray(out)
        self.assertFalse(a[0,:,3].any());self.assertFalse(a[-1,:,3].any())
        self.assertTrue(np.all(a[a[:,:,3]>0,:3]==[210,190,140]))
        self.assertEqual(image.getpixel((0,0)),(255,0,255,0))
        y,x=np.indices((32,32));mass=a[:,:,3].astype(float)
        self.assertAlmostEqual(float((mass*y).sum()/mass.sum()),16.0,places=2)

if __name__=='__main__':unittest.main()
