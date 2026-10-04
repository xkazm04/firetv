import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const out=resolve(process.argv[2]||'evidence/tracks/r2/browser');await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});const results=[];
const recipe=await readFile('tracks/composer/example.csv','utf8'),split=await readFile('tracks/composer/split-example.csv','utf8');
const junction='kind,a,b,c,widthW,surface\n'+[[0,0],[30,30],[30,45],[0,45],[0,30],[30,0],[30,-15],[0,-15]].map(([x,y])=>`anchor,${x},${y},3.6,4.8,Asphalt`).join('\n')+'\njunction,15,15,6,4.8,Asphalt\n';
async function compile(recipe){const r=await fetch('http://127.0.0.1:8794/api/compose',{method:'POST',body:new URLSearchParams({id:'foundry',recipe})});assert.equal(r.status,200,await r.clone().text());return r.json()}
try {
 const control=await compile(recipe),branch=await compile(split),crossing=await compile(junction);assert.deepEqual(control.geometry.lint,[]);assert.deepEqual(branch.geometry.lint,[]);assert.deepEqual(crossing.geometry.lint,[]);assert.equal(branch.course.branches.length,1);assert.equal(crossing.course.junctions.length,1);
 for(const width of [1440,390]) {
  const context=await browser.newContext({viewport:{width,height:1000},acceptDownloads:true});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(resolve('tracks/lab/index.html')).href+'?course=foundry');await page.waitForFunction(()=>window.labReady && !document.querySelector('#race').disabled);
  await page.locator('#composer-panel').evaluate(e=>e.open=true);await page.locator('#load-recipe').click();assert.ok(await page.locator('#race').isDisabled());
  await page.locator('#compose').click();await page.waitForFunction(()=>document.querySelector('#composer-status').textContent.startsWith('Compiled')&&!document.querySelector('#race').disabled);
  assert.match(await page.locator('#primitives').textContent(),/hairpin|chicane/);assert.equal(await page.locator('#nodes-csv').inputValue(),control.csv.nodes);
  assert.ok(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)));
  const download=page.waitForEvent('download');await page.locator('#export-bundle').click();await(await download).saveAs(resolve(out,`composer-${width}.zip`));
  await page.locator('#recipe').fill('kind,a,b,c,widthW,surface\nstart,0,0,0,4,Asphalt\n');await page.locator('#compose').click();await page.waitForFunction(()=>!document.querySelector('#compose').disabled);assert.ok(await page.locator('#race').isDisabled());assert.ok(await page.locator('#export-bundle').isDisabled());
  await page.locator('#recipe').fill(split);await page.locator('#compose').click();await page.waitForFunction(()=>document.querySelector('#composer-status').textContent.startsWith('Compiled')&&!document.querySelector('#race').disabled);
  assert.match(await page.locator('#branches-csv').inputValue(),/branchNodes0/);
  if(width===1440) {
   await page.evaluate(c=>{TrackView.draw(document.querySelector('#map'),c,{nodes:false});},crossing.course);await page.locator('#map').screenshot({path:resolve(out,'junction-outline.png')});
   await page.evaluate(c=>{TrackView.draw(document.querySelector('#map'),c,{nodes:false});},branch.course);await page.locator('#map').screenshot({path:resolve(out,'split-outline.png')});
   await page.evaluate(c=>{TrackView.draw(document.querySelector('#map'),c,{nodes:false});},control.course);await page.locator('#map').screenshot({path:resolve(out,'folded-outline.png')});
   await page.locator('#race').click();await page.waitForFunction(()=>window.labRaceReady,{},{timeout:120000});assert.match(await page.locator('#race-status').textContent(),/passes/);
  }
  assert.deepEqual(errors,[]);results.push({width,pass:true,recipeCompile:true,invalidRecipeBlocksRaceAndExport:true,splitPreview:true,errors});await context.close();
 }
 await writeFile(resolve(out,'checks.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results));
}finally{await browser.close()}
