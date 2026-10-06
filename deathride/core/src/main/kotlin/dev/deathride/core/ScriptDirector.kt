package dev.deathride.core

import kotlin.math.hypot

/** One on-screen caption. Priority: scenes (0) are queued in order, barks (1) only play when the screen is quiet. */
class ScriptCaption(val id: String,val speaker: String,val text: String,val seconds: Double,val priority: Int=0) {
    /** The speaker's name leads the line; the card voice (captions of what the camera sees) has none. */
    val display get()=if(speaker=="card")text else "${Script.speakerName(speaker)}: $text"
}

/** Turns campaign state and observed race edges into timed captions from narrative/lines.csv. Audio-free and
 * observational: it reads the Profile and World, never writes to either, and holds no wall clock (callers pass dt). */
class ScriptDirector {
    private val queue=ArrayDeque<ScriptCaption>()
    var current: ScriptCaption?=null; private set
    private var remaining=0.0
    /** Changes whenever the visible caption changes, so a renderer can rebuild text only then. */
    var serial=0; private set
    private val shown=HashMap<String,Int>()
    private val scenesSeen=HashSet<String>()
    private var retryRound=-1
    var retries=0; private set
    private var lastPhase=""
    // race edge state
    private var raceStarted=false;private var raceClock=0.0;private var lastBark=-99.0;private var barkCount=0
    private val spokeAt=HashMap<String,Double>()
    private val aheadOfPlayer=BooleanArray(Tuning.CAR_COUNT);private val flipHold=DoubleArray(Tuning.CAR_COUNT)
    private val wasWrecked=BooleanArray(Tuning.CAR_COUNT);private val wasLow=BooleanArray(Tuning.CAR_COUNT)
    private val lastTaken=DoubleArray(Tuning.CAR_COUNT);private val lastDealt=DoubleArray(Tuning.CAR_COUNT);private var lastMine=0.0
    private var lastLap=0;private val nearDone=HashSet<Int>()

    val caption: String get()=current?.display?:""

    fun clear() { queue.clear();current=null;remaining=0.0;serial++ }
    val idle get()=current==null && queue.isEmpty()
    fun pending(): List<ScriptCaption> = listOfNotNull(current)+queue

    fun update(dt: Double) {
        if(current!=null) {
            remaining-=dt
            if(remaining>0)return
            current=null;serial++
        }
        val next=queue.removeFirstOrNull()?:return
        current=next;remaining=next.seconds;serial++
    }
    private fun push(line: ScriptLine,priority: Int=0) {
        shown[line.id]=(shown[line.id]?:0)+1
        queue.addLast(ScriptCaption(line.id,line.speaker,line.text,(line.durationSeconds+1.5).coerceIn(3.0,8.0),priority))
        if(current==null)update(0.0)
    }
    private fun pushAll(lines: List<ScriptLine>)=lines.forEach{push(it)}

    // ---- facts -------------------------------------------------------------------------------------------------

    fun careerFacts(p: Profile,round: Int=p.careerRound): ScriptFacts {
        val event=Career.events[round];val f=ScriptFacts()
        f.set("act",event.cupIndex+1);f.set("race",Career.events.subList(0,round+1).count{it.cupIndex==event.cupIndex})
        f.set("retry",if(round==retryRound)retries else 0)
        if(event.boss)f.flag("boss-race")
        for((i,r) in Career.rivals.withIndex()) {
            val ally=Campaign.taunt(p,r.id)!=null
            if(ally)f.set(r.id,"ally") else f.set(r.id,"rival")
            if(p.grudges[i]>0)f.set(r.id,"grudge")
        }
        if(p.campaign.initial>0 && p.campaign.debt==0L)f.set("debt","paid")
        if(p.campaign.exposed)f.flag("levy-exposed")
        if(DeathDuel.seized(p))f.flag("seized")
        if(round==Career.events.indexOfFirst{it.id=="crown-2"})f.flag("first-marrow")
        if(p.careerCleared>Career.events.indexOfFirst{it.id=="crown-3"})f.flag("voice-corrected")
        f.set("player-car",CarCatalog.all[p.selectedCar].id.lowercase())
        // The career screen is where the shop and the hut are met before the race, so both scenes are in play.
        f.set("scene","shop").set("scene","hut")
        return f
    }

    // ---- career screen -----------------------------------------------------------------------------------------

