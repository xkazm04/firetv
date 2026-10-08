package dev.deathride.game

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.nio.ByteBuffer

/** P16: the pixel-proof comparison counts what the gate reads (RGB pixels, largest channel difference, bins, box). */
class HudDiffTest {
    private fun frame(w: Int,h: Int,fill: Int=40)=ByteBuffer.allocate(w*h*4).also { for(i in 0 until w*h*4)it.put(i,(if(i%4==3)255 else fill).toByte()) }

    @Test fun identicalFramesHaveNoDifference() {
        val r=HudDiff.compare(frame(8,4),frame(8,4),8,4)
        assertEquals(32,r.pixels);assertEquals(0,r.differingRgb);assertEquals(0,r.maxRgb);assertEquals(0,r.differingAlphaOnly)
        assertTrue(r.json().contains("\"bbox\":null"))
    }
    @Test fun countsPixelsByTheirLargestChannelAndBoxesThem() {
        val a=frame(8,4);val b=frame(8,4)
        b.put((1*8+2)*4,41.toByte())                       // (2,1) red +1
        b.put((2*8+5)*4+1,(40+200).toByte())      // (5,2) green +200 (unsigned 240)
        b.put((3*8+7)*4+2,38.toByte());b.put((3*8+7)*4,43.toByte()) // (7,3) blue -2, red +3: largest 3
        b.put((0*8+0)*4+3,0.toByte())                     // (0,0) alpha only
        val r=HudDiff.compare(a,b,8,4)
        assertEquals(3,r.differingRgb);assertEquals(200,r.maxRgb);assertEquals(1,r.differingAlphaOnly)
        assertArrayEquals(intArrayOf(1,0,1,0,0,1),r.bins)
        assertEquals(listOf(2,1,7,3),listOf(r.minX,r.minY,r.maxX,r.maxY))
    }
    @Test fun eachCapturePointHasAPhaseAndTime() {
        assertTrue(HudDiff.POINTS.any{it.first=="lobby"} && HudDiff.POINTS.any{it.first=="race"})
        assertEquals(HudDiff.BASE,HudDiff.VARIANTS.first())
    }
}
