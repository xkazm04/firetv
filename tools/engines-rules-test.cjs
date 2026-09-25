/**
 * The engine contract: the caller's schema is enforced the same way for every provider, a malformed answer is a
 * typed EngineError, and every engine is stubbed through one registry. Run with npm test in desk/ (directly:
 * node tools/engines-rules-test.cjs). No model or CLI is called; a disposable data directory under the OS temp
 * dir, never desk/data.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after,afterEach}=require('node:test');
const root=path.resolve(__dirname,'../desk');
let ts;try{ts=require(path.join(root,'node_modules/typescript'));}catch{console.error('This suite transpiles desk TypeScript with desk\'s own compiler. Run `npm install` in desk/ first, then `npm test` from desk/.');process.exit(1);}
const resolve=Module._resolveFilename;
Module._resolveFilename=function(id,...args){return resolve.call(this,id.startsWith('@/')?path.join(root,'src',id.slice(2)):id,...args);};
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const data=path.join(os.tmpdir(),`eng-${Date.now()}`);process.env.DESK_DATA_DIR=data;delete process.env.DESK_TEXT_ENGINE;
after(()=>fs.rmSync(data,{recursive:true,force:true}));

// Three 40-second windows of a real lesson id, so retrieval has something to choose between.
const LESSON='jWpiMu5LNdg';
const stamp=(s)=>`00:${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}.000`;
const cue=(s,text)=>`${stamp(s)} --> ${stamp(s+4)}\n${text}\n`;
fs.mkdirSync(path.join(data,'lessons'),{recursive:true});
fs.writeFileSync(path.join(data,'lessons',`${LESSON}.en.vtt`),['WEBVTT\n',cue(0,'welcome to equations'),cue(20,'an equation is a balance'),cue(45,'add the same to both sides'),cue(70,'subtract to undo addition'),cue(95,'divide to undo multiplication'),cue(110,'so x is alone')].join('\n'));

const load=(f)=>require(path.join(root,'src/lib',f));
const reg=()=>load('engines/registry.ts');
const engineError=()=>load('engines/types.ts').EngineError;
const stubText=(raw)=>reg().useProvider('text',{name:'stub',run:async()=>({raw})});
const isShape=(p)=>(e)=>{assert(e instanceof engineError(),`an EngineError, got ${e&&e.constructor&&e.constructor.name}: ${e&&e.message}`);assert.equal(e.kind,'shape');if(p!==undefined)assert.equal(e.path,p);return true;};
const HINT={type:'object',properties:{hint:{type:'string'}},required:['hint']};
afterEach(()=>{try{reg().resetProviders();}catch{/* the registry does not exist yet */}});

test('case 1: prose where a shape was asked for is a shape EngineError, not a string typed as the shape',async()=>{
 stubText('Sure! Here is the hint: look at x');
 const {text}=load('engines/text.ts');
 await assert.rejects(text({system:'s',prompt:'p',schema:HINT}),(e)=>{isShape()(e);assert.equal(e.provider,'stub');return true;});
});

test('case 2: one fence rule for every provider: a fenced JSON answer resolves to its object',async()=>{
 stubText('```json\n{"hint":"Look at x"}\n```');
 const {text}=load('engines/text.ts');
 const r=await text({system:'s',prompt:'p',schema:HINT});
 assert.deepEqual(r.json,{hint:'Look at x'});assert.equal(r.provider,'stub');
});

test('case 3: an isolated call is held to the schema too: an overlong reply names its path',async()=>{
 stubText({reply:'x'.repeat(400)});
 const {text}=load('engines/text.ts');
 await assert.rejects(text({system:'s',prompt:'p',isolated:true,schema:{type:'object',properties:{reply:{type:'string',maxLength:230}},required:['reply']}}),isShape('reply'));
});

