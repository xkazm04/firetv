import copy
import unittest
from face_visibility import geometry, gate, valid, FACE_MODELS, source_geometry

class FaceVisibility(unittest.TestCase):
    def sample(self):
        return dict(face_box=[260,180,740,700],eye_centres=[390,350,610,350],framing='head_shoulders',
          both_eyes_visible=True,expression_readable_native=True,face_unobscured=True,
          single_primary_face=True,confidence=.75,defects=[],description='Synthetic geometric fixture, not owner evidence.')
    def test_boundary_and_known_body_first_framing(self):
        a=self.sample();self.assertTrue(geometry(a)['passed'])
        a['face_box']=[300,250,650,420];a['eye_centres']=[400,300,550,300]
        a['framing']='waist_up'
        self.assertIn('FACE_TOO_SMALL',geometry(a)['defects'])
        self.assertIn('BODY_DOMINATES_FRAME',geometry(a)['defects'])
        a=self.sample();a['face_box'][3]=580
        self.assertTrue(geometry(a)['passed'])
        a['face_box'][3]=579
        self.assertIn('FACE_TOO_SMALL',geometry(a)['defects'])
    def test_hidden_eyes_expression_subject_and_defect_list_fail_closed(self):
        for field in ('both_eyes_visible','expression_readable_native','face_unobscured','single_primary_face'):
            a=self.sample();a[field]=False;self.assertFalse(geometry(a)['passed'],field)
        a=self.sample();a['defects']=['Left eye is behind the scarf'];self.assertFalse(geometry(a)['passed'])
        a=self.sample();a['eye_centres']=[450,350,490,350]
        self.assertIn('EYES_TOO_CLOSE_AT_NATIVE_SIZE',geometry(a)['defects'])
    def test_export_gutters_cannot_conceal_source_clipping(self):
        a=self.sample()
        self.assertTrue(source_geometry(a,[1024,1024],[128,128],[4,4],[120,120],[0,0,1024,1024])['passed'])
        a['face_box']=[40,40,740,700]
        self.assertTrue(geometry(a)['passed'])
        self.assertIn('SOURCE_FACE_CLIPPED',source_geometry(a,[1024,1024],[128,128],[4,4],[120,120],[0,0,1024,1024])['defects'])
        # A source with huge outer margins cannot gain a passing face merely by trimming them.
        a=self.sample()
        self.assertIn('SOURCE_FACE_TOO_SMALL',source_geometry(a,[1024,1024],[128,128],[4,4],[120,120],[300,300,724,724])['defects'])
    def test_invalid_boxes_uncertainty_and_stale_observations_reject(self):
        for box in ([0,0,0,0],[0,0,1000,1000],[260,700,740,180],[float('nan'),0,500,500]):
            a=self.sample();a['face_box']=box;self.assertFalse(geometry(a)['passed'])
        a=self.sample();a['confidence']=.5;self.assertFalse(geometry(a)['passed'])
        observations=[dict(model=m,status='graded',source_sha256='source',export_sha256='export',answers=self.sample()) for m in FACE_MODELS]
        self.assertTrue(gate(observations,'source','export')['passed'])
        self.assertFalse(gate(observations,'changed','export')['passed'])
        self.assertFalse(gate([],'source','export')['passed'])
        observations[0]['answers']['face_box']=[300,300,650,550]
        self.assertFalse(gate(observations,'source','export')['passed'])

if __name__=='__main__':unittest.main()
