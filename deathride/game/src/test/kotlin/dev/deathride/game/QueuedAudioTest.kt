package dev.deathride.game

import dev.deathride.game.audio.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.lang.management.ManagementFactory
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

class QueuedAudioTest {
    private val cue=Cue("test","effects","all",1,0,true,10.0,false,1f,"audio/test.wav",100)
    private class Native : AudioBackend {
        val entered=CountDownLatch(1);val release=CountDownLatch(1)
        @Volatile var block=false
        @Volatile var fail=false
        @Volatile var done=false
        @Volatile var disposed=false
        @Volatile var parameterGain=0f
        @Volatile var maximum=0
        val active=ConcurrentHashMap<Long,Boolean>()
        var next=0L
        override fun prepare(cue: Cue)=true
        override fun start(cue: Cue,gain: Float,pitch: Float,pan: Float): Long {
            assertEquals("DeathRideAudio",Thread.currentThread().name)
            entered.countDown();if(block)assertTrue(release.await(5,TimeUnit.SECONDS))
            if(fail)return -1
            val id=++next;active[id]=true;maximum=maxOf(maximum,active.size);return id
        }
        override fun parameters(handle: Long,gain: Float,pitch: Float,pan: Float){parameterGain=gain}
        override fun stop(handle: Long){active.remove(handle)}
        override fun finished(handle: Long)=done
        override fun dispose(){active.clear();disposed=true}
    }
    private fun await(condition: ()->Boolean) {
        val deadline=System.nanoTime()+TimeUnit.SECONDS.toNanos(5)
        while(!condition() && System.nanoTime()<deadline)Thread.sleep(1)
        assertTrue(condition(),"worker condition timed out")
    }
    @Test fun blockingNativeStartCannotBlockProducerAndPendingStopCancelsPlayback() {
        val native=Native();native.block=true;val queue=QueuedAudioBackend(native,5000)
        try {
            assertTrue(queue.prepare(cue));val first=queue.start(cue,1f,1f,0f)
            assertTrue(native.entered.await(5,TimeUnit.SECONDS))
            val pending=queue.start(cue,1f,1f,0f)
            queue.parameters(first,.3f,1f,0f);queue.stop(pending);queue.stop(first)
            // Reaching here before releasing native code proves submission never waited for it.
            native.release.countDown();await{queue.finished(first)&&queue.finished(pending)}
            assertEquals(1,native.next);assertTrue(native.active.isEmpty())
        } finally {native.release.countDown();queue.dispose()}
        assertTrue(native.disposed)
    }
    @Test fun fixedCapacityAndEightNativeVoicesSurviveSaturationAndHandleReuse() {
        val native=Native();native.block=true;val queue=QueuedAudioBackend(native,5000)
        try {
            queue.prepare(cue);val first=queue.start(cue,1f,1f,0f)
            assertTrue(native.entered.await(5,TimeUnit.SECONDS))
            val handles=LongArray(16);handles[0]=first
            for(i in 1..15)handles[i]=queue.start(cue,1f,1f,0f)
            assertTrue(handles.all{it>=0});assertEquals(-1,queue.start(cue,1f,1f,0f))
            native.release.countDown();await{handles.count{queue.finished(it)}==8}
            assertEquals(8,native.maximum)
            for(h in handles)queue.stop(h)
            await{handles.all{queue.finished(it)}}
            val fresh=queue.start(cue,1f,1f,0f);await{native.active.size==1}
            queue.stop(first);queue.parameters(first,.1f,1f,0f)
            assertFalse(queue.finished(fresh));assertTrue(queue.finished(first))
            queue.stop(fresh);await{queue.finished(fresh)}
        } finally {native.release.countDown();queue.dispose()}
    }
    @Test fun expiredStartsAndNativeFailuresAreVisibleAndStreamCompletionRetiresVoice() {
        val native=Native();val stale=QueuedAudioBackend(native,0)
        stale.prepare(cue);val old=stale.start(cue,1f,1f,0f);await{stale.finished(old)}
        assertEquals(0,native.next);assertTrue(stale.statsJson().contains("\"staleStarts\":1"));stale.dispose()
        val failing=Native();failing.fail=true;val queue=QueuedAudioBackend(failing,5000)
        try {
            val stream=cue.copy(stream=true);queue.prepare(stream)
            val bad=queue.start(stream,1f,1f,0f);await{queue.finished(bad)}
            assertTrue(queue.statsJson().contains("\"failedStarts\":1"))
            failing.fail=false;val good=queue.start(stream,1f,1f,0f);await{failing.active.size==1}
            failing.done=true;await{queue.finished(good)};assertTrue(failing.active.isEmpty())
        } finally {queue.dispose()}
    }
    @Test fun steadyParameterSubmissionAllocatesNothing() {
        val native=Native();val queue=QueuedAudioBackend(native,5000)
        try {
            queue.prepare(cue);val handle=queue.start(cue,1f,1f,0f);await{native.active.size==1}
            val bean=ManagementFactory.getThreadMXBean() as com.sun.management.ThreadMXBean
            bean.isThreadAllocatedMemoryEnabled=true
            repeat(20000){queue.parameters(handle,(it and 1).toFloat(),1f,0f);queue.finished(handle)}
            val id=Thread.currentThread().id;val before=bean.getThreadAllocatedBytes(id)
            repeat(10000){queue.parameters(handle,(it and 1).toFloat(),1f,0f);queue.finished(handle)}
            assertEquals(0,bean.getThreadAllocatedBytes(id)-before)
            queue.parameters(handle,.5f,1f,0f)
            await{native.parameterGain==.5f}
        } finally {queue.dispose()}
    }
    @Test fun queuedOneShotDoesNotUseItsAudibleDurationWhileNativeStartIsPending() {
        val native=Native();native.block=true;val queue=QueuedAudioBackend(native,5000)
        val shot=cue.copy(loop=false,durationSeconds=.01)
        val manifest=CueManifest(mapOf(shot.id to shot),8,1024,mapOf("all" to 8),mapOf("master" to 1f,"effects" to 1f))
        val service=CueService(manifest,queue)
        try {
            service.preload();assertTrue(service.play(shot.id));assertTrue(native.entered.await(5,TimeUnit.SECONDS))
            service.update(.2);assertEquals(1,service.activeVoices)
            native.release.countDown();await{queue.statsJson().contains("\"starts\":1")}
            service.update(.2);assertEquals(0,service.activeVoices)
        } finally {native.release.countDown();service.dispose()}
    }
}
