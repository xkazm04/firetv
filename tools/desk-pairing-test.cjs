/**
 * Pairing is a server fact. The TV is the browser holding the desk's key (a desk-tv cookie, set once from the
 * address the desk prints at start); a phone is a device that gave the TV's code to the server (a desk-phone
 * cookie, the HMAC of the key and the session's pin); everyone else is a guest and sees the lobby. One module owns
 * it (lib/session/pairing.ts), one gate applies it to every API route (src/proxy.ts), and the session routes draw
 * each caller's view of the one session.
 *
 * Route handlers and the proxy are called in-process, with a scratch DESK_DATA_DIR under the OS temp dir. No model
 * is called. Run with npm test in desk/ (directly: node tools/desk-pairing-test.cjs).
 */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),Module=require('node:module');
const {test,after,mock}=require('node:test');
const root=path.resolve(__dirname,'../desk');
require('./ts-load.cjs');
const data=path.join(os.tmpdir(),`desk-pairing-${process.pid}-${Date.now()}`);process.env.DESK_DATA_DIR=data;

const SRC=path.join(root,'src'),src=(f)=>path.join(SRC,f);
const store=require(src('lib/session/store.ts'));
const {emptyEnglish}=require(src('lib/english/types.ts'));
const {NextRequest}=require(path.join(root,'node_modules/next/server.js'));
after(()=>{clearInterval(globalThis.__desk.ticker);fs.rmSync(data,{recursive:true,force:true});});

// loaded per test, so a module that is not there yet fails each case on its own
const sessionRoute=()=>require(src('app/api/session/route.ts'));
const streamRoute=()=>require(src('app/api/session/stream/route.ts'));
const proxyOf=()=>require(src('proxy.ts'));
const pairing=()=>require(src('lib/session/pairing.ts'));

/** A request as the proxy hands it on: its role in x-desk-role (none: an in-process caller). */
const req=(url,{method='GET',role,cookie,body}={})=>{const headers={'Content-Type':'application/json'};if(role)headers['x-desk-role']=role;if(cookie)headers.cookie=cookie;
 return new Request('http://desk'+url,{method,headers,...(body!==undefined?{body:JSON.stringify(body)}:{})});};
const get=(role)=>sessionRoute().GET(req('/api/session',{role}));
const post=(e,role,cookie)=>sessionRoute().POST(req('/api/session',{method:'POST',role,cookie,body:e}));
/** The key the desk minted, read where the desk keeps it. */
const keyFile=()=>path.join(data,'pairing.json');
const theKey=()=>{pairing().tvKey();return JSON.parse(fs.readFileSync(keyFile(),'utf8')).key;};
const hmac=(key,msg)=>crypto.createHmac('sha256',key).update(msg).digest('base64url');
const setCookie=(r,name)=>{const all=r.headers.getSetCookie?r.headers.getSetCookie():[r.headers.get('set-cookie')??''];const c=all.find((x)=>x.startsWith(name+'='));return c?c.slice(name.length+1).split(';')[0]:undefined;};
/** The proxy's verdict: 401, or passed on with the role it wrote. */
const through=async(url,{method='POST',cookie,headers={}}={})=>{const r=await proxyOf().proxy(new NextRequest('http://desk'+url,{method,headers:{...headers,...(cookie?{cookie}:{})}}));
 return {status:r.status,passed:r.headers.get('x-middleware-next')==='1',role:r.headers.get('x-middleware-request-x-desk-role'),res:r};};

