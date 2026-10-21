// The Writing hand-off panel as the joined phone sees it, at 360 and 414 px: node tools/stick-walk/writing-panel.cjs <desk-url> <out-dir>
// Needs the phone's state from phone.cjs (<out-dir>/.state-360.json) and an open `writing` ask on the TV. Types a paragraph but
// never presses Send: Send is the model call and it saves the learner's record.
const { chromium } = require(process.env.PW || "playwright");
const [desk, O] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  for (const w of [360, 414]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 780 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, storageState: O + "/.state-360.json" });
    const p = await ctx.newPage();
    await p.goto(desk + "/phone", { waitUntil: "networkidle" });
    await p.waitForTimeout(2500);
    await p.screenshot({ path: `${O}/wr-phone-${w}-panel.png` });
    const box = p.locator("textarea").first();
    if (await box.count()) {
      await box.fill("I think schools should have a uniform. It stops the daily argument about clothes.");
      await p.screenshot({ path: `${O}/wr-phone-${w}-typed.png` });
    }
    console.log(w, "overflow", await p.evaluate(() => document.documentElement.scrollWidth - innerWidth), "|", (await p.locator("body").innerText()).slice(0, 400).replace(/\n+/g, " | "));
    console.log(w, "buttons", JSON.stringify(await p.getByRole("button").allInnerTexts()));
    await ctx.close();
  }
  await b.close();
})();
