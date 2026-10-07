package dev.deathride.game

import dev.deathride.core.*
import dev.deathride.core.ProfileWriter.Kind
import dev.deathride.core.ProfileWriter.Status
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.util.Collections
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

/** P13b: the pending-start, settle and revert rules RaceGame delegates to, against a real ProfileWriter and a saver that can hold or fail a write. */
class ProfileSavesTest {
    /** Holds every write while [hold] is set; throws for a profile [fails] picks. The store's own durability steps are not involved. */
    private class Saver: ProfileSaver {
        @Volatile var hold=CountDownLatch(0)
        @Volatile var fails: (Profile)->Boolean={false}
        @Volatile var delayMs=0L
        val written=Collections.synchronizedList(ArrayList<Profile>())
        override fun save(profile: Profile) {
            assertTrue(hold.await(20,TimeUnit.SECONDS),"saver held too long")
            if(delayMs>0)Thread.sleep(delayMs)
            if(fails(profile))throw java.io.IOException("simulated write failure")
            written.add(profile)
        }
        fun holdAll() { hold=CountDownLatch(1) }
        fun release() { hold.countDown() }
    }
    private val saver=Saver()
    private val writer=ProfileWriter(saver)
    private val profiles=Array(2){Profile("seat-$it")}
    private val saveStatus=Array(2){""}
    private val shopMessage=Array(2){""}
    private val careerMessage=Array(2){""}
    private val persistence=BooleanArray(2){true}
    private val logs=Collections.synchronizedList(ArrayList<String>())
    private val launched=ArrayList<ProfileSaves.Start>()
    private val reverted=ArrayList<Int>()
    private val hooks=object: ProfileSaves.Hooks {
        override fun publish(seat: Int) {}
        override fun reverted(seat: Int) { reverted+=seat }
        override fun startReady(start: ProfileSaves.Start) { launched+=start }
        override fun changed() {}
    }
    private val saves=ProfileSaves(writer,profiles,saveStatus,shopMessage,careerMessage,persistence,logs::add,hooks)

    init { for(i in 0..1)saves.load(i,Result.success(LoadedProfile(Profile("seat-$i"),"Saved")),"seat-$i") }
    @AfterEach fun close() { saver.release();writer.close(5_000) }

    /** Renders frames (pump once each) until [done] holds. */
    private fun frames(done: ()->Boolean): Int {
        var n=0;val deadline=System.nanoTime()+20_000_000_000
        while(!done()) { assertTrue(System.nanoTime()<deadline,"no progress after $n frames");saves.pump();n++;Thread.sleep(1) }
        return n
    }

    @Test fun aRaceDoesNotStartUntilBothTicketsAreDurable() {
        saver.holdAll()
        val start=saves.beginStart(false,0,0,intArrayOf(0,1))
        // The start call returned without starting the race: the lobby keeps drawing.
        assertTrue(launched.isEmpty());assertSame(start,saves.start);assertEquals(ProfileSaves.SAVING_TICKET,saves.startBlocker())
        assertEquals(1L,profiles[0].startedRaces);assertEquals(1L,profiles[1].startedRaces) // optimistic tickets
        assertEquals(listOf(1L,1L),start.tickets.toList());assertEquals(listOf("seat-0","seat-1"),start.profileIds.toList())
        repeat(20) { saves.pump() }
        assertTrue(launched.isEmpty());assertTrue(start.jobs.all{writer.status(it)==Status.PENDING})
        saver.release()
        frames{launched.isNotEmpty()}
        assertEquals(listOf(start),launched);assertNull(saves.start);assertNull(saves.startBlocker())
        assertTrue(start.jobs.all{writer.isDurable(it)})
        assertEquals(listOf(1L,1L),saver.written.map{it.startedRaces})
        assertTrue(logs.any{it.startsWith("transition ticketWait ") && it.contains("tickets=2 status=durable")},logs.toString())
        assertEquals(2,logs.count{it.startsWith("transition write ") && it.contains("status=OK")})
    }