/** A desk with a learner's evening on it: a page, a practice set, a conversation, history, memory. */
function evening(screen='landing'){
 store.dispatch({type:'reset'});store.dispatch({type:'learner.set',id:'ema'});
 const s=store.getSession();
 globalThis.__desk.session={...s,screen,subject:'maths',draft:{id:'p1',name:'Ada',type:'elementary',modules:['english']},
  pages:[{id:'m1',subject:'maths',title:'Sheet',img:'data:image/jpeg;base64,AAAA',w:10,h:10,items:[{n:1,text:'2x+3=11',cx:0,cy:0,band:[0,1],key:'k1'}]}],
  history:[{at:Date.now(),kind:'practice',label:'Linear',detail:'4 of 6 right'}],memory:['Ema rushes the second step.'],
  conversation:{id:'c1',sceneId:'rover',turns:[{role:'learner',text:'Where is the rover?'}]},
  practice:{topic:'linear-one-step',items:[{n:1,question:'2x+3=11',studentAnswer:'4'}],marked:false},
  englishLearning:{...emptyEnglish(),notes:['likes space']}};
 return store.getSession();
}
const firstMessage=async(role)=>{mock.timers.enable({apis:['setInterval']});try{const r=(await streamRoute().GET(req('/api/session/stream',{role}))).body.getReader();
 const m=JSON.parse(new TextDecoder().decode((await r.read()).value).replace(/^data: /,''));await r.cancel();return m;}finally{mock.timers.reset();}};
const LOBBY_EMPTY=(v)=>{assert.equal(v.viewer,'guest');assert.equal(v.pin,'');assert.equal(v.joined,false);
 assert.deepEqual(v.pages,[]);assert.deepEqual(v.history,[]);assert.deepEqual(v.memory,[]);assert.equal(v.conversation,null);assert.equal(v.practice,null);assert.deepEqual(v.englishLearning,emptyEnglish());};

test('case 1: a guest sees the lobby - no pin, not joined, the evening emptied - and the TV sees the whole session with its pin',async()=>{
 const s=evening('landing');
 const g=await (await get('guest')).json();
 LOBBY_EMPTY(g);
 assert.equal(g.screen,'landing');assert.equal(g.subject,'maths');assert.equal(g.learner.name,s.learner.name);
 assert.equal(g.draft,null,'the draft is shown only while the TV is on profile');
 LOBBY_EMPTY(await firstMessage('guest'));
 evening('profile');
 const gp=await (await get('guest')).json();LOBBY_EMPTY(gp);assert.equal(gp.draft?.name,'Ada','on profile the guest may see the name being typed');
 const t=await (await get('tv')).json();
 assert.equal(t.viewer,'tv');assert.equal(t.pin,store.getSession().pin);assert.equal(t.pages.length,1);assert.equal(t.history.length,1);assert.equal(t.practice.items.length,1);
});

test('case 2: a join is checked on the server - no code or a wrong code is 403, the session\'s code is 200 with a desk-phone cookie and the phone view',async()=>{
 evening('pair');const pin=store.getSession().pin;
 let r=await post({type:'join'},'guest');assert.equal(r.status,403);assert.equal(store.getSession().joined,false);
 const wrong=pin==='1000'?'1001':'1000';
 r=await post({type:'join',code:wrong},'guest');assert.equal(r.status,403);assert.deepEqual(await r.json(),{error:'That code is not on the TV.'});assert.equal(store.getSession().joined,false);
 r=await post({type:'join',code:pin},'guest');assert.equal(r.status,200);
 assert.equal(setCookie(r,'desk-phone'),hmac(theKey(),pin),'desk-phone is the HMAC of the key and the pin');
 assert.equal(store.getSession().joined,true);
 const v=await r.json();assert.equal(v.viewer,'phone');assert.equal(v.pin,'');assert.equal(v.joined,true);
 // critic revise: the key file holds the key only; the pin lives on the session
 assert.deepEqual(Object.keys(JSON.parse(fs.readFileSync(keyFile(),'utf8'))),['key']);
 // the phone no longer decides: no compare with s.pin is left in the browser, and every join posts its code
 const phone=fs.readFileSync(src('app/phone/page.tsx'),'utf8');
 assert.doesNotMatch(phone,/[!=]==?\s*s\??\.pin\b|\bs\??\.pin\s*[!=]==?/,'the phone compares nothing with s.pin');
 assert.doesNotMatch(phone,/type:\s*"join"\s*}/,'a join without its code');
 assert.match(phone,/type:\s*"join",\s*code/);
});

