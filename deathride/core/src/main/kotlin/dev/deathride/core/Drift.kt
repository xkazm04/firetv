package dev.deathride.core

import java.lang.StrictMath.atan2
import java.lang.StrictMath.exp
import java.lang.StrictMath.sqrt
import dev.deathride.core.StrictTrig.cos
import dev.deathride.core.StrictTrig.sin
import kotlin.math.*

private object DriftKey {
    val aiCountersteerGain=DriftParameters.indices.getValue("aiCountersteerGain")
    val aiSlipThrottleLimit=DriftParameters.indices.getValue("aiSlipThrottleLimit")
    val assistFadeStartRadians=DriftParameters.indices.getValue("assistFadeStartRadians")
    val brakeFrontFraction=DriftParameters.indices.getValue("brakeFrontFraction")
    val coastDecelerationMps2=DriftParameters.indices.getValue("coastDecelerationMps2")
    val countersteerFullSpeedMps=DriftParameters.indices.getValue("countersteerFullSpeedMps")
    val countersteerGain=DriftParameters.indices.getValue("countersteerGain")
    val driveFrontFraction=DriftParameters.indices.getValue("driveFrontFraction")
    val falloffRadians=DriftParameters.indices.getValue("falloffRadians")
    val gravityMps2=DriftParameters.indices.getValue("gravityMps2")
    val handbrakeDecelerationMps2=DriftParameters.indices.getValue("handbrakeDecelerationMps2")
    val handbrakePhysicalBlend=DriftParameters.indices.getValue("handbrakePhysicalBlend")
    val handbrakeRearGrip=DriftParameters.indices.getValue("handbrakeRearGrip")
    val humanSteerGain=DriftParameters.indices.getValue("humanSteerGain")
    val lateralTransferLoss=DriftParameters.indices.getValue("lateralTransferLoss")
    val loadSensitivity=DriftParameters.indices.getValue("loadSensitivity")
    val lowSpeedMps=DriftParameters.indices.getValue("lowSpeedMps")
    val maxTransferFraction=DriftParameters.indices.getValue("maxTransferFraction")
    val minimumAxleLoad=DriftParameters.indices.getValue("minimumAxleLoad")
    val peakSlipRadians=DriftParameters.indices.getValue("peakSlipRadians")
    val physicalBlendEndRadians=DriftParameters.indices.getValue("physicalBlendEndRadians")
    val physicalBlendStartRadians=DriftParameters.indices.getValue("physicalBlendStartRadians")
    val qualityFullHoldSeconds=DriftParameters.indices.getValue("qualityFullHoldSeconds")
    val qualitySmoothSeconds=DriftParameters.indices.getValue("qualitySmoothSeconds")
    val qualitySteerRatePerSecond=DriftParameters.indices.getValue("qualitySteerRatePerSecond")
    val recoveredYawRadPerSecond=DriftParameters.indices.getValue("recoveredYawRadPerSecond")
    val referenceMassKg=DriftParameters.indices.getValue("referenceMassKg")
    val referenceWheelbaseM=DriftParameters.indices.getValue("referenceWheelbaseM")
    val referenceWidthM=DriftParameters.indices.getValue("referenceWidthM")
    val referenceYawLengthM=DriftParameters.indices.getValue("referenceYawLengthM")
    val slideDragScale=DriftParameters.indices.getValue("slideDragScale")
    val slidingGripFraction=DriftParameters.indices.getValue("slidingGripFraction")
    val spinMinSpeedMps=DriftParameters.indices.getValue("spinMinSpeedMps")
    val spinSettleSeconds=DriftParameters.indices.getValue("spinSettleSeconds")
    val spinSlipRadians=DriftParameters.indices.getValue("spinSlipRadians")
    val steeringSpeedOffsetMps=DriftParameters.indices.getValue("steeringSpeedOffsetMps")
    val yawTorqueScale=DriftParameters.indices.getValue("yawTorqueScale")
}

