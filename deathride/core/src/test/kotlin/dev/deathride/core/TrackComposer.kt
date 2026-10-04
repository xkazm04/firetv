package dev.deathride.core

import kotlin.math.*

/** Tool-only design language. Distances use the full roster's longest/widest body. */
data class DesignPrimitive(val kind: String,val a: Double,val b: Double=0.0,val c: Double=0.0,val widthW: Double=4.0,val surface: String="Asphalt")
data class DesignAnchor(val x: Double,val y: Double,val radius: Double,val widthW: Double=4.0,val surface: String="Asphalt")
data class ComposedTrack(val course: Course,val primitives: List<DesignPrimitive>,val recipe: String,val spans: List<Map<String,Any?>>)

object TrackComposer {
    const val HEADER="kind,a,b,c,widthW,surface"
    private val L get()=TrackQuality.longest
    private val W get()=TrackQuality.widest
    fun parse(text: String): List<DesignPrimitive> = TrackQuality.csv(text).map { DesignPrimitive(it.getValue("kind"),it.number("a"),it.number("b"),it.number("c"),it.number("widthW"),it.getValue("surface")) }
    fun csv(ops: List<DesignPrimitive>)=HEADER+"\n"+ops.joinToString("\n",postfix="\n") { "${it.kind},${it.a},${it.b},${it.c},${it.widthW},${it.surface}" }

    /** Closed anchor sketch becomes tangent fillets, then an explicit sequence of lines and arcs. No spline is fitted to polygon corners. */
    fun fromAnchors(anchors: List<DesignAnchor>): List<DesignPrimitive> {
        require(anchors.size in 4..64)
        data class Fillet(val entry: ShapePoint,val exit: ShapePoint,val heading: Double,val turn: Double,val radius: Double)
        val fillets=anchors.indices.map { i ->
            val a=anchors[(i+anchors.size-1)%anchors.size];val b=anchors[i];val c=anchors[(i+1)%anchors.size]
            val incoming=atan2(b.y-a.y,b.x-a.x);val outgoing=atan2(c.y-b.y,c.x-b.x);val turn=wrapAngle(outgoing-incoming)
            require(abs(turn)>1e-5 && abs(turn)<PI-.01) { "Anchor $i needs a finite turn below 180 degrees; use two terminal corners for a hairpin" }
            require(b.radius>=2.3) { "Anchor $i: author radius at least 2.3 L before spline bake" }
            val cut=b.radius*tan(abs(turn)/2)
            Fillet(ShapePoint(b.x-cos(incoming)*cut,b.y-sin(incoming)*cut),ShapePoint(b.x+cos(outgoing)*cut,b.y+sin(outgoing)*cut),incoming,turn,b.radius)
        }
        val ops=mutableListOf(DesignPrimitive("start",fillets[0].exit.x,fillets[0].exit.y,(fillets[0].heading+fillets[0].turn)*180/PI,anchors[0].widthW,anchors[0].surface))
        for(k in 1..anchors.size) {
            val i=k%anchors.size;val prev=(i+anchors.size-1)%anchors.size;val from=fillets[prev].exit;val to=fillets[i].entry
            val direction=fillets[i].heading;val dx=to.x-from.x;val dy=to.y-from.y
            val distance=dx*cos(direction)+dy*sin(direction)
            require(distance>=.3) { "Anchors $prev/$i: fillets consume the connecting straight ($distance L); separate anchors or reduce radii" }
            ops+=DesignPrimitive("straight",distance,0.0,0.0,anchors[i].widthW,anchors[i].surface)
            val f=fillets[i];val degrees=f.turn*180/PI
            val kind=when { abs(degrees)>=135 -> "hairpin";abs(degrees)<35 -> "kink";f.radius>=6 -> "sweeper";else -> "corner" }
            ops+=DesignPrimitive(kind,degrees,f.radius,0.0,anchors[i].widthW,anchors[i].surface)
        }
        // Name short coupled sequences, retaining exact entry/exit geometry.
        var i=1
        while(i+2<ops.size) {
            val a=ops[i];val gap=ops[i+1];val b=ops[i+2]
            if(a.kind!in setOf("straight","start") && gap.kind=="straight" && b.kind !in setOf("straight","start") && abs(a.b-b.b)<1e-8 && abs(abs(a.a)-abs(b.a))<1e-8 && a.widthW==b.widthW && a.surface==b.surface && gap.a<=6) {
                val kind=if(a.a*b.a<0)"chicane" else if(abs(a.a+b.a)>=135 && gap.a<=2)"hairpin" else "double-apex"
                if(kind!="chicane" || abs(a.a)<=100) {
                    ops[i]=DesignPrimitive(kind,if(kind=="chicane")a.a else a.a+b.a,a.b,gap.a,a.widthW,a.surface)
                    ops.removeAt(i+2);ops.removeAt(i+1)
                }
            }
            i++
        }
        return ops
    }

