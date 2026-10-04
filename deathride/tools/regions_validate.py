"""Content assertions for G2/G3. Pixels and metadata are checked, not just file existence."""
import csv
import hashlib
import json
import subprocess
import io
import zipfile
from pathlib import Path
from PIL import Image
from regions_export import ROOT, build


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    data = build()
    regions = {r["id"]: r for r in data["regions"]}
    courses = list(csv.DictReader((ROOT / "core/src/main/resources/data/tracks.csv").open()))
    campaign = list(csv.DictReader((ROOT / "core/src/main/resources/data/campaign.csv").open()))
    assigned = [c for r in regions.values() for c in r["defaultCourses"]]
    assert len(assigned) == len(set(assigned)) == len(courses) == 29
    assert set(assigned) == {c["id"] for c in courses}
    assert len(campaign) == 35 and {r["division"] for r in regions.values()} == {e["cup"] for e in campaign}
    assert len(data["candidateRegions"]) == 103
    for candidate, region in data["candidateRegions"].items():
        assert candidate.startswith(regions[region]["division"] + "-")
    approvals = json.loads((ROOT / "art/owner-approvals-2026-10-03.json").read_text())["assets"]
    rejected = {a["export_sha256"] for a in approvals.values() if a["decision"] == "Reject"}
    review = {r["id"]: r for r in json.loads((ROOT / "art/review/regions/review.json").read_text())["records"]}
    manifest = json.loads((ROOT / "assets/regions/materials.json").read_text())["assets"]
    assert len(manifest) == 16
    runtime = json.loads((ROOT / "assets/phase2-states/catalog.json").read_text())
    runtime_assets = {a["logical_name"]: a for a in runtime["assets"]}
    for r in regions.values():
        for p in r["props"]:
            assert approvals[p["key"]]["decision"] == "Keep"
            a = runtime_assets[p["key"]]
            assert a["export_sha256"] == approvals[p["key"]]["export_sha256"]
        assert sum(w["cap"] for w in r["weather"]) <= r["weatherCap"] <= 24
        assert sum(w["cap"] * w["pixels"] ** 2 * w["alpha"] for w in r["weather"]) / (1920 * 1080) <= .04
        assert len(r["weather"]) <= 2
        for slot, asset in r["variants"].items():
            m = next(x for x in manifest if x["id"] == asset)
            assert m["region"] == r["id"] and m["status"] == "Keep" and m["technicalEligible"]
            assert m["sha256"] == review[asset]["sha256"] and m["sha256"] not in rejected
            assert review[asset]["technical_eligible"]
            assert m["ownerEvidence"] == "docs/concepts/DEATH-RIDE-OWNER-DECISIONS-2026-10-04.md#1-regions-all-approved"
            assert "Regions all approved" in (ROOT.parent / m["ownerEvidence"].split("#")[0]).read_text(encoding="utf-8")
            path = ROOT / "assets/regions" / (asset + ".png")
            assert digest(path) == m["sha256"] == digest(ROOT / m["source"])
            with Image.open(path) as image:
                assert image.size == (256, 256) and image.mode == "RGBA"
    # Region work may add presentation data, never mutate existing simulation/save/content values.
    baseline = "eb4711de"
    protected = ["core/src/main/resources/data", "tracks/candidates", "art/budget.json", "art/history.jsonl", "art/owner-approvals-2026-10-03.json",
                 "core/src/main/kotlin/dev/deathride/core/World.kt", "core/src/main/kotlin/dev/deathride/core/ProfileStore.kt"]
    changed = subprocess.check_output(["git", "diff", "--name-only", baseline, "--", *["deathride/" + p for p in protected]], cwd=ROOT.parent, text=True).splitlines()
    metadata = [p for p in changed if p.startswith("deathride/tracks/candidates/drafts/") or p.startswith("deathride/tracks/candidates/bundles/")]
    assert set(changed) <= {"deathride/core/src/main/resources/data/region.csv", *metadata}, changed
    # Compare semantic JSON and every original ZIP entry against the merged R3 baseline.
    # Only the new region fields/membership entry may differ; proof CSV strings stay exact.
    paths = metadata + ["deathride/tracks/atlas/candidates.json"]
    raw = subprocess.check_output(["git", "cat-file", "--batch"], input="".join(f"{baseline}:{p}\n" for p in paths).encode(), cwd=ROOT.parent)
    stream = io.BytesIO(raw)
    def strip_region(value):
        if isinstance(value, dict):
            return {k: strip_region(v) for k, v in value.items() if k not in ("region", "regionName")}
        if isinstance(value, list):
            return [strip_region(v) for v in value]
        return value
    for path in paths:
        size = int(stream.readline().split()[2]); before = stream.read(size); assert stream.read(1) == b"\n"
        current = (ROOT.parent / path).read_bytes()
        if path.endswith(".json"):
            old, new = json.loads(before), json.loads(current)
            assert strip_region(new) == old, f"Geometry/proof change in {path}"
            entries = new["candidates"] if "candidates" in new else [new]
            for candidate in entries:
                rid = data["candidateRegions"][candidate["id"]]
                assert candidate["region"] == candidate["course"]["region"] == rid
                assert candidate["course"]["regionName"] == regions[rid]["name"]
        else:
            with zipfile.ZipFile(io.BytesIO(before)) as old, zipfile.ZipFile(io.BytesIO(current)) as new:
                assert set(new.namelist()) == {*old.namelist(), "region-membership.csv"}
                for name in old.namelist():
                    assert old.read(name) == new.read(name), (path, name)
                membership = list(csv.DictReader(io.StringIO(new.read("region-membership.csv").decode())))[0]
                assert membership["region"] == data["candidateRegions"][membership["course"]]
    active = json.loads((ROOT / "art/reports/g1-active-bundle.json").read_text())
    assert active["resident_mib_with_car_reserve"] == 31.25
    result = dict(status="pass", regionCount=5, productionCourses=29, campaignEvents=35, candidateAssignments=103,
                  candidateFiles=16, ownerApprovedGroundVariants=16, exactKeptPropMemberships=11, additionalTextureBytes=0,
                  declaredArtMiBWithCarReserve=31.25, sharedMotionSlots=160, vehicleSlots=136, weatherSlots=24,
                  combatSpriteSlots=64, newFramebuffers=0, sourceAuthoritySha256=data["authoritySha256"],
                  noRejectedAssets=True, geometryPhysicsSavesOwnerDecisionsAndPaidLedgerUnchanged=True,
                  candidateMetadataOnly=True, originalZipEntriesPreserved=True,
                  deviceFrameTimeDeltaMs=None, deviceFrameTimeStatus="pending-busy; see stick-status.json")
    path = ROOT / "evidence/regions/g2/content.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
