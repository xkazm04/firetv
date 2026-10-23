"use client";
import { LingaKeys } from "./LingaKeys";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Event, Screen, Session } from "@/lib/session/store";
import { AUTHORED_SCENES } from "@/lib/english/curriculum";
import { ownerOf } from "@/lib/english/activity";
import { accepts } from "@/lib/english/turn";
import { runningTake } from "@/lib/english/take";
import { activeCheck, artOf, focusStep, lingaView, placeWords, NO_UI, progressDots, replyKey, TRY_TAG, tvStatus, type ArtKey, type Hero, type LingaUi, type LingaView, type ViewAction } from "@/lib/english/view";
import { landingFocus } from "@/tv/landingRows";
import { keyOf } from "@/tv/keys";
import { blockedAsk } from "@/lib/rules/pairBlock";
import { useEnglish } from "./useEnglish";
import { useEnglishAudio } from "./useEnglishAudio";
import { ART } from "./art";
import { Corridor } from "./art/Corridor";
import { Arch, Arrow, BandSteps, Caption, DataLine, Dots, Kicker, Learner, Mark, OnYourPhone, Plate, SentenceCard, Stones, Yours } from "./OpenDoor";

const CHECK_SCREENS:Screen[]=["linga-check","linga-verdict","linga-plan"];
/** Actions whose next step is speaking or typing on the phone: they carry the phone badge. */
const PHONE_ACTIONS=new Set(["start-talking","start-situation","carry-on","phone-setup","ask-topic","ask-goal","ask-pitch"]);
/** The hand-offs Linga makes: the reply opens by itself with the learner's turn, the words and the preferences from an action (TL-12). */
const LINGA_ASKS=new Set(["reply","words","prefs"]);
/** Actions that page to a neighbour: their help is the neighbour's goal, so the caption names the action, not "Your mission". */
const PAGING_ACTIONS=new Set(["next-situation","previous-chapter","next-chapter","earlier-certificates","open-certificate"]);
/** The Open Door composition a screen takes: the arch beside the words, the wide ladder, the row of doors, the menu (also the list of certificates). */
type Layout="door"|"ladder"|"plan"|"menu";
/** The door's words column grows up from the actions; past the arch's crown the type steps down (linga.css, data-fit). */
const FIT_CEILING=160,FIT_STEPS=3;