    @Test fun aFailedTicketStartsNoRaceAndRevertsToDurable() {
        saver.fails={it.id=="seat-1" && it.startedRaces>0}
        saves.beginStart(false,0,0,intArrayOf(0,1))
        frames{saves.start==null}
        assertTrue(launched.isEmpty())
        assertEquals(listOf(1),reverted)
        assertEquals(0L,profiles[1].startedRaces);assertEquals(ProfileSaves.RACE_NOT_STARTED,saveStatus[1])
        assertEquals(ProfileSaves.RACE_NOT_STARTED,careerMessage[0]);assertEquals(ProfileSaves.RACE_NOT_STARTED,saves.notice)
        assertNull(saves.startBlocker()) // the next start may be tried
        assertTrue(logs.any{it.contains("ticketWait") && it.contains("status=failed")})
    }

    @Test fun aCancelledTicketStartsNoRaceAndRevertsOnce() {
        // Career prep (CHOICE) fails on disk; seat 0's ticket was submitted behind it before the failure was seen, so it is cancelled.
        saver.holdAll();saver.fails={it.id=="seat-0" && it.careerDifficulty==2}
        assertTrue(saves.edit(0,Kind.CHOICE){it.careerDifficulty=2}>0)
        val start=saves.beginStart(true,0,2,intArrayOf(0))
        saver.release()
        frames{saves.start==null}
        assertTrue(launched.isEmpty())
        assertEquals(Status.CANCELLED,writer.status(start.jobs[0]))
        assertEquals(listOf(0),reverted) // the FAILED prep reverted; the CANCELLED ticket did not revert again
        assertEquals(0,profiles[0].careerDifficulty);assertEquals(0L,profiles[0].startedRaces)
        assertEquals(ProfileSaves.RACE_NOT_STARTED,careerMessage[0])
    }

    @Test fun aFailedChoiceRevertsThePickOnce() {
        val original=profiles[0].selectedCar;val a=(original+1)%CarCatalog.all.size;val b=(original+2)%CarCatalog.all.size
        saver.holdAll();saver.fails={it.selectedCar==a}
        assertTrue(saves.edit(0,Kind.CHOICE){it.selectedCar=a}>0)
        assertEquals(a,profiles[0].selectedCar);assertEquals("Saving...",saveStatus[0]) // optimistic
        val second=saves.edit(0,Kind.CHOICE){it.selectedCar=b}
        assertEquals(b,profiles[0].selectedCar)
        saver.release()
        frames{saves.pending(0)==0}
        assertEquals(Status.CANCELLED,writer.status(second))
        assertEquals(listOf(0),reverted);assertEquals(original,profiles[0].selectedCar)
        assertEquals(ProfileSaves.CHANGE_CANCELLED,saveStatus[0])
        // A pick after the failure was reported is written on the reverted state.
        val retry=saves.edit(0,Kind.CHOICE){it.selectedCar=b}
        frames{writer.status(retry)!=Status.PENDING}
        assertTrue(writer.isDurable(retry));assertEquals("Saved",saveStatus[0]);assertEquals(listOf(0),reverted)
    }

    private fun startedRace() { saves.beginStart(false,0,0,intArrayOf(0,1));frames{launched.isNotEmpty()} }
    private fun settle(seat: Int)=saves.settle(seat){Economy.settle(it,it.startedRaces,1,0,50.0)}

    @Test fun aPendingSettleBlocksTheNextRaceUntilItIsDurable() {
        startedRace()
        saver.holdAll()
        assertTrue(settle(0)>0);assertTrue(settle(1)>0)
        assertTrue(saves.settling);assertEquals(ProfileSaves.Outcome.PENDING,saves.result(0))
        assertNotNull(profiles[0].lastReceipt) // optimistic: the results screen has it, marked pending
        assertEquals(ProfileSaves.SAVING_RESULT,saves.startBlocker());assertEquals(ProfileSaves.SAVING_RESULT,saves.notice)
        repeat(10) { saves.pump() }
        assertEquals(ProfileSaves.SAVING_RESULT,saves.startBlocker())
        saver.release()
        frames{!saves.settling}
        assertNull(saves.startBlocker())
        assertEquals(ProfileSaves.Outcome.COUNTED,saves.result(0));assertEquals(ProfileSaves.Outcome.COUNTED,saves.result(1))
        assertEquals(1L,saver.written.last{it.id=="seat-1"}.settledRace);assertEquals(1L,profiles[1].settledRace)
    }

