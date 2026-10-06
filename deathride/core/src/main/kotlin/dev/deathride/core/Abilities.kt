package dev.deathride.core

import kotlin.math.*
import dev.deathride.core.StrictTrig.cos
import dev.deathride.core.StrictTrig.sin

enum class AbilityKind { DASH, SURGE, CHARGE, TURBINE, GRIP, LANCE, SPIKES, PATCH, HARPOON, GUARD, DISPATCHER }
enum class AbilityPhase { READY, WINDUP, ACTIVE, RECOVERY }

/** Immutable type objects loaded once. CSV owns every gameplay coefficient. */
class AbilityDefinition(row: Map<String,String>) {
    val car=row.getValue("car");val id=row.getValue("id");val name=row.getValue("name")
    val kind=AbilityKind.valueOf(row.getValue("kind"));val effectId=row.getValue("effectId")
    val windupSeconds=row.number("windupSeconds");val activeSeconds=row.number("activeSeconds")
    val recoverySeconds=row.number("recoverySeconds");val cooldownSeconds=row.number("cooldownSeconds")
    val energyCapacity=row.number("energyCapacity");val energyCost=row.number("energyCost");val energyPerSecond=row.number("energyPerSecond")
    val engineScale=row.number("engineScale");val speedScale=row.number("speedScale");val gripScale=row.number("gripScale");val steerScale=row.number("steerScale")
    val damageReduction=row.number("damageReduction");val damage=row.number("damage");val rangeM=row.number("rangeM");val radiusM=row.number("radiusM")
    val slowScale=row.number("slowScale");val slowSeconds=row.number("slowSeconds");val weaponLock=row.number("weaponLock")!=0.0
    val aiRangeM=row.number("aiRangeM");val aiMaxCurvature=row.number("aiMaxCurvature");val aiMinSpeedMps=row.number("aiMinSpeedMps")
    val perceptionSeconds=row.number("perceptionSeconds");val escapeSpeedMps=row.number("escapeSpeedMps");val prAdjustment=row.number("prAdjustment")
    val ray get()=kind==AbilityKind.LANCE || kind==AbilityKind.HARPOON
    init {
        for((key,value) in row)if(key !in setOf("car","id","name","kind","effectId"))require(value.toDouble().isFinite()) { "$car/$key must be finite" }
        require(windupSeconds>0 && activeSeconds>0 && recoverySeconds>0)
        require(cooldownSeconds>windupSeconds+activeSeconds+recoverySeconds)
        require(energyCost>0 && energyCapacity>=energyCost && energyPerSecond>0)
        require(engineScale>0 && speedScale>0 && gripScale>0 && steerScale>0)
        require(damageReduction in 0.0..<1.0 && damage>=0 && rangeM>=0 && radiusM>=0)
        require(slowScale in 0.0..1.0 && slowSeconds>=0 && aiRangeM>0 && aiMaxCurvature>0 && aiMinSpeedMps>=0)
        require(perceptionSeconds>0 && escapeSpeedMps>0 && effectId.startsWith("abilities/"))
        if(ray)require(rangeM>0 && radiusM>0 && damage>0)
        if(kind==AbilityKind.PATCH)require(radiusM>0 && damage>0)
    }
    val json="{\"id\":\"$id\",\"name\":\"$name\",\"car\":\"$car\",\"kind\":\"$kind\",\"cooldownSeconds\":$cooldownSeconds,\"energyCost\":$energyCost,\"energyCapacity\":$energyCapacity,\"effectId\":\"$effectId\",\"prAdjustment\":$prAdjustment}"
}
object AbilityCatalog {
    private val definitions=Content.table("abilities").map{AbilityDefinition(it)}
    val all=definitions.filter{it.car!="MechanicRig"}
    val dispatcher=definitions.single{it.car=="MechanicRig"}
    val byCar=all.associateBy{it.car}
    init { require(byCar.size==all.size && all.map{it.id}.distinct().size==all.size) }
    val json=all.joinToString(",","[","]"){it.json}
}

