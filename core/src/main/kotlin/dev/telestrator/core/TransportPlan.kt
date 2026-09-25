package dev.telestrator.core

/** One thing the TV's player (or the session behind it) should do. */
sealed interface PlayerAction {
    data object Play : PlayerAction
    data object Pause : PlayerAction
    data class SeekTo(val positionMs: Long) : PlayerAction
    data class SetRate(val rate: Double) : PlayerAction

    /** Not a player action at all: an edit that arrived on the transport channel (remote keys). */
    data class Edit(val message: PenMessage) : PlayerAction
}

/**
 * What a transport command means, decided on the JVM. The platform shell reads the player, calls
 * [plan], and carries the actions out in order; it makes no decision of its own.
 */
object TransportPlan {

    /** The fixture clip is 25 fps; one frame is 40 ms. A real clip would read this off the format. */
    const val FRAME_MS = 40L

    /** The remote's blind seek hop. */
    const val SEEK_HOP_MS = 5_000L

    const val MIN_RATE = 0.1
    const val MAX_RATE = 2.0

    fun plan(
        cmd: String,
        value: Double = 0.0,
        positionMs: Long = 0,
        durationMs: Long = 0,
        playing: Boolean = false,
        doc: AnnotationDoc? = null,
        /** The frame the next undo acts on when it is not on screen ([PenEngine.undoAt]). */
        undoAtMs: Long? = null,
        /** As [undoAtMs], for the next redo ([PenEngine.redoAt]). */
        redoAtMs: Long? = null,
    ): List<PlayerAction> = when (cmd) {
        "toggle" -> listOf(if (playing) PlayerAction.Pause else PlayerAction.Play)
        "play" -> listOf(PlayerAction.Play)
        "pause" -> listOf(PlayerAction.Pause)
        "seek+" -> listOf(PlayerAction.SeekTo(positionMs + SEEK_HOP_MS))
        "seek-" -> listOf(PlayerAction.SeekTo((positionMs - SEEK_HOP_MS).coerceAtLeast(0)))
        "seek" -> listOf(PlayerAction.SeekTo(value.toLong().coerceAtLeast(0)))
        // Frame stepping only makes sense on a still picture, and seeking while playing fights
        // the playback clock, so stepping pauses first.
        "step" -> listOf(
            PlayerAction.Pause,
            PlayerAction.SeekTo((positionMs + value.toLong() * FRAME_MS).coerceAtLeast(0)),
        )
        "rate" -> listOf(PlayerAction.SetRate(value.coerceIn(MIN_RATE, MAX_RATE)))
        // Review mode: land paused on the exact frame the ink is anchored to, so the drawing is
        // on screen when the picture stops. No drawing in that direction: nothing moves.
        "jump" -> {
            val timeline = doc?.let(::AnnotationTimeline)
            val target = when {
                timeline == null -> null
                value > 0 -> timeline.momentAfter(positionMs)
                value < 0 -> timeline.momentBefore(positionMs)
                else -> null
            }
            if (target == null) emptyList() else listOf(PlayerAction.Pause, PlayerAction.SeekTo(target))
        }
        // An edit the viewer cannot see is an edit they cannot judge: when the ink is on another
        // frame, the first press goes there, paused, and the next press acts on screen.
        "undo" -> if (undoAtMs == null) listOf(PlayerAction.Edit(PenMessage.Undo)) else visit(undoAtMs)
        "redo" -> if (redoAtMs == null) listOf(PlayerAction.Edit(PenMessage.Redo)) else visit(redoAtMs)
        "clear" -> listOf(PlayerAction.Edit(PenMessage.Clear))
        else -> emptyList()
    }

    private fun visit(frameMs: Long): List<PlayerAction> =
        listOf(PlayerAction.Pause, PlayerAction.SeekTo(frameMs.coerceAtLeast(0)))
}
