package dev.deathride.core

import kotlin.math.*
import java.lang.StrictMath.cos
import java.lang.StrictMath.sin
import java.lang.StrictMath.atan2
import java.lang.StrictMath.sqrt
import java.lang.StrictMath.exp

/** SI units. Simulation time is supplied by the caller; no wall clock lives here. */
object Tuning {
    const val STEP_SECONDS = 1.0 / 60.0
    const val STALE_MS = 250.0
    const val CAR_COUNT = 6
    const val RACE_LAPS = 3
}
data class CarSpec(
    val maxSpeedMps: Double = 30.0,
    val accelerationMps2: Double = 12.0,
    val brakeMps2: Double = 22.0,
    val rollingDragPerSecond: Double = 0.22,
    val lateralGripPerSecond: Double = 7.0,
    val maxLateralAccelerationMps2: Double = 22.0,
    val brakeGripLoss: Double = .6,
    val yawResponseSeconds: Double = .12,
    val yawStabilityPerSecond: Double = 1.4,
    val steeringRateRadPerSecond: Double = 1.65,
    val launchSteeringMps: Double = 3.0,
    val massKg: Double = 950.0,
    val restitution: Double = 0.24,
    val circleRadiusM: Double = 1.3,
    val circleOffsetM: Double = 1.05
)
class InputFrame(var steer: Double = 0.0, var throttle: Double = 0.0, var brake: Double = 0.0) {
    fun set(s: Double, a: Double, b: Double) { steer = s.coerceIn(-1.0,1.0); throttle = a.coerceIn(0.0,1.0); brake = b.coerceIn(0.0,1.0) }
}
/** Bounded latest-state mailbox. A late packet cannot restore throttle. */
class InputMailbox {
    private var seq = -1L
    private var stampMs = -1e12
    private var receivedMs = -1e12
    private var steer = 0.0
    private var throttle = 0.0
    private var brake = 0.0
    var dropped = 0L; private set
    var outOfOrder = 0L; private set
    var staleConsumed = 0L; private set
    var accepted = 0L; private set
    var ageMs = 0.0; private set
    @Synchronized fun offer(q: Long, generatedMs: Double, nowMs: Double, s: Double, a: Double, b: Double): Boolean {
        if (!generatedMs.isFinite() || !s.isFinite() || !a.isFinite() || !b.isFinite()) { dropped++; return false }
        if (q <= seq) { outOfOrder++; return false }
        if (seq >= 0 && q > seq + 1) dropped += q - seq - 1
        seq = q
        if (nowMs - generatedMs > Tuning.STALE_MS || generatedMs - nowMs > 100.0) { dropped++; return false }
        stampMs = generatedMs; receivedMs = nowMs
        steer = s.coerceIn(-1.0,1.0); throttle = a.coerceIn(0.0,1.0); brake = b.coerceIn(0.0,1.0); accepted++
        return true
    }
    @Synchronized fun consume(nowMs: Double, out: InputFrame): Boolean {
        ageMs = if (accepted == 0L) 0.0 else max(0.0, nowMs-stampMs)
        val stale = nowMs - receivedMs > Tuning.STALE_MS || ageMs > Tuning.STALE_MS
        out.set(steer, if (stale) 0.0 else throttle, if (stale) 0.0 else brake)
        if (stale) staleConsumed++
        return stale
    }
    @Synchronized fun newConnection() { seq = -1; receivedMs = -1e12; throttle = 0.0; brake = 0.0 }
}
class TrackPoint { var x = 0.0; var y = 0.0; var heading = 0.0; var curvature = 0.0 }
class Projection { var s = 0.0; var distance = 0.0; var nx = 0.0; var ny = 1.0 }
data class Track(val straightM: Double = 120.0, val radiusM: Double = 40.0, val halfWidthM: Double = 12.0) {
    val lengthM = 2 * straightM + 2 * PI * radiusM
    val startM = straightM * 0.5
    fun sample(distanceM: Double, laneM: Double, out: TrackPoint) {
        var s = ((distanceM % lengthM) + lengthM) % lengthM
        val h = straightM * .5
        when {
            s < straightM -> { out.x = -h+s; out.y = radiusM+laneM; out.heading = 0.0; out.curvature=0.0 }
            s < straightM+PI*radiusM -> {
                val a = PI*.5-(s-straightM)/radiusM
                out.x = h+cos(a)*(radiusM+laneM); out.y = sin(a)*(radiusM+laneM); out.heading=a-PI*.5; out.curvature=1/radiusM
            }
            s < 2*straightM+PI*radiusM -> { s-=straightM+PI*radiusM; out.x=h-s; out.y=-radiusM-laneM; out.heading=-PI; out.curvature=0.0 }
            else -> {
                val a = -PI*.5-(s-2*straightM-PI*radiusM)/radiusM
                out.x=-h+cos(a)*(radiusM+laneM); out.y=sin(a)*(radiusM+laneM); out.heading=a-PI*.5; out.curvature=1/radiusM
            }
        }
    }
    fun project(x: Double, y: Double, out: Projection) {
        val h=straightM*.5
        if (x in -h..h) {
            out.nx=0.0; out.ny=if (y>=0) 1.0 else -1.0
            out.distance=abs(y)-radiusM
            out.s=if(y>=0) x+h else straightM+PI*radiusM+h-x
        } else {
            val dx=x-if(x>0) h else -h
            val d=sqrt(dx*dx+y*y).coerceAtLeast(.00001)
            out.nx=dx/d; out.ny=y/d; out.distance=d-radiusM
            val a=atan2(y,dx)
            out.s=if(x>0) straightM+(PI*.5-a)*radiusM else {
                val aa=if(a>0) a-2*PI else a
                2*straightM+PI*radiusM+(-PI*.5-aa)*radiusM
            }
        }
    }
}
class LapCounter(private val lengthM: Double, private val startM: Double) {
    var laps=0; private set
    var nextGate=0; private set
    var progressM=0.0; private set
    private var previous=0.0
    fun reset(s: Double) { laps=0; nextGate=0; previous=phase(s); progressM=previous-lengthM }
    private fun phase(s: Double)=((s-startM)%lengthM+lengthM)%lengthM
    fun update(s: Double) {
        val p=phase(s)
        var d=p-previous
        if(d < -lengthM*.5) d+=lengthM
        if(d > lengthM*.5) d-=lengthM
        if(d > 0.0 && d < lengthM*.125) {
            val gate=nextGate*lengthM*.25
            val crossed=if(nextGate==0) p<previous else previous<gate && p>=gate
            if(crossed) {
                if(nextGate==0 && progressM>lengthM*.5) laps++
                nextGate=(nextGate+1)%4
            }
            progressM+=d
        } else if(d<=0.0 && d > -lengthM*.125) progressM+=d
        previous=p
    }
}
enum class AiMode { DRIVE, OVERTAKE, RECOVER }
data class AiSkill(val reactionSteps: Int, val lookAheadSeconds: Double, val cornerMarginMps: Double, val laneErrorM: Double)
val AI_SKILLS = arrayOf(AiSkill(8,.68,4.0,1.0), AiSkill(5,.60,2.0,.5), AiSkill(2,.52,0.0,.1))
class Car(val id: Int, track: Track) {
    var x=0.0; var y=0.0; var vx=0.0; var vy=0.0; var heading=0.0; var yaw=0.0
    var previousX=0.0; var previousY=0.0; var previousHeading=0.0
    val lap=LapCounter(track.lengthM,track.startM)
    var human=false; var finishSeconds=-1.0; var position=id+1; var impact=0.0
    var aiMode=AiMode.DRIVE; var aiDwell=0; var aiBlockedSteps=0; var aiLane=0.0
    var aiReason=0; var aiPerceivedGapM=1000.0
    val aiInput=InputFrame()
    val speedMps get()=sqrt(vx*vx+vy*vy)
}
interface Handling { fun integrate(car: Car, input: InputFrame, spec: CarSpec, dt: Double) }
/** Momentum model: tire force saturates, brake unloads rear grip, yaw has inertia. */
class SlipHandling : Handling {
    override fun integrate(car: Car,input: InputFrame,spec: CarSpec,dt: Double) {
        val speed=car.speedMps
        val slip=if(speed>1.0)wrapAngle(atan2(car.vy,car.vx)-car.heading) else 0.0
        val desiredYaw=-input.steer*spec.steeringRateRadPerSecond*(speed+spec.launchSteeringMps*input.throttle)/(speed+7.0)+slip*spec.yawStabilityPerSecond*(1-input.brake*spec.brakeGripLoss)
        car.yaw+=(desiredYaw-car.yaw)*(1-exp(-dt/spec.yawResponseSeconds))
        car.heading=wrapAngle(car.heading+car.yaw*dt)
        val cx=cos(car.heading); val cy=sin(car.heading)
        var forward=car.vx*cx+car.vy*cy
        var lateral=-car.vx*cy+car.vy*cx
        val gripScale=1.0-input.brake*spec.brakeGripLoss
        val wanted=lateral*(1-exp(-spec.lateralGripPerSecond*gripScale*dt))
        val forceLimit=spec.maxLateralAccelerationMps2*gripScale*dt
        lateral-=wanted.coerceIn(-forceLimit,forceLimit)
        forward=(forward+(input.throttle*spec.accelerationMps2-input.brake*spec.brakeMps2)*dt).coerceAtLeast(0.0)
        forward*=exp(-spec.rollingDragPerSecond*dt)
        car.vx=cx*forward-cy*lateral; car.vy=cy*forward+cx*lateral
        val magnitude=car.speedMps
        if(magnitude>spec.maxSpeedMps) { car.vx*=spec.maxSpeedMps/magnitude; car.vy*=spec.maxSpeedMps/magnitude }
        car.x+=car.vx*dt; car.y+=car.vy*dt
    }
}

