package dev.deathride.core

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.util.Random

/** The binned projection must equal an exhaustive nearest-segment scan, bit for bit, for every in-bounds point. */
class ProjectionBinsTest {
    private fun brute(c: Course,px: Double,py: Double,out: Projection) {
        var best=Double.POSITIVE_INFINITY;var chosen=0
        for(i in 0 until c.count) {
            val dx=c.x[i+1]-c.x[i];val dy=c.y[i+1]-c.y[i];val inv=1/(dx*dx+dy*dy)
            val t=((px-c.x[i])*dx+(py-c.y[i])*dy)*inv
            val u=t.coerceIn(0.0,1.0);val a=px-c.x[i]-dx*u;val b=py-c.y[i]-dy*u
            val d=a*a+b*b;if(d<best){best=d;chosen=i}
        }
        val i=chosen;val dx=c.x[i+1]-c.x[i];val dy=c.y[i+1]-c.y[i];val inv=1/(dx*dx+dy*dy)
        val u=(((px-c.x[i])*dx+(py-c.y[i])*dy)*inv).coerceIn(0.0,1.0)
        val len=c.arc[i+1]-c.arc[i];out.s=c.arc[i]+u*len;out.nx=-dy/len;out.ny=dx/len
        out.distance=(px-c.x[i]-u*dx)*out.nx+(py-c.y[i]-u*dy)*out.ny
    }
    @Test fun binnedProjectionEqualsExhaustiveScan() {
        val random=Random(11);val got=Projection();val want=Projection();val p=TrackPoint()
        var checked=0
        for(course in Courses.playable.filter { it.branches.isEmpty() && it.junctions.isEmpty() }.take(4)) {
            repeat(1500) {
                course.sample(random.nextDouble()*course.lengthM,0.0,p)
                // On the road, on the verge, and well off it (but inside the baked bounds).
                val reach=course.width.max()+10.0
                val px=p.x+(random.nextDouble()*2-1)*reach;val py=p.y+(random.nextDouble()*2-1)*reach
                course.project(px,py,got);brute(course,px,py,want)
                assertEquals(want.s.toRawBits(),got.s.toRawBits(),"${course.id} s");assertEquals(want.distance.toRawBits(),got.distance.toRawBits(),"${course.id} d")
                assertEquals(want.nx.toRawBits(),got.nx.toRawBits());assertEquals(want.ny.toRawBits(),got.ny.toRawBits());checked++
            }
        }
        assertTrue(checked>=4000,"checked $checked")
    }
}
