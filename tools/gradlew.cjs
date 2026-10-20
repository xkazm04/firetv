/**
 * Runs the root Gradle wrapper the same way on every host, so one command line in `.ai/manifest.yaml`, AGENTS.md
 * and CI means the same thing on the operator's Windows machine and on a Linux runner. `node tools/gradlew.cjs
 * :core:test` is `gradlew.bat :core:test` on Windows and `sh ./gradlew :core:test` elsewhere, run from the repo
 * root whatever the caller's directory, with the arguments passed through and Gradle's exit code kept.
 * It is the root build only: deathride/ has its own wrapper and is run from that directory.
 */
const { spawnSync } = require("node:child_process"), path = require("node:path");
const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const win = process.platform === "win32";
// A .bat cannot be spawned without a shell on current Node (CVE-2024-27980); Gradle task names need no quoting.
const run = win
  ? spawnSync("gradlew.bat", args, { cwd: root, stdio: "inherit", shell: true })
  : spawnSync("sh", ["./gradlew", ...args], { cwd: root, stdio: "inherit" });
if (run.error) {
  console.error("gradlew.cjs: could not start the Gradle wrapper: " + run.error.message);
  process.exit(1);
}
process.exit(run.status === null ? 1 : run.status);
