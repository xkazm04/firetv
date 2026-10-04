package dev.deathride.core

import java.io.File
import kotlin.math.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*

object BalanceRules {
    private val rows=Content.table("balance-rules").associate{it.getValue("key") to it.number("value")}
    operator fun get(key: String)=rows.getValue(key)
}
private fun completedGarage(carIndex: Int): Profile = Profile("upgraded-reference").also { p ->
    p.selectedCar=carIndex;p.careerCleared=Career.events.size;p.credits=EconomyRules["creditCap"].toInt()
    // Buy the same useful tiers as the real shop. Forcing all tiers would install unusable armor
    // on an already capped Bastion, imposing a handling penalty a player cannot actually buy.
    for(i in Parts.all.indices)while(Garage.offer(p,i).available)Garage.buy(p,i,p.tier(carIndex,i))
    check(Parts.all.indices.all{Garage.offer(p,it).reason in setOf("At class limit","Maximum tier")})
}
class BalanceScenario(row: Map<String,String>) {
    val version=row.getValue("version");val id=row.getValue("id");val track=row.getValue("track")
    val difficulty=Career.difficulties.indexOfFirst{it.id==row.getValue("difficulty")}
    val upgradedLead=row.number("upgradedLead")!=0.0;val races=row.number("races").toInt()
    init { require(difficulty>=0 && races>0 && (track=="cycle" || Courses.all.any{it.id==track})) }
    fun world(seed: Int): World {
        // Rotate class within each course block; seed % 5 for both silently ties each class to one course.
        val course=if(track=="cycle")Courses.all[(seed/Career.rivals.size)%Courses.all.size] else Courses.all.single{it.id==track}
        val w=World(seed,track=Track(course=course),combatEnabled=true)
        for(c in w.cars) {
            val rival=Career.rivals[(c.id+seed)%Career.rivals.size];CarCatalog.apply(c,rival.carIndex);c.aiStyle=rival;c.aiSkill=Career.difficulties[difficulty].skill
        }
        if(upgradedLead) {
            val p=completedGarage(CarCatalog.all.indexOf(w.cars[0].carClass))
            Garage.apply(p,w.cars[0])
        }
        w.reset();return w
    }
}
object BalanceScenarios { val all=Content.table("balance-scenarios").map{BalanceScenario(it)} }
class BalanceSmokeTest {
    @Test fun scenarioCastAndDamageTimingAreValidAndReplay() {
        val inputs=Array(Tuning.CAR_COUNT){InputFrame()}
        val mixed=BalanceScenarios.all.single{it.track=="cycle"}
        val heavy=CarCatalog.all.indexOfFirst{it.id=="Bastion"};val armor=Parts.all.indexOfFirst{it.id=="armor"}
        assertEquals(0,completedGarage(heavy).tier(heavy,armor),"already capped armor must not impose an unbuyable handling penalty")
        val cast=(0 until Courses.all.size*Career.rivals.size).map { seed->val w=mixed.world(seed);w.track.course!!.id to w.cars[0].carClass!!.id }.toSet()
        assertEquals(Courses.all.size*Career.rivals.map{it.carIndex}.distinct().size,cast.size,"Phase 1 preset must cross every declared rival chassis with every course")
        for(scenario in BalanceScenarios.all)repeat(BalanceRules["smokeSeedsPerScenario"].toInt()){seed->
            val w=scenario.world(seed);val replay=scenario.world(seed)
            while(w.resolved<Tuning.CAR_COUNT && w.seconds<TrackRules["maxRaceSeconds"]){w.step(inputs);replay.step(inputs)}
            assertEquals(w.stateHash(),replay.stateHash());assertEquals(Tuning.CAR_COUNT,w.resolved)
            for(c in w.cars)if(w.combat.wrecked(c.id))assertTrue(w.combat.firstDamageSeconds[c.id] in 0.0..w.combat.wreckSeconds[c.id])
            assertTrue(w.cars.all{it.x.isFinite() && it.y.isFinite()});assertEquals(0,w.combat.oneShotKills)
            w.reset();assertTrue(w.combat.firstDamageSeconds.all{it<0});assertTrue(w.combat.repairPickupsTaken.all{it==0})
        }
    }
}

