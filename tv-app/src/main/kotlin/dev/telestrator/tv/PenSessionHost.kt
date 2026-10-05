package dev.telestrator.tv

import android.os.SystemClock
import android.util.Log
import dev.telestrator.core.Heartbeat
import dev.telestrator.core.LinkEvent
import dev.telestrator.core.LinkState
import dev.telestrator.core.PairingDesk
import dev.telestrator.core.PenConversation
import dev.telestrator.core.PenEffect
import dev.telestrator.core.TvMessage
import dev.telestrator.core.encode
import dev.telestrator.tv.transport.PenChannel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

private const val TAG = "PenSessionHost"

/** How often a shared conversation is ticked; only the wrong-PIN cooldown depends on it. */
private const val SHARED_TICK_MS = 1_000L

/**
 * Drives the pen conversation over one [PenChannel]: frames and ticks go in, effects come out.
 *
 * What the conversation *means* - pairing, the hello timeout, newest-pen-wins, ping, dispatch and
 * what the heartbeat sends - is decided in core ([PenConversation], [Heartbeat]), JVM-tested and
 * portable. This class is the coroutine plumbing around it plus the two Android ties: logging and
 * the [Thumbnailer]. None of it knows how the pen got here, which is what makes swapping a
 * listening transport for a dialling one a configuration change (docs/PLATFORM-RISK.md).
 */
class PenSessionHost(
    private val session: Session,
    private val thumbnails: Thumbnailer? = null,
) {
    /** Shared by every connection, so a newly paired pen supersedes the older one. */
    private val desk = PairingDesk(pin = session.pin, videoAspect = session.doc.value.videoAspect)

    /** Runs for the lifetime of one pen connection. */
    suspend fun host(channel: PenChannel) = coroutineScope {
        // A relay socket is not a pen: its conversation has no hello deadline and no hang-up.
        val shared = !channel.carriesOnePen
        val pen = desk.open(openedAtMs = now(), shared = shared) { text, error -> Log.w(TAG, "bad message: $text", error) }
        var ticker: Job? = null
        var watchdog: Job? = null

        suspend fun carryOut(effects: List<PenEffect>) {
            for (effect in effects) when (effect) {
                is PenEffect.Send -> {
                    // Someone tried to pair and was turned away: the TV says so while no pen is
                    // here, and says nothing over the picture of a pen that is drawing.
                    val welcome = effect.message as? TvMessage.Welcome
                    val reason = welcome?.reason
                    if (welcome != null && !welcome.accepted && reason in LinkState.PIN_REFUSALS) {
                        session.linkEvent(LinkEvent.PenRefused(reason.orEmpty()))
                    }
                    channel.send(effect.message.encode())
                }
                is PenEffect.Deliver -> session.accept(effect.message)
                is PenEffect.Close -> {
                    Log.i(TAG, "pen rejected via ${channel.remoteName}: ${effect.reason}")
                    channel.close(effect.reason)
                }
                is PenEffect.Paired -> {
                    // A dedicated connection is done waiting once it pairs; a shared one keeps
                    // ticking for the guess-limit cooldown.
                    if (!shared) watchdog?.cancel()
                    // One pen is counted per conversation, however many times it re-pairs.
                    if (!effect.replaced) session.penConnected()
                    session.linkEvent(LinkEvent.PenPaired(effect.clientId))
                    Log.i(TAG, "pen ${effect.clientId} paired via ${channel.remoteName} (gen ${effect.generation}, replaced ${effect.replaced})")
                    // A fresh heartbeat is what a new phone needs to receive the document and the
                    // thumbnail again; the old one would be a second ticker on one channel.
                    ticker?.cancel()
                    ticker = launch { pushState(channel, pen) }
                }
                is PenEffect.Unpaired -> {
                    ticker?.cancel()
                    ticker = null
                    session.penDisconnected()
                    session.linkEvent(LinkEvent.PenGone(effect.clientId))
                    Log.i(TAG, "pen ${effect.clientId} unpaired via ${channel.remoteName}")
                }
            }
        }

        watchdog = launch {
            if (shared) {
                // Never refuses; the ticks carry the clock that ends a wrong-PIN cooldown.
                while (isActive) {
                    delay(SHARED_TICK_MS)
                    carryOut(pen.onTick(now()))
                }
            } else {
                delay(PairingDesk.HELLO_TIMEOUT_MS)
                // A refusal is best effort: the pen may already be gone.
                runCatching { carryOut(pen.onTick(now())) }
            }
        }

        try {
            channel.receiveLoop { text ->
                val effects = pen.onText(text)
                // A refusal is best effort, like the one in the watchdog.
                if (effects.any { it is PenEffect.Close }) runCatching { carryOut(effects) } else carryOut(effects)
            }
        } finally {
            watchdog?.cancel()
            ticker?.cancel()
            if (pen.isPaired) {
                session.penDisconnected()
                // A pen that was superseded leaves quietly: the one that replaced it holds the link.
                if (pen.isCurrent) pen.clientId?.let { session.linkEvent(LinkEvent.PenGone(it)) }
                Log.i(TAG, "pen ${pen.clientId} disconnected")
            }
        }
    }

    /** Heartbeat so the phone can mirror the playhead, the undo state and the paused frame. */
    private suspend fun pushState(channel: PenChannel, pen: PenConversation) = coroutineScope {
        val heartbeat = Heartbeat()
        while (isActive && pen.isCurrent) {
            val beat = heartbeat.beat(session.heartbeatInput())
            beat.doc?.let { channel.send((it as TvMessage).encode()) }
            val thumbnail = beat.thumbnailAtMs?.let { at ->
                withContext(Dispatchers.IO) { thumbnails?.dataUrlAt(at) }
            }
            channel.send((beat.state.copy(thumbnail = thumbnail) as TvMessage).encode())
            delay(Heartbeat.INTERVAL_MS)
        }
    }

    private fun now(): Long = SystemClock.elapsedRealtime()
}
