// Memory/thermal sampler for ability-stick-probe, in its own process. P9/P10: every host pump stall began 0.6-2 s
// after the probe's own adb meminfo/thermal sample, which then spawned, completed and logged on the pump's event loop,
// while the heartbeat isolate saw none. Here the adb children, their completion and the progress line run in this
// process at Normal priority; the probe only sends a small request and receives a small acknowledgement.
// Same commands, same parsing, same sample fields; the probe still decides when to sample.
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const {device,adbPort,testPackage}=JSON.parse(process.argv[2]),run=promisify(execFile);
const samples=[],adbReconnects=[],now=()=>performance.timeOrigin+performance.now();
async function runAdb(args,options){try{return await run('adb',['-P',adbPort,'-s',device,...args],options)}catch(error){if(!/device .*not found|device offline|cannot connect to daemon|failed to start daemon/.test(String(error.stderr||error.message)))throw error;adbReconnects.push({utc:new Date().toISOString(),command:args.join(' ')});await run('adb',['-P',adbPort,'connect',device],{encoding:'utf8',windowsHide:true,timeout:10000});return await run('adb',['-P',adbPort,'-s',device,...args],options)}}
const adb=async(...a)=>(await runAdb(a,{encoding:'utf8',windowsHide:true,timeout:20000,maxBuffer:2e6})).stdout;
process.on('message',async m=>{
 if(m.t==='sample'){
  const startedEpochMs=now();
  try{
   const [text,thermal]=await Promise.all([adb('shell','dumpsys','meminfo','--local',testPackage),adb('shell','dumpsys','thermalservice')]);
   samples.push({second:m.second,hostMemory:m.hostMemory,pssKb:Number(text.match(/TOTAL PSS:\s+(\d+)/)?.[1]??text.match(/TOTAL\s+(\d+)/)?.[1]??-1),thermalStatus:Number(thermal.match(/Thermal Status: (\d+)/)?.[1]??-1),text,thermal,
    sampler:{requestedEpochMs:m.requestedEpochMs,startedEpochMs,completedEpochMs:now(),pid:process.pid}});
   console.log(JSON.stringify({second:Math.round(m.second),accepted:m.accepted,rejected:m.rejected,hostPumpStalls:m.hostPumpStalls}));
   process.send({t:'sampled',id:m.id});
  }catch(error){process.send({t:'sampleError',id:m.id,error:String(error.stack||error)})}
 }else if(m.t==='finish')process.send({t:'samples',samples,adbReconnects},()=>process.exit(0));
});
