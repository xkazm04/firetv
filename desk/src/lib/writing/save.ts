/**
 * A finished episode lands on the seated learner's record with the existing learners.ts functions only: one history
 * line (kind 'writing') and one writing attempt (recordWriting). The lens is Language, whose fault code counts
 * itself (a sentence over LONG_SENTENCE_WORDS), so no model verdict moves the record.
 */
import { LONG_SENTENCE_WORDS, splitSentences } from "@/lib/rules/essay";
import { addHistory, recordWriting } from "@/lib/session/learners";
import { promptById } from "./prompts";
import type { Episode } from "./episode";

export const WRITING_LENS = "language";

export function saveEpisode(learnerId: string, ep: Episode): { ok: true; detail: string } | { ok: false; error: string } {
  if (ep.stage !== "finished" || !ep.revision || !ep.finishedAt) return { ok: false, error: "Only a finished episode is saved." };
  const p = promptById(ep.promptId);
  if (!p) return { ok: false, error: "The desk does not know that prompt." };
  const ss = splitSentences(ep.revision);
  const faulty = ss.filter((s) => s.words > LONG_SENTENCE_WORDS).length;
  const detail = `${ss.length} sentences, coached and revised once`;
  try {
    addHistory(learnerId, { at: ep.finishedAt, kind: "writing", label: p.title, detail });
    recordWriting(learnerId, WRITING_LENS, ss.length, faulty);
  } catch {
    return { ok: false, error: "The desk could not write to the learner file, so this was not saved." };
  }
  return { ok: true, detail };
}
