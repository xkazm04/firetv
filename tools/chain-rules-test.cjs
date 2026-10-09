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
require('./ts-load.cjs');
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

test('D2-4: one-way defined-ness - a line undefined where the line before is defined is null, never true; one defined where it is not is compared',()=>{
  const one=(from,tag,text)=>checkChain([{tag,text}],{from})[0];
  // the moved fixture pin: OLD true -> NEW null
  assert.equal(one('1/x','int','ln(x) + C'),null);assert.equal(one('1/x','int','ln|x| + C'),true);
  assert.equal(one('1/(1-x)','int','-ln(1-x) + C'),null);assert.equal(one('ln(x^2)','=','2ln(x)'),null);assert.equal(one('x','=','sqrt(x)^2'),null);
  assert.equal(one('ln(1-x)','d/dx','-1/(1-x)'),true);assert.equal(one('(x^2-4)/(x-2)','=','x + 2'),true);assert.equal(one('2ln(x)','=','ln(x^2)'),true);
  // a line that disagrees where both are defined is still rung, gap or not
  assert.equal(one('1/(2x+1)','int','ln(2x+1) + C'),false);assert.equal(one('1/x','int','ln(2x) + x + C'),false);
  // the accepted ceiling, as in the judge: a gap left of every sample is not seen
  assert.equal(one('1/(x+4)','int','ln(x+4) + C'),true);
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
test('tagger (M3a): a one-capital label is an antiderivative only on an integral shape; elsewhere it names the function, as f(x) = does',()=>{
  // a story's working names its function by a capital (A for an area): a right first line is not rung on a wrong item
  const area={shape:'extremum',f:'x(14 - x)',on:[0,14],kind:'max'};
  assert.deepEqual(chainChecks(area,['A = x(14 - x)',"A' = 14 - 2x"]),[true,true]);
  assert.deepEqual(chainChecks(area,['A = x(28 - x)']),[false],'the area set up from the whole perimeter is rung where it sits');
  assert.deepEqual(chainChecks({shape:'derivative',f:'x^3'},['F(x) = x^3',"F'(x) = 3x^2"]),[true,true]);
  // on the two integral shapes the label keeps its meaning
  assert.deepEqual(chainChecks({shape:'antiderivative',f:'2x'},['F = x^2 + C']),[true]);
  assert.deepEqual(chainChecks({shape:'definite-integral',f:'3x^2',a:0,b:2},['F = x^3']),[true]);
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
test('tagger: a line in words is null and the next line still follows the last line that asserted something',()=>{
  const spec={shape:'derivative',f:'x^2 sin x'};
  assert.deepEqual(chainChecks(spec,['f(x) = x^2 sin x','use the product rule',"f'(x) = 2x sin x + x^2 cos x"]),[true,null,true]);
  assert.deepEqual(chainChecks(spec,['f(x) = x^2 sin x','use the product rule',"f'(x) = 2x cos x"]),[true,null,false]);
});
