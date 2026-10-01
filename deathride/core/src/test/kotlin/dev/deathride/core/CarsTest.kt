package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import java.io.File

class CarsTest {
    @Test fun catalogHasTenClassesAndEveryMappingIsConsumed() {
        assertEquals(10,CarCatalog.all.size)
        assertEquals(CarCatalog.statNames.toSet(),CarCatalog.mapping.map { it.stat }.toSet())
        for(c in CarCatalog.all) {
            val s=c.spec()
            val actual=mapOf("maxSpeedMps" to s.maxSpeedMps,"accelerationMps2" to s.accelerationMps2,
                "lateralGripPerSecond" to s.lateralGripPerSecond,"maxLateralAccelerationMps2" to s.maxLateralAccelerationMps2,
                "massKg" to s.massKg,"steeringRateRadPerSecond" to s.steeringRateRadPerSecond,"yawResponseSeconds" to s.yawResponseSeconds,
                "armorReduction" to c.armorReduction,"weaponSlots" to c.weaponSlots.toDouble(),"brakeMps2" to s.brakeMps2)
            for(m in CarCatalog.mapping)assertEquals(m.base+m.perPoint*c.stats.getValue(m.stat),actual.getValue(m.parameter),1e-12)
        }
    }
    @Test fun lapAndPairedRaceMatrix() {
        val tracks=arrayOf(Track(45.0,20.0,9.0),Track(),Track(230.0,75.0,14.0))
        val names=arrayOf("tight","mixed","fast")
        val input=Array(6){InputFrame()}; val csv=StringBuilder("track,class,meanFinishSeconds,samples\n")
        val winners=mutableSetOf<Int>()
        for(t in tracks.indices) {
            val times=DoubleArray(CarCatalog.all.size)
            for(k in CarCatalog.all.indices) {
                var n=0
                repeat(3) { seed ->
                    val w=World(seed,track=tracks[t]); for(c in w.cars)CarCatalog.apply(c,k)
                    while(w.finished<6 && w.seconds<180)w.step(input)
                    assertEquals(6,w.finished,"${names[t]} ${CarCatalog.all[k].id}: ${w.cars.map { it.lap.laps }}")
                    for(c in w.cars) { times[k]+=c.finishSeconds; n++ }
                }
                times[k]/=n
                csv.append("${names[t]},${CarCatalog.all[k].id},${times[k]},$n\n")
            }
            winners+=times.indices.minBy { times[it] }
        }
        File("build/reports/balance/w2-laps.csv").apply { parentFile.mkdirs(); writeText(csv.toString()) }
        assertTrue(winners.size>=2,"One class dominates every track type: $winners; $csv")
        val duels=StringBuilder("track,a,b,aWins,bWins,samples\n")
        for(t in tracks.indices) for(a in CarCatalog.all.indices) for(b in a+1 until CarCatalog.all.size) {
            var wins=0
            repeat(4) { seed ->
                val w=World(seed,track=tracks[t]); for(c in w.cars)CarCatalog.apply(c,if((c.id+seed)%2==0)a else b)
                while(w.finished<6 && w.seconds<180)w.step(input)
                assertEquals(6,w.finished)
                if(w.cars.minBy { it.finishSeconds }.carClass===CarCatalog.all[a])wins++
            }
            duels.append("${names[t]},${CarCatalog.all[a].id},${CarCatalog.all[b].id},$wins,${4-wins},4\n")
        }
        File("build/reports/balance/w2-duels.csv").apply { parentFile.mkdirs(); writeText(duels.toString()) }
    }
}
