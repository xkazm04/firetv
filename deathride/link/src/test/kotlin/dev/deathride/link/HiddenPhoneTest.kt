package dev.deathride.link

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.net.URI
import java.net.http.HttpClient
import java.net.http.WebSocket
import java.util.concurrent.CompletionStage
import java.util.concurrent.LinkedBlockingQueue
import java.util.concurrent.TimeUnit

/** A phone that reports {t:'vis',v:0} gets no hud frames until it reports visible, then resumes with a full snapshot. */
class HiddenPhoneTest {
    private class Listener: WebSocket.Listener {
        val messages=LinkedBlockingQueue<String>()
        override fun onOpen(ws: WebSocket) { ws.request(1) }
        override fun onText(ws: WebSocket,data: CharSequence,last: Boolean): CompletionStage<*>? { messages.offer(data.toString()); ws.request(1); return null }
    }
    private fun huds(l: Listener): List<String> { val out=ArrayList<String>();while(true){ val m=l.messages.poll()?:break;if(m.startsWith("{\"t\":\"hud\""))out.add(m) };return out }
    @Test fun hiddenPhoneReceivesNoHudAndResumesFull() {
        val port=java.net.ServerSocket(0).use{it.localPort}
        val host=RaceServer({"{}"},{},port=port)
        host.slots[0].garageJson="{\"offers\":[]}"
        try {
            host.start();repeat(500){ if(!host.running)Thread.sleep(20) };assertTrue(host.running)
            val l=Listener();val ws=HttpClient.newHttpClient().newWebSocketBuilder().buildAsync(URI("ws://127.0.0.1:$port/ws"),l).join()
            ws.sendText("""{"t":"hello","pin":"${host.pin}","hudDelta":1}""",true).join()
            Thread.sleep(600);assertTrue(huds(l).isNotEmpty(),"visible phone gets hud")
            ws.sendText("""{"t":"vis","v":0}""",true).join();Thread.sleep(300);huds(l)
            host.slots[0].speed=12.5;Thread.sleep(1500)
            assertEquals(0,huds(l).size,"hidden phone must receive 0 hud frames");assertTrue(host.slots[0].hidden)
            ws.sendText("""{"t":"vis","v":1}""",true).join();Thread.sleep(600)
            val resumed=huds(l);assertTrue(resumed.isNotEmpty(),"hud resumes");assertTrue(resumed.first().contains("\"garage\":"),"resumes with a full snapshot")
            assertFalse(host.slots[0].hidden)
            ws.abort()
        } finally { host.stop() }
    }
}
