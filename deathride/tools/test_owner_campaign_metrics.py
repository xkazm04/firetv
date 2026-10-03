import unittest
from owner_campaign_metrics import instrument_cases


class OwnerCampaignMetricsTest(unittest.TestCase):
    def test_report_gates_reject_injected_promotion_censor_and_band_defects(self):
        cases = instrument_cases()
        self.assertEqual(len(cases), 6)
        self.assertTrue(all(r['result'] == r['expected'] for r in cases))


if __name__ == '__main__':
    unittest.main()
