/**
 * tools/gradle-sbom.cjs: Gradle's resolved dependency report becomes a CycloneDX SBOM whose versions are the ones
 * Gradle selected, whose graph follows the tree, and which refuses to drop a module it could not resolve. Pure text
 * in, JSON out: no Gradle, no network. Run directly: node tools/gradle-sbom-test.cjs
 */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { row, coordinates, sbomOf } = require("./gradle-sbom.cjs");

// The shape `gradle -q :tv-app:dependencies --configuration debugRuntimeClasspath` prints (trimmed).
const REPORT = [
  "",
  "------------------------------------------------------------",
  "Project ':tv-app'",
  "------------------------------------------------------------",
  "",
  "debugRuntimeClasspath - Resolved configuration for runtime for variant: debug",
  "+--- project :core",
  "|    \\--- org.jetbrains.kotlin:kotlin-stdlib:2.0.21 -> 2.1.0",
  "|         \\--- org.jetbrains:annotations:13.0",
  "+--- androidx.compose:compose-bom:2024.09.00",
  "|    +--- androidx.compose.ui:ui:1.7.0 (c)",
  "|    \\--- androidx.compose.ui:ui-tooling:1.7.0 (c)",
  "+--- androidx.compose.ui:ui -> 1.7.0",
  "|    +--- androidx.annotation:annotation:1.8.0 -> 1.8.1",
  "|    \\--- org.jetbrains.kotlin:kotlin-stdlib:2.0.21 -> 2.1.0 (*)",
  "+--- io.ktor:ktor-server-cio:2.3.12",
  "|    \\--- io.ktor:ktor-server-core:{strictly 2.3.12} -> 2.3.12",
  "\\--- com.example:old:1.0 -> com.example:new:2.0",
  "",
  "(c) - A dependency constraint, not a dependency. The dependency affected by the constraint occurs elsewhere in the tree.",
  "(*) - Indicates repeated occurrences of a transitive dependency subtree.",
].join("\n");
const bom = () => sbomOf(REPORT, { name: "tv-app-debug", version: "abc123", now: "2026-10-05T00:00:00.000Z", serial: "00000000-0000-4000-8000-000000000000" });
const P = (g, n, v) => `pkg:maven/${g}/${n}@${v}`;

test("case 1: a tree row is read with its depth and its mark; a legend line is not a row", () => {
  assert.deepEqual(row("|    \\--- org.jetbrains:annotations:13.0"), { depth: 1, text: "org.jetbrains:annotations:13.0", mark: null });
  assert.deepEqual(row("|    +--- androidx.compose.ui:ui:1.7.0 (c)"), { depth: 1, text: "androidx.compose.ui:ui:1.7.0", mark: "(c)" });
  assert.equal(row("(c) - A dependency constraint, not a dependency."), null);
  assert.equal(row("debugRuntimeClasspath - Resolved configuration for runtime for variant: debug"), null);
});

test("case 2: the version is the one Gradle selected, including a strict pin, a BOM-managed version and a substitution", () => {
  assert.deepEqual(coordinates("org.jetbrains.kotlin:kotlin-stdlib:2.0.21 -> 2.1.0"), { group: "org.jetbrains.kotlin", name: "kotlin-stdlib", version: "2.1.0" });
  assert.deepEqual(coordinates("androidx.compose.ui:ui -> 1.7.0"), { group: "androidx.compose.ui", name: "ui", version: "1.7.0" });
  assert.deepEqual(coordinates("io.ktor:ktor-server-core:{strictly 2.3.12} -> 2.3.12"), { group: "io.ktor", name: "ktor-server-core", version: "2.3.12" });
  assert.deepEqual(coordinates("com.example:old:1.0 -> com.example:new:2.0"), { group: "com.example", name: "new", version: "2.0" });
  assert.equal(coordinates("androidx.compose.ui:ui"), null, "a module with no selected version is not guessed");
});

test("case 3: every resolved module is one component with a Maven purl; constraints are not components", () => {
  const refs = bom().components.map((c) => c["bom-ref"]);
  assert.deepEqual(refs, [
    P("androidx.annotation", "annotation", "1.8.1"),
    P("androidx.compose", "compose-bom", "2024.09.00"),
    P("androidx.compose.ui", "ui", "1.7.0"),
    P("com.example", "new", "2.0"),
    P("io.ktor", "ktor-server-cio", "2.3.12"),
    P("io.ktor", "ktor-server-core", "2.3.12"),
    P("org.jetbrains", "annotations", "13.0"),
    P("org.jetbrains.kotlin", "kotlin-stdlib", "2.1.0"),
    "project:core",
  ].sort((a, b) => a.localeCompare(b)));
  assert.ok(!refs.includes(P("androidx.compose.ui", "ui-tooling", "1.7.0")), "a constraint-only module is not in the APK");
  const ui = bom().components.find((c) => c.name === "ui");
  assert.equal(ui.purl, ui["bom-ref"]);assert.equal(ui.group, "androidx.compose.ui");assert.equal(ui.version, "1.7.0");
});

test("case 4: the dependency graph follows the tree, and a repeated subtree (*) adds its edge without a duplicate", () => {
  const deps = Object.fromEntries(bom().dependencies.map((d) => [d.ref, d.dependsOn]));
  assert.deepEqual(deps["tv-app-debug"], ["pkg:maven/androidx.compose.ui/ui@1.7.0", "pkg:maven/androidx.compose/compose-bom@2024.09.00", "pkg:maven/com.example/new@2.0", "pkg:maven/io.ktor/ktor-server-cio@2.3.12", "project:core"].sort());
  assert.deepEqual(deps["project:core"], [P("org.jetbrains.kotlin", "kotlin-stdlib", "2.1.0")]);
  assert.deepEqual(deps[P("androidx.compose.ui", "ui", "1.7.0")], [P("androidx.annotation", "annotation", "1.8.1"), P("org.jetbrains.kotlin", "kotlin-stdlib", "2.1.0")]);
  assert.deepEqual(deps[P("org.jetbrains.kotlin", "kotlin-stdlib", "2.1.0")], [P("org.jetbrains", "annotations", "13.0")]);
  assert.deepEqual(deps[P("androidx.compose", "compose-bom", "2024.09.00")], [], "constraints are not edges");
});

test("case 5: the document is CycloneDX 1.5 and names the artifact it describes", () => {
  const b = bom();
  assert.equal(b.bomFormat, "CycloneDX");assert.equal(b.specVersion, "1.5");assert.equal(b.version, 1);
  assert.match(b.serialNumber, /^urn:uuid:[0-9a-f-]{36}$/);
  assert.deepEqual(b.metadata.component, { type: "application", "bom-ref": "tv-app-debug", name: "tv-app-debug", version: "abc123" });
  assert.match(sbomOf(REPORT, { name: "x" }).serialNumber, /^urn:uuid:[0-9a-f-]{36}$/, "a fresh serial when none is given");
});

test("case 6: an unresolved module, an empty report or a missing artifact name fails instead of writing a short SBOM", () => {
  assert.throws(() => sbomOf(REPORT + "\n+--- com.example:gone:9.9 FAILED", { name: "x" }), /could not resolve 1 module\(s\): com\.example:gone:9\.9/);
  assert.throws(() => sbomOf("+--- androidx.compose.ui:ui", { name: "x" }), /could not resolve/);
  assert.throws(() => sbomOf("debugRuntimeClasspath - Resolved configuration\nNo dependencies\n", { name: "x" }), /holds no module/);
  assert.throws(() => sbomOf(REPORT, {}), /--name/);
});
