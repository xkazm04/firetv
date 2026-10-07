package dev.deathride.core

import java.util.concurrent.ConcurrentLinkedQueue

/**
 * Takes [ProfileStore.save] (50-156 ms on the Stick, P10) off the render thread. One daemon thread below the render
 * thread's priority writes every submitted save in submission order: no coalescing, no parallel writes, and the store's
 * durability steps are unchanged. [submit] snapshots the caller's profile with [Profile.copy], so the writer never reads
 * an object the game can still change.
 *
 * Threading: [submit], [poll], [durable], [pending], [isDurable], [status] and [seed] belong to ONE caller thread (the
 * render thread). Completions are handed over in a queue and applied only inside [poll], so every state those calls
 * report changes on the caller's thread, once per frame.
 *
 * Failure: a failed save cancels every later job of its slot that was submitted before [poll] reported the failure,
 * because those jobs were built on the state that did not reach the disk. The caller then reverts to [durable].
 * Because the queue is FIFO, a durable job implies every job submitted before it has completed too.
 */
class ProfileWriter(private val store: ProfileStore) : AutoCloseable {
    /** CHOICE: a car pick, a garage or market purchase, career prep. MONEY: the Economy.start ticket or a settle; nothing counts until it is durable. */
    enum class Kind { CHOICE, MONEY }
    enum class Status { PENDING, OK, FAILED, CANCELLED }
    class Completion(val job: Long,val slot: Int,val kind: Kind,val status: Status,val error: Throwable?)
    private class Job(val id: Long,val slot: Int,val kind: Kind,val snapshot: Profile,val basis: Int)

    private val lock=Object()
    private val queue=ArrayDeque<Job>() // guarded by lock
    private var inFlight=false // guarded by lock
    private var closing=false // guarded by lock
    private val finished=ConcurrentLinkedQueue<Pair<Job,Completion>>()
    // Caller-thread state, changed only by submit/poll/seed.
    private var nextJob=1L
    private var completedThrough=0L
    private val notDurable=HashMap<Long,Status>() // failed or cancelled jobs; ids at or below completedThrough not here are OK
    private val acknowledgedFailures=HashMap<Int,Int>()
    private val pendingCount=HashMap<Int,Int>()
    private val durableProfiles=HashMap<Int,Profile>()
    private val thread=Thread(::run,"deathride-profile-writer").apply { isDaemon=true;priority=Thread.NORM_PRIORITY-2;start() }

    /** Records [profile] (for example the one just loaded) as what is on disk for [slot]. Takes its own copy. */
    fun seed(slot: Int,profile: Profile) { durableProfiles[slot]=profile.copy() }

    /** Queues a save of a private copy of [profile] for [slot] and returns its job id. Costs the copy, never the write. */
    fun submit(slot: Int,profile: Profile,kind: Kind): Long {
        val job=Job(nextJob,slot,kind,profile.copy(),acknowledgedFailures[slot]?:0)
        synchronized(lock) {
            check(!closing) { "Profile writer closed" }
            queue.addLast(job);lock.notifyAll()
        }
        nextJob++;pendingCount[slot]=(pendingCount[slot]?:0)+1
        return job.id
    }

    /** Applies and returns the completions since the last poll, in job order. Call once per frame on the caller's thread. */
    fun poll(): List<Completion> {
        var first=finished.poll()?:return emptyList()
        val result=ArrayList<Completion>(2)
        while(true) {
            val (job,done)=first
            completedThrough=job.id;pendingCount[job.slot]=(pendingCount[job.slot]?:1)-1
            when(done.status) {
                Status.OK->durableProfiles[job.slot]=job.snapshot
                Status.FAILED->{notDurable[job.id]=done.status;acknowledgedFailures[job.slot]=(acknowledgedFailures[job.slot]?:0)+1}
                else->notDurable[job.id]=done.status
            }
            result.add(done)
            first=finished.poll()?:return result
        }
    }

    /** A copy of the last profile of [slot] confirmed on disk (or [seed]ed), as of the last [poll]; null if none. */
    fun durable(slot: Int): Profile? = durableProfiles[slot]?.copy()
    /** Jobs of [slot] submitted and not yet reported by [poll]. */
    fun pending(slot: Int)=pendingCount[slot]?:0
    fun isDurable(job: Long)=status(job)==Status.OK
    fun status(job: Long): Status = when { job<1 || job>=nextJob->throw IllegalArgumentException("Unknown job $job");job>completedThrough->Status.PENDING;else->notDurable[job]?:Status.OK }

    /** Blocks until every queued save has finished or [timeoutMs] passes; returns whether the queue emptied. Completions still wait for [poll]. */
    fun drain(timeoutMs: Long): Boolean {
        val deadline=System.nanoTime()+timeoutMs*1_000_000
        synchronized(lock) {
            while(queue.isNotEmpty() || inFlight) {
                val left=(deadline-System.nanoTime())/1_000_000
                if(left<=0)return false
                lock.wait(left)
            }
        }
        return true
    }

    /** Drains for up to [timeoutMs], then stops taking jobs. Saves already queued are still written, never dropped. */
    fun close(timeoutMs: Long): Boolean {
        val drained=drain(timeoutMs)
        synchronized(lock) { closing=true;lock.notifyAll() }
        if(drained)thread.join(timeoutMs.coerceAtLeast(1))
        return drained
    }
    override fun close() { close(5_000) }

    private fun run() {
        val failures=HashMap<Int,Int>() // writer-thread only: failed saves per slot
        while(true) {
            val job=synchronized(lock) {
                while(queue.isEmpty() && !closing)lock.wait()
                if(queue.isEmpty())return
                inFlight=true;queue.removeFirst()
            }
            val done=if(job.basis<(failures[job.slot]?:0)) Completion(job.id,job.slot,job.kind,Status.CANCELLED,null)
            else try { store.save(job.snapshot);Completion(job.id,job.slot,job.kind,Status.OK,null) }
            catch(t: Throwable) { failures[job.slot]=(failures[job.slot]?:0)+1;Completion(job.id,job.slot,job.kind,Status.FAILED,t) }
            finished.add(job to done)
            synchronized(lock) { inFlight=false;lock.notifyAll() }
        }
    }
}
