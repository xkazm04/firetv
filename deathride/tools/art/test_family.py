import tempfile
import unittest
from pathlib import Path
from common import ART,briefs,read_json,write_json,sha
from family import check_scale_contract
from gen import reference_gate

class FamilyContracts(unittest.TestCase):
    def test_c1_dimensions_and_full_derived_coverage(self):
        shapes=check_scale_contract()
        refs=briefs(ART/'briefs/p3-references.csv');derived=briefs(ART/'briefs/p3-derived.csv')
        self.assertEqual(len(shapes),10)
        self.assertEqual({r['class'] for r in refs},set(shapes))
        self.assertEqual(len(derived),70)
        for cls in shapes:
            rows=[r for r in derived if r['class']==cls]
            self.assertEqual(len(rows),7)
            self.assertTrue(all(r['status']=='blocked-owner-reference' and r['requires_approval'] for r in rows))

    def test_approval_binds_owner_evidence_to_exact_reference_bytes(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);ref=root/'reference.png';ref.write_bytes(b'reference one')
            row={'requires_approval':'car-reference','reference':str(ref)}
            with self.assertRaisesRegex(ValueError,'OWNER_REFERENCE'):reference_gate(row,root)
            record={'owner_approved':False,'owner_evidence':None,'source_sha256':sha(ref)}
            def save():write_json(root/'reference-approvals.json',{'references':{'car-reference':record}})
            save()
            with self.assertRaises(ValueError):reference_gate(row,root)
            record.update(owner_approved=True,owner_evidence='explicit owner review of reference one');save()
            reference_gate(row,root)
            ref.write_bytes(b'replacement image')
            with self.assertRaises(ValueError):reference_gate(row,root)

    def test_heading_memory_matches_declared_page_dimensions(self):
        data=read_json(ART/'device/headings-memory.json')
        reps=data['representations']
        self.assertEqual(reps['1']['rgba_bytes'],data['cell_px']**2*4)
        for n in (16,32):
            self.assertEqual(reps[str(n)]['rgba_bytes'],len(reps[str(n)]['pages'])*1024**2*4)
            self.assertEqual(reps[str(n)]['max_heading_error_degrees'],180/n)

if __name__=='__main__':unittest.main()
