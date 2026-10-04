import unittest
from campaign_metrics import dominant,repeated,complete_cross,paired_seed_cross,all_fight_share,opening_loss

class CampaignMetricsTest(unittest.TestCase):
    def test_winner_denominators_and_reachable_dominance(self):
        self.assertEqual(all_fight_share(20,100),.2)
        self.assertTrue(dominant(90,10,.85))
        self.assertTrue(dominant(10,90,.85))
        self.assertFalse(dominant(85,15,.85))
        self.assertIsNone(dominant(0,0,.85))
        self.assertIsNone(all_fight_share(0,0))

    def test_rotation_imbalance_and_missing_cell_fail(self):
        rows=[dict(skill=s,rotation=r) for s in range(3) for r in range(2) for _ in range(4)]
        self.assertTrue(complete_cross(rows,3,2,4))
        self.assertFalse(complete_cross(rows[:-1],3,2,4))
        rows[-1]=dict(skill=0,rotation=0)
        self.assertFalse(complete_cross(rows,3,2,4))

    def test_constant_hashes_duplicate_seeds_and_threshold_boundary(self):
        self.assertTrue(repeated([42]*100,.99))
        self.assertTrue(repeated(list(range(98))+[0,0],.99))
        self.assertFalse(repeated(list(range(99))+[0],.99))
        self.assertFalse(repeated(list(range(100)),.99))
        self.assertTrue(repeated([],.99))

    def test_counts_alone_cannot_prove_a_paired_rotation_control(self):
        rows=[dict(skill=s,rotation=r,seed=n) for s in range(3) for r in range(2) for n in range(4)]
        self.assertTrue(paired_seed_cross(rows,3,2,4))
        rows[-1]['seed']=99
        self.assertTrue(complete_cross(rows,3,2,4))
        self.assertFalse(paired_seed_cross(rows,3,2,4))
        rows[-1]['seed']=0
        self.assertFalse(paired_seed_cross(rows,3,2,4))

    def test_early_loss_bound_fires_and_no_samples_is_not_pass(self):
        self.assertTrue(opening_loss(5,100,.05))
        self.assertFalse(opening_loss(4,100,.05))
        self.assertTrue(opening_loss(0,0,.05))

if __name__=='__main__': unittest.main()
