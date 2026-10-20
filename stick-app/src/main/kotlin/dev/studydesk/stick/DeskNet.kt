package dev.studydesk.stick

import java.io.IOException
import java.io.InputStream
import java.net.ConnectException
import java.net.HttpURLConnection
import java.net.Inet4Address
import java.net.NetworkInterface
import java.net.NoRouteToHostException
import java.net.SocketTimeoutException
import java.net.URL
import java.net.UnknownHostException
import java.util.concurrent.Callable
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

/** The stick's side of the probe: one GET /api/session, and the search of the stick's own /24 for a desk. */
object DeskNet {
    /** One probe. [cookie] is the WebView's cookie for the desk (the desk-tv one, once paired), so the answer says whether this stick is its TV. */
    fun probe(desk: Desk, cookie: String?, connectMs: Int = 2_000, readMs: Int = 5_000): Probe {
        var c: HttpURLConnection? = null
        return try {
            c = (URL(desk.probeUrl).openConnection() as HttpURLConnection).apply {
                connectTimeout = connectMs
                readTimeout = readMs
                instanceFollowRedirects = false
                useCaches = false
                setRequestProperty("Accept", "application/json")
                if (!cookie.isNullOrEmpty()) setRequestProperty("Cookie", cookie)
            }
            val status = c.responseCode
            val body = (if (status in 200..299) c.inputStream else c.errorStream)?.use(::readCapped).orEmpty()
            Probe.read(status, body)
        } catch (e: SocketTimeoutException) {
            Probe.Failed("${desk.label} did not answer in time")
        } catch (e: NoRouteToHostException) {
            Probe.Failed("no route to it: is the stick on the same Wi-Fi as the computer?")
        } catch (e: ConnectException) {
            val m = e.message.orEmpty()
            Probe.Failed(when {
                m.contains("ECONNREFUSED") -> "the computer answered, but nothing is listening on port ${desk.port}"
                m.contains("ENETUNREACH") -> "the stick has no network: is its Wi-Fi on?"
                m.contains("EHOSTUNREACH") -> "no route to ${desk.host}: is the stick on the same Wi-Fi as the computer?"
                else -> "nothing answered at ${desk.label}"
            })
        } catch (e: UnknownHostException) {
            Probe.Failed("the name ${desk.host} is not known on this network")
        } catch (e: IOException) {
            Probe.Failed(e.message ?: e.javaClass.simpleName)
        } finally {
            c?.disconnect()
        }
    }

    /** A session can be large for the TV; the probe needs only its fields, but reads up to 4 MB so a TV answer parses whole. */
    private fun readCapped(input: InputStream): String {
        val cap = 4 shl 20
        val out = java.io.ByteArrayOutputStream()
        val buf = ByteArray(16 * 1024)
        while (out.size() < cap) { val n = input.read(buf); if (n < 0) break; out.write(buf, 0, n) }
        return out.toString("UTF-8")
    }

    /** The stick's own IPv4 address on the LAN (Wi-Fi or Ethernet), or null when it has none. */
    fun localIPv4(): String? = runCatching {
        NetworkInterface.getNetworkInterfaces().toList()
            .filter { it.isUp && !it.isLoopback }
            .sortedBy { if (it.name.startsWith("wlan") || it.name.startsWith("eth")) 0 else 1 }
            .flatMap { it.inetAddresses.toList() }
            .firstOrNull { it is Inet4Address && it.isSiteLocalAddress }?.hostAddress
    }.getOrNull()

    /**
     * Every desk on the stick's /24: the default address first, then x.y.z.1..254, on [tried]'s port and the desk's
     * port. Short timeouts and 64 at a time, so the whole search is a few seconds. Only what answers as a desk is returned.
     */
    fun scan(tried: Desk, cookieOf: (Desk) -> String?): List<Pair<Desk, Probe.Answered>> {
        val ports = linkedSetOf(tried.port, Address.DEFAULT_PORT)
        val hosts = linkedSetOf(Address.DEFAULT.host)
        localIPv4()?.let { hosts += Address.subnet(it) }
        val desks = hosts.flatMap { h -> ports.map { Desk(h, it) } }.filter { it != tried && Address.keepable(it) }
        val pool = Executors.newFixedThreadPool(64)
        try {
            val jobs = desks.map { d -> pool.submit(Callable { d to probe(d, cookieOf(d), connectMs = 700, readMs = 3_000) }) }
            return jobs.mapNotNull { j ->
                val (d, p) = runCatching { j.get(10, TimeUnit.SECONDS) }.getOrNull() ?: return@mapNotNull null
                if (p is Probe.Answered) d to p else null
            }
        } finally {
            pool.shutdownNow()
        }
    }
}
