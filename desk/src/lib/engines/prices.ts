/**
 * The price book: what one call costs the operator, declared per provider. A row of the usage ledger (meter.ts)
 * takes its marginalUsd and basis from here; the CLI's own total_cost_usd is recorded beside it, verbatim, as the
 * notional cost.
 *
 * - subscription: the call spends the operator's plan usage limit, not money per call; the marginal cost is 0.
 * - local: a model on this computer; the marginal cost is 0.
 * - unpriced: no rate has been declared; the marginal cost is null, never 0.
 *
 * A provider resolves by exact name, the part of the reported string before "/" (claude-cli/haiku is claude-cli).
 */
export type PriceBasis = "subscription" | "local" | "unpriced";
export interface PriceEntry { basis: PriceBasis; marginalUsd: number | null; note: string; }

export const PRICE_BOOK: { asOf: string; providers: Record<string, PriceEntry> } = {
  asOf: "2026-10-10",
  providers: {
    "claude-cli": { basis: "subscription", marginalUsd: 0, note: "Each call spends the operator's subscription usage limit; the notional API cost is the CLI's own total_cost_usd, recorded verbatim." },
    "ollama": { basis: "local", marginalUsd: 0, note: "A local model on this computer." },
    "codex": { basis: "unpriced", marginalUsd: null, note: "No rate declared." },
    "piper": { basis: "unpriced", marginalUsd: null, note: "No rate declared." },
    "elevenlabs": { basis: "unpriced", marginalUsd: null, note: "No rate declared." },
    "gravitone": { basis: "unpriced", marginalUsd: null, note: "No rate declared." },
  },
};

/** The book's entry for a reported provider string, or an unpriced one when the name is not in the book. */
export function priceOf(reported: string): { basis: PriceBasis; marginalUsd: number | null } {
  const name = String(reported).split("/")[0];
  const e = Object.prototype.hasOwnProperty.call(PRICE_BOOK.providers, name) ? PRICE_BOOK.providers[name] : undefined;
  return e ? { basis: e.basis, marginalUsd: e.marginalUsd } : { basis: "unpriced", marginalUsd: null };
}
