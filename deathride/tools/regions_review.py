"""Build the G3 offline comparison from actual shipping-renderer captures and region.csv."""
import argparse
import hashlib
import html
import json
from pathlib import Path
from regions_export import ROOT, build


def h(value):
    return html.escape(str(value), quote=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    data = build()
    owner_path = ROOT.parent / "docs/concepts/DEATH-RIDE-OWNER-DECISIONS-2026-10-04.md"
    owner = owner_path.read_text(encoding="utf-8")
    assert "Regions all approved" in owner and "scrap-1-c" in owner.split("**Not reviewed:")[0]
    manifest = json.loads((ROOT / "assets/regions/materials.json").read_text())
    assert len(manifest["assets"]) == 16 and all(a["status"] == "Keep" and a["ownerEvidence"].startswith("docs/concepts/DEATH-RIDE-OWNER-DECISIONS-2026-10-04.md#") for a in manifest["assets"])
    renders = json.loads((ROOT / "evidence/regions/g2/render.json").read_text())
    assert renders["status"] == "pass" and renders["course"] == "scrap-1-c"
    stick = json.loads((ROOT / "evidence/regions/g3/stick-status.json").read_text())
    assert stick["requestedPackage"] == "dev.deathride.regions"
    assert stick["status"] == "pending-busy"  # No fabricated device completion path.
    menu_hashes = []
    for r in data["regions"]:
        menu = ROOT / f"evidence/regions/g2/ui/career-{r['id']}.png"
        menu_hashes.append(hashlib.sha256(menu.read_bytes()).hexdigest())
    assert len(set(menu_hashes)) == 5, "Menus must show five actual division fixtures"
    for capture in renders["captures"]:
        assert hashlib.sha256((ROOT / capture["path"]).read_bytes()).hexdigest() == capture["sha256"]
    cards = []
    for r in data["regions"]:
        rid = r["id"]
        captures = [c for c in renders["captures"] if c["region"] == rid]
        initial = next(c for c in captures if c["mode"] == "candidate" and c["view"] == "driving")
        samples = f"{rid}; course scrap-1-c; region.csv SHA-256 {data['authoritySha256']}; desktop GL; driving / candidate; " + "; ".join(r["variants"].values())
        palette = "".join(f'<li><span class="swatch" style="background:{h(color)}"></span><span>{h(name)}<code>{h(color)}</code></span></li>' for name, color in r["palette"].items())
        materials = "".join(f'<li>{h(slot)}: <a href="../assets/regions/{h(asset)}.png">{h(asset)}</a> — Keep ? owner approved 2026-10-04</li>' for slot, asset in r["variants"].items())
        props = "".join(f'''<li><img src="../art/review/regions/images/g1-{rid}-reuse-{p['key'].split('/')[-1]}-native.png" alt="{h(p['key'])}: exact kept design"><span>{h(p['key'].split('/')[-1].replace('-', ' '))}<small>placement weight {p['weight']}</small></span></li>''' for p in r["props"])
        weather = "".join(f'<tr><th>{h(w["kind"])}</th><td>{w["cap"]}</td><td>{w["rate"]:g}/s</td><td>{w["life"]:g} s</td><td>{w["pixels"]:g} px</td></tr>' for w in r["weather"])
        special = {"salt": "Fine salt crust is still missing; the current dirt is quarry dirt.", "foundry": "Cold clinker is still missing; recoloured gravel is the fallback."}.get(rid, "The delivered G1 ground recolours are owner-approved.")
        cards.append(f'''
<article class="card region-card" id="{rid}" data-region="{rid}" data-direction="{rid}" data-label="{h(r['name'])} / {rid}" data-samples="{h(samples)}" style="--region-accent:{r['accent']}">
 <header><p class="eyebrow">DIVISION {h(r['division'])} · BOSS {h(r['boss'])}</p><h2>{h(r['name'])}</h2><p>{h(r['climate'])}</p></header>
 <figure><a class="render-link" href="../{initial['path']}"><img class="region-render" src="../{initial['path']}" width="1920" height="1080" alt="{h(r['name'])}: scrap-1-c at the same driving camera and simulation instant"></a><figcaption class="render-caption">Desktop GL · driving scale · Approved G1 ground · {initial['weatherLive']} weather slots live</figcaption></figure>
 <p class="truth-badge">LOOK CANDIDATE · OWNER NOT REVIEWED</p>
 <ul class="palette" aria-label="{h(r['name'])} material palette">{palette}</ul>
 <details><summary>Place, props, weather and evidence</summary>
  <h3>Approved ground variants</h3><ul class="material-list">{materials}</ul><p>The fallback selector substitutes original materials plus regional tint, or fully procedural scenery. These choices do not change the road surface physics.</p>
  <p>{h(r['plot'])}</p><p><a href="../../docs/concepts/deathride/G0-region-bible.md">G0 plot and region bible</a> · <a href="../art/review/regions/{rid}.html">Individual G1 art review</a></p>
  <h3>Exact kept props</h3><ul class="props">{props}</ul><p>These reuse the owner's exact kept exports. Other new regional prop images are missing; no rejected rework image is restored. Off-road scenery does not add collision.</p>
  <h3>Presentation only</h3><div class="table-scroll"><table><thead><tr><th>Family</th><th>Cap</th><th>Rate</th><th>Life</th><th>1080p size cap</th></tr></thead><tbody>{weather}</tbody></table></div>
  <p>Combined cap {r['weatherCap']}; grade {h(' / '.join(map(str,r['grade'])))}; vignette ≤ {r['vignette']}; edge fog ≤ {r['fog']}. Weather uses the existing motion-particle budget and never changes grip, steering, visibility rules or AI. These stills do not demonstrate motion.</p>
  <p>Backdrop: <strong>{h(r['backdrop'].replace('-', ' '))}</strong>, procedural fallback. Generated panels and weather sheets are missing. {h(special)}</p>
  <p>Ambience hooks for later: <code>{h(' · '.join(r['ambience']))}</code>. No audio generated or added.</p>
  <h3>Actual campaign menu</h3><a href="../evidence/regions/g2/ui/career-{rid}.png"><img class="menu-capture" src="../evidence/regions/g2/ui/career-{rid}.png" width="1920" height="1080" alt="{h(r['name'])} division menu rendered by RaceGame on desktop"></a><p>The menu uses an in-memory division fixture, with no profile writes.</p>
  <h3>Stick evidence</h3><p class="device-pending">Pending — shared Stick busy with <code>dev.deathride.perf</code>. No screenshot or frame-time delta is claimed for this region.</p>
 </details>
</article>''')
    document = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Death Ride — five regions, one road</title><link rel="stylesheet" href="../audio/report.css"><link rel="stylesheet" href="review.css"></head>
<body data-round="deathride.regions.g3" data-page-title="G3 region engine comparison"><main class="report">
<header class="page-header"><p class="eyebrow">DEATH RIDE / REGION REVIEW / G3</p><h1>One road. Five places.</h1><p class="lede">The same owner-kept <strong>R3 scrap-1-c</strong> layout, cars, camera and simulation instant in every region. Compare the look; the driving rules stay identical.</p>
<p><a href="../tracks/atlas/candidates.html">Track atlas and recorded triage</a> · <a href="../art/review/regions/index.html">Region art inventory</a> · <a href="../../docs/concepts/deathride/G2-region-engine.md">Engine evidence</a> · <a href="../../docs/concepts/deathride/G3-region-owner-review.md">Review note</a></p></header>
<section class="notice truth"><strong>Desktop GL renders, not Stick screenshots.</strong><p>The owner approved all five G1 regions on 2026-10-04, including the 16 delivered ground recolours and 11 kept-prop memberships. The four kept prop designs are reused; missing new props, panels and weather sprites use procedural fallbacks. This new runtime comparison and Stick/sofa feel remain unreviewed. <a href="../../docs/concepts/DEATH-RIDE-OWNER-DECISIONS-2026-10-04.md">Recorded owner decisions</a>.</p><p>Stick: <strong>pending-busy</strong>, scanned {h(stick['utc'])}. Frame-time delta: <strong>unmeasured</strong>. <a href="../evidence/regions/g3/stick-status.json">Read-only device record</a>.</p></section>
<div class="report-toolbar"><label>Appearance <select id="theme"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label><label>Same camera <select id="camera"><option value="driving">Driving scale</option><option value="overview">Whole course</option><option value="banner">Division banner</option></select></label><label>Ground art <select id="materials"><option value="candidate">Approved G1 ground</option><option value="tint-fallback">Original materials + tint</option><option value="procedural">Fully procedural fallback</option></select></label></div>
<p class="small" id="comparison-note">All five views change together. Click any render for its full 1920 × 1080 capture. Car and combat colours retain their original contrast.</p>
<nav class="region-nav" aria-label="Regions">{''.join(f'<a href="#{r["id"]}">{h(r["name"])}</a>' for r in data['regions'])}</nav>
<section class="region-grid" aria-label="Same-course region comparisons">{''.join(cards)}</section>
<section class="review-section"><h2>Your region choices</h2><p>Keep, Maybe or Reject the overall region look. This is a preference draft, not automatic approval of individual art, track geometry, performance or sofa feel. Notes stay in this browser. Export before moving the page.</p><div id="winner-fields"></div><label hidden><input type="checkbox" id="matched">Audio gain (unused)</label><button id="refresh-export" type="button">Refresh Markdown</button> <button id="copy" type="button">Copy Markdown</button><p id="status" role="status"></p><label for="export">Markdown draft</label><textarea id="export" readonly></textarea></section>
<footer><p>Authority: <a href="../core/src/main/resources/data/region.csv">region.csv</a> · <a href="data.json">Derived assignments</a> · <a href="../evidence/regions/g2/render.json">Capture hashes and residency</a> · <a href="../evidence/regions/g2/content.json">Content assertions</a> · <a href="OWNER-REGIONS-CHOICE.md">Recorded owner choices</a></p><p>Simulation hash {h(renders['simulationHash'])}. Region textures replace existing slots one-for-one. No additional atlas or framebuffer. Weather cap 24 of 160 shared motion slots; 136 remain for vehicle dust, plus the unchanged 64 combat sprite slots.</p></footer>
</main><script src="review-data.js"></script><script src="compare.js"></script><script src="report.js"></script></body></html>'''
    review = dict(schema=1, authoritySha256=data["authoritySha256"], ownerDecisionSha256=hashlib.sha256(owner_path.read_bytes()).hexdigest(), course=renders["course"], simulationHash=renders["simulationHash"], captures=renders["captures"], regionIds=[r["id"] for r in data["regions"]], g1OwnerApprovedRegions=5, g1OwnerApprovedGroundVariants=16, runtimeOwnerReviewed=False, stick=stick)
    script = (ROOT / "audio/report.js").read_text(encoding="utf-8")
    script = script.replace("Owner listening draft. Keep and category winners express preference; technical failures and production gates remain unchanged.", "Owner region review draft. Desktop GL stills; Stick timing and owner feel pending. Keep expresses a region preference; individual art approvals and technical gates remain unchanged.")
    script = script.replace("deathride/audio/OWNER-AUDIO-CHOICE.md", "deathride/regions/OWNER-REGIONS-CHOICE.md")
    outputs = {"index.html": document, "review-data.js": "window.REGION_REVIEW=" + json.dumps(review, separators=(",", ":")) + ";\n", "report.js": script}
    for name, content in outputs.items():
        path = ROOT / "regions" / name
        if args.check:
            assert path.read_text(encoding="utf-8") == content, f"Stale review artifact: {path}"
        else:
            path.write_text(content, encoding="utf-8", newline="\n")
    print("Checked" if args.check else "Built", "five-region owner comparison; no owner choices inferred")


if __name__ == "__main__":
    main()
