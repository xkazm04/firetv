/**
 * The limit of a sequence (v2 M3b-3c; desk/src/lib/rules/calc2.ts 'sequence-limit', the topic calc2-sequences): the second
 * Calculus 2 shape. Hand values are Stewart 9e 11.1 (n/(n+1) at 1, ln(n)/n at 0, (1+1/n)^n at e, 2^n/n^3 at infinity).
 * The first row is the base (step 1, before any desk/src change): Calculus 1's reader reads none of the four printed
 * sequence questions, and limitInf gives the App Master's probe values. Offline: no model, no server; the data directory is
 * disposable. Run with npm run test:rules in desk/ (directly: node tools/calc2-sequence-test.cjs).
 */
const path=require('node:path'),assert=require('node:assert/strict');
const {test}=require('node:test');

const root=path.resolve(__dirname,'../desk'),src=(f)=>path.join(root,'src',f);
require('./ts-load.cjs');
const C=require(src('lib/rules/calc.ts'));
const X=require(src('lib/rules/calc-expr.ts'));

const FIXTURES=['n/(n+1)','ln(n)/n','(1+1/n)^n','(n^2+1)/(2n^2)','2^n/n^3','n^(1/n)','(1/2)^n'];
// the f of each, in x
const FX=['x/(x+1)','ln(x)/x','(1+1/x)^x','(x^2+1)/(2x^2)','2^x/x^3','x^(1/x)','(1/2)^x'];
const PROBE=[1,2.3258e-8,2.718281828205865,0.5,'inf',1.0000000233,0];
const DNE=['cos(pi*x)','sin(pi*x)+1','(-1)^x'];

test('base: Calculus 1 reads none of the four printed sequence questions; limitInf gives the probe values of the eight fixtures',()=>{
 for(const text of ['Find the limit of the sequence a_n = n/(n+1).','Determine whether the sequence a_n = ln(n)/n converges or diverges. If it converges, find the limit.','Find lim_(n->infinity) (1+1/n)^n','Find the limit as n approaches infinity of (n^2+1)/(2n^2).'])
  assert.equal(C.specFromQuestion(text),null,text);
 FX.forEach((f,i)=>{
  const L=X.limitInf(X.compile(f),1);
  if(PROBE[i]==='inf')assert.deepEqual(L,{kind:'inf',sign:1},f);
  else{assert.equal(L.kind,'value',f);assert.ok(Math.abs(L.v-PROBE[i])<=1e-9,`${f}: ${L.v}`);}
 });
 for(const f of DNE)assert.deepEqual(X.limitInf(X.compile(f),1),{kind:'dne'},f);
});
