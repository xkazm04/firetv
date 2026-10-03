package dev.deathride.core

import java.io.File

/** Exhaustive legal part combinations; an upper bound independent of wallet or shopping order. */
fun main() {
    val out=File("build/reports/campaign/headroom.csv");out.parentFile.mkdirs()
    out.writeText("event,car,tier,combinations,maximumLegalPR,parts\n")
    for(round in listOf(6,13,20,27))for((carIndex,car) in CarCatalog.all.withIndex()) {
        if(car.tierRank>Career.events[round].playerTier)continue
        val p=Profile("bound-$round-$carIndex",false);p.careerCleared=round;p.selectedCar=carIndex
        val tiers=IntArray(Parts.all.size);val bonus=IntArray(CarCatalog.statNames.size)
        var best=Double.NEGATIVE_INFINITY;var count=0;var bestParts=""
        fun visit(part: Int) {
            if(part==Parts.all.size) {
                count++;val rating=PowerRating.of(car,bonus)
                if(rating>best){best=rating;bestParts=tiers.joinToString(":")}
                return
            }
            val definition=Parts.all[part]
            for(tier in 0..Career.maximumPartTier(p,part)) {
                tiers[part]=tier
                for(s in bonus.indices)bonus[s]+=definition.bonuses[s]*tier
                visit(part+1)
                for(s in bonus.indices)bonus[s]-=definition.bonuses[s]*tier
            }
        }
        visit(0)
        out.appendText("${round+1},${car.id},${car.tierRank},$count,$best,$bestParts\n")
    }
    println(out.readText())
}
