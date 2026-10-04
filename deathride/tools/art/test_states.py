import unittest
from validate_bundle import validate_coverage


class CarCoverage(unittest.TestCase):
    def test_missing_car_region_cannot_pass_world_bundle_validation(self):
        catalog={'assets':[{'asset_id':'needle-damaged','logical_name':'cars/needle/damaged-1','group':'cars'}],
                 'content_contracts':{'track-themes':[],'rivals':[],'weapons':[],'consumables':[]},
                 'content_landmark_aliases':{},'content_combat_aliases':{'weapons':{},'consumables':{}}}
        with self.assertRaisesRegex(ValueError,'MISSING_CATALOG_REGION'):
            validate_coverage(catalog,set())
        validate_coverage(catalog,{'needle-damaged'})


if __name__=='__main__':unittest.main()
