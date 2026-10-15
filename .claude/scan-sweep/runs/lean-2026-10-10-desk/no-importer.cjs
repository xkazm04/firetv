// node no-importer.cjs: .ts/.tsx under desk/src that no desk/src file imports; namedByTools says whether a tools/ file requires or names it (false = a true no-importer)
const L = require("./lib.cjs");
const entry = /(^|\/)(page|layout|route)\.tsx?$|(^|\/)(instrumentation|proxy)\.ts$/;
const imported = new Set();
for (const f of L.files) for (const e of L.edges(f).edges) { const r = L.resolve(f, e.spec); if (r && r !== f) imported.add(r); }
const out = [];
for (const f of L.files) {
  const r = L.rel(f);
  if (imported.has(f) || entry.test(r)) continue;
  const noExt = r.replace(/^desk\/src\//, "").replace(/\.tsx?$/, "");
  const named = L.toolsText.includes(noExt) || L.toolsText.includes(L.path.basename(r));
  out.push({ file: r, namedByTools: named });
}
out.forEach((o) => console.log(JSON.stringify(o)));
console.error(out.length + " file(s) with no desk/src importer; " + out.filter((o) => !o.namedByTools).length + " also named by no tools/ file");
