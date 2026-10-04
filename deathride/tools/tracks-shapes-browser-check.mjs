import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const output=resolve(process.argv[2]||'evidence/tracks/r1/browser');await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});const results=[];
try {
 for(const width of [1440,390]) {
  const context=await browser.newContext({viewport:{width,height:1000}});const page=await context.newPage();const errors=[],remote=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))remote.push(r.url())});
  await page.goto(pathToFileURL(resolve('tracks/atlas/shapes.html')).href);await page.waitForFunction(()=>window.shapeReady);
  assert.equal(await page.locator('article.card').count(),29);assert.ok((await page.locator('#summary').textContent()).includes('29 fail shape gates'));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.locator('article.card').first().getByRole('radio',{name:'Maybe',exact:true}).check();
  await page.locator('article.card textarea').first().fill('shape | note\nsecond line');await page.locator('#refresh-export').click();
  assert.match(await page.locator('#export').inputValue(),/shape &#124; note<br>second line/);
  await page.reload();await page.waitForFunction(()=>window.shapeReady);assert.ok(await page.locator('article.card').first().getByRole('radio',{name:'Maybe',exact:true}).isChecked());
  await page.locator('#theme').selectOption('dark');await page.screenshot({path:resolve(output,`shapes-${width}.png`)});
  if(width===1440) {const encoded=await page.locator('#sheet').evaluate(e=>e.toDataURL().split(',')[1]);await writeFile(resolve(output,'outline-sheet.png'),Buffer.from(encoded,'base64'))}
  assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);results.push({width,pass:true,errors,remote});await context.close();
 }
 await writeFile(resolve(output,'result.json'),JSON.stringify({pass:true,results},null,2));console.log('R1 browser PASS');
}finally{await browser.close()}
