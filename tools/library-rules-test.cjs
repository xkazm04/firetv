/**
 * The lesson library (desk/src/lib/library): the VTT reader that turns a lesson's captions into timed text, and the
 * vector cache retrieval keeps beside the learners. Run with npm test in desk/ (directly: node tools/library-rules-test.cjs).
 * No model is called: the embed engine is stubbed through the registry. A disposable data directory under the OS temp
 * dir, never desk/data.
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {test,after,mock}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
const data=path.join(os.tmpdir(),`desk-library-${process.pid}-${Date.now()}`);process.env.DESK_DATA_DIR=data;
assert.ok(!path.resolve(data).startsWith(path.resolve(root,'data')),'never desk/data');
after(()=>fs.rmSync(data,{recursive:true,force:true}));

const lib=(f)=>require(path.join(root,'src/lib',f));
const {parseVtt}=lib('library/vtt.ts');

// ---- the VTT reader ----
test('VTT-1: YouTube rolling captions - hours always written, a blank-looking line inside a cue, tags - read as before',()=>{
 const raw=['WEBVTT','Kind: captions','Language: en','',
  '00:00:01.000 --> 00:00:03.000 align:start position:0%','welcome<00:00:01.500><c> to</c><c> equations</c>',' ','',
  '00:00:03.000 --> 00:00:05.000 align:start position:0%','welcome to equations',' ','an equation is a balance','',
  '00:00:05.000 --> 00:00:07.000 align:start position:0%','an equation is a balance','add the same','',
 ].join('\n');
 assert.deepEqual(parseVtt(raw),[{t:1,text:'welcome to equations'},{t:3,text:'an equation is a balance'},{t:5,text:'add the same'}]);
});
test('VTT-2: a cue identifier - the line just before a timing line, after a blank one - is not caption text',()=>{
 const raw=['WEBVTT','','1','00:00:01.000 --> 00:00:04.000','first line','','2','00:00:05.000 --> 00:00:08.000','second line','','intro-3','00:00:09.000 --> 00:00:10.000','third line',''].join('\n');
 assert.deepEqual(parseVtt(raw),[{t:1,text:'first line'},{t:5,text:'second line'},{t:9,text:'third line'}]);
});
test('VTT-3: a timing line without hours (mm:ss.ttt, as the WebVTT format allows) starts a cue at its own time',()=>{
 const raw=['WEBVTT','','00:01.000 --> 00:04.000','first line','','01:05.000 --> 01:08.000','second line',''].join('\n');
 assert.deepEqual(parseVtt(raw),[{t:1,text:'first line'},{t:65,text:'second line'}]);
 assert.deepEqual(parseVtt(['WEBVTT','','01:00:02.000 --> 01:00:04.000','late line',''].join('\n')),[{t:3602,text:'late line'}],'an hour is still an hour');
});

// ---- the vector cache ----
const LESSON='jWpiMu5LNdg';
const stamp=(s)=>`00:${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}.000`;
const cue=(s,text)=>`${stamp(s)} --> ${stamp(s+4)}\n${text}\n`;
test('CACHE-1: a vector cache that cannot be written says so in the server log once, and the pick still answers',async()=>{
 fs.mkdirSync(path.join(data,'lessons'),{recursive:true});
 fs.writeFileSync(path.join(data,'lessons',`${LESSON}.en.vtt`),['WEBVTT\n',cue(0,'welcome to equations'),cue(50,'add the same to both sides'),cue(100,'divide to undo')].join('\n'));
 // embeddings.json is a directory: it cannot be read as a cache, and nothing can be renamed over it
 fs.mkdirSync(path.join(data,'embeddings.json'),{recursive:true});
 lib('engines/registry.ts').useProvider('embed',{name:'stub',run:async({texts})=>({raw:texts.map((_,i)=>[1,i+1,0])})});
 const L=lib('library/lessons.ts');
 const lines=[];mock.method(console,'error',(...a)=>lines.push(a.join(' ')));
 let b;
 try{b=await L.bestWindow(LESSON,'q');}finally{mock.restoreAll();}
 assert.ok(b&&typeof b.t==='number','the pick still answers');
 assert.equal(lines.filter((l)=>/embeddings\.json/.test(l)).length,1,'one line names the cache file: '+lines.join('|'));
 assert.deepEqual(fs.readdirSync(data).filter((n)=>n.endsWith('.tmp')),[],'no temp file is left');
});

test('LATE-1: a transcript placed after the first pick is used by the next pick, without a restart',async()=>{
 const LATE='bAerID24QJ0';
 const byText=(t)=>/divide/.test(t)?[0,0,1]:/welcome/.test(t)?[1,0,0]:[0,1,0];
 lib('engines/registry.ts').useProvider('embed',{name:'stub',run:async({texts})=>({raw:texts.map(byText)})});
 const L=lib('library/lessons.ts');
 fs.rmSync(path.join(data,'embeddings.json'),{recursive:true,force:true});
 await L.ensureVectors();
 assert.equal(await L.bestWindow(LATE,'divide'),null,'no transcript yet: no window');
 fs.writeFileSync(path.join(data,'lessons',`${LATE}.en.vtt`),['WEBVTT\n',cue(0,'welcome to linear equations'),cue(50,'add the same to both sides'),cue(100,'divide to undo')].join('\n'));
 const b=await L.bestWindow(LATE,'divide');
 assert.ok(b&&b.t>0,'the late transcript seeks past 0:00: '+JSON.stringify(b));
});
