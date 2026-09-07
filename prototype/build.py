"""
Builds the self-contained prototype page: prototype/src/index.html + prototype/data.json →
prototype/study-desk.html.

The source stays readable; the built file carries the worksheet photos, the model's real hints
and the retrieval picks inline, because the published page may load nothing from anywhere else.

    python prototype/build.py
"""
import json
import os

here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, "src", "index.html"), encoding="utf-8").read()
data = open(os.path.join(here, "data.json"), encoding="utf-8").read()
# A closing script tag inside a JSON string would end the block early; there is none, but be sure.
data = data.replace("</script", "<\\/script")
out = src.replace("/*__DATA__*/null", data)
path = os.path.join(here, "study-desk.html")
open(path, "w", encoding="utf-8").write(out)
print(f"wrote {path}  {os.path.getsize(path) // 1024} KB")
