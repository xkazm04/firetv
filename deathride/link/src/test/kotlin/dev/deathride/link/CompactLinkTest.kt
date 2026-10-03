package dev.deathride.link

import dev.deathride.core.InputFrame
import kotlinx.serialization.json.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.net.URI
import java.net.http.HttpClient
import java.net.http.WebSocket
import java.util.concurrent.CompletionStage
import java.util.concurrent.LinkedBlockingQueue
import java.util.concurrent.TimeUnit

class CompactLinkTest {
    private class Listener: WebSocket.Listener {
        val messages=LinkedBlockingQueue<JsonObject>();private val fragments=StringBuilder()
        override fun onOpen(ws: WebSocket){ws.request(1)}
        override fun onText(ws: WebSocket,data: CharSequence,last: Boolean): CompletionStage<*>? {
            fragments.append(data)
            if(last){messages.offer(Json.parseToJsonElement(fragments.toString()).jsonObject);fragments.setLength(0)}
            ws.request(1);return null
        }
        fun next(type: String,condition: (JsonObject)->Boolean={true}): JsonObject {
            val deadline=System.nanoTime()+TimeUnit.SECONDS.toNanos(8)
            while(System.nanoTime()<deadline){val m=messages.poll(100,TimeUnit.MILLISECONDS)?:continue
                if(m["t"]?.jsonPrimitive?.content==type && condition(m))return m}
            error("No matching $type")
        }
    }
    @Test fun compactHudReconnectionAndFreshnessUseActualSockets() {
        val port=java.net.ServerSocket(0).use{it.localPort};val host=RaceServer({"{}"},{},port=port)
        val client=HttpClient.newHttpClient()
        fun connect(listener: Listener)=client.newWebSocketBuilder().buildAsync(URI("ws://127.0.0.1:$port/ws"),listener).join()
        fun send(ws: WebSocket,value: String){ws.sendText(value,true).join()}
        try {
            host.slots[0].garageJson="{\"offers\":[],\"padding\":\"${"x".repeat(9000)}\"}"
            host.start();val end=System.nanoTime()+TimeUnit.SECONDS.toNanos(8)
            while(!host.running && System.nanoTime()<end)Thread.sleep(10)
            assertTrue(host.running)
            val first=Listener();val ws=connect(first)
            send(ws,"""{"t":"hello","pin":"${host.pin}","hudDelta":1}""")
            val token=first.next("welcome")["token"]!!.jsonPrimitive.content
            assertTrue(first.next("hud").containsKey("garage"))
            assertFalse(first.next("hud").containsKey("garage"))
            host.slots[0].garageJson="{\"offers\":[],\"revision\":2}"
            assertEquals(2,first.next("hud"){it.containsKey("garage")}["garage"]!!.jsonObject["revision"]!!.jsonPrimitive.int)
            host.phase="garage"
            assertTrue(first.next("hud"){it["phase"]!!.jsonPrimitive.content=="garage"}.containsKey("car"))
            send(ws,"""{"t":"sync","offset":0}""")
            fun input(q: Int,stamp: Double,steer: String="0") {
                send(ws,"""{"t":"i","q":$q,"ts":$stamp,"s":$steer,"a":1,"b":0}""")
            }
            input(0,host.nowMs());assertTrue(first.next("ack")["accepted"]!!.jsonPrimitive.boolean)
            input(1,host.nowMs()-300);assertFalse(first.next("ack")["accepted"]!!.jsonPrimitive.boolean)
            input(2,host.nowMs()+1000);assertFalse(first.next("ack")["accepted"]!!.jsonPrimitive.boolean)
            input(3,host.nowMs(),"\"NaN\"");assertFalse(first.next("ack")["accepted"]!!.jsonPrimitive.boolean)
            input(4,host.nowMs());assertTrue(first.next("ack")["accepted"]!!.jsonPrimitive.boolean)
            input(3,host.nowMs());assertFalse(first.next("ack")["accepted"]!!.jsonPrimitive.boolean)
            val out=InputFrame();host.consume(0,host.nowMs()+300,out);assertEquals(0.0,out.throttle)
            val second=Listener();val replacement=connect(second)
            send(replacement,"""{"t":"hello","token":"$token","hudDelta":1}""")
            second.next("welcome");assertTrue(second.next("hud").containsKey("garage"))
            send(replacement,"""{"t":"i","q":0,"ts":0,"s":0,"a":0,"b":0}""")
            assertTrue(second.next("ack")["accepted"]!!.jsonPrimitive.boolean)
            replacement.abort();ws.abort()
        } finally {host.stop()}
    }
}
