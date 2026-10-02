package dev.deathride.link
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.net.http.WebSocket
import java.util.concurrent.LinkedBlockingQueue
import java.util.concurrent.TimeUnit
import java.util.concurrent.CompletionStage
import kotlinx.serialization.json.*

class LinkTest {
    @Test fun occupiedPortReportsFailureWithoutKillingTheHost() {
        java.net.ServerSocket(0).use { occupied ->
            val host=RaceServer({ "{}" },{},port=occupied.localPort)
            try {
                host.start()
                val deadline=System.nanoTime()+TimeUnit.SECONDS.toNanos(15)
                while(!host.serverStatus.contains("unavailable") && System.nanoTime()<deadline)Thread.sleep(20)
                assertFalse(host.running)
                assertTrue(host.serverStatus.contains("unavailable"),host.serverStatus)
            } finally { host.stop() }
        }
    }
    @Test fun statsWindowAndLifetimeHaveIndependentCounts() {
        val d=Distribution(); d.add(12.0,0.0); d.add(20.0,9000.0); d.add(8.0,11000.0)
        val j=Json.parseToJsonElement(d.json(11000.0)).jsonObject
        assertEquals(2,j["last10s"]!!.jsonObject["count"]!!.jsonPrimitive.int)
        assertEquals(3,j["sinceStart"]!!.jsonObject["count"]!!.jsonPrimitive.int)
        assertEquals(20.0,j["last10s"]!!.jsonObject["max"]!!.jsonPrimitive.double)
        assertEquals(12.0,j["sinceStart"]!!.jsonObject["p50"]!!.jsonPrimitive.double)
    }
    @Test fun badPinMalformedInputAndLifecycleAreContained() {
        val port=java.net.ServerSocket(0).use{it.localPort}
        val host=RaceServer({ if(it.endsWith("html"))"<html>controller</html>" else "{}" },{},port=port)
        val http=HttpClient.newHttpClient()
        fun waitReady() { repeat(500) { if(host.running)return; Thread.sleep(20) }; fail<Unit>("server did not start: ${host.serverStatus}") }
        class Listener: WebSocket.Listener {
            val messages=LinkedBlockingQueue<String>()
            override fun onOpen(ws: WebSocket) { ws.request(1) }
            override fun onText(ws: WebSocket,data: CharSequence,last: Boolean): CompletionStage<*>? { messages.offer(data.toString()); ws.request(1); return null }
            fun next(type: String): JsonObject { repeat(30) { val data=messages.poll(1,TimeUnit.SECONDS) ?: error("no $type"); val j=Json.parseToJsonElement(data).jsonObject; if(j["t"]!!.jsonPrimitive.content==type)return j }; error("no $type") }
        }
        fun connect(listener: Listener)=http.newWebSocketBuilder().buildAsync(URI("ws://127.0.0.1:$port/ws"),listener).join()
        try {
            host.start(); waitReady()
            val catalog=http.send(HttpRequest.newBuilder(URI("http://127.0.0.1:$port/catalog")).build(),HttpResponse.BodyHandlers.ofString())
            val feedback=Json.parseToJsonElement(catalog.body()).jsonObject["driftFeedback"]!!.jsonObject
            assertEquals(dev.deathride.core.VisualTuning["driftHapticQuality"],feedback["quality"]!!.jsonPrimitive.double)
            host.slots[0].driftQuality=.5;host.slots[0].slipRadians=.4;host.slots[0].spunOut=true
            val bad=Listener(); val badWs=connect(bad); badWs.sendText("""{"t":"hello","pin":"invalid"}""",true).join(); assertEquals("error",bad.next("error")["t"]!!.jsonPrimitive.content); badWs.abort()
            val good=Listener(); val ws=connect(good); ws.sendText("""{"t":"hello","pin":"${host.pin}"}""",true).join()
            val welcome=good.next("welcome"); val token=welcome["token"]!!.jsonPrimitive.content; assertEquals(0,welcome["slot"]!!.jsonPrimitive.int)
            fun barrier() { ws.sendText("""{"t":"ping","ts":123}""",true).join();good.next("pong") }
            val buy="""{"t":"buy","profile":"couch-0","car":"Line","part":"brakes","tier":0}"""
            host.phase="race";ws.sendText(buy,true).join();barrier();assertNull(host.slots[0].shopRequest.get())
            host.phase="garage";ws.sendText(buy,true).join();ws.sendText(buy.replace("brakes","engine"),true).join();barrier()
            val request=host.slots[0].shopRequest.getAndSet(null)!!;assertEquals("brakes",dev.deathride.core.Parts.all[request.part].id);assertEquals(0,request.tier)
            ws.sendText(buy.replace("couch-0","another-profile"),true).join();barrier();assertNull(host.slots[0].shopRequest.get())
            val market="""{"t":"market","profile":"couch-0","car":"Line","action":"item","id":"turbo","revision":0}"""
            ws.sendText(market,true).join();ws.sendText(market.replace("turbo","fuel"),true).join();barrier()
            assertEquals("turbo",host.slots[0].marketRequest.getAndSet(null)!!.id)
            ws.sendText(market.replace("couch-0","another-profile"),true).join();barrier();assertNull(host.slots[0].marketRequest.get())
            host.phase="race";ws.sendText(market,true).join();barrier();assertNull(host.slots[0].marketRequest.get())
            host.phase="lobby"
            host.phase="career";ws.sendText("""{"t":"difficulty","id":"Pro"}""",true).join();barrier();assertEquals(2,host.difficultyRequest.getAndSet(-1))
            val guest=Listener();val guestWs=connect(guest);guestWs.sendText("""{"t":"hello","pin":"${host.pin}","profile":"guest-career"}""",true).join();guest.next("welcome")
            guestWs.sendText("""{"t":"difficulty","id":"Club"}""",true).join();guestWs.sendText("""{"t":"careerStart"}""",true).join();guestWs.sendText("""{"t":"ping","ts":1}""",true).join();guest.next("pong")
            assertEquals(-1,host.difficultyRequest.get());assertEquals(0,host.command.get());guestWs.abort();host.phase="lobby"
            ws.sendText("""{"t":"feel","id":"Loose"}""",true).join()
            repeat(100) { if(host.feelRequest.get()<0)Thread.sleep(10) }
            assertEquals(1,host.feelRequest.getAndSet(-1))
            ws.sendText("""{"t":"feel","id":"invalid"}""",true).join()
            ws.sendText("this is not JSON",true).join()
            ws.sendText("""{"t":"i","q":1,"ts":0,"s":0.4,"a":1,"b":0,"f":1,"fire":1,"mine":1,"weapon":1,"ability":1}""",true).join(); assertTrue(good.next("ack")["accepted"]!!.jsonPrimitive.boolean)
            val input=dev.deathride.core.InputFrame();host.consume(0,host.nowMs(),input)
            assertEquals(1.0,input.ability);assertEquals(1.0,input.fire);assertEquals(1.0,input.mine);assertEquals(1,input.weapon);assertTrue(host.flash.getAndSet(false))
            ws.sendText("""{"t":"i","q":0,"ts":0,"s":-1,"a":1,"b":0,"f":0}""",true).join(); assertFalse(good.next("ack")["accepted"]!!.jsonPrimitive.boolean)
            host.suspendLink();host.consume(0,host.nowMs(),input);assertEquals(0.0,input.ability); assertFalse(host.running); host.start(); waitReady()
            val returned=Listener(); val again=connect(returned); again.sendText("""{"t":"hello","token":"$token"}""",true).join(); assertEquals(0,returned.next("welcome")["slot"]!!.jsonPrimitive.int)
            val response=http.send(HttpRequest.newBuilder(URI("http://127.0.0.1:$port/stats")).build(),HttpResponse.BodyHandlers.ofString())
            assertEquals(200,response.statusCode()); assertTrue(Json.parseToJsonElement(response.body()).jsonObject["slots"]!!.jsonArray[0].jsonObject["connected"]!!.jsonPrimitive.boolean)
            val drift=Json.parseToJsonElement(response.body()).jsonObject["slots"]!!.jsonArray[0].jsonObject
            assertEquals(.5,drift["driftQuality"]!!.jsonPrimitive.double);assertEquals(.4,drift["slipRadians"]!!.jsonPrimitive.double);assertTrue(drift["spunOut"]!!.jsonPrimitive.boolean)
            again.abort(); ws.abort()
        } finally { host.stop() }
    }
}
