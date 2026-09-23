"use client";
import { useEffect, useState } from "react";
import type { Event, Screen, Session } from "@/lib/session/store";
import { PROGRESS_LABEL, PROGRESS_ORDER } from "@/lib/english/curriculum";
import { BAND_NAME } from "@/lib/english/placement";
import { BANDS, type Band } from "@/lib/english/types";
import { activeCheck, lingaView, NO_UI, type Hero, type LingaUi, type ViewAction } from "@/lib/english/view";
import { useEnglish } from "./useEnglish";
import { useEnglishAudio } from "./useEnglishAudio";

const CHECK_SCREENS:Screen[]=["linga-check","linga-verdict","linga-plan"];
const Mascot=()=><img className="linga-mascot" src="/brand/linga.png" alt="" />;
/**
 * What the tutor or partner said. It lives mid-screen, never in the caption slot: the caption changes with
 * every focused action, and a question that vanished when the learner looked at "Hear it again" was the defect.
 */
const Message=({text,narrow}:{text:string;narrow?:boolean})=><div className={`linga-message${text.length>150?" linga-long":""}${narrow?" linga-narrow":""}`}>{text}</div>;

export function LingaTV({s,post,voice}:{s:Session;post:(e:Event)=>Promise<void>;voice:boolean}){
  const {run,busy,error}=useEnglish(s),[ui,setUi]=useState<LingaUi>(NO_UI);
  const v=lingaView(s,{...ui,busy,error});
  const {menu,picking}=ui,c=s.conversation,lc=activeCheck(s),home=v.home!==null,onCheck=CHECK_SCREENS.includes(s.screen);
  const audioStatus=useEnglishAudio(v.spoken,voice,v.audible);
  useEffect(()=>{setUi(NO_UI);},[s.learner.id]);
  const patch=(p:Partial<LingaUi>)=>setUi(u=>({...u,...p}));
  const cmd=(action:string)=>{void run(action);};
  /** Runs what the view says an action does: a local step, a focus, a nav, a command. */
  const go=(a:ViewAction)=>{
    const r=a.run;
    if(r.ui)patch(r.ui);
    if(r.focus!==undefined)post({type:"focus",focus:r.focus});
    if(r.nav){patch({menu:false});post({type:"nav",screen:r.nav.screen,...(r.nav.from?{from:r.nav.from}:{focus:r.nav.screen==="linga-talk"?-1:0})});}
    if(r.command)void run(r.command.action,r.command.extra).then(ok=>{if(ok&&r.after)patch(r.after);});
  };
  const {actions,waiting}=v,focus=s.focus,menuKey=v.footer.find(a=>a.id==="menu")!,repeat=v.footer.find(a=>a.id==="repeat");
  const cancel=(a:ViewAction)=>a.id==="cancel";
  useEffect(()=>{
    const handler=(e:KeyboardEvent)=>{
      if(e.target instanceof HTMLElement&&e.target.closest(".bar"))return;
      const k=e.key;if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Enter","Escape","Backspace","m","M"," "].includes(k))return;
      e.preventDefault();
      if(k==="m"||k==="M"){go(menuKey);return;}
      if(k==="Escape"||k==="Backspace"){
        if(menu){patch({menu:false});post({type:"focus",focus:-1});}
        else if(picking){patch({picking:null});post({type:"focus",focus:0});}
        else if(home)post({type:"nav",screen:"landing",focus:1});
        else if(s.screen==="linga-check"&&lc)cmd("check-leave");
        else if(c&&s.screen==="linga-talk")cmd("leave");
        else if(c&&s.screen==="linga-moment")cmd("moment-done");
        else{patch({menu:false});post({type:"nav",screen:"linga",focus:0});}
        return;
      }
      if(k===" "){if(c&&!onCheck)cmd("pause");return;}
      if(k==="ArrowUp"&&home&&!menu&&!picking){post({type:"nav",screen:"learner",from:"linga"});return;}
      if(k.startsWith("Arrow")){const delta=k==="ArrowRight"||k==="ArrowDown"?1:-1;post({type:"focus",focus:focus<0?0:(focus+delta+actions.length)%actions.length});return;}
      const a=actions[Math.max(0,focus)];if(a&&!a.disabled&&(!waiting||cancel(a)))go(a);
    };
    addEventListener("keydown",handler);return()=>removeEventListener("keydown",handler);
  });
  const oneButton=menu||(s.screen==="linga-plan"&&!picking&&actions.length>2);
  return <div className="linga-tv" data-view={v.screen}>
    <div className={`band ${home&&!picking?"band-left-thin":s.screen==="linga-coach"||s.screen==="linga-moment"?"band-divider":"band-rule"}`}/>
    <header className="linga-top"><b>Linga</b><span>{s.learner.name}</span><em>{v.tag}</em></header>
    <main className="linga-hero"><HeroView hero={v.hero}/></main>
    <div className="linga-caption"><span className="linga-kicker">{v.captionTag}</span><div aria-live="polite">{v.caption}</div></div>
    <nav className={`linga-actions ${oneButton?"linga-menu-actions":""}`} aria-label="Linga actions">{actions.map((a,i)=><button className="btn" key={`${i}:${a.label}`} data-focused={focus===i} disabled={a.disabled||(waiting&&!cancel(a))} onMouseEnter={()=>post({type:"focus",focus:i})} onMouseLeave={()=>{if(s.screen==="linga-talk")post({type:"focus",focus:-1});}} onClick={()=>go(a)}>{menu?"Select · ":""}{a.label}</button>)}</nav>
    <footer className="linga-footer"><span>{waiting?(onCheck?"Linga is thinking…":"Preparing a reply…"):c?.capture&&!onCheck?"Phone microphone active":audioStatus||"TV shows · Phone speaks"}</span><button onClick={()=>go(menuKey)}>{menuKey.label}</button>{repeat&&<button onClick={()=>go(repeat)}>{repeat.label}</button>}</footer>
  </div>;
}
/** One JSX shape per hero kind; what goes in it is the view's. */
function HeroView({hero:h}:{hero:Hero}){
  switch(h.kind){
    case "intro":return <><div className="linga-kicker">{h.kicker}</div><h1>{h.title}</h1><div className="linga-subtitle">{h.subtitle}</div><Mascot/></>;
    case "ladder":return <><div className="linga-kicker">{h.kicker}</div><h1>{h.title}</h1><BandLadder band={h.band}/>{h.note&&<div className="linga-note-line">{h.note}</div>}</>;
    case "message":return <><div className="linga-kicker">{h.kicker}</div>{h.text&&<Message text={h.text}/>}{h.note&&<div className="linga-note-line">{h.note}</div>}</>;
    case "heading":return <><div className="linga-kicker">{h.kicker}</div><h1 className="linga-smaller">{h.title}</h1></>;
    case "choices":return <><div className="linga-kicker">{h.kicker}</div><h1 className={h.small?"linga-smaller":"linga-prompt"}>{h.prompt}</h1><div className="linga-choices">{h.options.map((x,i)=><div key={x}><small>0{i+1}</small>{x}</div>)}</div></>;
    case "topics":return <><div className="linga-kicker">{h.kicker}</div><h1>{h.title}</h1><div className="linga-topics">{h.topics.map((t,i)=><div key={t.id} data-selected={i===h.selected}>{t.title}<small>{t.skill}</small></div>)}</div></>;
    case "scene":return <><div className="linga-kicker">{h.kicker}</div>{h.said?<Message text={h.said} narrow/>:<h1 className={h.small?"linga-smaller":undefined}>{h.title}</h1>}{h.subtitle&&<div className="linga-subtitle">{h.subtitle}</div>}<SceneArt kind={h.art}/></>;
    case "track":return <><div className="linga-kicker">{h.kicker}</div><h1>{h.title}</h1><ProgressTrack progress={h.progress}/>{h.subtitle&&<div className="linga-subtitle">{h.subtitle}</div>}</>;
    case "comparison":return <><div className="linga-comparison"><section><div className="linga-kicker">{h.before.kicker}</div><div className="linga-quote">“{h.before.quote}”</div></section><section><div className="linga-kicker">{h.after.kicker}</div><div className="linga-quote">“{h.after.quote}”</div></section></div><div className="linga-note-line">{h.note}</div></>;
    case "menu":return <><div className="linga-kicker">{h.kicker}</div><h1>{h.title}</h1><div className="linga-menu-list">{h.entries.map((label,i)=><div key={label} data-selected={h.selected===i}>{String(i+1).padStart(2,"0")} / {label}</div>)}</div></>;
    case "plain":return <h1>{h.title}</h1>;
  }
}
function BandLadder({band}:{band:Band}){return <div className="linga-track linga-ladder">{BANDS.map((b,i)=><div key={b} data-reached={i<=BANDS.indexOf(band)} data-here={b===band}><i/>{b}<small>{BAND_NAME[b]}</small></div>)}</div>;}
function ProgressTrack({progress}:{progress:import("@/lib/english/types").Progress}){return <div className="linga-track">{PROGRESS_ORDER.map((id,i)=><div key={id} data-reached={i<=PROGRESS_ORDER.indexOf(progress)}><i/>{PROGRESS_LABEL[id]}</div>)}</div>;}
function SceneArt({kind}:{kind:string}){return <svg className="linga-scene-art" viewBox="0 0 240 220" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path opacity=".35" d="M10 190H225M25 20H200V175H25ZM42 43H180M42 65H135"/>{kind==="rover"?<><path d="M40 125H160L180 165H25ZM95 125V80H145V125M120 80V53L163 40"/><circle cx="60" cy="175" r="17"/><circle cx="150" cy="175" r="17"/></>:kind==="date"?<path d="M40 120H95V151H40ZM95 126H112V141H95M132 120H180V151H132ZM180 126H194V141H180M65 104V85M151 104V85M28 163H210"/>:<path d="M65 101H166V166H65ZM83 128L96 141 126 113M139 127H152M82 153H150"/>}</svg>;}
