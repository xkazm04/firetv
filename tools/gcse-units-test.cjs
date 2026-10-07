/**
 * The M2b sweep (v2 slice M2b, the first GCSE Foundation units beyond the school path): the kill test for Pythagoras' theorem
 * and the probability of an event. Each unit's generator is run over tiers 1 and 2, systems uk, us, cz and de, and SEEDS seeds
 * (at least 500), and the sweep counts, with its own arithmetic (integers and integer fractions, no code of school.ts):
 *   1. generated specs that are not well formed;
 *   2. specs that are not fair: the question prints its own answer (a number in it equals the answer, as a figure or a
 *      percent), or leaksSchool refuses the question itself;
 *   3. worked answers that `check` does not mark right (workedAnswer null, or check not "right"), per system;
 *   4. per listed slip: the seeds where it is reachable (its value exists and differs from the answer and from every other
 *      slip's) and the seeds where `check` returns that slip, for its own value, under all four systems.
 * Accept: counts 1-3 are zero for the unit, and every listed slip is both reachable and detected on every seed it is reachable on.
 * Kill: a unit that fails and cannot be fixed in its generator or check is withheld: it stays out of SCHOOL_GENERATORS and off the
 * path (its code and rows are kept). This suite fails when a unit that is in SCHOOL_GENERATORS does not pass. It prints the table.
 * Pure: no store, no route, no model, no network. Run with npm test in desk/ (directly: node tools/gcse-units-test.cjs).
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test}=require('node:test');
const root=path.resolve(__dirname,'../desk');
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const S=require(path.join(root,'src/lib/rules/school.ts'));

const SEEDS=500,TIERS=[1,2],SYSTEMS=['uk','us','cz','de'];
const UNITS={pythagoras:S.GCSE_GENERATORS.pythagoras,probability:S.GCSE_GENERATORS.probability};

// ---- integer fractions: [n, d], d > 0, reduced
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b];}return a;};
const fr=(n,d=1)=>{const g=gcd(n,d)||1;return d<0?[-n/g,-d/g]:[n/g,d/g];};
const same=(a,b)=>a[0]*b[1]===b[0]*a[1];
const show=(f)=>(f[1]===1?String(f[0]):`${f[0]}/${f[1]}`);
/** A number token of a question as a fraction ('7', '0.35', '35%'). */
const tokenValue=(t)=>{if(t.includes('/')){const [n,d]=t.split('/').map(Number);return fr(n,d);}const pct=t.endsWith('%'),x=pct?t.slice(0,-1):t,[w,f='']=x.split('.');return fr(+(w+f),(10**f.length)*(pct?100:1));};

/** The reference reading of a generated spec: its answer as a fraction and each slip's value (an id is left out when its value is the answer's or another slip's). */
function reference(unit,spec){
 const slips={};
 const keep=(cands,truth)=>{for(const [id,v] of cands)if(!same(v,truth)&&!cands.some(([id2,v2])=>id2!==id&&same(v,v2)))slips[id]=v;};
 if(unit==='pythagoras'){
  const m=/^(longest|shorter) (\d+) (\d+)$/.exec(spec.expr);if(!m||spec.shape!=='pythagoras')return null;
  const x=+m[2],y=+m[3],root=(n)=>{const r=Math.round(Math.sqrt(n));return r*r===n?r:null;};
  const t=m[1]==='longest'?root(x*x+y*y):root(x*x-y*y);if(t===null)return null;
  const truth=fr(t);
  keep([['pyth-sides-added',fr(x+y)],['pyth-no-root',fr(m[1]==='longest'?x*x+y*y:x*x-y*y)],...(m[1]==='shorter'?[['pyth-squares-added',fr(x*x+y*y)]]:[])],truth);
  return {truth,slips};
 }
 let m=/^complement (\w+) (?:0\.(\d+)|(\d+)%)$/.exec(spec.expr);
 if(m){const v=m[3]!==undefined?+m[3]:+m[2].padEnd(2,'0'),truth=fr(100-v,100);keep([['prob-own',fr(v,100)]],truth);return {truth,slips};}
 m=/^bag ((?:\w+ \d+)(?:, \w+ \d+){1,3}) ask (?:(\w+)|not (\w+)|(\w+) or (\w+))$/.exec(spec.expr);if(!m)return null;
 const bag=m[1].split(', ').map((x)=>x.split(' ')),cnt=Object.fromEntries(bag.map(([c,n])=>[c,+n])),tot=bag.reduce((a,[,n])=>a+ +n,0);
 const mode=m[2]?'colour':m[3]?'not':'or',ask=m[2]?[m[2]]:m[3]?[m[3]]:[m[4],m[5]],ev=ask.reduce((a,c)=>a+cnt[c],0),asked=mode==='not'?tot-ev:ev;
 const truth=fr(asked,tot);
 keep([['prob-count-alone',fr(asked)],['prob-part-over-rest',fr(asked,tot-asked)],['prob-one-over-colours',fr(1,bag.length)],...(mode==='not'?[['prob-own',fr(ev,tot)]]:[])],truth);
 return {truth,slips};
}

