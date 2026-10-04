package dev.deathride.core

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import kotlin.math.*

class TrackQualityTest {
    @Test fun plantedBadCoursesAndEveryThresholdBoundaryFire() {
        val evidence = qualityMutantEvidence()
        assertTrue(evidence.count { it["kind"] == "planted course" } >= 6)
        for (row in evidence) assertEquals(true, row["fired"], row.toString())
        assertTrue(TrackQuality.gates(emptyMap(), setOf("geometry", "lap", "simulation", "evidence")).all { it["status"] == "unmeasured" })
    }

    @Test fun geometryUsesPhysicalUnitsArcLengthAndCyclicRuns() {
        val c = Courses.all.first(); val g = qualityGeometry(c)
        assertEquals(c.lengthM, g.values.getValue("lengthM"))
        assertEquals(c.width.min() * 2 / CarShapes.all.maxOf { it.widthM }, g.values.getValue("minWidthW"))
        val runs = qualityRuns(c) { if (it < 10 || it >= c.count - 10) 1 else 0 }
        assertEquals(2, runs.size); assertEquals(c.lengthM, runs.sumOf { it.lengthM }, 1e-8)
        val turned = qualityGeometry(qualityClone(c, c.nodes.map { it.copy(x = -it.y, y = it.x) }))
        for (key in listOf("lengthM", "minRadiusL", "minWidthW", "straightFraction", "cornerCount", "radiusEntropy"))
            assertEquals(g.values.getValue(key), turned.values.getValue(key), 1e-6, key)
        assertEquals(0.0, TrackQuality.entropy(listOf(12.0)))
        assertEquals(1.0, TrackQuality.entropy(listOf(10.0, 10.0)), 1e-9)
    }

    @Test fun sixCarTrialsReplayAndSeedsChangeObservedTrajectories() {
        val c = Courses.all.first()
        val a = qualityTrial(c, 7319, 0, limitSeconds = 15.0)
        val b = qualityTrial(c, 7319, 0, limitSeconds = 15.0)
        val other = qualityTrial(c, 112048, 0, limitSeconds = 15.0)
        assertEquals(a.hash, b.hash); assertEquals(a.trajectoryHash, b.trajectoryHash)
        assertEquals(TrackQuality.json(a.data(true)), TrackQuality.json(b.data(true)))
        assertNotEquals(a.trajectoryHash, other.trajectoryHash)
        assertEquals(6, a.assignments.size); assertTrue(a.assignments.all { it["human"] == false })
        assertTrue(a.heat.exposure.sum() > 0); assertTrue(a.distanceM > 0)
        assertEquals("right-censored-timeout", a.stoppingReason)
        val identities = (0..5).map { qualityWorld(c, 7319, it).cars[0].carClass!!.id }
        assertTrue(identities.distinct().size > 1)
        assertEquals(48, a.heat.lines.size); assertEquals(9, a.heat.lines.first().size)
    }

    @Test fun passCounterRejectsJitterDeathAndFinishPromotions() {
        val counter = QualityPassCounter(2.0, .5)
        assertFalse(counter.observe(0, 1, -3.0, true, .1))
        repeat(10) { assertFalse(counter.observe(0, 1, if (it % 2 == 0) .2 else -.2, true, .1)) }
        repeat(4) { assertFalse(counter.observe(0, 1, 3.0, true, .1)) }
        assertTrue(counter.observe(0, 1, 3.0, true, .1))
        assertFalse(counter.observe(0, 1, -3.0, false, 1.0))
        assertFalse(counter.observe(0, 1, -3.0, true, 1.0))
    }

    @Test fun noExposureAndCensoredOutcomesNeverBecomeSuccesses() {
        val heat = QualityHeat(); val data = heat.data()
        assertTrue((data["meanSpeedMps"] as List<*>).all { it == null })
        assertNull(qualityWilson(0, 0)); assertTrue(qualityWilson(0, 72)!![1] > 0)
        assertEquals("{\"s\":\"\\u003cscript>\\n\\\"\",\"v\":null}", TrackQuality.json(mapOf("s" to "<script>\n\"", "v" to Double.NaN)))
    }
}
