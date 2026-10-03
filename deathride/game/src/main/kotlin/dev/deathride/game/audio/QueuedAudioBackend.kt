package dev.deathride.game.audio

/** Fixed mailboxes for native calls which can block in Android SoundPool/AudioTrack.
 * CueService is the only producer; one worker exclusively owns native playback.
 * Preparation happens before the worker starts. No unbounded executor/task queue. */
class QueuedAudioBackend(private val native: AudioBackend, private val maxStartAgeMs: Long = 100) : AudioBackend {
    private class Slot {
        var generation=0L;var state=0;var stop=false;var dirty=false
        var cue: Cue?=null;var nativeHandle=-1L;var queuedNs=0L;var dirtyNs=0L
        var gain=0f;var pitch=1f;var pan=0f
    }
    private val lock=Object()
    private val slots=Array(16){Slot()}
    private val prepared=HashMap<String,Boolean>()
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

    override fun prepare(cue: Cue): Boolean = synchronized(lock) {
        if(closing)return@synchronized false
        prepared[cue.path]?.let{return@synchronized it}
        // All manifest paths, including stream existence checks, are prepared at startup.
        // An unknown resource during racing fails closed instead of doing native I/O here.
        if(started)return@synchronized false
        val ok=native.prepare(cue);prepared[cue.path]=ok;cacheBytes=native.decodedBytes;ok
    }
    override fun start(cue: Cue,gain: Float,pitch: Float,pan: Float): Long = synchronized(lock) {
        if(closing || prepared[cue.path]!=true)return@synchronized -1L
        val index=slots.indexOfFirst{it.state==0}
        if(index<0){overflow++;return@synchronized -1L}
        val s=slots[index];s.generation=++serial;s.state=1;s.stop=false;s.dirty=false
        s.cue=cue;s.gain=gain;s.pitch=pitch;s.pan=pan;s.queuedNs=System.nanoTime()
        if(!started){started=true;worker.start()}
        lock.notifyAll();s.generation*slots.size+index
    }
    private fun slot(handle: Long): Slot? {
        if(handle<0)return null
        val s=slots[(handle%slots.size).toInt()]
        return if(s.generation==handle/slots.size && s.state!=0)s else null
    }
    override fun parameters(handle: Long,gain: Float,pitch: Float,pan: Float) = synchronized(lock) {
        val s=slot(handle)?:return@synchronized
        if(s.stop || s.gain==gain && s.pitch==pitch && s.pan==pan)return@synchronized
        s.gain=gain;s.pitch=pitch;s.pan=pan
        if(!s.dirty)s.dirtyNs=System.nanoTime()
        s.dirty=true;lock.notifyAll()
    }
    override fun finished(handle: Long): Boolean = synchronized(lock){slot(handle)==null}
    override fun pending(handle: Long): Boolean = synchronized(lock){val s=slot(handle);s!=null && s.state in 1..2}
    override fun stop(handle: Long) = synchronized(lock) {
        val s=slot(handle)?:return@synchronized
        s.stop=true;lock.notifyAll()
    }
    private fun work() {
        try {
            while(!closing) {
                var selected: Slot?=null;var action=0
                var gain=0f;var pitch=1f;var pan=0f
                synchronized(lock) {
                    // Stops retire old native voices before any replacement is started.
                    for(s in slots)if(s.state!=0 && s.stop){
                        if(s.state==1){s.state=0;s.cue=null;cancelled++}
                        else {selected=s;action=2;break}
                    }
                    if(selected==null)for(s in slots)if(s.state==1 && (selected==null || s.generation<selected!!.generation)){selected=s;action=1}
                    if(selected==null)for(s in slots)if(s.state==3 && s.dirty){selected=s;action=3;break}
                    if(selected==null)for(s in slots)if(s.state==3 && s.cue!!.stream){selected=s;action=4;break}
                    val s=selected
                    if(s!=null){
                        gain=s.gain;pitch=s.pitch;pan=s.pan
                        if(action==3)maxParameterQueueNs=maxOf(maxParameterQueueNs,System.nanoTime()-s.dirtyNs)
                        s.dirty=false
                        if(action==1)s.state=2
                    }else if(!closing)lock.wait(10)
                }
                val s=selected?:continue
                val before=System.nanoTime()
                when(action) {
                    1->{
                        val age=before-s.queuedNs;maxQueueNs=maxOf(maxQueueNs,age)
                        if(age>maxStartAgeMs*1_000_000){synchronized(lock){s.state=0;s.cue=null;stale++};continue}
                        val handle=if(nativeActive>=8)-1L else try{native.start(s.cue!!,gain,pitch,pan)}catch(_:Exception){-1L}
                        maxCompletionNs=maxOf(maxCompletionNs,System.nanoTime()-s.queuedNs)
                        synchronized(lock){
                            s.nativeHandle=handle
                            if(handle<0){s.state=0;s.cue=null;failures++}
                            else {s.state=3;starts++;nativeActive++;nativeHighWater=maxOf(nativeHighWater,nativeActive)}
                        }
                    }
                    2->{try{native.stop(s.nativeHandle)}catch(_:Exception){failures++};synchronized(lock){s.state=0;s.cue=null;nativeActive--}}
                    3->try{native.parameters(s.nativeHandle,gain,pitch,pan)}catch(_:Exception){synchronized(lock){s.stop=true};failures++}
                    4->{
                        if(try{native.finished(s.nativeHandle)}catch(_:Exception){true}){try{native.stop(s.nativeHandle)}catch(_:Exception){failures++};synchronized(lock){s.state=0;s.cue=null;nativeActive--}}
                    }
                }
                maxCallNs=maxOf(maxCallNs,System.nanoTime()-before);cacheBytes=native.decodedBytes
                if(action==4)synchronized(lock){if(!closing)lock.wait(10)}
            }
        } finally {
            try{native.dispose()}finally{
                nativeActive=0
                synchronized(lock){for(s in slots){s.state=0;s.cue=null};lock.notifyAll()}
            }
        }
    }
    override fun statsJson()="{\"worker\":true,\"nativeActive\":$nativeActive,\"nativeHighWater\":$nativeHighWater,\"starts\":$starts,\"failedStarts\":$failures,\"staleStarts\":$stale,\"cancelledStarts\":$cancelled,\"overflow\":$overflow,\"maxQueueMs\":${maxQueueNs/1e6},\"maxNativeCallMs\":${maxCallNs/1e6},\"maxStartCompletionMs\":${maxCompletionNs/1e6},\"maxParameterQueueMs\":${maxParameterQueueNs/1e6},\"startAgeLimitMs\":$maxStartAgeMs}"
    override fun dispose() {
        synchronized(lock){if(closing)return;closing=true;lock.notifyAll()}
        if(started)worker.join(2000) else native.dispose()
    }
}
