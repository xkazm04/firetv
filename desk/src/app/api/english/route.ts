import { ConversationError, englishCommand } from "@/lib/english/conversation";
import { LINGA_NOT_AGAIN } from "@/lib/english/errors";
import { failureOf } from "@/lib/desk/job";
import { RETRYABLE } from "@/lib/desk/failure";
import { LEARNER_UNREAD_RUN } from "@/lib/session/store";
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
  try{return Response.json(await englishCommand(body));}
  catch(e){if(e instanceof ConversationError)return Response.json({error:e.message},{status:e.status});console.error("Linga operation failed:",e instanceof Error?e.message:"unknown error");return failed(e);}
}
