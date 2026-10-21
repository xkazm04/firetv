import { listen, listenStatus } from "@/lib/engines/listen";
import { roleFrom } from "@/lib/session/pairing";
/** The transcriber is the TV's (the PC test bar on the TV page): a paired phone listens in its own browser, so its call is refused before any recording is sent on. */
const LISTEN_TV_ONLY="The TV transcribes recordings; the phone listens in its own browser.";
export const dynamic="force-dynamic";
export const runtime="nodejs";
/** Is there a transcriber to send a recording to? The test bar asks once, before offering its microphone. */
export async function GET(){return Response.json(await listenStatus());}
export async function POST(req:Request){
  const role=roleFrom(req);
  if(role&&role!=="tv")return Response.json({error:LISTEN_TV_ONLY},{status:403});
  let form:FormData;
  try{form=await req.formData();}catch{return Response.json({error:"Send the recording as form data."},{status:400});}
  const file=form.get("file");
  if(!(file instanceof Blob)||!file.size)return Response.json({error:"No recording arrived."},{status:400});
  if(file.size>25_000_000)return Response.json({error:"That recording is too long."},{status:413});
  try{const r=await listen(file,"answer.webm",{use:"answer-listen"});return Response.json({text:r.json.text,language:r.json.language,provider:r.provider,ms:r.ms});}
  catch(e){console.error("Speech-to-text failed:",e instanceof Error?e.message:e);return Response.json({error:"Speech-to-text failed. Type the answer, or try again."},{status:502});}
}
