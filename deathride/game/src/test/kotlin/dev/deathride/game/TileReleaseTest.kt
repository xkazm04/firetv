package dev.deathride.game

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

/** P13d: the replaced region tiles' hold, release schedule and byte accounting, without GL. */
class TileReleaseTest {
    private val TILE=256L*256*4
    private val releasedAt=ArrayList<Pair<String,Int>>()
    private var frame=0

    @Test fun heldTilesAreReleasedAfterTheHoldOnePerFrameOldestFirst() {
        val held=TileRelease<String>(30) { releasedAt+=it to frame }
        // Switch frame 0: four tiles replaced.
        for(slot in listOf("asphalt","dirt","gravel","ice"))held.retire(slot,TILE)
        assertEquals(4*TILE,held.bytes);assertEquals(4,held.size)
        for(f in 1..40) { frame=f;held.frame() }
        assertEquals(listOf("asphalt" to 30,"dirt" to 31,"gravel" to 32,"ice" to 33),releasedAt)
        assertEquals(0L,held.bytes);assertEquals(0,held.size)
    }

    @Test fun bytesStayCountedUntilEachRelease() {
        val held=TileRelease<String>(2) { releasedAt+=it to frame }
        held.retire("a",TILE);held.retire("b",TILE)
        frame=1;assertEquals(0L,held.frame());assertEquals(2*TILE,held.bytes)
        frame=2;assertEquals(TILE,held.frame());assertEquals(TILE,held.bytes)
        frame=3;assertEquals(TILE,held.frame());assertEquals(0L,held.bytes)
        frame=4;assertEquals(0L,held.frame())
    }

    @Test fun noHoldReleasesAtOnceAndCountsNothing() {
        val held=TileRelease<String>(0) { releasedAt+=it to frame }
        held.retire("a",TILE)
        assertEquals(listOf("a" to 0),releasedAt);assertEquals(0L,held.bytes);assertEquals(0,held.size)
    }

    @Test fun aSecondSwitchQueuesBehindTheFirst() {
        val held=TileRelease<String>(5) { releasedAt+=it to frame }
        held.retire("r1-a",TILE);held.retire("r1-b",TILE)
        for(f in 1..3) { frame=f;held.frame() }
        held.retire("r2-a",TILE) // a switch at frame 3: due at 8
        assertEquals(3*TILE,held.bytes)
        for(f in 4..12) { frame=f;held.frame() }
        assertEquals(listOf("r1-a" to 5,"r1-b" to 6,"r2-a" to 8),releasedAt)
    }

    @Test fun releaseAllEmptiesTheHold() {
        val held=TileRelease<String>(60) { releasedAt+=it to frame }
        held.retire("a",TILE);held.retire("b",TILE)
        held.releaseAll()
        assertEquals(listOf("a","b"),releasedAt.map{it.first});assertEquals(0L,held.bytes)
    }
}
