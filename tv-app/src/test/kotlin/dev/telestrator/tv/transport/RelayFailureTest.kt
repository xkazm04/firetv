package dev.telestrator.tv.transport

import io.ktor.server.application.install
import io.ktor.server.engine.embeddedServer
import io.ktor.server.routing.routing
import io.ktor.server.websocket.WebSockets
import io.ktor.server.websocket.webSocket
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withTimeoutOrNull
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test
import java.net.ServerSocket
import io.ktor.server.cio.CIO as ServerCIO

/**
 * The relay transport's QR points at the relay, so while the TV cannot reach the relay that QR is
 * an invitation to a meeting nobody will attend. The LAN transport says so on the card when it
 * cannot listen ([PenTransport.failure]); the relay must say so when it cannot dial, and stop saying
 * so once it has.
 */
class RelayFailureTest {

    private fun freePort(): Int = ServerSocket(0).use { it.localPort }

    private suspend fun <T> eventually(timeoutMs: Long, read: () -> T?): T? =
        withTimeoutOrNull(timeoutMs) {
            while (true) {
                read()?.let { return@withTimeoutOrNull it }
                delay(50)
            }
            @Suppress("UNREACHABLE_CODE") null
        }

    @Test
    fun `a relay that cannot be reached says so, and a relay that answers clears it`() = runBlocking {
        val port = freePort()
        val relay = RelayTransport(relayWsUrl = "ws://127.0.0.1:$port/tv", phoneUrl = "http://127.0.0.1:$port/#pin=123456")
        val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
        var pens = 0
        relay.start(scope) { channel -> pens++; channel.receiveLoop { } }
        try {
            // Nothing is listening: a few quick dials fail, and the card must hear about it.
            val failure = eventually(8_000) { relay.failure.value }
            assertNotNull(failure, "an unreachable relay left failure null")

            // The relay comes up: the next dial connects, and the failure goes away.
            val server = embeddedServer(ServerCIO, port = port) {
                install(WebSockets)
                routing { webSocket("/tv") { for (frame in incoming) Unit } }
            }.start(wait = false)
            try {
                val cleared = eventually(15_000) { if (relay.failure.value == null && pens > 0) true else null }
                assertEquals(true, cleared, "failure after the relay answered: ${relay.failure.value}")
            } finally {
                relay.stop()
                server.stop(0, 0)
            }
        } finally {
            scope.cancel()
        }
    }

    @Test
    fun `a relay that is not dialled yet has no failure`() {
        val relay = RelayTransport(relayWsUrl = "ws://127.0.0.1:1/tv", phoneUrl = "http://127.0.0.1:1/")
        assertNull(relay.failure.value)
        relay.stop()
    }
}
