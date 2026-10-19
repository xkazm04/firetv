package dev.deathride.game

/** P13d: perf-only arms that find which GL change of a course switch triggers the GPU job the driver runs 10 frames later
 * (P13c: the interval 11 frames after every switch frame, 101-112 ms). Only the debuggable dev.deathride.perf launcher reads
 * the switch (intent extra `switchArm`); every other build runs [OFF]. The P13d arms act on the region tiles; the P13e arms
 * on how the scenery bake is submitted ([shape]). The P13d, PASSESn and FINISH arms run the bake as it was before P13e
 * ([BakeShape.UNBANDED]), as they were measured. */
enum class SwitchArm {
    /** The shipping switch and bake ([BakeShape.SHIPPED]). */
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
    /** P13e: the same in 16 bands: [BakeShape.SHIPPED], the same as [OFF]. */
    BANDS16,
    /** P13e: BANDS8 with glFlush instead of glFinish. */
    BANDS8FLUSH,
    /** P13e: no ground tile at all. Diagnostic only: the scenery differs, so it never ships. */
    NOGROUND,
    /** P13e: the bake before P13e ([BakeShape.UNBANDED]): one ground draw in the switch frame's pass, nothing synced. */
    UNBANDED;
    val id get()=name.lowercase()
    companion object {
        const val DELAY_FRAMES=60
        const val EARLY_FRAMES=30
        const val HOLD_FRAMES=30
        /** P13e: how an arm submits the scenery bake. */
        fun shape(arm: SwitchArm)=when(arm) {
            OFF,BANDS16->BakeShape.SHIPPED
            PASSES9->BakeShape.UNBANDED.copy(passLimit=9)
            PASSES6->BakeShape.UNBANDED.copy(passLimit=6)
            PASSES3->BakeShape.UNBANDED.copy(passLimit=3)
            FINISH->BakeShape.UNBANDED.copy(finishSlices=true)
            GROUND8->BakeShape(8,BakeShape.SYNC_NONE,false)
            GROUND4->BakeShape(4,BakeShape.SYNC_NONE,false)
            GROUND8FINISH->BakeShape(8,BakeShape.SYNC_NONE,false,finishSlices=true)
            BANDS8->BakeShape(8,BakeShape.SYNC_FINISH,true)
            BANDS8FLUSH->BakeShape(8,BakeShape.SYNC_FLUSH,true)
            NOGROUND->BakeShape(-1,BakeShape.SYNC_NONE,false)
            DELAY,SKIP,EARLY,REUSE,HOLDBAKE,FLUSH,FLUSHBOUND,HALFSLICE,NOCLEAR,UNBANDED->BakeShape.UNBANDED
        }
        /** No value is OFF. An unknown value is an error, so a mistyped perf run cannot pass for OFF. */
        fun parse(value: String?)=if(value==null)OFF else entries.firstOrNull{it.id==value}
            ?:throw IllegalArgumentException("switchArm=$value: expected one of ${entries.joinToString{it.id}}")
    }
}
