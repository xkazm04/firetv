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
    data class Paired(val clientId: String, val generation: Long, val replaced: Boolean = false) : PenEffect

    /** The pen that was paired no longer is (a wrong PIN was offered on a shared conversation). */
    data class Unpaired(val clientId: String) : PenEffect
}

/**
 * What every pen connection to one TV shares: the PIN, the video aspect the welcome reports, the
 * generation counter that decides which pen is current, and the wrong-PIN guess limit.
 *
 * The guess limit lives here, not on one connection, because a connection is free: a dedicated
 * one is hung up on after one wrong PIN, and a guesser simply opens the next. [MAX_WRONG_PINS]
 * wrong PINs in a row, across every connection, refuse every hello (the right PIN included) until
 * [COOLDOWN_MS] has passed on the desk's clock, which is the latest open or tick time it has seen.
 */
class PairingDesk(val pin: String, val videoAspect: Double) {

    /** What one offered PIN gets. */
    internal enum class PinCheck { RIGHT, WRONG, LOCKED }

    private var generationCounter = 0L
    private var nowMs = Long.MIN_VALUE
    private var wrongPins = 0
    private var lockedUntilMs: Long? = null

    /** The generation of the newest paired pen; 0 until one pairs. */
    val generation: Long
        @Synchronized get() = generationCounter

    @Synchronized
    internal fun nextGeneration(): Long = ++generationCounter

    /** Moves the desk's clock forward to [atMs] (never back) and ends a cooldown that has run out. */
    @Synchronized
    internal fun see(atMs: Long) {
        if (atMs > nowMs) nowMs = atMs
        val until = lockedUntilMs
        if (until != null && nowMs >= until) {
            lockedUntilMs = null
            wrongPins = 0
        }
    }

    /** Milliseconds until the guess-limit cooldown ends, or null when the desk is not locked. */
    @Synchronized
    internal fun retryAfterMs(): Long? = lockedUntilMs?.let { (it - nowMs).coerceAtLeast(0) }

    /** Checks [offered] against the PIN and counts it; a right PIN restarts the count. */
    @Synchronized
    internal fun check(offered: String): PinCheck {
        if (lockedUntilMs != null) return PinCheck.LOCKED
        if (offered == pin) {
            wrongPins = 0
            return PinCheck.RIGHT
        }
        if (++wrongPins >= MAX_WRONG_PINS) lockedUntilMs = nowMs + COOLDOWN_MS
        return PinCheck.WRONG
    }

    /**
     * A new connection arrived at [openedAtMs] (any monotonic clock, as long as ticks use the same
     * one). [onUndecodable] hears about frames that did not decode, so the shell can log them.
     *
     * [shared] says the connection is not one pen but a channel that outlives each pen (the TV's one
     * outbound relay socket): see [PenConversation].
     */
    fun open(
        openedAtMs: Long,
        shared: Boolean = false,
        onUndecodable: (text: String, error: Throwable) -> Unit = { _, _ -> },
    ): PenConversation {
        see(openedAtMs)
        return PenConversation(this, openedAtMs, onUndecodable, shared)
    }

    companion object {
        const val HELLO_TIMEOUT_MS = 5_000L

        /** Wrong PINs in a row, across every connection to the desk, before hellos are refused for a while. */
        const val MAX_WRONG_PINS = 5

        /** How long the desk refuses every hello after [MAX_WRONG_PINS] wrong ones. */
        const val COOLDOWN_MS = 30_000L
    }
}

/**
 * One pen connection, from the first frame to the hang-up.
 *
 * A **dedicated** conversation (the LAN default, where a connection is a phone) makes exactly one
 * pass over the incoming stream: the first message must pair, everything after it is pen input, and
 * a connection that does not pair in time or pairs with a wrong PIN is refused and hung up on.
 *
 * A **shared** conversation (the relay, where the connection is the TV's own outbound socket and the
 * phone is not part of its lifetime) has no hello deadline and no hang-up, since closing would hang
 * up on the relay rather than on a pen. Every hello is a (re)pairing: the right PIN pairs, or
 * replaces the current pen, at a new generation; a wrong PIN is refused, unpairs the current pen
 * ([PenEffect.Unpaired]) and input is dropped until a right hello.
 *
 * Both kinds count wrong PINs on the [PairingDesk], so the guess limit holds across connections:
 * [MAX_WRONG_PINS] wrong PINs in a row refuse every hello, the right one included, with
 * "too many wrong PINs" until [COOLDOWN_MS] has passed on the opens and ticks.
 *
 * [onText] and [onTick] may be called from different threads, so both are serialised on this instance.
 */
