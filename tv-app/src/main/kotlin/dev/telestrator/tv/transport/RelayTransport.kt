package dev.telestrator.tv.transport

import android.util.Log
import io.ktor.client.HttpClient
import io.ktor.client.engine.cio.CIO
import io.ktor.client.plugins.websocket.WebSockets
import io.ktor.client.plugins.websocket.webSocket
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
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

    private val _failure = MutableStateFlow<String?>(null)

    /**
     * Set once [FAILED_DIALS] dials in a row never reached the relay, cleared by the next one that
     * does. Until then the QR points at a relay this TV cannot reach, and the card must not present
     * it as an invitation; one failed dial is a blink, not news.
     */
    override val failure: StateFlow<String?> = _failure

    override fun pairingUrl(): String = phoneUrl

    override fun start(scope: CoroutineScope, onPen: suspend (PenChannel) -> Unit) {
        job = scope.launch {
            var backoffMs = INITIAL_BACKOFF_MS
            var failedDials = 0
            while (isActive) {
                val connectedAt = System.currentTimeMillis()
                var reached = false
                runCatching {
                    Log.i(TAG, "dialling $relayWsUrl")
                    client.webSocket(relayWsUrl) {
                        reached = true
                        failedDials = 0
                        _failure.value = null
                        Log.i(TAG, "relay connected")
                        // One outbound socket carries one pen at a time, but it is not a pen: it
                        // exists before any phone and outlives each one, so its conversation is
                        // shared (no hello deadline, every hello a pairing). Multi-pen would need
                        // the relay to fan in, which is a relay concern, not a TV one.
                        onPen(KtorPenChannel(this, "relay", carriesOnePen = false))
                    }
                }.onFailure { Log.w(TAG, "relay connection failed: ${it.message}") }

                if (!isActive) break
                if (!reached && ++failedDials >= FAILED_DIALS) {
                    _failure.value = UNREACHABLE
                    Log.w(TAG, "relay unreachable after $failedDials dials")
                }
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

        /** About 3.5 s of dialling at the backoff above: past a Wi-Fi blink, well before a viewer gives up. */
        const val FAILED_DIALS = 3
        const val UNREACHABLE = "The pen relay cannot be reached. Still trying."
    }
}
