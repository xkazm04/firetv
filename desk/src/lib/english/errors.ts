/** A refusal the learner can act on; the status says why (403 not allowed, 409 something changed). */
export class ConversationError extends Error { constructor(message: string, public status=400){super(message);} }
