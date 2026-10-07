package dev.deathride.game

/**
 * P13e: how the scenery bake's steps are cut into FBO passes (one pass per frame, each binding the scenery target once).
 * GL-free, so the pass bound and the step order are tested on the JVM.
 *
 * With [limit] 0 a pass runs steps until [budgetMs] is spent: today's slices (`sceneryBuildBudgetMs`, 3 ms), 49-130 passes
 * per bake on the Stick. With a [limit] the [limit]-th pass runs every step left, so a bake never takes more passes than
 * that, plus one if it has to wait for the course worker's bins (that pass ends at the wait, and TrackScene binds nothing
 * on the frames it waits; P13d: no bake waited). Either way the steps run once each, in the sequence's own order; only
 * where a pass ends moves.
 */
class BakePasses(val limit: Int,val budgetMs: Double) {
    /** Passes run so far: frames that bound the target. */
    var passes=0;private set
    /** Runs one pass. [step] runs the next step and returns false when the bake has none left; [waiting] ends the pass early
     * (the bake waits for the course worker's bins). Returns true when the bake finished in this pass. */
    inline fun pass(now: ()->Long,step: ()->Boolean,waiting: ()->Boolean): Boolean {
        val last=limit>0 && passes>=limit-1
        val deadline=now()+(budgetMs*1e6).toLong()
        var finished=false
        do {
            if(!step()){finished=true;break}
        } while(!waiting() && (last || now()<deadline))
        passed()
        return finished
    }
    fun passed() { passes++ }
    companion object {
        /** Bake work a limited plan spreads over its passes: the slowest warm bake on the Stick was 350 ms (foundry-1-c, P13d). */
        const val SPREAD_MS=360.0
        /** The plan of a pass limit (0: today's budget slices of [sliceBudgetMs]). */
        fun of(limit: Int,sliceBudgetMs: Double)=BakePasses(limit,if(limit>0)SPREAD_MS/limit else sliceBudgetMs)
    }
}
