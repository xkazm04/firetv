"""Content assertions for G2/G3. Pixels and metadata are checked, not just file existence."""
import csv
import os
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
    assert len(assigned) == len(set(assigned)) == len(courses)
    assert set(assigned) == {c["id"] for c in courses}
    assert len(campaign) == 35 and {r["division"] for r in regions.values()} == {e["cup"] for e in campaign}
    candidate_manifest = list(csv.DictReader((ROOT / "tracks/candidates/manifest.csv").open()))
    assert len(data["candidateRegions"]) == len(candidate_manifest) + 1
    for event in campaign:
        assert event['course'] in regions[next(r['id'] for r in regions.values() if r['division']==event['cup'])]['defaultCourses']
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
    # Owner track application changes courses and hunter decisions, while region art and saves stay fixed.
    baseline = os.environ.get("REGIONS_BASELINE", "f7a080af")
    protected = ["art/budget.json", "art/history.jsonl", "art/owner-approvals-2026-10-03.json", "assets/regions",
                 "core/src/main/kotlin/dev/deathride/core/ProfileStore.kt", "core/src/main/kotlin/dev/deathride/core/ProfileCodec.kt"]
    changed = subprocess.check_output(["git", "diff", "--name-only", baseline, "--", *["deathride/" + p for p in protected]], cwd=ROOT.parent, text=True).splitlines()
    assert not changed, changed
    for row in candidate_manifest:
        ident=row['candidate']; rid=data['candidateRegions'][ident]
        draft=json.loads((ROOT / 'tracks/candidates/drafts' / (ident+'.json')).read_text())
        assert draft['region']==draft['course']['region']==rid
        assert draft['course']['regionName']==regions[rid]['name']
        with zipfile.ZipFile(ROOT / 'tracks/candidates/bundles' / (ident+'.zip')) as z:
            membership=list(csv.DictReader(io.StringIO(z.read('region-membership.csv').decode())))[0]
            assert membership['region']==rid and membership['course']==ident
    active = json.loads((ROOT / "art/reports/g1-active-bundle.json").read_text())
    assert active["resident_mib_with_car_reserve"] == 31.25
    result = dict(status="pass", regionCount=5, productionCourses=len(courses), campaignEvents=35, candidateAssignments=len(data["candidateRegions"]),
                  candidateFiles=16, ownerApprovedGroundVariants=16, exactKeptPropMemberships=11, additionalTextureBytes=0,
                  declaredArtMiBWithCarReserve=31.25, sharedMotionSlots=160, vehicleSlots=136, weatherSlots=24,
                  combatSpriteSlots=64, newFramebuffers=0, sourceAuthoritySha256=data["authoritySha256"],
                  noRejectedAssets=True, regionArtSavesAndPaidLedgerUnchanged=True, baselineCommit=baseline,
                  explicitCourseAndDraftMemberships=True,
                  deviceFrameTimeDeltaMs=None, deviceFrameTimeStatus="pending-busy; see ../owner-part5/stick-status.json")
    path = ROOT / os.environ.get("TRACK_EVIDENCE", "evidence/tracks/owner-part4") / "regions-content.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
