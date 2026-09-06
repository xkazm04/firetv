package dev.telestrator.tv.transport

import android.util.Log
import io.ktor.client.HttpClient
import io.ktor.client.engine.cio.CIO
import io.ktor.client.plugins.websocket.WebSockets
import io.ktor.client.plugins.websocket.webSocket
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

private const val TAG = "RelayTransport"

/**
 * The TV dials out; the phone meets it at the relay.
 *
 * Strictly worse than [LanTransport] on latency — every point takes two network hops instead of
 * one — and it needs a backend. It exists for two reasons:
 *
 *  1. Hostile Wi-Fi. Guest networks and hotel APs routinely isolate clients from each other, and
 *     when they do, no amount of LAN engineering will get a phone to a TV (design doc D3).
 *  2. Portability. Amazon's Fire TV Stick line is moving to Vega OS, where an app's ability to
 *     open a listening socket is undocumented and probably absent. An outbound connection is the
 *     one shape that is certain to survive that port (docs/PLATFORM-RISK.md).
 *
 * The relay is dumb: it pairs one TV with one phone by session id and forwards frames. All the
 * meaning stays on the TV, so the PIN check and the annotation state never leave the device.
 */
class RelayTransport(
    /** e.g. `wss://relay.example/tv?session=abc` — the pen side meets it at `/?session=abc`. */
    private val relayWsUrl: String,
    /** Where to send the phone. Served by the relay or a CDN, not by the TV. */
    private val phoneUrl: String,
) : PenTransport {

    override val name = "relay"

    private val client = HttpClient(CIO) { install(WebSockets) }
    private var job: Job? = null

    override fun pairingUrl(): String = phoneUrl

    override fun start(scope: CoroutineScope, onPen: suspend (PenChannel) -> Unit) {
        job = scope.launch {
            var backoffMs = INITIAL_BACKOFF_MS
            while (isActive) {
                val connectedAt = System.currentTimeMillis()
                runCatching {
                    Log.i(TAG, "dialling $relayWsUrl")
                    client.webSocket(relayWsUrl) {
                        Log.i(TAG, "relay connected")
                        // One outbound socket carries one pen at a time. Multi-pen would need the
                        // relay to fan in, which is a relay concern, not a TV one.
                        onPen(KtorPenChannel(this, "relay"))
                    }
                }.onFailure { Log.w(TAG, "relay connection failed: ${it.message}") }

                if (!isActive) break
                // A connection that lasted a while was healthy; reset the backoff so a transient
                // drop reconnects promptly instead of inheriting an earlier failure's penalty.
                backoffMs = if (System.currentTimeMillis() - connectedAt > HEALTHY_MS) {
                    INITIAL_BACKOFF_MS
                } else {
                    (backoffMs * 2).coerceAtMost(MAX_BACKOFF_MS)
                }
                Log.i(TAG, "reconnecting in ${backoffMs}ms")
                delay(backoffMs)
            }
        }
    }

    override fun stop() {
        job?.cancel()
        job = null
        runCatching { client.close() }
    }

    private companion object {
        const val INITIAL_BACKOFF_MS = 500L
        const val MAX_BACKOFF_MS = 10_000L
        const val HEALTHY_MS = 10_000L
    }
}
