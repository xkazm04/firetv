/**
 * The claude CLI, as the Math Buddy browser check needs it: no model, one fixed practice set. The desk runs it as
 * CLAUDE_BIN, so it takes the real argv and the prompt on stdin and answers with the CLI's JSON envelope. Every call
 * is appended to claude-calls.jsonl in DESK_DATA_DIR, so the check can see the desk really asked.
 * The stated answers are what the desk's own substitution gate is meant to verify; they are not a marking key.
 */
const fs = require("node:fs"), path = require("node:path");

/** Six linear-one-step items, each answer checked by hand: x+4=9 → 5, and so on. */
const SET = [
  { question: "x+4=9", answer: "5" },
  { question: "x-3=7", answer: "10" },
  { question: "4x=28", answer: "7" },
  { question: "x+8=2", answer: "-6" },
  { question: "x/3=5", answer: "15" },
  { question: "6=x-2", answer: "8" },
];

module.exports = { SET };
if (require.main === module) {
  let prompt = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (d) => (prompt += d));
  process.stdin.on("end", () => {
    const argv = process.argv.slice(2);
    if (process.env.DESK_DATA_DIR) fs.appendFileSync(path.join(process.env.DESK_DATA_DIR, "claude-calls.jsonl"), JSON.stringify({ argv: argv.filter((a) => a.startsWith("--")), prompt: prompt.slice(0, 200) }) + "\n");
    // the practice set is the only text call a session from start to marked result makes
    if (!/practice questions/.test(prompt)) { process.stderr.write("the stand-in only writes practice sets"); process.exit(1); }
    process.stdout.write(JSON.stringify({ type: "result", result: "", structured_output: { items: SET } }));
  });
}
