package dev.telestrator.core

/**
 * The pen protocol as a sans-IO state machine: pairing, the hello timeout, newest-pen-wins,
 * ping, dispatch, and the heartbeat's choice of what to send each tick.
 *
 * Nothing here touches a socket, a clock or a thread. Text and times go in, [PenEffect]s come out,
 * and the platform shell (the Android `PenSessionHost` today, a Vega or desk shell later) carries
 * them out. That is what makes the conversation JVM-tested and portable with no change to the wire.
 */
sealed interface PenEffect {
    /** Encode and send this message to the pen. */
    data class Send(val message: TvMessage) : PenEffect

    /** Hang up on the pen; it will not be served. */
    data class Close(val reason: String) : PenEffect

    /** Hand this input to the session (pen strokes, shapes, transport, undo...). */
    data class Deliver(val message: PenMessage) : PenEffect

    /** The pen paired: count it as connected and start its heartbeat. */
    data class Paired(val clientId: String, val generation: Long) : PenEffect
}

/**
 * What every pen connection to one TV shares: the PIN, the video aspect the welcome reports, and
 * the generation counter that decides which pen is current.
 */
class PairingDesk(val pin: String, val videoAspect: Double) {

    private var generationCounter = 0L

    /** The generation of the newest paired pen; 0 until one pairs. */
    val generation: Long
        @Synchronized get() = generationCounter

    @Synchronized
    internal fun nextGeneration(): Long = ++generationCounter

    /** A new connection arrived at [openedAtMs] (any monotonic clock, as long as ticks use the same one). */
    fun open(openedAtMs: Long): PenConversation = PenConversation(this, openedAtMs)

    companion object {
        const val HELLO_TIMEOUT_MS = 5_000L
    }
}

/**
 * One pen connection, from the first frame to the hang-up.
 *
 * There is exactly one pass over the incoming stream: the first message must pair, everything
 * after it is pen input. [onText] and [onTick] may be called from different threads, so both are
 * serialised on this instance.
 */
class PenConversation(
    private val desk: PairingDesk,
    openedAtMs: Long,
    /** Told about a frame that did not decode, so the shell can log it. The frame is dropped. */
    private val onUndecodable: (text: String, error: Throwable) -> Unit = { _, _ -> },
) {
    /** A connection that has not paired by this time is refused. */
    val helloDeadlineMs: Long = openedAtMs + PairingDesk.HELLO_TIMEOUT_MS

    private var hello: PenMessage.Hello? = null
    private var closed = false

    /** The generation this pen paired as, or -1 before pairing. */
    var generation: Long = -1
        private set

    val isPaired: Boolean @Synchronized get() = hello != null
    val clientId: String? @Synchronized get() = hello?.clientId

    /** Paired and not superseded by a newer pen. A pen that is not current stands down silently. */
    val isCurrent: Boolean @Synchronized get() = hello != null && desk.generation == generation

    @Synchronized
    fun onText(text: String): List<PenEffect> {
        if (closed) return emptyList()
        val msg = try {
            decodePenMessage(text)
        } catch (e: Exception) {
            onUndecodable(text, e)
            return emptyList()
        }

        if (hello == null) {
            if (msg !is PenMessage.Hello) return emptyList()
            if (msg.pin != desk.pin) return reject("wrong PIN")

            // Newest pen wins rather than being locked out: a phone that dropped off Wi-Fi and
            // came back should just work, and the alternative strands the viewer with a dead pen.
            hello = msg
            generation = desk.nextGeneration()
            return listOf(
                PenEffect.Send(TvMessage.Welcome(sessionId = "s-$generation", videoAspect = desk.videoAspect, accepted = true)),
                PenEffect.Paired(msg.clientId, generation),
            )
        }

        if (desk.generation != generation) return emptyList()
        // Answer the probe on the receive path, before any work, so the number reflects
        // transport plus decode, not the render.
        if (msg is PenMessage.Ping) return listOf(PenEffect.Send(TvMessage.Pong(msg.id)))
        return listOf(PenEffect.Deliver(msg))
    }

    /** A connection that never says hello holds a slot open for nothing. */
    @Synchronized
    fun onTick(nowMs: Long): List<PenEffect> {
        if (closed || hello != null || nowMs < helloDeadlineMs) return emptyList()
        return reject("no pairing message")
    }

    private fun reject(reason: String): List<PenEffect> {
        closed = true
        return listOf(
            PenEffect.Send(TvMessage.Welcome(sessionId = "", videoAspect = desk.videoAspect, accepted = false, reason = reason)),
            PenEffect.Close(reason),
        )
    }
}

/**
 * Everything the heartbeat reads from the TV in one tick.
 *
 * New per-tick state (for example the drawn moments of review mode) is one more field here, with a
 * default, copied into the [TvMessage.State] that [Heartbeat.beat] builds.
 */
data class HeartbeatInput(
    val t: Long,
    val paused: Boolean,
    val rate: Double,
    val annotationCount: Int,
    val canUndo: Boolean,
    val canRedo: Boolean,
    val durationMs: Long,
    val doc: AnnotationDoc,
    val revision: Long,
)

/**
 * One tick's decision. Send [doc] first if present, then [state]; when [thumbnailAtMs] is set, fetch
 * the frame at that time and send it as `state.copy(thumbnail = ...)`.
 */
data class Beat(
    val doc: TvMessage.Doc?,
    val thumbnailAtMs: Long?,
    val state: TvMessage.State,
)

/** Decides, per tick, what the phone needs to stay in step with the TV. One instance per paired pen. */
class Heartbeat {

    private var lastDoc: AnnotationDoc? = null
    private var lastThumbKey = Long.MIN_VALUE

    fun beat(input: HeartbeatInput): Beat {
        // Mirror the document only while paused, and only when it actually changed (by instance).
        // During playback nothing on the phone needs it, and during a gesture the phone is already
        // drawing its own ink locally - shipping the growing stroke back would just compete with
        // the pen traffic on the same connection.
        val doc = if (input.paused && input.doc !== lastDoc) {
            lastDoc = input.doc
            TvMessage.Doc(input.revision, input.doc)
        } else {
            null
        }
        if (!input.paused) lastDoc = null

        // Thumbnails only while paused, and only once per frame the viewer stops on: one is orders
        // of magnitude bigger than a state message and shares the pen's connection.
        val thumbKey = if (input.paused) input.t / THUMB_BUCKET_MS else Long.MIN_VALUE
        val thumbnailAtMs = if (input.paused && thumbKey != lastThumbKey) {
            lastThumbKey = thumbKey
            input.t
        } else {
            null
        }
        if (!input.paused) lastThumbKey = Long.MIN_VALUE

        return Beat(
            doc = doc,
            thumbnailAtMs = thumbnailAtMs,
            state = TvMessage.State(
                t = input.t,
                paused = input.paused,
                rate = input.rate,
                annotationCount = input.annotationCount,
                canUndo = input.canUndo,
                canRedo = input.canRedo,
                durationMs = input.durationMs,
                thumbnail = null,
            ),
        )
    }

    companion object {
        const val INTERVAL_MS = 400L
        const val THUMB_BUCKET_MS = 200L
    }
}
