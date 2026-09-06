package dev.telestrator.tv.transport

import android.content.Context
import android.util.Log
import io.ktor.http.ContentType
import io.ktor.server.application.call
import io.ktor.server.application.install
import io.ktor.server.cio.CIO
import io.ktor.server.engine.embeddedServer
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import io.ktor.server.websocket.WebSockets
import io.ktor.server.websocket.webSocket
import kotlinx.coroutines.CoroutineScope
import java.net.Inet4Address
import java.net.NetworkInterface

private const val TAG = "LanTransport"

/**
 * The TV listens; the phone connects in.
 *
 * The TV serves the companion page itself rather than pointing at a hosted copy, and that is not
 * a convenience: a page served over https cannot open a `ws://` socket, so same-origin plain http
 * from the TV is the only arrangement where a zero-install phone page can reach a LAN server
 * (design doc 3.5).
 */
class LanTransport(
    private val context: Context,
    private val pin: String,
    /** Rendered on demand so /health always reflects the live app, not a snapshot. */
    private val healthJson: () -> String,
    val port: Int = 8765,
) : PenTransport {

    override val name = "lan"

    private var server: io.ktor.server.engine.ApplicationEngine? = null

    override fun pairingUrl(): String = "http://${lanAddress()}:$port/?pin=$pin"

    override fun start(scope: CoroutineScope, onPen: suspend (PenChannel) -> Unit) {
        val html = context.assets.open("companion/index.html").use { it.readBytes().decodeToString() }

        server = embeddedServer(CIO, port = port, host = "0.0.0.0") {
            install(WebSockets)
            routing {
                get("/") { call.respondText(html, ContentType.Text.Html) }
                get("/health") { call.respondText(healthJson(), ContentType.Application.Json) }
                webSocket("/ws") { onPen(KtorPenChannel(this, "lan:${call.request.local.remoteHost}")) }
            }
        }.also { it.start(wait = false) }

        Log.i(TAG, "listening on ${pairingUrl()}")
    }

    override fun stop() {
        server?.stop(500, 1000)
        server = null
    }

    /** First non-loopback IPv4 address; what goes into the QR code. */
    private fun lanAddress(): String =
        runCatching {
            NetworkInterface.getNetworkInterfaces().toList()
                .filter { it.isUp && !it.isLoopback }
                .flatMap { it.inetAddresses.toList() }
                .filterIsInstance<Inet4Address>()
                .firstOrNull { !it.isLoopbackAddress }
                ?.hostAddress
        }.getOrNull() ?: "127.0.0.1"
}
