package dev.deathride.link

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.net.URI
import java.net.http.HttpClient
import java.net.http.WebSocket
import java.util.Random
import java.util.concurrent.CompletionStage
import java.util.concurrent.atomic.AtomicLong

class HudPayloadTest {
    private fun fixed(v: Double,d: Int)=StringBuilder().appendFixed(v,d).toString()
    @Test fun fixedPointMatchesRoundedDecimalAndStaysValidJson() {
        assertEquals("0",fixed(0.0,3));assertEquals("0",fixed(-0.0004,3));assertEquals("0",fixed(Double.NaN,3));assertEquals("0",fixed(Double.POSITIVE_INFINITY,2))
        assertEquals("23.46",fixed(23.456789012345678,2));assertEquals("0.005",fixed(0.005,3));assertEquals("0.05",fixed(0.05,3));assertEquals("0.5",fixed(0.5,3));assertEquals("-1.25",fixed(-1.25,2));assertEquals("12",fixed(12.0004,3));assertEquals("1",fixed(0.9996,3))
        val r=Random(3)
        repeat(100000) {
            val v=(r.nextDouble()-.5)*(if(r.nextBoolean())100.0 else 3.0);val d=1+r.nextInt(3)
            val text=fixed(v,d)
            val expected=java.math.BigDecimal(v).setScale(d,java.math.RoundingMode.HALF_UP).stripTrailingZeros().let{if(it.signum()==0)"0" else it.toPlainString()}
            assertEquals(expected.toDouble(),text.toDouble(),1e-12,"$v/$d -> $text vs $expected")
            assertTrue(text.matches(Regex("-?(0|[1-9][0-9]*)(\\.[0-9]*[1-9])?")),text)
        }
    }
    @Test fun anIdleSnapshotIsHeartbeatOnlyAndAChangeIsSentAtOnce() {
        val port=java.net.ServerSocket(0).use{it.localPort};val host=RaceServer({"{}"},{},port=port)
        val count=AtomicLong();val texts=java.util.concurrent.LinkedBlockingQueue<String>()
        val listener=object: WebSocket.Listener {
            override fun onOpen(ws: WebSocket){ws.request(1)}
            override fun onText(ws: WebSocket,data: CharSequence,last: Boolean): CompletionStage<*>? { if(last){count.incrementAndGet();texts.offer(data.toString())};ws.request(1);return null }
        }
        try {
            host.start();repeat(500){if(!host.running)Thread.sleep(20)}
            val ws=HttpClient.newHttpClient().newWebSocketBuilder().buildAsync(URI("ws://127.0.0.1:$port/ws"),listener).join()
            ws.sendText("""{"t":"hello","pin":"${host.pin}","hudDelta":1}""",true).join()
            Thread.sleep(800);val idle0=count.get();Thread.sleep(3000);val idleMsgs=count.get()-idle0
            assertTrue(idleMsgs in 2..5,"idle huds in 3 s: $idleMsgs (heartbeat only)")
            texts.clear();host.slots[0].speed=12.3456;val deadline=System.nanoTime()+500_000_000L
            var seen=false;while(System.nanoTime()<deadline&&!seen){val t=texts.poll(50,java.util.concurrent.TimeUnit.MILLISECONDS)?:continue;seen=t.contains("\"speed\":12.35")}
            assertTrue(seen,"a changed value must be sent within a few ticks")
            ws.abort()
        } finally { host.stop() }
    }
}
