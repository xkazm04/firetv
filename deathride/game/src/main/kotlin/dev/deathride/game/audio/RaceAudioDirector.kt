package dev.deathride.game.audio

import dev.deathride.core.*
import kotlin.math.*

/** Converts actual simulation edges to cues; never writes car/input/haptic state. */
class RaceAudioDirector(val cues: CueService) {
    private var world: World?=null
    private var phase="lobby"
    private var lastCountdown=-1
    private var lastSeconds=0.0
    private val laps=IntArray(Tuning.CAR_COUNT)
    private val low=BooleanArray(Tuning.CAR_COUNT)
    private val ready=BooleanArray(Tuning.CAR_COUNT)
    private val empty=BooleanArray(Tuning.CAR_COUNT)
    private val positions=IntArray(Tuning.CAR_COUNT)
    private val candidatePosition=IntArray(Tuning.CAR_COUNT)
    private val positionHold=DoubleArray(Tuning.CAR_COUNT)
    private var movement=""
    private var movementCar=-1

    fun bind(next: World){
        world?.presentationEvents?.enabled=false
        world=next;next.presentationEvents.enabled=true;next.presentationEvents.clear()
        resetEdges(next);cues.sceneChanged()
    }
    private fun resetEdges(w: World){
        lastSeconds=w.seconds;lastCountdown=-1;movement="";movementCar=-1
        for(c in w.cars){laps[c.id]=c.lap.laps;low[c.id]=false;ready[c.id]=true;empty[c.id]=false
            positions[c.id]=c.position;candidatePosition[c.id]=c.position;positionHold[c.id]=0.0}
    }
    fun sceneChanged(next: String){
        if(next==phase)return
        phase=next;cues.sceneChanged();world?.let{resetEdges(it);it.presentationEvents.clear()}
        when(next){
            "race"->{
                cues.play("race.start");cues.play("music.hunt")
                if(world?.eventType==EventType.ELIMINATION)cues.narrate("voice.announcer.duel")
            }
            "lobby","garage","career"->cues.play("music.lobby")
        }
    }
    fun results(w: World){
        val drivers=w.cars.filter{it.entered && it.human}
        if(drivers.isEmpty())return // A spectator is not a defeated entrant.
        cues.play(if(drivers.any{it.position==1 && !w.combat.wrecked(it.id) && it.finishSeconds>=0})"race.victory" else "race.defeat")
    }
    fun update(w: World,phase: String,sceneReady: Boolean,countdown: Double,dt: Double){
        if(world!==w)bind(w)
        sceneChanged(phase)
        cues.update(dt)
        if(w.seconds<lastSeconds){if(phase=="race")cues.sceneChanged();resetEdges(w)}
        lastSeconds=w.seconds
        if(!sceneReady){cues.stopGroup("engine");cues.stopGroup("movement");w.presentationEvents.clear();return}
        if(phase=="countdown"){
            val count=ceil(countdown).toInt().coerceIn(1,3)
            if(count!=lastCountdown){cues.play("race.countdown",eventId=0);lastCountdown=count}
        }
        if(phase!="race"){w.presentationEvents.clear();return}
        val locals=w.cars.filter{it.entered && it.human && !w.combat.wrecked(it.id) && it.finishSeconds<0}
        val listener=locals.firstOrNull()?:w.cars.firstOrNull{it.entered && !w.combat.wrecked(it.id)}?:w.cars[0]
        cues.listenerX=listener.x;cues.listenerY=listener.y
        // Prefer both local seats; spectator gets one leader engine. No full AI bed.
        val audible=if(locals.isEmpty())listOf(listener) else locals.take(2)
        for(c in w.cars){
            if(c in audible && !w.combat.wrecked(c.id) && c.finishSeconds<0){
                val speed=(c.speedMps/c.spec.maxSpeedMps).coerceIn(0.0,1.0)
                cues.play("engine.base",c.id,x=c.x,y=c.y,gain=(.35+.65*speed).toFloat(),pitch=(.8+.7*speed).toFloat())
            }else cues.stopCue("engine.base",c.id)
        }
        val rolling=locals.firstOrNull()?:listener
        val newMovement=when{
            w.combat.wrecked(rolling.id) || rolling.finishSeconds>=0 || rolling.speedMps<2.0->""
            rolling.drifting->"movement.drift"
            rolling.spunOut || abs(rolling.slipRadians)>.22->"movement.skid"
            else->"movement.tyre"
        }
        if(newMovement!=movement || movementCar!=rolling.id){cues.stopGroup("movement");movement=newMovement;movementCar=rolling.id}
        if(movement.isNotEmpty())cues.play(movement,rolling.id,x=rolling.x,y=rolling.y,gain=(rolling.speedMps/20).toFloat().coerceIn(.15f,1f))
        while(true){
            val event=w.presentationEvents.poll()?:break
            if(w.seconds-event.seconds>.25)continue // Never queue stale combat feedback.
            val actor=w.cars.getOrNull(event.actor)
            val id=when(event.kind){
                PresentationKind.FIRE->when(event.detail){Weapons.RIVET->"weapon.rivet.fire";Weapons.HAMMER->"weapon.hammer.fire";Weapons.MINE->"weapon.mine.drop";else->"weapon.scatter.fire"}
                PresentationKind.HIT->if(event.detail==DamageKind.HAMMER.ordinal)"weapon.hammer.hit" else "weapon.rivet.hit"
                PresentationKind.MINE_ARM->"weapon.mine.arm"
                PresentationKind.MINE_BLAST->"weapon.mine.blast"
                PresentationKind.CAR_CONTACT->"collision.car"
                PresentationKind.WALL_CONTACT->"collision.wall"
                PresentationKind.BARRIER_CONTACT->"collision.barrier"
                PresentationKind.PICKUP->{if(actor?.human!=true)continue;when(event.detail){1->"pickup.repair";2->"pickup.cash";else->"pickup.ammo"}}
                PresentationKind.WRECK->{cues.stopCue("engine.base",event.actor);if(movementCar==event.actor)cues.stopGroup("movement");"race.wreck"}
                PresentationKind.ABILITY->{val definition=actor?.ability?.definition?:continue;abilityCue(definition)}
            }
            val emitter=if(event.kind==PresentationKind.CAR_CONTACT)event.actor*Tuning.CAR_COUNT+event.target else event.actor
            val gain=if(event.kind==PresentationKind.CAR_CONTACT || event.kind==PresentationKind.WALL_CONTACT)(event.strength/12).toFloat().coerceIn(.25f,1f) else 1f
            cues.play(id,emitter,event.serial,event.x,event.y,gain)
        }
        for(c in w.cars)if(c.entered && c.human){
            val id=c.id
            if(w.eventType==EventType.LAPS && c.lap.laps>laps[id] && c.finishSeconds<0)cues.play("race.lap",id)
            laps[id]=c.lap.laps
            val hp=w.combat.health(id)/w.combat.maxHealth(id)
            if(hp>.35)low[id]=false
            if(hp in .00001..<.25 && !low[id]){cues.play("race.low-hp",id);low[id]=true}
            val a=c.ability;val d=a.definition
            val nowReady=d!=null && a.phase==AbilityPhase.READY && a.cooldownSeconds<=0 && a.energy>=d.energyCost
            if(nowReady && !ready[id])cues.play("race.ability-ready",id)
            ready[id]=nowReady
            val noAmmo=w.combat.ammo(id,w.combat.selectedWeapon[id])==0
            if(noAmmo && !empty[id])cues.play("race.empty",id)
            empty[id]=noAmmo
            if(candidatePosition[id]!=c.position){candidatePosition[id]=c.position;positionHold[id]=0.0}
            else positionHold[id]+=dt
            if(w.eventType==EventType.LAPS && positionHold[id]>=.75 && positions[id]!=c.position){cues.play("race.position",id);positions[id]=c.position}
        }
    }
    fun pause(){world?.presentationEvents?.clear();cues.pause()}
    fun resume(){world?.let{resetEdges(it);it.presentationEvents.clear()};cues.resume()}
    companion object {
        // The rig has no commissioned signature clip. Reuse the accepted rear-rack tell.
        fun abilityCue(definition: AbilityDefinition)=
            if(definition.kind==AbilityKind.DISPATCHER)"ability.bone-rack" else "ability.${definition.id}"
    }
}
