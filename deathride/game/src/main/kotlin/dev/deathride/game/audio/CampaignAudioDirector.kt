package dev.deathride.game.audio

import dev.deathride.core.*

/** Menu/save transitions only. Narration observes committed profiles and never changes them. */
class CampaignAudioDirector(private val cues: CueService) {
    fun careerOpened(p: Profile) {
        when {
            DeathDuel.seized(p) -> cues.narrateSequence("voice.announcer.seizure",
                "voice.mechanic.seizure", "voice.mechanic.rig", "voice.mechanic.duel")
            Campaign.pending(p)>=0 -> cues.narrateSequence("voice.announcer.ally", "voice.mechanic.ally")
            p.careerRound==0 && p.careerSeasons==0 -> cues.narrate("voice.announcer.debt")
            Career.events[p.careerRound].boss -> cues.narrate("voice.announcer.boss")
        }
    }

    fun settled(before: Profile, after: Profile) {
        when {
            before.campaign.finale==1 && after.campaign.finale==2 ->
                cues.narrateSequence("voice.announcer.freedom", "voice.mechanic.after")
            !before.campaign.exposed && after.campaign.exposed ->
                cues.narrateSequence("voice.announcer.ally", "voice.mechanic.books")
            before.campaign.rewards.indices.any{before.campaign.rewards[it]==0 && after.campaign.rewards[it]==1} ->
                cues.narrateSequence("voice.announcer.ally")
        }
    }
}
