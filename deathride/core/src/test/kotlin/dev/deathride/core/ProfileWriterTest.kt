package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.io.TempDir
import java.io.File
import java.util.Collections
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import dev.deathride.core.ProfileWriter.Kind
import dev.deathride.core.ProfileWriter.Status

class ProfileWriterTest {
    @TempDir lateinit var directory: File
    private class Kill: RuntimeException("simulated kill")

    private fun profile(id: String,credits: Int)=Profile(id).also{it.credits=credits}
    /** Polls like the render thread until every job is reported, collecting the completions. */
    private fun settle(writer: ProfileWriter,vararg slots: Int): List<ProfileWriter.Completion> {
        val all=ArrayList<ProfileWriter.Completion>();val deadline=System.nanoTime()+10_000_000_000
        while(slots.any{writer.pending(it)>0}) { assertTrue(System.nanoTime()<deadline,"writer stalled");all+=writer.poll();Thread.sleep(1) }
        return all
    }
    /** A full career profile: rivals, purchases, settled races and a career round in progress. */
    private fun career(id: String): Profile {
        val p=Profile(id);p.credits=4000
        for(race in 1..6) { RivalEconomy.prepare(p);Economy.settle(p,Economy.start(p),1+race%6,race%3,60.0);for(i in Parts.all.indices)Garage.buy(p,i,p.tier(p.selectedCar,i)) }
        p.careerRound=3;p.careerCleared=3;p.careerPoints=10;p.careerDifficulty=1
        return p
    }

    @Test fun interleavedSubmitsAcrossTwoSlotsLandInSubmissionOrder() {
        val written=Collections.synchronizedList(ArrayList<String>())
        val store=ProfileStore(directory){id,step->if(step==SaveStep.BEFORE_MOVE)written.add("$id:"+ProfileCodec.decode(File(directory,"$id.tmp").readText(),id).credits)}
        val ids=arrayOf("seat-a","seat-b");val expected=ArrayList<String>();val jobs=ArrayList<Long>()
        ProfileWriter(store).use { writer ->
            // 100 submits, the slot pattern irregular so ordering cannot come from alternation.
            for(n in 0 until 100) { val slot=if(n%3==0 || n%7==0)1 else 0;jobs+=writer.submit(slot,profile(ids[slot],n),Kind.CHOICE);expected+="${ids[slot]}:$n" }
            assertTrue(writer.drain(10_000))
            val done=settle(writer,0,1)
            assertEquals(jobs,done.map{it.job});assertTrue(done.all{it.status==Status.OK})
            assertEquals(expected,written.toList())
            val last=expected.groupBy{it.substringBefore(':')}.mapValues{it.value.last().substringAfter(':').toInt()}
            for(slot in 0..1) {
                assertEquals(last.getValue(ids[slot]),ProfileStore(directory).load(ids[slot]).profile.credits)
                assertEquals(last.getValue(ids[slot]),writer.durable(slot)!!.credits)
            }
        }
    }

    @Test fun copyIsDeepSoChangesAfterSubmitNeverReachTheSave() {
        val p=career("snap")
        val encoded=ProfileCodec.encode(p)
        assertEquals(encoded,ProfileCodec.encode(p.copy()))
        val gate=CountDownLatch(1);val entered=CountDownLatch(1)
        val store=ProfileStore(directory){id,step->if(id=="blocker" && step==SaveStep.TEMP_SYNCED){entered.countDown();gate.await(10,TimeUnit.SECONDS)}}
        ProfileWriter(store).use { writer ->
            writer.submit(1,profile("blocker",1),Kind.CHOICE)
            assertTrue(entered.await(10,TimeUnit.SECONDS)) // the writer is busy; the next job is only queued
            writer.submit(0,p,Kind.MONEY)
            // Change every kind of field: scalars, arrays, the campaign ledger and the nested rival profiles.
            p.credits=1;p.selectedCar=(p.selectedCar+1)%CarCatalog.all.size;p.tiers.fill(0);p.owned.fill(true);p.condition.fill(3)
            p.grudges.fill(1);p.careerTrophies.fill(2);p.careerDifficulty=0;p.campaign.debt=12345;p.campaign.rewards.fill(1)
            for(r in p.rivalProfiles){r.credits=7;r.tiers.fill(0);r.selectedCar=0}
            Economy.start(p)
            assertNotEquals(encoded,ProfileCodec.encode(p))
            gate.countDown()
            assertTrue(writer.drain(10_000));settle(writer,0,1)
            assertEquals(encoded,File(directory,"snap.sav").readText())
            assertEquals(encoded,ProfileCodec.encode(writer.durable(0)!!))
            // durable() hands out copies too: changing one does not change the writer's record.
            writer.durable(0)!!.credits=2;assertEquals(encoded,ProfileCodec.encode(writer.durable(0)!!))
        }
    }

