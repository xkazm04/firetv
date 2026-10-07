package dev.deathride.link

import dev.deathride.core.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.cio.*
import io.ktor.server.engine.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import kotlin.math.*
import kotlinx.serialization.json.*

/** P13f: /stats is appended in place (P11's build, without its gzip) and served as before; the bytes must not change by one. */
class StatsJsonTest {
    /** The pre-P13f RaceServer.statsJson (bba8be1b), verbatim apart from its two clock inputs. */
    private fun templatedStats(h: RaceServer, now: Double, heapUsedMB: Double): String = with(h) {
        val sb=StringBuilder(3000)
        sb.append("{\"audio\":${audioJson()},\"art\":${artJson()},\"traffic\":${trafficJson()},\"pickups\":${pickupsJson()},\"combatSummary\":${combatSummaryJson()},\"track\":$trackJson,\"surface\":\"${surface.id}\",\"feel\":${feel.json},\"units\":\"ms\",\"uptimeMs\":$now,\"phase\":\"$phase\",\"eventType\":\"$eventType\",\"raceEntrants\":$raceEntrants,\"raceLaps\":$raceLaps,\"raceMode\":\"$raceMode\",\"raceSeconds\":$raceSeconds,\"sceneryReady\":$sceneryReady,\"paused\":$paused,\"frameNumber\":$frameNumber,\"flashFrames\":$flashFrames,\"heapUsedMB\":${heapUsedMB},\"frameTimeMs\":${metrics.frameMs.json(now)},\"simStepMs\":${metrics.simMs.json(now)},\"discardedSimulationMs\":${metrics.discardedSimMs.json(now)},\"quantiles\":\"last10s exact (4096 samples); sinceStart histogram (resolution/cap declared per metric); max exact\",\"slots\":[")
        for(i in slots.indices) {
            if(i>0)sb.append(','); val s=slots[i]
            sb.append("{\"slot\":$i,\"hudDelta\":${s.hudDelta},\"hudMessages\":${s.hudMessages},\"hudCharacters\":${s.hudCharacters},\"hudFullSnapshots\":${s.hudFullSnapshots},\"hidden\":${s.hidden},\"connected\":${s.connected},\"reserved\":${s.claimed},\"clockSynced\":${s.clockSynced},\"inputAgeMs\":${metrics.inputAgeMs[i].json(now)},\"stale\":${metrics.stale[i].json(now)},\"dropped\":${metrics.dropped[i].json(now)},\"outOfOrder\":${metrics.outOfOrder[i].json(now)},\"effectiveThrottle\":${s.effectiveThrottle},\"effectiveSteer\":${s.effectiveSteer},\"effectiveBrake\":${s.effectiveBrake},\"effectiveDrift\":${s.effectiveDrift},\"effectiveFire\":${s.effectiveFire},\"effectiveMine\":${s.effectiveMine},\"effectiveAbility\":${s.effectiveAbility},\"layout\":\"${s.layout}\",\"mirrored\":${s.mirrored},\"hostCareer\":$hostCareerJson,\"career\":${s.careerJson},\"garage\":${s.garageJson},\"combat\":${s.combatFull?.invoke()?:s.combatJson},\"drifting\":${s.drifting},\"driftQuality\":${s.driftQuality},\"slipRadians\":${s.slipRadians},\"spunOut\":${s.spunOut},\"loadTransfer\":${s.loadTransfer},\"surfaceId\":\"${s.surfaceId}\",\"car\":${s.carJson},\"lap\":${s.lap},\"position\":${s.position},\"speedMps\":${s.speed},\"xM\":${s.x},\"yM\":${s.y},\"heading\":${s.heading},\"yaw\":${s.yaw},\"progressM\":${s.progressM}}")
        }
        sb.append("]}"); sb.toString()
    }
    /** The pre-P13f Distribution: a fresh scratch array per json(). */
    private class TemplatedDistribution(private val capacity: Int = 4096, private val binMs: Double = .1, private val capMs: Double = 5000.0) {
        private val values=DoubleArray(capacity)
        private val times=DoubleArray(capacity)
        private val histogram=LongArray((capMs/binMs).toInt()+1)
        private var cursor=0
        private var filled=0
        private var count=0L
        private var maximum=0.0
        fun add(valueMs: Double, nowMs: Double) {
            val value=valueMs.coerceAtLeast(0.0)
            values[cursor]=value; times[cursor]=nowMs; cursor=(cursor+1)%capacity; filled=min(filled+1,capacity)
            histogram[(value/binMs).toInt().coerceIn(0,histogram.lastIndex)]++; count++; maximum=max(maximum,value)
        }
        fun json(nowMs: Double): String {
            val window=DoubleArray(filled); var n=0
            for(i in 0 until filled) if(nowMs-times[i]<=10000) window[n++]=values[i]
            java.util.Arrays.sort(window,0,n)
            fun q(p: Double)=if(n==0) 0.0 else window[(ceil(p*n).toInt()-1).coerceIn(0,n-1)]
            fun lifetime(p: Double): Double { var sum=0L; val target=ceil(count*p).toLong(); if(count==0L)return 0.0; for(i in histogram.indices){sum+=histogram[i]; if(sum>=target)return i*binMs}; return maximum }
            return "{\"lifetimeBinMs\":$binMs,\"lifetimeCapMs\":$capMs,\"last10s\":{\"p50\":${q(.5)},\"p95\":${q(.95)},\"max\":${if(n==0)0.0 else window[n-1]},\"count\":$n},\"sinceStart\":{\"p50\":${lifetime(.5)},\"p95\":${lifetime(.95)},\"max\":$maximum,\"count\":$count}}"
        }
    }

