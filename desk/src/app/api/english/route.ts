import { ConversationError, englishCommand } from "@/lib/english/conversation";
import { LINGA_NOT_AGAIN } from "@/lib/english/errors";
import { failureOf } from "@/lib/desk/job";
import { RETRYABLE } from "@/lib/desk/failure";
import { LEARNER_UNREAD_RUN, dispatch, getSession } from "@/lib/session/store";
import { roleFrom } from "@/lib/session/pairing";
import { PHONE_REFUSAL, phoneDoor } from "@/lib/english/phoneDoor";
/** The tutor's own failure, as the desk's jobs say theirs (failure.ts): why as a value, whether asking again can help, and the sentence that follows from them. */
function failed(e:unknown){
  const failure=failureOf(e),retry=RETRYABLE[failure];
  const error=failure==="unread"?LEARNER_UNREAD_RUN:!retry?LINGA_NOT_AGAIN:"The tutor is unavailable or returned an unusable reply. Your work is kept; please retry.";
  return Response.json({error,failure,retry},{status:502});
}
export const dynamic="force-dynamic";
export const runtime="nodejs";
export async function POST(req:Request){
  let body:unknown;
  try{const raw=await req.text();if(raw.length>12000)return Response.json({error:"That request is too long."},{status:413});body=JSON.parse(raw);}catch{return Response.json({error:"Send a valid conversation request."},{status:400});}
  const door=phoneDoor(roleFrom(req),body,getSession().ask);
  if(!door.ok)return Response.json({error:PHONE_REFUSAL},{status:409});
  // an accepted answer marks its hand-off sent as the work begins; the client that closes it waits for the result
  if(door.ask&&door.mark)dispatch({type:"ask.sent",id:door.ask.id});
  try{return Response.json(await englishCommand(body));}
  catch(e){
    // the answer did not land: the hand-off is asked again, so the phone can answer again (a new id, the same kind and detail)
    const now=getSession().ask;
    if(door.ask&&door.mark&&now?.id===door.ask.id&&now.phase==="sent"){dispatch({type:"ask.cancel",id:now.id});dispatch({type:"ask.open",kind:now.kind,...(now.detail?{detail:now.detail}:{})});}
    if(e instanceof ConversationError)return Response.json({error:e.message},{status:e.status});console.error("Linga operation failed:",e instanceof Error?e.message:"unknown error");return failed(e);}
}
