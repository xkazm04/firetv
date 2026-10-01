import {pathToFileURL,fileURLToPath} from 'node:url';
import fs from 'node:fs/promises';
const {chromium}=await import(pathToFileURL(process.argv[2]).href);
const report=fileURLToPath(new URL('../../art/reports/',import.meta.url));
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
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    if(errors.length||overflow)throw Error(JSON.stringify({errors,overflow,width}));
    await page.screenshot({path:report+`/fusion-browser-${width}.png`,fullPage:false});
    results.push({width,height,families,images:await page.locator('img').count(),errors,overflow});await page.close();
  }
  await fs.writeFile(report+'/fusion-browser.json',JSON.stringify({status:'pass',results},null,2)+'\n');console.log(JSON.stringify(results));
}finally{await browser.close();}
