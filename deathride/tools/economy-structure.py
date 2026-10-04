"""Unit rates only. Run before W5 coefficients; not a tuned-economy verdict."""
import csv
from pathlib import Path

rows = []
for bounded in (False, True):
    cash = power = purchases = repairs = 0
    for step in range(1, 81):
        participation = 1
        finish = 1 + power  # one-race reinforcing performance/reward path
        wreck = 1
        cash += participation + finish + wreck
        cash -= 1
        repairs += 1
        if cash >= 1 and (not bounded or power < 1):
            cash -= 1
            power += 1
            purchases += 1
        if bounded:
            cash = min(1, cash)
        inflow = participation + finish + wreck
        rows.append(("finite_tiers_and_wallet" if bounded else "uncapped_loop", step, cash, power, purchases, repairs,
                     participation, finish, wreck, finish / inflow, finish / inflow > .5))
    assert repairs == 80 and purchases > 0
    if bounded:
        assert cash == power == 1 and purchases == 1
    else:
        assert cash > 80 and power == 80
out = Path('evidence/phase1/w5-structure.csv')
out.parent.mkdir(parents=True, exist_ok=True)
with out.open('w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(('model', 'step', 'cashUnits', 'powerUnits', 'purchases', 'repairs',
                     'participationInflow', 'finishInflow', 'wreckInflow', 'finishShare', 'dominantFaucetOverHalf'))
    writer.writerows(rows)
print('80 deterministic unit-rate steps/model: uncapped loop diverges; finite tiers/wallet saturate; both drains fired. Not a balance verdict.')
