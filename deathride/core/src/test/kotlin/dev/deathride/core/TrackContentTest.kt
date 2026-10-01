package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import java.io.File

class TrackContentTest {
    @Test fun storedPlansThemesAndPoolsAreCompleteAndDistinct() {
        assertTrue(Courses.all.size>=24);assertTrue(TrackContent.themes.size>=4)
        assertEquals(Courses.all.size,Courses.all.map{it.id}.toSet().size)
        assertEquals(Courses.all.size,Courses.all.map{it.nodes.map{n->n.x to n.y}}.toSet().size)
        assertEquals(Courses.all.map{it.id}.toSet(),TrackContent.pools.keys)
        assertTrue(TrackContent.features.keys.all{id->Courses.all.any{it.id==id}})
        assertTrue(Courses.all.drop(5).all{it.features.map{f->f.kind}.toSet()==setOf("acceleration","shortcut")})
        assertTrue(Courses.all.count{it.pool.eligible().size<CarCatalog.all.size}>=16)
        assertTrue(TrackContent.themes.all{t->t.surfaces.all{s->Surfaces.all.any{it.id==s}} && t.paletteKey.isNotBlank() && t.hazards.isNotEmpty()})
    }
    @Test fun shortcutsSaveDistanceAtARealGripCostAndHaveAnAiConsumer() {
        val p=TrackPoint();val q=TrackPoint()
        for(c in Courses.all.drop(5)) {
            val f=c.features.single{it.kind=="shortcut"};val s=(f.start+f.end)*.5*c.lengthM
            assertEquals(f.surface,c.surfaceAt(s,f.laneM));assertTrue(f.surface.gripScale<Surfaces.asphalt.gripScale)
            assertEquals(f.laneM,c.laneAt(s,10));assertEquals(0.0,c.laneAt(s,1))
            fun distance(lane: Double): Double {
                var length=0.0;c.sample(f.start*c.lengthM,lane,p)
                for(i in 1..100){c.sample((f.start+(f.end-f.start)*i/100)*c.lengthM,lane,q);length+=kotlin.math.hypot(q.x-p.x,q.y-p.y);p.x=q.x;p.y=q.y}
                return length
            }
            assertTrue(distance(f.laneM)<distance(0.0)-2,"${c.id}: shortcut must shorten the path")
        }
    }
    @Test fun pacingLinterRejectsUnwarnedOutsideAndNonRiskyFeatures() {
        val c=Courses.all[5];val f=c.features.single{it.kind=="shortcut"}
        fun errors(bad: TrackFeature)=TrackContent.errors(Course(c.id,c.name,c.lesson,c.startFraction,c.theme,c.nodes,c.spots,listOf(bad)))
        assertTrue(errors(f.copy(warningM=0.0)).any{it.contains("warning")})
        assertTrue(errors(f.copy(laneM=-100.0)).any{it.contains("outside road")})
        assertTrue(errors(f.copy(surface=Surfaces.asphalt)).any{it.contains("risk")})
        assertTrue(errors(f.copy(end=f.start)).any{it.contains("interval")})
        assertTrue(errors(f.copy(kind="acceleration")).any{it.contains("bend too sharp")})
    }
    @Test fun competitivePoolsFinishReplayAndPublishPacing() {
        val input=Array(6){InputFrame()};val csv=StringBuilder("course,theme,seed,eligibleCars,lengthM,seconds,finished,hash\n")
        for(course in Courses.all)repeat(8){seed->
            fun make()=World(seed*7919+113,track=Track(course=course)).also{w->course.pool.populate(w);for(c in w.cars)c.aiSkill=Career.difficulties[1].skill;w.reset()}
            val w=make();assertTrue(w.cars.all{course.pool.allows(it.carClass!!)})
            while(w.finished<6 && w.seconds<180)w.step(input)
            assertEquals(6,w.finished,"${course.id}/$seed")
            if(seed==0){val replay=make();repeat(w.steps){replay.step(input)};assertEquals(w.stateHash(),replay.stateHash())}
            csv.append("${course.id},${course.theme},$seed,${course.pool.eligible().size},${course.lengthM},${w.seconds},${w.finished},${w.stateHash()}\n")
        }
        File("build/reports/content/c2-pools.csv").apply{parentFile.mkdirs();writeText(csv.toString())}
    }
    @Test fun newFeatureCourseRetainsAllocationGuarantee() {
        val w=World(track=Track(course=Courses.all[5]));Courses.all[5].pool.populate(w);w.reset();val input=Array(6){InputFrame()}
        val bean=java.lang.management.ManagementFactory.getThreadMXBean() as com.sun.management.ThreadMXBean
        bean.isThreadAllocatedMemoryEnabled=true;repeat(60000){w.step(input)}
        val id=Thread.currentThread().threadId();val before=bean.getThreadAllocatedBytes(id)
        repeat(10000){w.step(input)};assertEquals(0L,bean.getThreadAllocatedBytes(id)-before)
    }
}
