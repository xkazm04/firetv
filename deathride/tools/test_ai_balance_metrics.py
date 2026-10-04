import unittest
from ai_balance_metrics import instrument_cases,skill_summary

class AiBalanceMetricsTest(unittest.TestCase):
    def test_planted_claim_damage_seed_rotation_and_early_failures_fire(self):
        self.assertEqual(13,len(instrument_cases()))
    def test_skill_claim_requires_both_swaps_real_finishes_and_full_cross(self):
        rows=[dict(case=f'{kind}-{tier}',swap=str(swap),rotation=str(slot),sample=str(n),seed=str(n),hash=f'{kind}-{tier}-{swap}-{slot}-{n}',
                   lower='Low',upper='High',lowerPR='100',upperPR='120',winner='Low' if swap==0 else 'High',unresolved='0',
                   cars=';'.join(f'Low:{"Champion" if swap==0 else "Rookie"}:{10 if swap==0 else 12}:1' if (i+slot)%6<3 else f'High:{"Rookie" if swap==0 else "Champion"}:{12 if swap==0 else 10}:2' for i in range(6)))
              for kind,count in [('within',5),('cross',4)] for tier in range(count) for swap in range(2) for slot in range(6) for n in range(4)]
        good=skill_summary(rows,4);self.assertTrue(good['completeCross'] and good['pairedSeeds'] and good['seedDiversity'])
        self.assertTrue(all(c['passBoth'] for c in good['cases']))
        self.assertTrue(good['actualClassSlotCross'])
        wrong=[dict(r,rotation='0') for r in rows];self.assertFalse(skill_summary(wrong,4)['actualClassSlotCross'])
        rows[0]['unresolved']='1';self.assertFalse(skill_summary(rows,4)['allResolved'])
        for row in rows:row['cars']=row['cars'].replace(':10:',':12:')
        self.assertFalse(any(c['passBoth'] for c in skill_summary(rows,4)['cases']))
        self.assertFalse(skill_summary(rows[:-1],4)['completeCross'])

if __name__=='__main__':unittest.main()
