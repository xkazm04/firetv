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
    NOCLEAR;
    val id get()=name.lowercase()
    companion object {
        const val DELAY_FRAMES=60
        const val EARLY_FRAMES=30
        const val HOLD_FRAMES=30
        /** No value is OFF. An unknown value is an error, so a mistyped perf run cannot pass for OFF. */
        fun parse(value: String?)=if(value==null)OFF else entries.firstOrNull{it.id==value}
            ?:throw IllegalArgumentException("switchArm=$value: expected one of ${entries.joinToString{it.id}}")
    }
}
