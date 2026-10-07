package dev.deathride.game

import com.badlogic.gdx.*
import com.badlogic.gdx.audio.Music
import com.badlogic.gdx.audio.Sound
import com.badlogic.gdx.files.FileHandle
import dev.deathride.core.*
import dev.deathride.game.audio.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.EnumSource
import java.io.File
import java.lang.reflect.Proxy
import java.security.MessageDigest

/** P12: one recorded cue script, replayed into the native backend under each audio arm.
 * The script is every prepare/start/parameters/stop the cue service asks of its backend while the delivered
 * cue manifest plays a simulated 60 s six-car race (cars 0 and 1 as the two local seats). The replay drives
 * GdxAudioBackend with libGDX's Sound/Music replaced by recorders, so each arm's platform calls can be compared
 * with the backend as it was before the switch ([LegacyGdxAudioBackend], verbatim). */
class AudioArmTest {
    private class Step(val t: Double,val op: Char,val cue: String,val handle: Long,val gain: Float,val pitch: Float,val pan: Float)
    /** The backend the cue service talks to while the script is recorded: it plays nothing and answers like a device. */
    private class ScriptRecorder: AudioBackend {
        var t=0.0
        val steps=ArrayList<Step>()
        private var next=0L
        override fun prepare(cue: Cue): Boolean {steps.add(Step(t,'P',cue.id,-1,0f,0f,0f));return cue.path.isNotEmpty() && File("../assets",cue.path).exists()}
        override fun start(cue: Cue,gain: Float,pitch: Float,pan: Float): Long {val id=++next;steps.add(Step(t,'S',cue.id,id,gain,pitch,pan));return id}
        override fun parameters(handle: Long,gain: Float,pitch: Float,pan: Float){steps.add(Step(t,'A',"",handle,gain,pitch,pan))}
        override fun stop(handle: Long){steps.add(Step(t,'X',"",handle,0f,0f,0f))}
        override fun dispose(){steps.add(Step(t,'D',"",-1,0f,0f,0f))}
    }
    /** One platform call: the Sound (by file) or Music it went to, the method and its arguments, at script time t. */
    private class NativeCall(val t: Double,val target: String,val method: String,val args: List<Any?>,val result: Any?) {
        override fun toString()="%.6f %s.%s(%s)%s".format(t,target,method,args.joinToString(","),if(result==null)"" else " -> $result")
    }
    private class Replay(val calls: List<NativeCall>,val starts: List<Boolean>,val stats: String) {
        val lines get()=calls.map{it.toString()}
        fun count(vararg methods: String)=calls.count{it.method in methods}
        /** The most Sound instances playing at once (play/loop open one, stop(id) closes it). */
        fun peakPlaying(): Int {
            val open=HashSet<Any?>();var peak=0
            for(c in calls)when(c.method){"play","loop"->{open.add(c.result);peak=maxOf(peak,open.size)};"stop"->if(c.args.isNotEmpty())open.remove(c.args[0])}
            return peak
        }
    }

