package dev.deathride.core

import kotlin.math.*
import dev.deathride.core.StrictTrig.cos
import dev.deathride.core.StrictTrig.sin
import java.lang.StrictMath.sqrt
import java.lang.StrictMath.exp

enum class ObstacleEffect { NONE, DRAG, SOLID }
data class ObstacleDefinition(val id: String, val art: String, val effect: ObstacleEffect,
    val rx: Double, val ry: Double, val visualWidth: Double, val visualHeight: Double,
    val height: Double, val drag: Double, val shadowX: Double, val shadowY: Double, val shadowAlpha: Double)
data class ObstaclePlacement(val definition: String, val fraction: Double, val lane: Double, val heading: Double, val seed: Long)
data class TrackObstacle(val definition: ObstacleDefinition, val x: Double, val y: Double, val heading: Double) {
    val cx=cos(heading); val cy=sin(heading)
    val radius=max(definition.rx,definition.ry)
    fun contains(x: Double,y: Double,padding: Double=0.0): Boolean {
        val dx=x-this.x;val dy=y-this.y
        val u=(dx*cx+dy*cy)/(definition.rx+padding);val v=(-dx*cy+dy*cx)/(definition.ry+padding)
        return u*u+v*v<=1.0
    }
    /** Exact segment/ellipse quadratic. Padding is used only for mine placement clearance. */
    fun fraction(x: Double,y: Double,ex: Double,ey: Double): Double {
        val dx=x-this.x;val dy=y-this.y;val vx=ex-x;val vy=ey-y
        val u=(dx*cx+dy*cy)/definition.rx;val v=(-dx*cy+dy*cx)/definition.ry
        val a=(vx*cx+vy*cy)/definition.rx;val b=(-vx*cy+vy*cx)/definition.ry
        val cc=u*u+v*v-1; if(cc<=0)return 0.0
        val aa=a*a+b*b;if(aa<1e-15)return 1.0
        val bb=u*a+v*b;val discriminant=bb*bb-aa*cc;if(discriminant<0)return 1.0
        val t=(-bb-sqrt(discriminant))/aa;return if(t in 0.0..1.0)t else 1.0
    }
}
object ObstacleContent {
    val definitions=Content.table("obstacles").associate { r -> r.getValue("id") to ObstacleDefinition(
        r.getValue("id"),r.getValue("art"),ObstacleEffect.valueOf(r.getValue("effect").uppercase()),
        r.number("rx"),r.number("ry"),r.number("visualWidth"),r.number("visualHeight"),r.number("height"),r.number("drag"),
        r.number("shadowX"),r.number("shadowY"),r.number("shadowAlpha")) }
    val placements=Content.table("track-obstacles").groupBy{it.getValue("course")}.mapValues { (_,rows)->rows.map {
        ObstaclePlacement(it.getValue("definition"),it.number("fraction"),it.number("lane"),it.number("heading"),it.number("seed").toLong()) } }
    private val rules=Content.table("obstacle-rules").associate{it.getValue("key") to it.number("value")}
    operator fun get(key: String)=rules.getValue(key)
    fun bake(c: Course, placements: List<ObstaclePlacement>): Array<TrackObstacle> {
        val p=TrackPoint()
        return placements.map { o ->
            val random=java.util.Random(o.seed)
            val s=c.lengthM*o.fraction+(random.nextDouble()*2-1)*get("placementAlongJitterM")
            val lane=o.lane+(random.nextDouble()*2-1)*get("placementLaneJitterM")
            c.sample(s,lane,p)
            TrackObstacle(definitions.getValue(o.definition),p.x,p.y,p.heading+o.heading)
        }.toTypedArray()
    }
    fun errors(c: Course, obstacles: Array<TrackObstacle> = c.obstacles): List<String> = buildList {
        for(o in c.obstaclePlacements)if(o.fraction !in 0.0..<1.0 || !o.lane.isFinite() || !o.heading.isFinite())add("${c.id}: invalid obstacle placement")
        val widest=CarShapes.all.maxOf{it.widthM};val longest=CarShapes.all.maxOf{it.lengthM}
        val clearance=widest*.5+get("lineClearanceM")
        val p=TrackPoint();val q=Projection()
        for(o in obstacles) {
            val d=o.definition
            if(listOf(o.x,o.y,o.heading,d.rx,d.ry,d.visualWidth,d.visualHeight,d.height,d.drag,d.shadowX,d.shadowY,d.shadowAlpha).any{!it.isFinite()} || d.rx<=0 || d.ry<=0 || d.visualWidth<=0 || d.visualHeight<=0 || d.height<0 || d.drag !in 0.01..1.0 || d.shadowAlpha !in 0.0..1.0){add("${c.id}: invalid obstacle definition");continue}
            if(d.effect==ObstacleEffect.NONE)continue
            c.project(o.x,o.y,q)
            if(abs(q.distance)>c.widthAt(q.s)+o.radius)add("${c.id}: obstacle outside road shoulder")
            if(d.effect==ObstacleEffect.SOLID) {
                val along=q.nx*o.cx+q.ny*o.cy;val across=-q.nx*o.cy+q.ny*o.cx
                val support=sqrt(d.rx*d.rx*along*along+d.ry*d.ry*across*across)
                if(c.widthAt(q.s)-abs(q.distance)+support>get("maximumSolidIncursionM"))add("${c.id}: solid obstacle intrudes beyond recovery shoulder")
            }
            if(d.effect==ObstacleEffect.SOLID)for(offset in -8..8)if(c.curvature[c.index(q.s+offset)]>get("maximumSolidCurvature"))add("${c.id}: solid obstacle lacks straight recovery space")
            for(g in c.grid) {
                c.sample((c.startFraction+g.fraction)*c.lengthM,g.laneM,p)
                if(hypot(o.x-p.x,o.y-p.y)<o.radius+longest*.5+get("gridClearanceM"))add("${c.id}: obstacle covers grid")
            }
        }
        // Conservative circular bounds swept along every spline segment, not just control points.
        // Includes half a sample spacing so a thin intersection between samples cannot be missed.
        val spacing=get("lintSpacingM");val count=ceil(c.lengthM/spacing).toInt()
        for(i in 0 until count) {
            val s=c.lengthM*i/count;c.sample(s,0.0,p);val nx=-sin(p.heading);val ny=cos(p.heading)
            // Same physical road-width authority as TrackLinter; the traversable verge counts.
            val half=c.widthAt(s)
            val intervals=ArrayList<Pair<Double,Double>>()
            for(o in obstacles)if(o.definition.effect!=ObstacleEffect.NONE) {
                val dx=o.x-p.x;val dy=o.y-p.y
                val along=dx*cos(p.heading)+dy*sin(p.heading);val r=o.radius+spacing*.5
                if(abs(along)>r)continue
                val lateral=dx*nx+dy*ny;val reach=sqrt(max(0.0,r*r-along*along))
                val lo=lateral-reach;val hi=lateral+reach
                if(hi>=-half && lo<=half)intervals.add(max(-half,lo) to min(half,hi))
                val normal=c.laneAt(s);val shortcut=c.laneAt(s,10)
                if(lo<normal+clearance && hi>normal-clearance || lo<shortcut+clearance && hi>shortcut-clearance)add("${c.id}: obstacle blocks racing line")
            }
            intervals.sortBy{it.first};var end=-half;var free=0.0
            for((lo,hi) in intervals){free=max(free,lo-end);end=max(end,hi)};free=max(free,half-end)
            if(free<widest*TrackRules["minWidthCarWidths"])add("${c.id}: obstacles reduce usable width")
        }
    }.distinct()
}

