package dev.deathride.link

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.net.URI
import java.net.http.HttpClient
import java.net.http.WebSocket
import java.util.concurrent.CompletionStage
import java.util.concurrent.LinkedBlockingQueue
import java.util.concurrent.TimeUnit

/** Any page a phone loads can open ws://<tv>/ws through that phone's browser. Only the controller's own page (and clients that send no
 *  Origin, which are not browsers) may reach the pairing check; a foreign page holding the right PIN still takes no seat. */
class ForeignOriginTest {
    private class Listener: WebSocket.Listener {
        val messages=LinkedBlockingQueue<String>()
        override fun onOpen(ws: WebSocket) { ws.request(1) }
        override fun onText(ws: WebSocket,data: CharSequence,last: Boolean): CompletionStage<*>? { messages.offer(data.toString()); ws.request(1); return null }
        override fun onClose(ws: WebSocket,statusCode: Int,reason: String): CompletionStage<*>? { messages.offer("closed:$statusCode"); return null }
    }
    private fun hello(port: Int,origin: String?,pin: String): String {
        val l=Listener();val builder=HttpClient.newHttpClient().newWebSocketBuilder()
        if(origin!=null)builder.header("Origin",origin)
        val ws=builder.buildAsync(URI("ws://127.0.0.1:$port/ws"),l).join()
        runCatching { ws.sendText("""{"t":"hello","pin":"$pin"}""",true).join() }
        val first=l.messages.poll(3,TimeUnit.SECONDS)?:"silent"
        ws.abort();return first
    }
    @Test fun foreignPageWithTheRightPinTakesNoSeat() {
        val port=java.net.ServerSocket(0).use{it.localPort}
        val host=RaceServer({"{}"},{},port=port)
        try {
            host.start();repeat(500){ if(!host.running)Thread.sleep(20) };assertTrue(host.running)
            val foreign=hello(port,"http://evil.example",host.pin)
            assertTrue(foreign.startsWith("closed:1008"),"foreign origin: $foreign");assertFalse(host.slots.any{it.claimed},"no seat for a foreign page")
            assertTrue(hello(port,"http://127.0.0.1:$port",host.pin).contains("\"welcome\""),"the controller's own origin pairs")
            assertTrue(hello(port,null,host.pin).contains("\"welcome\""),"a client without Origin pairs")
        } finally { host.stop() }
    }
}
