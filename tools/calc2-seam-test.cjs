/**
 * The Calculus 2 seam (v2 M3b-3a; rules/calc2.ts, rules/calc-read.ts): the dispatch from calc.ts to calc2.ts exists and
 * moves nothing. The frozen Calculus 1 table (tools/calc1-frozen.json, written at the base by tools/calc1-frozen-gen.cjs
 * before calc.ts changed) is recomputed from the same specs and answers and must be equal byte for byte; the new modules stay
 * pure (calc2.ts never imports calc.ts); CALC2_SHAPES holds the shapes built so far (M3b-3b: approx-integral; M3b-3c: sequence-limit) and shares no id with CALC_SHAPES. A change to a Calculus 1 word is made openly: regenerate
 * the table in the commit that changes it, with the reason in the log. Pure: no network, no model.
 * Run with npm run test:rules in desk/ (directly: node tools/calc2-seam-test.cjs).
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {test}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
const G=require('./calc1-frozen-gen.cjs');
const C=require(path.join(root,'src/lib/rules/calc.ts'));
const C2=require(path.join(root,'src/lib/rules/calc2.ts'));
const M=require(path.join(root,'src/lib/rules/maths.ts'));
const RULES=path.join(root,'src/lib/rules');
const importsOf=(file)=>[...fs.readFileSync(path.join(RULES,file),'utf8').matchAll(/^\s*(?:import|export)\s[^;]*?from\s+["']([^"']+)["']/gms)].map(m=>m[1]);

test('1: the frozen Calculus 1 table is equal, byte for byte',()=>{
 const onDisk=fs.readFileSync(G.OUT,'utf8');
 const frozen=JSON.parse(onDisk);
 assert.ok(frozen.specs>=100,'the table holds the corpus');
 const now=G.text(G.table(frozen.rows.map(({spec,answers})=>({spec,answers}))));
 assert.equal(now===onDisk,true,'tools/calc1-frozen.json differs from what calc.ts now says: a Calculus 1 word moved');
});

test('2: calc.ts imports only calc-expr, calc-read, calc2 and the taskText leaf',()=>{
 assert.deepEqual(importsOf('calc.ts').sort(),['./calc-expr','./calc-read','./calc2','./taskText']);
});

test('3: calc2.ts and calc-read.ts import no store, session, desk, engine, TV, maths or React module',()=>{
 for(const f of ['calc2.ts','calc-read.ts']){
  const imps=importsOf(f);
  assert.deepEqual(imps.filter(i=>!/^\.\/(calc-(expr|read)|numberWords)$/.test(i)),[],`${f} imports only calc-expr, calc-read and the numberWords leaf, never calc (a cycle)`);
  assert.ok(!imps.some(i=>/session|store|desk|engine|maths\/|MathsTV|react/i.test(i)),`${f}: no store, session, desk, engine, TV, maths or React`);
 }
 assert.deepEqual(importsOf('calc-read.ts'),['./numberWords'],'calc-read.ts imports only the numberWords leaf (X1b: the one number-word table)');
});

test('4: CALC2_SHAPES is [approx-integral, sequence-limit] and shares no id with CALC_SHAPES; calc2 refuses a spec of no shape and a malformed approx-integral',()=>{
 assert.deepEqual([...C2.CALC2_SHAPES],['approx-integral','sequence-limit']);
 assert.deepEqual(C2.CALC2_SHAPES.filter(s=>C.CALC_SHAPES.includes(s)),[]);
 // a calc2 spec wellFormed refuses: no f, no interval, no pieces, no rule
 for(const spec of [{shape:'limit',f:'x'},{shape:'approx-integral',f:'1/x',a:1,b:2,pieces:1,rule:'trapezoid'},null,'x',{}]){
  assert.equal(C2.isCalc2Spec(spec),spec?.shape==='approx-integral');
  assert.equal(C2.calc2WellFormed(spec).ok,false);
  assert.equal(C2.calc2Question(spec),null);
  assert.equal(C2.calc2CheckAnswer(spec,'1').verdict,'unsure');
  assert.equal(C2.calc2LeaksCalc(spec,'the answer is 1'),false);
  assert.deepEqual(C2.calc2SlipsFor('limit'),[]);
 }
 assert.equal(typeof C2.calc2Withheld({}),'string');
});

test('5: isCalcSpec is true for every Calculus 1 shape and false for a school spec',()=>{
 for(const shape of C.CALC_SHAPES)assert.equal(M.isCalcSpec({shape}),true,shape);
 assert.equal(M.isCalcSpec({shape:'fraction-add',expr:'1/2 + 1/3'}),false);
 for(const x of [null,undefined,'limit',3,{},{shape:'nope'}])assert.equal(M.isCalcSpec(x),false);
});
