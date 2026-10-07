package dev.deathride.game

import dev.deathride.core.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

/** P13d: a frame that runs its own request builds no seat, even one left dirty by an earlier frame; the next quiet frame builds it. */
class FramePublishRequestTest {
    private val profiles=Array(2){Profile("seat-$it")}
    private val written=ArrayList<Int>()
    private var rebuilds=0
    private val logs=ArrayList<String>()
    private lateinit var publish: FramePublish
    init { publish=FramePublish(profiles,Array(2){"Parts stay with this car"},Array(2){"Saved"},Array(2){"Player 1 hosts."},{ seat,_,_,_ -> written+=seat },{ rebuilds++;publish.uiBuilt() },logs::add) }

    @Test fun aRequestFrameBuildsNoSeatEvenWithASeatLeftDirtyAndTheNextQuietFrameDoes() {
        publish.publish(0);publish.publish(1)
        assertEquals(0,publish.frame(),"a quiet frame builds seat 0 and leaves seat 1 dirty")
        assertTrue(publish.dirty(1))
        // Frame N: a car pick or a track switch. Seat 1 has been dirty since the previous frame.
        publish.beginFrame();publish.request()
        assertEquals(-1,publish.endFrame(),"the request frame builds no seat")
        assertEquals(listOf(0),written);assertTrue(publish.dirty(1))
        // Frame N+1: no request of its own.
        publish.beginFrame()
        assertEquals(1,publish.endFrame())
        assertEquals(listOf(0,1),written);assertFalse(publish.dirty(1))
    }

    @Test fun consecutiveRequestFramesHoldTheSeatUntilTheFirstQuietOne() {
        publish.publish(0)
        repeat(3) { publish.beginFrame();publish.request();assertEquals(-1,publish.endFrame()) }
        assertTrue(written.isEmpty())
        publish.beginFrame();assertEquals(0,publish.endFrame())
        assertEquals(listOf(0),written)
        assertEquals(1,logs.count{it.startsWith("transition flush seat=0 ")},logs.toString())
    }

    @Test fun aRequestHoldsOnlyItsOwnFrame() {
        publish.beginFrame();publish.request();assertTrue(publish.requested);publish.endFrame()
        assertFalse(publish.requested,"the hold ends with its frame")
        publish.publish(1)
        publish.beginFrame();assertEquals(1,publish.endFrame())
    }

    @Test fun theUiRebuildAndTheSeatKeepTheirOwnFrames() {
        // Frame N: a track switch asks for a UI rebuild and dirties seat 0.
        publish.beginFrame();publish.request();publish.requestUi();publish.publish(0);publish.endFrame()
        assertEquals(0,rebuilds);assertTrue(written.isEmpty())
        // Frame N+1 runs a car pick: the UI rebuild still runs first in it, the seat waits.
        publish.beginFrame();assertEquals(1,rebuilds)
        publish.request();assertEquals(-1,publish.endFrame());assertTrue(written.isEmpty())
        // Frame N+2 is quiet.
        publish.beginFrame();assertEquals(0,publish.endFrame());assertEquals(1,rebuilds)
    }
}
