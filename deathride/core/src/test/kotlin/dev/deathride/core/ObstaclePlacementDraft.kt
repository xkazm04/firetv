package dev.deathride.core

import java.io.File
import kotlin.math.*

/** Offline authoring aid; emits explicit rows for review, never runs in a race. */
fun main() {
    val lines=ArrayList<String>();lines.add("course,definition,fraction,lane,heading,seed")
    for(c in Courses.all) {
        val selected=ArrayList<ObstaclePlacement>()
        for(p in c.obstaclePlacements) {
            val d=ObstacleContent.definitions.getValue(p.definition)
            val chosen=if(d.effect!=ObstacleEffect.SOLID)p else (0 until c.count).sortedBy { i ->
                val gap=abs(c.arc[i]-p.fraction*c.lengthM);min(gap,c.lengthM-gap)
            }.map{p.copy(fraction=c.arc[it]/c.lengthM)}.first { candidate ->
                val baked=ObstacleContent.bake(c,selected+candidate)
                ObstacleContent.errors(c,baked).isEmpty() && selected.all{old->val gap=abs(old.fraction-candidate.fraction)*c.lengthM;min(gap,c.lengthM-gap)>20}
            }
            selected.add(chosen);lines.add("${c.id},${chosen.definition},${chosen.fraction},${chosen.lane},${chosen.heading},${chosen.seed}")
        }
        check(ObstacleContent.errors(c,ObstacleContent.bake(c,selected)).isEmpty())
    }
    File("build/reports/obstacles/placement-draft.csv").apply{parentFile.mkdirs();writeText(lines.joinToString("\n",postfix="\n"))}
}
