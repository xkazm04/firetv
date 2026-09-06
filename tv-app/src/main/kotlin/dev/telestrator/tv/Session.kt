package dev.telestrator.tv

import dev.telestrator.core.AnnotationDoc
import dev.telestrator.core.PenEngine
import dev.telestrator.core.PenMessage
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

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
    var paused: Boolean = false

    @Volatile
    var connectedPens: Int = 0

    @Volatile
    private var dirty: Boolean = false

    val pin: String = (1000..9999).random().toString()

    fun accept(msg: PenMessage) {
        if (msg is PenMessage.Transport) {
            _transport.value = TransportCommand(msg.cmd, msg.value, System.nanoTime())
            return
        }
        engine.accept(msg, mediaTimeMs)
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

    data class TransportCommand(val cmd: String, val value: Double, val nanos: Long)
}
