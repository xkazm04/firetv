// Offline plan and six independent future-session estimates. Never generates.
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const base='audio/x3/music';fs.mkdirSync(`${base}/plans`,{recursive:true});
const rows=[
  ['01-a','Dry mile relay','96 BPM, D minor, dusty tape-echo guitar, deep war drums, dry mechanical percussion, sparse bass',
    'A descending guitar question becomes an octave answer at the peak; drums drop out in the break.'],
  ['01-b','Last water turn','96 BPM, A minor, restrained slide-like plucked guitar, floor toms, low bass, wide dry space',
    'A rising three-note idea gains a second harmony; half-time break, low unambiguous final cadence.'],
  ['02-a','Foundry shift','120 BPM, E minor, industrial metal percussion, heavy drum hits, distorted low bass, minimal melody',
    'Alternating heavy and light metal hits build into syncopated double-time peak; bass-only break.'],
  ['02-b','Iron toll','120 BPM, C minor, engine-like bass pulses, resonant sheet metal, chains and heavy dry drums',
    'Staggered bass accents develop into a wider high-register answer; long empty spaces in the break.'],
  ['03-a','Crooked change','112 BPM, G minor, gritty electric bass, short brass stabs, wah-like guitar, raw drum breaks, playful energy',
    'Bass call and brass response trade places; peak doubles brass rhythm, break exposes the bass.'],
  ['03-b','Loose axle parade','112 BPM, B minor, punchy bass, clipped brass answers, muted guitar scratches, raw drums',
    'A syncopated bass hook changes its ending each phrase; peak adds a countermelody; spare drum break.'],
];
const chapters=[['Intro',15000,'Establish timbre and a short original motif; sparse opening, no full beat initially'],
  ['Verse',35000,'Develop motif and harmony; establish bass and beat; vary each phrase'],
  ['Peak',35000,'Distinct high-energy section with additional rhythm and register; retain motif'],
  ['Break',15000,'Clear instrumentation and energy reduction; develop an alternate motif answer'],
  ['Outro',20000,'Return motif in reduced form; a composed final cadence and natural ending; do not loop']];
const dryRuns=[];const tracks=[];
for(const [id,title,style,development] of rows){
  const plan={positive_global_styles:['Original instrumental score',style,'One coherent full song with changing sections',development],
    negative_global_styles:['vocals','lyrics','spoken words','unvarying repeated loop','abrupt cutoff'],
    sections:chapters.map(([section_name,duration_ms,description])=>({section_name,duration_ms,
      positive_local_styles:[description],negative_local_styles:['vocals','lyrics'],lines:[]}))};
  const planPath=`${base}/plans/${id}.json`;fs.writeFileSync(planPath,JSON.stringify(plan,null,2)+'\n');
  const session=`x3-reset-${id}`;
  const args=['tools/audio/elevenlabs.mjs','music','--composition-plan',planPath,'--out',`audio/full-tracks/${id}.mp3`,
    '--session',session,'--session-cap','9000','--dry-run'];
  const result=spawnSync(process.execPath,args,{encoding:'utf8'});
  if(result.status!==0)throw Error(`Dry-run failed for ${id}: ${result.stderr}`);
  dryRuns.push(JSON.parse(result.stdout));
  tracks.push({id,title,style,development,plan:planPath,seconds:120,estimatedCredits:7200,
    reservedRetryAllowance:1800,totalAllocation:9000,session,
    singleTakeAlternative:{seconds:120,estimatedCredits:7200,model:'music_v1',
      prompt:`Original instrumental. ${style}. ${development} A 120-second complete song: intro 0-15, verse 15-50, peak 50-85, break 85-100, outro 100-120 seconds. Develop the motif and change instrumentation between sections, finish with a composed cadence. No vocals, no loop, no franchise or artist references.`}});
}
const report={at:new Date().toISOString(),status:'offline cost plan only; no paid request or scheduled execution',
  earliestRunUtc:'2026-10-04T19:31:41.000Z',userResetMinuteUtc:'2026-10-04T19:31:00Z',
  reserve:8000,currentRunSession:'x3-2026-10-02',currentRunCharge:6400,currentRunCap:9000,
  trackCount:6,styles:['01','02','03'],seconds:720,baseEstimate:43200,repairAllocation:10800,totalAllocation:54000,
  minimumLiveCreditsWithReserve:62000,gardenAllowance:'additional, agreed with the shared account owner; never infer it from rollover',
  stageOne:{tracks:['01-a','02-a','03-a'],baseEstimate:21600,withRepair:27000,minimumBalance:35000},
  creditRule:'Keep the 60 credits/second conservative guard. Public dollar prices cannot be converted into this account credit allowance.',
  lengthAlternatives:[{seconds:120,estimate:7200,headroom:1800},{seconds:150,estimate:9000,headroom:0},
    {seconds:180,estimate:10800,status:'refused by the existing 9000 per-session cap; use local arrangement or a separately authorized future policy change'}],
  tracks,dryRuns,networkRequests:0};
fs.writeFileSync(`${base}/cost-plan.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({tracks:tracks.length,seconds:report.seconds,estimate:report.baseEstimate,
  allocation:report.totalAllocation,reserve:report.reserve,minimumBalance:report.minimumLiveCreditsWithReserve,networkRequests:0}));