    /** Pre-race scene (or the pending ally payout offer) for the career screen. Each scene shows once per retry. */
    fun careerOpened(p: Profile) {
        val round=p.careerRound;val event=Career.events[round];clear()
        val facts=careerFacts(p,round)
        val pending=Campaign.pending(p)
        if(pending>=0) {
            val ally=Campaign.allies[pending]
            if(scenesSeen.add("offer:${ally.id}"))pushAll(Script.scene(setOf("post"),ally.event,setOf("payout-offer"),facts,shown,limit=1))
            return
        }
        val retry=if(round==retryRound)retries else 0
        if(!scenesSeen.add("career:${event.id}:$retry:${DeathDuel.seized(p)}"))return
        if(event.elimination && DeathDuel.seized(p)) {
            if(retry==0)pushAll(Script.scene(setOf("announcer","shop"),event.id,setOf("seizure"),facts,shown,limit=7))
            else pushAll(Script.scene(setOf("finale"),event.id,setOf("duel-retry"),facts,shown,limit=2))
            return
        }
        pushAll(Script.scene(setOf("pre","announcer"),event.id,setOf("pre-race"),facts,shown,limit=3))
    }
    fun payoutChosen(p: Profile,allyIndex: Int,choice: String) {
        val facts=careerFacts(p).set("payout",choice)
        pushAll(Script.scene(setOf("post"),Campaign.allies[allyIndex].event,setOf("payout-chosen"),facts,shown,limit=1))
    }

    // ---- race --------------------------------------------------------------------------------------------------

    /** Call once per rendered frame with the current scene name. Captions appear for campaign races only. */
    fun frame(phase: String,campaignRace: Boolean,p: Profile,round: Int,world: World,dt: Double) {
        if(phase!=lastPhase) {
            if(phase=="countdown" || phase=="lobby" || phase=="garage")clear()
            if(phase=="race")beginRace(world)
            if(phase!="race")raceStarted=false
            lastPhase=phase
        }
        if(phase=="race" && campaignRace) {
            if(!raceStarted){raceStarted=true;startRaceScene(world,p,round)}
            raceClock+=dt;watch(world,p,round,dt)
        }
        update(dt)
    }
    private fun beginRace(world: World) {
        raceStarted=false;raceClock=0.0;lastBark=-99.0;barkCount=0;spokeAt.clear();nearDone.clear();lastLap=0
        aheadOfPlayer.fill(false);flipHold.fill(0.0);wasWrecked.fill(false);wasLow.fill(false);lastTaken.fill(0.0);lastDealt.fill(0.0);lastMine=0.0
        for(c in world.cars)aheadOfPlayer[c.id]=c.position<world.cars[0].position
    }
    private fun startRaceScene(world: World,p: Profile,round: Int) {
        val event=Career.events[round];val facts=careerFacts(p,round)
        if(event.elimination) {
            pushAll(Script.scene(setOf("finale"),event.id,setOf("duel-start"),facts,shown,limit=3));return
        }
        pushAll(Script.scene(setOf("announcer"),event.id,setOf("race-start"),facts,shown,limit=1,specificFirst=true))
        // One rival greets the grid: the division boss first, then whoever else is on it.
        val cast=RivalEconomy.cast(round).map{Career.rivals[it].id}
        val order=cast.filter{id->world.cars.any{it.aiStyle?.id==id}}
        for(id in order)if(bark(id,"grid",facts,event.id,minGap=0.0,needIdle=false))break
    }
    private fun rivalCars(world: World)=world.cars.filter{it.entered && !it.human && it.aiStyle!=null}
    private fun watch(world: World,p: Profile,round: Int,dt: Double) {
        val player=world.cars[0];if(!player.entered)return
        val combat=world.combat;val event=Career.events[round]
        val facts=careerFacts(p,round)
        if(raceClock<4.0){for(c in world.cars)aheadOfPlayer[c.id]=c.position<player.position;lastTaken.indices.forEach{lastTaken[it]=combat.damageTaken[it];lastDealt[it]=combat.damageDealt[it]};return}
        val mine=combat.damageByKind[DamageKind.MINE.ordinal];val mineDelta=mine-lastMine;lastMine=mine
        val playerDealt=combat.damageDealt[player.id]-lastDealt[player.id]
        for(r in rivalCars(world)) {
            val id=r.aiStyle!!.id;val rf=facts.copy()
            if(r.position==1)rf.flag("leading")
            val ahead=r.position<player.position
            if(ahead!=aheadOfPlayer[r.id]) {
                flipHold[r.id]+=dt
            } else flipHold[r.id]=0.0
            if(flipHold[r.id]>=.75) {
                aheadOfPlayer[r.id]=ahead;flipHold[r.id]=0.0
                bark(id,if(ahead)"overtakes-player" else "overtaken-by-player",rf,event.id)
            }
            val taken=combat.damageTaken[r.id]-lastTaken[r.id]
            if(taken>0 && playerDealt>0 && !combat.wrecked(r.id))bark(id,if(mineDelta>0)"mine-hit" else "hit-by-player",rf,event.id)
            if(combat.wrecked(r.id) && !wasWrecked[r.id]) {wasWrecked[r.id]=true;if(combat.wreckSource[r.id]==player.id)bark(id,"wrecked-by-player",rf,event.id,minGap=0.0)}
            val low=combat.health(r.id)<combat.maxHealth(r.id)*.25
            if(low && !wasLow[r.id] && !combat.wrecked(r.id)) {wasLow[r.id]=true;bark(id,"low-hp",rf,event.id)}
            if(!combat.wrecked(player.id) && !combat.wrecked(r.id) && hypot(r.x-player.x,r.y-player.y)<9.0 && nearDone.add(r.id))bark(id,"near-player",rf,event.id)
        }
        for(c in world.cars){lastTaken[c.id]=combat.damageTaken[c.id];lastDealt[c.id]=combat.damageDealt[c.id]}
        if(combat.wrecked(player.id) && !wasWrecked[player.id]) {
            wasWrecked[player.id]=true
            val killer=world.cars.getOrNull(combat.wreckSource[player.id])?.aiStyle?.id
            if(killer!=null)bark(killer,"wrecks-player",facts.copy(),event.id,minGap=0.0)
        }
        if(world.raceLaps>1 && player.lap.laps==world.raceLaps-1 && lastLap!=player.lap.laps) {
            lastLap=player.lap.laps
            for(r in rivalCars(world).sortedBy{it.position}) {
                val rf=facts.copy();if(r.position==1)rf.flag("leading")
                if(bark(r.aiStyle!!.id,"last-lap",rf,event.id,minGap=0.0))break
            }
        }
        // Near-rival: a rival speaks about another rival close to it. Once per ordered pair per race.
        val rivals=rivalCars(world)
        for(a in rivals)for(b in rivals)if(a!==b && hypot(a.x-b.x,a.y-b.y)<9.0 && nearDone.add(100+a.id*10+b.id)) {
            val rf=facts.copy().set("rival",b.aiStyle!!.id);if(bark(a.aiStyle!!.id,"near-rival",rf,event.id))return
        }
    }
    /** Speak one bark for [speaker] on [trigger] if the screen is quiet and cooldowns allow. Returns whether it spoke. */
    private fun bark(speaker: String,trigger: String,facts: ScriptFacts,event: String,minGap: Double=6.0,needIdle: Boolean=true): Boolean {
        if(raceClock-lastBark<minGap || barkCount>=14 || needIdle && !idle)return false
        val key="$speaker/$trigger"
        if((spokeAt[key]?:-99.0)+25.0>raceClock)return false
        val repeated=(spokeAt[key]!=null)
        val f=facts.copy();if(repeated)f.flag("repeat")
        val options=Script.lines.filter{it.usable && it.kind in BARK_KINDS && it.speaker==speaker && it.trigger==trigger && (it.event=="any" || it.event==event) && f.satisfied(it)}
        if(options.isEmpty())return false
        val line=Script.pickBest(options,shown)
        spokeAt[key]=raceClock;lastBark=raceClock;barkCount++
        push(line,priority=1);return true
    }

