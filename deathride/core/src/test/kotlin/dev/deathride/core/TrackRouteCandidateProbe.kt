package dev.deathride.core

import java.io.File

/** Early feasibility check for the finale route alternatives before the full library search reaches them. */
fun main() {
    val slot=CandidateAuthor.slots.single{it.id=="crown-7"}
    for(name in listOf("crossed-double-hook","split-courtyard")) {
        val family=CandidateAuthor.families.single{it.id==name};val failures=linkedMapOf<String,Int>();var passed=false
        for(attempt in 0 until 600) {
            if(attempt%25==0)println("ROUTE $name $attempt $failures")
            try {
                val recipe=CandidateAuthor.variant(family,4304103L+attempt*1009)
                val c=CandidateAuthor.compose(slot,recipe,"crown-7-probe").course;val shape=trackShape(c);val g=qualityGeometry(c)
                val flags=(g.detail.getValue("lint") as List<*>).map{it.toString()}+shapeGates(shape.metrics).filter{it["status"]!="pass"}.map{"shape:${it["metric"]}"}+TrackQuality.gates(g.values,setOf("geometry","lap")).filter{it["status"]!="pass"}.map{"quality:${it["metric"]}"}
                if(flags.isNotEmpty()){val key=flags.first();failures[key]=(failures[key]?:0)+1;continue}
                val out=File(TrackQuality.root,"evidence/tracks/r3")
                File(out,"$name-control.csv").writeText(recipe)
                File(out,"$name-control.json").writeText(TrackQuality.json(mapOf("course" to CandidateAuthor.reviewCourse(c),"shape" to shape.data(),"geometry" to g.detail,"attempt" to attempt)))
                println("ROUTE $name valid attempt $attempt ${c.lengthM} m; branches=${c.branches.size}; crossings=${c.junctions.size}");passed=true;break
            }catch(e:Exception){val key=e.message?.substringBefore(':')?:e.javaClass.simpleName;failures[key]=(failures[key]?:0)+1}
        }
        println("ROUTE $name passed=$passed failures=$failures")
    }
}