    private fun blob(name: String, size: Int): String {
        val sb=StringBuilder("{\"name\":\"$name\",\"items\":[")
        var i=0
        while(sb.length<size) { if(i>0)sb.append(','); sb.append("{\"id\":\"$name-$i\",\"value\":${i*0.37},\"ok\":${i%3==0}}"); i++ }
        return sb.append("]}").toString()
    }
    /** [origin] shifts every metric sample's time; the served test puts them ahead of the server's live clock, so a slow
     *  start cannot age a sample out of a last10s window between the two servers' replies. */
    private fun populate(h: RaceServer,origin: Double=0.0) {
        val r=java.util.Random(11)
        h.audioJson={"{\"worker\":true,\"starts\":42,\"maxQueueMs\":0.125}"}; h.artJson={blob("art",900)}; h.trafficJson={"["+blob("traffic",4700)+"]"}
        h.pickupsJson={"["+blob("pickups",1260)+"]"}; h.combatSummaryJson={blob("combat",780)}; h.trackJson=blob("track",2000)
        h.surface=Surfaces.practice[2]; h.feel=FeelProfiles.all.last(); h.phase="race"; h.eventType="ELIMINATION"; h.raceEntrants=6; h.raceLaps=2
        h.raceMode="career"; h.raceSeconds=37.016666666666; h.sceneryReady=true; h.paused=false; h.frameNumber=123456789012L; h.flashFrames=3
        h.hostCareerJson=blob("hostCareer",12380)
        for(t in 0 until 9000) { val now=origin+t*16.7; h.metrics.frameMs.add(16.6+r.nextGaussian()*2,now); h.metrics.simMs.add(abs(r.nextGaussian()),now)
            for(i in 0..1) { h.metrics.inputAgeMs[i].add(20+abs(r.nextGaussian())*30,now); if(t%97==0)h.metrics.stale[i].add(1,now) }
            if(t%301==0) { h.metrics.dropped[1].add(2,now); h.metrics.outOfOrder[0].add(1,now); h.metrics.discardedSimMs.add(7,now) } }
        for(s in h.slots) {
            s.hudDelta=s.id==0; s.hudMessages=2311L+s.id; s.hudCharacters=3478994L; s.hudFullSnapshots=21; s.hidden=s.id==1; s.connected=true; s.token=if(s.id==0)"tok" else ""
            s.clockSynced=true; s.effectiveThrottle=1.0; s.effectiveSteer=-0.3333333333333333; s.effectiveBrake=0.0; s.effectiveDrift=1e-7; s.effectiveFire=1.0
            s.effectiveMine=-0.0; s.effectiveAbility=0.5; s.layout="Arcade"; s.mirrored=s.id==1; s.careerJson=blob("career${s.id}",12380); s.garageJson=blob("garage${s.id}",6790)
            s.combatJson=blob("combatJson${s.id}",790); s.combatFull=if(s.id==0) {{ blob("combatFull",800) }} else null; s.drifting=s.id==0; s.driftQuality=0.8125
            s.slipRadians=0.12345678901234568; s.spunOut=false; s.loadTransfer=-1.5e10; s.surfaceId="Gravel"; s.carJson=blob("car${s.id}",580); s.lap=2; s.position=s.id+3
            s.speed=48.25; s.x=-1234.5678; s.y=98765.4321; s.heading=PI; s.yaw=-2.0E-5; s.progressM=4321.0
        }
    }

