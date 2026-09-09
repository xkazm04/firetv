"use client";
import { useEffect, useRef, useState } from "react";
import type { Conversation } from "@/lib/english/types";

/** Cancel synthesis/playback on capture, pause, navigation and learner change. */
export function useEnglishAudio(c:Conversation|null,enabled:boolean,visible:boolean){
  const [status,setStatus]=useState("");const played=useRef("");
  const last=c?.turns.at(-1);
  const line=c?.phase==="coaching"?c.coaching?.note:last?.role==="partner"?last.text:"";
  const key=`${c?.id}:${c?.phase}:${last?.id}:${c?.audioNonce}`;
  const blocked=!enabled||!visible||c?.paused||c?.capture||!!c?.pending||c?.phase==="finished";
  useEffect(()=>{
    if(blocked||!line||played.current===key){setStatus("");return;}
    let alive=true,url="";let audio:HTMLAudioElement|null=null;
    const controller=new AbortController();
    const done=()=>{if(alive)setStatus("");};
    const fallback=()=>{
      if(!alive)return;
      if(!("speechSynthesis" in window)){setStatus("Audio is unavailable. Follow the captions.");return;}
      const utterance=new SpeechSynthesisUtterance(line);utterance.lang="en-US";utterance.rate=c?.preferences.level==="beginner"?.85:1;
      utterance.onstart=()=>{if(alive){played.current=key;setStatus("Partner speaking");}};
      utterance.onend=done;utterance.onerror=()=>{if(alive)setStatus("Select Repeat audio to enable speech, or use captions.");};
      window.speechSynthesis.speak(utterance);
    };
    setStatus("Preparing audio");
    const timeout=setTimeout(()=>controller.abort(),12000);
    (async()=>{try{const r=await fetch("/api/speak",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:line}),signal:controller.signal});if(!r.ok)throw new Error("No server voice");const blob=await r.blob();if(!alive)return;url=URL.createObjectURL(blob);audio=new Audio(url);audio.onended=done;audio.onerror=()=>fallback();await audio.play();if(alive){played.current=key;setStatus("Partner speaking");}}catch{fallback();}finally{clearTimeout(timeout);}})();
    return()=>{alive=false;clearTimeout(timeout);controller.abort();audio?.pause();if(url)URL.revokeObjectURL(url);if("speechSynthesis" in window)window.speechSynthesis.cancel();};
  },[key,line,blocked,c?.preferences.level]);
  return status;
}
