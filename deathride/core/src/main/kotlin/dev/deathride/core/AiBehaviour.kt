package dev.deathride.core

import kotlin.math.*
import dev.deathride.core.StrictTrig.cos
import dev.deathride.core.StrictTrig.sin

enum class AiRole { FIELD, RIVAL, BOSS }
enum class AiReason { NONE, PROTECTED, SETTLE, NO_VISIBLE, SLOTS_BUSY, COMMITTED, LEADER, TEMPERAMENT, HIT_RECOVERY, RECOVER, WEAKNESS }
enum class AiTactic { NONE, RAM_HAMMER, CORNER_BLOCK, CORNER_PUSH, BRAKE_CHECK, STRAIGHT_PRESSURE, RANGED_PRESSURE, RAM_MINES }

data class Temperament(val id: String,val contact: Double,val block: Double,val range: Double,val risk: Double,val abilityEvery: Int,
                       val leader: Double,val near: Double,val damaged: Double,val drift: Double,val cornerMargin: Double=0.0,val cornerBlock: Double=0.0) {
    init { require(contact in 0.0..1.0 && block in 0.0..1.0 && range>0 && risk in .3.. .7 && abilityEvery>0 && leader>=0 && near>=0 && damaged>=0 && drift in 0.0..1.0) }
}
class RacePlan(row: Map<String,String>) {
    val id=row.getValue("id");val hunters=row.number("hunters").toInt();val perception=row.number("perceptionCarLengths")
    val commitment=row.number("commitSeconds");val lease=row.number("leaseSeconds");val recovery=row.number("hitRecoverySeconds");val margin=row.number("switchMargin")
    init { require(hunters in 0..3 && perception>0 && commitment>0 && lease>=commitment && recovery>0 && margin>0) }
}
class RacePhase(row: Map<String,String>) {
    val id=row.getValue("id");val start=row.number("startFraction")
    val pressure=doubleArrayOf(row.number("fieldPressure"),row.number("rivalPressure"),row.number("bossPressure"))
    val leader=row.number("leaderPressure")
    init { require(start in 0.0..1.0 && pressure.all{it in 0.0..1.0} && leader in 0.0..1.0) }
}
class WeaknessRule(row: Map<String,String>) {
    val stat=CarCatalog.statNames.indexOf(row.getValue("stat"));val tactic=AiTactic.valueOf(row.getValue("tactic"))
    val deficit=row.number("deficitWeight");val damage=row.number("damageWeight");val identity=row.number("identityWeight")
    init { require(stat>=0 && tactic!=AiTactic.NONE && deficit>0 && damage>=0 && identity>=0) }
}
object AiControls {
    private val values=Content.table("ai-control-rules").associate{it.getValue("key") to it.number("value")}
    operator fun get(key: String)=values.getValue(key)
}
object AiCatalog {
    val temperaments=Content.table("ai-temperaments").associate{r->r.getValue("id") to Temperament(r.getValue("id"),r.number("contact"),r.number("block"),r.number("rangeCarLengths"),r.number("laneRisk"),r.number("abilityEvery").toInt(),r.number("leaderWeight"),r.number("nearWeight"),r.number("damageWeight"),r.number("driftUse"))}
    val personas=Content.table("ai-personas").associateBy{it.getValue("id")}
    val plans=Content.table("ai-plans").associate{it.getValue("id") to RacePlan(it)}
    val phases=Content.table("ai-phases").map{RacePhase(it)}
    val weaknesses=Content.table("ai-weaknesses").map{WeaknessRule(it)}
    val bossHealth=Content.table("ai-bosses").associate{it.getValue("id") to it.number("healthMultiplier")}
    val peerMeans=Array(5){tier->DoubleArray(CarCatalog.statNames.size){stat->CarCatalog.all.filter{it.tierRank==tier}.map{it.stats.getValue(CarCatalog.statNames[stat])}.average()}}
    val identityThreshold=RosterRules["identityBandPoints"]*RosterRules["identityBands"]
    fun temperament(c: Car): Temperament {
        val base=temperaments.getValue(if(c.ability.definition?.kind==AbilityKind.DISPATCHER)"rig" else c.carClass!!.id)
        val p=personas[c.aiStyle?.id]?:return base
        return base.copy(contact=(base.contact+p.number("contact")).coerceIn(0.0,1.0),block=(base.block+p.number("block")).coerceIn(0.0,1.0),
            range=base.range+p.number("rangeCarLengths"),risk=(base.risk+p.number("laneRisk")).coerceIn(.3,.7),leader=base.leader+p.number("leaderWeight"),
            near=base.near+p.number("nearWeight"),damaged=base.damaged+p.number("damageWeight"),cornerMargin=p.number("cornerMarginMps"),cornerBlock=p.number("cornerBlock"))
    }
    fun plan(skill: AiSkill)=plans.getValue(when(skill.id){"legacy0"->"Rookie";"legacy1"->"Club";"legacy2"->"Pro";else->skill.id})
    init {
        require(temperaments.keys==CarCatalog.all.map{it.id}.toSet()+"rig")
        require(personas.keys==setOf("rook","ox","mica","vex","relay","marrow"))
        require(plans.keys==setOf("Rookie","Club","Pro","Champion") && plans.getValue("Rookie").hunters==0)
        require(phases.map{it.id}==listOf("settle","pressure","all-in","final-lap") && phases.zipWithNext().all{it.first.start<it.second.start})
        require(weaknesses.map{it.stat}.distinct().size==weaknesses.size)
        require(bossHealth.keys==setOf("rook","ox","vex","mica","marrow") && bossHealth.values.all{it>1 && it<=2})
    }
}