    @Test fun aFailedSettleRemovesTheReceipt() {
        startedRace()
        saver.fails={it.id=="seat-0" && it.settledRace>0}
        assertTrue(settle(0)>0)
        frames{!saves.settling}
        assertEquals(ProfileSaves.Outcome.FAILED,saves.result(0))
        assertNull(profiles[0].lastReceipt);assertEquals(0L,profiles[0].settledRace);assertEquals(1L,profiles[0].startedRaces)
        assertEquals(listOf(0),reverted)
        assertEquals(ProfileSaves.RESULT_NOT_COUNTED,careerMessage[0]);assertEquals(ProfileSaves.RESULT_NOT_COUNTED,saves.notice)
        assertNull(saves.startBlocker()) // nothing in flight: the next race may start
    }

    @Test fun requestsDuringAPendingStartAreRefused() {
        saver.holdAll()
        saves.beginStart(false,0,0,intArrayOf(0,1))
        assertEquals(ProfileSaves.SAVING_TICKET,saves.startBlocker()) // start, career, claim
        assertTrue(saves.refuseWhileStarting(0));assertTrue(saves.refuseWhileStarting(1)) // car, purchase, track
        assertEquals(ProfileSaves.SAVING_TICKET,shopMessage[0]);assertEquals(ProfileSaves.SAVING_TICKET,shopMessage[1])
        assertThrows(IllegalStateException::class.java){saves.beginStart(false,0,0,intArrayOf(0))}
        saver.release();frames{launched.isNotEmpty()}
        assertFalse(saves.refuseWhileStarting(0));assertNull(saves.startBlocker())
    }

    @Test fun pauseDrainsQueuedSavesAndNeverDropsThem() {
        saver.delayMs=40
        val jobs=(1..5).map{n->saves.edit(n%2,Kind.CHOICE){it.careerDifficulty=n%3}}
        assertTrue(saves.pause())
        assertEquals(5,saver.written.size) // on disk before pause() returned
        frames{saves.pending(0)+saves.pending(1)==0};assertTrue(jobs.all{writer.isDurable(it)})
        // A write that cannot finish inside the bound: pause returns false (logged), and the save is still written afterwards.
        saver.delayMs=0;saver.holdAll()
        val held=saves.edit(0,Kind.CHOICE){it.careerDifficulty=2}
        val started=System.nanoTime()
        assertFalse(saves.pause(200))
        assertTrue((System.nanoTime()-started)/1e6<1_000)
        assertTrue(logs.any{it.startsWith("transition pauseDrain drained=false")})
        saver.release();frames{writer.status(held)!=Status.PENDING}
        assertTrue(writer.isDurable(held));assertEquals(2,saver.written.last().careerDifficulty)
        assertTrue(ProfileSaves.PAUSE_DRAIN_MS<=1_500)
    }

    @Test fun aProfileSwitchDrainsTheOldProfileAndIgnoresItsCompletions() {
        saver.delayMs=30
        saves.edit(1,Kind.CHOICE){it.careerDifficulty=1}
        saves.load(1,Result.success(LoadedProfile(Profile("guest").also{it.careerDifficulty=2},"Saved")),"guest")
        assertEquals(1,saver.written.size) // drained before the switch
        Thread.sleep(50);repeat(5){saves.pump()}
        assertTrue(logs.any{it.startsWith("transition write seat=1 ") && it.contains("status=OK")},logs.toString())
        assertEquals("guest",profiles[1].id);assertEquals(2,profiles[1].careerDifficulty);assertTrue(reverted.isEmpty())
        assertEquals("Saved",saveStatus[1])
    }
}