test('case 4: an answer outside Linga\'s judge schema (enum, additionalProperties:false) names the field',async()=>{
 const {BANDS}=load('english/types.ts');
 const str=(maxLength,minLength=1)=>({type:'string',maxLength,minLength});
 const props={answered:{type:'string',enum:['yes','partly','no']},english:{type:'string',enum:[...BANDS,'none']},quote:str(240,0),note:str(160)};
 const judgeSchema={type:'object',additionalProperties:false,properties:props,required:Object.keys(props)};
 stubText({answered:'maybe',english:'B1',quote:'',note:'ok',extra:1});
 const {text}=load('engines/text.ts');
 await assert.rejects(text({system:'s',prompt:'p',isolated:true,schema:judgeSchema}),(e)=>{isShape('answered')(e);assert.match(e.message,/extra/,'the unexpected property is reported as well');return true;});
});

test('case 5: pickLesson with a non-string lesson rejects with a shape EngineError, not a TypeError',async()=>{
 stubText({lesson:42,why:'x'});
 const {pickLesson}=load('desk/pick.ts');
 await assert.rejects(pickLesson('maths','2x+3=7'),isShape('lesson'));
});

test('case 6: retrieval reads and caches under DESK_DATA_DIR and seeks to the nearest window; desk/data is untouched',async()=>{
 const deskCache=path.join(root,'data','embeddings.json');
 const before=fs.existsSync(deskCache)?fs.statSync(deskCache).mtimeMs:null;
 stubText({lesson:LESSON,why:'chosen because your problem needs …'});
 const {lessonWindows}=load('library/lessons.ts');
 const w=lessonWindows(LESSON);
 assert(w.length>=3,`the seeded transcript has at least three windows (got ${w.length})`);
 const unit=(i)=>w.map((_,j)=>j===i?1:0);
 reg().useProvider('embed',{name:'stub',run:async({texts})=>({raw:texts.length===1?[unit(2)]:texts.map((_,i)=>unit(i))})});
 const {pickLesson}=load('desk/pick.ts');
 const pick=await pickLesson('maths','2x+3=7');
 assert.equal(pick.id,LESSON);assert.equal(pick.t,w[2].t);
 assert(fs.existsSync(path.join(data,'embeddings.json')),'the vector cache is written under DESK_DATA_DIR');
 assert.equal(fs.existsSync(deskCache)?fs.statSync(deskCache).mtimeMs:null,before,'desk/data/embeddings.json is not written');
});

test('case 7: the registry names the active text provider from DESK_TEXT_ENGINE without spawning either CLI',()=>{
 const cp=require('node:child_process'),spawn=cp.spawn;let spawned=0;cp.spawn=(...a)=>{spawned++;return spawn(...a);};
 try{
  load('engines/text.ts');const {activeProvider}=reg();
  delete process.env.DESK_TEXT_ENGINE;assert.equal(activeProvider('text'),'claude-cli');
  process.env.DESK_TEXT_ENGINE='codex';assert.equal(activeProvider('text'),'codex');
  reg().useProvider('text',{name:'stub',run:async()=>({raw:'{}'})});assert.equal(activeProvider('text'),'stub');
  assert.equal(spawned,0);
 }finally{cp.spawn=spawn;delete process.env.DESK_TEXT_ENGINE;}
});

test('GUARD case 8: the CJS export patching the rules suites use still reaches the callers',async()=>{
 const engine=load('engines/text.ts'),eye=load('engines/vision.ts'),real=engine.text,realVision=eye.vision;
 try{
  engine.text=async()=>({json:{lesson:'none',why:'x'},provider:'test',ms:1});
  const {pickLesson}=load('desk/pick.ts');
  assert.equal(await pickLesson('maths','2x+3=7'),null);
  const look=async()=>({json:{items:[]},provider:'test',ms:1});eye.vision=look;assert.equal(eye.vision,look);
 }finally{engine.text=real;eye.vision=realVision;}
});

// One re-ask, only for strings past their maxLength, only when the caller asks for it (Linga's calls pass shorten).
const PLAN={type:'object',additionalProperties:false,properties:{topics:{type:'array',items:{type:'object',additionalProperties:false,properties:{why:{type:'string',maxLength:20,minLength:1},skill:{type:'string',enum:['ask','tell']}},required:['why','skill']}}},required:['topics']};
const stubSeq=(...raws)=>{const prompts=[];reg().useProvider('text',{name:'stub',run:async(req)=>{prompts.push(req.prompt);const r=raws[Math.min(prompts.length-1,raws.length-1)];if(r instanceof Error)throw r;return {raw:r};}});return prompts;};

