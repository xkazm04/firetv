package dev.deathride.game

import java.nio.ByteBuffer

/** P16 pixel proof (perf package, `hudDiff=on` only). On a few frames the HUD is drawn several ways over one copy of the same
 *  world frame, into the real (multisampled) back buffer, and each pair of read-backs is compared here.
 *  Variants: [BASE] the three old font pages, [FONTS] the shared page, [CONTROL] the base drawn again (the GPU's own noise floor). */
object HudDiff {
    const val BASE="base"
    const val FONTS="fonts"
    const val CONTROL="control"
    val VARIANTS=listOf(BASE,FONTS,CONTROL)
    /** Capture points: phase, seconds in that phase. One capture each, in order. */
    val POINTS=listOf("lobby" to 8.0,"lobby" to 20.0,"race" to 8.0,"race" to 16.0,"race" to 24.0,"race" to 32.0)
    /** Differing-pixel bins by the largest channel difference: 1, 2, 3-4, 5-8, 9-16, 17-255. */
    val BINS=intArrayOf(1,2,4,8,16,255)

    class Result(val pixels: Int,val differingRgb: Int,val maxRgb: Int,val bins: IntArray,val differingAlphaOnly: Int,
                 val minX: Int,val minY: Int,val maxX: Int,val maxY: Int) {
        fun json()="{\"pixels\":$pixels,\"differingRgb\":$differingRgb,\"maxChannelDiffRgb\":$maxRgb,\"bins\":{\"1\":${bins[0]},\"2\":${bins[1]},\"3-4\":${bins[2]},\"5-8\":${bins[3]},\"9-16\":${bins[4]},\"17-255\":${bins[5]}}," +
            "\"differingAlphaOnly\":$differingAlphaOnly,\"bbox\":${if(differingRgb==0)"null" else "[$minX,$minY,$maxX,$maxY]"}}"
    }

    /** Compare two RGBA8888 read-backs of [width] x [height] (rows bottom-up, as glReadPixels returns them). RGB decides; the
     *  window is opaque, so alpha is not displayed and is only counted. The box is in read-back coordinates (y up). */
    fun compare(a: ByteBuffer,b: ByteBuffer,width: Int,height: Int): Result {
        var differing=0;var max=0;var alphaOnly=0
        var minX=Int.MAX_VALUE;var minY=Int.MAX_VALUE;var maxX=-1;var maxY=-1
        val bins=IntArray(BINS.size)
        for(y in 0 until height)for(x in 0 until width) {
            val i=(y*width+x)*4
            var d=0
            for(c in 0..2)d=maxOf(d,Math.abs((a.get(i+c).toInt() and 255)-(b.get(i+c).toInt() and 255)))
            if(d==0) { if(a.get(i+3)!=b.get(i+3))alphaOnly++;continue }
            differing++;if(d>max)max=d
            bins[BINS.indexOfFirst{d<=it}]++
            if(x<minX)minX=x;if(y<minY)minY=y;if(x>maxX)maxX=x;if(y>maxY)maxY=y
        }
        return Result(width*height,differing,max,bins,alphaOnly,minX,minY,maxX,maxY)
    }
}
