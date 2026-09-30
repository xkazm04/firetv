// Reads public route/pose telemetry and sends ordinary controller inputs. No sim mutation or host AI takeover.
import {readFileSync} from 'node:fs';
export const tuning=JSON.parse(readFileSync(new URL('./pilot-tuning.json',import.meta.url)));
const rows=readFileSync(new URL('../core/src/main/resources/data/stat-mapping.csv',import.meta.url),'utf8').trim().split(/\r?\n/);
const keys=rows.shift().split(','),mapping=rows.map(row=>Object.fromEntries(row.split(',').map((v,i)=>[keys[i],v])));
const derive=(parameter,stats)=>{const m=mapping.find(x=>x.parameter===parameter);return Number(m.base)+Number(m.perPoint)*stats[m.stat]};
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const wrap=a=>{while(a>Math.PI)a-=2*Math.PI;while(a< -Math.PI)a+=2*Math.PI;return a};
export class Pilot {
 constructor(routes){this.routes=routes;this.previous=new Map()}
 command(stats,id){
  const c=stats.slots[id],route=this.routes.find(x=>x.id===stats.track.id);
  if(stats.phase!=='race'||c.combat.wrecked)return{s:0,a:0,b:0,h:0,fire:0,mine:0,weapon:0};
  let best=Infinity,arc=0;const points=route.points;
  for(let i=0;i<points.length-1;i++){
   const a=points[i],b=points[i+1],dx=b[0]-a[0],dy=b[1]-a[1],t=clamp(((c.xM-a[0])*dx+(c.yM-a[1])*dy)/(dx*dx+dy*dy),0,1);
   const d=(c.xM-a[0]-t*dx)**2+(c.yM-a[1]-t*dy)**2;if(d<best){best=d;arc=a[2]+(b[2]-a[2])*t}
  }
  const look=tuning.lookAheadM+c.speedMps*tuning.lookAheadSeconds,s=(arc+look)%route.lengthM;
  let i=0;while(i<points.length-2&&points[i+1][2]<s)i++;
  const a=points[i],b=points[i+1],t=(s-a[2])/(b[2]-a[2]),x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t;
  const old=this.previous.get(id),motion=old&&Math.hypot(c.xM-old.x,c.yM-old.y)>.1?Math.atan2(c.yM-old.y,c.xM-old.x):c.heading;
  this.previous.set(id,{x:c.xM,y:c.yM});
  const error=wrap(Math.atan2(y-c.yM,x-c.xM)-c.heading-wrap(motion-c.heading)*tuning.slipCompensation);
  const f=stats.feel,authority=f.lowSpeedAuthority+(f.highSpeedAuthority-f.lowSpeedAuthority)*clamp(c.speedMps/f.speedBlendMps,0,1);
  const shaped=clamp((-error*tuning.steerGain+c.yaw*tuning.yawDamping)/authority,-1,1);
  const steer=Math.sign(shaped)*(f.deadZone+(1-f.deadZone)*Math.abs(shaped)**(1/f.exponent));
  const maximum=derive('maxSpeedMps',c.car.stats),grip=derive('maxLateralAccelerationMps2',c.car.stats);
  const target=Math.min(maximum*tuning.cruiseFraction,Math.sqrt(grip*a[4]*tuning.cornerGripFraction/Math.max(.00001,a[3])))*(1-Math.min(tuning.maximumErrorSlowdown,Math.abs(error)*tuning.cornerErrorSlowdown));
  return{s:steer,a:c.speedMps<target?1:tuning.coastThrottle,b:c.speedMps>target+tuning.brakeOverspeedMps?tuning.brakeAmount:0,h:0,fire:1,mine:1,weapon:0};
 }
}
export async function installPilot(page){
 await page.addInitScript(()=>{
  const send=WebSocket.prototype.send;
  WebSocket.prototype.send=function(data){try{const m=JSON.parse(data);if(m.t==='i'&&window.__pilot)data=JSON.stringify({...m,...window.__pilot})}catch{}return send.call(this,data)};
 });
}