test('case 3: a guest may post only the join, Show the code, and the name while the TV is on profile',async()=>{
 evening('landing');
 for(const e of [{type:'nav',screen:'hint'},{type:'focus',focus:2},{type:'timer.start'},{type:'reset'},{type:'profile.draft',patch:{name:'Eve'}},{type:'task.add',name:'x',sub:'maths',min:5},{type:'learner.set',id:'jakub'}]){
  const before=store.getSession();const r=await post(e,'guest');
  assert.equal(r.status,403,JSON.stringify(e));assert.equal(store.getSession(),before,`${e.type} changed the session`);
 }
 let r=await post({type:'nav',screen:'pair',from:'landing'},'guest');assert.equal(r.status,200);assert.equal(store.getSession().screen,'pair');
 LOBBY_EMPTY(await r.json());
 evening('profile');
 r=await post({type:'profile.draft',patch:{name:'Eve'}},'guest');assert.equal(r.status,200);assert.equal(store.getSession().draft.name,'Eve');
 const before=store.getSession();
 r=await post({type:'profile.draft',patch:{name:'Eve',modules:['maths']}},'guest');assert.equal(r.status,403,'the name only');assert.equal(store.getSession(),before);
 r=await post({type:'profile.save'},'guest');assert.equal(r.status,403);assert.equal(store.getSession(),before);
});

/** Every API route on disk, as its URL path. */
const apiRoutes=()=>{const out=[];const walk=(d)=>{for(const f of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,f.name);if(f.isDirectory())walk(p);else if(/^route\.tsx?$/.test(f.name))out.push('/'+path.relative(path.join(SRC,'app'),d).split(path.sep).join('/'));}};walk(path.join(SRC,'app/api'));return out.sort();};
test('case 4: the proxy shuts every API route but the session\'s own to a guest and a forged cookie, passes the TV and a phone, and writes the role itself',async()=>{
 evening('landing');const {config}=proxyOf();
 assert(config.matcher.includes('/api/:path*')&&config.matcher.includes('/tv'),'the proxy runs on the API and the TV');
 const key=theKey(),pin=store.getSession().pin;
 const tv=`desk-tv=${hmac(key,'tv')}`,phone=`desk-phone=${hmac(key,pin)}`;
 const gated=apiRoutes().filter((r)=>r!=='/api/session'&&r!=='/api/session/stream');
 for(const r of ['/api/hint','/api/read','/api/mark','/api/practice','/api/explain','/api/analyse','/api/memory','/api/english','/api/speak','/api/session/retry'])assert(gated.includes(r),`${r} is on disk and gated`);
 for(const url of gated){
  assert.equal((await through(url)).status,401,`${url} with no cookie`);
  assert.equal((await through(url,{cookie:'desk-phone=forged'})).status,401,`${url} with a forged phone cookie`);
  assert.equal((await through(url,{cookie:'desk-tv=forged'})).status,401,`${url} with a forged tv cookie`);
  assert.equal((await through(url,{cookie:`desk-tv=${hmac('another key','tv')}`})).status,401,`${url} with another desk's cookie`);
  for(const [c,role] of [[tv,'tv'],[phone,'phone']]){const v=await through(url,{cookie:c});assert(v.passed,`${url} passes the ${role}`);assert.equal(v.role,role);}
 }
 const spoofed=await through('/api/session',{method:'GET',headers:{'x-desk-role':'tv'}});
 assert(spoofed.passed);assert.equal(spoofed.role,'guest','a client-sent x-desk-role is overwritten');
 for(const [url,method] of [['/api/session','GET'],['/api/session','POST'],['/api/session/stream','GET']]){const v=await through(url,{method});assert(v.passed,`${method} ${url} is the lobby's door`);assert.equal(v.role,'guest');}
});

