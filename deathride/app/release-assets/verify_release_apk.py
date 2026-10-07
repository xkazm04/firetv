"""Verify a release APK against deathride/assets.  python -I verify_release_apk.py <apk> <assets-dir>
1. every packaged PNG decodes to the same pixels as its source (native and RGBA);
2. every 64-hex value in a packaged JSON that names a packaged PNG equals that PNG's sha256 in the APK (a value still
   equal to a re-encoded source sha256 is stale), so RegionMaterials.verifiedFile and StoryArt.matches pass;
3. owner-approved files (any approved_export_sha256 hit) are byte-identical to their sources.
Exits 1 on any failure."""
import sys, os, io, re, json, zipfile, hashlib
from PIL import Image

apk, assets = sys.argv[1:3]
HEX = re.compile(r"(?<![0-9a-fA-F])[0-9a-fA-F]{64}(?![0-9a-fA-F])")
sha = lambda b: hashlib.sha256(b).hexdigest()
z = zipfile.ZipFile(apk)
pk = {i.filename[7:]: z.read(i) for i in z.infolist() if i.filename.startswith("assets/")}
fails = []
owner = set()


def collect(o):
    if isinstance(o, dict):
        for k, v in o.items():
            if k == "approved_export_sha256" and isinstance(v, str) and v: owner.add(v.lower())
            collect(v)
    elif isinstance(o, list):
        for v in o: collect(v)


src_json = set()
for root, _, ns in os.walk(assets):
    for n in ns:
        if n.endswith(".json"):
            p = os.path.join(root, n)
            src_json.add(os.path.relpath(p, assets).replace("\\", "/"))
            collect(json.loads(open(p, "rb").read()))

changed = same = owner_ok = 0
src_to_pk, pk_shas = {}, set()
for rel, data in sorted(pk.items()):
    if not rel.endswith(".png"): continue
    sp = os.path.join(assets, rel)
    if not os.path.exists(sp): continue
    src = open(sp, "rb").read()
    a, b = Image.open(io.BytesIO(src)), Image.open(io.BytesIO(data)); a.load(); b.load()
    if not (a.mode == b.mode and a.tobytes() == b.tobytes() and a.convert("RGBA").tobytes() == b.convert("RGBA").tobytes()):
        fails.append("pixels differ: " + rel)
    src_to_pk[sha(src)] = sha(data); pk_shas.add(sha(data))
    if sha(src) in owner:
        if src != data: fails.append("owner-approved file changed: " + rel)
        else: owner_ok += 1
    elif src == data: same += 1
    else: changed += 1

matched = 0
for rel, data in sorted(pk.items()):
    if not rel.endswith(".json") or rel not in src_json: continue
    for h in HEX.findall(data.decode("utf-8")):
        h = h.lower()
        if h in src_to_pk and src_to_pk[h] != h:
            fails.append("%s: stale source sha256 %s (packaged PNG is %s)" % (rel, h, src_to_pk[h]))
        elif h in pk_shas:
            matched += 1
print("PNGs: %d re-encoded, %d unchanged non-owner, %d owner-approved byte-identical; %d JSON pin values name a packaged PNG and match"
      % (changed, same, owner_ok, matched))
if fails:
    print("FAIL (%d)" % len(fails))
    for x in fails[:30]: print(" ", x)
    sys.exit(1)
print("OK")
