"use client";
import { useEffect, useRef, useState } from "react";

/** One line the TV should speak. A new key plays it again; blocked keeps it silent. */
export interface SpokenLine { line: string; key: string; blocked: boolean; slow: boolean; speaker: string; }

/** Cancel synthesis/playback on capture, pause, navigation and learner change. */
export function useEnglishAudio({line,key,blocked:held,slow,speaker}:SpokenLine,enabled:boolean,visible:boolean){
  const [status,setStatus]=useState("");const played=useRef("");
  const blocked=!enabled||!visible||held;
  useEffect(()=>{
    if(blocked||!line||played.current===key){setStatus("");return;}
    let alive=true,url="";let audio:HTMLAudioElement|null=null;
    const controller=new AbortController();
    const done=()=>{if(alive)setStatus("");};
    const fallback=()=>{
      if(!alive)return;
      if(!("speechSynthesis" in window)){setStatus("Audio is unavailable. Follow the captions.");return;}
      const utterance=new SpeechSynthesisUtterance(line);utterance.lang="en-US";utterance.rate=slow?.85:1;
      utterance.onstart=()=>{if(alive){played.current=key;setStatus(`${speaker} speaking`);}};
      utterance.onend=done;utterance.onerror=()=>{if(alive)setStatus("Select Repeat audio to enable speech, or use captions.");};
      window.speechSynthesis.speak(utterance);
    };
    setStatus("Preparing audio");
    const timeout=setTimeout(()=>controller.abort(),12000);
    (async()=>{try{const r=await fetch("/api/speak",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:line}),signal:controller.signal});if(!r.ok)throw new Error("No server voice");const blob=await r.blob();if(!alive)return;url=URL.createObjectURL(blob);audio=new Audio(url);audio.onended=done;audio.onerror=()=>fallback();await audio.play();if(alive){played.current=key;setStatus(`${speaker} speaking`);}}catch{fallback();}finally{clearTimeout(timeout);}})();
    return()=>{alive=false;clearTimeout(timeout);controller.abort();audio?.pause();if(url)URL.revokeObjectURL(url);if("speechSynthesis" in window)window.speechSynthesis.cancel();};
  },[key,line,blocked,slow,speaker]);
  return status;
}
