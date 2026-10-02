import {pathToFileURL,fileURLToPath} from 'node:url';
import fs from 'node:fs/promises';
const {chromium}=await import(pathToFileURL(process.argv[2]).href);
const folder=new URL('../../art/review/fusion/',import.meta.url);
const report=new URL('../../art/reports/',import.meta.url);
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];
try {
  for(const [width,height] of [[1440,1000],[390,844]]) {
    const page=await browser.newPage({viewport:{width,height}}),errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    await page.goto(new URL('index.html',folder).href);
    await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
    if(await page.locator('article').count()!==28)throw Error('expected 28 current frames');
    for(const car of ['needle','comet','quill','kestrel'])if(await page.locator(`#${car} article`).count()!==7)throw Error('incomplete '+car);
    const native=await page.locator('.native').evaluateAll(xs=>xs.map(x=>({w:x.getBoundingClientRect().width,h:x.getBoundingClientRect().height})));
    if(native.length!==28||native.some(x=>x.w!==96||x.h!==64))throw Error('native dimensions');
    for(const href of await page.locator('a[href]').evaluateAll(xs=>xs.map(x=>x.href))){const url=new URL(href);url.hash='';if(url.protocol==='file:')await fs.access(fileURLToPath(url));}
    await page.locator('article details').first().locator('summary').click();
    if(!await page.locator('article details').first().evaluate(e=>e.open))throw Error('identity details');
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    if(overflow||errors.length)throw Error(JSON.stringify({width,overflow,errors}));
    await page.evaluate(()=>scrollTo(0,0));
    await page.screenshot({path:fileURLToPath(new URL(`art-states-browser-${width}.png`,report)),fullPage:false});
    results.push({width,height,frames:28,images:await page.locator('img').count(),links:await page.locator('a').count(),native:28,overflow,errors});
    await page.close();
  }
  await fs.writeFile(new URL('art-states-browser.json',report),JSON.stringify({status:'pass',results},null,2)+'\n');
  console.log(JSON.stringify(results));
}finally{await browser.close();}
