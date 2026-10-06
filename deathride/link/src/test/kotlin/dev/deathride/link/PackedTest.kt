package dev.deathride.link

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.util.zip.GZIPInputStream

class PackedTest {
    @Test fun staticPagesAreGzippedOnRequestCachedByEtagAndPlainOtherwise() {
        val port=java.net.ServerSocket(0).use{it.localPort}
        val page="<html>"+"controller ".repeat(2000)+"__BUILD__</html>"
        val host=RaceServer({ if(it.endsWith("html"))page else "body{color:#fff}".repeat(50) },{},port=port)
        val http=HttpClient.newHttpClient()
        fun get(path: String,vararg headers: String): HttpResponse<ByteArray> {
            val b=HttpRequest.newBuilder(URI("http://127.0.0.1:$port$path")); headers.toList().chunked(2).forEach{b.header(it[0],it[1])}
            return http.send(b.build(),HttpResponse.BodyHandlers.ofByteArray()) }
        try {
            host.start();repeat(500){if(!host.running)Thread.sleep(20)}
            val plain=get("/");assertEquals(200,plain.statusCode());assertNull(plain.headers().firstValue("Content-Encoding").orElse(null))
            val gz=get("/","Accept-Encoding","gzip");assertEquals("gzip",gz.headers().firstValue("Content-Encoding").get())
            assertTrue(gz.body().size*5<plain.body().size,"gzip ${gz.body().size} vs ${plain.body().size}")
            assertArrayEquals(plain.body(),GZIPInputStream(gz.body().inputStream()).readBytes())
            assertEquals("no-store",gz.headers().firstValue("Cache-Control").get())
            for(path in listOf("/hud.css","/catalog")) {
                val first=get(path,"Accept-Encoding","gzip");assertEquals(200,first.statusCode(),path)
                val etag=first.headers().firstValue("ETag").get()
                assertEquals(304,get(path,"If-None-Match",etag).statusCode(),path)
                assertEquals(200,get(path,"If-None-Match","\"other\"").statusCode(),path)
                assertArrayEquals(get(path).body(),GZIPInputStream(first.body().inputStream()).readBytes(),path)
            }
            assertTrue(String(get("/catalog").body()).startsWith("{\"feelProfiles\""))
        } finally { host.stop() }
    }
}
