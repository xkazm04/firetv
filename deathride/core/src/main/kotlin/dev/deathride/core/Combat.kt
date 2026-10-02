package dev.deathride.core

import kotlin.math.*
import dev.deathride.core.StrictTrig.cos
import dev.deathride.core.StrictTrig.sin
import java.lang.StrictMath.sqrt

object CombatRules {
    private val values=Content.table("combat").associate { it.getValue("key") to it.number("value") }
    operator fun get(key: String)=values.getValue(key)
}
enum class LifeState { ACTIVE, WRECKED }
enum class DamageKind { RIVET, HAMMER, MINE, RAM, WALL, SCATTER, ABILITY }
class Weapon(row: Map<String,String>) {
    val id=row.getValue("id");val kind=row.getValue("kind")
    val damage=row.number("damage");val cooldownSeconds=row.number("cooldownSeconds");val ammo=row.number("ammo").toInt()
    val rangeM=row.number("rangeM");val speedMps=row.number("speedMps");val radiusM=row.number("radiusM")
    val armingSeconds=row.number("armingSeconds");val lifeSeconds=row.number("lifeSeconds");val traceSeconds=row.number("traceSeconds")
    init { require(kind in setOf("ray","projectile","mine","spread"));require(damage>0 && cooldownSeconds>0 && ammo>0 && radiusM>0 && lifeSeconds>0) }
    val json="{\"id\":\"$id\",\"damage\":$damage,\"cooldownSeconds\":$cooldownSeconds,\"ammo\":$ammo}"
}
object Weapons {
    const val RIVET=0;const val HAMMER=1;const val MINE=2;const val SCATTER=3
    val all=Content.table("weapons").map { Weapon(it) }.toTypedArray()
    init { require(all.map { it.id }==listOf("Rivet","Hammer","Mine","Scatter")) }
    val json=all.joinToString(",","[","]") { it.json }
}
class PickupType(row: Map<String,String>) {
    val id=row.getValue("id");val respawnSeconds=row.number("respawnSeconds");val radiusM=row.number("radiusM");val amount=row.number("amount")
    init { require(id in setOf("ammo","repair","cash") && respawnSeconds>0 && radiusM>0 && amount>0) }
}
object PickupTypes { val all=Content.table("pickups").map { PickupType(it) } }
object ControllerLayouts {
    private val rows=Content.table("controller-layouts")
    val ids=rows.map { it.getValue("id") }
    val json=rows.joinToString(",","[","]") {
        "{\"id\":\"${it.getValue("id")}\",\"name\":\"${it.getValue("name")}\",\"fireDrives\":${it.number("fireDrives")!=0.0},\"padThrottle\":${it.number("padThrottle")!=0.0},\"throttleTravelPx\":${it.number("throttleTravelPx")},\"description\":\"${it.getValue("description")}\"}"
    }
}
class Projectile { var active=false;var owner=0;var x=0.0;var y=0.0;var vx=0.0;var vy=0.0;var remainingM=0.0;var remainingSeconds=0.0;var hitMask=0 }
class Mine { var active=false;var owner=0;var x=0.0;var y=0.0;var ageSeconds=0.0;var activation=0 }
class Blast { var remainingSeconds=0.0;var x=0.0;var y=0.0;var radiusM=0.0;var hitMask=0;var activation=0 }
class Pickup(val type: PickupType,val x: Double,val y: Double) { var cooldownSeconds=0.0 }

