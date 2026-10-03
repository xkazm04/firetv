package dev.deathride.core

import java.io.File

/** Exhaustive legal part combinations; an upper bound independent of wallet or shopping order. */
fun main() {
    val out=File("build/reports/campaign/headroom.csv");out.parentFile.mkdirs()
    out.writeText("event,car,tier,combinations,maximumLegalPR,parts\n")
    for(round in listOf(6,13,20,27))for((carIndex,car) in CarCatalog.all.withIndex()) {
        if(car.tierRank>Career.events[round].playerTier)continue
        val p=Profile("bound-$round-$carIndex",false);p.careerCleared=round;p.selectedCar=carIndex;p.owned[carIndex]=true;p.credits=8000
        val visited=HashSet<String>()
        var best=Double.NEGATIVE_INFINITY;var count=0;var bestParts=""
        fun visit() {
            val key=Parts.all.indices.joinToString(":"){p.tier(carIndex,it).toString()}
            if(!visited.add(key))return
            count++;val rating=PowerRating.of(car,p.bonuses())
            if(rating>best){best=rating;bestParts=key}
            for(part in Parts.all.indices) {
                val offer=Garage.offer(p,part);if(!offer.available)continue
                val credits=p.credits;val revision=p.marketRevision
                check(Garage.buy(p,part,offer.tier).startsWith("Installed"))
                p.credits=8000 // Deliberately unbounded funding: legal acquisition envelope, not an affordable career.
                visit()
                p.tiers[carIndex*Parts.all.size+part]--;p.credits=credits;p.marketRevision=revision
            }
        }
        visit()
        out.appendText("${round+1},${car.id},${car.tierRank},$count,$best,$bestParts\n")
    }
    println(out.readText())
}
