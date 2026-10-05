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

data class LinkState(val placeholder: Boolean = false) {
    fun on(event: LinkEvent, atMs: Long): LinkState = this
    fun view(nowMs: Long): LinkView = LinkView.Connecting
}
