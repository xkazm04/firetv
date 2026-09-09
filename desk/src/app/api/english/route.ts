import { ConversationError, englishCommand } from "@/lib/english/conversation";
export const dynamic="force-dynamic";
export const runtime="nodejs";
export async function POST(req:Request){
  let body:unknown;
  try{const raw=await req.text();if(raw.length>12000)return Response.json({error:"That request is too long."},{status:413});body=JSON.parse(raw);}catch{return Response.json({error:"Send a valid conversation request."},{status:400});}
  try{return Response.json(await englishCommand(body));}
  catch(e){if(e instanceof ConversationError)return Response.json({error:e.message},{status:e.status});console.error("Linga operation failed:",e instanceof Error?e.message:"unknown error");return Response.json({error:"The tutor is unavailable or returned an unusable reply. Your work is kept; please retry."},{status:502});}
}
