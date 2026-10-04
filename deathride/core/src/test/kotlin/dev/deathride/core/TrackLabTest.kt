package dev.deathride.core

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.io.ByteArrayInputStream
import java.util.zip.ZipInputStream

class TrackLabTest {
    @Test fun everyCourseRoundTripsInExistingCsvWithoutMutatingCatalog() {
        val before = TrackQuality.json(Courses.all.map { qualityCourseData(it) })
        for (c in Courses.all) {
            val csv = TrackLabCodec.csv(c)
            val roundTrip = TrackLabCodec.course(csv + ("id" to c.id))
            assertEquals(TrackQuality.json(qualityCourseData(c)), TrackQuality.json(qualityCourseData(roundTrip)), c.id)
            assertEquals(TrackLinter.errors(c), TrackLinter.errors(roundTrip))
        }
        assertEquals(before, TrackQuality.json(Courses.all.map { qualityCourseData(it) }))
    }

    @Test fun editedZipContainsAllSectionsAndClosingPointAndCanBeImported() {
        val original = Courses.all.first(); val changed = qualityClone(original, original.nodes.mapIndexed { i, n -> if (i == 0 || i == original.nodes.lastIndex) n.copy(x = n.x - 1) else n })
        val contents = mutableMapOf<String, String>()
        ZipInputStream(ByteArrayInputStream(TrackLabCodec.zip(changed))).use { zip ->
            while (true) { val entry = zip.nextEntry ?: break; contents[entry.name] = zip.readBytes().toString(Charsets.UTF_8) }
        }
        assertEquals(10, contents.size)
        assertEquals("course,division,region\n${changed.id},${changed.region.division},${changed.region.id}\n",contents["region-membership.csv"])
        assertEquals("first,second,warningM\n\n",contents["tracks/${original.id}-junctions.csv"])
        assertEquals("start,end,altStart,altEnd,nodeFile\n\n",contents["tracks/${original.id}-branches.csv"])
        val imported = TrackLabCodec.course(mapOf("id" to original.id, "nodes" to contents.getValue("tracks/${original.id}.csv"),
            "spots" to contents.getValue("tracks/${original.id}-spots.csv"), "features" to contents.getValue("track-features.csv"), "obstacles" to contents.getValue("track-obstacles.csv")))
        assertEquals(changed.nodes, imported.nodes); assertEquals(imported.nodes.first(), imported.nodes.last())
        assertEquals(original.nodes.first().x - 1, imported.nodes.first().x)
        assertTrue(contents.getValue("README.txt").contains("ONLY rows"))
        assertTrue(contents.getValue("validation.json").contains("digest"))
        assertNotEquals(original.nodes.first(), changed.nodes.first())
    }

    @Test fun invalidDraftsAreRejectedButGeometricFailuresRemainReviewable() {
        val c = Courses.all.first(); val csv = TrackLabCodec.csv(c) + ("id" to c.id)
        assertThrows(IllegalArgumentException::class.java) { TrackLabCodec.course(csv + ("nodes" to csv.getValue("nodes").replace(c.nodes[0].x.toString(), "NaN"))) }
        assertThrows(IllegalArgumentException::class.java) { TrackLabCodec.course(csv + ("nodes" to csv.getValue("nodes").trim().lines().dropLast(1).joinToString("\n"))) }
        assertThrows(IllegalArgumentException::class.java) { TrackLabCodec.course(csv + ("nodes" to csv.getValue("nodes").replace(c.nodes[0].x.toString(), "50000"))) }
        val narrow = qualityClone(c, c.nodes.map { it.copy(width = 2.0) })
        val candidate = TrackLabCodec.course(TrackLabCodec.csv(narrow) + ("id" to c.id))
        assertTrue(TrackLinter.errors(candidate).any { it.contains("narrower") })
        assertNotNull(TrackLabCodec.candidate(candidate)["gates"])
    }
}
