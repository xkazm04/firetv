package dev.telestrator.tv.transport

import io.ktor.websocket.CloseReason
import io.ktor.websocket.DefaultWebSocketSession
import io.ktor.websocket.close
import io.ktor.websocket.Frame
import io.ktor.websocket.readText
import io.ktor.websocket.send
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.channels.ClosedReceiveChannelException
import kotlinx.coroutines.CancellationException

/**
 * One connected pen, whatever carried it here.
 *
 * Deliberately carries raw text rather than typed messages: decoding, pairing and the whole
 * conversation live in [dev.telestrator.tv.PenSessionHost], so a new transport is a small dumb
 * class and nothing about the protocol has to be reimplemented alongside it.
 */
interface PenChannel {
    val remoteName: String
    suspend fun send(text: String)

    /** Suspends until the pen goes away, invoking [onMessage] for each text frame. */
    suspend fun receiveLoop(onMessage: suspend (String) -> Unit)

    /** Hangs up on a pen that will not be served, e.g. one that failed pairing. */
    suspend fun close(reason: String)
}

/**
 * How pens reach the TV.
 *
 * Two shapes exist, and the difference is the whole reason this interface is here:
 *
 * - [LanTransport] **listens**. The TV binds a port and the phone connects in. Lowest latency, no
 *   backend, and the reason the TV serves the companion page itself (same origin, so `ws://` is
 *   allowed).
 * - [RelayTransport] **dials out**. The TV opens one outbound connection to a relay and the phone
 *   meets it there. Slower, needs a backend — and it is the only shape available if the platform
 *   will not let an app listen on a port.
 *
 * The design doc wanted the relay as a hostile-Wi-Fi fallback (D3). Amazon's move of the Fire TV
 * Stick line to Vega OS, where app-level listening sockets are undocumented and probably absent,
 * turns it into a portability hedge as well. See docs/PLATFORM-RISK.md.
 */
interface PenTransport {
    /** Short name for logs, the on-screen status line and /health. */
    val name: String

    /** Where the viewer should point their phone, or null while it is still being established. */
    fun pairingUrl(): String?

    /** Begins accepting pens. [onPen] runs for the lifetime of each connection. */
    fun start(scope: CoroutineScope, onPen: suspend (PenChannel) -> Unit)

    fun stop()
}

/**
 * Adapts a Ktor WebSocket session to [PenChannel]. Server and client sessions both derive from
 * [DefaultWebSocketSession], so listening and dialling share this one adapter.
 */
class KtorPenChannel(
    private val session: DefaultWebSocketSession,
    override val remoteName: String,
) : PenChannel {

    override suspend fun send(text: String) = session.send(text)

    override suspend fun close(reason: String) {
        runCatching { session.close(CloseReason(CloseReason.Codes.VIOLATED_POLICY, reason)) }
    }

    override suspend fun receiveLoop(onMessage: suspend (String) -> Unit) {
        try {
            for (frame in session.incoming) {
                if (frame is Frame.Text) onMessage(frame.readText())
            }
        } catch (_: ClosedReceiveChannelException) {
            // Phone walked out of Wi-Fi range, closed the tab, or the relay dropped us.
        }
    }
}