fun wrapAngle(value: Double): Double { var a=value; while(a>PI) a-=2*PI; while(a < -PI) a+=2*PI; return a }
/** Reused snapshot storage. Only read methods are exposed to the renderer. */
class Snapshot {
    private val state=DoubleArray(Tuning.CAR_COUNT*4)
    internal fun capture(cars: Array<Car>) { for(i in cars.indices) { val c=cars[i]; val n=i*4; state[n]=c.x; state[n+1]=c.y; state[n+2]=c.heading; state[n+3]=c.speedMps } }
    fun x(i: Int)=state[i*4]; fun y(i: Int)=state[i*4+1]; fun heading(i: Int)=state[i*4+2]; fun speed(i: Int)=state[i*4+3]
}
class World(val seed: Int=17, val spec: CarSpec=CarSpec(), val track: Track=Track(), val handling: Handling=SlipHandling()) {
    val cars=Array(Tuning.CAR_COUNT) { Car(it,track) }
    val snapshot=Snapshot(); val previousSnapshot=Snapshot()
    private val projection=Projection(); private val point=TrackPoint()
    val trace=IntArray(Tuning.CAR_COUNT*600)
    var steps=0; private set
    var seconds=0.0; private set
    var finished=0; private set
    init { reset() }
    fun reset() {
        steps=0; seconds=0.0; finished=0
        for(c in cars) {
            val s=track.startM-6.0-(c.id/2)*7.0
            track.sample(s, if(c.id%2==0) -3.2 else 3.2,point)
            c.x=point.x; c.y=point.y; c.heading=point.heading; c.vx=0.0; c.vy=0.0; c.yaw=0.0
            c.previousX=c.x; c.previousY=c.y; c.previousHeading=c.heading; c.lap.reset(s)
            c.finishSeconds=-1.0; c.position=c.id+1; c.impact=0.0; c.aiDwell=0; c.aiBlockedSteps=0; c.aiMode=AiMode.DRIVE
            c.aiLane=((c.id*7+seed)%5-2)*1.7; c.aiInput.set(0.0,0.0,0.0)
        }
        previousSnapshot.capture(cars); snapshot.capture(cars)
    }
    fun step(inputs: Array<InputFrame>, dt: Double=Tuning.STEP_SECONDS) {
        previousSnapshot.capture(cars)
        steps++; seconds+=dt
        for(c in cars) {
            c.previousX=c.x; c.previousY=c.y; c.previousHeading=c.heading; c.impact*=.87
            val input=if(c.human) inputs[c.id] else { driveAi(c); c.aiInput }
            handling.integrate(c,input,spec,dt)
            contain(c)
            trace[((steps%600)*6)+c.id]=c.aiMode.ordinal*10+c.aiReason
        }
        repeat(3) { for(i in 0 until cars.size) for(j in i+1 until cars.size) collide(cars[i],cars[j]); for(c in cars) contain(c) }
        for(c in cars) {
            track.project(c.x,c.y,projection); c.lap.update(projection.s)
            if(c.lap.laps>=Tuning.RACE_LAPS && c.finishSeconds<0) { c.finishSeconds=seconds; finished++ }
        }
        for(c in cars) {
            c.position=1
            for(o in cars) if(o!==c && ahead(o,c)) c.position++
        }
        snapshot.capture(cars)
    }
    private fun ahead(a: Car,b: Car): Boolean = if(a.finishSeconds>=0) b.finishSeconds<0 || a.finishSeconds<b.finishSeconds || a.finishSeconds==b.finishSeconds && a.id<b.id else b.finishSeconds<0 && (a.lap.progressM>b.lap.progressM || a.lap.progressM==b.lap.progressM && a.id<b.id)
    private fun driveAi(c: Car) {
        val skill=AI_SKILLS[(c.id+seed).mod(3)]
        c.aiDwell++
        if(c.speedMps<1.2) c.aiBlockedSteps++ else c.aiBlockedSteps=0
        if(steps%skill.reactionSteps!=c.id%skill.reactionSteps) return
        track.project(c.x,c.y,projection)
        val s=projection.s
        var gap=1000.0
        for(o in cars) if(o!==c) {
            val dx=o.x-c.x; val dy=o.y-c.y
            val along=dx*cos(c.heading)+dy*sin(c.heading)
            if(along>0 && abs(-dx*sin(c.heading)+dy*cos(c.heading))<3.5) gap=min(gap,along)
        }
        c.aiPerceivedGapM=gap
        if(c.aiBlockedSteps>150 && c.aiDwell>90) { c.aiMode=AiMode.RECOVER; c.aiDwell=0; c.aiReason=1 }
        else if(gap<14 && c.aiDwell>90 && c.aiMode==AiMode.DRIVE) { c.aiMode=AiMode.OVERTAKE; c.aiDwell=0; c.aiReason=2 }
        else if(c.aiMode!=AiMode.DRIVE && c.aiDwell>180 && c.speedMps>5) { c.aiMode=AiMode.DRIVE; c.aiDwell=0; c.aiReason=3 }
        val lane=if(c.aiMode==AiMode.OVERTAKE) if(c.aiLane<0) 5.0 else -5.0 else c.aiLane
        val look=if(c.aiMode==AiMode.RECOVER) 7.0 else 9.0+c.speedMps*skill.lookAheadSeconds
        track.sample(s+look, lane+sin(steps*.007+c.id)*skill.laneErrorM,point)
        val desired=atan2(point.y-c.y,point.x-c.x)
        val slip=if(c.speedMps>2.0) wrapAngle(atan2(c.vy,c.vx)-c.heading) else 0.0
        val error=wrapAngle(desired-c.heading-slip*.35)
        val steer=(-error*2.3+c.yaw*.18).coerceIn(-1.0,1.0)
        val target=if(point.curvature>0) 23.0-skill.cornerMarginMps else 29.0
        val cornerTarget=target*(1.0-min(.55,abs(error)*.4))
        val a=if(c.speedMps<cornerTarget) 1.0 else .12
        val b=if(c.speedMps>cornerTarget+2.0) .45 else 0.0
        c.aiInput.set(steer,a,b)
    }
    fun contain(c: Car) {
        val radius=spec.circleRadiusM
        for(end in -1..1 step 2) {
            val ox=cos(c.heading)*spec.circleOffsetM*end; val oy=sin(c.heading)*spec.circleOffsetM*end
            track.project(c.x+ox,c.y+oy,projection)
            val limit=track.halfWidthM-radius
            if(abs(projection.distance)>limit) {
                val sign=if(projection.distance>0) 1.0 else -1.0
                val nx=projection.nx*sign; val ny=projection.ny*sign
                val penetration=abs(projection.distance)-limit
                c.x-=nx*penetration; c.y-=ny*penetration
                val vn=c.vx*nx+c.vy*ny
                if(vn>0) { c.vx-=(1+spec.restitution)*vn*nx; c.vy-=(1+spec.restitution)*vn*ny; c.impact=max(c.impact,vn) }
            }
        }
    }
    fun collide(a: Car,b: Car) {
        val limit=2*spec.circleRadiusM
        for(ea in -1..1 step 2) for(eb in -1..1 step 2) {
            val dx=b.x+cos(b.heading)*spec.circleOffsetM*eb-a.x-cos(a.heading)*spec.circleOffsetM*ea
            val dy=b.y+sin(b.heading)*spec.circleOffsetM*eb-a.y-sin(a.heading)*spec.circleOffsetM*ea
            val d2=dx*dx+dy*dy
            if(d2<limit*limit) {
                val d=sqrt(d2).coerceAtLeast(.0001)
                val nx=if(d2<.0000001) 1.0 else dx/d; val ny=if(d2<.0000001) 0.0 else dy/d
                val push=(limit-d+.002)*.5
                a.x-=nx*push; a.y-=ny*push; b.x+=nx*push; b.y+=ny*push
                val relative=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny
                if(relative<0) {
                    val impulse=-(1+spec.restitution)*relative/(2/spec.massKg)
                    a.vx-=impulse/spec.massKg*nx; a.vy-=impulse/spec.massKg*ny
                    b.vx+=impulse/spec.massKg*nx; b.vy+=impulse/spec.massKg*ny
                    a.impact=max(a.impact,-relative); b.impact=max(b.impact,-relative)
                }
            }
        }
    }
    fun stateHash(): Long {
        var hash=1125899906842597L
        for(c in cars) { hash=31*hash+c.x.toBits(); hash=31*hash+c.y.toBits(); hash=31*hash+c.vx.toBits(); hash=31*hash+c.vy.toBits(); hash=31*hash+c.heading.toBits(); hash=31*hash+c.lap.laps; hash=31*hash+c.aiMode.ordinal }
        return hash
    }
}
