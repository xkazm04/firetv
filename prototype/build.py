"""
Builds the self-contained prototype pages from their readable sources and prototype/data.json:

    prototype/src/index.html            + data.json         → prototype/study-desk.html
    prototype/identity/on-air.src.html  + the maths page    → prototype/identity/on-air.html

The sources stay readable; the built files carry the worksheet photos, the model's real hints
and the retrieval picks inline, because a published page may load nothing from anywhere else.
Both outputs are gitignored. A placeholder left unfilled in an output stops the build.

    python prototype/build.py
"""
import json
import os
import re

here = os.path.dirname(os.path.abspath(__file__))


def write(path, out):
    # a placeholder is __NAME__ (a letter first: the Spanish worksheets' blanks are runs of underscores)
    left = sorted(set(re.findall(r"__[A-Z][A-Z_]*__", out)))
    if left:
        raise SystemExit(f"build: {os.path.relpath(path, here)} still holds {', '.join(left)}")
    open(path, "w", encoding="utf-8").write(out)
    print(f"wrote {path}  {os.path.getsize(path) // 1024} KB")


raw = open(os.path.join(here, "data.json"), encoding="utf-8").read()

# The click-through: the whole data set as one script literal.
src = open(os.path.join(here, "src", "index.html"), encoding="utf-8").read()
# A closing script tag inside a JSON string would end the block early; there is none, but be sure. HTML ends the
# block on any case of the tag name, so the guard ignores case too.
write(os.path.join(here, "study-desk.html"), src.replace("/*__DATA__*/null", re.sub(r"</(script)", r"<\/\1", raw, flags=re.I)))

# The On Air identity: page 2's "read as" panel shows the maths sample photo (data.json pages, id "math").
math = next(p for p in json.loads(raw)["pages"] if p["id"] == "math")
src = open(os.path.join(here, "identity", "on-air.src.html"), encoding="utf-8").read()
write(os.path.join(here, "identity", "on-air.html"), src.replace("__MATH_IMG__", math["img"]))