    companion object {
        private val manifest by lazy{CueManifest.parse(File("../assets/audio/cues.json").readText())}
        private val script by lazy{record()}

        private fun record(): List<Step> {
            val recorder=ScriptRecorder();val service=CueService(manifest,recorder);service.preload()
            val director=RaceAudioDirector(service)
            val world=World(1207,combatEnabled=true)
            for(c in world.cars)CarCatalog.apply(c,c.id*3%CarCatalog.all.size)
            world.reset()
            val input=Array(Tuning.CAR_COUNT){InputFrame()}
            val dt=1.0/60
            // The AI drives all six cars; cars 0 and 1 are flagged human only while the director reads the world,
            // so the cues are those of two local seats (two engines, the tyre bed, lap, position and pickup cues).
            fun frame(phase: String,countdown: Double=0.0) {
                recorder.t+=dt
                for(c in world.cars)c.human=c.id<2
                director.update(world,phase,true,countdown,dt)
                for(c in world.cars)c.human=false
            }
            repeat(60){frame("lobby")}
            repeat(180){frame("countdown",3.0-it*dt)}
            repeat(60*60){world.step(input);frame("race")}
            for(c in world.cars)c.human=c.id<2
            director.results(world)
            for(c in world.cars)c.human=false
            repeat(120){frame("results")}
            repeat(60){frame("lobby")}
            recorder.t+=dt;service.dispose()
            return recorder.steps
        }

        private fun replay(make: (()->Long)->AudioBackend): Replay {
            val previousAudio=Gdx.audio;val previousFiles=Gdx.files
            val calls=ArrayList<NativeCall>();var now=0.0;var instance=0L
            fun recorded(type: Class<*>,label: String)=Proxy.newProxyInstance(type.classLoader,arrayOf(type)){proxy,m,args->
                val list=args?.toList()?:emptyList()
                when(m.name){
                    "hashCode"->System.identityHashCode(proxy)
                    "equals"->proxy===list[0]
                    "toString"->label
                    else->{
                        val result: Any?=when(m.name){"play","loop"->if(type==Sound::class.java)++instance else null;"isPlaying"->true;"isLooping"->false;"getVolume"->1f;"getPosition"->0f;else->null}
                        calls.add(NativeCall(now,label,m.name,list,result));result
                    }
                }
            }
            try {
                Gdx.files=Proxy.newProxyInstance(Files::class.java.classLoader,arrayOf(Files::class.java)){_,method,args->
                    when(method.name){"internal"->FileHandle(File("../assets",args!![0] as String));else->null}
                } as Files
                Gdx.audio=Proxy.newProxyInstance(Audio::class.java.classLoader,arrayOf(Audio::class.java)){_,method,args->
                    val path=(args?.getOrNull(0) as? FileHandle)?.path()?.substringAfter("assets/")
                    when(method.name){
                        "newSound"->{calls.add(NativeCall(now,"audio","newSound",listOf(path),null));recorded(Sound::class.java,"sound:$path")}
                        "newMusic"->{calls.add(NativeCall(now,"audio","newMusic",listOf(path),null));recorded(Music::class.java,"music:$path")}
                        else->null
                    }
                } as Audio
                val backend=make{(now*1e9).toLong()}
                val handles=HashMap<Long,Long>();val starts=ArrayList<Boolean>()
                for(s in script){
                    now=s.t
                    when(s.op){
                        'P'->backend.prepare(manifest.cues.getValue(s.cue))
                        'S'->{val h=backend.start(manifest.cues.getValue(s.cue),s.gain,s.pitch,s.pan);starts.add(h>=0);if(h>=0)handles[s.handle]=h}
                        'A'->handles[s.handle]?.let{backend.parameters(it,s.gain,s.pitch,s.pan)}
                        'X'->handles.remove(s.handle)?.let{backend.stop(it)}
                        'D'->{}
                    }
                }
                val stats=backend.statsJson()
                backend.dispose()
                return Replay(calls,starts,stats)
            } finally {Gdx.audio=previousAudio;Gdx.files=previousFiles}
        }
        private val budget get()=manifest.decodedBudgetBytes
        private val legacy by lazy{replay{LegacyGdxAudioBackend(budget)}}
        private val full by lazy{replay{clock->GdxAudioBackend(budget,AudioArm.FULL,clock)}}

        private fun digest(lines: List<String>)=MessageDigest.getInstance("SHA-256").digest(lines.joinToString("\n").toByteArray()).joinToString(""){"%02x".format(it)}
        private fun report(name: String,r: Replay)=
            "\"$name\":{\"nativeCalls\":${r.calls.size},\"sha256\":\"${digest(r.lines)}\",\"newSound\":${r.count("newSound")},\"play\":${r.count("play")},\"loop\":${r.count("loop")},"+
            "\"setPitch\":${r.count("setPitch")},\"setPan\":${r.count("setPan")},\"stop\":${r.count("stop")},\"dispose\":${r.count("dispose")},\"peakPlaying\":${r.peakPlaying()},"+
            "\"startsAccepted\":${r.starts.count{it}},\"startsRefused\":${r.starts.count{!it}},\"stats\":${r.stats}}"
    }

