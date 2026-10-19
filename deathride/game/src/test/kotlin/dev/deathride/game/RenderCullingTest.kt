package dev.deathride.game

import dev.deathride.core.CarShapes
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import kotlin.math.cos
import kotlin.math.hypot
import kotlin.math.sin

class RenderCullingTest {
    @Test fun viewBoundsCoverTheStageAroundTheFocus() {
        val v=ViewBounds();v.set(100.0,50.0,10.0,padM=0.0)
        // 1280x720 stage, focus at (640,350): 64 m left/right, 35 m down, 37 m up at 10 px/m.
        assertTrue(v.sees(100.0,50.0,0.0))
        assertTrue(v.sees(164.0,50.0,0.0));assertFalse(v.sees(164.1,50.0,0.0))
        assertTrue(v.sees(36.0,50.0,0.0));assertFalse(v.sees(35.9,50.0,0.0))
        assertTrue(v.sees(100.0,87.0,0.0));assertFalse(v.sees(100.0,87.1,0.0))
        assertTrue(v.sees(100.0,15.0,0.0));assertFalse(v.sees(100.0,14.9,0.0))
        // A circle that straddles the edge is kept; one that only reaches it is kept; one that does not is culled.
        assertTrue(v.sees(170.0,50.0,6.0));assertFalse(v.sees(171.0,50.0,6.0))
    }
    @Test fun allNeverCulls() {
        assertTrue(ViewBounds.ALL.sees(1e9,-1e9,0.0))
        assertTrue(ViewBounds.ALL.seesBox(-5e8f,-5e8f,5e8f,5e8f))
    }
    @Test fun boxesAreCulledOnlyWhenFullyOutside() {
        val v=ViewBounds();v.set(0.0,0.0,10.0,padM=0.0)
        assertTrue(v.seesBox(60f,0f,80f,10f));assertFalse(v.seesBox(64.5f,0f,80f,10f))
        assertTrue(v.seesBox(-200f,-200f,200f,200f))
    }
    @Test fun carShapeCacheReturnsTheCatalogRow() {
        for(shape in CarShapes.all)assertSame(CarShapes.forId(shape.id),CarShapeCache.of(shape.id))
    }
    @Test fun tyreDiscsFollowTheCarAndBoundTheOverlay() {
        val rig=WheelRig(1);val xs=FloatArray(2);val ys=FloatArray(2)
        for(shape in CarShapes.all) {
            val l=shape.lengthM.toFloat();val w=shape.widthM.toFloat()
            val radius=rig.tyreDiscs(shape.id,l,w,0f,0f,0.0,xs,ys,0)
            assertEquals(xs[0],xs[1],1e-5f);assertEquals(-ys[0],ys[1],1e-5f)
            assertTrue(xs[0]>0f && xs[0]<l*.5f,"front axle of ${shape.id} is ahead of centre")
            val g=WheelRig.Geometry.of(shape.id)
            // Outline rect is tl*1.08 by tw*1.12: its corner must lie inside the disc.
            assertTrue(radius>=.5f*hypot(g.tyreLength*l*1.08f,g.tyreWidth*w*1.12f))
            // Rotating the car rotates the discs about its position.
            val heading=1.1;val px=7f;val py=-3f
            val xr=FloatArray(2);val yr=FloatArray(2)
            rig.tyreDiscs(shape.id,l,w,px,py,heading,xr,yr,0)
            for(k in 0..1) {
                val ex=px+(xs[k]*cos(heading)-ys[k]*sin(heading)).toFloat();val ey=py+(xs[k]*sin(heading)+ys[k]*cos(heading)).toFloat()
                assertEquals(ex,xr[k],1e-4f);assertEquals(ey,yr[k],1e-4f)
            }
        }
    }
}
