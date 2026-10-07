package dev.deathride.game

/**
 * P13d: textures a region switch replaced, kept resident [holdFrames] frames after the switch and then released at most one
 * per frame, oldest first. GL-free: [release] is AtlasArt's dispose. A held item's bytes stay counted in [bytes] until its
 * release, so the owner's residency counts both tile sets while they overlap.
 */
class TileRelease<T>(private val holdFrames: Int,private val release: (T)->Unit) {
    private class Held<T>(val item: T,val bytes: Long,val due: Long)
    private val held=ArrayDeque<Held<T>>()
    private var frame=0L
    /** Bytes held and not yet released. */
    var bytes=0L; private set
    val size get()=held.size
    /** Holds [item] until [holdFrames] calls of [frame] have passed; with no hold it is released at once. */
    fun retire(item: T,bytes: Long) {
        if(holdFrames<=0) { release(item);return }
        held.addLast(Held(item,bytes,frame+holdFrames));this.bytes+=bytes
    }
    /** Once per render, before the frame's requests: releases at most one item whose hold has passed. Returns its bytes, 0 for none. */
    fun frame(): Long {
        frame++
        val first=held.firstOrNull()?:return 0
        if(first.due>frame)return 0
        held.removeFirst();bytes-=first.bytes;release(first.item)
        return first.bytes
    }
    /** Releases everything held now (dispose). */
    fun releaseAll() { while(held.isNotEmpty()) { val h=held.removeFirst();bytes-=h.bytes;release(h.item) } }
}
