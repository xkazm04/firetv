package dev.deathride.link

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import java.io.ByteArrayOutputStream
import java.util.zip.Deflater
import java.util.zip.GZIPOutputStream

/** A static text resource held as UTF-8 bytes and (lazily, once) as gzip; the controller page is 44 KB, the catalog 26 KB. */
class Packed(val text: String) {
    val raw: ByteArray=text.toByteArray(Charsets.UTF_8)
    val gz: ByteArray by lazy { ByteArrayOutputStream(raw.size/3+64).also{ out -> GZIPOutputStream(out).use{it.write(raw)} }.toByteArray() }
    val etag: String="\"${Integer.toHexString(text.hashCode())}-${raw.size}\""
}
/** Keeps the packed form of text that is rebuilt per request but almost never changes. */
class PackedCache { @Volatile private var last: Packed?=null
    fun of(text: String): Packed { val p=last; if(p!=null && p.text==text)return p; return Packed(text).also{last=it} }
}
suspend fun ApplicationCall.respondPacked(p: Packed,type: ContentType,cache: String?=null) {
    val charset=type.withCharset(Charsets.UTF_8)
    if(cache!=null) { response.header(HttpHeaders.CacheControl,cache); response.header(HttpHeaders.ETag,p.etag)
        if(request.headers[HttpHeaders.IfNoneMatch]==p.etag) { respond(HttpStatusCode.NotModified); return } }
    response.header(HttpHeaders.Vary,"Accept-Encoding")
    if(request.headers[HttpHeaders.AcceptEncoding]?.contains("gzip")==true) { response.header(HttpHeaders.ContentEncoding,"gzip"); respondBytes(p.gz,charset) }
    else respondBytes(p.raw,charset)
}
/** JSON rebuilt per request (/stats, /profile): the same UTF-8 bytes and content type as respondText, gzipped at BEST_SPEED
 *  when the reader accepts it. A probe polling the 77 KB /stats about four times a second moved ~0.3 MB/s, which tripped
 *  Android's 2 MiB data alert, and with it a NetworkStats poll (~0.6 s of a Stick core), every ~7 s (P11). */
suspend fun ApplicationCall.respondJsonText(text: String) {
    val raw=text.toByteArray(Charsets.UTF_8)
    response.header(HttpHeaders.Vary,"Accept-Encoding")
    if(request.headers[HttpHeaders.AcceptEncoding]?.contains("gzip")==true) { response.header(HttpHeaders.ContentEncoding,"gzip"); respondBytes(gzipFast(raw),ContentType.Application.Json) }
    else respondBytes(raw,ContentType.Application.Json)
}
fun gzipFast(raw: ByteArray): ByteArray = ByteArrayOutputStream(raw.size/4+64).also { out ->
    object: GZIPOutputStream(out,8192) { init { def.setLevel(Deflater.BEST_SPEED) } }.use { it.write(raw) } }.toByteArray()
