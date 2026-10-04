package dev.deathride.core

import kotlin.math.*

/** An at-grade, collidable junction between two passages of the same lap. No bridge/height is implied. */
data class TrackJunction(val first: Double,val second: Double,val warningM: Double)
object TrackJunctions {
    fun load(id: String): List<TrackJunction> {
        val stream=javaClass.getResourceAsStream("/data/tracks/$id-junctions.csv")?:return emptyList()
        return stream.bufferedReader().use { it.readLines() }.drop(1).filter { it.isNotBlank() }.map { line ->
            val p=line.split(',');require(p.size==3);TrackJunction(p[0].toDouble(),p[1].toDouble(),p[2].toDouble())
        }
    }
    fun errors(c: Course): List<String> = buildList {
        val a=TrackPoint();val b=TrackPoint()
        for(j in c.junctions) {
            if(!j.first.isFinite() || !j.second.isFinite() || j.first !in 0.0..<1.0 || j.second !in 0.0..<1.0 || j.first>=j.second || !j.warningM.isFinite() || j.warningM<45) {add("${c.id}: invalid junction declaration/warning");continue}
            c.sample(j.first*c.lengthM,0.0,a);c.sample(j.second*c.lengthM,0.0,b)
            if(hypot(a.x-b.x,a.y-b.y)>1.5)add("${c.id}: junction passages do not intersect")
            val angle=abs(wrapAngle(a.heading-b.heading))*180/PI
            if(angle !in 45.0..135.0)add("${c.id}: junction angle must be 45–135 degrees")
            if(c.curvature[c.index(j.first*c.lengthM)]>.004 || c.curvature[c.index(j.second*c.lengthM)]>.004)add("${c.id}: junction needs straight approaches")
            for(s in listOf(j.first*c.lengthM,j.second*c.lengthM)) {
                for(g in c.grid)if(cyclicGap(c,s,(c.startFraction+g.fraction)*c.lengthM)<j.warningM)add("${c.id}: junction covers grid warning zone")
                for(f in c.features)if(f.contains(c.phase(s)/c.lengthM))add("${c.id}: junction contains surface feature")
            }
        }
    }
    fun cyclicGap(c: Course,a: Double,b: Double): Double {val gap=abs(c.phase(a)-c.phase(b));return min(gap,c.lengthM-gap)}
    fun permits(c: Course,a: Double,b: Double): Boolean {
        for(j in c.junctions) {
            val reach=(c.widthAt(a)+c.widthAt(b))*1.8
            if(cyclicGap(c,a,j.first*c.lengthM)<reach && cyclicGap(c,b,j.second*c.lengthM)<reach || cyclicGap(c,b,j.first*c.lengthM)<reach && cyclicGap(c,a,j.second*c.lengthM)<reach)return true
        }
        return false
    }
    fun nearPassage(c: Course,s: Double): Boolean {
        for(j in c.junctions)if(cyclicGap(c,s,j.first*c.lengthM)<c.widthAt(s)*2.2 || cyclicGap(c,s,j.second*c.lengthM)<c.widthAt(s)*2.2)return true
        return false
    }
}
