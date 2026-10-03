package dev.deathride.core

import kotlin.math.*

class AiSkill(row: Map<String,String>) {
    val id=row.getValue("id");val reactionSteps=row.number("reactionSteps").toInt()
    val lookAheadSeconds=row.number("lookAheadSeconds");val cornerMarginMps=row.number("cornerMarginMps");val laneErrorM=row.number("laneErrorM")
    val mines=row.number("mines")!=0.0;val avoidMines=row.number("avoidMines")!=0.0;val seekRepairs=row.number("seekRepairs")!=0.0
    init { require(reactionSteps>0 && lookAheadSeconds>0 && cornerMarginMps>=0 && laneErrorM>=0) }
}
object AiSkills { val all=Content.table("ai-skills").map{AiSkill(it)};val legacy=all.filter{it.id.startsWith("legacy")}.toTypedArray() }
class Difficulty(row: Map<String,String>) {
    val id=row.getValue("id");val name=row.getValue("name");val skill=AiSkills.all.single{it.id==row.getValue("skill")}
    val rewardScale=row.number("rewardScale");val description=row.getValue("description")
    init { require(rewardScale>=1.0) }
    val json="{\"id\":\"$id\",\"name\":\"$name\",\"description\":\"$description\",\"rewardScale\":$rewardScale}"
}
class Rival(val values: Map<String,String>) {
    private val row=values
    val id=row.getValue("id");val name=row.getValue("name");val carIndex=CarCatalog.all.indexOfFirst{it.id==row.getValue("car")}
    val style=row.getValue("style");val laneBiasM=row.number("laneBiasM");val passDistanceScale=row.number("passDistanceScale")
    val fireRangeScale=row.number("fireRangeScale");val heavyRangeScale=row.number("heavyRangeScale");val mines=row.number("mines")!=0.0
    init { require(carIndex>=0 && fireRangeScale in 0.0..1.0 && passDistanceScale>0 && heavyRangeScale>0) }
    val json="{\"id\":\"$id\",\"name\":\"$name\",\"car\":\"${CarCatalog.all[carIndex].id}\",\"style\":\"$style\"}"
}
class Cup(row: Map<String,String>) {
    val id=row.getValue("id");val name=row.getValue("name")
    val targets=intArrayOf(0,row.number("bronzePoints").toInt(),row.number("silverPoints").toInt(),row.number("goldPoints").toInt())
    val bonuses=intArrayOf(0,row.number("bronzeBonus").toInt(),row.number("silverBonus").toInt(),row.number("goldBonus").toInt())
    init { require((1..3).all{targets[it]>targets[it-1] && bonuses[it]>bonuses[it-1]}) }
    fun grade(points: Int)=(1..3).lastOrNull{points>=targets[it]}?:0
}
class CareerEvent(row: Map<String,String>) {
    val id=row.getValue("id");val name=row.getValue("name")
    val cupIndex=Career.cups.indexOfFirst{it.id==row.getValue("cup")};val courseIndex=Courses.all.indexOfFirst{it.id==row.getValue("course")}
    val story=AshStory.cards.getValue(row.getValue("story"));val boss=row.number("boss")!=0.0;val duel=row.number("duel")!=0.0
    val laps=row.number("laps").toInt()
    val phase=row.getValue("phase")
    val playerTier=row.number("playerTier").toInt()
    val type=EventType.valueOf(row.getValue("type"))
    val elimination get()=type==EventType.ELIMINATION
    init {
        require(playerTier in cupIndex..min(4,cupIndex+1) && cupIndex>=0 && courseIndex>=0 && (if(elimination)duel && laps==0 else laps in 2..6))
        require(laps==RacePacing.laps(id,Courses.all[courseIndex].id,playerTier)){"$id: laps must derive from the measured course and target time"}
        require(phase in setOf("build-up","pressure","qualifier","boss","finale"))
        require((phase=="finale")==elimination && (phase in setOf("boss","finale"))==boss)
    }
}
data class Unlock(val kind: String,val id: String,val afterRounds: Int,val name: String)
data class PartUnlock(val part: Int,val tier: Int,val afterRounds: Int)
data class CareerResult(val advanced: Boolean,val cupGrade: Int,val bonus: Int,val message: String)
object Career {
    private val rules=Content.table("career-rules").associate{it.getValue("key") to it.number("value")}
    operator fun get(key: String)=rules.getValue(key)
    val difficulties=Content.table("difficulties").map{Difficulty(it)}
    val rivals=Content.table("rivals").map{Rival(it)}
    val cups=Content.table("championships").map{Cup(it)}
    val events=Content.table("campaign").map{CareerEvent(it)}
    val points=Content.table("career-points").sortedBy{it.number("position")}.map{it.number("points").toInt()}.toIntArray()
    val unlocks=Content.table("career-unlocks").map{Unlock(it.getValue("kind"),it.getValue("id"),it.number("afterRounds").toInt(),it.getValue("name"))}
    val partUnlocks=Content.table("part-unlocks").map{PartUnlock(Parts.all.indexOfFirst{p->p.id==it.getValue("id")},it.number("tier").toInt(),it.number("afterRounds").toInt())}
    init {
        require(difficulties.all{it.skill.reactionSteps*Tuning.STEP_SECONDS>=get("minimumReactionSeconds")})
        require(rivals.size>=Tuning.CAR_COUNT-1 && events.size>0 && points.size==Tuning.CAR_COUNT)
        require(events.map{it.id}.distinct().size==events.size && events.map{it.cupIndex}==events.map{it.cupIndex}.sorted())
        require(unlocks.all{it.kind in setOf("car","track") && it.afterRounds in 0..events.size})
        require(partUnlocks.all{it.part>=0 && it.tier in 2..Parts.all[it.part].maxTier && it.afterRounds in 0..events.size})
        require(partUnlocks.map{it.part to it.tier}.distinct().size==partUnlocks.size)
        require(partUnlocks.map{it.part to it.tier}.toSet()==Parts.all.indices.flatMap{p->(2..Parts.all[p].maxTier).map{p to it}}.toSet())
        require(rivals.all{it.carIndex in CarCatalog.all.indices})
        for(i in cups.indices)require(cups[i].targets.last()<=events.count{it.cupIndex==i}*points.max())
        for((i,e) in events.withIndex())require(unlocks.single{it.kind=="track" && it.id==Courses.all[e.courseIndex].id}.afterRounds<=i)
    }
    fun unlocked(p: Profile,kind: String,id: String)=(kind=="car" && p.owned[CarCatalog.all.indexOfFirst{it.id==id}]) || p.careerCleared>=unlocks.single{it.kind==kind && it.id==id}.afterRounds
    fun maximumPartTier(p: Profile,part: Int)=max(1,partUnlocks.filter{it.part==part && it.afterRounds<=p.careerCleared}.maxOfOrNull{it.tier}?:1)
    fun partLock(p: Profile,part: Int,tier: Int): String {
        val gate=partUnlocks.firstOrNull{it.part==part && it.tier==tier}?:return ""
        return if(p.careerCleared<gate.afterRounds)"Clear round ${gate.afterRounds} for tier $tier" else ""
    }
    fun qualifies(car: Car,world: World)=if(world.eventType==EventType.ELIMINATION)car.finishKind==FinishKind.ELIMINATION && !world.combat.wrecked(car.id) else car.lap.laps>0 || (world.combat.wrecked(car.id) || car.finishKind==FinishKind.ELIMINATION) && car.lap.progressM>=world.track.lengthM*get("minimumWreckProgressFraction")
    fun bossIndex(round: Int)=rivals.indexOfFirst{it.id==listOf("rook","ox","vex","mica","marrow")[events[round].cupIndex]}
    /** Read actual standings, not style/slot: P2 can replace a regular entrant. Missing evidence stays strict. */
    fun bossPosition(world: World,round: Int)=world.cars.firstOrNull{it.entered && it.rivalIndex==bossIndex(round)}?.position?.takeIf{it in 1..Tuning.CAR_COUNT}?:1
    fun settle(p: Profile,ticket: Long,expectedRound: Int,difficulty: Int,position: Int,kills: Int,hp: Double,qualified: Boolean,cash: Int=0,targetWrecked: Boolean=false,clean: Boolean=hp>=CombatRules["maxHp"],finished: Boolean=hp>0,bossPosition: Int=1): CareerResult? {
        require(expectedRound in events.indices && cash in 0..MarketRules["raceCashCap"].toInt())
        require(difficulty in difficulties.indices && position in 1..Tuning.CAR_COUNT && kills in 0 until Tuning.CAR_COUNT && hp.isFinite() && hp in 0.0..CombatRules["maxHp"])
        if(ticket<=p.settledRace || ticket>p.startedRaces)return null
        Campaign.prepare(p,expectedRound)
        require(bossPosition in 1..Tuning.CAR_COUNT)
        val result=advance(p,expectedRound,position,qualified && (!events[expectedRound].boss || hp>0 && finished))
        check(Economy.settle(p,ticket,position,kills,hp,rewardScale=CareerCurve.all[expectedRound].rewardScale,bonus=result.bonus,cash=cash,course=Courses.all[events[expectedRound].courseIndex].id,targetWrecked=targetWrecked,clean=clean,finished=finished,league=true)!=null)
        if(result.advanced && events[expectedRound].boss)Campaign.promoted(p,expectedRound)
        if(result.advanced && events[expectedRound].elimination)DeathDuel.victory(p)
        return result
    }
    internal fun advance(p: Profile,expectedRound: Int,position: Int,qualified: Boolean): CareerResult {
        require(position in 1..Tuning.CAR_COUNT)
        if(expectedRound!=p.careerRound)return CareerResult(false,0,0,"Career round changed - result not advanced")
        if(!qualified)return CareerResult(false,0,0,if(events[p.careerRound].elimination)"No survivor victory - the rig is ready for another attempt" else "Complete a lap or make progress before a wreck")
        if(events[p.careerRound].boss && position!=1)return CareerResult(false,0,0,if(events[p.careerRound].elimination)"Be the last car running - the rig is ready for another attempt" else "Win the boss race in first place to earn promotion - repair and retry")
        val event=events[p.careerRound];p.careerPoints+=points[position-1]
        p.careerCleared=max(p.careerCleared,p.careerRound+1)
        val cupEnds=p.careerRound==events.lastIndex || events[p.careerRound+1].cupIndex!=event.cupIndex
        var grade=0;var bonus=0;var message="Round cleared - ${points[position-1]} cup points"
        if(cupEnds) {
            val cup=cups[event.cupIndex];grade=cup.grade(p.careerPoints);bonus=cup.bonuses[grade]
            p.careerTrophies[event.cupIndex]=max(p.careerTrophies[event.cupIndex],grade)
            message="${cup.name}: ${gradeName(grade)} - bonus $bonus CR";p.careerPoints=0;p.legacyCarryPoints=0
        }
        p.careerRound++
        if(p.careerRound==events.size){
            p.careerRound=0;p.careerSeasons++
            // A repeat season must not force the player to sell the Champion garage to enter Scrap.
            if(p.owned.indices.none{p.owned[it] && CarCatalog.all[it].tierRank==0}) {
                val starter=EconomyRules["startingCarIndex"].toInt();p.owned[starter]=true;p.condition[starter]=100
            }
            message="Marrow is finished. Your car returns. The league claim is void."
        }
        return CareerResult(true,grade,bonus,message)
    }
    fun gradeName(grade: Int)=arrayOf("No medal","Bronze","Silver","Gold")[grade]
    fun prepareRivals(world: World,difficulty: Int,profile: Profile?=null,guest: Boolean=false) {
        if(profile!=null){RivalEconomy.apply(profile,world,difficulty,guest=guest);return}
        for(i in 1 until world.cars.size) {
            val c=world.cars[i];val rival=rivals[i-1];CarCatalog.apply(c,rival.carIndex);c.aiSkill=difficulties[difficulty].skill;c.aiStyle=rival
        }
    }
    fun json(p: Profile,message: String): String {
        val e=events[p.careerRound];val cup=cups[e.cupIndex];val course=Courses.all[e.courseIndex]
        val locks=unlocks.joinToString(",","[","]"){"{\"kind\":\"${it.kind}\",\"id\":\"${it.id}\",\"name\":\"${it.name}\",\"afterRounds\":${it.afterRounds},\"unlocked\":${p.careerCleared>=it.afterRounds}}"}
        val parts=partUnlocks.joinToString(",","[","]"){"{\"name\":\"${Parts.all[it.part].name} ${it.tier}\",\"afterRounds\":${it.afterRounds},\"unlocked\":${p.careerCleared>=it.afterRounds}}"}
        val story=DeathDuel.story(p).json
        val roster=if(p.withRivals)RivalEconomy.json(p) else "[]"
        val field=if(p.withRivals)RivalEconomy.fieldRating(p) else 0.0
        return "{\"campaign\":${Campaign.json(p)},\"phase\":\"${e.phase}\",\"objective\":\"${objective(p.careerRound)}\",\"eventType\":\"${e.type}\",\"laps\":${e.laps},\"story\":$story,\"rivals\":$roster,\"fieldPowerRating\":$field,\"duel\":${e.duel},\"maximumPlayerTier\":${e.playerTier},\"ownedCars\":[${p.owned.indices.filter{p.owned[it]}.joinToString(","){"\"${CarCatalog.all[it].id}\""}}],\"round\":${p.careerRound+1},\"roundCount\":${events.size},\"cleared\":${p.careerCleared},\"season\":${p.careerSeasons+1},\"event\":\"${e.name}\",\"course\":${course.json},\"cup\":\"${cup.name}\",\"points\":${p.careerPoints},\"bestTrophy\":\"${gradeName(p.careerTrophies[e.cupIndex])}\",\"targets\":[${cup.targets.drop(1).joinToString(",")}],\"bonuses\":[${cup.bonuses.drop(1).joinToString(",")}],\"trophies\":[${p.careerTrophies.joinToString(",")}],\"difficulty\":${difficulties[p.careerDifficulty].json},\"unlocks\":$locks,\"partUnlocks\":$parts,\"message\":\"$message\"}"
    }
    fun objective(round: Int)=when {
        events[round].elimination->"Last car running wins. Free supplied rig on every retry."
        events[round].boss->"Win the boss race in first place to recruit ${rivals[bossIndex(round)].name}."
        else->"Complete a lap or make progress before a wreck. Repairs are insured."
    }
    val catalogJson get()="{\"difficulties\":[${difficulties.joinToString(","){it.json}}],\"rivals\":[${rivals.joinToString(","){it.json}}]}"
}