    fun compile(base: Course,recipe: String,decorate: Boolean=true): ComposedTrack {
        val allRows=parse(recipe)
        val split=allRows.indexOfFirst { it.kind=="split" }
        if(split>=0) {
            val end=allRows.indexOfLast { it.kind=="rejoin" }
            require(end==allRows.lastIndex && end>split+4 && allRows.count { it.kind=="split" }==1) { "One split block must end with rejoin; it contains a complete alternate recipe" }
            val main=compile(base,csv(allRows.take(split)),decorate)
            val alt=compile(base,csv(allRows.subList(split+1,end)),false).course
            val declaration=allRows[split];val p=TrackPoint();val q=Projection()
            main.course.sample(declaration.a*main.course.lengthM,0.0,p);alt.project(p.x,p.y,q);val from=q.s/alt.lengthM
            main.course.sample(declaration.b*main.course.lengthM,0.0,p);alt.project(p.x,p.y,q);val to=q.s/alt.lengthM
            val branch=TrackBranch(declaration.a,declaration.b,alt,from,to)
            val c=main.course
            var start=c.startFraction
            if(c.grid.any { c.phase((start+it.fraction)*c.lengthM)/c.lengthM in (branch.start-.03)..(branch.end+.03) }) {
                val run=qualityRuns(c) { if(c.curvature[it]<.0025)1 else 0 }.filter { it.lengthM>=6*L && c.curvature[it.indices.first()]<.0025 && it.indices.none { i->c.arc[i]/c.lengthM in (branch.start-.04)..(branch.end+.04) } }.maxByOrNull { it.lengthM }?:error("No launch straight clear of split route")
                start=c.phase(run.startM+run.lengthM-1.5*L)/c.lengthM
            }
            val placements=mutableListOf<ObstaclePlacement>()
            for(placement in c.obstaclePlacements) {
                val candidate=Course(c.id,c.name,c.lesson,start,c.theme,c.nodes,c.spots,c.features,placements+placement,c.junctions,listOf(branch))
                if(ObstacleContent.errors(candidate).isEmpty())placements+=placement
            }
            val course=Course(c.id,c.name,c.lesson,start,c.theme,c.nodes,c.spots,c.features,placements,c.junctions,listOf(branch))
            require(TrackBranches.errors(course).isEmpty()) { TrackBranches.errors(course).joinToString("; ") }
            return ComposedTrack(course,main.primitives,recipe,main.spans)
        }
        val declarations=allRows.filter { it.kind=="junction" }
        val parsed=allRows.filter { it.kind!="junction" }
        val ops=if(parsed.all { it.kind=="anchor" })fromAnchors(parsed.map { DesignAnchor(it.a,it.b,it.c,it.widthW,it.surface) })else parsed
        require(ops.size in 5..160 && ops.first().kind=="start") { "Begin with start (x L, y L, heading degrees) or use only anchor rows" }
        require(ops.all { it.widthW in 3.6..6.0 && it.surface in TrackContent.themes.single { t->t.id==base.theme }.surfaces }) { "Width must be 3.6–6 W and surface in theme vocabulary" }
        val first=ops.first();var x=first.a*L;var y=first.b*L;var heading=first.c*PI/180;val startX=x;val startY=y;val startHeading=heading
        var width=first.widthW*W/2;var surface=Surfaces.all.single { it.id==first.surface };var distance=0.0
        data class Sample(val x: Double,val y: Double,val width: Double,val surface: Surface,val s: Double)
        val dense=mutableListOf(Sample(x,y,width,surface,0.0));val spans=mutableListOf<Map<String,Any?>>()
        fun line(m: Double,targetWidth: Double,targetSurface: Surface) {
            require(m>=0 && m<=1000)
            val sx=x;val sy=y;val oldWidth=width;val n=max(1,ceil(m/2).toInt());val oldS=distance
            for(i in 1..n){val t=i.toDouble()/n;dense+=Sample(sx+cos(heading)*m*t,sy+sin(heading)*m*t,oldWidth+(targetWidth-oldWidth)*(t*t*(3-2*t)),targetSurface,oldS+m*t)}
            x+=cos(heading)*m;y+=sin(heading)*m;distance+=m;width=targetWidth;surface=targetSurface
        }
        fun arc(degrees: Double,radiusL: Double) {
            require(abs(degrees) in 1.0..220.0 && radiusL in 2.3..40.0) { "Arc angle 1–220 degrees; author radius 2.3–40 L" }
            val angle=degrees*PI/180;val sign=sign(angle);val r=radiusL*L;val cx=x-sin(heading)*r*sign;val cy=y+cos(heading)*r*sign;val h=heading
            val length=abs(angle)*r;val n=max(3,ceil(length/2).toInt());val oldS=distance
            for(i in 1..n){val t=i.toDouble()/n;val a=h+angle*t;dense+=Sample(cx+sin(a)*r*sign,cy-cos(a)*r*sign,width,surface,oldS+length*t)}
            heading+=angle;x=dense.last().x;y=dense.last().y;distance+=length
        }
        for(op in ops.drop(1)) {
            val begin=distance;val targetWidth=op.widthW*W/2;val targetSurface=Surfaces.all.single { it.id==op.surface }
            when(op.kind) {
                "straight" -> line(op.a*L,targetWidth,targetSurface)
                "corner","sweeper","kink" -> {require(abs(targetWidth-width)<.01) { "Change width on an approach straight" };surface=targetSurface;arc(op.a,op.b)}
                "hairpin","double-apex" -> {require(abs(targetWidth-width)<.01);surface=targetSurface;arc(op.a/2,op.b);if(op.c>0)line(op.c*L,width,surface);arc(op.a/2,op.b)}
                "chicane" -> {require(abs(targetWidth-width)<.01);surface=targetSurface;arc(op.a,op.b);if(op.c>0)line(op.c*L,width,surface);arc(-op.a,op.b)}
                "esses" -> {require(abs(targetWidth-width)<.01);surface=targetSurface;arc(op.a,op.b);line(op.c*L,width,surface);arc(-2*op.a,op.b);line(op.c*L,width,surface);arc(op.a,op.b)}
                "rejoin","bridge" -> error("${op.kind}: unmatched rejoin or unsupported bridge; use a split/rejoin block or an explicit at-grade junction")
                else -> error("Unknown primitive: ${op.kind}")
            }
            spans+=mapOf("kind" to op.kind,"startM" to begin,"endM" to distance,"widthW" to op.widthW,"surface" to op.surface)
        }
        require(hypot(x-startX,y-startY)<.02 && abs(wrapAngle(heading-startHeading))<.001) { "Open recipe: closure error ${hypot(x-startX,y-startY)} m / ${wrapAngle(heading-startHeading)*180/PI} degrees; edit anchors or complete the primitive sequence" }
        require(distance in 300.0..5000.0) { "Recipe length outside 300–5000 m" }
        require(abs(width-first.widthW*W/2)<.01) { "Closing width must match opening width" }
        // Equidistant control nodes prevent Catmull–Rom speed spikes at line/arc boundaries.
        val count=ceil(distance/9.0).toInt();require(count<=600)
        var cursor=0
        val nodes=(0 until count).map { i -> val s=distance*i/count;while(cursor+1<dense.lastIndex && dense[cursor+1].s<s)cursor++;val a=dense[cursor];val b=dense[cursor+1];val t=(s-a.s)/(b.s-a.s)
            TrackNode(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,a.width+(b.width-a.width)*t,a.surface,0.0) }
        val closed=nodes+nodes.first()
        val empty=Course(base.id,base.name,base.lesson,0.0,base.theme,closed,emptyList(),emptyList(),emptyList())
        val junctions=declarations.map { declaration ->
            var found: TrackJunction?=null
            for(i in 0 until empty.count)for(j in i+2 until empty.count) {
                if(TrackJunctions.cyclicGap(empty,empty.arc[i],empty.arc[j])<80)continue
                val ax=empty.x[i];val ay=empty.y[i];val bx=empty.x[i+1]-ax;val by=empty.y[i+1]-ay
                val cx=empty.x[j];val cy=empty.y[j];val dx=empty.x[j+1]-cx;val dy=empty.y[j+1]-cy;val den=bx*dy-by*dx
                if(abs(den)<1e-9)continue
                val t=((cx-ax)*dy-(cy-ay)*dx)/den;val u=((cx-ax)*by-(cy-ay)*bx)/den
                if(t in 0.0..1.0 && u in 0.0..1.0 && hypot(ax+bx*t-declaration.a*L,ay+by*t-declaration.b*L)<5)found=TrackJunction((empty.arc[i]+t*(empty.arc[i+1]-empty.arc[i]))/empty.lengthM,(empty.arc[j]+u*(empty.arc[j+1]-empty.arc[j]))/empty.lengthM,declaration.c*L)
            }
            found?:error("Declared junction at ${declaration.a},${declaration.b} L has no crossing within 5 m")
        }
        val straights=qualityRuns(empty) { if(empty.curvature[it]<.0025)1 else 0 }.filter { empty.curvature[it.indices.first()]<.0025 }
        val gridRun=straights.filter { run -> junctions.none { j -> listOf(j.first,j.second).any { f -> val d=empty.phase(f*empty.lengthM-run.startM); d<run.lengthM+60 || d>empty.lengthM-60 } } }.maxByOrNull { it.lengthM }?:error("No launch straight clear of junctions")
        require(gridRun.lengthM>=6*L) { "Launch straight must fit six cars: ${gridRun.lengthM} m" }
        val start=empty.phase(gridRun.startM+gridRun.lengthM-1.5*L)/empty.lengthM
        val spots=mutableListOf<TrackSpot>()
        for(f in listOf(0.0,.2,.4,.6,.8))spots+=TrackSpot("checkpoint",f,0.0)
        for(row in 0..2)for(side in listOf(-1,1))spots+=TrackSpot("grid",-(8+row*13.0)/empty.lengthM,side*3.3)
        if(decorate)for((kind,f,lane) in listOf(Triple("ammo",.22,-3.0),Triple("repair",.52,3.0),Triple("cash",.74,-3.0),Triple("repair",.88,3.0)))spots+=TrackSpot(kind,f,lane)
        var course=Course(base.id,base.name,base.lesson,start,base.theme,closed,spots,emptyList(),emptyList(),junctions)
        if(decorate) {
            val landmark=TrackContent.themes.single { it.id==base.theme }.props.last()
            val right=qualityRuns(course) { i -> val before=(i+course.count-1)%course.count;val cross=(course.x[i]-course.x[before])*(course.y[i+1]-course.y[i])-(course.y[i]-course.y[before])*(course.x[i+1]-course.x[i]);if(cross<0 && course.curvature[i]>.012)1 else 0 }
                .filter { it.lengthM>=40 && course.curvature[it.indices.first()]>.012 }
            for(run in right) {
                val from=course.phase(run.startM+3)/course.lengthM;val to=from+32/course.lengthM
                if(to>=1)continue
                val feature=TrackFeature("shortcut",from,to,-3.0,3.0,Surfaces.all.single { it.id=="Gravel" },landmark,45.0)
                val candidate=Course(base.id,base.name,base.lesson,start,base.theme,closed,spots,listOf(feature),emptyList(),junctions)
                if(TrackContent.errors(candidate).isEmpty() && (qualityGeometry(candidate).values["badRiskLines"]?:1.0)==0.0) { course=candidate;break }
            }
            val placements=mutableListOf<ObstaclePlacement>()
            for(run in straights.sortedByDescending { it.lengthM }) {
                if(placements.size>=3)break
                val s=course.phase(run.startM+run.lengthM*.45);val fromStart=course.phase(s-start*course.lengthM)
                if(fromStart<50 || fromStart>course.lengthM-70 || course.widthAt(s)*2/W<4.7)continue
                val definition=if(placements.isEmpty())"tyres-scattered" else "dead-tree"
                val placement=ObstaclePlacement(definition,s/course.lengthM,course.widthAt(s)+(if(placements.isEmpty())-.3 else .7),0.0,17011L+placements.size)
                val candidate=Course(base.id,base.name,base.lesson,start,base.theme,closed,spots,course.features,placements+placement,junctions)
                if(ObstacleContent.errors(candidate).isEmpty())placements+=placement
            }
            course=Course(base.id,base.name,base.lesson,start,base.theme,closed,spots,course.features,placements,junctions)
        }
        return ComposedTrack(course,ops,recipe,spans)
    }

    fun example(): String = csv(listOf(0.0 to 0.0,30.0 to 0.0,30.0 to 8.2,12.0 to 8.2,12.0 to 16.4,30.0 to 16.4,30.0 to 26.0,20.0 to 26.0,20.0 to 35.0,0.0 to 35.0,0.0 to 23.0,8.2 to 23.0,8.2 to 12.0,0.0 to 12.0).mapIndexed { i,p ->
        DesignPrimitive("anchor",p.first,p.second,3.6,if(i%4<2)5.0 else 3.8) })
}
