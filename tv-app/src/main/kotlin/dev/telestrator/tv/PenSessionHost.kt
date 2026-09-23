package dev.telestrator.tv

import android.os.SystemClock
import android.util.Log
import dev.telestrator.core.Heartbeat
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
        val pen = desk.open(openedAtMs = now()) { text, error -> Log.w(TAG, "bad message: $text", error) }
        var ticker: Job? = null
        var watchdog: Job? = null

        suspend fun carryOut(effects: List<PenEffect>) {
            for (effect in effects) when (effect) {
                is PenEffect.Send -> channel.send(effect.message.encode())
                is PenEffect.Deliver -> session.accept(effect.message)
                is PenEffect.Close -> {
                    Log.i(TAG, "pen rejected via ${channel.remoteName}: ${effect.reason}")
                    channel.close(effect.reason)
                }
                is PenEffect.Paired -> {
                    watchdog?.cancel()
                    session.penConnected()
                    Log.i(TAG, "pen ${effect.clientId} paired via ${channel.remoteName} (gen ${effect.generation})")
                    ticker = launch { pushState(channel, pen) }
                }
            }
        }

        watchdog = launch {
            delay(PairingDesk.HELLO_TIMEOUT_MS)
            // A refusal is best effort: the pen may already be gone.
            runCatching { carryOut(pen.onTick(now())) }
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
