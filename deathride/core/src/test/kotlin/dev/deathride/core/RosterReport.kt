package dev.deathride.core

import java.io.File
import kotlin.math.*

/** Calls World directly. A sample is one six-car race, with three entries per class. */
fun main(args: Array<String>) {
    val samples=args.getOrNull(0)?.toInt()?:RosterRules["racesPerScenario"].toInt()
    val filter=args.getOrNull(1)
    val input=Array(Tuning.CAR_COUNT){InputFrame()}
    val directory=File("build/reports/roster/$samples").apply{mkdirs()}
    val summary=StringBuilder("tier,scenario,course,class,races,entries,wins,entryWinRate,meanFinishSeconds,unresolved,uniqueHashes\n")
    val findings=mutableListOf<String>()
    for((tier,pair) in CarCatalog.all.groupBy{it.tier}) {
        if(filter!=null && tier!=filter)continue
        val fast=pair.maxBy{it.spec().maxSpeedMps};val agile=pair.single{it!==fast}
        val courseRows=Content.table("roster-courses")
        val maps=courseRows.map { it.getValue("id") to Track(it.number("straightM"),it.number("radiusM"),it.number("halfWidthM"),Surfaces.all.single{s->s.id==it.getValue("surface")}) }
        val weights=courseRows.map{it.number("mixedWeight")}
        check(abs(weights.sum()-1.0)<1e-9)
        val mean=Array(3){DoubleArray(2)};val mixedWins=DoubleArray(2)
        for(scenario in listOf("equal","skill")) {
            val chosen=if(scenario=="skill")maps.take(1) else maps
            for((course,track) in chosen) {
                val wins=IntArray(2);val totals=DoubleArray(2);val unresolved=IntArray(2);val hashes=HashSet<Long>()
                val raceHashes=LongArray(samples);val raceWinners=IntArray(samples)
                val raceTimes=Array(samples){DoubleArray(2)};val raceUnresolved=Array(samples){IntArray(2)}
                val raceRows=arrayOfNulls<String>(samples)
                File(directory,"$tier-$scenario-$course.csv").bufferedWriter().use { out ->
                    out.appendLine("seed,gridRotation,hash,winner,class0MeanSeconds,class1MeanSeconds,unresolved")
                    // Worlds share only immutable definitions. Each worker writes its own seed-indexed cell.
                    java.util.stream.IntStream.range(0,samples).parallel().forEach { seedIndex ->
                        val seed=("$tier/$scenario/$course".hashCode()*31+seedIndex*7919)
                        val w=World(seed,track=track)
                        for(c in w.cars) {
                            val type=pair[(c.id+seedIndex)%2]
                            CarCatalog.apply(c,CarCatalog.all.indexOf(type))
                            c.aiSkill=AiSkills.all.single{it.id==if(scenario=="skill" && type===agile)"Champion" else "Rookie"}
                        }
                        w.reset()
                        while(w.finished<Tuning.CAR_COUNT && w.seconds<RosterRules["probeMaxSeconds"])w.step(input)
                        val hash=w.stateHash();raceHashes[seedIndex]=hash
                        val winner=w.cars.minBy{if(it.finishSeconds>=0)it.finishSeconds else RosterRules["probeMaxSeconds"]}
                        raceWinners[seedIndex]=pair.indexOf(winner.carClass)
                        val times=raceTimes[seedIndex]
                        for(c in w.cars) {
                            val i=pair.indexOf(c.carClass)
                            if(c.finishSeconds<0)raceUnresolved[seedIndex][i]++
                            times[i]+=if(c.finishSeconds>=0)c.finishSeconds else RosterRules["probeMaxSeconds"]
                        }
                        raceRows[seedIndex]="$seed,${seedIndex%2},$hash,${winner.carClass!!.id},${times[0]/3},${times[1]/3},${w.cars.count{it.finishSeconds<0}}"
                        if(seedIndex==0) {
                            val replay=World(seed,track=track)
                            for(c in replay.cars){CarCatalog.apply(c,CarCatalog.all.indexOf(w.cars[c.id].carClass));c.aiSkill=w.cars[c.id].aiSkill}
                            replay.reset();repeat(w.steps){replay.step(input)};check(hash==replay.stateHash())
                        }
                    }
                    // Sum and serialize in seed order so parallel scheduling cannot change the report's bits.
                    for(seedIndex in 0 until samples) {
                        hashes+=raceHashes[seedIndex];wins[raceWinners[seedIndex]]++
                        for(i in 0..1){totals[i]+=raceTimes[seedIndex][i];unresolved[i]+=raceUnresolved[seedIndex][i]}
                        out.appendLine(raceRows[seedIndex]!!)
                    }
                }
                for(i in 0..1) {
                    val time=totals[i]/(samples*3)
                    summary.append("$tier,$scenario,$course,${pair[i].id},$samples,${samples*3},${wins[i]},${wins[i].toDouble()/(samples*3)},$time,${unresolved[i]},${hashes.size}\n")
                    if(scenario=="equal"){mean[maps.indexOfFirst{it.first==course}][i]=time;mixedWins[i]+=wins[i]*weights[maps.indexOfFirst{it.first==course}]}
                    if(unresolved[i]>0)findings+="$tier/$scenario/$course: ${pair[i].id} has ${unresolved[i]} unresolved entries"
                }
                if(scenario=="equal" && course=="straight" && wins[pair.indexOf(fast)]<=samples/2)findings+="$tier: faster Rookie fails to win majority on long straights"
                check(hashes.size==samples){"Seed diversity failed: $tier/$scenario/$course"}
                if(scenario=="skill" && totals[pair.indexOf(fast)]/(samples*3)-totals[pair.indexOf(agile)]/(samples*3)<RosterRules["minimumSkillMarginSeconds"])
                    findings+="$tier: Champion agile failed technical skill margin"
                println("$tier/$scenario/$course: ${pair.mapIndexed{i,c->"${c.id}=${totals[i]/(samples*3)}s wins=${wins[i]}"}}")
            }
        }
        for(i in 0..1) {
            if(mixedWins[i]/samples>RosterRules["maxWinShare"])findings+="$tier: ${pair[i].id} exceeds mixed race-winner share"
            if(mean.none{it[i]<it[1-i]} || mean.none{it[i]>it[1-i]})findings+="$tier: ${pair[i].id} lacks best/worst course identity"
        }
        if(mean[1][pair.indexOf(agile)]-mean[1][pair.indexOf(fast)]<RosterRules["minimumStraightDeficitSeconds"])findings+="$tier: light straight deficit too small"
        if(mean[0][pair.indexOf(fast)]-mean[0][pair.indexOf(agile)]<RosterRules["minimumHairpinDeficitSeconds"])findings+="$tier: fast technical deficit too small"
    }
    File(directory,"summary-${filter?:"all"}.csv").writeText(summary.toString())
    File(directory,"findings-${filter?:"all"}.txt").writeText(if(findings.isEmpty())"All measured roster gates passed\n" else findings.joinToString("\n",postfix="\n"))
    println(findings.joinToString("\n"))
    if(samples>=RosterRules["racesPerScenario"])check(findings.isEmpty()){findings.joinToString("; ")}
}
