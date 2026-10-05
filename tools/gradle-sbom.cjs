#!/usr/bin/env node
/**
 * A CycloneDX 1.5 SBOM from Gradle's own resolved dependency report, so what is inside the TV APK can be traced to a
 * Dependabot alert. It needs no Gradle plugin: Gradle already resolves the graph, and this reads its text report.
 *
 *   node tools/gradlew.cjs :tv-app:dependencies --configuration debugRuntimeClasspath -q > deps.txt
 *   node tools/gradle-sbom.cjs deps.txt --name tv-app-debug --version <commit> > tv-app-debug.cdx.json
 *
 * Every resolved module becomes a library component with a Maven purl. The version is the one Gradle selected (the
 * right side of `->`). The tree becomes the `dependencies` graph, and a local `project :x` is a component of its own.
 * Constraint rows `(c)` are not dependencies and are skipped. A row Gradle could not resolve (FAILED, or `(n)` in a
 * resolved configuration) makes the run fail: an SBOM that silently drops a module is worse than none. Exits 1 when
 * the report holds no module at all, which is what a wrong configuration name looks like.
 * Used by .github/workflows/sbom.yml; its suite is tools/gradle-sbom-test.cjs.
 */
const fs = require("node:fs"), crypto = require("node:crypto");

/** One tree row: its depth and what it names, or null for a line that is not a row of the tree. */
function row(line) {
  const m = line.replace(/\r$/, "").match(/^((?:[| ] {4})*)[+\\]--- (.+)$/);
  if (!m) return null;
  let text = m[2].trim(), mark = null;
  const tail = text.match(/\s+(\(\*\)|\(c\)|\(n\)|FAILED)$/);
  if (tail) { mark = tail[1]; text = text.slice(0, tail.index).trim(); }
  return { depth: m[1].length / 5, text, mark };
}

/** `group:name[:version] [-> version | -> group:name:version]` as the coordinates Gradle selected. */
function coordinates(text) {
  const [left, right] = text.split(/\s+->\s+/);
  const parts = left.split(":");
  if (parts.length < 2) return null;
  let group = parts[0], name = parts[1], version = parts.slice(2).join(":");
  if (right !== undefined) {
    const r = right.split(":");
    if (r.length >= 3) { group = r[0]; name = r[1]; version = r.slice(2).join(":"); }
    else version = right;
  }
  version = version.trim();
  if (!group || !name || !version || /[\s{}]/.test(version)) return null;
  return { group, name, version };
}

const purlOf = (c) => `pkg:maven/${encodeURIComponent(c.group)}/${encodeURIComponent(c.name)}@${encodeURIComponent(c.version)}`;

/**
 * The SBOM for one dependency report. Throws when a module could not be resolved or no module was found.
 * `name` and `version` describe the artifact the report is for; `now` and `serial` are injectable for tests.
 */
function sbomOf(report, { name, version = "unversioned", now = new Date().toISOString(), serial = crypto.randomUUID() } = {}) {
  if (!name) throw new Error("gradle-sbom: --name (the artifact the report describes) is required");
  const ROOT = name;
  const components = new Map(), edges = new Map([[ROOT, new Set()]]), unresolved = [];
  const stack = [];
  for (const line of String(report).split("\n")) {
    const r = row(line);
    if (!r) continue;
    stack.length = r.depth;
    if (r.mark === "(c)") { stack.push(null); continue; }
    if (r.mark === "FAILED" || r.mark === "(n)") { unresolved.push(r.text); stack.push(null); continue; }
    let ref;
    const project = r.text.match(/^project\s+(:\S*)$/);
    if (project) {
      ref = `project${project[1]}`;
      if (!components.has(ref)) components.set(ref, { type: "library", "bom-ref": ref, name: project[1], version });
    } else {
      const c = coordinates(r.text);
      if (!c) { unresolved.push(r.text); stack.push(null); continue; }
      ref = purlOf(c);
      if (!components.has(ref)) components.set(ref, { type: "library", "bom-ref": ref, group: c.group, name: c.name, version: c.version, purl: ref });
    }
    const parent = r.depth === 0 ? ROOT : stack[r.depth - 1];
    if (parent) { if (!edges.has(parent)) edges.set(parent, new Set()); edges.get(parent).add(ref); }
    if (!edges.has(ref)) edges.set(ref, new Set());
    stack.push(ref);
  }
  if (unresolved.length) throw new Error(`gradle-sbom: Gradle could not resolve ${unresolved.length} module(s): ${unresolved.slice(0, 5).join(", ")}`);
  if (!components.size) throw new Error("gradle-sbom: the report holds no module (is the configuration name right?)");
  return {
    bomFormat: "CycloneDX",
    specVersion: "1.5",
    serialNumber: `urn:uuid:${serial}`,
    version: 1,
    metadata: {
      timestamp: now,
      tools: { components: [{ type: "application", name: "firetv tools/gradle-sbom.cjs" }] },
      component: { type: "application", "bom-ref": ROOT, name, version },
    },
    components: [...components.values()].sort((a, b) => a["bom-ref"].localeCompare(b["bom-ref"])),
    dependencies: [...edges].map(([ref, on]) => ({ ref, dependsOn: [...on].sort() })).sort((a, b) => a.ref.localeCompare(b.ref)),
  };
}

function main(argv) {
  const file = argv.find((a, i) => !a.startsWith("--") && !(i > 0 && argv[i - 1].startsWith("--")));
  const flag = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
  if (!file) { console.error("usage: node tools/gradle-sbom.cjs <dependencies-report.txt> --name <artifact> [--version <v>]"); return 2; }
  try {
    const bom = sbomOf(fs.readFileSync(file, "utf8"), { name: flag("--name"), version: flag("--version") });
    process.stdout.write(JSON.stringify(bom, null, 2) + "\n");
    console.error(`gradle-sbom: ${bom.components.length} components`);
    return 0;
  } catch (e) {
    console.error(e.message);
    return 1;
  }
}

if (require.main === module) process.exitCode = main(process.argv.slice(2));
module.exports = { row, coordinates, purlOf, sbomOf, main };
