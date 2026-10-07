package dev.deathride.game

/**
 * P13e: how the scenery bake is submitted to the GPU. Every shape draws the same pixels into the same 2048 px target, in the
 * same order; only where the FBO passes end, and how they are synced, moves.
 *
 * P13e found the course-switch gap (a ~100 ms GPU job about 10 bake passes in, P13d) is the bake's full-target ground tile:
 * one textured quad over all 2048 x 2048 px, about 100-130 ms of GPU on the Stick. The driver defers FBO passes and runs them
 * together about 10 passes in (or when the target is first sampled), so that one draw stalled a lobby frame. [SHIPPED] draws
 * the same quad [groundBands] times through a scissor of one row band each, one band per pass, and glFinishes each band's
 * pass, so each band's 6-8 ms of GPU runs in its own frame.
 *
 * @param groundBands scissored row bands of the ground draw, one per pass (1: one draw, as before; -1: none, diagnostic)
 * @param bandSync how a band's pass is submitted: [SYNC_NONE], [SYNC_FLUSH] or [SYNC_FINISH] (the target still bound)
 * @param skipCreationFrame the frame that creates the scene (a course switch's frame) runs no pass
 * @param passLimit at most this many passes (0: budget slices only; see [BakePasses])
 * @param finishSlices glFinish at the end of every pass (diagnostic)
 */
data class BakeShape(val groundBands: Int,val bandSync: Int,val skipCreationFrame: Boolean,val passLimit: Int=0,val finishSlices: Boolean=false) {
    companion object {
        const val SYNC_NONE=0
        const val SYNC_FLUSH=1
        const val SYNC_FINISH=2
        /** The shipped bake (P13e): the ground in 16 finished bands, none in the switch frame. */
        val SHIPPED=BakeShape(16,SYNC_FINISH,true)
        /** The bake before P13e: one ground draw in the first pass (the switch frame), nothing synced. */
        val UNBANDED=BakeShape(1,SYNC_NONE,false)
        /** The scissor rows of [bands] bands over a [size]-pixel target: [y0, y1) pairs, contiguous, covering 0 until size once. */
        fun rows(size: Int,bands: Int)=List(bands){size*it/bands to size*(it+1)/bands}
    }
}