    @Test fun aFailedSaveCancelsItsDependantsUntilTheCallerHasSeenIt() {
        val store=ProfileStore(directory){id,step->if(id=="seat-a" && step==SaveStep.BEFORE_MOVE && File(directory,"seat-a.tmp").readText().contains("credits=2\n"))throw java.io.IOException("disk full")}
        ProfileWriter(store).use { writer ->
            writer.seed(0,profile("seat-a",0))
            val ok=writer.submit(0,profile("seat-a",1),Kind.CHOICE)
            val failed=writer.submit(0,profile("seat-a",2),Kind.CHOICE)
            val dependant=writer.submit(0,profile("seat-a",3),Kind.MONEY)
            val other=writer.submit(1,profile("seat-b",4),Kind.MONEY)
            val laterDependant=writer.submit(0,profile("seat-a",5),Kind.CHOICE)
            assertEquals(4,writer.pending(0));assertEquals(1,writer.pending(1))
            assertTrue(writer.drain(10_000))
            assertEquals(Status.PENDING,writer.status(failed)) // nothing changes until poll, on the caller's thread
            val done=settle(writer,0,1).associateBy{it.job}
            assertEquals(Status.OK,done.getValue(ok).status);assertEquals(Status.FAILED,done.getValue(failed).status)
            assertTrue(done.getValue(failed).error is java.io.IOException)
            assertEquals(Status.CANCELLED,done.getValue(dependant).status);assertEquals(Status.CANCELLED,done.getValue(laterDependant).status)
            assertEquals(Status.OK,done.getValue(other).status)
            assertFalse(writer.isDurable(dependant));assertTrue(writer.isDurable(other));assertEquals(Status.CANCELLED,writer.status(dependant))
            // The revert target is the last save on disk, not any of the cancelled states.
            assertEquals(1,writer.durable(0)!!.credits);assertEquals(1,ProfileStore(directory).load("seat-a").profile.credits)
            // Once the caller has polled the failure and reverted, new saves of that slot go through again.
            val retry=writer.submit(0,profile("seat-a",6),Kind.MONEY)
            assertTrue(writer.drain(10_000));settle(writer,0)
            assertTrue(writer.isDurable(retry));assertEquals(6,ProfileStore(directory).load("seat-a").profile.credits)
        }
    }

    @Test fun aDurableTicketImpliesEveryEarlierChangeIsDurable() {
        val finishedSaves=Collections.synchronizedList(ArrayList<Int>())
        val store=ProfileStore(directory){_,step->if(step==SaveStep.TEMP_SYNCED)Thread.sleep(2)}
        ProfileWriter(store).use { writer ->
            val choices=(1..5).map{writer.submit(it%2,profile(if(it%2==0)"seat-a" else "seat-b",it),Kind.CHOICE)}
            val ticket=writer.submit(0,profile("seat-a",100),Kind.MONEY)
            // The render thread waits by polling each frame; it never blocks on the writer.
            while(!writer.isDurable(ticket)) {
                for(c in writer.poll())finishedSaves+=c.job.toInt()
                if(writer.isDurable(ticket))break
                for(j in choices)if(writer.isDurable(j))assertTrue(choices.takeWhile{it!=j}.all{writer.isDurable(it)})
                Thread.sleep(1)
            }
            assertTrue(choices.all{writer.isDurable(it)},"every change submitted before the ticket is durable once the ticket is")
            assertEquals((choices+ticket).map{it.toInt()},finishedSaves.toList())
            assertEquals(100,ProfileStore(directory).load("seat-a").profile.credits)
            assertEquals(5,ProfileStore(directory).load("seat-b").profile.credits)
        }
    }