    @Test fun defaultArmGivesThePlatformTheSameStartParametersAndStopCallsAsBefore() {
        val steps=script
        assertTrue(steps.count{it.op=='S'}>100,"the script starts voices");assertTrue(steps.count{it.op=='A'}>5000,"the script moves voices")
        assertTrue(steps.count{it.op=='X'}>100,"the script stops voices")
        val default=replay{GdxAudioBackend(budget)}
        assertTrue(legacy.count("play","loop")>100);assertTrue(legacy.count("setPitch")>5000);assertTrue(legacy.count("stop")>100)
        // Line for line: the same Sound, method, arguments, returned id and script time.
        assertEquals(legacy.lines,full.lines)
        assertEquals(legacy.lines,default.lines)
        assertEquals(legacy.starts,full.starts)
        assertEquals("{}",full.stats,"FULL publishes nothing new")
        val rows=listOf("legacy" to legacy,"full" to full)+AudioArm.entries.drop(1).map{arm->arm.id to replay{clock->GdxAudioBackend(budget,arm,clock)}}
        val out=File("build/reports/p12/audio-arms.json");out.parentFile.mkdirs()
        out.writeText("{\"script\":{\"seconds\":${"%.3f".format(steps.last().t)},\"prepare\":${steps.count{it.op=='P'}},\"start\":${steps.count{it.op=='S'}},"+
            "\"parameters\":${steps.count{it.op=='A'}},\"stop\":${steps.count{it.op=='X'}}},${rows.joinToString(","){(name,r)->report(name,r)}}}\n")
    }

    @ParameterizedTest @EnumSource(names=["MUTED","CAPPED","STILL"])
    fun eachPerfArmChangesOnlyWhatItNames(arm: AudioArm) {
        val r=replay{clock->GdxAudioBackend(budget,arm,clock)}
        val loads={x: Replay->x.calls.filter{it.method=="newSound" || it.method=="newMusic" || it.method=="dispose"}.map{it.toString()}}
        when(arm) {
            AudioArm.MUTED->{
                // Same decoded memory, same voices for the cue service, and not one Sound or Music played.
                assertEquals(loads(full),loads(r))
                assertEquals(full.starts,r.starts)
                assertEquals(0,r.count("play","loop","setPitch","setPan","stop","setVolume","setLooping"))
                assertTrue(r.stats.contains("\"silentStarts\":${full.starts.count{it}}"),r.stats)
            }
            AudioArm.CAPPED->{
                assertTrue(full.peakPlaying()>3,"the script needs more than three voices for the cap to bind")
                assertTrue(r.peakPlaying()<=3,"peak ${r.peakPlaying()}")
                assertTrue(r.starts.count{!it}>full.starts.count{!it},"the cap refuses starts the full arm accepts")
                assertTrue(r.stats.contains("\"voiceCap\":3"),r.stats)
            }
            AudioArm.STILL->{
                // Voices start and stop exactly as in the full arm; only setPitch/setPan thin out.
                val other={x: Replay->x.calls.filter{it.method!="setPitch" && it.method!="setPan"}.map{it.toString()}}
                assertEquals(other(full),other(r))
                assertTrue(r.count("setPitch")*4<full.count("setPitch"),"${r.count("setPitch")} of ${full.count("setPitch")}")
                val last=HashMap<Any?,Double>()
                for(c in r.calls)when(c.method){
                    "play","loop"->last[c.result]=c.t
                    "setPitch"->{val id=c.args[0];assertTrue(c.t-last.getValue(id)>=.2-1e-9,"setPitch on $id ${c.t-last.getValue(id)} s after the last");last[id]=c.t}
                }
                assertEquals(r.count("setPitch"),r.count("setPan"))
            }
            else->fail("not a perf arm: $arm")
        }
    }

    @Test fun onlyAKnownArmNameParsesAndTheWorkerPublishesNothingNewForFull() {
        assertEquals(AudioArm.FULL,AudioArm.parse(null))
        for(arm in AudioArm.entries)assertEquals(arm,AudioArm.parse(arm.id))
        assertThrows(IllegalArgumentException::class.java){AudioArm.parse("loud")}
        assertThrows(IllegalArgumentException::class.java){AudioArm.parse("MUTED")}
        val plain=QueuedAudioBackend(GdxAudioBackend(1024))
        try {assertTrue(plain.statsJson().endsWith(",\"startAgeLimitMs\":100}"),plain.statsJson());assertFalse(plain.statsJson().contains("\"native\":"))}
        finally {plain.dispose()}
        val muted=QueuedAudioBackend(GdxAudioBackend(1024,AudioArm.MUTED))
        try {assertTrue(muted.statsJson().endsWith(",\"native\":{\"arm\":\"muted\",\"voiceCap\":8,\"parameterIntervalMs\":0,\"platformStarts\":0,\"silentStarts\":0,\"refusedStarts\":0,\"appliedParameters\":0,\"heldParameters\":0}}"),muted.statsJson())}
        finally {muted.dispose()}
    }
}
