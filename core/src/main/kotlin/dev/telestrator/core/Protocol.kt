package dev.telestrator.core

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

/** Phone -> TV messages (design doc section 3.4). */
@Serializable
sealed interface PenMessage {

    @Serializable
    @SerialName("hello")
    data class Hello(val pin: String, val clientId: String) : PenMessage

    @Serializable
    @SerialName("pen")
    data class Pen(
        val tool: String = "freehand",
        val phase: String,
        val color: String = "#FFD400",
        val width: Double = 0.006,
        /** One of the [Hold] names; null takes the engine default. */
        val hold: String? = null,
        /** Batched points: [x, y, pressure, clientTsMs]. */
        val pts: List<List<Double>> = emptyList(),
    ) : PenMessage

    @Serializable
    @SerialName("shape")
    data class Shape(
        val tool: String,
        val from: List<Double>,
        val to: List<Double>,
        val color: String = "#FFFFFF",
        val width: Double = 0.006,
        val hold: String? = null,
    ) : PenMessage

    /** Drop a player label at a point. Snapping to a tracked player comes with P1. */
    @Serializable
    @SerialName("tag")
    data class Tag(
        val x: Double,
        val y: Double,
        val label: String,
        val color: String = "#FFD400",
        val hold: String? = null,
    ) : PenMessage

    /** Remove the topmost visible annotation under a point. */
    @Serializable
    @SerialName("erase")
    data class Erase(
        val x: Double,
        val y: Double,
        /** Grab radius as a fraction of the picture width, the same in every direction (see [Metric]). */
        val tolerance: Double = HitTest.DEFAULT_TOLERANCE,
    ) : PenMessage

    @Serializable
    @SerialName("transport")
    data class Transport(val cmd: String, val value: Double = 0.0) : PenMessage

    /** Every annotation at every moment of the clip: the phone's Clear all and the remote's Down. */
    @Serializable
    @SerialName("clear")
    data object Clear : PenMessage

    /** Only what is on screen at the current frame, like the eraser; one undo brings it back. */
    @Serializable
    @SerialName("clearFrame")
    data object ClearFrame : PenMessage

    @Serializable
    @SerialName("undo")
    data object Undo : PenMessage

    @Serializable
    @SerialName("redo")
    data object Redo : PenMessage

    /** Latency probe: the TV answers with [TvMessage.Pong] carrying the same id. */
    @Serializable
    @SerialName("ping")
    data class Ping(val id: Long) : PenMessage
}

/**
 * The transport command a pen message stands for, or null when it goes straight to the engine.
 *
 * Undo and redo may have to move the player first (the ink they touch can be on another frame), so
 * the phone's presses take the same road as the remote's: through [TransportPlan], which sees the
 * player. Everything else is an edit at the current frame and needs no plan.
 */
fun PenMessage.asTransport(): PenMessage.Transport? = when (this) {
    PenMessage.Undo -> PenMessage.Transport("undo")
    PenMessage.Redo -> PenMessage.Transport("redo")
    else -> null
}

/** TV -> phone messages. */
@Serializable
sealed interface TvMessage {

    @Serializable
    @SerialName("welcome")
    data class Welcome(
        val sessionId: String,
        val videoAspect: Double,
        val accepted: Boolean,
        val reason: String? = null,
    ) : TvMessage

    @Serializable
    @SerialName("state")
    data class State(
        val t: Long,
        val paused: Boolean,
        val rate: Double,
        val annotationCount: Int,
        val canUndo: Boolean = false,
        val canRedo: Boolean = false,
        val durationMs: Long = 0,
        /** JPEG data URL of the paused frame, so the phone can show what it is drawing on. */
        val thumbnail: String? = null,
        /**
         * The drawn moments (ms, ascending) the phone marks on its scrub bar and jumps between. The
         * empty default keeps older senders decodable; an empty list encodes as `[]`, never null.
         */
        val marks: List<Long> = emptyList(),
        /**
         * Where the next undo will take the TV before it acts (see [PenEngine.undoAt]), so the
         * phone can say so on its button. Absent when the undo acts on the frame on screen.
         */
        val undoAtMs: Long? = null,
        /** As [undoAtMs], for the next redo. */
        val redoAtMs: Long? = null,
    ) : TvMessage

    /**
     * The annotation document as the TV currently holds it, so the phone can draw what is already
     * on screen. Without this the eraser is guesswork: the viewer taps at a stroke they cannot see.
     */
    @Serializable
    @SerialName("doc")
    data class Doc(val revision: Long, val doc: AnnotationDoc) : TvMessage

    @Serializable
    @SerialName("pong")
    data class Pong(val id: Long) : TvMessage

    @Serializable
    @SerialName("error")
    data class Error(val message: String) : TvMessage
}

val ProtocolJson: Json = Json {
    ignoreUnknownKeys = true
    encodeDefaults = true
    classDiscriminator = "type"
    explicitNulls = false
}

fun decodePenMessage(text: String): PenMessage =
    ProtocolJson.decodeFromString(PenMessage.serializer(), text)

fun TvMessage.encode(): String = ProtocolJson.encodeToString(TvMessage.serializer(), this)
