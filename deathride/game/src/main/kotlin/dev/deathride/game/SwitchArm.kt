package dev.deathride.game

/** P13d: perf-only arms that find which GL change of a course switch triggers the GPU job the driver runs 10 frames later
 * (P13c: the interval 11 frames after every switch frame, 101-112 ms). Only the debuggable dev.deathride.perf launcher reads
 * the switch (intent extra `switchArm`); every other build runs [OFF]. The arms act on the region tiles only. */
enum class SwitchArm {
    /** The shipping switch. */
    OFF,
    /** The replaced tiles are deleted [DELAY_FRAMES] frames after the switch frame, not in it. */
    DELAY,
    /** The switch keeps the previous region's tiles: no delete and no upload. Diagnostic only: the art differs, so it never ships. */
    SKIP,
    /** The new tiles are uploaded in the frame the pick lands; the switch itself runs [EARLY_FRAMES] frames later and only swaps and deletes. */
    EARLY,
    /** The new pixels are uploaded into the previous region's texture objects: no texture is deleted or created. */
    REUSE,
    /** The scenery bake starts [HOLD_FRAMES] frames after the switch frame. Diagnostic only: the course shows late, so it never ships. */
    HOLDBAKE,
    /** glFlush after every bake slice, so each frame's scenery-target rendering is submitted in that frame. */
    FLUSH,
    /** glFlush after every bake slice while the scenery target is still bound (before FrameBuffer.end). */
    FLUSHBOUND,
    /** Each bake slice gets half its CPU budget, so the bake runs about twice as many, smaller FBO passes. Diagnostic only. */
    HALFSLICE,
    /** The bake's first pass paints its ground colour as an opaque full-target rect instead of glClear (the same pixels). */
    NOCLEAR,
    /** P13e: the whole bake runs in at most 9 FBO passes ([BakePasses]); a frame that waits for the bins binds nothing. */
    PASSES9,
    /** P13e: at most 6 FBO passes. */
    PASSES6,
    /** P13e: at most 3 FBO passes. */
    PASSES3,
    /** P13e: glFinish at the end of every bake slice, the target still bound (today's slices otherwise). Diagnostic only. */
    FINISH,
    /** P13e: the bake's full-target ground tile drawn through 8 scissored row bands, one band per pass (the same pixels). */
    GROUND8,
    /** P13e: the same in 4 bands. */
    GROUND4,
    /** P13e: GROUND8 with glFinish at the end of every slice, so each band's GPU time shows in its slice. Diagnostic only. */
    GROUND8FINISH,
    /** P13e: the ground in 8 scissored bands, glFinish at the end of each band's pass, no pass in the switch frame. */
    BANDS8,
    /** P13e: the same in 16 bands. */
    BANDS16,
    /** P13e: BANDS8 with glFlush instead of glFinish. */
    BANDS8FLUSH,
    /** P13e: no ground tile at all. Diagnostic only: the scenery differs, so it never ships. */
    NOGROUND;
    val id get()=name.lowercase()
    companion object {
        const val DELAY_FRAMES=60
        const val EARLY_FRAMES=30
        const val HOLD_FRAMES=30
        /** P13e: the pass limit of a PASSESn arm, 0 for every other arm. */
        fun passLimit(arm: SwitchArm)=when(arm){PASSES9->9;PASSES6->6;PASSES3->3;else->0}
        /** P13e: the ground bands of an arm: 1 (one draw) for every arm but GROUNDn, -1 for NOGROUND. */
        /** P13e: how a band's pass is submitted (0 as any pass, 1 glFlush, 2 glFinish). */
        fun bandSync(arm: SwitchArm)=when(arm){BANDS8,BANDS16->2;BANDS8FLUSH->1;else->0}
        fun groundBands(arm: SwitchArm)=when(arm){GROUND8,GROUND8FINISH,BANDS8,BANDS8FLUSH->8;BANDS16->16;GROUND4->4;NOGROUND->-1;else->1}
        /** No value is OFF. An unknown value is an error, so a mistyped perf run cannot pass for OFF. */
        fun parse(value: String?)=if(value==null)OFF else entries.firstOrNull{it.id==value}
            ?:throw IllegalArgumentException("switchArm=$value: expected one of ${entries.joinToString{it.id}}")
    }
}
