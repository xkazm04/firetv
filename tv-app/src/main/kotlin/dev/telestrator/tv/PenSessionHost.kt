package dev.telestrator.tv

import android.util.Log
import dev.telestrator.core.AnnotationDoc
import dev.telestrator.core.PenMessage
import dev.telestrator.core.TvMessage
import dev.telestrator.core.decodePenMessage
import dev.telestrator.core.encode
import dev.telestrator.tv.transport.PenChannel
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.concurrent.atomic.AtomicLong

private const val TAG = "PenSessionHost"

/**
 * The whole conversation with a pen: pairing, dispatch, and the heartbeat that keeps the phone in
 * step with the TV.
 *
 * None of this knows how the pen got here. That is what makes swapping a listening transport for
 * a dialling one a configuration change instead of a rewrite — and it is the hedge against a Vega
 * port, where listening on a port may not be an option at all (docs/PLATFORM-RISK.md).
 */
class PenSessionHost(
    private val session: Session,
    private val thumbnails: Thumbnailer? = null,
) {
    /** Bumped whenever a new pen pairs. An older pen seeing a newer generation stands down. */
    private val generation = AtomicLong(0)

    /**
     * Runs for the lifetime of one pen connection.
     *
     * There is exactly one pass over the incoming stream: the first message must pair, everything
     * after it is pen input. Reading the stream twice — once to pair, once to serve — would mean
     * the second reader inherits an already-drained channel.
     */
    suspend fun host(channel: PenChannel) = coroutineScope {
        var paired: PenMessage.Hello? = null
        var myGeneration = -1L
        var ticker: Job? = null

        // A connection that never says hello holds a slot open for nothing.
        val watchdog = launch {
            delay(HELLO_TIMEOUT_MS)
            if (paired == null) {
                Log.i(TAG, "pen rejected via ${channel.remoteName}: no pairing message")
                reject(channel, "no pairing message")
            }
        }

        try {
            channel.receiveLoop { text ->
                val msg = runCatching { decodePenMessage(text) }
                    .onFailure { Log.w(TAG, "bad message: $text", it) }
                    .getOrNull() ?: return@receiveLoop

                if (paired == null) {
                    if (msg !is PenMessage.Hello) return@receiveLoop
                    if (msg.pin != session.pin) {
                        Log.i(TAG, "pen rejected via ${channel.remoteName}: wrong PIN")
                        watchdog.cancel()
                        reject(channel, "wrong PIN")
                        return@receiveLoop
                    }

                    // Newest pen wins rather than being locked out: a phone that dropped off
                    // Wi-Fi and came back should just work, and the alternative strands the
                    // viewer with a dead pen.
                    paired = msg
                    watchdog.cancel()
                    myGeneration = generation.incrementAndGet()
                    session.penConnected()
                    Log.i(TAG, "pen ${msg.clientId} paired via ${channel.remoteName} (gen $myGeneration)")

                    channel.send(
                        (TvMessage.Welcome(
                            sessionId = "s-$myGeneration",
                            videoAspect = session.doc.value.videoAspect,
                            accepted = true,
                        ) as TvMessage).encode()
                    )
                    ticker = launch { pushState(channel, myGeneration) }
                    return@receiveLoop
                }

                if (generation.get() != myGeneration) return@receiveLoop
                // Answer the probe on the receive path, before any work, so the number reflects
                // transport plus decode, not the render.
                if (msg is PenMessage.Ping) {
                    channel.send((TvMessage.Pong(msg.id) as TvMessage).encode())
                } else {
                    session.accept(msg)
                }
            }
        } finally {
            watchdog.cancel()
            ticker?.cancel()
            if (paired != null) {
                session.penDisconnected()
                Log.i(TAG, "pen ${paired?.clientId} disconnected")
            }
        }
    }

    private suspend fun reject(channel: PenChannel, reason: String) {
        runCatching {
            channel.send(
                (TvMessage.Welcome("", session.doc.value.videoAspect, false, reason) as TvMessage).encode()
            )
            channel.close(reason)
        }
    }

    /** Heartbeat so the phone can mirror the playhead, the undo state and the paused frame. */
    private suspend fun CoroutineScope.pushState(channel: PenChannel, myGeneration: Long) {
        var lastThumbKey = Long.MIN_VALUE
        var lastDoc: AnnotationDoc? = null

        while (isActive && generation.get() == myGeneration) {
            // Mirror the document only while paused, and only when it actually changed. During
            // playback nothing on the phone needs it, and during a gesture the phone is already
            // drawing its own ink locally - shipping the growing stroke back would just compete
            // with the pen traffic on the same connection.
            val current = session.doc.value
            if (session.paused && current !== lastDoc) {
                lastDoc = current
                channel.send((TvMessage.Doc(session.revision.toLong(), current) as TvMessage).encode())
            }
            if (!session.paused) lastDoc = null

            // Thumbnails only while paused, and only once per frame the viewer stops on: one is
            // orders of magnitude bigger than a state message and shares the pen's connection.
            val thumbKey = if (session.paused) session.mediaTimeMs / THUMB_BUCKET_MS else Long.MIN_VALUE
            val thumbnail = if (session.paused && thumbKey != lastThumbKey) {
                lastThumbKey = thumbKey
                withContext(Dispatchers.IO) { thumbnails?.dataUrlAt(session.mediaTimeMs) }
            } else {
                null
            }
            if (!session.paused) lastThumbKey = Long.MIN_VALUE

            channel.send(
                (TvMessage.State(
                    t = session.mediaTimeMs,
                    paused = session.paused,
                    rate = session.rate,
                    annotationCount = session.annotationCount(),
                    canUndo = session.canUndo(),
                    canRedo = session.canRedo(),
                    durationMs = session.durationMs,
                    thumbnail = thumbnail,
                ) as TvMessage).encode()
            )
            delay(STATE_INTERVAL_MS)
        }
    }

    private companion object {
        const val HELLO_TIMEOUT_MS = 5_000L
        const val STATE_INTERVAL_MS = 400L
        const val THUMB_BUCKET_MS = 200L
    }
}