/** Offline report only. It calls the same fixed-step World as the TV; all randomness is seeded reset state. */
fun main(args: Array<String>) {
    val scenarios=if(args.isEmpty())BalanceScenarios.all else listOf(BalanceScenarios.all.single{it.id==args.single()})
    val directory=File("build/reports/balance"+(if(args.isEmpty())"" else "/${scenarios.single().id}"));directory.mkdirs()
    val summary=StringBuilder("version,scenario,races,distinctHashes,minSeconds,p50Seconds,p95Seconds,maxSeconds,meanWrecks,unresolved,oneShotKills,oneShotRate,shortDamageToWrecks,shortWreckShare,damageToWreckP50,damageToWreckP95,leadWins,leadWinRate,repairPickups,ammoPickups\n")
    val classes=StringBuilder("scenario,class,entries,wins,winPerEntry,kills,killShare\n")
    val causes=StringBuilder("scenario,cause,wrecks,share\n")
    val inputs=Array(Tuning.CAR_COUNT){InputFrame()}
    val alarms=ArrayList<String>()
    File(directory,"w8-races.csv").bufferedWriter().use { raw->
        raw.write("version,scenario,seed,track,seconds,finished,wrecks,shots,oneShots,shortWrecks,rivetKills,hammerKills,mineKills,ramKills,wallKills,winnerClass,winnerSlot,hash\n")
        for(scenario in scenarios) {
            val durations=DoubleArray(scenario.races);val damageTimes=ArrayList<Double>();val hashes=HashSet<Long>()
            val wins=IntArray(CarCatalog.all.size);val entries=IntArray(wins.size);val kills=IntArray(wins.size);val deaths=IntArray(DamageKind.entries.size)
            var wrecks=0;var unresolved=0;var oneShots=0;var short=0;var leadWins=0;var repairs=0;var ammo=0
            repeat(scenario.races){seed->
                val w=scenario.world(seed)
                while(w.resolved<Tuning.CAR_COUNT && w.seconds<TrackRules["maxRaceSeconds"])w.step(inputs)
                check(w.cars.all{it.x.isFinite() && it.y.isFinite() && it.speedMps.isFinite()})
                durations[seed]=w.seconds;if(w.resolved<Tuning.CAR_COUNT)unresolved++
                val winner=w.cars.single{it.position==1};if(winner.id==0)leadWins++
                var shortThisRace=0
                for(c in w.cars) {
                    val type=CarCatalog.all.indexOf(c.carClass);entries[type]++;if(c.position==1)wins[type]++;kills[type]+=w.combat.kills[c.id]
                    if(w.combat.wrecked(c.id)) {
                        val duration=w.combat.wreckSeconds[c.id]-w.combat.firstDamageSeconds[c.id];check(duration>=0);damageTimes.add(duration)
                        if(duration<BalanceRules["shortDamageToWreckSeconds"])shortThisRace++
                    }
                }
                short+=shortThisRace;wrecks+=w.combat.wreckCount;oneShots+=w.combat.oneShotKills
                repairs+=w.combat.repairPickupsTaken.sum();ammo+=w.combat.ammoPickupsTaken.sum()
                for(i in deaths.indices)deaths[i]+=w.combat.deaths[i]
                val hash=w.stateHash();hashes.add(hash)
                raw.write("${scenario.version},${scenario.id},$seed,${w.track.course!!.id},${w.seconds},${w.finished},${w.combat.wreckCount},${w.combat.shots.sum()},${w.combat.oneShotKills},$shortThisRace,${w.combat.deaths.joinToString(",")},${winner.carClass!!.id},${winner.id},$hash\n")
                if((seed+1)%250==0){raw.flush();println("${scenario.id}: ${seed+1}/${scenario.races} races")}
            }
            durations.sort();damageTimes.sort()
            fun quantile(a: List<Double>,p: Double)=if(a.isEmpty())0.0 else a[(ceil(p*a.size).toInt()-1).coerceIn(0,a.lastIndex)]
            val sorted=durations.toList();val oneShotRate=oneShots.toDouble()/max(1,wrecks)
            summary.append("${scenario.version},${scenario.id},${scenario.races},${hashes.size},${durations.first()},${quantile(sorted,.5)},${quantile(sorted,.95)},${durations.last()},${wrecks.toDouble()/scenario.races},$unresolved,$oneShots,$oneShotRate,$short,${short.toDouble()/max(1,wrecks)},${quantile(damageTimes,.5)},${quantile(damageTimes,.95)},$leadWins,${leadWins.toDouble()/scenario.races},$repairs,$ammo\n")
            for(i in wins.indices)classes.append("${scenario.id},${CarCatalog.all[i].id},${entries[i]},${wins[i]},${wins[i].toDouble()/entries[i]},${kills[i]},${kills[i].toDouble()/max(1,kills.sum())}\n")
            for(i in deaths.indices)causes.append("${scenario.id},${DamageKind.entries[i]},${deaths[i]},${deaths[i].toDouble()/max(1,wrecks)}\n")
            if(hashes.size.toDouble()/scenario.races<BalanceRules["minimumDistinctHashFraction"])alarms.add("${scenario.id}: repeated seed outcomes")
            if(unresolved.toDouble()/scenario.races>BalanceRules["maxUnresolvedRate"])alarms.add("${scenario.id}: unresolved race rate")
            if(oneShotRate>BalanceRules["oneShotAlarmRate"])alarms.add("${scenario.id}: one-shot rate")
            File(directory,"w8-summary.csv").writeText(summary.toString());File(directory,"w8-classes.csv").writeText(classes.toString());File(directory,"w8-causes.csv").writeText(causes.toString())
            println("${scenario.id}: ${hashes.size} distinct; mean wrecks ${wrecks.toDouble()/scenario.races}; unresolved $unresolved")
        }
    }
    File(directory,"w8-alarms.txt").writeText(if(alarms.isEmpty())"No declared numeric alarm fired. This is not a quality or G1 verdict.\n" else alarms.joinToString("\n"))
    check(alarms.isEmpty()){alarms.joinToString("; ")}
}
