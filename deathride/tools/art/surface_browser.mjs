// Browser audit. Pass an installed Playwright index.mjs as argv[2]. Uses local Chrome.
import {pathToFileURL,fileURLToPath} from 'node:url';
import fs from 'node:fs/promises';
const {chromium}=await import(pathToFileURL(process.argv[2]).href);
const pageURL=new URL('../../art/surface-lab/review.html',import.meta.url).href;
const report=fileURLToPath(new URL('../../art/reports/',import.meta.url));
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];
try {
  for(const [width,height] of [[1440,1000],[390,844]]) {
    const page=await browser.newPage({viewport:{width,height}});const errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    await page.goto(pageURL);await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
    const modes=await page.locator('#mode option').evaluateAll(os=>os.map(o=>o.value));
    for(const mode of modes){await page.selectOption('#mode',mode);await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth===1920));}
    await page.selectOption('#style','2');
    const enabled=await page.locator('#mode option').evaluateAll(os=>os.filter(o=>!o.disabled).map(o=>o.value));
    if(enabled.join(',')!=='painted,combined,lean-stack')throw Error('alternate style mode availability');
    await page.locator('#split').fill('75');await page.locator('#split').dispatchEvent('input');
    const clip=await page.locator('#right').evaluate(e=>e.style.clipPath);
    if(!clip.includes('75%'))throw Error('comparison slider failed');
    await page.selectOption('#style','0');await page.selectOption('#mode',modes.includes('cached-stack')?'cached-stack':modes.includes('efficient-stack')?'efficient-stack':'lean-stack');
    if(modes.includes('cached-stack')&&!(await page.locator('#left').getAttribute('src')).endsWith('0-cached-control.webp'))throw Error('wrong revision control image');
    await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    if(errors.length||overflow)throw Error(JSON.stringify({errors,overflow,width}));
    await page.screenshot({path:report+`/v3-browser-${width}.png`,fullPage:false});
    results.push({width,height,mode_switches:modes.length,alternate_enabled:enabled,slider_clip:clip,errors,overflow});
    await page.close();
  }
  await fs.writeFile(report+'/v3-browser.json',JSON.stringify({status:'pass',results},null,2)+'\n');
  console.log(JSON.stringify(results));
} finally {await browser.close();}