/** Does a question print its own answer: any figure, fraction or percent in it equal to the answer? */
const printsAnswer=(plain,truth)=>(plain.match(/\d+\/\d+|\d+(?:\.\d+)?%?/g)??[]).some((t)=>same(tokenValue(t),truth));
/** Does check name the slip for its own value under every system? */
const detected=(spec,id,v)=>SYSTEMS.every((sys)=>{const got=S.check(spec,show(v),sys);return got.verdict==='wrong'&&got.slip===id;});
const newRow=(unit)=>({specs:0,notWellFormed:[],notFair:[],workedNotRight:[],slips:Object.fromEntries(S.SCHOOL_UNIT_SLIPS[unit].map((id)=>[id,{reachable:0,detected:0,missed:[]}])),workedChecked:0});
/** One generated spec through the four counts. */
function sweepSpec(unit,spec,tag,row){
 row.specs++;
 if(!spec||!S.wellFormed(spec).ok||S.unitOf(spec)!==unit){row.notWellFormed.push(`${tag} ${JSON.stringify(spec)}`);return;}
 const ref=reference(unit,spec);
 if(!ref){row.notWellFormed.push(`${tag} ${spec.expr}: the reference cannot read it`);return;}
 // 2. fair: no number of the question is the answer; the question is not a leak
 const q=S.question(spec);
 if(!q||printsAnswer(q.plain,ref.truth)||S.leaksSchool(spec,q.plain))row.notFair.push(`${tag} ${q&&q.plain}`);
 // 3. the worked answer is marked right, under every system
 for(const sys of SYSTEMS){
  row.workedChecked++;
  const w=S.workedAnswer(spec,sys);
  if(w===null||S.check(spec,w,sys).verdict!=='right')row.workedNotRight.push(`${tag} ${sys}: ${w}`);
 }
 // 4. each listed slip: reachable here, and check names it for its own value under every system
 for(const [id,rec] of Object.entries(row.slips)){
  const v=ref.slips[id];if(!v)continue;
  rec.reachable++;
  if(detected(spec,id,v))rec.detected++;else rec.missed.push(`${tag} ${show(v)}`);
 }
}
const passesOf=(row)=>!row.notWellFormed.length&&!row.notFair.length&&!row.workedNotRight.length&&Object.values(row.slips).every((r)=>r.reachable>0&&r.detected===r.reachable);

