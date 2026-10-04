package dev.deathride.core

import java.io.File
import kotlin.math.*

data class ShapePoint(val x: Double, val y: Double)
data class ShapeCorner(val start: Int, val end: Int, val degrees: Double, val radiusL: Double, val type: String, val lengthL: Double) {
    fun data() = mapOf("start" to start / 256.0, "end" to end / 256.0, "degrees" to degrees, "radiusL" to radiusL, "type" to type, "lengthL" to lengthL)
}
data class TrackShape(val points: List<ShapePoint>, val turns: DoubleArray, val corners: List<ShapeCorner>, val histogram: Map<String, Int>, val metrics: Map<String, Double>) {
    fun data() = mapOf("metrics" to metrics, "corners" to corners.map { it.data() }, "histogram" to histogram, "turningSignature" to turns.toList(), "outline" to points.map { listOf(it.x, it.y) }, "gates" to shapeGates(metrics))
}
fun shapeGates(metrics: Map<String, Double>) = TrackQuality.csv(File(TrackQuality.root, "tracks/shape-thresholds.csv").readText()).map { row ->
    val value = metrics[row.getValue("metric")]; val low = row.getValue("min").toDoubleOrNull(); val high = row.getValue("max").toDoubleOrNull()
    mapOf("metric" to row.getValue("metric"), "value" to value, "min" to low, "max" to high, "status" to
        if (value == null || !value.isFinite()) "unmeasured" else if ((low == null || value >= low) && (high == null || value <= high)) "pass" else "flag")
}
private fun shapeCross(a: ShapePoint, b: ShapePoint, c: ShapePoint) = (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x)
fun shapeHull(points: List<ShapePoint>): List<ShapePoint> {
    val sorted = points.distinct().sortedWith(compareBy<ShapePoint> { it.x }.thenBy { it.y })
    fun half(xs: List<ShapePoint>): List<ShapePoint> { val result = mutableListOf<ShapePoint>(); for (p in xs) { while (result.size >= 2 && shapeCross(result[result.size-2], result.last(), p) <= 0) result.removeAt(result.lastIndex); result += p }; return result.dropLast(1) }
    return half(sorted) + half(sorted.reversed())
}
/** Equal-distance samples make signatures independent of node density. All input is the JVM bake. */
fun trackShape(c: Course): TrackShape {
    val n = 256; val step = c.lengthM / n; val p = TrackPoint()
    val points = (0 until n).map { c.sample(it * step, 0.0, p); ShapePoint(p.x, p.y) }
    fun at(i: Int) = points[i.mod(n)]
    val headings = DoubleArray(n) { i -> atan2(at(i+1).y-at(i-1).y, at(i+1).x-at(i-1).x) }
    val turns = DoubleArray(n) { i -> wrapAngle(headings[(i+1)%n]-headings[i]) }
    val smooth = DoubleArray(n) { i -> (-1..1).sumOf { turns[(i+it).mod(n)] } / 3 }
    // A fixed physical threshold, with a 12-degree aggregate floor, rejects spline noise.
    val labels = IntArray(n) { if (abs(smooth[it])/step < .0018) 0 else if (smooth[it] > 0) 1 else -1 }
    val origin = (0 until n).firstOrNull { labels[it] != labels[(it+n-1)%n] } ?: 0
    val runs = mutableListOf<List<Int>>(); var run = mutableListOf<Int>()
    for (k in 0 until n) { val i=(origin+k)%n; if (run.isNotEmpty() && labels[i]!=labels[run.last()]) { runs += run; run=mutableListOf() }; run+=i }; if(run.isNotEmpty())runs+=run
    val corners = runs.filter { labels[it.first()] != 0 }.mapNotNull { indices ->
        val degrees=indices.sumOf { smooth[it] }*180/PI; if(abs(degrees)<12) return@mapNotNull null
        val radius=step/indices.maxOf { abs(smooth[it]) }/TrackQuality.longest
        val type=when { abs(degrees) in 135.0..220.0 -> "hairpin"; abs(degrees)<35 -> "kink"; radius>=6 -> "sweeper"; else -> "corner" }
        ShapeCorner(indices.first(), (indices.last()+1)%n, degrees, radius, type, indices.size*step/TrackQuality.longest)
    }
    val histogram=linkedMapOf("hairpin" to 0,"chicane" to 0,"esses" to 0,"sweeper" to 0,"kink" to 0,"double-apex" to 0,"corner" to 0)
    corners.forEach { histogram[it.type]=histogram.getValue(it.type)+1 }
    var changes=0; var brake=0
    for(i in corners.indices) {
        val a=corners[i];val b=corners[(i+1)%corners.size];val next=corners[(i+2)%corners.size]
        val gap=(b.start-a.end).mod(n)*step/TrackQuality.longest
        if(a.degrees*b.degrees<0) {
            changes++
            if(gap<=3 && abs(a.degrees) in 25.0..100.0 && abs(b.degrees) in 25.0..100.0) histogram["chicane"]=histogram.getValue("chicane")+1
            if(gap<=6 && b.degrees*next.degrees<0 && (next.start-b.end).mod(n)*step/TrackQuality.longest<=6) histogram["esses"]=histogram.getValue("esses")+1
        } else if(gap in .5..6.0 && abs(a.degrees) in 30.0..100.0 && abs(b.degrees) in 30.0..100.0) histogram["double-apex"]=histogram.getValue("double-apex")+1
        val previous=corners[(i+corners.size-1)%corners.size]
        val approach=(a.start-previous.end).mod(n)*step/TrackQuality.longest
        if(approach>=6 && abs(a.degrees)>=45 && a.radiusL<6)brake++
    }
    // A same-sign run can contain two distinct apexes without a perfectly straight gap.
    for(indices in runs.filter { labels[it.first()]!=0 && it.size>=9 }) {
        val peaks=(2 until indices.size-2).filter { k -> abs(smooth[indices[k]])>abs(smooth[indices[k-1]]) && abs(smooth[indices[k]])>=abs(smooth[indices[k+1]]) }
        if(peaks.zipWithNext().any { (a,b) -> (b-a)*step/TrackQuality.longest>=1 && (a..b).minOf { abs(smooth[indices[it]]) } < min(abs(smooth[indices[a]]),abs(smooth[indices[b]]))*.6 }) histogram["double-apex"]=histogram.getValue("double-apex")+1
    }
    val hull=shapeHull(points); val perimeter=hull.indices.sumOf { hypot(hull[it].x-hull[(it+1)%hull.size].x,hull[it].y-hull[(it+1)%hull.size].y) }
    val area=abs(hull.indices.sumOf { hull[it].x*hull[(it+1)%hull.size].y-hull[(it+1)%hull.size].x*hull[it].y })/2
    var near=0;var folded=0;val crossingPoints=mutableSetOf<Pair<Long,Long>>()
    for(i in 0 until n) {
        var isNear=false;var isFold=false
        for(j in 0 until n) {
            val gap=min(abs(i-j), n-abs(i-j))*step
            val fullWidth=c.widthAt(i*step)+c.widthAt(j*step)
            if(gap<max(8*TrackQuality.longest,4*fullWidth))continue
            val distance=hypot(points[i].x-points[j].x,points[i].y-points[j].y)
            if(distance<4*fullWidth) { isNear=true; if(cos(headings[i]-headings[j])<-.7)isFold=true }
            if(j>i) {
                val a=at(i);val b=at(i+1);val d=at(j);val e=at(j+1)
                val den=(b.x-a.x)*(e.y-d.y)-(b.y-a.y)*(e.x-d.x)
                if(abs(den)>1e-8) {
                    val t=((d.x-a.x)*(e.y-d.y)-(d.y-a.y)*(e.x-d.x))/den
                    val u=((d.x-a.x)*(b.y-a.y)-(d.y-a.y)*(b.x-a.x))/den
                    if(t in -1e-8..1.00000001 && u in -1e-8..1.00000001)crossingPoints+=((a.x+t*(b.x-a.x))*100).roundToLong() to ((a.y+t*(b.y-a.y))*100).roundToLong()
                }
            }
        }
        if(isNear)near++;if(isFold)folded++
    }
    val metrics=linkedMapOf("lengthM" to c.lengthM,"hullPerimeterM" to perimeter,"hullAreaM2" to area,"hullPerimeterRatio" to c.lengthM/perimeter,"hullAreaPacking" to c.lengthM*c.lengthM/(4*PI*area),
        "absoluteTurnDegrees" to turns.sumOf { abs(it) }*180/PI,"signedTurnDegrees" to turns.sum()*180/PI,"signChanges" to changes.toDouble(),"directionReversals" to corners.count { abs(it.degrees) in 135.0..220.0 }.toDouble(),
        "cornerFamilies" to histogram.count { it.value>0 }.toDouble(),"proximityRatio" to near.toDouble()/n,"foldbackRatio" to folded.toDouble()/n,"crossings" to crossingPoints.size.toDouble(),"declaredJunctions" to c.junctions.size.toDouble(),"undeclaredCrossings" to max(0,crossingPoints.size-c.junctions.size).toDouble(),"straightBrakePairs" to brake.toDouble())
    return TrackShape(points,turns,corners,histogram,metrics)
}
/** Procrustes RMS / RMS radius, minimized over start, direction, reflection and rotation. */
object OutlineRules {
    val values=TrackQuality.csv(File(TrackQuality.root,"tracks/outline-thresholds.csv").readText()).associate{it.getValue("metric") to it.number("min")}
    fun similar(s:Map<String,Double>)=s.any{(metric,value)->value<values.getValue(metric)}
}
fun shapeSimilarity(a: TrackShape,b: TrackShape): Map<String,Double> {
    fun normalized(ps: List<ShapePoint>): List<ShapePoint> { val x=ps.map { it.x }.average();val y=ps.map { it.y }.average();val r=sqrt(ps.sumOf { (it.x-x).pow(2)+(it.y-y).pow(2) }/ps.size);return ps.map { ShapePoint((it.x-x)/r,(it.y-y)/r) } }
    val ap=normalized(a.points.filterIndexed { i,_ -> i%4==0 });val bp=normalized(b.points.filterIndexed { i,_ -> i%4==0 });val n=ap.size
    var best=Double.POSITIVE_INFINITY;var turnBest=Double.POSITIVE_INFINITY
    for(reverse in listOf(-1,1))for(mirror in listOf(-1,1))for(shift in 0 until n) {
        var dot=0.0;var cross=0.0
        for(i in 0 until n) { val p=ap[i];val q=bp[(shift+reverse*i).mod(n)];dot+=p.x*q.x+p.y*q.y*mirror;cross+=p.x*q.y*mirror-p.y*q.x }
        best=min(best,sqrt(max(0.0,2-2*hypot(dot,cross)/n)))
        var diff=0.0
        for(i in 0 until n) { val av=(0..3).sumOf { a.turns[(i*4+it)%256] }; val j=(shift+reverse*i).mod(n);val bv=(0..3).sumOf { b.turns[(j*4+it)%256] }*mirror*reverse;diff+=abs(av-bv) }
        turnBest=min(turnBest,diff/(2*PI))
    }
    return mapOf("outlineDistance" to best,"turningDistance" to turnBest)
}
fun shapeFixtures(): Map<String,Course> {
    val base=Courses.all.first()
    fun make(points: List<Pair<Double,Double>>) = qualityClone(base,(points+points.first()).map { TrackNode(it.first,it.second,9.0,Surfaces.asphalt,0.0) },features=emptyList(),obstacles=emptyList())
    return linkedMapOf("circle" to make((0 until 32).map { 140*cos(it*2*PI/32) to 140*sin(it*2*PI/32) }),
        "oval" to make((0 until 32).map { 230*cos(it*2*PI/32) to 95*sin(it*2*PI/32) }),
        "rounded-rectangle" to make(listOf(-180.0 to -100.0,0.0 to -100.0,180.0 to -100.0,200.0 to 0.0,180.0 to 100.0,0.0 to 100.0,-180.0 to 100.0,-200.0 to 0.0)),
        "plus-blob" to make(listOf(-60.0 to -180.0,60.0 to -180.0,60.0 to -60.0,180.0 to -60.0,180.0 to 60.0,60.0 to 60.0,60.0 to 180.0,-60.0 to 180.0,-60.0 to 60.0,-180.0 to 60.0,-180.0 to -60.0,-60.0 to -60.0)),
        "illegal-crossing" to make(listOf(-180.0 to -100.0,0.0 to 0.0,180.0 to 100.0,220.0 to 0.0,180.0 to -100.0,0.0 to 0.0,-180.0 to 100.0,-220.0 to 0.0)))
}
fun shapeProof(): List<Map<String,Any?>> {
    val fixtures=shapeFixtures();val circle=trackShape(fixtures.getValue("circle"));val oval=trackShape(fixtures.getValue("oval"))
    val proof=mutableListOf<Map<String,Any?>>()
    for(row in shapeGates(circle.metrics))if(row["metric"]!="undeclaredCrossings")proof+=mapOf("name" to "circle rejects ${row["metric"]}","kind" to "planted geometry","fired" to (row["status"]=="flag"),"measurement" to row)
    val crossing=shapeGates(trackShape(fixtures.getValue("illegal-crossing")).metrics).single { it["metric"]=="undeclaredCrossings" }
    proof+=mapOf("name" to "undeclared figure-eight crossing","kind" to "planted geometry","fired" to (crossing["status"]=="flag"),"measurement" to crossing)
    for((name,c) in fixtures.filterKeys { it!="illegal-crossing" }) { val gates=shapeGates(trackShape(c).metrics);proof+=mapOf("name" to "$name is not a mastered road course","kind" to "planted geometry","fired" to gates.any { it["status"]=="flag" }) }
    val c=fixtures.getValue("oval");val moved=qualityClone(c,c.nodes.map { it.copy(x=-it.y*1.7+133,y=it.x*1.7-41) });val mirror=qualityClone(c,c.nodes.map { it.copy(x=-it.x) })
    for((name,s) in listOf("scaled-rotated-translated duplicate" to trackShape(moved),"reflected duplicate" to trackShape(mirror))) { val sim=shapeSimilarity(oval,s);proof+=mapOf("name" to name,"kind" to "planted pair","fired" to OutlineRules.similar(sim),"measurement" to sim) }
    return proof
}
fun main() {
    val out=File(TrackQuality.root,"tracks/atlas");val proof=shapeProof();check(proof.all { it["fired"]==true }) { proof.filter { it["fired"]!=true }.toString() }
    val shapes=Courses.all.associate { it.id to trackShape(it) }
    val pairs=Courses.all.indices.flatMap { i -> (i+1 until Courses.all.size).map { j -> val a=Courses.all[i];val b=Courses.all[j];val s=shapeSimilarity(shapes.getValue(a.id),shapes.getValue(b.id));mapOf("a" to a.id,"b" to b.id,"metrics" to s,"similar" to OutlineRules.similar(s)) } }
    val result=mapOf("version" to "R1-shape-v1","truth" to "Baked geometry; authored design gates. Legacy simulation remains in T1 atlas and is not post-merge candidate proof.","proof" to proof,"pairs" to pairs,
        "courses" to Courses.all.map { c -> mapOf("id" to c.id,"name" to c.name,"theme" to c.theme,"acceptedException" to (c.id=="runoff"),"shape" to shapes.getValue(c.id).data(),"course" to qualityCourseData(c),"lint" to TrackLinter.errors(c)) })
    val json=TrackQuality.json(result);File(out,"shapes.json").writeText(json);File(out,"shapes-data.js").writeText("window.TRACK_SHAPES=$json;\n")
    println("R1: ${shapes.size} courses; ${proof.size} witnesses; ${pairs.count { it["similar"]==true }} similar pairs; ${shapes.count { shapeGates(it.value.metrics).any { g -> g["status"]=="flag" } }} flagged outlines")
}
