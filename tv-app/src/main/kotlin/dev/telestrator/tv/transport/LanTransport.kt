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
import kotlinx.coroutines.CoroutineExceptionHandler
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import java.net.BindException
import java.net.Inet4Address
import java.net.InetSocketAddress
import java.net.ServerSocket
import java.net.NetworkInterface

private const val TAG = "LanTransport"

/** Long enough to outlast a previous process letting go of the port, short enough not to stall. */
private const val BIND_ATTEMPTS = 10
private const val BIND_RETRY_MS = 300L

/** Can this process bind [port] right now? Asked by actually binding it, which is the only honest test. */
private fun portIsFree(port: Int): Boolean = runCatching {
    ServerSocket().use {
        it.reuseAddress = false
        it.bind(InetSocketAddress(port))
    }
    true
}.getOrDefault(false)

/** A BindException can arrive wrapped, so judge the whole cause chain rather than the top. */
private fun Throwable.isBindFailure(): Boolean =
    generateSequence(this) { it.cause }.take(8).any { it is BindException }

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

    private val _failure = MutableStateFlow<String?>(null)
    override val failure: StateFlow<String?> = _failure

    override fun pairingUrl(): String = "http://${lanAddress()}:$port/?pin=$pin"

    override fun start(scope: CoroutineScope, onPen: suspend (PenChannel) -> Unit) {
        val html = context.assets.open("companion/index.html").use { it.readBytes().decodeToString() }

        // Binding is allowed to fail, and until now that took the whole app down with it: the
        // BindException escaped into the activity's scope and Fire OS reported it as "Unable to
        // start activity". The usual cause is our own previous process still holding the port -
        // a relaunch during development, or Fire OS restarting the activity faster than the old
        // socket finishes closing - which a short retry clears. Anything it does not clear is
        // now a message on the pairing card instead of a dead app.
        // Ktor binds inside its own accept coroutine, so a BindException does not come back out
        // of start() - it reaches the thread's uncaught handler and kills the process. Owning the
        // engine's parent context is what makes that failure ours to handle.
        val engineFailures = CoroutineExceptionHandler { _, e ->
            if (e.isBindFailure()) Log.w(TAG, "port $port busy") else Log.e(TAG, "pen server failed", e)
            _failure.value = e.message ?: e.toString()
        }

        scope.launch(Dispatchers.IO) {
            repeat(BIND_ATTEMPTS) { attempt ->
                // Ask the OS directly first. Ktor reports a busy port asynchronously and only
                // after building an engine, which makes "is this port free" needlessly hard to
                // answer; a plain bind answers it exactly, and losing the race afterwards is
                // still caught by the handler above.
                if (!portIsFree(port)) {
                    Log.w(TAG, "port $port busy, retrying (${attempt + 1}/$BIND_ATTEMPTS)")
                    delay(BIND_RETRY_MS)
                    return@repeat
                }

                val engine = embeddedServer(
                    CIO,
                    port = port,
                    host = "0.0.0.0",
                    parentCoroutineContext = engineFailures,
                ) {
                    install(WebSockets)
                    routing {
                        get("/") { call.respondText(html, ContentType.Text.Html) }
                        get("/health") { call.respondText(healthJson(), ContentType.Application.Json) }
                        webSocket("/ws") { onPen(KtorPenChannel(this, "lan:${call.request.local.remoteHost}")) }
                    }
                }
                val started = runCatching { engine.start(wait = false) }
                if (started.isSuccess) {
                    server = engine
                    _failure.value = null
                    Log.i(TAG, "listening on ${pairingUrl()}")
                    return@launch
                }
                runCatching { engine.stop(0, 0) }

                val cause = started.exceptionOrNull()
                if (cause?.isBindFailure() != true) {
                    Log.e(TAG, "pen server failed to start", cause)
                    _failure.value = cause?.message ?: "pen server failed to start"
                    return@launch
                }
                Log.w(TAG, "port $port busy, retrying (${attempt + 1}/$BIND_ATTEMPTS)")
                delay(BIND_RETRY_MS)
            }
            _failure.value = "port $port is in use by something else"
            Log.e(TAG, "giving up: port $port is already in use")
        }
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
