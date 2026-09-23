/**
 * Try again, in place: a failed run is asked again with what it was asked the first time, which the desk holds
 * on the job (`Job.input`). A read is read again on the same page id with the image the session already has -
 * no second page, no re-snap; a hint is asked again for the same item and the same question; a practice set is
 * written again on the same topic. The run goes through the kind's own route, so it is the same job
 * (one at a time, a desk-worded failure, a late result dropped).
 */
import { NextResponse } from "next/server";
import { getSession, type JobKind } from "@/lib/session/store";
import { MOVED_ON, NOTHING } from "@/lib/desk/job";
import { POST as read } from "../../read/route";
import { POST as hint } from "../../hint/route";
import { POST as practice } from "../../practice/route";

export const dynamic = "force-dynamic";

const ROUTES: Partial<Record<JobKind, { path: string; post: (req: Request) => Promise<Response> }>> = {
  read: { path: "read", post: read },
  hint: { path: "hint", post: hint },
  practice: { path: "practice", post: practice },
};

export async function POST(req: Request) {
  const { kind } = (await req.json().catch(() => ({}))) as { kind?: JobKind };
  const s = getSession();
  const job = kind ? s.jobs?.[kind] : undefined;
  const route = kind ? ROUTES[kind] : undefined;
  if (!kind || !job || !route || job.phase !== "failed" || !job.input) return NextResponse.json({ error: NOTHING }, { status: 409 });
  // a hint is for the item it was asked about: if the page under it has changed, there is nothing to ask again
  if (kind === "hint") {
    const item = s.pages[s.pageIx]?.items[Number(job.input.itemIx)];
    if (!item || item.key !== job.key) return NextResponse.json({ error: MOVED_ON }, { status: 409 });
  }
  return route.post(new Request(new URL(`/api/${route.path}`, req.url), {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(job.input),
  }));
}
