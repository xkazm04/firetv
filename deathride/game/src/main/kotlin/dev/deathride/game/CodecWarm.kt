package dev.deathride.game

import dev.deathride.core.Profile
import dev.deathride.core.ProfileCodec

/**
 * P13e: runs the save codec (ProfileCodec.encode, then decode, as ProfileStore.save does) on copies of the loaded profiles,
 * on its own low-priority thread at create, so ART has compiled it before the lobby takes input. P13d: the first saves of a
 * run (car pick, startRace) JIT-compiled ProfileCodec.decode beside the first requests' frames. No file is read or written;
 * the copies are taken on the caller's thread and never published.
 */
object CodecWarm {
    /** Rounds over the profiles: enough calls for ART's hotness counter (decode loops over every save row). */
    const val ROUNDS=300
    fun start(profiles: List<Profile>,logger: (String)->Unit,rounds: Int=ROUNDS): Thread {
        val copies=profiles.map{it.copy()}
        return Thread({
            val started=System.nanoTime();var calls=0
            runCatching { repeat(rounds) { for(p in copies){check(ProfileCodec.decode(ProfileCodec.encode(p),p.id).id==p.id);calls++} } }
                .onFailure { logger("profileCodecWarm failed after $calls calls: $it") }
            logger("profileCodecWarm calls=$calls ms=${String.format(java.util.Locale.ROOT,"%.1f",(System.nanoTime()-started)/1e6)}")
        },"profile-codec-warm").apply { isDaemon=true;priority=Thread.MIN_PRIORITY;start() }
    }
}
