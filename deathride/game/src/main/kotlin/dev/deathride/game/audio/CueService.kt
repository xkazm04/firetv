package dev.deathride.game.audio

import kotlin.math.*

/** Platform boundary. Prepare allocates memory but no playback voice. */
interface AudioBackend {
    fun prepare(cue: Cue): Boolean
    fun start(cue: Cue,gain: Float,pitch: Float,pan: Float): Long
    fun parameters(handle: Long,gain: Float,pitch: Float,pan: Float)
    fun stop(handle: Long)
    fun finished(handle: Long): Boolean = false
    fun pending(handle: Long): Boolean = false
    fun dispose()
    val decodedBytes: Long get()=0
    fun statsJson(): String = "{}"
}

/** One authority for every Sound and Music playback instance. Render-thread only. */
class CueService(val manifest: CueManifest,private val backend: AudioBackend) {
    private data class Voice(val cue: Cue,val emitter: Int,val handle: Long,val order: Long,
        var x: Double,var y: Double,var gain: Float,var pitch: Float,var targetPitch: Float,
        var played: Double=0.0,var lastTouch: Double=0.0)
    private val voices=ArrayList<Voice>(8)
    private val lastStarts=HashMap<Pair<String,Int>,Double>()
    private val seen=LinkedHashSet<Long>()
    private val gains=manifest.buses.toMutableMap()
    private var clock=0.0
    private var order=0L
    private var duck=0.0
    private var paused=false
    private var disposed=false
    private var captionRemaining=0.0
    private val narration=java.util.ArrayDeque<String>(4)
    var caption="";private set
    var lastNarration="";private set
    var lastNarrationPlayed=false;private set
    var narrationCount=0L;private set
    var listenerX=0.0
    var listenerY=0.0
    var highWater=0;private set
    var suppressed=0L;private set
    var stolen=0L;private set
    var missing=0L;private set
    var played=0L;private set
    val activeVoices get()=voices.size
    val decodedBytes get()=backend.decodedBytes

    fun preload(){manifest.cues.values.filter{it.path.isNotEmpty()}.distinctBy{it.path}.forEach{backend.prepare(it)}}

    private fun spatial(cue: Cue,x: Double,y: Double): Pair<Float,Float> {
        if(!cue.spatial)return 1f to 0f
        val dx=x-listenerX;val dy=y-listenerY
        if(!dx.isFinite() || !dy.isFinite())return 0f to 0f
        val distance=hypot(dx,dy)
        if(distance>=manifest.cutoffM)return 0f to 0f
        val attenuation=if(distance<=manifest.nearM)1.0 else
            ((manifest.cutoffM-distance)/(manifest.cutoffM-manifest.nearM)).coerceIn(0.0,1.0).pow(2)
        return attenuation.toFloat() to (dx/manifest.farM).toFloat().coerceIn(-1f,1f)
    }
    private fun volume(cue: Cue,gain: Float,attenuation: Float): Float {
        val db=when(cue.bus){"music"->manifest.duckMusicDb;"engines"->manifest.duckEnginesDb;else->0.0}
        return (gain*cue.gain*(gains["master"]?:0f)*(gains[cue.bus]?:0f)*attenuation*10.0.pow(db*duck/20)).toFloat().coerceIn(0f,1f)
    }
    private fun drop(): Boolean {suppressed++;return false}
    private fun remove(v: Voice){backend.stop(v.handle);voices.remove(v)}

    fun play(id: String,emitter: Int=0,eventId: Long=0,x: Double=listenerX,y: Double=listenerY,
             gain: Float=1f,pitch: Float=1f): Boolean {
        if(disposed || paused)return drop()
        val cue=manifest.cues[id]?:return drop()
        // Consume an event identity even if dropped, so it cannot be replayed later.
        if(eventId!=0L){if(!seen.add(eventId))return drop();if(seen.size>256)seen.remove(seen.first())}
        val safeGain=if(gain.isFinite())gain.coerceIn(0f,1f) else 0f
        val safePitch=if(pitch.isFinite())pitch.coerceIn(cue.pitchMin,cue.pitchMax) else 1f
        val (attenuation,pan)=spatial(cue,x,y)
        val level=volume(cue,safeGain,attenuation)
        val existing=if(cue.loop)voices.firstOrNull{it.cue.id==id && it.emitter==emitter} else null
        if(level<=.0001f){if(existing!=null)remove(existing);return drop()}
        if(existing!=null){existing.x=x;existing.y=y;existing.gain=safeGain;existing.targetPitch=safePitch;existing.lastTouch=clock;return true}
        val key=id to emitter
        if(clock-(lastStarts[key]?:-1e9)<cue.cooldownMs/1000.0)return drop()
        if(cue.path.isEmpty() || !backend.prepare(cue)){missing++;return false}
        val groupCap=manifest.groupCaps.getValue(cue.group)
        // Single music stream throughout X3. Stings replace the bed, not add a stream.
        if(cue.group=="sting")voices.filter{it.cue.bus=="music"}.toList().forEach{remove(it)}
        val group=voices.filter{it.cue.group==cue.group}
        if(group.size>=groupCap){
            val victim=group.minWithOrNull(compareBy<Voice>{it.cue.priority}.thenBy{it.order})!!
            if(cue.priority>victim.cue.priority || cue.group=="critical" && cue.priority==3){remove(victim);stolen++}
            else return drop()
        }
        if(voices.size>=manifest.maxVoices){
            val victim=voices.minWithOrNull(compareBy<Voice>{it.cue.priority}.thenBy{it.order})!!
            if(cue.priority<=victim.cue.priority)return drop()
            remove(victim);stolen++
        }
        val handle=backend.start(cue,level,safePitch,pan)
        if(handle<0){missing++;return false}
        voices.add(Voice(cue,emitter,handle,++order,x,y,safeGain,safePitch,safePitch,lastTouch=clock))
        lastStarts[key]=clock
        // Keys are normally <=62 cues x a few car/contact emitters. Bound callers too.
        if(lastStarts.size>1024)lastStarts.entries.removeIf{clock-it.value>60}
        if(lastStarts.size>2048)lastStarts.clear()
        highWater=max(highWater,voices.size);played++
        return true
    }