test('case 9: an answer broken only by overlong strings is re-asked once with each overrun named, and the fitting second answer is accepted',async()=>{
 const prompts=stubSeq({topics:[{why:'x'.repeat(25),skill:'ask'},{why:'ok',skill:'tell'}]},{topics:[{why:'short now',skill:'ask'},{why:'ok',skill:'tell'}]});
 const {text}=load('engines/text.ts');
 const r=await text({system:'s',prompt:'p',schema:PLAN,isolated:true,shorten:true});
 assert.deepEqual(r.json.topics.map(t=>t.why),['short now','ok']);
 assert.equal(prompts.length,2,'exactly one extra call');
 assert.match(prompts[1],/^p\n/,'the re-ask keeps the original prompt');
 assert.match(prompts[1],/Shorten: topics\[0\]\.why is 25 characters, at most 20\./,'the overrun is named with its limit');
});

test('case 10: a break that is not a length overrun is not re-asked: the first rejection stands, one call',async()=>{
 const prompts=stubSeq({topics:[{why:'x'.repeat(25),skill:'sing'}]},{topics:[{why:'fine',skill:'ask'}]});
 const {text}=load('engines/text.ts');
 await assert.rejects(text({system:'s',prompt:'p',schema:PLAN,isolated:true,shorten:true}),(e)=>{isShape('topics[0].why')(e);assert.match(e.message,/sing/);return true;});
 assert.equal(prompts.length,1,'no re-ask when an enum is broken too');
 const plain=stubSeq({topics:[{why:'x'.repeat(25),skill:'ask'}]},{topics:[{why:'fine',skill:'ask'}]});
 await assert.rejects(text({system:'s',prompt:'p',schema:PLAN,isolated:true}),isShape('topics[0].why'));
 assert.equal(plain.length,1,'no re-ask without shorten');
});

test('case 11: a second answer that still fails, or a re-ask that errors, ends in the original rejection',async()=>{
 const {text}=load('engines/text.ts');
 const long={topics:[{why:'x'.repeat(25),skill:'ask'}]};
 const prompts=stubSeq(long,{topics:[{why:'y'.repeat(30),skill:'ask'},{why:'z'.repeat(40),skill:'tell'}]});
 await assert.rejects(text({system:'s',prompt:'p',schema:PLAN,isolated:true,shorten:true}),(e)=>{isShape('topics[0].why')(e);assert.match(e.message,/25 characters, at most 20/);assert.doesNotMatch(e.message,/30 characters|topics\[1\]/);return true;});
 assert.equal(prompts.length,2,'at most one extra call');
 const again=stubSeq(long,new (engineError())('timeout','stub','too slow'));
 await assert.rejects(text({system:'s',prompt:'p',schema:PLAN,isolated:true,shorten:true}),(e)=>{isShape('topics[0].why')(e);assert.match(e.message,/25 characters/);return true;});
 assert.equal(again.length,2);
});

test('case 12: thinking:false gives the claude child MAX_THINKING_TOKENS=0; any other request leaves the environment as it is',()=>{
 const {childEnv}=load('engines/text.ts');
 const prior=process.env.MAX_THINKING_TOKENS;delete process.env.MAX_THINKING_TOKENS;
 try{
  assert.equal(childEnv({thinking:false}).MAX_THINKING_TOKENS,'0');
  assert.equal(childEnv({}).MAX_THINKING_TOKENS,undefined);
  assert.equal(childEnv({thinking:true}).MAX_THINKING_TOKENS,undefined);
  assert.equal(childEnv({thinking:false}).PATH??childEnv({thinking:false}).Path,process.env.PATH??process.env.Path,'the rest of the environment is kept');
 }finally{if(prior!==undefined)process.env.MAX_THINKING_TOKENS=prior;}
});
