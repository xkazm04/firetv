package dev.deathride.core

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.io.File

class VergeTest {
    @Test fun everyCarCanReachVergeSlowdownWhileContainedByEitherWall() {
        val input=Array(6){InputFrame()};val rows=StringBuilder("car,side,radius,centreLateral,oldCentreSurface,footprintSurface,asphaltSpeed,vergeSpeed\n")
        var failures=0
        for(index in CarCatalog.all.indices)for(side in intArrayOf(-1,1)) {
            val w=World();val c=w.cars[0];CarCatalog.apply(c,index);w.reset()
            for(other in w.cars)other.entered=other===c
            c.human=true;val radius=c.spec.circleRadiusM;val width=w.track.halfWidthM
            fun coast(lane: Double): Double {
                val p=TrackPoint();w.track.sample(40.0,lane,p);c.x=p.x;c.y=p.y;c.heading=p.heading;c.vx=20.0;c.vy=0.0;c.yaw=0.0
                w.contain(c);w.step(input);return c.speedMps
            }
            val asphalt=coast(0.0);assertEquals(Surfaces.asphalt,c.surface)
            val lane=side*(width-radius-.2);val verge=coast(lane)
            val projection=Projection();w.track.project(c.x,c.y,projection)
            assertTrue(kotlin.math.abs(projection.distance)+radius<=width+1e-8)
            val old=w.track.surfaceAt(40.0,lane)
            assertNotEquals(Surfaces.offtrack,old,"centre-only query reproduces the unreachable verge")
            rows.append("${CarCatalog.all[index].id},$side,$radius,$lane,${old.id},${c.surface.id},$asphalt,$verge\n")
            if(c.surface!==Surfaces.offtrack || verge>=asphalt)failures++
            coast(side*(width-Movement.vergeWidthM-Movement.kerbWidthM*.5-radius))
            if(c.surface!==Surfaces.kerb)failures++
        }
        File("build/reports/content/verge.csv").apply{parentFile.mkdirs();writeText(rows.toString())}
        assertEquals(0,failures,"every physical size needs reachable kerb/verge and actual coasting drag")
    }
}