export function LingaTV({s,post,voice}:{s:Session;post:(e:Event)=>Promise<void>;voice:boolean}){
  const {run,busy,error}=useEnglish(s),[ui,setUi]=useState<LingaUi>(NO_UI);
  const v=lingaView(s,{...ui,busy,error});
  const {menu,picking}=ui,c=s.conversation,lc=ownerOf(s)==="check"?activeCheck(s):null,home=v.home!==null,onCheck=CHECK_SCREENS.includes(s.screen);
  const audioStatus=useEnglishAudio(v.spoken,voice,v.audible);
  useEffect(()=>{setUi(NO_UI);},[s.learner?.id]);
  const patch=(p:Partial<LingaUi>)=>setUi(u=>({...u,...p}));
  const cmd=(action:string)=>{void run(action);};
  /** A phone joined for a hand-off the TV could not open alone: the held Select runs once more with the phone counted in (session.pairFor.ready). */
  const phoneHere=useRef(false),resumedAt=useRef(0);
  /** Runs what the view says an action does: a local step, a focus, a nav, a command. */
  const go=(a:ViewAction)=>{
    const r=a.run;
    if(r.ui)patch(r.ui);
    if(r.focus!==undefined)post({type:"focus",focus:r.focus});
    if(r.nav){patch({menu:false});post({type:"nav",screen:r.nav.screen,...(r.nav.from?{from:r.nav.from}:{focus:r.nav.screen==="linga-talk"?-1:0})});}
    if(r.ask){if(!phoneHere.current&&blockedAsk(s,[{type:"ask.open",kind:r.ask.kind}])){post({type:"pair.for",kind:r.ask.kind});return;}post({type:"ask.open",kind:r.ask.kind});}
    // a phrase chosen with the remote answers the turn from the TV: the phone's reply ask closes with it, and is not asked again for this turn
    if(a.id==="pick-phrase"&&s.ask?.kind==="reply"&&!sentAndWorking){answered.current=want;post({type:"ask.cancel",id:s.ask.id});}
    if(r.command)void run(r.command.action,r.command.extra).then(ok=>{if(ok&&r.after)patch(r.after);});
  };
  // TL-12: the reply hand-off opens by itself as the learner's turn begins, and closes when the turn stops being theirs
  // an ask the desk marked sent is the phone's answer in work: no client cancels it before the result lands (the TV closes a reply once the work is done)
  const sentAndWorking=s.ask?.phase==="sent"&&!!(c?.pending||lc?.pending);
  const want=replyKey(v),answered=useRef<string|null>(null),openedAt=useRef({key:"",at:0});
  useEffect(()=>{
    if(!want)answered.current=null;
    const a=s.ask;
    if(want&&want!==answered.current&&!a){if(openedAt.current.key!==want||Date.now()-openedAt.current.at>2000){openedAt.current={key:want,at:Date.now()};post({type:"ask.open",kind:"reply"});}}
    else if(a?.kind==="reply"&&!sentAndWorking&&(a.phase==="sent"||!want||want===answered.current))post({type:"ask.cancel",id:a.id});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[want,s.ask?.id,s.ask?.kind,s.ask?.phase,sentAndWorking]);
  // the preferences hand-off belongs to the menu: closing the menu takes it back
  useEffect(()=>{if(!menu&&s.ask?.kind==="prefs"&&!sentAndWorking)post({type:"ask.cancel",id:s.ask.id});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[menu,s.ask?.id,s.ask?.kind]);
  const {actions,waiting}=v,focus=s.focus,menuKey=v.footer.find(a=>a.id==="menu")!,repeat=v.footer.find(a=>a.id==="repeat");
  const cancel=(a:ViewAction)=>a.id==="cancel";
  useEffect(()=>{
    const pf=s.pairFor;
    if(!pf?.ready||resumedAt.current===pf.at||s.screen!==pf.screen)return;
    resumedAt.current=pf.at;post({type:"pair.clear"});
    const a=actions[Math.max(0,focus)];
    if(a&&!a.disabled&&!waiting){phoneHere.current=true;try{go(a);}finally{phoneHere.current=false;}}
  });
  useEffect(()=>{
    const handler=(e:KeyboardEvent)=>{
      if(e.target instanceof HTMLElement&&e.target.closest(".bar"))return;
      const k=keyOf(e.key);if(!k)return;
      e.preventDefault();
      if(k==="menu"){go(menuKey);return;}
      if(k==="back"){
        // Back first takes the hand-off back: the words and the preferences stop there; a reply is also left with Back, as the turn itself is
        const open=s.ask&&LINGA_ASKS.has(s.ask.kind)?s.ask:null;
        if(open&&sentAndWorking)return;
        if(open){if(open.kind==="reply")answered.current=want;post({type:"ask.cancel",id:open.id});if(open.kind!=="reply")return;}
        if(menu){patch({menu:false});post({type:"focus",focus:picking?0:-1});}
        else if(picking){patch({picking:null});post({type:"focus",focus:0});}
        else if(home)post({type:"nav",screen:"landing",focus:landingFocus(s,"english")});
        else if(s.screen==="linga-check"&&lc)cmd("check-leave");
        else if(c&&s.screen==="linga-talk")cmd(runningTake(c)&&!c.pending?"take-end":"leave");
        else if(c&&s.screen==="linga-moment")cmd("moment-done");
        else{patch({menu:false});post({type:"nav",screen:"linga",focus:0});}
        return;
      }
      // Space pauses and resumes the scene, only where the turn takes a pause: never over a reply in flight
      if(k==="play"){if(c&&!onCheck&&accepts(c,"pause"))cmd("pause");return;}
      if(k==="up"&&home&&!menu&&!picking){post({type:"nav",screen:"learner",from:"linga"});return;}
      if(k!=="select"){const delta=k==="right"||k==="down"?1:-1;post({type:"focus",focus:focusStep(focus,delta,actions.length)});return;}
      const a=actions[Math.max(0,focus)];if(a&&!a.disabled&&(!waiting||cancel(a)))go(a);
    };
    addEventListener("keydown",handler);return()=>removeEventListener("keydown",handler);
  });
  const h=v.hero;
  // the Cut recap's tape (v2 L3) is a row of pins, as the topics are a row of doors
  const layout:Layout=menu||h.kind==="certs"?"menu":h.kind==="ladder"?"ladder":h.kind==="topics"||h.kind==="tape"?"plan":"door";
  /** The topics screen shows only the focused action: one "Swap this topic" per topic would be a wall of buttons. */
  const single=layout==="plan"&&actions.length>2;
  /** A choice has no primary: every option is the same kind of button. */
  const choice=h.kind==="choices"&&!menu;
  const art=layout==="door"?artFor(h,s):null;
  // the door's column: a screen that fits stays as drawn; a taller one climbs to the crown, then steps its type down
  const panel=useRef<HTMLElement>(null);
  const fitKey=layout==="door"?`${s.screen}|${JSON.stringify(h)}|${v.caption}|${v.captionTag}|${actions.length}`:"";
  const [fitted,setFitted]=useState({key:"",step:0});
  const fit=fitted.key===fitKey?fitted.step:layout==="door"&&s.screen!=="linga-scenes"&&talkGoal(h)?1:0;
  // the Desk display's taller stage lifts the bottom-anchored column (linga.css); the ceiling is measured as on the TV
  useLayoutEffect(()=>{const p=panel.current,root=p?.offsetParent as HTMLElement|null,lift=root?root.clientHeight-1080:0;if(p&&p.offsetTop-lift<FIT_CEILING&&fit<FIT_STEPS)setFitted({key:fitKey,step:fit+1});});
  const tag=h.kind==="intro"?h.nameTag:h.kind==="cert"?h.issued:h.kind==="scene"?h.partner:h.kind==="choices"&&s.screen==="linga-talk"?c?.partner:undefined;
  const dots=progressDots(s);
  const status=tvStatus(s,{waiting,onCheck,audio:audioStatus});
  const paging=actions[focus];
  const caption=<Caption tag={!v.error&&paging&&PAGING_ACTIONS.has(paging.id)&&v.caption===paging.help?paging.label:v.captionTag} text={v.caption}/>;
  const nav=<nav className={`lo-actions${single?" lo-single":""}${menu?" linga-menu-list":""}${choice?" lo-choice-row":""}`} data-count={actions.length} aria-label="Linga actions">{actions.map((a,i)=>{
    const primary=i===0&&!choice&&!menu;
    return <button className={`lo-action ${primary?"lo-primary":"lo-secondary"}`} data-role={primary?"linga-primary":"linga-secondary"} key={`${i}:${a.label}`} data-focused={focus===i} data-rest={focus<0&&i===0&&!a.disabled?true:undefined} disabled={a.disabled||(waiting&&!cancel(a))} onMouseEnter={()=>post({type:"focus",focus:i})} onMouseLeave={()=>{if(s.screen==="linga-talk")post({type:"focus",focus:-1});}} onClick={()=>go(a)}>
      {menu&&<span className="lo-sr">Select · </span>}<span className="lo-label">{a.label}</span>{PHONE_ACTIONS.has(a.id)?<OnYourPhone/>:<Arrow/>}
    </button>;})}</nav>;
  return <div className="linga-tv" data-view={v.screen} data-layout={layout} data-hero={h.kind} data-fit={fit||undefined}>
    <header className="lo-top"><Mark/><Learner name={s.learner?.name ?? ""} up={home&&!menu&&!picking}/></header>
    {layout==="door"&&<>
      {art&&<Arch art={art} tag={tag} speaker={s.screen==="linga-talk"}>{art==="lost"&&h.kind==="scene"&&h.lost?<Corridor lost={h.lost}/>:undefined}</Arch>}
      <section className="lo-panel" ref={panel}><div className="lo-body"><Body v={v} s={s} caption={caption}/></div>{nav}</section>
    </>}
    {layout==="ladder"&&h.kind==="ladder"&&<>
      <section className="lo-head"><Kicker text={h.kicker}/><Title text={h.title}/>{caption}</section>
      {/* the card and the steps share one column: a longer sentence lowers the steps instead of covering them */}
      <div className="lo-stage">
        {h.note&&<SentenceCard className={`lo-note-card${h.note.length>110?" lo-wide":""}`} label={h.noteLabel??"Linga says"} text={h.note} role="linga-note"/>}
        <BandSteps band={h.band} spoke={h.spoke}/>
      </div>
      {nav}
    </>}
    {layout==="plan"&&h.kind==="topics"&&<>
      <section className="lo-head"><Kicker text={h.kicker}/><Title text={h.title}/>{caption}</section>
      <div className="lo-doors linga-topics" data-count={h.topics.length||4} data-selecting={h.selected>=0}>{h.topics.length?h.topics.map((t,i)=>{const {Art,label}=ART[t.art];return <div key={t.id} className="lo-topic" data-selected={i===h.selected}>
        <div className="lo-mini" role="img" aria-label={label}><Art/></div><b>{t.title}</b><small>{t.skill}</small>
      </div>;}):[0,1,2,3].map(i=><div key={i} className="lo-topic lo-ghost" aria-hidden="true"><div className="lo-mini"/></div>)}</div>
      {nav}
    </>}
    {layout==="plan"&&h.kind==="tape"&&<>
      <section className="lo-head"><Kicker text={h.kicker}/><Title text={h.title}/>{caption}</section>
      {/* three pins at most, the learner's own words on each; the focused pin's note is the one caption above */}
      {/* Take Two (v2 L4): a held note's quote is struck, an open one stays as it was, an undecided one says so; no count */}
      {/* one column under the head: the pins, the take's branch, the counts; it flows, so a long quote lowers what follows */}
      <div className="linga-tape-col">
      <div className="linga-tape" data-role="linga-tape" data-count={h.pins.length} data-selecting={h.selected>=0}>{h.pins.map((x,i)=><div key={i} className="linga-pin" data-selected={i===h.selected} data-mark={x.mark}>
        <small>{x.label}{x.mark==="undecided"&&" · Not decided"}</small><b>{x.mark==="held"?<s data-role="linga-struck">“{x.quote}”</s>:<>“{x.quote}”</>}</b>{x.better&&<span className="linga-pin-better">{x.better}</span>}
      </div>)}</div>
      {/* the take, drawn as a branch from its pin: the line it forked at, then the learner's line again */}
      {h.branch&&<div className="linga-branch" data-role="linga-branch" data-pin={h.branch.pin}>
        <DataLine><span className="lo-data-key">Take Two · {h.pins[h.branch.pin]?.label}</span>{h.branch.partner.split(" · ")[0]}: “{h.branch.from}”</DataLine>
        {h.branch.again&&<DataLine><span className="lo-data-key">You again</span>“{h.branch.again}”</DataLine>}
      </div>}
      {!h.branch&&<DataLine>{h.data}</DataLine>}
      </div>
      {nav}
    </>}
    {layout==="menu"&&(h.kind==="menu"||h.kind==="certs")&&<>
      <section className="lo-head"><Kicker text={h.kicker}/><Title text={h.title}/>{caption}</section>
      {nav}
    </>}
    <footer className="lo-footer linga-footer">
      {v.tag&&<span className="lo-where">{v.tag}</span>}
      <LingaKeys s={s}/>
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
    case "comparison":return h.art??"coach";
    case "cert":return "cert";
    case "message":return s.screen==="linga-plan"?"plan":"check";
    case "heading":return "check";
    case "choices":{
      if(s.screen!=="linga-talk"||!c)return "check";
      return artOf(c.sceneId,c.scene?.skill??AUTHORED_SCENES.find(x=>x.id===c.sceneId)?.skill??c.focusSkill,placeWords(c.scene??c));
    }
    default:return "start";
  }
}

/** The conversation's goal under a partner's line, when the line leaves it room; the screen then starts one type step down (linga.css, data-fit). */
function talkGoal(h:Hero):string|null{return h.kind==="scene"&&h.said&&h.subtitle&&h.said.length<=140?h.subtitle:null;}

/** A quote with one excerpt struck through, as Take Two strikes a held note: the picture of a slip the learner fixed. */
function struck(quote:string,part?:string):React.ReactNode{
  const at=part?quote.indexOf(part):-1;
  if(!part||at<0)return quote;
  return <>{quote.slice(0,at)}<s data-role="linga-struck">{part}</s>{quote.slice(at+part.length)}</>;
}

/** A title in Georgia, one size smaller for each step in length so it never takes a third line. */
function Title({text}:{text:string}){return <h1 className="lo-title" data-role="linga-title" data-size={text.length<=34?"l":text.length<=50?"m":"s"}>{text}</h1>;}

/** The words beside the arch, in the order the eye takes them: where, what, the caption, then what it holds. */
function Body({v,s,caption}:{v:LingaView;s:Session;caption:React.ReactNode}){
  const h=v.hero,focus=s.focus;
  switch(h.kind){
    // L1: the phrases the learner owns, a small strip under home's words (Open Door objects; Adult, a progress line)
    case "intro":return <><Kicker text={h.kicker}/><Title text={h.title}/>{caption}{h.subtitle&&<DataLine>{h.subtitle}</DataLine>}{h.yours&&<Yours phrases={h.yours.phrases} style={h.yours.style}/>}</>;
    case "message":{
      const label=s.screen==="linga-check"&&activeCheck(s)?.stage==="tasks"?"Your task":"Linga asks";
      return <><Kicker text={h.kicker}/>{h.text&&<SentenceCard className={`lo-said linga-message${h.note?" lo-compact":""}`} label={label} text={h.text} role="linga-said"/>}{h.note&&<SentenceCard className="lo-compact" label="The words" text={h.note}/>}{caption}</>;
    }
    case "heading":return <><Kicker text={h.kicker}/><Title text={h.title}/>{caption}</>;
    case "choices":return <><Kicker text={h.kicker}/><h1 className="lo-prompt" data-role="linga-title">{h.prompt}</h1>
      <div className="lo-choices linga-choices">{h.options.map((x,i)=><div key={x} data-selected={focus===i}><small>0{i+1}</small>{x}</div>)}</div>{caption}</>;
    case "scene":{
      // a scene the learner pitched (v2 L3) is marked as their own on its card (in place of the skill: the kicker stays one line)
      if(s.screen==="linga-scenes")return <><Kicker band={h.band} text={`${h.own?"Your own scene":h.subtitle} · ${h.minutes} min`}/><Title text={h.title}/>{caption}<SentenceCard label="A sentence to take with you" text={h.sentence}/></>;
      const kicker=h.kicker.endsWith(` · ${h.partner}`)?h.kicker.slice(0,-(h.partner.length+3)):h.kicker;
      const goal=talkGoal(h);
      return <><Kicker text={kicker}/>{h.said?<SentenceCard className="lo-said linga-message" label={`${h.who.split(" · ")[0]} says`} text={h.said} role="linga-said"/>:<Title text={h.title}/>}{h.tryForm&&<SentenceCard className="lo-compact" label={TRY_TAG} text={h.tryForm} role="linga-try"/>}{caption}{v.savedLine&&<DataLine>{v.savedLine}</DataLine>}{goal&&<DataLine><span className="lo-data-key">{h.take?"Take Two of":h.kind==="scene"&&h.steps?"Now":"Goal"}</span>{goal}</DataLine>}</>;
    }
    // On the recap, the phrase this scene invited and the learner has yet to use stands where the title would be.
    case "track":return <><Kicker text={h.kicker}/>{h.sentence?<SentenceCard className="lo-compact" label={h.label??"A sentence for you"} text={h.sentence}/>:<Title text={h.title}/>}<Stones progress={h.progress}/>{h.subtitle&&<DataLine>{h.subtitle}</DataLine>}{caption}</>;
    // a fix moment (K2): the slip the learner repaired is struck (Take Two's mark), and a fix still withheld leaves the after slot an empty frame
    case "comparison":return <><Kicker text={h.kicker??v.tag}/><div className="lo-compare linga-comparison">
      <div className="lo-before"><span>{h.before.kicker}</span><q>{struck(h.before.quote,h.before.struck)}</q></div>
      <SentenceCard className={h.open?"lo-open":""} role={h.open?"linga-open":undefined} label={h.after.kicker} text={h.after.quote}/>
    </div>{h.note&&<div className="lo-note">{h.note}</div>}{h.tried&&<DataLine>{h.tried}</DataLine>}{caption}{h.data&&<DataLine>{h.data}</DataLine>}</>;
    // the certificate: the band and its name, the caption's one sentence, then the plate (OpenDoor Plate)
    case "cert":return <><Kicker text={h.kicker}/><Title text={h.title}/>{caption}{(h.topics.length>0||h.skills.length>0||(h.open?.length??0)>0||h.quote)&&<Plate topics={h.topics} skills={h.skills} quote={h.quote} open={h.open}/>}</>;
    case "plain":return <><Title text={h.title}/>{caption}</>;
    default:return null;
  }
}
