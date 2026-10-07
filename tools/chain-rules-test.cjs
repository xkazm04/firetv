/**
 * The chain checker's kill test (Study Desk v2 M4c, adult card B1): desk/src/lib/rules/chain.ts rings the first line of a
 * Calculus working that stops holding, and rings nothing it did not check. Measured on 50 clean chains and 50 chains with
 * one planted slip (tools/chain-fixtures.cjs, after rules/calc CALC_SLIPS) before any screen uses it:
 *   - zero clean chains rung (a clean line is true or null, never false);
 *   - each planted slip rung at its own line or left null, never rung at another line;
 *   - under 5 ms a chain.
 * The suite prints the counts: clean chains rung, slips rung at their own line, slips left null, slips rung at another
 * line, the slowest chain. More than 5 of 50 slips left null means the tags are narrowed (the card's kill criterion).
 * Then the tagger (tagLines, chainChecks, chainPen): a Calculus item's own working lines read from its spec, a line it
 * cannot tell is null, and the pen is the first false line. No model is called.
 * Run with npm test in desk/ (directly: node tools/chain-rules-test.cjs).
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test}=require('node:test');
const root=path.resolve(__dirname,'../desk');
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const src=(f)=>path.join(root,'src',f);
const {checkChain,tagLines,chainChecks,chainPen}=require(src('lib/rules/chain.ts'));
const {clean,slips}=require('./chain-fixtures.cjs');

const lines=(ch)=>ch.lines.map(([tag,text,o])=>({tag,text,...(o||{})}));
// best of three: the time is the checker's, not a garbage collection's
const run=(ch)=>{let r,ms=Infinity;for(let k=0;k<3;k++){const t=process.hrtime.bigint();r=checkChain(lines(ch),{from:ch.from,definite:!!ch.definite});ms=Math.min(ms,Number(process.hrtime.bigint()-t)/1e6);}return {r,ms};};
for(const ch of clean.concat(slips))run(ch); // warm the engine's first call out of the timing

test('the fixture is 50 clean chains and 50 planted slips across the six strands',()=>{
  assert.equal(clean.length,50);assert.equal(slips.length,50);
  assert.deepEqual([...new Set(clean.map((c)=>c.strand))].sort(),['anti','crit','diff','diffat','lim','val']);
  for(const sl of slips)assert.ok(sl.slip>=0&&sl.slip<sl.lines.length);
});

test('chain: no clean chain has a line rung (chain.ts checkChain)',()=>{
  let rung=0;
  for(const ch of clean){const {r}=run(ch);if(r.includes(false)){rung++;console.log('  clean chain rung:',ch.from,JSON.stringify(ch.lines),JSON.stringify(r));}}
  assert.equal(rung,0);
});

test('chain: each planted slip is rung at its own line or left null, never at another line; under 5 ms a chain',()=>{
  let own=0,miss=0,other=0,max=0;
  for(const sl of slips){
    const {r,ms}=run(sl);max=Math.max(max,ms);
    const rung=r.indexOf(false);
    if(rung<0){miss++;console.log('  slip left null:',sl.id,sl.from,JSON.stringify(sl.lines),JSON.stringify(r));}
    else if(rung===sl.slip&&r.every((v,k)=>k===sl.slip||v!==false))own++;
    else{other++;console.log('  slip rung elsewhere:',sl.id,sl.from,JSON.stringify(sl.lines),JSON.stringify(r));}
  }
  for(const ch of clean)max=Math.max(max,run(ch).ms);
  console.log(`chain fixture: clean chains rung 0 of ${clean.length}; slips rung at their own line ${own}, left null ${miss}, rung at another line ${other}; slowest chain ${max.toFixed(2)} ms`);
  assert.equal(other,0);
  assert.ok(miss<=5,`${miss} of 50 slips missed: narrow the tags`);
  assert.ok(max<5,`slowest chain ${max} ms`);
});

test('chain: a two-sided equation line, a line in words, and a bad tag are null',()=>{
  const r=checkChain([{tag:'=',text:'x^2 = 1'},{tag:'=',text:'so we move it over'},{tag:'bogus',text:'x'},{tag:'=',text:''}],{from:'x^2'});
  assert.deepEqual(r,[null,null,null,null]);
  assert.deepEqual(checkChain([{tag:'d/dx',text:'2x'}]),[null],'no line before the first, no anchor: null');
  assert.deepEqual(checkChain([{tag:'d/dx',text:"f'(x) = 2x"}],{from:'x^2'}),[true],'a one-sided label is allowed');
  assert.deepEqual(checkChain([{tag:'d/dx',text:'2t'}],{from:'t^2',letter:'t'}),[true],'the learner\'s own letter');
});

test('chain: a rounded decimal is not rung, a wrong value is',()=>{
  assert.deepEqual(checkChain([{tag:'at',text:'0.333',x:1}],{from:'1/3'}),[null]);
  assert.deepEqual(checkChain([{tag:'at',text:'0.5',x:1}],{from:'1/3'}),[false]);
});

// ---- the tagger: a Calculus item's own working lines, read from its spec
test('tagger: line 0 is anchored to the spec, a derivative working is checked line by line',()=>{
  const spec={shape:'derivative',f:'x^2 sin x'};
  assert.deepEqual(chainChecks(spec,['f(x) = x^2 sin x',"f'(x) = 2x sin x + x^2 cos x"]),[true,true]);
  assert.deepEqual(chainChecks(spec,['f(x) = x^2 sin x',"f'(x) = 2x cos x"]),[true,false]);
  assert.deepEqual(chainChecks(spec,['f(x) = x^2 cos x']),[false],'line 0 follows the spec\'s own function');
  assert.equal(chainPen(spec,['f(x) = x^2 sin x',"f'(x) = 2x cos x"]),1);
  assert.equal(chainPen(spec,["f'(x) = 2x sin x + x^2 cos x"]),null);
});
test('tagger: a line in words, a bare expression and a two-sided equation are null; the tagger never guesses',()=>{
  const spec={shape:'derivative',f:'x^2'};
  assert.deepEqual(chainChecks(spec,['use the power rule','2x','x^2 = 4 = 2^2']),[null,null,null]);
  assert.deepEqual(tagLines(spec,['use the power rule','2x']).lines.map((l)=>l.tag),['?','?']);
  assert.deepEqual(chainChecks(spec,[]),[]);
  assert.deepEqual(chainChecks(null,['x']),[null]);
  assert.deepEqual(chainChecks({shape:'newton-step',f:'x^2-2',x0:1,steps:1},['x1 = 1.5']),[null]);
  assert.ok(!chainChecks(spec,['x = 2']).includes(false));
});
test('tagger: every shape with a chain reads its lines (antiderivative, derivative-at, evaluate, limit, critical-point)',()=>{
  assert.deepEqual(chainChecks({shape:'antiderivative',f:'3x^2+2x'},['F(x) = x^3 + x^2 + C']),[true]);
  assert.deepEqual(chainChecks({shape:'antiderivative',f:'3x^2+2x'},['F(x) = x^3 + x^2']),[false],'+C is required');
  assert.deepEqual(chainChecks({shape:'antiderivative',f:'2x'},['∫ 2x dx = x^2 + C']),[true]);
  assert.deepEqual(chainChecks({shape:'definite-integral',f:'3x^2',a:0,b:2},['F(x) = x^3']),[true],'a definite integral needs no +C');
  const at={shape:'derivative-at',f:'x^3-2x',at:2};
  assert.deepEqual(chainChecks(at,["f'(x) = 3x^2 - 2","f'(2) = 10",'= 10']),[true,true,true]);
  assert.deepEqual(chainChecks(at,["f'(x) = 3x^2 - 2","f'(2) = 11"]),[true,false]);
  assert.deepEqual(chainChecks({shape:'evaluate',f:'x^2+3x',at:2},['f(2) = 2^2 + 3*2','= 10']),[true,true]);
  const lim={shape:'limit',f:'(x^2-4)/(x-2)',at:2};
  assert.deepEqual(chainChecks(lim,['lim x->2 (x^2-4)/(x-2)','= lim x->2 (x+2)']),[true,true]);
  assert.deepEqual(chainChecks(lim,['lim x->2 (x+2)','= 4']),[true,true]);
  assert.deepEqual(chainChecks(lim,['lim x->2 (x^2-4)/(x-2) = 0']),[false]);
  assert.deepEqual(chainChecks(lim,['lim x->3 (x+3) = 6']),[null],'a limit at another point than the spec\'s is not checked');
  assert.deepEqual(chainChecks({shape:'limit',f:'(3x^2+1)/(x^2+5)',at:'inf'},['lim x->∞ (3x^2+1)/(x^2+5) = 3']),[true]);
  const crit={shape:'critical-point',f:'x^3-12x',on:[-5,5]};
  assert.deepEqual(chainChecks(crit,["f'(x) = 3x^2 - 12",'3x^2 - 12 = 0','x = 2','x = -2']),[true,null,true,true]);
  assert.deepEqual(chainChecks(crit,["f'(x) = 3x^2 - 12",'3x^2 - 12 = 0','x = 4']),[true,null,false]);
});
