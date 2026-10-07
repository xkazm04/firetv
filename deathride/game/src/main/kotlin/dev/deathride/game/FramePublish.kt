package dev.deathride.game

import dev.deathride.core.*

/**
 * P13c: what a request frame (car pick, start, finish, track switch) no longer does itself. It marks a seat's garage, car
 * and career JSON dirty and asks for a UI rebuild; [frame], first in the next render, rebuilds the UI once and builds at
 * most one dirty seat. A seat's JSON reaches the phone one or two frames after the request, built by the same builders
 * from the same profile and messages ([build]), so the bytes are those an immediate publish of that state would write.
 *
 * The arrays are RaceGame's own (shared by reference). GL-free: [rebuildUi] is RaceGame's.
 */
class FramePublish(
    private val profiles: Array<Profile>,
    private val shopMessage: Array<String>,
    private val saveStatus: Array<String>,
    private val careerMessage: Array<String>,
    private val sink: Sink,
    private val rebuildUi: ()->Unit,
    private val logger: (String)->Unit,
) {
    /** Where a built seat goes: RaceGame writes the slot's carJson, garageJson and careerJson (and hostCareerJson for seat 0). */
    fun interface Sink { fun write(seat: Int,carJson: String,garageJson: String,careerJson: String) }

    private val dirty=BooleanArray(profiles.size)
    private var ui=false
    /** Seat [seat]'s JSON is stale: built by a later [frame] (or [flush]). Two marks before that build it once. */
    fun publish(seat: Int) { dirty[seat]=true }
    fun dirty(seat: Int)=dirty[seat]
    /** A request changed what the TV shows: the next [frame] rebuilds the UI. */
    fun requestUi() { ui=true }
    val uiRequested get()=ui
    /** Any UI rebuild (the 10 Hz cadence included) covers a request made before it. */
    fun uiBuilt() { ui=false }

    /** First in render(): the UI rebuild the previous frame asked for, then at most one dirty seat (lowest first). Returns the seat built, -1 for none. */
    fun frame(): Int {
        if(ui) { val started=System.nanoTime();rebuildUi();ui=false;logger("transition uiDeferred ms=${(System.nanoTime()-started)/1e6}") }
        for(seat in dirty.indices)if(dirty[seat]) { flush(seat);return seat }
        return -1
    }
    /** Builds seat [seat] now if it is dirty: for a reader that needs its JSON within the frame it was published. */
    fun flush(seat: Int) {
        if(!dirty[seat])return
        val started=System.nanoTime()
        build(seat);dirty[seat]=false
        logger("transition flush seat=$seat ms=${(System.nanoTime()-started)/1e6}")
    }
    /** Builds every dirty seat now (create(), before the server serves the first phone). */
    fun flushAll() { for(seat in dirty.indices)if(dirty[seat]) { build(seat);dirty[seat]=false } }
    private fun build(seat: Int) {
        val p=profiles[seat]
        sink.write(seat,DeathDuel.carJson(p),Garage.json(p,shopMessage[seat],saveStatus[seat]),Career.json(p,careerMessage[seat]))
    }
}
