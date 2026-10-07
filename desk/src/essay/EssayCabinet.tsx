/**
 * Essay Master's collection (v2 R1): a specimen cabinet with a drawer per lens; a lens latched secure pins its
 * specimen (an arrow, Specimen's own mark, in citron). Empty drawers are outlined, never counted.
 */
import type { Session } from "@/lib/session/store";
import { ANALYSIS_TYPES } from "@/lib/rules/essay";
import { collectionOf } from "@/tv/collection";
import { CIT, EssayArrow as Arrow } from "@/tv/marks";

export function EssayCabinet({ s }: { s: Session }) {
  const pinned = new Set(collectionOf(s, "essay").map((c) => c.ref));
  if (!pinned.size) return null;
  return (
    <div className="em-cabinet" data-role="essay-collection">
      <div className="em-lbl">Specimens</div>
      <div className="em-drawers">
        {ANALYSIS_TYPES.map((t) => (
          <div key={t.id} className="em-drawer" data-pinned={pinned.has(t.id)} data-ref={t.id}>
            {pinned.has(t.id) ? <Arrow len={64} color={CIT} /> : <span className="em-drawer-empty" aria-hidden="true" />}
            <span className="em-lbl">{t.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
