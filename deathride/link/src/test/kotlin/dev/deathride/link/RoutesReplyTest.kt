package dev.deathride.link

import dev.deathride.core.Courses
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
import java.security.MessageDigest
import java.util.concurrent.TimeUnit

/** P13e: the /routes reply, now built as UTF-8 blocks, is byte for byte the reply the old String built for Courses.playable. */
class RoutesReplyTest {
    /** The reply as it was built before P13e (RaceServer's lazy routesJson at 258117ec), verbatim. */
    private val before by lazy { Courses.playable.joinToString(",","[","]"){c->
        "{\"id\":\"${c.id}\",\"lengthM\":${c.lengthM},\"startM\":${c.startFraction*c.lengthM},\"gridLanes\":[${c.grid.joinToString(","){it.laneM.toString()}}],\"points\":["+(0..c.count).joinToString(","){i->"[${c.x[i]},${c.y[i]},${c.arc[i]},${c.curvature[i]},${c.surfaces[i].gripScale}]"}+"]}"
    } }
    private fun sha(b: ByteArray)=MessageDigest.getInstance("SHA-256").digest(b).joinToString(""){"%02x".format(it)}

    @Test fun theBlocksAreTheOldReplyByteForByte() {
        val reply=RoutesReply.of(Courses.playable);val expected=before.toByteArray(Charsets.UTF_8)
        assertEquals(expected.size.toLong(),reply.length)
        assertEquals(sha(expected),sha(reply.bytes()))
        assertTrue(reply.length>RoutesReply.CHUNK*2L,"several blocks")
        for(i in 0 until reply.blockCount-1)assertEquals(RoutesReply.CHUNK,reply.size(i))
        println("routes bytes=${reply.length} blocks=${reply.blockCount} sha256=${sha(expected)} courses=${Courses.playable.size}")
    }

    @Test fun aBlockBoundaryAndAnEmptyListKeepTheBytes() {
        for(n in 0..Courses.playable.size) {
            val courses=Courses.playable.take(n);val text=StringBuilder();RoutesReply.write(courses,text)
            assertArrayEquals(text.toString().toByteArray(Charsets.UTF_8),RoutesReply.of(courses).bytes(),"first $n courses")
        }
    }

    @Test fun theServedReplyHasTheOldBodyAndHeaders() {
        val client=HttpClient.newHttpClient()
        fun get(port: Int)=client.send(HttpRequest.newBuilder(URI("http://127.0.0.1:$port/routes")).build(),HttpResponse.BodyHandlers.ofByteArray())
        // The old route on a bare ktor server, so its Content-Type and Content-Length are ktor's own, not written down here.
        val oldPort=java.net.ServerSocket(0).use{it.localPort}
        val text=before
        val old=embeddedServer(CIO,host="127.0.0.1",port=oldPort){ routing { get("/routes"){ call.respondText(text,ContentType.Application.Json) } } }.start(false)
        val port=java.net.ServerSocket(0).use{it.localPort}
        val host=RaceServer({"{}"},{},port=port)
        try {
            host.start();val up=System.nanoTime()+TimeUnit.SECONDS.toNanos(60);while(!host.running && System.nanoTime()<up)Thread.sleep(20);assertTrue(host.running,host.serverStatus)
            val expected=get(oldPort);val served=get(port)
            assertEquals(200,served.statusCode())
            assertEquals(sha(expected.body()),sha(served.body()))
            assertEquals(expected.headers().firstValue("Content-Type"),served.headers().firstValue("Content-Type"))
            assertEquals(expected.headers().firstValue("Content-Length"),served.headers().firstValue("Content-Length"))
            // A second request serves the same blocks.
            assertEquals(sha(expected.body()),sha(get(port).body()))
        } finally { host.stop();old.stop(100,500) }
    }
}
