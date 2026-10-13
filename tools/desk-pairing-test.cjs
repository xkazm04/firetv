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
/** Join as a guest with the code on the session now; the cookie the desk set (PR8: the phone's own token). */
const joinAs=async()=>{const r=await post({type:'join',code:store.getSession().pin},'guest');return 'desk-phone='+setCookie(r,'desk-phone');};
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
 assert.notEqual(setCookie(r,'desk-phone'),hmac(theKey(),pin),'PR8: desk-phone is the phone own token, no longer the HMAC of the key and the pin');
 assert.equal(store.getSession().joined,true);
 const v=await r.json();assert.equal(v.viewer,'phone');assert.equal(v.pin,'');assert.equal(v.joined,true);
 // critic revise: the key file holds the key and (PR8) the phones' fingerprints; the pin lives on the session. Changed openly: PR8 adds phones beside the key.
 assert.deepEqual(Object.keys(JSON.parse(fs.readFileSync(keyFile(),'utf8'))).sort(),['key','phones']);
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
 const tv=`desk-tv=${hmac(key,'tv')}`,phone=await joinAs();// PR8: a phone's cookie is its own token, joined for
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

test('case 5: a reset (the TV, PR9) forgets every phone; /tv?key= sets desk-tv and drops the key from the address',async()=>{
 evening('landing');const key=theKey(),old=store.getSession().pin;
 const phone=await joinAs();// PR8: a phone's cookie is its own token
 assert.equal((await through('/api/hint',{cookie:phone})).role,'phone');
 assert.equal((await post({type:'reset'},'tv')).status,200);// PR9: the route's reset empties the list (PR8: the pin holds no phone)
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
  // a phone whose entry is gone (a TV reset forgot it) on the open stream is a guest from the next message on
  const ph=await (await streamRoute().GET(req('/api/session/stream',{role:'phone',cookie:await joinAs()}))).body.getReader();
  assert.equal((await read(ph)).viewer,'phone');
  await post({type:'reset'},'tv');// PR9: the TV's reset forgets every phone
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
 // changed openly (PR10): the code works once, so the same post a second time is a wrong code (no phone keeps a code now)
 const again=await post({type:'join',code},'guest');assert.equal(again.status,403);
});