test('case 5: a reset rotates the pin and lapses every phone; /tv?key= sets desk-tv and drops the key from the address',async()=>{
 evening('landing');const key=theKey(),old=store.getSession().pin;
 const phone=`desk-phone=${hmac(key,old)}`;
 assert.equal((await through('/api/hint',{cookie:phone})).role,'phone');
 do store.dispatch({type:'reset'});while(store.getSession().pin===old);
 assert.equal((await through('/api/hint',{cookie:phone})).status,401,'the old phone is a guest again');
 assert.equal((await through('/api/session',{method:'GET',cookie:phone})).role,'guest');
 const pairingJson=JSON.parse(fs.readFileSync(keyFile(),'utf8'));assert.equal(pairingJson.key,key,'the key survives a reset');
 let v=await through(`/tv?key=${encodeURIComponent(key)}&test=1`,{method:'GET'});
 assert([302,303,307,308].includes(v.status),'a redirect');assert.equal(new URL(v.res.headers.get('location')).pathname,'/tv');
 assert.equal(new URL(v.res.headers.get('location')).searchParams.get('key'),null,'the key leaves the address');
 assert.equal(new URL(v.res.headers.get('location')).searchParams.get('test'),'1','the rest of the address stays');
 const minted=setCookie(v.res,'desk-tv');assert(minted,'desk-tv is set');
 assert.equal((await through('/api/hint',{cookie:`desk-tv=${minted}`})).role,'tv');
 v=await through('/tv?key=wrong',{method:'GET'});assert.equal(setCookie(v.res,'desk-tv'),undefined,'a wrong key sets nothing');
});

test('case 6: the stream draws each connection\'s own view - after a dispatch the TV\'s message carries the pin and the guest\'s none',async()=>{
 evening('landing');const pin=store.getSession().pin;
 mock.timers.enable({apis:['setInterval']});
 try{
  const open=async(role)=>(await streamRoute().GET(req('/api/session/stream',{role}))).body.getReader();
  const tv=await open('tv'),guest=await open('guest');
  const read=async(r)=>JSON.parse(new TextDecoder().decode((await r.read()).value).replace(/^data: /,''));
  await read(tv);await read(guest);
  store.dispatch({type:'status',text:'next'});
  const t=await read(tv),g=await read(guest);
  assert.equal(t.status,'next');assert.equal(t.pin,pin);assert.equal(t.viewer,'tv');
  assert.equal(g.pin,'');assert.equal(g.viewer,'guest');assert.deepEqual(g.pages,[]);
  // a phone whose pin has lapsed on the open stream is a guest from the next message on
  const key=theKey(),ph=await (await streamRoute().GET(req('/api/session/stream',{role:'phone',cookie:`desk-phone=${hmac(key,pin)}`}))).body.getReader();
  assert.equal((await read(ph)).viewer,'phone');
  do store.dispatch({type:'reset'});while(store.getSession().pin===pin);
  const lapsed=await read(ph);assert.equal(lapsed.viewer,'guest');assert.equal(lapsed.joined,false);
  await tv.cancel();await guest.cancel();await ph.cancel();
 }finally{mock.timers.reset();}
});

test('GUARD: the QR path - the Pair screen\'s phoneUrl?pin= posted as a join lands the phone on the confirmation',async()=>{
 evening('pair');
 const screens=fs.readFileSync(src('tv/screens.tsx'),'utf8');assert.match(screens,/s\.phoneUrl \+ "\?pin=" \+ s\.pin/,'the QR carries the code');
 const t=await (await get('tv')).json();
 const code=new URL(t.phoneUrl+'?pin='+t.pin).searchParams.get('pin');
 const r=await post({type:'join',code},'guest');assert.equal(r.status,200);
 const v=await r.json();assert.equal(v.joined,true);assert.equal(v.screen,'joined');
 const {follow}=require(src('app/phone/panelFor.ts'));
 assert.equal(follow(undefined,v,{panel:'join',role:'student',busy:false}).to,'joined','a fresh join lands on the confirmation');
 // the remembered code is the same post: a phone whose cookie is gone joins again with the code it kept
 const again=await post({type:'join',code},'guest');assert.equal(again.status,200);
});

