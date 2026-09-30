package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import java.io.File
import kotlin.math.*

class TracksTest {
    @Test fun longCarHasContactThroughItsMiddle() {
        val w=World();val a=w.cars[0];val b=w.cars[1]
        CarCatalog.apply(a,CarCatalog.all.indexOfFirst { it.id=="Comet" })
        a.x=0.0;a.y=0.0;a.heading=0.0
        b.spec=b.spec.copy(circleOffsetM=0.0,circleRadiusM=.5)
        b.x=0.0;b.y=a.spec.circleRadiusM+.4;b.heading=0.0
        val before=b.y-a.y;w.collide(a,b)
        assertTrue(b.y-a.y>before,"The drawn middle of a long car must not have a collision hole")
    }
    @Test fun scaleContractIsPhysicalReadableAndVaried() {
        val line=CarShapes.forId("Line")
        assertEquals(7.8,line.lengthM,1e-9);assertEquals(3.75,line.widthM,1e-9)
        for(shape in CarShapes.all)assertTrue(shape.lengthM*VisualTuning["minPixelsPerM"]>=VisualTuning["minimumCarPixels"],shape.id)
        val masses=CarCatalog.all.map { it.spec().massKg }
        assertTrue(masses.max()/masses.min()>2.7)
        val c=Courses.all[0]
        val duplicate=c.spots.map { if(it.kind=="grid")it.copy(fraction=-.02,laneM=0.0) else it }
        assertTrue(TrackLinter.errors(Course(c.id,c.name,c.lesson,c.startFraction,c.theme,c.nodes,duplicate)).any { it.contains("grid cars overlap") })
    }
    @Test fun allAuthoredContentPassesGeometryAndPacingLint() {
        assertEquals(5,Courses.all.size)
        for(c in Courses.all)assertEquals(emptyList<String>(),TrackLinter.errors(c),c.id)
        for(car in CarCatalog.all) { val shape=CarShapes.forId(car.id);val spec=car.spec();assertEquals(shape.widthM,spec.circleRadiusM*2);assertEquals(shape.lengthM,(spec.circleOffsetM+spec.circleRadiusM)*2) }
    }
    @Test fun linterRejectsNarrowReorderedAndCrossingCourses() {
        val c=Courses.all[0]
        fun copy(nodes: List<TrackNode> = c.nodes,spots: List<TrackSpot> = c.spots)=Course("bad",c.name,c.lesson,c.startFraction,c.theme,nodes,spots)
        assertTrue(TrackLinter.errors(copy(nodes=c.nodes.map{it.copy(width=2.0)})).any{it.contains("narrower")})
        assertTrue(TrackLinter.errors(copy(spots=c.spots.map{if(it.kind=="checkpoint" && it.fraction==.45)it.copy(fraction=.1) else it})).any{it.contains("order")})
        val crossing=listOf(TrackNode(-80.0,60.0,9.0,Surfaces.asphalt,0.0),TrackNode(80.0,-60.0,9.0,Surfaces.asphalt,0.0),TrackNode(-80.0,-60.0,9.0,Surfaces.asphalt,0.0),TrackNode(80.0,60.0,9.0,Surfaces.asphalt,0.0),TrackNode(-80.0,60.0,9.0,Surfaces.asphalt,0.0))
        assertTrue(TrackLinter.errors(copy(nodes=crossing)).any{it.contains("overlap")})
    }
    @Test fun samplingProjectionAndSequentialGatesAgree() {
        val p=TrackPoint();val projection=Projection()
        for(course in Courses.all) {
            val t=Track(course=course);val lap=LapCounter(t.lengthM,t.startM,course.checkpoints)
            lap.reset(t.startM-1)
            for(i in 0..(t.lengthM*4).toInt()) { val s=t.startM-1+i*.5;t.sample(s,2.0,p);t.project(p.x,p.y,projection);assertEquals(2.0,projection.distance,.2);lap.update(projection.s) }
            assertEquals(1,lap.laps,course.id)
        }
    }
    @Test fun sixCarsFinishEveryCourseAndReplayDeterministically() {
        val csv=StringBuilder("track,seed,finished,seconds,contactSteps,hash\n");val input=Array(6){InputFrame()}
        for(c in Courses.all)repeat(4) { seed ->
            val a=World(seed,track=Track(course=c));val b=World(seed,track=Track(course=c))
            for(w in arrayOf(a,b)) { for(car in w.cars)CarCatalog.apply(car,car.id%5);w.reset() }
            var contacts=0
            while(a.finished<6 && a.seconds<TrackRules["maxRaceSeconds"]) { a.step(input);b.step(input);if(a.ramClosingMps.any { it>0 })contacts++ }
            csv.append("${c.id},$seed,${a.finished},${a.seconds},$contacts,${a.stateHash()}\n")
            assertTrue(contacts>0,"${c.id}: expected physical competition between cars")
            assertEquals(a.stateHash(),b.stateHash());assertEquals(6,a.finished,"${c.id}: ${a.cars.map{it.lap.laps}}")
        }
        File("build/reports/balance/w6-tracks.csv").apply{parentFile.mkdirs();writeText(csv.toString())}
    }
    @Test fun authoredCourseStepAllocatesNothing() {
        val bean=java.lang.management.ManagementFactory.getThreadMXBean() as com.sun.management.ThreadMXBean
        bean.isThreadAllocatedMemoryEnabled=true
        val w=World(track=Track(course=Courses.all[3]));val input=Array(6){InputFrame()};for(c in w.cars)CarCatalog.apply(c,c.id%5)
        repeat(60000){w.step(input)};val id=Thread.currentThread().id;val before=bean.getThreadAllocatedBytes(id)
        repeat(10000){w.step(input)};assertEquals(0L,bean.getThreadAllocatedBytes(id)-before)
    }
}
