/** Run from desk/ (npm run dev:https): next dev over HTTPS with a certificate for this computer's LAN address, so a phone's microphone works. --cert-only makes the files and stops. */
const fs=require('node:fs'),path=require('node:path'),{spawn,spawnSync}=require('node:child_process');
const dir=path.resolve(process.cwd(),'certificates');
// the same address phoneUrl() in desk/src/lib/session/store.ts picks: both ask lanHost() (DESK_FAKE_INTERFACES is the test's stand-in for the adapters)
require('./ts-load.cjs');
const ip=require(path.resolve(__dirname,'../desk/src/lib/session/lan.ts')).lanHost(process.env.DESK_FAKE_INTERFACES?JSON.parse(process.env.DESK_FAKE_INTERFACES):undefined);
if(process.argv.includes('--address')){console.log(ip);process.exit(0);}
const names=['localhost','127.0.0.1',...(ip==='localhost'?[]:[ip])];
const cert=path.join(dir,`desk-${ip}.pem`),key=path.join(dir,`desk-${ip}-key.pem`);

function found(cmd,args){const r=spawnSync(cmd,args,{encoding:'utf8'});return !r.error&&r.status===0?r:null;}
function openssl(){
 const list=['openssl',...['C:/Program Files/Git/mingw64/bin/openssl.exe','C:/Program Files/Git/usr/bin/openssl.exe','C:/Program Files (x86)/Git/usr/bin/openssl.exe'].filter(p=>fs.existsSync(p))];
 return list.find(c=>found(c,['version']));
}
function make(){
 fs.mkdirSync(dir,{recursive:true});
 const san=names.map(n=>(/^\d+\.\d+\.\d+\.\d+$/.test(n)?'IP:':'DNS:')+n).join(',');
 const ssl=openssl();
 if(ssl){
  const r=spawnSync(ssl,['req','-x509','-newkey','rsa:2048','-nodes','-sha256','-days','365','-keyout',key,'-out',cert,'-subj','/CN=Study Desk','-addext','subjectAltName='+san],{encoding:'utf8'});
  if(r.status===0)return;
  console.error((r.stderr||String(r.error)).trim());
 }
 const mk=found('mkcert',['-version'])?'mkcert':null;
 if(mk){const r=spawnSync(mk,['-key-file',key,'-cert-file',cert,...names],{stdio:'inherit'});if(r.status===0)return;}
 console.error('desk-dev-https: no certificate tool found. Install Git for Windows (it ships openssl) or mkcert, then run again.');
 process.exit(1);
}

if(!fs.existsSync(cert)||!fs.existsSync(key))make();
console.log('desk-dev-https: certificate for '+names.join(', ')+' in '+dir);
console.log('desk-dev-https: how a phone trusts it once: docs/DESK-HTTPS-ON-THE-LAN.md');
if(process.argv.includes('--cert-only'))process.exit(0);
const next=require.resolve('next/dist/bin/next',{paths:[process.cwd()]});
const child=spawn(process.execPath,[next,'dev','--experimental-https','--experimental-https-key',key,'--experimental-https-cert',cert],{stdio:'inherit',env:{...process.env,DESK_HTTPS:'1'}});
child.on('exit',code=>process.exit(code??1));
