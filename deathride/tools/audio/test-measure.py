"""Adversarial signal fixtures for the actual acceptance screens; no provider requests."""
import importlib.util
from pathlib import Path
import unittest
import numpy as np

spec = importlib.util.spec_from_file_location('measure', Path(__file__).with_name('measure-audition.py'))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


class SignalScreens(unittest.TestCase):
    def setUp(self):
        self.rate = 44100
        self.signal = (.1 * np.sin(2 * np.pi * 220 * np.arange(self.rate * 2) / self.rate))[:, None]

    def test_known_periodic_tone_survives_both_joins(self):
        result = m.seam(self.signal, self.rate)
        self.assertEqual(result['status'], 'pass')
        self.assertEqual(len(result['repeatedJoinJumps']), 2)

    def test_discontinuous_channel_cannot_hide_in_stereo_average(self):
        broken = np.repeat(self.signal, 2, axis=1)
        broken[-1, :] = [.5, -.5]
        self.assertEqual(m.seam(broken, self.rate)['status'], 'fail')

    def test_silent_tail_is_a_content_failure_even_without_click(self):
        broken = self.signal.copy()
        broken[-self.rate // 2:] = 0
        result = m.seam(broken, self.rate)
        self.assertEqual(result['status'], 'fail')
        self.assertGreater(result['boundaryRmsStepDb'], 3)

    def test_silence_screen_detects_interior_hole_but_not_zero_crossings(self):
        self.assertEqual(m.silence(self.signal, self.rate)['fraction'], 0)
        broken = self.signal.copy()
        broken[self.rate // 2:self.rate] = 0
        result = m.silence(broken, self.rate)
        self.assertGreaterEqual(result['longestInteriorSeconds'], .5)
        self.assertAlmostEqual(result['fraction'], .25, places=3)


if __name__ == '__main__':
    unittest.main()
