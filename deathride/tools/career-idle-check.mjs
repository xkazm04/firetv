import WebSocket from 'ws';import assert from 'node:assert/strict';import {writeFile} from 'node:fs/promises';
const [base,pin]=process.argv.slice(2),pause=ms=>new Promise(r=>setTimeout(r,ms)),stats=async()=>await(await fetch(base+'/stats')).json();
const ws=new WebSocket(base.replace('http','ws')+'/ws'),send=m=>ws.send(JSON.stringify(m));let q=0,interval;
try {
 await new Promise((resolve,reject)=>{ws.on('open',()=>send({t:'hello',pin,profile:'idle-w7-'+Date.now()}));ws.on('message',data=>{const m=JSON.parse(data);if(m.t==='welcome')resolve();if(m.t==='error')reject(Error(m.message))});ws.on('error',reject)});
 interval=setInterval(()=>send({t:'i',q:q++,ts:performance.now(),s:0,a:0,b:0,fire:0,mine:0,weapon:0}),1000/30);
 await pause(350);send({t:'career'});await pause(250);send({t:'car',id:'Comet'});await pause(250);send({t:'careerStart'});await pause(250);
 const rejected=await stats();assert.equal(rejected.phase,'career');assert.ok(rejected.slots[0].career.message.includes('Car locked'));
 send({t:'car',id:'Line'});await pause(250);send({t:'careerStart'});let result;
 for(let n=0;n<190;n++){await pause(1000);result=await stats();if(result.phase==='results')break;if(n%30===0)console.log('Idle qualification check: '+result.raceSeconds.toFixed(1)+' s')}
 assert.equal(result.phase,'results');assert.equal(result.slots[0].career.cleared,0);assert.equal(result.slots[0].career.round,1);assert.equal(result.slots[0].garage.races,1);assert.ok(result.slots[0].garage.receipt.banked>0);
 assert.ok(result.slots[0].career.message.includes('Complete a lap'));
 await writeFile('evidence/phase1/w7-idle-device.json',JSON.stringify({checks:['Locked Comet cannot start the first career event','Idle result receives the normal receipt but does not advance the career'],rejected,result},null,2));console.log('Locked-car gate and idle non-advancement passed on Stick');send({t:'lobby'});
} finally {clearInterval(interval);ws.close()}
