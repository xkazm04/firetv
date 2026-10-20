/** The prompts a writing episode offers the seated learner, by their band. Reads only; no model. */
import { NextResponse } from "next/server";
import { getSession, NOBODY_AT_DESK } from "@/lib/session/store";
import { bandOf, learnerAge } from "@/lib/rules/voice";
import { promptsFor } from "@/lib/writing/prompts";

export const dynamic = "force-dynamic";

export function GET() {
  const s = getSession();
  if (!s.learner) return NextResponse.json({ error: NOBODY_AT_DESK }, { status: 409 });
  return NextResponse.json({ prompts: promptsFor(bandOf(learnerAge(s))).map(({ id, title, ask }) => ({ id, title, ask })) });
}
