package dev.deathride.link

import dev.deathride.core.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.cio.*
import io.ktor.server.engine.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.websocket.*
import io.ktor.websocket.*
import kotlinx.coroutines.*
import kotlinx.serialization.json.*
import java.net.*
import java.util.UUID
import java.security.SecureRandom
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicInteger
import kotlin.math.*

class Slot(val id: Int) {
    val input=InputMailbox()
    val carRequest=AtomicInteger(-1)
    @Volatile var carJson=CarCatalog.all[id].json
    @Volatile var token=""
    @Volatile var connected=false
    @Volatile var generation=0
    @Volatile var clockSynced=false
    @Volatile var speed=0.0
    @Volatile var lap=1
    @Volatile var position=id+1
    @Volatile var impact=0.0
    @Volatile var drifting=false
    @Volatile var loadTransfer=0.0
    @Volatile var surfaceId="Asphalt"
    @Volatile var stale=true
    @Volatile var x=0.0
    @Volatile var y=0.0
    @Volatile var effectiveThrottle=0.0
    @Volatile var effectiveSteer=0.0
    val claimed get()=token.isNotEmpty()
}
/** Socket callbacks own mailboxes; only the render thread owns the world. */
class RaceServer(private val assets: (String)->String, private val log: (String)->Unit, val metrics: Metrics=Metrics(), val port: Int=8765) {
    val slots=Array(2){Slot(it)}
    val command=AtomicInteger(0) // 1=start/rematch, 2=lobby
    val flash=AtomicBoolean(false)
    val surfaceRequest=AtomicInteger(-1)
    @Volatile var surface=Surfaces.asphalt
    val feelRequest=AtomicInteger(-1)
    @Volatile var feel=FeelProfiles.default
    @Volatile var phase="lobby"
    @Volatile var raceSeconds=0.0
    @Volatile var frameNumber=0L
    @Volatile var flashFrames=0L
    @Volatile var serverStatus="Opening port 8765..."
    @Volatile var running=false
    @Volatile var paused=false
    @Volatile var address=lanAddress()
    @Volatile var pin=(1000+SecureRandom().nextInt(9000)).toString()
    private var engine: ApplicationEngine?=null
    private var networkJob: Job?=null
    private val origin=System.nanoTime()
    private val errors=CoroutineExceptionHandler { _, e -> running=false; serverStatus="Link error: ${e.javaClass.simpleName}"; log(serverStatus) }
    private val scope=CoroutineScope(SupervisorJob()+Dispatchers.IO+errors)
    fun nowMs()=(System.nanoTime()-origin)/1e6
    fun pairingUrl()="http://$address:$port/?pin=$pin"
    @Synchronized private fun claim(token: String, providedPin: String): Slot? {
        val returning=slots.firstOrNull{it.token==token && token.isNotEmpty()}
        if(returning!=null) { returning.generation++; returning.connected=true; returning.clockSynced=false; returning.input.newConnection(); return returning }
        if(providedPin!=pin) return null
        val slot=slots.firstOrNull{!it.claimed} ?: return null
        slot.token=UUID.randomUUID().toString(); slot.connected=true; slot.generation++; slot.clockSynced=false; slot.input.newConnection()
        return slot
    }
    fun resetPairing() {
        synchronized(this) { for(slot in slots) { slot.generation++; slot.connected=false; slot.token=""; slot.input.newConnection() }; pin=(1000+SecureRandom().nextInt(9000)).toString() }
    }
    fun start() {
        if(running || networkJob?.isActive==true)return
        val html=assets("index.html")
        val manifest=assets("manifest.webmanifest")
        networkJob=scope.launch {
            repeat(10) {
                val free=runCatching { ServerSocket().use { socket -> socket.reuseAddress=false; socket.bind(InetSocketAddress("0.0.0.0",port)) }; true }.getOrDefault(false)
                if(!free) { serverStatus="Port 8765 busy; retry ${it+1}/10"; delay(300); return@repeat }
                val candidate=embeddedServer(CIO, host="0.0.0.0",port=port,parentCoroutineContext=errors) {
                    install(WebSockets) { maxFrameSize=2048; masking=false }
                    routing {
                        get("/") { call.response.header("Cache-Control","no-store"); call.respondText(html,ContentType.Text.Html) }
                        get("/manifest.webmanifest") { call.respondText(manifest,ContentType.Application.Json) }
                        get("/stats") { call.response.header("Cache-Control","no-store"); call.respondText(statsJson(),ContentType.Application.Json) }
                        get("/catalog") { call.respondText("{\"feelProfiles\":${FeelProfiles.json},\"cars\":${CarCatalog.json},\"statMax\":${CarCatalog.statMax},\"surfaces\":${Surfaces.json}}",ContentType.Application.Json) }
                        get("/health") { call.respondText("{\"ok\":true,\"phase\":\"$phase\",\"slots\":${slots.count{it.connected}}}",ContentType.Application.Json) }
                        webSocket("/ws") { handle(this) }
                    }
                }
                if(runCatching { candidate.start(false) }.isSuccess) {
                    engine=candidate; running=true; serverStatus="Ready on local Wi-Fi"; log("pairing ${pairingUrl()}")
                    launch { while(isActive) { delay(10000); address=lanAddress(); log(statsJson()) } }
                    return@launch
                }
                runCatching { candidate.stop(0,0) }; delay(300)
            }
            serverStatus="Port 8765 unavailable. Close the other race app, then reopen."
            log(serverStatus)
        }
    }
    private suspend fun handle(socket: DefaultWebSocketServerSession) {
        var slot: Slot?=null; var generation=-1; var offset=0.0; var calibrated=false
        var hudJob: Job?=null
        try {
            withTimeout(10000) {
                val frame=socket.incoming.receive() as? Frame.Text ?: error("Expected hello")
                val msg=Json.parseToJsonElement(frame.readText()).jsonObject
                if(msg.text("t")!="hello") error("Expected hello")
                slot=claim(msg.text("token"),msg.text("pin"))
            }
            val s=slot
            if(s==null) { socket.send("{\"t\":\"error\",\"message\":\"Check the PIN. Two cars may already be reserved; press UP on the TV lobby to reset pairing.\"}"); socket.close(CloseReason(CloseReason.Codes.VIOLATED_POLICY,"pairing")); return }
            generation=s.generation
            socket.send("{\"t\":\"welcome\",\"slot\":${s.id},\"token\":\"${s.token}\",\"tvNow\":${nowMs()},\"phase\":\"$phase\"}")
            hudJob=socket.launch {
                while(isActive && generation==s.generation) {
                    socket.send("{\"t\":\"hud\",\"speed\":${s.speed},\"lap\":${s.lap},\"pos\":${s.position},\"hp\":100,\"surface\":\"${surface.id}\",\"feel\":${feel.json},\"drifting\":${s.drifting},\"loadTransfer\":${s.loadTransfer},\"surfaceId\":\"${s.surfaceId}\",\"car\":${s.carJson},\"impact\":${s.impact},\"phase\":\"$phase\",\"stale\":${s.stale},\"paused\":$paused}")
                    delay(100)
                }
                socket.close(CloseReason(CloseReason.Codes.NORMAL,"replaced"))
            }
            for(frame in socket.incoming) {
                if(generation!=s.generation)break
                if(frame !is Frame.Text)continue
                val msg=runCatching { Json.parseToJsonElement(frame.readText()).jsonObject }.getOrNull() ?: continue
                val now=nowMs()
                when(msg.text("t")) {
                    "ping" -> { val ts=msg.number("ts"); if(ts.isFinite())socket.send("{\"t\":\"pong\",\"ts\":$ts,\"tvNow\":$now}") }
                    "sync" -> { val value=msg.number("offset"); if(value.isFinite()) { offset=value; calibrated=true; s.clockSynced=true } }
                    "i" -> {
                        val q=msg["q"]?.jsonPrimitive?.longOrNull ?: continue
                        val previousDropped=s.input.dropped; val previousOrder=s.input.outOfOrder
                        val timestamp=if(calibrated) msg.number("ts")+offset else now
                        val accepted=s.input.offer(q,timestamp,now,msg.number("s"),msg.number("a"),msg.number("b"),msg["h"]?.jsonPrimitive?.doubleOrNull?:0.0)
                        metrics.dropped[s.id].add(s.input.dropped-previousDropped,now); metrics.outOfOrder[s.id].add(s.input.outOfOrder-previousOrder,now)
                        if(accepted && msg["f"]?.jsonPrimitive?.intOrNull==1) flash.set(true)
                        socket.send("{\"t\":\"ack\",\"q\":$q,\"tvNow\":$now,\"accepted\":$accepted}")
                    }
                    "surface" -> { val index=Surfaces.practice.indexOfFirst { it.id==msg.text("id") }; if(index>=0)surfaceRequest.set(index) }
                    "car" -> { val index=CarCatalog.all.indexOfFirst { it.id==msg.text("id") }; if(index>=0 && (phase=="lobby" || phase=="results"))s.carRequest.set(index) }
                    "feel" -> { val index=FeelProfiles.all.indexOfFirst { it.id==msg.text("id") }; if(index>=0)feelRequest.set(index) }
                    "start" -> command.compareAndSet(0,1)
                    "lobby" -> command.set(2)
                }
            }
        } catch(_: Exception) { /* An individual phone cannot kill the host. */ }
        finally { hudJob?.cancel(); val s=slot; if(s!=null && generation==s.generation) s.connected=false }
    }
    fun consume(id: Int, now: Double, out: InputFrame) {
        val slot=slots[id]
        val stale=slot.input.consume(now,out); slot.stale=stale; slot.effectiveThrottle=out.throttle; slot.effectiveSteer=out.steer
        if(slot.claimed) {
            if(slot.input.accepted>0) metrics.inputAgeMs[id].add(slot.input.ageMs,now)
            if(stale)metrics.stale[id].add(1,now)
        }
    }
    fun statsJson(): String {
        val now=nowMs(); val runtime=Runtime.getRuntime()
        val sb=StringBuilder(3000)
        sb.append("{\"surface\":\"${surface.id}\",\"feel\":${feel.json},\"units\":\"ms\",\"uptimeMs\":$now,\"phase\":\"$phase\",\"raceSeconds\":$raceSeconds,\"paused\":$paused,\"frameNumber\":$frameNumber,\"flashFrames\":$flashFrames,\"heapUsedMB\":${(runtime.totalMemory()-runtime.freeMemory())/1048576.0},\"frameTimeMs\":${metrics.frameMs.json(now)},\"simStepMs\":${metrics.simMs.json(now)},\"discardedSimulationMs\":${metrics.discardedSimMs.json(now)},\"quantiles\":\"last10s exact (4096 samples); sinceStart histogram (resolution/cap declared per metric); max exact\",\"slots\":[")
        for(i in slots.indices) {
            if(i>0)sb.append(','); val s=slots[i]
            sb.append("{\"slot\":$i,\"connected\":${s.connected},\"reserved\":${s.claimed},\"clockSynced\":${s.clockSynced},\"inputAgeMs\":${metrics.inputAgeMs[i].json(now)},\"stale\":${metrics.stale[i].json(now)},\"dropped\":${metrics.dropped[i].json(now)},\"outOfOrder\":${metrics.outOfOrder[i].json(now)},\"effectiveThrottle\":${s.effectiveThrottle},\"effectiveSteer\":${s.effectiveSteer},\"drifting\":${s.drifting},\"loadTransfer\":${s.loadTransfer},\"surfaceId\":\"${s.surfaceId}\",\"car\":${s.carJson},\"speedMps\":${s.speed},\"xM\":${s.x},\"yM\":${s.y}}")
        }
        sb.append("]}"); return sb.toString()
    }
    fun suspendLink() {
        running=false; networkJob?.cancel(); networkJob=null; engine?.stop(100,500); engine=null
        for(slot in slots) { slot.generation++; slot.connected=false; slot.input.newConnection() }
    }
    fun stop() { suspendLink(); scope.cancel() }
    companion object {
        fun lanAddress(): String = runCatching {
            val interfaces=NetworkInterface.getNetworkInterfaces().toList().filter{it.isUp && !it.isLoopback}
            val addresses=interfaces.flatMap{it.inetAddresses.toList()}.filterIsInstance<Inet4Address>().filter{!it.isLoopbackAddress && !it.isLinkLocalAddress}
            (addresses.firstOrNull{it.isSiteLocalAddress} ?: addresses.firstOrNull())?.hostAddress
        }.getOrNull() ?: "127.0.0.1"
    }
}
private fun JsonObject.text(key: String)=this[key]?.jsonPrimitive?.contentOrNull ?: ""
private fun JsonObject.number(key: String)=this[key]?.jsonPrimitive?.doubleOrNull ?: Double.NaN
