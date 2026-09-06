package dev.telestrator.tv

import android.content.Context
import android.util.Log
import dev.telestrator.core.TvMessage
import dev.telestrator.core.decodePenMessage
import dev.telestrator.core.encode
import io.ktor.server.application.call
import io.ktor.server.application.install
import io.ktor.server.cio.CIO
import io.ktor.server.engine.embeddedServer
import io.ktor.server.request.uri
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import io.ktor.websocket.Frame
import io.ktor.websocket.readText
import io.ktor.websocket.send
import io.ktor.server.websocket.WebSockets
import io.ktor.server.websocket.webSocket
import io.ktor.http.ContentType
import kotlinx.coroutines.channels.ClosedReceiveChannelException
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.net.Inet4Address
import java.net.NetworkInterface

private const val TAG = "PenServer"

/**
 * Serves the phone companion over plain http on the LAN and accepts pen input over ws on the same
 * origin. Same-origin is not a nicety: a page served over https cannot open a ws:// socket, which
 * is exactly why the TV hosts the page itself (design doc 3.5).
 */
class PenServer(
    private val context: Context,
    private val session: Session,
    val port: Int = 8765,
) {
    private var server: io.ktor.server.engine.ApplicationEngine? = null

    fun start() {
        val html = context.assets.open("companion/index.html").use { it.readBytes().decodeToString() }

        server = embeddedServer(CIO, port = port, host = "0.0.0.0") {
            install(WebSockets)

            routing {
                get("/") { call.respondText(html, ContentType.Text.Html) }
                get("/health") {
                    call.respondText(
                        """{"ok":true,"pin":"${session.pin}","annotations":${session.annotationCount()},"t":${session.mediaTimeMs},"paused":${session.paused},"pens":${session.connectedPens}}""",
                        ContentType.Application.Json,
                    )
                }

                webSocket("/ws") {
                    session.connectedPens++
                    Log.i(TAG, "pen connected: ${call.request.uri}")
                    send(
                        (TvMessage.Welcome(
                            sessionId = "s-${System.currentTimeMillis()}",
                            videoAspect = session.doc.value.videoAspect,
                            accepted = true,
                        ) as TvMessage).encode()
                    )

                    // Heartbeat so the phone can mirror playhead and annotation count.
                    val ticker = launch {
                        while (isActive) {
                            send(
                                (TvMessage.State(
                                    t = session.mediaTimeMs,
                                    paused = session.paused,
                                    rate = 1.0,
                                    annotationCount = session.annotationCount(),
                                ) as TvMessage).encode()
                            )
                            delay(500)
                        }
                    }

                    try {
                        for (frame in incoming) {
                            if (frame !is Frame.Text) continue
                            val text = frame.readText()
                            runCatching { decodePenMessage(text) }
                                .onSuccess { msg ->
                                    // Answer the probe on the receive path, before any work, so
                                    // the number reflects transport plus decode, not the render.
                                    if (msg is dev.telestrator.core.PenMessage.Ping) {
                                        send((TvMessage.Pong(msg.id) as TvMessage).encode())
                                    } else {
                                        session.accept(msg)
                                    }
                                }
                                .onFailure { Log.w(TAG, "bad message: $text", it) }
                        }
                    } catch (_: ClosedReceiveChannelException) {
                        // Phone walked out of Wi-Fi range or closed the tab; nothing to do.
                    } finally {
                        ticker.cancel()
                        session.connectedPens--
                        Log.i(TAG, "pen disconnected")
                    }
                }
            }
        }.also { it.start(wait = false) }

        Log.i(TAG, "listening on http://${lanAddress()}:$port/ pin=${session.pin}")
    }

    fun stop() {
        server?.stop(500, 1000)
        server = null
    }

    /** First non-loopback IPv4 address; what goes into the QR code. */
    fun lanAddress(): String =
        runCatching {
            NetworkInterface.getNetworkInterfaces().toList()
                .filter { it.isUp && !it.isLoopback }
                .flatMap { it.inetAddresses.toList() }
                .filterIsInstance<Inet4Address>()
                .firstOrNull { !it.isLoopbackAddress }
                ?.hostAddress
        }.getOrNull() ?: "127.0.0.1"
}
