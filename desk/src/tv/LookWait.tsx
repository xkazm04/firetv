"use client";
/**
 * A TV wait drawn in a module's own look (tv/look.ts says which): the module's root for its ground, one fixed line on it.
 * Used where the On Air shell used to be the fallback: before the session arrives, and while a page of Linga's or
 * Essay Master's is being read. It carries no answer and no learner text.
 */
import type { Look } from "@/tv/look";
import { MATHS_FONTS } from "@/maths/fonts";
import { ESSAY_FONTS } from "@/essay/fonts";

export function LookWait({ look, line }: { look: Look; line: string }) {
  const say = <div className="look-line">{line}</div>;
  const props = { role: "status", "aria-live": "polite", "data-role": "look-wait", "data-look": look } as const;
  if (look === "maths") return <div className={`maths-tv ${MATHS_FONTS} look-wait`} data-screen="tonight" data-lamp="desk" {...props}><div className="mb-lamp" aria-hidden="true"><i /></div>{say}</div>;
  if (look === "essay") return <div className={`essay-tv ${ESSAY_FONTS} look-wait`} {...props}>{say}</div>;
  if (look === "linga") return <div className="linga-tv look-wait" {...props}>{say}</div>;
  return <div className="look-wait" {...props}>{say}</div>;
}
