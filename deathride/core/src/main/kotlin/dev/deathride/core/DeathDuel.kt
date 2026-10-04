package dev.deathride.core

/** Campaign-only equipment and decision profile; all movement and hits use the common solver. */
object DeathDuel {
    val rigIndex=CarCatalog.all.indexOfFirst{it.id=="Line"}
    // Fixed mission loaner: preserves the authored basic rig when the buyable roster is rebalanced.
    val rigClass=CarClass(CarCatalog.all[rigIndex].values+Content.table("mechanic-rig").single())
    val rigRating=PowerRating.of(rigClass)
    val boss=Rival(Content.table("duel-boss").single())
    val perceptionM=CampaignRules["bossPerceptionM"]
    val chaseFraction=CampaignRules["bossWaitSpeedFraction"]
    val searchFraction=CampaignRules["bossSearchSpeedFraction"].also{require(it in .1..1.0)}
    val waitLaneM=CampaignRules["bossWaitLaneM"]
    fun applyRig(car: Car) {
        CarCatalog.apply(car,rigClass)
        car.ability.definition=AbilityCatalog.dispatcher
        car.startingCondition=1.0;car.utilityMask=0
    }
    fun seized(p: Profile)=p.campaign.finale==1
    fun seize(p: Profile) {
        if(!Career.events[p.careerRound].elimination || seized(p))return
        val chosen=if(p.owned[p.selectedCar])p.selectedCar else p.owned.indices.last{p.owned[it]}
        p.selectedCar=chosen;p.campaign.seizedCar=chosen;p.campaign.finale=1;p.marketRevision++
    }
    fun victory(p: Profile) {
        val s=p.campaign
        s.voided+=s.debt;s.debt=0
        if(s.seizedCar>=0){p.owned[s.seizedCar]=true;p.selectedCar=s.seizedCar;s.finale=2}
    }
    fun carJson(p: Profile): String {
        if(!seized(p))return CarCatalog.all[p.selectedCar].json(p.bonuses())
        return rigClass.json.replace(rigClass.ability.json,AbilityCatalog.dispatcher.json)
    }
    fun story(p: Profile): StoryCard {
        val card=Career.events[p.careerRound].story
        if(!seized(p))return card
        return card.copy(lines=listOf("Marrow seized your ${CarCatalog.all[p.campaign.seizedCar].id} under a false lien.",card.lines[1],card.lines[2]))
    }
}
