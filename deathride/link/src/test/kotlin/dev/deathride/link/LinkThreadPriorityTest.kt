package dev.deathride.link

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.net.http.WebSocket
import java.util.concurrent.CompletionStage

/** Link threads sit below the render thread (the test thread stands in for it at NORM_PRIORITY). */
class LinkThreadPriorityTest {
    @Test fun linkThreadsRunBelowNormalPriority() {
        val port=java.net.ServerSocket(0).use{it.localPort}
        val host=RaceServer({"{}"},{},port=port)
        try {
            host.start();repeat(500){ if(!host.running)Thread.sleep(20) };assertTrue(host.running)
            val http=HttpClient.newHttpClient()
            val ws=http.newWebSocketBuilder().buildAsync(URI("ws://127.0.0.1:$port/ws"),object: WebSocket.Listener { override fun onText(w: WebSocket,d: CharSequence,l: Boolean): CompletionStage<*>? { w.request(1);return null } }).join()
            ws.request(1);ws.sendText("""{"t":"hello","pin":"${host.pin}"}""",true).join()
            http.send(HttpRequest.newBuilder(URI("http://127.0.0.1:$port/stats")).build(),HttpResponse.BodyHandlers.ofString());Thread.sleep(300)
            val link=Thread.getAllStackTraces().keys.filter{it.name.startsWith("deathride-link")}
            println("PRIORITY threads: "+Thread.getAllStackTraces().keys.joinToString{"${it.name}=${it.priority}"})
            assertTrue(link.isNotEmpty(),"link work must run on the link pool")
            assertTrue(link.all{it.priority<Thread.NORM_PRIORITY && it.isDaemon})
            ws.abort()
        } finally { host.stop() }
    }
}