/** CSV is the sole parameter authority. Copies belong to one calibration session, never global state. */
class DriftParameters private constructor(private val values: DoubleArray) {
    constructor() : this(DoubleArray(rows.size) { rows[it].number("value") })
    operator fun get(key: String): Double = values[indices.getValue(key)]
    // Hot-path accessors: the key is resolved once, so the per-step solver pays an array read instead of a String hash lookup.
    val aiCountersteerGain: Double get()=values[DriftKey.aiCountersteerGain]
    val aiSlipThrottleLimit: Double get()=values[DriftKey.aiSlipThrottleLimit]
    val assistFadeStartRadians: Double get()=values[DriftKey.assistFadeStartRadians]
    val brakeFrontFraction: Double get()=values[DriftKey.brakeFrontFraction]
    val coastDecelerationMps2: Double get()=values[DriftKey.coastDecelerationMps2]
    val countersteerFullSpeedMps: Double get()=values[DriftKey.countersteerFullSpeedMps]
    val countersteerGain: Double get()=values[DriftKey.countersteerGain]
    val driveFrontFraction: Double get()=values[DriftKey.driveFrontFraction]
    val falloffRadians: Double get()=values[DriftKey.falloffRadians]
    val gravityMps2: Double get()=values[DriftKey.gravityMps2]
    val handbrakeDecelerationMps2: Double get()=values[DriftKey.handbrakeDecelerationMps2]
    val handbrakePhysicalBlend: Double get()=values[DriftKey.handbrakePhysicalBlend]
    val handbrakeRearGrip: Double get()=values[DriftKey.handbrakeRearGrip]
    val humanSteerGain: Double get()=values[DriftKey.humanSteerGain]
    val lateralTransferLoss: Double get()=values[DriftKey.lateralTransferLoss]
    val loadSensitivity: Double get()=values[DriftKey.loadSensitivity]
    val lowSpeedMps: Double get()=values[DriftKey.lowSpeedMps]
    val maxTransferFraction: Double get()=values[DriftKey.maxTransferFraction]
    val minimumAxleLoad: Double get()=values[DriftKey.minimumAxleLoad]
    val peakSlipRadians: Double get()=values[DriftKey.peakSlipRadians]
    val physicalBlendEndRadians: Double get()=values[DriftKey.physicalBlendEndRadians]
    val physicalBlendStartRadians: Double get()=values[DriftKey.physicalBlendStartRadians]
    val qualityFullHoldSeconds: Double get()=values[DriftKey.qualityFullHoldSeconds]
    val qualitySmoothSeconds: Double get()=values[DriftKey.qualitySmoothSeconds]
    val qualitySteerRatePerSecond: Double get()=values[DriftKey.qualitySteerRatePerSecond]
    val recoveredYawRadPerSecond: Double get()=values[DriftKey.recoveredYawRadPerSecond]
    val referenceMassKg: Double get()=values[DriftKey.referenceMassKg]
    val referenceWheelbaseM: Double get()=values[DriftKey.referenceWheelbaseM]
    val referenceWidthM: Double get()=values[DriftKey.referenceWidthM]
    val referenceYawLengthM: Double get()=values[DriftKey.referenceYawLengthM]
    val slideDragScale: Double get()=values[DriftKey.slideDragScale]
    val slidingGripFraction: Double get()=values[DriftKey.slidingGripFraction]
    val spinMinSpeedMps: Double get()=values[DriftKey.spinMinSpeedMps]
    val spinSettleSeconds: Double get()=values[DriftKey.spinSettleSeconds]
    val spinSlipRadians: Double get()=values[DriftKey.spinSlipRadians]
    val steeringSpeedOffsetMps: Double get()=values[DriftKey.steeringSpeedOffsetMps]
    val yawTorqueScale: Double get()=values[DriftKey.yawTorqueScale]
    fun set(index: Int, value: Double) {
        require(value.isFinite() && value in rows[index].number("min")..rows[index].number("max"))
        val old=values[index];values[index]=value
        if(this["physicalBlendStartRadians"]>=this["physicalBlendEndRadians"] || this["assistFadeStartRadians"]>=this["spinSlipRadians"]) {
            values[index]=old;throw IllegalArgumentException("Blend/fade start must be below its end")
        }
    }
    fun value(index: Int)=values[index]
    fun copy()=DriftParameters(values.copyOf())
    /** CSV import is atomic and validates relationships after all values are present. */
    fun setAll(overrides: Map<String,Double>) {
        val candidate=values.copyOf()
        for((key,value) in overrides) {
            val i=indices.getValue(key)
            require(value.isFinite() && value in rows[i].number("min")..rows[i].number("max"))
            candidate[i]=value
        }
        require(candidate[indices.getValue("physicalBlendStartRadians")]<candidate[indices.getValue("physicalBlendEndRadians")])
        require(candidate[indices.getValue("assistFadeStartRadians")]<candidate[indices.getValue("spinSlipRadians")])
        candidate.copyInto(values)
    }
    companion object {
        val rows=Content.table("drift")
        val indices=rows.mapIndexed { index,row -> row.getValue("key") to index }.toMap()
        val defaults=DriftParameters()
        init {
            require(indices.size==rows.size)
            for(row in rows)require(row.number("value") in row.number("min")..row.number("max"))
        }
    }
}