/** Sole health/state writer. Absolute input, deterministic pool order, no step allocations. */
class Combat(private val world: World,val enabled: Boolean) {
    private val hp=DoubleArray(Tuning.CAR_COUNT)
    private val states=Array(Tuning.CAR_COUNT){LifeState.ACTIVE}
    private val ammunition=IntArray(Tuning.CAR_COUNT*Weapons.all.size)
    private val cooldowns=DoubleArray(ammunition.size)
    private val ramCooldown=DoubleArray(Tuning.CAR_COUNT*Tuning.CAR_COUNT)
    private val wallCooldown=DoubleArray(Tuning.CAR_COUNT)
    private val lastTarget=IntArray(Tuning.CAR_COUNT){-1}
    val selectedWeapon=IntArray(Tuning.CAR_COUNT)
    val kills=IntArray(Tuning.CAR_COUNT)
    val damageEvents=IntArray(Tuning.CAR_COUNT)
    val damageDealt=DoubleArray(Tuning.CAR_COUNT)
    val damageTaken=DoubleArray(Tuning.CAR_COUNT)
    val abilityDamage=DoubleArray(Tuning.CAR_COUNT);val abilityHits=IntArray(Tuning.CAR_COUNT)
    val damageByKind=DoubleArray(DamageKind.entries.size)
    val damageFlashSeconds=DoubleArray(Tuning.CAR_COUNT)
    val wreckSource=IntArray(Tuning.CAR_COUNT){-1}
    val wreckSeconds=DoubleArray(Tuning.CAR_COUNT){-1.0}
    val firstDamageSeconds=DoubleArray(Tuning.CAR_COUNT){-1.0}
    val cashCollected=IntArray(Tuning.CAR_COUNT)
    val sabotageTarget=IntArray(Tuning.CAR_COUNT){-1}
    val repairPickupsTaken=IntArray(Tuning.CAR_COUNT);val ammoPickupsTaken=IntArray(Tuning.CAR_COUNT)
    val shots=IntArray(Weapons.all.size);val hits=IntArray(DamageKind.entries.size);val deaths=IntArray(DamageKind.entries.size)
    val traceSeconds=DoubleArray(Tuning.CAR_COUNT);val traceX=DoubleArray(Tuning.CAR_COUNT);val traceY=DoubleArray(Tuning.CAR_COUNT)
    val traceEndX=DoubleArray(Tuning.CAR_COUNT);val traceEndY=DoubleArray(Tuning.CAR_COUNT)
    val projectiles=Array(CombatRules["projectileCapacity"].toInt()){Projectile()}
    val mines=Array(CombatRules["mineCapacity"].toInt()){Mine()}
    val blasts=Array(CombatRules["blastCapacity"].toInt()){Blast()}
    val pickups: Array<Pickup>
    private val projection=Projection()
    private var activation=0
    var poolExhaustions=0;private set
    var oneShotKills=0;private set
    val armingSeconds get()=max(0.0,CombatRules["startProtectionSeconds"]-world.seconds)
    val wreckCount get(): Int { var count=0;for(i in states.indices)if(world.cars[i].entered && states[i]==LifeState.WRECKED)count++;return count }
    init {
        val point=TrackPoint()
        val sites=world.track.course?.spots?.filter { it.kind=="ammo" || it.kind=="repair" || it.kind=="cash" }
            ?: listOf(TrackSpot("ammo",.3,-3.0),TrackSpot("repair",.7,3.0))
        pickups=sites.map { world.track.sample(world.track.startM+it.fraction*world.track.lengthM,it.laneM,point);Pickup(PickupTypes.all.first { type->type.id==it.kind },point.x,point.y) }.toTypedArray()
    }
    fun health(id: Int)=hp[id]
    fun maxHealth(id: Int)=world.cars[id].maxHp
    fun state(id: Int)=states[id]
    fun wrecked(id: Int)=states[id]==LifeState.WRECKED
    fun ammo(id: Int,weapon: Int)=ammunition[id*Weapons.all.size+weapon]
    fun cooldown(id: Int,weapon: Int)=cooldowns[id*Weapons.all.size+weapon]
    fun capacity(id: Int,weapon: Int): Int {
        if((weapon==Weapons.HAMMER || weapon==Weapons.SCATTER) && world.cars[id].weaponSlots<2)return 0
        return floor(Weapons.all[weapon].ammo*(world.cars[id].carClass?.ammoScale?:1.0)).toInt()+if(weapon==Weapons.HAMMER)max(0,world.cars[id].weaponSlots-2)*CombatRules["heavyExtraAmmoPerSlot"].toInt() else 0
    }
    fun reset() {
        for(i in hp.indices)hp[i]=if(world.cars[i].entered)maxHealth(i)*world.cars[i].startingCondition else 0.0;states.fill(LifeState.ACTIVE);cooldowns.fill(0.0);ramCooldown.fill(0.0);wallCooldown.fill(0.0)
        wreckSource.fill(-1);selectedWeapon.fill(0);kills.fill(0);damageEvents.fill(0);damageDealt.fill(0.0);damageTaken.fill(0.0);damageFlashSeconds.fill(0.0);wreckSeconds.fill(-1.0)
        cashCollected.fill(0);sabotageTarget.fill(-1);firstDamageSeconds.fill(-1.0);repairPickupsTaken.fill(0);ammoPickupsTaken.fill(0)
        abilityDamage.fill(0.0);abilityHits.fill(0);damageByKind.fill(0.0)
        shots.fill(0);hits.fill(0);deaths.fill(0);traceSeconds.fill(0.0);lastTarget.fill(-1);activation=0;poolExhaustions=0;oneShotKills=0
        for(i in world.cars.indices)for(w in Weapons.all.indices)ammunition[i*Weapons.all.size+w]=capacity(i,w)
        for(c in world.cars)if(c.entered && c.utilityMask and (1 shl Consumables.SABOTAGE)!=0) {
            val target=if(c.id==0)1 else 0;sabotageTarget[c.id]=target
            for(w in Weapons.all.indices){val n=target*Weapons.all.size+w;ammunition[n]=floor(ammunition[n]*(1-Consumables.all[Consumables.SABOTAGE].magnitude)).toInt()}
        }
        for(p in projectiles){p.active=false;p.hitMask=0}
        for(m in mines)m.active=false
        for(b in blasts){b.remainingSeconds=0.0;b.hitMask=0}
        for(p in pickups)p.cooldownSeconds=0.0
    }
    fun canAct(id: Int)=world.cars[id].entered && !wrecked(id) && world.cars[id].finishSeconds<0
    internal fun damage(id: Int,raw: Double,source: Int,kind: DamageKind) {
        if(!enabled || !canAct(id) || raw<=0 || armingSeconds>0)return
        val dealt=min(hp[id],raw*world.damageScale*(1-world.cars[id].armorReduction)*(1-world.cars[id].abilityDamageReduction))
        if(dealt>0 && firstDamageSeconds[id]<0)firstDamageSeconds[id]=world.seconds
        val full=hp[id]>=maxHealth(id)
        hp[id]=max(0.0,hp[id]-dealt);damageTaken[id]+=dealt;damageEvents[id]++;hits[kind.ordinal]++
        damageByKind[kind.ordinal]+=dealt
        if(kind==DamageKind.ABILITY && source>=0){abilityDamage[source]+=dealt;abilityHits[source]++}
        damageFlashSeconds[id]=CombatRules["damageFlashSeconds"]
        if(source>=0 && source!=id)damageDealt[source]+=dealt
        if(hp[id]<=0) {
            states[id]=LifeState.WRECKED;wreckSource[id]=source;wreckSeconds[id]=world.seconds;deaths[kind.ordinal]++
            if(full)oneShotKills++
            if(source>=0 && source!=id)kills[source]++
            val c=world.cars[id];c.aiInput.fire=0.0;c.aiInput.mine=0.0;c.aiInput.ability=0.0;c.filteredThrottle=0.0;c.drifting=false;DriftDynamics.reset(c);world.abilities.cancel(c);lastTarget[id]=-1
        }
    }
    private fun repair(id: Int,amount: Double) { if(canAct(id))hp[id]=min(maxHealth(id),hp[id]+amount) }
    /** Ray/swept-disc collision against the same three body circles as the contact solver. */
    internal fun cast(ax: Double,ay: Double,bx: Double,by: Double,target: Car,radius: Double): Double {
        val dx=bx-ax;val dy=by-ay;val a=dx*dx+dy*dy
        if(a<1e-12)return Double.POSITIVE_INFINITY
        var earliest=Double.POSITIVE_INFINITY
        for(end in -1..1) {
            val cx=target.x+cos(target.heading)*target.spec.circleOffsetM*end
            val cy=target.y+sin(target.heading)*target.spec.circleOffsetM*end
            val ox=ax-cx;val oy=ay-cy;val r=radius+target.spec.circleRadiusM
            val c=ox*ox+oy*oy-r*r
            if(c<=0)return 0.0
            val b=ox*dx+oy*dy;val d=b*b-a*c
            if(d>=0) { val t=(-b-sqrt(d))/a;if(t in 0.0..1.0)earliest=min(earliest,t) }
        }
        return earliest
    }
    internal fun inRadius(c: Car,x: Double,y: Double,radius: Double): Boolean {
        val r=radius+c.spec.circleRadiusM
        for(end in -1..1) { val dx=c.x+cos(c.heading)*c.spec.circleOffsetM*end-x;val dy=c.y+sin(c.heading)*c.spec.circleOffsetM*end-y;if(dx*dx+dy*dy<=r*r)return true }
        return false
    }
    private fun muzzleX(c: Car)=c.x+cos(c.heading)*(c.spec.circleOffsetM+c.spec.circleRadiusM)
    private fun muzzleY(c: Car)=c.y+sin(c.heading)*(c.spec.circleOffsetM+c.spec.circleRadiusM)
    /** Same road obstruction test used by guns, ability tells and AI visibility. */
    internal fun roadFraction(x: Double,y: Double,ex: Double,ey: Double,spacingM: Double): Double {
        val dx=ex-x;val dy=ey-y;val checks=ceil(sqrt(dx*dx+dy*dy)/spacingM).toInt().coerceAtLeast(1)
        for(i in 1..checks) {
            val t=i.toDouble()/checks;world.track.project(x+dx*t,y+dy*t,projection)
            if(abs(projection.distance)>world.track.widthAt(projection.s))return (i-1).toDouble()/checks
        }
        return 1.0
    }
    fun fire(id: Int,weapon: Int): Boolean {
        if(!enabled || !canAct(id) || weapon !in Weapons.all.indices || armingSeconds>0 || world.cars[id].ability.weaponsLocked)return false
        val n=id*Weapons.all.size+weapon
        if(ammunition[n]<=0 || cooldowns[n]>1e-9)return false
        val c=world.cars[id];val w=Weapons.all[weapon]
        if(weapon==Weapons.MINE) {
            var free: Mine?=null;for(m in mines)if(!m.active){free=m;break}
            if(free==null){poolExhaustions++;return false}
            val rear=c.spec.circleOffsetM+c.spec.circleRadiusM+CombatRules["dropClearanceM"]
            free.active=true;free.owner=id;free.x=c.x-cos(c.heading)*rear;free.y=c.y-sin(c.heading)*rear;free.ageSeconds=0.0;free.activation=++activation
        } else if(weapon==Weapons.HAMMER) {
            var free: Projectile?=null;for(p in projectiles)if(!p.active){free=p;break}
            if(free==null){poolExhaustions++;return false}
            free.active=true;free.owner=id;free.x=muzzleX(c);free.y=muzzleY(c);free.vx=cos(c.heading)*w.speedMps;free.vy=sin(c.heading)*w.speedMps;free.remainingM=w.rangeM;free.remainingSeconds=w.lifeSeconds;free.hitMask=0
        } else {
            val rays=if(weapon==Weapons.SCATTER)CombatRules["scatterRays"].toInt() else 1
            var hitMask=0
            for(ray in 0 until rays) {
                val angle=c.heading+if(rays==1)0.0 else (ray.toDouble()/(rays-1)*2-1)*CombatRules["scatterHalfAngleRadians"]
                val x=muzzleX(c);val y=muzzleY(c);val ex=x+cos(angle)*w.rangeM;val ey=y+sin(angle)*w.rangeM
                var target=-1;var time=1.0
                for(o in world.cars)if(o.id!=id && canAct(o.id)) { val t=cast(x,y,ex,ey,o,w.radiusM);if(t<time){target=o.id;time=t} }
                val checks=ceil(w.rangeM/c.spec.circleRadiusM).toInt()
                for(i in 1..checks) { val t=i.toDouble()/checks;if(t>=time)break;world.track.project(x+(ex-x)*t,y+(ey-y)*t,projection);if(abs(projection.distance)>world.track.widthAt(projection.s)){time=t;target=-1;break} }
                if(target>=0 && hitMask and (1 shl target)==0){hitMask=hitMask or (1 shl target);damage(target,w.damage*c.weaponDamageScale,id,if(weapon==Weapons.SCATTER)DamageKind.SCATTER else DamageKind.RIVET)}
                if(ray==rays/2){traceX[id]=x;traceY[id]=y;traceEndX[id]=x+(ex-x)*time;traceEndY[id]=y+(ey-y)*time;traceSeconds[id]=w.lifeSeconds}
            }
        }
        ammunition[n]--;cooldowns[n]=w.cooldownSeconds;shots[weapon]++;return true
    }
    private fun explode(m: Mine) {
        m.active=false
        val w=Weapons.all[Weapons.MINE]
        var visual: Blast?=null;for(b in blasts)if(b.remainingSeconds<=0){visual=b;break}
        if(visual==null)poolExhaustions++ else {
            visual.x=m.x;visual.y=m.y;visual.radiusM=w.radiusM;visual.remainingSeconds=w.traceSeconds;visual.hitMask=0;visual.activation=m.activation
        }
        // One activation resolves once; lingering blast visuals never reapply damage.
        for(c in world.cars)if(canAct(c.id) && inRadius(c,m.x,m.y,w.radiusM)) {
            if(visual!=null)visual.hitMask=visual.hitMask or (1 shl c.id)
            damage(c.id,w.damage*world.cars[m.owner].weaponDamageScale,m.owner,DamageKind.MINE)
        }
    }
    /** Called only on the driver's existing perception/reaction cadence. */
    fun think(c: Car) {
        if(!enabled || !canAct(c.id)){c.aiInput.fire=0.0;c.aiInput.mine=0.0;return}
        var target=-1;var distance=Weapons.all[Weapons.RIVET].rangeM*(c.aiStyle?.fireRangeScale?:1.0);var chaser=false
        val cx=cos(c.heading);val cy=sin(c.heading)
        for(o in world.cars)if(o!==c && canAct(o.id)) {
            val dx=o.x-c.x;val dy=o.y-c.y;val along=dx*cx+dy*cy;val side=abs(-dx*cy+dy*cx)
            if(along>0 && along<distance && side<o.spec.circleRadiusM+along*CombatRules["aiForwardConeRadians"]) {
                var attackers=0;for(i in lastTarget.indices)if(i!=c.id && lastTarget[i]==o.id && canAct(i))attackers++
                if(attackers<CombatRules["aiMaxAttackers"]){target=o.id;distance=along}
            }
            if(along<0 && -along<CombatRules["aiChaserRangeM"] && side<c.spec.circleRadiusM*2*CombatRules["aiChaserCarWidths"])chaser=true
        }
        lastTarget[c.id]=target
        c.aiInput.fire=if(target>=0)1.0 else 0.0
        c.aiInput.mine=if(chaser && c.aiSkill?.mines!=false && c.aiStyle?.mines!=false)1.0 else 0.0
        c.aiCombatReason=if(c.aiInput.mine>0)2 else if(target>=0)1 else 0
        c.aiInput.weapon=if(target>=0 && distance<Weapons.all[Weapons.SCATTER].rangeM && ammo(c.id,Weapons.SCATTER)>0)Weapons.SCATTER else if(target>=0 && distance>CombatRules["aiHeavyMinRangeM"]*(c.aiStyle?.heavyRangeScale?:1.0) && ammo(c.id,Weapons.HAMMER)>0)Weapons.HAMMER else Weapons.RIVET
    }
    fun seekRepair(c: Car,lane: Double): Double {
        c.aiPickupTarget=-1
        if(!enabled || c.aiSkill?.seekRepairs!=true || health(c.id)>maxHealth(c.id)*Career["repairSeekHpFraction"])return lane
        var closest=Career["repairSeekDistanceM"];var chosen=lane
        for(i in pickups.indices) {
            val p=pickups[i];if(p.type.id!="repair" || p.cooldownSeconds>0)continue
            val dx=p.x-c.x;val dy=p.y-c.y;val ahead=dx*cos(c.heading)+dy*sin(c.heading)
            if(ahead>c.spec.circleOffsetM+c.spec.circleRadiusM && dx*dx+dy*dy<closest*closest) {
                world.track.project(p.x,p.y,projection)
                if(abs(projection.distance)<=world.track.widthAt(projection.s)*Career["repairSeekLaneLimitFraction"]) { closest=sqrt(dx*dx+dy*dy);chosen=projection.distance;c.aiPickupTarget=i }
            }
        }
        return chosen
    }
    fun avoidMine(c: Car,s: Double,lane: Double): Double {
        if(!enabled || c.aiSkill?.avoidMines==false)return lane
        for(m in mines)if(m.active && m.ageSeconds>=Weapons.all[Weapons.MINE].armingSeconds) {
            val dx=m.x-c.x;val dy=m.y-c.y;val ahead=dx*cos(c.heading)+dy*sin(c.heading)
            if(ahead>0 && ahead<CombatRules["aiMineAvoidDistanceM"] && dx*dx+dy*dy<CombatRules["aiMineAvoidDistanceM"]*CombatRules["aiMineAvoidDistanceM"]) {
                world.track.project(m.x,m.y,projection)
                val margin=Weapons.all[Weapons.MINE].radiusM+c.spec.circleRadiusM+CombatRules["aiMineAvoidMarginM"]
                return if(projection.distance>=lane)projection.distance-margin else projection.distance+margin
            }
        }
        return lane
    }
    fun step(inputs: Array<InputFrame>,dt: Double) {
        if(!enabled)return
        for(i in cooldowns.indices)cooldowns[i]=max(0.0,cooldowns[i]-dt)
        for(i in ramCooldown.indices)ramCooldown[i]=max(0.0,ramCooldown[i]-dt)
        for(i in wallCooldown.indices){wallCooldown[i]=max(0.0,wallCooldown[i]-dt);damageFlashSeconds[i]=max(0.0,damageFlashSeconds[i]-dt);traceSeconds[i]=max(0.0,traceSeconds[i]-dt)}
        for(b in blasts)b.remainingSeconds=max(0.0,b.remainingSeconds-dt)
        for(i in world.cars.indices) {
            val c=world.cars[i]
            if(!canAct(i))continue
            if(c.wallImpactMps>CombatRules["wallMinImpactMps"] && wallCooldown[i]<=0) { damage(i,(c.wallImpactMps-CombatRules["wallMinImpactMps"])*CombatRules["wallDamagePerMps"],-1,DamageKind.WALL);wallCooldown[i]=CombatRules["wallCooldownSeconds"] }
            for(j in i+1 until world.cars.size) {
                val pair=i*Tuning.CAR_COUNT+j;val closing=world.ramClosingMps[pair]
                if(closing>0 && ramCooldown[pair]<=0) {
                    val other=world.cars[j];val total=c.spec.massKg+other.spec.massKg
                    val raw=min(CombatRules["ramMaxDamage"],closing*CombatRules["ramDamagePerMps"])
                    damage(i,raw*other.spec.massKg/total*(if(other.utilityMask and 1!=0)Consumables.all[Consumables.SPIKES].magnitude else 1.0),j,DamageKind.RAM);damage(j,raw*c.spec.massKg/total*(if(c.utilityMask and 1!=0)Consumables.all[Consumables.SPIKES].magnitude else 1.0),i,DamageKind.RAM);ramCooldown[pair]=CombatRules["ramCooldownSeconds"]
                }
            }
            val input=if(c.human)inputs[i] else c.aiInput
            selectedWeapon[i]=if(input.weapon==Weapons.SCATTER && c.weaponSlots>=2)Weapons.SCATTER else if(input.weapon==Weapons.HAMMER && c.weaponSlots>=2)Weapons.HAMMER else Weapons.RIVET
            if(input.fire>0)fire(i,selectedWeapon[i])
            if(input.mine>0)fire(i,Weapons.MINE)
        }
        val hammer=Weapons.all[Weapons.HAMMER]
        for(p in projectiles)if(p.active) {
            val distance=min(p.remainingM,hammer.speedMps*dt);val factor=distance/hammer.speedMps
            val nx=p.x+p.vx*factor;val ny=p.y+p.vy*factor
            var target=-1;var time=Double.POSITIVE_INFINITY
            for(c in world.cars)if(c.id!=p.owner && canAct(c.id) && p.hitMask and (1 shl c.id)==0) { val t=cast(p.x,p.y,nx,ny,c,hammer.radiusM);if(t<time){target=c.id;time=t} }
            if(target>=0){p.hitMask=p.hitMask or (1 shl target);damage(target,hammer.damage*world.cars[p.owner].weaponDamageScale,p.owner,DamageKind.HAMMER);p.active=false}
            p.x=nx;p.y=ny;p.remainingM-=distance;p.remainingSeconds-=dt
            world.track.project(nx,ny,projection)
            if(p.remainingM<=0 || p.remainingSeconds<=0 || abs(projection.distance)>world.track.widthAt(projection.s))p.active=false
        }
        val mine=Weapons.all[Weapons.MINE]
        for(m in mines)if(m.active) {
            m.ageSeconds+=dt
            if(m.ageSeconds>=mine.lifeSeconds){m.active=false;continue}
            if(m.ageSeconds>=mine.armingSeconds)for(c in world.cars)if(canAct(c.id) && inRadius(c,m.x,m.y,CombatRules["mineTriggerRadiusM"])) { explode(m);break }
        }
        for(p in pickups) {
            p.cooldownSeconds=max(0.0,p.cooldownSeconds-dt)
            if(p.cooldownSeconds>0)continue
            for(c in world.cars)if(canAct(c.id) && inRadius(c,p.x,p.y,p.type.radiusM)) {
                if(p.type.id=="repair") { if(hp[c.id]>=maxHealth(c.id))continue;repair(c.id,p.type.amount);repairPickupsTaken[c.id]++ }
                else if(p.type.id=="cash") { if(cashCollected[c.id]>=MarketRules["raceCashCap"])continue;cashCollected[c.id]=min(MarketRules["raceCashCap"].toInt(),cashCollected[c.id]+p.type.amount.toInt()) }
                else {
                    var missing=false
                    for(w in Weapons.all.indices)if(ammo(c.id,w)<capacity(c.id,w))missing=true
                    if(!missing)continue
                    for(w in Weapons.all.indices) { val n=c.id*Weapons.all.size+w;ammunition[n]=min(capacity(c.id,w),ammunition[n]+if(w==Weapons.RIVET)p.type.amount.toInt() else 1) }
                    ammoPickupsTaken[c.id]++
                }
                p.cooldownSeconds=p.type.respawnSeconds;break
            }
        }
    }
    fun appendHash(initial: Long): Long {
        var h=initial
        for(i in hp.indices){h=31*h+hp[i].toBits();h=31*h+states[i].ordinal;h=31*h+kills[i]}
        for(i in ammunition.indices){h=31*h+ammunition[i];h=31*h+cooldowns[i].toBits()}
        for(p in projectiles)if(p.active){h=31*h+p.x.toBits();h=31*h+p.y.toBits();h=31*h+p.remainingM.toBits();h=31*h+p.remainingSeconds.toBits();h=31*h+p.owner;h=31*h+p.hitMask}
        for(m in mines)if(m.active){h=31*h+m.x.toBits();h=31*h+m.y.toBits();h=31*h+m.ageSeconds.toBits();h=31*h+m.owner;h=31*h+m.activation}
        for(p in pickups)h=31*h+p.cooldownSeconds.toBits()
        for(c in ramCooldown)h=31*h+c.toBits()
        for(c in wallCooldown)h=31*h+c.toBits()
        for(c in cashCollected)h=31*h+c
        for(c in wreckSource)h=31*h+c
        return h
    }
}
