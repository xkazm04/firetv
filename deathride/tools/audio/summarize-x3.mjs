// Final read-only account check + durable run summary. Never synthesizes audio.
import fs from 'node:fs';
import {credits,sessionUsage} from './elevenlabs.mjs';
const session='x3-2026-10-02';
const entries=fs.readFileSync('tools/audio/ledger.jsonl','utf8').trim().split(/\r?\n/).map(JSON.parse);
const usage=sessionUsage(entries,session),latest=new Map();
for(const row of entries.filter(r=>r.session===session))latest.set(row.id,row);
if(usage.pending.length||usage.spent>9000)throw Error('Unresolved or exceeded session: stop');
const state=JSON.parse(fs.readFileSync(`tools/audio/session-${session}.json`));
const after=await credits();
const beforeMusic={at:'2026-10-02T22:24:13.039Z',tier:'starter',used:67087,limit:90000,remaining:22913,resetsAt:'2026-10-04T19:31:41.000Z'};
fs.writeFileSync('audio/x3/music/credits-before.json',JSON.stringify({...beforeMusic,source:'read-only credits command captured during this run before local composition'},null,2)+'\n');
fs.writeFileSync('audio/x3/music/credits-after.json',JSON.stringify(after,null,2)+'\n');
const report={at:after.at,session,startingBalance:state.balanceAtOpen,endingBalance:after.remaining,
  accountDelta:state.balanceAtOpen-after.remaining,accountDeltaIsInvoice:false,
  reserve:state.reserve,reserveIntact:after.remaining>=state.reserve,runCap:state.cap,
  conservativeCharge:usage.spent,remainingRunAllowance:state.cap-usage.spent,
  providerHeaderConfirmed:[...latest.values()].reduce((n,r)=>n+(r.providerCredits??0),0),
  allHeadersPresent:[...latest.values()].every(r=>typeof r.providerCredits==='number'),
  generatedTakes:latest.size,unresolved:usage.pending,
  waves:{effects:{newTakes:34,reused:6,conservativeCharge:3440},engines:{newTakes:20,conservativeCharge:2000},
    voices:{newTakes:14,conservativeCharge:960},music:{paidTakes:0,localProofSongs:1,conservativeCharge:0}},
  finalAccount:after,resetUtc:after.resetsAt,
  caveat:'Shared account deltas can include Garden VR or delayed billing. Header-confirmed cost and conservative session charge are distinct. No paid music generation, future job or push.'};
fs.writeFileSync('audio/x3/spend-summary.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
if(!report.reserveIntact)throw Error('Shared account reserve breached: no further generation');
