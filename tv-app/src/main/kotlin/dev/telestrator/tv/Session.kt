package dev.telestrator.tv

import dev.telestrator.core.AnnotationDoc
import dev.telestrator.core.AnnotationTimeline
import dev.telestrator.core.HeartbeatInput
import dev.telestrator.core.PenEngine
import dev.telestrator.core.PenMessage
import dev.telestrator.core.asTransport
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import java.util.concurrent.atomic.AtomicInteger

/**
 * The single place the network layer, the player and the renderer meet.
 *
 * Everything interesting about a pen message is decided in [PenEngine] (pure JVM, unit-tested);
 * this class only supplies the current media time and republishes the resulting document so
 * Compose can recompose on it.
 */
class Session(clipId: String, videoAspect: Double) {

    private val engine = PenEngine(clipId = clipId, videoAspect = videoAspect)

    private val _doc = MutableStateFlow(engine.doc)
    val doc: StateFlow<AnnotationDoc> = _doc

    private val _transport = MutableStateFlow<TransportCommand?>(null)
    val transport: StateFlow<TransportCommand?> = _transport

    /** Set by the player each frame; read when a pen message arrives so strokes anchor to a time. */
    @Volatile
    var mediaTimeMs: Long = 0

    @Volatile
    var durationMs: Long = 0

    @Volatile
    var paused: Boolean = false

    @Volatile
    var rate: Double = 1.0

    private val pens = AtomicInteger(0)
    val connectedPens: Int get() = pens.get()

    /** Bumped on every accepted message, so the phone mirror only ships when there is news. */
    private val revisionCounter = AtomicInteger(0)
    val revision: Int get() = revisionCounter.get()

    @Volatile
    private var dirty: Boolean = false

    val pin: String = (1000..9999).random().toString()

    fun penConnected(): Int = pens.incrementAndGet()

    fun penDisconnected(): Int = pens.decrementAndGet().coerceAtLeast(0).also { pens.set(it) }

    fun accept(msg: PenMessage) {
        // Undo and redo take the planner's road, the remote's and the phone's alike: the ink they
        // touch may be on another frame, and only the planner sees the player (TransportPlan).
        val transport = msg as? PenMessage.Transport ?: msg.asTransport()
        if (transport != null) {
            _transport.value = TransportCommand(transport.cmd, transport.value, System.nanoTime())
            return
        }
        edit(msg)
    }

    /** Applies an edit to the document at the current media time. The plan's [dev.telestrator.core.PlayerAction.Edit] lands here. */
    fun edit(msg: PenMessage) {
        engine.accept(msg, mediaTimeMs)
        revisionCounter.incrementAndGet()
        // Do not rebuild the document here. A pen streaming at 60 Hz would make the renderer
        // recompose once per message on a device that only draws 60 frames a second anyway;
        // the frame loop picks this up instead (see publishIfDirty).
        dirty = true
    }

    /** Called from the player's frame loop: at most one document snapshot per rendered frame. */
    fun publishIfDirty() {
        if (!dirty) return
        dirty = false
        _doc.value = engine.doc
    }

    fun annotationCount(): Int = engine.annotationCount
    fun canUndo(): Boolean = engine.canUndo
    fun canRedo(): Boolean = engine.canRedo

    /** The frame the next undo takes the player to first, or null when it acts on screen at [atMs]. */
    fun undoAt(atMs: Long = mediaTimeMs): Long? = engine.undoAt(atMs)

    /** As [undoAt], for the next redo. */
    fun redoAt(atMs: Long = mediaTimeMs): Long? = engine.redoAt(atMs)

    /** One consistent read of what the pen heartbeat reports (see [dev.telestrator.core.Heartbeat]). */
    fun heartbeatInput(): HeartbeatInput {
        val current = doc.value
        return HeartbeatInput(
            t = mediaTimeMs,
            paused = paused,
            rate = rate,
            annotationCount = annotationCount(),
            canUndo = canUndo(),
            canRedo = canRedo(),
            durationMs = durationMs,
            doc = current,
            revision = revision.toLong(),
            // Where the drawings are, so the phone can mark its scrub bar and jump between them.
            marks = AnnotationTimeline(current).moments(),
            // Where an undo or redo would go first, so the phone's button can say so before it travels.
            undoAtMs = undoAt(),
            redoAtMs = redoAt(),
        )
    }

    data class TransportCommand(val cmd: String, val value: Double, val nanos: Long)
}
