import {pathToFileURL,fileURLToPath} from 'node:url';
import fs from 'node:fs/promises';
const {chromium}=await import(pathToFileURL(process.argv[2]).href);
const folder=new URL('../../art/review/fusion/',import.meta.url);
const report=new URL('../../art/reports/',import.meta.url);
const review=JSON.parse(await fs.readFile(new URL('review.json',folder),'utf8'));
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];
try {
  for(const [width,height] of [[1440,1000],[390,844]]) {
    const page=await browser.newPage({viewport:{width,height}}),errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    await page.goto(new URL('index.html',folder).href);
    await page.evaluate(()=>document.querySelectorAll('img').forEach(i=>i.loading='eager'));
    await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
    const current=review.records.filter(r=>!r.superseded).length;
    if(await page.locator('article:visible').count()!==current)throw Error('current inventory');
    await page.check('#originals');
    if(await page.locator('article:visible').count()!==review.records.length)throw Error('all inventory');
    const families=await page.locator('#family option').evaluateAll(os=>os.map(o=>o.value));
    for(const family of families) {
      await page.selectOption('#family',family);
      if(await page.locator('article:visible').evaluateAll((xs,f)=>xs.some(x=>f!=='all'&&x.dataset.family!==f),family))throw Error('family filter');
    }
    await page.selectOption('#family','cars');await page.uncheck('#originals');
    if(await page.locator('article:visible .owner-approved-reference').count()!==review.approved_reference_count)throw Error('approved reference count');
    const rejects=review.records.filter(r=>!r.superseded&&r.family==='cars'&&r.verdict==='reject').length;
    if(await page.locator('article:visible .reject').count()!==rejects)throw Error('rejections hidden');
    await page.selectOption('#family','all');
    const native=await page.locator('.native img').evaluateAll(xs=>xs.map(x=>({width:x.getBoundingClientRect().width,height:x.getBoundingClientRect().height,naturalWidth:x.naturalWidth,naturalHeight:x.naturalHeight})));
    if(native.length!==8||native.some(x=>x.width!==96||x.height!==64||x.naturalWidth!==96||x.naturalHeight!==64))throw Error('native 96px read');
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    if(overflow||errors.length)throw Error(JSON.stringify({width,overflow,errors}));
    const links=await page.locator('a[href]').evaluateAll(xs=>xs.map(x=>x.href));
    for(const href of links){const url=new URL(href);url.hash='';if(url.protocol==='file:')await fs.access(fileURLToPath(url));}
    await page.evaluate(()=>scrollTo(0,0));
    await page.screenshot({path:fileURLToPath(new URL(`v2-part4-browser-${width}.png`,report)),fullPage:false});
    results.push({width,height,images:await page.locator('img').count(),links:links.length,current,all:review.records.length,carRejects:rejects,approvedReferences:review.approved_reference_count,native,overflow,errors});
    await page.close();
  }
  await fs.writeFile(new URL('v2-part4-browser.json',report),JSON.stringify({status:'pass',results},null,2)+'\n');
  console.log(JSON.stringify(results));
} finally {await browser.close();}
