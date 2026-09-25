"use client";
import { useEffect, useState } from "react";
import type { Event, Screen, Session } from "@/lib/session/store";
import { ENGLISH_SCENES } from "@/lib/english/curriculum";
import { accepts } from "@/lib/english/turn";
import { activeCheck, artOf, lingaView, NO_UI, progressDots, type ArtKey, type Hero, type LingaUi, type LingaView, type ViewAction } from "@/lib/english/view";
import { landingFocus } from "@/tv/landingRows";
import { useEnglish } from "./useEnglish";
import { useEnglishAudio } from "./useEnglishAudio";
import { ART } from "./art";
import { Arch, Arrow, BandSteps, Caption, DataLine, Dots, Kicker, Learner, Mark, OnYourPhone, SentenceCard, Stones } from "./OpenDoor";

const CHECK_SCREENS:Screen[]=["linga-check","linga-verdict","linga-plan"];
/** Actions whose next step is speaking on the phone: they carry the phone badge. */
const PHONE_ACTIONS=new Set(["start-talking","start-situation","carry-on"]);
/** Actions that page to a neighbour: their help is the neighbour's goal, so the caption names the action, not "Your mission". */
const PAGING_ACTIONS=new Set(["next-situation","previous-chapter","next-chapter"]);
/** The Open Door composition a screen takes: the arch beside the words, the wide ladder, the row of doors, the menu. */
type Layout="door"|"ladder"|"plan"|"menu";

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
        else if(home)post({type:"nav",screen:"landing",focus:landingFocus(s,"english")});
        else if(s.screen==="linga-check"&&lc)cmd("check-leave");
        else if(c&&s.screen==="linga-talk")cmd("leave");
        else if(c&&s.screen==="linga-moment")cmd("moment-done");
        else{patch({menu:false});post({type:"nav",screen:"linga",focus:0});}
        return;
      }
      // Space pauses and resumes the scene, only where the turn takes a pause: never over a reply in flight
      if(k===" "){if(c&&!onCheck&&accepts(c,"pause"))cmd("pause");return;}
      if(k==="ArrowUp"&&home&&!menu&&!picking){post({type:"nav",screen:"learner",from:"linga"});return;}
      if(k.startsWith("Arrow")){const delta=k==="ArrowRight"||k==="ArrowDown"?1:-1;post({type:"focus",focus:focus<0?0:(focus+delta+actions.length)%actions.length});return;}
      const a=actions[Math.max(0,focus)];if(a&&!a.disabled&&(!waiting||cancel(a)))go(a);
    };
    addEventListener("keydown",handler);return()=>removeEventListener("keydown",handler);
  });
  const h=v.hero;
  const layout:Layout=menu?"menu":h.kind==="ladder"?"ladder":h.kind==="topics"?"plan":"door";
  /** The topics screen shows only the focused action: one "Swap this topic" per topic would be a wall of buttons. */
  const single=layout==="plan"&&actions.length>2;
  /** A choice has no primary: every option is the same kind of button. */
  const choice=h.kind==="choices"&&!menu;
  const art=layout==="door"?artFor(h,s):null;
  const tag=h.kind==="intro"?h.nameTag:h.kind==="scene"?h.partner:h.kind==="choices"&&s.screen==="linga-talk"?c?.partner:undefined;
  const dots=progressDots(s);
  const status=waiting?(onCheck?"Linga is thinking…":"Preparing a reply…"):c?.capture&&!onCheck?"Phone microphone active":audioStatus||"TV shows · Phone speaks";
  const paging=actions[focus];
  const caption=<Caption tag={!v.error&&paging&&PAGING_ACTIONS.has(paging.id)&&v.caption===paging.help?paging.label:v.captionTag} text={v.caption}/>;
  const nav=<nav className={`lo-actions${single?" lo-single":""}${menu?" linga-menu-list":""}${choice?" lo-choice-row":""}`} data-count={actions.length} aria-label="Linga actions">{actions.map((a,i)=>{
    const primary=i===0&&!choice&&!menu;
    return <button className={`lo-action ${primary?"lo-primary":"lo-secondary"}`} data-role={primary?"linga-primary":"linga-secondary"} key={`${i}:${a.label}`} data-focused={focus===i} data-rest={focus<0&&i===0&&!a.disabled?true:undefined} disabled={a.disabled||(waiting&&!cancel(a))} onMouseEnter={()=>post({type:"focus",focus:i})} onMouseLeave={()=>{if(s.screen==="linga-talk")post({type:"focus",focus:-1});}} onClick={()=>go(a)}>
      {menu&&<span className="lo-sr">Select · </span>}<span className="lo-label">{a.label}</span>{PHONE_ACTIONS.has(a.id)?<OnYourPhone/>:<Arrow/>}
    </button>;})}</nav>;
  return <div className="linga-tv" data-view={v.screen} data-layout={layout} data-hero={h.kind}>
    <header className="lo-top"><Mark/><Learner name={s.learner.name} up={home&&!menu&&!picking}/></header>
    {layout==="door"&&<>
      {art&&<Arch art={art} tag={tag} speaker={s.screen==="linga-talk"}/>}
      <section className="lo-panel"><div className="lo-body"><Body v={v} s={s} caption={caption}/></div>{nav}</section>
    </>}
    {layout==="ladder"&&h.kind==="ladder"&&<>
      <section className="lo-head"><Kicker text={h.kicker}/><Title text={h.title}/>{caption}</section>
      {h.note&&<SentenceCard className="lo-note-card" label="Linga says" text={h.note} role="linga-note"/>}
      <BandSteps band={h.band}/>
      {nav}
    </>}
    {layout==="plan"&&h.kind==="topics"&&<>
      <section className="lo-head"><Kicker text={h.kicker}/><Title text={h.title}/>{caption}</section>
      <div className="lo-doors linga-topics" data-count={h.topics.length||4} data-selecting={h.selected>=0}>{h.topics.length?h.topics.map((t,i)=>{const {Art,label}=ART[t.art];return <div key={t.id} className="lo-topic" data-selected={i===h.selected}>
        <div className="lo-mini" role="img" aria-label={label}><Art/></div><b>{t.title}</b><small>{t.skill}</small>
      </div>;}):[0,1,2,3].map(i=><div key={i} className="lo-topic lo-ghost" aria-hidden="true"><div className="lo-mini"/></div>)}</div>
      {nav}
    </>}
    {layout==="menu"&&h.kind==="menu"&&<>
      <section className="lo-head"><Kicker text={h.kicker}/><Title text={h.title}/>{caption}</section>
      {nav}
    </>}
    <footer className="lo-footer linga-footer">
      {v.tag&&<span className="lo-where">{v.tag}</span>}
      {dots&&<Dots dots={dots}/>}
      <span className="lo-status">{status}</span>
      <button onClick={()=>go(menuKey)}>{menuKey.label}</button>{repeat&&<button onClick={()=>go(repeat)}>{repeat.label}</button>}
    </footer>
  </div>;
}

