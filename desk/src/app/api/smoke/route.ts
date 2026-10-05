/**
 * GET /api/smoke - the engine check, so a broken engine is found here and not on the TV.
 * Plain GET: one row per engine from its provider's probe, in about two seconds, no model call.
 * GET ?live=1: also runs text, vision (when data/sample.jpg exists), embed and speak for real, side by side.
 * Only the TV (or an in-process caller with no role header) may ask: a paired phone gets 403 and no engine is touched.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { engineCheck } from "@/lib/engines/health";
import { roleFrom } from "@/lib/session/pairing";

export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const role = roleFrom(req);
  if (role !== null && role !== "tv") return Response.json({ error: "The engine check is for the TV." }, { status: 403 });
  const live = new URL(req.url).searchParams.get("live") === "1";
  const sampleFile = path.join(process.env.DESK_DATA_DIR || path.join(process.cwd(), "data"), "sample.jpg");
  const sample = live && existsSync(sampleFile) ? readFileSync(sampleFile).toString("base64") : undefined;
  return Response.json({ live, engines: await engineCheck({ live, sample }) });
}