class PenConversation(
    private val desk: PairingDesk,
    openedAtMs: Long,
    /** Told about a frame that did not decode, so the shell can log it. The frame is dropped. */
    private val onUndecodable: (text: String, error: Throwable) -> Unit = { _, _ -> },
    private val shared: Boolean = false,
) {
    /** A dedicated connection that has not paired by this time is refused; a shared one never is. */
    val helloDeadlineMs: Long = if (shared) Long.MAX_VALUE else openedAtMs + PairingDesk.HELLO_TIMEOUT_MS

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

        if (shared && msg is PenMessage.Hello) return sharedHello(msg)
        if (hello == null) {
            if (msg !is PenMessage.Hello) return emptyList()
            return when (desk.check(msg.pin)) {
                PairingDesk.PinCheck.LOCKED -> reject(LOCKED, desk.retryAfterMs())
                PairingDesk.PinCheck.WRONG -> reject(WRONG_PIN)
                PairingDesk.PinCheck.RIGHT -> pair(msg, replaced = false)
            }
        }

        if (desk.generation != generation) return superseded()
        // Answer the probe on the receive path, before any work, so the number reflects
        // transport plus decode, not the render.
        if (msg is PenMessage.Ping) return listOf(PenEffect.Send(TvMessage.Pong(msg.id)))
        return listOf(PenEffect.Deliver(msg))
    }

    /**
     * A dedicated connection that never says hello holds a slot open for nothing. A shared one is
     * never refused; its ticks only carry the clock that ends a guess-limit cooldown.
     */
    @Synchronized
    fun onTick(nowMs: Long): List<PenEffect> {
        desk.see(nowMs)
        if (shared) return emptyList()
        if (closed || hello != null || nowMs < helloDeadlineMs) return emptyList()
        return reject("no pairing message")
    }

    // Newest pen wins rather than being locked out: a phone that dropped off Wi-Fi and came back
    // should just work, and the alternative strands the viewer with a dead pen.
    private fun pair(msg: PenMessage.Hello, replaced: Boolean): List<PenEffect> {
        hello = msg
        generation = desk.nextGeneration()
        return listOf(
            PenEffect.Send(TvMessage.Welcome(sessionId = "s-$generation", videoAspect = desk.videoAspect, accepted = true)),
            PenEffect.Paired(msg.clientId, generation, replaced),
        )
    }

    private fun sharedHello(msg: PenMessage.Hello): List<PenEffect> {
        when (desk.check(msg.pin)) {
            PairingDesk.PinCheck.LOCKED -> return listOf(refusal(LOCKED, desk.retryAfterMs()))
            PairingDesk.PinCheck.RIGHT -> return pair(msg, replaced = hello != null)
            PairingDesk.PinCheck.WRONG -> Unit
        }

        val effects = mutableListOf<PenEffect>(refusal(WRONG_PIN))
        val current = hello
        if (current != null) {
            // The pen that was paired no longer is. Taking a generation as well means nothing that
            // read the old one can still be current.
            hello = null
            generation = desk.nextGeneration()
            effects += PenEffect.Unpaired(current.clientId)
        }
        return effects
    }

    /**
     * A newer pen took this one's place. The first thing the older phone sends afterwards is
     * answered with a refusal and a hang-up, so it can say so instead of showing a green dot over
     * strokes that go nowhere; after that it stands down silently. The reason is not a PIN refusal:
     * it never reaches the TV's card.
     */
    private fun superseded(): List<PenEffect> {
        // A shared connection is the relay's own socket, not a pen: hanging up would cut every
        // phone behind it. It stands down silently, as it always has.
        if (shared || closed) return emptyList()
        return reject(TAKEN_OVER)
    }

    private fun refusal(reason: String, retryAfterMs: Long? = null) =
        PenEffect.Send(
            TvMessage.Welcome(sessionId = "", videoAspect = desk.videoAspect, accepted = false, reason = reason, retryAfterMs = retryAfterMs),
        )

    companion object {
        /** See [PairingDesk.MAX_WRONG_PINS]; the limit is the desk's, shared by every connection. */
        const val MAX_WRONG_PINS = PairingDesk.MAX_WRONG_PINS

        /** See [PairingDesk.COOLDOWN_MS]. */
        const val COOLDOWN_MS = PairingDesk.COOLDOWN_MS

        private const val WRONG_PIN = "wrong PIN"
        private const val LOCKED = "too many wrong PINs"

        /** What a replaced pen is told. The companion page keys on this exact string. */
        const val TAKEN_OVER = "another pen took over"
    }

    private fun reject(reason: String, retryAfterMs: Long? = null): List<PenEffect> {
        closed = true
        return listOf(refusal(reason, retryAfterMs), PenEffect.Close(reason))
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
    /** The drawn moments of review mode (see [AnnotationTimeline.moments]). */
    val marks: List<Long> = emptyList(),
    /** Where the next undo takes the TV first, or null when it acts on screen ([PenEngine.undoAt]). */
    val undoAtMs: Long? = null,
    /** As [undoAtMs], for the next redo. */
    val redoAtMs: Long? = null,
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
        val thumbKey = if (input.paused) input.t / TransportPlan.FRAME_MS else Long.MIN_VALUE
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
                marks = input.marks,
                undoAtMs = input.undoAtMs,
                redoAtMs = input.redoAtMs,
            ),
        )
    }

    companion object {
        const val INTERVAL_MS = 400L
    }
}
