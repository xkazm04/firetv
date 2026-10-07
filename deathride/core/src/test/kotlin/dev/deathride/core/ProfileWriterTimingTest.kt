package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.io.TempDir
import java.io.File

/** P13a: what the render thread pays for submit() against what it pays today for ProfileStore.save, on the JVM of this machine. */
class ProfileWriterTimingTest {
    @TempDir lateinit var directory: File
    private fun career(): Profile {
        val p=Profile("timing");p.credits=4000
        for(race in 1..6) { RivalEconomy.prepare(p);Economy.settle(p,Economy.start(p),1+race%6,race%3,60.0);for(i in Parts.all.indices)Garage.buy(p,i,p.tier(p.selectedCar,i)) }
        p.careerRound=3;p.careerCleared=3;p.careerPoints=10;p.careerDifficulty=1
        return p
    }
    private fun summary(ms: DoubleArray)=ms.sorted().let{"median=%.3f max=%.3f".format((it[it.size/2-1]+it[it.size/2])/2,it.last())}

    @Test fun submitCostsTheCallerUnderAMillisecondAgainstAFullSave() {
        val p=career();assertEquals(RivalEconomy.plans.size,p.rivalProfiles.size)
        val bytes=ProfileCodec.encode(p).toByteArray(Charsets.UTF_8).size
        val store=ProfileStore(File(directory,"save"))
        repeat(10){store.save(p)} // warm-up
        val save=DoubleArray(50){val t=System.nanoTime();store.save(p);(System.nanoTime()-t)/1e6}
        val submit=ProfileWriter(ProfileStore(File(directory,"writer"))).use { writer ->
            repeat(20){writer.submit(0,p,ProfileWriter.Kind.CHOICE)};assertTrue(writer.drain(60_000));writer.poll() // warm-up
            // Measured while the writer is saving the earlier jobs, as it will be in the game.
            val ms=DoubleArray(50){val t=System.nanoTime();writer.submit(0,p,ProfileWriter.Kind.CHOICE);(System.nanoTime()-t)/1e6}
            assertTrue(writer.drain(60_000));ms
        }
        val sorted=submit.sorted();val median=(sorted[24]+sorted[25])/2
        val line="profileBytes=$bytes rivals=${p.rivalProfiles.size} iterations=50 submitMs ${summary(submit)} saveMs ${summary(save)}"
        println("P13a timing: $line")
        File("build/reports/profile-writer").apply{mkdirs()}.resolve("timing.txt").writeText(line+"\n")
        assertTrue(median<1.0,"submit median ${median}ms")
    }
}