data class DriftGeometry(val wheelbaseM: Double,val trackM: Double,val cgHeightM: Double,val frontLoadFraction: Double,val inertiaScale: Double) {
    val frontArmM get()=wheelbaseM*(1-frontLoadFraction)
    val rearArmM get()=wheelbaseM*frontLoadFraction
    companion object {
        val fields=Content.table("drift-geometry-fields")
        private val rows=Content.table("drift-geometry").associateBy { it.getValue("id") }
        fun forClass(id: String)=fromRow(rows.getValue(id))
        fun fromRow(r: Map<String,String>): DriftGeometry {
            val shape=CarShapes.forId(r.getValue("id"))
            for(field in fields)require(r.number(field.getValue("key")) in field.number("min")..field.number("max")) { "Invalid geometry ${field.getValue("key")}" }
            return DriftGeometry(shape.lengthM*r.number("wheelbaseFraction"),shape.widthM*r.number("trackFraction"),r.number("cgHeightM"),r.number("frontLoadFraction"),r.number("inertiaScale"))
        }
    }
}

/** Two-axle arcade model; no drift flag selects physics. State and scratch scalars live on Car. */
object DriftDynamics {
    fun curve(slip: Double,p: DriftParameters): Double {
        val x=abs(slip)/p.peakSlipRadians
        val magnitude=if(x<=1) x*(2-x) else p.slidingGripFraction+(1-p.slidingGripFraction)/(1+(abs(slip)-p.peakSlipRadians)/p.falloffRadians)
        return sign(slip)*magnitude
    }
    fun gripScale(spec: CarSpec,p: DriftParameters): Double = power(p.referenceMassKg*spec.widthM/(p.referenceWidthM*spec.massKg),p.loadSensitivity)
    fun lateralLimit(spec: CarSpec,surface: Surface,p: DriftParameters=DriftParameters.defaults)=spec.maxLateralAccelerationMps2*surface.gripScale*gripScale(spec,p)
    fun steeringGeometryScale(spec: CarSpec,p: DriftParameters)=spec.driftGeometry?.let{p.referenceWheelbaseM/it.wheelbaseM}?:1.0
    private fun blend(value: Double,start: Double,end: Double): Double {
        val t=((value-start)/(end-start).coerceAtLeast(1e-6)).coerceIn(0.0,1.0)
        return t*t*(3-2*t)
    }
    fun integrate(c: Car,input: InputFrame,spec: CarSpec,throttle: Double,brake: Double,dt: Double,p: DriftParameters) {
        val g=spec.driftGeometry ?: return
        val speed=c.speedMps
        val cx=c.cosHeading;val cy=c.sinHeading
        val forward=c.vx*cx+c.vy*cy;val lateral=-c.vx*cy+c.vy*cx
        val beta=if(speed>p.lowSpeedMps)wrapAngle(atan2(c.vy,c.vx)-c.heading) else 0.0
        val hb=input.handbrake
        val coast=if(throttle==0.0)p.coastDecelerationMps2 else 0.0
        val drive=throttle*spec.accelerationMps2*c.engineScale
        val transferTarget=(-c.longitudinalAcceleration*g.cgHeightM/(p.gravityMps2*g.wheelbaseM)).coerceIn(-p.maxTransferFraction,p.maxTransferFraction)
        c.loadTransfer+=(transferTarget-c.loadTransfer)*(1-exp(-dt/Movement.transferResponseSeconds))
        val frontShare=(g.frontLoadFraction+c.loadTransfer).coerceIn(p.minimumAxleLoad,1-p.minimumAxleLoad)
        val sideTransfer=(abs(c.lateralAcceleration)*g.cgHeightM/(p.gravityMps2*g.trackM)).coerceIn(0.0,.5)
        val capacity=spec.massKg*lateralLimit(spec,c.surface,p)*c.abilityGripScale*(1-sideTransfer*p.lateralTransferLoss)
        val capF=capacity*frontShare;val capR=capacity*(1-frontShare)
        val speedFactor=(speed+spec.launchSteeringMps*throttle)/(speed+p.steeringSpeedOffsetMps)
        val counter=c.filteredSteer*beta<0
        val assist=1-blend(abs(beta),p.assistFadeStartRadians,p.spinSlipRadians)
        val counterGain=if(counter)p.countersteerGain*min(1.0,speed/p.countersteerFullSpeedMps)*min(1.0,abs(beta)/p.assistFadeStartRadians)*assist else 0.0
        val steerYaw=-c.filteredSteer*c.feel.authority(speed)*(if(c.human && !c.labCar)p.humanSteerGain else 1.0)*spec.steeringRateRadPerSecond*c.abilitySteerScale*steeringGeometryScale(spec,p)*speedFactor*(1+counterGain)*(1-throttle*Movement.throttleUndersteer)
        val steerAngle=atan2(steerYaw*g.wheelbaseM,max(speed,p.lowSpeedMps))
        val wheelCos=cos(steerAngle);val wheelSin=sin(steerAngle)
        val vf=(lateral+g.frontArmM*c.yaw)*wheelCos-forward*wheelSin
        val vr=lateral-g.rearArmM*c.yaw
        c.frontSlipRadians=atan2(vf,max(abs(forward*wheelCos+(lateral+g.frontArmM*c.yaw)*wheelSin),p.lowSpeedMps))
        c.rearSlipRadians=atan2(lateral-g.rearArmM*c.yaw,max(abs(forward),p.lowSpeedMps))
        val brakeForce=spec.massKg*(brake*spec.brakeMps2+coast)*sign(forward)
        var fxF=spec.massKg*drive*p.driveFrontFraction-brakeForce*p.brakeFrontFraction
        var fxR=spec.massKg*drive*(1-p.driveFrontFraction)-brakeForce*(1-p.brakeFrontFraction)-spec.massKg*hb*p.handbrakeDecelerationMps2*sign(forward)
        // Reserve no fictitious lateral grip: longitudinal force consumes the same circle.
        fxF=fxF.coerceIn(-capF,capF);fxR=fxR.coerceIn(-capR,capR)
        val remainingF=sqrt(max(0.0,capF*capF-fxF*fxF))
        val remainingR=sqrt(max(0.0,capR*capR-fxR*fxR))
        var fyF=-remainingF*curve(c.frontSlipRadians,p)
        var fyR=-remainingR*curve(c.rearSlipRadians,p)*(1-hb*(1-p.handbrakeRearGrip))
        // Low-speed regularization: never remove more contact lateral velocity than exists in one tick.
        val effectiveF=1/(1/spec.massKg+g.frontArmM*g.frontArmM/spec.yawInertiaKgM2)
        val effectiveR=1/(1/spec.massKg+g.rearArmM*g.rearArmM/spec.yawInertiaKgM2)
        fyF=fyF.coerceIn(-abs(vf)*effectiveF/dt,abs(vf)*effectiveF/dt)
        fyR=fyR.coerceIn(-abs(vr)*effectiveR/dt,abs(vr)*effectiveR/dt)
        c.frontForceX=fxF;c.frontForceY=fyF;c.rearForceX=fxR;c.rearForceY=fyR;c.frontCapacity=capF;c.rearCapacity=capR
        val bodyFx=fxF*wheelCos-fyF*wheelSin+fxR
        val bodyFy=fyF*wheelCos+fxF*wheelSin+fyR
        c.lateralAcceleration=bodyFy/spec.massKg
        val physicalYaw=(g.frontArmM*(fyF*wheelCos+fxF*wheelSin)-g.rearArmM*fyR)/spec.yawInertiaKgM2*p.yawTorqueScale
        val yawLength=spec.yawInertiaKgM2/(spec.massKg*g.wheelbaseM)
        val response=spec.yawResponseSeconds*c.feel.yawResponseScale*yawLength/p.referenceYawLengthM
        // Preserve the approved grip response: W3's steady yaw solves
        // yaw = command - yaw*stability/lateralDamping. A bicycle has a different
        // neutral body-slip angle, so restoring raw beta would amplify grip turns.
        val stability=spec.yawStabilityPerSecond*c.feel.stabilityScale
        val physicalBlend=max(blend(abs(beta),p.physicalBlendStartRadians,p.physicalBlendEndRadians),hb*p.handbrakePhysicalBlend)
        // This reference calibrates asphalt grip driving only. Surface loss already lives in
        // axle capacities; applying it again here would cripple low-grip wall recovery.
        val gripWeight=(1-max(hb,blend(abs(beta),p.physicalBlendStartRadians,p.physicalBlendEndRadians)))*blend(speed,p.lowSpeedMps,Movement.driftMinSpeedMps)
        val referenceGrip=max(1e-6,spec.lateralGripPerSecond)
        val referenceYaw=steerYaw/(1+stability/referenceGrip*gripWeight)
        val rearCurveCapacity=remainingR*(1-hb*(1-p.handbrakeRearGrip))
        val rearDemand=spec.massKg*speed*referenceYaw*g.frontArmM/g.wheelbaseM
        val rearRatio=if(rearCurveCapacity>0)(abs(rearDemand)/rearCurveCapacity).coerceIn(0.0,1.0) else 0.0
        val neutralRearSlip=-sign(rearDemand)*p.peakSlipRadians*(1-sqrt(1-rearRatio))
        val neutralBeta=(atan2(g.rearArmM*referenceYaw,max(speed,p.lowSpeedMps))+neutralRearSlip).coerceIn(-Movement.driftEnterRadians,Movement.driftEnterRadians)
        val stableYaw=referenceYaw+(beta-neutralBeta*gripWeight)*stability*assist
        val torqueLimit=(g.frontArmM*(remainingF*wheelCos+abs(fxF*wheelSin))+g.rearArmM*remainingR)/spec.yawInertiaKgM2
        val servo=((stableYaw-c.yaw)*(1-exp(-dt/response))/dt).coerceIn(-torqueLimit,torqueLimit)
        c.yaw+=(servo*(1-physicalBlend)+physicalYaw*physicalBlend)*dt
        c.heading=wrapAngle(c.heading+c.yaw*dt)
        var nextForward=forward+bodyFx/spec.massKg*dt
        // A brake may stop existing reverse travel, never create it. Rotation can create negative forward velocity.
        if(drive==0.0 && nextForward*forward<0.0)nextForward=0.0
        val nextLateral=lateral+bodyFy/spec.massKg*dt
        val slide=blend(abs(beta),Movement.driftExitRadians,p.physicalBlendEndRadians)
        val drag=exp(-(spec.rollingDragPerSecond*(1-slide*(1-p.slideDragScale))+c.surface.dragPerSecond)*dt)
        c.vx=(cx*nextForward-cy*nextLateral)*drag;c.vy=(cy*nextForward+cx*nextLateral)*drag
        val magnitude=c.speedMps
        val speedCap=spec.maxSpeedMps*c.abilitySpeedScale
        if(magnitude>speedCap){c.vx*=speedCap/magnitude;c.vy*=speedCap/magnitude}
        c.longitudinalAcceleration=(c.vx*cx+c.vy*cy-forward)/dt
        c.x+=c.vx*dt;c.y+=c.vy*dt
        updateSignals(c,input,dt,p)
    }
    fun updateSignals(c: Car,input: InputFrame,dt: Double,p: DriftParameters) {
        val speed=c.speedMps
        c.slipRadians=if(speed>p.lowSpeedMps)wrapAngle(atan2(c.vy,c.vx)-c.heading) else 0.0
        val slip=abs(c.slipRadians);val was=c.drifting
        if(speed<Movement.driftMinSpeedMps || input.handbrake==0.0 && slip<Movement.driftExitRadians)c.drifting=false
        else if(slip>Movement.driftEnterRadians)c.drifting=true
        if(slip>=p.spinSlipRadians && speed>=p.spinMinSpeedMps && !c.spunOut){c.spunOut=true;c.spinEvents++;c.spinRecoverySeconds=0.0}
        if(c.spunOut) {
            if(slip<Movement.driftExitRadians && abs(c.yaw)<p.recoveredYawRadPerSecond)c.spinRecoverySeconds+=dt else c.spinRecoverySeconds=0.0
            if(c.spinRecoverySeconds>=p.spinSettleSeconds)c.spunOut=false
        }
        if(c.drifting && !was)c.driftEntrySpeedMps=speed
        c.driftHeldSeconds=if(c.drifting && !c.spunOut)c.driftHeldSeconds+dt else 0.0
        c.driftSpeedRetained=if(c.driftEntrySpeedMps>0)(speed/c.driftEntrySpeedMps).coerceIn(0.0,1.0) else 0.0
        val smooth=1-min(1.0,abs(c.filteredSteer-c.previousDriftSteer)/(max(dt,1e-9)*p.qualitySteerRatePerSecond))
        c.countersteerSmoothness+=(smooth-c.countersteerSmoothness)*(1-exp(-dt/p.qualitySmoothSeconds))
        c.previousDriftSteer=c.filteredSteer
        val angleQuality=blend(slip,Movement.driftExitRadians,p.assistFadeStartRadians)*(1-blend(slip,p.assistFadeStartRadians,p.spinSlipRadians))
        c.driftQuality=if(c.drifting && !c.spunOut)angleQuality*c.driftSpeedRetained*min(1.0,c.driftHeldSeconds/p.qualityFullHoldSeconds)*c.countersteerSmoothness else 0.0
    }
    fun reset(c: Car) {
        c.slipRadians=0.0;c.frontSlipRadians=0.0;c.rearSlipRadians=0.0;c.lateralAcceleration=0.0;c.longitudinalAcceleration=0.0
        c.frontForceX=0.0;c.frontForceY=0.0;c.rearForceX=0.0;c.rearForceY=0.0;c.frontCapacity=0.0;c.rearCapacity=0.0
        c.spunOut=false;c.spinEvents=0;c.spinRecoverySeconds=0.0;c.driftQuality=0.0;c.driftHeldSeconds=0.0
        c.driftEntrySpeedMps=0.0;c.driftSpeedRetained=0.0;c.countersteerSmoothness=1.0;c.previousDriftSteer=0.0
    }
}
