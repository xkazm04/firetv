// Verify the standalone evidence pages through file URLs, including every local image.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try {
 for(const folder of process.argv.slice(2)) {
  const output=process.env.CAMPAIGN_GALLERY_OUTPUT?resolve(process.env.CAMPAIGN_GALLERY_OUTPUT,folder.split(/[\\/]/).pop()):resolve(folder);
  await mkdir(output,{recursive:true});
  const page=await browser.newPage({viewport:{width:1440,height:1080}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const url=pathToFileURL(resolve(folder,'index.html')).href;
  await page.goto(url);
  const count=await page.locator('img').count();assert.ok(count>0);
  for(const img of await page.locator('img').all()) {
   await img.scrollIntoViewIfNeeded();
   await img.evaluate(el=>el.decode());
   assert.ok(await img.evaluate(el=>el.naturalWidth>0));
  }
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.deepEqual(errors,[]);await page.evaluate(()=>scrollTo(0,0));
  await page.screenshot({path:resolve(output,'gallery-browser.png')});
  await writeFile(resolve(output,'gallery-browser.json'),JSON.stringify({pass:true,url,images:count,errors},null,2));
  console.log(url+' PASS ('+count+' images)');await page.close();
 }
} finally {await browser.close()}
