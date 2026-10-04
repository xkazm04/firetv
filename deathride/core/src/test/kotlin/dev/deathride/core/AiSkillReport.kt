package dev.deathride.core

import java.io.File
import java.util.stream.IntStream
import java.util.concurrent.atomic.AtomicInteger

/** Paired skill swaps, including adjacent power tiers. All physical specifications remain stock. */
fun main(args: Array<String>) {
    val samples=args.getOrElse(0){"167"}.toInt();val tag=args.getOrElse(1){"ai-skill"}
    val dir=File("build/reports/ai/z3/$tag").apply{mkdirs()};val output=File(dir,"skill.csv")
    check(!output.exists()){"Refuse to overwrite skill evidence"}
    val course=Content.table("roster-courses").single{it.getValue("id")=="technical"}
    val track=Track(course.number("straightM"),course.number("radiusM"),course.number("halfWidthM"),Surfaces.asphalt)
    val pairs=mutableListOf<Triple<String,CarClass,CarClass>>()
    for(tier in 0..4) {
        val cars=CarCatalog.all.filter{it.tierRank==tier};val fast=cars.maxBy{it.spec().maxSpeedMps}
        pairs.add(Triple("within-$tier",cars.single{it!==fast},fast))
    }
    for(tier in 0..3) {
        val lower=CarCatalog.all.filter{it.tierRank==tier}.maxBy{it.stats.getValue("handling")+it.stats.getValue("grip")}
        val upper=CarCatalog.all.filter{it.tierRank==tier+1}.maxBy{it.spec().maxSpeedMps}
        check(PowerRating.of(lower)<PowerRating.of(upper));pairs.add(Triple("cross-$tier",lower,upper))
    }
    val cells=pairs.indices.flatMap{pair->(0..1).flatMap{swap->(0 until samples).flatMap{sample->(0..5).map{rotation->intArrayOf(pair,swap,sample,rotation)}}}}
    val rows=arrayOfNulls<String>(cells.size);val done=AtomicInteger();val input=Array(6){InputFrame()}
    IntStream.range(0,cells.size).parallel().forEach{index->
        val (pair,swap,sample,rotation)=cells[index];val (name,lower,upper)=pairs[pair]
        val seed=104090003+pair*100003+sample*7919
        fun make()=World(seed,track=track,combatEnabled=true).also{w->
            w.aiLeadSlot=-1
            for(c in w.cars) {
                val low=(c.id+rotation)%6<3;CarCatalog.apply(c,if(low)lower else upper)
                c.aiSkill=AiSkills.all.single{it.id==if(low==(swap==0))"Champion" else "Rookie"}
            }
            Encounters.apply(w,Career.cups[upper.tierRank].id);w.reset()
        }
        fun run(w: World){while(w.resolved<6 && w.seconds<RosterRules["probeMaxSeconds"])w.step(input)}
        val w=make();run(w)
        if(sample==0 && rotation==0){val replay=make();run(replay);check(replay.stateHash()==w.stateHash())}
        val winner=w.cars.single{it.position==1}
        rows[index]=listOf(name,swap,sample,rotation,seed,lower.id,upper.id,PowerRating.of(lower),PowerRating.of(upper),w.seconds,
            if(winner.finishSeconds>=0)winner.carClass!!.id else "unresolved",w.entrantCount-w.resolved,w.combat.oneShotKills,w.ai.maximumAttackers,w.stateHash(),
            w.cars.joinToString(";"){"${it.carClass!!.id}:${it.aiSkill!!.id}:${it.finishSeconds}:${it.position}"}).joinToString(",")
        val n=done.incrementAndGet();if(n%2000==0)println("skill completed $n/${cells.size}")
    }
    output.writeText("case,swap,sample,rotation,seed,lower,upper,lowerPR,upperPR,seconds,winner,unresolved,oneShots,maxAttackers,hash,cars\n"+rows.joinToString("\n",postfix="\n"){it!!})
    println("skill finished: ${cells.size} races; technical course only; stock specs; paired six-slot rotations")
}
