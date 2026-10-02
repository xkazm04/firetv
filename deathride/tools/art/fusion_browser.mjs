import {pathToFileURL,fileURLToPath} from 'node:url';
import fs from 'node:fs/promises';
const {chromium}=await import(pathToFileURL(process.argv[2]).href);
const report=fileURLToPath(new URL('../../art/reports/',import.meta.url));
const review=JSON.parse(await fs.readFile(new URL('../../art/review/fusion/review.json',import.meta.url),'utf8'));
if(review.part===5){await import('./states_browser.mjs');process.exit(0);}
const expectedCurrent=review.records.filter(r=>!r.superseded).length;
const expectedAll=review.records.length;
const expectedAllCarRejects=review.records.filter(r=>r.family==='cars'&&r.verdict==='reject').length;
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];
try {
  for(const [width,height] of [[1440,1000],[390,844]]) {
    const page=await browser.newPage({viewport:{width,height}}),errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    await page.goto(new URL('../../art/review/fusion/index.html',import.meta.url).href);
    // Force lazy images to load; validate every export, not only the first viewport.
    await page.evaluate(()=>document.querySelectorAll('img').forEach(i=>i.loading='eager'));
    await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
    const families=await page.locator('#family option').evaluateAll(os=>os.map(o=>o.value));
    for(const family of families){await page.selectOption('#family',family);const bad=await page.locator('article:visible').evaluateAll((xs,f)=>xs.some(x=>f!=='all'&&x.dataset.family!==f),family);if(bad)throw Error('family filter failed');}
    await page.selectOption('#family','all');
    if(await page.locator('article:visible').count()!==expectedCurrent)throw Error('current candidate count differs from manifest');
    await page.check('#originals');
    if(await page.locator('article:visible').count()!==expectedAll)throw Error('all candidate count differs from manifest');
    await page.selectOption('#family','cars');
    if(await page.locator('article:visible .reject').count()!==expectedAllCarRejects)throw Error('car rejections must stay visible');
    await page.selectOption('#family','all');await page.uncheck('#originals');
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    if(errors.length||overflow)throw Error(JSON.stringify({errors,overflow,width}));
    await page.evaluate(()=>scrollTo(0,0));
    await page.screenshot({path:report+`/fusion-browser-${width}.png`,fullPage:false});
    const anchors=await page.locator('a[href]').evaluateAll(xs=>xs.map(x=>x.href));
    for(const href of anchors){const url=new URL(href);url.hash='';if(url.protocol==='file:')await fs.access(fileURLToPath(url));}
    results.push({page:'fusion',width,height,families,images:await page.locator('img').count(),links:anchors.length,errors,overflow});await page.close();
    const surface=await browser.newPage({viewport:{width,height}}),surfaceErrors=[];
    surface.on('pageerror',e=>surfaceErrors.push(String(e)));
    await surface.goto(new URL('../../art/surface-lab/fusion-review.html',import.meta.url).href);
    await surface.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth===1920));
    for(const value of [0,25,75,100]){
      await surface.locator('#wipe').fill(String(value));await surface.locator('#wipe').dispatchEvent('input');
      const clip=await surface.locator('#right').evaluate(e=>e.style.clipPath);
      if(!clip.includes(value+'%'))throw Error('comparison slider failed: '+clip);
    }
    await surface.locator('#wipe').fill('50');await surface.locator('#wipe').dispatchEvent('input');
    const surfaceOverflow=await surface.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    if(surfaceErrors.length||surfaceOverflow)throw Error('surface layout failed');
    for(const href of await surface.locator('a[href]').evaluateAll(xs=>xs.map(x=>x.href))){const url=new URL(href);url.hash='';if(url.protocol==='file:')await fs.access(fileURLToPath(url));}
    await surface.screenshot({path:report+`/fusion-surface-browser-${width}.png`,fullPage:false});
    results.push({page:'surface',width,height,slider:true,images:2,errors:surfaceErrors,overflow:surfaceOverflow});await surface.close();
  }
  await fs.writeFile(report+'/fusion-browser.json',JSON.stringify({status:'pass',results},null,2)+'\n');console.log(JSON.stringify(results));
}finally{await browser.close();}
