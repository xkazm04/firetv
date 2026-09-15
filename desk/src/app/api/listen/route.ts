import { listen, listenStatus } from "@/lib/engines/listen";
export const dynamic="force-dynamic";
export const runtime="nodejs";
/** Is there a transcriber to send a recording to? The test bar asks once, before offering its microphone. */
export async function GET(){return Response.json(await listenStatus());}
export async function POST(req:Request){
  let form:FormData;
  try{form=await req.formData();}catch{return Response.json({error:"Send the recording as form data."},{status:400});}
  const file=form.get("file");
  if(!(file instanceof Blob)||!file.size)return Response.json({error:"No recording arrived."},{status:400});
  if(file.size>25_000_000)return Response.json({error:"That recording is too long."},{status:413});
  try{const r=await listen(file,"answer.webm");return Response.json({text:r.json.text,language:r.json.language,provider:r.provider,ms:r.ms});}
  catch(e){return Response.json({error:e instanceof Error?e.message:"Speech-to-text failed."},{status:502});}
}
