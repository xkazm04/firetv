package dev.deathride.core

import kotlin.math.*

/** Optional passage. Both ends map to the main lap, so shortcuts cannot award extra checkpoints. */
data class TrackBranch(val start: Double,val end: Double,val alternative: Course,val altStart: Double,val altEnd: Double) {
    fun contains(s: Double,c: Course)=c.phase(s)/c.lengthM in start..end
    fun toAlternative(s: Double,c: Course)=alternative.lengthM*(altStart+(c.phase(s)/c.lengthM-start)/(end-start)*(altEnd-altStart))
    fun toMain(s: Double,c: Course)=c.lengthM*(start+(alternative.phase(s)/alternative.lengthM-altStart)/(altEnd-altStart)*(end-start))
}
object TrackBranches {
    fun load(id: String,theme: String): List<TrackBranch> {
        val stream=javaClass.getResourceAsStream("/data/tracks/$id-branches.csv")?:return emptyList()
        return stream.bufferedReader().use { it.readLines() }.drop(1).filter { it.isNotBlank() }.map { line ->
            val p=line.split(',');require(p.size==5);val file=p[4];require(file.matches(Regex("[a-z0-9-]+")))
            val nodes=Content.table("tracks/$file").map { TrackNode(it.number("xM"),it.number("yM"),it.number("halfWidthM"),Surfaces.all.single { s->s.id==it.getValue("surface") },it.number("aiLaneM")) }
            val alt=Course(id,"$id branch","Optional route",0.0,theme,nodes,emptyList(),emptyList(),emptyList(),emptyList(),emptyList())
            TrackBranch(p[0].toDouble(),p[1].toDouble(),alt,p[2].toDouble(),p[3].toDouble())
        }
    }
    fun errors(c: Course): List<String> = buildList {
        val a=TrackPoint();val b=TrackPoint()
        val main=if(c.branches.isEmpty())c else Course(c.id,c.name,c.lesson,c.startFraction,c.theme,c.nodes,c.spots,c.features,c.obstaclePlacements,c.junctions,emptyList())
        val projection=Projection()
        for(route in c.branches) {
            if(!listOf(route.start,route.end,route.altStart,route.altEnd).all { it.isFinite() && it in 0.0..1.0 } || route.start>=route.end || route.altStart>=route.altEnd || route.end-route.start>.6) {add("${c.id}: invalid branch interval");continue}
            if(route.alternative.branches.isNotEmpty() || route.alternative.junctions.isNotEmpty())add("${c.id}: nested routes unsupported")
            for((main,alt) in listOf(route.start to route.altStart,route.end to route.altEnd)) {
                c.sample(main*c.lengthM,0.0,a);route.alternative.sample(alt*route.alternative.lengthM,0.0,b)
                if(hypot(a.x-b.x,a.y-b.y)>1.5 || abs(wrapAngle(a.heading-b.heading))>PI/12)add("${c.id}: branch needs coincident tangent split/rejoin")
                if(abs(c.widthAt(main*c.lengthM)-route.alternative.widthAt(alt*route.alternative.lengthM))>1)add("${c.id}: branch width discontinuity")
            }
            val alt=route.alternative
            for(i in 0 until alt.count)if(alt.arc[i]/alt.lengthM in route.altStart..route.altEnd) {
                if(alt.width[i]*2<CarShapes.all.maxOf { it.widthM }*TrackRules["minWidthCarWidths"])add("${c.id}: narrow branch")
                if(alt.curvature[i]*CarShapes.all.maxOf { it.lengthM }*TrackRules["minRadiusCarLengths"]>1)add("${c.id}: tight branch")
                if(i%8==0) {
                    main.project(alt.x[i],alt.y[i],projection)
                    if(abs(projection.distance)<alt.width[i]+main.widthAt(projection.s) && TrackJunctions.cyclicGap(main,projection.s,route.toMain(alt.arc[i],main))>100)add("${c.id}: branch overlaps unrelated passage")
                }
            }
            for(g in c.grid)if(c.phase((c.startFraction+g.fraction)*c.lengthM)/c.lengthM in (route.start-.03)..(route.end+.03))add("${c.id}: branch covers grid")
        }
        for((i,aRoute) in c.branches.withIndex())for(bRoute in c.branches.drop(i+1))if(aRoute.start<bRoute.end && bRoute.start<aRoute.end)add("${c.id}: overlapping branch intervals")
    }
    fun merging(c: Course,s: Double): Boolean {
        for(route in c.branches)if(TrackJunctions.cyclicGap(c,s,route.start*c.lengthM)<c.widthAt(s)*3 || TrackJunctions.cyclicGap(c,s,route.end*c.lengthM)<c.widthAt(s)*3)return true
        return false
    }
    /** Static scenery only: shared ribbon has no barrier across the other passage. */
    fun boundaryCovered(c: Course,s: Double,side: Int): Boolean {
        if(c.branches.isEmpty())return false
        val p=TrackPoint();val q=Projection();c.sample(s,side*(c.widthAt(s)+.5),p)
        for(route in c.branches) {
            route.alternative.project(p.x,p.y,q)
            if(q.s/route.alternative.lengthM in route.altStart..route.altEnd && abs(q.distance)<route.alternative.widthAt(q.s)+1)return true
        }
        return false
    }
}
