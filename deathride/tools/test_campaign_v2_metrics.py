import unittest
from campaign_v2_metrics import roster_review, difficulty_cross, homogeneous_review


class CampaignV2MetricsTest(unittest.TestCase):
    weights = {'technical': .25, 'straight': .5, 'loose': .25}

    def rows(self):
        return [dict(tier=str(t), course=c, build=b, rotation=str(r), seed=str(n), hash=f'{t}-{c}-{b}-{r}-{n}',
            winner='A' if n % 2 else 'B', unresolved='0', cars=';'.join('A:10' if (slot+r)%6<3 else 'B:11' for slot in range(6)))
            for t in range(5) for c in self.weights for b in ['stock', 'developed'] for r in range(6) for n in range(4)]

    def test_the_actual_class_gate_can_fire_at_one_hundred_percent_not_entry_share(self):
        rows = self.rows()
        good = roster_review(rows, self.weights, 4)
        self.assertTrue(good['completeCross'] and good['actualClassSlotCross'] and good['seedDiversity'] and good['pairedRotations'])
        self.assertTrue(all(t['dominancePass'] for t in good['tiers']))
        for row in rows: row['winner'] = 'A'
        bad = roster_review(rows, self.weights, 4)
        self.assertTrue(all(t['mixedWinnerShare']['A'] == 1 for t in bad['tiers']))
        self.assertTrue(all(not t['dominancePass'] for t in bad['tiers']))
        self.assertTrue(all(not t['bestAndWorstPass'] for t in bad['tiers']), 'A class with no weakest course is detected')

    def test_missing_rotation_constant_outcomes_and_unpaired_blocks_cannot_pass(self):
        rows = self.rows()
        self.assertFalse(roster_review(rows[:-1], self.weights, 4)['completeCross'])
        rows[-1]['seed'] = '99'
        self.assertFalse(roster_review(rows, self.weights, 4)['pairedRotations'])
        for row in rows: row['hash'] = 'constant'
        self.assertFalse(roster_review(rows, self.weights, 4)['seedDiversity'])
        self.assertFalse(roster_review([], self.weights, 4)['allResolved'])
        rows = self.rows();rows[0]['unresolved'] = '1'
        bad = roster_review(rows, self.weights, 4)
        self.assertFalse(bad['allResolved']);self.assertFalse(bad['tiers'][0]['dominancePass'])

    def test_aliased_class_course_rotation_schedule_fails_before_a_rate_is_published(self):
        rows = self.rows()
        for i, row in enumerate(rows): row['rotation'] = str(i % 3)
        self.assertFalse(roster_review(rows, self.weights, 4)['completeCross'])
        rows = self.rows()
        for row in rows: row['cars'] = 'A:10;A:10;A:10;B:11;B:11;B:11'
        self.assertTrue(roster_review(rows, self.weights, 4)['completeCross'])
        self.assertFalse(roster_review(rows, self.weights, 4)['actualClassSlotCross'])

    def test_real_difficulty_cross_requires_every_factor_and_nonconstant_states(self):
        rows = [dict(event=str(e), lead=str(l), difficulty=str(d), car=c, rotation=str(r), seed=str(n), hash=str(n))
            for e in [7, 14, 21, 28] for l in range(3) for d in range(3) for c in ['A', 'B'] for r in range(2) for n in range(4)]
        peers = {e: ['A', 'B'] for e in [7, 14, 21, 28]}
        self.assertTrue(difficulty_cross(rows, 4, peers))
        self.assertFalse(difficulty_cross(rows[:-1], 4, peers))
        rows[-1]['seed'] = '99'
        self.assertFalse(difficulty_cross(rows, 4, peers))
        rows[-1]['seed'] = '3'
        rows[-1]['car'] = 'missing-peer'
        self.assertFalse(difficulty_cross(rows, 4, peers))
        rows[-1]['car'] = 'B'
        for row in rows: row['difficulty'] = row['lead']
        self.assertFalse(difficulty_cross(rows, 4, peers))

    def test_homogeneous_rotation_cross_check_rejects_reversed_class_order(self):
        rows=self.rows()
        review=roster_review(rows,self.weights,4)
        control=[dict(build=c,course=course,seed=str(n),hash=str(n),unresolved='0',cars=';'.join([c+':'+str(time)]*6))
            for c,time in [('A',10),('B',11)] for course in self.weights for n in range(4)]
        good=homogeneous_review(control,review,4)
        self.assertTrue(good['completeCross'] and good['seedDiversity'] and good['pairedPeerSeeds'] and good['orderPass'])
        control[0]['cars']=';'.join(['A:1000']*6)
        self.assertFalse(homogeneous_review(control,review,4)['orderPass'])
        control[-1]['seed']='99'
        self.assertFalse(homogeneous_review(control,review,4)['pairedPeerSeeds'])

    def test_roster_requires_the_actual_legal_peer_identities(self):
        rows=self.rows();peers={t:['A','B'] for t in range(5)}
        self.assertTrue(roster_review(rows,self.weights,4,peers=peers)['actualClassSlotCross'])
        peers[0]=['A','C']
        review=roster_review(rows,self.weights,4,peers=peers)
        self.assertFalse(review['actualClassSlotCross'])
        self.assertFalse(review['tiers'][0]['dominancePass'])


if __name__ == '__main__': unittest.main()