/** Private local observations are refreshed only at the driver's reaction cadence. */
class AiDecision {
    var temperament: Temperament?=null;var plan: RacePlan?=null;var role=AiRole.FIELD
    var hunter=false;var hunting=false;var phase=0;var pressure=0.0;var reason=AiReason.NONE
    var visible=0;var candidates=0;var target=-1;var commitmentUntil=0.0;var leaseUntil=0.0;var recoverUntil=0.0
    var weakness=-1;var tactic=AiTactic.NONE;var decisionStep=-1;var decisions=0;var margin=0.0
    var corner=false;var targetLane=0.0;var targetAlong=0.0;var targetDistance=0.0
    val along=DoubleArray(Tuning.CAR_COUNT);val side=DoubleArray(Tuning.CAR_COUNT);val distance=DoubleArray(Tuning.CAR_COUNT)
    val lane=DoubleArray(Tuning.CAR_COUNT);val health=DoubleArray(Tuning.CAR_COUNT);val score=DoubleArray(Tuning.CAR_COUNT)
}

/** Three-mode driving FSM stays in World; this layer chooses intent and shared leases. */
class AiBehaviour(private val world: World) {
    var enabled=true // Explicit headless control; ordinary play never disables it.
    val states=Array(Tuning.CAR_COUNT){AiDecision()}
    private val projection=Projection();private val point=TrackPoint()
    val traceCapacity=AiControls["traceCapacity"].toInt()
    val trace=IntArray(traceCapacity*TRACE_STRIDE)
    var traceCount=0;private set
    var maximumAttackers=0;private set
    var leaderChanges=0;private set
    var leaderDamage=0.0;private set
    var hunterRoleDamage=0.0;private set
    var huntIntentDamage=0.0;private set
    var huntDecisions=0;private set
    private var previousLeader=-1
    companion object { const val TRACE_STRIDE=16 }

