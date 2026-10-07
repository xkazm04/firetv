"""Release-only lossless PNG re-encode. Reads deathride/assets, writes ONLY changed files into <out>.
Usage: python -I reencode_release_assets.py <assets-dir> <out-dir> <manifest.json> <requirements.txt>
Changed files: the re-encoded PNGs, and the catalog JSONs with each re-encoded file's sha256 rewritten to its new one.
Owner-approved (any approved_export_sha256 hit) and review-pinned files are never touched. A PNG failing any check
is packaged unchanged and listed under "png_skipped" in the manifest. Non-zero exit: pinned tool missing or wrong version.
"""
import sys, os, re, io, json, hashlib

SHIPPED = ("phase2-states", "story-art", "regions")  # the dirs the app packages that hold PNGs (see app/build.gradle.kts)
OWNER, REVIEW = "approved_export_sha256", "face_visibility_export_sha256"
HEX = re.compile(r"(?<![0-9a-fA-F])[0-9a-fA-F]{64}(?![0-9a-fA-F])")
sha = lambda b: hashlib.sha256(b).hexdigest()


def check_tool(req_path):
    from importlib import metadata
    req = req_path.replace("\\", "/")
    for line in open(req_path, encoding="utf-8"):
        line = line.split("#")[0].strip()
        if "==" in line:
            name, want = [s.strip() for s in line.split("==", 1)]
            try:
                have = metadata.version(name)
            except metadata.PackageNotFoundError:
                have = None
            if have != want:
                sys.exit("PNG re-encode: %s==%s is required, found %s. Install it (pip install --user -r %s) or pass -PnoPngReencode=true to ship the original bytes."
                         % (name, want, have or "nothing", req))
    try:
        import PIL  # noqa: F401
    except ImportError:
        sys.exit("PNG re-encode: Pillow is missing (pip install --user -r %s) or pass -PnoPngReencode=true." % req)


def walk(o, path, hits):
    if isinstance(o, dict):
        for k, v in o.items(): walk(v, path + [k], hits)
    elif isinstance(o, list):
        for n, v in enumerate(o): walk(v, path + [n], hits)
    elif isinstance(o, str) and HEX.fullmatch(o):
        hits.append(("/".join(map(str, path)), str(path[-1]) if path else "", o.lower()))


def main():
    assets, out, manifest, req = sys.argv[1:5]
    check_tool(req)
    import oxipng
    from PIL import Image
    flags = dict(level=6, deflate=oxipng.Deflaters.zopfli(15), fix_errors=False, bit_depth_reduction=False,
                 color_type_reduction=False, palette_reduction=False, grayscale_reduction=False)

    jsons = {}  # rel -> (bytes, [(path, field, hash)])
    for root, _, names in os.walk(assets):
        for n in sorted(names):
            if n.endswith(".json"):
                p = os.path.join(root, n)
                rel = os.path.relpath(p, assets).replace("\\", "/")
                b = open(p, "rb").read()
                hits = []
                walk(json.loads(b.decode("utf-8")), [], hits)
                jsons[rel] = (b, hits)
    owner = {h for _, hs in jsons.values() for _, f, h in hs if f == OWNER}
    review = {h for _, hs in jsons.values() for _, f, h in hs if f == REVIEW}

    files, skipped, remap = [], [], {}
    for d in SHIPPED:
        for root, _, names in sorted(os.walk(os.path.join(assets, d))):
            for n in sorted(names):
                if not n.endswith(".png"): continue
                p = os.path.join(root, n)
                rel = os.path.relpath(p, assets).replace("\\", "/")
                data = open(p, "rb").read()
                s = sha(data)
                if s in owner or s in review:
                    skipped.append(dict(file=rel, reason="owner-approved" if s in owner else "review-pinned", sha256=s))
                    continue
                try:
                    new = oxipng.optimize_from_memory(data, **flags)
                    a, b = Image.open(io.BytesIO(data)), Image.open(io.BytesIO(new)); a.load(); b.load()
                    ok = (len(new) < len(data) and data[16:29] == new[16:29] and a.mode == b.mode
                          and (a.getpalette() == b.getpalette() if a.mode == "P" else True)
                          and a.tobytes() == b.tobytes() and a.convert("RGBA").tobytes() == b.convert("RGBA").tobytes())
                except Exception as e:  # noqa: BLE001
                    ok, new = False, data
                    print("PNG re-encode: %s errored: %r" % (rel, e))
                if not ok:
                    skipped.append(dict(file=rel, reason="failed a check, packaged unchanged", sha256=s))
                    print("PNG re-encode: %s failed a check, packaged unchanged" % rel)
                    continue
                dst = os.path.join(out, rel)
                os.makedirs(os.path.dirname(dst), exist_ok=True)
                open(dst, "wb").write(new)
                remap[s] = sha(new)
                files.append(dict(file=rel, source_sha256=s, packaged_sha256=remap[s], bytes_before=len(data), bytes_after=len(new), pins=[]))
    by_src = {f["source_sha256"]: f for f in files}

    changed_json = []
    for rel, (b, hits) in sorted(jsons.items()):
        if rel.split("/")[0] not in SHIPPED: continue  # dirs the APK ignores or does not hold
        mine = [(p, f, h) for p, f, h in hits if h in remap]
        if not mine: continue
        new_text, n = HEX.subn(lambda m: remap.get(m.group(0).lower(), m.group(0)), b.decode("utf-8"))
        assert n >= len(mine)
        nb = new_text.encode("utf-8")
        dst = os.path.join(out, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        open(dst, "wb").write(nb)
        changed_json.append(dict(file=rel, values_rewritten=len(mine), source_sha256=sha(b), packaged_sha256=sha(nb)))
        for p, f, h in mine:
            by_src[h]["pins"].append(dict(json=rel, path=p, field=f))

    res = dict(flags="pyoxipng 9.1.1: level=6 (-o max), zopfli(15), reductions off (--nx), strip none",
               png_reencoded=len(files), png_skipped=skipped,
               png_bytes_before=sum(f["bytes_before"] for f in files), png_bytes_after=sum(f["bytes_after"] for f in files),
               json_rewritten=changed_json, json_values_rewritten=sum(j["values_rewritten"] for j in changed_json), files=files)
    os.makedirs(os.path.dirname(os.path.abspath(manifest)), exist_ok=True)
    json.dump(res, open(manifest, "w"), indent=1)
    print("PNG re-encode: %d files, %d -> %d bytes (-%d), %d JSON pin values rewritten in %d catalogs, %d left unchanged"
          % (len(files), res["png_bytes_before"], res["png_bytes_after"], res["png_bytes_before"] - res["png_bytes_after"],
             res["json_values_rewritten"], len(changed_json), len(skipped)))


main()
