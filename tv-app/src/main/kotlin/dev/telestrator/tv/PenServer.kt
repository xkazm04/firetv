package dev.telestrator.tv

import android.content.Context
import android.util.Log
import dev.telestrator.core.PenMessage
import dev.telestrator.core.TvMessage
import dev.telestrator.core.decodePenMessage
import dev.telestrator.core.encode
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
import io.ktor.websocket.CloseReason
import io.ktor.websocket.Frame
import io.ktor.websocket.close
import io.ktor.websocket.readText
import io.ktor.websocket.send
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.channels.ClosedReceiveChannelException
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeoutOrNull
import java.net.Inet4Address
import java.net.NetworkInterface
import java.util.concurrent.atomic.AtomicLong

private const val TAG = "PenServer"

/**
 * Serves the phone companion over plain http on the LAN and accepts pen input over ws on the same
 * origin. Same-origin is not a nicety: a page served over https cannot open a ws:// socket, which
 * is exactly why the TV hosts the page itself (design doc 3.5).
 */
class PenServer(
    private val context: Context,
    private val session: Session,
    private val thumbnails: Thumbnailer? = null,
    val port: Int = 8765,
) {
    private var server: io.ktor.server.engine.ApplicationEngine? = null

    /** Bumped whenever a new pen pairs. An older pen seeing a newer generation stands down. */
    private val generation = AtomicLong(0)

    fun start() {
        val html = context.assets.open("companion/index.html").use { it.readBytes().decodeToString() }

        server = embeddedServer(CIO, port = port, host = "0.0.0.0") {
            install(WebSockets)

            routing {
                get("/") { call.respondText(html, ContentType.Text.Html) }
                get("/health") { call.respondText(health(), ContentType.Application.Json) }
                webSocket("/ws") { handlePen() }
            }
        }.also { it.start(wait = false) }

        Log.i(TAG, "listening on http://${lanAddress()}:$port/ pin=${session.pin}")
    }

    private fun health(): String {
        val r = RenderStats.snapshot()
        return """{"ok":true,"pin":"${session.pin}","annotations":${session.annotationCount()},""" +
            """"t":${session.mediaTimeMs},"durationMs":${session.durationMs},""" +
            """"paused":${session.paused},"rate":${session.rate},"pens":${session.connectedPens},""" +
            """"canUndo":${session.canUndo()},"canRedo":${session.canRedo()},""" +
            """"renderP50Ms":${"%.3f".format(r.p50Ms)},"renderP95Ms":${"%.3f".format(r.p95Ms)},""" +
            """"renderMaxMs":${"%.3f".format(r.maxMs)},"renderFrames":${r.frames}}"""
    }

    private suspend fun io.ktor.server.websocket.DefaultWebSocketServerSession.handlePen() {
        // Pair before doing anything else. A phone that cannot show the PIN from the TV screen has
        // no business drawing on it.
        val hello = withTimeoutOrNull(HELLO_TIMEOUT_MS) {
            for (frame in incoming) {
                if (frame !is Frame.Text) continue
                val msg = runCatching { decodePenMessage(frame.readText()) }.getOrNull()
                if (msg is PenMessage.Hello) return@withTimeoutOrNull msg
            }
            null
        }

        if (hello == null || hello.pin != session.pin) {
            val reason = if (hello == null) "no pairing message" else "wrong PIN"
            Log.i(TAG, "pen rejected: $reason")
            send((TvMessage.Welcome("", session.doc.value.videoAspect, false, reason) as TvMessage).encode())
            close(CloseReason(CloseReason.Codes.VIOLATED_POLICY, reason))
            return
        }

        // Newest pen wins rather than being locked out: a phone that dropped off Wi-Fi and came
        // back should just work, and the alternative strands the viewer with a dead pen.
        val myGeneration = generation.incrementAndGet()
        session.penConnected()
        Log.i(TAG, "pen ${hello.clientId} paired (generation $myGeneration)")

        send(
            (TvMessage.Welcome(
                sessionId = "s-$myGeneration",
                videoAspect = session.doc.value.videoAspect,
                accepted = true,
            ) as TvMessage).encode()
        )

        val ticker = launch { pushState(myGeneration) }
        try {
            for (frame in incoming) {
                if (generation.get() != myGeneration) break
                if (frame !is Frame.Text) continue
                val text = frame.readText()
                runCatching { decodePenMessage(text) }
                    .onSuccess { msg ->
                        // Answer the probe on the receive path, before any work, so the number
                        // reflects transport plus decode, not the render.
                        if (msg is PenMessage.Ping) {
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
            session.penDisconnected()
            Log.i(TAG, "pen ${hello.clientId} disconnected")
        }
    }

    /** Heartbeat so the phone can mirror the playhead, the undo state and the paused frame. */
    private suspend fun io.ktor.server.websocket.DefaultWebSocketServerSession.pushState(myGeneration: Long) {
        var lastThumbKey = Long.MIN_VALUE
        var lastDoc: dev.telestrator.core.AnnotationDoc? = null
        while (isActive && generation.get() == myGeneration) {
            // Mirror the document only while paused, and only when it actually changed. During
            // playback nothing on the phone needs it, and during a gesture the phone is already
            // drawing its own ink locally - shipping the growing stroke back would just compete
            // with the pen traffic on the same socket.
            val current = session.doc.value
            if (session.paused && current !== lastDoc) {
                lastDoc = current
                send((TvMessage.Doc(session.revision.toLong(), current) as TvMessage).encode())
            }
            if (!session.paused) lastDoc = null
            // Only while paused, and only once per frame the viewer stops on: a thumbnail is
            // orders of magnitude bigger than a state message and shares the pen's socket.
            val thumbKey = if (session.paused) session.mediaTimeMs / THUMB_BUCKET_MS else Long.MIN_VALUE
            val thumbnail = if (session.paused && thumbKey != lastThumbKey) {
                lastThumbKey = thumbKey
                withContext(Dispatchers.IO) { thumbnails?.dataUrlAt(session.mediaTimeMs) }
            } else {
                null
            }
            if (!session.paused) lastThumbKey = Long.MIN_VALUE

            send(
                (TvMessage.State(
                    t = session.mediaTimeMs,
                    paused = session.paused,
                    rate = session.rate,
                    annotationCount = session.annotationCount(),
                    canUndo = session.canUndo(),
                    canRedo = session.canRedo(),
                    durationMs = session.durationMs,
                    thumbnail = thumbnail,
                ) as TvMessage).encode()
            )
            delay(STATE_INTERVAL_MS)
        }
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

    private companion object {
        const val HELLO_TIMEOUT_MS = 5_000L
        const val STATE_INTERVAL_MS = 400L
        const val THUMB_BUCKET_MS = 200L
    }
}