    fun reset() {
        trace.fill(0);traceCount=0;maximumAttackers=0;leaderChanges=0;leaderDamage=0.0;hunterRoleDamage=0.0;huntIntentDamage=0.0;huntDecisions=0;previousLeader=-1
        for(c in world.cars) {
            val s=states[c.id]
            c.maxHp/=c.aiBossHealthScale;c.aiBossHealthScale=1.0
            s.temperament=null;s.plan=null;s.hunter=false;s.hunting=false;s.phase=0;s.pressure=0.0;s.reason=AiReason.NONE
            s.visible=0;s.candidates=0;s.target=-1;s.commitmentUntil=0.0;s.leaseUntil=0.0;s.recoverUntil=0.0;s.weakness=-1;s.tactic=AiTactic.NONE
            s.decisionStep=-1;s.decisions=0;s.margin=0.0;s.corner=false;s.targetLane=0.0;s.targetAlong=0.0;s.targetDistance=0.0
            s.along.fill(0.0);s.side.fill(0.0);s.distance.fill(0.0);s.lane.fill(0.0);s.health.fill(0.0);s.score.fill(0.0)
            s.role=if(world.aiBossRival>=0 && c.rivalIndex==world.aiBossRival || world.eventType==EventType.ELIMINATION && c.aiStyle?.id=="marrow")AiRole.BOSS else if(c.aiStyle!=null)AiRole.RIVAL else AiRole.FIELD
            if(!enabled || !c.entered || c.carClass==null)continue
            s.temperament=AiCatalog.temperament(c)
            s.plan=AiCatalog.plan(c.aiSkill?:AiSkills.legacy[(c.id+world.seed).mod(AiSkills.legacy.size)])
            if(s.role==AiRole.BOSS && !c.human) {
                c.aiBossHealthScale=AiCatalog.bossHealth.getValue(c.aiStyle!!.id);c.maxHp*=c.aiBossHealthScale
            }
        }
        var assigned=0
        for(offset in world.cars.indices) {
            val id=(offset+world.seed.mod(Tuning.CAR_COUNT))%Tuning.CAR_COUNT;val c=world.cars[id];val s=states[id]
            if(c.entered && !c.human && id!=world.aiLeadSlot && s.plan!=null && assigned<s.plan!!.hunters) { s.hunter=true;assigned++ }
        }
    }
    private fun release(id: Int) {
        world.combat.lastTarget[id]=-1;states[id].leaseUntil=0.0
        val input=world.cars[id].aiInput;input.fire=0.0;input.mine=0.0;input.ability=0.0
    }
    fun beforeStep() {
        for(c in world.cars) {
            val s=states[c.id];if(s.temperament==null)continue
            val target=world.combat.lastTarget[c.id]
            if(target>=0 && (world.seconds>=s.leaseUntil || !world.combat.canAct(c.id) || !world.combat.canAct(target)))release(c.id)
        }
    }
    fun attackers(target: Int,except: Int=-1): Int {
        var n=0
        for(i in world.cars.indices)if(i!=except && world.combat.lastTarget[i]==target && world.combat.canAct(i) &&
            (states[i].temperament==null || states[i].leaseUntil>world.seconds))n++
        return n
    }
    private fun perceive(c: Car,s: AiDecision) {
        s.visible=0;s.candidates=0
        val range=c.spec.lengthM*s.plan!!.perception;val cx=cos(c.heading);val cy=sin(c.heading)
        world.track.project(c.x,c.y,projection)
        val skill=c.aiSkill?:AiSkills.legacy[(c.id+world.seed).mod(AiSkills.legacy.size)]
        world.track.sample(projection.s+c.spec.lengthM*TrackRules["aiLookCarLengths"]+c.speedMps*skill.lookAheadSeconds,0.0,point)
        s.corner=abs(point.curvature)>TrackRules["straightCurvature"]
        for(o in world.cars)if(o!==c && world.combat.canAct(o.id)) {
            val dx=o.x-c.x;val dy=o.y-c.y;val d2=dx*dx+dy*dy
            if(d2>range*range || world.combat.roadFraction(c.x,c.y,o.x,o.y,c.spec.circleRadiusM)<1.0)continue
            val i=o.id;s.visible=s.visible or (1 shl i);s.distance[i]=sqrt(d2);s.along[i]=dx*cx+dy*cy;s.side[i]=abs(-dx*cy+dy*cx)
            s.health[i]=world.combat.health(i)/world.combat.maxHealth(i)
            world.track.project(o.x,o.y,projection);s.lane[i]=projection.distance
        }
    }
    private fun phase(c: Car): Int {
        if(world.eventType==EventType.ELIMINATION)return 2
        if(c.lap.laps>=world.raceLaps-1)return 3
        val progress=max(0.0,c.lap.progressM)/(world.track.lengthM*world.raceLaps)
        return if(progress>=AiCatalog.phases[2].start)2 else if(progress>=AiCatalog.phases[1].start)1 else 0
    }
    private fun candidate(c: Car,s: AiDecision,id: Int): Boolean {
        if(s.visible and (1 shl id)==0 || s.hunting && world.cars[id].position !in 1..2)return false
        val rear=s.along[id]<0
        val d=c.ability.definition?.kind
        var rearRange=c.spec.lengthM*AiControls["blockReachCarLengths"]
        if(d==AbilityKind.PATCH || d==AbilityKind.SPIKES)rearRange=max(rearRange,c.ability.definition!!.aiRangeM)
        if(c.aiSkill?.mines!=false && c.aiStyle?.mines!=false)rearRange=max(rearRange,CombatRules["aiChaserRangeM"])
        return !rear || s.distance[id]<rearRange &&
            (s.temperament!!.block>=AiControls["blockThreshold"] || c.aiSkill?.mines!=false && c.aiStyle?.mines!=false || d==AbilityKind.PATCH || d==AbilityKind.SPIKES)
    }
    private fun score(c: Car,s: AiDecision,id: Int): Double {
        val t=s.temperament!!;val range=c.spec.lengthM*s.plan!!.perception
        val preference=1-abs(s.distance[id]-t.range*c.spec.lengthM)/range
        return t.near*preference+t.leader/world.cars[id].position+t.damaged*(1-s.health[id])
    }
    /** Returns false only for the legacy classless fixture path. */
    fun think(c: Car): Boolean {
        val s=states[c.id];val plan=s.plan?:return false
        if(s.decisionStep==world.steps)return true
        s.decisionStep=world.steps;s.decisions++;s.phase=phase(c);s.weakness=-1;s.tactic=AiTactic.NONE
        s.pressure=AiCatalog.phases[s.phase].pressure[s.role.ordinal]
        if(c.position in 1..2)s.pressure*=AiCatalog.phases[s.phase].leader
        s.hunting=s.hunter && s.phase>0 && world.eventType==EventType.LAPS && world.combat.armingSeconds<=0 && world.combat.canAct(c.id)
        c.aiInput.fire=0.0;c.aiInput.mine=0.0;c.aiInput.ability=0.0
        perceive(c,s)
        if(!world.combat.enabled || !world.combat.canAct(c.id) || world.combat.armingSeconds>0 || c.aiMode==AiMode.RECOVER || world.seconds<s.recoverUntil) {
            release(c.id);s.target=-1
            s.reason=if(world.combat.armingSeconds>0)AiReason.PROTECTED else if(c.aiMode==AiMode.RECOVER)AiReason.RECOVER else AiReason.HIT_RECOVERY
            record(c);return true
        }
        var best=-1;var bestScore=Double.NEGATIVE_INFINITY;var second=Double.NEGATIVE_INFINITY
        for(o in world.cars)if(o!==c && candidate(c,s,o.id)) {
            s.candidates=s.candidates or (1 shl o.id);val value=score(c,s,o.id);s.score[o.id]=value
            if(attackers(o.id,c.id)>=CombatRules["aiMaxAttackers"].toInt())continue
            if(value>bestScore){second=bestScore;bestScore=value;best=o.id} else second=max(second,value)
        }
        val old=s.target
        val held=old>=0 && candidate(c,s,old) && attackers(old,c.id)<CombatRules["aiMaxAttackers"] &&
            (world.seconds<s.commitmentUntil || best<0 || bestScore<s.score[old]+plan.margin)
        if(held){best=old;s.reason=AiReason.COMMITTED}
        else s.reason=if(best<0)if(s.candidates!=0)AiReason.SLOTS_BUSY else AiReason.NO_VISIBLE else if(s.hunting)AiReason.LEADER else if(s.phase==0)AiReason.SETTLE else AiReason.TEMPERAMENT
        if(best<0) { release(c.id);s.target=-1;record(c);return true }
        if(best!=old)s.commitmentUntil=world.seconds+plan.commitment
        s.target=best;s.targetLane=s.lane[best];s.targetAlong=s.along[best];s.targetDistance=s.distance[best]
        s.leaseUntil=world.seconds+plan.lease;world.combat.lastTarget[c.id]=best
        maximumAttackers=max(maximumAttackers,attackers(best))
        s.margin=if(second.isFinite())bestScore-second else bestScore
        if(s.hunting)huntDecisions++
        if(s.role==AiRole.BOSS && (world.cars[best].human || best==world.aiLeadSlot || world.eventType==EventType.ELIMINATION && best==world.duelRigSlot)) {
            s.weakness=weakness(world.cars[best],s.health[best]);s.tactic=AiCatalog.weaknesses[s.weakness].tactic
            if(!held)s.reason=AiReason.WEAKNESS
        }
        val front=s.targetAlong>0 && s.targetAlong<Weapons.all[Weapons.RIVET].rangeM*(c.aiStyle?.fireRangeScale?:1.0) &&
            s.side[best]<world.cars[best].spec.circleRadiusM+s.targetAlong*CombatRules["aiForwardConeRadians"]
        c.aiInput.fire=if(front)1.0 else 0.0
        c.aiInput.mine=if(s.targetAlong<0 && s.targetDistance<CombatRules["aiChaserRangeM"] && c.aiSkill?.mines!=false && c.aiStyle?.mines!=false)1.0 else 0.0
        val heavyScale=if(s.tactic==AiTactic.RAM_HAMMER || s.tactic==AiTactic.RANGED_PRESSURE)AiControls["heavyWeaknessRangeScale"] else 1.0
        c.aiInput.weapon=if(front && s.targetDistance>CombatRules["aiHeavyMinRangeM"]*(c.aiStyle?.heavyRangeScale?:1.0)*heavyScale && world.combat.ammo(c.id,Weapons.HAMMER)>0)Weapons.HAMMER
            else if(front && s.targetDistance<Weapons.all[Weapons.SCATTER].rangeM && world.combat.ammo(c.id,Weapons.SCATTER)>0)Weapons.SCATTER else Weapons.RIVET
        c.aiCombatReason=if(c.aiInput.mine>0)2 else if(front)1 else 0
        record(c);return true
    }
    fun weakness(target: Car,visibleHealthFraction: Double): Int {
        val type=target.carClass?:return 0;var best=0;var value=Double.NEGATIVE_INFINITY
        for(i in AiCatalog.weaknesses.indices) {
            val rule=AiCatalog.weaknesses[i];val mean=AiCatalog.peerMeans[type.tierRank][rule.stat]
            val deficit=max(0.0,(mean-target.effectiveStats[rule.stat])/mean)
            val identity=mean-type.stats.getValue(CarCatalog.statNames[rule.stat])>=AiCatalog.identityThreshold
            val score=deficit*rule.deficit+(1-visibleHealthFraction)*rule.damage+if(identity)rule.identity else 0.0
            if(score>value){best=i;value=score}
        }
        return best
    }
    fun offensiveAbilityAllowed(c: Car,target: Int): Boolean = states[c.id].temperament==null ||
        world.combat.lastTarget[c.id]==target && states[c.id].leaseUntil>world.seconds && world.seconds>=states[c.id].recoverUntil
    fun abilityCadence(c: Car): Boolean { val s=states[c.id];return s.temperament?.let{(s.decisions-1)%it.abilityEvery==0}?:true }
    fun lane(c: Car,ordinary: Double): Double {
        val s=states[c.id];val t=s.temperament?:return ordinary
        if(c.aiMode==AiMode.RECOVER || s.target<0 || world.combat.lastTarget[c.id]!=s.target || s.phase==0)return ordinary
        val length=c.spec.lengthM;var contact=t.contact;var block=t.block+if(s.corner)t.cornerBlock else 0.0
        if(s.tactic==AiTactic.RAM_HAMMER || s.tactic==AiTactic.RAM_MINES || s.tactic==AiTactic.CORNER_PUSH && s.corner)contact+=AiControls["weaknessContactBonus"]
        if(s.tactic==AiTactic.BRAKE_CHECK || s.tactic==AiTactic.CORNER_BLOCK && s.corner)block+=AiControls["weaknessBlockBonus"]
        val close=s.targetDistance<length*AiControls["contactReachCarLengths"]
        val directed=if(close && (s.targetAlong>=0 && contact>=AiControls["contactThreshold"] || s.targetAlong<0 && block>=AiControls["blockThreshold"]))AiControls["contactLaneBlend"]
            else if(s.targetAlong>0 && !s.corner)AiControls["rangedLaneBlend"]*(if(s.tactic==AiTactic.STRAIGHT_PRESSURE)AiControls["straightWeaknessBlendScale"] else 1.0) else 0.0
        return ordinary+(s.targetLane-ordinary)*directed*s.pressure
    }
    fun speedFraction(c: Car): Double {
        val s=states[c.id];val t=s.temperament?:return 1.0
        if(s.phase==0 || s.target<0 || c.aiMode==AiMode.RECOVER || world.combat.lastTarget[c.id]!=s.target || s.targetAlong>=0 || s.targetDistance>c.spec.lengthM*AiControls["blockReachCarLengths"])return 1.0
        if(s.tactic==AiTactic.BRAKE_CHECK)return AiControls["brakeCheckSpeedFraction"]
        return if(s.corner && (t.block+t.cornerBlock>=AiControls["blockThreshold"] || s.tactic==AiTactic.CORNER_BLOCK))AiControls["cornerBlockSpeedFraction"] else 1.0
    }
    fun cornerMargin(c: Car,skill: AiSkill)=max(0.0,skill.cornerMarginMps+(states[c.id].temperament?.cornerMargin?:0.0))
    fun risk(c: Car)=states[c.id].temperament?.risk?:.55
    fun drift(c: Car,steer: Double): Double {
        val s=states[c.id]
        return if(c.aiMode!=AiMode.RECOVER && s.corner && abs(steer)<AiControls["driftMaximumSteer"] && !c.spunOut)s.temperament?.drift?:0.0 else 0.0
    }
    fun onDamage(target: Int,source: Int,dealt: Double) {
        if(dealt<=0 || source<0 || source==target)return
        val s=states[source]
        if(world.cars[target].position in 1..2) {
            leaderDamage+=dealt
            if(s.hunter)hunterRoleDamage+=dealt
            if(s.hunting && s.target==target)huntIntentDamage+=dealt
        }
        if(s.temperament!=null) {
            s.recoverUntil=world.seconds+s.plan!!.recovery;release(source)
        }
    }
    fun afterStep() {
        var leader=-1
        for(c in world.cars)if(c.entered)maximumAttackers=max(maximumAttackers,attackers(c.id))
        for(c in world.cars)if(c.entered && c.position==1){leader=c.id;break}
        if(previousLeader>=0 && leader>=0 && previousLeader!=leader)leaderChanges++
        previousLeader=leader
    }
    private fun record(c: Car) {
        val s=states[c.id];val i=(traceCount%traceCapacity)*TRACE_STRIDE
        trace[i]=world.steps;trace[i+1]=c.id;trace[i+2]=c.aiMode.ordinal;trace[i+3]=s.role.ordinal;trace[i+4]=s.phase;trace[i+5]=c.position
        trace[i+6]=s.visible;trace[i+7]=s.candidates;trace[i+8]=s.target;trace[i+9]=s.reason.ordinal;trace[i+10]=(s.commitmentUntil/Tuning.STEP_SECONDS).toInt()
        trace[i+11]=s.weakness;trace[i+12]=s.tactic.ordinal;trace[i+13]=if(s.hunting)1 else 0;trace[i+14]=if(s.margin.isFinite())(s.margin*10000).toInt() else 0
        trace[i+15]=if(s.target>=0)attackers(s.target) else 0;traceCount++
    }
    fun appendHash(initial: Long): Long {
        var h=initial
        for(s in states) {
            h=h*31+s.target;h=h*31+s.phase;h=h*31+s.role.ordinal;h=h*31+s.reason.ordinal;h=h*31+s.visible
            h=h*31+s.commitmentUntil.toBits();h=h*31+s.leaseUntil.toBits();h=h*31+s.recoverUntil.toBits();h=h*31+s.weakness
            h=h*31+if(s.hunter)1 else 0;h=h*31+s.decisions;h=h*31+s.decisionStep
        }
        return h
    }
    /** Debug telemetry only; never rendered as a hunt cue. Serialization is outside the fixed step. */
    fun json(c: Car): String {
        val s=states[c.id]
        return "{\"mode\":\"${c.aiMode}\",\"role\":\"${s.role}\",\"phase\":${s.phase},\"hunter\":${s.hunter},\"hunting\":${s.hunting},\"target\":${s.target},\"claim\":${world.combat.lastTarget[c.id]},\"reason\":\"${s.reason}\",\"visible\":${s.visible},\"tactic\":\"${s.tactic}\",\"decisions\":${s.decisions},\"maxAttackers\":$maximumAttackers,\"leaderChanges\":$leaderChanges,\"leaderDamage\":$leaderDamage,\"hunterDamage\":$hunterRoleDamage,\"huntIntentDamage\":$huntIntentDamage}"
    }
}
