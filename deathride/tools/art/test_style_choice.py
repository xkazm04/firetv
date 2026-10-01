import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from common import ART, briefs, compile_prompt, style_for, write_json, sha
from gen import Budget, generate
from style_choice import require_choice

class StyleChoiceContracts(unittest.TestCase):
    def test_five_identical_seven_subject_sets_and_style_only_prompt_change(self):
        rows=briefs(ART/'briefs/v1-directions.csv')
        self.assertEqual(len(rows),35)
        for role in {r['proof_role'] for r in rows}:
            group=[r for r in rows if r['proof_role']==role]
            self.assertEqual(len(group),5)
            self.assertEqual(len({r['prompt_action'] for r in group}),1)
            suffixes=[]
            for row in group:
                style=style_for(row);prompt=compile_prompt(row,style)
                self.assertTrue(prompt.startswith(style['style_block']))
                suffixes.append(prompt[len(style['style_block']):])
            self.assertEqual(len(set(suffixes)),1)
        self.assertEqual(len({style_for(r)['style_block'] for r in rows}),5)

    def test_missing_or_forged_choice_never_spends(self):
        row={'id':'v2-reference-heavy-v1','wave':'V2','style_file':'style-test.json'}
        with tempfile.TemporaryDirectory() as d:
            art=Path(d)
            with patch('gen.reference_gate',side_effect=lambda r:require_choice(r,art)),patch.object(Budget,'reserve') as reserve:
                with self.assertRaisesRegex(ValueError,'OWNER_CHOICE_REQUIRED'):generate(row,{},Budget())
                (art/'OWNER-CHOICE.md').write_text('please choose a style')
                with self.assertRaisesRegex(ValueError,'OWNER_CHOICE_REQUIRED'):generate(row,{},Budget())
                reserve.assert_not_called()

    def test_choice_hash_and_world_stack_are_consumed(self):
        with tempfile.TemporaryDirectory() as d:
            art=Path(d);s=art/'style-test.json';write_json(s,{'name':'test'})
            row={'id':'v4-world-v1','wave':'V4','style_file':s.name,'surface_stack':'edge-decals'}
            text=f'owner_choice: approved\nowner_evidence: test fixture only\nstyle_file: {s.name}\nstyle_sha256: {sha(s)}\n'
            (art/'OWNER-CHOICE.md').write_text(text)
            with self.assertRaisesRegex(ValueError,'OWNER_SURFACE_STACK_REQUIRED'):require_choice(row,art)
            (art/'OWNER-CHOICE.md').write_text(text+'surface_stack: edge-decals\n')
            self.assertEqual(require_choice(row,art)['surface_stack'],'edge-decals')
            write_json(s,{'name':'changed'})
            with self.assertRaisesRegex(ValueError,'OWNER_CHOICE_REQUIRED'):require_choice(row,art)

if __name__=='__main__': unittest.main()
