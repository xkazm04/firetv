/**
 * "Phrases you own" on the printable learning map (L1): each phrase the learner has latched "yours" (review.ts
 * yoursOf), with their own words from the two uses that earned it and the scenes they were said in. The quotes are
 * the record's, checked in code before they reach here (own.ts ownedPhrases); nothing is said about the learner that
 * is not one of them. No count and no date: the list is the progress. Nothing at all while none is owned.
 */
import type { OwnedPhrase } from "@/lib/english/own";

export function PhrasesYouOwn({ owned }: { owned: OwnedPhrase[] }) {
  if (!owned.length) return null;
  return <section className="linga-owned" data-role="linga-owned">
    <h2>Phrases you own</h2>
    <p>Each one Linga taught you, and you then used on your own, without help, in two different scenes on two different days.</p>
    <table><thead><tr><th>Phrase</th><th>In your own words</th></tr></thead><tbody>{owned.map(o => <tr key={o.id}>
      <td><b>{o.better}</b><br/>Taught in {o.taughtIn}</td>
      <td>{o.uses.map(u => <span key={`${u.conversationId}:${u.at}`} data-role="linga-owned-quote">“{u.quote}” · {u.scene}<br/></span>)}</td>
    </tr>)}</tbody></table>
  </section>;
}
