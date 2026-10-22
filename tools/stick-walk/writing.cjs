// The Writing page (/writing) as the joined phone sees it, at 360 and 414 px: node tools/stick-walk/writing.cjs <desk-url> <out-dir> [--coach]
// Needs the phone's state from phone.cjs (<out-dir>/.state-360.json). Types a paragraph and captures it. Only with --coach does it
// press "Get one note" at 360 px, which is a model call against that desk.
const [desk, O] = process.argv.slice(2).filter((a) => !a.startsWith("--")), coach = process.argv.includes("--coach");
if (!desk || !O) { console.error("usage: node tools/stick-walk/writing.cjs <desk-url> <out-dir> [--coach]"); process.exit(2); }
const { chromium } = require(process.env.PW || "playwright");
(async () => {
  const b = await chromium.launch();
  for (const w of [360, 414]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 780 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, storageState: O + "/.state-360.json" });
    const p = await ctx.newPage(); await p.goto(desk + "/writing", { waitUntil: "networkidle" });
    await p.getByRole("button", { name: "Screens before bed" }).click();
    await p.getByLabel("Your paragraph").fill("I think screens should go away before bed. They are bright and they are fun.");
    await p.screenshot({ path: `${O}/writing-${w}-write.png` });
    if (w === 360 && coach) {
      await p.getByRole("button", { name: /get one note/i }).click();
      await p.getByLabel("Coaching note").waitFor({ timeout: 90000 }).catch(() => console.log("no note"));
      await p.waitForTimeout(500); await p.screenshot({ path: `${O}/writing-360-coached.png` });
      console.log("alert:", await p.getByRole("alert").allInnerTexts(), "note:", await p.getByLabel("Coaching note").allInnerTexts());
    }
    console.log(w, "overflow", await p.evaluate(() => document.documentElement.scrollWidth - innerWidth));
    await ctx.close();
  }
  await b.close();
})();