class AbilityState {
    var definition: AbilityDefinition?=null
    var phase=AbilityPhase.READY;internal set
    var remainingSeconds=0.0;internal set
    var cooldownSeconds=0.0;internal set
    var energy=0.0;internal set
    var activation=0;internal set
    var hitMask=0;internal set
    var fired=false;internal set
    var x=0.0;internal set
    var y=0.0;internal set
    var endX=0.0;internal set
    var endY=0.0;internal set
    var slowSeconds=0.0;internal set
    var slowScale=1.0;internal set
    fun reset() {
        phase=AbilityPhase.READY;remainingSeconds=0.0;cooldownSeconds=0.0;energy=definition?.energyCapacity?:0.0
        activation=0;hitMask=0;fired=false;x=0.0;y=0.0;endX=0.0;endY=0.0;slowSeconds=0.0;slowScale=1.0
    }
    val committed get()=phase!=AbilityPhase.READY
    val weaponsLocked get()=committed && definition?.weaponLock==true
}

/** No wall clock, random draws, collection operations or allocation in the fixed step. */
class Abilities(private val world: World,var enabled: Boolean) {
    private val projection=Projection();private val point=TrackPoint()
    fun begin(c: Car,input: InputFrame,dt: Double) {
        val s=c.ability;val d=s.definition
        c.abilitySpeedScale=1.0;c.abilityGripScale=1.0;c.abilitySteerScale=1.0;c.abilityDamageReduction=0.0
        if(!enabled || d==null || !world.combat.canAct(c.id)) { cancel(c);return }
        s.slowSeconds=max(0.0,s.slowSeconds-dt);if(s.slowSeconds==0.0)s.slowScale=1.0
        s.cooldownSeconds=max(0.0,s.cooldownSeconds-dt)
        if(s.committed) {
            s.remainingSeconds-=dt
            if(s.remainingSeconds<=1e-9)when(s.phase) {
                AbilityPhase.WINDUP->{s.phase=AbilityPhase.ACTIVE;s.remainingSeconds+=d.activeSeconds}
                AbilityPhase.ACTIVE->{s.phase=AbilityPhase.RECOVERY;s.remainingSeconds+=d.recoverySeconds}
                AbilityPhase.RECOVERY->{s.phase=AbilityPhase.READY;s.remainingSeconds=0.0}
                else->Unit
            }
        } else s.energy=min(d.energyCapacity,s.energy+d.energyPerSecond*dt)
        val requested=if(d.kind==AbilityKind.DISPATCHER)c.speedMps>=d.aiMinSpeedMps else input.ability>0
        if(requested && !s.committed && s.cooldownSeconds<=1e-9 && s.energy+1e-9>=d.energyCost && world.combat.armingSeconds<=0)activate(c,d)
        if(s.phase==AbilityPhase.ACTIVE) {
            c.engineScale*=d.engineScale;c.abilitySpeedScale=d.speedScale;c.abilitySteerScale=d.steerScale
            c.abilityGripScale=if(d.kind!=AbilityKind.GRIP || c.surface.gripScale<Surfaces.asphalt.gripScale)d.gripScale else 1.0
            c.abilityDamageReduction=d.damageReduction
        }
        // Charging and cooling borrow the same engine cost; Comet's cooling cannot boost it.
        if(s.phase==AbilityPhase.WINDUP || s.phase==AbilityPhase.RECOVERY)c.engineScale*=min(1.0,d.engineScale)
        c.engineScale*=s.slowScale
    }
    private fun activate(c: Car,d: AbilityDefinition) {
        val s=c.ability;s.energy-=d.energyCost;s.cooldownSeconds=d.cooldownSeconds
        s.phase=AbilityPhase.WINDUP;s.remainingSeconds=d.windupSeconds;s.activation++;s.hitMask=0;s.fired=false
        val nose=c.spec.circleOffsetM+c.spec.circleRadiusM
        val offset=if(d.kind==AbilityKind.PATCH)-nose-CombatRules["dropClearanceM"] else nose
        s.x=c.x+c.cosHeading*offset;s.y=c.y+c.sinHeading*offset
        s.endX=s.x+c.cosHeading*d.rangeM;s.endY=s.y+c.sinHeading*d.rangeM
        world.presentationEvents.emit(PresentationKind.ABILITY,c.id,detail=s.activation,x=s.x,y=s.y,seconds=world.seconds)
        if(d.ray) {
            val fraction=world.combat.roadFraction(s.x,s.y,s.endX,s.endY,c.spec.circleRadiusM)
            s.endX=s.x+(s.endX-s.x)*fraction;s.endY=s.y+(s.endY-s.y)*fraction
        }
    }
    fun cancel(c: Car) {
        c.ability.phase=AbilityPhase.READY;c.ability.remainingSeconds=0.0;c.ability.slowSeconds=0.0;c.ability.slowScale=1.0
        c.abilitySpeedScale=1.0;c.abilityGripScale=1.0;c.abilitySteerScale=1.0;c.abilityDamageReduction=0.0
    }
    fun resolve() {
        if(!enabled)return
        for(c in world.cars) {
            if(!world.combat.canAct(c.id)){cancel(c);continue}
            val s=c.ability;val d=s.definition?:continue
            if(s.phase!=AbilityPhase.ACTIVE)continue
            if(d.kind==AbilityKind.DISPATCHER && !s.fired) {
                s.fired=true;world.combat.dispatchMine(c.id)
            } else if(d.ray && !s.fired) {
                s.fired=true;var target=-1;var first=Double.POSITIVE_INFINITY
                for(o in world.cars)if(o!==c && world.combat.canAct(o.id)) {
                    val t=world.combat.cast(s.x,s.y,s.endX,s.endY,o,d.radiusM)
                    if(t<first){first=t;target=o.id}
                }
                if(target>=0)hit(c,world.cars[target],d)
            } else if(d.kind==AbilityKind.PATCH) {
                for(o in world.cars)if(world.combat.canAct(o.id) && world.combat.inRadius(o,s.x,s.y,d.radiusM))hit(c,o,d)
            } else if(d.kind==AbilityKind.SPIKES || d.kind==AbilityKind.CHARGE) {
                for(o in world.cars)if(o!==c && world.combat.canAct(o.id)) {
                    val pair=min(c.id,o.id)*Tuning.CAR_COUNT+max(c.id,o.id)
                    if(world.ramClosingMps[pair]<=0)continue
                    val dx=o.x-c.x;val dy=o.y-c.y
                    val along=dx*c.cosHeading+dy*c.sinHeading;val side=abs(-dx*c.sinHeading+dy*c.cosHeading)
                    if(along>side || d.kind==AbilityKind.SPIKES && -along>side)hit(c,o,d)
                }
            }
        }
    }
    private fun hit(owner: Car,target: Car,d: AbilityDefinition) {
        val s=owner.ability;val mask=1 shl target.id
        if(s.hitMask and mask!=0 || world.combat.armingSeconds>0)return
        s.hitMask=s.hitMask or mask
        world.combat.damage(target.id,d.damage,owner.id,DamageKind.ABILITY)
        if(world.combat.canAct(target.id) && d.slowSeconds>0) {
            val t=target.ability
            t.slowScale=min(t.slowScale,d.slowScale);t.slowSeconds=max(t.slowSeconds,d.slowSeconds)
        }
    }
    /** Called on the ordinary driver's reaction cadence, never from a renderer or every-frame perfect aim. */
    fun think(c: Car) {
        world.ai.think(c)
        c.aiInput.ability=0.0
        val d=c.ability.definition?:return
        if(!enabled || !world.combat.canAct(c.id) || c.ability.committed || c.ability.cooldownSeconds>0 || c.ability.energy<d.energyCost)return
        if(!world.ai.abilityCadence(c))return
        val offensive=d.kind==AbilityKind.CHARGE || d.kind==AbilityKind.LANCE || d.kind==AbilityKind.HARPOON || d.kind==AbilityKind.SPIKES || d.kind==AbilityKind.PATCH
        val skill=c.aiSkill?:AiSkills.legacy[(c.id+world.seed).mod(AiSkills.legacy.size)]
        val look=(c.spec.circleOffsetM+c.spec.circleRadiusM)*2*TrackRules["aiLookCarLengths"]+c.speedMps*skill.lookAheadSeconds
        world.track.project(c.x,c.y,projection,world.track.startM+c.lap.progressM,c.trackRoute);world.track.sample(projection.s+look,0.0,point,c.trackRoute)
        val straight=abs(point.curvature)<=d.aiMaxCurvature
        var front=false;var rear=false;var near=false
        val cx=c.cosHeading;val cy=c.sinHeading
        for(o in world.cars)if(o!==c && world.combat.canAct(o.id)) {
            val dx=o.x-c.x;val dy=o.y-c.y
            val along=dx*cx+dy*cy;val side=abs(-dx*cy+dy*cx)
            if(dx*dx+dy*dy>d.aiRangeM*d.aiRangeM || world.combat.roadFraction(c.x,c.y,o.x,o.y,c.spec.circleRadiusM)<1.0)continue
            if(offensive && !world.ai.offensiveAbilityAllowed(c,o.id))continue
            near=true
            if(side<o.spec.circleRadiusM+(if(d.ray)d.radiusM else c.spec.circleRadiusM)) {
                if(along>0)front=true else rear=true
            }
        }
        val settled=!c.spunOut && abs(c.slipRadians)<Movement.driftEnterRadians
        val use=when(d.kind) {
            AbilityKind.DASH,AbilityKind.SURGE,AbilityKind.TURBINE->straight && settled && !front && c.speedMps>=d.aiMinSpeedMps && c.speedMps<c.spec.maxSpeedMps*d.speedScale
            AbilityKind.CHARGE->front && straight && settled && c.speedMps>=d.aiMinSpeedMps
            AbilityKind.GRIP->c.surface.gripScale<Surfaces.asphalt.gripScale && abs(point.curvature)>0 && c.speedMps>=d.aiMinSpeedMps
            AbilityKind.LANCE,AbilityKind.HARPOON->front && straight
            AbilityKind.SPIKES->(front || rear) && c.speedMps>=d.aiMinSpeedMps
            AbilityKind.PATCH->rear && c.speedMps>=d.aiMinSpeedMps
            AbilityKind.GUARD->near && (rear || world.combat.health(c.id)<world.combat.maxHealth(c.id))
            AbilityKind.DISPATCHER->false // Automatic speed-gated dispatcher; no target omniscience.
        }
        c.aiInput.ability=if(use)1.0 else 0.0
    }
    fun appendHash(initial: Long): Long {
        var h=31*initial+if(enabled)1 else 0
        for(c in world.cars) {
            val s=c.ability
            h=31*h+(s.definition?.kind?.ordinal?:-1);h=31*h+s.phase.ordinal;h=31*h+s.remainingSeconds.toBits()
            h=31*h+s.cooldownSeconds.toBits();h=31*h+s.energy.toBits();h=31*h+s.activation;h=31*h+s.hitMask;h=31*h+if(s.fired)1 else 0
            h=31*h+s.x.toBits();h=31*h+s.y.toBits();h=31*h+s.endX.toBits();h=31*h+s.endY.toBits();h=31*h+s.slowSeconds.toBits();h=31*h+s.slowScale.toBits()
        }
        return h
    }
    /** The fields the phone hud reads; /stats keeps the full [json]. */
    fun hudJson(id: Int): String {
        val c=world.cars[id];val s=c.ability;val d=s.definition?:return "null"
        val available=enabled && world.combat.canAct(id)
        val ready=available && world.combat.armingSeconds<=0 && !s.committed && s.cooldownSeconds<=1e-9 && s.energy+1e-9>=d.energyCost
        return "{\"id\":\"${d.id}\",\"name\":\"${d.name}\",\"phase\":\"${s.phase}\",\"cooldownSeconds\":${s.cooldownSeconds},\"energy\":${s.energy},\"energyCapacity\":${d.energyCapacity},\"energyCost\":${d.energyCost},\"ready\":$ready,\"available\":$available}"
    }
    fun json(id: Int): String {
        val c=world.cars[id];val s=c.ability;val d=s.definition?:return "null"
        val available=enabled && world.combat.canAct(id)
        val ready=available && world.combat.armingSeconds<=0 && !s.committed && s.cooldownSeconds<=1e-9 && s.energy+1e-9>=d.energyCost
        return "{\"id\":\"${d.id}\",\"name\":\"${d.name}\",\"phase\":\"${s.phase}\",\"remainingSeconds\":${s.remainingSeconds},\"cooldownSeconds\":${s.cooldownSeconds},\"energy\":${s.energy},\"energyCapacity\":${d.energyCapacity},\"energyCost\":${d.energyCost},\"ready\":$ready,\"available\":$available,\"uses\":${s.activation},\"hits\":${world.combat.abilityHits[id]},\"damage\":${world.combat.abilityDamage[id]},\"effectId\":\"${d.effectId}\"}"
    }
}
