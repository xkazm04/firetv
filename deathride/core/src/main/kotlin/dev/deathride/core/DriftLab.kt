package dev.deathride.core

import kotlin.math.*

/** Shared deterministic experiment used by the headless report and desktop replay. No wall clock. */
object DriftLabRules {
    private val values=Content.table("drift-lab").associate{it.getValue("key") to it.number("value")}
    operator fun get(key: String)=values.getValue(key)
    val entrySpeeds=doubleArrayOf(get("lowEntryMps"),get("middleEntryMps"),get("highEntryMps"))
}
enum class DriftExercise {
    STEER_STEP, POWER_OVER, HANDBRAKE, EARLY_CATCH, LATE_CATCH, PASSIVE_RELEASE,
    OVERHOLD, LIFT_OFF, BRAKE_CORNER, CHICANE, EQUAL_COAST, EQUAL_CATCH
}

class DriftExperiment(
    val classIndex: Int,
    val exercise: DriftExercise,
    val requestedEntryMps: Double,
    val parameters: DriftParameters=DriftParameters.defaults,
    val profile: FeelProfile=FeelProfiles.default,
    val surface: Surface=Surfaces.asphalt,
    holdSeconds: Double?=null,
    specOverride: CarSpec?=null,
    val legacy: Boolean=false
) {
    val car=Car(0,Track())
    val input=InputFrame()
    private val model=SlipHandling(parameters)
    val releaseSeconds=holdSeconds?:when(exercise) {
        DriftExercise.EARLY_CATCH->DriftLabRules["earlyReleaseSeconds"]
        DriftExercise.LATE_CATCH->DriftLabRules["lateReleaseSeconds"]
        DriftExercise.OVERHOLD->DriftLabRules["overholdSeconds"]
        DriftExercise.EQUAL_COAST,DriftExercise.EQUAL_CATCH->0.0
        else->DriftLabRules["releaseSeconds"]
    }
    val entryMps: Double
    var steps=0;private set
    val seconds get()=steps*Tuning.STEP_SECONDS
    var peakSlipRadians=0.0;private set
    var peakYaw=0.0;private set
    var retainedAtRelease=Double.NaN;private set
    var releaseSlipRadians=Double.NaN;private set
    var recoverySeconds=Double.NaN;private set
    var rotationSeconds=Double.NaN;private set
    var firstSpinSeconds=Double.NaN;private set
    var observedSpinRadians=Double.NaN;private set
    var exitSpeedMps=Double.NaN;private set
    var speedAfterOneSecondMps=Double.NaN;private set
    var distanceM=0.0;private set
    var peakQuality=0.0;private set
    var driftSeconds=0.0;private set
    private var settledSeconds=0.0
    private var recovered=false
    private var previousX=0.0;private var previousY=0.0
    private var entryHeading=0.0
    init {
        CarCatalog.apply(car,classIndex)
        if(specOverride!=null)car.spec=specOverride
        if(legacy)car.spec=car.spec.copy(driftGeometry=null)
        car.human=true;car.feel=profile;car.surface=surface
        entryMps=min(requestedEntryMps,car.spec.maxSpeedMps);car.vx=entryMps
        if(exercise==DriftExercise.EQUAL_COAST || exercise==DriftExercise.EQUAL_CATCH) {
            car.heading=-DriftLabRules["equalSlipRadians"];car.yaw=DriftLabRules["equalYawRadPerSecond"]
            DriftDynamics.updateSignals(car,input,0.0,parameters)
        }
        entryHeading=car.heading
        if(releaseSeconds==0.0){retainedAtRelease=1.0;releaseSlipRadians=abs(car.slipRadians)}
    }
    /** Also exposed to the desktop's input replay; always goes through normal shaping and forces. */
    fun script() {
        val t=seconds;val before=t<releaseSeconds
        input.set(if(before)DriftLabRules["entrySteer"] else 0.0,if(before)DriftLabRules["entryThrottle"] else DriftLabRules["catchThrottle"],0.0)
        input.handbrake=0.0
        when(exercise) {
            DriftExercise.STEER_STEP -> if(!before)input.throttle=0.0
            DriftExercise.POWER_OVER -> {input.steer=DriftLabRules["entrySteer"];input.throttle=1.0}
            DriftExercise.HANDBRAKE,DriftExercise.EARLY_CATCH,DriftExercise.LATE_CATCH,DriftExercise.OVERHOLD,DriftExercise.PASSIVE_RELEASE -> input.handbrake=if(before)1.0 else 0.0
            DriftExercise.LIFT_OFF -> {input.steer=DriftLabRules["entrySteer"];input.throttle=if(before)1.0 else 0.0}
            DriftExercise.BRAKE_CORNER -> {input.steer=DriftLabRules["entrySteer"];input.brake=if(!before && t<releaseSeconds+1).45 else 0.0}
            DriftExercise.CHICANE -> {input.steer=if(before)DriftLabRules["entrySteer"] else if(t<releaseSeconds*2)-DriftLabRules["entrySteer"] else 0.0;input.handbrake=if(t<releaseSeconds*.5)1.0 else 0.0}
            DriftExercise.EQUAL_COAST,DriftExercise.EQUAL_CATCH -> input.throttle=0.0
        }
        val catching=exercise==DriftExercise.HANDBRAKE || exercise==DriftExercise.EARLY_CATCH || exercise==DriftExercise.LATE_CATCH || exercise==DriftExercise.OVERHOLD || exercise==DriftExercise.EQUAL_CATCH
        if(catching && !before && t<releaseSeconds+DriftLabRules["catchDurationSeconds"]) {
            input.steer=(-car.slipRadians*DriftLabRules["catchSlipGain"]+car.yaw*DriftLabRules["catchYawGain"]).coerceIn(-1.0,1.0)
        }
    }
    fun step() {script();integrate()}
    /** The desktop can supply manual input instead of script without changing physics. */
    fun integrate() {
        model.integrate(car,input,car.spec,Tuning.STEP_SECONDS)
        if(legacy)DriftDynamics.updateSignals(car,input,Tuning.STEP_SECONDS,parameters)
        steps++
        peakSlipRadians=max(peakSlipRadians,abs(car.slipRadians));peakYaw=max(peakYaw,abs(car.yaw));peakQuality=max(peakQuality,car.driftQuality)
        if(car.drifting)driftSeconds+=Tuning.STEP_SECONDS
        distanceM+=hypot(car.x-previousX,car.y-previousY);previousX=car.x;previousY=car.y
        if(rotationSeconds.isNaN() && abs(wrapAngle(car.heading-entryHeading))>=DriftLabRules["rotationRadians"])rotationSeconds=seconds
        if(firstSpinSeconds.isNaN() && car.spinEvents>0){firstSpinSeconds=seconds;observedSpinRadians=abs(car.slipRadians)}
        if(retainedAtRelease.isNaN() && seconds>=releaseSeconds){retainedAtRelease=car.speedMps/entryMps;releaseSlipRadians=abs(car.slipRadians)}
        if(seconds>=releaseSeconds && !recovered) {
            if(abs(car.slipRadians)<Movement.driftExitRadians && abs(car.yaw)<parameters["recoveredYawRadPerSecond"] && !car.spunOut)settledSeconds+=Tuning.STEP_SECONDS else settledSeconds=0.0
            if(settledSeconds+1e-9>=DriftLabRules["settleSeconds"]){recoverySeconds=seconds-releaseSeconds;recovered=true}
        }
        if(exitSpeedMps.isNaN() && seconds>=DriftLabRules["exitSampleSeconds"])exitSpeedMps=car.speedMps
        if(speedAfterOneSecondMps.isNaN() && seconds>=1.0)speedAfterOneSecondMps=car.speedMps
    }
    fun run() {repeat((DriftLabRules["durationSeconds"]/Tuning.STEP_SECONDS).toInt()-steps){step()}}
}