    @Test fun appendedStatsAreTheTemplatedTextByteForByte() {
        val h=RaceServer({ "{}" },{},port=0)
        for(now in listOf(0.0,5000.0)) assertEquals(templatedStats(h,now,1.0),h.statsJson(now,1.0),"defaults at $now")
        populate(h)
        for(now in listOf(9000*16.7,9000*16.7+4000.0,9000*16.7+60000.0)) {
            val heap=37.5390625+now/1e6
            val expected=templatedStats(h,now,heap)
            assertEquals(expected,h.statsJson(now,heap),"populated at $now")
            assertEquals(expected,h.statsJson(now,heap),"a reused buffer at $now")
            assertTrue(expected.length>70_000,"realistic size ${expected.length}")
            Json.parseToJsonElement(expected)
        }
        h.slots[0].combatFull=null; h.slots[1].combatFull={ "{\"late\":true}" }
        assertEquals(templatedStats(h,1.5e5,2.0),h.statsJson(1.5e5,2.0),"combatFull swapped")
    }
    @Test fun reusedScratchDistributionMatchesTheFreshArrayOne() {
        val r=java.util.Random(7)
        for(spec in listOf(Triple(4096,.1,5000.0),Triple(4096,.001,50.0),Triple(64,.1,5000.0))) {
            val fresh=TemplatedDistribution(spec.first,spec.second,spec.third); val reused=Distribution(spec.first,spec.second,spec.third)
            assertEquals(fresh.json(0.0),reused.json(0.0))
            var now=0.0
            repeat(9000) { k ->
                now+=if(k%500==0) 12000.0 else 16.7*r.nextDouble()
                val v=if(k%777==0) 9000.0 else abs(r.nextGaussian())*20
                fresh.add(v,now); reused.add(v,now)
                if(k%37==0) for(dt in listOf(0.0,3000.0,9999.0,10001.0,25000.0)) assertEquals(fresh.json(now+dt),reused.json(now+dt),"$spec k=$k dt=$dt")
            }
        }
    }
    /** The served reply against a bare server running the unchanged route line on the pre-P13f text: same status, headers
     *  (but Date) and body, with or without Accept-Encoding; nothing is gzipped. */
    @Test fun servedStatsAreTheTemplatedBytesWithTheSameHeaders() {
        val port=java.net.ServerSocket(0).use{it.localPort}; val oldPort=java.net.ServerSocket(0).use{it.localPort}
        val h=RaceServer({ "{}" },{},port=port)
        populate(h,1e9)
        val old=embeddedServer(CIO,host="127.0.0.1",port=oldPort){ routing { get("/stats"){ call.response.header("Cache-Control","no-store"); call.respondText(templatedStats(h,0.0,0.0),ContentType.Application.Json) } } }.start(false)
        val http=HttpClient.newHttpClient()
        fun clockless(text: String)=text.replace(Regex("\"uptimeMs\":[^,]*"),"").replace(Regex("\"heapUsedMB\":[^,]*"),"")
        try {
            h.start();repeat(500){if(!h.running)Thread.sleep(20)}
            for(accept in listOf(null,"gzip, deflate")) {
                fun get(p: Int): HttpResponse<ByteArray> { val b=HttpRequest.newBuilder(URI("http://127.0.0.1:$p/stats")); if(accept!=null)b.header("Accept-Encoding",accept)
                    return http.send(b.build(),HttpResponse.BodyHandlers.ofByteArray()) }
                val r=get(port); val o=get(oldPort)
                assertEquals(o.statusCode(),r.statusCode())
                fun headers(x: HttpResponse<ByteArray>)=x.headers().map().filterKeys{!it.equals("date",true) && !it.equals("content-length",true)}
                assertEquals(headers(o),headers(r),"headers ($accept)")
                assertNull(r.headers().firstValue("Content-Encoding").orElse(null),"never gzipped ($accept)")
                assertEquals(r.body().size.toString(),r.headers().firstValue("Content-Length").get())
                assertEquals(clockless(String(o.body(),Charsets.UTF_8)),clockless(String(r.body(),Charsets.UTF_8)),"served body ($accept)")
                assertTrue(r.body().size>70_000,"realistic size ${r.body().size}")
            }
        } finally { h.stop(); old.stop(0,0,java.util.concurrent.TimeUnit.MILLISECONDS) }
    }
}
