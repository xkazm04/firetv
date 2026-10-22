/**
 * Try again, in place: a failed run is asked again with what it was asked the first time, which the desk holds
 * on the job (`Job.input`). A read is read again on the same page id with the image the session already has -
 * no second page, no re-snap; a hint is asked again for the same item and the same question; a practice set is
 * written again on the same topic; a worked lesson (kind teach) is asked again for the same topic - the lesson pick (kind lesson) holds no input and is not asked again here. The run goes through the kind's own route, so it is the same job
 * (one at a time, a desk-worded failure, a late result dropped). The caller's role and its askId go with it, so a phone's
 * retry meets the same door as its first answer (lite r3: 409 without the open ask); the TV and an in-process retry are as before.
 */
import { NextResponse } from "next/server";
import { getSession, type JobKind } from "@/lib/session/store";
import { ROLE_HEADER } from "@/lib/session/pairing";
import { MOVED_ON, NOTHING, NOT_AGAIN } from "@/lib/desk/job";
import { POST as read } from "../../read/route";
import { POST as hint } from "../../hint/route";
import { POST as practice } from "../../practice/route";
import { POST as worked } from "../../worked/route";

export const dynamic = "force-dynamic";

const ROUTES: Partial<Record<JobKind, { path: string; post: (req: Request) => Promise<Response> }>> = {
  read: { path: "read", post: read },
  hint: { path: "hint", post: hint },
  practice: { path: "practice", post: practice },
  teach: { path: "worked", post: worked },
};

export async function POST(req: Request) {
  const { kind, askId } = ((await req.json().catch(() => null)) ?? {}) as { kind?: JobKind; askId?: unknown };
  const s = getSession();
  const job = kind ? s.jobs?.[kind] : undefined;
  const route = kind ? ROUTES[kind] : undefined;
  if (!kind || !job || !route || job.phase !== "failed" || !job.input) return NextResponse.json({ error: NOTHING }, { status: 409 });
  // a ceiling, a refusal, a desk refusal or an unreadable learner file meets the same input the same way (failure.ts)
  if (job.retry === false) return NextResponse.json({ error: NOT_AGAIN, failure: job.failure }, { status: 409 });
  // a failed run of the learner who left is not the seated one's to ask again (a session restored from disk)
  if (job.by !== undefined && job.by !== s.learner?.id) return NextResponse.json({ error: MOVED_ON }, { status: 409 });
  // a hint is for the item it was asked about: if the page under it has changed, there is nothing to ask again
  if (kind === "hint") {
    const item = s.pages[s.pageIx]?.items[Number(job.input.itemIx)];
    if (!item || item.key !== job.key) return NextResponse.json({ error: MOVED_ON }, { status: 409 });
  }
  const role = req.headers.get(ROLE_HEADER);
  return route.post(new Request(new URL(`/api/${route.path}`, req.url), {
    method: "POST", headers: { "Content-Type": "application/json", ...(role ? { [ROLE_HEADER]: role } : {}) },
    body: JSON.stringify(typeof askId === "string" ? { ...job.input, askId } : job.input),
  }));
}
