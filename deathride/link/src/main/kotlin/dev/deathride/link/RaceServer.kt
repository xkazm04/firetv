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
import java.util.concurrent.atomic.AtomicReference
import kotlin.math.*

data class ShopRequest(val profileId: String,val car: Int,val part: Int,val tier: Int)
data class MarketRequest(val profileId: String,val car: Int,val action: String,val id: String,val revision: Long)
class Slot(val id: Int) {
    val input=InputMailbox()
    val carRequest=AtomicInteger(-1)
    val shopRequest=AtomicReference<ShopRequest?>(null)
    val marketRequest=AtomicReference<MarketRequest?>(null)
    @Volatile var profileId="couch-$id"
    @Volatile var garageJson="{}"
    @Volatile var careerJson="{}"
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
    @Volatile var driftQuality=0.0
    @Volatile var slipRadians=0.0
    @Volatile var spunOut=false
    @Volatile var loadTransfer=0.0
    @Volatile var surfaceId="Asphalt"
    @Volatile var stale=true
    @Volatile var x=0.0
    @Volatile var y=0.0
    @Volatile var heading=0.0
    @Volatile var yaw=0.0
    @Volatile var progressM=0.0
    @Volatile var effectiveThrottle=0.0
    @Volatile var effectiveSteer=0.0
    @Volatile var effectiveBrake=0.0
    @Volatile var effectiveDrift=0.0
    @Volatile var effectiveFire=0.0
    @Volatile var effectiveMine=0.0
    @Volatile var effectiveAbility=0.0
    @Volatile var combatJson="{}"
    @Volatile var layout="Drive"
    @Volatile var mirrored=false
    @Volatile var hudDelta=false
    /** The phone page reported itself hidden: its hud is paused until it is visible again. */
    @Volatile var hidden=false
    @Volatile var hudMessages=0L
    @Volatile var hudCharacters=0L
    @Volatile var hudFullSnapshots=0L
    val claimed get()=token.isNotEmpty()
}
/** Socket callbacks own mailboxes; only the render thread owns the world. */
class RaceServer(private val assets: (String)->String, private val log: (String)->Unit, val metrics: Metrics=Metrics(), val port: Int=8765,
                 val profileFrames: PerfTrace?=null, private val profileRuntime: (()->String)?=null) {
    private val profileInputs=profileFrames?.let{PerfTrace(arrayOf("receiveNs","slot","q","ageMs","parseMs","offerMs","ackEnqueueMs","reason","receiveGapMs"))}
    val slots=Array(2){Slot(it)}
    val command=AtomicInteger(0) // 1=practice/rematch, 2=lobby, 3=garage, 4=career menu, 5=career race
    val difficultyRequest=AtomicInteger(-1)
    @Volatile var raceMode="practice"
    @Volatile var hostCareerJson="{}"
    val flash=AtomicBoolean(false)
    val trackRequest=AtomicInteger(-1)
    @Volatile var trackJson=Courses.all[0].json
    val surfaceRequest=AtomicInteger(-1)
    @Volatile var surface=Surfaces.asphalt
    val feelRequest=AtomicInteger(-1)
    @Volatile var feel=FeelProfiles.default
    @Volatile var phase="lobby"
    @Volatile var raceSeconds=0.0
    /** The /stats and metrics-log fields are built by the reader (an IO thread, 0.1 Hz or on request), never per frame on the render thread. Suppliers must tolerate a racing read. */
    @Volatile var combatSummaryJson: ()->String={"{}"}
    @Volatile var trafficJson: ()->String={"[]"}
    @Volatile var pickupsJson: ()->String={"[]"}
    @Volatile var frameNumber=0L
    @Volatile var flashFrames=0L
    @Volatile var serverStatus="Opening port $port..."
    @Volatile var running=false
    @Volatile var paused=false
    @Volatile var raceLaps=3
    @Volatile var eventType="LAPS"
    @Volatile var raceEntrants=6
    @Volatile var sceneryReady=false
    @Volatile var artJson: ()->String={"{}"}
    @Volatile var audioJson: ()->String={"{}"}
    @Volatile var address=lanAddress()
    @Volatile var pin=(1000+SecureRandom().nextInt(9000)).toString()
    private var engine: ApplicationEngine?=null
    private var networkJob: Job?=null
    private val origin=System.nanoTime()
    private val errors=CoroutineExceptionHandler { _, e -> running=false; serverStatus="Link error: ${e.javaClass.simpleName}"; log(serverStatus) }
    private val scope=CoroutineScope(SupervisorJob()+Dispatchers.IO+errors)
    fun nowMs()=(System.nanoTime()-origin)/1e6
    fun pairingUrl()="http://$address:$port/?pin=$pin"
    @Synchronized private fun claim(token: String, providedPin: String, profile: String): Slot? {
        val returning=slots.firstOrNull{it.token==token && token.isNotEmpty()}
        if(returning!=null) { returning.generation++; returning.connected=true; returning.clockSynced=false; returning.input.newConnection(); return returning }
        if(phase=="race" || phase=="countdown")return null
        if(providedPin!=pin) return null
        val slot=slots.firstOrNull{!it.claimed} ?: return null
        val id=if(validProfileId(profile))profile else "couch-${slot.id}"
        if(slots.any{it.claimed && it.profileId==id})return null
        slot.profileId=id
        slot.token=UUID.randomUUID().toString(); slot.connected=true; slot.generation++; slot.clockSynced=false; slot.input.newConnection()
        return slot
    }
    fun resetPairing() {
        synchronized(this) { for(slot in slots) { slot.generation++; slot.connected=false; slot.token=""; slot.profileId="couch-${slot.id}"; slot.shopRequest.set(null);slot.marketRequest.set(null); slot.input.newConnection() }; pin=(1000+SecureRandom().nextInt(9000)).toString() };log("pairing ${pairingUrl()}")
    }
    fun start() {
        if(running || networkJob?.isActive==true)return
        val rawHtml=assets("index.html");val buildId=Integer.toHexString(rawHtml.hashCode());val html=rawHtml.replace("__BUILD__",buildId)
        val manifest=assets("manifest.webmanifest");val htmlPacked=Packed(html);val cssPacked=Packed(assets("hud.css"));val catalogCache=PackedCache()
        networkJob=scope.launch {
            repeat(10) {
                val free=runCatching { ServerSocket().use { socket -> socket.reuseAddress=true; socket.bind(InetSocketAddress("0.0.0.0",port)) }; true }.getOrDefault(false)
                if(!free) { serverStatus="Port $port busy; retry ${it+1}/10"; delay(300); return@repeat }
                val candidate=embeddedServer(CIO, host="0.0.0.0",port=port,parentCoroutineContext=errors) {
                    install(WebSockets) { maxFrameSize=2048; masking=false }
                    routing {
                        get("/") { call.response.header("Cache-Control","no-store"); call.respondPacked(htmlPacked,ContentType.Text.Html) }
                        get("/build") { call.response.header("Cache-Control","no-store"); call.respondText(buildId,ContentType.Text.Plain) }
                        get("/hud.css") { call.respondPacked(cssPacked,ContentType.Text.CSS,"no-cache") }
                get("/manifest.webmanifest") { call.respondText(manifest,ContentType.Application.Json) }
                        get("/stats") { call.response.header("Cache-Control","no-store"); call.respondText(statsJson(),ContentType.Application.Json) }
                        if(profileFrames!=null)get("/profile") {
                            val frames=call.request.queryParameters["frames"]?.toLongOrNull()?:0
                            val inputs=call.request.queryParameters["inputs"]?.toLongOrNull()?:0
                            call.respondText("{\"frames\":${profileFrames.json(frames)},\"inputs\":${profileInputs!!.json(inputs)},\"runtime\":${profileRuntime?.invoke()?:"{}"}}",ContentType.Application.Json)
                        }
                        get("/catalog") { call.respondPacked(catalogCache.of("{\"feelProfiles\":${FeelProfiles.json},\"driftFeedback\":{\"quality\":${VisualTuning["driftHapticQuality"]},\"milliseconds\":${VisualTuning["driftHapticMilliseconds"]},\"cooldownMilliseconds\":${VisualTuning["driftHapticCooldownMilliseconds"]}},\"cars\":${CarCatalog.json},\"statMax\":${CarCatalog.statMax},\"tracks\":${Courses.json},\"surfaces\":${Surfaces.json},\"weapons\":${Weapons.json},\"abilities\":${AbilityCatalog.json},\"layouts\":${ControllerLayouts.json},\"career\":${Career.catalogJson}}"),ContentType.Application.Json,"no-cache") }
                        get("/health") { call.respondText("{\"ok\":true,\"phase\":\"$phase\",\"eventType\":\"$eventType\",\"raceEntrants\":$raceEntrants,\"raceLaps\":$raceLaps,\"raceMode\":\"$raceMode\",\"slots\":${slots.count{it.connected}}}",ContentType.Application.Json) }
                        get("/routes") { call.respondText(routesJson,ContentType.Application.Json) }
                        webSocket("/ws") { handle(this) }
                    }
                }
                if(runCatching { candidate.start(false) }.isSuccess) {
                    engine=candidate; running=true; serverStatus="Ready on local Wi-Fi"; log("pairing ${pairingUrl()}")
                    launch { while(isActive) { delay(10000); address=lanAddress(); log(metricsJson()) } }
                    return@launch
                }
                runCatching { candidate.stop(0,0) }; delay(300)
            }
            serverStatus="Port $port unavailable. Close the other race app, then reopen."
            log(serverStatus)
        }
    }
    private suspend fun handle(socket: DefaultWebSocketServerSession) {
        var slot: Slot?=null; var generation=-1; var offset=0.0; var calibrated=false;var deltaHud=false
        val inputSample=if(profileInputs!=null)DoubleArray(9) else null
        var previousInputNs=0L
        var hudJob: Job?=null
        val hidden=java.util.concurrent.atomic.AtomicBoolean(false);val resume=java.util.concurrent.atomic.AtomicBoolean(false)
        val inputPacket=InputPacket();val ack=StringBuilder(96)
        try {
            withTimeout(10000) {
                val frame=socket.incoming.receive() as? Frame.Text ?: error("Expected hello")
                val msg=Json.parseToJsonElement(frame.readText()).jsonObject
                if(msg.text("t")!="hello") error("Expected hello")
                deltaHud=msg["hudDelta"]?.jsonPrimitive?.intOrNull==1
                slot=claim(msg.text("token"),msg.text("pin"),msg.text("profile"))
            }
            val s=slot
            if(s==null) { socket.send("{\"t\":\"error\",\"message\":\"Pair from the lobby and check the PIN. Two cars may already be reserved; press REWIND in the TV lobby to reset pairing.\"}"); socket.close(CloseReason(CloseReason.Codes.VIOLATED_POLICY,"pairing")); return }
            generation=s.generation
            s.hudDelta=deltaHud
            socket.send("{\"t\":\"welcome\",\"slot\":${s.id},\"token\":\"${s.token}\",\"tvNow\":${nowMs()},\"phase\":\"$phase\"}")
            hudJob=socket.launch {
                var metadata=HudMetadata(deltaHud)
                // Two reused builders: an unchanged snapshot is not resent (only a 1 s heartbeat), and nothing is allocated per tick but the frame.
                var cur=StringBuilder(2048);var last=StringBuilder(2048);var lastSentMs=Double.NEGATIVE_INFINITY
                while(isActive && generation==s.generation) {
                    if(hidden.get()) { delay(100);continue } // a locked or backgrounded phone: no hud until it reports visible
                    if(resume.getAndSet(false)) { metadata=HudMetadata(deltaHud);lastSentMs=Double.NEGATIVE_INFINITY } // resume with a full snapshot
                    val currentPhase=phase
                    val fullBefore=metadata.fullSnapshots
                    val now=nowMs()
                    val meta=metadata.json(currentPhase,now,hostCareerJson,s.careerJson,s.garageJson,s.carJson,trackJson,feel.json)
                    cur.setLength(0)
                    cur.append("{\"t\":\"hud\",\"speed\":").appendFixed(s.speed,2).append(",\"lap\":").append(s.lap).append(",\"pos\":").append(s.position).append(",\"combat\":").append(s.combatJson)
                        .append(",\"surface\":\"").append(surface.id).append("\",\"drifting\":").append(s.drifting).append(",\"driftQuality\":").appendFixed(s.driftQuality,3).append(",\"slipRadians\":").appendFixed(s.slipRadians,3)
                        .append(",\"spunOut\":").append(s.spunOut).append(",\"loadTransfer\":").appendFixed(s.loadTransfer,3).append(",\"surfaceId\":\"").append(s.surfaceId).append("\",\"impact\":").appendFixed(s.impact,3)
                        .append(",\"phase\":\"").append(currentPhase).append("\",\"eventType\":\"").append(eventType).append("\",\"raceEntrants\":").append(raceEntrants).append(",\"raceLaps\":").append(raceLaps)
                        .append(",\"raceMode\":\"").append(raceMode).append("\",\"stale\":").append(s.stale).append(",\"sceneryReady\":").append(sceneryReady).append(",\"paused\":").append(paused).append(meta).append('}')
                    if(now-lastSentMs>=HUD_HEARTBEAT_MS || !sameChars(cur,last)) {
                        socket.send(cur.toString()); lastSentMs=now
                        s.hudMessages++;s.hudCharacters+=cur.length;s.hudFullSnapshots+=metadata.fullSnapshots-fullBefore
                        val t=cur;cur=last;last=t
                    }
                    delay(100)
                }
                socket.close(CloseReason(CloseReason.Codes.NORMAL,"replaced"))
            }
            suspend fun handleInput(q: Long,rawTs: Double,steer: Double,throttle: Double,brake: Double,handbrake: Double,fire: Double,mine: Double,weapon: Int,ability: Double,flashRequested: Boolean,now: Double,receiveNs: Long) {
                val previousDropped=s.input.dropped; val previousOrder=s.input.outOfOrder
                val timestamp=if(calibrated) rawTs+offset else now
                val offerNs=if(profileInputs!=null)System.nanoTime() else 0L
                val accepted=s.input.offer(q,timestamp,now,steer,throttle,brake,handbrake,fire,mine,weapon,ability)
                val offeredNs=if(profileInputs!=null)System.nanoTime() else 0L
                metrics.dropped[s.id].add(s.input.dropped-previousDropped,now); metrics.outOfOrder[s.id].add(s.input.outOfOrder-previousOrder,now)
                if(accepted && flashRequested) flash.set(true)
                ack.setLength(0);ack.append("{\"t\":\"ack\",\"q\":").append(q).append(",\"tvNow\":").append(round3(now)).append(",\"accepted\":").append(accepted).append('}')
                socket.send(ack.toString())
                if(inputSample!=null) {
                    inputSample[0]=receiveNs.toDouble();inputSample[1]=s.id.toDouble();inputSample[2]=q.toDouble()
                    inputSample[3]=now-timestamp;inputSample[4]=(offerNs-receiveNs)/1e6
                    inputSample[5]=(offeredNs-offerNs)/1e6;inputSample[6]=(System.nanoTime()-offeredNs)/1e6
                    inputSample[7]=when { accepted->0.0;s.input.outOfOrder>previousOrder->2.0;now-timestamp>Tuning.STALE_MS->1.0;timestamp-now>100->3.0;else->4.0 }
                    inputSample[8]=if(previousInputNs==0L)0.0 else (receiveNs-previousInputNs)/1e6
                    previousInputNs=receiveNs;profileInputs!!.append(inputSample)
                }
            }
            for(frame in socket.incoming) {
                val receiveNs=if(profileInputs!=null)System.nanoTime() else 0L
                if(generation!=s.generation)break
                if(frame !is Frame.Text)continue
                if(frame.fin && inputPacket.parse(frame.data)) { handleInput(inputPacket.q,inputPacket.ts,inputPacket.s,inputPacket.a,inputPacket.b,inputPacket.h,inputPacket.fire,inputPacket.mine,inputPacket.weapon,inputPacket.ability,inputPacket.flash==1,nowMs(),receiveNs); continue }
                val msg=runCatching { Json.parseToJsonElement(frame.readText()).jsonObject }.getOrNull() ?: continue
                val now=nowMs()
                when(msg.text("t")) {
                    "ping" -> { val ts=msg.number("ts"); if(ts.isFinite())socket.send("{\"t\":\"pong\",\"ts\":$ts,\"tvNow\":$now}") }
                    "vis" -> { val hide=msg["v"]?.jsonPrimitive?.intOrNull==0;s.hidden=hide;if(hide)hidden.set(true) else if(hidden.getAndSet(false))resume.set(true) }
                    "sync" -> { val value=msg.number("offset"); if(value.isFinite()) { offset=value; calibrated=true; s.clockSynced=true } }
                    "i" -> {
                        val q=msg["q"]?.jsonPrimitive?.longOrNull ?: continue
                        handleInput(q,msg.number("ts"),msg.number("s"),msg.number("a"),msg.number("b"),msg["h"]?.jsonPrimitive?.doubleOrNull?:0.0,
                            msg["fire"]?.jsonPrimitive?.doubleOrNull?:0.0,msg["mine"]?.jsonPrimitive?.doubleOrNull?:0.0,msg["weapon"]?.jsonPrimitive?.intOrNull?:0,msg["ability"]?.jsonPrimitive?.doubleOrNull?:0.0,
                            msg["f"]?.jsonPrimitive?.intOrNull==1,now,receiveNs)
                    }
                    "track" -> { val index=Courses.indexOf(msg.text("id"));if(index in Courses.playableIndices && (phase=="lobby" || phase=="results")) { Courses.course(index);trackRequest.set(index) } } // bake on this IO thread so the render thread only swaps
                    "surface" -> { val index=Surfaces.practice.indexOfFirst { it.id==msg.text("id") }; if(index>=0)surfaceRequest.set(index) }
                    "car" -> { val index=CarCatalog.all.indexOfFirst { it.id==msg.text("id") }; if(index>=0 && (phase=="lobby" || phase=="results" || phase=="garage" || phase=="career"))s.carRequest.set(index) }
                    "garage" -> if(phase=="lobby" || phase=="results" || phase=="career")command.compareAndSet(0,3)
                    "career" -> if(phase=="lobby" || phase=="results")command.compareAndSet(0,4)
                    "careerStart" -> if(s.id==0 && phase=="career")command.compareAndSet(0,5)
                    "difficulty" -> if(s.id==0 && phase=="career") { val index=Career.difficulties.indexOfFirst{it.id==msg.text("id")};if(index>=0)difficultyRequest.set(index) }
                    "buy" -> if(phase=="garage") {
                        val part=Parts.all.indexOfFirst{it.id==msg.text("part")};val car=CarCatalog.all.indexOfFirst{it.id==msg.text("car")}
                        val tier=msg["tier"]?.jsonPrimitive?.intOrNull
                        if(part>=0 && car>=0 && tier!=null && tier>=0 && msg.text("profile")==s.profileId)s.shopRequest.compareAndSet(null,ShopRequest(s.profileId,car,part,tier))
                    }
                    "market" -> if(phase=="garage" || phase=="career" && s.id==0 && msg.text("action")=="ally") {
                        val action=msg.text("action");val id=msg.text("id");val revision=msg["revision"]?.jsonPrimitive?.longOrNull
                        val car=CarCatalog.all.indexOfFirst{it.id==msg.text("car")}
                        if(action in setOf("buy","trade","item","loan","repay","repair","service","contract","ally") && id.length<=64 && revision!=null && revision>=0 && car>=0 && msg.text("profile")==s.profileId)
                            s.marketRequest.compareAndSet(null,MarketRequest(s.profileId,car,action,id,revision))
                    }
                    "feel" -> { val index=FeelProfiles.all.indexOfFirst { it.id==msg.text("id") }; if(index>=0)feelRequest.set(index) }
                    "layout" -> { val id=msg.text("id");if(id in ControllerLayouts.ids){s.layout=id;s.mirrored=msg["mirrored"]?.jsonPrimitive?.booleanOrNull?:false} }
                    "start" -> command.compareAndSet(0,1)
                    "lobby" -> command.set(2)
                }
            }
        } catch(_: Exception) { /* An individual phone cannot kill the host. */ }
        finally { hudJob?.cancel(); val s=slot; if(s!=null && generation==s.generation) { s.connected=false;s.hidden=false } }
    }
    fun consume(id: Int, now: Double, out: InputFrame,recordSimulationAge: Boolean=true) {
        val slot=slots[id]
        val stale=slot.input.consume(now,out); slot.stale=stale; slot.effectiveThrottle=out.throttle; slot.effectiveSteer=out.steer;slot.effectiveBrake=out.brake;slot.effectiveDrift=out.handbrake;slot.effectiveFire=out.fire;slot.effectiveMine=out.mine;slot.effectiveAbility=out.ability
        if(slot.claimed && recordSimulationAge) {
            if(slot.input.accepted>0) metrics.inputAgeMs[id].add(slot.input.ageMs,now)
            if(stale)metrics.stale[id].add(1,now)
        }
    }
    // Keep each Android log line below its 4 KB payload limit. Full car/profile state is on /stats.
    private fun metricsJson(): String {
        val now=nowMs()
        return "{\"phase\":\"$phase\",\"raceSeconds\":$raceSeconds,\"frameTimeMs\":${metrics.frameMs.json(now)},\"simStepMs\":${metrics.simMs.json(now)},\"discardedSimulationMs\":${metrics.discardedSimMs.json(now)},\"inputAgeMs\":[${metrics.inputAgeMs.joinToString(","){it.json(now)}}],\"combatSummary\":${combatSummaryJson()}}"
    }
    fun statsJson(): String {
        val now=nowMs(); val runtime=Runtime.getRuntime()
        val sb=StringBuilder(3000)
        sb.append("{\"audio\":${audioJson()},\"art\":${artJson()},\"traffic\":${trafficJson()},\"pickups\":${pickupsJson()},\"combatSummary\":${combatSummaryJson()},\"track\":$trackJson,\"surface\":\"${surface.id}\",\"feel\":${feel.json},\"units\":\"ms\",\"uptimeMs\":$now,\"phase\":\"$phase\",\"eventType\":\"$eventType\",\"raceEntrants\":$raceEntrants,\"raceLaps\":$raceLaps,\"raceMode\":\"$raceMode\",\"raceSeconds\":$raceSeconds,\"sceneryReady\":$sceneryReady,\"paused\":$paused,\"frameNumber\":$frameNumber,\"flashFrames\":$flashFrames,\"heapUsedMB\":${(runtime.totalMemory()-runtime.freeMemory())/1048576.0},\"frameTimeMs\":${metrics.frameMs.json(now)},\"simStepMs\":${metrics.simMs.json(now)},\"discardedSimulationMs\":${metrics.discardedSimMs.json(now)},\"quantiles\":\"last10s exact (4096 samples); sinceStart histogram (resolution/cap declared per metric); max exact\",\"slots\":[")
        for(i in slots.indices) {
            if(i>0)sb.append(','); val s=slots[i]
            sb.append("{\"slot\":$i,\"hudDelta\":${s.hudDelta},\"hudMessages\":${s.hudMessages},\"hudCharacters\":${s.hudCharacters},\"hudFullSnapshots\":${s.hudFullSnapshots},\"hidden\":${s.hidden},\"connected\":${s.connected},\"reserved\":${s.claimed},\"clockSynced\":${s.clockSynced},\"inputAgeMs\":${metrics.inputAgeMs[i].json(now)},\"stale\":${metrics.stale[i].json(now)},\"dropped\":${metrics.dropped[i].json(now)},\"outOfOrder\":${metrics.outOfOrder[i].json(now)},\"effectiveThrottle\":${s.effectiveThrottle},\"effectiveSteer\":${s.effectiveSteer},\"effectiveBrake\":${s.effectiveBrake},\"effectiveDrift\":${s.effectiveDrift},\"effectiveFire\":${s.effectiveFire},\"effectiveMine\":${s.effectiveMine},\"effectiveAbility\":${s.effectiveAbility},\"layout\":\"${s.layout}\",\"mirrored\":${s.mirrored},\"hostCareer\":$hostCareerJson,\"career\":${s.careerJson},\"garage\":${s.garageJson},\"combat\":${s.combatJson},\"drifting\":${s.drifting},\"driftQuality\":${s.driftQuality},\"slipRadians\":${s.slipRadians},\"spunOut\":${s.spunOut},\"loadTransfer\":${s.loadTransfer},\"surfaceId\":\"${s.surfaceId}\",\"car\":${s.carJson},\"lap\":${s.lap},\"position\":${s.position},\"speedMps\":${s.speed},\"xM\":${s.x},\"yM\":${s.y},\"heading\":${s.heading},\"yaw\":${s.yaw},\"progressM\":${s.progressM}}")
        }
        sb.append("]}"); return sb.toString()
    }
    fun suspendLink() {
        running=false; networkJob?.cancel(); networkJob=null; engine?.stop(100,500); engine=null
        for(slot in slots) { slot.generation++; slot.connected=false; slot.input.newConnection() }
    }
    fun stop() { suspendLink(); scope.cancel() }
    companion object {
        // Read-only authored route telemetry for reproducible LAN driving probes. It cannot move a car.
        private val routesJson by lazy { Courses.playable.joinToString(",","[","]"){c->
            "{\"id\":\"${c.id}\",\"lengthM\":${c.lengthM},\"startM\":${c.startFraction*c.lengthM},\"gridLanes\":[${c.grid.joinToString(","){it.laneM.toString()}}],\"points\":["+(0..c.count).joinToString(","){i->"[${c.x[i]},${c.y[i]},${c.arc[i]},${c.curvature[i]},${c.surfaces[i].gripScale}]"}+"]}"
        } }
        const val HUD_HEARTBEAT_MS=1000.0
        fun lanAddress(): String = runCatching {
            val interfaces=NetworkInterface.getNetworkInterfaces().toList().filter{it.isUp && !it.isLoopback}
            val addresses=interfaces.flatMap{it.inetAddresses.toList()}.filterIsInstance<Inet4Address>().filter{!it.isLoopbackAddress && !it.isLinkLocalAddress}
            (addresses.firstOrNull{it.isSiteLocalAddress} ?: addresses.firstOrNull())?.hostAddress
        }.getOrNull() ?: "127.0.0.1"
    }
}
private fun round3(v: Double)=Math.round(v*1000.0)/1000.0
private fun JsonObject.text(key: String)=this[key]?.jsonPrimitive?.contentOrNull ?: ""
private fun JsonObject.number(key: String)=this[key]?.jsonPrimitive?.doubleOrNull ?: Double.NaN
