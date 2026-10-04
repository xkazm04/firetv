"""Derive offline region metadata from region.csv; never write owner decisions or geometry."""
from __future__ import annotations
import argparse
import csv
import hashlib
import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def build():
    authority = ROOT / "core/src/main/resources/data/region.csv"
    with authority.open(encoding="utf-8", newline="") as f:
        rows = list(csv.DictReader(f))
    regions = []
    for r in rows:
        result = dict(r)
        result["palette"] = {k: r[k] for k in ["accent", "asphalt", "dirt", "gravel", "sand", "salt", "ice", "snow", "oil", "kerb"]}
        for k in ["defaultCourses", "ambience"]:
            result[k] = r[k].split(";")
        result["grade"] = list(map(float, r["grade"].split(";")))
        result["weatherCap"] = int(r["weatherCap"])
        result["weather"] = []
        for family in r["weather"].split(";"):
            kind, cap, rate, life, pixels, alpha = family.split(":")
            result["weather"].append(dict(kind=kind, cap=int(cap), rate=float(rate), life=float(life), pixels=float(pixels), alpha=float(alpha)))
        for k in ["vignette", "fog"]:
            result[k] = float(r[k])
        result["variants"] = dict(v.split(":") for v in r["groundVariants"].split(";"))
        result["props"] = [{"key": p.split(":")[0], "weight": int(p.split(":")[1])} for p in r["propBias"].split(";")]
        regions.append(result)
    divisions = {r["division"]: r for r in regions}
    assignments = list(csv.DictReader((ROOT / "tracks/candidates/candidate-assignments.csv").open(encoding="utf-8")))
    return dict(schema=1, authority="core/src/main/resources/data/region.csv",
                authoritySha256=hashlib.sha256(authority.read_bytes()).hexdigest(), regions=regions,
                candidateRegions={r["candidate"]: divisions[r["event"].rsplit("-", 1)[0]]["id"] for r in assignments},
                truth="Presentation candidates; geometry and owner track choices unchanged. Weather never affects physics.")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--attach-candidates", action="store_true", help="Add derived region metadata to existing R3 exports without changing geometry/proofs")
    args = parser.parse_args()
    data = build()
    if args.attach_candidates:
        assert not args.check
        by_id = {r["id"]: r for r in data["regions"]}
        def attach(candidate):
            region = by_id[data["candidateRegions"][candidate["id"]]]
            candidate["region"] = region["id"]
            candidate["course"]["region"] = region["id"]
            candidate["course"]["regionName"] = region["name"]
        for path in (ROOT / "tracks/candidates/drafts").glob("*.json"):
            draft = json.loads(path.read_text(encoding="utf-8"))
            attach(draft)
            path.write_text(json.dumps(draft, separators=(",", ":"), ensure_ascii=False) + "\n", encoding="utf-8", newline="\n")
            bundle = ROOT / "tracks/candidates/bundles" / (draft["id"] + ".zip")
            with zipfile.ZipFile(bundle) as z:
                entries = [(info, z.read(info.filename)) for info in z.infolist() if info.filename != "region-membership.csv"]
            # Preserve every existing entry byte, including the original README/proof digest.
            with zipfile.ZipFile(bundle, "w", compression=zipfile.ZIP_DEFLATED) as z:
                for info, payload in entries:
                    z.writestr(info, payload)
                z.writestr(zipfile.ZipInfo("region-membership.csv", (1980, 1, 1, 0, 0, 0)),
                           f"course,division,region\n{draft['id']},{by_id[draft['region']]['division']},{draft['region']}\n")
        atlas = ROOT / "tracks/atlas/candidates.json"
        report = json.loads(atlas.read_text(encoding="utf-8"))
        for c in report["candidates"]:
            attach(c)
        encoded = json.dumps(report, separators=(",", ":"), ensure_ascii=False)
        atlas.write_text(encoded + "\n", encoding="utf-8", newline="\n")
        atlas.with_name("candidates-data.js").write_text("window.TRACK_CANDIDATES=" + encoded + ";\n", encoding="utf-8", newline="\n")
    text = json.dumps(data, indent=2, ensure_ascii=False) + "\n"
    outputs = {ROOT / "regions/data.json": text, ROOT / "regions/data.js": "window.REGION_DATA = " + text.rstrip() + ";\n"}
    for path, content in outputs.items():
        if args.check:
            assert path.read_text(encoding="utf-8") == content, f"Stale generated metadata: {path}"
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding="utf-8", newline="\n")
    print(f"{'Checked' if args.check else 'Exported'} {len(data['regions'])} regions and {len(data['candidateRegions'])} candidate assignments")


if __name__ == "__main__":
    main()
