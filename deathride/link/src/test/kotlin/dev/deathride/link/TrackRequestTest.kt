package dev.deathride.link

import dev.deathride.core.CoursePrewarm
import dev.deathride.core.Courses
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.net.URI
import java.net.http.HttpClient
import java.net.http.WebSocket
import java.util.concurrent.CompletionStage
import java.util.concurrent.CountDownLatch
import java.util.concurrent.LinkedBlockingQueue
import java.util.concurrent.TimeUnit
import kotlinx.serialization.json.*

/** The phone's 'track' pick bakes the course's projection bins off the render thread and queues it only once they are baked. */
class TrackRequestTest {
    private class Listener: WebSocket.Listener {
        val messages=LinkedBlockingQueue<String>()
        override fun onOpen(ws: WebSocket) { ws.request(1) }
        override fun onText(ws: WebSocket,data: CharSequence,last: Boolean): CompletionStage<*>? { messages.offer(data.toString()); ws.request(1); return null }
        fun next(type: String): JsonObject {
            val deadline=System.nanoTime()+TimeUnit.SECONDS.toNanos(30)
            while(System.nanoTime()<deadline) { val data=messages.poll(1,TimeUnit.SECONDS)?:continue;val j=Json.parseToJsonElement(data).jsonObject;if(j["t"]!!.jsonPrimitive.content==type)return j }
            error("no $type")
        }
    }
    @Test fun trackHandlerQueuesThePickOnlyAfterItsBinsAreBakedAndKeepsAcknowledgingInputs() {
        val port=java.net.ServerSocket(0).use{it.localPort}
        val host=RaceServer({"{}"},{},port=port)
        // Two soak courses no other link test projects onto; the worker is held so the order of events is fixed, not timed.
        val first=Courses.indexOf("salt-1-b");val picked=Courses.indexOf("switchback-1-a")
        assertTrue(first in Courses.playableIndices && picked in Courses.playableIndices)
        val hold=CountDownLatch(1);val held=CountDownLatch(1)
        val seen=ArrayList<Pair<Int,Boolean>>()
        val watcher=Thread { var last=-1;while(!Thread.currentThread().isInterrupted) { val v=host.trackRequest.get();if(v!=last){last=v;if(v>=0)synchronized(seen){seen.add(v to Courses.course(v).projectionReady)}};Thread.onSpinWait() } }.apply{isDaemon=true}
        try {
            host.start();repeat(500){ if(!host.running)Thread.sleep(20) };assertTrue(host.running,host.serverStatus)
            val l=Listener();val ws=HttpClient.newHttpClient().newWebSocketBuilder().buildAsync(URI("ws://127.0.0.1:$port/ws"),l).join()
            ws.sendText("""{"t":"hello","pin":"${host.pin}"}""",true).join();l.next("welcome")
            CoursePrewarm.submit(Courses.indexOf("scrap-1-c")){ held.countDown();hold.await() }
            assertTrue(held.await(60,TimeUnit.SECONDS),"worker held")
            assertFalse(Courses.course(picked).projectionReady,"precondition: the picked course's bins are not baked yet")
            watcher.start()
            ws.sendText("""{"t":"track","id":"${Courses.id(first)}"}""",true).join()
            ws.sendText("""{"t":"track","id":"${Courses.id(picked)}"}""",true).join()
            // The receive loop is not blocked by the bake: an input sent after both picks is acknowledged while they wait.
            ws.sendText("""{"t":"i","q":1,"ts":0,"s":0,"a":0,"b":0}""",true).join()
            assertTrue(l.next("ack")["accepted"]!!.jsonPrimitive.boolean)
            assertEquals(-1,host.trackRequest.get(),"nothing is queued before its bake")
            hold.countDown()
            val deadline=System.nanoTime()+TimeUnit.SECONDS.toNanos(60)
            while(host.trackRequest.get()!=picked && System.nanoTime()<deadline)Thread.sleep(5)
            assertEquals(picked,host.trackRequest.get())
            CoursePrewarm.submit(Courses.course(picked)).get(60,TimeUnit.SECONDS);Thread.sleep(50)
            watcher.interrupt();watcher.join(5000)
            synchronized(seen) {
                assertEquals(listOf(picked to true),seen,"only the newest pick is queued, and its bins (and every branch's) were baked when it was")
            }
            assertTrue(Courses.course(first).projectionReady,"the superseded pick still baked, off the render thread")
            ws.abort()
        } finally { hold.countDown();watcher.interrupt();host.stop() }
    }
}
