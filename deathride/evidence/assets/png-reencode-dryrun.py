"""Dry run: lossless PNG re-encode of every PNG shipped in the release APK. Changes no asset.
Run from deathride/:  python evidence/assets/png-reencode-dryrun.py <apk> <scratch-dir-outside-worktree>
Needs: pip install pyoxipng (9.1.1 -> oxipng 9.1.x), Pillow. Writes png-reencode-dryrun.json beside itself.
"""
import sys, os, json, zipfile, hashlib, collections, io
import oxipng
from PIL import Image

apk, scratch = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
ROOTS = ["assets", "controller"]  # build.gradle.kts asset srcDirs
FLAGS = dict(level=6, deflate=oxipng.Deflaters.zopfli(15), fix_errors=False,
             bit_depth_reduction=False, color_type_reduction=False,
             palette_reduction=False, grayscale_reduction=False)  # == --nx --zopfli -o max, nothing stripped
sha = lambda b: hashlib.sha256(b).hexdigest()

z = zipfile.ZipFile(apk)
entries = [i for i in z.infolist() if i.filename.startswith("assets/")]
dirsum = collections.OrderedDict()
for i in entries:
    parts = i.filename.split("/")
    d = parts[1] if len(parts) > 2 else "(root)"
    s = dirsum.setdefault(d, dict(files=0, bytes=0, png_files=0, png_bytes=0, png_stored=0, png_deflated=0))
    s["files"] += 1; s["bytes"] += i.compress_size
    if i.filename.endswith(".png"):
        s["png_files"] += 1; s["png_bytes"] += i.compress_size
        s["png_stored" if i.compress_type == 0 else "png_deflated"] += 1

# pin index: every JSON string value that looks like a sha256, with its file + path + field
pins = collections.defaultdict(list)
def walk(o, path, f):
    if isinstance(o, dict):
        for k, v in o.items(): walk(v, path + [k], f)
    elif isinstance(o, list):
        for n, v in enumerate(o): walk(v, path + [n], f)
    elif isinstance(o, str) and len(o) == 64:
        try: int(o, 16)
        except ValueError: return
        pins[o.lower()].append((f, "/".join(map(str, path)), str(path[-1]) if path else ""))
for r, _, fs in os.walk("assets"):
    for n in fs:
        if n.endswith(".json"):
            p = os.path.join(r, n).replace("\\", "/")
            walk(json.load(open(p, encoding="utf-8")), [], p)

OWNER = {"approved_export_sha256"}
REVIEW = {"face_visibility_export_sha256"}
# Kotlin readers found by grepping game/src (main+test), desktop/src, by hand; fields not listed are read only by python tools/ (no Kotlin reader)
READERS = {
    "approved_export_sha256": "StoryArt.eligible (game/.../StoryArt.kt:75), EnvironmentArt.eligible for phase2-states catalog entries (EnvironmentArt.kt:15); tests StoryArtTest, EnvironmentArtTest",
    "face_visibility_export_sha256": "FaceArt.screened (FaceArt.kt:15-16), called by StoryArt.eligible and AtlasArt:50; test FaceArtTest",
    "sha256@story-art": "StoryArt.eligible/matches (StoryArt.kt:73,78), StoryArtTest:48",
    "sha256@regions": "RegionMaterials.verifiedFile (RegionMaterials.kt:25, require digest==sha256, runtime)",
}
def readers(path, fields):
    out = sorted({READERS[f] for f in fields if f in READERS})
    if "sha256" in fields and path.startswith("assets/story-art/"): out.append(READERS["sha256@story-art"])
    if "sha256" in fields and path.startswith("assets/regions/"): out.append(READERS["sha256@regions"])
    return out or ["none in Kotlin (only tools/art/*.py read these pins)"]
def klass(fields):
    if fields & OWNER: return "owner-approval"
    if fields & REVIEW: return "review-pin"
    return "technical-pin" if fields else "unpinned"

def hdr(b):
    return tuple(b[16:29])  # w,h,depth,colortype,compression,filter,interlace

rows = []
os.makedirs(scratch, exist_ok=True)
for i in entries:
    if not i.filename.endswith(".png"): continue
    rel = i.filename[len("assets/"):]
    data = z.read(i)
    src = next((r + "/" + rel for r in ROOTS if os.path.exists(r + "/" + rel)), None)
    row = dict(apk_entry=i.filename, source=src, apk_compress="stored" if i.compress_type == 0 else "deflated",
               before=len(data), sha256=sha(data))
    row["apk_matches_source"] = bool(src) and open(src, "rb").read() == data
    try:
        out = oxipng.optimize_from_memory(data, **FLAGS)
    except Exception as e:
        out = data; row["error"] = repr(e)
    row["after"] = len(out)
    row["saved"] = len(data) - len(out)
    row["ihdr_same"] = hdr(data) == hdr(out)
    a, b = Image.open(io.BytesIO(data)), Image.open(io.BytesIO(out))
    a.load(); b.load()
    row["mode"] = a.mode; row["size"] = list(a.size)
    row["ihdr"] = dict(zip("w h depth ctype comp filt interlace".split(), [int.from_bytes(data[16:20], "big"), int.from_bytes(data[20:24], "big"), data[24], data[25], data[26], data[27], data[28]]))
    row["pixels_native_same"] = a.mode == b.mode and a.tobytes() == b.tobytes()
    row["pixels_rgba_same"] = a.convert("RGBA").tobytes() == b.convert("RGBA").tobytes()
    row["palette_same"] = a.getpalette() == b.getpalette() if a.mode == "P" else True
    row["accepted"] = bool(row["saved"] > 0 and row["ihdr_same"] and row["pixels_native_same"]
                           and row["pixels_rgba_same"] and row["palette_same"] and "error" not in row)
    open(os.path.join(scratch, rel.replace("/", "__")), "wb").write(out)
    hits = pins.get(row["sha256"], [])
    row["pins"] = [dict(file=f, path=p, field=fld) for f, p, fld in hits]
    fields = {fld for _, _, fld in hits}
    row["pin_class"] = klass(fields)
    row["pin_fields"] = sorted(fields)
    row["kotlin_readers"] = readers(rel and "assets/" + rel, fields)
    row["pin_values_to_rewrite"] = len(hits)
    rows.append(row)

def tot(sel):
    sel = [r for r in rows if sel(r)]
    return dict(files=len(sel), saved_bytes=sum(r["saved"] for r in sel if r["accepted"]),
                accepted=sum(r["accepted"] for r in sel),
                json_pins_to_rewrite=sum(r["pin_values_to_rewrite"] for r in sel if r["accepted"]))
summary = dict(apk=os.path.basename(apk), apk_bytes=os.path.getsize(apk), asset_dirs=dirsum,
               png_count=len(rows), png_before=sum(r["before"] for r in rows),
               flags="pyoxipng 9.1.1: level=6 (-o max), zopfli(15 iters), all reductions off (--nx), strip none",
               totals=dict(all=tot(lambda r: True),
                           no_owner_or_review=tot(lambda r: r["pin_class"] in ("technical-pin", "unpinned")),
                           owner_approved=tot(lambda r: r["pin_class"] == "owner-approval"),
                           review_only=tot(lambda r: r["pin_class"] == "review-pin")),
               by_class={c: tot(lambda r, c=c: r["pin_class"] == c) for c in ("owner-approval", "review-pin", "technical-pin", "unpinned")})
json.dump(dict(summary=summary, files=rows), open(os.path.join(HERE, "png-reencode-dryrun.json"), "w"), indent=1)
print(json.dumps(summary, indent=1))
