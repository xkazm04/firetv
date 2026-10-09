package dev.deathride.core

import kotlin.math.*
import java.lang.StrictMath.sqrt
import java.lang.StrictMath.atan2

object TrackRules {
    val values=Content.table("track-rules").associate { it.getValue("key") to it.number("value") }
    operator fun get(key: String)=values.getValue(key)
}
object VisualTuning {
    private val values=Content.table("presentation").associate { it.getValue("key") to it.number("value") }
    operator fun get(key: String)=values.getValue(key)
}
class CarShape(row: Map<String,String>) {
    val id=row.getValue("id"); val lengthM=row.number("lengthM"); val widthM=row.number("widthM")
    val noseWidth=row.number("noseWidth"); val roofLength=row.number("roofLength"); val roofOffset=row.number("roofOffset")
    val roofWidth=row.number("roofWidth"); val spoiler=row.number("spoiler")!=0.0
}
object CarShapes {
    val all=Content.table("car-shapes").map { CarShape(it) }
    fun forId(id: String)=all.first { it.id==id }
}
data class TrackSpot(val kind: String,val fraction: Double,val laneM: Double)
data class TrackNode(val x: Double,val y: Double,val width: Double,val surface: Surface,val lane: Double)
enum class BoundaryMaterial { METAL, CONCRETE }