test('M2b sweep controls: the counts are able to fail - a spec that is not well formed, a question that prints its answer, a slip check does not name',()=>{
 const row=newRow('pythagoras');
 sweepSpec('pythagoras',{shape:'pythagoras',expr:'longest 6 7',unit:'cm'},'control',row);
 sweepSpec('pythagoras',null,'control',row);
 assert.equal(row.notWellFormed.length,2);assert.equal(passesOf(row),false);
 assert.equal(printsAnswer('The chance is 3/10.',fr(3,10)),true);assert.equal(printsAnswer('Is it 0.3?',fr(3,10)),true);assert.equal(printsAnswer('It is 30%.',fr(3,10)),true);assert.equal(printsAnswer('Find 6/20.',fr(3,10)),true);
 assert.equal(printsAnswer('A bag has 3 red and 7 blue counters.',fr(3,10)),false);assert.equal(printsAnswer('Shorter sides 6 cm and 8 cm.',fr(10)),false);assert.equal(printsAnswer('Shorter sides 6 cm and 10 cm.',fr(10)),true);
 const PA={shape:'pythagoras',expr:'longest 6 8',unit:'cm'};
 assert.equal(detected(PA,'pyth-sides-added',fr(14)),true);assert.equal(detected(PA,'pyth-sides-added',fr(15)),false,'a value that is no slip is not detected');assert.equal(detected(PA,'pyth-no-root',fr(14)),false,'another slip\x27s value is not this slip');
 assert.equal(detected(PA,'pyth-no-root',fr(10)),false,'the answer is not a slip');
 // the reference is independent of school.ts: it finds the slips by its own arithmetic
 assert.deepEqual(Object.keys(reference('pythagoras',PA).slips),['pyth-sides-added','pyth-no-root']);
 assert.deepEqual(Object.keys(reference('probability',{shape:'probability',expr:'bag red 4, blue 4, green 4 ask red'}).slips),['prob-count-alone','prob-part-over-rest'],'three equal colours: one over the colours is the answer');
});

const RESULTS={};
for(const [unit,gen] of Object.entries(UNITS)){
 test(`M2b sweep ${unit}: ${TIERS.length*SEEDS} generated specs over tiers 1 and 2, systems ${SYSTEMS.join(', ')}`,()=>{
  assert.equal(typeof gen,'function');
  const row=newRow(unit);
  for(const tier of TIERS)for(let seed=1;seed<=SEEDS;seed++)sweepSpec(unit,gen(seed,tier),`${unit} ${tier}/${seed}`,row);
  RESULTS[unit]=row;
  const slipLine=Object.entries(row.slips).map(([id,r])=>`${id} ${r.reachable}/${r.detected}`).join(', ');
  console.log(`# M2b sweep ${unit}: specs ${row.specs}, not well formed ${row.notWellFormed.length}, not fair ${row.notFair.length}, worked answers not right ${row.workedNotRight.length} of ${row.workedChecked}; slips reachable/detected: ${slipLine}`);
  const registered=Object.prototype.hasOwnProperty.call(S.SCHOOL_GENERATORS,unit);
  console.log(`# M2b sweep ${unit}: ${passesOf(row)?'PASSES':'FAILS'}${registered?' (in SCHOOL_GENERATORS)':' (not in SCHOOL_GENERATORS: withheld or not yet registered)'}`);
  if(registered){
   assert.deepEqual(row.notWellFormed.slice(0,5),[]);assert.deepEqual(row.notFair.slice(0,5),[]);assert.deepEqual(row.workedNotRight.slice(0,5),[]);
   for(const [id,r] of Object.entries(row.slips)){assert.ok(r.reachable>0,`slip ${id} is reachable`);assert.deepEqual(r.missed.slice(0,5),[],`slip ${id} is detected on every seed it is reachable on`);}
  }
  assert.ok(row.specs>=1000,'at least 500 seeds a tier');
 });
}

test('M2b sweep: the table',()=>{
 const pad=(s,n)=>String(s).padEnd(n);
 const lines=['','M2b sweep (tiers 1 and 2, uk us cz de, seeds 1..'+SEEDS+')',pad('unit',12)+pad('specs',7)+pad('not well formed',17)+pad('not fair',10)+pad('worked not right',18)+'slips (reachable / detected)'];
 for(const [unit,row] of Object.entries(RESULTS))lines.push(pad(unit,12)+pad(row.specs,7)+pad(row.notWellFormed.length,17)+pad(row.notFair.length,10)+pad(`${row.workedNotRight.length} of ${row.workedChecked}`,18)+Object.entries(row.slips).map(([id,r])=>`${id} ${r.reachable}/${r.detected}`).join('; '));
 console.log(lines.join('\n'));
 assert.deepEqual(Object.keys(RESULTS).sort(),Object.keys(UNITS).sort());
});
