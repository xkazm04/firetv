"""Audit full fixed-step reports and optionally fit the transparent PR weights.

The optional calibration requires numpy/scipy; verification uses the standard library.
Reports measure movement only. They cannot certify combat balance or owner feel.
"""
import argparse
import csv
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
data = root / "core/src/main/resources/data"
parser = argparse.ArgumentParser()
parser.add_argument("--calibrate", action="store_true")
args = parser.parse_args()


def rows(path):
    with path.open(encoding="utf-8") as source:
        return list(csv.DictReader(source))


rules = {r["key"]: float(r["value"]) for r in rows(data / "roster-rules.csv")}
samples = int(rules["racesPerScenario"])
reports = root / f"core/build/reports/roster/{samples}"
cars = rows(data / "cars.csv")
tiers = rows(data / "roster-tiers.csv")
course_weights = {r["id"]: float(r["mixedWeight"]) for r in rows(data / "roster-courses.csv")}
assert abs(sum(course_weights.values()) - 1) < 1e-9
all_rows = []
for tier in tiers:
    report = rows(reports / f"summary-{tier['id']}.csv")
    assert len(report) == 8, (tier, "missing scenario/class")
    assert all(int(r["races"]) == samples and int(r["entries"]) == samples * 3 for r in report)
    assert all(int(r["uniqueHashes"]) == samples and int(r["unresolved"]) == 0 for r in report)
    assert (reports / f"findings-{tier['id']}.txt").read_text().strip() == "All measured roster gates passed"
    pair = [c["id"] for c in cars if c["tier"] == tier["id"]]
    for scenario, course in {(r["scenario"], r["course"]) for r in report}:
        raw = rows(reports / f"{tier['id']}-{scenario}-{course}.csv")
        assert len(raw) == samples and len({r["hash"] for r in raw}) == samples
        assert all(int(r["unresolved"]) == 0 for r in raw)
        for index, name in enumerate(pair):
            measured = next(r for r in report if r["scenario"] == scenario and r["course"] == course and r["class"] == name)
            assert int(measured["wins"]) == sum(r["winner"] == name for r in raw)
            mean = sum(float(r[f"class{index}MeanSeconds"]) for r in raw) / samples
            assert abs(mean - float(measured["meanFinishSeconds"])) < 1e-8
    for name in {r["class"] for r in report}:
        equal = next(r for r in report if r["class"] == name and r["course"] == "technical" and r["scenario"] == "equal")
        skill = next(r for r in report if r["class"] == name and r["scenario"] == "skill")
        # Only the agile member changes skill. Record both, require the intended driver's improvement below.
        skill["skillImprovementSeconds"] = float(equal["meanFinishSeconds"]) - float(skill["meanFinishSeconds"])
    assert max(float(r.get("skillImprovementSeconds", 0)) for r in report) >= rules["minimumSkillMarginSeconds"]
    for name in {r["class"] for r in report}:
        win_share = sum(course_weights[r["course"]] * int(r["wins"]) / samples for r in report if r["class"] == name and r["scenario"] == "equal")
        assert win_share <= rules["maxWinShare"], (name, "mixed race-winner share", win_share)
    all_rows.extend(report)

stat_names = ["speed", "acceleration", "grip", "armor", "mass", "handling", "slots", "braking"]
stats = {c["id"]: rows(data / "cars" / f"{c['id']}.csv")[0] for c in cars}
times = {c["id"]: sum(course_weights[r["course"]] * float(r["meanFinishSeconds"]) for r in all_rows if r["class"] == c["id"] and r["scenario"] == "equal") for c in cars}
budgets = {t["id"]: float(t["prBudget"]) for t in tiers}
weights = rows(data / "pr-weights.csv")
mapping = {r["parameter"]: r["stat"] for r in rows(data / "stat-mapping.csv")}
fit = json.loads((reports / "calibration.json").read_text()) if (reports / "calibration.json").exists() else None
if args.calibrate:
    import numpy as np
    from scipy.optimize import minimize

    matrix = np.array([[float(stats[c["id"]][s]) for s in stat_names] for c in cars])
    budget = np.array([budgets[c["tier"]] for c in cars])
    target = np.array([budgets[c["tier"]] * (sum(times[x["id"]] for x in cars if x["tier"] == c["tier"]) / 2) / times[c["id"]] for c in cars])
    initial = np.array([sum(float(w["weight"]) for w in weights if mapping[w["parameter"]] == s) for s in stat_names])
    tolerance = rules["prTolerance"]
    result = minimize(lambda w: float(np.sum(((matrix @ w - target) / budget) ** 2)), initial,
                      method="SLSQP", bounds=[(0.1, 100)] * len(stat_names),
                      constraints=[{"type": "ineq", "fun": lambda w: matrix @ w - budget * (1 - tolerance)},
                                   {"type": "ineq", "fun": lambda w: budget * (1 + tolerance) - matrix @ w}],
                      options={"ftol": 1e-14, "maxiter": 10000})
    assert result.success, result.message
    # Leave rounding headroom at the exact budget boundary.
    fitted = result.x * .9999 + initial * .0001
    fit = {"basis": "equal Rookie skills; weighted mean three-lap seconds over technical/long-straight/gravel fixtures (roster-courses.csv); inverse time target; constrained to authored tier PR budget", "objective": float(result.fun)}
    (reports / "calibration.json").write_text(json.dumps(fit, indent=2) + "\n", encoding="utf-8")
    for w in weights:
        stat = mapping[w["parameter"]]
        consumers = sum(mapping[x["parameter"]] == stat for x in weights)
        w["weight"] = f"{fitted[stat_names.index(stat)] / consumers:.9f}"
    with (data / "pr-weights.csv").open("w", newline="", encoding="utf-8") as out:
        writer = csv.DictWriter(out, fieldnames=weights[0]); writer.writeheader(); writer.writerows(weights)

audit = []
for car in cars:
    rating = sum(float(stats[car["id"]][mapping[w["parameter"]]]) * float(w["weight"]) for w in weights)
    peer_mean = sum(times[c["id"]] for c in cars if c["tier"] == car["tier"]) / 2
    audit.append({"car": car["id"], "tier": car["tier"], "powerRating": rating,
                  "budget": budgets[car["tier"]], "mixedMeanSeconds": times[car["id"]],
                  "mixedRaceWinShare": sum(course_weights[r["course"]] * int(r["wins"]) / samples for r in all_rows if r["class"] == car["id"] and r["scenario"] == "equal"),
                  "inverseTimeRatioToTier": peer_mean / times[car["id"]],
                  "ratingRatioToTier": rating / budgets[car["tier"]]})
    assert abs(rating / budgets[car["tier"]] - 1) <= rules["prTolerance"]
output = {"races": samples * 4 * len(tiers), "entriesPerRace": 6,
          "basis": "five tiers; three equal-skill course types and one Champion-agile/Rookie-fast technical scenario per tier",
          "courseWeights": course_weights, "calibration": fit, "cars": audit,
          "limitations": ["Not combat strength; C3 owns encounter evidence", "Synthetic long-straight fixture exceeds the playable 180-second host ceiling", "PR is an approximation; residuals are reported rather than hidden", "Owner feel not measured"]}
(reports / "audit.json").write_text(json.dumps(output, indent=2) + "\n", encoding="utf-8")
print(json.dumps(output, indent=2))