/** Shared inverse-mass contact equation; an anchored obstacle has inverse mass zero. */
internal object ContactImpulse {
    fun magnitude(relative: Double,restitution: Double,inverseA: Double,inverseB: Double)=-(1+restitution)*relative/(inverseA+inverseB)
}

/** Immutable course geometry and reusable scratch only: all step methods allocate nothing. */
class Obstacles(private val world: World) {
    val all=world.track.course?.obstacles?:emptyArray()
    var enabled=true
    val speedLimit=DoubleArray(Tuning.CAR_COUNT){Double.POSITIVE_INFINITY}
    var solidContacts=0L;private set
    var dragTicks=0L;private set
    var avoidanceDecisions=0L;private set
    fun reset(){solidContacts=0;dragTicks=0;avoidanceDecisions=0;speedLimit.fill(Double.POSITIVE_INFINITY)}
    private val projection=Projection()
    private var normalX=0.0;private var normalY=0.0;private var penetration=0.0
    fun solidFraction(x: Double,y: Double,ex: Double,ey: Double): Double {
        if(!enabled)return 1.0
        var fraction=1.0
        for(o in all)if(o.definition.effect==ObstacleEffect.SOLID)fraction=min(fraction,o.fraction(x,y,ex,ey))
        return fraction
    }
    fun solidAt(x: Double,y: Double,padding: Double=0.0): Boolean {
        if(enabled)for(o in all)if(o.definition.effect==ObstacleEffect.SOLID && o.contains(x,y,padding))return true
        return false
    }
    fun drag(c: Car,dt: Double) {
        if(!enabled)return
        var multiplier=1.0
        for(o in all)if(o.definition.effect==ObstacleEffect.DRAG)for(end in -1..1) {
            if(contact(o,c.x+c.cosHeading*c.spec.circleOffsetM*end,c.y+c.sinHeading*c.spec.circleOffsetM*end,c.spec.circleRadiusM))multiplier=min(multiplier,o.definition.drag)
        }
        if(multiplier<1){dragTicks++;val factor=exp(kotlin.math.ln(multiplier)*dt);c.vx*=factor;c.vy*=factor}
    }
    private fun contact(o: TrackObstacle,x: Double,y: Double,radius: Double): Boolean {
        val dx=x-o.x;val dy=y-o.y
        if(dx*dx+dy*dy>(o.radius+radius)*(o.radius+radius))return false
        val u=dx*o.cx+dy*o.cy;val v=-dx*o.cy+dy*o.cx
        val a=o.definition.rx;val b=o.definition.ry;val q=u*u/(a*a)+v*v/(b*b)
        var bx: Double;var by: Double
        if(q<=1.0) {
            // Inside: a radial exit is conservative and deterministic, including the exact centre.
            val scale=sqrt(q)
            bx=if(scale<1e-9)a else u/scale;by=if(scale<1e-9)0.0 else v/scale
            val distance=hypot(bx-u,by-v)
            if(distance<1e-9) {
                val gx=u/(a*a);val gy=v/(b*b);val length=hypot(gx,gy)
                normalX=gx/length;normalY=gy/length
            } else { normalX=(bx-u)/distance;normalY=(by-v)/distance }
            penetration=distance+radius+.002
        } else {
            // Closest point on an ellipse, monotonic Lagrange multiplier outside its boundary.
            var low=0.0;var high=max(a,b)*hypot(u,v)
            repeat(28){val t=(low+high)*.5;val ex=a*u/(t+a*a);val ey=b*v/(t+b*b);if(ex*ex+ey*ey>1)low=t else high=t}
            bx=a*a*u/(high+a*a);by=b*b*v/(high+b*b)
            val distance=hypot(u-bx,v-by);if(distance>=radius)return false
            normalX=(u-bx)/distance;normalY=(v-by)/distance;penetration=radius-distance+.002
        }
        val nx=normalX*o.cx-normalY*o.cy;normalY=normalX*o.cy+normalY*o.cx;normalX=nx
        return true
    }
    fun collide(c: Car) {
        if(!enabled || !c.entered)return
        for(o in all)if(o.definition.effect==ObstacleEffect.SOLID)for(end in -1..1) {
            val ox=c.cosHeading*c.spec.circleOffsetM*end;val oy=c.sinHeading*c.spec.circleOffsetM*end
            if(!contact(o,c.x+ox,c.y+oy,c.spec.circleRadiusM))continue
            solidContacts++
            val nx=normalX;val ny=normalY;c.x+=nx*penetration;c.y+=ny*penetration
            val relative=c.vx*nx+c.vy*ny
            if(relative<0) {
                val inverse=1/c.spec.massKg;val impulse=ContactImpulse.magnitude(relative,c.spec.restitution,inverse,0.0)
                c.vx+=impulse*inverse*nx;c.vy+=impulse*inverse*ny
                val tangent=-c.vx*ny+c.vy*nx
                c.vx+=ny*tangent*Movement.wallTangentLoss;c.vy-=nx*tangent*Movement.wallTangentLoss
                c.yaw=(c.yaw+(ox*ny-oy*nx)*impulse*inverse*Movement.collisionSpinScale).coerceIn(-Movement.maxCollisionYawRadPerSecond,Movement.maxCollisionYawRadPerSecond)
                c.impact=max(c.impact,-relative);c.wallImpactMps=max(c.wallImpactMps,-relative)
            }
        }
    }
    fun avoid(c: Car,s: Double,lane: Double): Double {
        speedLimit[c.id]=Double.POSITIVE_INFINITY
        if(!enabled)return lane
        var result=lane;var nearest=ObstacleContent["perceptionM"]
        for(o in all)if(o.definition.effect!=ObstacleEffect.NONE) {
            val dx=o.x-c.x;val dy=o.y-c.y;val along=dx*c.cosHeading+dy*c.sinHeading
            if(along<=0 || along>nearest || dx*dx+dy*dy>nearest*nearest)continue
            // Do not let the target obstacle occlude its own visibility; road visibility still applies.
            if(world.combat.roadFraction(c.x,c.y,o.x,o.y,c.spec.circleRadiusM,false)<1.0)continue
            if(solidFraction(c.x,c.y,o.x,o.y)<o.fraction(c.x,c.y,o.x,o.y)-1e-6)continue
            val side=abs(-dx*c.sinHeading+dy*c.cosHeading)
            if(o.definition.effect==ObstacleEffect.SOLID && side<o.radius+c.spec.circleRadiusM+ObstacleContent["avoidClearanceM"]) {
                val reaction=(c.aiSkill?.reactionSteps?:18)*Tuning.STEP_SECONDS
                val room=max(0.0,along-o.radius-c.spec.circleOffsetM-c.spec.circleRadiusM-c.speedMps*reaction-ObstacleContent["avoidClearanceM"])
                speedLimit[c.id]=min(speedLimit[c.id],max(ObstacleContent["recoveryCrawlMps"],sqrt(2*c.spec.brakeMps2*room)))
            }
            world.track.project(o.x,o.y,projection)
            val reach=o.radius+c.spec.circleRadiusM+ObstacleContent["avoidClearanceM"]
            if(abs(result-projection.distance)<reach) {
                result=if(projection.distance>=0)projection.distance-reach else projection.distance+reach
                nearest=along
            }
        }
        if(result!=lane || speedLimit[c.id].isFinite())avoidanceDecisions++
        return result.coerceIn(-world.track.widthAt(s)*.55,world.track.widthAt(s)*.55)
    }
}
