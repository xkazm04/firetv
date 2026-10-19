package dev.deathride.game

import dev.deathride.core.*
import dev.deathride.core.ProfileWriter.Kind
import dev.deathride.core.ProfileWriter.Status

/**
 * P13b: the render thread's half of [ProfileWriter]. Every profile change applies at once (optimistic) and is saved on the
 * writer thread; [pump], called once at the top of each render, applies what the writer finished. Nothing that needs GL or
 * the world lives here: [Hooks] does that, so the start, settle and revert rules are testable on their own.
 *
 * - CHOICE (car pick, purchase, career prep, difficulty): a failed save reverts the seat once to [ProfileWriter.durable].
 * - A race start is pending until every seat's Economy.start ticket (MONEY) is durable; only then [Hooks.startReady] runs.
 *   A failed or cancelled ticket drops the start. While it is pending, start, car, purchase and track requests are refused.
 * - A settle (MONEY) is pending until durable: its receipt does not count and the next race does not start until it is.
 *
 * The arrays are RaceGame's own (shared by reference). Writer slots are keyed per loaded profile, not per seat, so a
 * profile switch never applies an old profile's completion to the new one.
 */
class ProfileSaves(
    private val writer: ProfileWriter,
    private val profiles: Array<Profile>,
    private val saveStatus: Array<String>,
    private val shopMessage: Array<String>,
    private val careerMessage: Array<String>,
    private val persistence: BooleanArray,
    private val logger: (String)->Unit,
    private val hooks: Hooks,
) {
    interface Hooks {
        /** Republish seat [seat]'s garage, car and career JSON. */
        fun publish(seat: Int)
        /** profiles[seat] was just reverted to its durable state: re-apply the car and garage, reset the world outside a race, publish. */
        fun reverted(seat: Int)
        /** Every ticket of [start] is durable: run the rest of the race start. */
        fun startReady(start: Start)
        /** Something the TV shows changed ([notice], a receipt state). */
        fun changed()
    }
    enum class Purpose { CHOICE, TICKET, SETTLE }
    /** A seat's receipt for the race just finished. */
    enum class Outcome { NONE, PENDING, COUNTED, FAILED }
    /** A requested race start. [seats], [tickets], [profileIds] and [jobs] are parallel; a job of 0 means the seat's ticket was refused (no ticket). */
    class Start(val career: Boolean,val round: Int,val difficulty: Int,val seats: IntArray) {
        val tickets=LongArray(seats.size)
        val profileIds=Array(seats.size){""}
        val jobs=LongArray(seats.size)
        internal val requested=System.nanoTime()
        internal var frames=0
        internal var careerMessage=""
    }
    private class Job(val seat: Int,val purpose: Purpose)

    private val keys=IntArray(profiles.size){it}
    private var nextKey=profiles.size
    private val jobs=HashMap<Long,Job>()
    private val settles=HashMap<Long,Int>() // settle job -> seat, until the writer reports it
    private val results=Array(profiles.size){Outcome.NONE}
    /** The race start waiting for its tickets, if any. */
    var start: Start?=null; private set
    private var failure=""

    /** What the TV shows above the lobby, career or results screen: a pending save or the last save failure. */
    val notice get()=when { start!=null->SAVING_TICKET;settles.isNotEmpty()->SAVING_RESULT;else->failure }
    val settling get()=settles.isNotEmpty()
    fun result(seat: Int)=results[seat]
    /** Why a race start must wait, or null. */
    fun startBlocker(): String?=when { start!=null->SAVING_TICKET;settles.isNotEmpty()->SAVING_RESULT;else->null }
    fun pending(seat: Int)=writer.pending(keys[seat])
    /** A car, purchase or track request while a start waits for its tickets: refused, with the reason on the seat's garage. */
    fun refuseWhileStarting(seat: Int): Boolean {
        if(start==null)return false
        if(shopMessage[seat]!=SAVING_TICKET) { shopMessage[seat]=SAVING_TICKET;hooks.publish(seat) }
        return true
    }

    /**
     * A profile is (re)loaded into [seat]: saves still queued for the old one are drained first (bounded), so loading the
     * same id again never reads a file older than its queued save. The seat then gets a fresh writer slot.
     */
    fun load(seat: Int,loaded: Result<LoadedProfile>,id: String) {
        if(writer.pending(keys[seat])>0) {
            val started=System.nanoTime();val drained=writer.drain(LOAD_DRAIN_MS)
            logger("transition profileSwitchDrain seat=$seat drained=$drained ms=${(System.nanoTime()-started)/1e6}")
        }
        keys[seat]=nextKey++
        persistence[seat]=loaded.isSuccess
        profiles[seat]=loaded.getOrNull()?.profile?:Profile(id)
        saveStatus[seat]=loaded.getOrNull()?.status?:"Save damaged - persistence disabled"
        results[seat]=Outcome.NONE
        if(loaded.isSuccess)writer.seed(keys[seat],profiles[seat])
    }

    /** editProfile: applies [change] to a copy, submits it and makes it the seat's profile. Returns the job id, 0 when refused. */
    fun edit(seat: Int,kind: Kind,purpose: Purpose=if(kind==Kind.CHOICE)Purpose.CHOICE else Purpose.TICKET,change: (Profile)->Unit): Long {
        if(!persistence[seat]) { shopMessage[seat]="Save unavailable - changes disabled";hooks.publish(seat);return 0 }
        val updated=profiles[seat].copy()
        if(runCatching{change(updated)}.isFailure) { shopMessage[seat]="Profile change unavailable";hooks.publish(seat);return 0 }
        val submitted=System.nanoTime()
        val job=runCatching{writer.submit(keys[seat],updated,kind)}.getOrElse { saveStatus[seat]="Save failed - change cancelled";hooks.publish(seat);return 0 }
        val published=System.nanoTime()
        jobs[job]=Job(seat,purpose)
        profiles[seat]=updated;saveStatus[seat]="Saving...";hooks.publish(seat)
        logger("transition profile seat=$seat kind=$kind job=$job submitMs=${(published-submitted)/1e6} publishMs=${(System.nanoTime()-published)/1e6}")
        return job
    }

    /**
     * Submits each seat's Economy.start ticket on its optimistic profile and holds the start until they are durable. With
     * no ticket to wait for (no seat raced, or persistence off) [Hooks.startReady] runs now. Returns the start.
     */
    fun beginStart(career: Boolean,round: Int,difficulty: Int,seats: IntArray): Start {
        check(start==null) { "A race start is already pending" }
        val s=Start(career,round,difficulty,seats)
        failure="";for(seat in seats)results[seat]=Outcome.NONE
        for((k,seat) in seats.withIndex()) {
            var ticket=0L
            val job=edit(seat,Kind.MONEY,Purpose.TICKET){ticket=Economy.start(it)}
            if(job>0) { s.tickets[k]=ticket;s.profileIds[k]=profiles[seat].id;s.jobs[k]=job }
        }
        if(s.jobs.all{it==0L}) { logger("transition ticketWait frames=0 waitMs=0.0 tickets=0");hooks.startReady(s);return s }
        start=s;s.careerMessage=careerMessage[0];careerMessage[0]=SAVING_TICKET;hooks.publish(0);hooks.changed()
        return s
    }
    /** BACK while a start waits: the race is not started; tickets already written stay unsettled, like an abandoned race. */
    fun dropStart() { val s=start?:return;start=null;if(careerMessage[0]==SAVING_TICKET)careerMessage[0]=s.careerMessage;logger("transition startDropped frames=${s.frames} waitMs=${(System.nanoTime()-s.requested)/1e6}");hooks.changed() }

    /** finishRace: one seat's settle, submitted as MONEY; its receipt counts once the writer reports it durable. */
    fun settle(seat: Int,change: (Profile)->Unit): Long {
        val job=edit(seat,Kind.MONEY,Purpose.SETTLE,change)
        if(job>0) { settles[job]=seat;results[seat]=Outcome.PENDING } // finishRace rebuilds the UI itself
        return job
    }
    /** Clears the per-race receipt states (lobby). A settle still in flight keeps blocking until the writer reports it. */
    fun clearResults() { for(i in results.indices)if(results[i]!=Outcome.PENDING)results[i]=Outcome.NONE;failure="" }

    /** Applies the writer's completions; call once per render, first. Returns how many completions it applied. */
    fun pump(): Int {
        val done=writer.poll()
        var changed=false
        for(c in done) {
            val job=jobs.remove(c.job)
            logger("transition write seat=${job?.seat?:-1} job=${c.job} kind=${c.kind} purpose=${job?.purpose} status=${c.status} writeMs=${c.writeMs}")
            val settled=settles.remove(c.job)
            if(job==null || keys[job.seat]!=c.slot) { if(settled!=null)changed=true;continue } // an earlier profile of the seat: nothing to show
            val i=job.seat
            when(c.status) {
                Status.OK -> {
                    if(settled!=null) { results[i]=Outcome.COUNTED;changed=true }
                    if(writer.pending(c.slot)==0) { saveStatus[i]="Saved";hooks.publish(i) }
                }
                Status.FAILED -> {
                    val message=when(job.purpose) { Purpose.CHOICE->CHANGE_CANCELLED;Purpose.TICKET->RACE_NOT_STARTED;Purpose.SETTLE->RESULT_NOT_COUNTED }
                    if(settled!=null) { results[i]=Outcome.FAILED;careerMessage[i]=RESULT_NOT_COUNTED }
                    revert(i,message);changed=true
                }
                Status.CANCELLED -> if(settled!=null) { results[i]=Outcome.FAILED;saveStatus[i]=RESULT_NOT_COUNTED;careerMessage[i]=RESULT_NOT_COUNTED;failure=RESULT_NOT_COUNTED;hooks.publish(i);changed=true } // reverted by the failure that cancelled it
                Status.PENDING -> error("poll never reports PENDING")
            }
        }
        start?.let { s ->
            s.frames++
            val statuses=s.jobs.filter{it>0}.map{writer.status(it)}
            if(statuses.any{it==Status.FAILED || it==Status.CANCELLED}) {
                start=null;failure=RACE_NOT_STARTED;careerMessage[0]=RACE_NOT_STARTED;hooks.publish(0);changed=true
                logger("transition ticketWait frames=${s.frames} waitMs=${(System.nanoTime()-s.requested)/1e6} tickets=${statuses.size} status=failed")
            } else if(statuses.all{it==Status.OK}) {
                start=null;failure="";if(careerMessage[0]==SAVING_TICKET)careerMessage[0]=s.careerMessage
                logger("transition ticketWait frames=${s.frames} waitMs=${(System.nanoTime()-s.requested)/1e6} tickets=${statuses.size} status=durable")
                hooks.startReady(s)
            }
        }
        if(changed)hooks.changed()
        return done.size
    }
    private fun revert(seat: Int,message: String) {
        val durable=writer.durable(keys[seat])?:return
        profiles[seat]=durable;saveStatus[seat]=message;failure=message
        if(message==RACE_NOT_STARTED)careerMessage[0]=message
        logger("transition revert seat=$seat reason=\"$message\"")
        hooks.reverted(seat)
    }

    /** pause(): bounded drain so a backgrounded app has its saves on disk. Stays well under libGDX 1.13.5's 4,000 ms pause kill. */
    fun pause(timeoutMs: Long=PAUSE_DRAIN_MS): Boolean {
        val started=System.nanoTime();val drained=writer.drain(timeoutMs)
        if(!drained)logger("transition pauseDrain drained=false ms=${(System.nanoTime()-started)/1e6} (queued saves are kept)")
        return drained
    }
    /** dispose(): drains, then stops taking saves; queued saves are still written. */
    fun close(timeoutMs: Long=CLOSE_DRAIN_MS): Boolean = writer.close(timeoutMs).also { if(!it)logger("transition closeDrain drained=false") }

    companion object {
        const val SAVING_TICKET="Saving race ticket..."
        const val SAVING_RESULT="Saving result..."
        const val CHANGE_CANCELLED="Save failed - change cancelled"
        const val RACE_NOT_STARTED="Save failed - race not started"
        const val RESULT_NOT_COUNTED="Save failed - result not counted"
        const val PAUSE_DRAIN_MS=1_500L
        const val CLOSE_DRAIN_MS=2_000L
        const val LOAD_DRAIN_MS=2_000L
    }
}