/** The picture behind the arch: the view names it where it depends on the content, the screen does elsewhere. */
function artFor(h:Hero,s:Session):ArtKey{
  const c=s.conversation;
  switch(h.kind){
    case "intro":return h.art;
    case "scene":return h.illustration;
    case "track":return h.illustration;
    case "comparison":return "coach";
    case "message":return s.screen==="linga-plan"?"plan":"check";
    case "heading":return "check";
    case "choices":{
      if(s.screen!=="linga-talk"||!c)return "check";
      return artOf(c.sceneId,c.scene?.skill??ENGLISH_SCENES.find(x=>x.id===c.sceneId)?.skill??c.focusSkill);
    }
    default:return "start";
  }
}

/** A title in Georgia, one size smaller for each step in length so it never takes a third line. */
function Title({text}:{text:string}){return <h1 className="lo-title" data-role="linga-title" data-size={text.length<=34?"l":text.length<=50?"m":"s"}>{text}</h1>;}

/** The words beside the arch, in the order the eye takes them: where, what, the caption, then what it holds. */
function Body({v,s,caption}:{v:LingaView;s:Session;caption:React.ReactNode}){
  const h=v.hero,focus=s.focus;
  switch(h.kind){
    case "intro":return <><Kicker text={h.kicker}/><Title text={h.title}/>{caption}{h.subtitle&&<DataLine>{h.subtitle}</DataLine>}</>;
    case "message":{
      const label=s.screen==="linga-check"&&activeCheck(s)?.stage==="tasks"?"Your task":"Linga asks";
      return <><Kicker text={h.kicker}/>{h.text&&<SentenceCard className={`lo-said linga-message${h.note?" lo-compact":""}`} label={label} text={h.text} role="linga-said"/>}{h.note&&<SentenceCard className="lo-compact" label="The words" text={h.note}/>}{caption}</>;
    }
    case "heading":return <><Kicker text={h.kicker}/><Title text={h.title}/>{caption}</>;
    case "choices":return <><Kicker text={h.kicker}/><h1 className="lo-prompt" data-role="linga-title">{h.prompt}</h1>
      <div className="lo-choices linga-choices">{h.options.map((x,i)=><div key={x} data-selected={focus===i}><small>0{i+1}</small>{x}</div>)}</div>{caption}</>;
    case "scene":{
      if(s.screen==="linga-scenes")return <><Kicker band={h.band} text={`${h.subtitle} · ${h.minutes} min`}/><Title text={h.title}/>{caption}<SentenceCard label="A sentence to take with you" text={h.sentence}/></>;
      const kicker=h.kicker.endsWith(` · ${h.partner}`)?h.kicker.slice(0,-(h.partner.length+3)):h.kicker;
      return <><Kicker text={kicker}/>{h.said?<SentenceCard className="lo-said linga-message" label={`${h.who.split(" · ")[0]} says`} text={h.said} role="linga-said"/>:<Title text={h.title}/>}{caption}{h.said&&h.subtitle&&h.said.length<=140&&<DataLine><span className="lo-data-key">Goal</span>{h.subtitle}</DataLine>}</>;
    }
    case "track":return <><Kicker text={h.kicker}/><Title text={h.title}/><Stones progress={h.progress}/>{h.subtitle&&<DataLine>{h.subtitle}</DataLine>}{caption}</>;
    case "comparison":return <><Kicker text={v.tag}/><div className="lo-compare linga-comparison">
      <div className="lo-before"><span>{h.before.kicker}</span><q>{h.before.quote}</q></div>
      <SentenceCard label={h.after.kicker} text={h.after.quote}/>
    </div>{h.note&&<div className="lo-note">{h.note}</div>}{caption}</>;
    case "plain":return <><Title text={h.title}/>{caption}</>;
    default:return null;
  }
}