test('case 7: a join shows Joined only to a TV waiting to be paired - mid-session a phone (a parent, or a remembered one rejoining) slips in and the page stays',async()=>{
 const {follow}=require(src('app/phone/panelFor.ts'));
 // the first phone ever: the TV was not joined, so it confirms, from wherever it stood
 evening('landing');let pin=store.getSession().pin;
 let r=await post({type:'join',code:pin},'guest');assert.equal(r.status,200);assert.equal(store.getSession().screen,'joined','first join -> the Joined screen');
 // the TV on the code: it is waiting for a phone, so the join confirms even on a joined desk
 globalThis.__desk.session={...store.getSession(),screen:'pair',focus:1};
 r=await post({type:'join',code:pin},'guest');assert.equal(r.status,200);assert.equal(store.getSession().screen,'joined','join while on pair -> joined');assert.equal(store.getSession().focus,0);
 // Ema on her page, the desk already joined: a parent's phone joins and the TV does not move
 globalThis.__desk.session={...store.getSession(),screen:'page',focus:2,itemIx:1};
 r=await post({type:'join',code:pin},'guest');assert.equal(r.status,200);
 let s=store.getSession();assert.equal(s.joined,true);assert.equal(s.screen,'page','join mid-session -> the page stays');assert.equal(s.focus,2);assert.equal(s.itemIx,1);
 const v=await r.json();assert.equal(v.screen,'page');
 const step=follow(undefined,v,{panel:'join',role:'student',busy:false});assert.equal(step.to,'joined','the phone lands on its confirmation, not a blank panel');
 // Ema's own phone reloads (its cookie gone) and rejoins with the code it remembered: the same silent join
 r=await post({type:'join',code:pin},'guest');assert.equal(r.status,200);s=store.getSession();assert.equal(s.screen,'page','a remembered rejoin mid-session -> stays');assert.equal(s.focus,2);
 // a draft still owns the screen: never the profile, even for a first phone
 evening('profile');pin=store.getSession().pin;
 r=await post({type:'join',code:pin},'guest');assert.equal(r.status,200);assert.equal(store.getSession().screen,'profile');
});

test('GUARD: an in-process caller with no proxy header keeps the whole session and the open join',async()=>{
 evening('landing');
 const full=await (await sessionRoute().GET()).json();assert.equal(full.pin,store.getSession().pin);assert.equal(full.pages.length,1);
 const r=await post({type:'join'});assert.equal(r.status,200);assert.equal(store.getSession().joined,true);assert.equal((await r.json()).pin,store.getSession().pin);
 const first=await firstMessage(undefined);assert.equal(first.pin,store.getSession().pin);
});

/** Session's top-level keys, read from store.ts source: comments stripped, split at the `;` of depth 0, the name before the `:`. */
const sessionKeys=()=>{const text=fs.readFileSync(src('lib/session/store.ts'),'utf8');const at=text.indexOf('export interface Session {');assert(at>=0,'interface Session is in store.ts');
 let i=text.indexOf('{',at),depth=0,j=i;for(;j<text.length;j++){const c=text[j];if(c==='{')depth++;else if(c==='}'&&--depth===0)break;}
 const body=text.slice(i+1,j).replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'');
 const keys=[];let d=0,start=0;for(let k=0;k<=body.length;k++){const c=body[k];if('{(['.includes(c))d++;else if('})]'.includes(c))d--;else if((c===';'&&d===0)||k===body.length){const m=/^\s*([A-Za-z_]\w*)\??\s*:/.exec(body.slice(start,k));if(m)keys.push(m[1]);start=k+1;}}
 return keys;};
const wire=(v)=>JSON.parse(JSON.stringify(v));

