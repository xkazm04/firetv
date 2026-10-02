"""Render Drift Lab CSV evidence. Run from deathride; requires matplotlib for PNG/SVG."""
import argparse
import csv
import gzip
import json
from pathlib import Path


def rows(path):
    if not path.exists() and path.with_suffix(path.suffix + ".gz").exists():
        with gzip.open(path.with_suffix(path.suffix + ".gz"), "rt", encoding="utf-8", newline="") as source:
            return list(csv.DictReader(source))
    with path.open(encoding="utf-8", newline="") as source:
        return list(csv.DictReader(source))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("report", type=Path)
    parser.add_argument("--witnesses", type=Path, default=Path("core/build/reports/drift-lab"))
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    scenarios = rows(args.report / "summary.csv")
    witnesses = rows(args.witnesses / "class-witnesses.csv")
    geometry = {r["class"]: r for r in rows(args.report / "geometry.csv")}
    comparisons = rows(args.witnesses / "grip-profile-comparison.csv")
    lookup = {(r["class"], r["profile"], r["model"]): r for r in comparisons}
    notes = ["| Class | Useful HB hold (s) | Peak slip (deg) | Release speed (%) | Catch (s) | Exit at 4 s (m/s) | First spin hold (s) | Equal-angle catch (s) | Grip yaw delta (%) |",
             "|---|---:|---:|---:|---:|---:|---:|---:|---:|"]
    evidence = []
    for row in witnesses:
        name = row["class"]
        equal = next(r for r in scenarios if r["class"] == name and r["exercise"] == "EQUAL_CATCH" and float(r["requestedEntryMps"]) == 22)
        yaw = lambda model: float(lookup[(name, "Balanced", model)]["meanYawRadPerSecond"])
        delta = (yaw("D3") / yaw("W3") - 1) * 100
        spin = float(row["firstObservedSpinHoldSeconds"])
        spin_text = f"{spin:.1f}" if spin == spin else "not observed"
        notes.append(f"| {name} | {float(row['selectedHoldSeconds']):.1f} | {float(row['peakSlipDeg']):.1f} | {float(row['retainedAtRelease'])*100:.1f} | {float(row['recoverySeconds']):.2f} | {float(row['exitSpeedMps']):.2f} | {spin_text} | {float(equal['recoverySeconds']):.2f} | {delta:+.1f} |")
        evidence.append({"class": name, "massKg": float(geometry[name]["massKg"]), "gripYawDeltaPercent": delta,
                         "equalCatchSeconds": float(equal["recoverySeconds"]),
                         "momentumAfterOneSecondKgMps": float(geometry[name]["massKg"]) * float(equal["speedAfterOneSecondMps"])})
    (args.output / "class-table.md").write_text("\n".join(notes) + "\n", encoding="utf-8")
    (args.output / "comparison.json").write_text(json.dumps(evidence, indent=2) + "\n", encoding="utf-8")
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    traces = rows(args.report / "traces.csv")
    fig, axes = plt.subplots(2, 2, figsize=(13, 8), constrained_layout=True)
    for car, exercise, label, color in [("Needle", "EARLY_CATCH", "Needle: catch 0.65 s", "#007a9e"),
                                        ("Needle", "LATE_CATCH", "Needle: catch 1.60 s", "#d65f00"),
                                        ("Bastion", "EARLY_CATCH", "Bastion: catch 0.65 s", "#7650a0")]:
        selected = [r for r in traces if r["class"] == car and r["exercise"] == exercise and float(r["entryMps"]) == 22]
        for ax, key in [(axes[0, 0], "slipDeg"), (axes[0, 1], "speedMps")]:
            ax.plot([float(r["seconds"]) for r in selected], [float(r[key]) for r in selected], label=label, color=color)
    axes[0, 0].set(title="A missed catch continues rotating", xlabel="Seconds", ylabel="Signed body slip (degrees)")
    axes[0, 0].legend(fontsize=8)
    axes[0, 1].set(title="The mistake costs actual exit speed", xlabel="Seconds", ylabel="Speed (m/s)")
    names = [r["class"] for r in witnesses]
    axes[1, 0].barh(names, [float(r["selectedHoldSeconds"]) for r in witnesses], color="#007a9e", label="First useful recoverable pulse")
    for i, row in enumerate(witnesses):
        spin = float(row["firstObservedSpinHoldSeconds"])
        if spin == spin:
            axes[1, 0].plot(spin, i, "x", color="#d65f00")
    axes[1, 0].set(title="22 m/s pulse sweep; orange x = first sampled spin", xlabel="Handbrake hold (s)")
    axes[1, 0].invert_yaxis()
    axes[1, 1].barh(names, [r["equalCatchSeconds"] for r in evidence], color="#7650a0")
    axes[1, 1].set(title="Same starting slide: 34.4 degrees, -0.7 rad/s", xlabel="Time to settle after release (s)")
    axes[1, 1].invert_yaxis()
    for ax in axes.flat:
        ax.grid(alpha=.18)
        ax.set_axisbelow(True)
    fig.suptitle("Death Ride D3 — fixed-step simulated calibration, Balanced / asphalt\nOpen plane; ordinary scripted inputs; not owner-felt", fontsize=12)
    for extension in ["png", "svg"]:
        fig.savefig(args.output / f"calibration.{extension}", dpi=150)
    svg = args.output / "calibration.svg"
    svg.write_bytes(("\n".join(line.rstrip() for line in svg.read_text(encoding="utf-8").splitlines()) + "\n").encode("utf-8"))
    plt.close(fig)
    print("\n".join(notes))


if __name__ == "__main__":
    main()
