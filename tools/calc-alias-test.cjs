/**
 * The alias guard on Calculus 1's limit at infinity (v2 M3b-3h; rules/calc-expr.ts limitInf). A limit at infinity was read
 * only at the whole numbers 100, 1000, ..., 1e8, so a function of period 1 or 2 (cos(pi x)) was aliased to a constant.
 * Row 'kept': the limits the corpus uses are the values printed at the base (JSON.stringify of limitInf before the guard),
 * compared with assert.deepEqual - the guard returns the first run's value unchanged, so a kept limit is bit-identical.
 * Pure: no network, no model. Run with npm run test:rules in desk/ (directly: node tools/calc-alias-test.cjs).
 */
const path=require('node:path'),assert=require('node:assert/strict');
const {test}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
const E=require(path.join(root,'src/lib/rules/calc-expr.ts'));
const c=E.compile;

test('kept: the corpus limits at infinity read exactly as they did at the base',()=>{
 const kept=[
  ['(1 + 1/x)^x',1,{"kind":"value","v":2.718281828205865}],
  ['(3x^2 - x)/(2x^2 + 5)',1,{"kind":"value","v":1.5000000000000002}],
  ['(3x^2+1)/(x^2+5)',1,{"kind":"value","v":3}],
  ['1/x',1,{"kind":"value","v":0}],
  ['e^x - 1 - x',-1,{"kind":"inf","sign":1}],
  ['e^-x',1,{"kind":"value","v":0}],
  ['x sin(1/x)',1,{"kind":"value","v":1.0000000000000002}],
  ['(2x+1)/(x-3)',-1,{"kind":"value","v":2.0000000000000004}],
  ['atan(x)',-1,{"kind":"value","v":-1.570796326794897}],
  ['x^2',-1,{"kind":"inf","sign":1}],
  ['e^x',1,{"kind":"inf","sign":1}],
  ['ln(x)',1,{"kind":"inf","sign":1}],
  ['sin(x)',1,{"kind":"dne"}],
 ];
 for(const [s,sg,want] of kept)assert.deepEqual(E.limitInf(c(s),sg),want,`${s} at ${sg}inf`);
});

const C=require(path.join(root,'src/lib/rules/calc.ts'));
const {checkChain}=require(path.join(root,'src/lib/rules/chain.ts'));
const lim=(f,at)=>({shape:'limit',f,at});

test('refused: an aliased limit at infinity is not well formed, not marked, and limitInf says dne',()=>{
 const specs=[lim('cos(pi*x)','inf'),lim('sin(pi*x)+1','inf'),lim('cos(2*pi*x)','inf'),lim('cos(pi*x)','-inf')];
 for(const sp of specs){
  const w=C.wellFormed(sp);
  assert.equal(w.ok,false,`${sp.f} at ${sp.at} is refused`);
  assert.equal(w.why,'The limit does not exist.',`${sp.f} at ${sp.at}`);
  assert.equal(C.checkAnswer(sp,'1').verdict,'unsure',`${sp.f} at ${sp.at}: 1 is not marked`);
  assert.deepEqual(E.limitInf(c(sp.f),sp.at==='inf'?1:-1),{kind:'dne'},`${sp.f} at ${sp.at}`);
 }
});

test('chain: a working line claiming cos(pi*x) -> 1 at inf is not ticked; dne is',()=>{
 const L=(t,x,o)=>({tag:'lim',text:t,x,...o});
 assert.deepEqual(checkChain([L('1','inf')],{from:'cos(pi*x)',definite:false}),[false]);
 assert.deepEqual(checkChain([L('dne','inf')],{from:'cos(pi*x)',definite:false}),[true]);
});
