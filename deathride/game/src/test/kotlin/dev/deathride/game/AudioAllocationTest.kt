package dev.deathride.game

import dev.deathride.core.World
import dev.deathride.game.audio.*
import java.lang.management.ManagementFactory
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class AudioAllocationTest {
    private class Native: AudioBackend {
        var next=0L
        var gain=0f;var pan=0f;var pitch=0f
        override fun prepare(cue: Cue)=true
        override fun start(cue: Cue,gain: Float,pitch: Float,pan: Float)=++next
        override fun parameters(handle: Long,gain: Float,pitch: Float,pan: Float){this.gain=gain;this.pan=pan;this.pitch=pitch}
        override fun stop(handle: Long){}
        override fun dispose(){}
    }
    @Test fun changingSpatialLoopsAndTwoDriverUpdatesAllocateNothingAfterWarmup(){
        val engine=Cue("engine.base","engines","engine",1,0,true,10.0,true,1f,"engine.wav",100)
        val tyre=engine.copy(id="movement.tyre",group="movement")
        val native=Native()
        val service=CueService(CueManifest(mapOf(engine.id to engine,tyre.id to tyre),8,1024,
            mapOf("engine" to 2,"movement" to 1),mapOf("master" to 1f,"engines" to 1f)),native)
        val bean=ManagementFactory.getThreadMXBean() as com.sun.management.ThreadMXBean
        bean.isThreadAllocatedMemoryEnabled=true
        val thread=Thread.currentThread().id
        fun spatial(i: Int){
            service.play(engine.id,x=if(i%2==0)10.0 else -10.0,gain=.5f,pitch=if(i%2==0).8f else 1.2f)
            service.update(1.0/60)
        }
        repeat(30000){spatial(it)}
        var before=bean.getThreadAllocatedBytes(thread)
        repeat(10000){spatial(it)}
        assertEquals(0,bean.getThreadAllocatedBytes(thread)-before)
        assertTrue(native.pan<0);assertTrue(native.gain in .01f..<.5f)
        assertTrue(native.pitch in .8f..1.2f)
        val world=World();world.cars[0].human=true;world.cars[1].human=true
        val director=RaceAudioDirector(service)
        repeat(30000){director.update(world,"race",true,0.0,1.0/60)}
        assertEquals(2,service.activeVoices)
        before=bean.getThreadAllocatedBytes(thread)
        repeat(10000){director.update(world,"race",true,0.0,1.0/60)}
        assertEquals(0,bean.getThreadAllocatedBytes(thread)-before)
        service.dispose()
    }
}