    @Test fun drainWaitsForTheQueueAndReportsATimeout() {
        val gate=CountDownLatch(1)
        val store=ProfileStore(directory){id,step->if(id=="slow" && step==SaveStep.TEMP_SYNCED)gate.await(10,TimeUnit.SECONDS)}
        val writer=ProfileWriter(store)
        writer.submit(0,profile("slow",1),Kind.CHOICE);writer.submit(0,profile("slow",2),Kind.MONEY)
        val started=System.nanoTime()
        assertFalse(writer.drain(50),"a blocked save is not drained")
        assertTrue((System.nanoTime()-started)/1e6>=45)
        gate.countDown()
        assertTrue(writer.drain(10_000))
        assertEquals(2,ProfileStore(directory).load("slow").profile.credits)
        assertEquals(2,writer.pending(0));settle(writer,0);assertEquals(0,writer.pending(0))
        assertTrue(writer.drain(0),"an empty queue drains at once")
        writer.submit(0,profile("slow",3),Kind.CHOICE)
        assertTrue(writer.close(10_000))
        assertEquals(3,ProfileStore(directory).load("slow").profile.credits)
        assertThrows(IllegalStateException::class.java){writer.submit(0,profile("slow",4),Kind.CHOICE)}
    }

    @Test fun aKillAtEveryStepLeavesTheLastDurableSaveLoadable() {
        for(step in SaveStep.entries) for(corruptMain in listOf(false,true)) {
            val root=File(directory,"$step-$corruptMain");root.mkdirs()
            val plain=ProfileStore(root)
            plain.save(profile("kill",10));plain.save(profile("kill",20)) // .sav = 20, .bak = 10
            if(corruptMain)File(root,"kill.sav").writeText("interrupted write")
            val durable=if(corruptMain)10 else 20
            val killing=ProfileStore(root){_,at->if(at==step)throw Kill()}
            assertThrows(Kill::class.java){killing.save(profile("kill",30))}
            val loaded=ProfileStore(root).load("kill")
            assertEquals(durable,loaded.profile.credits,"kill at $step, corrupt main $corruptMain: never the unsaved 30")
            assertEquals(if(corruptMain)"Recovered previous save" else "Saved",loaded.status)
            // The next save after a restart still works over the stale temp file.
            plain.save(profile("kill",40));assertEquals(40,ProfileStore(root).load("kill").profile.credits)
        }
        // A first-ever save killed at any step leaves a new profile, not a damaged one.
        for(step in SaveStep.entries) {
            val root=File(directory,"first-$step");root.mkdirs()
            assertThrows(Kill::class.java){ProfileStore(root){_,at->if(at==step)throw Kill()}.save(profile("kill",30))}
            assertEquals("New profile",ProfileStore(root).load("kill").status)
        }
    }

    @Test fun aKillBetweenTwoQueuedSavesLeavesTheFirstDurable() {
        val gate=CountDownLatch(1)
        // The process dies as soon as the second save begins writing: its temp file exists, nothing else.
        val store=ProfileStore(directory){_,step->if(step==SaveStep.TEMP_SYNCED && File(directory,"queued.tmp").readText().contains("credits=2\n")){gate.countDown();throw Kill()}}
        ProfileWriter(store).use { writer ->
            val first=writer.submit(0,profile("queued",1),Kind.CHOICE)
            val second=writer.submit(0,profile("queued",2),Kind.MONEY)
            assertTrue(gate.await(10,TimeUnit.SECONDS));assertTrue(writer.drain(10_000));settle(writer,0)
            assertTrue(writer.isDurable(first));assertFalse(writer.isDurable(second))
        }
        val reopened=ProfileStore(directory).load("queued")
        assertEquals("Saved",reopened.status);assertEquals(1,reopened.profile.credits)
    }
}
