package dev.deathride.core

/** Observational, bounded fixed-step output. Never participates in simulation hashes.
 * Slots are reused; consumers must copy values if they need to keep an event.
 * No sound API, vibration policy, wall clock or allocation belongs in the producer.
 */
enum class PresentationKind { FIRE, HIT, MINE_ARM, MINE_BLAST, CAR_CONTACT, WALL_CONTACT, BARRIER_CONTACT, PICKUP, WRECK, ABILITY }

class PresentationEvent {
    var serial=0L; internal set
    var kind=PresentationKind.FIRE; internal set
    var actor=0; internal set
    var target=-1; internal set
    var detail=0; internal set
    var x=0.0; internal set
    var y=0.0; internal set
    var strength=1.0; internal set
    var seconds=0.0; internal set
}

class PresentationEvents(val capacity: Int=128) {
    init { require(capacity in 1..1024) }
    private val slots=Array(capacity){PresentationEvent()}
    private var read=0
    var size=0; private set
    private var serial=0L
    var enabled=false
    var dropped=0L; private set
    fun emit(kind: PresentationKind,actor: Int,target: Int=-1,detail: Int=0,
             x: Double,y: Double,strength: Double=1.0,seconds: Double) {
        if(!enabled)return
        if(size==capacity){read=(read+1)%capacity;size--;dropped++}
        val event=slots[(read+size)%capacity]
        event.serial=++serial;event.kind=kind;event.actor=actor;event.target=target;event.detail=detail
        event.x=x;event.y=y;event.strength=strength;event.seconds=seconds;size++
    }
    fun poll(): PresentationEvent? {
        if(size==0)return null
        val event=slots[read];read=(read+1)%capacity;size--;return event
    }
    /** Serial remains monotonic across a world reset so old events cannot replay. */
    fun clear(){read=0;size=0}
}
