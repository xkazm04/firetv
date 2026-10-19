package dev.deathride.game

import dev.deathride.core.*
import dev.deathride.core.ProfileWriter.Kind
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

/** P13c: a request frame marks a seat's JSON and the UI stale; the frames after it build them, one seat per frame, same bytes. */
class FramePublishTest {
    private val profiles=Array(2){Profile("seat-$it")}
    private val saveStatus=Array(2){"Saved"}
    private val shopMessage=Array(2){"Parts stay with this car"}
    private val careerMessage=Array(2){"Player 1 hosts. Player 2 is a guest."}
    private class Written(val seat: Int,val car: String,val garage: String,val career: String)
    private val written=ArrayList<Written>()
    private var rebuilds=0
    private val logs=ArrayList<String>()
    private lateinit var publish: FramePublish
    init { publish=FramePublish(profiles,shopMessage,saveStatus,careerMessage,{ seat,car,garage,career -> written+=Written(seat,car,garage,career) },{ rebuilds++;publish.uiBuilt() },logs::add) }

    @Test fun twoPublishesOfASeatInOneFrameBuildItOnce() {
        publish.publish(0);publish.publish(0)
        assertTrue(written.isEmpty(),"a publish builds nothing in its own frame")
        assertEquals(0,publish.frame())
        assertEquals(-1,publish.frame())
        assertEquals(listOf(0),written.map{it.seat})
    }

    @Test fun aFrameBuildsAtMostOneSeat() {
        publish.publish(1);publish.publish(0);publish.publish(1)
        assertEquals(0,publish.frame());assertEquals(1,written.size)
        assertEquals(1,publish.frame());assertEquals(2,written.size)
        assertEquals(-1,publish.frame());assertEquals(2,written.size)
        assertEquals(listOf(0,1),written.map{it.seat})
        assertEquals(2,logs.count{it.startsWith("transition flush seat=")},logs.toString())
    }

    @Test fun theFlushedJsonIsByteIdenticalToAnImmediatePublish() {
        val p=profiles[1]
        p.selectedCar=2;p.owned[2]=true;p.careerDifficulty=1;Economy.start(p);Economy.start(p)
        shopMessage[1]="Installed Engine tier 2";saveStatus[1]="Saving...";careerMessage[1]=ProfileSaves.SAVING_TICKET
        // What publishGarage wrote at once before P13c, with the same builders, profile and messages.
        val car=DeathDuel.carJson(p);val garage=Garage.json(p,shopMessage[1],saveStatus[1]);val career=Career.json(p,careerMessage[1])
        publish.publish(1);publish.frame()
        val w=written.single()
        assertEquals(1,w.seat)
        assertArrayEquals(car.toByteArray(),w.car.toByteArray())
        assertArrayEquals(garage.toByteArray(),w.garage.toByteArray())
        assertArrayEquals(career.toByteArray(),w.career.toByteArray())
    }

    @Test fun aRequestFrameDoesNotRebuildTheUiAndTheNextFrameDoes() {
        publish.frame() // frame N begins
        publish.requestUi() // a request in frame N (start notice, launch, finish, track switch)
        assertEquals(0,rebuilds,"the request frame does not rebuild the UI")
        publish.frame() // frame N+1
        assertEquals(1,rebuilds)
        publish.frame()
        assertEquals(1,rebuilds,"one request, one rebuild")
        assertTrue(logs.any{it.startsWith("transition uiDeferred ms=")})
    }

    @Test fun aRebuildBeforeTheNextFrameCoversTheRequest() {
        publish.requestUi();publish.uiBuilt() // the 10 Hz cadence rebuilt after the request, in the same frame
        publish.frame()
        assertEquals(0,rebuilds)
    }

    @Test fun flushBuildsADirtySeatAtOnceAndOnlyThen() {
        publish.flush(0);assertTrue(written.isEmpty())
        publish.publish(0);publish.flush(0)
        assertEquals(listOf(0),written.map{it.seat});assertFalse(publish.dirty(0))
        assertEquals(-1,publish.frame())
    }

    /** RaceGame's wiring: ProfileSaves' hooks publish and ask for a rebuild; beginStart's frame does neither, the next frames do. */
    @Test fun aStartRequestFrameBuildsNoJsonAndNoUi() {
        val hold=CountDownLatch(1)
        val writer=ProfileWriter(ProfileSaver { assertTrue(hold.await(20,TimeUnit.SECONDS)) })
        try {
            val hooks=object: ProfileSaves.Hooks {
                override fun publish(seat: Int)=publish.publish(seat)
                override fun reverted(seat: Int)=publish.publish(seat)
                override fun startReady(start: ProfileSaves.Start)=publish.requestUi()
                override fun changed()=publish.requestUi()
            }
            val saves=ProfileSaves(writer,profiles,saveStatus,shopMessage,careerMessage,BooleanArray(2){true},logs::add,hooks)
            for(i in 0..1)saves.load(i,Result.success(LoadedProfile(Profile("seat-$i"),"Saved")),"seat-$i")
            publish.flushAll();written.clear()
            saves.edit(0,Kind.CHOICE){it.selectedCar=1} // a car pick
            saves.beginStart(false,0,0,intArrayOf(0,1)) // its tickets, the notice and seat 0's career message
            assertTrue(written.isEmpty(),"no JSON built in the request frame");assertEquals(0,rebuilds,"no UI rebuilt in the request frame")
            assertEquals(0,publish.frame());assertEquals(1,rebuilds)
            assertEquals(1,publish.frame());assertEquals(1,rebuilds)
            assertEquals(-1,publish.frame())
            // Seat 0 is built once, from its final state in the request frame: the car pick and the ticket notice.
            val seat0=written.first{it.seat==0}
            assertEquals(Career.json(profiles[0],ProfileSaves.SAVING_TICKET),seat0.career)
            assertEquals(DeathDuel.carJson(profiles[0]),seat0.car)
            assertEquals(1,profiles[0].selectedCar)
        } finally { hold.countDown();writer.close(5_000) }
    }

    @AfterEach fun noUnexpectedBuilds() { assertTrue(written.size<=2) }
}
