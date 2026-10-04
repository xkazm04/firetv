package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import java.io.File

class TrackContentTest {
    @Test fun remainingFeatureVocabularyLengthGridAndRecoveryRulesHaveMutants() {
        val c=Courses.all[5];val f=c.features.single{it.kind=="shortcut"}
        fun copy(id: String=c.id,theme: String=c.theme,nodes: List<TrackNode> = c.nodes,spots: List<TrackSpot> = c.spots,features: List<TrackFeature> = listOf(f))=Course(id,c.name,c.lesson,c.startFraction,theme,nodes,spots,features)
        assertEquals(emptyList<String>(),TrackContent.errors(c))
        val middle=(f.start+f.end)*.5;val relative=(middle-c.startFraction+1)%1
        val mutants=listOf(
            "unknown theme" to copy(theme="void"),
            "surface outside theme vocabulary" to copy(nodes=c.nodes.map{it.copy(surface=Surfaces.practice.first{s->s.id=="Ice"})}),
            "invalid competitive pool" to copy(id="missing-pool"),
            "unknown feature" to copy(features=listOf(f.copy(kind="teleport"))),
            "feature surface outside theme" to copy(features=listOf(f.copy(surface=Surfaces.practice.first{it.id=="Ice"}))),
            "feature too short" to copy(features=listOf(f.copy(end=f.start+.00001))),
            "feature covers grid" to copy(spots=c.spots+TrackSpot("grid",relative,f.laneM)),
            "hazard denies feature recovery" to copy(spots=c.spots+TrackSpot("hazard",relative,f.laneM)),
            "features lack recovery gap" to copy(features=listOf(f,f)))
        for((rule,mutant) in mutants)assertTrue(TrackContent.errors(mutant).any{it.contains(rule)},"mutant must kill $rule")
    }
    @Test fun storedPlansThemesAndPoolsAreCompleteAndDistinct() {
        assertTrue(Courses.all.size>=24);assertTrue(TrackContent.themes.size>=4)
        assertEquals(Courses.all.size,Courses.all.map{it.id}.toSet().size)
        assertEquals(Courses.all.size,Courses.all.map{it.nodes.map{n->n.x to n.y}}.toSet().size)
        assertEquals(Courses.all.map{it.id}.toSet(),TrackContent.pools.keys)
        assertTrue(TrackContent.features.keys.all{id->Courses.all.any{it.id==id}})
        assertTrue(Courses.all.drop(5).filter{it.raceProfile==null}.all{it.features.map{f->f.kind}.toSet()==setOf("acceleration","shortcut")})
        assertTrue(Courses.all.count{it.pool.eligible().size<CarCatalog.all.size}>=16)
        assertTrue(TrackContent.themes.all{t->t.surfaces.all{s->Surfaces.all.any{it.id==s}} && t.paletteKey.isNotBlank() && t.hazards.isNotEmpty()})
    }
    @Test fun shortcutsSaveDistanceAtARealGripCostAndHaveAnAiConsumer() {
        val p=TrackPoint();val q=TrackPoint()
        for(c in Courses.all.drop(5).filter{it.raceProfile==null}) {
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
        val input=Array(6){InputFrame()};val csv=StringBuilder("course,theme,seed,eligibleCars,lengthM,seconds,finished,hash,laps\n")
        // Legacy 180 s / Club pool regression; installed courses have separate 72-trial event-tier proof.
        for(course in Courses.all.filter{it.raceProfile==null})repeat(8){seed->
            fun make()=World(seed*7919+113,track=Track(course=course)).also{w->course.pool.populate(w);for(c in w.cars)c.aiSkill=Career.difficulties[1].skill;w.reset()}
            val w=make();assertTrue(w.cars.all{course.pool.allows(it.carClass!!)})
            while(w.finished<6 && w.seconds<180)w.step(input)
            assertEquals(6,w.finished,"${course.id}/$seed")
            if(seed==0){val replay=make();repeat(w.steps){replay.step(input)};assertEquals(w.stateHash(),replay.stateHash())}
            csv.append("${course.id},${course.theme},$seed,${course.pool.eligible().size},${course.lengthM},${w.seconds},${w.finished},${w.stateHash()},${w.raceLaps}\n")
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
