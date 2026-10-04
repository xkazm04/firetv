package dev.deathride.core

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import kotlin.math.abs

class TrackShapeTest {
    @Test fun everyShapeGateHasAnActualPlantedGeometryWitness() { shapeProof().forEach { assertEquals(true,it["fired"],it.toString()) } }
    @Test fun oldLibraryCannotPassAsMastered() {
        for(c in Courses.all.filter{it.raceProfile==null}) assertTrue(shapeGates(trackShape(c).metrics).any { it["status"]=="flag" },c.id)
    }
    @Test fun installedComposerCoursesPassTheShapeContract() {
        for(c in Courses.all.filter{it.raceProfile!=null})assertTrue(shapeGates(trackShape(c).metrics).all{it["status"]=="pass"},c.id)
    }
    @Test fun circleHullAndTurningHaveKnownAnswers() {
        val s=trackShape(shapeFixtures().getValue("circle"))
        assertEquals(1.0,s.metrics.getValue("hullPerimeterRatio"),.002)
        assertEquals(1.0,s.metrics.getValue("hullAreaPacking"),.003)
        assertEquals(360.0,abs(s.metrics.getValue("signedTurnDegrees")),.001)
        assertEquals(0.0,s.metrics.getValue("crossings"))
        assertTrue(shapeGates(emptyMap()).all { it["status"]=="unmeasured" })
    }
    @Test fun shapeMetricsAreRotationAndTranslationInvariant() {
        val c=Courses.all.first();val a=trackShape(c);val b=trackShape(qualityClone(c,c.nodes.map { it.copy(x=-it.y+45,y=it.x-98) }))
        for(key in a.metrics.keys)assertEquals(a.metrics.getValue(key),b.metrics.getValue(key),1e-6,key)
        assertTrue(shapeSimilarity(a,b).getValue("outlineDistance")<.001)
    }
}
