package dev.telestrator.core

/** What happened to the link between the TV and the pen, as the shell reports it. */
sealed interface LinkEvent {
    /** The transport knows where a phone should point (and the PIN the viewer will need). */
    data class Ready(val url: String, val pin: String) : LinkEvent

    /** The transport gave up starting; the message is something a viewer can act on. */
    data class Failed(val message: String) : LinkEvent

    data class PenPaired(val clientId: String) : LinkEvent
    data class PenGone(val clientId: String) : LinkEvent
    data class PenRefused(val reason: String) : LinkEvent

    /** The viewer asked for the card back (Menu on the remote). */
    data object Peek : LinkEvent
}

/** What the corner of the picture should show. */
sealed interface LinkView {
    data object Connecting : LinkView
    data class Invite(val url: String, val pin: String) : LinkView
    data object Chip : LinkView
    data class Lost(val url: String, val pin: String) : LinkView
    data class Refused(val reason: String, val pin: String) : LinkView
    data class Failed(val message: String) : LinkView
}

/**
 * Whether a pen is holding the link, as a sans-IO reducer: events and a clock in, the view of the
 * corner out. The shell reports what happened ([LinkEvent]) and draws what [view] says; when the
 * card is on screen, and why, is decided here and JVM-tested on a clock the test passes in.
 *
 * Immutable: [on] returns the next state, so the shell can keep one in a state flow.
 */
data class LinkState(
    private val url: String? = null,
    private val pin: String? = null,
    private val failure: String? = null,
    /** The pen that holds the link now; a close from any other pen is a superseded one. */
    private val current: String? = null,
    /** When the current pen left, until a pen pairs again. */
    private val goneAtMs: Long? = null,
    private val refusal: String? = null,
    private val refusedAtMs: Long = 0,
    private val peekedAtMs: Long? = null,
) {
    fun on(event: LinkEvent, atMs: Long): LinkState = when (event) {
        is LinkEvent.Ready -> copy(url = event.url, pin = event.pin, failure = null)
        is LinkEvent.Failed -> copy(failure = event.message)
        is LinkEvent.PenPaired -> copy(current = event.clientId, goneAtMs = null)
        is LinkEvent.PenGone ->
            if (event.clientId == current) copy(current = null, goneAtMs = atMs) else this
        // A neighbour's wrong guess must not cover the picture of the person drawing.
        is LinkEvent.PenRefused ->
            if (current != null) this else copy(refusal = event.reason, refusedAtMs = atMs)
        LinkEvent.Peek -> copy(peekedAtMs = atMs)
    }

    fun view(nowMs: Long): LinkView {
        failure?.let { return LinkView.Failed(it) }
        val url = url ?: return LinkView.Connecting
        val pin = pin.orEmpty()
        if (refusal != null && nowMs in refusedAtMs until refusedAtMs + REFUSED_MS) return LinkView.Refused(refusal, pin)
        if (peekedAtMs != null && nowMs in peekedAtMs until peekedAtMs + PEEK_MS) return LinkView.Invite(url, pin)
        if (current != null) return LinkView.Chip
        val gone = goneAtMs ?: return LinkView.Invite(url, pin)
        // A Wi-Fi blink must not flash a QR over the play.
        return if (nowMs - gone < LOST_GRACE_MS) LinkView.Chip else LinkView.Lost(url, pin)
    }

    companion object {
        /** How long a pen may be gone before the card comes back with 'Pen lost'. */
        const val LOST_GRACE_MS = 3_000L

        /** How long a refusal is shown to a TV with no pen. */
        const val REFUSED_MS = 5_000L

        /** How long Menu keeps the card (and the status line) up. */
        const val PEEK_MS = 8_000L
    }
}
