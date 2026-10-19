package dev.deathride.core

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.util.Random
import java.util.concurrent.TimeUnit

/** Prewarming moves the bin bake off the render thread; it must not change a single projection. */
class CoursePrewarmTest {
    /** The P9 soak cycle (one course per theme, all with branches) plus playable courses with junctions, where project() takes the hint path. */
    private val ids=listOf("scrap-1-c","foundry-1-c","salt-1-b","switchback-1-a","crown-1-a")+
        Courses.playableIndices.map{Courses.id(it)}.filter{TrackJunctions.load(it).isNotEmpty()}.take(2)
    /** A fresh instance, built exactly as [Courses] builds it, so its bins have not been touched by any other test. */
    private fun fresh(id: String): Course { val c=Courses.course(Courses.indexOf(id));return Course(c.id,c.name,c.lesson,c.startFraction,c.theme,c.nodes,c.spots) }

    @Test fun prewarmedProjectionEqualsTheLazyPathOnFixedPoints() {
        assertTrue(ids.size>=6,"courses $ids")
        var checked=0
        for(id in ids) {
            val lazy=fresh(id);val warm=fresh(id)
            assertFalse(lazy.projectionReady,"$id: a new course must not bake its bins at construction")
            assertFalse(warm.projectionReady)
            CoursePrewarm.submit(warm).get(60,TimeUnit.SECONDS)
            assertTrue(warm.projectionReady,"$id: prewarm leaves the bins and every branch's baked")
            assertFalse(lazy.projectionReady,"$id: prewarming one instance must not bake another")
            val random=Random(23);val p=TrackPoint();val got=Projection();val want=Projection()
            repeat(1200) { n->
                val s=random.nextDouble()*lazy.lengthM;lazy.sample(s,0.0,p)
                // On the road, on the verge, well off it, and every 10th point outside the baked bounds (clamped bins).
                val reach=if(n%10==0)lazy.maxX-lazy.minX else lazy.width.max()+12.0
                val px=p.x+(random.nextDouble()*2-1)*reach;val py=p.y+(random.nextDouble()*2-1)*reach
                val hint=if(n%2==0)Double.NaN else s;val route=n%(lazy.branches.size+1)
                lazy.project(px,py,want,hint,route);warm.project(px,py,got,hint,route)
                assertEquals(want.s.toRawBits(),got.s.toRawBits(),"$id s at $px,$py");assertEquals(want.distance.toRawBits(),got.distance.toRawBits(),"$id distance")
                assertEquals(want.nx.toRawBits(),got.nx.toRawBits(),"$id nx");assertEquals(want.ny.toRawBits(),got.ny.toRawBits(),"$id ny")
                assertEquals(want.route,got.route,"$id route");checked++
            }
            assertTrue(lazy.projectionReady,"$id: the lazy path bakes on first project()")
            assertEquals(lazy.projectionInts(),warm.projectionInts(),"$id: same bins either way")
        }
        assertEquals(ids.size*1200,checked)
    }

    @Test fun prewarmRunsOnTheCourseWorkerAndThenRunsAfterTheBake() {
        val index=Courses.indexOf("crown-1-a")
        var thread="";var readyWhenThen=false
        CoursePrewarm.submit(index){ thread=Thread.currentThread().name;readyWhenThen=Courses.course(index).projectionReady }.get(60,TimeUnit.SECONDS)
        assertEquals("deathride-course-bake",thread)
        assertTrue(readyWhenThen,"then() runs after the bins are baked")
    }

    /** Step 4 of the P10 brief: retained bins per soak course, for the unattributed PSS rise. Desktop JVM; reported, not graded. */
    @Test fun reportsTheBinFootprintOfTheSoakCourses() {
        for(id in ids.take(5)) {
            val c=fresh(id);val started=System.nanoTime();c.prewarmProjection();val ms=(System.nanoTime()-started)/1e6
            val ints=c.projectionInts();val arrays=c.projectionBinArrays()
            assertTrue(ints>0 && arrays>0)
            println("P10 bins $id ints=$ints arrays=$arrays branches=${c.branches.size} intBytes=${ints*4} desktopBakeMs=${String.format(java.util.Locale.ROOT,"%.1f",ms)}")
        }
    }
}
