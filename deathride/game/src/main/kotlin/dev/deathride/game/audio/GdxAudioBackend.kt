package dev.deathride.game.audio

import com.badlogic.gdx.Gdx
import com.badlogic.gdx.audio.Music
import com.badlogic.gdx.audio.Sound

/** Sound objects own decoded memory; service handles own playback instances.
 * A streamed Music instance still consumes one of the service's eight voices.
 * P12: a perf-only [AudioArm] may mute, cap or slow the platform calls; [AudioArm.FULL] is today's backend.
 * P14: every [AudioArm.silent] arm takes the MUTED path here; its app-side silent stream lives in the perf launcher.
 */
class GdxAudioBackend(private val budget: Long,private val arm: AudioArm=AudioArm.FULL,private val clock: ()->Long=System::nanoTime): AudioBackend {
    private data class Cached(val sound: Sound,val bytes: Long,var used: Long)
    // A MUTED (or P14 silent) voice holds neither a Sound id nor a Music; appliedNs is read only by STILL.
    private data class Playing(val path: String,val sound: Sound?,val soundId: Long,val music: Music?,val stream: Boolean,var appliedNs: Long=0)
    private val cache=linkedMapOf<String,Cached>()
    private val playing=HashMap<Long,Playing>()
    private val failed=HashSet<String>()
    private var serial=0L
    private var accesses=0L
    override var decodedBytes=0L; private set
    private var disposed=false
    // P12 arm counters, published by statsJson for non-FULL arms only.
    @Volatile private var platformStarts=0L
    @Volatile private var silentStarts=0L
    @Volatile private var refusedStarts=0L
    @Volatile private var appliedParameters=0L
    @Volatile private var heldParameters=0L

    override fun prepare(cue: Cue): Boolean {
        if(disposed || cue.path.isEmpty() || cue.path in failed)return false
        if(cue.stream)return Gdx.files.internal(cue.path).exists()
        cache[cue.path]?.let{it.used=++accesses;return true}
        if(cue.decodedBytes<=0 || cue.decodedBytes>budget)return false
        while(decodedBytes+cue.decodedBytes>budget){
            val victim=cache.entries.filter{entry->playing.values.none{it.path==entry.key}}.minByOrNull{it.value.used}?:return false
            victim.value.sound.dispose();decodedBytes-=victim.value.bytes;cache.remove(victim.key)
        }
        return try {
            val file=Gdx.files.internal(cue.path)
            if(!file.exists()){failed.add(cue.path);false}
            else {
                val sound=Gdx.audio.newSound(file)
                cache[cue.path]=Cached(sound,cue.decodedBytes,++accesses)
                decodedBytes+=cue.decodedBytes;true
            }
        }catch(_: Exception){failed.add(cue.path);false}
    }
    override fun start(cue: Cue,gain: Float,pitch: Float,pan: Float): Long {
        if(disposed)return -1
        if(playing.size>=arm.voiceCap){refusedStarts++;return -1}
        if(!prepare(cue))return -1
        return try {
            val instance=if(cue.stream){
                // X3 uses one linear song stream; no hidden pre-running stems.
                if(playing.values.any{it.stream})return -1
                if(arm.silent)Playing(cue.path,null,-1,null,true) else {
                    val music=Gdx.audio.newMusic(Gdx.files.internal(cue.path))
                    try {music.isLooping=cue.loop;music.setPan(pan,gain);music.play()}
                    catch(error: Exception){music.dispose();throw error}
                    Playing(cue.path,null,-1,music,true)
                }
            }else if(arm.silent)Playing(cue.path,null,-1,null,false) else {
                val sound=cache.getValue(cue.path).sound
                val id=if(cue.loop)sound.loop(gain,pitch,pan) else sound.play(gain,pitch,pan)
                if(id<0)return -1 // Android asynchronous load not ready: no fake voice.
                Playing(cue.path,sound,id,null,false)
            }
            if(instance.sound==null && instance.music==null)silentStarts++ else platformStarts++
            if(arm.parameterIntervalNs>0)instance.appliedNs=clock()
            val handle=++serial;playing[handle]=instance;handle
        }catch(_: Exception){failed.add(cue.path);-1}
    }
    override fun parameters(handle: Long,gain: Float,pitch: Float,pan: Float) {
        val p=playing[handle]?:return
        if(p.sound==null && p.music==null)return // MUTED and the P14 silent arms: nothing plays, nothing to move.
        if(arm.parameterIntervalNs>0){
            val now=clock()
            if(now-p.appliedNs<arm.parameterIntervalNs){heldParameters++;return}
            p.appliedNs=now
        }
        appliedParameters++
        try {if(p.music!=null)p.music.setPan(pan,gain) else {p.sound!!.setPitch(p.soundId,pitch);p.sound.setPan(p.soundId,pan,gain)}}
        catch(_: Exception){stop(handle)}
    }
    override fun finished(handle: Long): Boolean {
        val p=playing[handle]?:return true
        return p.music?.let{!it.isPlaying}?:false
    }
    override fun stop(handle: Long){
        val p=playing.remove(handle)?:return
        if(p.music!=null){try{p.music.stop()}finally{p.music.dispose()}}
        else p.sound?.stop(p.soundId)
    }
    override fun dispose(){
        if(disposed)return
        playing.keys.toList().forEach{stop(it)}
        cache.values.forEach{it.sound.dispose()};cache.clear();decodedBytes=0;disposed=true
    }
    override fun statsJson()=if(arm==AudioArm.FULL)"{}" else
        "{\"arm\":\"${arm.id}\",\"voiceCap\":${arm.voiceCap},\"parameterIntervalMs\":${arm.parameterIntervalNs/1_000_000},\"platformStarts\":$platformStarts,\"silentStarts\":$silentStarts,\"refusedStarts\":$refusedStarts,\"appliedParameters\":$appliedParameters,\"heldParameters\":$heldParameters}"
}
