package dev.deathride.link

import org.junit.jupiter.api.Assumptions.assumeTrue
import org.junit.jupiter.api.Test
import java.lang.management.ManagementFactory
import java.net.URI
import java.net.http.HttpClient
import java.net.http.WebSocket
import java.util.concurrent.CompletionStage
import java.util.concurrent.atomic.AtomicLong

/** Opt-in measurement (LINK_BENCH=1). Counts bytes allocated by the host's server threads, never the in-process client. */
class LinkBenchTest {
    private class Count: WebSocket.Listener {
        val messages=AtomicLong();val chars=AtomicLong();val acks=AtomicLong()
        override fun onOpen(ws: WebSocket){ws.request(1)}
        override fun onText(ws: WebSocket,data: CharSequence,last: Boolean): CompletionStage<*>? {
            if(last){messages.incrementAndGet()}; chars.addAndGet(data.length.toLong()); if(data.startsWith("{\"t\":\"ack\""))acks.incrementAndGet(); ws.request(1);return null
        }
    }
    private val mx=ManagementFactory.getThreadMXBean() as com.sun.management.ThreadMXBean
    private fun serverBytes(): Long {
        var sum=0L
        for(info in mx.getThreadInfo(mx.allThreadIds)) { info ?: continue
            val n=info.threadName
            if(n.startsWith("DefaultDispatcher")||n.startsWith("ktor")||n.startsWith("eventLoop")||n.contains("cio",true)) sum+=mx.getThreadAllocatedBytes(info.threadId)
        }
        return sum
    }
    @Test fun bench() {
        assumeTrue(System.getenv("LINK_BENCH")!=null)
        val port=java.net.ServerSocket(0).use{it.localPort};val host=RaceServer({"{}"},{},port=port)
        val s=host.slots[0]
        s.garageJson="{\"offers\":["+(0 until 40).joinToString(","){"{\"id\":\"part$it\",\"name\":\"Part $it\",\"description\":\"Adds grip and a longer description string here\",\"tier\":1,\"maxTier\":3,\"price\":120,\"available\":true,\"before\":[1,2,3,4,5],\"after\":[2,2,3,4,5]}"}+"]}"
        s.careerJson="{\"round\":3,\"story\":\""+"x".repeat(5000)+"\"}"
        // Real racing combat object (tools/bench/hud-fixture.json); LINK_BENCH_LEAN=1 sends the trimmed hud variant like RaceGame does.
        s.combatJson="""{"spectating":false,"ability":{"id":"plate-brace","name":"Plate Brace","phase":"READY","remainingSeconds":0,"cooldownSeconds":0,"energy":100,"energyCapacity":100,"energyCost":50,"ready":false,"available":true,"uses":0,"hits":0,"damage":0,"effectId":"abilities/plate-brace"},"armingSeconds":3.4166666666666665,"hp":100,"maxHp":100,"wrecked":false,"weapon":0,"weaponName":"Rivet","ammo":243,"mines":5,"heavyAmmo":8,"scatterAmmo":16,"cash":0,"sabotageTarget":-1,"cooldownSeconds":0,"mineCooldownSeconds":0,"damageEvents":0,"kills":0}"""
        if(System.getenv("LINK_BENCH_LEAN")!=null)s.combatHud="""{"spectating":false,"ability":{"id":"plate-brace","name":"Plate Brace","phase":"READY","cooldownSeconds":0,"energy":100,"energyCapacity":100,"energyCost":50,"ready":false,"available":true},"armingSeconds":3.4166666666666665,"hp":100,"maxHp":100,"wrecked":false,"weaponName":"Rivet","ammo":243,"mines":5,"heavyAmmo":8,"scatterAmmo":16,"cooldownSeconds":0,"mineCooldownSeconds":0,"damageEvents":0}"""
        s.speed=23.456789012345678;s.driftQuality=0.4567891234

        val client=HttpClient.newHttpClient()
        try {
            host.start(); repeat(500){ if(!host.running)Thread.sleep(20) }
            val l=Count();val ws=client.newWebSocketBuilder().buildAsync(URI("ws://127.0.0.1:$port/ws"),l).join()
            ws.sendText("""{"t":"hello","pin":"${host.pin}","hudDelta":1}""",true).join();Thread.sleep(500);host.phase="race";ws.sendText("""{"t":"sync","offset":0}""",true).join()
            Thread.sleep(4000); var b0=serverBytes();var m0=l.messages.get();var c0=l.chars.get()
            Thread.sleep(10000); var b1=serverBytes();val m1=l.messages.get();val c1=l.chars.get()
            println("BENCH hud-static 10s: msgs=${m1-m0} chars/msg=${(c1-c0)/(m1-m0)} KB/s=${(c1-c0)/10240.0} serverAlloc KB/s=${(b1-b0)/10240.0}")
            run { // racing: speed / drift change every 50 ms like a live car
                val live=java.util.concurrent.atomic.AtomicBoolean(true)
                val th=Thread{ var k=0.0; while(live.get()){ k+=0.37; s.speed=23.456789012345678+k%9; s.driftQuality=(k%1.0); s.slipRadians=0.2+(k%0.3); Thread.sleep(50) } };th.start()
                Thread.sleep(500); val ba=serverBytes();val ma=l.messages.get();val ca=l.chars.get()
                Thread.sleep(10000); val bb=serverBytes();val mb=l.messages.get();val cb=l.chars.get(); live.set(false);th.join()
                println("BENCH hud-live 10s: msgs=${mb-ma} chars/msg=${(cb-ca)/maxOf(1,mb-ma)} KB/s=${(cb-ca)/10240.0} serverAlloc KB/s=${(bb-ba)/10240.0}") }
            if(System.getenv("LINK_BENCH_UNKNOWN")!=null) run { val n=3000;b0=serverBytes();val t0=System.nanoTime()
                for(i in 0 until n){ ws.sendText("{\"t\":\"x\"}",true).join(); val due=t0+(i+1)*3_300_000L; while(System.nanoTime()<due)Thread.sleep(0,200_000) }
                Thread.sleep(300);b1=serverBytes();val wall=(System.nanoTime()-t0)/1e9
                println("BENCH unknown-type frames: B/frame incl hud=${(b1-b0)/n} (hud tick share ${(128.0*1024*wall/n).toInt()} B)") }
            var q=0;val n=3000;val pk="""{"t":"i","q":%d,"ts":%s,"s":0.12345678901234567,"a":1,"b":0,"h":0,"f":0,"fire":0,"mine":0,"weapon":0,"ability":0}"""
            b0=serverBytes();val a0=l.acks.get();val h0=l.messages.get()
            val t0=System.nanoTime()
            for(i in 0 until n){ ws.sendText(pk.format(q++,(host.nowMs()).toString()),true).join(); val due=t0+(i+1)*3_300_000L; while(System.nanoTime()<due)Thread.sleep(0,200_000) }
            Thread.sleep(300); b1=serverBytes()
            val wall=(System.nanoTime()-t0)/1e9
            println("BENCH inputs: n=$n acks=${l.acks.get()-a0} wall=${wall}s serverAlloc total KB/s=${(b1-b0)/1024.0/wall} B/packet incl hud=${(b1-b0)/n}")
            ws.abort()
        } finally { host.stop() }
    }
}
