/** GET /api/smoke — one call per engine, so a broken engine is found here and not on the TV. */
import { NextResponse } from "next/server";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { text } from "@/lib/engines/text";
import { vision } from "@/lib/engines/vision";
import { embed } from "@/lib/engines/embed";
import { voiceConfigured } from "@/lib/engines/voice";

export const dynamic = "force-dynamic";
export async function GET() {
  const out: Record<string, unknown> = { voice: voiceConfigured() ? "key present" : "no key" };
  const t = async (name: string, fn: () => Promise<unknown>) => { try { out[name] = await fn(); } catch (e) { out[name] = { error: String(e).slice(0, 300) }; } };
  await t("text", async () => { const r = await text<{ ok: string }>({ system: "Answer in JSON.", prompt: "Set ok to the word yes.", schema: { type: "object", properties: { ok: { type: "string" } }, required: ["ok"] } }); return { json: r.json, provider: r.provider, ms: r.ms }; });
  await t("embed", async () => { const r = await embed({ texts: ["factoring quadratics"] }); return { dims: r.json[0].length, provider: r.provider, ms: r.ms }; });
  await t("vision", async () => {
    const f = path.join(process.cwd(), "data", "sample.jpg"); if (!existsSync(f)) return "no data/sample.jpg";
    const r = await vision<{ title: string }>({ imageBase64: readFileSync(f).toString("base64"), prompt: "What is the title printed at the top of this page?", schema: { type: "object", properties: { title: { type: "string" } }, required: ["title"] } });
    return { json: r.json, provider: r.provider, ms: r.ms };
  });
  return NextResponse.json(out);
}
