"""Require the real shop to reproduce the selected physics surrogate before full acceptance."""
import csv,json,gzip,sys
from pathlib import Path
from campaign_v2_metrics import roster_review
root=Path(__file__).resolve().parents[1]
def rows(tag):return list(csv.DictReader((root/'build/reports/campaign'/tag/'roster.csv').open()))
variant=sys.argv[1] if len(sys.argv)>1 else 'v5'
assert variant in ['v2','v5']
actual_tag='design-v2-legal-cap-pilot'+('-v5' if variant=='v5' else '')
actual=rows(actual_tag)
expected=[r for r in rows('design-v2-line-final-pilot' if variant=='v5' else 'design-v2-cap-line-quarter') if int(r['sample'])<32]+[r for r in rows('design-v2-cap-fractional') if r['tier']!='0']
key=lambda r:tuple(r[k] for k in ['tier','course','build','rotation','sample'])
lookup={key(r):r for r in expected}
changed=[key(r) for r in actual if lookup.get(key(r))!=r]
review=roster_review(actual,{'technical':.25,'straight':.5,'loose':.25},32)
result={'scope':'Actual legal-shop core candidate versus selected surrogate; paired rows are not independent evidence','rows':len(actual),'changedRows':changed,'review':review}
out=root/'evidence/campaign/design-v2/dv2/ceiling-experiments'
(out/('legal-shop-equivalence'+('-v5' if variant=='v5' else '')+'.json')).write_text(json.dumps(result,indent=2)+'\n')
(out/('legal-shop-pilot'+('-v5' if variant=='v5' else '')+'.csv.gz')).write_bytes(gzip.compress((root/'build/reports/campaign'/actual_tag/'roster.csv').read_bytes(),mtime=0))
assert len(actual)==5760 and not changed, 'Legal shop does not reproduce the selected surrogate'
assert review['completeCross'] and review['actualClassSlotCross'] and review['seedDiversity'] and review['pairedRotations'] and review['allResolved']
assert all(t['dominancePass'] and t['bestAndWorstPass'] for t in review['tiers']), 'Actual-shop pilot fails a class gate'
print('All 5760 actual-shop pilot rows reproduce selected surrogate; all class gates pass')
