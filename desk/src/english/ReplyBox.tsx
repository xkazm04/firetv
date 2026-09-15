"use client";
import { useEffect, useRef, useState } from "react";
import { requestId } from "./useEnglish";

interface Recognition {
  lang:string;continuous:boolean;interimResults:boolean;
  onresult:((event:{results:ArrayLike<{isFinal:boolean;[index:number]:{transcript:string}}>})=>void)|null;
  onerror:((event:{error:string})=>void)|null;onend:(()=>void)|null;
  start:()=>void;stop:()=>void;abort:()=>void;
}
type SpeechWindow=Window&{SpeechRecognition?:new()=>Recognition;webkitSpeechRecognition?:new()=>Recognition};

/**
 * Speak or type one reply, read it back, send it. Nothing is sent unseen, and a spoken reply is
 * only sent as speech once the learner has confirmed the words. Used by the conversation and the level check.
 */
export function ReplyBox({ready,busy,question,onSend,onCapture,stopWhen,note}:{
  ready:boolean;busy:boolean;
  /** the id of what is being answered; a draft started against an older question is sent against that one */
  question?:string;
  /** attempt stays the same when a failed send is retried, so the desk can tell a retry from a second reply */
  onSend:(text:string,mode:"speech"|"text",question:string|undefined,attempt:string)=>Promise<boolean>;
  onCapture?:(active:boolean)=>Promise<unknown>|void;
  /** stop listening when this turns true (a pause, a pending turn) */
  stopWhen?:boolean;note?:string;
}){
  const [draft,setDraft]=useState(""),[mode,setMode]=useState<"speech"|"text">("text"),[confirmed,setConfirmed]=useState(false);
  const [listening,setListening]=useState(false),[micAvailable,setMicAvailable]=useState(false),[micReason,setMicReason]=useState("");
  const [message,setMessage]=useState("");
  const recognition=useRef<Recognition|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null),mounted=useRef(true);
  const asked=useRef<string|undefined>(undefined),attempt=useRef("");
  useEffect(()=>{
    mounted.current=true;
    const w=window as SpeechWindow;
    const ok=!!(w.SpeechRecognition||w.webkitSpeechRecognition)&&window.isSecureContext;
    setMicAvailable(ok);setMicReason(!window.isSecureContext?"Voice needs HTTPS on a phone (localhost also works). You can type your reply here.":!ok?"This browser does not support speech recognition. Type a reply instead.":"");
    return()=>{mounted.current=false;if(timer.current)clearTimeout(timer.current);const r=recognition.current;if(r){r.onend=null;r.onerror=null;r.onresult=null;r.abort();void onCapture?.(false);}};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  useEffect(()=>{if(stopWhen&&recognition.current)recognition.current.stop();},[stopWhen]);
  const change=(value:string)=>{if(!draft)asked.current=question;setDraft(value);setMode("text");setConfirmed(false);attempt.current="";};
  const stop=()=>{recognition.current?.stop();};
  const start=async()=>{
    if(!ready||busy||listening)return;
    setMessage("");
    if(onCapture&&(await onCapture(true))===false)return;
    if(!mounted.current)return;
    const w=window as SpeechWindow,Ctor=w.SpeechRecognition||w.webkitSpeechRecognition;
    if(!Ctor)return;
    const rec=new Ctor();recognition.current=rec;rec.lang="en-US";rec.continuous=true;rec.interimResults=true;
    asked.current=question;attempt.current="";setDraft("");setMode("speech");setConfirmed(false);setListening(true);
    rec.onresult=e=>{if(!mounted.current)return;setDraft(Array.from(e.results).map(r=>r[0].transcript).join(" ").trim().slice(0,1200));};
    rec.onerror=e=>{if(mounted.current)setMessage(e.error==="not-allowed"?"Microphone permission was denied. You can enable it in your browser, or type a reply.":"The browser could not hear that reliably. Please retry or type your reply.");};
    rec.onend=()=>{if(timer.current)clearTimeout(timer.current);recognition.current=null;if(mounted.current){setListening(false);void onCapture?.(false);}};
    try{rec.start();timer.current=setTimeout(()=>rec.stop(),45000);}catch{recognition.current=null;setListening(false);setMessage("The microphone could not start. Type your reply or try again.");void onCapture?.(false);}
  };
  const send=async()=>{
    if(!draft.trim()||listening||busy)return;
    if(mode==="speech"&&!confirmed){setMessage("Confirm that the words match what you said before sending.");return;}
    attempt.current||=requestId();
    if(await onSend(draft,mode,asked.current??question,attempt.current)){setDraft("");setMode("text");setConfirmed(false);asked.current=undefined;attempt.current="";setMessage("");}
  };
  return <>
    {micAvailable?<><button className="pbtn" data-signal="true" disabled={busy||!ready} aria-pressed={listening} onClick={listening?stop:start}>{listening?"Stop & review":"Speak a reply"}</button><p className="linga-note">Your browser may send speech to its recognition service. Tap to begin; review the transcript before sending.</p></>:<p className="linga-note">{micReason}</p>}
    <label>{mode==="speech"?"Check what the microphone heard":"Your reply"}<textarea value={draft} maxLength={1200} disabled={listening||busy} placeholder="Speak or type your own reply…" onChange={e=>change(e.target.value)}/></label>
    {mode==="speech"&&draft&&!listening&&<label className="linga-check"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/><span>These are the words I said.</span></label>}
    {mode==="text"&&draft&&note&&<p className="linga-note">{note}</p>}
    <button className="pbtn" disabled={busy||listening||!draft.trim()||mode==="speech"&&!confirmed} onClick={send}>Send reply</button>
    {listening&&<p className="linga-status" aria-live="polite">Listening… tap Stop to review your words.</p>}
    {message&&<p role="status">{message}</p>}
  </>;
}
