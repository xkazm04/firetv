const { chromium } = require(process.env.PW); const O = process.argv[2];
(async () => {
  const b = await chromium.launch();
  for (const w of [360, 414]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 780 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, storageState: O + "/.state-360.json" });
    const p = await ctx.newPage(); await p.goto("http://localhost:3000/writing", { waitUntil: "networkidle" });
    await p.getByRole("button", { name: "Screens before bed" }).click();
    await p.getByLabel("Your paragraph").fill("I think screens should go away before bed. They are bright and they are fun.");
    await p.screenshot({ path: `${O}/writing-${w}-write.png` });
    if (w === 360) {
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