/** Immutable load-time spline bake. No list traversal, temporary points or allocation in sample/project. */
class Course(val id: String,val name: String,val lesson: String,val startFraction: Double,val theme: String,
             val nodes: List<TrackNode>,val spots: List<TrackSpot>,val features: List<TrackFeature> = TrackContent.features[id]?:emptyList(),
             val obstaclePlacements: List<ObstaclePlacement> = ObstacleContent.placements[id]?:emptyList(),
             val junctions: List<TrackJunction> = TrackJunctions.load(id),
             val branches: List<TrackBranch> = TrackBranches.load(id,theme),
             val raceProfile: TrackRaceProfile? = TrackRaceProfile.load(id),
             val region: RegionDefinition = Regions.forCourse(id,theme)) {
    val obstacles: Array<TrackObstacle>
    private val oil=Surfaces.practice.first { it.id=="Oil" }
    /** Shared by the rendered boundary and its contact presentation. */
    val boundaryMaterial=if(theme=="industrial")BoundaryMaterial.METAL else BoundaryMaterial.CONCRETE
    private val subdivisions=TrackRules["samplesPerSpan"].toInt()
    val count=(nodes.size-1)*subdivisions
    val x=DoubleArray(count+1); val y=DoubleArray(count+1); val width=DoubleArray(count+1)
    val lane=DoubleArray(count+1); val surfaces=Array(count+1){Surfaces.asphalt}
    val arc=DoubleArray(count+1); val curvature=DoubleArray(count+1)
    private val dx=DoubleArray(count); private val dy=DoubleArray(count); private val inverseLength2=DoubleArray(count)
    val lengthM: Double
    val minX: Double; val maxX: Double; val minY: Double; val maxY: Double
    val checkpoints=spots.filter { it.kind=="checkpoint" }.map { it.fraction }.toDoubleArray()
    val grid=spots.filter { it.kind=="grid" }
    private val cell=TrackRules["projectionCellM"]
    private val columns: Int; private val rows: Int
    /** Projection bins are cell*BIN_TOP/BIN_SPLIT on a side (see bakeCandidates): candidate lists ~10x shorter than the 20 m authoring cell gave. */
    private val binM: Double
    /** Baked on first projection, not at class load: the eager bake of every archived course stalled Android startup.
     *  [prewarmProjection] bakes them ahead of use; a project() racing an unfinished bake waits on this lock. */
    private val candidateBins=lazy(LazyThreadSafetyMode.SYNCHRONIZED) { bakeCandidates() }
    private val candidates: Array<IntArray> by candidateBins
    val pool=TrackContent.pools[id]?:TrackPool(0,4)
    val json get()=json(region)
    fun json(region: RegionDefinition)=courseJson(id,name,lesson,theme,features,pool,region)
    init {
        require(nodes.size>=5 && nodes.first()==nodes.last()) { "$id: centerline must explicitly close" }
        val n=nodes.size-1
        fun spline(a: Double,b: Double,c: Double,d: Double,t: Double)=.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t)
        for(i in 0 until count) {
            val j=i/subdivisions; val t=(i%subdivisions).toDouble()/subdivisions
            val a=nodes[(j+n-1)%n];val b=nodes[j];val c=nodes[(j+1)%n];val d=nodes[(j+2)%n]
            x[i]=spline(a.x,b.x,c.x,d.x,t);y[i]=spline(a.y,b.y,c.y,d.y,t)
            width[i]=b.width+(c.width-b.width)*t;lane[i]=b.lane+(c.lane-b.lane)*t;surfaces[i]=b.surface
        }
        x[count]=x[0];y[count]=y[0];width[count]=width[0];lane[count]=lane[0];surfaces[count]=surfaces[0]
        for(i in 0 until count) {
            dx[i]=x[i+1]-x[i];dy[i]=y[i+1]-y[i];val len2=dx[i]*dx[i]+dy[i]*dy[i]
            require(len2>1e-8);inverseLength2[i]=1/len2;arc[i+1]=arc[i]+sqrt(len2)
        }
        lengthM=arc[count]
        for(i in 0 until count) { val p=(i+count-1)%count; curvature[i]=abs(wrapAngle(atan2(dy[i],dx[i])-atan2(dy[p],dx[p])))/((arc[i+1]-arc[i]+arc[p+1]-arc[p])*.5) }
        curvature[count]=curvature[0]
        minX=min(x.min(),branches.minOfOrNull { it.alternative.x.min() }?:x.min())-width.max()-cell; maxX=max(x.max(),branches.maxOfOrNull { it.alternative.x.max() }?:x.max())+width.max()+cell
        minY=min(y.min(),branches.minOfOrNull { it.alternative.y.min() }?:y.min())-width.max()-cell; maxY=max(y.max(),branches.maxOfOrNull { it.alternative.y.max() }?:y.max())+width.max()+cell
        columns=ceil((maxX-minX)/(cell*BIN_TOP)).toInt()*BIN_SPLIT;rows=ceil((maxY-minY)/(cell*BIN_TOP)).toInt()*BIN_SPLIT;binM=cell*BIN_TOP/BIN_SPLIT
        obstacles=ObstacleContent.bake(this,obstaclePlacements)
    }
    // Static spatial bins: each contains every segment that can be the nearest segment of some point in its cell
    // (centre distance <= nearest + cellSize*sqrt(2)). Built coarse-to-fine: a child bin only has to look through its
    // parent's list, because a segment that cannot be nearest anywhere in the parent cannot be nearest in the child.
    // For any in-bounds point the argmin is exactly what the single 20 m grid produced, with ~10x shorter lists.
    private fun bakeCandidates(): Array<IntArray> {
        val scratch=DoubleArray(count)
        var size=cell*BIN_TOP;var cols=columns/BIN_SPLIT;var rws=rows/BIN_SPLIT
        var level=Array(cols*rws) { index ->
            val cx=minX+(index%cols+.5)*size;val cy=minY+(index/cols+.5)*size
            var nearest=Double.POSITIVE_INFINITY
            for(i in 0 until count) { val d=sqrt(distance2(cx,cy,i));scratch[i]=d;if(d<nearest)nearest=d }
            val limit=nearest+size*sqrt(2.0)
            var n=0;for(i in 0 until count)if(scratch[i]<=limit)n++
            val out=IntArray(n);n=0;for(i in 0 until count)if(scratch[i]<=limit)out[n++]=i
            out
        }
        var split=1
        while(split<BIN_SPLIT) {
            val half=size/2;val parents=level;val parentCols=cols;cols*=2;rws*=2
            level=Array(cols*rws) { index ->
                val fx=index%cols;val fy=index/cols;val parent=parents[(fy/2)*parentCols+fx/2]
                val cx=minX+(fx+.5)*half;val cy=minY+(fy+.5)*half
                var nearest=Double.POSITIVE_INFINITY
                for(k in parent.indices) { val d=sqrt(distance2(cx,cy,parent[k]));scratch[k]=d;if(d<nearest)nearest=d }
                val limit=nearest+half*sqrt(2.0)
                var n=0;for(k in parent.indices)if(scratch[k]<=limit)n++
                val out=IntArray(n);n=0;for(k in parent.indices)if(scratch[k]<=limit)out[n++]=parent[k]
                out
            }
            size=half;split*=2
        }
        return level
    }
    /** Bakes this course's projection bins and every branch's on the calling thread, so the first project() is a lookup.
     *  Call it off the render thread (see [CoursePrewarm]) for the course about to be used, never for the whole catalogue. */
    fun prewarmProjection() { candidates;for(i in branches.indices)branches[i].alternative.prewarmProjection() }
    /** True once [prewarmProjection] has nothing left to do. */
    val projectionReady: Boolean get() {
        if(!candidateBins.isInitialized())return false
        for(i in branches.indices)if(!branches[i].alternative.projectionReady)return false
        return true
    }
    /** Memory report only: ints held by this course's bins and its branches' (bakes them if needed). */
    fun projectionInts(): Long { var n=0L;for(bin in candidates)n+=bin.size;for(i in branches.indices)n+=branches[i].alternative.projectionInts();return n }
    /** Memory report only: bin arrays held, each with its own array header. */
    fun projectionBinArrays(): Int { var n=candidates.size;for(i in branches.indices)n+=branches[i].alternative.projectionBinArrays();return n }
    private fun distance2(px: Double,py: Double,i: Int): Double {
        val t=((px-x[i])*dx[i]+(py-y[i])*dy[i])*inverseLength2[i]
        val u=t.coerceIn(0.0,1.0);val a=px-x[i]-dx[i]*u;val b=py-y[i]-dy[i]*u
        return a*a+b*b
    }
    fun phase(s: Double)=((s%lengthM)+lengthM)%lengthM
    fun index(s: Double): Int {
        val p=phase(s);var low=0;var high=count
        while(low+1<high) { val mid=(low+high)/2;if(arc[mid]<=p)low=mid else high=mid }
        return low
    }
    fun widthAt(s: Double,route: Int=0): Double { if(route>0 && route<=branches.size) {val b=branches[route-1];if(b.contains(s,this))return b.alternative.widthAt(b.toAlternative(s,this))};val i=index(s);val t=(phase(s)-arc[i])/(arc[i+1]-arc[i]);return width[i]+(width[i+1]-width[i])*t }
    fun laneAt(s: Double,grip: Int=0): Double {
        if(grip>=TrackContent["shortcutGripStat"]) {
            val fraction=phase(s)/lengthM
            for(i in features.indices) { val f=features[i];if(f.kind=="shortcut" && f.contains(fraction))return f.laneM }
        }
        return lane[index(s)]
    }
    fun surfaceAt(s: Double,lateral: Double,route: Int=0): Surface {
        if(route>0 && route<=branches.size) {val b=branches[route-1];if(b.contains(s,this))return b.alternative.surfaceAt(b.toAlternative(s,this),lateral)}
        val f=phase(s)/lengthM
        for(i in features.indices) { val feature=features[i];if(feature.kind=="shortcut" && feature.contains(f) && abs(lateral-feature.laneM)<feature.widthM*.5)return feature.surface }
        for(i in spots.indices) { val spot=spots[i];if(spot.kind=="hazard") {
            val sf=phase((startFraction+spot.fraction)*lengthM)/lengthM
            val gap=abs(f-sf)*lengthM
            if(min(gap,lengthM-gap)<TrackRules["hazardLengthM"]*.5 && abs(lateral-spot.laneM)<TrackRules["hazardWidthM"]*.5)return oil
        } }
        return surfaces[index(s)]
    }
    fun sample(s: Double,lateral: Double,out: TrackPoint,route: Int=0) {
        if(route>0 && route<=branches.size) {val b=branches[route-1];if(b.contains(s,this)){b.alternative.sample(b.toAlternative(s,this),lateral,out);return}}
        val p=phase(s);val i=index(p);val len=arc[i+1]-arc[i];val t=(p-arc[i])/len
        out.x=x[i]+dx[i]*t-dy[i]/len*lateral;out.y=y[i]+dy[i]*t+dx[i]/len*lateral
        out.heading=atan2(dy[i],dx[i]);out.curvature=curvature[i]
    }
    fun project(px: Double,py: Double,out: Projection,hintS: Double=Double.NaN,routeHint: Int=0) {
        val col=((px-minX)/binM).toInt().coerceIn(0,columns-1);val row=((py-minY)/binM).toInt().coerceIn(0,rows-1)
        val list=candidates[row*columns+col];var best=Double.POSITIVE_INFINITY;var chosen=0
        for(k in list.indices) { val i=list[k];val d=distance2(px,py,i);if(d<best){best=d;chosen=i} }
        // Preserve passage identity at an at-grade crossing. A far teleport still uses global projection.
        if(junctions.isNotEmpty() && hintS.isFinite()) {
            var localBest=Double.POSITIVE_INFINITY;var local=chosen
            for(k in list.indices) {val i=list[k];if(TrackJunctions.cyclicGap(this,arc[i],hintS)<100) {val d=distance2(px,py,i);if(d<localBest){localBest=d;local=i}}}
            if(localBest<=best+width[chosen]*width[chosen]*4)chosen=local
        }
        val i=chosen;val u=(((px-x[i])*dx[i]+(py-y[i])*dy[i])*inverseLength2[i]).coerceIn(0.0,1.0)
        val len=arc[i+1]-arc[i];out.s=arc[i]+u*len;out.nx=-dy[i]/len;out.ny=dx[i]/len
        out.distance=(px-x[i]-u*dx[i])*out.nx+(py-y[i]-u*dy[i])*out.ny
        out.route=0
        if(branches.isNotEmpty()) {
            var bestS=out.s;var bestDistance=out.distance;var bestNx=out.nx;var bestNy=out.ny;var bestRoute=0
            var bestD=distance2(px,py,i)
            for(k in branches.indices) {
                val b=branches[k];b.alternative.project(px,py,out)
                val fraction=out.s/b.alternative.lengthM
                if(fraction !in b.altStart..b.altEnd)continue
                val d=out.distance*out.distance
                if(d<bestD-.01 || routeHint==k+1 && d<=bestD+1.0) {
                    bestD=d;bestS=b.toMain(out.s,this);bestDistance=out.distance;bestNx=out.nx;bestNy=out.ny;bestRoute=k+1
                }
            }
            out.s=bestS;out.distance=bestDistance;out.nx=bestNx;out.ny=bestNy;out.route=bestRoute
        }
    }
}
/** Projection bins: 4 authoring cells across at the top level, halved BIN_SPLIT-fold (8 -> 10 m bins; 16 -> 5 m is ~10% faster for ~3x the list memory). */
private const val BIN_SPLIT=8
private const val BIN_TOP=4
object Courses {
    private val rows=Content.table("tracks")
    private val ids=rows.map { it.getValue("id") }
    /** Built on first use. A course bakes a spline, obstacles, branches and junctions: building all 66 at class load cost ~270 ms on desktop (several seconds on a Stick) and only the selected course is ever raced. */
    private val built=arrayOfNulls<Course>(rows.size)
    private fun build(index: Int): Course {
        val row=rows[index];val id=ids[index]
        return Course(id,row.getValue("name"),row.getValue("lesson"),row.number("startFraction"),row.getValue("theme"),
            Content.table("tracks/$id").map { TrackNode(it.number("xM"),it.number("yM"),it.number("halfWidthM"),Surfaces.all.first { s->s.id==it.getValue("surface") },it.number("aiLaneM")) },
            Content.table("tracks/$id-spots").map { TrackSpot(it.getValue("kind"),it.number("fraction"),it.number("laneM")) })
    }
    fun course(index: Int): Course = synchronized(built) { built[index]?:build(index).also { built[index]=it } }
    /** Same order and stable legacy indices as before; elements materialise on access. */
    val all: List<Course> = object: AbstractList<Course>(),RandomAccess {
        override val size get()=ids.size
        override fun get(index: Int)=course(index)
    }
    /** Cheap lookups that do not build any course. */
    fun indexOf(id: String)=ids.indexOf(id)
    fun id(index: Int)=ids[index]
    // Keep stable legacy indices for saved identifiers and archived authoring fixtures.
    // Only owner-selected campaign courses and retained alternates are offered for play.
    val playableIndices=Content.table("active-tracks").map { row->
        ids.indexOf(row.getValue("id")).also{require(it>=0){"Unknown active course"}}
    }.also{require(it.isNotEmpty() && it.distinct().size==it.size)}
    val playable: List<Course> = object: AbstractList<Course>(),RandomAccess {
        override val size get()=playableIndices.size
        override fun get(index: Int)=course(playableIndices[index])
    }
    fun nextPlayable(index:Int)=playableIndices[(playableIndices.indexOf(index)+1).mod(playableIndices.size)]
    /** Catalogue metadata straight from the tables, byte-identical to Course.json, without baking any geometry. */
    val json=playableIndices.joinToString(",","[","]"){ i->val row=rows[i];val id=ids[i];val theme=row.getValue("theme")
        courseJson(id,row.getValue("name"),row.getValue("lesson"),theme,TrackContent.features[id]?:emptyList(),TrackContent.pools[id]?:TrackPool(0,4),Regions.forCourse(id,theme)) }
}
internal fun courseJson(id: String,name: String,lesson: String,theme: String,features: List<TrackFeature>,pool: TrackPool,region: RegionDefinition)="{\"id\":\"$id\",\"name\":\"$name\",\"lesson\":\"$lesson\",\"theme\":\"$theme\",\"region\":\"${region.id}\",\"regionName\":\"${region.name}\",\"competitiveCars\":[${pool.eligible().joinToString(","){"\"${CarCatalog.all[it].id}\""}}],\"features\":[${features.joinToString(","){"{\"kind\":\"${it.kind}\",\"start\":${it.start},\"end\":${it.end},\"laneM\":${it.laneM},\"landmark\":\"${it.landmark}\"}"}}]}"

