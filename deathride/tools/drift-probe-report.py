"""Summarize rolling Drift probe windows without treating overlapping samples as unique frames."""
import json
import gzip
import sys
from pathlib import Path

source = Path(sys.argv[1])
data = json.loads(gzip.decompress(source.read_bytes()).decode("utf-8-sig") if source.suffix == ".gz" else source.read_text(encoding="utf-8-sig"))
rows = []
for run in data["rounds"]:
    # A rolling ten-second population belongs wholly to this race only after ten seconds.
    windows = [w["stats"] for w in run["windows"] if w["second"] >= 10 and w["stats"]["phase"] == "race"]
    if not windows:
        continue
    def worst(metric, quantile):
        return max(s[metric]["last10s"][quantile] for s in windows)
    final = run.get("final", windows[-1])
    rows.append({"classes": run["classes"], "fullRaceRollingWindows": len(windows),
                 "worstFrameP95Ms": worst("frameTimeMs", "p95"), "worstFrameMaxMs": worst("frameTimeMs", "max"),
                 "worstSimP95Ms": worst("simStepMs", "p95"), "worstSimMaxMs": worst("simStepMs", "max"),
                 "smokeEmitted": final["art"]["driftSmokeEmitted"], "skidsEmitted": final["art"]["driftSkidsEmitted"],
                 "peakActiveEffects": max(s["art"]["activeEffects"] for s in windows),
                 "peakUnresolvedCars": max(s["combatSummary"]["active"] for s in windows),
                 "lastWindowFrame": windows[-1]["frameTimeMs"]["last10s"]})
report = {"source": source.name, "basis": data["basis"], "device": data["device"],
          "sampleCaution": "Overlapping ten-second rolling windows; counts are not summed as independent frames. Startup/course transitions excluded from row maxima but retained in raw evidence and lifetime metrics.",
          "rows": rows,
          "strictFrameTarget": {"p95Ms": 16.7, "maxMs": 33, "passed": bool(rows) and all(r["worstFrameP95Ms"] <= 16.7 and r["worstFrameMaxMs"] <= 33 for r in rows)},
          "lastLifetimeFrame": data["rounds"][-1]["final"]["frameTimeMs"]["sinceStart"] if data["rounds"] and "final" in data["rounds"][-1] else None,
          "clients": data.get("clients", [])}
target = source.with_name(source.name.removesuffix(".gz").removesuffix(".json") + "-summary.json")
target.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
print(json.dumps(report, indent=2))
