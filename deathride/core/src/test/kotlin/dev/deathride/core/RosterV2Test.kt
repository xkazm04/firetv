package dev.deathride.core

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import java.io.File
import java.util.zip.CRC32

class RosterV2Test {
    @Test fun rosterPricesPeersDimensionsAndAmmunitionHaveConsumers() {
        val cars=CarCatalog.all
        assertTrue(cars.size>=RosterRules["minimumClasses"])
        assertEquals(cars.size,cars.map{it.id}.distinct().size)
        assertEquals(CarCatalog.statNames.toSet(),RosterRules.value.keys)
        assertEquals(cars.map{it.id}.toSet(),CarShapes.all.map{it.id}.toSet())
        assertEquals(cars.map{it.id}.toSet(),Career.unlocks.filter{it.kind=="car"}.map{it.id}.toSet())
        val report=StringBuilder("class,tier,credits,lengthM,widthM,ammoScale,peerFinding\n")
        val world=World(combatEnabled=true)
        for((index,car) in cars.withIndex()) {
            val shape=CarShapes.forId(car.id)
            assertTrue(shape.lengthM in RosterRules["minimumLengthM"]..RosterRules["maximumLengthM"])
            assertTrue(shape.widthM in RosterRules["minimumWidthM"]..RosterRules["maximumWidthM"])
            assertEquals(RosterRules.tiers.getValue(car.tier).second+car.stats.entries.sumOf{it.value*RosterRules.value.getValue(it.key)},car.priceCredits)
            CarCatalog.apply(world.cars[0],index);world.reset()
            assertEquals(kotlin.math.floor(Weapons.all[Weapons.RIVET].ammo*car.ammoScale).toInt(),world.combat.ammo(0,Weapons.RIVET))
            report.append("${car.id},${car.tier},${car.priceCredits},${shape.lengthM},${shape.widthM},${car.ammoScale},${RosterRules.peerFindings(car).joinToString(";")}\n")
        }
        for(rank in 1..RosterRules.tiers.values.maxOf{it.first})
            assertTrue(cars.filter{it.tierRank==rank}.minOf{it.priceCredits}>cars.filter{it.tierRank==rank-1}.maxOf{it.priceCredits})
        assertTrue(RosterRules.peerFindings(cars.first(),listOf(cars.first())).single().contains("not enough peers"))
        val rogue=CarClass(cars.first().values+mapOf("armor" to "10"))
        assertTrue(RosterRules.peerFindings(rogue,listOf(rogue,CarClass(cars[1].values+mapOf("armor" to "1")),CarClass(cars[4].values+mapOf("armor" to "1")))).any{it.contains("armor")})
        File("build/reports/content/c1-roster.csv").apply{parentFile.mkdirs();writeText(report.toString())}
    }

    @Test fun fiveCarSavesKeepEveryOwnedPartAndReceipt() {
        val p=Profile("five-car-migration");p.credits=1000;Garage.buy(p,2,0)
        Economy.settle(p,Economy.start(p),3,1,50.0)
        val current=ProfileCodec.encode(p).substringBefore("checksum=")
        val old=current.replace("tiers=${p.tiers.joinToString(",")}","tiers=${p.tiers.take(5*Parts.all.size).joinToString(",")}")
        val signed=old+"checksum="+CRC32().apply{update(old.toByteArray(Charsets.UTF_8))}.value.toString(16)+"\n"
        val migrated=ProfileCodec.decode(signed,p.id)
        assertEquals(p.credits,migrated.credits);assertEquals(p.lastReceipt,migrated.lastReceipt)
        assertArrayEquals(p.tiers,migrated.tiers)
        assertEquals(ProfileCodec.encode(p),ProfileCodec.encode(migrated))
    }

    @Test fun stockCourseMatrixHasDifferentSpecialistsAndDeterministicReplays() {
        val input=Array(Tuning.CAR_COUNT){InputFrame()}
        val csv=StringBuilder("course,class,tier,seeds,finishers,meanSeconds,minSeconds,maxSeconds\n")
        val winners=mutableSetOf<String>()
        val tierWinners=RosterRules.tiers.keys.associateWith { mutableSetOf<String>() }
        for(course in Courses.all.take(5)) {
            val times=DoubleArray(CarCatalog.all.size)
            for((index,car) in CarCatalog.all.withIndex()) {
                val observations=mutableListOf<Double>()
                repeat(4){seed ->
                    fun make()=World(1009+seed,track=Track(course=course)).also { w ->
                        for(c in w.cars){CarCatalog.apply(c,index);c.aiSkill=Career.difficulties[1].skill;c.aiStyle=null}
                        w.reset()
                    }
                    val w=make()
                    while(w.finished<Tuning.CAR_COUNT && w.seconds<180)w.step(input)
                    assertEquals(Tuning.CAR_COUNT,w.finished,"${course.id}/${car.id}/$seed")
                    observations.addAll(w.cars.map{it.finishSeconds})
                    if(seed==0){val replay=make();repeat(w.steps){replay.step(input)};assertEquals(w.stateHash(),replay.stateHash())}
                }
                times[index]=observations.average()
                csv.append("${course.id},${car.id},${car.tier},4,${observations.size},${observations.average()},${observations.min()},${observations.max()}\n")
            }
            winners+=CarCatalog.all[times.indices.minBy{times[it]}].id
            for(tier in tierWinners.keys)tierWinners.getValue(tier)+=CarCatalog.all[times.indices.filter{CarCatalog.all[it].tier==tier}.minBy{times[it]}].id
        }
        File("build/reports/content/c1-courses.csv").apply{parentFile.mkdirs();writeText(csv.toString())}
        assertTrue(winners.size>1,"One class dominates all authored types: $winners\n$csv")
        println("C1 fastest classes across courses: $winners; within tiers: $tierWinners")
    }
}