    // ---- results screen ----------------------------------------------------------------------------------------

    /** After settlement: the announcer's finish call, then the boss turn or loss, then any post-race hut scene. */
    fun raceFinished(world: World,p: Profile,round: Int,campaignRace: Boolean,advanced: Boolean) {
        clear()
        if(!campaignRace)return
        if(advanced)retryRound=-1 else {retries=if(round==retryRound)retries+1 else 1;retryRound=round}
        val event=Career.events[round];val player=world.cars[0];val combat=world.combat
        val facts=careerFacts(p,round)
        val boss=world.cars.firstOrNull{it.aiStyle?.id==Career.rivals[Career.bossIndex(round)].id}
        val won=player.position==1 && !combat.wrecked(player.id) && player.finishSeconds>=0
        facts.set("result",if(combat.wrecked(player.id))"wrecked" else if(won)"win" else "loss")
        if(!combat.wrecked(player.id) && !won)facts.set("result","loss")
        if(combat.damageTaken[player.id]==0.0)facts.flag("clean")
        if(boss!=null){if(combat.wrecked(boss.id))facts.flag("boss-wrecked") else if(boss.finishSeconds>=0)facts.flag("boss-finished")}
        if(event.elimination) {
            val lines=Script.scene(setOf("finale"),event.id,setOf(if(world.duelDraw)"duel-draw" else if(advanced)"duel-win" else "duel-loss"),facts,shown,limit=4)
            pushAll(lines);return
        }
        pushAll(Script.scene(setOf("announcer"),event.id,setOf("finish"),facts,shown,limit=1,specificFirst=true))
        if(event.boss)pushAll(Script.scene(setOf("post"),event.id,setOf(if(advanced)"boss-turn" else "boss-loss"),facts,shown,limit=3))
        pushAll(Script.scene(setOf("pre"),event.id,setOf("post-race"),facts,shown,limit=2))
        // One rival has the last word on the grid they beat or lost to.
        val top=world.cars.filter{it.entered && it.aiStyle!=null}.minByOrNull{it.position}
        val speaker=top?.aiStyle?.id
        if(top!=null && speaker!=null) {
            val trigger=if(top.position<player.position)"finish-ahead" else "finish-behind"
            val options=Script.lines.filter{it.usable && it.kind in BARK_KINDS && it.speaker==speaker && it.trigger==trigger && (it.event=="any" || it.event==event.id) && facts.satisfied(it)}
            if(options.isNotEmpty())push(Script.pickBest(options,shown),priority=1)
        }
    }
    companion object { val BARK_KINDS=setOf("bark","taunt") }
}
