import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {access,mkdir,writeFile,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';

const out=resolve('evidence/regions/g3/browser');
await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const url=pathToFileURL(resolve('regions/index.html')).href, results=[];
const source=JSON.parse(await readFile('regions/data.json','utf8'));
async function imagesReady(page){
  await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
}
try {
  for(const width of [1440,390]) {
    const context=await browser.newContext({viewport:{width,height:1000}});
    const page=await context.newPage(),errors=[],remote=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('request',r=>{if(/^https?:/.test(r.url()))remote.push(r.url())});
    await page.goto(url);await imagesReady(page);
    assert.deepEqual(await page.evaluate(()=>[REGION_REVIEW.g1OwnerApprovedRegions,REGION_REVIEW.g1OwnerApprovedGroundVariants,REGION_REVIEW.runtimeOwnerReviewed,REGION_REVIEW.course]),[5,16,false,'scrap-1-c']);
    assert.equal(await page.locator('article.region-card').count(),5);
    assert.equal(await page.locator('input[type=radio]:checked').count(),0);
    assert.equal(await page.locator('.review-controls textarea').count(),5);
    assert.equal(await page.locator('.palette .swatch').count(),50);
    assert.equal(await page.locator('.props img').count(),11);
    for(const href of await page.locator('a[href]').evaluateAll(xs=>xs.map(x=>x.href))) {
      const u=new URL(href);assert.equal(u.protocol,'file:');u.hash='';u.search='';await access(fileURLToPath(u));
    }
    const captures=new Set();
    for(const camera of ['driving','overview','banner'])for(const materials of ['candidate','tint-fallback','procedural']) {
      await page.locator('#camera').selectOption(camera);await page.locator('#materials').selectOption(materials);await imagesReady(page);
      const selected=await page.locator('.region-render').evaluateAll(xs=>xs.map(i=>i.src));
      assert.equal(new Set(selected).size,5);selected.forEach(p=>captures.add(p));
      for(const region of source.regions) {
        const card=page.locator('#'+region.id);
        assert.match(await card.locator('.region-render').getAttribute('src'),new RegExp(`${region.id}-${materials}-${camera}`));
        assert.ok((await card.getAttribute('data-samples')).includes(source.authoritySha256));
      }
    }
    assert.equal(captures.size,45);
    await page.locator('#camera').selectOption('driving');await page.locator('#materials').selectOption('candidate');await imagesReady(page);
    for(const theme of ['light','dark']) {
      await page.locator('#theme').selectOption(theme);
      assert.ok(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)));
      await page.screenshot({path:resolve(out,`review-${width}-${theme}.png`),fullPage:true});
    }
    // Every region's details must work without overflowing narrow viewports.
    for(const detail of await page.locator('details').all())await detail.evaluate(e=>e.open=true);
    assert.ok(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)));
    await page.screenshot({path:resolve(out,`details-${width}.png`),fullPage:true});
    const card=page.locator('#scrap');
    for(const pick of ['Keep','Maybe','Reject']){await card.locator(`input[value=${pick}]`).check();assert.ok(await card.locator(`input[value=${pick}]`).isChecked())}
    const note='Road | tone \\ test\n<script>literal & safe</script>';
    await card.locator('textarea').fill(note);
    await page.locator('#refresh-export').click();
    const md=await page.locator('#export').inputValue();
    assert.match(md,/Owner region review draft/);assert.match(md,/\| Reject \|/);
    assert.equal((md.match(/Not reviewed/g)||[]).length,4);
    assert.ok(md.includes('&#124;')&&md.includes('&#92;')&&md.includes('&lt;script&gt;'));
    assert.ok(md.includes('capture SHA-256')&&md.includes('Stick pending-busy'));
    await page.reload();await imagesReady(page);
    assert.equal(await card.locator('textarea').inputValue(),note);assert.ok(await card.locator('input[value=Reject]').isChecked());
    await card.locator('.clear-pick').click();assert.equal(await page.locator('input[type=radio]:checked').count(),0);
    await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}});document.execCommand=()=>false});
    await page.locator('#copy').click();assert.match(await page.locator('#status').textContent(),/selected below/);
    assert.match(await page.locator('#status').textContent(),/deathride\/regions\/OWNER-REGIONS-CHOICE.md/);
    assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);
    results.push({width,regions:5,captures:45,menuImages:5,props:11,blankInitialChoices:true,allPicks:true,persistence:true,escapedMarkdown:true,clipboardFallback:true,overflow:false,errors,remote,status:'pass'});
    await context.close();
  }
  const context=await browser.newContext();
  await context.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('storage denied')}}));
  const page=await context.newPage();await page.goto(url);
  assert.match(await page.locator('#status').textContent(),/storage unavailable/);
  await page.locator('#crown input[value=Maybe]').check();
  await page.locator('#crown textarea').fill('Storage denied but export works');
  await page.locator('#refresh-export').click();assert.match(await page.locator('#export').inputValue(),/Storage denied but export works/);
  results.push({storageDenied:true,inMemoryExport:true,status:'pass'});
  await context.close();
  await writeFile(resolve(out,'checks.json'),JSON.stringify(results,null,2)+'\n');
  console.log(JSON.stringify(results));
} finally {await browser.close()}
