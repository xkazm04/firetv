// Phone side of the stick walk: a desktop browser at a phone width against the same desk the stick shows.
// usage: node tools/stick-walk/phone.cjs <width> <code|-> <desk-url> <out-dir> [script...]
// Needs playwright (tools/node_modules in the main checkout): set PW to its path if it is not found.
const path = require("path");
const { chromium } = require(process.env.PW || "playwright");
const [width, code, desk, out] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: +width, height: 780 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  const logs = [];
  p.on("console", (m) => m.type() === "error" && logs.push(m.text()));
  p.on("pageerror", (e) => logs.push("pageerror: " + e.message));
  const shot = async (n) => { await p.screenshot({ path: path.join(out, `phone-${width}-${n}.png`), fullPage: false }); console.log("shot", n); };
  await p.goto(desk + "/phone" + (code !== "-" ? "" : ""), { waitUntil: "networkidle" });
  await shot("a-lobby");
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  console.log("horizontal overflow px:", overflow);
  if (code !== "-") {
    const inp = p.locator("input").first();
    await inp.fill(code);
    await p.waitForTimeout(2500);
    await shot("b-joined");
    console.log("overflow after join:", await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth));
  }
  console.log("body text:", (await p.locator("body").innerText()).slice(0, 600).replace(/\n+/g, " | "));
  console.log("console errors:", JSON.stringify(logs));
  await ctx.storageState({ path: path.join(out, `.state-${width}.json`) });
  await b.close();
})();
