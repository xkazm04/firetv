"use client";
import { useCallback, useState } from "react";
import type { Session } from "@/lib/session/store";
export const requestId=()=>globalThis.crypto?.randomUUID?.()??`turn-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function useEnglish(s:Session){
  const [busy,setBusy]=useState(false),[error,setError]=useState("");
  const run=useCallback(async(action:string,extra:Record<string,unknown>={})=>{
    setBusy(true);setError("");
    // A check or topic step can chain two model calls (read the answer, then write the next task), so it gets longer.
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),/^(check-|plan-)/.test(action)?240000:75000);
    try{const r=await fetch("/api/english",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,learnerId:s.learner.id,episodeId:s.conversation?.id,checkId:s.check?.id,commandId:requestId(),...extra}),signal:controller.signal});const j=await r.json();if(!r.ok)throw new Error(j.error||"That did not reach the tutor.");return true;}
    catch(e){setError(e instanceof Error&&e.name==="AbortError"?"The connection timed out. Your reply is kept; please retry.":e instanceof Error?e.message:"That did not reach the tutor.");return false;}finally{clearTimeout(timer);setBusy(false);}
  },[s.learner.id,s.conversation?.id,s.check?.id]);
  return {run,busy,error,setError};
}
