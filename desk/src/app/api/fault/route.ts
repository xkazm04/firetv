export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** A screen that crashed while drawing (app/global-error.tsx) says where; the operator reads it in the server log. Only short labels are kept - never page text. It imports nothing from the session, so a crash report cannot fail on the state that crashed. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { where?: unknown; name?: unknown; digest?: unknown } | null;
  if (!body || typeof body !== "object") return Response.json({ error: "Send where the screen failed." }, { status: 400 });
  const label = (v: unknown, n: number) => (typeof v === "string" ? v.replace(/[^\w/.:-]/g, "").slice(0, n) : "");
  console.error(`[crash] screen ${label(body.where, 80) || "?"}: ${label(body.name, 40) || "Error"}${label(body.digest, 40) ? ` digest ${label(body.digest, 40)}` : ""}`);
  return new Response(null, { status: 204 });
}