test('case 7: a join shows Joined only to a TV waiting to be paired - mid-session a phone (a parent, or a remembered one rejoining) slips in and the page stays',async()=>{
 const {follow}=require(src('app/phone/panelFor.ts'));
 // the first phone ever: the TV was not joined, so it confirms, from wherever it stood
 evening('landing');let pin=store.getSession().pin;
 let r=await post({type:'join',code:store.getSession().pin},'guest');assert.equal(r.status,200);assert.equal(store.getSession().screen,'joined','first join -> the Joined screen');
 // the TV on the code: it is waiting for a phone, so the join confirms even on a joined desk
 globalThis.__desk.session={...store.getSession(),screen:'pair',focus:1};
 r=await post({type:'join',code:store.getSession().pin},'guest');assert.equal(r.status,200);assert.equal(store.getSession().screen,'joined','join while on pair -> joined');assert.equal(store.getSession().focus,0);
 // Ema on her page, the desk already joined: a parent's phone joins and the TV does not move
 globalThis.__desk.session={...store.getSession(),screen:'page',focus:2,itemIx:1};
 r=await post({type:'join',code:store.getSession().pin},'guest');assert.equal(r.status,200);
 let s=store.getSession();assert.equal(s.joined,true);assert.equal(s.screen,'page','join mid-session -> the page stays');assert.equal(s.focus,2);assert.equal(s.itemIx,1);
 const v=await r.json();assert.equal(v.screen,'page');
 const step=follow(undefined,v,{panel:'join',role:'student',busy:false});assert.equal(step.to,'joined','the phone lands on its confirmation, not a blank panel');
 // Ema's own phone reloads (its cookie gone) and joins with the code the TV shows now (PR10: the old one was used): the same silent join
 r=await post({type:'join',code:store.getSession().pin},'guest');assert.equal(r.status,200);s=store.getSession();assert.equal(s.screen,'page','a remembered rejoin mid-session -> stays');assert.equal(s.focus,2);
 // a draft still owns the screen: never the profile, even for a first phone
 evening('profile');pin=store.getSession().pin;
 r=await post({type:'join',code:store.getSession().pin},'guest');assert.equal(r.status,200);assert.equal(store.getSession().screen,'profile');
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

// ---- Delivery 8 (PR1-PR3): the address, the code, the bad request ----
const a4=(address,internal=false)=>({address,family:'IPv4',internal,netmask:'255.255.255.0',mac:'00:00:00:00:00:00',cidr:null});
const lan=()=>require(src('lib/session/lan.ts'));
/** One table of cases: the helper (lib/session/lan.ts) and the dev-https script (tools/desk-dev-https.cjs) are both held to it. */
const LAN_CASES=[
 ['the measured host: Tailscale, Wi-Fi 2, vEthernet (WSL) -> the Wi-Fi',{'Tailscale':[a4('100.100.134.107')],'Wi-Fi 2':[a4('10.0.0.140')],'vEthernet (WSL)':[a4('172.25.208.1')],'Loopback':[a4('127.0.0.1',true)]},{},'10.0.0.140'],
 ['a vEthernet 172.x listed before a Wi-Fi 192.168.x -> the 192.168',{'vEthernet (Default Switch)':[a4('172.20.0.1')],'Wi-Fi':[a4('192.168.1.20')]},{},'192.168.1.20'],
 ['only Tailscale and a link-local address -> Tailscale',{'Ethernet':[a4('169.254.3.4')],'Tailscale':[a4('100.64.0.9')]},{},'100.64.0.9'],
 ['no non-internal IPv4 -> localhost',{'lo':[a4('127.0.0.1',true)],'Wi-Fi':[{address:'fe80::1',family:'IPv6',internal:false}]},{},'localhost'],
 ['a virtual adapter after a real one in the same rank',{'VirtualBox Host-Only':[a4('192.168.56.1')],'Wi-Fi':[a4('192.168.1.7')]},{},'192.168.1.7'],
 ['DESK_PHONE_HOST wins over all of them',{'Wi-Fi':[a4('192.168.1.20')]},{DESK_PHONE_HOST:'desk.local'},'desk.local'],
 ['a blank DESK_PHONE_HOST is not an override',{'Wi-Fi':[a4('192.168.1.20')]},{DESK_PHONE_HOST:'   '},'192.168.1.20'],
];
for(const [name,ifaces,env,want] of LAN_CASES)test('PR1: lanHost - '+name,()=>{assert.equal(lan().lanHost(ifaces,env),want);});
test('PR1: phoneUrl() (store.ts) and the landing page pick through the same helper',()=>{
 const was=process.env.DESK_PHONE_HOST;
 mock.method(os,'networkInterfaces',()=>LAN_CASES[0][1]);
 try{
  store.dispatch({type:'reset'});assert.match(store.getSession().phoneUrl,/^http:\/\/10\.0\.0\.140:\d+\/phone$/,'phoneUrl follows the ranked pick');
  process.env.DESK_PHONE_HOST='desk.example';store.dispatch({type:'reset'});assert.match(store.getSession().phoneUrl,/^http:\/\/desk\.example:\d+\/phone$/);
 }finally{mock.restoreAll();if(was===undefined)delete process.env.DESK_PHONE_HOST;else process.env.DESK_PHONE_HOST=was;store.dispatch({type:'reset'});}
 const page=fs.readFileSync(src('app/page.tsx'),'utf8');assert.match(page,/lanHost\(/,'the landing page shows the same host');assert.doesNotMatch(page,/networkInterfaces/);
});
test('PR1: tools/desk-dev-https.cjs --address answers the same table',()=>{
 const {spawnSync}=require('node:child_process');
 for(const [name,ifaces,env,want] of LAN_CASES){
  const r=spawnSync(process.execPath,[path.resolve(__dirname,'desk-dev-https.cjs'),'--address'],{cwd:root,encoding:'utf8',env:{...process.env,DESK_PHONE_HOST:'',...env,DESK_FAKE_INTERFACES:JSON.stringify(ifaces)}});
  assert.equal(r.stdout.trim(),want,name+' '+r.stderr);
 }
});

// ---- PR2: the code ----
const DESK_JOIN=()=>{globalThis.__deskJoin=undefined;};
const wrongOf=(pin)=>pin==='1000'?'1001':'1000';
const TOO_MANY='Too many wrong codes. Wait five minutes, then type the code again.';
process.env.DESK_JOIN_DELAY_MS='0';
test('PR2: a wrong code is refused after the delay, and the right code still joins',async()=>{
 evening('pair');DESK_JOIN();const pin=store.getSession().pin;
 process.env.DESK_JOIN_DELAY_MS='150';
 try{
  for(const body of [{type:'join',code:wrongOf(pin)},{type:'join'}]){
   const t0=Date.now();const r=await post(body,'guest');const ms=Date.now()-t0;
   assert.equal(r.status,403);assert(ms>=120,`refused after ${ms} ms, not at once`);
  }
  const t0=Date.now();const r=await post({type:'join',code:pin},'guest');assert.equal(r.status,200);assert(Date.now()-t0<120,'the right code is not delayed');
 }finally{process.env.DESK_JOIN_DELAY_MS='0';}
});
test('PR2: 10 wrong codes start a five-minute cooldown; the right code is refused in it and joins after it',async()=>{
 evening('pair');DESK_JOIN();const pin=store.getSession().pin,bad=wrongOf(pin);
 mock.timers.enable({apis:['Date'],now:1_000_000});
 try{
  for(let i=0;i<10;i++){const r=await post({type:'join',code:bad},'guest');assert.equal(r.status,403);assert.equal((await r.json()).error,'That code is not on the TV.',`refusal ${i+1} is a wrong code`);}
  assert.equal(pairing().TOO_MANY_CODES,TOO_MANY);
  let r=await post({type:'join',code:pin},'guest');assert.equal(r.status,403);assert.deepEqual(await r.json(),{error:TOO_MANY});
  assert.equal(store.getSession().joined,false);
  mock.timers.tick(4*60_000);r=await post({type:'join',code:pin},'guest');assert.equal(r.status,403,'still cooling at four minutes');
  mock.timers.tick(61_000);r=await post({type:'join',code:pin},'guest');assert.equal(r.status,200,'after the cooldown the right code joins');
  // PR10: the code turned over with that join, so the next right code is the new one
  for(let i=0;i<9;i++)await post({type:'join',code:wrongOf(store.getSession().pin)},'guest');
  r=await post({type:'join',code:store.getSession().pin},'guest');assert.equal(r.status,200,'a success set the count to zero: nine more wrong codes do not lock');
 }finally{mock.timers.reset();}
});
test('PR2: a lockout leaves the pin as it was and a phone that joined before it is still a phone; the TV and an in-process join are not held',async()=>{
 evening('pair');DESK_JOIN();const pin=store.getSession().pin,bad=wrongOf(pin);
 const first=await post({type:'join',code:pin},'guest');const cookie='desk-phone='+setCookie(first,'desk-phone');
 const turned=store.getSession().pin;// PR10: the first join turned the code over; the lockout then leaves it as it is
 for(let i=0;i<10;i++)await post({type:'join',code:wrongOf(turned)},'guest');
 assert.equal((await post({type:'join',code:turned},'guest')).status,403,'locked');
 assert.equal(store.getSession().pin,turned,'the pin is unchanged');
 assert.equal(pairing().roleOf(pairing().cookiesOf(new Request('http://desk/',{headers:{cookie}}))),'phone','the earlier phone is still a phone');
 assert.equal((await post({type:'join'},'tv')).status,200,'the TV joins during the cooldown');
 assert.equal((await post({type:'join'},undefined)).status,200,'an in-process join joins during the cooldown');
});
test('PR2: the TV and in-process joins are never counted toward the budget',async()=>{
 evening('pair');DESK_JOIN();const pin=store.getSession().pin;
 for(let i=0;i<12;i++){await post({type:'join'},'tv');await post({type:'join'},undefined);}
 assert.equal((await post({type:'join',code:pin},'guest')).status,200);
});

// ---- PR3: the bad request and the key file ----
test('PR3: a body that is not JSON, is null, or is empty answers 400 to a guest',async()=>{
 evening('pair');
 for(const raw of ['{not json','null','','[1]','"x"']){
  const r=await sessionRoute().POST(new Request('http://desk/api/session',{method:'POST',headers:{'x-desk-role':'guest','Content-Type':'application/json'},body:raw}));
  assert.equal(r.status,400,JSON.stringify(raw));assert.deepEqual(await r.json(),{error:'The desk could not read that request.'});
 }
});
test('PR3: an unreadable pairing.json logs one line naming the file and the reason, and a key is minted',()=>{
 pairing().tvKey();
 const f=keyFile(),was=fs.readFileSync(f,'utf8');
 const lines=[];mock.method(console,'error',(...a)=>lines.push(a.join(' ')));
 try{
  fs.writeFileSync(f,'{not json');fs.utimesSync(f,new Date(1),new Date(1));
  const key=pairing().tvKey();
  assert.equal(lines.length,1,lines.join('|'));assert.match(lines[0],/pairing\.json/);assert.match(lines[0],/new key/);assert.match(lines[0],/TV/);
  assert.equal(JSON.parse(fs.readFileSync(f,'utf8')).key,key);assert(key.length>=16);
 }finally{mock.restoreAll();fs.writeFileSync(f,was);}
});

// ---- PR4: the stream survives a foreign cookie and never stays open and silent ----
const DEC=new TextDecoder();
const phoneCookie=async()=>{evening('pair');DESK_JOIN();const pin=store.getSession().pin;const r=await post({type:'join',code:pin},'guest');return 'desk-phone='+setCookie(r,'desk-phone');};
test('PR4: a phone stream whose Cookie header carries a malformed foreign value still gets its first message, as a phone',async()=>{
 const cookie=await phoneCookie()+'; other=%E0';
 mock.timers.enable({apis:['setInterval']});
 try{
  const res=await streamRoute().GET(req('/api/session/stream',{role:'phone',cookie}));const rd=res.body.getReader();
  const first=await Promise.race([rd.read(),new Promise((_,no)=>setTimeout(()=>no(new Error('no message arrived')),1500))]);
  assert.equal(JSON.parse(DEC.decode(first.value).replace(/^data: /,'')).viewer,'phone');await rd.cancel();
 }finally{mock.timers.reset();}
});
test('PR4: cookiesOf and Next\'s RequestCookies classify five Cookie headers the same way',async()=>{
 const phone=await phoneCookie(),tv='desk-tv='+pairing().tvToken();
 const headers=[phone,phone+'; other=%E0',phone+'; other=abc%',tv,undefined];
 const want=['phone','phone','phone','tv','guest'];
 headers.forEach((h,i)=>{
  const mine=pairing().roleOf(pairing().cookiesOf(new Request('http://desk/',{headers:h?{cookie:h}:{}})));
  const nexts=pairing().roleOf(new NextRequest('http://desk/',{headers:h?{cookie:h}:{}}).cookies);
  assert.equal(nexts,want[i],`Next, header ${i}`);assert.equal(mine,nexts,`header ${i}: ${h}`);
 });
});
test('PR4: a throw while drawing logs one line and the stream ends, with the ping cleared',async()=>{
 evening('pair');const lines=[];mock.method(console,'error',(...a)=>lines.push(a.join(' ')));
 mock.timers.enable({apis:['setInterval']});
 try{
  const subs=globalThis.__desk.subs,before=subs.size;
  const rd=(await streamRoute().GET(req('/api/session/stream',{role:'guest'}))).body.getReader();
  await rd.read();assert.equal(subs.size,before+1);
  const loop={...store.getSession()};loop.learner=loop;
  subs.forEach((f)=>f(loop));
  const end=await Promise.race([rd.read(),new Promise((_,no)=>setTimeout(()=>no(new Error('the stream stayed open')),1500))]);
  assert.equal(end.done,true);assert.equal(subs.size,before,'unsubscribed');
  assert.equal(lines.length,1,lines.join('|'));assert.match(lines[0],/^desk session stream:/);
 }finally{mock.restoreAll();mock.timers.reset();}
});

// ---- PR6: a cap on guest streams, and a reader that stopped reading is let go ----
const open=async(role,cookie)=>(await streamRoute().GET(req('/api/session/stream',{role,cookie}))).body.getReader();
const endsSoon=(rd)=>Promise.race([(async()=>{for(;;){const x=await rd.read();if(x.done)return true;}})(),new Promise((r)=>setTimeout(()=>r(false),1500))]);
const push=()=>{const s=store.getSession();[...globalThis.__desk.subs].forEach((f)=>f(s));};
test('PR6: nine guest streams close the oldest, and the subscriber set grows by at most eight',async()=>{
 evening('pair');mock.timers.enable({apis:['setInterval']});
 try{
  const subs=globalThis.__desk.subs,before=subs.size,rs=[];
  for(let i=0;i<9;i++)rs.push(await open('guest'));
  assert.equal(subs.size-before,8);
  assert.equal(await endsSoon(rs[0]),true,'the first guest stream ended');
  for(const r of rs.slice(1))await r.cancel();
  assert.equal(subs.size,before);
 }finally{mock.timers.reset();}
});
test('PR6: a TV stream and a phone stream opened first stay open through twenty guest arrivals',async()=>{
 const cookie=await phoneCookie();mock.timers.enable({apis:['setInterval']});
 try{
  const subs=globalThis.__desk.subs,before=subs.size;
  const tv=await open('tv'),ph=await open('phone',cookie),inproc=(await streamRoute().GET()).body.getReader();
  const guests=[];for(let i=0;i<20;i++)guests.push(await open('guest'));
  assert.equal(subs.size-before,3+8);
  for(const r of [tv,ph,inproc])await r.read();// the first message
  push();
  for(const [n,r] of [['tv',tv],['phone',ph],['in-process',inproc]]){const x=await Promise.race([r.read(),new Promise((_,no)=>setTimeout(()=>no(new Error(n+' got nothing')),1500))]);assert.equal(x.done,false,n+' is still open');}
  for(const r of [tv,ph,inproc,...guests.slice(12)])await r.cancel();
 }finally{mock.timers.reset();}
});
test('PR6: an unread guest stream is closed after 32 unread messages and leaves the set; a stream that reads keeps getting messages',async()=>{
 evening('pair');mock.timers.enable({apis:['setInterval']});
 try{
  const subs=globalThis.__desk.subs,before=subs.size;
  const idle=await open('guest'),busy=await open('tv');
  assert.equal(subs.size,before+2);
  let got=0;
  for(let i=0;i<40;i++){push();await busy.read();got++;}
  assert.equal(got,40);
  assert.equal(subs.size,before+1,'only the idle stream left');
  let n=0;for(;;){const x=await idle.read();if(x.done)break;n++;}
  assert(n<=32,`${n} messages were queued`);assert(n>=31,`${n}`);
  await busy.cancel();assert.equal(subs.size,before);
 }finally{mock.timers.reset();}
});

// ---- PR12: the TV, and each listed phone, keep at most four session streams ----
const devKeys=()=>[...(globalThis.__deskDeviceStreams?.keys()??[])];
const gotNext=async(n,r)=>{const x=await Promise.race([r.read(),new Promise((_,no)=>setTimeout(()=>no(new Error(n+' got nothing')),1500))]);assert.equal(x.done,false,n+' is still open');};
const nextAll=async(named)=>{for(const r of named)await r.read();push();for(const [n,r] of named.map((r,i)=>['stream '+i,r]))await gotNext(n,r);};
test('PR12: five streams on one phone cookie: the set grows by four, the first ends, the other four get the next push',async()=>{
 const cookie=await phoneCookie();mock.timers.enable({apis:['setInterval']});
 try{
  const subs=globalThis.__desk.subs,before=subs.size,keys=devKeys(),rs=[];
  for(let i=0;i<5;i++)rs.push(await open('phone',cookie));
  assert.equal(subs.size-before,4);
  assert.equal(await endsSoon(rs[0]),true,'the first phone stream ended');
  await nextAll(rs.slice(1));
  for(const r of rs.slice(1))await r.cancel();
  assert.equal(subs.size,before);assert.deepEqual(devKeys(),keys);
 }finally{mock.timers.reset();}
});
test('PR12: a copied cookie shares its phone\'s four',async()=>{
 const cookie=await phoneCookie();mock.timers.enable({apis:['setInterval']});
 try{
  const subs=globalThis.__desk.subs,before=subs.size,rs=[];
  for(let i=0;i<3;i++)rs.push(await open('phone',cookie));
  rs.push(await open('phone',cookie+'; other=1'));rs.push(await open('phone','a=b; '+cookie));
  assert.equal(subs.size-before,4);
  assert.equal(await endsSoon(rs[0]),true,'the first stream ended');
  await nextAll(rs.slice(1));
  for(const r of rs.slice(1))await r.cancel();
  assert.equal(subs.size,before);
 }finally{mock.timers.reset();}
});
test('PR12: two phones have a cap each',async()=>{
 const a=await phoneCookie(),b=await phoneCookie();assert.notEqual(a,b);
 mock.timers.enable({apis:['setInterval']});
 try{
  const subs=globalThis.__desk.subs,before=subs.size,ra=[],rb=[];
  for(let i=0;i<4;i++)ra.push(await open('phone',a));
  for(let i=0;i<5;i++)rb.push(await open('phone',b));
  assert.equal(subs.size-before,8);
  assert.equal(await endsSoon(rb[0]),true,"B's first stream ended");
  await nextAll([...ra,...rb.slice(1)]);
  for(const r of [...ra,...rb.slice(1)])await r.cancel();
  assert.equal(subs.size,before);
 }finally{mock.timers.reset();}
});
test('PR12: five TV streams close the first; an earlier phone stream and the guests are untouched',async()=>{
 const cookie=await phoneCookie();mock.timers.enable({apis:['setInterval']});
 try{
  const subs=globalThis.__desk.subs,before=subs.size;
  const ph=await open('phone',cookie),tvs=[];
  for(let i=0;i<5;i++)tvs.push(await open('tv'));
  const gs=[];for(let i=0;i<3;i++)gs.push(await open('guest'));
  assert.equal(subs.size-before,1+4+3);
  assert.equal(await endsSoon(tvs[0]),true,'the first TV stream ended');
  await nextAll([ph,...tvs.slice(1),...gs]);
  for(const r of [ph,...tvs.slice(1),...gs])await r.cancel();
  assert.equal(subs.size,before);
 }finally{mock.timers.reset();}
});
test('PR12: five in-process streams all stay open',async()=>{
 mock.timers.enable({apis:['setInterval']});
 try{
  const subs=globalThis.__desk.subs,before=subs.size,rs=[];
  for(let i=0;i<5;i++)rs.push((await streamRoute().GET()).body.getReader());
  assert.equal(subs.size-before,5);
  await nextAll(rs);
  for(const r of rs)await r.cancel();
  assert.equal(subs.size,before);
 }finally{mock.timers.reset();}
});
test('PR12: many streams on one phone cookie leave four subscribers, and a push costs little (figures recorded, not asserted)',async()=>{
 const cookie=await phoneCookie();mock.timers.enable({apis:['setInterval']});
 try{
  const subs=globalThis.__desk.subs,before=subs.size,N=+process.env.PR12_N||2000;
  const t0=Date.now();
  for(let i=0;i<N;i++)await open('phone',cookie);
  const openMs=Date.now()-t0;
  assert.equal(subs.size-before,4);
  const ms=[];for(let i=0;i<21;i++){const t=process.hrtime.bigint();push();ms.push(Number(process.hrtime.bigint()-t)/1e6);}
  ms.sort((x,y)=>x-y);
  console.log(`PR12 figures: opened ${N} in ${openMs} ms; push median ${ms[10].toFixed(3)} ms, max ${ms[20].toFixed(3)} ms`);
 }finally{mock.timers.reset();}
});
test('PR12: when every stream of a phone and of the TV is cancelled, the set and the device map are as they were',async()=>{
 const cookie=await phoneCookie();mock.timers.enable({apis:['setInterval']});
 try{
  const subs=globalThis.__desk.subs,before=subs.size,keys=devKeys();
  const rs=[];for(let i=0;i<3;i++){rs.push(await open('phone',cookie));rs.push(await open('tv'));}
  assert.equal(subs.size-before,6);
  for(const r of rs)await r.cancel();
  assert.equal(subs.size,before);assert.deepEqual(devKeys(),keys,'no key left behind');
 }finally{mock.timers.reset();}
});

// ---- PR7: the pin is drawn with node:crypto ----
test('PR7: 2000 fresh() pins are four digits, 1000 to 9999, and the pin line holds no Math.random',()=>{
 for(let i=0;i<2000;i++){const p=store.fresh().pin;assert.match(p,/^\d{4}$/);assert(+p>=1000&&+p<=9999,p);}
 // changed openly (PR10): the draw is one helper that fresh() and pin.turn both use, so the line to check is the helper's
 const text=fs.readFileSync(src('lib/session/store.ts'),'utf8'),line=text.split('\n').filter((l)=>/^const drawPin = /.test(l));
 assert.equal(line.length,1);assert.doesNotMatch(line[0],/Math\.random/);assert.match(line[0],/String\(randomInt\(1000, 10000\)\)/);
 assert.match(text,/^\s*pin: drawPin\(\),/m,'fresh draws with it');
});

// ---- pinned only (robustness-3 a and d): guards, no fix needed ----
test('GUARD: 200 wrong-code joins fired at once check at most ten codes and refuse the rest with the cooldown text',async()=>{
 evening('pair');DESK_JOIN();const pin=store.getSession().pin,bad=wrongOf(pin);
 const rs=await Promise.all(Array.from({length:200},()=>post({type:'join',code:bad},'guest')));
 const texts=await Promise.all(rs.map(async(r)=>{assert.equal(r.status,403);return (await r.json()).error;}));
 assert.equal(texts.filter((t)=>t==='That code is not on the TV.').length,10);
 assert.equal(texts.filter((t)=>t===TOO_MANY).length,190);
});
test('GUARD: a TV join during the cooldown still joins',async()=>{
 evening('pair');DESK_JOIN();const bad=wrongOf(store.getSession().pin);
 for(let i=0;i<10;i++)await post({type:'join',code:bad},'guest');
 assert.equal((await post({type:'join',code:bad},'guest')).status,403);
 assert.equal((await post({type:'join'},'tv')).status,200);
});

// ---- PR8: a phone's credential is its own ----
const fpOf=(token)=>crypto.createHash('sha256').update(token).digest('hex');
const tokenOf=(cookie)=>cookie.replace(/^desk-phone=/,'');
const pj=()=>JSON.parse(fs.readFileSync(keyFile(),'utf8'));
let tick=0;
/** Write pairing.json as the test wants it. The mtime is set to a new second each time, so no write hides behind a coarse clock. */
const put=(phones)=>{pairing().tvKey();fs.writeFileSync(keyFile(),JSON.stringify({key:pj().key,phones}));const t=new Date(Date.now()+(++tick)*1000);fs.utimesSync(keyFile(),t,t);};
const roleOfCookie=(cookie)=>pairing().roleOf(pairing().cookiesOf(new Request('http://desk/',{headers:cookie?{cookie}:{}})));
const MIN=60_000,HOUR=60*MIN,DAY=24*HOUR;
test('PR8: two guests join in turn and get two different cookies, each a phone, neither the HMAC of the key and a pin; pairing.json lists two fingerprints and no token',async()=>{
 evening('pair');DESK_JOIN();put([]);const key=theKey();
 const pins=[store.getSession().pin];const a=await joinAs();pins.push(store.getSession().pin);const b=await joinAs();
 assert.notEqual(a,b);assert.equal(roleOfCookie(a),'phone');assert.equal(roleOfCookie(b),'phone');
 for(const c of [a,b])for(const p of pins)assert.notEqual(tokenOf(c),hmac(key,p),'not the HMAC of the key and the pin');
 const f=pj();assert.equal(f.phones.length,2);
 assert.deepEqual(f.phones.map((x)=>x.fp).sort(),[fpOf(tokenOf(a)),fpOf(tokenOf(b))].sort());
 const text=fs.readFileSync(keyFile(),'utf8');assert(!text.includes(tokenOf(a))&&!text.includes(tokenOf(b)),'no token on disk');
 for(const x of f.phones){assert(Math.abs(x.joined-Date.now())<60_000);assert(Math.abs(x.seen-Date.now())<60_000);}
});
test('PR8: a cookie of the old shape, the HMAC of the key and the pin, is a guest through roleOf and liveRole',()=>{
 evening('pair');DESK_JOIN();put([]);const old='desk-phone='+hmac(theKey(),store.getSession().pin);
 assert.equal(roleOfCookie(old),'guest');
 assert.equal(pairing().liveRole(req('/api/session/stream',{role:'phone',cookie:old})),'guest');
});
test('PR8: a listed phone is still a phone after the pin turns over',async()=>{
 evening('pair');DESK_JOIN();put([]);const c=await joinAs();
 const was=store.getSession().pin;do store.dispatch({type:'reset'});while(store.getSession().pin===was);
 assert.equal(roleOfCookie(c),'phone');
 assert.equal(pairing().liveRole(req('/api/session/stream',{role:'phone',cookie:c})),'phone');
});
test('PR8: a listed phone that posts join with no code is answered as a phone - no new token, no Set-Cookie, the pin and the list unchanged',async()=>{
 evening('pair');DESK_JOIN();put([]);const c=await joinAs();
 const pin=store.getSession().pin,list=fs.readFileSync(keyFile(),'utf8');
 const r=await post({type:'join'},'phone',c);assert.equal(r.status,200);
 assert.equal((await r.json()).viewer,'phone');assert.equal(setCookie(r,'desk-phone'),undefined);
 assert.equal(store.getSession().pin,pin);assert.equal(fs.readFileSync(keyFile(),'utf8'),list);
});
test('PR8: a listed phone that joins with the right code gets a new token that replaces its entry',async()=>{
 evening('pair');DESK_JOIN();put([]);const c=await joinAs();
 const r=await post({type:'join',code:store.getSession().pin},'phone',c);assert.equal(r.status,200);
 const n=setCookie(r,'desk-phone');assert(n&&n!==tokenOf(c));
 const f=pj();assert.equal(f.phones.length,1,'it replaced the entry');assert.equal(f.phones[0].fp,fpOf(n));
});
test('PR8: the TV\'s join and an in-process join set no cookie and change neither the list nor the pin',async()=>{
 evening('pair');DESK_JOIN();put([]);await joinAs();
 const pin=store.getSession().pin,list=fs.readFileSync(keyFile(),'utf8');
 for(const role of ['tv',undefined]){const r=await post({type:'join'},role);assert.equal(r.status,200);assert.equal(setCookie(r,'desk-phone'),undefined);
  assert.equal(store.getSession().pin,pin);assert.equal(fs.readFileSync(keyFile(),'utf8'),list);}
});

// ---- PR9: a phone lapses, the list is capped, and a phone can be forgotten ----
/** A phone the test lists by hand: its token and its entry, seen `ago` ms back. */
const listedAgo=(name,ago)=>{const token='token-'+name+'-'.padEnd(40,'x');return {cookie:'desk-phone='+token,entry:{fp:fpOf(token),joined:Date.now()-ago,seen:Date.now()-ago}};};
test('PR9: a phone not seen for 31 days is a guest; one seen 29 days ago is a phone',()=>{
 evening('pair');const old=listedAgo('old',31*DAY),young=listedAgo('young',29*DAY);
 put([old.entry,young.entry]);
 assert.equal(roleOfCookie(old.cookie),'guest');assert.equal(roleOfCookie(young.cookie),'phone');
});
test('PR9: nine phones join - eight are listed, the one seen least recently is a guest, the other eight are phones',async()=>{
 evening('pair');DESK_JOIN();put([]);
 mock.timers.enable({apis:['Date'],now:Date.now()});
 try{
  const cookies=[];for(let i=0;i<9;i++){cookies.push(await joinAs());mock.timers.tick(1000);}
  assert.equal(pj().phones.length,8);
  assert.equal(roleOfCookie(cookies[0]),'guest','the first, seen least recently, was forgotten');
  for(const c of cookies.slice(1))assert.equal(roleOfCookie(c),'phone');
 }finally{mock.timers.reset();}
});
test('PR9: a leave with a listed cookie drops that fingerprint - the cookie is a guest, sent again too - and the other phones stay phones',async()=>{
 evening('pair');DESK_JOIN();put([]);const a=await joinAs(),b=await joinAs();
 const r=await post({type:'leave'},'phone',a);assert.equal(r.status,200);
 assert.match(r.headers.get('set-cookie')??'',/desk-phone=;/,'the cookie is cleared as before');
 assert.equal(roleOfCookie(a),'guest');
 assert.equal((await post({type:'leave'},'phone',a)).status,200);assert.equal(roleOfCookie(a),'guest','sent again, still a guest');
 assert.equal((await through('/api/hint',{cookie:a})).status,401);
 assert.equal(roleOfCookie(b),'phone');assert.equal(pj().phones.length,1);
});
test('PR9: a reset the route accepts - the TV\'s, or an in-process one - empties the list; a phone\'s reset is refused and changes nothing',async()=>{
 for(const role of ['tv',undefined]){
  evening('pair');DESK_JOIN();put([]);const a=await joinAs(),b=await joinAs();
  assert.equal((await post({type:'reset'},'phone',a)).status,403);assert.equal(roleOfCookie(a),'phone');assert.equal(pj().phones.length,2);
  assert.equal((await post({type:'reset'},role)).status,200);
  assert.equal(roleOfCookie(a),'guest');assert.equal(roleOfCookie(b),'guest');assert.deepEqual(pj().phones,[]);assert.equal(pj().key,theKey());
 }
});
test('PR9: isPhone writes last seen at most once an hour - a seen 10 minutes old leaves the file as it was, one 2 hours old becomes about now',()=>{
 evening('pair');const fresh=listedAgo('fresh',10*MIN);put([fresh.entry]);
 const text=fs.readFileSync(keyFile(),'utf8');
 assert.equal(roleOfCookie(fresh.cookie),'phone');assert.equal(fs.readFileSync(keyFile(),'utf8'),text,'10 minutes: no write');
 const stale=listedAgo('stale',2*HOUR);put([stale.entry]);
 assert.equal(roleOfCookie(stale.cookie),'phone');
 const f=pj();assert.equal(f.phones.length,1);assert.equal(f.phones[0].fp,stale.entry.fp);assert.equal(f.phones[0].joined,stale.entry.joined,'joined stays');
 assert(Math.abs(f.phones[0].seen-Date.now())<60_000,'seen is about now');
 const after=fs.readFileSync(keyFile(),'utf8');assert.equal(roleOfCookie(stale.cookie),'phone');assert.equal(fs.readFileSync(keyFile(),'utf8'),after,'then not again within the hour');
});
test('PR9: pairing.json is written through a temp file and a rename - after a join, a leave and a reset the data dir holds no temp file, and no writeFileSync goes straight to it',async()=>{
 evening('pair');DESK_JOIN();put([]);const a=await joinAs();await joinAs();
 await post({type:'leave'},'phone',a);await post({type:'reset'},'tv');
 const names=fs.readdirSync(data);assert(names.includes('pairing.json'));
 assert.deepEqual(names.filter((n)=>n.startsWith('pairing.json')&&n!=='pairing.json'),[],'no temp file left');
 const code=fs.readFileSync(src('lib/session/pairing.ts'),'utf8');
 const writes=[...code.matchAll(/writeFileSync\(\s*([^,]+),/g)].map((m)=>m[1].trim());
 assert(writes.length>=1&&writes.every((w)=>w==='tmp'),'every write goes to the temp file: '+writes.join('|'));
 assert.match(code,/renameSync\(tmp,/);
});
test('PR9: a failed seen write logs one line and the caller stays a phone for that request',()=>{
 evening('pair');const stale=listedAgo('failing',2*HOUR);put([stale.entry]);
 const lines=[];mock.method(console,'error',(...a)=>lines.push(a.join(' ')));
 mock.method(fs,'writeFileSync',()=>{throw new Error('disk full');});
 try{assert.equal(roleOfCookie(stale.cookie),'phone');}finally{mock.restoreAll();}
 assert.equal(lines.length,1,lines.join('|'));assert.match(lines[0],/pairing\.json/);assert.match(lines[0],/disk full/);
 assert.equal(pj().phones[0].seen,stale.entry.seen,'the file is as it was');
});

// ---- PR10: the code turns over once it is used ----
test('PR10: a guest join with the right code turns the pin over - the old code is then a wrong code, and it counts',async()=>{
 evening('pair');DESK_JOIN();put([]);const was=store.getSession().pin;
 assert.equal((await post({type:'join',code:was},'guest')).status,200);
 assert.notEqual(store.getSession().pin,was,'the pin turned');
 const r=await post({type:'join',code:was},'guest');assert.equal(r.status,403);assert.deepEqual(await r.json(),{error:'That code is not on the TV.'});
 assert.equal(globalThis.__deskJoin.wrong,1,'a used code typed again counts');
 assert.equal(pj().phones.length,1,'the refused join listed no phone');
});
test('PR10: a TV join and an in-process join leave the pin as it was; a listed phone join with no code too',async()=>{
 evening('pair');DESK_JOIN();put([]);const c=await joinAs();const pin=store.getSession().pin;
 for(const [role,cookie] of [['tv'],[undefined],['phone',c]]){assert.equal((await post({type:'join'},role,cookie)).status,200);assert.equal(store.getSession().pin,pin,String(role));}
});
test('PR10: a screen that posts pin.turn gets 403 and the pin stays',async()=>{
 evening('pair');DESK_JOIN();put([]);const c=await joinAs();const pin=store.getSession().pin;
 for(const [role,cookie] of [['tv'],['phone',c],['guest']]){const r=await post({type:'pin.turn'},role,cookie);assert.equal(r.status,403,String(role));assert.equal(store.getSession().pin,pin);}
});
test('PR10: pin.turn gives a four-digit pin never equal to the one just used, and changes nothing else',()=>{
 evening('page');
 for(let i=0;i<3000;i++){
  const before=store.getSession();store.dispatch({type:'pin.turn'});const after=store.getSession();
  assert.match(after.pin,/^\d{4}$/);assert(+after.pin>=1000&&+after.pin<=9999);assert.notEqual(after.pin,before.pin);
  if(i<3)assert.deepEqual({...after,pin:'',updatedAt:0},{...before,pin:'',updatedAt:0});
 }
});

// ---- PR11: a pairing write that fails changes nothing, and the phone says what happened ----
const NOT_SAVED={join:'The desk could not save this phone, so nothing changed. Type the same code again.',leave:'The desk could not forget this phone, so it is still paired. Try again.',reset:'The desk could not forget its phones, so nothing was reset. Try again.'};
/** pairing.json made unwritable as the council's replay did: a directory at the temp file's name. Returns the undo. */
const blockWrites=()=>{const d=`${keyFile()}.${process.pid}.tmp`;fs.mkdirSync(d);return ()=>fs.rmSync(d,{recursive:true,force:true});};
const quietErrors=()=>{const lines=[];mock.method(console,'error',(...a)=>lines.push(a.join(' ')));return lines;};
const oneLine=(lines)=>{assert.equal(lines.length,1,lines.join('|'));assert.match(lines[0],/pairing\.json/);};
test('PR11: the line texts are exported from pairing.ts',()=>{
 const p=pairing();assert.equal(p.JOIN_NOT_SAVED,NOT_SAVED.join);assert.equal(p.LEAVE_NOT_SAVED,NOT_SAVED.leave);assert.equal(p.RESET_NOT_SAVED,NOT_SAVED.reset);
});
test('PR11: a right code whose phone cannot be saved answers 500 JOIN_NOT_SAVED, sets no cookie, changes nothing; unblocked, the same code joins',async()=>{
 evening('pair');DESK_JOIN();put([]);const a=await joinAs();const before=fs.readFileSync(keyFile(),'utf8');
 globalThis.__deskJoin={wrong:3,until:0};const pin=store.getSession().pin,joined=store.getSession().joined;
 const unblock=blockWrites(),lines=quietErrors();
 try{
  const r=await post({type:'join',code:pin},'guest');
  assert.equal(r.status,500);assert.deepEqual(await r.json(),{error:NOT_SAVED.join});
  assert.equal(r.headers.get('set-cookie'),null,'no Set-Cookie');
  assert.equal(store.getSession().pin,pin);assert.equal(store.getSession().joined,joined);assert.equal(globalThis.__deskJoin.wrong,3);
  assert.equal(fs.readFileSync(keyFile(),'utf8'),before,'the file is as it was');assert.equal(roleOfCookie(a),'phone');
 }finally{mock.restoreAll();unblock();}
 oneLine(lines);
 const ok=await post({type:'join',code:pin},'guest');assert.equal(ok.status,200);
 const c='desk-phone='+setCookie(ok,'desk-phone');assert.equal(roleOfCookie(c),'phone');
 assert.notEqual(store.getSession().pin,pin,'the pin turned');assert.equal(globalThis.__deskJoin.wrong,0);
 assert.equal(pj().phones.length,2,'the failed mint left no phantom entry in memory to be written now');
});
test('PR11: a listed phone\'s leave that cannot be written answers 500 LEAVE_NOT_SAVED, clears no cookie, and the phone stays; unblocked, it leaves',async()=>{
 evening('pair');DESK_JOIN();put([]);const a=await joinAs();
 const unblock=blockWrites(),lines=quietErrors();
 try{
  const r=await post({type:'leave'},'phone',a);
  assert.equal(r.status,500);assert.deepEqual(await r.json(),{error:NOT_SAVED.leave});
  assert.doesNotMatch(r.headers.get('set-cookie')??'',/desk-phone/,'the cookie is not cleared');
  assert.equal(roleOfCookie(a),'phone','still a phone in this instance');assert.equal(pj().phones.length,1,'and in the file');
 }finally{mock.restoreAll();unblock();}
 oneLine(lines);
 const ok=await post({type:'leave'},'phone',a);assert.equal(ok.status,200);assert.match(ok.headers.get('set-cookie')??'',/desk-phone=;/);
 assert.equal(roleOfCookie(a),'guest');assert.deepEqual(pj().phones,[]);
});
test('PR11: a TV reset that cannot forget the phones answers 500 RESET_NOT_SAVED and resets nothing; unblocked, it resets',async()=>{
 evening('pair');DESK_JOIN();put([]);const a=await joinAs(),b=await joinAs();
 const pin=store.getSession().pin,learner=store.getSession().learner;
 const unblock=blockWrites(),lines=quietErrors();
 try{
  const r=await post({type:'reset'},'tv');
  assert.equal(r.status,500);assert.deepEqual(await r.json(),{error:NOT_SAVED.reset});
  assert.equal(store.getSession().pin,pin);assert.equal(store.getSession().learner,learner,'the session is unchanged');
  assert.equal(roleOfCookie(a),'phone');assert.equal(roleOfCookie(b),'phone');assert.equal(pj().phones.length,2);
 }finally{mock.restoreAll();unblock();}
 oneLine(lines);
 assert.equal((await post({type:'reset'},'tv')).status,200);
 assert.equal(roleOfCookie(a),'guest');assert.equal(roleOfCookie(b),'guest');assert.deepEqual(pj().phones,[]);
});
test('PR11: mintPhone, forgetPhone and forgetAllPhones each throw when the write fails, and leave memory equal to the file',async()=>{
 evening('pair');DESK_JOIN();put([]);const a=await joinAs(),b=await joinAs();const before=fs.readFileSync(keyFile(),'utf8');
 const token=(c)=>c.slice('desk-phone='.length);
 const unblock=blockWrites();
 try{
  assert.throws(()=>pairing().mintPhone(token(a)));
  assert.throws(()=>pairing().forgetPhone(token(a)));
  assert.throws(()=>pairing().forgetAllPhones());
  assert.equal(fs.readFileSync(keyFile(),'utf8'),before);
  assert.equal(roleOfCookie(a),'phone');assert.equal(roleOfCookie(b),'phone','memory still lists both');
 }finally{unblock();}
 const c=pairing().mintPhone(token(a));// the old entry is replaced: a was not already dropped by the failed mint
 assert.equal(roleOfCookie(a),'guest');assert.equal(roleOfCookie('desk-phone='+c),'phone');assert.equal(pj().phones.length,2,'b and the new one: no phantom');
 assert.equal(roleOfCookie(b),'phone');
});

// ---- scan-sweep optimize 2026-10-13 (session): what a caller may post, and what a failure leaves behind ----
test('OPT-1: a name longer than PROFILE_NAME_MAX is refused for a guest, a phone and the TV alike; the draft, the profiles and session.json stay small',async()=>{
 evening('profile');const max=store.PROFILE_NAME_MAX;assert.ok(Number.isInteger(max)&&max>=20,'the cap is exported and roomy');
 let r=await post({type:'profile.draft',patch:{name:'E'.repeat(max)}},'guest');assert.equal(r.status,200);assert.equal(store.getSession().draft.name.length,max,'a name at the cap is taken');
 for(const role of ['guest','phone','tv']){
  const before=store.getSession().draft;
  r=await post({type:'profile.draft',patch:{name:'x'.repeat(200000)}},role);
  assert.equal(store.getSession().draft,before,`${role}: the long name did not land on the draft`);
  assert.match(store.getSession().status,/name/i,`${role}: the status says why`);
 }
 const file=path.join(data,'session.json');assert.ok(fs.statSync(file).size<100000,'session.json does not carry the long name');
});
test('OPT-2: a timer.tick whose seconds are not a number from 1 to 60 moves neither the clock nor the evening\'s minutes; 1 and 59 still do',async()=>{
 evening('tonight');store.dispatch({type:'timer.start'});
 const at=()=>{const s=store.getSession();return {left:s.timer.left,minutes:s.log.minutes,phase:s.timer.phase};};
 for(const seconds of ['abc',-600,0,1e9,null,undefined,61,'5']){
  const before=at();const r=await post({type:'timer.tick',seconds},'phone');assert.equal(r.status,200);
  assert.deepEqual(at(),before,`seconds ${JSON.stringify(seconds)} moved the timer`);
  assert.ok(Number.isFinite(store.getSession().timer.left),'the clock is a number');
 }
 let b=at();store.dispatch({type:'timer.tick',seconds:1});assert.equal(at().left,b.left-1,'the desk\'s own tick');
 b=at();store.dispatch({type:'timer.tick',seconds:59});assert.equal(at().left,Math.max(0,b.left-59),'the TV\'s fast tick');
});
