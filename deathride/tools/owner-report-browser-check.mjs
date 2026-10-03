import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {access,mkdir,writeFile} from 'node:fs/promises';
const target=process.argv[2]||'evidence/owner-decisions/campaign/index.html';
const output=resolve(process.argv[3]||'evidence/owner-decisions/campaign/browser');
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];
try {
  for(const width of [1440,390]) {
    const page=await browser.newPage({viewport:{width,height:900}}),errors=[],remote=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('request',r=>{if(/^https?:/.test(r.url()))remote.push(r.url())});
    await page.goto(pathToFileURL(resolve(target)).href);
    for(const link of await page.locator('a[href]').evaluateAll(xs=>xs.map(x=>x.href)))
      if(link.startsWith('file:'))await access(fileURLToPath(new URL(link)));
    for(const img of await page.locator('img').all())await img.evaluate(el=>el.decode());
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);
    await page.screenshot({path:resolve(output,`${width}.png`)});
    results.push({width,pass:true,localLinks:true,errors,remote});
    await page.close();
  }
  await writeFile(resolve(output,'result.json'),JSON.stringify({target,results},null,2)+'\n');
  console.log('Owner application report browser PASS');
} finally {await browser.close()}
