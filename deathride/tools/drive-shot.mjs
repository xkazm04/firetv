// Screenshots the Drive pad mid-gesture (ring at the landing point, dot, GO/BRAKE fills). Usage: node tools/drive-shot.mjs <base> <pin> [outDir]
import {chromium} from 'playwright';
const [base,pin,out='evidence']=process.argv.slice(2);
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE});
const ctx=await browser.newContext({viewport:{width:896,height:414},isMobile:true,hasTouch:true});const p=await ctx.newPage();
await p.goto(base+'/?pin='+pin);await p.waitForFunction(()=>document.getElementById('player').textContent.startsWith('PLAYER'));
const cdp=await ctx.newCDPSession(p),b=await p.locator('#steer').boundingBox();
const tp=(x,y,id)=>({x:Math.round(x),y:Math.round(y),id,radiusX:8,radiusY:8});const touch=(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points});
const sx=b.x+b.width*.3,sy=b.y+b.height*.55;
await touch('touchStart',[tp(sx,sy,1)]);await touch('touchMove',[tp(sx+30,sy-60,1)]);await p.waitForTimeout(300);await p.screenshot({path:out+'/controller-drive-go.png'});
await touch('touchMove',[tp(sx-20,sy+45,1)]);await p.waitForTimeout(300);await p.screenshot({path:out+'/controller-drive-brake.png'});
await touch('touchEnd',[]);await browser.close();
