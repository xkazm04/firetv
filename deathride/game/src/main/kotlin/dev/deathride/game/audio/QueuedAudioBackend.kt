package dev.deathride.game.audio

import java.util.concurrent.locks.LockSupport

/** One CueService producer, one native worker. Producer never takes a worker lock.
 * Volatile state publishes a start; only the worker releases a slot for reuse.
 * Parameter revisions publish coherent snapshots without making the producer wait. */
class QueuedAudioBackend(private val native: AudioBackend, private val maxStartAgeMs: Long = 100) : AudioBackend {
    private class Slot {
        @Volatile var state=0 // free, queued, starting, active
        var generation=0L
        @Volatile var stop=false
        @Volatile var revision=0L
        @Volatile var appliedRevision=0L
        var cue: Cue?=null;var nativeHandle=-1L;var queuedNs=0L
        @Volatile var dirtyNs=0L
        @Volatile var gain=0f
        @Volatile var pitch=1f
        @Volatile var pan=0f
    }
    private val slots=Array(16){Slot()}
    private val prepared=HashMap<String,Boolean>() // producer-owned, immutable once started
    private var serial=0L
    private var started=false
    @Volatile private var closing=false
    @Volatile private var cacheBytes=0L
    @Volatile private var nativeActive=0
    @Volatile private var nativeHighWater=0
    @Volatile private var starts=0L
    @Volatile private var failures=0L
    @Volatile private var stale=0L
    @Volatile private var cancelled=0L
    @Volatile private var overflow=0L
    @Volatile private var maxQueueNs=0L
    @Volatile private var maxCallNs=0L
    @Volatile private var maxCompletionNs=0L
    @Volatile private var maxParameterQueueNs=0L
    private val worker=Thread({work()},"DeathRideAudio").apply{isDaemon=true}
    override val decodedBytes get()=cacheBytes

    override fun prepare(cue: Cue): Boolean {
        if(closing)return false
        prepared[cue.path]?.let{return it}
        if(started)return false
        val ok=native.prepare(cue);prepared[cue.path]=ok;cacheBytes=native.decodedBytes;return ok
    }
    override fun start(cue: Cue,gain: Float,pitch: Float,pan: Float): Long {
        if(closing || prepared[cue.path]!=true)return -1L
        val index=slots.indexOfFirst{it.state==0}
        if(index<0){overflow++;return -1L}
        val s=slots[index];s.generation=++serial;s.stop=false
        s.cue=cue;s.gain=gain;s.pitch=pitch;s.pan=pan;s.queuedNs=System.nanoTime()
        s.revision=0;s.appliedRevision=0;s.dirtyNs=0
        s.state=1 // release publication; worker never examines an unpublished slot
        if(!started){started=true;worker.start()}
        LockSupport.unpark(worker)
        return s.generation*slots.size+index
    }
    private fun slot(handle: Long): Slot? {
        if(handle<0)return null
        val s=slots[(handle%slots.size).toInt()]
        val state=s.state // acquire before reading generation
        return if(state!=0 && s.generation==handle/slots.size)s else null
    }
    override fun parameters(handle: Long,gain: Float,pitch: Float,pan: Float) {
        val s=slot(handle)?:return
        if(s.stop || s.gain==gain && s.pitch==pitch && s.pan==pan)return
        val before=s.revision
        s.revision=before+1 // odd: worker must retry instead of mixing two updates
        if(before==s.appliedRevision)s.dirtyNs=System.nanoTime()
        s.gain=gain;s.pitch=pitch;s.pan=pan
        s.revision=before+2
        LockSupport.unpark(worker)
    }
    override fun finished(handle: Long)=slot(handle)==null
    override fun pending(handle: Long): Boolean {val s=slot(handle)?:return false;val state=s.state;return state==1 || state==2}
    override fun stop(handle: Long) {val s=slot(handle)?:return;s.stop=true;LockSupport.unpark(worker)}
    private fun retire(s: Slot){s.cue=null;s.nativeHandle=-1L;s.state=0} // publish free LAST
    private fun work() {
        var parameterCursor=0
        try {
            while(!closing) {
                var selected: Slot?=null;var action=0
                for(s in slots)if(s.state!=0 && s.stop){
                    if(s.state==1){cancelled++;retire(s)}else{selected=s;action=2;break}
                }
                if(selected==null)for(s in slots)if(s.state==1 && (selected==null || s.generation<selected!!.generation)){selected=s;action=1}
                if(selected==null)for(n in slots.indices){
                    val index=(parameterCursor+n)%slots.size;val s=slots[index]
                    if(s.state==3 && s.revision!=s.appliedRevision){selected=s;action=3;parameterCursor=(index+1)%slots.size;break}
                }
                if(selected==null)for(s in slots)if(s.state==3 && s.cue!!.stream){selected=s;action=4;break}
                val s=selected
                if(s==null){LockSupport.parkNanos(10_000_000);continue}
                val revision=s.revision
                if(revision and 1L!=0L){Thread.yield();continue}
                val gain=s.gain;val pitch=s.pitch;val pan=s.pan
                if(s.revision!=revision)continue
                if(action==3)maxParameterQueueNs=maxOf(maxParameterQueueNs,System.nanoTime()-s.dirtyNs)
                if(action==1 || action==3)s.appliedRevision=revision
                if(action==1)s.state=2
                val before=System.nanoTime()
                when(action) {
                    1->{
                        val age=before-s.queuedNs;maxQueueNs=maxOf(maxQueueNs,age)
                        if(age>maxStartAgeMs*1_000_000){stale++;retire(s);continue}
                        val handle=if(nativeActive>=8)-1L else try{native.start(s.cue!!,gain,pitch,pan)}catch(_:Exception){-1L}
                        maxCompletionNs=maxOf(maxCompletionNs,System.nanoTime()-s.queuedNs)
                        s.nativeHandle=handle
                        if(handle<0){failures++;retire(s)}
                        else {starts++;nativeActive++;nativeHighWater=maxOf(nativeHighWater,nativeActive);s.state=3}
                    }
                    2->{try{native.stop(s.nativeHandle)}catch(_:Exception){failures++};nativeActive--;retire(s)}
                    3->try{native.parameters(s.nativeHandle,gain,pitch,pan)}catch(_:Exception){s.stop=true;failures++}
                    4->{if(try{native.finished(s.nativeHandle)}catch(_:Exception){true}){try{native.stop(s.nativeHandle)}catch(_:Exception){failures++};nativeActive--;retire(s)}}
                }
                maxCallNs=maxOf(maxCallNs,System.nanoTime()-before);cacheBytes=native.decodedBytes
                if(action==4 && !closing)LockSupport.parkNanos(10_000_000)
            }
        } finally {
            try{native.dispose()}finally{nativeActive=0;for(s in slots)retire(s)}
        }
    }
    override fun statsJson()="{\"worker\":true,\"handoff\":\"spsc-mailboxes\",\"nativeActive\":$nativeActive,\"nativeHighWater\":$nativeHighWater,\"starts\":$starts,\"failedStarts\":$failures,\"staleStarts\":$stale,\"cancelledStarts\":$cancelled,\"overflow\":$overflow,\"maxQueueMs\":${maxQueueNs/1e6},\"maxNativeCallMs\":${maxCallNs/1e6},\"maxStartCompletionMs\":${maxCompletionNs/1e6},\"maxParameterQueueMs\":${maxParameterQueueNs/1e6},\"startAgeLimitMs\":$maxStartAgeMs}"
    override fun dispose() {
        if(closing)return
        closing=true;LockSupport.unpark(worker)
        if(started)worker.join(2000) else native.dispose()
    }
}