    fun narrate(id: String): Boolean {
        if(disposed || paused || captionRemaining>0)return false
        val cue=manifest.cues[id]?:return false
        if(cue.bus!="voice")return false
        // Text is independent of the Sound path, bus gain and mute state.
        caption=cue.caption;captionRemaining=max(cue.durationSeconds,3.0)
        lastNarration=id;narrationCount++
        lastNarrationPlayed=play(id)
        return lastNarrationPlayed
    }
    /** A short scene-local script; combat cues are never queued. Skip cancels the whole script. */
    fun narrateSequence(vararg ids: String) {
        skipNarration()
        if(disposed || paused)return
        ids.take(4).filter{manifest.cues[it]?.bus=="voice"}.forEach{narration.addLast(it)}
        advanceNarration()
    }
    private fun advanceNarration(){
        if(captionRemaining==0.0 && narration.isNotEmpty()){
            stopBus("voice")
            narrate(narration.removeFirst())
        }
    }
    fun skipNarration(){narration.clear();stopBus("voice");caption="";captionRemaining=0.0}

    fun update(dt: Double) {
        if(disposed || paused || !dt.isFinite() || dt<0)return
        clock+=dt
        captionRemaining=max(0.0,captionRemaining-dt);if(captionRemaining==0.0)caption=""
        val iterator=voices.iterator()
        while(iterator.hasNext()){
            val v=iterator.next()
            if(!backend.pending(v.handle))v.played+=dt*v.pitch
            if(backend.finished(v.handle) || !v.cue.loop && v.played>=v.cue.durationSeconds+.05 || v.cue.loop && clock-v.lastTouch>.3){
                backend.stop(v.handle);iterator.remove()
            }
        }
        val speaking=voices.any{it.cue.bus=="voice"}
        val target=if(speaking)1.0 else 0.0
        duck+=(target-duck)*min(1.0,dt/(if(speaking)manifest.duckAttack else manifest.duckRelease))
        for(v in voices){
            v.pitch+=(v.targetPitch-v.pitch)*min(1.0,dt/.1).toFloat()
            val (attenuation,pan)=spatial(v.cue,v.x,v.y)
            backend.parameters(v.handle,volume(v.cue,v.gain,attenuation),v.pitch,pan)
        }
        advanceNarration()
    }
    fun stopCue(id: String,emitter: Int?=null){voices.filter{it.cue.id==id && (emitter==null || it.emitter==emitter)}.toList().forEach{remove(it)}}
    fun stopGroup(group: String){voices.filter{it.cue.group==group}.toList().forEach{remove(it)}}
    fun stopBus(bus: String){voices.filter{it.cue.bus==bus}.toList().forEach{remove(it)}}
    fun setGain(bus: String,gain: Float){
        if(bus !in gains)return
        gains[bus]=if(gain.isFinite())gain.coerceIn(0f,1f) else 0f
        if(gains[bus]==0f){if(bus=="master")stopAll() else stopBus(bus)}
    }
    fun gain(bus: String)=gains[bus]?:0f
    private fun stopAll(){voices.toList().forEach{remove(it)};duck=0.0}
    fun sceneChanged(){stopAll();skipNarration();seen.clear();lastStarts.clear()}
    fun pause(){sceneChanged();paused=true}
    fun resume(){paused=false}
    fun dispose(){if(!disposed){sceneChanged();backend.dispose();disposed=true}}
    fun statsJson()="{\"active\":$activeVoices,\"highWater\":$highWater,\"cap\":${manifest.maxVoices},\"played\":$played,\"suppressed\":$suppressed,\"stolen\":$stolen,\"missing\":$missing,\"decodedBytes\":$decodedBytes,\"decodedBudgetBytes\":${manifest.decodedBudgetBytes},\"lastNarration\":\"$lastNarration\",\"lastNarrationPlayed\":$lastNarrationPlayed,\"narrationCount\":$narrationCount,\"backend\":${backend.statsJson()}}"
}
