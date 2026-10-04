import unittest
from obstacle_metrics import *

class MetricsTest(unittest.TestCase):
    def test_reachable_winner_share_and_paired_regression(self):
        self.assertEqual(1,share(100,100)) # all winners; six entrants cannot divide this by six
        self.assertEqual(.5,share(50,100))
        self.assertIsNone(share(0,0))
        self.assertTrue(changed_share(50,100,100,.05))
        self.assertFalse(changed_share(50,50,100,.05))
    def test_repeated_seed_alarm(self):
        self.assertTrue(repeated([1]*100,.99))
        self.assertFalse(repeated(list(range(100)),.99))
        self.assertTrue(repeated([],.99))
    def test_rotation_confounds_and_missing_cells_fail(self):
        expected={(c,t,r) for c in range(25) for t in range(5) for r in range(6)}
        good={k:list(range(4)) for k in expected}
        self.assertTrue(crossed(good,expected))
        bad={(i%25,i%5,i%6):[i] for i in range(3000)}
        self.assertFalse(crossed(bad,expected))
        good.pop((0,0,0));self.assertFalse(crossed(good,expected))
    def test_early_wreck_and_watchdog_failures(self):
        self.assertTrue(early(5,100,.05));self.assertFalse(early(0,100,.05))
        self.assertTrue(unresolved(1));self.assertFalse(unresolved(0))

if __name__=='__main__':unittest.main()
