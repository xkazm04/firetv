package dev.deathride.core

import kotlin.math.*
import dev.deathride.core.StrictTrig.cos
import dev.deathride.core.StrictTrig.sin
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
    val maxSpeedMps: Double = Physics.base.getValue("maxSpeedMps"),
    val accelerationMps2: Double = Physics.base.getValue("accelerationMps2"),
    val brakeMps2: Double = Physics.base.getValue("brakeMps2"),
    val rollingDragPerSecond: Double = Physics.base.getValue("rollingDragPerSecond"),
    val lateralGripPerSecond: Double = Physics.base.getValue("lateralGripPerSecond"),
    val maxLateralAccelerationMps2: Double = Physics.base.getValue("maxLateralAccelerationMps2"),
    val brakeGripLoss: Double = Physics.base.getValue("brakeGripLoss"),
    val yawResponseSeconds: Double = Physics.base.getValue("yawResponseSeconds"),
    val yawStabilityPerSecond: Double = Physics.base.getValue("yawStabilityPerSecond"),
    val steeringRateRadPerSecond: Double = Physics.base.getValue("steeringRateRadPerSecond"),
    val launchSteeringMps: Double = Physics.base.getValue("launchSteeringMps"),
    val massKg: Double = Physics.base.getValue("massKg"),
    val restitution: Double = Physics.base.getValue("restitution"),
    val circleRadiusM: Double = Physics.base.getValue("circleRadiusM"),
    val circleOffsetM: Double = Physics.base.getValue("circleOffsetM")
)
class InputFrame(var steer: Double = 0.0, var throttle: Double = 0.0, var brake: Double = 0.0, var handbrake: Double = 0.0) {
    var fire=0.0;var mine=0.0;var weapon=0
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
    private var handbrake=0.0
    private var fire=0.0;private var mine=0.0;private var weapon=0
    var dropped = 0L; private set
    var outOfOrder = 0L; private set
    var staleConsumed = 0L; private set
    var accepted = 0L; private set
    var ageMs = 0.0; private set
    @Synchronized fun offer(q: Long, generatedMs: Double, nowMs: Double, s: Double, a: Double, b: Double, h: Double=0.0, fire: Double=0.0,mine: Double=0.0,weapon: Int=0): Boolean {
        if (!generatedMs.isFinite() || !s.isFinite() || !a.isFinite() || !b.isFinite() || !h.isFinite() || !fire.isFinite() || !mine.isFinite() || weapon !in 0..1 && weapon!=3) { dropped++; return false }
        if (q <= seq) { outOfOrder++; return false }
        if (seq >= 0 && q > seq + 1) dropped += q - seq - 1
        seq = q
        if (nowMs - generatedMs > Tuning.STALE_MS || generatedMs - nowMs > 100.0) { dropped++; return false }
        stampMs = generatedMs; receivedMs = nowMs
        steer = s.coerceIn(-1.0,1.0); throttle = a.coerceIn(0.0,1.0); brake = b.coerceIn(0.0,1.0); handbrake=h.coerceIn(0.0,1.0); accepted++
        this.fire=fire.coerceIn(0.0,1.0);this.mine=mine.coerceIn(0.0,1.0);this.weapon=weapon
        return true
    }
    @Synchronized fun consume(nowMs: Double, out: InputFrame): Boolean {
        ageMs = if (accepted == 0L) 0.0 else max(0.0, nowMs-stampMs)
        val stale = nowMs - receivedMs > Tuning.STALE_MS || ageMs > Tuning.STALE_MS
        out.set(steer, if (stale) 0.0 else throttle, if (stale) 0.0 else brake)
        out.handbrake=if(stale)0.0 else handbrake
        out.fire=if(stale)0.0 else fire;out.mine=if(stale)0.0 else mine;out.weapon=weapon
        if (stale) staleConsumed++
        return stale
    }
    @Synchronized fun newConnection() { seq = -1; receivedMs = -1e12; throttle = 0.0; brake = 0.0; handbrake=0.0;fire=0.0;mine=0.0 }
}
class TrackPoint { var x = 0.0; var y = 0.0; var heading = 0.0; var curvature = 0.0 }
class Projection { var s = 0.0; var distance = 0.0; var nx = 0.0; var ny = 1.0 }
data class Track(val straightM: Double = 120.0, val radiusM: Double = 40.0, val halfWidthM: Double = 12.0, var surface: Surface=Surfaces.asphalt, val course: Course?=null) {
    var surfaceOverride=false
    fun widthAt(s: Double)=course?.widthAt(s)?:halfWidthM
    /** Edge materials touch the car's lateral contact footprint; authored interior bands use its centre. */
    fun surfaceAt(s: Double, lateral: Double, contactRadiusM: Double=0.0): Surface = when {
        abs(lateral)+contactRadiusM>widthAt(s)-Movement.vergeWidthM -> Surfaces.offtrack
        abs(lateral)+contactRadiusM>widthAt(s)-Movement.vergeWidthM-Movement.kerbWidthM -> Surfaces.kerb
        else -> if(surfaceOverride || course==null)surface else course.surfaceAt(s,lateral)
    }
    val lengthM = course?.lengthM ?: (2 * straightM + 2 * PI * radiusM)
    val startM = course?.let { it.startFraction*it.lengthM } ?: (straightM * 0.5)
    fun sample(distanceM: Double, laneM: Double, out: TrackPoint) {
        if(course!=null) { course.sample(distanceM,laneM,out);return }
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
        if(course!=null) { course.project(x,y,out);return }
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
class LapCounter(private val lengthM: Double, private val startM: Double, private val gates: DoubleArray=doubleArrayOf(0.0,.25,.5,.75)) {
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
            val gate=gates[nextGate]*lengthM
            val crossed=if(nextGate==0) p<previous else previous<gate && p>=gate
            if(crossed) {
                if(nextGate==0 && progressM>lengthM*.5) laps++
                nextGate=(nextGate+1)%gates.size
            }
            progressM+=d
        } else if(d<=0.0 && d > -lengthM*.125) progressM+=d
        previous=p
    }
}
enum class AiMode { DRIVE, OVERTAKE, RECOVER }
enum class FinishKind { NONE, LAPS, ELIMINATION }
class Car(val id: Int, track: Track) {
    var entered=true;var rivalIndex=-1
    var x=0.0; var y=0.0; var vx=0.0; var vy=0.0; var heading=0.0; var yaw=0.0
    var previousX=0.0; var previousY=0.0; var previousHeading=0.0
    val lap=LapCounter(track.lengthM,track.startM,track.course?.checkpoints?:doubleArrayOf(0.0,.25,.5,.75))
    var surface=Surfaces.asphalt
    var loadTransfer=0.0; var drifting=false; var wallImpactMps=0.0
    var spec=CarSpec()
    var carClass: CarClass?=null
    var armorReduction=0.0;var weaponSlots=1;var weaponDamageScale=1.0
    var maxHp=CombatRules["maxHp"];var startingCondition=1.0;var utilityMask=0
    var turboRemaining=0.0;var fuelRemaining=0.0;var engineScale=1.0
    var finishKind=FinishKind.NONE
    var feel=FeelProfiles.spike
    var filteredSteer=0.0; var filteredThrottle=0.0
    var human=false; var finishSeconds=-1.0; var position=id+1; var impact=0.0
    var aiMode=AiMode.DRIVE; var aiDwell=0; var aiBlockedSteps=0; var aiLane=0.0
    var aiReason=0; var aiPerceivedGapM=1000.0
    var aiSkill: AiSkill?=null;var aiStyle: Rival?=null;var aiCombatReason=0;var aiPickupTarget=-1;var aiNoisePhase=0.0
    val aiInput=InputFrame()
    val speedMps get()=sqrt(vx*vx+vy*vy)
}
interface Handling { fun integrate(car: Car, input: InputFrame, spec: CarSpec, dt: Double) }
/** Momentum model: tire force saturates, brake unloads rear grip, yaw has inertia. */
class SlipHandling : Handling {
    override fun integrate(car: Car,input: InputFrame,spec: CarSpec,dt: Double) {
        val speed=car.speedMps
        val profile=car.feel
        val shaped=if(car.human)profile.shape(input.steer) else input.steer
        val rate=if(shaped==0.0)profile.steerReturnPerSecond else profile.steerRisePerSecond
        car.filteredSteer+=(shaped-car.filteredSteer).coerceIn(-rate*dt,rate*dt)
        val requested=if(profile.throttleExponent==1.0 || input.throttle==0.0 || input.throttle==1.0)input.throttle else power(input.throttle,profile.throttleExponent)
        car.filteredThrottle=if(requested<car.filteredThrottle)requested else min(requested,car.filteredThrottle+profile.throttleRisePerSecond*dt)
        val throttle=if(input.brake>0.0)0.0 else car.filteredThrottle
        val brake=(input.brake*profile.brakeScale).coerceIn(0.0,1.0)
        val advanced=car.carClass!=null
        val hb=if(advanced)input.handbrake else 0.0
        if(advanced)car.loadTransfer+=((brake*Movement.brakeTransfer-throttle*Movement.throttleTransfer)-car.loadTransfer)*(1-exp(-dt/Movement.transferResponseSeconds))
        val yawScale=if(advanced)(1-throttle*Movement.throttleUndersteer)*(1+hb*Movement.handbrakeYawGain) else 1.0
        val slip=if(speed>1.0)wrapAngle(atan2(car.vy,car.vx)-car.heading) else 0.0
        val desiredYaw=-car.filteredSteer*yawScale*profile.authority(speed)*spec.steeringRateRadPerSecond*(speed+spec.launchSteeringMps*throttle)/(speed+7.0)+slip*spec.yawStabilityPerSecond*profile.stabilityScale*(1-brake*spec.brakeGripLoss)
        car.yaw+=(desiredYaw-car.yaw)*(1-exp(-dt/(spec.yawResponseSeconds*profile.yawResponseScale)))
        car.heading=wrapAngle(car.heading+car.yaw*dt)
        val cx=cos(car.heading); val cy=sin(car.heading)
        var forward=car.vx*cx+car.vy*cy
        var lateral=-car.vx*cy+car.vy*cx
        val gripScale=(1.0-brake*spec.brakeGripLoss)*(if(advanced)car.surface.gripScale*(1+car.loadTransfer*Movement.transferGripGain)*(1-hb*Movement.handbrakeGripLoss) else 1.0)
        val wanted=lateral*(1-exp(-spec.lateralGripPerSecond*gripScale*dt))
        val forceLimit=spec.maxLateralAccelerationMps2*gripScale*dt
        lateral-=wanted.coerceIn(-forceLimit,forceLimit)
        forward=(forward+(throttle*spec.accelerationMps2*car.engineScale-brake*spec.brakeMps2)*dt).coerceAtLeast(0.0)
        forward*=exp(-(spec.rollingDragPerSecond+(if(advanced)car.surface.dragPerSecond+hb*Movement.handbrakeDragPerSecond else 0.0))*dt)
        car.vx=cx*forward-cy*lateral; car.vy=cy*forward+cx*lateral
        val magnitude=car.speedMps
        if(magnitude>spec.maxSpeedMps) { car.vx*=spec.maxSpeedMps/magnitude; car.vy*=spec.maxSpeedMps/magnitude }
        car.x+=car.vx*dt; car.y+=car.vy*dt
        if(advanced) {
            val slipNow=abs(wrapAngle(atan2(car.vy,car.vx)-car.heading))
            if(car.speedMps<Movement.driftMinSpeedMps || hb==0.0 && slipNow<Movement.driftExitRadians)car.drifting=false
            else if(slipNow>Movement.driftEnterRadians)car.drifting=true
        }
    }
}

