package dev.deathride.link

import dev.deathride.core.Courses
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.io.File
import java.lang.reflect.Modifier
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.nio.file.Files
import java.security.MessageDigest
import java.util.concurrent.TimeUnit

/** P21 card 14: /routes serves the same bytes on every request, and nothing in the heap holds the reply once it is written. */
class RoutesServedTest {
    private fun sha(b: ByteArray)=MessageDigest.getInstance("SHA-256").digest(b).joinToString(""){"%02x".format(it)}
    private fun usedAfterGc(): Long { repeat(4){System.gc();Thread.sleep(50)};val r=Runtime.getRuntime();return r.totalMemory()-r.freeMemory() }

    private class Served(val status: Int,val sha: String,val contentLength: String)

    @Test fun twoRequestsServeTheSameBytesAndTheHeapKeepsNoReply() {
        val expected=RoutesReply.of(Courses.playable).bytes().let{ sha(it) to it.size }
        // Courses.playable is walked first, so a course it keeps is not counted as the reply below.
        for(c in Courses.playable)c.lengthM
        val client=HttpClient.newHttpClient()
        val port=java.net.ServerSocket(0).use{it.localPort}
        val host=RaceServer({"{}"},{},port=port)
        // Only the digest of each body outlives the request, so the heap below holds no copy the test made.
        fun serve(): Served { val r=client.send(HttpRequest.newBuilder(URI("http://127.0.0.1:$port/routes")).build(),HttpResponse.BodyHandlers.ofByteArray())
            return Served(r.statusCode(),sha(r.body()),r.headers().firstValue("Content-Length").orElse("")) }
        try {
            host.start();val up=System.nanoTime()+TimeUnit.SECONDS.toNanos(60);while(!host.running && System.nanoTime()<up)Thread.sleep(20);assertTrue(host.running,host.serverStatus)
            val before=usedAfterGc()
            val first=serve();val second=serve()
            val after=usedAfterGc()
            assertEquals(200,first.status);assertEquals(200,second.status)
            assertEquals(expected.first,first.sha,"the first request serves the reply's bytes")
            assertEquals(first.sha,second.sha,"two requests serve identical bytes")
            assertEquals(expected.second.toString(),first.contentLength);assertEquals(first.contentLength,second.contentLength)
            // The reply is 17,540,087 B here (16.7 MiB); a server that kept it, or a copy per request, would hold at least that.
            val grew=after-before
            println("routes served bytes=${expected.second} heapAfterGcGrewBytes=$grew")
            assertTrue(grew<8L*1048576,"after two requests the heap kept ${grew/1048576.0} MiB")
        } finally { host.stop() }
    }

    /** Structural: the server's static state and RoutesFile hold a file name and length, never the reply's bytes. */
    @Test fun noFieldCanHoldTheReply() {
        val forbidden=listOf(RoutesReply::class.java,ByteArray::class.java,Lazy::class.java,Collection::class.java,Array<Any>::class.java)
        for(f in RaceServer::class.java.declaredFields.filter{Modifier.isStatic(it.modifiers)})
            assertFalse(forbidden.any{it.isAssignableFrom(f.type)},"RaceServer static ${f.name}: ${f.type.name}")
        for(f in RoutesFile::class.java.declaredFields.filter{!Modifier.isStatic(it.modifiers)})
            assertTrue(f.type in listOf(File::class.java,Function0::class.java,java.lang.Long.TYPE),"RoutesFile ${f.name}: ${f.type.name}")
    }

    @Test fun theFileHoldsTheReplyAndIsWrittenAgainWhenItHasGone() {
        val dir=Files.createTempDirectory("routes-file").toFile()
        try {
            val routes=RoutesFile(dir){Courses.playable.take(3)}
            val expected=RoutesReply.of(Courses.playable.take(3)).bytes()
            val a=routes.open();val first=a.stream.use{it.readBytes()}
            assertEquals(expected.size.toLong(),a.length);assertArrayEquals(expected,first)
            val written=dir.listFiles()!!.single()
            assertTrue(written.name.startsWith(RoutesFile.PREFIX) && written.name.endsWith(RoutesFile.SUFFIX))
            assertTrue(written.delete())
            val b=routes.open();val again=b.stream.use{it.readBytes()}
            assertArrayEquals(expected,again,"a cleared cache directory: the file is written again")
            assertEquals(1,dir.listFiles()!!.size)
        } finally { dir.deleteRecursively() }
    }
}
