"use client";
import { useEffect, useState } from "react";
import type { Event, Screen, Session } from "@/lib/session/store";
import { defaultPreferences, eligibleScenes, ENGLISH_SCENES, ENGLISH_SKILLS, planDone, PROGRESS_LABEL, PROGRESS_ORDER, recommendScene } from "@/lib/english/curriculum";
import { ABOUT_QUESTIONS, BAND_CAN, BAND_NAME, easyBand, isBand, MAX_TASKS, shift } from "@/lib/english/placement";
import { BANDS, type Band } from "@/lib/english/types";
import { useEnglish } from "./useEnglish";
import { useEnglishAudio, type SpokenLine } from "./useEnglishAudio";

type Action={label:string;help:string;go:()=>void;disabled?:boolean};
const TASK_TITLE={say:"Say it",listen:"Listen and answer",choose:"Choose the reply"} as const;
const CHECK_SCREENS:Screen[]=["linga-check","linga-verdict","linga-plan"];
const Mascot=()=><img className="linga-mascot" src="/brand/linga.png" alt="" />;
const Speaker=({name}:{name:string})=><div className="linga-speaker"><span className="linga-wave">▂ ▆ ▃ ▇ ▂</span>{name}</div>;

export function LingaTV({s,post,voice}:{s:Session;post:(e:Event)=>Promise<void>;voice:boolean}){
  const {run,busy,error}=useEnglish(s),[menu,setMenu]=useState(false),[sceneIndex,setSceneIndex]=useState(0),[chapter,setChapter]=useState(0),[picking,setPicking]=useState<Band|null>(null);
  const p=s.profiles.find(p=>p.id===s.learner.id),l=s.englishLearning,prefs=l.preferences??defaultPreferences(p);
  const level:Band=l.placement?.band??(isBand(prefs.level)?prefs.level:"A1");
  const scenes=eligibleScenes(p,prefs,l),recommended=recommendScene(p,l),c=s.conversation;
  const lc=s.check&&s.check.learnerId===s.learner.id?s.check:null;
  const placement=lc?.placement??l.placement;
  const home=s.screen==="linga"||s.screen==="tonight";
  const onCheck=CHECK_SCREENS.includes(s.screen);
  const last=c?.turns.at(-1),asked=lc?.turns.at(-1);
  const spoken:SpokenLine=s.screen==="linga-check"&&lc
    ?{line:lc.stage==="about"?(asked?.role==="tutor"?asked.text:""):lc.task?.kind==="listen"?lc.task.line:lc.task?.kind==="say"?lc.task.prompt:"",key:`${lc.id}:${asked?.id}:${lc.task?.id}:${lc.audioNonce}`,blocked:!!lc.pending,slow:easyBand(lc.task?.band??"A2"),speaker:"Linga"}
    :{line:c?.phase==="coaching"?c.coaching?.note??"":last?.role==="partner"?last.text:"",key:`${c?.id}:${c?.phase}:${last?.id}:${c?.audioNonce}`,blocked:!c||c.paused||c.capture||!!c.pending||c.phase==="finished",slow:easyBand(c&&isBand(c.preferences.level)?c.preferences.level:"A1"),speaker:"Partner"};
  const audioStatus=useEnglishAudio(spoken,voice,!menu&&!picking&&(s.screen==="linga-check"||!home&&["linga-talk","linga-coach"].includes(s.screen)));
  const waiting=busy||(onCheck?!!lc?.pending:!!c?.pending);
  useEffect(()=>{setMenu(false);setSceneIndex(0);setChapter(0);setPicking(null);},[s.learner.id]);
  const nav=(screen:Screen)=>{setMenu(false);post({type:"nav",screen,focus:screen==="linga-talk"?-1:0});};
  const cmd=(action:string,extra:Record<string,unknown>={})=>{void run(action,extra);};
  const hasReply=!!c?.turns.some(t=>t.role==="learner");
  const stopCheck:Action={label:"Stop for now",help:"Leave the level check. You can carry on from here later.",go:()=>cmd("check-leave")};
  let tag="Tonight",title="English you can use",caption="",captionTag="Your mission",hero:React.ReactNode=null,actions:Action[]=[];
  if(picking){
    tag="Your level";title=`${picking} · ${BAND_NAME[picking]}`;caption=BAND_CAN[picking];captionTag="Pick your level";
    hero=<><div className="linga-kicker">Self-chosen · Linga can find it with you any time</div><h1>{title}</h1><BandLadder band={picking}/></>;
    actions=[{label:"This is my level",help:BAND_CAN[picking],go:()=>{void run("level-self",{band:picking}).then(ok=>{if(ok)setPicking(null);});}},
      {label:"Lower",help:picking==="A1"?"A1 is the first level.":`${shift(picking,-1)} · ${BAND_CAN[shift(picking,-1)]}`,go:()=>setPicking(b=>b&&shift(b,-1))},
      {label:"Higher",help:picking==="C2"?"C2 is the top level.":`${shift(picking,1)} · ${BAND_CAN[shift(picking,1)]}`,go:()=>setPicking(b=>b&&shift(b,1))}];
  }else if(home){
    const resume=c&&c.phase!=="finished"&&c.turns.length>0;
    const checking=lc&&(lc.stage==="about"||lc.stage==="tasks");
    if(resume){
      title=c.title;caption="Your conversation is waiting. Carry on from the last question.";
      hero=<><div className="linga-kicker">Continue your rehearsal</div><h1>{title}</h1><div className="linga-subtitle">{ENGLISH_SKILLS.find(x=>x.id===c.focusSkill)?.name}</div><Mascot/></>;
      actions=[{label:"Carry on talking",help:caption,go:()=>cmd("resume")},{label:"Choose a situation",help:"Choose a goal and practise it in a conversation.",go:()=>nav("linga-scenes")}];
    }else if(checking){
      tag="Your level";title="Find your level";caption="You stopped part way. Carry on from where you were.";
      hero=<><div className="linga-kicker">{lc.stage==="about"?`About you · ${lc.turns.filter(t=>t.role==="learner").length} of ${ABOUT_QUESTIONS} answered`:`Tasks · ${lc.tasks.length} of up to ${MAX_TASKS} done`}</div><h1>{title}</h1><div className="linga-subtitle">Answer on your phone</div><Mascot/></>;
      actions=[{label:"Carry on",help:caption,go:()=>cmd("check-resume")},{label:"Start again",help:"Begin the level check again from the first question.",go:()=>cmd("check-start")}];
    }else if(!l.placement){
      tag="Welcome";title="Let's find your level";caption="Three questions about you, then a few short tasks. About seven minutes, answered on your phone.";
      hero=<><div className="linga-kicker">Before your first conversation</div><h1>{title}</h1><div className="linga-subtitle">A1 to C2 · about 7 minutes</div><Mascot/></>;
      actions=[{label:"Find my level",help:caption,go:()=>cmd("check-start")},{label:"I'll pick my level",help:"Choose a level from A1 to C2 yourself. Linga can find it with you later.",go:()=>setPicking(level)}];
    }else if(!l.plan||lc?.stage==="plan"||lc?.stage==="verdict"){
      tag="Your topics";title="Choose your topics";caption="Linga picks conversations for your level and interests. Swap any you don't want.";
      hero=<><div className="linga-kicker">{level} · {BAND_NAME[level]}{l.placement.source==="self"?" · self-chosen":""}</div><h1>{title}</h1><div className="linga-subtitle">Conversations picked for you</div><Mascot/></>;
      actions=[{label:lc?.stage==="plan"?"Carry on choosing":"See my topics",help:caption,go:()=>cmd(lc?.stage==="plan"?"check-resume":"plan-propose")},{label:"Choose a situation",help:"Skip the topics and pick a situation yourself.",go:()=>nav("linga-scenes")}];
    }else if(planDone(l)){
      tag="Your topics";title="Every topic talked through";caption="Ask Linga for a fresh set of conversations, or go back to one you enjoyed.";
      hero=<><div className="linga-kicker">{level} · {BAND_NAME[level]}</div><h1>{title}</h1><div className="linga-subtitle">{l.plan.topics.length} conversations</div><Mascot/></>;
      actions=[{label:"New topics",help:"Linga suggests a fresh set of conversations for your level.",go:()=>cmd("plan-propose")},{label:"Talk again",help:recommended.goal,go:()=>cmd("start",{sceneId:recommended.id,replace:true})}];
    }else{
      title=recommended.name;caption=recommended.goal;
      hero=<><div className="linga-kicker">{level} · {BAND_NAME[level]}{l.placement.source==="self"?" · self-chosen":""}</div><h1>{title}</h1><div className="linga-subtitle">{ENGLISH_SKILLS.find(x=>x.id===recommended.skill)?.name}</div><Mascot/></>;
      actions=[{label:"Start talking",help:caption,go:()=>cmd("start",{sceneId:recommended.id,replace:true})},{label:"Choose a situation",help:"Choose a goal and practise it in a conversation.",go:()=>nav("linga-scenes")}];
    }
  }else if(s.screen==="linga-check"&&lc){
    tag="Find your level";
    const cancel:Action={label:"Cancel & come back later",help:"Stop here. Everything so far is kept.",go:()=>cmd("check-leave")};
    if(lc.stage==="about"){
      const answered=lc.turns.filter(t=>t.role==="learner").length;
      title="Tell me about you";
      hero=<><div className="linga-kicker">About you · question {Math.min(answered+1,ABOUT_QUESTIONS)} of {ABOUT_QUESTIONS}</div><h1>{title}</h1><Speaker name="Linga"/><Mascot/></>;
      caption=lc.pending?(lc.turns.length?"Take a moment. Linga is reading your answer.":"Linga is getting ready."):asked?.role==="tutor"?asked.text:lc.error;
      captionTag=lc.pending?"Preparing":"Linga · answer on your phone";
      actions=lc.pending?[cancel]:!lc.turns.length?[{label:"Try again",help:"Ask Linga to start the level check again.",go:()=>cmd("check-retry")},stopCheck]:[{label:"Hear it again",help:"Linga asks the question again. Answer on your phone, in English or your own language.",go:()=>cmd("check-repeat")},stopCheck];
    }else{
      const t=lc.task;
      tag=`Task ${Math.min(lc.tasks.length+1,MAX_TASKS)} of up to ${MAX_TASKS}`;
      if(!t){
        title=lc.tasks.length?"Next task":"A few short tasks";
        hero=<><div className="linga-kicker">Some are easy, some are hard · that is how Linga finds your level</div><h1>{title}</h1><Mascot/></>;
        caption=lc.pending?"Take a moment. Linga is getting the task ready.":lc.error||"Getting the task ready.";captionTag="Preparing";
        actions=lc.pending?[cancel]:[{label:"Try again",help:"Ask Linga for the task again.",go:()=>cmd("check-retry")},stopCheck];
      }else if(t.kind==="choose"){
        title=t.prompt;
        hero=<><div className="linga-kicker">{TASK_TITLE.choose} · pick with the remote</div><h1 className="linga-prompt">{t.prompt}</h1><div className="linga-choices">{t.options.map((x,i)=><div key={x}><small>0{i+1}</small>{x}</div>)}</div></>;
        caption=lc.pending?"Take a moment.":"Pick the reply that fits. Not sure? Say so; that helps too.";captionTag="Your task";
        actions=lc.pending?[cancel]:[...t.options.map((x,i)=>({label:`Reply ${i+1}`,help:x,go:()=>cmd("check-task",{taskId:t.id,option:i})})),{label:"I don't know",help:"Skip this one. That tells Linga something too.",go:()=>cmd("check-task",{taskId:t.id,skip:true})}];
      }else{
        title=TASK_TITLE[t.kind];
        hero=<><div className="linga-kicker">{t.kind==="listen"?"Listen, then answer on your phone":"Answer on your phone · speak or type"}</div><h1>{title}</h1>{t.kind==="listen"&&t.revealed?<div className="linga-quote">“{t.line}”</div>:<Speaker name="Linga"/>}<Mascot/></>;
        caption=lc.pending?"Take a moment. Linga is reading your answer.":t.prompt;captionTag=lc.pending?"Preparing":t.kind==="listen"?"The question":"Your task";
        actions=lc.pending?[cancel]:[{label:t.kind==="listen"?"Hear it again":"Hear the task",help:"Linga says it again.",go:()=>cmd("check-repeat")},...(t.kind==="listen"&&!t.revealed?[{label:"Show the words",help:"Read the line instead of hearing it.",go:()=>cmd("check-reveal")}]:[]),{label:"I don't know",help:"Skip this one. That tells Linga something too.",go:()=>cmd("check-task",{taskId:t.id,skip:true})}];
      }
    }
  }else if(s.screen==="linga-verdict"&&placement){
    const b=placement.band,self=placement.source==="self";
    tag="Your level";title=`${b} · ${BAND_NAME[b]}`;
    hero=<><div className="linga-kicker">{self?"Self-chosen":"Linga's read · not a certificate"}</div><h1>{title}</h1><BandLadder band={b}/></>;
    caption=placement.summary||BAND_CAN[b];captionTag=self?"Your pick":"Linga";
    actions=[{label:"See my topics",help:"Linga picks conversations for this level. Swap any you don't want.",go:()=>cmd(l.plan&&lc?.stage!=="verdict"?"plan-open":"plan-propose")},{label:self?"Find my level with Linga":"Find my level again",help:"Three questions and a few short tasks, about seven minutes.",go:()=>cmd("check-start")},{label:"Pick it myself",help:"Choose a level from A1 to C2 yourself.",go:()=>setPicking(b)}];
  }else if(s.screen==="linga-plan"&&lc){
    tag=`Your topics · ${level}`;title=lc.topics.length?`${lc.topics.length} conversations for you`:"Your topics";
    const selected=s.focus-1;
    hero=<><div className="linga-kicker">{lc.pending?"Linga is working on your topics":"Swap any topic · add your own on the phone"}</div><h1>{title}</h1><div className="linga-topics">{lc.topics.map((t,i)=><div key={t.id} data-selected={i===selected}>{t.title}<small>{ENGLISH_SKILLS.find(x=>x.id===t.skill)?.name}</small></div>)}</div></>;
    caption=lc.pending?(lc.topics.length?"Take a moment. Linga is finding another topic.":"Take a moment. Linga is picking conversations for your level and interests."):lc.error||"Add a topic in your own words on the phone.";captionTag=lc.pending?"Preparing":"Your topics";
    actions=lc.pending?[{label:"Cancel & come back later",help:"Stop here. Your topics so far are kept.",go:()=>cmd("check-leave")}]:lc.topics.length?[{label:"Agree to these topics",help:"Save these as your plan. Linga starts with the first one.",go:()=>cmd("plan-agree")},...lc.topics.map(t=>({label:"Swap this topic",help:t.why,go:()=>cmd("plan-swap",{topicId:t.id})})),{label:"All new topics",help:"Replace every topic with a fresh set.",go:()=>cmd("plan-renew")}]:[{label:"Try again",help:"Ask Linga for topics again.",go:()=>cmd("check-retry")}];
  }else if(s.screen==="linga-scenes"){
    const scene=scenes[sceneIndex%scenes.length];tag=`Situation ${sceneIndex%scenes.length+1} of ${scenes.length}`;title=scene.name;caption=scene.goal;
    hero=<><div className="linga-kicker">{scene.partner} · {scene.minutes} minutes</div><h1>{title}</h1><div className="linga-subtitle">{ENGLISH_SKILLS.find(x=>x.id===scene.skill)?.name}</div><SceneArt kind={scene.id}/></>;
    actions=[{label:"Start this situation",help:scene.goal,go:()=>cmd("start",{sceneId:scene.id,replace:true})},{label:"Next situation",help:scenes[(sceneIndex+1)%scenes.length].goal,go:()=>setSceneIndex(i=>(i+1)%scenes.length)}];
  }else if(s.screen==="linga-map"){
    const skill=ENGLISH_SKILLS[chapter],progress=l.achievements[skill.id]??"not-tried";
    const typed=l.evidence.filter(e=>e.skill===skill.id&&e.mode==="text").length;
    tag=`Chapter ${chapter+1} of 8`;title=skill.name;caption=skill.goal;
    hero=<><div className="linga-kicker">Speaking progress · {PROGRESS_LABEL[progress]}</div><h1>{title}</h1><ProgressTrack progress={progress}/>{typed>0&&<div className="linga-subtitle">{typed} written practice observations · speaking assessed separately</div>}</>;
    actions=[{label:"Previous chapter",help:ENGLISH_SKILLS[(chapter+7)%8].goal,go:()=>setChapter(x=>(x+7)%8)},{label:"Next chapter",help:ENGLISH_SKILLS[(chapter+1)%8].goal,go:()=>setChapter(x=>(x+1)%8)}];
  }else if(c&&s.screen==="linga-moment"&&c.moment){
    const m=c.moment;tag="A moment";title=m.kind==="fix"?"One thing to fix":"A word for this scene";
    hero=<div className="linga-comparison"><section><div className="linga-kicker">{m.kind==="fix"?"You said":"New word"}</div><div className="linga-quote">“{m.said}”</div></section><section><div className="linga-kicker">{m.kind==="fix"?"Try":"In this scene"}</div><div className="linga-quote">“{m.better}”</div></section></div>;
    caption=m.why;captionTag=m.kind==="fix"?"Why":"What it means";
    actions=[{label:"Back to the conversation",help:"Carry on from where the scene stopped.",go:()=>cmd("moment-done")}];
  }else if(c&&s.screen==="linga-coach"&&c.coaching){
    tag="One useful change";title="Coach";caption=c.coaching.note;captionTag="Coach";
    hero=<div className="linga-comparison"><section><div className="linga-kicker">You said</div><div className="linga-quote">“{c.coaching.before}”</div></section><section><div className="linga-kicker">One way to try it</div><div className="linga-quote">“{c.coaching.after}”</div></section></div>;
    actions=[{label:"Replay the moment",help:"Try the same intention with a new question. The first retry is supported practice.",go:()=>cmd("replay")},{label:"Finish for today",help:"Save this rehearsal and see what you practised.",go:()=>cmd("finish")}];
  }else if(c&&s.screen==="linga-recap"){
    tag="Your rehearsal";title="Take it somewhere new";
    const attempts=c.turns.filter(t=>t.role==="learner"),spokenCount=attempts.filter(t=>t.mode==="speech").length,moments=(c.moments??[]).length;
    const progress=l.achievements[c.focusSkill]??"not-tried";
    hero=<><div className="linga-kicker">{c.title}</div><h1>{title}</h1><ProgressTrack progress={progress}/><div className="linga-subtitle">{spokenCount} spoken · {attempts.length-spokenCount} written replies{moments?` · ${moments} ${moments===1?"moment":"moments"} to keep`:""}</div></>;
    caption=attempts.length?`Next, try ${recommendScene(p,l).name.toLowerCase()}. Your notes and learning map are on the phone.`:"You explored the scene. Try a reply next time; no speaking progress was recorded.";
    actions=[{label:"Another situation",help:"Choose a fresh context for your next conversation.",go:()=>nav("linga-scenes")},{label:"Learning map",help:"See saved evidence for each ability; printing is on the phone.",go:()=>nav("linga-map")}];
  }else if(c){
    tag=c.phase==="replay"?"Try it again":"Conversation";title=c.goal;
    const currentScene=c.scene??ENGLISH_SCENES.find(x=>x.id===c.sceneId)!;
    caption=c.pending?"Take a moment. Your partner is preparing the next turn.":c.paused?"The scene is paused. Resume when you are ready.":c.capture?"Listening on your phone. Stop when you are ready to review your words.":c.cue||c.turns.at(-1)?.text||"Preparing a situation that fits your goal.";
    captionTag=c.cue?"A little support":c.pending?"Preparing":c.capture?"Your turn":c.partner;
    if(c.quizOpen){
      hero=<><div className="linga-kicker">A little support · recognition practice</div><h1 className="linga-smaller">{currentScene.quiz.question}</h1><div className="linga-choices">{currentScene.quiz.options.map((x,i)=><div key={x}><small>0{i+1}</small>{x}</div>)}</div></>;
      actions=currentScene.quiz.options.map((x,i)=>({label:`Option ${i+1}`,help:x,go:()=>cmd("choice",{option:i})}));
    }else{
      hero=<><div className="linga-kicker">{c.title}</div><h1 className="linga-smaller">{title}</h1><Speaker name={c.partner}/><SceneArt kind={c.sceneId}/></>;
      actions=!c.turns.length&&!c.pending?[{label:"Retry the scene",help:"Try preparing this situation again.",go:()=>cmd("start",{sceneId:c.sceneId,replace:true})},{label:"Choose another",help:"Choose a different situation.",go:()=>nav("linga-scenes")}]:c.paused?[{label:"Resume",help:"Return to the last question. Your words are kept.",go:()=>cmd("pause")},{label:"Finish rehearsal",help:"End here and keep your learning evidence.",go:()=>cmd("finish")}]:[{label:c.pending?"Cancel & go back":"Give me a cue",help:c.pending?"Cancel the pending reply and keep the conversation for later.":"Get a phrase starter, then try your own reply on the phone.",go:()=>cmd(c.pending?"leave":"cue")},{label:hasReply?"Pause & coach":"Choose a phrase",help:hasReply?"Work on one useful change, then replay this moment.":"Compare two phrases before returning to speaking.",go:()=>cmd(hasReply?"coach":"quiz"),disabled:waiting}];
    }
  }else{caption="Choose a situation to begin.";hero=<h1>A place to practise</h1>;actions=[{label:"Choose a situation",help:caption,go:()=>nav("linga-scenes")}];}
  if(menu){
    const rehearsing=c&&c.phase!=="finished";
    const entries:Action[]=[{label:"Back to the scene",help:"Return to where you were.",go:()=>{setMenu(false);post({type:"focus",focus:-1});}},{label:"Learning map",help:"Explore the abilities you can practise and your speaking progress.",go:()=>nav("linga-map")},{label:"Choose a situation",help:"Choose a new scene; your existing evidence stays saved.",go:()=>nav("linga-scenes")},{label:"My level",help:l.placement?`${level} · ${BAND_NAME[level]}. See it, find it again, or pick it yourself.`:"Find your level with three questions and a few short tasks.",go:()=>{setMenu(false);if(l.placement)nav("linga-verdict");else cmd("check-start");}},{label:"My topics",help:"See the conversations in your plan, swap them or ask for new ones.",go:()=>{setMenu(false);cmd(l.plan?"plan-open":"plan-propose");}},{label:"Phone setup",help:"Open Linga on the phone to set your interests, goals and learning preferences.",go:()=>post({type:"nav",screen:"pair",from:s.screen})},{label:"Sentence help",help:"Open Say it on the phone for help with a particular sentence.",go:()=>nav("sentence")},...(rehearsing?[{label:"Finish rehearsal",help:"End this scene and save a recap.",go:()=>{setMenu(false);cmd("finish");}}]:[])];
    tag="Your controls";captionTag="Your choice";hero=<><div className="linga-kicker">Linga</div><h1>Make it work for you</h1><div className="linga-menu-list">{entries.map((a,i)=><div key={a.label} data-selected={s.focus===i}>{String(i+1).padStart(2,"0")} / {a.label}</div>)}</div></>;
    actions=entries;caption=actions[Math.max(0,s.focus)]?.help??actions[0].help;
  }
  const focus=s.focus;
  const showHelp=focus>=0&&!waiting&&!c?.capture;
  if(showHelp&&actions[focus])caption=actions[focus].help;
  const shownError=error||(!home&&(onCheck?lc?.error:c?.error));
  if(shownError){caption=shownError;captionTag="Try again";}
  useEffect(()=>{
    const handler=(e:KeyboardEvent)=>{
      if(e.target instanceof HTMLElement&&e.target.closest(".bar"))return;
      const k=e.key;if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Enter","Escape","Backspace","m","M"," "].includes(k))return;
      e.preventDefault();
      if(k==="m"||k==="M"){setMenu(v=>!v);setPicking(null);post({type:"focus",focus:0});return;}
      if(k==="Escape"||k==="Backspace"){
        if(menu){setMenu(false);post({type:"focus",focus:-1});}
        else if(picking)setPicking(null);
        else if(home)post({type:"nav",screen:"landing",focus:1});
        else if(s.screen==="linga-check"&&lc)cmd("check-leave");
        else if(c&&s.screen==="linga-talk")cmd("leave");
        else if(c&&s.screen==="linga-moment")cmd("moment-done");
        else nav("linga");
        return;
      }
      if(k===" "){if(c&&!onCheck)cmd("pause");return;}
      if(k==="ArrowUp"&&home&&!menu&&!picking){post({type:"nav",screen:"learner",from:"linga"});return;}
      if(k.startsWith("Arrow")){const delta=k==="ArrowRight"||k==="ArrowDown"?1:-1;post({type:"focus",focus:focus<0?0:(focus+delta+actions.length)%actions.length});return;}
      const a=actions[Math.max(0,focus)];if(a&&!a.disabled&&(!waiting||a.label.startsWith("Cancel")))a.go();
    };
    addEventListener("keydown",handler);return()=>removeEventListener("keydown",handler);
  });
  const oneButton=menu||(s.screen==="linga-plan"&&!picking&&actions.length>2);
  return <div className="linga-tv" data-view={menu?"menu":picking?"linga-verdict":s.screen}>
    <div className={`band ${home&&!picking?"band-left-thin":s.screen==="linga-coach"||s.screen==="linga-moment"?"band-divider":"band-rule"}`}/>
    <header className="linga-top"><b>Linga</b><span>{s.learner.name}</span><em>{tag}</em></header>
    <main className="linga-hero">{hero}</main>
    <div className="linga-caption"><span className="linga-kicker">{captionTag}</span><div aria-live="polite">{caption}</div></div>
    <nav className={`linga-actions ${oneButton?"linga-menu-actions":""}`} aria-label="Linga actions">{actions.map((a,i)=><button className="btn" key={`${i}:${a.label}`} data-focused={focus===i} disabled={a.disabled||(waiting&&!a.label.startsWith("Cancel"))} onMouseEnter={()=>post({type:"focus",focus:i})} onMouseLeave={()=>{if(s.screen==="linga-talk")post({type:"focus",focus:-1});}} onClick={a.go}>{menu?"Select · ":""}{a.label}</button>)}</nav>
    <footer className="linga-footer"><span>{waiting?(onCheck?"Linga is thinking…":"Preparing a reply…"):c?.capture&&!onCheck?"Phone microphone active":audioStatus||"TV shows · Phone speaks"}</span><button onClick={()=>{setMenu(v=>!v);setPicking(null);post({type:"focus",focus:0});}}>Menu · M</button>{c&&!home&&!onCheck&&<button onClick={()=>cmd("repeat")}>Repeat audio</button>}</footer>
  </div>;
}
function BandLadder({band}:{band:Band}){return <div className="linga-track linga-ladder">{BANDS.map((b,i)=><div key={b} data-reached={i<=BANDS.indexOf(band)} data-here={b===band}><i/>{b}<small>{BAND_NAME[b]}</small></div>)}</div>;}
function ProgressTrack({progress}:{progress:import("@/lib/english/types").Progress}){return <div className="linga-track">{PROGRESS_ORDER.map((id,i)=><div key={id} data-reached={i<=PROGRESS_ORDER.indexOf(progress)}><i/>{PROGRESS_LABEL[id]}</div>)}</div>;}
function SceneArt({kind}:{kind:string}){return <svg className="linga-scene-art" viewBox="0 0 240 220" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path opacity=".35" d="M10 190H225M25 20H200V175H25ZM42 43H180M42 65H135"/>{kind==="rover"?<><path d="M40 125H160L180 165H25ZM95 125V80H145V125M120 80V53L163 40"/><circle cx="60" cy="175" r="17"/><circle cx="150" cy="175" r="17"/></>:kind==="date"?<path d="M40 120H95V151H40ZM95 126H112V141H95M132 120H180V151H132ZM180 126H194V141H180M65 104V85M151 104V85M28 163H210"/>:<path d="M65 101H166V166H65ZM83 128L96 141 126 113M139 127H152M82 153H150"/>}</svg>;}
