package dev.telestrator.tv.transport

import io.ktor.client.HttpClient
import io.ktor.client.plugins.websocket.WebSockets as ClientWebSockets
import io.ktor.client.plugins.websocket.webSocket
import io.ktor.server.engine.embeddedServer
import io.ktor.websocket.CloseReason
import io.ktor.websocket.send
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withTimeoutOrNull
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Timeout
import java.net.ServerSocket
import java.util.Collections
import io.ktor.client.engine.cio.CIO as ClientCIO
import io.ktor.server.cio.CIO as ServerCIO

/**
 * The pen socket is open to every device on the Wi-Fi before any PIN is checked, and a text frame is
 * read whole into memory before the pairing desk ever sees it. A phone's messages are a few hundred
 * bytes (a 16 ms batch of points, a hello, a tag), so one frame of megabytes is not a pen: it is a
 * neighbour asking a Fire TV Stick for its heap. The server must refuse it at the frame, unread.
 */
@Timeout(value = 30, threadMode = Timeout.ThreadMode.SEPARATE_THREAD)
class PenFrameLimitTest {

    private val port = ServerSocket(0).use { it.localPort }
    private val received = Collections.synchronizedList(mutableListOf<Int>())
    private val server = embeddedServer(ServerCIO, port = port, host = "127.0.0.1") {
        penServer(html = "<html></html>", healthJson = { "{}" }) { channel ->
            channel.receiveLoop { text -> received += text.length }
        }
    }.start(wait = false)
    private val client = HttpClient(ClientCIO) { install(ClientWebSockets) }

    @AfterEach
    fun tearDown() {
        client.close()
        server.stop(0, 0)
    }

    /** Sends one text frame of [size] chars and returns how the server closed the socket, if it did. */
    private fun sendFrame(size: Int): CloseReason? = runBlocking {
        var reason: CloseReason? = null
        // The client's own close can wait on a peer that already hung up; the verdict is taken by then.
        withTimeoutOrNull(6_000) {
            client.webSocket("ws://127.0.0.1:$port/ws") {
                send("x".repeat(size))
                reason = withTimeoutOrNull(3_000) { closeReason.await() }
            }
        }
        reason
    }

    @Test
    fun `a pen-sized frame is read`() {
        sendFrame(2_000)
        assertEquals(listOf(2_000), received.toList())
    }

    @Test
    fun `a frame of a megabyte is refused before anything reads it`() {
        val reason = sendFrame(1 shl 20)
        assertEquals(emptyList<Int>(), received.toList(), "the server read a 1 MiB frame")
        // The server drops the connection mid-frame; the client, still writing, sees no close frame.
        assertNotNull(reason, "the connection stayed open after a 1 MiB frame")
    }
}