test('GUARD (P5): every Session key is in LOBBY or GUEST_BLANK, not both - read from store.ts source, so a new field fails the gate without tsc',()=>{
 const keys=sessionKeys();
 assert(keys.length>=40,`the reader finds the Session keys (found ${keys.length})`);
 for(const k of ['essayPlan','worked','workroom','week','away','watch','essayAt','back','pin','learner'])assert(keys.includes(k),`${k} is read from interface Session`);
 const {LOBBY,GUEST_BLANK}=pairing(),blank=Object.keys(GUEST_BLANK);
 for(const k of keys)assert(LOBBY.includes(k)!==blank.includes(k),`Session.${k} must be in exactly one of LOBBY and GUEST_BLANK (pairing.ts)`);
 for(const k of [...LOBBY,...blank])assert(keys.includes(k),`${k} is in LOBBY/GUEST_BLANK but not on Session`);
 for(const k of ['essayPlan','worked','workroom'])assert(blank.includes(k)&&!LOBBY.includes(k),`${k} is blanked for a guest`);
});

/** A desk where every Session key holds something a guest must not see. */
function fullSession(){
 const keys=sessionKeys(),s=evening('landing'),full={...s};
 for(const k of keys)if(!pairing().LOBBY.includes(k))full[k]={secret:k,text:'dictated by the learner'};
 full.back='hint';full.essayAt=3;full.watch={secret:'watch'};
 globalThis.__desk.session=full;return {keys,full};
}
test('case 8 (P5): a guest handed a session with every key filled sees the LOBBY and every other key at its GUEST_BLANK value - by GET and by the stream',async()=>{
 const {keys,full}=fullSession();const {LOBBY,GUEST_BLANK}=pairing();const blank=wire(GUEST_BLANK);
 for(const [how,g] of [['GET',await (await get('guest')).json()],['stream',await firstMessage('guest')]]){
  for(const k of keys){
   if(LOBBY.includes(k))continue;
   assert.deepEqual(g[k],blank[k],`${how}: ${k} is its GUEST_BLANK value`);
  }
  for(const k of ['essayPlan','worked','workroom','week','away','watch','essayAt','back'])assert(g[k]===undefined||g[k]===null,`${how}: ${k} is absent or empty`);
  assert.equal(g.essayPlan,undefined,`${how}: essayPlan (the dictated sentences) is absent`);
  assert.equal(g.worked,undefined,`${how}: worked is absent`);
  assert.equal(g.workroom,undefined,`${how}: workroom is absent`);
  assert.equal(g.viewer,'guest');assert.equal(g.pin,'');assert.equal(g.joined,false);
  assert.equal(g.screen,full.screen);assert.equal(g.subject,full.subject);assert.deepEqual(g.learner,full.learner);assert.equal(g.phoneUrl,full.phoneUrl);assert.equal(g.updatedAt,full.updatedAt);
  assert.equal(g.draft,null,`${how}: the draft is shown only on profile`);
 }
 globalThis.__desk.session={...full,screen:'profile',draft:{id:'p1',name:'Ada',type:'elementary',modules:['english']}};
 assert.equal((await (await get('guest')).json()).draft.name,'Ada','on profile the guest still sees the name being typed');
});

test('case 9 (P5): the fix narrows only the guest - a joined phone and the TV still receive essayPlan, worked and workroom',async()=>{
 evening('landing');
 const extra={essayPlan:{slots:['I think'] },worked:{topic:'t',title:'Worked',idea:'i',own:false,steps:[],examples:[]},workroom:{titles:['x']}};
 globalThis.__desk.session={...store.getSession(),...extra};
 const t=await (await get('tv')).json(),p=await (await get('phone')).json();
 for(const k of Object.keys(extra)){assert.deepEqual(t[k],extra[k],`the TV still receives ${k}`);assert.deepEqual(p[k],extra[k],`a joined phone still receives ${k}`);}
 assert.equal(t.viewer,'tv');assert.equal(p.viewer,'phone');assert.equal(p.pin,'');
});