object TrackLinter {
    fun errors(c: Course): List<String> {
        val errors=ArrayList<String>();errors.addAll(TrackContent.errors(c));errors.addAll(ObstacleContent.errors(c));errors.addAll(TrackJunctions.errors(c));errors.addAll(TrackBranches.errors(c));val widest=CarShapes.all.maxOf { it.widthM };val longest=CarShapes.all.maxOf { it.lengthM }
        if(c.width.min()*2<widest*TrackRules["minWidthCarWidths"])errors.add("${c.id}: road narrower than minimum car widths")
        if(c.curvature.max()*longest*TrackRules["minRadiusCarLengths"]>1)errors.add("${c.id}: corner radius too tight")
        if(c.checkpoints.size<4 || c.checkpoints.first()!=0.0 || c.checkpoints.toList().zipWithNext().any { it.first>=it.second } || c.checkpoints.last()>=1)errors.add("${c.id}: checkpoint order")
        if(c.grid.size!=Tuning.CAR_COUNT)errors.add("${c.id}: six grid positions required")
        val p=TrackPoint();val q=TrackPoint()
        for((a,spot) in c.spots.withIndex()) {
            if(spot.kind !in setOf("checkpoint","grid","ammo","repair","hazard","cash"))errors.add("${c.id}: unknown spot")
            val s=(c.startFraction+spot.fraction)*c.lengthM
            if(abs(spot.laneM)+widest*.5>c.widthAt(s)-Movement.vergeWidthM)errors.add("${c.id}: spot outside road")
            if(spot.kind!="grid" && spot.fraction !in 0.0..<1.0)errors.add("${c.id}: spot fraction")
            if(spot.kind=="grid")for(b in a+1 until c.spots.size)if(c.spots[b].kind=="grid") {
                c.sample(s,spot.laneM,p);val other=c.spots[b];c.sample((c.startFraction+other.fraction)*c.lengthM,other.laneM,q)
                val offset=(longest-widest)*.5
                val clearance=widest+TrackRules["gridClearanceM"]
                if(segmentDistance(p.x-cos(p.heading)*offset,p.y-sin(p.heading)*offset,p.x+cos(p.heading)*offset,p.y+sin(p.heading)*offset,
                    q.x-cos(q.heading)*offset,q.y-sin(q.heading)*offset,q.x+cos(q.heading)*offset,q.y+sin(q.heading)*offset)<clearance)errors.add("${c.id}: grid cars overlap")
            }
        }
        var straight=0.0
        for(i in 0 until c.count) {
            if(c.curvature[i]<TrackRules["straightCurvature"])straight+=c.arc[i+1]-c.arc[i]
            // Distant portions of the ribbon must not cross or overlap. Exclude the local corner neighborhood.
            for(j in i+1 until c.count) {
                val arcGap=min(c.arc[j]-c.arc[i],c.lengthM-c.arc[j]+c.arc[i])
                val clearance=c.width[i]+c.width[j]
                // Exact broad-phase rejection. Dense composer bakes otherwise pay four hypot calls
                // for millions of segment pairs whose axis bounds are already farther apart.
                if(min(c.x[i],c.x[i+1])-max(c.x[j],c.x[j+1])>=clearance || min(c.x[j],c.x[j+1])-max(c.x[i],c.x[i+1])>=clearance ||
                    min(c.y[i],c.y[i+1])-max(c.y[j],c.y[j+1])>=clearance || min(c.y[j],c.y[j+1])-max(c.y[i],c.y[i+1])>=clearance)continue
                if(arcGap>clearance*2 && segmentDistance(c.x[i],c.y[i],c.x[i+1],c.y[i+1],c.x[j],c.y[j],c.x[j+1],c.y[j+1])<clearance && !TrackJunctions.permits(c,c.arc[i],c.arc[j])) {
                    errors.add("${c.id}: ribbon overlap at segments $i/$j");return errors
                }
            }
        }
        val fraction=straight/c.lengthM
        if(fraction !in TrackRules["minStraightFraction"]..TrackRules["maxStraightFraction"])errors.add("${c.id}: straight fraction $fraction outside pacing band")
        return errors
    }
    private fun segmentDistance(ax: Double,ay: Double,bx: Double,by: Double,cx: Double,cy: Double,dx: Double,dy: Double): Double {
        fun cross(a: Double,b: Double,c: Double,d: Double)=a*d-b*c
        val abx=bx-ax;val aby=by-ay;val cdx=dx-cx;val cdy=dy-cy
        val den=cross(abx,aby,cdx,cdy)
        if(abs(den)>1e-10) { val t=cross(cx-ax,cy-ay,cdx,cdy)/den;val u=cross(cx-ax,cy-ay,abx,aby)/den;if(t in 0.0..1.0 && u in 0.0..1.0)return 0.0 }
        fun point(px: Double,py: Double,x: Double,y: Double,vx: Double,vy: Double): Double { val t=(((px-x)*vx+(py-y)*vy)/(vx*vx+vy*vy)).coerceIn(0.0,1.0);return hypot(px-x-t*vx,py-y-t*vy) }
        return min(min(point(ax,ay,cx,cy,cdx,cdy),point(bx,by,cx,cy,cdx,cdy)),min(point(cx,cy,ax,ay,abx,aby),point(dx,dy,ax,ay,abx,aby)))
    }
}