fun wrapAngle(value: Double): Double { var a=value; while(a>PI) a-=2*PI; while(a < -PI) a+=2*PI; return a }
/** Reused snapshot storage. Only read methods are exposed to the renderer. */
class Snapshot(private val combat: Combat?=null) {
    private val state=DoubleArray(Tuning.CAR_COUNT*4)
    private val condition=DoubleArray(Tuning.CAR_COUNT*8)
    private val pickupState=DoubleArray((combat?.pickups?.size?:0)*4)
    private val blastState=DoubleArray((combat?.blasts?.size?:0)*5)
    val pickupCount get()=pickupState.size/4
    val blastCount get()=blastState.size/5
    internal fun capture(cars: Array<Car>) {
        for(i in cars.indices) {
            val c=cars[i];val n=i*4;state[n]=c.x;state[n+1]=c.y;state[n+2]=c.heading;state[n+3]=c.speedMps
            val b=i*8;condition[b]=(combat?.health(i)?:c.maxHp)/c.maxHp;condition[b+1]=if(combat?.wrecked(i)==true)1.0 else 0.0
            condition[b+2]=combat?.damageFlashSeconds?.get(i)?:0.0;condition[b+3]=combat?.traceSeconds?.get(i)?:0.0
            condition[b+4]=combat?.traceX?.get(i)?:c.x;condition[b+5]=combat?.traceY?.get(i)?:c.y
            condition[b+6]=if(c.entered)1.0 else 0.0;condition[b+7]=if(c.drifting)1.0 else 0.0
        }
        if(combat!=null) {
            for(i in combat.pickups.indices){val p=combat.pickups[i];val n=i*4;pickupState[n]=p.x;pickupState[n+1]=p.y;pickupState[n+2]=p.cooldownSeconds;pickupState[n+3]=p.type.radiusM}
            for(i in combat.blasts.indices){val p=combat.blasts[i];val n=i*5;blastState[n]=p.x;blastState[n+1]=p.y;blastState[n+2]=p.remainingSeconds;blastState[n+3]=p.radiusM;blastState[n+4]=p.activation.toDouble()}
        }
    }
    fun x(i: Int)=state[i*4]; fun y(i: Int)=state[i*4+1]; fun heading(i: Int)=state[i*4+2]; fun speed(i: Int)=state[i*4+3]
    fun healthFraction(i: Int)=condition[i*8];fun wrecked(i: Int)=condition[i*8+1]>0
    fun flash(i: Int)=condition[i*8+2];fun traceSeconds(i: Int)=condition[i*8+3]
    fun traceX(i: Int)=condition[i*8+4];fun traceY(i: Int)=condition[i*8+5]
    fun entered(i: Int)=condition[i*8+6]>0;fun drifting(i: Int)=condition[i*8+7]>0
    fun pickupX(i: Int)=pickupState[i*4];fun pickupY(i: Int)=pickupState[i*4+1];fun pickupReady(i: Int)=pickupState[i*4+2]<=0
    fun pickupRadius(i: Int)=pickupState[i*4+3];fun pickupId(i: Int)=combat!!.pickups[i].type.id
    fun blastX(i: Int)=blastState[i*5];fun blastY(i: Int)=blastState[i*5+1];fun blastRemaining(i: Int)=blastState[i*5+2]
    fun blastRadius(i: Int)=blastState[i*5+3];fun blastActivation(i: Int)=blastState[i*5+4].toInt()
}
class World(val seed: Int=17, val spec: CarSpec=CarSpec(), val track: Track=Track(), val handling: Handling=SlipHandling(),combatEnabled: Boolean=false) {
    var raceLaps=Tuning.RACE_LAPS; internal set
    val raceLimitSeconds get()=TrackRules["maxRaceSeconds"]*raceLaps/Tuning.RACE_LAPS
    var damageScale=1.0
    val cars=Array(Tuning.CAR_COUNT) { Car(it,track).also { c -> c.spec=spec } }
    val combat=Combat(this,combatEnabled)
    val snapshot=Snapshot(combat); val previousSnapshot=Snapshot(combat)
    private val projection=Projection(); private val point=TrackPoint()
    val ramClosingMps=DoubleArray(Tuning.CAR_COUNT*Tuning.CAR_COUNT)
    val trace=IntArray(Tuning.CAR_COUNT*600)
    var steps=0; private set
    var seconds=0.0; private set
    var finished=0; private set
    val entrantCount get()=cars.count{it.entered}
    val resolved get()=finished+combat.wreckCount
    init { reset() }
    fun reset() {
        steps=0; seconds=0.0; finished=0
        val seeded=if(cars.any{it.aiSkill!=null})java.util.Random(seed.toLong()) else null
        for(c in cars) {
            val grid=track.course?.grid?.get(c.id)
            val rowLength=if(c.carClass==null)7.0 else CarShapes.all.maxOf { it.lengthM }+TrackRules["gridClearanceM"]
            val s=if(grid==null)track.startM-rowLength-(c.id/2)*rowLength else track.startM+grid.fraction*track.lengthM
            track.sample(s, grid?.laneM ?: if(c.id%2==0) -3.2 else 3.2,point)
            c.x=point.x; c.y=point.y; c.heading=point.heading; c.vx=0.0; c.vy=0.0; c.yaw=0.0
            c.loadTransfer=0.0; c.drifting=false; c.wallImpactMps=0.0
            c.filteredSteer=0.0; c.filteredThrottle=0.0
            c.previousX=c.x; c.previousY=c.y; c.previousHeading=c.heading; c.lap.reset(s)
            c.finishSeconds=-1.0;c.finishKind=FinishKind.NONE; c.position=c.id+1; c.impact=0.0; c.aiDwell=0; c.aiBlockedSteps=0; c.aiMode=AiMode.DRIVE
            c.aiLane=((c.id*7+seed)%5-2)*(if(c.carClass==null)1.7 else c.spec.circleRadiusM*2*TrackRules["aiLaneCarWidths"]); c.aiInput.set(0.0,0.0,0.0)
            c.aiNoisePhase=0.0
            if(c.aiSkill!=null && seeded!=null) { c.aiLane+=(seeded.nextDouble()*2-1)*c.aiSkill!!.laneErrorM;c.aiNoisePhase=seeded.nextDouble()*2*PI }
            c.aiInput.fire=0.0;c.aiInput.mine=0.0;c.aiInput.weapon=0;c.aiCombatReason=0;c.aiPickupTarget=-1
            c.turboRemaining=if(c.utilityMask and (1 shl Consumables.TURBO)!=0)Consumables.all[Consumables.TURBO].duration else 0.0
            c.fuelRemaining=if(c.utilityMask and (1 shl Consumables.FUEL)!=0)Consumables.all[Consumables.FUEL].duration else 0.0;c.engineScale=1.0
        }
        combat.reset()
        previousSnapshot.capture(cars); snapshot.capture(cars)
    }
    fun step(inputs: Array<InputFrame>, dt: Double=Tuning.STEP_SECONDS) {
        previousSnapshot.capture(cars)
        steps++; seconds+=dt; ramClosingMps.fill(0.0)
        for(c in cars) {
            if(!c.entered)continue
            c.previousX=c.x; c.previousY=c.y; c.previousHeading=c.heading; c.impact*=.87
            c.wallImpactMps=0.0; track.project(c.x,c.y,projection); c.surface=track.surfaceAt(projection.s,projection.distance,if(c.carClass==null)0.0 else c.spec.circleRadiusM)
            if(combat.wrecked(c.id)) {
                val drag=exp(-CombatRules["wreckDragPerSecond"]*dt);c.vx*=drag;c.vy*=drag;c.yaw*=drag
                c.x+=c.vx*dt;c.y+=c.vy*dt;c.heading=wrapAngle(c.heading+c.yaw*dt)
            } else {
                val input=if(c.human) inputs[c.id] else { driveAi(c); c.aiInput }
                c.engineScale=1.0
                if(input.throttle>Consumables.triggerThrottle && input.brake==0.0) {
                    if(c.fuelRemaining>0){c.engineScale*=Consumables.all[Consumables.FUEL].magnitude;c.fuelRemaining=max(0.0,c.fuelRemaining-dt)}
                    if(c.turboRemaining>0 && c.speedMps>Consumables.turboMinimumSpeedMps) {
                        track.project(c.x,c.y,projection);track.sample(projection.s,0.0,point)
                        if(point.curvature<TrackContent["maximumAccelerationCurvature"]){c.engineScale*=Consumables.all[Consumables.TURBO].magnitude;c.turboRemaining=max(0.0,c.turboRemaining-dt)}
                    }
                }
                handling.integrate(c,input,c.spec,dt)
            }
            contain(c)
            trace[((steps%600)*6)+c.id]=c.aiMode.ordinal*10+c.aiReason
        }
        repeat(3) { for(i in 0 until cars.size) for(j in i+1 until cars.size) collide(cars[i],cars[j]); for(c in cars)if(c.entered)contain(c) }
        combat.step(inputs,dt)
        for(c in cars) {
            if(!c.entered || combat.wrecked(c.id))continue
            track.project(c.x,c.y,projection); c.lap.update(projection.s)
            if(c.lap.laps>=raceLaps && c.finishSeconds<0) { c.finishSeconds=seconds;c.finishKind=FinishKind.LAPS; finished++ }
        }
        if(combat.enabled && combat.wreckCount==entrantCount-1)for(c in cars)if(c.entered && !combat.wrecked(c.id) && c.finishSeconds<0) { c.finishSeconds=seconds;c.finishKind=FinishKind.ELIMINATION;finished++ }
        for(c in cars) {
            if(!c.entered){c.position=0;continue}
            c.position=1
            for(o in cars) if(o.entered && o!==c && ahead(o,c)) c.position++
        }
        snapshot.capture(cars)
    }
    private fun ahead(a: Car,b: Car): Boolean {
        if(a.finishSeconds>=0)return b.finishSeconds<0 || a.finishSeconds<b.finishSeconds || a.finishSeconds==b.finishSeconds && a.id<b.id
        if(b.finishSeconds>=0)return false
        if(combat.wrecked(a.id)!=combat.wrecked(b.id))return !combat.wrecked(a.id)
        if(combat.wrecked(a.id) && combat.wreckSeconds[a.id]!=combat.wreckSeconds[b.id])return combat.wreckSeconds[a.id]>combat.wreckSeconds[b.id]
        return a.lap.progressM>b.lap.progressM || a.lap.progressM==b.lap.progressM && a.id<b.id
    }
    private fun driveAi(c: Car) {
        val skill=c.aiSkill?:AiSkills.legacy[(c.id+seed).mod(AiSkills.legacy.size)]
        c.aiDwell++
        if(c.speedMps<1.2) c.aiBlockedSteps++ else c.aiBlockedSteps=0
        if(steps%skill.reactionSteps!=c.id%skill.reactionSteps) return
        combat.think(c)
        track.project(c.x,c.y,projection)
        val s=projection.s
        var gap=1000.0
        for(o in cars) if(o.entered && o!==c && !combat.wrecked(o.id)) {
            val dx=o.x-c.x; val dy=o.y-c.y
            val along=dx*cos(c.heading)+dy*sin(c.heading)
            if(along>0 && abs(-dx*sin(c.heading)+dy*cos(c.heading))<c.spec.circleRadiusM+o.spec.circleRadiusM+TrackRules["aiLateralClearanceM"]) gap=min(gap,along)
        }
        c.aiPerceivedGapM=gap
        if(c.aiBlockedSteps>150 && c.aiDwell>90) { c.aiMode=AiMode.RECOVER; c.aiDwell=0; c.aiReason=1 }
        else if(gap<(c.spec.circleRadiusM+c.spec.circleOffsetM)*2*TrackRules["aiOvertakeCarLengths"]*(c.aiStyle?.passDistanceScale?:1.0) && c.aiDwell>90 && c.aiMode==AiMode.DRIVE) { c.aiMode=AiMode.OVERTAKE; c.aiDwell=0; c.aiReason=2 }
        else if(c.aiMode!=AiMode.DRIVE && c.aiDwell>180 && c.speedMps>5) { c.aiMode=AiMode.DRIVE; c.aiDwell=0; c.aiReason=3 }
        val passLane=c.spec.circleRadiusM*2*TrackRules["aiPassCarWidths"]
        val intendedLane=if(c.aiMode==AiMode.OVERTAKE) if(c.aiLane<0) passLane else -passLane else c.aiLane+(c.aiStyle?.laneBiasM?:0.0)
        val noseLook=(c.spec.circleOffsetM+c.spec.circleRadiusM)*2*TrackRules["aiLookCarLengths"]
        val look=if(c.aiMode==AiMode.RECOVER) noseLook else noseLook+c.speedMps*skill.lookAheadSeconds
        val lane=combat.avoidMine(c,s,combat.seekRepair(c,intendedLane+(track.course?.laneAt(s+look,c.carClass?.stat("grip")?:0)?:0.0))).coerceIn(-track.widthAt(s+look)*.55,track.widthAt(s+look)*.55)
        track.sample(s+look, lane+sin(steps*.007+c.id+c.aiNoisePhase)*skill.laneErrorM,point)
        val desired=atan2(point.y-c.y,point.x-c.x)
        val slip=if(c.speedMps>2.0) wrapAngle(atan2(c.vy,c.vx)-c.heading) else 0.0
        val error=wrapAngle(desired-c.heading-slip*.35)
        val steer=(-error*2.3+c.yaw*.18).coerceIn(-1.0,1.0)
        val target=if(c.carClass==null) { if(point.curvature>0) 23.0-skill.cornerMarginMps else 29.0 } else min(c.spec.maxSpeedMps*CarCatalog.aiCruiseFraction, if(point.curvature>0) sqrt(c.spec.maxLateralAccelerationMps2*track.surfaceAt(s+look,lane,c.spec.circleRadiusM).gripScale*CarCatalog.aiGripFraction/point.curvature)-skill.cornerMarginMps else c.spec.maxSpeedMps)
        val surfaceLimit=if(point.curvature>0)1.0 else sqrt(c.surface.gripScale).coerceIn(Movement.aiSurfaceMargin,1.0)
        val cornerTarget=target*surfaceLimit*(1.0-min(.55,abs(error)*.4))
        val a=if(c.speedMps<cornerTarget) 1.0 else .12
        val b=if(c.speedMps>cornerTarget+2.0) .45 else 0.0
        c.aiInput.set(steer,a,b)
    }
    fun contain(c: Car) {
        val spec=c.spec
        val radius=spec.circleRadiusM
        for(end in -1..1 step 2) {
            val ox=cos(c.heading)*spec.circleOffsetM*end; val oy=sin(c.heading)*spec.circleOffsetM*end
            track.project(c.x+ox,c.y+oy,projection)
            val limit=track.widthAt(projection.s)-radius
            if(abs(projection.distance)>limit) {
                val sign=if(projection.distance>0) 1.0 else -1.0
                val nx=projection.nx*sign; val ny=projection.ny*sign
                val penetration=abs(projection.distance)-limit
                c.x-=nx*penetration; c.y-=ny*penetration
                val vn=c.vx*nx+c.vy*ny
                if(vn>0) { c.vx-=(1+spec.restitution)*vn*nx; c.vy-=(1+spec.restitution)*vn*ny; c.impact=max(c.impact,vn); c.wallImpactMps=max(c.wallImpactMps,vn); if(c.carClass!=null) { val tangent=c.vx*(-ny)+c.vy*nx; c.vx+=ny*tangent*Movement.wallTangentLoss; c.vy-=nx*tangent*Movement.wallTangentLoss } }
            }
        }
    }
    fun collide(a: Car,b: Car) {
        if(!a.entered || !b.entered)return
        val sa=a.spec; val sb=b.spec; val limit=sa.circleRadiusM+sb.circleRadiusM
        val invA=1/sa.massKg; val invB=1/sb.massKg; val invSum=invA+invB
        // A middle circle closes the side-contact gap on the longer W6 silhouettes.
        for(ea in -1..1) for(eb in -1..1) {
            val ax=cos(a.heading)*sa.circleOffsetM*ea; val ay=sin(a.heading)*sa.circleOffsetM*ea
            val bx=cos(b.heading)*sb.circleOffsetM*eb; val by=sin(b.heading)*sb.circleOffsetM*eb
            val dx=b.x+bx-a.x-ax; val dy=b.y+by-a.y-ay
            val d2=dx*dx+dy*dy
            if(d2<limit*limit) {
                val d=sqrt(d2).coerceAtLeast(.0001)
                val nx=if(d2<.0000001)1.0 else dx/d; val ny=if(d2<.0000001)0.0 else dy/d
                val push=limit-d+.002
                a.x-=nx*push*invA/invSum; a.y-=ny*push*invA/invSum
                b.x+=nx*push*invB/invSum; b.y+=ny*push*invB/invSum
                val relative=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny
                if(relative<0) {
                    val impulse=-(1+min(sa.restitution,sb.restitution))*relative/invSum
                    a.vx-=impulse*invA*nx; a.vy-=impulse*invA*ny
                    b.vx+=impulse*invB*nx; b.vy+=impulse*invB*ny
                    if(a.carClass!=null || b.carClass!=null) {
                        val spin=Movement.collisionSpinScale
                        a.yaw=(a.yaw-(ax*ny-ay*nx)*impulse*invA*spin).coerceIn(-Movement.maxCollisionYawRadPerSecond,Movement.maxCollisionYawRadPerSecond)
                        b.yaw=(b.yaw+(bx*ny-by*nx)*impulse*invB*spin).coerceIn(-Movement.maxCollisionYawRadPerSecond,Movement.maxCollisionYawRadPerSecond)
                    }
                    val pair=min(a.id,b.id)*Tuning.CAR_COUNT+max(a.id,b.id)
                    ramClosingMps[pair]=max(ramClosingMps[pair],max(0.0,-relative-Movement.ramMinClosingMps))
                    a.impact=max(a.impact,-relative); b.impact=max(b.impact,-relative)
                }
            }
        }
    }
    fun stateHash(): Long {
        var hash=1125899906842597L*31+raceLaps
        for(c in cars) { hash=31*hash+c.x.toBits(); hash=31*hash+c.y.toBits(); hash=31*hash+c.vx.toBits(); hash=31*hash+c.vy.toBits(); hash=31*hash+c.heading.toBits(); hash=31*hash+c.lap.laps; hash=31*hash+c.aiMode.ordinal; hash=31*hash+c.yaw.toBits(); hash=31*hash+c.loadTransfer.toBits(); hash=31*hash+c.filteredSteer.toBits(); hash=31*hash+c.filteredThrottle.toBits(); hash=31*hash+if(c.drifting)1 else 0 }
        for(c in cars){hash=31*hash+if(c.entered)1 else 0;hash=31*hash+c.turboRemaining.toBits();hash=31*hash+c.fuelRemaining.toBits();hash=31*hash+c.utilityMask}
        return if(combat.enabled)combat.appendHash(hash) else hash
    }
}
